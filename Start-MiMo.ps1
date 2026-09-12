[CmdletBinding()]
param(
  [string]$Theme,
  [switch]$List,
  [switch]$Revert,
  [switch]$Verify,
  [switch]$Diagnose,
  [switch]$InstallShortcut,
  [switch]$RemoveShortcut,
  [switch]$Launch,
  [switch]$RestartExisting,
  [switch]$PromptRestart,
  [switch]$NoLauncher,
  [int]$Port = 9335
)

$ErrorActionPreference = 'Stop'

$direct = $List -or $Revert -or $Verify -or $Diagnose -or $InstallShortcut -or $RemoveShortcut
if ($direct -or $NoLauncher) {
  $entry = Join-Path $PSScriptRoot 'mimo\Start-MiMo-Skin.ps1'
  if (-not (Test-Path -LiteralPath $entry -PathType Leaf)) {
    throw "MiMo skin entry not found: $entry"
  }
  $arguments = @{}
  if ($PSBoundParameters.ContainsKey('Port')) { $arguments.Port = $Port }
  if ($Theme) { $arguments.Theme = $Theme }
  if ($List) { $arguments.List = $true }
  if ($Revert) { $arguments.Revert = $true }
  if ($Verify) { $arguments.Verify = $true }
  if ($Diagnose) { $arguments.Diagnose = $true }
  if ($InstallShortcut) { $arguments.InstallShortcut = $true }
  if ($RemoveShortcut) { $arguments.RemoveShortcut = $true }
  if ($Launch) { $arguments.Launch = $true }
  if ($RestartExisting) { $arguments.RestartExisting = $true }
  if ($PromptRestart) { $arguments.PromptRestart = $true }
  if (-not $arguments.Count) { $arguments.Launch = $true; $arguments.RestartExisting = $true }
  & $entry @arguments
  exit $LASTEXITCODE
}

# Default: animated launcher (progress bar).
$launcher = Join-Path $PSScriptRoot 'Start-Codex.ps1'
if (-not (Test-Path -LiteralPath $launcher -PathType Leaf)) {
  throw "Launcher script not found: $launcher"
}
$portArg = if ($PSBoundParameters.ContainsKey('Port')) { " -Port $Port" } else { "" }
& powershell -NoProfile -STA -ExecutionPolicy Bypass -File $launcher -Mode MiMo$portArg
exit $LASTEXITCODE
