#requires -Version 5.1
<#
.SYNOPSIS
  MiMo Dream Skin — 给 Xiaomi MiMo 桌面版换肤的启动器。

.DESCRIPTION
  通过本机回环 CDP 向 MiMo 注入设计 token 层，不修改安装目录、app.asar 或官方签名。

.PARAMETER Port
  CDP 端口，默认 9335。

.PARAMETER Theme
  要应用的主题 id（见 -List）。默认 sakura-coast。

.PARAMETER List
  列出 assets/themes 下的可用主题后退出。

.PARAMETER RestartExisting
  MiMo 已在运行时直接重启（不询问）。未保存输入可能丢失。

.PARAMETER PromptRestart
  需要重启时先询问。

.PARAMETER Verify
  只读检查当前注入状态，不启动也不注入。

.PARAMETER Revert
  还原官方外观。

.PARAMETER Accent
  覆盖主题的主强调色，例如 '#2f6b53'。

.PARAMETER Background
  自定义背景图：本地文件路径或 http(s) URL。给了就覆盖主题自带的插画。

.PARAMETER NoBackground
  不铺背景插画，只应用主题配色。

.PARAMETER ExePath
  显式指定 Xiaomi MiMo.exe，跳过注册表定位。

.PARAMETER NoInject
  只启动 MiMo 并开好 CDP 端口，不注入样式。

.PARAMETER InstallShortcut
  在桌面和开始菜单创建「Xiaomi MiMo (Dream Skin)」快捷方式。

.PARAMETER RemoveShortcut
  删除上面那两个快捷方式。

.PARAMETER Launch
  让脚本通过 WMI 直接拉起 MiMo。

.PARAMETER Diagnose
  只读体检。

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo-Skin.ps1 -Diagnose
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo-Skin.ps1 -Launch -RestartExisting
#>
[CmdletBinding()]
param(
  [int]$Port = 9335,
  [switch]$RestartExisting,
  [switch]$PromptRestart,
  [switch]$Verify,
  [switch]$Revert,
  [string]$Theme,
  [switch]$List,
  [string]$Accent,
  [string]$Background,
  [switch]$NoBackground,
  [string]$ExePath,
  [switch]$NoInject,
  [switch]$InstallShortcut,
  [switch]$RemoveShortcut,
  [switch]$Diagnose,
  [switch]$Launch
)

$ErrorActionPreference = 'Stop'

$StateRoot   = Join-Path $env:LOCALAPPDATA 'MiMoDreamSkin'
$StatePath   = Join-Path $StateRoot 'state.json'
$LogPath     = Join-Path $StateRoot 'launcher.log'
$Injector    = Join-Path $PSScriptRoot 'scripts\inject-skin.mjs'
$ProcessName = 'Xiaomi MiMo.exe'
$ProductMask = 'Xiaomi MiMo*'

function Write-Log {
  param([string]$Message, [string]$Level = 'INFO')
  $line = '[{0}] [{1}] {2}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level, $Message
  Write-Host $line
  try {
    if (-not (Test-Path -LiteralPath $StateRoot)) {
      New-Item -ItemType Directory -Force -Path $StateRoot | Out-Null
    }
    Add-Content -LiteralPath $LogPath -Value $line -Encoding UTF8
  } catch { }
}

# Machine-readable stage for the desktop launcher progress UI.
function Write-ProgressMark {
  param([int]$Percent, [string]$Message = '')
  $Percent = [Math]::Max(0, [Math]::Min(100, $Percent))
  $msg = if ($Message) { $Message } else { 'working' }
  Write-Host ("PROGRESS {0} {1}" -f $Percent, $msg)
}

