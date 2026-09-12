[CmdletBinding()]
param(
  [int]$Port = 9335,
  [switch]$RestartExisting,
  [switch]$ForegroundInjector,
  [switch]$Reapply,
  [string]$ProfilePath
)

$ErrorActionPreference = 'Stop'
$PortExplicit = $PSBoundParameters.ContainsKey('Port')
$launcher = Join-Path $PSScriptRoot 'windows\scripts\start-dream-skin.ps1'
$reapplyScript = Join-Path $PSScriptRoot 'windows\scripts\switch-dream-skin.ps1'

if (-not (Test-Path -LiteralPath $launcher -PathType Leaf)) {
  throw "Dream Skin launcher was not found: $launcher"
}
if ($Reapply) {
  if (-not (Test-Path -LiteralPath $reapplyScript -PathType Leaf)) {
    throw "Dream Skin reapply script was not found: $reapplyScript"
  }
  if ($PSBoundParameters.ContainsKey('Port') -or $RestartExisting -or
    $ForegroundInjector -or $ProfilePath) {
    throw '-Reapply cannot be combined with -Port, -RestartExisting, -ForegroundInjector, or -ProfilePath.'
  }
  & $reapplyScript -Reapply
  exit $LASTEXITCODE
}

$arguments = @{
  PromptRestart = $true
}
if ($PortExplicit) { $arguments.Port = $Port }
if ($RestartExisting) { $arguments.RestartExisting = $true }
if ($ForegroundInjector) { $arguments.ForegroundInjector = $true }
if ($ProfilePath) { $arguments.ProfilePath = $ProfilePath }

& $launcher @arguments
exit $LASTEXITCODE
