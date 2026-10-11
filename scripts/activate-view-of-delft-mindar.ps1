# Install the two genuine authored View of Delft AR files at their exact paths
# before running this. This script does not publish R2 or merge to production.
#Requires -Version 5.1
param([switch]$Commit)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$mindRel = 'assets/targets/view-of-delft.mind'
$imageRel = 'assets/artists/johannes-vermeer/artworks/view_of_delft/images/ve02-view-of-delft-web.webp'
$expected = @{
  $mindRel = '112684ff6ceb17b075d51daa48e48ec21cc9d0b2a362f0da267f7b11364f6dcb'
  $imageRel = '828ddd6ee4612320978c3d485a4002f749634ab3b9951917405af2c829a46d50'
}
foreach ($rel in @($mindRel,$imageRel)) {
  $path = Join-Path $root ($rel.Replace('/',[IO.Path]::DirectorySeparatorChar))
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "Missing authored AR asset: $rel"
  }
  $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actual -ne $expected[$rel]) {
    throw "SHA-256 mismatch for $rel. Do not activate another target/image pair."
  }
  Write-Host "Verified: $rel" -ForegroundColor Green
}

function Replace-Exact([string]$relative,[string]$before,[string]$after,[int]$times=1) {
  $file = Join-Path $root ($relative.Replace('/',[IO.Path]::DirectorySeparatorChar))
  $body = [IO.File]::ReadAllText($file)
  $found = ([regex]::Matches($body,[regex]::Escape($before))).Count
  if ($found -ne $times) {
    if ($found -eq 0 -and $body.Contains($after)) {
      Write-Host "Already activated: $relative" -ForegroundColor DarkGray
      return
    }
    throw "Unexpected $relative content: expected $times matches, saw $found"
  }
  $new = $body.Replace($before,$after)
  [IO.File]::WriteAllText($file,$new,[Text.UTF8Encoding]::new($false))
}

Replace-Exact 'scripts/immersive-routing.js' 'slug: "view-of-delft", runtimeSlug: "view-of-delft", aliases: [], ar: false, space: true, vr: false' 'slug: "view-of-delft", runtimeSlug: "view-of-delft", aliases: [], ar: true, space: true, vr: false'
Replace-Exact 'tests/immersive-routing.test.mjs' 'assert.equal(resolveImmersiveArtworkRoute("ve02", "ar"), null);' 'assert.equal(resolveImmersiveArtworkRoute("ve02", "ar")?.artworkId, "ve02");'
Replace-Exact 'tests/four-models-integration.test.mjs' 'assert.equal(resolveImmersiveArtworkRoute("ve02","ar"),null);' 'assert.equal(resolveImmersiveArtworkRoute("ve02","ar")?.artworkId,"ve02");' 2
Replace-Exact 'scripts/ar-viewer.js' '"./immersive-routing.js?v=1"' '"./immersive-routing.js?v=2"'

# The image-tracking target is hosted locally and confirmed; do not set any
# unverified Cloudflare manifest object to "published".
Write-Host 'Local AR route activated, pending preview/device verification.' -ForegroundColor Green
Write-Host 'Run: node --test tests/four-models-integration.test.mjs tests/immersive-routing.test.mjs'
if ($Commit) {
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'git not installed' }
  & git -C $root add -- $mindRel $imageRel 'scripts/immersive-routing.js' 'scripts/ar-viewer.js' 'tests/four-models-integration.test.mjs' 'tests/immersive-routing.test.mjs'
  if ($LASTEXITCODE -ne 0) { throw 'git add failed' }
  & git -C $root commit -m 'feat(ve02): activate verified Delft MindAR tracking with real authored files'
  if ($LASTEXITCODE -ne 0) { throw 'git commit failed' }
  Write-Host 'Committed locally. Push the feature branch after checking the diff and tests.' -ForegroundColor Green
}
