#!/usr/bin/env node
/**
 * Capture MiMo skin screenshots: collapse projects, new task, shot home + progress.
 * Usage: node capture-shots.mjs [outdir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PORT = Number(process.env.MIMO_CDP_PORT || 9335);
const outDir = process.argv[2] || path.join(process.cwd(), 'docs', 'images');
fs.mkdirSync(outDir, { recursive: true });

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`, { redirect: 'error' })).json();
const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
if (!page) throw new Error('no renderer target');

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true });
  ws.addEventListener('error', rej, { once: true });
});

let id = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id == null) return;
  const slot = pending.get(msg.id);
  if (!slot) return;
  pending.delete(msg.id);
  msg.error ? slot.rej(new Error(JSON.stringify(msg.error))) : slot.res(msg.result);
});

function send(method, params = {}, timeoutMs = 30000) {
  const mid = ++id;
  return new Promise((res, rej) => {
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
    setTimeout(() => {
      if (pending.delete(mid)) rej(new Error(`timeout ${method}`));
    }, timeoutMs);
  });
}

async function evalJs(expression) {
  const r = await send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true, allowUnsafeEvalBlockedByCSP: true,
  });
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  }
  return r.result.value;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const file = path.join(outDir, name);
  fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
  console.log('wrote', file, fs.statSync(file).size);
  return file;
}

// Force a comfortable window size
try {
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
  });
} catch { /* ignore */ }

console.log('--- inspect sidebar / projects ---');
const inspect = await evalJs(`(() => {
  const aside = document.querySelector('aside[class*="bg-side-glass"]') || document.querySelector('aside');
  const buttons = [...document.querySelectorAll('button')].map((b, i) => ({
    i,
    text: (b.innerText || '').trim().slice(0, 40),
    aria: b.getAttribute('aria-label') || '',
    title: b.getAttribute('title') || '',
    testid: b.getAttribute('data-testid') || '',
    cls: (b.className || '').toString().slice(0, 80),
  })).filter((b) => b.text || b.aria || b.title || b.testid);
  const projectish = buttons.filter((b) =>
    /project|项目|选择项目|folder|collapse|expand|折叠|展开/i.test((b.text||'')+(b.aria||'')+(b.title||'')+(b.testid||''))
  );
  return {
    title: document.title,
    theme: document.documentElement.getAttribute('data-theme'),
    skinBg: document.documentElement.getAttribute('data-mimo-skin-bg'),
    stylePresent: !!document.getElementById('mimo-dream-skin-style'),
    earn: !!document.getElementById('mimo-dream-earning'),
    pill: !!document.getElementById('mimo-quota-pill'),
    convItems: document.querySelectorAll('.conv-item').length,
    composer: !!document.getElementById('composer'),
    asideText: aside ? (aside.innerText || '').slice(0, 400) : null,
    projectish: projectish.slice(0, 30),
    sampleButtons: buttons.slice(0, 40),
  };
})()`);
console.log(JSON.stringify(inspect, null, 2).slice(0, 4000));

console.log('--- try collapse all + new task ---');
const nav = await evalJs(`(() => {
  const clicks = [];
  const tryClick = (el, label) => {
    if (!el) return false;
    try { el.click(); clicks.push(label); return true; } catch { return false; }
  };

  // 1) Collapse any expanded project groups / tree toggles
  const toggles = [
    ...document.querySelectorAll('[aria-expanded="true"]'),
    ...document.querySelectorAll('button[aria-label*="折叠" i]'),
    ...document.querySelectorAll('button[aria-label*="collapse" i]'),
    ...document.querySelectorAll('[data-state="open"]'),
  ];
  for (const t of toggles.slice(0, 20)) {
    const label = (t.getAttribute('aria-label') || t.innerText || t.className || 'toggle').toString().slice(0, 40);
    // skip dialog/popover close if any
    if (/quota-pill|mqp/i.test(label)) continue;
    tryClick(t, 'collapse:' + label);
  }

  // 2) Prefer "new task / new chat" entry
  const newBtns = [
    ...document.querySelectorAll('button'),
  ].filter((b) => {
    const s = ((b.innerText || '') + ' ' + (b.getAttribute('aria-label') || '') + ' ' + (b.getAttribute('title') || '')).toLowerCase();
    return /new task|new chat|新建任务|新任务|新建对话|新对话|new conversation/.test(s);
  });
  if (newBtns[0]) tryClick(newBtns[0], 'new-task:' + ((newBtns[0].innerText || newBtns[0].getAttribute('aria-label') || '').slice(0, 30)));
  else {
    // fallback: first sidebar new button often is a + icon
    const plus = document.querySelector('aside button[aria-label*="新建" i], aside button[title*="新建" i], aside .icon-btn');
    tryClick(plus, 'plus-fallback');
  }

  return { clicks, href: location.href, title: document.title };
})()`);
console.log('nav', JSON.stringify(nav));
await sleep(800);

// Re-collapse after navigation (new task may expand nothing, but projects can re-open)
await evalJs(`(() => {
  const toggles = [...document.querySelectorAll('[aria-expanded="true"]')];
  for (const t of toggles.slice(0, 20)) {
    if (/quota|mqp/i.test((t.getAttribute('aria-label')||''))) continue;
    try { t.click(); } catch {}
  }
  return toggles.length;
})()`);
await sleep(500);

// Ensure skin runtime is present (paint earning/pill)
await evalJs(`(() => {
  try { window.__mimoDreamSkin?.paintEarning?.(); } catch {}
  return true;
})()`);
await sleep(400);

console.log('--- screenshot home / new task ---');
await shot('mimo-home.png');

// Progress bar close-up: clip to earning bar if present
const earnBox = await evalJs(`(() => {
  const el = document.getElementById('mimo-earning');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: Math.max(0, r.x - 12), y: Math.max(0, r.y - 8), width: Math.min(520, r.width + 24), height: r.height + 16 };
})()`);
if (earnBox && earnBox.width > 10) {
  try {
    const r = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { ...earnBox, scale: 2 },
      captureBeyondViewport: true,
    });
    const file = path.join(outDir, 'mimo-progress-bar.png');
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    console.log('wrote', file, fs.statSync(file).size);
  } catch (e) {
    console.log('clip shot failed', e.message);
    await shot('mimo-progress-bar.png');
  }
} else {
  await shot('mimo-progress-bar.png');
}

// Header pill close-up if present
const pillBox = await evalJs(`(() => {
  const el = document.getElementById('mimo-quota-pill');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: Math.min(360, r.width + 16), height: r.height + 16 };
})()`);
if (pillBox && pillBox.width > 10) {
  try {
    const r = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { ...pillBox, scale: 2 },
      captureBeyondViewport: true,
    });
    const file = path.join(outDir, 'mimo-quota-pill.png');
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    console.log('wrote', file, fs.statSync(file).size);
  } catch (e) {
    console.log('pill clip failed', e.message);
  }
}

// Full window after slight delay
await sleep(300);
await shot('mimo-window.png');

console.log('done', outDir);
ws.close();
process.exit(0);
