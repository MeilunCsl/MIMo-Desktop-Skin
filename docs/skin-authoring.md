# 制作新皮肤

## 主题目录契约

每个可加载主题至少包含：

```text
my-theme/
  theme.json
  background.jpg|png|webp
  （可选）其他 variant 图片
```

`theme.json` 的最小形状：

```json
{
  "schemaVersion": 1,
  "id": "my-theme",
  "name": "My Theme",
  "image": "background.jpg",
  "appearance": "auto",
  "colors": {
    "background": "#F1F5F4",
    "panel": "#FFFFFF",
    "panelAlt": "#EAF1EF",
    "accent": "#3F897E",
    "accentAlt": "#8BCB60",
    "secondary": "#72B7A8",
    "highlight": "#4F8F81",
    "text": "#244F4A",
    "muted": "#64837C",
    "line": "#B7D8CF"
  },
  "art": {
    "focusX": 0.5,
    "focusY": 0.5,
    "safeArea": "center",
    "taskMode": "off"
  },
  "quota": {
    "enabled": true,
    "showInHeader": true,
    "showInEnvironment": false,
    "refreshMs": 15000,
    "radar": {
      "refreshMs": 600000,
      "modelRefreshMs": 300000,
      "tiboRefreshMs": 3600000
    }
  },
  "experience": {
    "schemaVersion": 1,
    "id": "my-theme-experience",
    "label": "My workflow template",
    "slots": {
      "sidebar": { "companionRole": "sidebar", "accountRole": "account" },
      "header": { "order": ["theme", "recommendation", "quota"] },
      "chat": { "assistantRole": "assistant" },
      "composer": {
        "companionRole": "composer",
        "ring": "quota",
        "probability": "reset"
      }
    },
    "capabilities": {
      "theme": true,
      "quota": true,
      "recommendation": true,
      "characters": true,
      "ring": true,
      "probability": true
    },
    "states": {
      "idle": { "sidebarPose": "idle", "chatPose": "idle", "composerPose": "ready" },
      "working": { "sidebarPose": "working", "chatPose": "working", "composerPose": "working" },
      "complete": { "sidebarPose": "complete", "chatPose": "complete", "composerPose": "ready" },
      "error": { "sidebarPose": "error", "chatPose": "error", "composerPose": "error" },
      "offline": { "sidebarPose": "offline", "chatPose": "offline", "composerPose": "offline" }
    }
  }
}
```

`experience` 是第一阶段的模板契约：它只声明槽位、能力和流程姿态，不携带额度数值、推荐结果或概率结论。旧主题可以省略它，注入器会生成兼容的默认契约。

如果主题图片旁边存在同名 `.webp`，运行时会优先加载 WebP；没有 WebP 时自动回退到 `theme.json` 中声明的 PNG/JPEG。这样可以保留可编辑原图，同时减少首次切换的传输和解码成本。

## 安全和可读性要求

- 颜色必须让正文、占位符、状态文字和焦点环在真实壁纸上清晰；
- `focusX/focusY` 只改变背景构图，不使用 CSS 拉伸角色图；
- 角色素材保持原始宽高比，使用裁切而不是非等比缩放；
- 不用 `backdrop-filter` 做大面积遮罩；
- 不覆盖原生按钮的 hit target、键盘焦点和 `aria` 状态；
- 不把个人姓名、仓库地址、本机路径、截图或聊天正文放入主题配置。

## 检查命令

```powershell
node .\windows\scripts\injector.mjs --check-payload --theme-dir .\windows\assets\presets\my-theme
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\windows\scripts\switch-dream-skin.ps1 -List
```

如果要把新主题做成仓库默认主题，先在 `presets` 中完成检查，再替换 `windows/assets/theme.json` 的默认资源引用。
