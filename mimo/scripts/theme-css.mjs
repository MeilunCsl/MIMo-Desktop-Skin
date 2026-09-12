/**
 * Dream Skin → MiMo token composer
 * ---------------------------------------------------------------------------
 * 把 Dream Skin 的语义配色（background/panel/panelAlt/accent/accentAlt/
 * secondary/highlight/text/muted/line）合成为 MiMo 的设计 token 覆盖层。
 *
 * 为什么不用一份静态 CSS：主题是数据（theme.json），不是代码。
 * 合成在运行时做，加主题只需加一个 JSON，不会产生"生成的 CSS 被手改后又被覆盖"
 * 这类问题。
 */

const rgba = (hex, a) => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const alpha = Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${v.slice(0, 6)}${alpha}`;
};

const lighten = (hex, amt) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(c + (255 - c) * amt));
  return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('');
};

/**
 * @param {object} theme  mimo-dream-skin-theme/1
 * @param {string} bgVar  'url("data:image/webp;base64,...")'
 */
export function composeThemeCss(theme, bgVar) {
  const c = theme.colors;
  const g = theme.glass ?? {};
  const P = {
    panel: g.panel ?? 0.18,
    sidebar: g.sidebar ?? 0.14,
    main: g.main ?? 0.10,
    composer: g.composer ?? 0.68,
    blur: g.blur ?? 4,
  };
  const art = theme.art ?? { focusX: 0.5, focusY: 0.5 };

  // 面板直接用主题给的 panel 色，不做提亮 —— 提亮会把插画洗得更白
  const panel = c.panel;
  const panelAlt = c.panelAlt;

  const tokens = {
    /* 底层：让 #app 的插画透出来 */
    '--color-bg': 'transparent',
    '--color-background': 'transparent',

    /* 主要面板 */
    '--color-main-bg': rgba(panel, P.main),
    '--color-panel': rgba(panel, P.panel),
    '--color-card': rgba(panel, 0.78),
    '--color-popover': rgba(panel, 0.88),
    '--color-elevated-card': rgba(panel, 0.88),
    '--color-settings-card': rgba(panel, 0.58),
    '--color-settings-content': rgba(panel, 0.52),
    '--color-settings-nav': rgba(panel, 0.42),
    '--color-set-card': rgba(panel, 0.58),
    '--color-set-line': rgba(c.line, 0.35),
    '--color-settings-line': rgba(c.line, 0.35),
    '--color-right-panel-page-bg': rgba(panel, P.panel),
    '--color-sunken': rgba(panelAlt, 0.55),

    /* 侧栏：更透，让插画透出来 */
    '--color-side': rgba(panelAlt, P.sidebar),
    '--color-side-glass': rgba(panelAlt, P.sidebar),
    '--color-side-hover': rgba(c.accent, 0.12),
    '--color-side-sel': rgba(c.accent, 0.2),
    '--color-side-active': rgba(c.accent, 0.2),
    '--color-side-item': c.muted,
    '--color-sidenav-fg': c.text,

    /* 文字 */
    '--color-txt': rgba(c.text, 0.92),
    '--color-txt-strong': c.text,
    '--color-mut': c.muted,
    '--color-dim': rgba(c.muted, 0.62),
    '--color-icon': c.muted,
    '--color-topbar-icon': rgba(c.text, 0.85),
    '--color-foreground': rgba(c.text, 0.92),
    '--color-muted-foreground': c.muted,

    /* 分隔线 */
    '--color-line': rgba(c.line, 0.85),
    '--color-line-soft': rgba(c.line, 0.5),
    '--color-line-strong': c.line,
    '--color-line-warm': rgba(c.line, 0.7),
    '--color-input-border': rgba(c.line, 0.7),
    '--color-btn-border': c.line,
    '--color-border': rgba(c.line, 0.85),

    /* 输入区 */
    '--color-composer-fg': c.muted,
    '--color-composer-input': c.text,
    '--color-composer-placeholder': rgba(c.muted, 0.7),
    '--color-input-bg': rgba(panel, P.composer),
    '--color-composer-surface': rgba(panel, P.composer),
    '--color-send': c.accent,
    '--color-send-fg': '#ffffff',
    '--color-send-empty': rgba(c.muted, 0.5),
    '--color-composer-tray-bg': rgba(panelAlt, 0.8),

    /* 对话与代码 */
    '--color-bubble': rgba(panelAlt, 0.9),
    '--color-code-bg': rgba(panelAlt, 0.9),
    '--color-code-fg': c.text,
    '--color-text-selection': rgba(c.secondary, 0.35),
    '--color-selection-mark': c.highlight,

    /* 浮层 */
    '--color-menu-active': rgba(c.accent, 0.16),
    '--color-menu-hover': rgba(c.accent, 0.1),
    '--color-menu-glass': rgba(panel, 0.92),

    /* 滚动条 */
    '--color-scrollbar-thumb': rgba(c.text, 0.18),
    '--color-scrollbar-thumb-hover': rgba(c.text, 0.3),

    /* 强调 */
    '--color-accent': c.accent,
    '--color-accent-2': c.accentAlt,
    '--color-link': c.accent,
    '--color-blue': c.secondary,
    '--color-badge-orange-bg': rgba(c.accentAlt, 0.16),
    '--color-badge-orange-fg': c.accentAlt,
    '--color-primary': c.text,
    '--color-switch-on': c.accent,
    '--color-np-btn-bg': rgba(panel, 0.92),
    '--color-switch-thumb-checked': '#ffffff',
    '--color-upgrade-bg': rgba(c.accent, 0.18),
    '--color-upgrade-fg': c.accent,
  };

  const skinVars = Object.entries(tokens)
    .map(([k, v]) => `  ${k.replace('--color-', '--skin-')}: ${v};`)
    .join('\n');

  const projection = Object.keys(tokens)
    .map((k) => `  ${k}: var(--skin-${k.slice(8)}) !important;`)
    .join('\n');

  // 插画上的薄浆。刻意压得很低——面板已经够白了，再叠厚浆插画就看不见了。
  const scrim = rgba(c.background, 0.02);

  // rgb 三元组，供 rgb(var(--x) / .12) 这类带 alpha 的合成使用
  const triplet = (hex) => {
    const h = hex.replace('#', '');
    const v = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
    const n = parseInt(v.slice(0, 6), 16);
    return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
  };

  return `/* =============================================================================
   MiMo Dream Skin — theme: ${theme.label} (${theme.id})
   由 scripts/theme-css.mjs 从 assets/themes/${theme.id}.json 合成。
   配色来自 Dream Skin 原始主题，勿手改（本文件是运行时生成的字符串）。
   ============================================================================= */

