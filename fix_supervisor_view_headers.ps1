param(
  [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)

$file = Join-Path $ProjectRoot "frontend\src\pages\supervisor\SupervisorOperationsPage.jsx"

if (-not (Test-Path $file)) {
  throw "File not found: $file"
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = "$file.$stamp.bak"
Copy-Item $file $backup

$content = Get-Content $file -Raw

$helper = @'
function formatColumnName(name) {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

'@

if ($content -notmatch 'function formatColumnName\(') {
  $content = $content.Replace(
    'import api from "../../services/api";' + [Environment]::NewLine,
    'import api from "../../services/api";' + [Environment]::NewLine + [Environment]::NewLine + $helper
  )
}

$content = $content.Replace(
  '<th key={key}>{key}</th>',
  '<th key={key}>{formatColumnName(key)}</th>'
)

Set-Content -Path $file -Value $content -Encoding UTF8

Push-Location (Join-Path $ProjectRoot "frontend")
try {
  npm.cmd run build
  if ($LASTEXITCODE -ne 0) {
    throw "Frontend build failed. Backup: $backup"
  }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "VIEW HEADER FORMATTING COMPLETE" -ForegroundColor Green
Write-Host "Examples:" -ForegroundColor Cyan
Write-Host "PERSON_ID      -> Person Id"
Write-Host "FIRST_NAME     -> First Name"
Write-Host "DATE_OF_BIRTH  -> Date Of Birth"
Write-Host "PHONE_NO       -> Phone No"
Write-Host "Backup: $backup" -ForegroundColor DarkGray
