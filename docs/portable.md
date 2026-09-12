# 跨电脑复用

支持 Windows 10/11、官方 Microsoft Store Codex、Node.js 22 或以上。无需复制开发机用户名、盘符或 Codex 安装路径，运行脚本会在目标电脑重新探测。此版本不支持 macOS/Linux。

## 导出

在项目目录执行，输出目录必须不存在：

```powershell
node .\windows\scripts\maintenance\export-portable.mjs .\artifacts\DreamSkin-portable
Compress-Archive -LiteralPath .\artifacts\DreamSkin-portable -DestinationPath .\artifacts\DreamSkin-portable.zip
```

导出采用文件白名单：启动脚本、主题与图片、维护脚本和文档。排除账号配置、日志、备份、快捷方式、开发草稿、WebView2 DLL 和本机运行状态。清单 `portable-manifest.json` 记录每个文件的 SHA-256，供传输后核对；它不是发行签名。

## 在目标电脑使用

1. 解压到一个固定目录，支持中文和空格路径。请先解压，不能直接在压缩包中启动。
2. 安装官方 Codex 并正常登录。准备 Node.js 22+，加入 PATH；也可把自行取得的 Windows Node 运行时放在 `windows/runtime/node/node.exe`。不会自动下载或安装依赖。
3. 在解压后的目录运行环境检查：

   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\windows\scripts\maintenance\check-environment.ps1
   ```

4. 启动皮肤：

   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Start-Dream-Skin.ps1
   ```

5. 如需桌面入口，运行 `windows/scripts/maintenance/install-launch-shortcuts.ps1`。移动目录后重新运行以更新快捷方式。

`Start-Codex.ps1` 用于选择 MiMo / Codex 皮肤；无 WebView2 SDK 时自动使用精简模式。完整动画启动器依赖可选 SDK 程序集与 Evergreen Runtime，便携导出不包含这些开发机组件。

## 恢复与更新

- 恢复官方外观：运行 `windows/scripts/restore-dream-skin.ps1 -PromptRestart`。
- 热更新当前窗口：运行 `Start-Dream-Skin.ps1 -Reapply`。
- 不要从旧电脑复制 `%LOCALAPPDATA%/CodexDreamSkin/state.json`、浏览器配置、登录数据或 `.lnk`；目标电脑会生成自己的运行状态。
- Codex 更新可能改变页面结构。更新后重新检查设置、插件详情、弹窗、任务页和侧栏；可用注入器 `--verify` 验证安装状态，但它不等同于逐页视觉检查。

## 验证范围

已在本机进行导出、文件清单校验、中文空格目录重新加载主题及脚本解析检查。尚未在第二台实体电脑或所有 Windows/CPU 组合实测，不承诺任意电脑免依赖运行。
