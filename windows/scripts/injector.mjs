import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { StringDecoder } from "node:string_decoder";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "./image-metadata.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const here = path.dirname(scriptPath);
const root = path.resolve(here, "..");
const SELECTOR_CONTRACT = JSON.parse(await fs.readFile(
  path.join(root, "assets", "selectors.json"), "utf8",
));
if (SELECTOR_CONTRACT.schema !== "codex-dream-skin-selectors/1" ||
  !Array.isArray(SELECTOR_CONTRACT.selectors)) {
  throw new Error("assets/selectors.json has an unsupported schema");
}
const SELECTOR_MAP = new Map();
for (const entry of SELECTOR_CONTRACT.selectors) {
  if (!entry?.key || !entry.selector || SELECTOR_MAP.has(entry.key)) {
    throw new Error(`assets/selectors.json has an invalid selector key: ${entry?.key || "<missing>"}`);
  }
  SELECTOR_MAP.set(entry.key, entry.selector);
}
const selectorFor = (key) => {
  const selector = SELECTOR_MAP.get(key);
  if (!selector) throw new Error(`Selector contract is missing ${key}`);
  return selector;
};
const selectorLiteral = (key) => JSON.stringify(selectorFor(key));
const stableTestidLiteral = (testid) => {
  if (!SELECTOR_CONTRACT.stableTestids?.includes(testid)) {
    throw new Error(`Selector contract is missing stable testid ${testid}`);
  }
  return JSON.stringify(`[data-testid="${testid}"]`);
};
const SKIN_VERSION = "1.4.0";
const MAX_ART_BYTES = 16 * 1024 * 1024;
const MAX_BACKGROUND_VARIANTS = 4;
const SUPPORTED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const VARIANT_ASSET_KEYS = Object.freeze([
  "pet",
  "sidebarCompanion",
  "sidebarAccountAvatar",
  "composerCompanion",
]);
const VARIANT_IDENTITY_TEXT_FIELDS = Object.freeze([
  ["name", 120],
  ["brandSubtitle", 80],
  ["tagline", 160],
  ["projectPrefix", 80],
  ["projectLabel", 80],
  ["statusText", 80],
  ["quote", 80],
]);
const MAX_VARIANT_WORK_MOODS = 16;
const PET_ASSET_NAME = "linzi-pet-spritesheet.webp";
const SIDEBAR_COMPANION_ASSET_NAME = "linzi-sidebar-companion-v2-crop.webp";
const SIDEBAR_ACCOUNT_AVATAR_ASSET_NAME = "linzi-chat-avatar.webp";
const COMPOSER_COMPANION_ASSET_NAME = "linzi-composer-companion.webp";
const TIBO_AVATAR_ASSET_NAME = "tibo-x-avatar.webp";

const imageMimeForPath = (imagePath) => {
  const extension = path.extname(imagePath).toLowerCase();
  return extension === ".jpg" || extension === ".jpeg" ? "image/jpeg"
    : extension === ".webp" ? "image/webp" : "image/png";
};

/* Keep theme.json paths stable for older installations while preferring a
   sibling WebP when one is bundled. If the optimized file is absent, the
   original PNG/JPEG path remains the fallback without another manifest field. */
const resolvePreferredImagePath = async (candidatePath) => {
  const extension = path.extname(candidatePath).toLowerCase();
  if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension) || extension === ".webp") return candidatePath;
  const basename = path.basename(candidatePath);
  const stem = basename.slice(0, -extension.length);
  const webpPath = path.join(path.dirname(candidatePath), `${stem}.webp`);
  try {
    const webpStat = await fs.stat(webpPath);
    if (webpStat.isFile() && webpStat.size > 0 && webpStat.size <= MAX_ART_BYTES) {
      return webpPath;
    }
  } catch {}
  return candidatePath;
};

const relativeThemePath = (themeDir, imagePath) =>
  path.relative(themeDir, imagePath).split(path.sep).join("/");
const STRONG_THEME_AUDIT_MS = 30000;
const THEME_SOURCE_CHECK_MS = 5000;
const WATCH_POLL_MS = 2000;
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);
const BROWSER_ID_PATTERN = /^[A-Za-z0-9._-]{1,200}$/;
const OPERATION_UI_HOST_ID = "chatgpt-dream-skin-operation";
const OPERATION_UI_REGISTRY_KEY = "__CHATGPT_DREAM_SKIN_OPERATION_UI__";
const OPERATION_KINDS = new Set(["apply", "pause", "switch"]);
const OPERATION_UI_STATES = new Set(["success", "error", "cancelled"]);
const LAZY_ASSET_BINDING_NAME = "codexDreamSkinLoadAsset";
const LAZY_ASSET_RESPONSE_KEY = "__CODEX_DREAM_SKIN_ASSET_RESPONSE__";
const LAZY_ASSET_FALLBACK_KEY = "__CODEX_DREAM_SKIN_LAZY_ASSETS__";
const PUBLIC_FETCH_BINDING_NAME = "codexDreamSkinFetchPublic";
const PUBLIC_FETCH_RESPONSE_KEY = "__CODEX_DREAM_SKIN_PUBLIC_FETCH_RESPONSE__";
const PUBLIC_FETCH_MAX_BODY_BYTES = 8 * 1024 * 1024;
const RENDERER_ACTIVITY_BINDING_NAME = "codexDreamSkinRendererActivity";
const RENDERER_OWNER_KEY = "__CODEX_DREAM_SKIN_OWNER__";
const SESSION_USAGE_GLOBAL_KEY = "__CODEX_DREAM_SKIN_SESSION_USAGE__";
const SESSION_USAGE_POLL_MS = 10 * 1000;
const SESSION_THREAD_SCAN_MS = 30 * 1000;
const SESSION_LOG_SEARCH_MS = 45 * 1000;
const SESSION_LOG_CHUNK_BYTES = 1024 * 1024;
const SESSION_LOGS_ROOT = path.join(
  process.env.CODEX_HOME || path.join(os.homedir(), ".codex"),
  "sessions",
);
/* Store activation and Codex self-updates can replace the browser process while
   the watcher is still healthy. Keep retrying the verified identity instead of
   exiting after a quiet period; once the endpoint returns, the normal target
   reconciliation reattaches the skin automatically. */
const WATCH_IDENTITY_RECONNECT_GRACE_MS = 0;
const SESSION_THREAD_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OPENAI_PUBLIC_PRICE_REVISION = "2026-08-31";
const OPENAI_PUBLIC_PRICING = Object.freeze({
  "gpt-5.6-sol": {
    short: { input: 4, cachedInput: 0.4, cacheWrite: 5, output: 20 },
    long: { input: 8, cachedInput: 0.8, cacheWrite: 10, output: 30 },
  },
  "gpt-5.6-terra": {
    short: { input: 2, cachedInput: 0.2, cacheWrite: 2.5, output: 12 },
    long: { input: 4, cachedInput: 0.4, cacheWrite: 5, output: 18 },
  },
  "gpt-5.6-luna": {
    short: { input: 0.2, cachedInput: 0.02, cacheWrite: 0.25, output: 1.2 },
    long: { input: 0.4, cachedInput: 0.04, cacheWrite: 0.5, output: 1.8 },
  },
  "gpt-5.3-codex": {
    short: { input: 1.75, cachedInput: 0.175, cacheWrite: 2.1875, output: 14 },
    long: { input: 1.75, cachedInput: 0.175, cacheWrite: 2.1875, output: 14 },
  },
});
const OPENAI_PUBLIC_LONG_CONTEXT_THRESHOLD = 272000;
// In-renderer progress for pause/apply keeps operations visible without a second window.
const OPERATION_UI_CSS = `
  :host {
    all: initial;
    position: fixed;
    top: var(--dream-skin-operation-top, 0px);
    left: var(--dream-skin-operation-left, 0px);
    width: var(--dream-skin-operation-width, 100vw);
    height: var(--dream-skin-operation-height, 100vh);
    z-index: 2147483647;
    pointer-events: none;
    opacity: 0;
    display: grid;
    place-items: center;
    transition: opacity 180ms cubic-bezier(0.16, 1, 0.3, 1);
    font-family: "Segoe UI Variable Text", "Segoe UI", "Microsoft YaHei UI", system-ui, sans-serif;
  }
  :host([data-visible="true"]) { opacity: 1; }
  .status {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: min(220px, calc(100% - 32px));
    min-height: 112px;
    padding: 18px 20px;
    border: 1px solid rgba(238, 239, 244, 0.16);
    border-radius: 8px;
    background: rgba(32, 33, 38, 0.94);
    color: #f3f3f6;
    box-shadow: 0 8px 24px rgba(12, 14, 19, 0.22);
    font-size: 13px;
    font-weight: 550;
    line-height: 1.35;
    text-align: center;
    transform: translateY(-4px) scale(0.98);
    transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  :host([data-visible="true"]) .status { transform: translateY(0) scale(1); }
  :host([data-tone="light"]) .status {
    border-color: #d9dbe3;
    background: rgba(248, 248, 251, 0.96);
    color: #25262c;
    box-shadow: 0 8px 24px rgba(31, 35, 48, 0.14);
  }
  .indicator {
    box-sizing: border-box;
    flex: 0 0 22px;
    width: 22px;
    height: 22px;
    color: #78a8f5;
  }
  :host([data-state="loading"]) .indicator {
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: dream-skin-operation-spin 720ms linear infinite;
  }
  :host([data-state="success"]) .indicator,
  :host([data-state="error"]) .indicator,
  :host([data-state="cancelled"]) .indicator {
    display: grid;
    place-items: center;
    border-radius: 50%;
    font-size: 16px;
    font-weight: 750;
  }
  :host([data-state="success"]) .indicator { color: #53b77b; }
  :host([data-state="success"]) .indicator::before { content: "✓"; }
  :host([data-state="error"]) .indicator { color: #e26d7e; }
  :host([data-state="error"]) .indicator::before { content: "!"; }
  :host([data-state="cancelled"]) .indicator { color: #a5a7b0; }
  :host([data-state="cancelled"]) .indicator::before { content: "×"; }
  .message { min-width: 0; overflow-wrap: anywhere; }
  @keyframes dream-skin-operation-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) {
    :host, .status { transition: none; }
    :host([data-state="loading"]) .indicator {
      animation: none;
      border-top-color: currentColor;
      opacity: 0.65;
    }
  }
`;
let operationSequence = 0;
let earlyGenerationSequence = 0;

class CdpIdentityMismatchError extends Error {}

function parseArgs(argv) {
  const options = {
    port: 9335,
    mode: "watch",
    timeoutMs: 30000,
    screenshot: null,
    reload: false,
    browserId: null,
    themeDir: path.join(root, "assets"),
    pauseFile: null,
    stateFile: null,
    operationKind: null,
    operationUiState: null,
    operationMessage: null,
    operationToken: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--port") options.port = Number(argv[++i]);
    else if (arg === "--once") options.mode = "once";
    else if (arg === "--watch") options.mode = "watch";
    else if (arg === "--verify") options.mode = "verify";
    else if (arg === "--remove") options.mode = "remove";
    else if (arg === "--begin-operation") options.mode = "begin-operation";
    else if (arg === "--finish-operation") options.mode = "finish-operation";
    else if (arg === "--timeout-ms") options.timeoutMs = Number(argv[++i]);
    else if (arg === "--browser-id") options.browserId = argv[++i];
    else if (arg === "--theme-dir") options.themeDir = path.resolve(argv[++i]);
    else if (arg === "--pause-file") options.pauseFile = path.resolve(argv[++i]);
    else if (arg === "--state-file") options.stateFile = path.resolve(argv[++i]);
    else if (arg === "--screenshot") options.screenshot = path.resolve(argv[++i]);
    else if (arg === "--operation-kind") options.operationKind = argv[++i];
    else if (arg === "--operation-ui-state") options.operationUiState = argv[++i];
    else if (arg === "--operation-message") options.operationMessage = argv[++i];
    else if (arg === "--operation-token") options.operationToken = argv[++i];
    else if (arg === "--reload") options.reload = true;
    else if (arg === "--self-test") options.mode = "self-test";
    else if (arg === "--check-payload") options.mode = "check-payload";
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(options.port) || options.port < 1024 || options.port > 65535) {
    throw new Error(`Invalid port: ${options.port}`);
  }
  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs < 250 || options.timeoutMs > 120000) {
    throw new Error(`Invalid timeout: ${options.timeoutMs}`);
  }
  if (options.browserId !== null && !BROWSER_ID_PATTERN.test(options.browserId)) {
    throw new Error(`Invalid browser ID: ${options.browserId}`);
  }
  if (options.operationToken !== null && !/^\d{1,12}:\d{13}:\d{1,8}$/.test(options.operationToken)) {
    throw new Error("Invalid operation token");
  }
  if (options.mode === "begin-operation") {
    if (!OPERATION_KINDS.has(options.operationKind)) {
      throw new Error("Begin operation requires --operation-kind apply, pause, or switch");
    }
    if (!options.browserId) throw new Error("--browser-id is required in begin-operation mode");
  }
  if (options.mode === "finish-operation") {
    if (!OPERATION_UI_STATES.has(options.operationUiState)) {
      throw new Error("Finish operation requires --operation-ui-state success, error, or cancelled");
    }
    if (!options.operationToken) throw new Error("Finish operation requires --operation-token");
    if (typeof options.operationMessage !== "string" || options.operationMessage.length > 240
      || /[\r\n]/.test(options.operationMessage)) {
      throw new Error("Finish operation requires a single-line --operation-message up to 240 characters");
    }
    if (!options.browserId) throw new Error("--browser-id is required in finish-operation mode");
  }
  if (["watch", "once", "verify", "remove"].includes(options.mode) && !options.browserId) {
    throw new Error(`--browser-id is required in ${options.mode} mode`);
  }
  return options;
}

function validatedDebuggerUrl(target, port) {
  const url = new URL(target.webSocketDebuggerUrl);
  const pathIsValid = /^\/devtools\/(?:page|browser)\/[A-Za-z0-9._-]{1,200}$/.test(url.pathname);
  if (url.protocol !== "ws:" || !LOOPBACK_HOSTS.has(url.hostname) || Number(url.port) !== port ||
      url.username || url.password || url.search || url.hash || !pathIsValid) {
    throw new Error("Rejected a CDP WebSocket URL outside the allowed loopback endpoint shape");
  }
  return url.href;
}

function parseCdpMessage(data) {
  try {
    const message = JSON.parse(String(data));
    return message && typeof message === "object" ? message : null;
  } catch {
    return null;
  }
}

function browserIdFromVersion(version, port) {
  const url = validatedDebuggerUrl(version, port);
  const parsed = new URL(url);
  const match = parsed.pathname.match(/^\/devtools\/browser\/([A-Za-z0-9._-]{1,200})$/);
  if (!match || parsed.search || parsed.hash || !BROWSER_ID_PATTERN.test(match[1])) {
    throw new Error("Rejected an invalid CDP browser identity URL");
  }
  return match[1];
}

function isValidCdpPageTarget(item, port) {
  if (item?.type !== "page" || !item.url?.startsWith("app://") || typeof item.id !== "string" ||
      !BROWSER_ID_PATTERN.test(item.id) || !item.webSocketDebuggerUrl) return false;
  try {
    const debuggerUrl = new URL(validatedDebuggerUrl(item, port));
    return debuggerUrl.pathname === `/devtools/page/${item.id}`;
  } catch {
    return false;
  }
}

class CdpSession {
  constructor(target, port) {
    this.target = target;
    this.ws = new WebSocket(validatedDebuggerUrl(target, port));
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.closed = false;
  }

  async open() {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        try { this.ws.close(); } catch {}
        reject(new Error("CDP WebSocket open timed out"));
      }, 5000);
      this.ws.addEventListener("open", () => { clearTimeout(timeout); resolve(); }, { once: true });
      this.ws.addEventListener("error", () => { clearTimeout(timeout); reject(new Error("CDP WebSocket open failed")); }, { once: true });
    });
    this.ws.addEventListener("message", (event) => this.onMessage(event));
    this.ws.addEventListener("error", () => this.close());
    this.ws.addEventListener("close", () => {
      this.closed = true;
      for (const waiter of this.pending.values()) {
        clearTimeout(waiter.timeout);
        waiter.reject(new Error("CDP socket closed"));
      }
      this.pending.clear();
    });
    await this.send("Runtime.enable");
    await this.send("Page.enable");
    return this;
  }

  onMessage(event) {
    const message = parseCdpMessage(event.data);
    if (!message) {
      this.close();
      return;
    }
    if (message.id) {
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      clearTimeout(waiter.timeout);
      this.pending.delete(message.id);
      if (message.error) waiter.reject(new Error(`${message.error.message} (${message.error.code})`));
      else waiter.resolve(message.result);
      return;
    }
    for (const listener of this.listeners.get(message.method) ?? []) listener(message.params ?? {});
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  send(method, params = {}) {
    if (this.closed) return Promise.reject(new Error("CDP session is closed"));
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, 10000);
      this.pending.set(id, { resolve, reject, timeout });
      try {
        this.ws.send(JSON.stringify({ id, method, params }));
      } catch (error) {
        clearTimeout(timeout);
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: false,
    });
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails.exception?.description ?? result.exceptionDetails.text;
      throw new Error(`Renderer evaluation failed: ${detail}`);
    }
    return result.result?.value;
  }

  close() {
    for (const waiter of this.pending.values()) {
      clearTimeout(waiter.timeout);
      waiter.reject(new Error("CDP session closed"));
    }
    this.pending.clear();
    if (!this.closed) {
      try { this.ws.close(); } catch {}
    }
    this.closed = true;
  }
}