function New-MiMoSkinShortcut {
  param([string]$Executable, [int]$Port)

  $shell = New-Object -ComObject WScript.Shell
  $targets = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'Xiaomi MiMo (Dream Skin).lnk'),
    (Join-Path (Join-Path ([Environment]::GetFolderPath('StartMenu')) 'Programs') 'Xiaomi MiMo (Dream Skin).lnk')
  )
  $made = @()
  foreach ($path in $targets) {
    try {
      $lnk = $shell.CreateShortcut($path)
      $lnk.TargetPath       = $Executable
      $lnk.Arguments        = "--remote-debugging-address=127.0.0.1 --remote-debugging-port=$Port"
      $lnk.WorkingDirectory = Split-Path -Parent $Executable
      $lnk.IconLocation     = "$Executable,0"
      $lnk.Description      = 'Xiaomi MiMo（已开启本机调试端口，供 Dream Skin 换肤）'
      $lnk.Save()
      $made += $path
    } catch {
      Write-Log "创建快捷方式失败：$path — $($_.Exception.Message)" 'WARN'
    }
  }
  return $made
}

function Remove-MiMoSkinShortcut {
  $targets = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'Xiaomi MiMo (Dream Skin).lnk'),
    (Join-Path (Join-Path ([Environment]::GetFolderPath('StartMenu')) 'Programs') 'Xiaomi MiMo (Dream Skin).lnk')
  )
  $gone = @()
  foreach ($path in $targets) {
    if (Test-Path -LiteralPath $path) {
      try { Remove-Item -LiteralPath $path -Force; $gone += $path } catch { }
    }
  }
  return $gone
}

function Get-RegistryValue {
  param([object]$Properties, [string]$Name)
  if (-not $Properties) { return $null }
  if (@($Properties.PSObject.Properties.Name) -notcontains $Name) { return $null }
  return $Properties.$Name
}

function Get-MiMoInstall {
  param([string]$Hint)
  if ($Hint) {
    $resolved = [System.IO.Path]::GetFullPath($Hint)
    if (-not (Test-Path -LiteralPath $resolved)) { throw "指定的 exe 不存在：$resolved" }
    return [pscustomobject]@{ Executable = $resolved; Version = $null; Source = 'explicit' }
  }

  $hives = @(
    'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall',
    'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall',
    'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall'
  )
  foreach ($hive in $hives) {
    if (-not (Test-Path $hive)) { continue }
    foreach ($key in (Get-ChildItem $hive -ErrorAction SilentlyContinue)) {
      $props = Get-ItemProperty -Path $key.PSPath -ErrorAction SilentlyContinue
      $displayName = Get-RegistryValue -Properties $props -Name 'DisplayName'
      if (-not $displayName) { continue }
      if ("$displayName" -notlike $ProductMask) { continue }

      $icon = Get-RegistryValue -Properties $props -Name 'DisplayIcon'
      if (-not $icon) { continue }
      $exe = ("$icon" -split ',\d+$')[0].Trim().Trim('"')
      if (Test-Path -LiteralPath $exe) {
        return [pscustomobject]@{
          Executable = $exe
          Version    = "$(Get-RegistryValue -Properties $props -Name 'DisplayVersion')"
          Source     = $key.PSChildName
        }
      }
    }
  }
  return $null
}

function Get-MiMoProcess {
  return @(Get-CimInstance Win32_Process -Filter "Name = '$ProcessName'" -ErrorAction SilentlyContinue)
}

function Stop-MiMoGracefully {
  param([object[]]$Processes)
  foreach ($p in $Processes) {
    try {
      $proc = Get-Process -Id $p.ProcessId -ErrorAction Stop
      [void]$proc.CloseMainWindow()
    } catch { }
  }
  $deadline = (Get-Date).AddSeconds(12)
  while ((Get-Date) -lt $deadline) {
    if ((Get-MiMoProcess).Count -eq 0) { return $true }
    Start-Sleep -Milliseconds 400
  }
  foreach ($p in (Get-MiMoProcess)) {
    try { Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop } catch { }
  }
  Start-Sleep -Milliseconds 1200
  return ((Get-MiMoProcess).Count -eq 0)
}