/* 0. rgb 三元组 —— 供带 alpha 的强调色叠加使用 */
:root {
  --ds-bg-rgb:     ${triplet(c.background)};
  --ds-panel-rgb:  ${triplet(c.panel)};
  --ds-panel2-rgb: ${triplet(c.panelAlt)};
  --ds-text-rgb:   ${triplet(c.text)};
  --ds-muted-rgb:  ${triplet(c.muted)};
  --ds-accent-rgb: ${triplet(c.accent)};
  --ds-accent2-rgb:${triplet(c.accentAlt)};
  --ds-line-rgb:   ${triplet(c.line)};
  --ds-glass-blur: ${P.blur}px;
}

/* 1. 主题值（只声明在 :root，随主题解析一次） */
:root {
${skinVars}
}

/* 2. 投射到 MiMo 的 token —— 必须 !important，
      因为 MiMo 在 #app.plat-win32 / .auto-view 里重新声明了同名 token。 */
:root,
:root * {
${projection}
}

/* 3. 墙纸：文档级铺图 */
:root[data-mimo-skin-bg="on"] {
  background-image: linear-gradient(${scrim}, ${scrim}), ${bgVar} !important;
  background-size: cover, cover !important;
  background-position: center, ${(art.focusX * 100).toFixed(1)}% ${(art.focusY * 100).toFixed(1)}% !important;
  background-repeat: no-repeat, no-repeat !important;
  background-attachment: fixed, fixed !important;
}

/* 4. 主页面：低透明度、无磨砂（用户明确要求） */
main.relative.flex.min-w-0 {
  background-color: rgb(var(--ds-panel-rgb) / ${P.main}) !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
}
header.chat-header {
  background-color: rgb(var(--ds-panel-rgb) / ${Math.min(0.55, P.panel + 0.08).toFixed(2)}) !important;
  backdrop-filter: none !important;
}
aside[class*="bg-side-glass"] {
  background-color: rgb(var(--ds-panel2-rgb) / ${P.sidebar}) !important;
  backdrop-filter: none !important;
}
/* 会话滚动区、主内容容器：不留白底 */
main [class*="overflow-y"],
main [class*="overflow-auto"],
main .relative.flex-1,
main > div {
  background-color: transparent !important;
}

/* 设置弹层：真玻璃 —— 更透 + 更重磨砂 */
#settings-overlay {
  background: rgb(var(--ds-text-rgb) / .08) !important;
  backdrop-filter: blur(2px) !important;
}
.settings-full {
  background: rgb(var(--ds-panel-rgb) / .52) !important;
  background-color: rgb(var(--ds-panel-rgb) / .52) !important;
  backdrop-filter: blur(28px) saturate(1.15) !important;
  box-shadow: 0 20px 60px rgb(var(--ds-text-rgb) / .18) !important;
  border: 1px solid rgb(255 255 255 / .45) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
}
aside.settings-nav {
  background: rgb(var(--ds-panel-rgb) / .42) !important;
  background-color: rgb(var(--ds-panel-rgb) / .42) !important;
  backdrop-filter: blur(32px) saturate(1.12) !important;
  border-color: rgb(255 255 255 / .35) !important;
}
.settings-full [class*="set-card"],
.settings-full [class*="settings-card"],
.settings-full .set-card {
  background: rgb(var(--ds-panel-rgb) / .58) !important;
  background-color: rgb(var(--ds-panel-rgb) / .58) !important;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .45) !important;
}
.settings-full > div {
  background-color: transparent !important;
  background: transparent !important;
}
#right-panel {
  backdrop-filter: saturate(1.08) blur(var(--ds-glass-blur));
  border-color: var(--color-line);
}
#info-panel {
  backdrop-filter: saturate(1.08) blur(var(--ds-glass-blur));
}

