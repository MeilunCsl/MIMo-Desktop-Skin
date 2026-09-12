[CmdletBinding()]
param([ValidateSet('Ask','MiMo')][string]$Mode='MiMo',[int]$Port,[switch]$Worker,[string]$PreviewDirectory)
$ErrorActionPreference='Stop'
if ($Worker) {
  try {
    $arguments=@{ Launch = $true; RestartExisting = $true }
    if ($PSBoundParameters.ContainsKey('Port')) {$arguments.Port=$Port}
    & (Join-Path $PSScriptRoot 'mimo\Start-MiMo-Skin.ps1') @arguments
    exit $LASTEXITCODE
  } catch {Write-Error $_;exit 1}
}
try {
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  $lib=Join-Path $PSScriptRoot 'windows\launcher\lib'
  # The portable edition does not require the optional WebView2 SDK binaries.
  $webViewReady = [Environment]::Is64BitProcess
  foreach ($file in @('Microsoft.Web.WebView2.Core.dll','Microsoft.Web.WebView2.WinForms.dll','WebView2Loader.dll')) {
    if (-not (Test-Path -LiteralPath (Join-Path $lib $file) -PathType Leaf)) { $webViewReady = $false }
  }
  if (-not $webViewReady) {
    if ($PreviewDirectory) { throw 'WebView2 x64 assemblies are required for the animated launcher preview.' }
    $workerArguments = @{ Mode = 'MiMo'; Worker = $true }
    if ($PSBoundParameters.ContainsKey('Port')) { $workerArguments.Port = $Port }
    & $PSCommandPath @workerArguments
    exit $LASTEXITCODE
  }
  $env:PATH="$lib;$env:PATH"
  $core=Join-Path $lib 'Microsoft.Web.WebView2.Core.dll'
  $forms=Join-Path $lib 'Microsoft.Web.WebView2.WinForms.dll'
  Add-Type -Path $core
  Add-Type -Path $forms
  Add-Type -Path (Join-Path $PSScriptRoot 'windows\launcher\Launcher.cs') -ReferencedAssemblies @('System.dll','System.Core.dll','System.Drawing.dll','System.Windows.Forms.dll',$core,$forms)
  $portArgument=if($PSBoundParameters.ContainsKey('Port')){" -Port $Port"}else{''}
  [DreamLauncher]::Run($PSScriptRoot,'MiMo',$portArgument,$PreviewDirectory)
} catch {
  if ($PreviewDirectory) {throw}
  [void][System.Windows.Forms.MessageBox]::Show($_.Exception.Message,'MiMo 皮肤启动器')
  exit 1
}
