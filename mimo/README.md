# MiMo Dream Skin

把仓库里的 **Dream Skin 主题**（樱花海岸 / 清新绿色 / 哆啦A梦）应用到
**Xiaomi MiMo 桌面版**。通过本机回环 CDP 注入，不修改安装目录、`app.asar` 或官方签名。

与同仓库的 Codex 版（`../Start-Dream-Skin.ps1`）**互相独立、可共存**。

---

## 快速开始

环境要求：Windows 10+、Node.js 22+（在 `PATH` 中）、已安装 Xiaomi MiMo 桌面版。

**第一步 · 装一个快捷方式（只需做一次）**

```powershell
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo-Skin.ps1 -InstallShortcut
```

它会在桌面和开始菜单创建「Xiaomi MiMo (Dream Skin)」，指向同一个 MiMo，只是多带了
`--remote-debugging-port=9335`。

> **必须用这个快捷方式启动 MiMo**，不要用原来的图标。原因见下面
> 「关控制台会带走 MiMo」一节 —— 由资源管理器启动的进程父级是 `explorer.exe`，
> 与任何终端无关。

**第二步 · 双击快捷方式启动 MiMo**

MiMo 打开后就已经带着调试端口了。

**第三步 · 换主题 / 管理**

```powershell
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo-Skin.ps1 -List
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo-Skin.ps1 -Theme doraemon
.\Start-MiMo-Skin.ps1 -Theme sakura-coast
.\Start-MiMo-Skin.ps1 -Theme garden
.\Start-MiMo-Skin.ps1 -Diagnose    # 出问题时先跑这个，它会告诉你卡在哪一步
.\Start-MiMo-Skin.ps1 -Verify      # 只读检查
.\Start-MiMo-Skin.ps1 -Revert      # 还原官方外观
.\Start-MiMo-Skin.ps1 -RemoveShortcut
```

因为快捷方式始终带着调试端口，**之后换主题都不用再重启 MiMo**。
exe 位置自动从注册表 `Uninstall` 项的 `DisplayIcon` 读取，**不需要配置**。
需要强制指定时用 `-ExePath`。

---

## ⚠ 双击快捷方式"闪退"—— 不是崩溃，是单实例

**MiMo 已在运行时**（包括最小化到托盘的情况），再双击快捷方式，第二实例会命中
单实例锁 `requestSingleInstanceLock()` 然后 `exit(0)` —— 窗口一闪就没。
如果 MiMo 缩在托盘里，连弹回的窗口都看不见，看起来就像闪退。

> 这是单实例应用的正常行为。**先从托盘右键完全退出 MiMo，再双击快捷方式。**

拿不准就跑 `-Diagnose`，它会直接告诉你卡在哪一步。

---

## ⚠ 关控制台会带走 MiMo —— 两次修错，最终方案

用户实测：**关掉运行启动器的 PowerShell 窗口，MiMo 也跟着退出。**

`Start-Process` 创建的子进程会**继承调用者的控制台**。关掉那个窗口时，Windows 向该控制台
发 `CTRL_CLOSE_EVENT`，附着在上面的目标应用一起退出。

| 尝试 | 结果 |
|---|---|
| `Start-Process` | ❌ 子进程继承控制台，关窗口即被带走 |
| `ProcessStartInfo` + `CreateNoWindow=$true` | ❌ **依然失败**。`CREATE_NO_WINDOW` 的文档写着
「如果应用不是控制台程序，此标志被忽略」—— Electron 应用是 GUI 子系统程序 |
| **由资源管理器双击快捷方式启动** | ✅ 父进程是 `explorer.exe`，与终端无任何关系 ——
这是操作系统行为，不依赖任何标志位 |

因此启动器**默认不再代劳启动 MiMo**。MiMo 未运行时，它会确保快捷方式存在并提示你双击；
确实要脚本直接拉起时加 `-Launch`（WMI 创建，父进程应为 `WmiPrvSE.exe`）。