class BrowserIdentityAnchor {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.closed = false;
    this.ws.addEventListener("close", () => { this.closed = true; });
    this.ws.addEventListener("error", () => {
      this.closed = true;
      try { this.ws.close(); } catch {}
    });
  }

  async open() {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.close();
        reject(new Error("CDP browser identity WebSocket open timed out"));
      }, 5000);
      this.ws.addEventListener("open", () => { clearTimeout(timeout); resolve(); }, { once: true });
      this.ws.addEventListener("error", () => {
        clearTimeout(timeout);
        reject(new Error("CDP browser identity WebSocket open failed"));
      }, { once: true });
      this.ws.addEventListener("close", () => {
        clearTimeout(timeout);
        reject(new Error("CDP browser identity WebSocket closed during startup"));
      }, { once: true });
    });
    if (this.closed) throw new Error("CDP browser identity WebSocket is already closed");
    return this;
  }

  close() {
    if (!this.closed) {
      try { this.ws.close(); } catch {}
    }
    this.closed = true;
  }
}

async function fetchCdpJson(port, resource) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(`http://127.0.0.1:${port}${resource}`, {
      redirect: "error",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function isCdpEndpointUnavailable(error) {
  const code = error?.cause?.code ?? error?.code;
  return error?.name === "AbortError" ||
    code === "ECONNREFUSED" || code === "ECONNRESET" || code === "EPIPE" || code === "ETIMEDOUT";
}

async function listAppTargets(port, expectedBrowserId = null) {
  const targets = await fetchCdpJson(port, "/json/list");
  if (!Array.isArray(targets)) throw new Error("CDP target list is not an array");
  if (expectedBrowserId) {
    const version = await fetchCdpJson(port, "/json/version");
    const actualBrowserId = browserIdFromVersion(version, port);
    if (actualBrowserId !== expectedBrowserId) {
      throw new CdpIdentityMismatchError(
        `CDP browser identity changed from ${expectedBrowserId} to ${actualBrowserId}`,
      );
    }
  }
  return targets.filter((item) => isValidCdpPageTarget(item, port));
}

async function readCdpBrowserIdentity(port) {
  const version = await fetchCdpJson(port, "/json/version");
  return browserIdFromVersion(version, port);
}

async function connectBrowserIdentityAnchor(port, expectedBrowserId) {
  const version = await fetchCdpJson(port, "/json/version");
  const actualBrowserId = browserIdFromVersion(version, port);
  if (actualBrowserId !== expectedBrowserId) {
    throw new CdpIdentityMismatchError(
      `CDP browser identity changed from ${expectedBrowserId} to ${actualBrowserId}`,
    );
  }
  return new BrowserIdentityAnchor(validatedDebuggerUrl(version, port)).open();
}

async function clearOwnedWatchState(stateFile, options) {
  if (!stateFile) return false;
  try {
    const state = JSON.parse(await fs.readFile(stateFile, "utf8"));
    const ownsState = Number(state?.injectorPid) === process.pid &&
      Number(state?.port) === options.port && state?.browserId === options.browserId;
    if (!ownsState) return false;
    await fs.unlink(stateFile);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    console.error(`[dream-skin] watcher state cleanup skipped: ${error.message}`);
    return false;
  }
}

const THEME_CHOICES = {
  appearance: new Set(["auto", "light", "dark"]),
  safeArea: new Set(["auto", "left", "right", "center", "none"]),
  taskMode: new Set(["auto", "ambient", "banner", "off"]),
};

const EXPERIENCE_CHOICES = {
  characterRole: new Set(["sidebar", "account", "assistant", "composer", "radar"]),
  headerSlot: new Set(["theme", "quota", "recommendation"]),
  ring: new Set(["quota", "none"]),
  probability: new Set(["reset", "none"]),
  pose: new Set(["idle", "ready", "working", "complete", "warning", "error", "offline"]),
};

const EXPERIENCE_DEFAULT_STATES = {
  idle: { sidebarPose: "idle", chatPose: "idle", composerPose: "ready" },
  working: { sidebarPose: "working", chatPose: "working", composerPose: "working" },
  complete: { sidebarPose: "complete", chatPose: "complete", composerPose: "ready" },
  error: { sidebarPose: "error", chatPose: "error", composerPose: "error" },
  offline: { sidebarPose: "offline", chatPose: "offline", composerPose: "offline" },
};

function normalizedUnit(value, name) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1) {
    throw new Error(`${name} must be null or a number between 0 and 1`);
  }
  return number;
}

function normalizedChoice(value, name, choices, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  if (!choices.has(value)) throw new Error(`${name} has an unsupported value: ${value}`);
  return value;
}

function normalizedText(value, name, fallback, maxLength = 120) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string" || value.length > maxLength || /[\u0000-\u001f]/.test(value)) {
    throw new Error(`${name} must be a short single-line string`);
  }
  return value;
}

function normalizedIdentifier(value, name, fallback, maxLength = 80) {
  const identifier = normalizedText(value, name, fallback, maxLength);
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(identifier)) {
    throw new Error(`${name} must contain only letters, numbers, hyphens, and underscores`);
  }
  return identifier;
}

function normalizedBoolean(value, name, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "boolean") throw new Error(`${name} must be a boolean`);
  return value;
}

function normalizeVariantIdentity(candidate, index) {
  if (candidate === undefined || candidate === null) return {};
  if (typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error(`backgroundVariants[${index}].identity must be an object`);
  }
  const prefix = `backgroundVariants[${index}].identity`;
  const identity = {};
  for (const [key, maxLength] of VARIANT_IDENTITY_TEXT_FIELDS) {
    if (!Object.hasOwn(candidate, key)) continue;
    const value = normalizedText(candidate[key], `${prefix}.${key}`, "", maxLength).trim();
    if (!value) throw new Error(`${prefix}.${key} must not be empty when provided`);
    identity[key] = value;
  }
  if (Object.hasOwn(candidate, "workMoods")) {
    if (!Array.isArray(candidate.workMoods) || candidate.workMoods.length < 1 ||
      candidate.workMoods.length > MAX_VARIANT_WORK_MOODS) {
      throw new Error(`${prefix}.workMoods must contain 1-${MAX_VARIANT_WORK_MOODS} short messages`);
    }
    identity.workMoods = candidate.workMoods.map((item, moodIndex) => {
      const value = normalizedText(item, `${prefix}.workMoods[${moodIndex}]`, "", 160).trim();
      if (!value) throw new Error(`${prefix}.workMoods[${moodIndex}] must not be empty`);
      return value;
    });
  }
  if (Object.hasOwn(candidate, "workMoodRotationMs")) {
    const requested = Number(candidate.workMoodRotationMs);
    if (!Number.isFinite(requested)) {
      throw new Error(`${prefix}.workMoodRotationMs must be a number`);
    }
    identity.workMoodRotationMs = Math.round(Math.max(15_000, Math.min(120_000, requested)));
  }
  return identity;
}

function normalizedChoiceList(value, name, choices, fallback) {
  const source = value === undefined || value === null ? fallback : value;
  if (!Array.isArray(source) || source.length < 1) {
    throw new Error(`${name} must be a non-empty array`);
  }
  const result = [];
  const seen = new Set();
  for (const item of source) {
    if (typeof item !== "string" || !choices.has(item) || seen.has(item)) {
      throw new Error(`${name} contains an unsupported or duplicate value`);
    }
    seen.add(item);
    result.push(item);
  }
  return result;
}

function normalizeExperience(candidate, themeId) {
  const source = candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? candidate : {};
  const requestedSchemaVersion = Number(source.schemaVersion ?? 1);
  if (!Number.isInteger(requestedSchemaVersion) || requestedSchemaVersion !== 1) {
    throw new Error("experience.schemaVersion must be 1");
  }
  const slots = source.slots && typeof source.slots === "object" && !Array.isArray(source.slots)
    ? source.slots : {};
  const sidebar = slots.sidebar && typeof slots.sidebar === "object" && !Array.isArray(slots.sidebar)
    ? slots.sidebar : {};
  const header = slots.header && typeof slots.header === "object" && !Array.isArray(slots.header)
    ? slots.header : {};
  const chat = slots.chat && typeof slots.chat === "object" && !Array.isArray(slots.chat)
    ? slots.chat : {};
  const composer = slots.composer && typeof slots.composer === "object" && !Array.isArray(slots.composer)
    ? slots.composer : {};
  const capabilities = source.capabilities && typeof source.capabilities === "object" &&
    !Array.isArray(source.capabilities) ? source.capabilities : {};
  const states = source.states && typeof source.states === "object" && !Array.isArray(source.states)
    ? source.states : {};
  const normalizedStates = {};
  for (const [stateId, defaults] of Object.entries(EXPERIENCE_DEFAULT_STATES)) {
    const state = states[stateId] && typeof states[stateId] === "object" && !Array.isArray(states[stateId])
      ? states[stateId] : {};
    normalizedStates[stateId] = {
      sidebarPose: normalizedChoice(
        state.sidebarPose, `experience.states.${stateId}.sidebarPose`,
        EXPERIENCE_CHOICES.pose, defaults.sidebarPose,
      ),
      chatPose: normalizedChoice(
        state.chatPose, `experience.states.${stateId}.chatPose`,
        EXPERIENCE_CHOICES.pose, defaults.chatPose,
      ),
      composerPose: normalizedChoice(
        state.composerPose, `experience.states.${stateId}.composerPose`,
        EXPERIENCE_CHOICES.pose, defaults.composerPose,
      ),
    };
  }
  const defaultHeaderOrder = ["theme", "recommendation", "quota"];
  const defaultThemeId = normalizedIdentifier(themeId, "theme.id", "custom");
  return {
    schemaVersion: 1,
    id: normalizedIdentifier(source.id, "experience.id", `${defaultThemeId}-experience`),
    label: normalizedText(source.label, "experience.label", "Codex Experience", 120),
    slots: {
      sidebar: {
        companionRole: normalizedChoice(
          sidebar.companionRole, "experience.slots.sidebar.companionRole",
          EXPERIENCE_CHOICES.characterRole, "sidebar",
        ),
        accountRole: normalizedChoice(
          sidebar.accountRole, "experience.slots.sidebar.accountRole",
          EXPERIENCE_CHOICES.characterRole, "account",
        ),
      },
      header: {
        order: normalizedChoiceList(
          header.order, "experience.slots.header.order", EXPERIENCE_CHOICES.headerSlot,
          defaultHeaderOrder,
        ),
      },
      chat: {
        assistantRole: normalizedChoice(
          chat.assistantRole, "experience.slots.chat.assistantRole",
          EXPERIENCE_CHOICES.characterRole, "assistant",
        ),
      },
      composer: {
        companionRole: normalizedChoice(
          composer.companionRole, "experience.slots.composer.companionRole",
          EXPERIENCE_CHOICES.characterRole, "composer",
        ),
        ring: normalizedChoice(
          composer.ring, "experience.slots.composer.ring", EXPERIENCE_CHOICES.ring, "quota",
        ),
        probability: normalizedChoice(
          composer.probability, "experience.slots.composer.probability",
          EXPERIENCE_CHOICES.probability, "reset",
        ),
      },
    },
    capabilities: {
      theme: normalizedBoolean(capabilities.theme, "experience.capabilities.theme", true),
      quota: normalizedBoolean(capabilities.quota, "experience.capabilities.quota", true),
      recommendation: normalizedBoolean(
        capabilities.recommendation, "experience.capabilities.recommendation", true,
      ),
      characters: normalizedBoolean(capabilities.characters, "experience.capabilities.characters", true),
      ring: normalizedBoolean(capabilities.ring, "experience.capabilities.ring", true),
      probability: normalizedBoolean(
        capabilities.probability, "experience.capabilities.probability", true,
      ),
    },
    states: normalizedStates,
  };
}

