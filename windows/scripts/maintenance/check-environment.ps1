[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot '..\internal\common-windows.ps1')
$projectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$checks = @()
try {
  $node = Get-DreamSkinNodeRuntime
  $checks += [pscustomobject]@{ Check='Node >= 22'; Pass=$true; Detail=$node.Version }
} catch { $checks += [pscustomobject]@{ Check='Node >= 22'; Pass=$false; Detail=$_.Exception.Message } }
try {
  $codex = Get-DreamSkinCodexInstall
  $checks += [pscustomobject]@{ Check='Official Codex'; Pass=$true; Detail=$codex.Version }
} catch { $checks += [pscustomobject]@{ Check='Official Codex'; Pass=$false; Detail=$_.Exception.Message } }
if ($node) {
  $result = Invoke-DreamSkinNative -FilePath $node.Path -ArgumentList @(
    (Join-Path $projectRoot 'windows\scripts\injector.mjs'), '--check-payload', '--theme-dir', (Join-Path $projectRoot 'windows\assets'))
  $checks += [pscustomobject]@{ Check='Theme assets'; Pass=($result.ExitCode -eq 0); Detail=($result.Output -join '') }
}
$checks | Format-Table -AutoSize -Wrap
if (@($checks | Where-Object { -not $_.Pass }).Count) { exit 1 }
Write-Output 'Ready. WebView2 is optional; the portable launcher has a basic mode selector.'
exit 0
