[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$launcher = Join-Path $projectRoot 'Start-Codex.ps1'
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
$canonicalLinks = @(
  (Join-Path $desktop 'MiMo 皮肤启动器.lnk'),
  (Join-Path $startMenu 'MiMo 皮肤启动器.lnk')
)
foreach ($link in $canonicalLinks) {
  $shortcut = $shell.CreateShortcut($link)
  $shortcut.TargetPath = $powerShell
  $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$launcher`""
  $shortcut.WorkingDirectory = $projectRoot
  $shortcut.IconLocation = $iconLocation
  $shortcut.Description = 'Start MiMo Dream Skin'
  $shortcut.Save()
}

# Remove legacy / Codex-era shortcuts. Full-width parentheses in .lnk names
# can fail WScript.Shell CreateShortcut, so cleanup still targets them.
$legacyNames = @(
  'Codex Dream Skin.lnk',
  'Codex 启动器（原生或皮肤）.lnk',
  '皮肤启动器（Codex 或 MiMo）.lnk',
  '皮肤启动器.lnk',
  'Skin Launcher.lnk',
  [System.Text.Encoding]::Default.GetString(
    [System.Text.Encoding]::UTF8.GetBytes('Codex 启动器（原生或皮肤）.lnk')
  ),
  [System.Text.Encoding]::Default.GetString(
    [System.Text.Encoding]::UTF8.GetBytes('皮肤启动器（Codex 或 MiMo）.lnk')
  )
) | Select-Object -Unique
$keep = @('MiMo 皮肤启动器.lnk')
foreach ($legacyName in $legacyNames) {
  if ($keep -notcontains $legacyName) {
    @(
      (Join-Path $desktop $legacyName),
      (Join-Path $startMenu $legacyName)
    ) | ForEach-Object { Remove-Item -LiteralPath $_ -Force -ErrorAction SilentlyContinue }
  }
}

@(
  (Join-Path $startMenu 'Linzi Codex Launcher.lnk')
) | ForEach-Object { Remove-Item -LiteralPath $_ -Force -ErrorAction SilentlyContinue }

Get-ChildItem -LiteralPath $desktop -Filter 'Start-Dream-Skin.ps1 - *.lnk' -File -ErrorAction SilentlyContinue |
  Remove-Item -Force -ErrorAction SilentlyContinue

$canonicalLinks | ForEach-Object { Write-Host "Shortcut: $_" }
