# MiMo Desktop Skin

[English](./README.md) | 简体中文

给 **Xiaomi MiMo 桌面版**换肤。通过本机回环 CDP 注入主题 CSS，**不修改**安装目录、`app.asar` 或官方签名。

克隆即可用：无 npm 依赖、无 `node_modules`、不读取本机凭据、不含 Codex 相关代码。

> 非官方第三方工具。请自行确认客户端版本、素材版权与使用边界。

## 效果预览

产品站（中英双语）：浏览器打开 [`site/index.html`](./site/index.html)。

樱花海岸 · **新建任务** 视图（项目已收起）：

![MiMo 主页 — 新建任务](./docs/images/mimo-home.png)

启动器窗口（真实截图录帧 — 进度跟随工作进程 `PROGRESS` 阶段）：

![启动器进度](./docs/images/mimo-launch-progress.gif)

## 环境

- Windows 10+
- 已安装 Xiaomi MiMo 桌面版
- Node.js 22+（在 `PATH` 中）

## 快速开始

```powershell
git clone https://github.com/MeilunCsl/MIMo-Desktop-Skin.git
cd MIMo-Desktop-Skin

# 安装桌面/开始菜单快捷方式（一次）
powershell -NoProfile -ExecutionPolicy Bypass -File .\mimo\scripts\install-launch-shortcuts.ps1

# 打开启动器窗口（进度条按真实阶段推进）
powershell -NoProfile -STA -ExecutionPolicy Bypass -File .\Start-MiMo.ps1
```

常用命令：

```powershell
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1 -List
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1 -Diagnose
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1 -Revert
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1 -Verify
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1 -NoLauncher -Theme sakura-coast

# 注入器（MiMo 已带调试端口时）
node .\mimo\scripts\inject-skin.mjs --list
node .\mimo\scripts\inject-skin.mjs --theme sakura-coast
node .\mimo\scripts\inject-skin.mjs --revert
```

## 皮肤

内置一套主题：**`sakura-coast`（樱花海岸）**。

换插画：替换 `mimo/assets/sakura-coast.webp`，或改 `mimo/assets/themes/sakura-coast.json` 的 `image` / `colors` / `glass`。

## 启动器进度（真实阶段）

桌面启动器**不是**按时间假动画。工作进程会输出机器可读标记：

```text
PROGRESS <0-100> <阶段>
```

| 阶段 | 百分比 | 来源 |
|---|---|---|
| 定位 MiMo 进程 | 8% | `Start-MiMo-Skin.ps1` |
| 启动 / 重启 MiMo | 18% | `Start-MiMo-Skin.ps1` |
| 等待 CDP 端点 | 28–40% | `Start-MiMo-Skin.ps1` |
| 渲染层就绪 | 55% | `Start-MiMo-Skin.ps1` |
| 连接 CDP / 附着 | 60–65% | `inject-skin.mjs` |
| 合成主题 CSS | 72–84% | `inject-skin.mjs` |
| 注入样式表 | 91% | `inject-skin.mjs` |
| 应用运行时 | 94% | `inject-skin.mjs` |
| **成功（校验通过）** | **100%** | 工作进程退出码 0 |

`Launcher.cs` 解析这些行并更新界面。100% 只在注入成功后出现。

## 为什么必须用快捷方式启动

MiMo 是单实例 Electron。由终端启动时，关掉控制台可能带走子进程。  
快捷方式由资源管理器启动（父进程 `explorer.exe`）。若 MiMo 已在托盘运行，请先完全退出。

## 「重置信号」是什么

输入区旁的信号**只读取 X 公开时间线**（`https://x.com/thsottiaux`）上与额度重置相关的动态，本地分类后展示。

- 不是官方通知
- 不读取 Cookie / Token / 账户凭据
- 网络失败时为空，不影响换肤

见 `mimo/scripts/tibo-radar.mjs`。

## 结构

```text
Start-MiMo.ps1                      # 根入口（默认打开启动器）
Start-Codex.ps1                     # WebView2 进度启动器宿主
mimo/Start-MiMo-Skin.ps1            # 定位 exe、快捷方式、CDP、注入
mimo/scripts/inject-skin.mjs        # CDP 注入 + 运行时（输出 PROGRESS）
mimo/scripts/theme-css.mjs          # 语义色 → MiMo token
mimo/scripts/tibo-radar.mjs         # X 公开动态（可选信号）
mimo/scripts/install-launch-shortcuts.ps1
mimo/assets/themes/sakura-coast.json
mimo/assets/sakura-coast.webp
mimo/assets/side-avatar.webp
mimo/selectors.json
windows/launcher/                   # 可选 WebView2 宿主（SDK DLL 不进仓库）
docs/images/                        # README 截图 / GIF
site/                               # 中英产品站
logo/mimo.ico
```

> 动画启动器需要 `windows/launcher/lib/` 下的 WebView2 SDK 程序集（本仓库不发布）。没有它们时启动器走非 WebView 路径。

## 安全

- 仓库不含 API key、Cookie、访问令牌、个人配置或本机绝对路径
- 运行态只写 `%LOCALAPPDATA%\MiMoDreamSkin`
- CDP 只绑定 `127.0.0.1`
- 不读取应用 userData 中的本地 API 凭据文件
- 不上传聊天内容，不修改安装文件

## 克隆后自检

```powershell
node .\mimo\scripts\inject-skin.mjs --list
```

应输出 `sakura-coast`。
