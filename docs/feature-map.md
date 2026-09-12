# 皮肤软件功能实现总览

这份文档把整个 Codex Dream Skin 作为一个软件说明，而不是把它看成几段互不相关的 CSS。当前版本是一个 Windows 外部换肤运行时：Codex 仍然负责原生窗口、会话、模型选择和输入框；本项目通过本机 CDP 把主题资源、CSS 和运行时增强脚本注入到 Codex 页面中。

## 一、整体是怎么运行的

```text
用户执行 Start-Dream-Skin.ps1
        │
        ▼
start-dream-skin.ps1
  ├─ 检查 Windows Codex、Node.js、端口和已保存状态
  ├─ 初始化 %LOCALAPPDATA%\CodexDreamSkin
  ├─ 选择 active-theme
  └─ 启动/连接 127.0.0.1 CDP
        │
        ▼
injector.mjs
  ├─ 校验 theme.json、selectors.json 和图片路径
  ├─ 把 CSS、运行时脚本和图片组装成单次 payload
  ├─ 通过 adopted stylesheet 注入样式
  └─ 在 Codex renderer 中执行 renderer-inject.js
        │
        ▼
renderer-inject.js + dream-skin.css
  ├─ 识别 home / thread / settings / overlay 路由
  ├─ 应用主题和背景
  ├─ 维护推荐模型、额度和聊天状态
  ├─ 监听路由、DOM、窗口尺寸和可见性变化
  └─ cleanup 时移除所有动态节点、监听器和定时器
```

项目没有 npm 依赖，也不修改 Codex 安装目录、`app.asar` 或官方签名。`modules/` 目录是运行时模块契约和维护入口；为了适配当前 Codex 的单次注入方式，浏览器最终仍执行一个 payload，而不是直接 import 多个脚本。

## 二、文件职责

| 文件 | 作用 | 换皮时是否通常修改 |
|---|---|---|
| `Start-Dream-Skin.ps1` | 用户级启动入口 | 否 |
| `windows/scripts/start-dream-skin.ps1` | 检查环境、管理 Codex 生命周期和注入器 | 仅修复启动流程时修改 |
| `windows/scripts/injector.mjs` | 校验资源、组装 payload、CDP 注入、verify、remove | 仅修改注入协议时修改 |
| `windows/scripts/internal/theme-windows.ps1` | active-theme、保存主题和主题切换 | 仅修改主题存储规则时修改 |
| `windows/assets/theme.json` | 当前主题的名称、颜色、背景和刷新参数 | 是，最常修改 |
| `windows/assets/presets/<id>/` | 可切换主题的配置和图片 | 是，制作新皮肤时新增 |
| `windows/assets/selectors.json` | Codex DOM 选择器契约和 L1/L2 锚点 | 只有 Codex DOM 契约变化时修改 |
| `windows/assets/dream-skin.css` | 视觉、布局、颜色、状态和响应式规则 | 是，调整 UI 时修改 |
| `windows/assets/renderer-inject.js` | 数据、交互、动态节点、观察器和清理 | 只有功能/数据源/DOM 契约变化时修改 |
| `modules/*/module.json` | 机器可读的模块入口、ID、配置和安全边界 | 新增或调整模块契约时修改 |

## 三、共享状态原则

所有功能都在同一个 renderer runtime 中运行，但各自只有一个状态源：

| 状态 | 作用 | 消费方 |
|---|---|---|
| `quotaState` | Codex 当前额度的规范化结果 | 顶部额度条、额度弹窗、聊天圆环 |
| `quotaRadarState` | 公开额度估计和辅助重置信息 | 额度补充信息、重置提示 fallback |
| `tiboRadarState` | 公开重置信号的解析结果 | 重置状态、概率、上次重置时间 |
| `modelRadarState` | 推荐模型数据、排序结果和 freshness | 顶部推荐、推荐弹窗、Home badge |
| `activeBackgroundVariantId` | 当前背景 variant | 背景图、颜色 token、切换按钮 |
| `experienceRuntimeState` | 模板、路由、工作、额度、重置、推荐和 overlay 的统一快照 | 后续流程 ViewModel、状态切换和主题联动 |
| `window[STATE_KEY]` | 注入实例、observer、timer 和 cleanup 句柄 | 重注入、卸载、verify、防重复注入 |