function Start-MiMoDetached {
  param([string]$Executable, [string[]]$Arguments)

  $cmd = '"' + $Executable + '"'
  if ($Arguments -and $Arguments.Count -gt 0) {
    $quoted = $Arguments | ForEach-Object {
      if ($_ -match '\s') { '"' + $_ + '"' } else { $_ }
    }
    $cmd += ' ' + ($quoted -join ' ')
  }

  $result = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine      = $cmd
    CurrentDirectory = (Split-Path -Parent $Executable)
  } -ErrorAction Stop

  if ($null -eq $result -or $result.ReturnValue -ne 0) {
    throw "通过 WMI 创建进程失败，ReturnValue=$($result.ReturnValue)"
  }
  return [int]$result.ProcessId
}

function Get-ProcessParentInfo {
  param([int]$ProcessId)
  try {
    $p = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction Stop
    if (-not $p) { return $null }
    $parent = Get-CimInstance Win32_Process -Filter "ProcessId = $($p.ParentProcessId)" -ErrorAction SilentlyContinue
    return [pscustomobject]@{
      ProcessId     = $p.ProcessId
      ParentId      = $p.ParentProcessId
      ParentName    = if ($parent) { $parent.Name } else { '(已退出)' }
      Detached      = ($parent -and $parent.Name -match 'WmiPrvSE')
    }
  } catch {
    return $null
  }
}

function Test-CdpReady {
  param([int]$Port)
  try {
    $out = & curl.exe -s -m 3 --noproxy '*' "http://127.0.0.1:$Port/json/version" 2>$null
  } catch {
    return $false
  }
  return ("$out" -match 'webSocketDebuggerUrl')
}

function Wait-Cdp {
  param([int]$Port, [int]$TimeoutSeconds = 60)
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-CdpReady -Port $Port) { return $true }
    Start-Sleep -Milliseconds 700
  }
  return $false
}

function Wait-MiMoRenderer {
  # CDP 端点就绪 ≠ 渲染层 target 已注册。刚启动时 /json/list 常为空，
  # 立刻注入会得到退出码 3。这里轮询直到出现 renderer/index.html。
  param([int]$Port, [int]$TimeoutSeconds = 45)
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $out = & curl.exe -s -m 3 --noproxy '*' "http://127.0.0.1:$Port/json/list" 2>$null
      if ("$out" -match 'renderer/index\.html') { return $true }
    } catch { }
    Start-Sleep -Milliseconds 500
  }
  return $false
}

function Get-NodeRuntime {
  try {
    $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source) { return $cmd.Source }
  } catch { }
  $candidates = @(
    (Join-Path $env:ProgramFiles 'nodejs\node.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'nodejs\node.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\nodejs\node.exe'),
    'D:\node\node.exe'
  )
  foreach ($c in $candidates) {
    if ($c -and (Test-Path -LiteralPath $c)) { return $c }
  }
  return $null
}

function Invoke-Injector {
  param([string[]]$Extra, [switch]$Tolerate)
  $node = Get-NodeRuntime
  if (-not $node) { throw '未找到 Node.js（需要 22 或更高版本，且已在 PATH 中）。' }
  $argv = @($Injector, '--port', "$Port") + $Extra
  Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
  $env:NO_PROXY = '127.0.0.1,localhost'
  $env:no_proxy = '127.0.0.1,localhost'
  & $node @argv
  $script:LastInjectorExit = $LASTEXITCODE
  if ($LASTEXITCODE -ne 0 -and -not $Tolerate) { throw "注入器退出码 $LASTEXITCODE" }
}

# ---------------------------------------------------------------- 只读分支 ----
if ($List) {
  Invoke-Injector -Extra @('--list') -Tolerate
  exit $script:LastInjectorExit
}

if ($Verify) {
  Invoke-Injector -Extra @('--verify') -Tolerate
  $code = $script:LastInjectorExit
  switch ($code) {
    2 { Write-Host '端口上没有 CDP 端点：MiMo 未以换肤模式启动，或已经关闭。' }
    3 { Write-Host '找不到 MiMo 的渲染层目标；请确认客户端已完整加载。' }
  }
  exit $code
}

