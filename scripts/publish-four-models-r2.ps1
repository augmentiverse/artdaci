#Requires -Version 7.0
<#
.SYNOPSIS
  Upload four approved ARTDACI GLBs to an existing Cloudflare R2 rclone remote.
.DESCRIPTION
  Reads current remote manifests, uploads only NEW object keys, downloads them
  again to verify SHA-256, then merges their model entries into the existing
  R2 manifests. It also updates tracked local manifests *after* verification.
  No keys or licenses are invented. Without -Publish this is a dry run.
.EXAMPLE
  pwsh ./scripts/publish-four-models-r2.ps1 -RemotePrefix 'r2:YOUR_BUCKET'
.EXAMPLE
  pwsh ./scripts/publish-four-models-r2.ps1 -RemotePrefix 'r2:YOUR_BUCKET' -Publish
#>
param(
  [Parameter(Mandatory=$true)][string]$RemotePrefix,
  [switch]$Publish
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$remote = $RemotePrefix.Trim().TrimEnd('/')
if ($remote -notmatch '^[^\s:]+:.+$') {
  throw 'Specify an existing rclone remote and bucket, e.g. r2:YOUR_BUCKET.'
}
if (-not (Get-Command rclone -ErrorAction SilentlyContinue)) {
  throw 'rclone is not installed or not in PATH.'
}

$assets = @(
  @{ id='vg01'; name='portrait-2026'; source='assets/artists/vincent-van-gogh/artworks/self-portrait/models/van-gogh_self-portrait.glb'; key='models/van-gogh_self-portrait.glb' },
  @{ id='vg01'; name='standing-2026'; source='assets/artists/vincent-van-gogh/artworks/self-portrait/models/van-gogh_standing.glb'; key='models/van-gogh_standing.glb' },
  @{ id='ve01'; name='standing-2026'; source='assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/models/girl-pearl_standing.glb'; key='models/girl-pearl_standing.glb' },
  @{ id='ve02'; name='delft-2026'; source='assets/artists/johannes-vermeer/artworks/view_of_delft/models/view-of-delft.glb'; key='models/view-of-delft.glb' }
)
function Run-Rclone([string[]]$Arguments) {
  & rclone @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "rclone failed (exit $LASTEXITCODE): $($Arguments -join ' ')"
  }
}
function SHA256([string]$Path) {
  (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}
$checks = @()
foreach ($asset in $assets) {
  $local = Join-Path $repo ($asset.source.Replace('/', [IO.Path]::DirectorySeparatorChar))
  if (-not (Test-Path -LiteralPath $local -PathType Leaf)) {
    throw "Missing local model: $($asset.source)"
  }
  $file = Get-Item -LiteralPath $local
  if ($file.Length -lt 1024) { throw "Suspiciously short GLB: $local" }
  $checks += [pscustomobject]@{
    id=$asset.id
    key=$asset.key
    source=$asset.source
    remote="$remote/artworks/$($asset.id)/$($asset.key)"
    name=$asset.name
    size=$file.Length
    sha256=(SHA256 $local)
    local=$local
  }
}
$checks | Select-Object id,key,size,sha256 | Format-Table -AutoSize
if (-not $Publish) {
  Write-Host "Dry run only. Re-run with -Publish after checking the bucket prefix." -ForegroundColor Yellow
  return
}
$temporary = Join-Path ([IO.Path]::GetTempPath()) ("artdaci-r2-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temporary | Out-Null
try {
  # Verify that all three destination manifests exist BEFORE touching R2.
  $remoteDocs = @{}
  foreach ($id in @('vg01','ve01','ve02')) {
    $remoteManifest = "$remote/artworks/$id/manifest.json"
    $out = Join-Path $temporary "$id-original.json"
    Run-Rclone @('copyto',$remoteManifest,$out)
    $doc = Get-Content -LiteralPath $out -Raw | ConvertFrom-Json -AsHashtable -Depth 64
    if ($doc.id -ne $id -or -not $doc.media -or -not $doc.media.models) {
      throw "Refusing to update a remote manifest with unexpected identity/schema: $id"
    }
    $remoteDocs[$id] = $doc
  }

  # Upload four new keys and verify a *downloaded byte-for-byte* SHA-256.
  foreach ($record in $checks) {
    Run-Rclone @('copyto',$record.local,$record.remote,'--retries','3')
    $download = Join-Path $temporary ("verify-" + $record.id + "-" + $record.name + ".glb")
    Run-Rclone @('copyto',$record.remote,$download,'--retries','3')
    if ((Get-Item -LiteralPath $download).Length -ne $record.size -or
        (SHA256 $download) -ne $record.sha256) {
      throw "R2 SHA-256 verification failed for $($record.remote). Manifests were NOT updated."
    }
    Write-Host "Verified on R2: $($record.remote)" -ForegroundColor Green
  }

  # Merge *only* new model entries. Preserve existing manifest content.
  foreach ($id in @('vg01','ve01','ve02')) {
    $entries = @($checks | Where-Object id -eq $id)
    $doc = $remoteDocs[$id]
    foreach ($record in $entries) {
      $doc.media.models[$record.name] = @{
        scope='artwork';path=$record.key;mimeType='model/gltf-binary'
        available=$true;migrationStatus='published';bytes=[long]$record.size;sha256=$record.sha256
      }
    }
    $doc.updatedAt = (Get-Date).ToString('yyyy-MM-dd')
    $merged = Join-Path $temporary "$id-published.json"
    $doc | ConvertTo-Json -Depth 64 | Set-Content -LiteralPath $merged -Encoding utf8
    Run-Rclone @('copyto',$merged,"$remote/artworks/$id/manifest.json",'--retries','3')
    # Read back the manifest for confirmation, not just a successful upload code.
    $confirmed = Join-Path $temporary "$id-confirmed.json"
    Run-Rclone @('copyto',"$remote/artworks/$id/manifest.json",$confirmed)
    $verified = Get-Content -LiteralPath $confirmed -Raw | ConvertFrom-Json -AsHashtable -Depth 64
    foreach ($record in $entries) {
      $node = $verified.media.models[$record.name]
      if ($node.available -ne $true -or $node.sha256 -ne $record.sha256) {
        throw "Remote manifest did not retain verified asset $($record.name) for $id"
      }
    }
    Write-Host "R2 manifest verified: $id" -ForegroundColor Green

    # Reflect verified status in local repo manifest (not an automatic git commit).
    $localManifest = Join-Path $repo "content/media-manifests/artworks/$id/manifest.json"
    $localDoc = Get-Content -LiteralPath $localManifest -Raw | ConvertFrom-Json -AsHashtable -Depth 64
    foreach ($record in $entries) {
      $localDoc.media.models[$record.name] = @{
        scope='artwork';path=$record.key;mimeType='model/gltf-binary'
        available=$true;migrationStatus='published';bytes=[long]$record.size;sha256=$record.sha256
      }
    }
    $localDoc.updatedAt = (Get-Date).ToString('yyyy-MM-dd')
    $localDoc | ConvertTo-Json -Depth 64 | Set-Content -LiteralPath $localManifest -Encoding utf8
  }
  Write-Host "Four models verified and R2 manifests updated. Review and commit local manifest changes." -ForegroundColor Green
} finally {
  Remove-Item -LiteralPath $temporary -Recurse -Force -ErrorAction SilentlyContinue
}