**兜底做法**（以上都不行时，100% 可靠，零代码）：
右键 MiMo 安装目录里的 `Xiaomi MiMo.exe` → 发送到 → 桌面快捷方式 →
右键该快捷方式 → 属性 → 在「目标」末尾加一个空格再接
`--remote-debugging-address=127.0.0.1 --remote-debugging-port=9335`。

> **关于验证边界的说明**：`-Launch` 的 WMI 路径依赖本机策略，沙箱环境可能拦截。
> 快捷方式路径由资源管理器启动，父进程是 `explorer.exe`，与终端无关，推荐优先使用。

---

## 主题模型

主题是**数据**，不是代码。加一套主题只需要往 `assets/themes/` 放一个 JSON：

| 字段 | 作用 |
|---|---|
| `image` | 背景插画（相对仓库根；用 `.webp` 版本，省带宽） |
| `colors` | 10 个语义色：`background` `panel` `panelAlt` `accent` `accentAlt` `secondary` `highlight` `text` `muted` `line` |
| `art` | `focusX` / `focusY` / `safeArea` —— 构图安全区，决定插画的哪个位置落在视觉重心 |
| `glass` | `panel` / `sidebar` / `main` / `composer` 的不透明度 + `blur` 半径 |

配色沿用 Dream Skin 原始主题的定义（见 `source` 字段指向的原文件），没有重新调色。
`scripts/theme-css.mjs` 在运行时把这 10 个语义色合成为 MiMo 的 ~70 个设计 token。

```powershell
node .\scripts\inject-skin.mjs --list           # 列主题
node .\scripts\inject-skin.mjs --theme doraemon # 应用
node .\scripts\inject-skin.mjs --no-bg          # 只要配色，不要插画
node .\scripts\inject-skin.mjs --accent "#2f6b53"
node .\scripts\inject-skin.mjs --css .\my.css --bg .\art.webp   # 完全自定义
```

注入器退出码：`0` 成功 · `1` 参数错误 · `2` 连不上 CDP · `3` 找不到渲染层 · `4` 校验不通过。

---

## 文件

| 路径 | 作用 |
|---|---|
| `Start-MiMo-Skin.ps1` | 入口：定位 exe、重启确认、带端口启动、调注入器 |
| `scripts/inject-skin.mjs` | CDP 附着 + 注入 + 运行时守卫 + 还原（无 npm 依赖） |
| `scripts/theme-css.mjs` | 主题合成器：语义色 → MiMo token |
| `assets/themes/*.json` | 主题定义 |
| `selectors.json` | 选择器契约：已实测锚点、作用域约束、未验证清单 |

状态与日志：`%LOCALAPPDATA%\MiMoDreamSkin\state.json`、`launcher.log`。

---

## ⚠ 两条关键技术约束

### 1. MiMo 会在比 `:root` 更具体的作用域里重声明 token

实测自渲染层 CSS：

```css
#app.plat-win32                                { --color-side-glass: var(--color-side); }
html:not([data-theme="dark"]) #app.plat-win32,
html:not([data-theme="dark"]) #app.plat-linux  { --color-side: #f8f7f5; --color-main-bg: #fff; }
html:not([data-theme="dark"]) .auto-view       { --color-bg: #fcfcfd; }
```

这些声明更靠近元素，会**把挂在 `:root` 上的覆盖值整个吃掉**。四种写法实测：

| 写法 | 结果 |
|---|---|
| `:root { … }` | ❌ 侧栏仍解析出官方 `#f8f7f5` |
| `:root { … !important }` | ❌ 仍被吃掉 |
| `:root, :root * { … !important }` | ✅ |
| 镜像应用的平台选择器 + `!important` | ✅ 但要枚举私有选择器，会随版本失效 |

所以用「**私有变量 + 通配投射**」：`--skin-*` 只声明在 `:root`，
再用一条 `:root, :root *` 投射到全树。主题切换只改 `--skin-*` 一处。

**副作用**：因为用了 `!important`，还原必须靠**移除 `<style>` 节点**，不能靠"再注一层空覆盖"。

### 2. 插画可见性与文字可读性是一对矛盾

`glass` 里的不透明度就是这对矛盾的旋钮。第一版把 `main` 设成 0.90，结果插画被洗成一片
浅色，用户反馈「没生效」。实测结论：

