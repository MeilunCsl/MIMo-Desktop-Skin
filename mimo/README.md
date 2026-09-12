# MiMo Dream Skin

把「樱花海岸」主题应用到 Xiaomi MiMo 桌面版。细节见仓库根 [README.md](../README.md)。

## 命令

```powershell
# 仓库根
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1 -Diagnose
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo.ps1 -Revert

# 本目录
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo-Skin.ps1 -List
powershell -NoProfile -ExecutionPolicy RemoteSigned -File .\Start-MiMo-Skin.ps1 -Theme sakura-coast
node .\scripts\inject-skin.mjs --theme sakura-coast
```

## 主题字段

`assets/themes/sakura-coast.json`：

| 字段 | 作用 |
|---|---|
| `image` | 背景插画（相对 `mimo/`） |
| `colors` | 10 个语义色 |
| `art` | `focusX` / `focusY` / `safeArea` |
| `glass` | 面板不透明度 + `blur` |

## 状态

`%LOCALAPPDATA%\MiMoDreamSkin\state.json`、`launcher.log`。

## 边界

- 不读取应用 userData 里的本地 API 凭据
- CDP 只监听 `127.0.0.1`
- X 公开动态仅作参考信号，非官方通知
