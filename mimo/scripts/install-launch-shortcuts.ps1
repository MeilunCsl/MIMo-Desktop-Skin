[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$launcher = Join-Path $projectRoot 'Start-MiMo.ps1'
if (-not (Test-Path -LiteralPath $launcher -PathType Leaf)) {
  throw "MiMo skin launcher was not found: $launcher"
}

$powerShell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$desktop = [Environment]::GetFolderPath('Desktop')
$startMenu = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs'
$logoIcon = Join-Path $projectRoot 'logo\chatgpt_white_transparent_windows.ico'
$iconLocation = "$powerShell,0"
if (Test-Path -LiteralPath $logoIcon -PathType Leaf) {
  $iconLocation = "$logoIcon,0"
}

$shell = New-Object -ComObject WScript.Shell
$links = @(
  (Join-Path $desktop 'MiMo 皮肤.lnk'),
  (Join-Path $startMenu 'MiMo 皮肤.lnk')
)
foreach ($link in $links) {
  $shortcut = $shell.CreateShortcut($link)
  $shortcut.TargetPath = $powerShell
  $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$launcher`""
  $shortcut.WorkingDirectory = $projectRoot
  $shortcut.IconLocation = $iconLocation
  $shortcut.Description = 'Start MiMo Dream Skin'
  $shortcut.Save()
}

# Clean legacy shortcut names
$legacy = @(
  'MiMo 皮肤启动器.lnk',
  'Xiaomi MiMo (Dream Skin).lnk',
  'Codex Dream Skin.lnk',
  '皮肤启动器.lnk',
  'Skin Launcher.lnk'
)
foreach ($name in $legacy) {
  @(
    (Join-Path $desktop $name),
    (Join-Path $startMenu $name)
  ) | ForEach-Object { Remove-Item -LiteralPath $_ -Force -ErrorAction SilentlyContinue }
}

$links | ForEach-Object { Write-Host "Shortcut: $_" }
