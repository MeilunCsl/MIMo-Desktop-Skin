# MiMo Desktop Skin

给 **Xiaomi MiMo 桌面版**换肤的外部工具。通过本机回环 CDP 注入主题 CSS 与运行时脚本，**不修改**安装目录、`app.asar` 或官方签名。

克隆后即可使用：无 npm 依赖、无 `node_modules`、不读取本机凭据。

> 非官方第三方工具。请自行确认客户端版本、素材版权与使用边界。

## 环境要求

- Windows 10 或更高
- 已安装 Xiaomi MiMo 桌面版
- Node.js 22+，且已加入 `PATH`

检查 Node：

```powershell
node -v
```

## 快速开始

```powershell
git clone https://github.com/MeilunCsl/MIMo-Desktop-Skin.git
cd MIMo-Desktop-Skin

# 1) 安装桌面/开始菜单快捷方式（推荐，只需一次）
powershell -NoProfile -ExecutionPolicy Bypass -File .\windows\scripts\maintenance\install-launch-shortcuts.ps1

# 2) 双击桌面「MiMo 皮肤启动器」或「Xiaomi MiMo (Dream Skin)」启动
```

没有快捷方式时，也可以：

```powershell
# 列出主题
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\mimo\Start-MiMo-Skin.ps1 -List

# 应用主题（MiMo 需已带调试端口运行）
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\mimo\Start-MiMo-Skin.ps1 -Theme garden

# 体检 / 还原
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\mimo\Start-MiMo-Skin.ps1 -Diagnose
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\mimo\Start-MiMo-Skin.ps1 -Revert
```

或直接调用注入器：

```powershell
node .\mimo\scripts\inject-skin.mjs --list
node .\mimo\scripts\inject-skin.mjs --theme sakura-coast
node .\mimo\scripts\inject-skin.mjs --revert
```

## 内置主题

| id | 名称 | 说明 |
|---|---|---|
| `garden` | 清新绿色 | 浅绿背景 + 花园插画 |
| `sakura-coast` | 樱花海岸 | 浅蓝海岸（默认） |
| `doraemon` | 哆啦A梦 | 蓝天屋顶 + 角色配色 |

自定义主题：在 `mimo/assets/themes/` 放一个 JSON（参考现有三套），字段见 `mimo/README.md`。

## 为什么必须用快捷方式启动

MiMo 是单实例 Electron 应用。由终端启动时，关闭控制台可能带走子进程。  
快捷方式由资源管理器启动，父进程是 `explorer.exe`，与终端无关。

MiMo 已在运行时再双击快捷方式会命中单实例锁并闪退——先从托盘完全退出，再启动。

## 仓库结构

```text
Start-Codex.ps1                 # 启动器入口（无 WebView2 DLL 时自动精简模式）
Start-Dream-Skin.ps1            # Codex 皮肤入口（可选）
mimo/                           # MiMo 注入器、主题合成、主题 JSON
windows/scripts/                # 启动、注入、快捷方式、维护脚本
windows/assets/                 # CSS、选择器、运行时与主题素材（webp）
windows/launcher/               # 可选 WebView2 启动器宿主
modules/                        # 功能模块契约（module.json）
docs/                           # 架构、隐私边界、移植说明
logo/                           # 快捷方式图标
```

`windows/launcher/lib/*.dll`（WebView2 SDK）**不纳入 Git**。没有它们时启动器仍可用精简模式。

## 安全与隐私

- 仓库**不包含** API key、Cookie、访问令牌、个人配置或本机绝对路径。
- 运行态只写入 `%LOCALAPPDATA%\MiMoDreamSkin`（状态、日志），不进 Git。
- CDP 只绑定 `127.0.0.1`。
- 不读取应用 userData 中的本地 API 凭据文件。
- 不上传聊天内容，不修改 MiMo 安装文件。

详细边界见 [docs/data-and-privacy.md](docs/data-and-privacy.md)。

## 克隆后自检

```powershell
node .\mimo\scripts\inject-skin.mjs --list
node .\windows\scripts\injector.mjs --self-test
node .\windows\scripts\injector.mjs --check-payload --theme-dir .\windows\assets
```

三者退出码应为 `0`。

## Codex 皮肤（可选）

本仓库同时保留 Windows Codex 换肤入口：

```powershell
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-Dream-Skin.ps1
```

详见 [docs/feature-map.md](docs/feature-map.md) 与 [docs/architecture.md](docs/architecture.md)。

## License / 素材

插画与角色素材版权归原权利人；沿用仓库既有素材，请自行确认使用许可。代码按仓库所选许可证发布。
