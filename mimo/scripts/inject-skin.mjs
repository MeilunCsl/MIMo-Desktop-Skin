#!/usr/bin/env node
/**
 * MiMo Dream Skin injector
 * ---------------------------------------------------------------------------
 * 閫氳繃鏈満鍥炵幆 CDP 鎶?Dream Skin 涓婚娉ㄥ叆宸插甫 --remote-debugging-port 鍚姩鐨? * Xiaomi MiMo Desktop銆備笉淇敼 app.asar銆佷笉鍐欏叆瀹夎鐩綍銆? *
 * 鐢ㄦ硶
 *   node inject-skin.mjs --list                  # 鍒楀嚭鍙敤涓婚
 *   node inject-skin.mjs --theme sakura-coast    # 搴旂敤涓婚锛堝惈鑳屾櫙鎻掔敾锛? *   node inject-skin.mjs --theme doraemon
 *   node inject-skin.mjs --verify                # 鍙妫€鏌? *   node inject-skin.mjs --revert                # 杩樺師瀹樻柟澶栬
 *   node inject-skin.mjs --theme garden --accent '#2f6b53'
 *   node inject-skin.mjs --theme sakura-coast --no-bg     # 鍙閰嶈壊锛屼笉瑕佹彃鐢? *   node inject-skin.mjs --css ./my.css --bg ./art.webp   # 瀹屽叏鑷畾涔? *
 * 閫€鍑虹爜锛? 鎴愬姛锛? 鍙傛暟閿欒锛? 杩炰笉涓?CDP锛? 鎵句笉鍒版覆鏌撳眰锛? 娉ㄥ叆鍚庢牎楠屼笉閫氳繃
 */

import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { composeThemeCss } from './theme-css.mjs';
import { refreshTiboRadar, compactSignalText, summarizeTiboPostZh } from './tibo-radar.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');                 // mimo/
const REPO = path.resolve(ROOT, '..');                 // 浠撳簱鏍?const THEMES_DIR = path.join(ROOT, 'assets', 'themes');
const STYLE_ID = 'mimo-dream-skin-style';
const VERSION = '2.2.0';
const DEFAULT_THEME = 'sakura-coast';

const HELP = `MiMo Dream Skin injector
  --list                鍒楀嚭鍙敤涓婚
  --theme <id>          搴旂敤涓婚锛堥粯璁?${DEFAULT_THEME}锛?  --accent <hex>        瑕嗙洊涓婚鐨勪富寮鸿皟鑹?  --no-bg               涓嶉摵鑳屾櫙鎻掔敾锛屽彧搴旂敤閰嶈壊
  --bg <file|url|off>   鑷畾涔夎儗鏅浘
  --css <file>          瀹屽叏鑷畾涔夋牱寮忥紙璺宠繃涓婚鍚堟垚锛?  --port <n>            CDP 绔彛锛堥粯璁?9335锛?  --verify              鍙妫€鏌?  --revert              杩樺師瀹樻柟澶栬
  --no-wait             涓嶇瓑娓叉煋灞傛寕杞藉畬灏辨敞鍏?`;

function parseArgs(argv) {
  const out = {
    port: 9335, verify: false, revert: false, list: false,
    css: null, accent: null, bg: undefined, theme: DEFAULT_THEME,
    useTheme: false, noBg: false, wait: true,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--list') out.list = true;
    else if (a === '--theme') { out.theme = argv[++i]; out.useTheme = true; }
    else if (a === '--accent') out.accent = argv[++i];
    else if (a === '--no-bg') out.noBg = true;
    else if (a === '--bg') out.bg = argv[++i];
    else if (a === '--css') out.css = argv[++i];
    else if (a === '--verify') out.verify = true;
    else if (a === '--revert') out.revert = true;
    else if (a === '--no-wait') out.wait = false;
    else if (a === '--port') out.port = Number(argv[++i]);
    else if (a === '--help' || a === '-h') { console.log(HELP); process.exit(0); }
    else { console.error(`unknown option: ${a}\n\n${HELP}`); process.exit(1); }
  }
  if (out.accent && !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(out.accent)) {
    console.error(`鉁?--accent 闇€瑕?#rgb / #rrggbb / #rrggbbaa 褰㈠紡锛屾敹鍒帮細${out.accent}`);
    process.exit(1);
  }
  return out;
}

const args = parseArgs(process.argv);

/* -------------------------------------------------------------- themes ---- */

