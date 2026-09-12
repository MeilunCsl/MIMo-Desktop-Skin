# Launcher

`Start-Codex.ps1` 启动可选 WebView2 启动器（`windows/assets/launcher.html` + `Launcher.cs`），在 Codex / MiMo 皮肤之间选择。

无 WebView2 SDK 程序集或非 x64 时，自动回退到精简模式选择器，直接拉起 MiMo 皮肤工作进程。

工作进程在独立隐藏 PowerShell 中运行：MiMo 走 `mimo/Start-MiMo-Skin.ps1 -Launch -RestartExisting`。关闭启动器窗口不会中止已在进行的启动。日志写在 `%LOCALAPPDATA%\CodexDreamSkin`。

## 可选 DLL

`lib/` 下的 WebView2 SDK 程序集（Core / WinForms / Loader）不纳入 Git，也不随便携导出分发。没有它们时启动器仍可用精简模式。

预览动画（不实际启动客户端）：

```powershell
powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File .\Start-Codex.ps1 -Mode MiMo -PreviewDirectory .\tmp\launcher-preview
```
