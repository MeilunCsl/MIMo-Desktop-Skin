# 脱敏、数据来源与安全边界

## 已脱敏内容

- README、模块文档和 QA 文档不包含维护者姓名、个人 GitHub 仓库地址、邮箱、桌面路径或缓存路径；
- 回归示例中的真实用户名和本机路径使用通用描述；
- 运行态路径只使用 Windows 环境变量，例如 `%LOCALAPPDATA%`，不写入具体用户目录；
- `tmp/`、`design-qa.md`、运行日志和本地状态均由 `.gitignore` 排除，不属于发布 payload。

## 会读取什么

| 来源 | 用途 | 是否包含凭据 |
|---|---|---|
| Codex Electron fetch bridge 的 `/wham/usage` | 读取当前额度窗口、剩余比例、重置时间 | 由 Codex 内部 bridge 处理；本项目不保存凭据 |
| `codexradar.com` 公开页面/API | 推荐模型数据和公开额度估计 | 否，公开 GET |
| 可选的公开重置信号页面 | 计算重置提示的辅助信号 | 否；只读取公开内容 |
| `localStorage` | 缓存额度、模型和背景 variant | 只在本机浏览器配置文件内 |

## 不会做什么

- 不读取或上传聊天正文；
- 不发送用户输入、文件内容或项目文件；
- 不写入 Codex 安装目录、`WindowsApps` 或 `app.asar`；
- 不把 `api key`、Cookie、Bearer token、账户配置或本机状态写入仓库；
- 不向远程仓库执行 push。

## 发布前脱敏检查

```powershell
# 使用 ripgrep 或等价工具扫描源码（排除二进制与 .git）
rg -n -i --hidden -g '!.git/**' -g '!*.png' -g '!*.jpg' -g '!*.jpeg' -g '!*.webp' -g '!*.ico' `
  "api[_-]?key|secret|password|bearer|cookie|C:\\Users\\|E:\\[A-Za-z]|Cache\\Temp" .
```

命中公开数据源 URL 或“禁止保存凭据”类说明不等于泄露凭据；仍应在 README 中说明来源、用途和失败时的 fallback 行为。
