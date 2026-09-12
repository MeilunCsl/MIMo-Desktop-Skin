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
  [int]$Port = 9335
)

$ErrorActionPreference = 'Stop'
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

if (-not $arguments.Count) {
  $arguments.Launch = $true
  $arguments.RestartExisting = $true
}

& $entry @arguments
exit $LASTEXITCODE
