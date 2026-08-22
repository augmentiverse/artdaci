$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$errors = [Collections.Generic.List[string]]::new()

$jsonFiles = Get-ChildItem (Join-Path $root 'content') -Recurse -Filter '*.json'
foreach ($jsonFile in $jsonFiles) {
  try {
    [IO.File]::ReadAllText($jsonFile.FullName) | ConvertFrom-Json | Out-Null
  } catch {
    $errors.Add("Invalid JSON: $($jsonFile.FullName)")
  }
}

$sourceFiles = @()
$sourceFiles += Get-ChildItem $root -File | Where-Object Extension -in @('.html', '.json', '.js', '.css', '.md', '.webmanifest')
$sourceFiles += Get-ChildItem (Join-Path $root 'content'), (Join-Path $root 'scripts'), (Join-Path $root 'styles') -Recurse -File -ErrorAction SilentlyContinue
$assetPattern = '(?:https://media\.githubusercontent\.com/media/augmentiverse/artdaci/main/)?(assets/[^"\r\n<>]+)'
foreach ($sourceFile in $sourceFiles) {
  if ($sourceFile.FullName -eq $PSCommandPath) { continue }
  if ($sourceFile.Extension -eq '.md') { continue }
  $text = [IO.File]::ReadAllText($sourceFile.FullName)
  foreach ($match in [regex]::Matches($text, $assetPattern)) {
    $reference = $match.Groups[1].Value.TrimEnd(',', ';', '`', ')', '.')
    $reference = [Net.WebUtility]::HtmlDecode(($reference -split '[?#]')[0])
    $reference = [uri]::UnescapeDataString($reference)
    if ($reference -match '\{') { continue }
    $target = Join-Path $root ($reference -replace '/', [IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path -LiteralPath $target -PathType Leaf)) {
      $relativeSource = [IO.Path]::GetRelativePath($root, $sourceFile.FullName)
      $errors.Add("Missing asset in ${relativeSource}: $reference")
    }
  }
}

$htmlFiles = Get-ChildItem $root -Filter '*.html' -File
foreach ($htmlFile in $htmlFiles) {
  $html = [IO.File]::ReadAllText($htmlFile.FullName)
  foreach ($match in [regex]::Matches($html, '(?:src|href)=["'']([^"''#]+)["'']')) {
    $reference = [Net.WebUtility]::HtmlDecode($match.Groups[1].Value)
    if ($reference -match '^(?:https?:|data:|mailto:|tel:|javascript:|//)') { continue }
    $reference = [uri]::UnescapeDataString(($reference -split '[?#]')[0])
    if ([string]::IsNullOrWhiteSpace($reference)) { continue }
    $target = Join-Path $htmlFile.DirectoryName ($reference -replace '/', [IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path -LiteralPath $target)) {
      $errors.Add("Missing local reference in $($htmlFile.Name): $reference")
    }
  }
}

$legacyPatterns = @(
  'assets/paintings/Da Vinci',
  'assets/paintings/van-gogh',
  'assets/paintings/monet',
  'assets/paintings/Vermeer',
  'assets/paintings/vermeer_Girl',
  'assets/people-behind-painters',
  'assets/peintres',
  'reinmagined',
  'fourniture'
)
foreach ($sourceFile in $sourceFiles) {
  if ($sourceFile.FullName -eq $PSCommandPath) { continue }
  $text = [IO.File]::ReadAllText($sourceFile.FullName)
  foreach ($legacyPattern in $legacyPatterns) {
    if ($text.Contains($legacyPattern)) {
      $relativeSource = [IO.Path]::GetRelativePath($root, $sourceFile.FullName)
      $errors.Add("Legacy path in ${relativeSource}: $legacyPattern")
    }
  }
}

if ($errors.Count -gt 0) {
  $errors | Sort-Object -Unique | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Output "Repository validation passed: $($jsonFiles.Count) JSON files, $($htmlFiles.Count) HTML pages, and all literal local references are valid."