/* 5. 输入区（聊天框）—— 不透明玻璃：磨砂 + 较实底色，保证可读 */
#composer.composer {
  background:
    linear-gradient(180deg, rgb(255 255 255 / .55), transparent 42%),
    linear-gradient(90deg,
      rgb(var(--ds-panel-rgb) / .88),
      rgb(var(--ds-panel-rgb) / .94)) !important;
  backdrop-filter: blur(22px) saturate(1.15) !important;
  box-shadow: 0 12px 36px rgb(var(--ds-text-rgb) / .14),
              inset 0 1px 0 rgb(255 255 255 / .55),
              inset 0 0 0 1px rgb(var(--ds-line-rgb) / .40) !important;
  border-radius: 18px !important;
}
/* 输入框内的分区底色与输入区一致，避免出现第二块白 */
#composer textarea,
#composer-input {
  background: transparent !important;
}
/* 输入区里的按钮：hover 用主题强调色的低透明度叠加 */
#composer button:hover,
main .icon-btn:hover,
aside .icon-btn:hover {
  background: rgb(var(--ds-accent-rgb) / .10) !important;
}
#composer button:active,
main .icon-btn:active {
  background: rgb(var(--ds-accent-rgb) / .16) !important;
}

/* 6. 会话内容：气泡与代码块走主题 token，正文区保持透出插画 */
[class*="markdown"] pre,
[class*="markdown"] code {
  border-color: rgb(var(--ds-line-rgb) / .7) !important;
}
.cb, .md-code, [class*="bg-code-bg"] {
  background-color: rgb(var(--ds-panel2-rgb) / .55) !important;
}

/* 6b. 发送键 / 圆形按钮：跟主题强调色，去掉官方深色块 */
#composer .send-btn,
.send-btn {
  background: rgb(var(--ds-accent-rgb) / .92) !important;
  color: #fff !important;
  box-shadow: 0 6px 16px rgb(var(--ds-accent-rgb) / .28) !important;
}
#composer .send-btn:hover {
  background: var(--color-accent) !important;
  transform: translateY(-1px);
}
#composer .round-btn,
#composer .model-btn,
#composer .perm-btn {
  color: var(--color-txt) !important;
}
#composer .model-btn:hover,
#composer .perm-btn:hover {
  background: rgb(var(--ds-accent-rgb) / .10) !important;
}

/* 6b2. 权限弹层 / 对话框按钮：半透明墙纸上必须有实底和描边 */
.np-btn {
  background: rgb(var(--ds-panel-rgb) / .92) !important;
  color: var(--color-txt-strong) !important;
  border: 1px solid rgb(var(--ds-line-rgb) / .70) !important;
  box-shadow: 0 2px 8px rgb(var(--ds-text-rgb) / .10) !important;
  font-weight: 600 !important;
}
.np-btn:hover {
  background: rgb(var(--ds-panel-rgb) / .98) !important;
  border-color: rgb(var(--ds-accent-rgb) / .45) !important;
}
.np-btn.primary,
.np-btn[data-variant="primary"],
button[type="submit"].np-btn {
  background: rgb(var(--ds-accent-rgb) / .92) !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px rgb(var(--ds-accent-rgb) / .30) !important;
  font-weight: 700 !important;
}
.np-btn.primary:hover {
  background: var(--color-accent) !important;
}
/* 权限/执行确认条：拒绝 / 总是允许 / 主按钮 —— 强制可读 */
[class*="perm"] button:not(.icon-btn):not(.round-btn),
[class*="permission"] button:not(.icon-btn):not(.round-btn),
[class*="allow"] button:not(.icon-btn),
[class*="deny"] button:not(.icon-btn),
[class*="confirm"] button:not(.icon-btn):not(.round-btn),
[class*="approval"] button:not(.icon-btn),
[class*="cmd-bar"] button:not(.icon-btn),
[class*="command"] button:not(.icon-btn):not(.round-btn) {
  background: rgb(var(--ds-panel-rgb) / .96) !important;
  color: var(--color-txt-strong) !important;
  border: 1px solid rgb(var(--ds-line-rgb) / .75) !important;
  box-shadow: 0 2px 10px rgb(var(--ds-text-rgb) / .18) !important;
  font-weight: 650 !important;
  opacity: 1 !important;
}
/* 深色/实心主按钮：提亮成主题蓝，避免墙纸上发黑看不见 */
[class*="perm"] button[class*="primary"],
[class*="perm"] button[class*="solid"],
[class*="permission"] button[class*="primary"],
button.np-btn.primary,
button[class*="btn-primary"],
button[data-variant="primary"],
[class*="perm"] button:not([class*="ghost"]):not([class*="text"]):last-child {
  background: rgb(var(--ds-accent-rgb) / .95) !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px rgb(var(--ds-accent-rgb) / .40) !important;
}
/* 任何近黑填充的按钮一律提亮 */
button {
  /* 仅在检测到近黑背景时由下方规则覆盖，避免误伤全部按钮 */
}

/* 6b3. 开关：轨道/滑块在玻璃底上要看得清 */
[role="switch"],
[class*="switch"]:not(.ctx-hud):not(.mimo-quota-ring) {
  --color-switch-on: var(--color-accent);
  --color-switch-thumb-checked: #fff;
}
[role="switch"][data-state="checked"],
[role="switch"][aria-checked="true"],
[class*="switch"][data-state="checked"] {
  background-color: rgb(var(--ds-accent-rgb) / .88) !important;
  border-color: transparent !important;
}
[role="switch"][data-state="unchecked"],
[role="switch"][aria-checked="false"],
[class*="switch"][data-state="unchecked"] {
  background-color: rgb(var(--ds-muted-rgb) / .28) !important;
  border: 1px solid rgb(var(--ds-line-rgb) / .55) !important;
}
[role="switch"] > [data-state],
[role="switch"] > span:last-child,
[class*="switch-thumb"],
[class*="switch"] > span {
  box-shadow: 0 1px 3px rgb(var(--ds-text-rgb) / .25) !important;
}
/* 设置里的开关（托盘显示等） */
.settings-full [role="switch"],
.settings-full button[class*="switch"] {
  box-shadow: 0 1px 4px rgb(var(--ds-text-rgb) / .20) !important;
}

