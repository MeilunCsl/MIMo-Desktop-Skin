# Dream Skin

外部换肤工具，通过本机回环 CDP 注入主题 CSS 和运行时脚本，不修改安装目录、`app.asar` 或官方签名。

当前支持两个客户端：

- **Xiaomi MiMo Desktop**：`mimo/`，入口 `Start-Codex.ps1` 或 `mimo/Start-MiMo-Skin.ps1`
- **Windows Codex**：入口 `Start-Dream-Skin.ps1`

## 快速开始

环境要求：Windows 10+、Node.js 22+（在 `PATH` 中）。项目没有 npm 依赖和 `node_modules`。

### MiMo 皮肤

```powershell
# 安装桌面/开始菜单快捷方式（只需一次）
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\windows\scripts\maintenance\install-launch-shortcuts.ps1

# 或直接启动启动器（Codex / MiMo）
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Start-Codex.ps1
```

也可只管理主题：

```powershell
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\mimo\Start-MiMo-Skin.ps1 -List
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\mimo\Start-MiMo-Skin.ps1 -Theme garden
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\mimo\Start-MiMo-Skin.ps1 -Revert
```

详见 [mimo/README.md](mimo/README.md)。

### Codex 皮肤

```powershell
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-Dream-Skin.ps1
```

常用参数：`-RestartExisting`、`-ForegroundInjector`、`-Reapply`。

切换 / 恢复：

```powershell
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\windows\scripts\switch-dream-skin.ps1 -List
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\windows\scripts\switch-dream-skin.ps1 -Reapply
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\windows\scripts\restore-dream-skin.ps1 -PromptRestart
```

环境检查（不启动客户端）：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\windows\scripts\maintenance\check-environment.ps1
```

静态检查：

```powershell
node .\windows\scripts\injector.mjs --self-test
node .\windows\scripts\injector.mjs --check-payload --theme-dir .\windows\assets
node --check .\windows\scripts\injector.mjs
```

## 项目结构

```text
Start-Codex.ps1                 # 启动器入口（默认 MiMo）
Start-Dream-Skin.ps1            # Codex 皮肤入口
mimo/                           # MiMo 注入器、主题合成与主题 JSON
windows/scripts/                # Codex 启动、注入、切换、恢复
windows/assets/                 # 运行时 payload、CSS、选择器与主题素材
windows/assets/presets/         # 可保存/切换的主题预设
windows/launcher/               # WebView2 启动器宿主（可选，无 DLL 时回退精简模式）
modules/                        # 功能模块契约（module.json）
docs/                           # 架构、功能总览、隐私边界与作者指南
logo/                           # 快捷方式图标
```

## 主题

| 主题 | 说明 |
|---|---|
| 清新绿色 / garden | 浅绿背景与花园插画 |
| 樱花海岸 / sakura-coast | 浅蓝海岸 |
| 哆啦A梦 / doraemon | 蓝天屋顶与角色配色 |

## 数据和安全边界

- 不包含 API key、Cookie、访问令牌、个人配置或本机绝对路径。
- 运行态只写入 `%LOCALAPPDATA%` 下的应用目录（`MiMoDreamSkin` / `CodexDreamSkin`），不进仓库。
- 外部请求只用于读取公开数据；不上传聊天内容、不发送用户输入、不修改安装文件。
- CDP 只绑定 `127.0.0.1`。
- 非官方第三方工具。使用前请确认客户端版本、素材版权和外部数据源许可。

更细的说明见 [docs/data-and-privacy.md](docs/data-and-privacy.md)、[docs/architecture.md](docs/architecture.md)、[docs/feature-map.md](docs/feature-map.md)。

## 发布说明

仓库不保存运行态目录、日志或本机配置；代码和主题资源经审查后按 Git 流程提交。