这样做的结果是：聊天圆环不重新计算一份额度，重置条不把公开信号冒充 Codex 官方状态，主题切换也不会在不同路由保存多份颜色状态。

## 四、功能实现说明

### 1. 皮肤核心与注入

入口是 `Start-Dream-Skin.ps1`，实际工作由 `start-dream-skin.ps1` 和 `injector.mjs` 完成。

实现步骤：

1. 检查已注册的 Microsoft Store Codex、Node.js 版本和 loopback 端口。
2. 在 `%LOCALAPPDATA%\CodexDreamSkin` 建立运行态目录，保存主题副本、状态和日志，不把这些内容写进仓库。
3. 读取 `theme.json`、`selectors.json`、`dream-skin.css`、`renderer-inject.js` 和主题图片。
4. 校验图片必须位于当前主题目录内，并限制格式、大小和 variant 数量。
5. 生成一个带修订号的 payload，通过 `127.0.0.1` 的 CDP 注入。
6. 页面内使用 `adoptedStyleSheets`；不支持时使用受控的 `<style>` fallback。
7. 用 `window[STATE_KEY]` 保存当前实例，旧实例先 cleanup，避免重复节点和重复定时器。

关键实现：`injector.mjs` 的 `--once`、`--watch`、`--verify`、`--remove`、`--self-test` 和 `--check-payload`；`renderer-inject.js` 的 `ensure`、`cleanup` 和 `window[STATE_KEY]`。

### 2. 推荐模型

推荐模型是一个独立的皮肤增强层，不替换 Codex 的模型数据源。

实现流程：

1. 在 `app://` 页面通过 injector 的 Node public-fetch binding 读取公开接口，旧环境回退到 bridge/直连；依次尝试 metrics、`/api/intelligence-efficiency` 和静态 JSON。
2. 对模型名、家族、effort、IQ、平均价格和更新时间做规范化。
3. 按模型家族和 effort 排序，并用 `IQ / (1 + average_price)` 计算性价比排序。
4. 生成顶部推荐按钮、弹窗和 Home 推荐 badge。
5. 用户点击推荐卡时，调用 `tryNativeModelSelection`，只尝试点击 Codex 已经渲染的原生模型选项。
6. 网络失败时保留内存状态或读取 `localStorage` 的最近可信缓存，缓存最多 7 天并标记为 cached；没有缓存时显示 unavailable，不内置过期模型与价格快照。

主要入口：`modelRadarPoint`、`modelRadarSortedPoints`、`modelRadarRecommendations`、`ensureModelRadar`、`updateModelRadarView`、`tryNativeModelSelection`、`refreshModelRadar`。

动态节点：`codex-model-radar-pill`、`codex-model-radar-popover`。

### 3. 额度显示

额度模块是其他额度 UI 的唯一数据源。

数据优先级：

```text
Codex Electron bridge: /wham/usage
        │ 成功
        ▼
normalizeQuotaState → live quotaState
        │ 失败
        ├─ codex:quota-update 事件
        ├─ Codex 页面已有额度 DOM
        ├─ localStorage 缓存
        └─ public radar / local cache estimate
```

实现流程：

1. 通过 `window.electronBridge.sendMessageFromView` 请求 `/wham/usage`，只等待对应 `requestId` 的响应。
2. `parseQuotaNumber`、`parseQuotaPercent`、`quotaWindowKind` 和 `normalizeQuotaWindow` 把月、周、5 小时等窗口统一成 `windows[]`。
3. `stabilizeQuotaState` 防止暂时异常的数据覆盖更可信的旧状态。
4. `writeQuotaCache` 保存最后可信结果，并记录 `live`、`cached`、`stale`、`loading` 或 `unavailable` freshness。
5. `ensureQuota` 渲染顶部额度条、详情弹窗和聊天输入区共享的状态。

