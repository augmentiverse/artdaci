#Requires -Version 7.0
<#
 Upload View of Delft's authored MindAR target + matching WebP image into R2.
 This is DRY RUN by default. The source files must be present locally.
 The route is intentionally NOT made public until the target is tested.
#>
param(
  [Parameter(Mandatory=$true)][string]$RemotePrefix,
  [switch]$Publish
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$remote = $RemotePrefix.Trim().TrimEnd('/')
if ($remote -notmatch '^[^\s:]+:.+') {
  throw 'Provide your existing rclone remote and bucket, for example r2:YOUR_BUCKET'
}
if (-not (Get-Command rclone -ErrorAction SilentlyContinue)) {
  throw 'rclone must be configured and available in PATH'
}
$assets = @(
  @{ name='target'; source='assets/targets/view-of-delft.mind'; path='ar/view-of-delft.mind'; mime='application/octet-stream' },
  @{ name='tracking-source'; source='assets/artists/johannes-vermeer/artworks/view_of_delft/images/ve02-view-of-delft-web.webp'; path='images/ve02-view-of-delft-web.webp'; mime='image/webp' }
)
function CopyR2([string[]] $Arguments) {
  & rclone @Arguments
  if ($LASTEXITCODE -ne 0) { throw "rclone failed with exit code $LASTEXITCODE" }
}
function HashOf([string] $Path) {
  (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}
$objects = @()
foreach ($asset in $assets) {
  $local = Join-Path $root ($asset.source.Replace('/',[IO.Path]::DirectorySeparatorChar))
  if (-not (Test-Path -LiteralPath $local -PathType Leaf)) {
    throw "Required authored AR asset not found: $($asset.source). Upload/commit it before publishing."
  }
  $size = (Get-Item -LiteralPath $local).Length
  if ($size -lt 1024) { throw "Unexpectedly small asset: $($asset.source)" }
  if ($asset.name -eq 'tracking-source') {
    $stream = [IO.File]::OpenRead($local)
    try {
      $h = [byte[]]::new(12)
      if ($stream.Read($h,0,12) -ne 12 -or
          [Text.Encoding]::ASCII.GetString($h,0,4) -ne 'RIFF' -or
          [Text.Encoding]::ASCII.GetString($h,8,4) -ne 'WEBP') {
        throw 'Reference image is not a valid RIFF/WebP file'
      }
    } finally { $stream.Dispose() }
  }
  $objects += [pscustomobject]@{
    name=$asset.name; local=$local; relative=$asset.source
    path=$asset.path; mime=$asset.mime; size=$size
    sha=(HashOf $local); dest="$remote/artworks/ve02/$($asset.path)"
  }
}
$objects | Select-Object name,relative,size,sha | Format-Table -AutoSize
if (-not $Publish) {
  Write-Host 'Dry run. Use -Publish to upload to the configured R2 bucket.' -ForegroundColor Yellow
  return
}
$temp = Join-Path ([IO.Path]::GetTempPath()) ('artdaci-ve02-ar-'+[guid]::NewGuid().ToString('N'))
New-Item -Path $temp -ItemType Directory | Out-Null
try {
  # Keep the existing R2 manifest as source of truth and preserve old assets.
  $original = Join-Path $temp 've02-original.json'
  CopyR2 -Arguments @('copyto',"$remote/artworks/ve02/manifest.json",$original)
  $manifest = Get-Content -LiteralPath $original -Raw | ConvertFrom-Json -AsHashtable -Depth 64
  if ($manifest.id -ne 've02' -or -not $manifest.media.Contains('ar') -or
      -not $manifest.media.Contains('images')) {
    throw 'Unexpected R2 manifest structure/identity: refusing update'
  }
  foreach ($object in $objects) {
    # Never overwrite an existing object without first comparing its bytes.
    CopyR2 -Arguments @('copyto',$object.local,$object.dest,'--ignore-existing')
    $download = Join-Path $temp ($object.name + '-readback')
    CopyR2 -Arguments @('copyto',$object.dest,$download)
    if ((Get-Item -LiteralPath $download).Length -ne $object.size -or
        (HashOf $download) -ne $object.sha) {
      throw "Remote asset hash mismatch: $($object.dest). Manifest was NOT published."
    }
    Write-Host "R2 verified: $($object.dest)" -ForegroundColor Green
  }
  foreach ($object in $objects) {
    $entry = @{
      scope='artwork';path=$object.path;mimeType=$object.mime
      available=$true;migrationStatus='published'
      bytes=[long]$object.size;sha256=$object.sha
    }
    if ($object.name -eq 'target') { $manifest.media.ar.target=$entry }
    else { $manifest.media.images['tracking-source']=$entry }
  }
  $manifest.updatedAt = (Get-Date).ToString('yyyy-MM-dd')
  $out = Join-Path $temp 've02-merged.json'
  $manifest | ConvertTo-Json -Depth 64 | Set-Content -LiteralPath $out -Encoding utf8
  CopyR2 -Arguments @('copyto',$out,"$remote/artworks/ve02/manifest.json")
  $readBack = Join-Path $temp 've02-verified.json'
  CopyR2 -Arguments @('copyto',"$remote/artworks/ve02/manifest.json",$readBack)
  $confirmed=Get-Content -LiteralPath $readBack -Raw | ConvertFrom-Json -AsHashtable -Depth 64
  foreach($obj in $objects) {
    $entry = if ($obj.name -eq 'target') { $confirmed.media.ar.target } else { $confirmed.media.images['tracking-source'] }
    if ($entry.available -ne $true -or $entry.sha256 -ne $obj.sha) {
      throw "Read-back manifest verification failed: $($obj.name)"
    }
  }
  # Stage confirmed metadata in the branch; does not change the public route.
  $localManifest=Join-Path $root 'content/media-manifests/artworks/ve02/manifest.json'
  $localJson=Get-Content -LiteralPath $localManifest -Raw | ConvertFrom-Json -AsHashtable -Depth 64
  $localJson.media.ar.target=$confirmed.media.ar.target
  $localJson.media.images['tracking-source']=$confirmed.media.images['tracking-source']
  $localJson.updatedAt=$confirmed.updatedAt
  $localJson | ConvertTo-Json -Depth 64 | Set-Content -LiteralPath $localManifest -Encoding utf8
  Write-Host 'Verified R2 assets and manifest. Commit the authored files and updated local manifest; then enable the ve02 image AR route after QA.' -ForegroundColor Green
} finally {
  Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
}