/* 对话框壳：避免整块洗白导致按钮隐形 */
[role="dialog"],
[role="alertdialog"],
[class*="overlay"][class*="dialog"],
[class*="modal"] {
  color: var(--color-txt-strong) !important;
}

/* 确认/删除等原生弹窗：必须接近实心，否则叠在聊天正文上读不清。
   排除皮肤自带的额度浮层（也挂了 role=dialog）。 */
:is([role="dialog"], [role="alertdialog"]):not(.mimo-quota-popover):not(.mimo-earning) {
  background:
    linear-gradient(160deg, rgb(255 255 255 / .22), transparent 46%),
    rgb(var(--ds-panel-rgb) / .94) !important;
  background-color: rgb(var(--ds-panel-rgb) / .94) !important;
  border: 1px solid rgb(255 255 255 / .50) !important;
  border-radius: 14px !important;
  box-shadow:
    0 20px 50px rgb(var(--ds-text-rgb) / .20),
    inset 0 1px 0 rgb(255 255 255 / .42) !important;
  backdrop-filter: blur(22px) saturate(1.12) !important;
  -webkit-backdrop-filter: blur(22px) saturate(1.12) !important;
}

/* 常见模态遮罩：压暗底下聊天，让确认框自己站得住 */
[class*="overlay"]:has(:is([role="dialog"], [role="alertdialog"])),
[class*="overlay"]:has([class*="modal"]:not([class*="menu"])) {
  background-color: rgb(var(--ds-text-rgb) / .28) !important;
  backdrop-filter: blur(2px) !important;
  -webkit-backdrop-filter: blur(2px) !important;
}

[role="dialog"] button:not(.icon-btn):not(.round-btn),
[role="alertdialog"] button:not(.icon-btn):not(.round-btn),
[class*="modal"] button:not(.icon-btn):not(.round-btn) {
  /* 兜底：无特殊类的对话框按钮给描边，保证可见 */
  border-color: rgb(var(--ds-line-rgb) / .50);
}

/* 会话悬停预览（Radix tooltip）：原生 bg-bg 被皮肤设成 transparent，必须实心 */
[data-radix-popper-content-wrapper] > div:has([data-convo-tip-project]),
[data-radix-popper-content-wrapper] > div:has(> [role="tooltip"]):not(:has([role="menu"])) {
  background:
    linear-gradient(160deg, rgb(255 255 255 / .22), transparent 46%),
    rgb(var(--ds-panel-rgb) / .94) !important;
  background-color: rgb(var(--ds-panel-rgb) / .94) !important;
  border-color: rgb(var(--ds-line-rgb) / .55) !important;
  box-shadow:
    0 16px 40px rgb(var(--ds-text-rgb) / .18),
    inset 0 1px 0 rgb(255 255 255 / .42) !important;
  backdrop-filter: blur(22px) saturate(1.12) !important;
  -webkit-backdrop-filter: blur(22px) saturate(1.12) !important;
}
[data-radix-popper-content-wrapper] > div:has([data-convo-tip-project]) .text-dim,
[data-radix-popper-content-wrapper] > div:has([data-convo-tip-project]) [class*="text-11"] {
  color: var(--color-mut) !important;
}

/* spine 进度条悬停预览卡：同样叠在聊天上，必须实心 */
.spine-preview,
.spine-preview.show {
  background:
    linear-gradient(160deg, rgb(255 255 255 / .24), transparent 48%),
    rgb(var(--ds-panel-rgb) / .94) !important;
  background-color: rgb(var(--ds-panel-rgb) / .94) !important;
  border: 1px solid rgb(var(--ds-line-rgb) / .55) !important;
  border-radius: 14px !important;
  box-shadow:
    0 16px 40px rgb(var(--ds-text-rgb) / .18),
    inset 0 1px 0 rgb(255 255 255 / .42) !important;
  backdrop-filter: blur(22px) saturate(1.12) !important;
  -webkit-backdrop-filter: blur(22px) saturate(1.12) !important;
  color: var(--color-txt) !important;
}
.spine-preview .sp-q,
.spine-preview .sp-q p {
  color: var(--color-txt-strong) !important;
  font-weight: 650 !important;
}
.spine-preview .sp-a,
.spine-preview .sp-a p {
  color: var(--color-txt) !important;
}
.spine-preview .sp-tools [data-slot="tag"] {
  background: rgb(var(--ds-panel2-rgb) / .92) !important;
  color: var(--color-mut) !important;
  border: 1px solid rgb(var(--ds-line-rgb) / .45) !important;
}

/* 6c. 原生上下文圆环：只做轻量上色；旧版百分比标签直接隐藏 */
.ctx-hud-pct {
  display: none !important;
}
.ctx-hud {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: auto !important;
  flex: 0 0 auto !important;
  height: 28px !important;
  min-width: 28px !important;
  padding: 0 4px !important;
  margin-right: 2px !important;
  border-radius: 999px !important;
  cursor: pointer !important;
  color: var(--color-mut) !important;
  background: transparent !important;
  transition: background 160ms ease !important;
}
.ctx-hud:hover {
  background: rgb(var(--ds-accent-rgb) / .10) !important;
}
.ctx-hud-ring {
  width: 18px !important;
  height: 18px !important;
  flex: none !important;
}
.ctx-hud-ring-bg {
  stroke: rgb(var(--ds-muted-rgb) / .22) !important;
}
.ctx-hud-ring-fg {
  stroke: var(--color-accent) !important;
  stroke-linecap: round !important;
}

