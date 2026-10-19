<#
  Backs up your LOCAL MySQL database (the one the app uses from STS) to backups\<db>-<date>-<time>.sql.gz
  and deletes backups older than -KeepDays. It reads the database URL, user and password from application.properties,
  so there is nothing to configure.

  Run it from the project folder:
      powershell -ExecutionPolicy Bypass -File scripts\backup-local.ps1
  To restore the newest backup:
      powershell -ExecutionPolicy Bypass -File scripts\backup-local.ps1 -Restore
#>
param(
  [int]$KeepDays = 14,
  [string]$OutDir = "",
  [switch]$Restore
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
if (-not $OutDir) { $OutDir = Join-Path $root "backups" }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# --- settings from application.properties ---
$props = Join-Path $root "application.properties"
if (-not (Test-Path $props)) { throw "application.properties not found next to pom.xml" }
$map = @{}
Get-Content $props | ForEach-Object {
  if ($_ -match '^\s*([^#=\s][^=]*)=(.*)$') { $map[$matches[1].Trim()] = $matches[2].Trim() }
}
$url = $map["spring.datasource.url"]
if ($url -notmatch 'jdbc:mysql://([^:/]+)(?::(\d+))?/([^?]+)') { throw "Cannot read the database from spring.datasource.url" }
$dbHost = $matches[1]; $dbPort = if ($matches[2]) { $matches[2] } else { "3306" }; $db = $matches[3]
$user = $map["spring.datasource.username"]; $pass = $map["spring.datasource.password"]

# --- find the MySQL tools ---
function Find-Tool($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $hit = Get-ChildItem "C:\Program Files\MySQL" -Recurse -Filter "$name.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($hit) { return $hit.FullName }
  throw "$name.exe not found. Install MySQL or add its bin folder to PATH."
}

$env:MYSQL_PWD = $pass   # keeps the password off the command line
try {
  if ($Restore) {
    $latest = Get-ChildItem $OutDir -Filter "$db-*.sql.gz" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $latest) { throw "No backup found in $OutDir" }
    Write-Host "Restoring $($latest.Name) into database '$db' on ${dbHost}:$dbPort ..."
    $mysql = Find-Tool "mysql"
    $tmp = Join-Path $env:TEMP "jsl-restore.sql"
    $in = [IO.File]::OpenRead($latest.FullName); $gz = New-Object IO.Compression.GZipStream($in, [IO.Compression.CompressionMode]::Decompress)
    $out = [IO.File]::Create($tmp); $gz.CopyTo($out); $out.Close(); $gz.Close(); $in.Close()
    & $mysql "-h$dbHost" "-P$dbPort" "-u$user" "--default-character-set=utf8mb4" $db "-e" "source $($tmp -replace '\\','/')"
    if ($LASTEXITCODE -ne 0) { throw "Restore failed" }
    Remove-Item $tmp -Force
    Write-Host "Restore finished."
    return
  }

  $dump = Find-Tool "mysqldump"
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $sql = Join-Path $OutDir "$db-$stamp.sql"
  & $dump "-h$dbHost" "-P$dbPort" "-u$user" "--single-transaction" "--routines" "--triggers" "--no-tablespaces" "--default-character-set=utf8mb4" "--result-file=$sql" $db
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $sql)) { if (Test-Path $sql) { Remove-Item $sql -Force }; throw "mysqldump failed; no backup written" }

  $in = [IO.File]::OpenRead($sql); $out = [IO.File]::Create("$sql.gz")
  $gz = New-Object IO.Compression.GZipStream($out, [IO.Compression.CompressionMode]::Compress); $in.CopyTo($gz); $gz.Close(); $out.Close(); $in.Close()
  Remove-Item $sql -Force
  Write-Host ("Backup written: {0} ({1:N0} bytes)" -f "$sql.gz", (Get-Item "$sql.gz").Length)

  Get-ChildItem $OutDir -Filter "$db-*.sql.gz" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$KeepDays) } | ForEach-Object {
    Write-Host "Removing old backup $($_.Name)"; Remove-Item $_.FullName -Force
  }
}
finally { Remove-Item Env:\MYSQL_PWD -ErrorAction SilentlyContinue }