# ---------------------------------------------------------------- 主流程 ----
if (-not (Test-Path -LiteralPath $StateRoot)) {
  New-Item -ItemType Directory -Force -Path $StateRoot | Out-Null
}

if ($Accent -and $Accent -notmatch '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$') {
  Write-Log "-Accent 需要是 #rgb / #rrggbb / #rrggbbaa 形式，收到：$Accent" 'ERROR'
  exit 1
}
if ($Background -and $Background -ne 'off' -and $Background -notmatch '^https?://') {
  try {
    $Background = (Resolve-Path -LiteralPath $Background -ErrorAction Stop).Path
  } catch {
    Write-Log "-Background 指向的文件不存在：$Background" 'ERROR'
    exit 1
  }
}

$install = Get-MiMoInstall -Hint $ExePath
if (-not $install) {
  Write-Log '未在注册表中找到 Xiaomi MiMo 的安装记录。请用 -ExePath 显式指定 exe。' 'ERROR'
  exit 1
}
Write-Log "已定位客户端：$($install.Executable)  版本 $($install.Version)  来源 $($install.Source)"

function Show-DreamSkinDiagnosis {
  param([object]$Install, [int]$Port)
  $lines = @()

  $procs = @(Get-CimInstance Win32_Process -Filter "Name = 'Xiaomi MiMo.exe'" -ErrorAction SilentlyContinue)
  $cdpUp = Test-CdpReady -Port $Port
  $lnkDesk = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Xiaomi MiMo (Dream Skin).lnk'

  $lines += ('1. MiMo 进程数            = ' + $procs.Count)
  if ($procs.Count -gt 0) {
    $first = $procs | Sort-Object CreationDate | Select-Object -First 1
    $par = Get-CimInstance Win32_Process -Filter "ProcessId = $($first.ParentProcessId)" -ErrorAction SilentlyContinue
    $pn = if ($par) { $par.Name } else { '(已退出)' }
    $lines += ('   最早实例的父进程       = ' + $pn)
    if ($pn -match 'explorer') { $lines += '   → 由资源管理器启动，与终端无关 ✓' }
    elseif ($pn -match 'powershell|cmd|WmiPrvSE|WindowsTerminal') { $lines += '   → 由终端/WMI 启动，关那个窗口可能带走它' }
    $lines += ('2. 调试端口 ' + $Port + '          = ' + $(if ($cdpUp) { '已就绪 ✓' } else { '未开启' }))
  } else {
    $lines += ('2. MiMo 未运行（调试端口无从谈起）')
  }

  $lines += ('3. 快捷方式（桌面）        = ' + $(if (Test-Path -LiteralPath $lnkDesk) { '存在' } else { '未安装（跑 -InstallShortcut）' }))
  if (Test-Path -LiteralPath $lnkDesk) {
    $sh = New-Object -ComObject WScript.Shell
    $l = $sh.CreateShortcut($lnkDesk)
    $lines += ('   目标                   = ' + $l.TargetPath)
    $lines += ('   参数                   = ' + $l.Arguments)
  }

  $pend = Join-Path $env:LOCALAPPDATA 'xiaomi-mimo-desktop-updater\pending'
  if (Test-Path -LiteralPath $pend) {
    $lines += ('4. 更新器待装包           = 存在（' + ((Get-ChildItem -LiteralPath $pend -File -ErrorAction SilentlyContinue).Count) + ' 个文件）')
  } else {
    $lines += '4. 更新器待装包           = 无'
  }

  $lines += ''
  if ($procs.Count -gt 0 -and $cdpUp) {
    $lines += ('结论：一切就绪，直接换主题 →  .\Start-MiMo-Skin.ps1 -Theme <主题>')
  }
  elseif ($procs.Count -gt 0) {
    $lines += '结论：MiMo 正在运行但没带调试端口。'
    $lines += '      请从托盘图标右键完全退出 MiMo，再双击「Xiaomi MiMo (Dream Skin)」。'
    $lines += '      注意：MiMo 已在运行时双击快捷方式，只会弹回现有窗口（托盘里看不见），'
    $lines += '      看起来就像"闪退" —— 这是单实例应用的正常行为，不是崩溃。'
  }
  elseif (Test-Path -LiteralPath $lnkDesk) {
    $lines += '结论：MiMo 未运行。双击桌面「Xiaomi MiMo (Dream Skin)」启动，然后跑 -Theme <主题>。'
  }
  else {
    $lines += '结论：MiMo 未运行，快捷方式也未安装。先跑 -InstallShortcut。'
  }
  return $lines
}