async function loadTheme(id) {
  const file = path.join(THEMES_DIR, `${id}.json`);
  let raw;
  try {
    raw = await readFile(file, 'utf8');
  } catch {
    throw new Error(`涓婚涓嶅瓨鍦細${id}锛堟湡鏈?${file}锛塦);
  }
  const theme = JSON.parse(raw);
  for (const k of ['background', 'panel', 'panelAlt', 'accent', 'accentAlt',
                   'secondary', 'highlight', 'text', 'muted', 'line']) {
    if (!theme.colors?.[k]) throw new Error(`涓婚 ${id} 缂哄皯 colors.${k}`);
  }
  return theme;
}

if (args.list) {
  let files = [];
  try { files = (await readdir(THEMES_DIR)).filter((f) => f.endsWith('.json')); } catch { /* none */ }
  console.log('鍙敤涓婚锛?);
  for (const f of files.sort()) {
    const t = JSON.parse(await readFile(path.join(THEMES_DIR, f), 'utf8'));
    const mark = t.id === DEFAULT_THEME ? ' (榛樿)' : '';
    console.log(`  ${t.id.padEnd(16)} ${t.label ?? ''}${mark}`);
  }
  process.exit(0);
}

/* ------------------------------------------------------------- payload ---- */

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
};

async function imageToDataUrl(spec) {
  if (/^https?:\/\//i.test(spec)) return spec;
  const abs = path.isAbsolute(spec) ? spec : path.resolve(REPO, spec);
  const ext = path.extname(abs).toLowerCase();
  const mime = MIME[ext];
  if (!mime) throw new Error(`涓嶆敮鎸佺殑鍥剧墖绫诲瀷锛?{ext || '(鏃犳墿灞曞悕)'} (${abs})`);
  const buf = await readFile(abs);          // 鎵句笉鍒颁細鎶涘嚭甯﹁矾寰勭殑 ENOENT
  return { url: `data:${mime};base64,${buf.toString('base64')}`, bytes: buf.length };
}

async function buildCss() {
  if (args.css) {
    const p = path.resolve(args.css);
    return { css: await readFile(p, 'utf8'), source: p, bgSpec: args.bg, theme: null };
  }
  const theme = await loadTheme(args.theme);
  let bgSpec = args.bg;
  if (bgSpec === undefined && !args.noBg && theme.image) bgSpec = theme.image;
  if (bgSpec === 'off') bgSpec = undefined;
  return { css: null, source: `theme:${theme.id}`, bgSpec, theme };
}

/* ------------------------------------------------------------------ CDP ---- */

async function listTargets(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/list`, { redirect: 'error' });
  if (!res.ok) throw new Error(`CDP /json/list -> HTTP ${res.status}`);
  return await res.json();
}

function pickRenderer(targets) {
  const pages = targets.filter((t) => t.type === 'page' && t.webSocketDebuggerUrl);
  return pages.find((t) => String(t.url).includes('renderer/index.html'))
    ?? pages.find((t) => String(t.url).startsWith('app://'))
    ?? null;
}

class Cdp {
  constructor(url) { this.url = url; this.id = 0; this.pending = new Map(); }
  connect() {
    return new Promise((res, rej) => {
      this.ws = new WebSocket(this.url);
      this.ws.addEventListener('open', () => res(), { once: true });
      this.ws.addEventListener('error', (e) => rej(new Error(`websocket: ${e?.message ?? e?.type ?? 'error'}`)), { once: true });
      this.ws.addEventListener('message', (ev) => {
        let msg; try { msg = JSON.parse(ev.data); } catch { return; }
        const slot = msg.id != null ? this.pending.get(msg.id) : undefined;
        if (!slot) return;
        this.pending.delete(msg.id);
        msg.error ? slot.rej(new Error(JSON.stringify(msg.error))) : slot.res(msg.result);
      });
    });
  }
  send(method, params = {}, timeoutMs = 20000) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (this.pending.delete(id)) rej(new Error(`cdp timeout: ${method}`)); }, timeoutMs);
    });
  }
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true, allowUnsafeEvalBlockedByCSP: true,
    });
    if (r.exceptionDetails) {
      throw new Error(`eval failed: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
    }
    return r.result.value;
  }
  close() { try { this.ws?.close(); } catch { /* ignore */ } }
}

/* ---------------------------------------------------------------- runtime -- */

const RUNTIME_SRC = `(() => {
  const STYLE_ID = ${JSON.stringify(STYLE_ID)};
  const EARN_ID = 'mimo-dream-earning';
  const MUSE_ID = 'mimo-side-muse';
  const TIBO_BOOT = __TIBO_STATE__;
  const doc = document, html = doc.documentElement;

  // 涓?Codex Dream Skin 鍚屼竴濂楁湰鍦板伐鏃舵ā鍨嬶紙涓嶈浠讳綍 API / 鍑嵁锛?  const MONTHLY_CNY = 9000;
  const WORKDAYS = 23.5;
  const DAILY_CNY = MONTHLY_CNY / WORKDAYS;
  const WORK_START = 9 * 60;
  const BREAK_START = 12 * 60;
  const BREAK_END = 13 * 60 + 30;
  const WORK_END = 18 * 60 + 30;
  const PAID_MINUTES = 8 * 60;
  const USAGE_REFRESH_MS = 5 * 60 * 1000;

  const keepLast = () => {
    const mine = doc.getElementById(STYLE_ID);
    if (mine && html.lastElementChild !== mine) html.appendChild(mine);
  };
  const prev = window.__mimoDreamSkin;
  if (prev) {
    if (prev.__observer) prev.__observer.disconnect();
    if (prev.__legacyPctObserver) prev.__legacyPctObserver.disconnect();
    if (prev.__ctxObserver) prev.__ctxObserver.disconnect();
    if (prev.__ctxTimer) clearInterval(prev.__ctxTimer);
    if (prev.__earnTimer) clearInterval(prev.__earnTimer);
    if (prev.__earnWatch) clearInterval(prev.__earnWatch);
    if (prev.__usageTimer) clearInterval(prev.__usageTimer);
    if (typeof prev.__particleRaf === 'function') cancelAnimationFrame(prev.__particleRaf());
    if (typeof prev.__museWatch === 'function') clearInterval(prev.__museWatch());
    if (typeof prev.__museCycle === 'function') clearInterval(prev.__museCycle());
    doc.getElementById(EARN_ID)?.remove();
    doc.getElementById(MUSE_ID)?.remove();
    doc.getElementById('mimo-quota-pill')?.remove();
  }
  const observer = new MutationObserver(keepLast);
  observer.observe(html, { childList: true });
  setTimeout(keepLast, 0);

  /* ---- 浠婃棩绱閲戦锛堟湰鍦板伐鏃堕挓锛?--------------------------------------- */
  const fmt = (() => {
    try {
      return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch { return null; }
  })();
  const formatAmount = (n) => (fmt?.format(Math.max(0, n)) || Math.max(0, n).toFixed(2));
  const isWorkday = (d) => d.getDay() !== 0 && d.getDay() !== 6;
  const atMin = (d, m) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(m / 60), m % 60, 0, 0).getTime();
  const overlap = (d, from, to, a, b) => Math.max(0, Math.min(to, atMin(d, b)) - Math.max(from, atMin(d, a)));
  const earningAt = (now) => {
    if (!isWorkday(now)) return 0;
    const dayStart = atMin(now, WORK_START);
    if (now.getTime() <= dayStart) return 0;
    const paidMs = overlap(now, dayStart, now.getTime(), WORK_START, BREAK_START)
      + overlap(now, dayStart, now.getTime(), BREAK_END, WORK_END);
    return (paidMs / 60000) * (DAILY_CNY / PAID_MINUTES);
  };
  const inWorkWindow = (now) => {
    if (!isWorkday(now)) return false;
    const m = now.getHours() * 60 + now.getMinutes();
    return (m >= WORK_START && m < BREAK_START) || (m >= BREAK_END && m < WORK_END);
  };

  /* ---- 鍓╀綑鐢ㄩ噺锛堝畼鏂?window.mimo.getUserUsage锛?------------------------
     瀹炴祴 getUserUsage().usage.percent 灏辨槸銆屽墿浣欑敤閲忋€嶇櫨鍒嗘瘮锛堢敤鎴锋牳瀵逛负 55锛夛紝
     涓嶈鍐嶅仛 100-percent銆?*/
  let usageCache = { remaining: null, used: null, resetDate: null, ok: false };
  const refreshUsage = async () => {
    try {
      if (typeof window.mimo?.getUserUsage !== 'function') return usageCache;
      const res = await window.mimo.getUserUsage();
      const u = res && res.usage;
      if (!res?.ok || !u || typeof u.percent !== 'number') return usageCache;
      const remaining = Math.max(0, Math.min(100, u.percent));
      usageCache = {
        remaining,
        used: Math.max(0, Math.min(100, 100 - remaining)),
        resetDate: u.resetDate || null,
        ok: true,
      };
    } catch { /* keep last cache */ }
    return usageCache;
  };

  /* ---- 绮掑瓙鍦猴紙瀵归綈鍘熺増 canvas sprite 娴侊級 ---------------------------- */
  const MODE_RGB = [64, 132, 232];
  const MODE_LIGHT_RGB = [108, 198, 255];
  const SPEED_MODES = [
    { id: 'low', label: 'LOW', speed: 0.65, count: 14, rgb: [64, 132, 232], light: [108, 198, 255] },
    { id: 'fast', label: 'FAST', speed: 1, count: 18, rgb: [22, 157, 191], light: [88, 222, 215] },
    { id: 'super', label: 'SUPER', speed: 1.6, count: 24, rgb: [113, 83, 219], light: [178, 125, 255] },
    { id: 'max', label: 'MAX', speed: 2.4, count: 30, rgb: [199, 68, 168], light: [247, 116, 216] },
  ];
  const SPEED_KEY = 'mimo-dream-earning-speed';
  let speedMode = SPEED_MODES[0];
  try {
    const stored = localStorage.getItem(SPEED_KEY);
    if (stored) {
      speedMode = SPEED_MODES.find((m) => m.id === stored) || SPEED_MODES[0];
    }
  } catch { /* ignore */ }
  const SPRITE_PX = 32;
  const sprite = doc.createElement('canvas');
  sprite.width = SPRITE_PX;
  sprite.height = SPRITE_PX;
  const spriteCtx = sprite.getContext('2d');
  const paintSprite = (rgbArr) => {
    if (!spriteCtx) return;
    const [r, g, b] = rgbArr || MODE_RGB;
    const half = SPRITE_PX / 2;
    spriteCtx.clearRect(0, 0, SPRITE_PX, SPRITE_PX);
    const gradient = spriteCtx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.22, 'rgba(255,255,255,.92)');
    gradient.addColorStop(0.42, 'rgba(' + r + ',' + g + ',' + b + ',.8)');
    gradient.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    spriteCtx.fillStyle = gradient;
    spriteCtx.beginPath();
    spriteCtx.arc(half, half, half, 0, Math.PI * 2);
    spriteCtx.fill();
    spriteCtx.fillStyle = 'rgb(' + r + ' ' + g + ' ' + b + ' / .85)';
    spriteCtx.beginPath();
    spriteCtx.arc(half, half, SPRITE_PX * 0.1, 0, Math.PI * 2);
    spriteCtx.fill();
  };
  paintSprite(speedMode.rgb);

  const TIERS = [
    { size: 2.0, tail: 12, dur: 1.45, star: 0.0, spread: 7 },
    { size: 3.0, tail: 20, dur: 1.12, star: 0.18, spread: 10 },
    { size: 4.2, tail: 30, dur: 0.86, star: 0.45, spread: 13 },
  ];
  const FLOW_COUNT_MAX = 30;
  const DOTS_MS = 1633;
  const flow = [];
  const sparks = [];
  let particleRaf = 0;
  let fieldLast = 0;
  let fillX = 0;
  let flowCount = speedMode.count;
  let hoverBoost = false;

  const makeFlow = (index) => {
    const tier = TIERS[index % 3];
    const p = {
      tier: index % 3,
      dur: DOTS_MS * tier.dur / speedMode.speed,
      size: tier.size,
      tail: tier.tail,
      star: false,
      dx: 0, dy: 0, y0: 14, t: 0,
      delay: (index / Math.max(1, flowCount)) * 1900 + Math.random() * 260,
    };
    resetFlow(p, tier);
    return p;
  };
  const resetFlow = (p, tier) => {
    const t = tier || TIERS[p.tier];
    p.dx = 46 + Math.random() * 128;
    p.dy = (Math.random() * 2 - 1) * t.spread;
    p.y0 = 14 + (Math.random() * 2 - 1) * 4;
    p.t = 0;
    p.star = Math.random() < t.star;
    p.dur = (DOTS_MS * t.dur) / speedMode.speed;
  };
  const syncFlowCount = () => {
    flowCount = speedMode.count;
    while (flow.length > flowCount) flow.pop();
    while (flow.length < flowCount) flow.push(makeFlow(flow.length));
    for (const p of flow) p.dur = (DOTS_MS * TIERS[p.tier].dur) / speedMode.speed;
  };
  syncFlowCount();

  const applySpeedMode = (mode, persist) => {
    speedMode = mode;
    paintSprite(mode.rgb);
    syncFlowCount();
    const el = doc.getElementById(EARN_ID);
    const progress = el?.querySelector('.mimo-earning-progress');
    if (el) {
      el.setAttribute('data-earn-speed', mode.id);
      el.style.setProperty('--mimo-earn-speed', String(mode.speed));
      el.style.setProperty('--mimo-earn-mode-rgb', mode.rgb.join(' '));
      el.style.setProperty('--mimo-earn-mode-light-rgb', mode.light.join(' '));
      el.style.setProperty('--mimo-earn-progress-duration', Math.round(900 / mode.speed) + 'ms');
      el.style.setProperty('--mimo-earn-sweep-duration', Math.round(3200 / mode.speed) + 'ms');
      el.style.setProperty('--mimo-earn-dots-duration', Math.round(850 * Math.sqrt(2.4 / mode.speed)) + 'ms');
    }
    if (progress) {
      progress.setAttribute('data-earn-speed', mode.id);
      progress.setAttribute('role', 'button');
      progress.setAttribute('tabindex', '0');
      progress.setAttribute('title', mode.label + ' 路 鐐瑰嚮鍒囨崲閫熷害');
      progress.setAttribute('aria-label', '褰撳墠鍔ㄦ晥閫熷害 ' + mode.label + '锛岀偣鍑诲垏鎹?);
    }
    if (persist) {
      try { localStorage.setItem(SPEED_KEY, mode.id); } catch { /* ignore */ }
    }
    return mode;
  };

  const cycleSpeed = () => {
    const idx = SPEED_MODES.findIndex((m) => m.id === speedMode.id);
    const next = SPEED_MODES[(idx + 1) % SPEED_MODES.length];
    return applySpeedMode(next, true);
  };

  const blit = (ctx, x, y, size, alpha, tail, star) => {
    if (!ctx || alpha <= 0.01) return;
    const box = size * 3.2;
    if (tail > 2) {
      ctx.globalAlpha = alpha * 0.42;
      ctx.drawImage(sprite, x - box / 2 - tail, y - box * 0.18, box + tail, box * 0.36);
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, x - box / 2, y - box / 2, box, box);
    if (star) {
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - tail * 0.5, y - 0.5, tail, 1.1);
    }
  };

  const particleLoop = (now) => {
    particleRaf = requestAnimationFrame(particleLoop);
    const el = doc.getElementById(EARN_ID);
    const canvas = el?.querySelector('.mimo-earning-particles');
    if (!el || !canvas || !canvas.isConnected) return;
    if (doc.hidden) { fieldLast = 0; return; }
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth || 210;
    const h = parent.clientHeight || 28;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw; canvas.height = ch;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const dt = Math.min(now - (fieldLast || now), 50);
    fieldLast = now;
    const advance = hoverBoost ? dt * 1.6 : dt;
    // fillX from --earning-ratio
    let ratio = 0;
    const ratioVar = parent.style.getPropertyValue('--earning-ratio')
      || el.style.getPropertyValue('--earning-ratio');
    if (ratioVar) ratio = Math.max(0, Math.min(1, parseFloat(ratioVar) || 0));
    fillX = ratio * w;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < flow.length; i++) {
      const p = flow[i];
      if (p.delay > 0) { p.delay -= advance; continue; }
      p.t += advance;
      if (p.t >= p.dur) resetFlow(p, TIERS[p.tier]);
      const k = p.t / p.dur;
      const x = 28 + p.dx * k;
      const y = p.y0 + p.dy * k;
      let alpha = k < 0.12 ? (k / 0.12) * 0.96 : 0.96 - (k - 0.12) * (0.96 / 0.88);
      alpha *= x < fillX ? 1 : 0.85;
      blit(ctx, x, y, p.size, Math.max(0, alpha), p.tail * (0.5 + k), p.star);
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.t += dt;
      if (s.t >= s.life) { sparks.splice(i, 1); continue; }
      const k = s.t / s.life;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      let alpha = k < 0.18 ? (k / 0.18) * 0.98 : 0.98 * (1 - (k - 0.18) / 0.82);
      blit(ctx, s.x, s.y, s.size * (1 - k * 0.4), Math.max(0, alpha), 6, false);
    }
    ctx.globalAlpha = 1;
  };
  const spawnBurst = () => {
    // 杩涘害鍙樺寲鏃朵粠濉厖鍓嶆部鐐稿紑涓€灏忔挳
    for (let i = 0; i < 10; i++) {
      const angle = (Math.random() - 0.5) * 1.2;
      sparks.push({
        x: Math.max(10, fillX),
        y: 14,
        vx: (40 + Math.random() * 50) / 16,
        vy: (Math.random() - 0.5) * 0.8,
        size: 2 + Math.random() * 2,
        t: 0,
        life: 680,
        angle,
      });
    }
  };

  // Tibo 閲嶇疆淇″彿锛圢ode 娉ㄥ叆鏃舵姄鍙栫殑鍏紑鍔ㄦ€侊級
  let tiboState = TIBO_BOOT;
  const compactSignal = (state) => {
    if (!state) return '鈥?;
    if (state.relevance === 'confirmed') return '宸查噸缃?;
    if (Number(state.probability) >= 40) return state.probability + '%';
    if (state.relevance === 'indirect') return '寰呰瀵?;
    return '鈥?;
  };

  /* ---- 椤舵爮棰濆害 + Tibo 鑳跺泭锛堝榻愬師鐗?#codex-quota-pill锛?--------------- */
  const PILL_ID = 'mimo-quota-pill';
  const POPOVER_ID = 'mimo-quota-popover';
  let pillOpen = false;

  const closePillPopover = () => {
    pillOpen = false;
    doc.getElementById(POPOVER_ID)?.remove();
    const pill = doc.getElementById(PILL_ID);
    if (pill) {
      pill.setAttribute('aria-expanded', 'false');
      pill.setAttribute('data-state', 'closed');
    }
  };

  const renderPillPopover = () => {
    const pill = doc.getElementById(PILL_ID);
    if (!pill) return null;
    let pop = doc.getElementById(POPOVER_ID);
    if (!pop) {
      pop = doc.createElement('div');
      pop.id = POPOVER_ID;
      pop.className = 'mimo-quota-popover';
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-label', '棰濆害涓績涓庨噸缃浄杈?);
      doc.body.appendChild(pop);
    }
    const rem = usageCache.ok ? Math.round(usageCache.remaining) : null;
    const used = usageCache.ok ? Math.round(usageCache.used) : null;
    const remRatio = rem != null ? rem / 100 : 0;
    const tibo = tiboState || {};
    const sig = compactSignal(tibo);
    const now = new Date();
    const clock = String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');
    const keyPost = (tibo.keyPostText || tibo.latestPostText || '').replace(/\s+/g, ' ').trim().slice(0, 160);
    const keyUrl = tibo.keyPostUrl || tibo.latestPostUrl || '';
    const translation = tibo.translation || '';
    const understanding = tibo.understanding || tibo.summaryZh || tibo.reason || '';
    const heroStatus = rem == null ? '鐢ㄩ噺鍚屾涓?
      : rem < 20 ? '棰濆害鍋忎綆'
      : rem < 40 ? '棰濆害涓瓑'
      : '棰濆害鍏呰冻';

    pop.innerHTML =
      '<header class="mqp-head">' +
        '<div class="mqp-head-title"><strong>棰濆害涓績</strong><span>路</span><strong>閲嶇疆闆疯揪</strong></div>' +
        '<time>' + clock + (tibo.freshness === 'stale' ? ' 路 缂撳瓨' : ' 路 瀹炴椂') + '</time>' +
      '</header>' +
      '<section class="mqp-hero">' +
        '<div class="mqp-hero-ring" role="progressbar" aria-valuemin="0" aria-valuemax="100"' +
          (rem != null ? ' aria-valuenow="' + rem + '"' : '') + ' aria-label="棰濆害鍓╀綑鐧惧垎姣?>' +
          '<svg viewBox="0 0 120 120" aria-hidden="true">' +
            '<circle class="mqp-hero-track" cx="60" cy="60" r="48" pathLength="100"></circle>' +
            '<circle class="mqp-hero-fg" cx="60" cy="60" r="48" pathLength="100" transform="rotate(-90 60 60)" stroke-dasharray="' + remRatio.toFixed(3) + ' 100"></circle>' +
          '</svg>' +
          '<span><strong>' + (rem != null ? rem : '鈥?) + '</strong><small>棰濆害</small></span>' +
        '</div>' +
        '<div class="mqp-hero-stats">' +
          '<span><small>宸茬敤棰濆害</small><strong>' + (used != null ? used + '%' : '鈥?) + '</strong></span>' +
          '<span><small>鍓╀綑棰濆害</small><strong>' + (rem != null ? rem + '%' : '鈥?) + '</strong></span>' +
          '<span><small>棰濆害鏇存柊</small><strong>' + (usageCache.resetDate || '鈥?) + '</strong></span>' +
        '</div>' +
        '<div class="mqp-hero-copy">' +
          '<span>褰撳墠鐘舵€?/span>' +
          '<strong>' + heroStatus + '</strong>' +
          '<em>' + (usageCache.ok ? 'MiMo 鐢ㄩ噺 路 宸插悓姝? : '绛夊緟鍚屾') + '</em>' +
        '</div>' +
      '</section>' +
      '<section class="mqp-tibo">' +
        '<header class="mqp-tibo-head">' +
          '<strong>Tibo 鍔ㄦ€?/strong>' +
          (keyUrl ? '<a href="' + keyUrl + '" target="_blank" rel="noreferrer">鏌ョ湅鍔ㄦ€?/a>' : '') +
          '<em data-level="' + (tibo.level || 'low') + '">' + sig + '</em>' +
        '</header>' +
        '<div class="mqp-tibo-row"><small>鍏抽敭鍔ㄦ€?/small><p>' + (keyPost || '鏆傛棤鍏紑鍔ㄦ€?) + '</p></div>' +
        (understanding
          ? '<div class="mqp-tibo-row"><small>鐞嗚В</small><p>' + understanding + '</p></div>'
          : '') +
        (translation
          ? '<div class="mqp-tibo-row"><small>缈昏瘧</small><p>' + translation + '</p></div>'
          : '') +
      '</section>';

    // 瀹氫綅鍒拌兌鍥婁笅鏂?    const rect = pill.getBoundingClientRect();
    pop.style.visibility = 'hidden';
    pop.style.display = 'block';
    const popW = Math.min(420, window.innerWidth - 24);
    pop.style.width = popW + 'px';
    const left = Math.min(window.innerWidth - popW - 12, Math.max(12, rect.right - popW));
    let top = rect.bottom + 8;
    const popH = pop.offsetHeight || 240;
    if (top + popH > window.innerHeight - 12) top = Math.max(12, rect.top - popH - 8);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    pop.style.visibility = '';
    pill.setAttribute('aria-expanded', 'true');
    pill.setAttribute('data-state', 'open');
    pillOpen = true;
    return pop;
  };

  const togglePillPopover = () => {
    if (pillOpen) closePillPopover();
    else renderPillPopover();
  };

  const ensureHeaderPill = () => {
    const tools = document.querySelector('.chat-tools');
    if (!tools) return null;
    let pill = doc.getElementById(PILL_ID);
    if (pill && pill.isConnected) {
      if (!pill.__mqpWired) {
        pill.__mqpWired = true;
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          togglePillPopover();
        });
      }
      return pill;
    }
    pill?.remove();
    pill = doc.createElement('span');
    pill.id = PILL_ID;
    pill.className = 'mimo-quota-pill';
    pill.setAttribute('role', 'button');
    pill.setAttribute('tabindex', '0');
    pill.setAttribute('aria-haspopup', 'dialog');
    pill.setAttribute('aria-expanded', 'false');
    pill.innerHTML =
      '<span class="mqp-brand" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="3.5" y="5.5" width="17" height="15" rx="2.5"></rect>' +
          '<path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17"></path>' +
        '</svg>' +
        '<span>棰濆害</span>' +
      '</span>' +
      '<span class="mqp-meter" data-mqp="meter"><span></span></span>' +
      '<strong class="mqp-percent" data-mqp="percent">鈥?/strong>';
    tools.insertBefore(pill, tools.firstChild);
    pill.__mqpWired = true;
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePillPopover();
    });
    pill.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (!e.repeat) togglePillPopover();
    });
    return pill;
  };
  const paintHeaderPill = () => {
    const pill = ensureHeaderPill();
    if (!pill) return null;
    const meterFill = pill.querySelector('.mqp-meter > span');
    const percent = pill.querySelector('.mqp-percent');
    const rem = usageCache.ok ? Math.round(usageCache.remaining) : null;
    if (percent) percent.textContent = rem != null ? rem + '%' : '鈥?;
    if (meterFill) {
      const ratio = rem != null ? Math.max(0, Math.min(1, rem / 100)) : 0;
      meterFill.style.willChange = 'transform';
      meterFill.style.transform = 'scaleX(' + ratio + ')';
    }
    pill.setAttribute('data-level', rem == null ? 'unavailable' : rem < 20 ? 'critical' : rem < 40 ? 'warning' : 'ok');
    pill.setAttribute('title', rem != null
      ? '鍓╀綑鐢ㄩ噺 ' + rem + '%' + (usageCache.resetDate ? ' 路 閲嶇疆 ' + usageCache.resetDate : '')
      : '鐢ㄩ噺涓嶅彲鐢?);
    return pill;
  };

  /* ---- 渚ф爮搴曢儴锛氬ご鍍?+ 涓€鍙ヨ瘽灏忓畤瀹欙紙鏃犲妗嗭紝瀵归綈鍘熺増璐﹀彿浣嶏級 -------- */
  const MUSE_QUOTES = [
    '浠婂ぉ蹇冩儏缇庣編鍝掋€?,
    '鎱㈡參鏉ワ紝姣旇緝蹇€?,
    '鍐欎唬鐮佷篃瑕佸ソ濂藉悆楗€?,
    '浠婂ぉ鐨勯锛屽儚浣犱竴鏍峰垰濂姐€?,
    '鎶婇棶棰樻媶灏忥紝璺氨瀹戒簡銆?,
    '鍏堝枬鍙ｆ按锛屽啀鏀逛笅涓€涓?bug銆?,
    '鐏垫劅涓嶅湪璧惰矾锛屽湪鏁ｆ銆?,
    '浣犲凡缁忔瘮鏄ㄥぉ鏇寸啛缁冧竴鐐逛簡銆?,
    '灞忓箷涔嬪锛屼篃璁板緱鎶ご銆?,
    '瀹屾垚姣斿畬缇庢洿鎺ヨ繎鍑哄彂銆?,
  ];
  let museIndex = 0;
  try {
    const saved = Number(localStorage.getItem('mimo-dream-muse-index'));
    if (Number.isFinite(saved) && saved >= 0 && saved < MUSE_QUOTES.length) museIndex = saved;
  } catch { /* ignore */ }
  // 鍘熺増 linzi-chat-avatar锛岀敱娉ㄥ叆鍣ㄤ互 data URL 濉叆
  const MUSE_AVATAR = __MUSE_AVATAR__;

  const ensureSideMuse = () => {
    const bottom = document.querySelector('.side-bottom');
    if (!bottom) return null;
    // 鍙敼鏂囨/澶村儚锛屼笉鏇挎崲鑺傜偣锛堝厠闅嗕細涓㈡帀 React 鐨勭偣鍑诲鐞嗭級
    const nativeBtn = bottom.querySelector('button[data-account-menu]');
    const nativeRow = nativeBtn?.parentElement || nativeBtn;
    if (nativeBtn) {
      if (nativeRow && nativeRow !== nativeBtn) nativeRow.style.display = '';
      nativeBtn.style.display = '';
      bottom.style.display = '';
      const label = nativeBtn.querySelector('span.min-w-0') || nativeBtn.lastElementChild;
      if (label) label.classList.add('msm-quote');
      if (label && label.getAttribute('data-msm-text') !== String(museIndex)) {
        label.textContent = MUSE_QUOTES[museIndex] || MUSE_QUOTES[0];
        label.setAttribute('data-msm-text', String(museIndex));
      }
      const avatar = nativeBtn.querySelector('span[class*="rounded-full"]');
      if (avatar) avatar.classList.add('msm-native-avatar');
      const nativeImg = nativeBtn.querySelector('img.avatar-img, img');
      if (nativeImg && MUSE_AVATAR) {
        // 姣忔娉ㄥ叆鐢ㄦ柊鐨?data URL锛堣鍒囧浘鍙兘宸叉洿鏂帮級
        if (nativeImg.src !== MUSE_AVATAR) {
          nativeImg.src = MUSE_AVATAR;
          nativeImg.setAttribute('data-msm', '1');
        }
      }
      doc.getElementById(MUSE_ID)?.remove();
      return nativeBtn;
    }
    // 鍏滃簳锛氬師鐢熸寜閽笉鍦ㄦ椂鍐嶆敞鍏?    if (nativeRow) nativeRow.style.display = 'none';
    let el = doc.getElementById(MUSE_ID);
    if (el && el.isConnected) return el;
    el?.remove();
    el = doc.createElement('button');
    el.id = MUSE_ID;
    el.type = 'button';
    el.className = 'mimo-side-muse settings-row';
    el.innerHTML =
      '<span class="msm-avatar" aria-hidden="true"><img alt="" class="msm-img" draggable="false"></span>' +
      '<span class="msm-copy"><span class="msm-quote"></span></span>';
    bottom.appendChild(el);
    const img = el.querySelector('.msm-img');
    if (MUSE_AVATAR) img.src = MUSE_AVATAR;
    el.querySelector('.msm-quote').textContent = MUSE_QUOTES[museIndex] || MUSE_QUOTES[0];
    return el;
  };
  const cycleMuseQuote = () => {
    museIndex = Math.floor(Math.random() * MUSE_QUOTES.length);
    try { localStorage.setItem('mimo-dream-muse-index', String(museIndex)); } catch { /* ignore */ }
    const text = MUSE_QUOTES[museIndex] || MUSE_QUOTES[0];
    const targets = [
      document.querySelector('button[data-account-menu] .msm-quote'),
      doc.querySelector('#' + MUSE_ID + ' .msm-quote'),
    ].filter(Boolean);
    for (const q of targets) {
      if (q.textContent === text) continue;
      q.classList.remove('msm-quote-in');
      void q.offsetWidth;
      q.textContent = text;
      q.setAttribute('data-msm-text', String(museIndex));
      q.classList.add('msm-quote-in');
    }
  };
  ensureSideMuse();
  const museWatch = setInterval(ensureSideMuse, 2500);
  // 鏂囨鑷姩闅忔満杞崲锛堢害 12s锛夛紝涓嶅崰鐢ㄧ偣鍑?  const museCycle = setInterval(cycleMuseQuote, 12000);

  const ensureEarning = () => {
    const bar = doc.querySelector('.composer-bar');
    if (!bar) return null;
    let el = doc.getElementById(EARN_ID);
    if (el && el.isConnected) return el;
    el?.remove();
    el = doc.createElement('span');
    el.id = EARN_ID;
    el.className = 'mimo-earning';
    // 缁撴瀯瀵归綈 Codex锛氶搴︾幆 + 宸ユ椂鑳跺泭锛堝唴鍚～鍏呮潯銆侀噾棰濄€侀噸缃俊鍙凤級
    el.innerHTML =
      '<span class="mimo-earning-progress">' +
        '<span class="mimo-earning-fill"></span>' +
        '<canvas class="mimo-earning-particles" aria-hidden="true"></canvas>' +
        '<span class="mimo-earning-value">' +
          '<span class="mimo-earning-amount">0.00</span>' +
          '<span class="mimo-earning-signal"><span class="me-sig-label">閲嶇疆淇″彿</span><strong class="me-sig-val">鈥?/strong></span>' +
        '</span>' +
      '</span>' +
      '<span class="mimo-quota-ring" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="鍓╀綑鐢ㄩ噺">' +
        '<svg viewBox="0 0 200 200" aria-hidden="true">' +
          '<circle class="mq-ring-track" cx="100" cy="100" r="82"></circle>' +
          '<circle class="mq-ring-fg" cx="100" cy="100" r="82" pathLength="100" transform="rotate(-90 100 100)"></circle>' +
        '</svg>' +
        '<span class="mq-ring-num"><b>0</b></span>' +
      '</span>';
    const left = bar.querySelector('.cb-left');
    if (left) left.appendChild(el);
    else bar.insertBefore(el, bar.firstChild);
    applySpeedMode(speedMode, false);
    const progress = el.querySelector('.mimo-earning-progress');
    if (progress && !progress.__speedWired) {
      progress.__speedWired = true;
      progress.addEventListener('click', () => { cycleSpeed(); });
      progress.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        if (!e.repeat) cycleSpeed();
      });
      progress.addEventListener('mouseenter', () => { hoverBoost = true; });
      progress.addEventListener('mouseleave', () => { hoverBoost = false; });
    }
    return el;
  };

  const paintEarning = () => {
    const el = ensureEarning();
    if (!el) return null;
    const now = new Date();
    const amount = earningAt(now);
    const ratio = Math.max(0, Math.min(1, amount / DAILY_CNY));
    const earnPct = Math.round(ratio * 100);
    const amtEl = el.querySelector('.mimo-earning-amount');
    const fill = el.querySelector('.mimo-earning-fill');
    const text = formatAmount(amount);
    if (amtEl && amtEl.textContent !== text) amtEl.textContent = text;
    if (fill) fill.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    el.style.setProperty('--earning-ratio', ratio.toFixed(4));
    const progress = el.querySelector('.mimo-earning-progress');
    if (progress) progress.style.setProperty('--earning-ratio', ratio.toFixed(4));
    // 瑙嗚鍔ㄦ晥鍏ㄦ椂娈靛父寮€锛涢噾棰濅粛鍙湪宸ヤ綔绐楀彛绱
    el.setAttribute('data-earn-state', 'working');
    el.setAttribute('data-earn-pct', String(earnPct));
    el.setAttribute('data-earn-amount', amount.toFixed(2));
    el.setAttribute('data-earn-clock', inWorkWindow(now) ? 'working' : 'idle');

    // 鍓╀綑鐢ㄩ噺鐜細鐩存帴鏄剧ず API percent
    const ring = el.querySelector('.mimo-quota-ring');
    const ringNum = el.querySelector('.mq-ring-num b');
    const ringFg = el.querySelector('.mq-ring-fg');
    if (usageCache.ok) {
      const rem = Math.round(usageCache.remaining);
      if (ringNum) ringNum.textContent = String(rem);
      // pathLength=100锛?1 琛ㄧず 51%锛屼笉瑕佸啀闄や互 100
      if (ringFg) ringFg.style.strokeDasharray = usageCache.remaining.toFixed(2) + ' 100';
      if (ring) {
        ring.setAttribute('aria-valuenow', String(rem));
        ring.setAttribute('aria-valuetext', '鍓╀綑 ' + rem + '%');
        ring.setAttribute('data-remaining', String(rem));
        const tip = '鍓╀綑鐢ㄩ噺 ' + rem + '%锛堝凡鐢?' + Math.round(usageCache.used) + '%锛?
          + (usageCache.resetDate ? ' 路 閲嶇疆 ' + usageCache.resetDate : '');
        ring.setAttribute('title', tip);
        el.setAttribute('title', tip + ' 路 浠婃棩绱 ' + text + ' 鍏?);
      }
      el.setAttribute('data-quota-ok', '1');
    } else {
      if (ringNum) ringNum.textContent = '--';
      if (ringFg) ringFg.style.strokeDasharray = '0 100';
      el.setAttribute('data-quota-ok', '0');
      el.setAttribute('title', '浠婃棩绱 ' + text + ' 鍏?);
    }
    // Tibo 閲嶇疆淇″彿锛堝叕寮€鍔ㄦ€侊紝闈?MiMo 瀹樻柟閫氱煡锛?    const sigVal = el.querySelector('.me-sig-val');
    const sigText = compactSignal(tiboState);
    if (sigVal && sigVal.textContent !== sigText) sigVal.textContent = sigText;
    el.setAttribute('data-tibo-level', tiboState?.level || 'low');
    el.setAttribute('data-tibo-fresh', tiboState?.freshness || 'stale');
    if (tiboState?.reason) {
      const sig = el.querySelector('.mimo-earning-signal');
      if (sig) {
        sig.setAttribute('title', 'Tibo 閲嶇疆淇″彿锛堝叕寮€鍔ㄦ€侊級路 ' + tiboState.reason
          + (tiboState.scannedPostCount ? ' 路 宸叉牳瀵?' + tiboState.scannedPostCount + ' 鏉? : ''));
      }
    }
    const prevRatio = parseFloat(el.getAttribute('data-earn-ratio') || '0');
    if (ratio > prevRatio + 0.002) spawnBurst();
    el.setAttribute('data-earn-ratio', ratio.toFixed(4));
    paintHeaderPill();
    if (pillOpen) renderPillPopover();
    return { amount, earnPct, text, usage: usageCache, tibo: tiboState };
  };

  // 鏃х増鏈彲鑳界暀涓嬫湭鐧昏鐨?interval锛屼細鎸佺画鎶婁笂涓嬫枃鐧惧垎姣斿啓鍥炪€?  // 杩欓噷鍙仛杞婚噺娓呯悊锛涘彲瑙佹€х敱 CSS 鐨?.ctx-hud-pct { display:none } 鍏滃簳銆?  const earnWatch = setInterval(() => {
    doc.querySelectorAll('.ctx-hud-pct').forEach((n) => n.remove());
    ensureEarning();
    paintEarning();
    paintHeaderPill();
    // 鏉冮檺鏉￠噷杩戦粦鐨勫疄蹇冩寜閽細寮哄埗鎻愪寒锛岄伩鍏嶅绾镐笂鈥滈殣褰⑩€?    for (const btn of doc.querySelectorAll('button')) {
      const cs = getComputedStyle(btn);
      const bg = cs.backgroundColor;
      const m = bg.match(/rgba?\(([^)]+)\)/);
      if (!m) continue;
      const p = m[1].split(',').map((s) => parseFloat(s));
      const a = p.length >= 4 ? p[3] : 1;
      if (a > 0.55 && p[0] < 55 && p[1] < 65 && p[2] < 95) {
        btn.style.setProperty('background', 'rgb(var(--ds-accent-rgb) / .95)', 'important');
        btn.style.setProperty('color', '#fff', 'important');
        btn.style.setProperty('border-color', 'transparent', 'important');
        btn.style.setProperty('box-shadow', '0 4px 14px rgb(var(--ds-accent-rgb) / .40)', 'important');
      }
    }
  }, 1500);

  // 鐐瑰嚮澶栭儴 / Escape 鍏抽棴璇︽儏鍗?  const onDocClick = (e) => {
    if (!pillOpen) return;
    if (e.target.closest('#' + PILL_ID) || e.target.closest('#' + POPOVER_ID)) return;
    closePillPopover();
  };
  const onDocKey = (e) => {
    if (e.key === 'Escape' && pillOpen) closePillPopover();
  };
  doc.addEventListener('click', onDocClick, true);
  doc.addEventListener('keydown', onDocKey, true);
  const earnTimer = setInterval(paintEarning, 2000);
  const usageTimer = setInterval(() => { refreshUsage().then(paintEarning); }, USAGE_REFRESH_MS);
  refreshUsage().then(paintEarning);
  paintEarning();
  if (particleRaf) cancelAnimationFrame(particleRaf);
  particleRaf = requestAnimationFrame(particleLoop);

  window.__mimoDreamSkin = {
    version: ${JSON.stringify(VERSION)},
    installedAt: Date.now(),
    __observer: observer,
    __earnTimer: earnTimer,
    __earnWatch: earnWatch,
    __usageTimer: usageTimer,
    __particleRaf: () => particleRaf,
    __museWatch: () => museWatch,
    __museCycle: () => museCycle,
    paintEarning,
    refreshUsage,
    revert() {
      observer.disconnect();
      if (window.__mimoDreamSkin?.__ctxObserver) window.__mimoDreamSkin.__ctxObserver.disconnect();
      if (window.__mimoDreamSkin?.__ctxTimer) clearInterval(window.__mimoDreamSkin.__ctxTimer);
      clearInterval(earnTimer);
      clearInterval(earnWatch);
      clearInterval(usageTimer);
      cancelAnimationFrame(particleRaf);
      clearInterval(museWatch);
      clearInterval(museCycle);
      flow.length = 0;
      sparks.length = 0;
      doc.removeEventListener('click', onDocClick, true);
      doc.removeEventListener('keydown', onDocKey, true);
      doc.querySelectorAll('.ctx-hud-pct').forEach((n) => n.remove());
      doc.getElementById(EARN_ID)?.remove();
      doc.getElementById(MUSE_ID)?.remove();
      doc.getElementById(PILL_ID)?.remove();
      doc.getElementById(POPOVER_ID)?.remove();
      doc.getElementById(STYLE_ID)?.remove();
      html.removeAttribute('data-mimo-skin-bg');
      delete window.__mimoDreamSkin;
      return { reverted: true };
    },
    state() {
      const cs = getComputedStyle(html);
      const earn = doc.getElementById(EARN_ID);
      return {
        stylePresent: !!doc.getElementById(STYLE_ID),
        bgEnabled: html.getAttribute('data-mimo-skin-bg') || null,
        theme: html.getAttribute('data-theme'),
        accent: cs.getPropertyValue('--color-accent').trim(),
        mainBg: cs.getPropertyValue('--color-main-bg').trim(),
        sideBg: cs.getPropertyValue('--color-side').trim(),
        txt: cs.getPropertyValue('--color-txt-strong').trim(),
        earningPresent: !!earn,
        earningPct: earn?.getAttribute('data-earn-pct') || null,
        earningState: earn?.getAttribute('data-earn-state') || null,
        earningAmount: earn?.querySelector('.mimo-earning-amount')?.textContent || null,
        quotaOk: earn?.getAttribute('data-quota-ok') || null,
        remaining: earn?.querySelector('.mimo-quota-ring')?.getAttribute('data-remaining') || null,
        speedMode: earn?.getAttribute('data-earn-speed') || speedMode.id,
        speedLabel: speedMode.label,
        tibo: tiboState ? {
          probability: tiboState.probability,
          level: tiboState.level,
          relevance: tiboState.relevance,
          freshness: tiboState.freshness,
          reason: tiboState.reason,
          signalText: compactSignal(tiboState),
          translation: tiboState.translation || '',
          understanding: tiboState.understanding || '',
        } : null,
        pillOpen,
        usageCache: usageCache.ok ? { used: usageCache.used, remaining: usageCache.remaining, resetDate: usageCache.resetDate } : null,
      };
    },
  };
  return window.__mimoDreamSkin.state();
})()`;

/* ----------------------------------------------------------------- main ---- */

let targets;
try {
  targets = await listTargets(args.port);
} catch (err) {
  console.error(`鉁?杩炰笉涓?CDP锛?27.0.0.1:${args.port}锛夛細${err.message}`);
  console.error('  璇峰厛鐢ㄥ甫 --remote-debugging-port 鐨勬柟寮忓惎鍔?MiMo銆?);
  process.exit(2);
}

const target = pickRenderer(targets);
if (!target) {
  console.error(`鉁?鏈壘鍒版覆鏌撳眰鐩爣銆傚綋鍓?${targets.length} 涓?target锛歚);
  for (const t of targets) console.error(`    ${t.type}  ${t.url}`);
  process.exit(3);
}