主要入口：`readQuotaFromCodexBridge`、`readQuotaFromDom`、`normalizeQuotaState`、`refreshQuotaFromBridge`、`ensureQuota`、`quotaDiagnostics`。

动态节点：`codex-quota-pill`、`codex-quota-popover`、`codex-quota-panel`、`codex-quota-composer-portal`。

### 4. 主题切换

主题切换分为“选择器内切换四个选项”和“切换保存的整套主题”。选择器的四项是 `garden` 清新绿色、`sakura-coast` 樱花海岸、`doraemon` 哆啦A梦，以及 `native` 原生主题。

同主题 variant：

1. `theme.json` 声明 `backgroundVariants`、图片、颜色 token、焦点、安全区和可选的 `experience` 模板契约。
2. `applyTheme` 把颜色写入 `--ds-*`，把背景和构图参数写入 `--dream-*` / `data-dream-art-*`。
3. `setActiveBackgroundVariant` 更新 `activeBackgroundVariantId`、根节点属性和背景图，并写入兼容 key `codex-dream-background-variant`。
4. `themeOptions` 合并两个背景 variant 和一个原生选项；`setActiveThemeOption` 写入主 key `codex-dream-theme-selection`，再由 `ensureBackgroundSwitcher` 维护顶部胶囊式菜单，不重启 Codex。
5. 选择 `native` 时，运行时只移除本项目的 CSS 变量、动态节点和轮询任务，保留注入器和主题菜单；因此切回皮肤不需要重新启动 Codex。

整套主题切换：

1. `switch-dream-skin.ps1 -ImagePath` 复制图片并生成 saved theme。
2. `-List` 列出 `%LOCALAPPDATA%\CodexDreamSkin\themes` 下的主题。
3. `-SavedThemeId` 将已保存主题复制到 `active-theme`。
4. `-Reapply` 对当前窗口执行一次 CDP 热注入，不改输入内容、不重启 Codex。

制作新皮肤时通常只复制 `windows/assets/presets/preset-linzi/`，修改 `theme.json` 和图片，不复制 `renderer-inject.js`。

### 5. 聊天额度圆环与重置提示

这部分复用额度模块的 `quotaState`，不单独访问账户额度。

实现流程：

1. `ensureQuotaComposerPortal` 创建 body-level portal，避免详情条参与 composer 正常布局。
2. `ensureComposerQuotaRing` 创建输入框底部的原生风格圆环，并保留 `aria`、键盘焦点和点击 hit target。
3. 点击或 Tab 聚焦圆环时，`codex-quota-ring-details` 以项目选择器风格的胶囊条悬浮在输入框上沿；它和 composer 只做视觉重合，不改变输入框高度。
4. 重置提示使用 `quotaResetRadarSnapshot` 合并公开额度 radar 和 `tiboRadarState`，生成 `data-outcome`、`data-level`、`data-freshness`。
5. `codex-quota-reset-details` 显示重置状态、概率、上次重置、Tibo 更新时间和 Reset 信号；公开信号只表示辅助概率，不宣称为 Codex 官方通知。
6. `positionQuotaRingSurface`、resize/scroll 监听器和失焦处理保证悬浮条跟随输入框；点击外部、Escape 或 blur 后关闭。
7. `removeQuotaDom` 和总 `cleanup` 清理 portal、DOM、监听器、timer 和 object URL。

动态节点：

```text
codex-quota-composer-portal
├─ codex-quota-ring-composer
├─ codex-quota-ring-details
├─ codex-quota-reset-composer
└─ codex-quota-reset-details
```

### 6. 背景、角色和整体视觉

视觉层由 `dream-skin.css` 负责，运行层只提供状态和 token：