if ($Diagnose) {
  Show-DreamSkinDiagnosis -Install $install -Port $Port
  exit 0
}

if ($InstallShortcut) {
  $made = New-MiMoSkinShortcut -Executable $install.Executable -Port $Port
  if ($made.Count -eq 0) { Write-Log '没有创建任何快捷方式。' 'ERROR'; exit 1 }
  foreach ($m in $made) { Write-Log "已创建：$m" }
  Write-Host ''
  Write-Host '以后用这个快捷方式启动 MiMo（由资源管理器拉起，与终端无关，且自带调试端口）。'
  Write-Host '启动后直接跑本脚本 -Theme <主题> 换肤即可，不需要再重启。'
  exit 0
}

if ($RemoveShortcut) {
  $gone = Remove-MiMoSkinShortcut
  if ($gone.Count -eq 0) { Write-Log '没有找到需要删除的快捷方式。' 'WARN' }
  foreach ($g in $gone) { Write-Log "已删除：$g" }
  exit 0
}

if ($Revert) {
  if (-not (Test-CdpReady -Port $Port)) {
    Write-Log "端口 $Port 上没有可用的 CDP 端点，无法还原。请先用本脚本启动一次。" 'ERROR'
    exit 1
  }
  Invoke-Injector -Extra @('--revert')
  Write-Log '已还原官方外观。'
  exit 0
}

$running = Get-MiMoProcess
$needLaunch = $false

Write-ProgressMark 8 'locating MiMo process'
if ($running.Count -eq 0) {
  $needLaunch = $true
}
elseif (Test-CdpReady -Port $Port) {
  Write-Log "检测到运行中的 MiMo 已带 CDP 端口 $Port，直接复用。"
  Write-ProgressMark 35 'reusing running CDP'
}
else {
  Write-Log "MiMo 正在运行（$($running.Count) 个进程），但未开启 CDP 端口。"
  Write-ProgressMark 12 'restarting MiMo without CDP'
  $authorized = [bool]$RestartExisting
  if (-not $authorized -and $PromptRestart) {
    $answer = Read-Host '需要重启 MiMo 一次才能换肤，未保存的输入可能丢失。现在重启？(y/N)'
    $authorized = ($answer -match '^(y|yes|是)$')
  }
  if (-not $authorized) {
    Write-Log '已取消。未重启，未改动任何内容。' 'WARN'
    Write-Host ''
    Write-Host '如需重启后再换肤，请加 -RestartExisting 或 -PromptRestart 参数。'
    Write-Host '更省事的做法：先跑一次 -InstallShortcut，之后一直用那个快捷方式启动 MiMo，'
    Write-Host '这样 MiMo 始终带着调试端口，换主题就不用再重启了。'
    exit 2
  }
  if (-not (Stop-MiMoGracefully -Processes $running)) {
    Write-Log 'MiMo 未能正常退出，请手动关闭后重试。' 'ERROR'
    exit 1
  }
  Write-Log '已关闭原有 MiMo 实例。'
  $needLaunch = $true
}