/* 6d. 额度环 + 工时胶囊 —— 对齐原版 Dream Skin 的 210×28 组合
      规格参考 windows/assets/dream-skin.css 的 #codex-quota-composer-portal。 */
.mimo-earning {
  --mimo-earn-mode-rgb: 64 132 232;
  --mimo-earn-mode-light-rgb: 108 198 255;
  --mimo-earn-progress-duration: 1385ms;
  --mimo-earn-sweep-duration: 4923ms;
  --mimo-earn-dots-duration: 1633ms;
  position: relative !important;
  display: block !important;
  flex: 0 0 210px !important;
  width: 210px !important;
  min-width: 210px !important;
  max-width: 210px !important;
  height: 28px !important;
  min-height: 28px !important;
  max-height: 28px !important;
  margin-left: 4px !important;
  margin-right: 2px !important;
  isolation: isolate !important;
  font-variant-numeric: tabular-nums !important;
  white-space: nowrap !important;
  user-select: none !important;
}

/* 进度轨道（原版粉调玻璃底） */
.mimo-earning-progress {
  position: absolute !important;
  inset: 0 !important;
  display: block !important;
  height: 28px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  border-radius: 14px !important;
  background:
    linear-gradient(180deg, rgb(255 255 255 / .58), transparent 48%),
    linear-gradient(108deg, #fff5fa, #faebf6) !important;
  box-shadow:
    inset 0 1px 1px #ffffffc2,
    0 2px 12px rgb(var(--mimo-earn-mode-rgb) / .16) !important;
  isolation: isolate !important;
  cursor: pointer !important;
}
.mimo-earning-progress:focus-visible {
  outline: 2px solid rgb(var(--ds-accent-rgb) / .56) !important;
  outline-offset: 2px !important;
}
.mimo-earning-progress:hover {
  box-shadow:
    inset 0 1px 1px #ffffffc2,
    0 2px 14px rgb(var(--mimo-earn-mode-rgb) / .28) !important;
}
.mimo-earning-fill {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: inherit !important;
  z-index: 1 !important;
  transform: scaleX(0) !important;
  transform-origin: left center !important;
  transition: transform var(--mimo-earn-progress-duration, 2100ms) linear !important;
  background: linear-gradient(100deg,
    rgb(var(--mimo-earn-mode-rgb) / .64),
    rgb(var(--mimo-earn-mode-light-rgb) / .78)) !important;
}
/* 填充前沿光点（原版 ::before，用 --earning-ratio 定位） */
.mimo-earning-progress::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 auto 0 0 !important;
  transform: translate3d(calc(var(--earning-ratio, 0) * 210px), 0, 0) !important;
  width: 18px !important;
  margin-left: -9px !important;
  border-radius: 50% !important;
  background: radial-gradient(closest-side, #ffffff8c, rgb(var(--mimo-earn-mode-light-rgb) / .28) 55%, transparent 78%) !important;
  z-index: 4 !important;
  pointer-events: none !important;
  will-change: transform !important;
  transition: transform var(--mimo-earn-progress-duration, 900ms) linear !important;
}
/* 扫光（原版 earning-compositor-sweep） */
.mimo-earning-progress::after {
  content: "" !important;
  position: absolute !important;
  top: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  width: 42px !important;
  z-index: 3 !important;
  pointer-events: none !important;
  background: linear-gradient(90deg, transparent, #ffffffe0 42%, rgb(var(--mimo-earn-mode-light-rgb) / .74) 64%, transparent) !important;
  animation: mimo-earn-sweep var(--mimo-earn-sweep-duration, 4200ms) linear infinite !important;
  will-change: transform, opacity !important;
}
.mimo-earning-particles {
  position: absolute !important;
  inset: 0 !important;
  z-index: 2 !important;
  display: block !important;
  width: 210px !important;
  height: 28px !important;
  overflow: hidden !important;
  pointer-events: none !important;
  opacity: 0 !important;
  transition: opacity 400ms ease !important;
}
.mimo-earning[data-earn-state="working"] .mimo-earning-particles {
  opacity: 1 !important;
}

/* 文字层：金额左（避开圆环 35px），信号右 */
.mimo-earning-value {
  position: absolute !important;
  inset: 0 !important;
  display: grid !important;
  grid-template-areas: "amount signal" !important;
  grid-template-columns: max-content minmax(0, 1fr) !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0 10px 0 35px !important;
  gap: 4px !important;
  z-index: 7 !important;
  line-height: 28px !important;
  box-sizing: border-box !important;
  pointer-events: none !important;
  overflow: hidden !important;
}
.mimo-earning-amount {
  grid-area: amount !important;
  justify-self: start !important;
  color: rgb(24 37 83 / .98) !important;
  font-size: 15px !important;
  font-weight: 820 !important;
  line-height: 28px !important;
  letter-spacing: .02em !important;
}
.mimo-earning-amount::before {
  content: none !important;
}
.mimo-earning-signal {
  grid-area: signal !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-self: end !important;
  min-width: 0 !important;
  max-width: 100% !important;
  overflow: hidden !important;
  color: rgb(62 65 143 / .92) !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  line-height: 28px !important;
}
.me-sig-label::after {
  content: "·" !important;
  display: inline-block !important;
  margin: 0 4px !important;
  color: rgb(78 94 168 / .58) !important;
  font-weight: 500 !important;
}
.me-sig-val {
  color: rgb(41 54 126 / .98) !important;
  font-weight: 600 !important;
}
.mimo-earning[data-tibo-level="high"] .me-sig-val {
  color: #c9502f !important;
}
.mimo-earning[data-tibo-level="medium"] .me-sig-val {
  color: #b86e12 !important;
}
.mimo-earning[data-tibo-fresh="stale"] .mimo-earning-signal {
  opacity: .72 !important;
}

/* 顶栏额度 + Tibo 胶囊 —— 对齐原版 #codex-quota-pill */
/* 顶栏额度：去掉胶囊底，只留品牌字 + 进度条 + 百分比（对齐原版） */
.mimo-quota-pill {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  height: 28px !important;
  min-width: 140px !important;
  max-width: 180px !important;
  padding: 0 4px !important;
  margin-right: 4px !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border: none !important;
  color: var(--color-txt-strong) !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  font-variant-numeric: tabular-nums !important;
  white-space: nowrap !important;
  cursor: pointer !important;
  pointer-events: auto !important;
  -webkit-app-region: no-drag !important;
  flex: 0 0 auto !important;
}
.mimo-quota-pill:hover,
.mimo-quota-pill[aria-expanded="true"] {
  background: transparent !important;
  box-shadow: none !important;
}
.mqp-brand {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  flex: 0 0 auto !important;
  color: var(--color-txt) !important;
  font-weight: 650 !important;
}
.mqp-brand svg {
  width: 14px !important;
  height: 14px !important;
}
.mqp-meter {
  position: relative !important;
  display: block !important;
  flex: 1 1 auto !important;
  min-width: 64px !important;
  height: 11px !important;
  border-radius: 4px !important;
  overflow: hidden !important;
  background:
    repeating-linear-gradient(90deg, rgb(var(--ds-muted-rgb) / .11) 0 1px, transparent 1px 18px),
    linear-gradient(180deg, rgb(var(--ds-panel-rgb) / .66), rgb(var(--ds-bg-rgb) / .26)) !important;
  box-shadow:
    inset 0 1px 2px rgb(var(--ds-bg-rgb) / .18),
    0 1px 0 rgb(255 255 255 / .54) !important;
  border: 1px solid rgb(var(--ds-bg-rgb) / .14) !important;
}
.mqp-meter > span {
  position: absolute !important;
  inset: 0 !important;
  border-radius: 3px !important;
  transform-origin: left center !important;
  transition: transform 180ms ease !important;
  background: linear-gradient(90deg,
    rgb(var(--ds-accent-rgb) / .70) 0%,
    rgb(var(--ds-accent-rgb) / .94) 62%,
    rgb(var(--ds-accent-rgb) / .78) 100%) !important;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .38),
    2px 0 7px rgb(var(--ds-accent-rgb) / .24) !important;
}
.mqp-percent {
  flex: 0 0 auto !important;
  min-width: 34px !important;
  text-align: right !important;
  color: var(--color-txt-strong) !important;
  font-size: 11px !important;
  font-weight: 720 !important;
}
.mimo-quota-pill[data-level="warning"] .mqp-meter > span {
  background: linear-gradient(90deg, rgb(var(--ds-accent-rgb) / .55), #d9893c) !important;
}
.mimo-quota-pill[data-level="critical"] .mqp-meter > span {
  background: linear-gradient(90deg, #f0a090, #e87654) !important;
}
.mimo-quota-pill[data-level="unavailable"] {
  opacity: .65 !important;
}

/* 侧栏底部：贴 MiMo 原版账号位（38px 行 / 28px 圆头像），只换文案 */
button[data-account-menu] .msm-quote,
button[data-account-menu] span.msm-quote {
  color: var(--color-txt) !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  line-height: 20px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
button[data-account-menu] .msm-native-avatar,
button[data-account-menu] span.msm-native-avatar {
  width: 40px !important;
  height: 40px !important;
  border: none !important;
  box-shadow: none !important;
  overflow: hidden !important;
  background: transparent !important;
  flex: none !important;
  border-radius: 50% !important;
}
button[data-account-menu] .msm-native-avatar img,
button[data-account-menu] img.avatar-img {
  width: 40px !important;
  height: 40px !important;
  max-width: none !important;
  object-fit: cover !important;
  /* 原图竖构图：对准脸部（上中） */
  object-position: 50% 18% !important;
  border: none !important;
  filter: none !important;
  image-rendering: auto !important;
  transform: none !important;
  border-radius: 50% !important;
}
.msm-quote-in {
  animation: msm-fade-in 320ms ease !important;
}
@keyframes msm-fade-in {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}
/* 兜底注入节点：与原生 settings-row 同规格 */
.mimo-side-muse.settings-row {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  height: 38px !important;
  margin: 6px 0 0 !important;
  padding: 0 8px !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 8px !important;
  width: 100% !important;
}
.mimo-side-muse .msm-avatar {
  width: 32px !important;
  height: 32px !important;
  flex: none !important;
  border-radius: 50% !important;
  overflow: hidden !important;
}
.mimo-side-muse .msm-img {
  width: 32px !important;
  height: 32px !important;
  object-fit: cover !important;
  object-position: 50% 15% !important;
  display: block !important;
}
.mimo-side-muse .msm-quote {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: var(--color-txt) !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
@media (prefers-reduced-motion: reduce) {
  .msm-quote-in {
    animation: none !important;
  }
}
.msm-quote-in {
  animation: msm-fade-in 320ms ease !important;
}
@keyframes msm-fade-in {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .msm-quote-in {
    animation: none !important;
  }
}

/* 顶栏展开详情卡 —— 对齐原版「额度中心 · 重置雷达」 */
.mimo-quota-popover {
  position: fixed !important;
  z-index: 80 !important;
  box-sizing: border-box !important;
  padding: 12px !important;
  border-radius: 16px !important;
  color: var(--color-txt-strong) !important;
  background: rgb(var(--ds-panel-rgb) / .90) !important;
  backdrop-filter: blur(22px) saturate(1.1) !important;
  box-shadow:
    0 18px 50px rgb(var(--ds-text-rgb) / .20),
    inset 0 1px 0 rgb(255 255 255 / .42),
    inset 0 0 0 1px rgb(var(--ds-line-rgb) / .35) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  pointer-events: auto !important;
}
.mqp-head {
  display: flex !important;
  align-items: baseline !important;
  justify-content: space-between !important;
  gap: 8px !important;
  margin-bottom: 10px !important;
  padding: 0 2px !important;
}
.mqp-head-title {
  display: inline-flex !important;
  align-items: baseline !important;
  gap: 6px !important;
  font-size: 13px !important;
  font-weight: 780 !important;
  color: var(--color-txt-strong) !important;
}
.mqp-head-title span {
  color: var(--color-mut) !important;
  font-weight: 500 !important;
}
.mqp-head time {
  color: var(--color-mut) !important;
  font-size: 11px !important;
  font-variant-numeric: tabular-nums !important;
}
.mqp-hero {
  display: grid !important;
  grid-template-columns: auto 1fr auto !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 12px !important;
  border-radius: 14px !important;
  border: 1px solid rgb(var(--ds-line-rgb) / .45) !important;
  background:
    linear-gradient(145deg, rgb(255 255 255 / .38), transparent 52%),
    rgb(var(--ds-panel2-rgb) / .55) !important;
  margin-bottom: 8px !important;
}
.mqp-hero-ring {
  position: relative !important;
  width: 72px !important;
  height: 72px !important;
  flex: none !important;
  display: grid !important;
  place-items: center !important;
}
.mqp-hero-ring svg {
  position: absolute !important;
  inset: 0 !important;
  width: 72px !important;
  height: 72px !important;
}
.mqp-hero-ring circle {
  fill: none !important;
  stroke-width: 11 !important;
  stroke-linecap: round !important;
}
.mqp-hero-track {
  stroke: rgb(var(--ds-muted-rgb) / .18) !important;
}
.mqp-hero-fg {
  stroke: var(--color-accent) !important;
  filter: drop-shadow(0 0 8px rgb(var(--ds-accent-rgb) / .35));
}
.mqp-hero-ring > span {
  position: relative !important;
  z-index: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  line-height: 1.05 !important;
}
.mqp-hero-ring strong {
  font-size: 20px !important;
  font-weight: 820 !important;
  color: var(--color-txt-strong) !important;
}
.mqp-hero-ring small {
  font-size: 10px !important;
  color: var(--color-mut) !important;
}
.mqp-hero-stats {
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  min-width: 0 !important;
}
.mqp-hero-stats > span {
  display: flex !important;
  align-items: baseline !important;
  gap: 8px !important;
}
.mqp-hero-stats small {
  flex: 0 0 52px !important;
  color: var(--color-mut) !important;
  font-size: 11px !important;
}
.mqp-hero-stats strong {
  font-size: 13px !important;
  font-weight: 750 !important;
  color: var(--color-txt-strong) !important;
  font-variant-numeric: tabular-nums !important;
}
.mqp-hero-copy {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-end !important;
  gap: 2px !important;
  text-align: right !important;
  max-width: 96px !important;
}
.mqp-hero-copy span {
  color: var(--color-mut) !important;
  font-size: 11px !important;
}
.mqp-hero-copy strong {
  font-size: 15px !important;
  font-weight: 800 !important;
  color: var(--color-txt-strong) !important;
}
.mqp-hero-copy em {
  font-style: normal !important;
  font-size: 10px !important;
  color: var(--color-mut) !important;
}
.mqp-tibo {
  padding: 10px 12px !important;
  border-radius: 12px !important;
  border: 1px solid rgb(var(--ds-line-rgb) / .45) !important;
  background:
    linear-gradient(145deg, rgb(255 255 255 / .28), transparent 52%),
    rgb(var(--ds-panel2-rgb) / .48) !important;
  margin-bottom: 8px !important;
}
.mqp-tibo-head {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-bottom: 8px !important;
}
.mqp-tibo-head strong {
  font-size: 13px !important;
  font-weight: 780 !important;
  color: var(--color-txt-strong) !important;
}
.mqp-tibo-head a {
  color: var(--color-link) !important;
  font-size: 11px !important;
  margin-right: auto !important;
}
.mqp-tibo-head em {
  font-style: normal !important;
  font-size: 12px !important;
  font-weight: 750 !important;
  color: var(--color-accent) !important;
}
.mqp-tibo-head em[data-level="high"] { color: #c9502f !important; }
.mqp-tibo-head em[data-level="medium"] { color: #b86e12 !important; }
.mqp-tibo-row {
  display: grid !important;
  grid-template-columns: 52px 1fr !important;
  gap: 8px !important;
  margin-bottom: 6px !important;
}
.mqp-tibo-row:last-child {
  margin-bottom: 0 !important;
}
.mqp-tibo-row small {
  color: var(--color-accent) !important;
  font-weight: 700 !important;
  font-size: 11px !important;
}
.mqp-tibo-row p {
  margin: 0 !important;
  color: var(--color-txt) !important;
  line-height: 1.45 !important;
}
.mqp-radar {
  display: grid !important;
  grid-template-columns: 1fr 1fr 1fr !important;
  gap: 6px !important;
}
.mqp-radar > span {
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
  padding: 8px 10px !important;
  border-radius: 10px !important;
  border: 1px solid rgb(var(--ds-line-rgb) / .40) !important;
  background: rgb(var(--ds-panel2-rgb) / .42) !important;
  min-width: 0 !important;
}
.mqp-radar small {
  color: var(--color-mut) !important;
  font-size: 10px !important;
}
.mqp-radar strong {
  font-size: 12px !important;
  font-weight: 750 !important;
  color: var(--color-txt-strong) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.mqp-radar em {
  font-style: normal !important;
  font-size: 10px !important;
  color: var(--color-mut) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* 额度圆环：叠在胶囊左端 —— 对齐原版 28px / #1777cf / halo 呼吸 */
.mimo-quota-ring {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  z-index: 5 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 28px !important;
  min-width: 28px !important;
  height: 28px !important;
  border-radius: 50% !important;
  background: radial-gradient(circle, #f6fbff 0 44%, rgb(238 248 255 / .85) 52%, transparent 66%) !important;
  box-shadow: none !important;
  overflow: visible !important;
  isolation: isolate !important;
  cursor: help !important;
  pointer-events: auto !important;
}
.mimo-quota-ring svg {
  position: absolute !important;
  inset: 0 !important;
  width: 28px !important;
  height: 28px !important;
  overflow: visible !important;
  transform: rotate(-90deg) !important;
  transform-origin: center !important;
  filter: none !important;
}
.mimo-quota-ring circle {
  fill: none !important;
  stroke-width: 21 !important;
  stroke-linecap: round !important;
}
.mq-ring-track {
  stroke: rgb(23 119 207 / .24) !important;
}
.mq-ring-fg {
  stroke: #1777cf !important;
  transition: stroke-dasharray 900ms cubic-bezier(.34, 1.4, .64, 1) !important;
  filter: drop-shadow(0 0 1px rgb(23 119 207 / .35));
}
.mq-ring-num {
  position: relative !important;
  z-index: 1 !important;
  display: grid !important;
  place-items: center !important;
  font-family: "Segoe UI Variable Text", "Segoe UI", "Microsoft YaHei UI", sans-serif !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  line-height: 28px !important;
  letter-spacing: -.5px !important;
  color: #185e9b !important;
  -webkit-text-stroke: 0 !important;
}
/* 原版 halo：外圈蓝光 2.4s 呼吸 */
.mimo-quota-ring::after {
  content: "" !important;
  position: absolute !important;
  inset: -1px !important;
  display: block !important;
  z-index: -1 !important;
  border-radius: 50% !important;
  background: transparent !important;
  box-shadow: 0 0 0 1.5px rgb(36 133 225 / .85), 0 0 6px 2px rgb(71 161 243 / .42) !important;
  pointer-events: none !important;
  will-change: transform, opacity !important;
  animation: mimo-ring-halo 2.4s ease-in-out infinite !important;
}
@keyframes mimo-ring-halo {
  0%, 100% { opacity: .22; transform: scale(.98); }
  50% { opacity: .9; transform: scale(1.20); }
}
.mimo-earning[data-quota-ok="0"] .mq-ring-fg {
  stroke: rgb(23 119 207 / .20) !important;
}
.mimo-earning[data-quota-ok="0"] .mimo-quota-ring::after {
  box-shadow: 0 0 0 1.5px rgb(36 133 225 / .25) !important;
  animation: none !important;
}

@keyframes mimo-earn-sweep {
  0% { transform: translate3d(-42px, 0, 0); opacity: 0; }
  15%, 80% { opacity: .85; }
  100% { transform: translate3d(210px, 0, 0); opacity: 0; }
}
/* 四档速度：粒子/填充色随模式切换（对齐原版 mode-rgb） */
.mimo-earning[data-earn-speed="fast"] {
  --mimo-earn-mode-rgb: 22 157 191;
  --mimo-earn-mode-light-rgb: 88 222 215;
}
.mimo-earning[data-earn-speed="super"] {
  --mimo-earn-mode-rgb: 113 83 219;
  --mimo-earn-mode-light-rgb: 178 125 255;
}
.mimo-earning[data-earn-speed="max"] {
  --mimo-earn-mode-rgb: 199 68 168;
  --mimo-earn-mode-light-rgb: 247 116 216;
}
@media (prefers-reduced-motion: reduce) {
  .mimo-earning-progress::after,
  .mimo-quota-ring,
  .mimo-quota-ring::after {
    animation: none !important;
  }
  .mimo-earning-fill,
  .mimo-earning-progress::before {
    transition: none !important;
  }
}

/* 7. 启动 shimmer 对齐主题色，避免闪白 */
:root {
  --startup-logo-shimmer-base: ${rgba(c.text, 0.16)};
  --startup-logo-shimmer-peak: ${rgba(c.text, 0.34)};
}

/* 8. 还原：移除 id="mimo-dream-skin-style" 的 <style> 节点即完全还原。
      因为用了 !important，不能靠"再注一层空覆盖"。 */
`;
}

export { rgba, lighten };
