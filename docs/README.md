# 维护与发布说明

从整体理解软件时，先看 [功能实现总览](feature-map.md)；本页补充运行态目录、维护优先级和发布前检查。

## 运行链路

```text
Start-Dream-Skin.ps1
  └─ windows/scripts/start-dream-skin.ps1
      ├─ 检查 Windows Codex 与 Node.js
      ├─ 创建 %LOCALAPPDATA%\CodexDreamSkin 运行态目录
      ├─ 复制当前主题到 active-theme
      ├─ 用 127.0.0.1 CDP 启动或连接 Codex
      └─ windows/scripts/injector.mjs
          ├─ 读取 selectors.json、theme.json、dream-skin.css
          ├─ 读取 renderer-inject.js 和声明的图片素材
          ├─ 组装单次注入 payload
          └─ 通过 adopted stylesheet + renderer runtime 应用皮肤
```

MiMo 路径见 `mimo/README.md`：入口 `mimo/Start-MiMo-Skin.ps1`，注入器 `mimo/scripts/inject-skin.mjs`，状态目录 `%LOCALAPPDATA%\MiMoDreamSkin`。

## 运行态目录

运行态默认在 `%LOCALAPPDATA%\CodexDreamSkin`，不属于 Git 仓库：

- `active-theme/`：当前生效主题的数据与图片，不保存 CSS/JS 副本；
- `themes/`：通过主题切换脚本保存的主题；
- `images/`：用户选择的主题图片；
- `state.json`：受校验的 Codex、Node、端口、唯一源码根目录和代码哈希；
- `paused`：暂停皮肤的标记；
- `injector.log`、`verify.log`：运行诊断日志。

## 主题修改的优先级

1. 先改 `theme.json` 的名称、文字、颜色、背景 variant 和刷新间隔；
2. 再替换主题目录内的图片，保持相对路径；
3. 只在需要改变布局或交互外观时修改 `dream-skin.css`；
4. 只有当 Codex DOM 契约变化或数据源变化时才修改 `renderer-inject.js` / `injector.mjs`。

## 发布前最小检查

```powershell
node .\windows\scripts\injector.mjs --self-test
node .\windows\scripts\injector.mjs --check-payload --theme-dir .\windows\assets
node --check .\windows\scripts\injector.mjs
git diff --check
git status --short
```

启动 Codex 后再执行一次 `--verify`，确认 `pass=true`、`businessClassPollution=0`，并检查页面没有横向或纵向溢出。

## 维护原则

- 保持原生输入框、侧栏、菜单、模型选择和系统文件选择器的交互；
- 新 CSS 优先使用 `--ds-*` 颜色 token 和 `--dream-*` 资源 token；
- 不依赖完整 hashed class 名；优先使用 `data-testid`、语义角色和稳定前缀；
- 所有动态节点都必须可幂等重建、可清理、可通过 Escape 或失焦关闭；
- 不在皮肤仓库保存用户配置、聊天内容、Cookie、访问令牌或本机截图。