if ($needLaunch) {
  if (-not $Launch) {
    $deskLnk = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Xiaomi MiMo (Dream Skin).lnk'
    if (-not (Test-Path -LiteralPath $deskLnk)) {
      Write-Log '未找到换肤专用快捷方式，正在创建…'
      [void](New-MiMoSkinShortcut -Executable $install.Executable -Port $Port)
    }
    Write-Log 'MiMo 未运行。为避免关窗口时把它带走，本脚本不代劳启动。'
    Write-Host ''
    Write-Host '请双击桌面上的「Xiaomi MiMo (Dream Skin)」启动 MiMo（它自带调试端口），'
    Write-Host '然后再跑一次本脚本换主题即可 —— 之后换主题都不用重启。'
    Write-Host ''
    Write-Host '如果你确认要脚本直接拉起，加 -Launch（该方式在部分环境可能被终端带走）。'
    exit 3
  }

  Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
  $launchArgs = @(
    '--remote-debugging-address=127.0.0.1',
    "--remote-debugging-port=$Port"
  )
  Write-ProgressMark 18 'launching MiMo'
  Write-Log "启动（-Launch 显式指定）：$($install.Executable) $($launchArgs -join ' ')"
  $mimoPid = Start-MiMoDetached -Executable $install.Executable -Arguments $launchArgs
  Write-Log "已通过 WMI 创建 MiMo（PID $mimoPid）。父进程应为 WmiPrvSE.exe。"
  Write-ProgressMark 28 'waiting for CDP endpoint'

  if (-not (Wait-Cdp -Port $Port -TimeoutSeconds 60)) {
    Write-Log "60 秒内未出现 CDP 端点。可能原因：客户端版本变更、安全软件拦截、或启动参数被忽略。" 'ERROR'
    exit 1
  }
  Write-Log 'CDP 端点已就绪。'
  Write-ProgressMark 40 'CDP endpoint ready'
}

if ($NoInject) {
  Write-Log '按 -NoInject 要求，跳过注入。'
}
else {
  Write-ProgressMark 48 'waiting for renderer'
  if (-not (Wait-MiMoRenderer -Port $Port -TimeoutSeconds 45)) {
    Write-Log '45 秒内未找到渲染层 target，仍尝试注入。' 'WARN'
  } else {
    Write-Log '渲染层 target 已就绪。'
    Write-ProgressMark 55 'renderer ready'
  }
  $extra = @()
  if ($Theme)        { $extra += @('--theme', $Theme) }
  if ($Accent)       { $extra += @('--accent', $Accent) }
  if ($Background)   { $extra += @('--bg', $Background) }
  if ($NoBackground) { $extra += @('--no-bg') }

  # 刚启动时渲染层可能晚半拍注册；退出码 3 时重试几次。
  $injectOk = $false
  foreach ($attempt in 1..5) {
    Write-ProgressMark (55 + [int](8 * ($attempt - 1))) "inject attempt $attempt"
    Invoke-Injector -Extra $extra -Tolerate
    if ($script:LastInjectorExit -eq 0) { $injectOk = $true; break }
    if ($script:LastInjectorExit -eq 3) {
      Write-Log "注入器未找到渲染层（第 $attempt 次），1.5 秒后重试…" 'WARN'
      Start-Sleep -Milliseconds 1500
      continue
    }
    throw "注入器退出码 $($script:LastInjectorExit)"
  }
  if (-not $injectOk) { throw "注入器退出码 $($script:LastInjectorExit)" }
  Write-Log '皮肤注入完成。'
  Write-ProgressMark 96 'skin injected'
}

$state = [pscustomobject]@{
  schema     = 'mimo-dream-skin-state/2'
  port       = $Port
  executable = $install.Executable
  version    = $install.Version
  theme      = $Theme
  accent     = $Accent
  injectedAt = (Get-Date).ToUniversalTime().ToString('o')
}
$state | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $StatePath -Encoding UTF8
Write-Log "状态已写入 $StatePath"
