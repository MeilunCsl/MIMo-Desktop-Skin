# MiMo Desktop Skin

[English](./README.md) | 简体中文

给 **Xiaomi MiMo 桌面版**换肤。通过本机回环 CDP 注入主题 CSS，**不修改**安装目录、`app.asar` 或官方签名。

克隆即可用：无 npm 依赖、无 `node_modules`、不读取本机凭据、不含 Codex 相关代码。

> 非官方第三方工具。请自行确认客户端版本、素材版权与使用边界。

## 效果预览

樱花海岸皮肤 · **新建任务** 视图（项目已收起）：

![MiMo 主页 — 新建任务](./docs/images/mimo-home.png)

输入区进度条（剩余额度环 · 今日累计 · X 公开重置信号）：

![进度条](./docs/images/mimo-progress-bar.png)

顶栏额度胶囊：

![额度胶囊](./docs/images/mimo-quota-pill.png)

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

# 双击桌面「MiMo 皮肤」
# 或命令行直接启动（会确保快捷方式存在，并提示用快捷方式拉起 MiMo）
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1
```

常用命令：

```powershell
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1 -List
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1 -Diagnose
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1 -Revert
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1 -Verify

# 注入器（MiMo 已带调试端口时）
node .\mimo\scripts\inject-skin.mjs --list
node .\mimo\scripts\inject-skin.mjs --theme sakura-coast
node .\mimo\scripts\inject-skin.mjs --revert
```

## 皮肤

当前内置**一套**主题：

| id | 名称 |
|---|---|
| `sakura-coast` | 樱花海岸 |

要换插画：替换 `mimo/assets/sakura-coast.webp`，或改 `mimo/assets/themes/sakura-coast.json` 里的 `image` / `colors` / `glass`。

## 为什么必须用快捷方式启动

MiMo 是单实例 Electron。由终端启动时，关掉控制台可能带走子进程。  
快捷方式由资源管理器启动，父进程是 `explorer.exe`，与终端无关。

MiMo 已在运行时再双击会命中单实例锁并闪退——先从托盘完全退出，再启动。

## 「重置信号」是什么

顶栏/输入区旁的信号**只读取 X（Twitter）公开时间线**（`https://x.com/thsottiaux`）上与额度重置相关的公开动态，本地分类后展示。

- 不是官方通知
- 不读取 Cookie / Token / 账户凭据
- 网络失败时显示为空，不影响换肤

实现见 `mimo/scripts/tibo-radar.mjs`。

## 结构

```text
Start-MiMo.ps1                      # 根入口
mimo/Start-MiMo-Skin.ps1            # 定位 exe、快捷方式、CDP、调注入器
mimo/scripts/inject-skin.mjs        # CDP 注入 + 运行时
mimo/scripts/theme-css.mjs          # 语义色 → MiMo token
mimo/scripts/tibo-radar.mjs         # X 公开动态（可选信号）
mimo/scripts/install-launch-shortcuts.ps1
mimo/assets/themes/sakura-coast.json
mimo/assets/sakura-coast.webp
mimo/assets/side-avatar.webp
mimo/selectors.json                 # 选择器契约
logo/mimo.ico                       # 快捷方式兜底图标（优先用已安装的 MiMo 应用图标）
```

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