const conn = new Cdp(target.webSocketDebuggerUrl);
await conn.connect();

async function waitRendererReady(c, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    last = await c.eval(`(() => ({
      readyState: document.readyState,
      hasApp: !!document.getElementById('app'),
      theme: document.documentElement.getAttribute('data-theme'),
    }))()`);
    if (last && last.readyState === 'complete' && last.hasApp && last.theme) return last;
    await new Promise((r) => setTimeout(r, 400));
  }
  return last;
}

try {
  console.log(`鈫?宸查檮鐫€ ${target.url}  (${target.title})`);

  if (args.verify) {
    const st = await conn.eval(`window.__mimoDreamSkin ? window.__mimoDreamSkin.state()
      : { stylePresent: !!document.getElementById(${JSON.stringify(STYLE_ID)}), runtime: false }`);
    console.log(JSON.stringify(st, null, 2));
    conn.close();
    process.exit(st.stylePresent ? 0 : 1);
  }

  if (args.revert) {
    const r = await conn.eval(`window.__mimoDreamSkin ? window.__mimoDreamSkin.revert()
      : (() => { const e = document.getElementById(${JSON.stringify(STYLE_ID)});
                 if (e) e.remove();
                 document.documentElement.removeAttribute('data-mimo-skin-bg');
                 return { reverted: !!e, fallback: true }; })()`);
    console.log(`鉁?宸茶繕鍘燂細${JSON.stringify(r)}`);
    conn.close();
    process.exit(0);
  }

  const built = await buildCss();

  // Tibo 鍏紑鍔ㄦ€侊紙Node 渚ф姄鍙栵紱澶辫触鏃剁粰闄嶇骇鐘舵€侊紝涓嶉樆鏂敞鍏ワ級
  console.log('  鎷夊彇 Tibo 鍔ㄦ€佲€?);
  const tiboStateForRuntime = await refreshTiboRadar();
  console.log(`  Tibo锛?{compactSignalText(tiboStateForRuntime)}  ${tiboStateForRuntime.reason || ''}`.slice(0, 160));

  // 渚ф爮灏忓畤瀹欏ご鍍忥細鍘熺増 linzi-chat-avatar
  let museAvatarDataUrl = 'null';
  try {
    const avatarPath = path.join(ROOT, 'assets', 'side-avatar.webp');
    const avatarBuf = await readFile(avatarPath);
    museAvatarDataUrl = JSON.stringify('data:image/png;base64,' + avatarBuf.toString('base64'));
  } catch (err) {
    console.log('  渚ф爮澶村儚璇诲彇澶辫触锛屽皢鐢ㄥ崰浣嶏細' + (err?.message || err));
  }

  let css = built.css;
  let bgNote = '鏃?;

  if (!css) {
    let bgVar = 'none';
    if (built.bgSpec) {
      const img = await imageToDataUrl(built.bgSpec);
      if (typeof img === 'string') {
        bgVar = `url("${img}")`;
        bgNote = `杩滅▼ URL`;
      } else {
        bgVar = `url("${img.url}")`;
        bgNote = `鍐呰仈 ${img.bytes.toLocaleString()} 瀛楄妭`;
      }
    }
    css = composeThemeCss(built.theme, bgVar);
    if (built.theme) {
      console.log(`  涓婚 ${built.theme.id}銆?{built.theme.label}銆? 鎻掔敾锛?{bgNote}`);
    }
  } else {
    console.log(`  鑷畾涔夋牱寮忥細${built.source}`);
  }

  if (args.wait) {
    const ready = await waitRendererReady(conn);
    console.log(ready && ready.theme
      ? `  娓叉煋灞傚凡灏辩华锛坮eadyState=${ready.readyState}, #app=${ready.hasApp}, theme=${ready.theme}锛塦
      : `  鈿?绛夊緟瓒呮椂锛屾寜褰撳墠鐘舵€佹敞鍏ワ紙${JSON.stringify(ready)}锛塦);
  }

  const hasBg = !built.css && (built.bgSpec ? true : false);

  const payload = await conn.eval(`(() => {
    const doc = document, html = doc.documentElement;
    let el = doc.getElementById(${JSON.stringify(STYLE_ID)});
    const created = !el;
    if (!el) { el = doc.createElement('style'); el.id = ${JSON.stringify(STYLE_ID)}; }
    el.textContent = ${JSON.stringify(css)};
    html.appendChild(el);
    if (${JSON.stringify(args.accent)}) html.style.setProperty('--skin-accent', ${JSON.stringify(args.accent)});
    if (${hasBg}) html.setAttribute('data-mimo-skin-bg', 'on');
    else html.removeAttribute('data-mimo-skin-bg');
    return { created, cssBytes: el.textContent.length };
  })()`);

  const st = await conn.eval(
    RUNTIME_SRC
      .replace('__TIBO_STATE__', JSON.stringify(tiboStateForRuntime))
      .replace('__MUSE_AVATAR__', museAvatarDataUrl)
  );
  const ok = st && st.stylePresent;

  console.log(`鉁?娉ㄥ叆瀹屾垚  鏍峰紡 ${payload.cssBytes} 瀛楄妭  ${payload.created ? '锛堟柊寤鸿妭鐐癸級' : '锛堟洿鏂拌妭鐐癸級'}`);
  console.log(`  鑳屾櫙鎻掔敾锛?{hasBg ? '宸插紑鍚? : '鏈紑鍚?}`);
  console.log(`  --color-main-bg  ${st?.mainBg}`);
  console.log(`  --color-side     ${st?.sideBg}`);
  console.log(`  --color-txt-strong ${st?.txt}`);
  console.log(`  --color-accent   ${st?.accent}`);
  if (st?.earningPresent) {
    console.log('  浠婃棩绱锛? + (st.earningAmount ?? '鈥?) + ' 鍏? 杩涘害 ' + (st.earningPct ?? '鈥?) + '%  (' + st.earningState + ')');
    console.log('  鍓╀綑鐢ㄩ噺锛? + (st.remaining != null ? st.remaining + '%' : '涓嶅彲鐢?) +
      (st.usageCache?.resetDate ? '  閲嶇疆 ' + st.usageCache.resetDate : ''));
    if (st.tibo) {
      console.log('  Tibo 淇″彿锛? + (st.tibo.signalText || '鈥?) + '  ' + (st.tibo.freshness || '') + '  ' + (st.tibo.reason || '').slice(0, 80));
    }
  }

  conn.close();
  process.exit(ok ? 0 : 4);
} catch (err) {
  console.error(`鉁?${err.message}`);
  conn.close();
  process.exit(4);
}