async function loadTheme(themeDir) {
  const realThemeDir = await fs.realpath(themeDir);
  const themePath = path.join(realThemeDir, "theme.json");
  const themeText = await fs.readFile(themePath, "utf8");
  const raw = JSON.parse(themeText);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Theme root must be an object");
  }
  const image = normalizedText(raw.image, "image", null, 240);
  if (!image || path.isAbsolute(image)) throw new Error("Theme image must be a relative path");
  const requestedImagePath = path.resolve(realThemeDir, image);
  const relativeImage = path.relative(realThemeDir, requestedImagePath);
  if (!relativeImage || relativeImage.startsWith("..") || path.isAbsolute(relativeImage)) {
    throw new Error("Theme image must remain inside the selected theme directory");
  }
  const imagePath = await resolvePreferredImagePath(requestedImagePath);
  const extension = path.extname(imagePath).toLowerCase();
  if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported theme image format: ${extension || "missing"}`);
  }
  const realImagePath = await fs.realpath(imagePath);
  const realRelativeImage = path.relative(realThemeDir, realImagePath);
  if (!realRelativeImage || realRelativeImage.startsWith("..") || path.isAbsolute(realRelativeImage)) {
    throw new Error("Theme image cannot escape through a link or junction");
  }
  const art = raw.art && typeof raw.art === "object" && !Array.isArray(raw.art) ? raw.art : {};
  const rawQuota = raw.quota && typeof raw.quota === "object" && !Array.isArray(raw.quota)
    ? raw.quota : {};
  const rawQuotaRadar = rawQuota.radar && typeof rawQuota.radar === "object" &&
    !Array.isArray(rawQuota.radar) ? rawQuota.radar : {};
  const hasQuotaRadarConfig = Object.keys(rawQuotaRadar).length > 0;
  const requestedQuotaRefresh = Number(rawQuota.refreshMs);
  const requestedRadarRefresh = Number(rawQuotaRadar.refreshMs);
  const requestedModelRadarRefresh = Number(rawQuotaRadar.modelRefreshMs);
  const requestedTiboRefresh = Number(rawQuotaRadar.tiboRefreshMs);
  const quotaRadar = hasQuotaRadarConfig
    ? {
      tier: normalizedText(rawQuotaRadar.tier, "quota.radar.tier", "", 24),
      refreshMs: Number.isFinite(requestedRadarRefresh)
        ? Math.round(Math.max(60_000, Math.min(6 * 60 * 60 * 1000, requestedRadarRefresh)))
        : 10 * 60 * 1000,
      modelRefreshMs: Number.isFinite(requestedModelRadarRefresh)
        ? Math.round(Math.max(30_000, Math.min(10 * 60 * 1000, requestedModelRadarRefresh)))
        : 5 * 60 * 1000,
      tiboRefreshMs: Number.isFinite(requestedTiboRefresh)
        ? Math.round(Math.max(15 * 60 * 1000, Math.min(6 * 60 * 60 * 1000, requestedTiboRefresh)))
        : 60 * 60 * 1000,
    }
    : null;
  const quota = {
    enabled: rawQuota.enabled !== false,
    showInHeader: rawQuota.showInHeader !== false,
    showInEnvironment: rawQuota.showInEnvironment !== false,
    refreshMs: Number.isFinite(requestedQuotaRefresh)
      ? Math.round(Math.max(5000, Math.min(60000, requestedQuotaRefresh))) : 15000,
    radar: quotaRadar,
  };
  const palette = raw.palette && typeof raw.palette === "object" && !Array.isArray(raw.palette)
    ? raw.palette : {};
  const rawColors = raw.colors && typeof raw.colors === "object" && !Array.isArray(raw.colors)
    ? raw.colors : null;
  const colorKeys = [
    "background", "panel", "panelAlt", "accent", "accentAlt", "secondary",
    "highlight", "text", "muted", "line",
  ];
  const color = (value, fallback) => {
    if (typeof value !== "string") return fallback;
    const normalized = value.trim();
    return /^#[0-9a-f]{6}$/i.test(normalized) || /^rgba?\([0-9., %]+\)$/i.test(normalized)
      ? normalized : fallback;
  };
  const themeField = (value, fallback, max, name) => {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || value.length > max ||
      /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u.test(value)) {
      throw new Error(`${themePath} has an invalid ${name} field`);
    }
    return value.trim() || fallback;
  };
  const loadVariantAsset = async (value, key, index) => {
    const asset = normalizedText(
      value,
      `backgroundVariants[${index}].assets.${key}`,
      "",
      240,
    );
    if (!asset || path.isAbsolute(asset)) {
      throw new Error(`${themePath} backgroundVariants[${index}].assets.${key} must be a relative path`);
    }
    const requestedAssetPath = path.resolve(realThemeDir, asset);
    const relativeAsset = path.relative(realThemeDir, requestedAssetPath);
    if (!relativeAsset || relativeAsset.startsWith("..") || path.isAbsolute(relativeAsset)) {
      throw new Error(`${themePath} background variant asset must remain inside the selected theme directory`);
    }
    const assetPath = await resolvePreferredImagePath(requestedAssetPath);
    const extension = path.extname(assetPath).toLowerCase();
    if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
      throw new Error(`Unsupported background variant asset format: ${extension || "missing"}`);
    }
    const realAssetPath = await fs.realpath(assetPath);
    const realRelativeAsset = path.relative(realThemeDir, realAssetPath);
    if (!realRelativeAsset || realRelativeAsset.startsWith("..") || path.isAbsolute(realRelativeAsset)) {
      throw new Error(`${themePath} background variant asset cannot escape through a link or junction`);
    }
    const imageStat = await fs.stat(realAssetPath);
    if (!imageStat.isFile() || imageStat.size < 1 || imageStat.size > MAX_ART_BYTES) {
      throw new Error(`Background variant asset must be between 1 byte and ${MAX_ART_BYTES / 1024 / 1024} MB`);
    }
    const imageBytes = await fs.readFile(realAssetPath);
    if (imageBytes.length < 1 || imageBytes.length > MAX_ART_BYTES ||
      !readImageMetadata(imageBytes, extension)) {
      throw new Error("Background variant asset metadata is invalid or exceeds the 16384px / 50MP safety limit");
    }
    return {
      path: realAssetPath,
      relativePath: relativeThemePath(realThemeDir, realAssetPath),
      imageBytes,
      imageStat,
    };
  };
  const loadBackgroundVariant = async (candidate, index) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new Error(`${themePath} has an invalid backgroundVariants[${index}] entry`);
    }
    const id = normalizedText(candidate.id, `backgroundVariants[${index}].id`, "", 40);
    if (!id || !/^[a-z0-9][a-z0-9_-]*$/i.test(id)) {
      throw new Error(`${themePath} has an invalid backgroundVariants[${index}].id field`);
    }
    const label = normalizedText(candidate.label, `backgroundVariants[${index}].label`, id, 80);
    const variantImage = normalizedText(
      candidate.image,
      `backgroundVariants[${index}].image`,
      "",
      240,
    );
    if (!variantImage || path.isAbsolute(variantImage)) {
      throw new Error(`${themePath} backgroundVariants[${index}].image must be a relative path`);
    }
    const requestedVariantImagePath = path.resolve(realThemeDir, variantImage);
    const relativeVariantImage = path.relative(realThemeDir, requestedVariantImagePath);
    if (!relativeVariantImage || relativeVariantImage.startsWith("..") || path.isAbsolute(relativeVariantImage)) {
      throw new Error(`${themePath} backgroundVariants[${index}].image must remain inside the selected theme directory`);
    }
    const variantImagePath = await resolvePreferredImagePath(requestedVariantImagePath);
    const extension = path.extname(variantImagePath).toLowerCase();
    if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
      throw new Error(`Unsupported background variant image format: ${extension || "missing"}`);
    }
    const realVariantImagePath = await fs.realpath(variantImagePath);
    const realRelativeVariantImage = path.relative(realThemeDir, realVariantImagePath);
    if (!realRelativeVariantImage || realRelativeVariantImage.startsWith("..") || path.isAbsolute(realRelativeVariantImage)) {
      throw new Error(`${themePath} background variant image cannot escape through a link or junction`);
    }
    const imageStat = await fs.stat(realVariantImagePath);
    if (!imageStat.isFile() || imageStat.size < 1 || imageStat.size > MAX_ART_BYTES) {
      throw new Error(`Background variant image must be between 1 byte and ${MAX_ART_BYTES / 1024 / 1024} MB`);
    }
    const imageBytes = await fs.readFile(realVariantImagePath);
    if (imageBytes.length < 1 || imageBytes.length > MAX_ART_BYTES) {
      throw new Error(`Background variant image must be between 1 byte and ${MAX_ART_BYTES / 1024 / 1024} MB`);
    }
    const artMetadata = readImageMetadata(imageBytes, extension);
    if (!artMetadata) {
      throw new Error("Background variant image metadata is invalid or exceeds the 16384px / 50MP safety limit");
    }
    const variantColorsRaw = candidate.colors && typeof candidate.colors === "object" && !Array.isArray(candidate.colors)
      ? candidate.colors : {};
    const variantColors = {};
    for (const key of colorKeys) {
      if (!Object.hasOwn(variantColorsRaw, key)) continue;
      const value = color(variantColorsRaw[key], null);
      if (!value) throw new Error(`${themePath} has an invalid backgroundVariants[${index}].colors.${key} field`);
      variantColors[key] = value;
    }
    const variantArt = candidate.art && typeof candidate.art === "object" && !Array.isArray(candidate.art)
      ? candidate.art : {};
    const variantAssetsRaw = candidate.assets && typeof candidate.assets === "object" &&
      !Array.isArray(candidate.assets) ? candidate.assets : {};
    const variantAssets = {};
    for (const key of VARIANT_ASSET_KEYS) {
      if (!Object.hasOwn(variantAssetsRaw, key)) continue;
      variantAssets[key] = await loadVariantAsset(variantAssetsRaw[key], key, index);
    }
    const identity = normalizeVariantIdentity(candidate.identity, index);
    return {
      id,
      label,
      image: variantImage,
      colors: variantColors,
      art: {
        focusX: normalizedUnit(variantArt.focusX, `backgroundVariants[${index}].art.focusX`),
        focusY: normalizedUnit(variantArt.focusY, `backgroundVariants[${index}].art.focusY`),
        safeArea: normalizedChoice(
          variantArt.safeArea,
          `backgroundVariants[${index}].art.safeArea`,
          THEME_CHOICES.safeArea,
          "auto",
        ),
        taskMode: normalizedChoice(
          variantArt.taskMode,
          `backgroundVariants[${index}].art.taskMode`,
          THEME_CHOICES.taskMode,
          "auto",
        ),
      },
      assets: variantAssets,
      identity,
      artMetadata,
      imagePath: realVariantImagePath,
      imageBytes,
      imageStat,
    };
  };
  const backgroundVariantAssets = [];
  const backgroundVariantIds = new Set();
  const rawBackgroundVariants = Array.isArray(raw.backgroundVariants)
    ? raw.backgroundVariants.slice(0, MAX_BACKGROUND_VARIANTS) : [];
  for (const [index, candidate] of rawBackgroundVariants.entries()) {
    const variant = await loadBackgroundVariant(candidate, index);
    if (backgroundVariantIds.has(variant.id)) {
      throw new Error(`${themePath} has a duplicate background variant id: ${variant.id}`);
    }
    backgroundVariantIds.add(variant.id);
    backgroundVariantAssets.push(variant);
  }
  const requestedDefaultBackgroundVariant = normalizedText(
    raw.defaultBackgroundVariant,
    "defaultBackgroundVariant",
    backgroundVariantAssets[0]?.id || "",
    40,
  );
  if (requestedDefaultBackgroundVariant && !backgroundVariantIds.has(requestedDefaultBackgroundVariant)) {
    throw new Error(`${themePath} defaultBackgroundVariant does not match a background variant`);
  }
  const paletteAccent = typeof palette.accent === "string" && palette.accent.trim()
    ? palette.accent.trim() : "";
  if (paletteAccent && !/^(?:#[\da-f]{3,8}|(?:rgb|hsl|oklch|oklab)\([^;{}]{1,96}\))$/i.test(paletteAccent)) {
    throw new Error("palette.accent is not a supported CSS color");
  }
  const colors = {
    background: color(rawColors?.background, "#071116"),
    panel: color(rawColors?.panel, "#0b1a20"),
    panelAlt: color(rawColors?.panelAlt, "#10272c"),
    accent: color(rawColors?.accent, color(paletteAccent, "#7cff46")),
    accentAlt: color(rawColors?.accentAlt, "#b8ff3d"),
    secondary: color(rawColors?.secondary, "#36d7e8"),
    highlight: color(rawColors?.highlight, "#642a8c"),
    text: color(rawColors?.text, "#e9fff1"),
    muted: color(rawColors?.muted, "#9ebdb3"),
    line: color(rawColors?.line, "rgba(124, 255, 70, .28)"),
  };
  const themeId = normalizedIdentifier(raw.id, "id", "custom");
  const experience = normalizeExperience(raw.experience, themeId);
  const theme = {
    id: themeId,
    name: normalizedText(raw.name, "name", "Codex Dream Skin", 120),
    brandSubtitle: themeField(raw.brandSubtitle, "CODEX DREAM SKIN", 80, "brandSubtitle"),
    tagline: themeField(raw.tagline, "Make something wonderful.", 160, "tagline"),
    projectPrefix: themeField(raw.projectPrefix, "选择项目 · ", 80, "projectPrefix"),
    projectLabel: themeField(raw.projectLabel, "◉  选择项目", 80, "projectLabel"),
    statusText: themeField(raw.statusText, "DREAM SKIN ONLINE", 80, "statusText"),
    quote: themeField(raw.quote, "MAKE SOMETHING WONDERFUL", 80, "quote"),
    image,
    defaultBackgroundVariant: requestedDefaultBackgroundVariant,
    backgroundVariants: backgroundVariantAssets.map(({
      imagePath: _imagePath,
      imageBytes: _imageBytes,
      imageStat: _imageStat,
      assets: variantAssets,
      ...variant
    }) => ({
      ...variant,
      assets: Object.fromEntries(
        Object.entries(variantAssets || {}).map(([key, asset]) => [key, asset.relativePath]),
      ),
    })),
    appearance: normalizedChoice(raw.appearance, "appearance", THEME_CHOICES.appearance, "auto"),
    art: {
      focusX: normalizedUnit(art.focusX, "art.focusX"),
      focusY: normalizedUnit(art.focusY, "art.focusY"),
      safeArea: normalizedChoice(art.safeArea, "art.safeArea", THEME_CHOICES.safeArea, "auto"),
      taskMode: normalizedChoice(art.taskMode, "art.taskMode", THEME_CHOICES.taskMode, "auto"),
    },
    quota,
    colorMode: rawColors ? "explicit" : (paletteAccent ? "explicit" : "auto"),
    explicitColorKeys: rawColors
      ? colorKeys.filter((key) => Object.hasOwn(rawColors, key))
      : (paletteAccent ? ["accent"] : []),
    colors,
    palette: {},
    experience,
  };
  if (paletteAccent) theme.palette.accent = paletteAccent;
  const [themeStat, imageStat] = await Promise.all([fs.stat(themePath), fs.stat(realImagePath)]);
  if (!imageStat.isFile()) throw new Error("Theme image is not a file");
  if (imageStat.size < 1) throw new Error("Theme image cannot be empty");
  if (imageStat.size > MAX_ART_BYTES) {
    throw new Error(`Theme image exceeds the ${MAX_ART_BYTES / 1024 / 1024} MB limit`);
  }
  const imageBytes = await fs.readFile(realImagePath);
  if (imageBytes.length < 1 || imageBytes.length > MAX_ART_BYTES) {
    throw new Error(`Theme image must be between 1 byte and ${MAX_ART_BYTES / 1024 / 1024} MB`);
  }
  const artMetadata = readImageMetadata(imageBytes, extension);
  if (!artMetadata) {
    throw new Error("Theme image metadata is invalid or exceeds the 16384px / 50MP safety limit");
  }
  theme.artMetadata = artMetadata;
  const fingerprintHash = createHash("sha256")
    .update(themeText, "utf8")
    .update("\0")
    .update(imageBytes)
  for (const variant of backgroundVariantAssets) {
    fingerprintHash.update("\0").update(variant.id).update("\0").update(variant.imageBytes);
    for (const key of VARIANT_ASSET_KEYS) {
      const asset = variant.assets?.[key];
      if (!asset) continue;
      fingerprintHash.update("\0").update(key).update("\0").update(asset.imageBytes);
    }
  }
  const fingerprint = fingerprintHash.digest("hex");
  const variantSourceStamp = backgroundVariantAssets
    .map((variant) => `${variant.imageStat.size}:${variant.imageStat.mtimeMs}`)
    .join("|");
  return {
    theme,
    themePath,
    imagePath: realImagePath,
    imageBytes,
    backgroundVariantAssets,
    fingerprint,
    sourceStamp: `${themeStat.size}:${themeStat.mtimeMs}:${imageStat.size}:${imageStat.mtimeMs}${variantSourceStamp ? `|${variantSourceStamp}` : ""}`,
  };
}

async function loadPayload(themeDir = path.join(root, "assets"), candidateTheme = null) {
  const loadedTheme = candidateTheme ?? await loadTheme(themeDir);
  const [petPath, sidebarCompanionPath, sidebarAccountAvatarPath, composerCompanionPath, tiboAvatarPath] =
    await Promise.all([
      resolvePreferredImagePath(path.join(root, "assets", PET_ASSET_NAME)),
      resolvePreferredImagePath(path.join(root, "assets", SIDEBAR_COMPANION_ASSET_NAME)),
      resolvePreferredImagePath(path.join(root, "assets", SIDEBAR_ACCOUNT_AVATAR_ASSET_NAME)),
      resolvePreferredImagePath(path.join(root, "assets", COMPOSER_COMPANION_ASSET_NAME)),
      resolvePreferredImagePath(path.join(root, "assets", TIBO_AVATAR_ASSET_NAME)),
    ]);
  const [css, template, petBytes, sidebarCompanionBytes, sidebarAccountAvatarBytes, composerCompanionBytes, tiboAvatarBytes] = await Promise.all([
    fs.readFile(path.join(root, "assets", "dream-skin.css"), "utf8"),
    fs.readFile(path.join(root, "assets", "renderer-inject.js"), "utf8"),
    fs.readFile(petPath),
    fs.readFile(sidebarCompanionPath),
    fs.readFile(sidebarAccountAvatarPath),
    fs.readFile(composerCompanionPath),
    fs.readFile(tiboAvatarPath),
  ]);
  /* The sidebar account avatar and chat avatar intentionally share one source
     file. Keep one byte buffer and one data URL; the renderer aliases the two
     roles so the same avatar is not shipped twice in the bootstrap script. */
  for (const [label, bytes] of [
    ["Pet sprite", petBytes],
    ["Sidebar companion", sidebarCompanionBytes],
    ["Sidebar account avatar", sidebarAccountAvatarBytes],
    ["Chat avatar", sidebarAccountAvatarBytes],
    ["Composer companion", composerCompanionBytes],
    ["Tibo X avatar", tiboAvatarBytes],
  ]) {
    if (bytes.length < 1 || bytes.length > MAX_ART_BYTES) {
      throw new Error(`${label} asset must be between 1 byte and ${MAX_ART_BYTES / 1024 / 1024} MB`);
    }
  }
  const mime = imageMimeForPath(loadedTheme.imagePath);
  const artDataUrl = `data:${mime};base64,${loadedTheme.imageBytes.toString("base64")}`;
  const sidebarAccountAvatarDataUrl = `data:${imageMimeForPath(sidebarAccountAvatarPath)};base64,${sidebarAccountAvatarBytes.toString("base64")}`;
  const tiboAvatarDataUrl = `data:${imageMimeForPath(tiboAvatarPath)};base64,${tiboAvatarBytes.toString("base64")}`;
  const lazyAssetIds = {
    pet: "asset:pet",
    sidebarCompanion: "asset:sidebar-companion",
    composerCompanion: "asset:composer-companion",
    tiboAvatar: "asset:tibo-avatar",
  };
  const lazyAssets = {
    [lazyAssetIds.pet]: `data:${imageMimeForPath(petPath)};base64,${petBytes.toString("base64")}`,
    [lazyAssetIds.sidebarCompanion]: `data:${imageMimeForPath(sidebarCompanionPath)};base64,${sidebarCompanionBytes.toString("base64")}`,
    [lazyAssetIds.composerCompanion]: `data:${imageMimeForPath(composerCompanionPath)};base64,${composerCompanionBytes.toString("base64")}`,
    [lazyAssetIds.tiboAvatar]: `data:${imageMimeForPath(tiboAvatarPath)};base64,${tiboAvatarBytes.toString("base64")}`,
  };
  const defaultBackgroundVariant = typeof loadedTheme.theme.defaultBackgroundVariant === "string"
    ? loadedTheme.theme.defaultBackgroundVariant : "";
  const variantAssetIds = {};
  const variantAssetDataKeys = new Map();
  for (const variant of loadedTheme.backgroundVariantAssets || []) {
    const manifest = {};
    for (const key of VARIANT_ASSET_KEYS) {
      const asset = variant.assets?.[key];
      if (!asset) continue;
      let assetId = variantAssetDataKeys.get(asset.relativePath);
      if (!assetId) {
        assetId = `asset:variant:${variant.id}:${key}`;
        variantAssetDataKeys.set(asset.relativePath, assetId);
        const extension = path.extname(asset.path).toLowerCase();
        const mime = extension === ".jpg" || extension === ".jpeg" ? "image/jpeg"
          : extension === ".webp" ? "image/webp" : "image/png";
        lazyAssets[assetId] = `data:${mime};base64,${asset.imageBytes.toString("base64")}`;
      }
      manifest[key] = assetId;
    }
    if (Object.keys(manifest).length) variantAssetIds[variant.id] = manifest;
  }
  const backgroundVariantsData = (loadedTheme.backgroundVariantAssets || []).map((variant) => {
    const extension = path.extname(variant.imagePath).toLowerCase();
    const mime = extension === ".jpg" || extension === ".jpeg" ? "image/jpeg"
      : extension === ".webp" ? "image/webp" : "image/png";
    const sharedAsset = Buffer.compare(variant.imageBytes, loadedTheme.imageBytes) === 0 ? "art" : null;
    const resourceId = sharedAsset || variant.id === defaultBackgroundVariant
      ? null : `asset:background:${variant.id}`;
    const encodedDataUrl = sharedAsset
      ? null : `data:${mime};base64,${variant.imageBytes.toString("base64")}`;
    if (resourceId) {
      lazyAssets[resourceId] = encodedDataUrl;
    }
    return {
      id: variant.id,
      label: variant.label,
      image: variant.image,
      colors: variant.colors,
      art: variant.art,
      artMetadata: variant.artMetadata,
      assets: variantAssetIds[variant.id] || {},
      ...(variant.id === defaultBackgroundVariant && !sharedAsset
        ? { dataUrl: encodedDataUrl }
        : {}),
      ...(resourceId && variant.id !== defaultBackgroundVariant ? { resourceId } : {}),
      ...(sharedAsset ? { sharedAsset } : {}),
    };
  });
  const lazyAssetManifest = {
    assets: lazyAssetIds,
    variants: variantAssetIds,
    backgrounds: Object.fromEntries(
      backgroundVariantsData
        .filter((variant) => variant.resourceId)
        .map((variant) => [variant.id, variant.resourceId]),
    ),
  };
  const styleRevision = createHash("sha256").update(css).digest("hex").slice(0, 20);
  loadedTheme.theme.artKey = createHash("sha256")
    .update(loadedTheme.imageBytes).digest("hex").slice(0, 20);
  const revision = createHash("sha256")
    .update(SKIN_VERSION)
    .update(css)
    .update(template)
    .update(petBytes)
    .update(sidebarCompanionBytes)
    .update(sidebarAccountAvatarBytes)
    .update(composerCompanionBytes)
    .update(tiboAvatarBytes)
    .update(loadedTheme.fingerprint)
    .update(JSON.stringify(variantAssetIds))
    .update(JSON.stringify(
      (loadedTheme.backgroundVariantAssets || []).map((variant) => ({
        id: variant.id,
        assets: Object.fromEntries(
          Object.entries(variant.assets || {}).map(([key, asset]) => [key, asset.imageBytes.toString("base64")]),
        ),
      })),
    ))
    .update(JSON.stringify(backgroundVariantsData))
    .update(JSON.stringify(loadedTheme.theme))
    .digest("hex")
    .slice(0, 20);
  const payload = template
    .replace("__DREAM_SKIN_CSS_JSON__", JSON.stringify(css))
    .replace("__DREAM_SKIN_ART_JSON__", JSON.stringify(artDataUrl))
    .replace("__DREAM_SKIN_BACKGROUND_VARIANTS_JSON__", JSON.stringify(backgroundVariantsData))
    .replace("__DREAM_SKIN_PET_JSON__", "null")
    .replace("__DREAM_SKIN_SIDEBAR_COMPANION_JSON__", "null")
    .replace("__DREAM_SKIN_SIDEBAR_ACCOUNT_AVATAR_JSON__", JSON.stringify(sidebarAccountAvatarDataUrl))
    .replace("__DREAM_SKIN_COMPOSER_COMPANION_JSON__", "null")
    .replace("__DREAM_SKIN_TIBO_AVATAR_JSON__", JSON.stringify(tiboAvatarDataUrl))
    .replace("__DREAM_SKIN_LAZY_ASSET_MANIFEST_JSON__", JSON.stringify(lazyAssetManifest))
    .replace("__DREAM_SKIN_RENDERER_ACTIVITY_BINDING_NAME_JSON__", JSON.stringify(RENDERER_ACTIVITY_BINDING_NAME))
    .replace("__DREAM_SKIN_THEME_JSON__", JSON.stringify(loadedTheme.theme))
    .replace("__DREAM_SKIN_VERSION_JSON__", JSON.stringify(SKIN_VERSION))
    .replace("__DREAM_SKIN_STYLE_REVISION_JSON__", JSON.stringify(styleRevision))
    .replace("__DREAM_SKIN_PAYLOAD_REVISION_JSON__", JSON.stringify(revision));
  const sourceStamp = await readThemeSourceStamp(loadedTheme);
  const backgroundVariantPaths = (loadedTheme.backgroundVariantAssets || [])
    .map((variant) => variant.imagePath);
  const backgroundVariantAssetPaths = (loadedTheme.backgroundVariantAssets || [])
    .flatMap((variant) => Object.values(variant.assets || {}).map((asset) => asset.path));
  const { imageBytes: _imageBytes, backgroundVariantAssets: _backgroundVariantAssets, ...themeState } = loadedTheme;
  return {
    ...themeState,
    backgroundVariantPaths,
    backgroundVariantAssetPaths,
    sourceStamp,
    payload,
    revision,
    lazyAssets,
  };
}

async function fileExists(filePath) {
  if (!filePath) return false;
  try {
    return (await fs.stat(filePath)).isFile();
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

const sessionUsageNumber = (value) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const emptySessionTokenUsage = () => ({
  inputTokens: 0,
  cachedInputTokens: 0,
  cacheWriteInputTokens: 0,
  outputTokens: 0,
  reasoningOutputTokens: 0,
  totalTokens: 0,
});

const normalizeLoggedTokenUsage = (value) => {
  if (!value || typeof value !== "object") return null;
  const inputTokens = sessionUsageNumber(value.input_tokens ?? value.inputTokens);
  const cachedInputTokens = sessionUsageNumber(
    value.cached_input_tokens ?? value.cachedInputTokens,
  );
  const cacheWriteInputTokens = sessionUsageNumber(
    value.cache_write_input_tokens ?? value.cacheWriteInputTokens,
  );
  const outputTokens = sessionUsageNumber(value.output_tokens ?? value.outputTokens);
  const reasoningOutputTokens = sessionUsageNumber(
    value.reasoning_output_tokens ?? value.reasoningOutputTokens,
  );
  const totalTokens = sessionUsageNumber(value.total_tokens ?? value.totalTokens);
  if (![inputTokens, cachedInputTokens, cacheWriteInputTokens, outputTokens,
    reasoningOutputTokens, totalTokens].some((entry) => Number.isFinite(entry))) {
    return null;
  }
  const resolvedInput = inputTokens ?? 0;
  const resolvedOutput = outputTokens ?? 0;
  return {
    inputTokens: resolvedInput,
    cachedInputTokens: cachedInputTokens ?? 0,
    cacheWriteInputTokens: cacheWriteInputTokens ?? 0,
    outputTokens: resolvedOutput,
    reasoningOutputTokens: reasoningOutputTokens ?? 0,
    totalTokens: totalTokens ?? resolvedInput + resolvedOutput,
  };
};

const addSessionTokenUsage = (target, source) => {
  if (!target || !source) return;
  for (const key of [
    "inputTokens", "cachedInputTokens", "cacheWriteInputTokens", "outputTokens",
    "reasoningOutputTokens", "totalTokens",
  ]) {
    target[key] = (target[key] || 0) + (Number(source[key]) || 0);
  }
};

const normalizedPricingModel = (model) => {
  const value = String(model || "").trim().toLowerCase();
  if (value === "gpt-5.6") return "gpt-5.6-sol";
  if (value.includes("gpt-5.6-sol")) return "gpt-5.6-sol";
  if (value.includes("gpt-5.6-terra")) return "gpt-5.6-terra";
  if (value.includes("gpt-5.6-luna")) return "gpt-5.6-luna";
  if (value.includes("gpt-5.3-codex")) return "gpt-5.3-codex";
  return value;
};

const sessionModelLabel = (model, effort = "") => {
  const normalized = normalizedPricingModel(model);
  const family = normalized === "gpt-5.6-sol" ? "Sol"
    : normalized === "gpt-5.6-terra" ? "Terra"
      : normalized === "gpt-5.6-luna" ? "Luna"
        : normalized === "gpt-5.3-codex" ? "GPT-5.3-Codex"
          : String(model || "当前模型");
  return effort ? `${family} ${effort}` : family;
};

const createSessionUsageParserState = () => ({
  latestTotalUsage: null,
  latestLastUsage: null,
  latestTokenTimestamp: "",
  modelContextWindow: null,
  quotaUsedPercent: null,
  quotaResetAt: null,
  quotaWindowMinutes: null,
  planType: "",
  activeModel: "",
  activeEffort: "",
  currentTurn: null,
  modelUsages: new Map(),
  publicCost: {
    inputUsd: 0,
    cachedInputUsd: 0,
    cacheWriteUsd: 0,
    outputUsd: 0,
    totalUsd: 0,
    known: true,
    longContextRequests: 0,
  },
  tokenCountRecords: 0,
});

const addPublicSessionCost = (state, model, usage) => {
  const normalizedModel = normalizedPricingModel(model);
  const pricing = OPENAI_PUBLIC_PRICING[normalizedModel];
  if (!pricing) {
    state.publicCost.known = false;
    return;
  }
  const longContext = usage.inputTokens > OPENAI_PUBLIC_LONG_CONTEXT_THRESHOLD;
  const rates = longContext ? pricing.long : pricing.short;
  if (longContext) state.publicCost.longContextRequests += 1;
  const cachedInputTokens = Math.min(usage.inputTokens, usage.cachedInputTokens);
  const uncachedInputTokens = Math.max(0, usage.inputTokens - cachedInputTokens);
  const inputUsd = uncachedInputTokens * rates.input / 1e6;
  const cachedInputUsd = cachedInputTokens * rates.cachedInput / 1e6;
  const cacheWriteUsd = usage.cacheWriteInputTokens * rates.cacheWrite / 1e6;
  const outputUsd = usage.outputTokens * rates.output / 1e6;
  state.publicCost.inputUsd += inputUsd + cachedInputUsd + cacheWriteUsd;
  state.publicCost.cachedInputUsd += cachedInputUsd;
  state.publicCost.cacheWriteUsd += cacheWriteUsd;
  state.publicCost.outputUsd += outputUsd;
  state.publicCost.totalUsd += inputUsd + cachedInputUsd + cacheWriteUsd + outputUsd;
};

const addModelSessionUsage = (state, model, effort, usage) => {
  const rawModel = String(model || "").trim();
  const key = rawModel || "unknown";
  const existing = state.modelUsages.get(key) || {
    model: rawModel,
    effort: String(effort || "").trim(),
    usage: emptySessionTokenUsage(),
  };
  if (!existing.effort && effort) existing.effort = String(effort).trim();
  addSessionTokenUsage(existing.usage, usage);
  state.modelUsages.set(key, existing);
  addPublicSessionCost(state, rawModel, usage);
};

const parseSessionUsageLine = (state, line) => {
  if (!line || (!line.includes('"token_count"') && !line.includes('"task_started"') &&
    !line.includes('"model"'))) return;
  let record;
  try { record = JSON.parse(line); } catch { return; }
  const payload = record?.payload;
  if (!payload || typeof payload !== "object") return;
  if (payload.type === "task_started") {
    state.currentTurn = {
      id: String(payload.turn_id || ""),
      model: state.activeModel,
      effort: state.activeEffort,
      usage: emptySessionTokenUsage(),
    };
    const taskWindow = sessionUsageNumber(payload.model_context_window);
    if (taskWindow != null) state.modelContextWindow = taskWindow;
  }
  if ((record.type === "system" || record.type === "turn_context") &&
    typeof payload.model === "string") {
    state.activeModel = payload.model;
    if (typeof payload.effort === "string") state.activeEffort = payload.effort;
    if (state.currentTurn) {
      state.currentTurn.model = state.activeModel;
      state.currentTurn.effort = state.activeEffort;
    }
  }
  if (payload.type !== "token_count") return;
  const info = payload.info;
  if (!info || typeof info !== "object") return;
  const lastUsage = normalizeLoggedTokenUsage(info.last_token_usage || info.lastTokenUsage);
  const totalUsage = normalizeLoggedTokenUsage(info.total_token_usage || info.totalTokenUsage);
  if (!lastUsage && !totalUsage) return;
  state.tokenCountRecords += 1;
  state.latestLastUsage = lastUsage;
  state.latestTotalUsage = totalUsage || state.latestTotalUsage;
  state.latestTokenTimestamp = String(record.timestamp || "");
  const contextWindow = sessionUsageNumber(info.model_context_window);
  if (contextWindow != null) state.modelContextWindow = contextWindow;
  const primary = payload.rate_limits?.primary;
  const usedPercent = sessionUsageNumber(primary?.used_percent);
  if (usedPercent != null) state.quotaUsedPercent = usedPercent;
  if (primary?.reset_at != null) state.quotaResetAt = primary.reset_at;
  const windowMinutes = sessionUsageNumber(primary?.window_minutes);
  if (windowMinutes != null) state.quotaWindowMinutes = windowMinutes;
  const planType = payload.rate_limits?.plan_type || payload.rate_limits?.planType;
  if (typeof planType === "string" && planType) state.planType = planType;
  if (lastUsage) {
    const model = state.currentTurn?.model || state.activeModel;
    const effort = state.currentTurn?.effort || state.activeEffort;
    addModelSessionUsage(state, model, effort, lastUsage);
    if (state.currentTurn) addSessionTokenUsage(state.currentTurn.usage, lastUsage);
  }
};

const sessionUsageFallbackTotal = (state) => {
  const total = emptySessionTokenUsage();
  for (const entry of state.modelUsages.values()) addSessionTokenUsage(total, entry.usage);
  return total;
};

const buildSessionUsageSnapshot = (state, threadId = "") => {
  const usage = state.latestTotalUsage || sessionUsageFallbackTotal(state);
  const currentTurn = state.currentTurn?.usage || emptySessionTokenUsage();
  const latestModel = state.currentTurn?.model || state.activeModel ||
    [...state.modelUsages.values()].at(-1)?.model || "";
  const latestEffort = state.currentTurn?.effort || state.activeEffort ||
    [...state.modelUsages.values()].at(-1)?.effort || "";
  const modelId = normalizedPricingModel(latestModel);
  const cost = state.publicCost;
  const publicCost = state.tokenCountRecords && cost.known
    ? {
        status: "available",
        totalUsd: cost.totalUsd,
        inputUsd: cost.inputUsd,
        cachedInputUsd: cost.cachedInputUsd,
        cacheWriteUsd: cost.cacheWriteUsd,
        outputUsd: cost.outputUsd,
        model: modelId,
        modelLabel: sessionModelLabel(latestModel, latestEffort),
        source: "OpenAI API 公开标准价格",
        priceRevision: OPENAI_PUBLIC_PRICE_REVISION,
        longContextRequests: cost.longContextRequests,
      }
    : {
        status: "unavailable",
        reason: state.tokenCountRecords ? "model-price-unavailable" : "token-usage-unavailable",
        model: modelId,
        modelLabel: sessionModelLabel(latestModel, latestEffort),
        source: "OpenAI API 公开标准价格",
        priceRevision: OPENAI_PUBLIC_PRICE_REVISION,
      };
  return {
    status: state.tokenCountRecords ? "available" : "unavailable",
    source: "session-log",
    threadId: SESSION_THREAD_ID_PATTERN.test(threadId) ? threadId : "",
    updatedAt: state.latestTokenTimestamp || new Date().toISOString(),
    model: latestModel,
    modelId,
    modelLabel: sessionModelLabel(latestModel, latestEffort),
    reasoningEffort: latestEffort,
    modelContextWindow: state.modelContextWindow,
    inputTokens: usage.inputTokens,
    cachedInputTokens: usage.cachedInputTokens,
    cacheWriteInputTokens: usage.cacheWriteInputTokens,
    outputTokens: usage.outputTokens,
    reasoningOutputTokens: usage.reasoningOutputTokens,
    totalTokens: usage.totalTokens || usage.inputTokens + usage.outputTokens,
    exactBreakdown: true,
    cacheExact: true,
    currentTurn: {
      inputTokens: currentTurn.inputTokens,
      cachedInputTokens: currentTurn.cachedInputTokens,
      cacheWriteInputTokens: currentTurn.cacheWriteInputTokens,
      outputTokens: currentTurn.outputTokens,
      reasoningOutputTokens: currentTurn.reasoningOutputTokens,
      totalTokens: currentTurn.totalTokens || currentTurn.inputTokens + currentTurn.outputTokens,
    },
    quota: {
      usedPercent: state.quotaUsedPercent,
      resetAt: state.quotaResetAt,
      windowMinutes: state.quotaWindowMinutes,
      planType: state.planType,
    },
    publicCost,
  };
};

class CodexSessionUsageReader {
  constructor(filePath) {
    this.filePath = filePath;
    this.offset = 0;
    this.carry = "";
    this.decoder = new StringDecoder("utf8");
    this.state = createSessionUsageParserState();
  }

  reset() {
    this.offset = 0;
    this.carry = "";
    this.decoder = new StringDecoder("utf8");
    this.state = createSessionUsageParserState();
  }

  processText(text) {
    if (!text) return;
    this.carry += text;
    const lines = this.carry.split("\n");
    this.carry = lines.pop() || "";
    for (const line of lines) parseSessionUsageLine(this.state, line.replace(/\r$/, ""));
  }

  async update() {
    const stat = await fs.stat(this.filePath);
    if (stat.size < this.offset) this.reset();
    if (stat.size > this.offset) {
      const handle = await fs.open(this.filePath, "r");
      try {
        let position = this.offset;
        while (position < stat.size) {
          const length = Math.min(SESSION_LOG_CHUNK_BYTES, stat.size - position);
          const buffer = Buffer.allocUnsafe(length);
          const result = await handle.read(buffer, 0, length, position);
          if (!result.bytesRead) break;
          position += result.bytesRead;
          this.processText(this.decoder.write(buffer.subarray(0, result.bytesRead)));
        }
        this.offset = position;
      } finally {
        await handle.close();
      }
    }
    return buildSessionUsageSnapshot(this.state);
  }
}

const SESSION_THREAD_ID_EXPRESSION = `(() => {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const priority = [
    "activeThreadId", "currentThreadId", "selectedThreadId", "threadId",
    "localConversationId", "currentConversationId", "conversationId",
    "externalLinkContextMenuConversationId",
  ];
  const candidateFromProps = (props) => {
    if (!props || typeof props !== "object") return null;
    for (const key of priority) {
      const value = props[key];
      if (typeof value === "string" && pattern.test(value)) return value;
    }
    for (const [key, value] of Object.entries(props)) {
      if (/(?:conversation|thread)/i.test(key) && typeof value === "string" && pattern.test(value)) {
        return value;
      }
    }
    return null;
  };
  /* Routes can carry a prefix/suffix around the UUID (for example /c/<id>).
     Keep the full-value validator for props, but scan the path with an
     unanchored expression so those routes still identify the active thread. */
  const routeCandidate = (location.pathname || "").match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  )?.[0];
  if (routeCandidate) return routeCandidate;
  const attributeCandidates = [
    "data-above-composer-conversation-id",
    "data-conversation-id",
    "data-thread-id",
  ];
  for (const attribute of attributeCandidates) {
    const elements = document.querySelectorAll("[" + attribute + "]");
    for (let index = elements.length - 1; index >= Math.max(0, elements.length - 8); index -= 1) {
      const element = elements[index];
      const value = element.getAttribute(attribute);
      if (typeof value === "string" && pattern.test(value)) return value;
    }
  }
  const roots = [
    document.querySelector("main"),
    document.querySelector("[data-content-search-turn-key]"),
  ].filter(Boolean);
  const turns = document.querySelectorAll("[data-turn-key]");
  for (let index = Math.max(0, turns.length - 8); index < turns.length; index += 1) {
    roots.push(turns[index]);
  }
  for (const element of roots) {
    const keys = Object.keys(element);
    const directPropsKey = keys.find((name) => name.startsWith("__reactProps$"));
    const directCandidate = directPropsKey ? candidateFromProps(element[directPropsKey]) : null;
    if (directCandidate) return directCandidate;
    const fiberKey = keys.find((name) =>
      name.startsWith("__reactFiber$") || name.startsWith("__reactInternalInstance$"),
    );
    let fiber = fiberKey ? element[fiberKey] : null;
    /* A bounded parent walk catches the conversation owner without traversing
       the complete React tree during an idle renderer turn. */
    for (let depth = 0; fiber && depth < 5; depth += 1, fiber = fiber.return) {
      const candidate = candidateFromProps(fiber.memoizedProps) || candidateFromProps(fiber.pendingProps);
      if (candidate) return candidate;
    }
  }
  return null;
})()`;

/* Some Codex builds do not expose a semantic conversation attribute. Retain
   the historical Fiber discovery as a slow fallback so session-token display
   stays available, but never run its full-tree walk on the normal poll path. */
const SESSION_THREAD_ID_FIBER_FALLBACK_EXPRESSION = `(() => {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const priority = [
    "activeThreadId", "currentThreadId", "selectedThreadId", "threadId",
    "localConversationId", "currentConversationId", "conversationId",
    "externalLinkContextMenuConversationId",
  ];
  const roots = [
    document.querySelector("main"),
    document.querySelector("[data-content-search-turn-key]"),
    ...[...document.querySelectorAll("[data-turn-key]")].slice(-12),
  ].filter(Boolean);
  const queue = [];
  const seen = new Set();
  const candidates = new Map();
  for (const element of roots) {
    const key = Object.keys(element).find((name) =>
      name.startsWith("__reactFiber$") || name.startsWith("__reactInternalInstance$"),
    );
    if (key) queue.push(element[key]);
  }
  let steps = 0;
  while (queue.length && steps++ < 3000) {
    const fiber = queue.shift();
    if (!fiber || seen.has(fiber)) continue;
    seen.add(fiber);
    for (const props of [fiber.memoizedProps, fiber.pendingProps]) {
      if (!props || typeof props !== "object") continue;
      for (const [key, value] of Object.entries(props)) {
        if ((priority.includes(key) || /(?:conversation|thread)/i.test(key)) &&
          typeof value === "string" && pattern.test(value) && !candidates.has(key)) {
          candidates.set(key, value);
        }
      }
    }
    if (fiber.return) queue.push(fiber.return);
    if (fiber.child) queue.push(fiber.child);
    if (fiber.sibling) queue.push(fiber.sibling);
  }
  for (const key of priority) if (candidates.has(key)) return candidates.get(key);
  for (const value of candidates.values()) return value;
  return null;
})()`;

async function readPageSessionId(session, { fiberFallback = false } = {}) {
  try {
    const expression = fiberFallback
      ? SESSION_THREAD_ID_FIBER_FALLBACK_EXPRESSION : SESSION_THREAD_ID_EXPRESSION;
    const value = await session.evaluate(expression);
    return typeof value === "string" && SESSION_THREAD_ID_PATTERN.test(value) ? value : "";
  } catch {
    return "";
  }
}

async function listCodexSessionLogFiles() {
  const files = [];
  let years;
  try { years = await fs.readdir(SESSION_LOGS_ROOT, { withFileTypes: true }); } catch { return files; }
  for (const year of years.filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
    .sort((left, right) => right.name.localeCompare(left.name))) {
    const yearPath = path.join(SESSION_LOGS_ROOT, year.name);
    let months;
    try { months = await fs.readdir(yearPath, { withFileTypes: true }); } catch { continue; }
    for (const month of months.filter((entry) => entry.isDirectory() && /^\d{2}$/.test(entry.name))
      .sort((left, right) => right.name.localeCompare(left.name))) {
      const monthPath = path.join(yearPath, month.name);
      let days;
      try { days = await fs.readdir(monthPath, { withFileTypes: true }); } catch { continue; }
      for (const day of days.filter((entry) => entry.isDirectory() && /^\d{2}$/.test(entry.name))
        .sort((left, right) => right.name.localeCompare(left.name))) {
        const dayPath = path.join(monthPath, day.name);
        let entries;
        try { entries = await fs.readdir(dayPath, { withFileTypes: true }); } catch { continue; }
        for (const entry of entries) {
          if (entry.isFile() && /^rollout-.*\.jsonl$/i.test(entry.name)) {
            files.push(path.join(dayPath, entry.name));
          }
        }
      }
    }
  }
  return files;
}

async function findCodexSessionLog(threadId, newest = false) {
  const files = await listCodexSessionLogFiles();
  const normalizedThreadId = String(threadId || "").trim().toLowerCase();
  const threadMarker = normalizedThreadId ? `-${normalizedThreadId}` : "";
  /* Codex can split one task into a base rollout and continuation files such
     as `-${threadId}_01...jsonl`. They contain cumulative token_count data;
     select the newest matching file instead of reading only the base file or
     adding the cumulative totals together. */
  const candidates = threadMarker
    ? files.filter((filePath) => {
      const name = path.basename(filePath).toLowerCase();
      return name.endsWith(".jsonl") &&
        (name.endsWith(`${threadMarker}.jsonl`) || name.includes(`${threadMarker}_`));
    })
    : files;
  if (!candidates.length) return null;
  if (!newest || candidates.length === 1) return candidates[0];
  let newestPath = null;
  let newestMtime = 0;
  for (const filePath of candidates) {
    try {
      const stat = await fs.stat(filePath);
      if (stat.mtimeMs > newestMtime) {
        newestMtime = stat.mtimeMs;
        newestPath = filePath;
      }
    } catch {}
  }
  return newestPath || candidates[0];
}

async function setSessionUsageSnapshot(session, snapshot) {
  const expression = `globalThis[${JSON.stringify(SESSION_USAGE_GLOBAL_KEY)}] = ${JSON.stringify(snapshot)}; true`;
  await session.evaluate(expression);
}

const normalizeSessionThreadId = (value) => {
  const candidate = String(value || "").trim();
  return SESSION_THREAD_ID_PATTERN.test(candidate) ? candidate.toLowerCase() : "";
};

const unavailableSessionUsageSnapshot = (threadId, reason) => ({
  status: "unavailable",
  source: "session-log",
  threadId: normalizeSessionThreadId(threadId),
  updatedAt: new Date().toISOString(),
  reason,
});

const resetSessionUsageState = (state, threadId = "") => {
  state.threadId = normalizeSessionThreadId(threadId);
  state.filePath = null;
  state.reader = null;
  state.lastFileSearchAt = 0;
  state.lastSearchedThreadId = "";
  state.snapshotFingerprint = "";
};

const sessionUsageFingerprint = (snapshot) => JSON.stringify({
  status: snapshot.status,
  threadId: snapshot.threadId,
  model: snapshot.model,
  inputTokens: snapshot.inputTokens,
  cachedInputTokens: snapshot.cachedInputTokens,
  cacheWriteInputTokens: snapshot.cacheWriteInputTokens,
  outputTokens: snapshot.outputTokens,
  totalTokens: snapshot.totalTokens,
  publicCost: snapshot.publicCost,
});

async function publishSessionUsageSnapshot(session, state, snapshot, force = false) {
  const fingerprint = sessionUsageFingerprint(snapshot);
  if (force || fingerprint !== state.snapshotFingerprint) {
    await setSessionUsageSnapshot(session, snapshot).catch(() => {});
    state.snapshotFingerprint = fingerprint;
  }
}

async function syncSessionUsageSnapshot(session, state, force = false) {
  if (!session || session.closed) return;
  const now = Date.now();
  if (!force && now - (state.lastPollAt || 0) < SESSION_USAGE_POLL_MS) return;
  state.lastPollAt = now;
  /* The first scan is immediate; after that, even a temporarily missing
     thread id follows the same backoff. Otherwise the slow Fiber fallback
     would run on every usage poll while a route is between React commits. */
  const threadScanDue = !state.lastThreadScanAt ||
    now - state.lastThreadScanAt >= SESSION_THREAD_SCAN_MS;
  if (threadScanDue) {
    let observedThreadId = normalizeSessionThreadId(await readPageSessionId(session));
    if (!observedThreadId) {
      observedThreadId = normalizeSessionThreadId(await readPageSessionId(session, { fiberFallback: true }));
    }
    const previousThreadId = normalizeSessionThreadId(state.threadId);
    state.lastThreadScanAt = now;
    if (observedThreadId !== previousThreadId) {
      resetSessionUsageState(state, observedThreadId);
      await publishSessionUsageSnapshot(
        session,
        state,
        unavailableSessionUsageSnapshot(
          observedThreadId,
          observedThreadId ? "thread-changed" : "thread-id-not-ready",
        ),
        true,
      );
    } else {
      state.threadId = observedThreadId;
    }
  }

  /* Never fall back to the newest log when the active conversation is not
     known. That fallback can surface a previous conversation's Token total
     while the renderer is between routes. */
  if (!state.threadId) {
    await publishSessionUsageSnapshot(
      session,
      state,
      unavailableSessionUsageSnapshot("", "thread-id-not-found"),
    );
    return;
  }

  const threadChanged = state.lastSearchedThreadId !== state.threadId;
  /* Re-scan periodically even after a reader exists: a long-running task may
     create a continuation rollout after the first scan. */
  const shouldSearch = !state.filePath || threadChanged ||
    now - (state.lastFileSearchAt || 0) >= SESSION_LOG_SEARCH_MS;
  if (shouldSearch) {
    state.filePath = await findCodexSessionLog(state.threadId, true);
    state.lastFileSearchAt = now;
    state.lastSearchedThreadId = state.threadId;
    if (state.reader && state.reader.filePath !== state.filePath) state.reader = null;
  }
  let snapshot;
  if (state.filePath) {
    try {
      if (!state.reader) state.reader = new CodexSessionUsageReader(state.filePath);
      snapshot = await state.reader.update();
      snapshot.threadId = state.threadId || snapshot.threadId;
    } catch {
      state.reader = null;
      snapshot = null;
    }
  }
  snapshot ||= {
    status: "unavailable",
    source: "session-log",
    threadId: state.threadId || "",
    updatedAt: new Date().toISOString(),
    reason: state.threadId ? "session-log-not-found" : "thread-id-not-found",
  };
  await publishSessionUsageSnapshot(session, state, snapshot, force);
}

async function readThemeSourceStamp(loadedTheme) {
  const variantAssetPaths = loadedTheme.backgroundVariantAssets
    ? loadedTheme.backgroundVariantAssets
      .flatMap((variant) => Object.values(variant.assets || {}).map((asset) => asset.path))
    : (loadedTheme.backgroundVariantAssetPaths || []);
  const baseAssetPaths = await Promise.all([
    resolvePreferredImagePath(path.join(root, "assets", PET_ASSET_NAME)),
    resolvePreferredImagePath(path.join(root, "assets", SIDEBAR_COMPANION_ASSET_NAME)),
    resolvePreferredImagePath(path.join(root, "assets", SIDEBAR_ACCOUNT_AVATAR_ASSET_NAME)),
    resolvePreferredImagePath(path.join(root, "assets", COMPOSER_COMPANION_ASSET_NAME)),
    resolvePreferredImagePath(path.join(root, "assets", TIBO_AVATAR_ASSET_NAME)),
  ]);
  const sourcePaths = [
    loadedTheme.themePath,
    loadedTheme.imagePath,
    ...(loadedTheme.backgroundVariantPaths ||
      (loadedTheme.backgroundVariantAssets || []).map((variant) => variant.imagePath)),
    ...variantAssetPaths,
    path.join(root, "assets", "dream-skin.css"),
    path.join(root, "assets", "renderer-inject.js"),
    ...baseAssetPaths,
  ];
  const stats = await Promise.all(sourcePaths.map((sourcePath) => fs.stat(sourcePath)));
  return stats.map((stat) => `${stat.size}:${stat.mtimeMs}`).join("|");
}

async function probeSession(session) {
  return session.evaluate(`(() => {
    const markers = {
      shell: Boolean(document.querySelector(${selectorLiteral("shell-main")})),
      sidebar: Boolean(document.querySelector(${selectorLiteral("left-panel")})),
      composer: Boolean(document.querySelector(${selectorLiteral("composer-chrome")})),
      main: Boolean(document.querySelector(${selectorLiteral("home-route")})),
    };
    const settings = Boolean(document.querySelector(${selectorLiteral("appearance-radio")})) ||
      Boolean(document.querySelector(${stableTestidLiteral("theme-preview")}));
    return {
      markers,
      codex: location.protocol === 'app:' &&
        ((markers.shell && (markers.sidebar || markers.composer)) || settings || markers.main),
    };
  })()`);
}

async function waitForCodexProbe(session, timeoutMs = 1800) {
  const deadline = Date.now() + timeoutMs;
  let probe = null;
  while (Date.now() < deadline) {
    try {
      probe = await probeSession(session);
      if (probe?.codex) return probe;
    } catch {
      // The renderer may be between documents while the early payload waits.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return probe;
}

async function connectTarget(target, port) {
  return new CdpSession(target, port).open();
}

async function connectCodexTargets(port, timeoutMs, expectedBrowserId) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const targets = await listAppTargets(port, expectedBrowserId);
      const connected = [];
      for (const target of targets) {
        let session;
        try {
          session = await connectTarget(target, port);
          const probe = await probeSession(session);
          if (probe?.codex) connected.push({ target, session, probe });
          else session.close();
        } catch (error) {
          session?.close();
          lastError = error;
        }
      }
      if (connected.length) return connected;
      lastError = new Error("No page matched the expected Codex shell markers");
    } catch (error) {
      if (error instanceof CdpIdentityMismatchError) throw error;
      if (isCdpEndpointUnavailable(error)) {
        throw new Error(`CDP endpoint unavailable on 127.0.0.1:${port}: ${error.message}`);
      }
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`No verified Codex renderer on 127.0.0.1:${port}: ${lastError?.message ?? "timed out"}`);
}

async function claimRendererOwner(session, ownerToken) {
  if (!session || session.closed || !ownerToken) return false;
  if (session.__dreamSkinOwnerToken === ownerToken) return true;
  await session.evaluate(
    `globalThis[${JSON.stringify(RENDERER_OWNER_KEY)}] = ${JSON.stringify(ownerToken)}; true`,
  );
  session.__dreamSkinOwnerToken = ownerToken;
  return true;
}

async function applyToSession(session, payload, ownerToken = null) {
  await claimRendererOwner(session, ownerToken || session?.__dreamSkinOwnerToken || null);
  return session.evaluate(payload);
}

async function prepareLazyAssetBinding(session, lazyAssets = {}) {
  if (!session || session.closed) throw new Error("Cannot prepare lazy assets on a closed CDP session");
  session.__dreamSkinLazyAssets = lazyAssets && typeof lazyAssets === "object" ? lazyAssets : {};
  if (session.__dreamSkinLazyBindingReady) return;
  session.on("Runtime.bindingCalled", (params) => {
    if (params?.name !== LAZY_ASSET_BINDING_NAME) return;
    let request = null;
    try { request = JSON.parse(String(params.payload || "")); } catch {}
    const requestId = typeof request?.requestId === "string" ? request.requestId : "";
    const assetId = typeof request?.assetId === "string" ? request.assetId : "";
    if (!requestId || !assetId) return;
    const dataUrl = typeof session.__dreamSkinLazyAssets?.[assetId] === "string"
      ? session.__dreamSkinLazyAssets[assetId] : null;
    const responseExpression = `globalThis[${JSON.stringify(LAZY_ASSET_RESPONSE_KEY)}]?.(${JSON.stringify(requestId)}, ${JSON.stringify(dataUrl)})`;
    void session.evaluate(responseExpression).catch(() => {});
  });
  await session.send("Runtime.addBinding", { name: LAZY_ASSET_BINDING_NAME });
  session.__dreamSkinLazyBindingReady = true;
}

const isAllowedPublicFetchUrl = (value) => {
  try {
    const url = new URL(String(value || ""));
    if (url.protocol !== "https:") return false;
    const hostname = url.hostname.toLowerCase();
    if (hostname === "x.com") return url.pathname === "/thsottiaux";
    if (hostname !== "codexradar.com" && hostname !== "www.codexradar.com") return false;
    return new Set([
      "/",
      "/api/intelligence-efficiency-metrics",
      "/api/intelligence-efficiency",
      "/data/intelligence-efficiency.json",
    ]).has(url.pathname);
  } catch {
    return false;
  }
};

async function preparePublicFetchBinding(session) {
  if (!session || session.closed) throw new Error("Cannot prepare public fetch on a closed CDP session");
  if (session.__dreamSkinPublicFetchBindingReady) return;
  session.on("Runtime.bindingCalled", (params) => {
    if (params?.name !== PUBLIC_FETCH_BINDING_NAME) return;
    let request = null;
    try { request = JSON.parse(String(params.payload || "")); } catch {}
    const requestId = typeof request?.requestId === "string" ? request.requestId : "";
    const url = typeof request?.url === "string" ? request.url : "";
    if (!requestId) return;
    const respond = (body) => {
      const responseExpression = `globalThis[${JSON.stringify(PUBLIC_FETCH_RESPONSE_KEY)}]?.(${JSON.stringify(requestId)}, ${JSON.stringify(body)})`;
      void session.evaluate(responseExpression).catch(() => {});
    };
    if (!isAllowedPublicFetchUrl(url)) {
      respond(null);
      return;
    }
    void (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(url, {
          method: "GET",
          redirect: "follow",
          cache: "no-store",
          credentials: "omit",
          headers: {
            Accept: "application/json, text/html, application/xhtml+xml;q=0.9",
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36",
          },
          signal: controller.signal,
        });
        if (!response.ok || !isAllowedPublicFetchUrl(response.url)) {
          respond(null);
          return;
        }
        const body = await response.text();
        respond(Buffer.byteLength(body, "utf8") <= PUBLIC_FETCH_MAX_BODY_BYTES ? body : null);
      } catch {
        respond(null);
      } finally {
        clearTimeout(timeout);
      }
    })();
  });
  await session.send("Runtime.addBinding", { name: PUBLIC_FETCH_BINDING_NAME });
  session.__dreamSkinPublicFetchBindingReady = true;
}

async function prepareRendererActivityBinding(session) {
  if (!session || session.closed) throw new Error("Cannot prepare renderer activity on a closed CDP session");
  if (session.__dreamSkinRendererActivityBindingReady) return;
  session.__dreamSkinVisibility = "unknown";
  session.on("Runtime.bindingCalled", (params) => {
    if (params?.name !== RENDERER_ACTIVITY_BINDING_NAME) return;
    let report = null;
    try { report = JSON.parse(String(params.payload || "")); } catch {}
    if (report?.type !== "visibility") return;
    const visibility = report.state === "visible" ? "visible"
      : report.state === "hidden" ? "hidden" : null;
    if (!visibility) return;
    session.__dreamSkinVisibility = visibility;
    session.__dreamSkinVisibilityChangedAt = Date.now();
  });
  await session.send("Runtime.addBinding", { name: RENDERER_ACTIVITY_BINDING_NAME });
  session.__dreamSkinRendererActivityBindingReady = true;
}

async function seedLazyAssetsForSession(session, lazyAssets = {}) {
  if (!session || session.closed || !lazyAssets || typeof lazyAssets !== "object") return;
  /* A one-shot injector closes its CDP socket after the first paint, so the
     Runtime binding cannot answer a later background-menu request. Keep a
     small post-bootstrap fallback for the currently painted variant; watch
     mode keeps other variants demand-loaded through the binding above. */
  await session.evaluate(`globalThis[${JSON.stringify(LAZY_ASSET_FALLBACK_KEY)}] = ${JSON.stringify(lazyAssets)}; true`);
}

const ONE_SHOT_BASE_LAZY_ASSET_IDS = new Set([
  "asset:pet",
  "asset:sidebar-companion",
  "asset:composer-companion",
  "asset:tibo-avatar",
]);

async function currentVariantLazyAssetsForSession(session, lazyAssets = {}) {
  if (!session || session.closed || !lazyAssets || typeof lazyAssets !== "object") return {};
  let selection = null;
  try {
    selection = await session.evaluate(`(() => {
      const runtime = globalThis.__CODEX_DREAM_SKIN_STATE__;
      const variantId = runtime?.activeBackgroundVariantId?.()
        || document.documentElement?.getAttribute("data-dream-background-variant")
        || "";
      const variant = runtime?.backgroundVariants?.find?.((candidate) => candidate?.id === variantId);
      if (!variant?.id) return null;
      return {
        assetIds: Object.values(variant.assets || {}).filter((assetId) => typeof assetId === "string"),
        backgroundId: typeof variant.resourceId === "string" ? variant.resourceId : "",
      };
    })()`);
  } catch {}
  if (!selection || !Array.isArray(selection.assetIds)) return lazyAssets;
  const activeAssetIds = new Set([
    ...ONE_SHOT_BASE_LAZY_ASSET_IDS,
    ...selection.assetIds,
    ...(selection.backgroundId ? [selection.backgroundId] : []),
  ]);
  return Object.fromEntries(Object.entries(lazyAssets).filter(([assetId]) =>
    activeAssetIds.has(assetId)));
}

export function earlyPayloadFor(payload, revision, earlyGeneration = revision, ownerToken = "") {
  return `(() => {
    const generationKey = "__CODEX_DREAM_SKIN_EARLY_GENERATION__";
    const appliedKey = "__CODEX_DREAM_SKIN_EARLY_APPLIED__";
    const generation = ${JSON.stringify(earlyGeneration)};
    const ownerKey = ${JSON.stringify(RENDERER_OWNER_KEY)};
    const ownerToken = ${JSON.stringify(ownerToken)};
    if (ownerToken) window[ownerKey] = ownerToken;
    window[generationKey] = generation;
    let bootstrapTimer = null;
    let timeout = null;
    let domReadyListener = null;
    const stop = () => {
      if (bootstrapTimer) clearInterval(bootstrapTimer);
      bootstrapTimer = null;
      if (timeout) clearTimeout(timeout);
      timeout = null;
      if (domReadyListener) {
        document.removeEventListener?.("DOMContentLoaded", domReadyListener);
        domReadyListener = null;
      }
    };
    const hasCodexSurface = () => {
      if (location.protocol !== "app:") return false;
      const shell = document.querySelector(${selectorLiteral("shell-main")});
      const sidebar = document.querySelector(${selectorLiteral("left-panel")});
      const composer = document.querySelector(${selectorLiteral("composer-chrome")});
      const main = document.querySelector(${selectorLiteral("home-route")});
      const settings = document.querySelector(${selectorLiteral("appearance-radio")}) ||
        document.querySelector(${stableTestidLiteral("theme-preview")});
      return Boolean((shell && (sidebar || composer)) || settings || main);
    };
    const install = () => {
      if (window[generationKey] !== generation) { stop(); return true; }
      /* The watcher may use the normal payload path when the renderer becomes
         probe-ready just before this bootstrap interval gets a turn. Treat
         that path as an applied generation so the delayed interval cannot
         inject the complete skin a second time. */
      if (window[appliedKey] === generation) { stop(); return true; }
      const root = document.documentElement;
      // The shared renderer can install against documentElement before body is
      // committed; requiring body here would create a visible unskinned first
      // frame on cold navigation.
      if (!root || !hasCodexSurface()) return false;
      stop();
      ${payload};
      window[appliedKey] = generation;
      return true;
    };
    if (install()) return;
    /* If the interval wins the race before DOMContentLoaded, the one-shot
       listener must be removed as well. Otherwise it invokes the full payload
       a second time and leaves two constructable skin sheets/listener sets. */
    domReadyListener = install;
    document.addEventListener?.("DOMContentLoaded", domReadyListener, { once: true });
    bootstrapTimer = setInterval(install, 250);
    timeout = setTimeout(stop, 10000);
  })()`;
}

async function registerEarlyPayload(session, payload, revision, earlyGeneration = revision, ownerToken = "") {
  const result = await session.send("Page.addScriptToEvaluateOnNewDocument", {
    source: earlyPayloadFor(payload, revision, earlyGeneration, ownerToken),
  });
  return result.identifier ?? null;
}

async function removeEarlyPayload(session, identifier) {
  if (!identifier || session.closed) return;
  await session.send("Page.removeScriptToEvaluateOnNewDocument", { identifier }).catch(() => {});
}


function nextOperationToken() {
  operationSequence += 1;
  return `${process.pid}:${Date.now()}:${operationSequence}`;
}

function nextEarlyGeneration(revision, targetId = "") {
  earlyGenerationSequence += 1;
  return `${revision}:${process.pid}:${Date.now()}:${earlyGenerationSequence}:${targetId}`;
}

function operationKindMessage(kind) {
  if (kind === "pause") return "正在暂停皮肤…";
  if (kind === "switch") return "正在切换主题…";
  return "正在应用皮肤…";
}

function operationUiExpression(action, token, state = "loading", message = "") {
  const config = { action, token, state, message };
  return `(() => {
    const config = ${JSON.stringify(config)};
    const hostId = ${JSON.stringify(OPERATION_UI_HOST_ID)};
    const registryKey = ${JSON.stringify(OPERATION_UI_REGISTRY_KEY)};
    const css = ${JSON.stringify(OPERATION_UI_CSS)};
    const revealDelayMs = 16;
    const minimumLoadingMs = 700;
    const stateTtl = (value) => value === "loading" ? 180000
      : value === "success" ? 1800 : value === "cancelled" ? 2400 : 6000;
    const issuedAt = (value) => Number(String(value).split(":")[1]) || 0;
    const positionInMainArea = (host) => {
      const main = document.querySelector(${selectorLiteral("shell-main")}) ||
        document.querySelector("main") ||
        document.querySelector('[role="main"]') || document.documentElement;
      const rect = main.getBoundingClientRect();
      const top = Math.max(0, rect.top);
      const left = Math.max(0, rect.left);
      const width = Math.max(1, Math.min(innerWidth - left, rect.width || innerWidth));
      const height = Math.max(1, Math.min(innerHeight - top, rect.height || innerHeight));
      host.style.setProperty("--dream-skin-operation-top", String(top) + "px");
      host.style.setProperty("--dream-skin-operation-left", String(left) + "px");
      host.style.setProperty("--dream-skin-operation-width", String(width) + "px");
      host.style.setProperty("--dream-skin-operation-height", String(height) + "px");
    };
    const clearTimer = (timer) => { if (timer) clearTimeout(timer); };
    const removeHost = (expectedToken, force = false) => {
      const host = document.getElementById(hostId);
      const registry = window[registryKey];
      if (!force && host?.dataset.operationToken !== expectedToken) return false;
      if (!force && registry?.token && registry.token !== expectedToken) return false;
      clearTimer(registry?.showTimer);
      clearTimer(registry?.expiryTimer);
      clearTimer(registry?.terminalTimer);
      host?.remove();
      if (force || registry?.token === expectedToken) delete window[registryKey];
      return true;
    };
    if (config.action === "clear") {
      removeHost("", true);
      return { visible: false, cleared: true };
    }
    if (config.action === "hide") {
      return { visible: false, removed: removeHost(config.token) };
    }
    let host = document.getElementById(hostId);
    if (config.action === "show") {
      const currentIssuedAt = Number(host?.dataset.operationIssuedAt || 0);
      if (host?.dataset.operationToken !== config.token && currentIssuedAt > issuedAt(config.token)) {
        return { visible: false, stale: true };
      }
      removeHost("", true);
      host = document.createElement("div");
      host.id = hostId;
      host.dataset.operationToken = config.token;
      host.dataset.operationIssuedAt = String(issuedAt(config.token));
      host.dataset.state = config.state;
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      host.setAttribute("aria-atomic", "true");
      const rgb = getComputedStyle(document.body || document.documentElement).backgroundColor.match(/\\d+(?:\\.\\d+)?/g)?.map(Number);
      const light = rgb?.length >= 3
        ? (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) > 150
        : matchMedia("(prefers-color-scheme: light)").matches;
      host.dataset.tone = light ? "light" : "dark";
      positionInMainArea(host);
      const shadow = host.attachShadow({ mode: "open" });
      const styleNode = document.createElement("style");
      styleNode.textContent = css;
      const statusNode = document.createElement("div");
      statusNode.className = "status";
      const indicator = document.createElement("span");
      indicator.className = "indicator";
      indicator.setAttribute("aria-hidden", "true");
      const messageNode = document.createElement("span");
      messageNode.className = "message";
      messageNode.textContent = config.message;
      statusNode.append(indicator, messageNode);
      shadow.append(styleNode, statusNode);
      document.documentElement.append(host);
      const registry = {
        token: config.token,
        startedAt: Date.now(),
        showTimer: null,
        expiryTimer: null,
        terminalTimer: null,
      };
      registry.showTimer = setTimeout(() => {
        const current = document.getElementById(hostId);
        if (current?.dataset.operationToken === config.token) current.dataset.visible = "true";
      }, revealDelayMs);
      registry.expiryTimer = setTimeout(() => removeHost(config.token), stateTtl(config.state));
      window[registryKey] = registry;
      return { visible: true, state: config.state };
    }
    if (!host || host.dataset.operationToken !== config.token) {
      return { visible: false, stale: true };
    }
    const registry = window[registryKey];
    clearTimer(registry?.terminalTimer);
    clearTimer(registry?.expiryTimer);
    positionInMainArea(host);
    const terminal = config.state === "success" || config.state === "error" || config.state === "cancelled";
    const remainingLoadingMs = terminal && host.dataset.state === "loading" && registry?.startedAt
      ? Math.max(0, registry.startedAt + minimumLoadingMs - Date.now())
      : 0;
    if (remainingLoadingMs > 0 && registry?.token === config.token) {
      registry.terminalTimer = setTimeout(() => {
        const current = document.getElementById(hostId);
        const currentRegistry = window[registryKey];
        if (current?.dataset.operationToken !== config.token || currentRegistry?.token !== config.token) return;
        current.dataset.state = config.state;
        current.dataset.visible = "true";
        const currentMessage = current.shadowRoot?.querySelector(".message");
        if (currentMessage) currentMessage.textContent = config.message;
        clearTimer(currentRegistry.expiryTimer);
        currentRegistry.expiryTimer = setTimeout(() => removeHost(config.token), stateTtl(config.state));
      }, remainingLoadingMs);
      return { visible: true, state: "loading", deferred: true };
    }
    host.dataset.state = config.state;
    host.dataset.visible = "true";
    const messageNode = host.shadowRoot?.querySelector(".message");
    if (messageNode) messageNode.textContent = config.message;
    if (registry?.token === config.token) {
      registry.expiryTimer = setTimeout(() => removeHost(config.token), stateTtl(config.state));
    }
    return { visible: true, state: config.state };
  })()`;
}

async function updateOperationUi(session, action, token, state, message, timeoutMs = 10000) {
  if (session.closed) return false;
  const result = await session.evaluate(
    operationUiExpression(action, token, state, message),
    timeoutMs,
  );
  return Boolean(result?.visible || result?.cleared || result?.removed);
}

async function bestEffortOperationUi(session, action, token, state, message, timeoutMs = 10000) {
  try {
    return await updateOperationUi(session, action, token, state, message, timeoutMs);
  } catch (error) {
    console.error(`[dream-skin] client status unavailable: ${error.message}`);
    return false;
  }
}

async function presentOperationUi(session, token, state, message, timeoutMs = 10000) {
  const updated = await bestEffortOperationUi(
    session, "update", token, state, message, timeoutMs,
  );
  if (updated) return true;
  return bestEffortOperationUi(session, "show", token, state, message, timeoutMs);
}

async function removeFromSession(session, expectedOwnerToken = null) {
  const ownerToken = expectedOwnerToken || session?.__dreamSkinOwnerToken || "";
  const ownerGuard = ownerToken
    ? `if (globalThis[${JSON.stringify(RENDERER_OWNER_KEY)}] !== ${JSON.stringify(ownerToken)}) return false;`
    : "";
  return session.evaluate(`(() => {
    ${ownerGuard}
    window.__CODEX_DREAM_SKIN_DISABLED__ = true;
    const state = window.__CODEX_DREAM_SKIN_STATE__;
    let cleaned = false;
    try { cleaned = Boolean(state?.cleanup && state.cleanup()); } catch {}
    if (cleaned) return true;
    const root = document.documentElement;
    for (const attribute of [...(root?.attributes || [])]) {
      if (attribute.name.startsWith('data-dream-')) root.removeAttribute(attribute.name);
    }
    for (const property of [...(root?.style || [])]) {
      if (property.startsWith('--dream-') || property.startsWith('--ds-')) {
        root.style.removeProperty(property);
      }
    }
    const sheets = window.__CODEX_DREAM_SKIN_STYLE_SHEETS__;
    if (sheets && 'adoptedStyleSheets' in document) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets]
        .filter((sheet) => !sheets.has(sheet));
    }
    delete window.__CODEX_DREAM_SKIN_STYLE_SHEETS__;
    try { if (state?.artUrl) URL.revokeObjectURL(state.artUrl); } catch {}
    document.getElementById('codex-dream-skin-style')?.remove();
    delete window.__CODEX_DREAM_SKIN_STATE__;
    return true;
  })()`);
}

async function verifyRemovedSession(session) {
  return session.evaluate(`(() => {
    const root = document.documentElement;
    const hasAttributes = [...root.attributes].some((attribute) =>
      attribute.name.startsWith('data-dream-'));
    const hasVariables = [...root.style].some((property) =>
      property.startsWith('--dream-') || property.startsWith('--ds-'));
    const sheets = window.__CODEX_DREAM_SKIN_STYLE_SHEETS__;
    const hasSheets = Boolean(sheets?.size && 'adoptedStyleSheets' in document &&
      [...document.adoptedStyleSheets].some((sheet) => sheets.has(sheet)));
    return !hasAttributes && !hasVariables && !hasSheets &&
      !document.getElementById('codex-dream-skin-style') &&
      !window.__CODEX_DREAM_SKIN_STATE__;
  })()`);
}

async function verifySession(session, expectedThemeId = null, expectedRevision = null) {
  return session.evaluate(`(() => {
    const box = (node) => {
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
    };
    const home = document.querySelector(${selectorLiteral("home-route")});
    const suggestions = home?.querySelector(${selectorLiteral("home-suggestions")}) ?? null;
    const cards = suggestions ? [...suggestions.querySelectorAll('button')].map(box) : [];
    const runtime = window.__CODEX_DREAM_SKIN_STATE__;
    const adopted = runtime?.styleMode === 'adopted' &&
      [...document.adoptedStyleSheets].includes(runtime.styleSheet);
    const fallback = runtime?.styleMode === 'style' &&
      document.getElementById('codex-dream-skin-style') === runtime.styleNode;
    const skinMode = document.documentElement.getAttribute('data-dream-skin');
    const result = {
      // Native theme is a valid end state: the injected stylesheet/runtime
      // remains available for switching back, while all visual skin state is
      // intentionally removed by the renderer.
      installed: ['active', 'home-native', 'settings', 'native'].includes(skinMode),
      skinMode,
      rendererVisible: document.visibilityState === 'visible',
      version: runtime?.version ?? null,
      expectedVersion: ${JSON.stringify(SKIN_VERSION)},
      themeId: runtime?.themeId ?? null,
      revision: runtime?.revision ?? null,
      styleMode: runtime?.styleMode ?? null,
      stylePresent: Boolean(adopted || fallback),
      scope: runtime?.scope ?? null,
      businessClassPollution: [...document.querySelectorAll('[class]')].filter((node) =>
        !node.closest('[data-dream-ui]') &&
        [...node.classList].some((name) => /^(?:dream-|codex-dream-skin(?:-|$))/.test(name))
      ).length,
      homePresent: Boolean(home),
      suggestionsPresent: Boolean(suggestions),
      hero: box(home?.firstElementChild?.firstElementChild?.firstElementChild),
      cards,
      composer: box(document.querySelector(${selectorLiteral("composer-chrome")})),
      shell: box(document.querySelector(${selectorLiteral("shell-main")})),
      sidebar: box(document.querySelector(${selectorLiteral("left-panel")})),
      viewport: { width: innerWidth, height: innerHeight },
      documentOverflow: {
        x: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        y: document.documentElement.scrollHeight > document.documentElement.clientHeight,
      },
    };
    const structurePass = result.scope?.level === 'L0' ||
      (Boolean(result.shell) && (Boolean(result.sidebar) || Boolean(result.composer)));
    const expectedThemeId = ${JSON.stringify(expectedThemeId)};
    const expectedRevision = ${JSON.stringify(expectedRevision)};
    const payloadPass = (!expectedThemeId || result.themeId === expectedThemeId) &&
      (!expectedRevision || result.revision === expectedRevision);
    const hiddenRendererPass = !result.rendererVisible &&
      result.version === result.expectedVersion && result.stylePresent &&
      result.businessClassPollution === 0 && payloadPass;
    result.expectedThemeId = expectedThemeId;
    result.expectedRevision = expectedRevision;
    result.pass = hiddenRendererPass || (result.installed && result.version === result.expectedVersion &&
      result.stylePresent && result.businessClassPollution === 0 && structurePass &&
      payloadPass &&
      (!result.homePresent || result.skinMode === 'home-native' || (Boolean(result.hero) &&
        (!result.suggestionsPresent || (result.cards.length >= 2 && result.cards.length <= 4)))));
    return result;
  })()`);
}

async function waitForVerifiedSession(session, timeoutMs, expectedThemeId = null, expectedRevision = null) {
  const deadline = Date.now() + timeoutMs;
  let lastResult;
  let lastError;
  while (Date.now() < deadline) {
    try {
      lastResult = await verifySession(session, expectedThemeId, expectedRevision);
      lastError = null;
      if (lastResult.pass) return lastResult;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!lastResult && lastError) throw lastError;
  return lastResult;
}

async function capture(session, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const result = await session.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await fs.writeFile(outputPath, Buffer.from(result.data, "base64"));
}

async function runBeginOperation(options) {
  const connected = await connectCodexTargets(options.port, options.timeoutMs, options.browserId);
  const operationToken = options.operationToken ?? nextOperationToken();
  let shown = false;
  try {
    const results = await Promise.all(connected.map(({ session }) => presentOperationUi(
      session,
      operationToken,
      "loading",
      operationKindMessage(options.operationKind),
      Math.max(250, Math.floor(options.timeoutMs / 2)),
    )));
    shown = results.some(Boolean);
  } finally {
    for (const { session } of connected) session.close();
  }
  if (!shown) throw new Error("Could not show operation progress in the verified Codex renderer");
  process.stdout.write(`${operationToken}\n`);
}

async function runFinishOperation(options) {
  const connected = await connectCodexTargets(options.port, options.timeoutMs, options.browserId);
  let shown = false;
  try {
    const results = await Promise.all(connected.map(({ session }) => presentOperationUi(
      session,
      options.operationToken,
      options.operationUiState,
      options.operationMessage,
      Math.max(250, Math.floor(options.timeoutMs / 2)),
    )));
    shown = results.some(Boolean);
  } finally {
    for (const { session } of connected) session.close();
  }
  if (!shown) throw new Error("Could not show the completed operation state in the verified Codex renderer");
}

async function runOneShot(options) {
  const connected = await connectCodexTargets(options.port, options.timeoutMs, options.browserId);
  const operationToken = options.mode === "once" || options.mode === "remove"
    ? options.operationToken ?? nextOperationToken()
    : null;
  if (operationToken) {
    const message = options.mode === "remove" ? "正在暂停皮肤…" : "正在准备皮肤…";
    const action = options.operationToken ? presentOperationUi : (session, token, state, text) =>
      bestEffortOperationUi(session, "show", token, state, text);
    await Promise.all(connected.map(({ session }) => action(
      session, operationToken, "loading", message,
    )));
  }
  let loadedPayload = null;
  try {
    loadedPayload = (options.mode === "once" || options.mode === "verify" || options.reload)
      ? await loadPayload(options.themeDir) : null;
  } catch (error) {
    if (operationToken) {
      await Promise.all(connected.map(({ session }) => presentOperationUi(
        session, operationToken, "error", "皮肤准备失败",
      )));
    }
    for (const { session } of connected) session.close();
    throw error;
  }
  const payload = loadedPayload?.payload ?? null;
  const results = [];
  const sessionUsageStates = new Map();
  let screenshotCaptured = false;
  try {
    for (const { target, session, probe } of connected) {
      try {
        if (loadedPayload) {
          await prepareLazyAssetBinding(session, loadedPayload.lazyAssets);
          await preparePublicFetchBinding(session);
          await prepareRendererActivityBinding(session);
        }
        if (options.mode === "remove") await removeFromSession(session);
        else if (options.mode === "once") {
          if (operationToken) {
            await bestEffortOperationUi(
              session, "update", operationToken, "loading",
              `正在应用「${loadedPayload.theme.name}」…`,
            );
          }
          await applyToSession(session, payload);
          await seedLazyAssetsForSession(
            session,
            await currentVariantLazyAssetsForSession(session, loadedPayload.lazyAssets),
          );
          await new Promise((resolve) => setTimeout(resolve, 850));
        }
        if (options.reload) {
          await session.send("Page.reload", { ignoreCache: true });
          await new Promise((resolve) => setTimeout(resolve, 1600));
          if (options.mode !== "remove") {
            if (operationToken) {
              await presentOperationUi(
                session, operationToken, "loading",
                `正在应用「${loadedPayload.theme.name}」…`,
              );
            }
            await applyToSession(session, payload);
            await seedLazyAssetsForSession(
              session,
              await currentVariantLazyAssetsForSession(session, loadedPayload.lazyAssets),
            );
          }
        }
        if (options.mode !== "remove") {
          const usageState = sessionUsageStates.get(target.id) || {};
          sessionUsageStates.set(target.id, usageState);
          await syncSessionUsageSnapshot(session, usageState, true);
        }
        if (operationToken) {
          await presentOperationUi(
            session,
            operationToken,
            "loading",
            options.mode === "remove" ? "正在确认皮肤已暂停…" : "正在检查显示效果…",
          );
        }
        const verified = options.mode === "remove"
          ? await verifyRemovedSession(session)
          : (options.reload || options.mode === "once" || options.mode === "verify")
            ? await waitForVerifiedSession(
              session,
              options.timeoutMs,
              loadedPayload?.theme.id ?? null,
              loadedPayload?.revision ?? null,
            )
            : await verifySession(session);
        results.push({ targetId: target.id, markers: probe.markers, result: verified });
        if (operationToken) {
          const passed = options.mode === "remove" ? verified === true : verified?.pass;
          await presentOperationUi(
            session,
            operationToken,
            passed ? "success" : "error",
            passed
              ? options.mode === "remove" ? "皮肤已暂停" : `已应用「${loadedPayload.theme.name}」`
              : options.mode === "remove" ? "暂停校验失败" : "显示校验失败",
          );
        }
        if (options.screenshot && !screenshotCaptured) {
          if (operationToken) {
            await bestEffortOperationUi(session, "hide", operationToken, "loading", "");
          }
          await capture(session, options.screenshot);
          screenshotCaptured = true;
        }
      } catch (error) {
        if (operationToken) {
          await presentOperationUi(
            session,
            operationToken,
            "error",
            options.mode === "remove" ? "暂停失败，请重试" : "应用失败，请重试",
          );
        }
        results.push({ targetId: target.id, markers: probe?.markers, error: error.message });
      } finally {
        sessionUsageStates.delete(target.id);
        session.close();
      }
    }
  } finally {
    for (const { session } of connected) session.close();
  }
  console.log(JSON.stringify({ mode: options.mode, port: options.port, targets: results }, null, 2));
  const failed = results.length === 0 || results.some((item) =>
    item.error || (options.mode === "remove" ? item.result !== true : !item.result?.pass));
  if (failed) process.exitCode = 2;
}

async function runWatch(options) {
  const watcherOwnerToken = nextOperationToken();
  /* Keep the launch-time ID for state-file ownership even if the live Codex
     process rotates its CDP identity during a normal restart. */
  const persistedBrowserId = options.browserId;
  let identityAnchor = null;
  const sessions = new Map();
  const sessionUsageStates = new Map();
  const earlyScripts = new Map();
  const fallbackTargets = new Map();
  const fallbackListeners = new Set();
  const targetFailures = new Map();
  let stopping = false;
  let listFailures = 0;
  let lastListErrorLogAt = 0;
  let lastThemeErrorLogAt = 0;
  let identityReconnectFailures = 0;
  let lastIdentityErrorLogAt = 0;
  let lastIdentityAdoptionLogAt = 0;
  let lastStrongThemeAuditAt = 0;
  let lastThemeSourceCheckAt = 0;
  let loadedPayload = null;
  let paused = false;
  let identityUnavailableSince = 0;
  const stop = () => { stopping = true; };
  const rejectTarget = (target, baseDelayMs, error = null) => {
    const previous = targetFailures.get(target.id) ?? { failures: 0, lastLogAt: 0 };
    const failures = previous.failures + 1;
    const delayMs = Math.min(30000, baseDelayMs * (2 ** Math.min(failures - 1, 4)));
    const now = Date.now();
    if (error && (failures === 1 || now - previous.lastLogAt >= 30000)) {
      console.error(`[dream-skin] inject failed for ${target.id}: ${error.message}; retrying in ${delayMs}ms`);
      previous.lastLogAt = now;
    }
    targetFailures.set(target.id, { failures, lastLogAt: previous.lastLogAt, until: now + delayMs });
  };
  const attachLoadFallback = (id, target, session) => {
    if (fallbackListeners.has(id)) return;
    fallbackListeners.add(id);
    let lastReinjectErrorLogAt = 0;
    session.on("Page.loadEventFired", () => {
      if (!fallbackTargets.get(id)) return;
      setTimeout(() => {
        const operation = paused
          ? removeFromSession(session, watcherOwnerToken)
          : applyToSession(session, loadedPayload.payload, watcherOwnerToken);
        operation.catch((error) => {
          if (Date.now() - lastReinjectErrorLogAt >= 30000) {
            console.error(`[dream-skin] reinject failed for ${target.id}: ${error.message}`);
            lastReinjectErrorLogAt = Date.now();
          }
        });
      }, 250);
  });
};

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  const resetSessionsForIdentityChange = async () => {
    for (const [id, session] of sessions) {
      /* The old browser process is already gone (or being replaced). Close
         the socket first so cleanup cannot wait on a dead CDP request. */
      session.close();
      await removeEarlyPayload(session, earlyScripts.get(id));
    }
    sessions.clear();
    earlyScripts.clear();
    fallbackTargets.clear();
    fallbackListeners.clear();
    sessionUsageStates.clear();
    targetFailures.clear();
  };

  const adoptCurrentBrowserIdentity = async () => {
    try {
      const actualBrowserId = await readCdpBrowserIdentity(options.port);
      if (actualBrowserId === options.browserId) return false;
      /* A changed loopback identity is only adopted after the replacement
         endpoint exposes a real Codex app target. This keeps an unrelated
         process that happens to reuse the port out of the skin session. */
      const targets = await listAppTargets(options.port);
      if (!targets.length) return false;
      let codexReady = false;
      for (const target of targets.slice(0, 4)) {
        let probeSession;
        try {
          probeSession = await connectTarget(target, options.port);
          const probe = await waitForCodexProbe(probeSession, 750);
          if (probe?.codex) {
            codexReady = true;
            break;
          }
        } catch {
          // The replacement renderer may still be committing its shell.
        } finally {
          probeSession?.close();
        }
      }
      if (!codexReady) return false;
      identityAnchor?.close();
      identityAnchor = null;
      await resetSessionsForIdentityChange();
      const previousBrowserId = options.browserId;
      options.browserId = actualBrowserId;
      identityReconnectFailures = 0;
      identityUnavailableSince = 0;
      console.log(`[dream-skin] adopted replacement Codex browser identity ${actualBrowserId} (was ${previousBrowserId}); reattaching`);
      return true;
    } catch {
      return false;
    }
  };

  const waitForReplacementIdentity = async (error) => {
    if (await adoptCurrentBrowserIdentity()) return true;
    const nowMs = Date.now();
    if (nowMs - lastIdentityAdoptionLogAt >= 30000) {
      console.error(`[dream-skin] ${error.message}; waiting for a verified replacement Codex renderer`);
      lastIdentityAdoptionLogAt = nowMs;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return false;
  };

  const reconnectIdentityAnchor = async () => {
    if (identityAnchor && !identityAnchor.closed) {
      identityUnavailableSince = 0;
      return true;
    }
    if (!identityUnavailableSince) identityUnavailableSince = Date.now();
    try {
      const nextAnchor = await connectBrowserIdentityAnchor(options.port, options.browserId);
      identityAnchor?.close();
      identityAnchor = nextAnchor;
      identityReconnectFailures = 0;
      identityUnavailableSince = 0;
      console.log("[dream-skin] reconnected to the original CDP browser identity");
      return true;
    } catch (error) {
      if (error instanceof CdpIdentityMismatchError) throw error;
      identityReconnectFailures += 1;
      const elapsedMs = Date.now() - identityUnavailableSince;
      if (WATCH_IDENTITY_RECONNECT_GRACE_MS > 0 && elapsedMs >= WATCH_IDENTITY_RECONNECT_GRACE_MS) {
        console.error(`[dream-skin] ${new Date().toISOString()} CDP browser identity unavailable for ${Math.ceil(elapsedMs / 1000)}s; stopping watcher`);
        process.exitCode = 2;
        stopping = true;
        return false;
      }
      const backoffMs = Math.min(10000, 500 * (2 ** Math.min(identityReconnectFailures - 1, 4)));
      const graceRemainingMs = WATCH_IDENTITY_RECONNECT_GRACE_MS > 0
        ? Math.max(250, WATCH_IDENTITY_RECONNECT_GRACE_MS - elapsedMs) : 10000;
      const retryMs = Math.min(backoffMs, graceRemainingMs);
      if (identityReconnectFailures === 1 || Date.now() - lastIdentityErrorLogAt >= 30000) {
        console.error(`[dream-skin] ${new Date().toISOString()} ${error.message}; identity reconnect retry in ${retryMs}ms`);
        lastIdentityErrorLogAt = Date.now();
      }
      await new Promise((resolve) => setTimeout(resolve, retryMs));
      return false;
    }
  };

  try {
    loadedPayload = await loadPayload(options.themeDir);
    lastStrongThemeAuditAt = Date.now();
    lastThemeSourceCheckAt = lastStrongThemeAuditAt;
    paused = await fileExists(options.pauseFile);
    while (!stopping) {
      let identityReady = false;
      try {
        identityReady = await reconnectIdentityAnchor();
      } catch (error) {
        if (error instanceof CdpIdentityMismatchError) {
          await waitForReplacementIdentity(error);
          continue;
        }
        throw error;
      }
      if (!identityReady) {
        continue;
      }
      let targets = [];
      try {
        targets = await listAppTargets(options.port, options.browserId);
        listFailures = 0;
      } catch (error) {
        if (error instanceof CdpIdentityMismatchError) {
          await waitForReplacementIdentity(error);
          continue;
        }
        if (isCdpEndpointUnavailable(error)) {
          identityAnchor?.close();
          if (!identityUnavailableSince) identityUnavailableSince = Date.now();
        }
        listFailures += 1;
        const retryMs = Math.min(10000, 1000 * (2 ** Math.min(listFailures - 1, 4)));
        if (listFailures === 1 || Date.now() - lastListErrorLogAt >= 30000) {
          console.error(`[dream-skin] ${new Date().toISOString()} ${error.message}; retrying in ${retryMs}ms`);
          lastListErrorLogAt = Date.now();
        }
        await new Promise((resolve) => setTimeout(resolve, retryMs));
        continue;
      }

      const nextPaused = await fileExists(options.pauseFile);
      let nextPayload = loadedPayload;
      if (!nextPaused) {
        try {
          const now = Date.now();
          let sourceChanged = false;
          let shouldAudit = !loadedPayload || now - lastStrongThemeAuditAt >= STRONG_THEME_AUDIT_MS;
          if (!shouldAudit && now - lastThemeSourceCheckAt >= THEME_SOURCE_CHECK_MS) {
            try {
              lastThemeSourceCheckAt = now;
              sourceChanged = await readThemeSourceStamp(loadedPayload) !== loadedPayload.sourceStamp;
              shouldAudit = sourceChanged;
            } catch {
              shouldAudit = true;
            }
          }
          if (shouldAudit) {
            const candidateTheme = await loadTheme(options.themeDir);
            lastStrongThemeAuditAt = now;
            lastThemeSourceCheckAt = now;
            if (!loadedPayload || candidateTheme.fingerprint !== loadedPayload.fingerprint || sourceChanged) {
              nextPayload = await loadPayload(options.themeDir, candidateTheme);
            } else {
              loadedPayload.sourceStamp = await readThemeSourceStamp(candidateTheme);
            }
          }
        } catch (error) {
          if (Date.now() - lastThemeErrorLogAt >= 30000) {
            console.error(`[dream-skin] theme update rejected: ${error.message}; keeping the active theme`);
            lastThemeErrorLogAt = Date.now();
          }
        }
      }
      const pauseChanged = nextPaused !== paused;
      const payloadChanged = !nextPaused && nextPayload !== loadedPayload;
      loadedPayload = nextPayload;
      paused = nextPaused;

      if (pauseChanged || payloadChanged) {
        for (const [id, session] of sessions) {
          try {
            const previousEarlyScript = earlyScripts.get(id);
            if (paused) {
              await removeFromSession(session, watcherOwnerToken);
              await removeEarlyPayload(session, previousEarlyScript);
              earlyScripts.delete(id);
              fallbackTargets.delete(id);
              fallbackListeners.delete(id);
            } else {
              let nextEarlyScript = null;
              try {
                await prepareLazyAssetBinding(session, loadedPayload.lazyAssets);
                await preparePublicFetchBinding(session);
                await prepareRendererActivityBinding(session);
                const earlyGeneration = nextEarlyGeneration(loadedPayload.revision, id);
                session.__dreamSkinEarlyGeneration = earlyGeneration;
                nextEarlyScript = await registerEarlyPayload(
                  session,
                  loadedPayload.payload,
                  loadedPayload.revision,
                  earlyGeneration,
                  watcherOwnerToken,
                );
                if (!nextEarlyScript) throw new Error("CDP did not return an early-script identifier");
                fallbackTargets.set(id, false);
              } catch (error) {
                fallbackTargets.set(id, true);
                console.error(`[dream-skin] early theme refresh unavailable for ${id}: ${error.message}`);
                attachLoadFallback(id, { id }, session);
              }
              if (nextEarlyScript) earlyScripts.set(id, nextEarlyScript);
              else earlyScripts.delete(id);
              await removeEarlyPayload(session, previousEarlyScript);
              await applyToSession(session, loadedPayload.payload, watcherOwnerToken);
              if (nextEarlyScript) {
                await session.evaluate(
                  `window.__CODEX_DREAM_SKIN_EARLY_GENERATION__ = ${JSON.stringify(session.__dreamSkinEarlyGeneration)}; window.__CODEX_DREAM_SKIN_EARLY_APPLIED__ = ${JSON.stringify(session.__dreamSkinEarlyGeneration)}; true`,
                ).catch(() => {});
              }
            }
          } catch (error) {
            console.error(`[dream-skin] live theme update failed for ${id}: ${error.message}`);
            await removeEarlyPayload(session, earlyScripts.get(id));
            earlyScripts.delete(id);
            fallbackTargets.delete(id);
            fallbackListeners.delete(id);
            sessionUsageStates.delete(id);
            session.close();
            sessions.delete(id);
          }
        }
        console.log(paused ? "[dream-skin] paused" : `[dream-skin] active theme ${loadedPayload.theme.id}`);
      }

      const activeIds = new Set(targets.map((target) => target.id));
      for (const id of targetFailures.keys()) {
        if (!activeIds.has(id)) targetFailures.delete(id);
      }
      for (const [id, session] of sessions) {
        if (!activeIds.has(id) || session.closed) {
          await removeEarlyPayload(session, earlyScripts.get(id));
          earlyScripts.delete(id);
          fallbackTargets.delete(id);
          fallbackListeners.delete(id);
          sessionUsageStates.delete(id);
          session.close();
          sessions.delete(id);
          targetFailures.delete(id);
        }
      }

      for (const target of targets) {
        if (identityAnchor?.closed) break;
        if (sessions.has(target.id)) continue;
        if ((targetFailures.get(target.id)?.until ?? 0) > Date.now()) continue;
        let session;
        let earlyScriptId = null;
        try {
          session = await connectTarget(target, options.port);
          if (identityAnchor?.closed) throw new Error("Original CDP browser identity connection was interrupted");
          await claimRendererOwner(session, watcherOwnerToken);
          if (!paused) {
            await prepareLazyAssetBinding(session, loadedPayload.lazyAssets);
            await preparePublicFetchBinding(session);
            await prepareRendererActivityBinding(session);
          }
          let earlyInjectionFallback = false;
          const earlyGeneration = nextEarlyGeneration(loadedPayload.revision, target.id);
          session.__dreamSkinEarlyGeneration = earlyGeneration;
          if (!paused) {
            try {
              earlyScriptId = await registerEarlyPayload(
                session,
                loadedPayload.payload,
                loadedPayload.revision,
                earlyGeneration,
                watcherOwnerToken,
              );
              if (!earlyScriptId) throw new Error("CDP did not return an early-script identifier");
              await session.evaluate(
                earlyPayloadFor(
                  loadedPayload.payload,
                  loadedPayload.revision,
                  earlyGeneration,
                  watcherOwnerToken,
                ),
              );
            } catch (error) {
              await removeEarlyPayload(session, earlyScriptId);
              earlyScriptId = null;
              earlyInjectionFallback = true;
              console.error(`[dream-skin] early injection unavailable for ${target.id}: ${error.message}`);
            }
          }
          const probe = await waitForCodexProbe(session);
          if (!probe?.codex) {
            await removeEarlyPayload(session, earlyScriptId);
            rejectTarget(target, 5000);
            session.close();
            continue;
          }
          fallbackTargets.set(target.id, earlyInjectionFallback);
          if (earlyInjectionFallback) attachLoadFallback(target.id, target, session);
          if (identityAnchor?.closed) throw new Error("Original CDP browser identity connection was interrupted");
          let earlyApplied = false;
          if (!paused && !earlyInjectionFallback) {
            earlyApplied = await session.evaluate(
              `window.__CODEX_DREAM_SKIN_EARLY_APPLIED__ === ${JSON.stringify(earlyGeneration)}`,
            ).catch(() => false);
          }
          if (paused) await removeFromSession(session, watcherOwnerToken);
          else if (!earlyApplied) {
            await applyToSession(session, loadedPayload.payload, watcherOwnerToken);
            /* Cancel a still-pending early bootstrap before its 250ms tick
               can run after the normal payload has already taken ownership. */
            await session.evaluate(
              `window.__CODEX_DREAM_SKIN_EARLY_GENERATION__ = ${JSON.stringify(earlyGeneration)}; window.__CODEX_DREAM_SKIN_EARLY_APPLIED__ = ${JSON.stringify(earlyGeneration)}; true`,
            ).catch(() => {});
          }
          sessions.set(target.id, session);
          sessionUsageStates.set(target.id, {});
          if (earlyScriptId) earlyScripts.set(target.id, earlyScriptId);
          targetFailures.delete(target.id);
          console.log(`[dream-skin] injected target ${target.id}`);
        } catch (error) {
          await removeEarlyPayload(session, earlyScriptId);
          fallbackTargets.delete(target.id);
          fallbackListeners.delete(target.id);
          session?.close();
          if (identityAnchor?.closed) break;
          rejectTarget(target, 2500, error);
        }
      }
      if (!paused) {
        await Promise.all([...sessions].map(async ([id, session]) => {
          /* A minimized/background renderer has no visible quota surface to
             update. Avoid page inspection and session-log scans until it
             reports that it is visible again. */
          if (session.__dreamSkinVisibility === "hidden") return;
          const usageState = sessionUsageStates.get(id) || {};
          sessionUsageStates.set(id, usageState);
          try {
            await syncSessionUsageSnapshot(session, usageState);
          } catch (error) {
            if (Date.now() - (usageState.lastErrorLogAt || 0) >= 30000) {
              console.error(`[dream-skin] session token sync failed for ${id}: ${error.message}`);
              usageState.lastErrorLogAt = Date.now();
            }
          }
        }));
      }
      await new Promise((resolve) => setTimeout(resolve, WATCH_POLL_MS));
    }
  } finally {
    identityAnchor?.close();
    for (const [id, session] of sessions) {
      await removeEarlyPayload(session, earlyScripts.get(id));
      session.close();
    }
    earlyScripts.clear();
    fallbackTargets.clear();
    fallbackListeners.clear();
    await clearOwnedWatchState(options.stateFile, { ...options, browserId: persistedBrowserId });
  }
}

if (path.resolve(process.argv[1] || "") === path.resolve(scriptPath)) {
  const options = parseArgs(process.argv.slice(2));
  try {
  if (options.mode === "self-test") {
  const valid = validatedDebuggerUrl({ webSocketDebuggerUrl: `ws://127.0.0.1:${options.port}/devtools/page/test` }, options.port);
  const browserId = browserIdFromVersion({
    webSocketDebuggerUrl: `ws://127.0.0.1:${options.port}/devtools/browser/test-browser`,
  }, options.port);
  const invalid = [
    "ws://example.com/devtools/page/test",
    `ws://127.0.0.1:${options.port + 1}/devtools/page/test`,
    `wss://127.0.0.1:${options.port}/devtools/page/test`,
    `ws://user@127.0.0.1:${options.port}/devtools/page/test`,
    `ws://127.0.0.1:${options.port}/unexpected/test`,
    `ws://127.0.0.1:${options.port}/devtools/page/test?query=1`,
  ];
  for (const value of invalid) {
    let rejected = false;
    try { validatedDebuggerUrl({ webSocketDebuggerUrl: value }, options.port); } catch { rejected = true; }
    if (!rejected) throw new Error(`CDP URL validation accepted an unsafe URL: ${value}`);
  }
  const invalidBrowserUrls = [
    `ws://127.0.0.1:${options.port}/devtools/page/not-a-browser`,
    `ws://127.0.0.1:${options.port}/devtools/browser/bad%20id`,
    `ws://127.0.0.1:${options.port}/devtools/browser/test?query=1`,
  ];
  for (const value of invalidBrowserUrls) {
    let rejected = false;
    try { browserIdFromVersion({ webSocketDebuggerUrl: value }, options.port); } catch { rejected = true; }
    if (!rejected) throw new Error(`Browser identity validation accepted an unsafe URL: ${value}`);
  }
  const validPageTarget = {
    id: "page-test",
    type: "page",
    url: "app://codex/",
    webSocketDebuggerUrl: `ws://127.0.0.1:${options.port}/devtools/page/page-test`,
  };
  const invalidPageTargets = [
    { ...validPageTarget, webSocketDebuggerUrl: `ws://127.0.0.1:${options.port}/devtools/browser/page-test` },
    { ...validPageTarget, id: "other-page" },
    { ...validPageTarget, id: 123 },
    { ...validPageTarget, type: "other" },
  ];
  if (!valid || browserId !== "test-browser" || !isValidCdpPageTarget(validPageTarget, options.port) ||
      invalidPageTargets.some((item) => isValidCdpPageTarget(item, options.port))) {
    throw new Error("CDP URL and target validation self-test failed");
  }
  const validMessage = parseCdpMessage('{"id":7,"result":{"ok":true}}');
  const invalidMessages = ["{not-json", "null", '"text"', "42", "true"];
  if (validMessage?.id !== 7 || validMessage.result?.ok !== true ||
      invalidMessages.some((value) => parseCdpMessage(value) !== null)) {
    throw new Error("CDP message validation self-test failed");
  }
  if (/dispatchKeyEvent|dispatchMouseEvent/.test(capture.toString())) {
    throw new Error("Screenshot capture must not dispatch renderer input events");
  }
  const bootstrapSource = earlyPayloadFor("true", "self-test-revision");
  if (!bootstrapSource.includes("domReadyListener") ||
      !bootstrapSource.includes("window[appliedKey] === generation") ||
      !bootstrapSource.includes("removeEventListener?.(\"DOMContentLoaded\", domReadyListener)")) {
    throw new Error("Early bootstrap duplicate-injection guard self-test failed");
  }
  const validPublicUrls = [
    "https://codexradar.com/",
    "https://codexradar.com/api/intelligence-efficiency-metrics?refresh=1",
    "https://www.codexradar.com/api/intelligence-efficiency",
    "https://codexradar.com/data/intelligence-efficiency.json?v=test",
    "https://x.com/thsottiaux",
  ];
  const invalidPublicUrls = [
    "http://codexradar.com/api/intelligence-efficiency",
    "https://codexradar.com/other",
    "https://codexradar.com/api/intelligence-efficiency/../private",
    "https://example.com/api/intelligence-efficiency",
    "https://x.com/other-user",
  ];
  if (validPublicUrls.some((value) => !isAllowedPublicFetchUrl(value)) ||
      invalidPublicUrls.some((value) => isAllowedPublicFetchUrl(value))) {
    throw new Error("Public fetch URL allowlist self-test failed");
  }
  console.log(JSON.stringify({ pass: true, version: SKIN_VERSION, test: "loopback-cdp-validation" }));
  } else if (options.mode === "check-payload") {
    const loaded = await loadPayload(options.themeDir);
    const unresolved = /__DREAM_SKIN_[A-Z0-9_]+_JSON__/.test(loaded.payload);
    if (unresolved) {
      throw new Error("Payload placeholders were not fully replaced");
    }
    console.log(JSON.stringify({
      pass: true,
      version: SKIN_VERSION,
      payloadBytes: Buffer.byteLength(loaded.payload),
      themeId: loaded.theme.id,
      experienceId: loaded.theme.experience?.id || null,
      experienceSchemaVersion: loaded.theme.experience?.schemaVersion || null,
      appearance: loaded.theme.appearance,
      art: loaded.theme.art,
      artMetadata: loaded.theme.artMetadata ?? null,
    }));
  } else if (options.mode === "begin-operation") await runBeginOperation(options);
  else if (options.mode === "finish-operation") await runFinishOperation(options);
  else if (options.mode === "watch") await runWatch(options);
  else await runOneShot(options);
  } catch (error) {
    console.error(`[dream-skin] ${error?.message ?? String(error)}`);
    process.exitCode = process.exitCode || 1;
  }
}