- 页面背景、背景渐变和安全区使用主题的图片与 `--dream-*` 变量；
- 侧边栏头部、Codex 标识、角色半身图和聊天陪伴角色使用主题声明的素材；
- 头部推荐模型、额度条和背景切换按钮保留原生交互，只调整外观；
- 聊天正文区域使用渐变和局部透明度，让壁纸逐渐融入，同时保持正文对比度；
- 输入框使用不透明灰白底和主题边框，避免背景纹理穿透文字；
- 通过 `data-dream-skin`、`data-dream-shell`、`data-dream-route` 和 `data-dream-*` 属性区分 home、thread、settings 与 overlay。

换颜色、壁纸或角色时优先改 `theme.json` 和资源，不在运行时脚本里硬编码另一套主题。

## 五、生命周期、容错和清理

- `rootObserver`：根节点、主题模式和基础 shell 出现后重新应用。
- `routeObserver`：路由和内容替换后重新维护可选 UI。
- quota/model/Tibo timer：按主题配置刷新，失败时使用指数退避和缓存。
- `visibility` / `resize` / `scroll`：页面不可见时降低维护成本，悬浮条在窗口变化后重新定位。
- `cleanup`：移除样式、动态节点、事件监听器、observer、timer、portal、缓存的 object URL 和全局状态。

任何 `ensure*` 函数都必须幂等：重复执行只能复用或修复同一个节点，不能创建第二个同 ID 节点。

## 六、日常使用命令

```powershell
# 启动并注入
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-Dream-Skin.ps1

# 已打开 Codex 时明确允许重启
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-Dream-Skin.ps1 -RestartExisting

# 查看已保存主题
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\windows\scripts\switch-dream-skin.ps1 -List

# 从图片生成并热更新主题
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\windows\scripts\switch-dream-skin.ps1 -ImagePath .\new-background.png -Name "My Skin"

# 不重启 Codex，重新应用当前主题
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\windows\scripts\switch-dream-skin.ps1 -Reapply

# 恢复官方外观
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\windows\scripts\restore-dream-skin.ps1 -PromptRestart
```

## 七、发布前验证

```powershell
node .\windows\scripts\injector.mjs --self-test
node .\windows\scripts\injector.mjs --check-payload --theme-dir .\windows\assets
node --check .\windows\assets\renderer-inject.js
node --check .\windows\scripts\injector.mjs
git diff --check
```

启动后再检查：

1. home、thread、settings 和 overlay 路由；
2. 推荐模型可用、缓存和离线状态；
3. 顶部额度条与聊天圆环显示同一份状态；
4. 圆环/重置条打开和关闭前后 composer 高度一致；
5. 背景 variant 切换后颜色、图片和安全区同步；
6. 1280×820、900×650 和高 DPI 下无横向/纵向溢出；
7. `--verify` 返回 `pass=true`，且 `businessClassPollution=0`；选择 `native` 时也属于合法已安装状态，不会被启动器误报失败。

## 八、制作新皮肤的最小流程

```text
复制 preset-linzi
      │
      ▼
修改 theme.json + 图片
      │
      ▼
检查相对路径、尺寸、安全区和颜色对比度
      │
      ▼
check-payload + 启动 + 多路由截图
      │
      ▼
补 docs/skins/<skin-id>.md
```

制作新皮肤时按 `docs/skin-authoring.md` 补齐图片和 variant；功能模块的具体入口、DOM ID、配置 key 和不可破坏的行为以 `modules/*/module.json` 为准。

## 九、脱敏和数据边界

- 仓库不保存 API key、Cookie、Bearer token、聊天正文、个人配置和本机绝对路径；
- 运行态只写入 `%LOCALAPPDATA%\CodexDreamSkin`；
- 公开接口只用于读取模型/额度估计和辅助重置信号；
- `/wham/usage` 由 Codex 内部 bridge 处理，本项目不读取或打印凭据；
- 不上传聊天内容、不发送用户输入、不修改 Codex 安装文件；
- 仓库发布由维护者明确授权后执行；运行态目录、日志和本机配置不进入 commit 或 push。
