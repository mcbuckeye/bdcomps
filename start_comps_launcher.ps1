param(
  [int]$Port = 4174
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = "C:\Users\henry.cheng\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

if (-not (Test-Path $Python)) {
  throw "Bundled Python was not found at $Python"
}

if (-not $env:OPENAI_API_KEY) {
  throw "OPENAI_API_KEY is not set in this PowerShell session. Set it before starting the launcher."
}

$connections = netstat -ano | Select-String ":$Port\s"
$pids = @()
foreach ($line in $connections) {
  $parts = ($line.ToString() -split "\s+") | Where-Object { $_ }
  if ($parts.Length -ge 5 -and $parts[3] -eq "LISTENING") {
    $pids += [int]$parts[4]
  }
}

$pids | Sort-Object -Unique | ForEach-Object {
  Write-Host "Stopping existing listener on port $Port (PID $_)"
  Stop-Process -Id $_ -Force
}

$env:COMPS_PORT = "$Port"
$env:OPENAI_TIMEOUT_SECONDS = "600"
$env:OPENAI_MAX_OUTPUT_TOKENS = "30000"
$env:OPENAI_RETRIES = "3"
$env:OPENAI_DISABLE_PROXY = "1"

Write-Host "Starting Comps Launcher at http://127.0.0.1:$Port/index.html"
Start-Process `
  -WindowStyle Hidden `
  -FilePath $Python `
  -ArgumentList "server.py" `
  -WorkingDirectory $ProjectRoot

Start-Sleep -Seconds 2

try {
  $response = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$Port/index.html" -TimeoutSec 10
  Write-Host "Launcher is up. HTTP status: $($response.StatusCode)"
  Write-Host "Open http://127.0.0.1:$Port/index.html"
} catch {
  throw "Launcher did not respond on port $Port. Error: $($_.Exception.Message)"
}