- `main` 0.90 + `blur` 22 → 插画完全不可辨（只剩色块）
- `main` 0.56 + `blur` 7 → 插画清晰可辨，文字仍可读 ← 当前取值

MiMo 的面板几乎铺满整个窗口（侧栏 + 主区 + 右侧面板），不像 Codex 有大量留白，
所以**必须靠半透明 + 轻度磨砂**让插画透出来，不能指望留白。
另外不要把 panel 色提亮 —— 提亮等于再加一层白浆。

**注意**：铺插画后文字对比度取决于插画本身像素。当前用的是浅色调插画
（蓝天/海岸/浅绿），正文可读；换成暗调插画需要同步抬高 `glass` 的不透明度。

---

## 墙纸与聊天框是怎么实现的

对齐 Dream Skin 原版的两条做法（不是我自己发明的）：

**墙纸属于窗口，不属于某个容器。** 铺在文档级（`html`，`background-attachment: fixed`），
同时把应用自身的不透明表面清成透明，插画才透得出来。只往 `#app` 上铺是不够的。

**输入区不用纯色，用「左浅右实」的横向渐变**，再加磨砂和柔和投影：

```css
#composer.composer {
  background: linear-gradient(90deg,
    rgb(var(--ds-panel-rgb) / 0.76),
    rgb(var(--ds-panel-rgb) / 0.90)) !important;
  backdrop-filter: blur(calc(var(--ds-glass-blur) + 4px));
  box-shadow: 0 10px 30px rgb(var(--ds-text-rgb) / .10),
              inset 0 0 0 1px rgb(var(--ds-line-rgb) / .55);
}
```

另外合成器会先生成一组 `--ds-*-rgb` 三元组（跟着 Dream Skin 的 `--ds-*` 命名），
这样强调色的叠加态可以写成 `rgb(var(--ds-accent-rgb) / .10)` —— 与 Codex 版同一套写法。

实测确认（在真实会话视图上）：输入区背景是渐变 + 20px 圆角 + 主题色投影、
输入框本体透明、`html` 背景是插画且 `background-attachment: fixed`、
正文区 0.62 不透明度使插画可见同时文字可读。

---

## 已验证

在真实登录态实例上逐主题验证：三套主题均可出图，侧栏 token 穿透生效，
墙纸固定定位，输入区渐变与还原可用。快捷方式目标与参数已读回校验。

**未验证**：
- 关窗口后 MiMo 是否存活（快捷方式路径由 `explorer.exe` 父进程保证，建议实际确认一次）。
- hover / focus / 禁用 / 弹层在皮肤下的实际观感。
- 用户消息气泡与应用设置切浅/深色是否与注入互不干扰。
- 暗调插画的对比度（当前三套均为浅色插画）。
- 主题里的角色立绘（`assets.pet` / `sidebarCompanion` / `composerCompanion`）尚未接入。

---

## 两个环境坑

1. **`ELECTRON_RUN_AS_NODE=1`** —— 环境里若有此变量，Electron 会被当成纯 Node 运行，
   启动 MiMo 时收到的 Chromium 开关全部报 `bad option: --remote-debugging-port=9335`
   并以退出码 9 立刻退出。启动器已在启动前清掉它。
2. **HTTP 代理** —— 指向 `127.0.0.1` 的 CDP 请求会被代理劫持返回 `502 Bad Gateway`。
   启动器设置 `NO_PROXY=127.0.0.1,localhost`，内部探测用 `curl --noproxy '*'`。

---

## 边界

- 不包含 API key、Cookie、访问令牌或本机绝对路径（exe 位置是运行时从注册表发现的）。
- 不读取应用 userData 中的本地 API 凭据文件，也不写日志或提交任何 token。
- 不修改 MiMo 安装目录、`app.asar` 或签名；CDP 只监听 `127.0.0.1`。
- 插画素材版权归原权利人，沿用仓库既有素材；请自行确认使用许可。
- MiMo 桌面版第三方换肤未经官方认可，请自行确认使用边界。
