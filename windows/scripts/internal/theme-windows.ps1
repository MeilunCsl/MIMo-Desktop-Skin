if (-not (Get-Command Read-DreamSkinUtf8File -ErrorAction SilentlyContinue)) {
  . (Join-Path $PSScriptRoot 'config-utf8.ps1')
}

$script:DreamSkinMaxImageBytes = 16 * 1024 * 1024

function Assert-DreamSkinNoReparseComponents {
  param([Parameter(Mandatory = $true)][string]$Path)
  $fullPath = [System.IO.Path]::GetFullPath($Path)
  $root = [System.IO.Path]::GetPathRoot($fullPath)
  $current = $fullPath
  while ($true) {
    if (Test-Path -LiteralPath $current) {
      $item = Get-Item -LiteralPath $current -Force -ErrorAction Stop
      if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "Managed Dream Skin path contains a junction or symbolic link: $current"
      }
    }
    $currentNormalized = $current.TrimEnd('\')
    $rootNormalized = $root.TrimEnd('\')
    if ($currentNormalized.Equals($rootNormalized, [System.StringComparison]::OrdinalIgnoreCase)) { break }
    $parent = [System.IO.Path]::GetDirectoryName($current)
    if (-not $parent -or $parent.Equals($current, [System.StringComparison]::OrdinalIgnoreCase)) { break }
    $current = $parent
  }
}

function Ensure-DreamSkinManagedDirectory {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Root
  )
  $fullPath = [System.IO.Path]::GetFullPath($Path)
  $fullRoot = [System.IO.Path]::GetFullPath($Root).TrimEnd('\')
  if (-not ($fullPath.Equals($fullRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
      $fullPath.StartsWith($fullRoot + '\', [System.StringComparison]::OrdinalIgnoreCase))) {
    throw "Managed Dream Skin path escaped its state root: $fullPath"
  }
  Assert-DreamSkinNoReparseComponents -Path $fullPath
  if (Test-Path -LiteralPath $fullPath -PathType Leaf) {
    throw "Managed Dream Skin path is a file, not a directory: $fullPath"
  }
  New-Item -ItemType Directory -Force -Path $fullPath | Out-Null
  Assert-DreamSkinNoReparseComponents -Path $fullPath
  if (-not (Test-Path -LiteralPath $fullPath -PathType Container)) {
    throw "Managed Dream Skin directory could not be created: $fullPath"
  }
}

function Get-DreamSkinValidatedImageMetadata {
  param([Parameter(Mandatory = $true)][string]$Path)
  if (-not (Get-Command Get-DreamSkinNodeRuntime -ErrorAction SilentlyContinue)) {
    throw 'Node.js runtime validation is unavailable for image metadata checks.'
  }
  $node = Get-DreamSkinNodeRuntime
  $metadataScript = Join-Path (Split-Path -Parent $PSScriptRoot) 'image-metadata.mjs'
  $output = @(& $node.Path $metadataScript '--check' ([System.IO.Path]::GetFullPath($Path)) 2>&1)
  if ($LASTEXITCODE -ne 0) {
    throw "Image metadata is invalid or exceeds the 16384px / 50MP safety limit: $Path"
  }
  try { $metadata = ($output -join "`n") | ConvertFrom-Json -ErrorAction Stop } catch {
    throw "Image metadata helper returned invalid output: $Path"
  }
  if ($null -eq $metadata -or $null -eq $metadata.width -or $null -eq $metadata.height) {
    throw "Image metadata is invalid or exceeds the 16384px / 50MP safety limit: $Path"
  }
}

function Assert-DreamSkinImageFile {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [switch]$SkipImageMetadata
  )
  $fullPath = [System.IO.Path]::GetFullPath($Path)
  if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
    throw "Image does not exist: $fullPath"
  }
  $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
  if ($extension -notin @('.png', '.jpg', '.jpeg', '.webp')) {
    throw "Unsupported image format: $extension"
  }
  $length = (Get-Item -LiteralPath $fullPath -Force).Length
  if ($length -lt 1) { throw 'Theme image cannot be empty.' }
  if ($length -gt $script:DreamSkinMaxImageBytes) {
    throw 'Theme image exceeds the 16 MB limit.'
  }
  if (-not $SkipImageMetadata) {
    Get-DreamSkinValidatedImageMetadata -Path $fullPath
  }
}

function Resolve-DreamSkinPreferredImagePath {
  param([Parameter(Mandatory = $true)][string]$Path)
  $fullPath = [System.IO.Path]::GetFullPath($Path)
  $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
  if ($extension -notin @('.png', '.jpg', '.jpeg', '.webp') -or $extension -eq '.webp') {
    return $fullPath
  }
  $webpPath = [System.IO.Path]::ChangeExtension($fullPath, '.webp')
  if (Test-Path -LiteralPath $webpPath -PathType Leaf) {
    $length = (Get-Item -LiteralPath $webpPath -Force).Length
    if ($length -gt 0 -and $length -le $script:DreamSkinMaxImageBytes) {
      return $webpPath
    }
  }
  return $fullPath
}

function Get-DreamSkinThemePaths {
  param([string]$StateRoot = (Join-Path $env:LOCALAPPDATA 'CodexDreamSkin'))
  $fullRoot = [System.IO.Path]::GetFullPath($StateRoot)
  return [pscustomobject]@{
    Root = $fullRoot
    Active = Join-Path $fullRoot 'active-theme'
    Saved = Join-Path $fullRoot 'themes'
    Images = Join-Path $fullRoot 'images'
    PauseFile = Join-Path $fullRoot 'paused'
    State = Join-Path $fullRoot 'state.json'
  }
}

function Test-DreamSkinThemePathWithin {
  param([string]$Path, [string]$Root)
  if (-not $Path -or -not $Root) { return $false }
  try {
    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $fullRoot = [System.IO.Path]::GetFullPath($Root).TrimEnd('\')
    $inside = $fullPath.Equals($fullRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
      $fullPath.StartsWith($fullRoot + '\', [System.StringComparison]::OrdinalIgnoreCase)
    if (-not $inside) { return $false }

    $current = $fullPath.TrimEnd('\')
    while ($true) {
      if (-not (Test-Path -LiteralPath $current)) { return $false }
      $item = Get-Item -LiteralPath $current -Force -ErrorAction Stop
      if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        return $false
      }
      if ($current.Equals($fullRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $true
      }
      $parent = [System.IO.Path]::GetDirectoryName($current)
      if (-not $parent -or $parent.Equals($current, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $false
      }
      $current = $parent.TrimEnd('\')
    }
  } catch {
    return $false
  }
}

function Read-DreamSkinTheme {
  param(
    [Parameter(Mandatory = $true)][string]$ThemeDirectory,
    [switch]$SkipImageMetadata
  )
  $directory = [System.IO.Path]::GetFullPath($ThemeDirectory)
  Assert-DreamSkinNoReparseComponents -Path $directory
  $themePath = Join-Path $directory 'theme.json'
  Assert-DreamSkinNoReparseComponents -Path $themePath
  if (-not (Test-Path -LiteralPath $themePath -PathType Leaf)) {
    throw "Theme metadata is missing: $themePath"
  }
  try {
    $theme = (Read-DreamSkinUtf8File -Path $themePath) | ConvertFrom-Json -ErrorAction Stop
  } catch {
    throw "Theme metadata is invalid JSON: $themePath"
  }
  if ($null -eq $theme -or $theme -is [string] -or $theme -is [array] -or -not $theme.image) {
    throw "Theme metadata must be an object with a relative image path: $themePath"
  }
  $image = "$($theme.image)"
  if ([System.IO.Path]::IsPathRooted($image)) { throw 'Theme image path must be relative.' }
  $requestedImagePath = [System.IO.Path]::GetFullPath((Join-Path $directory $image))
  $imageParent = Split-Path -Parent $requestedImagePath
  if (-not (Test-DreamSkinThemePathWithin -Path $imageParent -Root $directory)) {
    throw 'Theme image must remain inside its theme directory.'
  }
  if ((Test-Path -LiteralPath $requestedImagePath -PathType Leaf) -and
    -not (Test-DreamSkinThemePathWithin -Path $requestedImagePath -Root $directory)) {
    throw 'Theme image must remain inside its theme directory.'
  }
  $imagePath = Resolve-DreamSkinPreferredImagePath -Path $requestedImagePath
  if (-not (Test-DreamSkinThemePathWithin -Path $imagePath -Root $directory) -or
    -not (Test-Path -LiteralPath $imagePath -PathType Leaf)) {
    throw 'Theme image must remain inside its theme directory and exist.'
  }
  Assert-DreamSkinImageFile -Path $imagePath -SkipImageMetadata:$SkipImageMetadata
  return [pscustomobject]@{
    Directory = $directory
    ThemePath = $themePath
    ImagePath = $imagePath
    Theme = $theme
  }
}

function Write-DreamSkinTheme {
  param(
    [Parameter(Mandatory = $true)][string]$ThemeDirectory,
    [Parameter(Mandatory = $true)][object]$Theme
  )
  Assert-DreamSkinNoReparseComponents -Path $ThemeDirectory
  New-Item -ItemType Directory -Force -Path $ThemeDirectory | Out-Null
  Assert-DreamSkinNoReparseComponents -Path $ThemeDirectory
  $json = $Theme | ConvertTo-Json -Depth 8
  $themePath = Join-Path $ThemeDirectory 'theme.json'
  Assert-DreamSkinNoReparseComponents -Path $themePath
  Write-DreamSkinUtf8FileAtomically -Path $themePath -Content ($json + "`r`n")
}

function Copy-DreamSkinThemeAsset {
  param(
    [Parameter(Mandatory = $true)][string]$RelativePath,
    [Parameter(Mandatory = $true)][string]$SourceDirectory,
    [Parameter(Mandatory = $true)][string]$TargetDirectory,
    [Parameter(Mandatory = $true)][string]$StateRoot,
    [Parameter(Mandatory = $true)][string]$ErrorLabel
  )
  if ([System.IO.Path]::IsPathRooted($RelativePath)) {
    throw "$ErrorLabel path must be relative: $RelativePath"
  }
  $requestedSource = [System.IO.Path]::GetFullPath((Join-Path $SourceDirectory $RelativePath))
  $sourceParent = Split-Path -Parent $requestedSource
  if (-not (Test-DreamSkinThemePathWithin -Path $sourceParent -Root $SourceDirectory)) {
    throw "$ErrorLabel must remain inside its source theme directory: $RelativePath"
  }
  if ((Test-Path -LiteralPath $requestedSource -PathType Leaf) -and
    -not (Test-DreamSkinThemePathWithin -Path $requestedSource -Root $SourceDirectory)) {
    throw "$ErrorLabel must remain inside its source theme directory: $RelativePath"
  }
  $sourcePath = Resolve-DreamSkinPreferredImagePath -Path $requestedSource
  if (-not (Test-DreamSkinThemePathWithin -Path $sourcePath -Root $SourceDirectory) -or
    -not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "$ErrorLabel must remain inside its source theme directory and exist: $RelativePath"
  }
  $targetPath = [System.IO.Path]::GetFullPath((Join-Path $TargetDirectory $RelativePath))
  $preferredTargetPath = if ($sourcePath -ine $requestedSource) {
    [System.IO.Path]::ChangeExtension($targetPath, '.webp')
  } else {
    $targetPath
  }
  $targetParent = Split-Path -Parent $preferredTargetPath
  Ensure-DreamSkinManagedDirectory -Path $targetParent -Root $StateRoot
  if (-not (Test-DreamSkinThemePathWithin -Path $targetParent -Root $TargetDirectory)) {
    throw "$ErrorLabel must remain inside its target theme directory: $RelativePath"
  }
  if (Test-Path -LiteralPath $requestedSource -PathType Leaf) {
    Assert-DreamSkinNoReparseComponents -Path $targetPath
    Copy-Item -LiteralPath $requestedSource -Destination $targetPath -Force
    Assert-DreamSkinImageFile -Path $targetPath
  }
  if ($preferredTargetPath -ine $targetPath) {
    Assert-DreamSkinNoReparseComponents -Path $preferredTargetPath
    Copy-Item -LiteralPath $sourcePath -Destination $preferredTargetPath -Force
    Assert-DreamSkinImageFile -Path $preferredTargetPath
  }
}

function Copy-DreamSkinThemeVariantAssets {
  param(
    [Parameter(Mandatory = $true)][object]$Theme,
    [Parameter(Mandatory = $true)][string]$SourceDirectory,
    [Parameter(Mandatory = $true)][string]$TargetDirectory,
    [Parameter(Mandatory = $true)][string]$StateRoot
  )
  foreach ($variant in @($Theme.backgroundVariants)) {
    if ($null -eq $variant -or -not $variant.image) { continue }
    Copy-DreamSkinThemeAsset -RelativePath "$($variant.image)" `
      -SourceDirectory $SourceDirectory -TargetDirectory $TargetDirectory -StateRoot $StateRoot `
      -ErrorLabel 'Background variant image'
    if ($variant.assets -is [pscustomobject]) {
      foreach ($assetProperty in $variant.assets.PSObject.Properties) {
        $asset = "$($assetProperty.Value)"
        if (-not $asset) { continue }
        Copy-DreamSkinThemeAsset -RelativePath $asset `
          -SourceDirectory $SourceDirectory -TargetDirectory $TargetDirectory -StateRoot $StateRoot `
          -ErrorLabel 'Background variant role asset'
      }
    }
  }
}

function Initialize-DreamSkinThemeStore {
  param(
    [Parameter(Mandatory = $true)][string]$SkillRoot,
    [string]$StateRoot = (Join-Path $env:LOCALAPPDATA 'CodexDreamSkin')
  )
  $paths = Get-DreamSkinThemePaths -StateRoot $StateRoot
  foreach ($directory in @($paths.Root, $paths.Active, $paths.Saved, $paths.Images)) {
    Ensure-DreamSkinManagedDirectory -Path $directory -Root $paths.Root
  }
  $assetRoot = Join-Path $SkillRoot 'assets'
  $bundledTheme = Read-DreamSkinTheme -ThemeDirectory $assetRoot
  $assetImage = $bundledTheme.ImagePath
  $assetImageName = [System.IO.Path]::GetFileName($assetImage)
  $bundledPresetId = "$($bundledTheme.Theme.id)"
  if ($bundledPresetId -cnotmatch '^preset-[A-Za-z0-9_-]{1,72}$') {
    throw "Bundled theme id must be a safe preset id: $bundledPresetId"
  }
  $activeTheme = Join-Path $paths.Active 'theme.json'
  Assert-DreamSkinNoReparseComponents -Path $activeTheme
  # Older bundled Linzi themes can remain in active-theme after an upgrade.
  # They contain the previous two-variant schema, so copying only the newer
  # renderer/CSS would leave the launcher with an incomplete theme picker.
  # Preserve user-created themes, but migrate known bundled Linzi ids to the
  # current root theme before the injector reads the active directory.
  $bundledThemeIdsToMigrate = @(
    'preset-linzi',
    'preset-linzi-fresh-garden',
    'preset-linzi-sea-breeze',
    'preset-linzi-dream-skin'
  )
  $activeThemeNeedsBundledSync = $false
  if (Test-Path -LiteralPath $activeTheme -PathType Leaf) {
    try {
      $activeMetadata = Read-DreamSkinTheme -ThemeDirectory $paths.Active -SkipImageMetadata
      $activeThemeNeedsBundledSync = $bundledThemeIdsToMigrate -contains "$($activeMetadata.Theme.id)"
    } catch {
      throw "Active Dream Skin theme is invalid and could not be migrated safely: $($_.Exception.Message)"
    }
  }
  if (-not (Test-Path -LiteralPath $activeTheme -PathType Leaf)) {
    Ensure-DreamSkinManagedDirectory -Path $paths.Active -Root $paths.Root
    Assert-DreamSkinNoReparseComponents -Path (Join-Path $paths.Active $assetImageName)
    $activeImage = Join-Path $paths.Active $assetImageName
    Copy-Item -LiteralPath $assetImage -Destination $activeImage -Force
    Assert-DreamSkinNoReparseComponents -Path $activeImage
    Assert-DreamSkinImageFile -Path $activeImage
    $imageArchive = Join-Path $paths.Images $assetImageName
    Assert-DreamSkinNoReparseComponents -Path $imageArchive
    Copy-Item -LiteralPath $assetImage -Destination $imageArchive -Force
    Assert-DreamSkinNoReparseComponents -Path $imageArchive
    Assert-DreamSkinImageFile -Path $imageArchive
    Assert-DreamSkinNoReparseComponents -Path $activeTheme
    Copy-Item -LiteralPath (Join-Path $assetRoot 'theme.json') -Destination $activeTheme -Force
    $activeThemeNeedsBundledSync = $false
  }
  if ($activeThemeNeedsBundledSync) {
    Assert-DreamSkinNoReparseComponents -Path $activeTheme
    Copy-Item -LiteralPath (Join-Path $assetRoot 'theme.json') -Destination $activeTheme -Force
  }
  # Runtime themes contain data and images only. Historical launchers copied a
  # second CSS/renderer pair here, which made this generated directory look like
  # another source tree and allowed stale diagnostics to report the wrong code.
  # The injector always reads code from its own canonical source root.
  foreach ($codeAssetName in @('dream-skin.css', 'renderer-inject.js')) {
    $targetCodeAsset = Join-Path $paths.Active $codeAssetName
    Assert-DreamSkinNoReparseComponents -Path $targetCodeAsset
    Remove-Item -LiteralPath $targetCodeAsset -Force -ErrorAction SilentlyContinue
  }
  Copy-DreamSkinThemeVariantAssets -Theme $bundledTheme.Theme -SourceDirectory $assetRoot -TargetDirectory $paths.Active -StateRoot $paths.Root
  foreach ($retiredPresetId in @('preset-romantic-rose', 'preset-arina-hashimoto', 'preset-gothic-void-crusade')) {
    $retiredPresetDirectory = Join-Path $paths.Saved $retiredPresetId
    Assert-DreamSkinNoReparseComponents -Path $retiredPresetDirectory
    if (Test-Path -LiteralPath $retiredPresetDirectory) {
      Remove-Item -LiteralPath $retiredPresetDirectory -Recurse -Force
    }
  }
  $presetDirectory = Join-Path $paths.Saved $bundledPresetId
  $presetTheme = Join-Path $presetDirectory 'theme.json'
  Assert-DreamSkinNoReparseComponents -Path $presetDirectory
  Assert-DreamSkinNoReparseComponents -Path $presetTheme
  if (-not (Test-Path -LiteralPath $presetTheme -PathType Leaf)) {
    Ensure-DreamSkinManagedDirectory -Path $presetDirectory -Root $paths.Root
    $presetImage = Join-Path $presetDirectory $assetImageName
    Assert-DreamSkinNoReparseComponents -Path $presetImage
    Copy-Item -LiteralPath $assetImage -Destination $presetImage -Force
    Assert-DreamSkinNoReparseComponents -Path $presetImage
    Assert-DreamSkinImageFile -Path $presetImage
    Assert-DreamSkinNoReparseComponents -Path $presetTheme
    Copy-Item -LiteralPath (Join-Path $assetRoot 'theme.json') -Destination $presetTheme -Force
  }
  Copy-DreamSkinThemeVariantAssets -Theme $bundledTheme.Theme -SourceDirectory $assetRoot -TargetDirectory $presetDirectory -StateRoot $paths.Root

  # Seed additional bundled presets from assets/presets/<id>/ so saved themes
  # ship in the repo alongside the default active theme seeded above. Each
  # subdirectory is a preset (theme.json + image); the bundled preset above is
  # skipped here to avoid duplicating it.
  $additionalPresetsRoot = Join-Path $assetRoot 'presets'
  if (Test-Path -LiteralPath $additionalPresetsRoot -PathType Container) {
    foreach ($additionalPresetDir in Get-ChildItem -LiteralPath $additionalPresetsRoot -Directory -ErrorAction SilentlyContinue) {
      $additionalPresetId = "$($additionalPresetDir.Name)"
      if ($additionalPresetId -cnotmatch '^preset-[A-Za-z0-9_-]{1,72}$') { continue }
      if ($additionalPresetId -ceq $bundledPresetId) { continue }
      $additionalTargetDirectory = Join-Path $paths.Saved $additionalPresetId
      $additionalTargetTheme = Join-Path $additionalTargetDirectory 'theme.json'
      Assert-DreamSkinNoReparseComponents -Path $additionalTargetDirectory
      Assert-DreamSkinNoReparseComponents -Path $additionalTargetTheme
      $additionalLoaded = Read-DreamSkinTheme -ThemeDirectory $additionalPresetDir.FullName
      $additionalThemeNeedsBundledSync = -not (Test-Path -LiteralPath $additionalTargetTheme -PathType Leaf)
      if (-not $additionalThemeNeedsBundledSync) {
        try {
          $additionalExisting = Read-DreamSkinTheme -ThemeDirectory $additionalTargetDirectory -SkipImageMetadata
          # Only refresh a known bundled preset. A user-created theme in the
          # same folder must remain untouched even if its directory name
          # resembles a preset id.
          $additionalThemeNeedsBundledSync = "$($additionalExisting.Theme.id)" -ceq $additionalPresetId
        } catch {
          $additionalThemeNeedsBundledSync = $false
        }
      }
      if ($additionalThemeNeedsBundledSync) {
        $additionalImageName = [System.IO.Path]::GetFileName($additionalLoaded.ImagePath)
        Ensure-DreamSkinManagedDirectory -Path $additionalTargetDirectory -Root $paths.Root
        $additionalTargetImage = Join-Path $additionalTargetDirectory $additionalImageName
        Assert-DreamSkinNoReparseComponents -Path $additionalTargetImage
        Copy-Item -LiteralPath $additionalLoaded.ImagePath -Destination $additionalTargetImage -Force
        Assert-DreamSkinNoReparseComponents -Path $additionalTargetImage
        Assert-DreamSkinImageFile -Path $additionalTargetImage
        Assert-DreamSkinNoReparseComponents -Path $additionalTargetTheme
        Copy-Item -LiteralPath (Join-Path $additionalPresetDir.FullName 'theme.json') -Destination $additionalTargetTheme -Force
        Copy-DreamSkinThemeVariantAssets -Theme $additionalLoaded.Theme -SourceDirectory $additionalPresetDir.FullName -TargetDirectory $additionalTargetDirectory -StateRoot $paths.Root
      }
    }
  }
  $null = Read-DreamSkinTheme -ThemeDirectory $paths.Active
  return $paths
}

function New-DreamSkinThemeImageName {
  param([Parameter(Mandatory = $true)][string]$Extension)
  return 'art-' + (Get-Date).ToString('yyyyMMdd-HHmmss-fff') + '-' +
    [guid]::NewGuid().ToString('N').Substring(0, 8) + $Extension.ToLowerInvariant()
}

function Set-DreamSkinActiveTheme {
  param(
    [Parameter(Mandatory = $true)][string]$ImagePath,
    [AllowNull()][object]$Theme,
    [string]$Name,
    [string]$StateRoot = (Join-Path $env:LOCALAPPDATA 'CodexDreamSkin')
  )
  $paths = Get-DreamSkinThemePaths -StateRoot $StateRoot
  Ensure-DreamSkinManagedDirectory -Path $paths.Root -Root $paths.Root
  Ensure-DreamSkinManagedDirectory -Path $paths.Active -Root $paths.Root
  Ensure-DreamSkinManagedDirectory -Path $paths.Images -Root $paths.Root
  $source = [System.IO.Path]::GetFullPath($ImagePath)
  Assert-DreamSkinImageFile -Path $source
  $extension = [System.IO.Path]::GetExtension($source).ToLowerInvariant()
  $oldImage = $null
  try { $oldImage = (Read-DreamSkinTheme -ThemeDirectory $paths.Active).ImagePath } catch {}
  if ($null -eq $Theme) {
    $Theme = [pscustomobject]@{
      id = 'custom'
      name = '自定义主题'
      appearance = 'auto'
      art = [pscustomobject]@{ focusX = $null; focusY = $null; safeArea = 'auto'; taskMode = 'auto' }
      palette = [pscustomobject]@{}
    }
  }
  $imageName = New-DreamSkinThemeImageName -Extension $extension
  $target = Join-Path $paths.Active $imageName
  $temporary = Join-Path $paths.Active ('.dream-tmp-' + [guid]::NewGuid().ToString('N') + $extension)
  try {
    Assert-DreamSkinNoReparseComponents -Path $target
    Assert-DreamSkinNoReparseComponents -Path $temporary
    Copy-Item -LiteralPath $source -Destination $temporary -Force
    Assert-DreamSkinNoReparseComponents -Path $temporary
    Assert-DreamSkinImageFile -Path $temporary
    Move-Item -LiteralPath $temporary -Destination $target -Force
    Assert-DreamSkinNoReparseComponents -Path $target
    Assert-DreamSkinImageFile -Path $target
    $Theme | Add-Member -NotePropertyName image -NotePropertyValue $imageName -Force
    if ($Name) { $Theme | Add-Member -NotePropertyName name -NotePropertyValue $Name -Force }
    if (-not $Theme.id) { $Theme | Add-Member -NotePropertyName id -NotePropertyValue 'custom' -Force }
    if (-not $Theme.appearance) { $Theme | Add-Member -NotePropertyName appearance -NotePropertyValue 'auto' -Force }
    if (-not $Theme.art) {
      $Theme | Add-Member -NotePropertyName art -NotePropertyValue `
        ([pscustomobject]@{ focusX = $null; focusY = $null; safeArea = 'auto'; taskMode = 'auto' }) -Force
    }
    if (-not $Theme.palette) {
      $Theme | Add-Member -NotePropertyName palette -NotePropertyValue ([pscustomobject]@{}) -Force
    }
    Write-DreamSkinTheme -ThemeDirectory $paths.Active -Theme $Theme
  } finally {
    Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue
  }
  $sameImage = $oldImage -and ([System.IO.Path]::GetFullPath($oldImage) -ieq [System.IO.Path]::GetFullPath($target))
  if ($oldImage -and -not $sameImage -and
    (Test-DreamSkinThemePathWithin -Path $oldImage -Root $paths.Active)) {
    Remove-Item -LiteralPath $oldImage -Force -ErrorAction SilentlyContinue
  }
  $imageArchive = Join-Path $paths.Images $imageName
  Assert-DreamSkinNoReparseComponents -Path $imageArchive
  Copy-Item -LiteralPath $target -Destination $imageArchive -Force
  Assert-DreamSkinNoReparseComponents -Path $imageArchive
  Assert-DreamSkinImageFile -Path $imageArchive
  return Read-DreamSkinTheme -ThemeDirectory $paths.Active
}

function Save-DreamSkinCurrentTheme {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [string]$StateRoot = (Join-Path $env:LOCALAPPDATA 'CodexDreamSkin')
  )
  $trimmed = $Name.Trim()
  if (-not $trimmed -or $trimmed.Length -gt 80 -or $trimmed -match '[\u0000-\u001f]') {
    throw 'Theme name must be between 1 and 80 visible characters.'
  }
  $paths = Get-DreamSkinThemePaths -StateRoot $StateRoot
  Ensure-DreamSkinManagedDirectory -Path $paths.Root -Root $paths.Root
  Ensure-DreamSkinManagedDirectory -Path $paths.Saved -Root $paths.Root
  $active = Read-DreamSkinTheme -ThemeDirectory $paths.Active
  $id = (Get-Date).ToString('yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
  $destination = Join-Path $paths.Saved $id
  Ensure-DreamSkinManagedDirectory -Path $destination -Root $paths.Root
  $extension = [System.IO.Path]::GetExtension($active.ImagePath).ToLowerInvariant()
  $imageName = 'art' + $extension
  $destinationImage = Join-Path $destination $imageName
  Assert-DreamSkinNoReparseComponents -Path $destinationImage
  Copy-Item -LiteralPath $active.ImagePath -Destination $destinationImage -Force
  Assert-DreamSkinNoReparseComponents -Path $destinationImage
  Assert-DreamSkinImageFile -Path $destinationImage
  $theme = $active.Theme | ConvertTo-Json -Depth 8 | ConvertFrom-Json
  $theme.id = $id
  $theme.name = $trimmed
  $theme.image = $imageName
  Write-DreamSkinTheme -ThemeDirectory $destination -Theme $theme
  return Read-DreamSkinTheme -ThemeDirectory $destination
}

function Get-DreamSkinSavedThemes {
  param(
    [string]$StateRoot = (Join-Path $env:LOCALAPPDATA 'CodexDreamSkin'),
    [switch]$SkipImageMetadata
  )
  $paths = Get-DreamSkinThemePaths -StateRoot $StateRoot
  Ensure-DreamSkinManagedDirectory -Path $paths.Root -Root $paths.Root
  Ensure-DreamSkinManagedDirectory -Path $paths.Saved -Root $paths.Root
  if (-not (Test-Path -LiteralPath $paths.Saved -PathType Container)) { return @() }
  $themes = @()
  foreach ($directory in Get-ChildItem -LiteralPath $paths.Saved -Directory -ErrorAction SilentlyContinue) {
    try {
      $loaded = Read-DreamSkinTheme -ThemeDirectory $directory.FullName -SkipImageMetadata:$SkipImageMetadata
      $themes += [pscustomobject]@{
        Id = "$($loaded.Theme.id)"
        Name = if ($loaded.Theme.name) { "$($loaded.Theme.name)" } else { $directory.Name }
        Path = $directory.FullName
      }
    } catch {}
  }
  return @($themes | Sort-Object Name)
}

function Use-DreamSkinSavedTheme {
  param(
    [Parameter(Mandatory = $true)][string]$ThemeDirectory,
    [string]$StateRoot = (Join-Path $env:LOCALAPPDATA 'CodexDreamSkin')
  )
  $paths = Get-DreamSkinThemePaths -StateRoot $StateRoot
  Ensure-DreamSkinManagedDirectory -Path $paths.Root -Root $paths.Root
  Ensure-DreamSkinManagedDirectory -Path $paths.Saved -Root $paths.Root
  $directory = [System.IO.Path]::GetFullPath($ThemeDirectory)
  if (-not (Test-DreamSkinThemePathWithin -Path $directory -Root $paths.Saved)) {
    throw 'Saved theme must remain inside the Dream Skin themes folder.'
  }
  $saved = Read-DreamSkinTheme -ThemeDirectory $directory
  $theme = $saved.Theme | ConvertTo-Json -Depth 8 | ConvertFrom-Json
  return Set-DreamSkinActiveTheme -ImagePath $saved.ImagePath -Theme $theme -StateRoot $StateRoot
}

function Set-DreamSkinPaused {
  param(
    [Parameter(Mandatory = $true)][bool]$Paused,
    [string]$StateRoot = (Join-Path $env:LOCALAPPDATA 'CodexDreamSkin')
  )
  $paths = Get-DreamSkinThemePaths -StateRoot $StateRoot
  Ensure-DreamSkinManagedDirectory -Path $paths.Root -Root $paths.Root
  if ($Paused) {
    Assert-DreamSkinNoReparseComponents -Path $paths.PauseFile
    Write-DreamSkinUtf8FileAtomically -Path $paths.PauseFile -Content "paused`r`n"
  } else {
    if (Test-Path -LiteralPath $paths.PauseFile) { Assert-DreamSkinNoReparseComponents -Path $paths.PauseFile }
    Remove-Item -LiteralPath $paths.PauseFile -Force -ErrorAction SilentlyContinue
  }
  return $Paused
}

function Test-DreamSkinPaused {
  param([string]$StateRoot = (Join-Path $env:LOCALAPPDATA 'CodexDreamSkin'))
  return (Test-Path -LiteralPath (Get-DreamSkinThemePaths -StateRoot $StateRoot).PauseFile -PathType Leaf)
}

function Get-DreamSkinLiveSessionContext {
  param([string]$StateRoot = (Join-Path $env:LOCALAPPDATA 'CodexDreamSkin'))
  $paths = Get-DreamSkinThemePaths -StateRoot $StateRoot
  $state = $null
  try { $state = Read-DreamSkinState -Path $paths.State } catch { $state = $null }
  if ($null -eq $state -or -not $state.port -or -not $state.browserId) { return $null }
  $port = 0
  if (-not [int]::TryParse("$($state.port)", [ref]$port)) { return $null }
  Assert-DreamSkinPort -Port $port
  $browserId = "$($state.browserId)".Trim()
  if (-not (Test-DreamSkinBrowserId -Value $browserId)) { return $null }
  # A running watcher can follow a normal Codex restart, which rotates the
  # CDP browser identity while keeping the same verified loopback port. Use
  # the current registered Codex endpoint for one-shot live operations when
  # it is available; retain the saved ID as a safe fallback during startup.
  try {
    $verified = Get-DreamSkinVerifiedCdpIdentityForAnyRegistered -Port $port
    if ($null -ne $verified -and $verified.Identity.BrowserId) {
      $browserId = "$($verified.Identity.BrowserId)"
    }
  } catch {}
  if (-not (Get-Command Get-DreamSkinNodeRuntime -ErrorAction SilentlyContinue) -or
    -not (Get-Command Invoke-DreamSkinNative -ErrorAction SilentlyContinue)) {
    return $null
  }
  $node = Get-DreamSkinNodeRuntime
  $injector = Join-Path (Split-Path -Parent $PSScriptRoot) 'injector.mjs'
  if (-not (Test-Path -LiteralPath $injector)) { return $null }
  return [pscustomobject]@{
    Paths = $paths
    State = $state
    Port = $port
    BrowserId = $browserId
    NodePath = $node.Path
    Injector = $injector
  }
}

function New-DreamSkinOperationToken {
  $pidPart = [string]$PID
  $ms = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $seq = Get-Random -Minimum 1 -Maximum 99999999
  return "${pidPart}:${ms}:${seq}"
}

function Show-DreamSkinOperationUi {
  param(
    [Parameter(Mandatory = $true)][object]$Session,
    [Parameter(Mandatory = $true)][ValidateSet('begin', 'finish')][string]$Phase,
    [string]$Kind = 'apply',
    [string]$Token,
    [ValidateSet('success', 'error', 'cancelled')][string]$UiState = 'success',
    [string]$Message = '',
    [int]$TimeoutMs = 3000
  )
  $argumentList = @($Session.Injector, "--port", "$($Session.Port)", "--browser-id", $Session.BrowserId, "--timeout-ms", "$TimeoutMs")
  if ($Phase -eq 'begin') {
    if ($Kind -notin @('apply', 'pause', 'switch')) { throw "Invalid operation kind: $Kind" }
    $token = if ($Token) { $Token } else { New-DreamSkinOperationToken }
    $argumentList += @('--begin-operation', '--operation-kind', $Kind, '--operation-token', $token)
    $probe = Invoke-DreamSkinNative -FilePath $Session.NodePath -ArgumentList $argumentList -DiscardStderr
    $printed = (($probe.Output -join "`n").Trim() -split "`n" | Select-Object -Last 1).Trim()
    if ($probe.ExitCode -ne 0 -or -not $printed) {
      return [pscustomobject]@{ Ok = $false; Token = $token; Message = '无法在 Codex 窗口显示进度。' }
    }
    return [pscustomobject]@{ Ok = $true; Token = $printed; Message = '' }
  }
  if (-not $Token) { throw 'Finish operation requires a token.' }
  if ($Message.Length -gt 240 -or $Message -match "[\r\n]") { throw 'Invalid operation message.' }
  $argumentList += @(
    '--finish-operation',
    '--operation-ui-state', $UiState,
    '--operation-message', $Message,
    '--operation-token', $Token
  )
  $probe = Invoke-DreamSkinNative -FilePath $Session.NodePath -ArgumentList $argumentList -DiscardStderr
  return [pscustomobject]@{
    Ok = ($probe.ExitCode -eq 0)
    Token = $Token
    Message = if ($probe.ExitCode -eq 0) { '' } else { '无法更新 Codex 窗口内的操作状态。' }
  }
}

# Apply the already-published active theme to the current renderer immediately.
# The long-running watcher will still observe the file stamp afterwards, but
# this avoids making a user wait for its next poll when switching themes.
function Invoke-DreamSkinLiveApply {
  param(
    [string]$StateRoot = (Join-Path $env:LOCALAPPDATA 'CodexDreamSkin'),
    [int]$TimeoutMs = 12000
  )
  if ($TimeoutMs -lt 250 -or $TimeoutMs -gt 120000) {
    throw "Invalid live-apply timeout: $TimeoutMs"
  }
  $session = Get-DreamSkinLiveSessionContext -StateRoot $StateRoot
  if ($null -eq $session) {
    return [pscustomobject]@{
      Attempted = $false
      Applied = $false
      Message = '没有可连接的 Dream Skin 会话。普通方式启动的 Codex 需要先重开一次，之后即可热更新。'
    }
  }

  $token = $null
  $begin = Show-DreamSkinOperationUi -Session $session -Phase begin -Kind switch -TimeoutMs 3000
  if ($begin.Ok) { $token = $begin.Token }
  $argumentList = @(
    $session.Injector,
    '--once',
    '--port', "$($session.Port)",
    '--browser-id', $session.BrowserId,
    '--theme-dir', $session.Paths.Active,
    '--timeout-ms', "$TimeoutMs"
  )
  if ($token) { $argumentList += @('--operation-token', $token) }
  $apply = Invoke-DreamSkinNative -FilePath $session.NodePath -ArgumentList $argumentList -DiscardStderr
  if ($apply.ExitCode -eq 0) {
    if ($token) {
      $null = Show-DreamSkinOperationUi -Session $session -Phase finish -Token $token `
        -UiState success -Message '皮肤已热更新' -TimeoutMs 1500
    }
    return [pscustomobject]@{
      Attempted = $true
      Applied = $true
      Message = '皮肤已热更新'
    }
  }
  if ($token) {
    $null = Show-DreamSkinOperationUi -Session $session -Phase finish -Token $token `
      -UiState error -Message '皮肤热更新失败，请重试' -TimeoutMs 1500
  }
  return [pscustomobject]@{
    Attempted = $true
    Applied = $false
    Message = '主题已保存，但未能热更新当前窗口。请检查 Codex 是否仍由 Dream Skin 启动。'
  }
}

# Mark paused, show in-app loading, then strip the live skin over CDP.
# Writing only the pause file leaves CSS in the renderer until the watcher polls.
function Invoke-DreamSkinLiveRemove {
  param(
    [string]$StateRoot = (Join-Path $env:LOCALAPPDATA 'CodexDreamSkin'),
    [int]$TimeoutMs = 8000
  )
  if ($TimeoutMs -lt 250 -or $TimeoutMs -gt 120000) {
    throw "Invalid live-remove timeout: $TimeoutMs"
  }
  $session = Get-DreamSkinLiveSessionContext -StateRoot $StateRoot
  if ($null -eq $session) {
    return [pscustomobject]@{
      Attempted = $false
      Removed = $false
      Message = '没有可连接的活动会话；已记录暂停，当前窗口可能仍显示皮肤。'
    }
  }

  $token = $null
  $begin = Show-DreamSkinOperationUi -Session $session -Phase begin -Kind pause -TimeoutMs 3000
  if ($begin.Ok) { $token = $begin.Token }

  $argumentList = @(
    $session.Injector,
    '--remove',
    '--port', "$($session.Port)",
    '--browser-id', $session.BrowserId,
    '--timeout-ms', "$TimeoutMs"
  )
  if ($token) { $argumentList += @('--operation-token', $token) }
  if (Test-Path -LiteralPath $session.Paths.Active) {
    $argumentList += @('--theme-dir', $session.Paths.Active)
  }

  $removal = Invoke-DreamSkinNative -FilePath $session.NodePath -ArgumentList $argumentList -DiscardStderr
  if ($removal.ExitCode -eq 0) {
    if ($token) {
      $null = Show-DreamSkinOperationUi -Session $session -Phase finish -Token $token `
        -UiState success -Message '皮肤已暂停' -TimeoutMs 1500
    }
    return [pscustomobject]@{
      Attempted = $true
      Removed = $true
      Message = '皮肤已暂停'
    }
  }
  if ($token) {
    $null = Show-DreamSkinOperationUi -Session $session -Phase finish -Token $token `
      -UiState error -Message '暂停失败，请重试' -TimeoutMs 1500
  }
  return [pscustomobject]@{
    Attempted = $true
    Removed = $false
    Message = '已记录暂停，但卸下当前皮肤失败；可重试暂停或完全恢复。'
  }
}
