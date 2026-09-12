[CmdletBinding(DefaultParameterSetName = 'PickImage')]
param(
  [Parameter(Mandatory = $true, ParameterSetName = 'Image')]
  [string]$ImagePath,
  [Parameter(Mandatory = $true, ParameterSetName = 'Saved')]
  [string]$SavedThemeId,
  [Parameter(Mandatory = $true, ParameterSetName = 'List')]
  [switch]$List,
  [Parameter(Mandatory = $true, ParameterSetName = 'Reapply')]
  [switch]$Reapply,
  [string]$Name,
  [int]$TimeoutMs = 12000
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'internal\common-windows.ps1')
. (Join-Path $PSScriptRoot 'internal\theme-windows.ps1')

function Select-DreamSkinImage {
  Add-Type -AssemblyName System.Windows.Forms
  $dialog = New-Object System.Windows.Forms.OpenFileDialog
  try {
    $dialog.Title = 'Select Codex Dream Skin background'
    $dialog.Filter = 'Image files|*.png;*.jpg;*.jpeg;*.webp|All files|*.*'
    $dialog.Multiselect = $false
    $dialog.CheckFileExists = $true
    if ($dialog.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) { return $null }
    return $dialog.FileName
  } finally {
    $dialog.Dispose()
  }
}

$operationLock = Enter-DreamSkinOperationLock
try {
  $stateRoot = Join-Path $env:LOCALAPPDATA 'CodexDreamSkin'
  $paths = Initialize-DreamSkinThemeStore -SkillRoot (Split-Path -Parent $PSScriptRoot) -StateRoot $stateRoot

  if ($List) {
    $saved = @(Get-DreamSkinSavedThemes -StateRoot $stateRoot)
    if ($saved.Count -eq 0) {
      Write-Host 'No saved themes. Run this script without arguments to choose an image.'
      exit 0
    }
    $saved | Select-Object Id, Name, Path | Format-Table -AutoSize
    exit 0
  }

  # Re-inject the already-active theme into the current Codex window without
  # writing any image or theme metadata. The long-running watcher is not
  # required: Invoke-DreamSkinLiveApply drives a one-shot --once CDP injection
  # against the live port recorded in state.json, so Codex is never restarted.
  if ($Reapply) {
    $live = Invoke-DreamSkinLiveApply -StateRoot $stateRoot -TimeoutMs $TimeoutMs
    if (-not $live.Applied) {
      Write-Warning $live.Message
      Write-Host 'Start Codex through Dream Skin once; after that, this script can hot-update an open Codex window.'
      exit 2
    }
    Write-Host 'Current skin was hot-reapplied in the Codex window.'
    exit 0
  }

  $selectedTheme = $null
  if ($SavedThemeId) {
    $saved = @(Get-DreamSkinSavedThemes -StateRoot $stateRoot)
    $selected = @($saved | Where-Object { $_.Id -ceq $SavedThemeId })
    if ($selected.Count -ne 1) {
      throw "Saved theme was not found: $SavedThemeId. Run with -List to view theme IDs."
    }
    $selectedTheme = Use-DreamSkinSavedTheme -ThemeDirectory $selected[0].Path -StateRoot $stateRoot
  } else {
    if (-not $ImagePath) { $ImagePath = Select-DreamSkinImage }
    if (-not $ImagePath) {
      Write-Host 'No image was selected. The current skin was not changed.'
      exit 0
    }
    $current = Read-DreamSkinTheme -ThemeDirectory $paths.Active
    $theme = $current.Theme | ConvertTo-Json -Depth 8 | ConvertFrom-Json
    $theme.id = 'custom'
    $selectedTheme = Set-DreamSkinActiveTheme -ImagePath $ImagePath -Theme $theme -Name $Name -StateRoot $stateRoot
  }

  $live = Invoke-DreamSkinLiveApply -StateRoot $stateRoot -TimeoutMs $TimeoutMs
  if (-not $live.Applied) {
    Write-Warning $live.Message
    Write-Host "Theme '$($selectedTheme.Theme.name)' was saved. Start Codex through Dream Skin once; after that, this script can hot-update an open Codex window."
    exit 2
  }
  Write-Host "Theme '$($selectedTheme.Theme.name)' was hot-updated in the current Codex window."
} finally {
  Exit-DreamSkinOperationLock -Mutex $operationLock
}
