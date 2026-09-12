# 皮肤架构

## 三层结构

```text
主题数据层
  theme.json + background image + character assets
        │
        ▼
注入编排层
  injector.mjs + selectors.json
        │
        ▼
渲染运行层
  renderer-inject.js + dream-skin.css
```

### 主题数据层

`theme.json` 只描述皮肤，不负责查找 DOM。它包含文字、颜色、背景 variant、艺术图安全区、刷新间隔和可选的 `experience` 模板契约，不保存从公开数据源抓取的额度、价格或更新时间快照。图片必须是主题目录内的相对路径，不能使用绝对路径、链接或目录外资源。运行时会把模板放入统一 `experienceStore`，但数据与视觉仍保持分离。

### 注入编排层

`injector.mjs` 检查主题和图片、读取选择器契约、生成 data URL，并把模板占位符替换成单个 payload。它还负责 CDP loopback 校验、版本/修订号、暂停、卸载、截图和 verify。

### 渲染运行层

`renderer-inject.js` 在 Codex 页面中运行，负责：

- 根据 route/shell appearance 设置 `data-dream-*` 属性；
- 将主题颜色写入 `--ds-*`，将图片和文字写入 `--dream-*`；
- 通过 `experienceStore` 汇总模板、路由、工作、额度、重置、推荐和 overlay 状态，供后续流程 ViewModel 消费；顶部主题、额度、推荐也按 `experience.slots.header.order` 排列，侧边栏角色按 `experience.slots.sidebar` 标记，助手回复按 `experience.slots.chat` 标记并同步 `chatPose`，输入框表面/圆环/概率按 `experience.slots.composer` 标记并同步 `composerPose`；
- 幂等维护推荐模型、额度、背景切换和聊天圆环节点；
- 监听有限范围的 route、header、composer 和 visibility 变化；
- cleanup 时移除节点、变量、观察器、定时器和 object URL。

`dream-skin.css` 只负责视觉呈现和几何约束。动态数据和交互不要复制进 CSS。

## 模块边界

`modules/` 目录按功能记录每个运行模块的入口、状态、DOM ID、数据源和可改动项（`module.json`）。由于 Codex 当前需要单次 payload，这些是模块契约，不是被浏览器直接 import 的多个脚本。后续若拆分 JS，应保持这些入口和状态名称不变。

完整的启动链路、功能实现、共享状态、容错和清理说明见 [功能实现总览](feature-map.md)。

## 换皮最小改动面

制作另一套颜色/壁纸/角色时，通常只需要：

1. 复制 `windows/assets/presets/preset-linzi/` 为新的 preset 目录；
2. 修改其中的 `theme.json` 和图片；
3. 需要改变全局当前皮肤时，再更新 `windows/assets/theme.json`；
4. 运行 `switch-dream-skin.ps1 -List` / `-SavedThemeId` 或 `-Reapply`。

只有 DOM 结构、数据来源或交互契约改变时，才需要碰运行时脚本。
