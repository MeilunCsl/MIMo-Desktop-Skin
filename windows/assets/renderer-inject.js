// Windows renderer skin.
((cssText, artDataUrl, backgroundVariantsData, petDataUrl, sidebarCompanionDataUrl, sidebarAccountAvatarDataUrl, composerCompanionDataUrl, tiboAvatarDataUrl, themeConfig, lazyAssetManifest) => {
  const SELECTOR_CONTRACT = {"schema":"codex-dream-skin-selectors/1","selectors":[{"key":"shell-main","selector":"main:is(.main-surface, [class*=\"_MainContentSurface_\"])","tier":"L1","scope":"all","required":true},{"key":"left-panel","selector":":is(aside.app-shell-left-panel, aside[data-testid=\"app-shell-floating-left-panel\"])","tier":"L1","scope":"all","required":true},{"key":"header-tint","selector":"header:is(.app-header-tint, [class*=\"_Header_\"])","tier":"L1","scope":"all","required":true},{"key":"home-icon","selector":"[data-testid=\"home-icon\"]","tier":"L1","scope":"home","required":true},{"key":"home-route","selector":"[role=\"main\"]:has([data-testid=\"home-icon\"])","tier":"L1","scope":"home","required":true},{"key":"home-route-css","selector":"[role=\"main\"]","tier":"L1","scope":"home","required":true},{"key":"composer-chrome","selector":".composer-surface-chrome","tier":"L2","scope":"home+thread","required":false},{"key":"home-utility","selector":"[class*=\"_homeUtilityBar_\"]","tier":"L2","scope":"home","required":false},{"key":"game-source","selector":"[data-feature=\"game-source\"]","tier":"L2","scope":"home","required":false},{"key":"home-suggestions","selector":".group\\/home-suggestions","tier":"L2","scope":"home","required":false},{"key":"project-selector","selector":".group\\/project-selector","tier":"L2","scope":"home config","required":false},{"key":"markdown","selector":"[class*=\"_markdown\"]","tier":"L2","scope":"thread","required":false},{"key":"appearance-radio","selector":"input[name=\"appearance-theme\"]","tier":"L2","scope":"settings","required":false},{"key":"overlay-menu","selector":"[role=\"menu\"]","tier":"L2","scope":"overlay","required":false},{"key":"overlay-dialog","selector":"[role=\"dialog\"]","tier":"L2","scope":"overlay","required":false},{"key":"overlay-popper","selector":"[data-radix-popper-content-wrapper]","tier":"L2","scope":"overlay","required":false}],"stableTestids":["app-shell-header-context-menu-surface","home-icon","theme-preview"]};
  const TASK_HEADER_SELECTOR =
    'header:is(.app-header-tint, [class*="_Header_"], [class~="top-toolbar-sm"])';
  const headerContract = SELECTOR_CONTRACT.selectors.find((entry) => entry.key === "header-tint");
  if (headerContract) headerContract.selector = TASK_HEADER_SELECTOR;
  const STATE_KEY = "__CODEX_DREAM_SKIN_STATE__";
  const DISABLED_KEY = "__CODEX_DREAM_SKIN_DISABLED__";
  const STYLE_REGISTRY_KEY = "__CODEX_DREAM_SKIN_STYLE_SHEETS__";
  const STYLE_ID = "codex-dream-skin-style";
  const PROJECT_NAVIGATION_LOCK_KEY = "__CODEX_DREAM_SKIN_PROJECT_NAVIGATION_LOCK__";
  const SHELL_ATTR = "data-dream-shell";
  const NEW_TASK_SELECTED_ATTR = "data-dream-new-task-selected";
  const ROOT_ATTRS = [
    "data-dream-skin", SHELL_ATTR, "data-dream-theme-id",
    "data-dream-background-variant", "data-dream-background-switching",
    "data-dream-art-wide", "data-dream-art-safe", "data-dream-task-mode",
    "data-dream-art-safe-area", "data-dream-art-task-mode", "data-dream-art-aspect",
    "data-dream-art-ready", "data-dream-home-ready", "data-dream-route-transition",
    "data-dream-work-state", "data-dream-experience-template",
    "data-dream-experience-variant", "data-dream-experience-route",
    "data-dream-experience-work", "data-dream-experience-quota",
    "data-dream-experience-reset", "data-dream-experience-model",
    "data-dream-experience-network", "data-dream-experience-overlay",
    "data-dream-experience-characters", "data-dream-experience-ring",
    "data-dream-experience-probability", "data-dream-window-hidden",
    NEW_TASK_SELECTED_ATTR,
  ];
  const VERSION = __DREAM_SKIN_VERSION_JSON__;
  const STYLE_REVISION = __DREAM_SKIN_STYLE_REVISION_JSON__;
  const PAYLOAD_REVISION = __DREAM_SKIN_PAYLOAD_REVISION_JSON__;
  const RENDERER_ACTIVITY_BINDING_NAME = __DREAM_SKIN_RENDERER_ACTIVITY_BINDING_NAME_JSON__;
  const THEME = themeConfig && typeof themeConfig === "object" ? themeConfig : {};
  const ART = THEME.art && typeof THEME.art === "object" ? THEME.art : {};
  const QUOTA_CONFIG = THEME.quota && typeof THEME.quota === "object" ? THEME.quota : {};
  const EXPERIENCE = THEME.experience && typeof THEME.experience === "object"
    ? THEME.experience : null;
  const QUOTA_ENABLED = QUOTA_CONFIG.enabled !== false;
  const QUOTA_REFRESH_MS = Number.isFinite(Number(QUOTA_CONFIG.refreshMs))
    ? Math.round(Math.max(5000, Math.min(60000, Number(QUOTA_CONFIG.refreshMs)))) : 15000;
  /* Keep the header summary current without asking Codex for quota data while
     the user is typing. Opening the detailed quota surface still refreshes at
     the configured cadence; an idle header gets a low-frequency refresh. */
  const QUOTA_BACKGROUND_REFRESH_MS = Math.max(5 * 60 * 1000, QUOTA_REFRESH_MS);
  const QUOTA_STORAGE_KEY = "codex-dream-quota-state";
  const QUOTA_RESET_RECONCILIATION_KEY = "codex-dream-quota-reset-reconciliation-v1";
  const QUOTA_SYSTEM_CLOCK_RUNTIME_KEY = "__CODEX_DREAM_SKIN_QUOTA_CLOCK__";
  const THREAD_EARNING_STORAGE_KEY = "codex-dream-thread-earning-v4";
  const THREAD_EARNING_STORAGE_VERSION = 5;
  const THREAD_EARNING_MONTHLY_CNY = 9000;
  const THREAD_EARNING_FIXED_WORKDAYS = 23.5;
  const THREAD_EARNING_WORK_START_MINUTES = 9 * 60;
  const THREAD_EARNING_BREAK_START_MINUTES = 12 * 60;
  const THREAD_EARNING_BREAK_END_MINUTES = 13 * 60 + 30;
  const THREAD_EARNING_WORK_END_MINUTES = 18 * 60 + 30;
  const THREAD_EARNING_PAID_MINUTES = 8 * 60;
  const THREAD_EARNING_TICK_MS = 2000;
  const THREAD_EARNING_PERSIST_MS = 60 * 1000;
  const THREAD_EARNING_MAX_RECORDS = 240;
  const THREAD_EARNING_RUNTIME_REGISTRY_KEY = "__CODEX_DREAM_THREAD_EARNING_RUNTIMES__";
  const THREAD_EARNING_SPEED_STORAGE_KEY = "codex-dream-thread-earning-speed-v1";
  const THREAD_EARNING_SPEED_MODES = [
    { id: "low", label: "LOW", speed: 0.65, title: "普通速度" },
    { id: "fast", label: "FAST", speed: 1, title: "快速" },
    { id: "super", label: "SUPER", speed: 1.6, title: "超级速度" },
    { id: "max", label: "MAX", speed: 2.4, title: "最大速度" },
  ];
  const THREAD_EARNING_SPEED_DEFAULT = THREAD_EARNING_SPEED_MODES[0].speed;
  const THREAD_EARNING_SPEED_MIN = THREAD_EARNING_SPEED_MODES[0].speed;
  const THREAD_EARNING_SPEED_MAX = THREAD_EARNING_SPEED_MODES[
    THREAD_EARNING_SPEED_MODES.length - 1
  ].speed;
  const QUOTA_CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
  const QUOTA_RADAR_URL = "https://codexradar.com/";
  const QUOTA_RADAR_REFRESH_MS = Number.isFinite(Number(QUOTA_CONFIG.radar?.refreshMs))
    ? Math.round(Math.max(60 * 1000, Math.min(6 * 60 * 60 * 1000,
      Number(QUOTA_CONFIG.radar.refreshMs))))
    : 10 * 60 * 1000;
  const QUOTA_RADAR_REQUEST_TIMEOUT_MS = 12000;
  const QUOTA_RADAR_STORAGE_KEY = "codex-dream-quota-radar";
  const QUOTA_RADAR_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  const QUOTA_RADAR_RETRY_BASE_MS = 30 * 1000;
  const QUOTA_RADAR_RETRY_MAX_MS = 30 * 60 * 1000;
  const TIBO_X_URL = "https://x.com/thsottiaux";
  const TIBO_X_TIME_ZONE = "America/Los_Angeles";
  const TIBO_X_TIME_LABEL = "PT";
  const TIBO_X_REFRESH_MS = Number.isFinite(Number(QUOTA_CONFIG.radar?.tiboRefreshMs))
    ? Math.round(Math.max(15 * 60 * 1000, Math.min(6 * 60 * 60 * 1000,
      Number(QUOTA_CONFIG.radar.tiboRefreshMs))))
    : 60 * 60 * 1000;
  const TIBO_X_REQUEST_TIMEOUT_MS = 15000;
  const TIBO_X_STORAGE_KEY = "codex-dream-tibo-reset-radar";
  /* Keep the social timeline judgement deliberately separate from the live
     quota bridge. A wider, bounded evidence window makes short bursts of
     posts and reply threads readable without treating every newest post as
     the reset decision. */
  const TIBO_X_CLASSIFIER_VERSION = 9;
  const TIBO_X_TIMELINE_POST_LIMIT = 36;
  const TIBO_X_EVIDENCE_POST_LIMIT = 16;
  const TIBO_X_EVIDENCE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
  const TIBO_X_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
  const RESET_DECISION_STORAGE_KEY = "codex-dream-reset-decision";
  const RESET_DECISION_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  const RESET_SCHEDULE_GRACE_MS = 36 * 60 * 60 * 1000;
  const RESET_SIGNAL_MAX_AGE_MS = 4 * 24 * 60 * 60 * 1000;
  const QUOTA_IDS = [
    "codex-quota-pill", "codex-quota-ring-pill", "codex-quota-ring-composer",
    "codex-quota-ring-tooltip", "codex-quota-ring-details",
    "codex-quota-reset-composer", "codex-quota-reset-details",
    "codex-quota-popover", "codex-quota-panel", "codex-quota-composer-portal",
  ];
  const LEGACY_QUOTA_IDS = ["linzi-quota-pill", "linzi-quota-popover", "linzi-quota-panel"];
  const QUOTA_SELECTOR = `#${QUOTA_IDS.join(",#")},#${LEGACY_QUOTA_IDS.join(",#")}`;
  const MODEL_RADAR_IDS = ["codex-model-radar-pill", "codex-model-radar-popover"];
  /* Mirror the public page's source priority: the weighted live metrics feed
     is what the page renders today, the table API is its live fallback, and
     the published snapshot is the last safe fallback. */
  const MODEL_RADAR_METRICS_URL =
    "https://codexradar.com/api/intelligence-efficiency-metrics";
  const MODEL_RADAR_TABLE_URL =
    "https://codexradar.com/api/intelligence-efficiency";
  const MODEL_RADAR_SNAPSHOT_URL =
    "https://codexradar.com/data/intelligence-efficiency.json?v=20260804-activity24h";
  /* Keep the local cards responsive to a new snapshot without polling the
     large table payload more often than necessary. Opening the selector and
     the manual button still trigger an immediate page-compatible refresh. */
  const MODEL_RADAR_REFRESH_MS = Number.isFinite(Number(QUOTA_CONFIG.radar?.modelRefreshMs))
    ? Math.round(Math.max(30 * 1000, Math.min(10 * 60 * 1000,
      Number(QUOTA_CONFIG.radar.modelRefreshMs))))
    : 5 * 60 * 1000;
  const MODEL_RADAR_MIN_IQ = 93;
  const MODEL_RADAR_REQUEST_TIMEOUT_MS = 10000;
  const MODEL_RADAR_RETRY_BASE_MS = 12000;
  const MODEL_RADAR_RETRY_MAX_MS = 2 * 60 * 1000;
  const MODEL_RADAR_STORAGE_KEY = "codex-dream-model-radar";
  const MODEL_RADAR_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  const MODEL_RADAR_SELECTION_STORAGE_KEY = "codex-dream-model-radar-selection";
  const BACKGROUND_VARIANT_STORAGE_KEY = "codex-dream-background-variant";
  const THEME_SELECTION_STORAGE_KEY = "codex-dream-theme-selection";
  const NATIVE_THEME_ID = "native";
  const BACKGROUND_SWITCHER_ID = "codex-background-switcher";
  const BACKGROUND_SWITCHER_MENU_ID = "codex-background-switcher-menu";
  const PERSISTENT_HEADER_UI_IDS = new Set([
    "codex-quota-pill", "codex-quota-popover",
    "codex-model-radar-pill", "codex-model-radar-popover",
    BACKGROUND_SWITCHER_ID, "codex-quota-composer-portal",
  ]);
  const ART_METADATA = THEME.artMetadata && typeof THEME.artMetadata === "object"
    ? THEME.artMetadata : null;
  const ANALYSIS_CACHE_KEY = "__CODEX_DREAM_SKIN_ANALYSIS_CACHE__";
  const THEME_VARIABLES = [
    "--ds-bg", "--ds-panel", "--ds-panel-2", "--ds-green", "--ds-lime",
    "--ds-cyan", "--ds-purple", "--ds-text", "--ds-muted", "--ds-line",
    "--ds-bg-rgb", "--ds-panel-rgb", "--ds-panel-2-rgb", "--ds-accent-rgb",
    "--ds-accent-alt-rgb", "--ds-secondary-rgb", "--ds-highlight-rgb",
    "--ds-text-rgb", "--ds-muted-rgb", "--ds-line-rgb",
    "--dream-art-focus-x", "--dream-art-focus-y", "--dream-art-position",
    "--dream-skin-focus-x", "--dream-skin-focus-y", "--dream-skin-art-position",
    "--dream-skin-name", "--dream-skin-tagline", "--dream-skin-project-prefix",
    "--dream-skin-project-label", "--dream-skin-brand-subtitle", "--dream-skin-status",
    "--dream-skin-quote", "--dream-skin-art", "--dream-skin-pet",
    "--dream-skin-sidebar-companion", "--dream-skin-avatar", "--dream-skin-tibo-avatar",
    "--dream-skin-companion",
  ];
  const selectorByKey = new Map(SELECTOR_CONTRACT.selectors.map((entry) => [entry.key, entry]));
  const stableTestidSelector = (testid) => SELECTOR_CONTRACT.stableTestids?.includes(testid)
    ? `[data-testid="${testid}"]` : null;
  const installToken = {};
  const existingAnalysisCache = window[ANALYSIS_CACHE_KEY];
  const analysisCache = existingAnalysisCache && typeof existingAnalysisCache.get === "function" &&
    typeof existingAnalysisCache.set === "function" ? existingAnalysisCache : new Map();
  window[ANALYSIS_CACHE_KEY] = analysisCache;
  let artAnalysis = typeof THEME.artKey === "string" ? analysisCache.get(THEME.artKey) ?? null : null;
  let analysisTimer = null;
  let readinessCheckTimer = null;
  let rootObserver = null;
  let routeObserver = null;
  let routeObserverDeepTargets = new Set();
  let routeObserverLifecycleTargets = new Set();
  let bodyReadyHandler = null;
  let interactionRepairTimer = null;
  let pointerRepairHandler = null;
  let focusRepairHandler = null;
  let visibilityRepairHandler = null;
  let visibilityResumeTimers = new Set();
  let backgroundRepairPending = false;
  let networkOnlineHandler = null;
  let networkOfflineHandler = null;
  let resizeRepairHandler = null;
  let resizeCoordinatorCleanup = null;
  let styleMode = null;
  let styleNode = null;
  let styleSheet = null;
  let quotaObserver = null;
  let quotaObservedHeader = null;
  let quotaObservedComposer = null;
  let quotaComposerHideTimer = null;
  let quotaComposerPortalPositionFrame = null;
  let quotaComposerPortalPositionUsesAnimationFrame = false;
  let quotaComposerPortalPositionRetryTimer = null;
  let quotaComposerResizeObserver = null;
  let quotaComposerResizeTargets = [];
  let quotaPollTimer = null;
  let quotaScheduleTimer = null;
  let quotaRetryTimer = null;
  let quotaRetryCount = 0;
  let sessionTokenTimer = null;
  let sessionTokenContextNode = null;
  let sessionTokenActiveThreadId = "";
  let sessionTokenLastNativeScan = 0;
  let sessionTokenNativeUsageCache = null;
  const SESSION_TOKEN_NATIVE_SCAN_MS = 6000;
  const SESSION_TOKEN_NATIVE_MISS_SCAN_MS = 30000;
  const SESSION_THREAD_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let quotaEventHandler = null;
  let quotaState = null;
  let quotaBridgeState = null;
  let quotaResetReconciliation = null;
  let quotaBridgeRequest = null;
  let quotaRadarState = null;
  let quotaRadarRequest = null;
  let quotaRadarTimer = null;
  let quotaSystemClockRuntime = null;
  let threadEarningRuntime = null;
  let experienceSchedulerTimer = null;
  const experienceSchedulerNext = {
    safety: 0,
    quota: 0,
    session: 0,
    quotaRadar: 0,
    tiboRadar: 0,
    modelRadar: 0,
  };
  const EXPERIENCE_SCHEDULER_TICK_MS = 5000;
  const EXPERIENCE_SCHEDULER_SAFETY_MS = 90 * 1000;
  const SESSION_TOKEN_VIEW_REFRESH_MS = 10 * 1000;
  let quotaRadarRetryTimer = null;
  let quotaRadarRetryCount = 0;
  let tiboRadarState = null;
  let tiboRadarRequest = null;
  let tiboRadarTimer = null;
  let resetDisplayObserver = null;
  let resetDisplayGuardRoot = null;
  let resetDisplayRepairing = false;
  let environmentPanelCache = null;
  let modelRadarRequest = null;
  let modelRadarTimer = null;
  let modelRadarRetryTimer = null;
  let modelRadarRetryCount = 0;
  let modelRadarFeedbackTimer = null;
  let modelRadarSelectionKey = "";
  let modelRadarSortedPointsCache = { source: null, points: [] };
  let modelRadarDisplayPointsCache = { source: null, points: [] };
  let modelRadarValueScoresCache = { points: null, scores: new Map() };
  let modelRadarRecommendationsCache = { points: null, value: null };
  const persistentHeaderUiNodes = new Map();
  let modelRadarState = {
    status: "loading",
    updatedAt: "",
    checkedAt: "",
    fingerprint: "",
    refreshing: false,
    refreshFeedback: "",
    points: [],
  };
  let summaryObserver = null;
  let summaryRefreshTimer = null;
  let characterReplyRepairTimer = null;
  let characterReplySubtreeRepairTimer = null;
  const pendingCharacterReplyRows = new Set();
  const pendingCharacterReplySubtrees = new Map();
  const CHARACTER_REPLY_REPAIR_BATCH_SIZE = 24;
  const CHARACTER_REPLY_SUBTREE_BATCH_SIZE = 48;
  let moodRotationTimer = null;
  let routeEnsureTimer = null;
  let routeFollowupTimer = null;
  let routeTransitionStartedAt = 0;
  let routeTransitionTimedOut = false;
  let routeUrlSignature = "";
  let routeHistoryRestore = null;
  let resizeRepairTimer = null;
  let sidebarProjectPortalRepairTimer = null;
  let sidebarAccountRepairTimer = null;
  let sidebarAccountRepairAttempts = 0;
  let sidebarProjectPointerHandler = null;
  let projectNavigationLockHandler = null;
  let sidebarProjectHoverTarget = null;
  let sidebarGreetingSizeCache = null;
  let sidebarGreetingResizeObserver = null;
  let sidebarGreetingResizeTarget = null;
  let sidebarGreetingMeasureCanvas = null;
  let sidebarGreetingMeasureContext = null;
  let backgroundSwitchTimer = null;
  let experienceCompletionTimer = null;
  const isRendererVisible = () => document.visibilityState === "visible";
  const publishRendererVisibility = (visible = isRendererVisible()) => {
    const report = globalThis[RENDERER_ACTIVITY_BINDING_NAME];
    if (typeof report !== "function") return;
    try {
      report(JSON.stringify({
        type: "visibility",
        state: visible ? "visible" : "hidden",
        at: Date.now(),
      }));
    } catch {}
  };
  const syncRendererVisibilityState = () => {
    const visible = isRendererVisible();
    document.documentElement?.toggleAttribute("data-dream-window-hidden", !visible);
    publishRendererVisibility(visible);
    return visible;
  };
  const SIDEBAR_ACCOUNT_BUTTON_SELECTOR =
    ':is(aside.app-shell-left-panel, aside[data-testid="app-shell-floating-left-panel"]) '
    + 'nav + div > div:last-child button:first-child';
  const SIDEBAR_ACCOUNT_BUTTON_FALLBACK_SELECTOR =
    ':is(aside.app-shell-left-panel, aside[data-testid="app-shell-floating-left-panel"]) '
    + '> div:first-child div.absolute.inset-x-0.bottom-0 '
    + '> div[class*="container-type"] > div[class*="h-toolbar"] button:first-child';
  const SIDEBAR_PANEL_SELECTOR =
    'aside.app-shell-left-panel, aside[data-testid="app-shell-floating-left-panel"]';
  const SIDEBAR_COMPANION_SURFACE_SELECTOR =
    ':is(aside.app-shell-left-panel, aside[data-testid="app-shell-floating-left-panel"]) '
    + 'nav > div:first-child > div:first-child';
  const SIDEBAR_CURRENT_ITEM_SELECTOR =
    ':is(aside.app-shell-left-panel, aside[data-testid="app-shell-floating-left-panel"]) '
    + 'nav > div:nth-child(2) [aria-current="page"]';
  const SETTINGS_NAV_LABEL = String.fromCodePoint(35774, 32622);
  const SIDEBAR_GREETING_ATTR = "data-dream-greeting";
  const SIDEBAR_TOGGLE_ATTR = "data-dream-native-sidebar-toggle";
  const SIDEBAR_FLOATING_ATTR = "data-dream-sidebar-floating";
  const SIDEBAR_PROJECT_PORTAL_ATTR = "data-dream-sidebar-project-portal";
  const SIDEBAR_PROJECT_POSITIONED_ATTR = "data-dream-sidebar-project-positioned";
  const SIDEBAR_PROJECT_ROW_SELECTOR = '[class~="group/project-hover-card-row"]';
  const SIDEBAR_PROJECT_TRIGGER_SELECTOR =
    ':is(aside.app-shell-left-panel, aside[data-testid="app-shell-floating-left-panel"]) [role="button"]';
  const findSidebarAccountButton = () => document.querySelector(SIDEBAR_ACCOUNT_BUTTON_SELECTOR) ||
    document.querySelector(SIDEBAR_ACCOUNT_BUTTON_FALLBACK_SELECTOR);
  const NATIVE_SIDEBAR_TOGGLE_SELECTOR = [
    'button[data-app-shell-sidebar-trigger="true"]',
    'button[aria-label="\u9690\u85cf\u8fb9\u680f"]',
    'button[aria-label="\u663e\u793a\u8fb9\u680f"]',
    'button[aria-label="\u5207\u6362\u8fb9\u680f"]',
    'button[aria-label="\u663e\u793a/\u9690\u85cf\u4fa7\u8fb9\u680f"]',
    'button[aria-label="Toggle sidebar"]',
  ].join(", ");
  const CHARACTER_STYLE_ATTR = "data-dream-character-style";
  const CHARACTER_REPLY_STYLE_ATTR = "data-dream-reply-style";
  /* Codex 26.803 moved the assistant marker from the data-key suffix to a
     visually-hidden speaker heading inside the message row. Keep the legacy
     suffix for older builds; discover the current row shape separately so a
     streaming reply never evaluates a document-wide relational :has() query. */
  const ASSISTANT_REPLY_SELECTOR = '[data-content-search-unit-key$=":assistant"]';
  const CHAT_REPLY_SUBTREE_SELECTOR = [
    '.thread-scroll-container',
    'main:is(.main-surface, [class*="_MainContentSurface_"])',
    '[data-content-search-turn-key]',
    '[data-content-search-unit-key]',
  ].join(", ");
  const COMPOSER_SURFACE_REPAIR_ATTR = "data-dream-composer-surface-repair";
  const COMPOSER_CHARACTER_SELECTOR = ".composer-surface-chrome";
  /* Component ownership is intentionally expressed with one namespaced
     attribute. A node may belong to more than one boundary (for example the
     composer quota portal is both ComposerDock and OverlayManager), so the
     value is a space-separated token list rather than a single enum. */
  const COMPONENT_BOUNDARY_ATTR = "data-dream-component-boundary";
  const COMPONENT_BOUNDARY_VERSION = "1";
  let componentBoundaries = null;
  let componentBoundaryNodes = new Set();
  let componentBoundarySnapshot = null;
  let componentBoundaryDirty = true;
  let componentBoundaryTransactionDepth = 0;
  const markComponentBoundaryDirty = () => {
    componentBoundaryDirty = true;
  };
  /* Keep each surface on its own original character asset. These only change
     the crop and framing of that surface's asset — never the character art. */
  const CHARACTER_PRESENTATIONS = Object.freeze({
    account: Object.freeze([
      { size: "100% auto", position: "50% 0%" }, { size: "98% auto", position: "49% 0%" },
      { size: "102% auto", position: "51% 0%" }, { size: "99% auto", position: "50% 0%" },
      { size: "101% auto", position: "48% 0%" }, { size: "97% auto", position: "52% 0%" },
      { size: "103% auto", position: "49% 0%" }, { size: "99% auto", position: "53% 0%" },
      { size: "101% auto", position: "50% 0%" }, { size: "98% auto", position: "51% 0%" },
    ]),
    composer: Object.freeze([
      { size: "auto 100%", position: "50% 100%" }, { size: "auto 103%", position: "48% 100%" },
      { size: "auto 98%", position: "53% 99%" }, { size: "auto 100%", position: "50% 100%" },
      { size: "auto 101%", position: "46% 100%" }, { size: "auto 97%", position: "54% 98%" },
      { size: "auto 104%", position: "49% 100%" }, { size: "auto 99%", position: "55% 99%" },
      { size: "auto 102%", position: "50% 100%" }, { size: "auto 96%", position: "52% 98%" },
    ]),
    replies: Object.freeze([
      { size: "100% auto", position: "50% 56%" }, { size: "103% auto", position: "48% 55%" },
      { size: "98% auto", position: "53% 57%" }, { size: "105% auto", position: "51% 54%" },
      { size: "101% auto", position: "46% 58%" }, { size: "99% auto", position: "54% 56%" },
      { size: "104% auto", position: "49% 57%" }, { size: "97% auto", position: "55% 55%" },
      { size: "102% auto", position: "50% 59%" }, { size: "100% auto", position: "52% 53%" },
      { size: "106% auto", position: "47% 56%" }, { size: "98% auto", position: "54% 58%" },
      { size: "103% auto", position: "50% 54%" }, { size: "99% auto", position: "45% 57%" },
      { size: "101% auto", position: "55% 55%" },
    ]),
  });
  /* Character art is skin chrome, not content state. Keep each dedicated
     asset on one stable crop so route changes and streamed replies cannot
     make the same person jump between poses. */
  const FIXED_CHARACTER_STYLES = Object.freeze({ account: 0, composer: 3, replies: 0 });
  const SUMMARY_FOOTER_ATTR = "data-dream-summary-footer";
  const SUMMARY_FLOATING_SELECTOR = 'div[class*="thread-floating-content-top-inset"]';
  const SUMMARY_POPPER_SELECTOR = '[data-radix-popper-content-wrapper]';
  const SUMMARY_HOST_SELECTOR = `${SUMMARY_FLOATING_SELECTOR}, ${SUMMARY_POPPER_SELECTOR}`;
  const SUMMARY_ITEM_SELECTOR = '[data-slot="thread-summary-panel-item-button"]';
  const THREAD_LOADING_STAGE_ATTR = "data-dream-thread-loading-stage";
  const THREAD_LOADING_PORTAL_ATTR = "data-dream-thread-loading-portal";
  const THREAD_LOADING_FALLBACK_ATTR = "data-dream-thread-loading-fallback";
  /* The route mask is only a paint-gap guard. Worktree creation can take much
     longer than a React route commit, so never let the guard hide Codex's own
     startup state indefinitely. */
  const ROUTE_TRANSITION_MASK_MAX_MS = 1500;
  const ROUTE_TRANSITION_RETRY_MS = 120;
  const TASK_STARTUP_STATUS_RE = /(?:正在启动(?:你的)?任务|(?:正在)?等待工作树设置|starting\s+(?:your\s+)?task|preparing\s+(?:your\s+)?task|waiting\s+(?:for\s+)?(?:the\s+)?(?:worktree|workspace)(?:\s+setup)?|setting\s+up\s+(?:the\s+)?(?:worktree|workspace))/i;
  /* This is the same 21px blossom path Codex renders inside its native
     loading root. Keep a local copy only for the route-replacement gap, when
     React has removed the native loader before the next thread is mounted. */
  const THREAD_LOADING_LOGO_PATH =
    "M11.6475 18.3409C11.0975 18.3409 10.575 18.2364 10.08 18.0274C9.58502 17.8184 9.14502 17.5269 8.76002 17.1529C8.34202 17.2959 7.90751 17.3674 7.45651 17.3674C6.71951 17.3674 6.03751 17.1859 5.41051 16.8229C4.78351 16.4599 4.27751 15.9649 3.89251 15.3379C3.51851 14.7109 3.33151 14.0124 3.33151 13.2424C3.33151 12.9234 3.37551 12.5769 3.46351 12.2029C3.02351 11.7959 2.68251 11.3284 2.44051 10.8004C2.19851 10.2614 2.07751 9.70044 2.07751 9.11744C2.07751 8.52344 2.20401 7.95144 2.45701 7.40144C2.71001 6.85144 3.06201 6.37844 3.51301 5.98244C3.97501 5.57544 4.50851 5.29494 5.11351 5.14094C5.23451 4.51394 5.48751 3.95294 5.87251 3.45794C6.26851 2.95194 6.75252 2.55594 7.32452 2.26994C7.89652 1.98394 8.50702 1.84094 9.15602 1.84094C9.70602 1.84094 10.2285 1.94544 10.7235 2.15444C11.2185 2.36344 11.6585 2.65494 12.0435 3.02894C12.4615 2.88594 12.896 2.81444 13.347 2.81444C14.084 2.81444 14.766 2.99594 15.393 3.35894C16.02 3.72194 16.5205 4.21694 16.8945 4.84394C17.2795 5.47094 17.472 6.16944 17.472 6.93944C17.472 7.25844 17.428 7.60494 17.34 7.97894C17.78 8.38594 18.121 8.85894 18.363 9.39794C18.605 9.92594 18.726 10.4814 18.726 11.0644C18.726 11.6584 18.5995 12.2304 18.3465 12.7804C18.0935 13.3304 17.736 13.8089 17.274 14.2159C16.823 14.6119 16.295 14.8869 15.69 15.0409C15.569 15.6679 15.3105 16.2289 14.9145 16.7239C14.5295 17.2299 14.051 17.6259 13.479 17.9119C12.907 18.1979 12.2965 18.3409 11.6475 18.3409ZM7.57201 16.2784C8.12201 16.2784 8.60051 16.1629 9.00751 15.9319L12.1095 14.1499C12.2195 14.0729 12.2745 13.9684 12.2745 13.8364V12.4174L8.28152 14.7109C8.03952 14.8539 7.79751 14.8539 7.55552 14.7109L4.43701 12.9124C4.43701 12.9454 4.43151 12.9839 4.42051 13.0279C4.42051 13.0719 4.42051 13.1379 4.42051 13.2259C4.42051 13.7869 4.55252 14.3039 4.81651 14.7769C5.09152 15.2389 5.47101 15.6019 5.95501 15.8659C6.43901 16.1409 6.97801 16.2784 7.57201 16.2784ZM7.73701 13.5889C7.80301 13.6219 7.86351 13.6384 7.91851 13.6384C7.97351 13.6384 8.02852 13.6219 8.08352 13.5889L9.32101 12.8794L5.34451 10.5694C5.10251 10.4269 4.98151 10.2119 4.98151 9.92594V6.34544C4.43151 6.58744 3.99151 6.96144 3.66151 7.46744C3.33151 7.96244 3.16651 8.51244 3.16651 9.11744C3.16651 9.65644 3.30401 10.1734 3.57901 10.6684C3.85401 11.1634 4.21151 11.5374 4.65151 11.7904L7.73701 13.5889ZM11.6475 17.2519C12.2305 17.2519 12.7585 17.1199 13.2315 16.8559C13.7045 16.5919 14.0785 16.2289 14.3535 15.7669C14.6285 15.3049 14.766 14.7879 14.766 14.2159V10.6519C14.766 10.5199 14.711 10.4209 14.601 10.3549L13.347 9.62894V14.2324C13.347 14.5189 13.226 14.7329 12.984 14.8759L9.86551 16.6744C10.4045 17.0599 10.9985 17.2519 11.6475 17.2519ZM12.2745 11.2129V8.96894L10.41 7.91294L8.52902 8.96894V11.2129L10.41 12.2689L12.2745 11.2129ZM7.45651 5.94944C7.45651 5.66344 7.57752 5.44894 7.81952 5.30594L10.938 3.50744C10.399 3.12294 9.80502 2.92994 9.15602 2.92994C8.57302 2.92994 8.04501 3.06194 7.57201 3.32594C7.09901 3.58994 6.72502 3.95294 6.45002 4.41494C6.18602 4.87694 6.05401 5.39394 6.05401 5.96594V9.51344C6.05401 9.64594 6.10901 9.74994 6.21901 9.82694L7.45651 10.5529V5.94944ZM15.8385 13.8364C16.3885 13.5944 16.823 13.2209 17.142 12.7144C17.472 12.2084 17.637 11.6584 17.637 11.0644C17.637 10.5254 17.4995 10.0084 17.2245 9.51344C16.9495 9.01844 16.592 8.64494 16.152 8.39144L13.0665 6.60944C13.0005 6.56544 12.94 6.54894 12.885 6.55994C12.83 6.55994 12.775 6.57644 12.72 6.60944L11.4825 7.30294L15.4755 9.62894C15.5965 9.69494 15.6845 9.78294 15.7395 9.89294C15.8055 9.99194 15.8385 10.11294 15.8385 10.25594V13.8364ZM12.522 5.45444C12.764 5.30044 13.006 5.30044 13.248 5.45444L16.383 7.28594C16.383 7.20894 16.383 7.10994 16.383 6.98894C16.383 6.46094 16.251 5.96094 15.987 5.48794C15.734 5.00394 15.3655 4.61894 14.8815 4.33294C14.4085 4.04694 13.8585 3.90394 13.2315 3.90394C12.6815 3.90394 12.203 4.01894 11.796 4.24994L8.69402 6.03194C8.58402 6.10894 8.52902 6.21344 8.52902 6.34544V7.76494L12.522 5.45444Z";
  /* Codex 26.727 replaced the readable loader class with a generated root
     class such as _Root_1pmya_21. Keep the legacy class as well, but identify
     the generated root by its native shimmer variables before marking it. */
  const THREAD_LOADING_ROOT_NODE_SELECTOR = [
    ".openai-blossom-shimmer",
    '[class^="_Root_"]',
    '[class*=" _Root_"]',
  ].join(", ");
  const THREAD_LOADING_ROOT_SELECTOR = [
    ".thread-scroll-container .openai-blossom-shimmer",
    '.thread-scroll-container [class^="_Root_"]',
    '.thread-scroll-container [class*=" _Root_"]',
  ].join(", ");
  const now = () => typeof performance === "object" && typeof performance.now === "function"
    ? performance.now() : Date.now();
  const metrics = {
    ensureCalls: 0,
    rootPasses: 0,
    routePasses: 0,
    routeContextReads: 0,
    layoutReads: 0,
    attributeWrites: 0,
    styleWrites: 0,
    styleRepairs: 0,
    navigationEvents: 0,
    sidebarFastPaths: 0,
    sidebarLegacyNodesRemoved: 0,
    safetyPasses: 0,
    analysisRuns: 0,
    relationalRulesRemoved: 0,
    duplicateRulesRemoved: 0,
    duplicateDeclarationsRemoved: 0,
    analysisCacheHits: artAnalysis ? 1 : 0,
    replyFullScans: 0,
    replyIncrementalPasses: 0,
    replyIncrementalRows: 0,
    firstEnsureMs: null,
    analysisMs: null,
  };

  const previous = window[STATE_KEY];
  /* A prior development payload can retain a cleanup closure from an older
     schema.  Do not let that stale cleanup prevent the corrected payload
     from taking ownership of the renderer. */
  if (typeof previous?.cleanup === "function") {
    try { previous.cleanup(); } catch {}
  }
  /* A late async ensure from an older payload can outlive its cleanup and
     recreate a second earning interval. Keep every corrected runtime in a
     shared registry so the next hot-reload can stop the whole family. */
  const previousThreadEarningRuntimes = window[THREAD_EARNING_RUNTIME_REGISTRY_KEY];
  if (previousThreadEarningRuntimes instanceof Set) {
    for (const runtime of previousThreadEarningRuntimes) {
      try { runtime?.stop?.(); } catch {}
    }
    previousThreadEarningRuntimes.clear();
  }
  const threadEarningRuntimes = new Set();
  window[THREAD_EARNING_RUNTIME_REGISTRY_KEY] = threadEarningRuntimes;
  window[DISABLED_KEY] = false;
  const ownsRenderer = () => window[STATE_KEY]?.installToken === installToken &&
    window[DISABLED_KEY] !== true;

  const existingStyleRegistry = window[STYLE_REGISTRY_KEY];
  const styleRegistry = existingStyleRegistry instanceof Set ? existingStyleRegistry : new Set();
  window[STYLE_REGISTRY_KEY] = styleRegistry;
  const isDreamSkinStyleSheet = (candidate) => {
    if (!candidate || typeof candidate.cssRules === "undefined") return false;
    try {
      /* Early-document bootstrap and normal hot-reapply can briefly create two
         constructable sheets. The registry only knows about the current
         generation, so identify an orphaned skin sheet by walking nested
         @media/@supports rules for its private selector and art variable. */
      let hasSkinSelector = false;
      let hasArtVariable = false;
      const visit = (rules) => {
        for (const rule of rules || []) {
          const text = String(rule?.cssText || "");
          if (text.includes("[data-dream-skin")) hasSkinSelector = true;
          if (text.includes("--dream-skin-art")) hasArtVariable = true;
          if (rule?.cssRules) visit(rule.cssRules);
          if (hasSkinSelector && hasArtVariable) return;
        }
      };
      visit(candidate.cssRules);
      return hasSkinSelector && hasArtVariable;
    } catch {
      return false;
    }
  };
  let lastStyleOrphanSweepAt = 0;
  const pruneOrphanedDreamStyleSheets = (keep = null) => {
    if (!("adoptedStyleSheets" in document)) return;
    const current = [...document.adoptedStyleSheets];
    if (current.length < 2) return;
    const nowMs = Date.now();
    if (nowMs - lastStyleOrphanSweepAt < 1000) return;
    lastStyleOrphanSweepAt = nowMs;
    const retained = current.filter((candidate) =>
      candidate === keep || !isDreamSkinStyleSheet(candidate));
    if (retained.length !== current.length) {
      document.adoptedStyleSheets = retained;
    }
  };
  const dataUrlToObjectUrl = (dataUrl) => {
    if (typeof dataUrl !== "string") return null;
    try {
      const comma = dataUrl.indexOf(",");
      if (comma < 0) return null;
      const mime = /^data:([^;,]+)/.exec(dataUrl)?.[1] || "image/png";
      const binary = atob(dataUrl.slice(comma + 1));
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
      return URL.createObjectURL(new Blob([bytes], { type: mime }));
    } catch {
      return null;
    }
  };
  const artUrl = dataUrlToObjectUrl(artDataUrl);
  let petUrl = dataUrlToObjectUrl(petDataUrl);
  let sidebarCompanionUrl = dataUrlToObjectUrl(sidebarCompanionDataUrl);
  let sidebarAccountAvatarUrl = dataUrlToObjectUrl(sidebarAccountAvatarDataUrl);
  let chatAvatarUrl = sidebarAccountAvatarUrl;
  let composerCompanionUrl = dataUrlToObjectUrl(composerCompanionDataUrl);
  let tiboAvatarUrl = dataUrlToObjectUrl(tiboAvatarDataUrl);
  const baseOptionalAssetUrls = {
    pet: petUrl,
    sidebarCompanion: sidebarCompanionUrl,
    sidebarAccountAvatar: sidebarAccountAvatarUrl,
    composerCompanion: composerCompanionUrl,
    tiboAvatar: tiboAvatarUrl,
  };
  const lazyAssetConfig = lazyAssetManifest && typeof lazyAssetManifest === "object"
    ? lazyAssetManifest : {};
  const lazyAssetIds = lazyAssetConfig.assets && typeof lazyAssetConfig.assets === "object"
    ? lazyAssetConfig.assets : {};
  const lazyVariantAssetIds = lazyAssetConfig.variants && typeof lazyAssetConfig.variants === "object"
    ? lazyAssetConfig.variants : {};
  const variantOptionalAssetUrls = new Map();
  /* A variant can intentionally reuse one file for several presentation
     slots (Doraemon uses the same avatar for the pet and account surfaces).
     Keep one object URL per lazy asset so those slots share the decoded
     resource instead of allocating a new Blob URL on every hydration pass. */
  const lazyAssetObjectUrls = new Map();
  let optionalAssetHydrationRevision = 0;
  const lazyAssetRequests = new Map();
  const lazyAssetInFlight = new Map();
  const backgroundDecodeCache = new Map();
  let backgroundPreloadTimer = null;
  let backgroundPreloadPromise = null;
  let lazyAssetRequestSequence = 0;
  const lazyAssetResponseKey = "__CODEX_DREAM_SKIN_ASSET_RESPONSE__";
  const lazyAssetFallbackKey = "__CODEX_DREAM_SKIN_LAZY_ASSETS__";
  const lazyAssetBindingName = "codexDreamSkinLoadAsset";
  const publicFetchRequests = new Map();
  let publicFetchRequestSequence = 0;
  const publicFetchResponseKey = "__CODEX_DREAM_SKIN_PUBLIC_FETCH_RESPONSE__";
  const publicFetchBindingName = "codexDreamSkinFetchPublic";
  const publicFetchResponse = (requestId, body) => {
    const pending = publicFetchRequests.get(String(requestId));
    if (!pending) return;
    publicFetchRequests.delete(String(requestId));
    clearTimeout(pending.timeout);
    pending.resolve(typeof body === "string" ? body : null);
  };
  globalThis[publicFetchResponseKey] = publicFetchResponse;
  const requestPublicFetch = (url, timeoutMs = 15000) => {
    const binding = globalThis[publicFetchBindingName];
    if (typeof binding !== "function") return Promise.resolve(null);
    const requestId = `${++publicFetchRequestSequence}:${Date.now()}`;
    let resolveRequest;
    const promise = new Promise((resolve) => { resolveRequest = resolve; });
    const timeout = setTimeout(() => {
      publicFetchRequests.delete(requestId);
      resolveRequest(null);
    }, Math.max(1000, timeoutMs));
    publicFetchRequests.set(requestId, { resolve: resolveRequest, timeout });
    try {
      binding(JSON.stringify({ requestId, url }));
    } catch {
      clearTimeout(timeout);
      publicFetchRequests.delete(requestId);
      resolveRequest(null);
    }
    return promise;
  };
  const previousLazyAssetResponse = globalThis[lazyAssetResponseKey];
  const lazyAssetResponse = (requestId, dataUrl) => {
    const pending = lazyAssetRequests.get(String(requestId));
    if (!pending) return;
    lazyAssetRequests.delete(String(requestId));
    clearTimeout(pending.timeout);
    if (pending.fallbackTimer) clearTimeout(pending.fallbackTimer);
    pending.resolve(typeof dataUrl === "string" ? dataUrl : null);
  };
  globalThis[lazyAssetResponseKey] = lazyAssetResponse;
  const requestLazyAsset = (assetId) => {
    if (typeof assetId !== "string" || !assetId) return Promise.resolve(null);
    const existing = lazyAssetInFlight.get(assetId);
    if (existing) return existing.promise;
    const fallbackDataUrl = globalThis[lazyAssetFallbackKey]?.[assetId];
    if (typeof fallbackDataUrl === "string") return Promise.resolve(fallbackDataUrl);
    const binding = globalThis[lazyAssetBindingName];
    if (typeof binding !== "function") return Promise.resolve(null);
    const requestId = `${++lazyAssetRequestSequence}:${Date.now()}`;
    let resolveRequest;
    const promise = new Promise((resolve) => { resolveRequest = resolve; });
    const timeout = setTimeout(() => {
      lazyAssetRequests.delete(requestId);
      resolveRequest(null);
    }, 12000);
    const fallbackTimer = setTimeout(() => {
      const fallback = globalThis[lazyAssetFallbackKey]?.[assetId];
      if (typeof fallback === "string") lazyAssetResponse(requestId, fallback);
    }, 250);
    lazyAssetRequests.set(requestId, {
      promise, resolve: resolveRequest, timeout, fallbackTimer, assetId,
    });
    lazyAssetInFlight.set(assetId, { promise });
    promise.finally(() => {
      if (lazyAssetInFlight.get(assetId)?.promise === promise) lazyAssetInFlight.delete(assetId);
    });
    try {
      binding(JSON.stringify({ requestId, assetId }));
    } catch {
      clearTimeout(timeout);
      lazyAssetRequests.delete(requestId);
      resolveRequest(null);
    }
    return promise;
  };
  const materializeLazyDataUrl = (variant, dataUrl) => {
    if (!variant || variant.url) return variant?.url || null;
    const url = dataUrlToObjectUrl(dataUrl);
    if (url) {
      variant.url = url;
      variant.dataUrl = null;
    }
    return url;
  };
  const materializeLazyAssetUrl = (assetId, dataUrl) => {
    if (typeof assetId === "string" && assetId) {
      const cached = lazyAssetObjectUrls.get(assetId);
      if (cached) return cached;
    }
    const url = dataUrlToObjectUrl(dataUrl);
    if (url && typeof assetId === "string" && assetId) {
      lazyAssetObjectUrls.set(assetId, url);
    }
    return url;
  };
  const backgroundVariants = (Array.isArray(backgroundVariantsData) ? backgroundVariantsData : [])
    .map((variant) => ({
      ...variant,
      url: null,
      assetPromise: null,
    }))
    .filter((variant) => variant.id && (variant.dataUrl || variant.resourceId || variant.sharedAsset === "art"));
  const ensureBackgroundVariantUrl = (variant) => {
    if (!variant) return Promise.resolve(null);
    if (variant.sharedAsset === "art") {
      variant.url = null;
      return Promise.resolve(artUrl);
    }
    if (variant.url) return Promise.resolve(variant.url);
    if (variant.dataUrl) return Promise.resolve(materializeLazyDataUrl(variant, variant.dataUrl));
    if (!variant.resourceId) return Promise.resolve(null);
    if (!variant.assetPromise) {
      variant.assetPromise = requestLazyAsset(variant.resourceId)
        .then((dataUrl) => materializeLazyDataUrl(variant, dataUrl))
        .catch(() => null)
        .finally(() => { variant.assetPromise = null; });
    }
    return variant.assetPromise;
  };
  const decodeBackgroundUrl = (url) => {
    if (typeof url !== "string" || !url) return Promise.resolve(false);
    const cached = backgroundDecodeCache.get(url);
    if (cached) return cached;
    if (typeof globalThis.Image !== "function") return Promise.resolve(true);
    const promise = new Promise((resolve) => {
      const image = new globalThis.Image();
      let settled = false;
      const finish = (decoded) => {
        if (settled) return;
        settled = true;
        image.onload = null;
        image.onerror = null;
        resolve(Boolean(decoded));
      };
      image.decoding = "async";
      image.loading = "eager";
      try { image.fetchPriority = "low"; } catch {}
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      image.src = url;
      if (typeof image.decode === "function") {
        try {
          Promise.resolve(image.decode()).then(
            () => finish(true),
            () => { if (image.complete) finish(Number(image.naturalWidth) > 0); },
          );
        } catch {
          if (image.complete) finish(Number(image.naturalWidth) > 0);
        }
      } else if (image.complete) {
        finish(Number(image.naturalWidth) > 0);
      }
    });
    backgroundDecodeCache.set(url, promise);
    promise.then((decoded) => {
      if (!decoded && backgroundDecodeCache.get(url) === promise) {
        backgroundDecodeCache.delete(url);
      }
    });
    return promise;
  };
  const preloadBackgroundVariant = async (variant) => {
    const url = await ensureBackgroundVariantUrl(variant);
    if (!url) return null;
    return await decodeBackgroundUrl(url) ? url : null;
  };
  const preloadBackgroundVariants = () => {
    if (backgroundPreloadPromise) return backgroundPreloadPromise;
    backgroundPreloadPromise = (async () => {
      /* Decode one background at a time after the first paint. This warms the
         alternate wallpapers without competing with the initial shell commit
         or causing a burst of image decode work. */
      for (const variant of backgroundVariants) {
        if (window[DISABLED_KEY]) break;
        /* The active variant has already been handed to the browser as the
           visible background (and lazy variants are decoded by the apply path).
           Do not decode that same bitmap a second time in the idle preload. */
        if (variant.id === activeBackgroundVariantId) continue;
        await preloadBackgroundVariant(variant).catch(() => null);
      }
    })().finally(() => {
      backgroundPreloadPromise = null;
    });
    return backgroundPreloadPromise;
  };
  const scheduleBackgroundVariantPreload = (delay = 900) => {
    if (backgroundPreloadTimer || backgroundPreloadPromise || typeof setTimeout !== "function") return;
    backgroundPreloadTimer = setTimeout(() => {
      backgroundPreloadTimer = null;
      void preloadBackgroundVariants().catch(() => {});
    }, Math.max(0, delay));
  };
  const optionalAssetSlots = [
    { key: "pet", get: () => petUrl, set: (url) => { petUrl = url; }, stateKey: "petUrl" },
    {
      key: "sidebarCompanion",
      get: () => sidebarCompanionUrl,
      set: (url) => { sidebarCompanionUrl = url; },
      stateKey: "sidebarCompanionUrl",
    },
    {
      key: "composerCompanion",
      get: () => composerCompanionUrl,
      set: (url) => { composerCompanionUrl = url; },
      stateKey: "composerCompanionUrl",
    },
    { key: "tiboAvatar", get: () => tiboAvatarUrl, set: (url) => { tiboAvatarUrl = url; }, stateKey: "tiboAvatarUrl" },
    {
      key: "sidebarAccountAvatar",
      get: () => sidebarAccountAvatarUrl,
      set: (url) => {
        sidebarAccountAvatarUrl = url;
        chatAvatarUrl = url;
      },
      stateKey: "sidebarAccountAvatarUrl",
    },
  ];
  const getVariantOptionalAssetCache = (variantId) => {
    if (!variantOptionalAssetUrls.has(variantId)) variantOptionalAssetUrls.set(variantId, {});
    return variantOptionalAssetUrls.get(variantId);
  };
  const syncOptionalAssetRootStyles = () => {
    const root = document.documentElement;
    if (!(root instanceof Element)) return;
    setStyleProperty(root, "--dream-skin-pet", petUrl ? `url("${petUrl}")` : "none");
    setStyleProperty(root, "--dream-skin-sidebar-companion",
      sidebarCompanionUrl ? `url("${sidebarCompanionUrl}")` : "none");
    setStyleProperty(root, "--dream-skin-sidebar-account-avatar",
      sidebarAccountAvatarUrl ? `url("${sidebarAccountAvatarUrl}")` : "none");
    setStyleProperty(root, "--dream-skin-avatar", chatAvatarUrl ? `url("${chatAvatarUrl}")` : "none");
    setStyleProperty(root, "--dream-skin-companion",
      composerCompanionUrl ? `url("${composerCompanionUrl}")` : "none");
    setStyleProperty(root, "--dream-skin-tibo-avatar", tiboAvatarUrl ? `url("${tiboAvatarUrl}")` : "none");
  };
  const resetOptionalAssetsForVariant = (variantId) => {
    const variantManifest = lazyVariantAssetIds[variantId] &&
      typeof lazyVariantAssetIds[variantId] === "object"
      ? lazyVariantAssetIds[variantId] : null;
    const variantCache = variantManifest ? getVariantOptionalAssetCache(variantId) : null;
    for (const slot of optionalAssetSlots) {
      const variantAssetId = slot.key === "tiboAvatar" ? "" : variantManifest?.[slot.key];
      const cache = variantAssetId ? variantCache : baseOptionalAssetUrls;
      const nextUrl = cache?.[slot.key] || null;
      slot.set(nextUrl);
      const state = window[STATE_KEY];
      if (state?.installToken === installToken) {
        state[slot.stateKey] = nextUrl;
        if (slot.key === "sidebarAccountAvatar") state.chatAvatarUrl = nextUrl;
      }
    }
    /* Clear an old variant's sprite synchronously. The demand-loaded base or
       next-variant asset can fill it later, but the previous skin must never
       be visible during a project transition. */
    syncOptionalAssetRootStyles();
  };
  const hydrateOptionalAssets = () => {
    const skinMode = document.documentElement?.getAttribute("data-dream-skin");
    if (nativeThemeSelected || !["active", "home-native", "settings"].includes(skinMode)) {
      return Promise.resolve(null);
    }
    const variantId = activeBackgroundVariantId;
    const variantManifest = lazyVariantAssetIds[variantId] &&
      typeof lazyVariantAssetIds[variantId] === "object"
      ? lazyVariantAssetIds[variantId] : null;
    const variantCache = variantManifest ? getVariantOptionalAssetCache(variantId) : null;
    const hydrationRevision = ++optionalAssetHydrationRevision;
    return Promise.all(optionalAssetSlots.map(async (slot) => {
      const variantAssetId = slot.key === "tiboAvatar" ? "" : variantManifest?.[slot.key];
      const cache = variantAssetId ? variantCache : baseOptionalAssetUrls;
      const cached = cache?.[slot.key];
      if (cached) {
        if (hydrationRevision === optionalAssetHydrationRevision &&
          activeBackgroundVariantId === variantId) {
          slot.set(cached);
          const state = window[STATE_KEY];
          if (state?.installToken === installToken) {
            state[slot.stateKey] = cached;
            if (slot.key === "sidebarAccountAvatar") state.chatAvatarUrl = cached;
          }
        }
        return cached;
      }
      const resourceId = variantAssetId || lazyAssetIds[slot.key];
      if (!resourceId) return null;
      const dataUrl = await requestLazyAsset(resourceId);
      const url = materializeLazyAssetUrl(resourceId, dataUrl);
      if (!url || window[DISABLED_KEY]) return null;
      cache[slot.key] = url;
      if (hydrationRevision !== optionalAssetHydrationRevision ||
        activeBackgroundVariantId !== variantId) return url;
      slot.set(url);
      const state = window[STATE_KEY];
      if (state?.installToken === installToken) {
        state[slot.stateKey] = url;
        if (slot.key === "sidebarAccountAvatar") state.chatAvatarUrl = url;
      }
      return url;
    })).then(() => {
      const state = window[STATE_KEY];
      if (state?.installToken === installToken && !window[DISABLED_KEY]) ensure({ root: true });
    });
  };
  const readStoredBackgroundVariant = () => {
    try {
      return localStorage.getItem(BACKGROUND_VARIANT_STORAGE_KEY);
    } catch {
      return null;
    }
  };
  const storedBackgroundVariant = readStoredBackgroundVariant();
  const readStoredThemeSelection = () => {
    try {
      return localStorage.getItem(THEME_SELECTION_STORAGE_KEY);
    } catch {
      return null;
    }
  };
  const storedThemeSelection = readStoredThemeSelection();
  let nativeThemeSelected = storedThemeSelection === NATIVE_THEME_ID;
  const configuredBackgroundVariant = typeof THEME.defaultBackgroundVariant === "string"
    ? THEME.defaultBackgroundVariant : "";
  const storedVariantSelection = backgroundVariants.some((variant) => variant.id === storedThemeSelection)
    ? storedThemeSelection
    : backgroundVariants.some((variant) => variant.id === storedBackgroundVariant)
      ? storedBackgroundVariant : null;
  let activeBackgroundVariantId = storedVariantSelection
    ? storedVariantSelection
    : (backgroundVariants.some((variant) => variant.id === configuredBackgroundVariant)
      ? configuredBackgroundVariant : backgroundVariants[0]?.id || "default");

  const EXPERIENCE_RUNTIME_EVENTS = new Set([
    "SCOPE_CHANGED", "WORK_STATE_CHANGED", "TEMPLATE_SELECTED", "QUOTA_UPDATED",
    "RESET_UPDATED", "MODEL_UPDATED", "OVERLAY_CHANGED", "NETWORK_CHANGED",
  ]);
  const EXPERIENCE_RUNTIME_ROUTES = new Set(["unknown", "home", "thread", "settings"]);
  const EXPERIENCE_RUNTIME_WORK_STATES = new Set([
    "idle", "working", "complete", "error", "offline",
  ]);
  const EXPERIENCE_RUNTIME_OVERLAYS = new Set([
    "none", "theme", "quota", "recommendation", "ring", "probability", "generic",
  ]);
  const EXPERIENCE_RUNTIME_QUOTA_PHASES = new Set([
    "loading", "unavailable", "healthy", "warning", "critical",
  ]);
  const EXPERIENCE_RUNTIME_RESET_PHASES = new Set([
    "unknown", "none", "predicted", "confirmed",
  ]);
  const EXPERIENCE_RUNTIME_MODEL_PHASES = new Set([
    "loading", "unavailable", "cached", "ready",
  ]);
  const EXPERIENCE_RUNTIME_NETWORK_PHASES = new Set([
    "unknown", "online", "degraded", "offline",
  ]);
  const EXPERIENCE_HEADER_SLOT_IDS = Object.freeze({
    theme: BACKGROUND_SWITCHER_ID,
    quota: "codex-quota-pill",
    recommendation: "codex-model-radar-pill",
  });
  const EXPERIENCE_HEADER_GROUP_ATTR = "data-dream-experience-header-group";
  const EXPERIENCE_HEADER_HOVER_BRIDGE_ID = "codex-experience-header-hover-bridge";
  const EXPERIENCE_HEADER_LAYOUT_ATTR = "data-dream-experience-header-layout";
  const EXPERIENCE_HEADER_TRACK_ATTR = "data-dream-header-track";
  const EXPERIENCE_DEFAULT_HEADER_ORDER = ["theme", "recommendation", "quota"];
  const experienceHeaderTrackState = {
    host: null,
    signature: "",
    valid: false,
  };
  const experienceSubscribers = new Set();
  let experienceStateRevision = 0;
  let experienceRuntimeState = Object.freeze({
    revision: experienceStateRevision,
    templateId: EXPERIENCE?.id || "default-experience",
    variantId: nativeThemeSelected ? null : activeBackgroundVariantId,
    native: nativeThemeSelected,
    route: "unknown",
    work: "idle",
    quota: "loading",
    reset: "unknown",
    model: "loading",
    modelSelectionKey: modelRadarSelectionKey,
    network: "unknown",
    overlay: "none",
  });

  const experienceQuotaPhase = (candidate) => {
    const status = String(candidate?.status || "").toLowerCase();
    if (status === "loading") return "loading";
    if (status !== "available") return "unavailable";
    const percentage = Number(candidate?.remainingPercentage ?? candidate?.percentage);
    if (!Number.isFinite(percentage)) return "healthy";
    return percentage <= 10 ? "critical" : percentage <= 25 ? "warning" : "healthy";
  };

  const experienceResetPhase = (candidate) => {
    if (!candidate || typeof candidate !== "object") return "unknown";
    if (candidate.resetStatus === "confirmed" || candidate.outcome === "reset-confirmed") {
      return "confirmed";
    }
    if (candidate.hasResetSignal === false || candidate.nextSignalStatus === "none" ||
      candidate.nextPredictionStatus === "none") return "none";
    if (Number.isFinite(Number(candidate.nextProbability)) || candidate.hasResetSignal === true) {
      return "predicted";
    }
    return "unknown";
  };

  const experienceModelPhase = (candidate) => {
    const status = String(candidate?.status || "loading").toLowerCase();
    if (status === "live" || status === "ready") return "ready";
    if (status === "cached" || status === "stale") return "cached";
    if (status === "unavailable" || status === "error") return "unavailable";
    return "loading";
  };

  const experienceHeaderSlotOrder = () => {
    const configured = Array.isArray(EXPERIENCE?.slots?.header?.order)
      ? EXPERIENCE.slots.header.order : [];
    const seen = new Set();
    return [...configured, ...EXPERIENCE_DEFAULT_HEADER_ORDER].filter((slot) => {
      if (!Object.hasOwn(EXPERIENCE_HEADER_SLOT_IDS, slot) || seen.has(slot)) return false;
      seen.add(slot);
      return true;
    });
  };

  const experienceCapabilityEnabled = (capability) =>
    EXPERIENCE?.capabilities?.[capability] !== false;

  const experienceHeaderSlotEnabled = (slot) => {
    const capability = slot === "recommendation" ? "recommendation" : slot;
    return experienceCapabilityEnabled(capability);
  };

  const experienceHeaderSlotViewModel = () => Object.freeze({
    order: Object.freeze(experienceHeaderSlotOrder()),
    enabled: Object.freeze(Object.fromEntries(
      Object.keys(EXPERIENCE_HEADER_SLOT_IDS).map((slot) => [
        slot, experienceHeaderSlotEnabled(slot),
      ]),
    )),
  });

  const experienceViewModel = () => {
    const state = experienceRuntimeState;
    const stateMapping = EXPERIENCE?.states?.[state.work] || EXPERIENCE?.states?.idle || null;
    return Object.freeze({
      revision: state.revision,
      template: Object.freeze({
        id: state.templateId,
        variantId: state.variantId,
        native: state.native,
      }),
      route: state.route,
      work: state.work,
      data: Object.freeze({
        quota: state.quota,
        reset: state.reset,
        model: state.model,
        network: state.network,
      }),
      sidebar: Object.freeze({
        companionRole: EXPERIENCE?.slots?.sidebar?.companionRole || "sidebar",
        accountRole: EXPERIENCE?.slots?.sidebar?.accountRole || "account",
        pose: stateMapping?.sidebarPose || "idle",
        enabled: experienceCapabilityEnabled("characters"),
      }),
      chat: Object.freeze({
        assistantRole: EXPERIENCE?.slots?.chat?.assistantRole || "assistant",
        pose: stateMapping?.chatPose || "idle",
        enabled: experienceCapabilityEnabled("characters"),
      }),
      composer: Object.freeze({
        companionRole: EXPERIENCE?.slots?.composer?.companionRole || "composer",
        ringRole: EXPERIENCE?.slots?.composer?.ring || "quota",
        probabilityRole: EXPERIENCE?.slots?.composer?.probability || "reset",
        pose: stateMapping?.composerPose || "ready",
        enabled: Object.freeze({
          companion: experienceCapabilityEnabled("characters"),
          ring: experienceCapabilityEnabled("quota") &&
            experienceCapabilityEnabled("ring") &&
            EXPERIENCE?.slots?.composer?.ring !== "none",
          probability: experienceCapabilityEnabled("quota") &&
            experienceCapabilityEnabled("probability") &&
            EXPERIENCE?.slots?.composer?.probability !== "none",
        }),
      }),
      header: experienceHeaderSlotViewModel(),
      modelSelectionKey: state.modelSelectionKey,
      overlay: state.overlay,
      slots: EXPERIENCE?.slots || null,
      capabilities: EXPERIENCE?.capabilities || null,
      states: stateMapping,
    });
  };

  const publishExperienceState = (patch, event) => {
    const next = { ...experienceRuntimeState, ...patch };
    const changed = Object.keys(patch).some((key) => next[key] !== experienceRuntimeState[key]);
    if (!changed) return false;
    experienceStateRevision += 1;
    next.revision = experienceStateRevision;
    experienceRuntimeState = Object.freeze(next);
    const viewModel = experienceViewModel();
    for (const listener of [...experienceSubscribers]) {
      try { listener(viewModel, event); } catch {}
    }
    return true;
  };

  const dispatchExperienceEvent = (type, payload = {}) => {
    if (!EXPERIENCE_RUNTIME_EVENTS.has(type)) return false;
    const patch = {};
    if (type === "SCOPE_CHANGED") {
      if (EXPERIENCE_RUNTIME_ROUTES.has(payload.route)) patch.route = payload.route;
      patch.overlay = payload.overlay ? "generic" : "none";
    } else if (type === "WORK_STATE_CHANGED") {
      if (EXPERIENCE_RUNTIME_WORK_STATES.has(payload.work)) patch.work = payload.work;
    } else if (type === "TEMPLATE_SELECTED") {
      patch.templateId = EXPERIENCE?.id || "default-experience";
      patch.variantId = payload.native === true ? null : String(payload.variantId || activeBackgroundVariantId);
      patch.native = payload.native === true;
    } else if (type === "QUOTA_UPDATED") {
      const status = String(payload.status || "unavailable").toLowerCase();
      patch.quota = EXPERIENCE_RUNTIME_QUOTA_PHASES.has(status) ? status : "unavailable";
    } else if (type === "RESET_UPDATED") {
      const status = String(payload.status || "unknown").toLowerCase();
      patch.reset = EXPERIENCE_RUNTIME_RESET_PHASES.has(status) ? status : "unknown";
    } else if (type === "MODEL_UPDATED") {
      const status = String(payload.status || "loading").toLowerCase();
      patch.model = EXPERIENCE_RUNTIME_MODEL_PHASES.has(status) ? status : "loading";
      if (payload.selectionKey !== undefined) patch.modelSelectionKey = String(payload.selectionKey || "");
    } else if (type === "OVERLAY_CHANGED") {
      if (EXPERIENCE_RUNTIME_OVERLAYS.has(payload.overlay)) patch.overlay = payload.overlay;
    } else if (type === "NETWORK_CHANGED") {
      const network = String(payload.network || "unknown").toLowerCase();
      patch.network = EXPERIENCE_RUNTIME_NETWORK_PHASES.has(network) ? network : "unknown";
    }
    return publishExperienceState(patch, Object.freeze({ type, payload: { ...payload } }));
  };

  const syncExperienceResetState = (candidate = null) => {
    dispatchExperienceEvent("RESET_UPDATED", {
      status: experienceResetPhase(candidate),
    });
  };

  const experienceStore = Object.freeze({
    getState: () => experienceRuntimeState,
    getViewModel: () => experienceViewModel(),
    dispatch: (type, payload) => dispatchExperienceEvent(type, payload),
    subscribe: (listener) => {
      if (typeof listener !== "function") return () => {};
      experienceSubscribers.add(listener);
      return () => experienceSubscribers.delete(listener);
    },
  });

  const cssString = (value) => JSON.stringify(String(value ?? ""));

  const setStyleProperty = (root, name, value) => {
    if (root.style.getPropertyValue(name) !== value) {
      root.style.setProperty(name, value);
      metrics.styleWrites += 1;
    }
  };

  const setImportantStyleProperty = (root, name, value) => {
    if (!(root instanceof Element)) return;
    if (root.style.getPropertyValue(name) !== value ||
      root.style.getPropertyPriority(name) !== "important") {
      root.style.setProperty(name, value, "important");
      metrics.styleWrites += 1;
    }
  };

  /* Coalesce geometry-only viewport work into the next paint. Several native
     overlays can be open at once, so a single drag gesture must not trigger a
     synchronous read/write pass for every raw resize event. */
  const createFrameScheduler = (callback) => {
    let frame = null;
    let usesRaf = false;
    const schedule = () => {
      if (frame !== null) return;
      const run = () => {
        frame = null;
        usesRaf = false;
        callback();
      };
      if (typeof requestAnimationFrame === "function") {
        usesRaf = true;
        frame = requestAnimationFrame(run);
      } else {
        frame = setTimeout(run, 0);
      }
    };
    schedule.cancel = () => {
      if (frame === null) return;
      if (usesRaf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
      else clearTimeout(frame);
      frame = null;
      usesRaf = false;
    };
    return schedule;
  };

  /* One viewport coordinator owns the native resize/scroll listeners. Open
     overlays subscribe only while their geometry can affect the frame; the
     coordinator reads viewport state once and fans that snapshot out on the
     next paint. This prevents the quota, reset, background and composer
     surfaces from each scheduling their own resize pass. */
  const resizeCoordinator = (() => {
    const subscribers = new Set();
    let frame = null;
    let frameUsesRaf = false;
    let listening = false;
    let scrollListening = false;
    let pendingResize = false;
    let pendingScroll = false;
    const readViewport = () => ({
      width: Number(globalThis.innerWidth) || 0,
      height: Number(globalThis.innerHeight) || 0,
      scrollX: Number(globalThis.scrollX) || 0,
      scrollY: Number(globalThis.scrollY) || 0,
      dpr: Number(globalThis.devicePixelRatio) || 1,
    });
    const cancel = () => {
      if (frame === null) return;
      if (frameUsesRaf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
      else clearTimeout(frame);
      frame = null;
      frameUsesRaf = false;
      pendingResize = false;
      pendingScroll = false;
    };
    const flush = () => {
      frame = null;
      frameUsesRaf = false;
      if (window[DISABLED_KEY]) return;
      const viewport = readViewport();
      for (const subscriber of [...subscribers]) {
        if (!pendingResize && !subscriber.scroll) continue;
        try { subscriber.callback(viewport); } catch {}
      }
      pendingResize = false;
      pendingScroll = false;
    };
    const schedule = (reason) => {
      if (reason === "resize") pendingResize = true;
      else pendingScroll = true;
      if (frame !== null || window[DISABLED_KEY]) return;
      if (typeof requestAnimationFrame === "function") {
        frameUsesRaf = true;
        frame = requestAnimationFrame(flush);
      } else {
        frameUsesRaf = false;
        frame = setTimeout(flush, 0);
      }
    };
    const onResize = () => schedule("resize");
    const onScroll = () => schedule("scroll");
    const attach = () => {
      if (!listening && typeof window.addEventListener === "function") {
        window.addEventListener("resize", onResize, { passive: true });
        listening = true;
      }
      if (!scrollListening && [...subscribers].some((entry) => entry.scroll) &&
        typeof window.addEventListener === "function") {
        window.addEventListener("scroll", onScroll, { passive: true, capture: true });
        scrollListening = true;
      }
    };
    const detach = () => {
      if (scrollListening && ![...subscribers].some((entry) => entry.scroll) &&
        typeof window.removeEventListener === "function") {
        window.removeEventListener("scroll", onScroll, true);
        scrollListening = false;
      }
      if (listening && subscribers.size === 0 && typeof window.removeEventListener === "function") {
        window.removeEventListener("resize", onResize);
        listening = false;
      }
      if (subscribers.size === 0) cancel();
    };
    const subscribe = (callback, { scroll = false } = {}) => {
      if (typeof callback !== "function") return () => {};
      const entry = { callback, scroll: Boolean(scroll) };
      subscribers.add(entry);
      attach();
      const unsubscribe = () => {
        subscribers.delete(entry);
        detach();
      };
      unsubscribe.setScroll = (enabled) => {
        if (!subscribers.has(entry)) return;
        entry.scroll = Boolean(enabled);
        if (entry.scroll) attach();
        else detach();
      };
      return unsubscribe;
    };
    const dispose = () => {
      subscribers.clear();
      detach();
      cancel();
    };
    return Object.freeze({ subscribe, dispose, snapshot: readViewport });
  })();

  const ensureHeaderHitTestTarget = (node) => {
    if (!(node instanceof Element)) return;
    /* The native task header is a draggable surface with pointer-events:none.
       Keep the injected slot roots explicitly interactive even while the
       renderer is changing window size or briefly rebuilding theme attrs. */
    setImportantStyleProperty(node, "pointer-events", "auto");
    setImportantStyleProperty(node, "-webkit-app-region", "no-drag");
  };

  const clearNativeHeaderTracks = (host) => {
    if (!(host instanceof Element)) return;
    for (const child of host.children) {
      const isTitle = child.getAttribute(EXPERIENCE_HEADER_TRACK_ATTR) === "title";
      child.removeAttribute(EXPERIENCE_HEADER_TRACK_ATTR);
      if (isTitle) child.removeAttribute("data-dream-header-title-layout");
    }
    host.removeAttribute(EXPERIENCE_HEADER_LAYOUT_ATTR);
    if (experienceHeaderTrackState.host === host) {
      experienceHeaderTrackState.host = null;
      experienceHeaderTrackState.signature = "";
      experienceHeaderTrackState.valid = false;
    }
  };

  /* The native header can expose an extra empty wrapper between its title and
     action cells. Classify only wrappers that are unambiguous; if an unknown
     wrapper contains text or controls, keep the native layout untouched. */
  const markNativeHeaderTracks = (host, group = null) => {
    if (!(host instanceof Element)) return false;
    const children = [...host.children].filter((child) => child !== group);
    const nativeButtons = (child) => [...child.querySelectorAll("button, [role=button]")]
      .map((button) => String(button.getAttribute("aria-label") || "").trim())
      .filter(Boolean);
    const signature = children.map((child) => [
      child.tagName,
      child.getAttribute("data-testid") || "",
      child.querySelector("[data-testid]")?.getAttribute("data-testid") || "",
      nativeButtons(child).join("\u001f"),
    ].join("\u001e")).join("\u001d");
    if (experienceHeaderTrackState.host === host &&
      experienceHeaderTrackState.signature === signature) {
      return experienceHeaderTrackState.valid;
    }
    if (experienceHeaderTrackState.host && experienceHeaderTrackState.host !== host) {
      clearNativeHeaderTracks(experienceHeaderTrackState.host);
    }
    for (const child of children) child.removeAttribute(EXPERIENCE_HEADER_TRACK_ATTR);
    const titleTrack = children.find((child) =>
      child.matches('[data-testid="app-shell-header-context-menu-surface"]') ||
      child.querySelector('[data-testid="app-shell-header-context-menu-surface"]') ||
      nativeButtons(child).some((label) => /^(聊天操作|chat actions?)$/i.test(label)),
    ) || null;
    const actionPattern = /^(打开位置|次要操作|切换摘要|切换底部面板显示|显示\/隐藏侧边栏|更多|搜索|open location|secondary action|toggle summary|toggle bottom panel|show\/?hide sidebar|more|search)$/i;
    const actionTracks = children.filter((child) => child !== titleTrack &&
      nativeButtons(child).some((label) => actionPattern.test(label)));
    const actionTrack = actionTracks.at(-1) ||
      (titleTrack && children.length > 1 ? children.filter((child) => child !== titleTrack).at(-1) : null);
    const auxiliary = children.filter((child) => child !== titleTrack && child !== actionTrack);
    const isHiddenWrapper = (child) => child.classList.contains("invisible") ||
      child.getAttribute("aria-hidden") === "true";
    const isKnownActionWrapper = (child) => {
      const labels = nativeButtons(child);
      return labels.length > 0 && labels.every((label) => actionPattern.test(label));
    };
    const unsafeAuxiliary = auxiliary.some((child) => {
      /* React can briefly remove the native `invisible` class while it
         remounts the header. Known duplicate action wrappers are still safe:
         the final action track owns their visible copy, and CSS hides these
         measurement/duplicate wrappers so they cannot paint at the title's
         top edge during that frame. */
      if (isHiddenWrapper(child) || isKnownActionWrapper(child)) return false;
      return nativeButtons(child).length > 0 || String(child.textContent || "").trim().length > 0;
    });
    const valid = Boolean(titleTrack && actionTrack && titleTrack !== actionTrack && !unsafeAuxiliary);
    if (valid) {
      titleTrack.setAttribute(EXPERIENCE_HEADER_TRACK_ATTR, "title");
      /* Only flatten the exact native shape whose second child is the action
         cell. If a future native header adds another title/editor control,
         keep the original flex container intact instead of letting an
         unclassified child become a second CSS-grid row. */
      titleTrack.setAttribute(
        "data-dream-header-title-layout",
        titleTrack.children.length === 2 ? "flat" : "native",
      );
      actionTrack.setAttribute(EXPERIENCE_HEADER_TRACK_ATTR, "actions");
      auxiliary.forEach((child) => child.setAttribute(EXPERIENCE_HEADER_TRACK_ATTR, "auxiliary"));
      host.setAttribute(EXPERIENCE_HEADER_LAYOUT_ATTR, "three-track");
    } else {
      titleTrack?.removeAttribute("data-dream-header-title-layout");
      host.setAttribute(EXPERIENCE_HEADER_LAYOUT_ATTR, "native");
    }
    experienceHeaderTrackState.host = host;
    experienceHeaderTrackState.signature = signature;
    experienceHeaderTrackState.valid = valid;
    return valid;
  };

  let headerSpaceObserver = null;
  let headerSpaceComposer = null;
  let headerSpaceHost = null;
  const syncHeaderAvailableSpace = (host) => {
    const composer = document.querySelector('.composer-surface-chrome');
    if (headerSpaceHost !== host || headerSpaceComposer !== composer) {
      headerSpaceObserver?.disconnect();
      if (headerSpaceHost !== host) headerSpaceHost?.removeAttribute('data-dream-header-cramped');
      headerSpaceHost = host;
      headerSpaceComposer = composer;
      const update = () => {
        // Preserve the last layout while React replaces the composer. Falling
        // back to the full header width briefly expands the injected controls.
        const width = composer?.getBoundingClientRect().width;
        if (!width || width < 1) return;
        const value = width < 620 ? 'true' : 'false';
        if (host.getAttribute('data-dream-header-cramped') !== value) {
          host.setAttribute('data-dream-header-cramped', value);
        }
      };
      headerSpaceObserver = new ResizeObserver(update);
      headerSpaceObserver.observe(composer || host);
      update();
    }
  };

  const ensureHeaderInteractionHost = (node) => {
    if (!(node instanceof Element)) return;
    syncHeaderAvailableSpace(node);
    /* Chromium's renderer hit test can see a no-drag child while the native
       Windows title-bar hit test still discards the whole subtree when its
       draggable host has pointer-events:none. Keep the host event-visible;
       its app-region remains drag, while the slot children opt out below. */
    setImportantStyleProperty(node, "pointer-events", "auto");
    if (node.getAttribute("data-dream-experience-header-host") !== "true") {
      node.setAttribute("data-dream-experience-header-host", "true");
      metrics.attributeWrites += 1;
    }
  };

  /* Keep this cleanup for one hot-reload cycle so a payload from the previous
     bridge implementation cannot leave a stale transparent hit surface. */
  const removeExperienceHeaderHoverBridge = () => {
    const bridge = document.getElementById(EXPERIENCE_HEADER_HOVER_BRIDGE_ID);
    bridge?.__codexExperienceHeaderHoverCleanup?.();
    bridge?.remove?.();
  };

  const ownedRootAttributeWrites = new Map();
  const setAttribute = (root, name, value) => {
    const normalized = String(value);
    if (root.getAttribute(name) !== normalized) {
      if (root === document.documentElement) ownedRootAttributeWrites.set(name, normalized);
      root.setAttribute(name, normalized);
      metrics.attributeWrites += 1;
    }
  };

  const installDialogDismiss = (trigger, dialog, hide, shouldIgnoreFocusout = () => false) => {
    if (!(trigger instanceof Element) || !(dialog instanceof Element) || typeof hide !== "function") {
      return () => {};
    }
    const focusTrigger = () => {
      /* Restoring focus after Escape must not reopen the same dialog through
         the trigger's normal focus-to-open path. */
      trigger.__codexSuppressDialogFocusOpen = true;
      try { trigger.focus({ preventScroll: true }); } catch { trigger.focus(); }
      queueMicrotask(() => {
        delete trigger.__codexSuppressDialogFocusOpen;
      });
    };
    const onKeydown = (event) => {
      if (event.key !== "Escape" || dialog.hidden) return;
      event.preventDefault();
      event.stopPropagation();
      hide();
      focusTrigger();
    };
    const onFocusout = (event) => {
      const next = event.relatedTarget;
      if (next instanceof Element && (trigger.contains(next) || dialog.contains(next))) return;
      /* Codex clears focus to BODY after a pointer click on the draggable
         header. Give the click handler a short hand-off window; otherwise the
         native focus cleanup closes a popover that has just opened. */
      if (shouldIgnoreFocusout()) return;
      hide();
    };
    trigger.addEventListener("keydown", onKeydown);
    dialog.addEventListener("keydown", onKeydown);
    trigger.addEventListener("focusout", onFocusout);
    dialog.addEventListener("focusout", onFocusout);
    return () => {
      trigger.removeEventListener("keydown", onKeydown);
      dialog.removeEventListener("keydown", onKeydown);
      trigger.removeEventListener("focusout", onFocusout);
      dialog.removeEventListener("focusout", onFocusout);
      delete trigger.__codexSuppressDialogFocusOpen;
    };
  };

  const syncExperienceRootState = (root = document.documentElement) => {
    const skinMode = root?.getAttribute("data-dream-skin");
    if (!(root instanceof Element) || !["active", "home-native", "settings"].includes(skinMode)) {
      return;
    }
    const viewModel = experienceViewModel();
    const attributes = {
      "data-dream-work-state": viewModel.work,
      "data-dream-experience-template": viewModel.template.id,
      "data-dream-experience-variant": viewModel.template.variantId || "default",
      "data-dream-experience-route": viewModel.route,
      "data-dream-experience-work": viewModel.work,
      "data-dream-experience-quota": viewModel.data.quota,
      "data-dream-experience-reset": viewModel.data.reset,
      "data-dream-experience-model": viewModel.data.model,
      "data-dream-experience-network": viewModel.data.network,
      "data-dream-experience-overlay": viewModel.overlay,
      "data-dream-experience-characters": viewModel.sidebar.enabled ? "true" : "false",
      "data-dream-experience-ring": viewModel.composer.enabled.ring ? "true" : "false",
      "data-dream-experience-probability": viewModel.composer.enabled.probability ? "true" : "false",
    };
    for (const [name, value] of Object.entries(attributes)) setAttribute(root, name, value);
  };

  let experienceRootStoreUnsubscribe = experienceStore.subscribe(() => {
    if (!window[DISABLED_KEY]) syncExperienceRootState();
  });

  const parseRgb = (value) => {
    if (!value || value === "transparent") return null;
    const hex = String(value).trim().match(/^#([0-9a-f]{6})$/i);
    if (hex) {
      const number = Number.parseInt(hex[1], 16);
      return { r: number >> 16, g: (number >> 8) & 255, b: number & 255 };
    }
    const m = String(value).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    if (!m) return null;
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const rgbString = (value) => {
    const rgb = parseRgb(value);
    return rgb ? `${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)}` : null;
  };

  const rgbToHex = ({ r, g, b }) => `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;

  const rgbToHsl = ({ r, g, b }) => {
    const values = [r, g, b].map((value) => value / 255);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const lightness = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: lightness };
    const delta = max - min;
    const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let hue;
    if (max === values[0]) hue = (values[1] - values[2]) / delta + (values[1] < values[2] ? 6 : 0);
    else if (max === values[1]) hue = (values[2] - values[0]) / delta + 2;
    else hue = (values[0] - values[1]) / delta + 4;
    return { h: hue * 60, s: saturation, l: lightness };
  };

  const hslToRgb = ({ h, s, l }) => {
    const hue = ((h % 360) + 360) % 360 / 360;
    if (s === 0) {
      const neutral = Math.round(l * 255);
      return { r: neutral, g: neutral, b: neutral };
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const channel = (offset) => {
      let t = hue + offset;
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return { r: channel(1 / 3) * 255, g: channel(0) * 255, b: channel(-1 / 3) * 255 };
  };

  const detectShellAppearance = () => {
    const root = document.documentElement;
    if (root?.classList?.contains("electron-dark")) return "dark";
    if (root?.classList?.contains("electron-light")) return "light";
    try { return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; } catch {}
    return "light";
  };

  const makeAdaptivePalette = (sample, shell) => {
    const source = sample || { r: 108, g: 126, b: 136 };
    const hsl = rgbToHsl(source);
    const hue = hsl.s < 0.12 ? 214 : hsl.h;
    const saturation = clamp(hsl.s, 0.38, 0.72);
    const accent = hslToRgb({ h: hue, s: saturation, l: shell === "light" ? 0.42 : 0.66 });
    const accentAlt = hslToRgb({ h: hue + 12, s: saturation * 0.82, l: shell === "light" ? 0.52 : 0.73 });
    const secondary = hslToRgb({ h: hue - 24, s: saturation * 0.64, l: shell === "light" ? 0.56 : 0.62 });
    const highlight = hslToRgb({ h: hue + 24, s: saturation * 0.76, l: shell === "light" ? 0.36 : 0.58 });
    const neutral = (lightness, chroma = 0.08) => rgbToHex(hslToRgb({ h: hue, s: chroma, l: lightness }));
    return shell === "light" ? {
      background: neutral(0.965, 0.07),
      panel: neutral(0.987, 0.035),
      panelAlt: neutral(0.945, 0.09),
      accent: rgbToHex(accent),
      accentAlt: rgbToHex(accentAlt),
      secondary: rgbToHex(secondary),
      highlight: rgbToHex(highlight),
      text: neutral(0.13, 0.10),
      muted: neutral(0.42, 0.08),
      line: `rgba(${Math.round(accent.r)}, ${Math.round(accent.g)}, ${Math.round(accent.b)}, .24)`,
    } : {
      background: neutral(0.055, 0.045),
      panel: neutral(0.085, 0.04),
      panelAlt: neutral(0.125, 0.05),
      accent: rgbToHex(accent),
      accentAlt: rgbToHex(accentAlt),
      secondary: rgbToHex(secondary),
      highlight: rgbToHex(highlight),
      text: neutral(0.93, 0.025),
      muted: neutral(0.69, 0.03),
      line: `rgba(${Math.round(accent.r)}, ${Math.round(accent.g)}, ${Math.round(accent.b)}, .28)`,
    };
  };

  const resolvedShell = () => {
    if (THEME.appearance === "light" || THEME.appearance === "dark") return THEME.appearance;
    // Image luminance may tune accents and scrims, but auto appearance follows
    // Codex/ChatGPT (or the OS fallback) so a bright wallpaper cannot flip a
    // native dark session back to a light shell after analysis.
    return detectShellAppearance();
  };

  const themeIdentity = (variant = null) => {
    const override = variant?.identity && typeof variant.identity === "object"
      ? variant.identity : {};
    const text = (key, fallback) => {
      const candidate = override[key];
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
      const base = THEME[key];
      return typeof base === "string" && base.trim() ? base.trim() : fallback;
    };
    const workMoods = Array.isArray(override.workMoods) && override.workMoods.length
      ? override.workMoods : THEME.workMoods;
    const workMoodRotationMs = override.workMoodRotationMs ?? THEME.workMoodRotationMs;
    return {
      name: text("name", "Codex Dream Skin"),
      tagline: text("tagline", "Make something wonderful."),
      quote: text("quote", "MAKE SOMETHING WONDERFUL"),
      brandSubtitle: text("brandSubtitle", "CODEX DREAM SKIN"),
      statusText: text("statusText", "Online"),
      projectPrefix: text("projectPrefix", "选择项目 · "),
      projectLabel: text("projectLabel", "◉  选择项目"),
      workMoods,
      workMoodRotationMs,
    };
  };

  const applyTheme = (root, shell, variant = null) => {
    const themeColors = THEME.colors && typeof THEME.colors === "object" ? THEME.colors : {};
    const variantColors = variant?.colors && typeof variant.colors === "object" ? variant.colors : {};
    const declaredColors = { ...themeColors, ...variantColors };
    const legacyPalette = THEME.palette && typeof THEME.palette === "object" ? THEME.palette : {};
    // Prefer the full `colors` contract while accepting the legacy
    // `palette.accent` field for older Windows themes.
    const colors = Object.keys(declaredColors).length ? declaredColors : legacyPalette;
    const hasExplicitKeyList = Array.isArray(THEME.explicitColorKeys);
    const explicit = new Set(hasExplicitKeyList ? THEME.explicitColorKeys : []);
    if (!hasExplicitKeyList && (THEME.colorMode === "explicit" || !Object.hasOwn(THEME, "colorMode"))) {
      for (const key of Object.keys(declaredColors)) explicit.add(key);
    }
    for (const key of Object.keys(variantColors)) explicit.add(key);
    if (typeof legacyPalette.accent === "string") explicit.add("accent");
    const adaptive = makeAdaptivePalette(artAnalysis?.accentRgb, shell);
    const legacyLight = (THEME.appearance === undefined || THEME.appearance === "auto") && shell === "light";
    const structural = new Set(["background", "panel", "panelAlt", "text", "muted"]);
    const pick = (name) => {
      const variantOverride = Object.hasOwn(variantColors, name);
      const allowExplicit = explicit.has(name) && (!(legacyLight && structural.has(name)) || variantOverride);
      return allowExplicit && typeof colors[name] === "string" ? colors[name] : adaptive[name];
    };
    const accent = pick("accent");
    const accentAlt = explicit.has("accentAlt") ? pick("accentAlt") : (explicit.has("accent") ? accent : adaptive.accentAlt);
    const variables = {
      "--ds-bg": pick("background"),
      "--ds-panel": pick("panel"),
      "--ds-panel-2": pick("panelAlt"),
      "--ds-green": accent,
      "--ds-lime": accentAlt,
      "--ds-cyan": pick("secondary"),
      "--ds-purple": pick("highlight"),
      "--ds-text": pick("text"),
      "--ds-muted": pick("muted"),
      "--ds-line": explicit.has("line") && typeof colors.line === "string" ? colors.line : adaptive.line,
    };

    for (const [name, value] of Object.entries(variables)) {
      if (typeof value === "string" && value) setStyleProperty(root, name, value);
    }
    const rgbVariables = {
      "--ds-bg-rgb": variables["--ds-bg"],
      "--ds-panel-rgb": variables["--ds-panel"],
      "--ds-panel-2-rgb": variables["--ds-panel-2"],
      "--ds-accent-rgb": variables["--ds-green"],
      "--ds-accent-alt-rgb": variables["--ds-lime"],
      "--ds-secondary-rgb": variables["--ds-cyan"],
      "--ds-highlight-rgb": variables["--ds-purple"],
      "--ds-text-rgb": variables["--ds-text"],
      "--ds-muted-rgb": variables["--ds-muted"],
      "--ds-line-rgb": variables["--ds-line"],
    };
    for (const [name, value] of Object.entries(rgbVariables)) {
      const rgb = rgbString(value);
      if (rgb) setStyleProperty(root, name, rgb);
    }
    const identity = themeIdentity(variant);
    setStyleProperty(root, "--dream-skin-name", cssString(identity.name));
    setStyleProperty(root, "--dream-skin-tagline", cssString(identity.tagline));
    setStyleProperty(root, "--dream-skin-quote", cssString(identity.quote));
    setStyleProperty(root, "--dream-skin-brand-subtitle", cssString(identity.brandSubtitle));
    setStyleProperty(root, "--dream-skin-status", cssString(identity.statusText));
    setStyleProperty(root, "--dream-skin-project-prefix", cssString(identity.projectPrefix));
    setStyleProperty(root, "--dream-skin-project-label", cssString(identity.projectLabel));
  };

  const applyArtMetadata = (root, variant = null) => {
    const variantArt = variant?.art && typeof variant.art === "object" ? variant.art : {};
    const profile = variant?.artMetadata || artAnalysis || ART_METADATA;
    const inferredSafe = profile?.safeArea || "center";
    const safeArea = variantArt.safeArea && variantArt.safeArea !== "auto"
      ? variantArt.safeArea : (ART.safeArea && ART.safeArea !== "auto" ? ART.safeArea : inferredSafe);
    const canonicalSafe = ["left", "right", "center", "none"].includes(safeArea)
      ? safeArea : "center";
    const focusX = typeof variantArt.focusX === "number" ? variantArt.focusX
      : typeof ART.focusX === "number" ? ART.focusX
      : profile?.focusX ?? (safeArea === "left" ? 0.72 : safeArea === "right" ? 0.28 : 0.5);
    const focusY = typeof variantArt.focusY === "number" ? variantArt.focusY
      : typeof ART.focusY === "number" ? ART.focusY : profile?.focusY ?? 0.5;
    const taskMode = variantArt.taskMode && variantArt.taskMode !== "auto"
      ? variantArt.taskMode : (ART.taskMode && ART.taskMode !== "auto"
        ? ART.taskMode : profile?.taskMode || "ambient");
    const wide = profile?.wide || false;
    const aspect = profile?.aspect || "unknown";
    const focusXValue = `${(clamp(focusX, 0, 1) * 100).toFixed(2)}%`;
    const focusYValue = `${(clamp(focusY, 0, 1) * 100).toFixed(2)}%`;

    setAttribute(root, "data-dream-art-wide", wide ? "true" : "false");
    setAttribute(root, "data-dream-art-safe", canonicalSafe);
    setAttribute(root, "data-dream-task-mode", taskMode);
    setAttribute(root, "data-dream-art-safe-area", safeArea);
    setAttribute(root, "data-dream-art-task-mode", taskMode);
    setAttribute(root, "data-dream-art-aspect", aspect);
    setAttribute(root, "data-dream-art-ready", artAnalysis ? "true" : "false");
    setStyleProperty(root, "--dream-art-focus-x", focusXValue);
    setStyleProperty(root, "--dream-art-focus-y", focusYValue);
    setStyleProperty(root, "--dream-art-position", `${focusXValue} ${focusYValue}`);
    setStyleProperty(root, "--dream-skin-focus-x", focusXValue);
    setStyleProperty(root, "--dream-skin-focus-y", focusYValue);
    setStyleProperty(root, "--dream-skin-art-position", `${focusXValue} ${focusYValue}`);
  };

  const setTextContent = (node, value) => {
    if (!node) return;
    const normalized = String(value ?? "");
    if (node.textContent !== normalized) node.textContent = normalized;
  };

  const rememberHeaderUiNode = (node) => {
    if (node?.id && PERSISTENT_HEADER_UI_IDS.has(node.id)) {
      persistentHeaderUiNodes.set(node.id, node);
    }
    return node;
  };

  const findHeaderUiNode = (id) => {
    const connected = document.getElementById(id);
    if (connected) return rememberHeaderUiNode(connected);
    const cached = persistentHeaderUiNodes.get(id);
    return cached instanceof Element ? cached : null;
  };

  const activeBackgroundVariant = () => backgroundVariants.find(
    (variant) => variant.id === activeBackgroundVariantId,
  ) || null;

  const nativeThemeOption = () => ({ id: NATIVE_THEME_ID, label: "原生主题", native: true });
  const themeOptions = () => [...backgroundVariants, nativeThemeOption()];
  const activeThemeOption = () => nativeThemeSelected
    ? nativeThemeOption() : activeBackgroundVariant();

  const applyActiveBackgroundVariant = (root, shell = resolvedShell()) => {
    const variant = activeBackgroundVariant();
    const previousVariantId = root?.getAttribute?.("data-dream-background-variant") || "";
    const previousArtValue = root?.style?.getPropertyValue?.("--dream-skin-art")?.trim?.() || "";
    const selectedArtUrl = variant
      ? (variant.sharedAsset === "art"
        ? artUrl : variant.url || (variant.dataUrl ? materializeLazyDataUrl(variant, variant.dataUrl) : null))
      : artUrl;
    /* A non-default variant can be demand-loaded. Do not paint the base theme
       while that request is pending, and keep an already-ready image stable
       when a project route re-applies the same variant. This avoids a brief
       garden/Doraemon frame while Sakura's route shell is being replaced. */
    if (selectedArtUrl) {
      setStyleProperty(root, "--dream-skin-art", `url("${selectedArtUrl}")`);
    } else if (previousVariantId !== variant?.id || !previousArtValue) {
      setStyleProperty(root, "--dream-skin-art", "none");
    }
    setAttribute(root, "data-dream-background-variant", variant?.id || "default");
    // A saved theme can legitimately have no background-variant list. Keep
    // its own id on the root in that case so theme-specific CSS (for example
    // a theme-specific shell) still has a stable selector to match.
    setAttribute(root, "data-dream-theme-id", variant?.id || THEME.id || "default");
    applyTheme(root, shell, variant);
    applyArtMetadata(root, variant);
    if (variant) {
      /* Decode before the browser has to paint the CSS background. The URL is
         still applied synchronously when available, while lazy variants wait
         for their object URL and decode in this guarded continuation. */
      void preloadBackgroundVariant(variant).then((url) => {
        if (!url || window[DISABLED_KEY] || activeBackgroundVariantId !== variant.id) return;
        setStyleProperty(root, "--dream-skin-art", `url("${url}")`);
        applyTheme(root, shell, variant);
        applyArtMetadata(root, variant);
      }).catch(() => {});
    }
    return variant;
  };

  const setActiveBackgroundVariant = (variantId, { persist = true, animate = true } = {}) => {
    const next = backgroundVariants.find((variant) => variant.id === variantId);
    if (!next) return false;
    nativeThemeSelected = false;
    const changed = activeBackgroundVariantId !== next.id;
    activeBackgroundVariantId = next.id;
    if (persist) {
      try { localStorage.setItem(BACKGROUND_VARIANT_STORAGE_KEY, next.id); } catch {}
      try { localStorage.setItem(THEME_SELECTION_STORAGE_KEY, next.id); } catch {}
    }
    if (changed) resetOptionalAssetsForVariant(next.id);
    const root = document.documentElement;
    dispatchExperienceEvent("TEMPLATE_SELECTED", { variantId: next.id, native: false });
    if (changed && animate) {
      setAttribute(root, "data-dream-background-switching", "true");
      if (backgroundSwitchTimer) clearTimeout(backgroundSwitchTimer);
      backgroundSwitchTimer = setTimeout(() => {
        backgroundSwitchTimer = null;
        if (!window[DISABLED_KEY]) root.removeAttribute("data-dream-background-switching");
      }, 220);
    }
    if (["active", "home-native", "settings"].includes(root.getAttribute("data-dream-skin"))) {
      applyActiveBackgroundVariant(root, resolvedShell());
      void hydrateOptionalAssets().catch(() => {});
      refreshQuotaThemeViews();
      scheduleMoodRotation();
      ensureSidebarGreeting();
    } else if (root.getAttribute("data-dream-skin") === "native") {
      window[STATE_KEY]?.ensure?.({ root: true, scope: true });
    }
    return changed;
  };

  const setActiveThemeOption = (themeId, { persist = true, animate = true } = {}) => {
    const next = themeOptions().find((option) => option.id === themeId);
    if (!next) return false;
    const previousId = activeThemeOption()?.id || "";
    nativeThemeSelected = next.native === true;
    if (!nativeThemeSelected) activeBackgroundVariantId = next.id;
    if (persist) {
      try { localStorage.setItem(THEME_SELECTION_STORAGE_KEY, next.id); } catch {}
      if (!nativeThemeSelected) {
        try { localStorage.setItem(BACKGROUND_VARIANT_STORAGE_KEY, next.id); } catch {}
      }
    }
    const changed = previousId !== next.id;
    if (changed && !nativeThemeSelected) resetOptionalAssetsForVariant(next.id);
    const root = document.documentElement;
    dispatchExperienceEvent("TEMPLATE_SELECTED", {
      variantId: nativeThemeSelected ? null : next.id,
      native: nativeThemeSelected,
    });
    if (changed && animate) {
      setAttribute(root, "data-dream-background-switching", "true");
      if (backgroundSwitchTimer) clearTimeout(backgroundSwitchTimer);
      backgroundSwitchTimer = setTimeout(() => {
        backgroundSwitchTimer = null;
        if (!window[DISABLED_KEY]) root.removeAttribute("data-dream-background-switching");
      }, 220);
    }
    const runtime = window[STATE_KEY];
    if (runtime?.ensure) runtime.ensure({ root: true, scope: true });
    /* A menu selection can happen while Codex is between route surfaces. The
       normal root pass intentionally waits for a ready renderer in that gap,
       but the selected theme itself is already known and safe to paint. Apply
       the variant immediately so the picker never reports one theme while the
       wallpaper still shows another; the regular ensure pass will finish any
       route-specific shell work afterwards. */
    if (!nativeThemeSelected && ["active", "home-native", "settings"].includes(
      root.getAttribute("data-dream-skin"),
    )) {
      applyActiveBackgroundVariant(root, resolvedShell());
    }
    refreshQuotaThemeViews();
    clearVisibilityResumeWork();
    if (!nativeThemeSelected) {
      void hydrateOptionalAssets().catch(() => {});
      if (isRendererVisible()) {
        scheduleVisibleOptionalRefreshes({ requireSurface: false });
        startExperienceScheduler({ reset: true });
      }
      scheduleMoodRotation();
      ensureSidebarGreeting();
    }
    return changed;
  };

  const analyzeArt = () => new Promise((resolve) => {
    const startedAt = now();
    metrics.analysisRuns += 1;
    if (typeof window.Image !== "function" || !document?.createElement) {
      metrics.analysisMs = Number((now() - startedAt).toFixed(3));
      resolve(null);
      return;
    }
    const image = new window.Image();
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      if (analysisTimer) clearTimeout(analysisTimer);
      analysisTimer = null;
      metrics.analysisMs = Number((now() - startedAt).toFixed(3));
      resolve(value);
    };
    analysisTimer = setTimeout(() => finish(null), 6000);
    image.onerror = () => finish(null);
    image.onload = () => {
      try {
        const ratio = image.naturalWidth / image.naturalHeight;
        if (!Number.isFinite(ratio) || ratio <= 0) throw new Error("Invalid image dimensions");
        const maxDimension = 96;
        const width = Math.max(16, Math.round(ratio >= 1 ? maxDimension : maxDimension * ratio));
        const height = Math.max(16, Math.round(ratio >= 1 ? maxDimension / ratio : maxDimension));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext?.("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas is unavailable");
        context.drawImage(image, 0, 0, width, height);
        const data = context.getImageData(0, 0, width, height).data;
        const samples = new Array(width * height);
        const bins = Array.from({ length: 24 }, () => ({ weight: 0, r: 0, g: 0, b: 0 }));
        let lightTotal = 0;
        let count = 0;

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const offset = (y * width + x) * 4;
            if (data[offset + 3] < 32) continue;
            const rgb = { r: data[offset], g: data[offset + 1], b: data[offset + 2] };
            const light = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
            const hsl = rgbToHsl(rgb);
            samples[y * width + x] = { light, saturation: hsl.s };
            lightTotal += light;
            count += 1;
            if (hsl.s >= 0.16 && hsl.l >= 0.16 && hsl.l <= 0.86) {
              const bin = bins[Math.min(23, Math.floor(hsl.h / 15))];
              const weight = hsl.s * (1 - Math.abs(hsl.l - 0.52) * 0.85);
              bin.weight += weight;
              bin.r += rgb.r * weight;
              bin.g += rgb.g * weight;
              bin.b += rgb.b * weight;
            }
          }
        }
        if (!count) throw new Error("Image has no visible pixels");
        const brightness = lightTotal / count;
        const information = (start, end) => {
          let total = 0;
          let totalSquared = 0;
          let edges = 0;
          let edgeCount = 0;
          let pixels = 0;
          for (let y = 0; y < height; y += 1) {
            for (let x = start; x < end; x += 1) {
              const sample = samples[y * width + x];
              if (!sample) continue;
              total += sample.light;
              totalSquared += sample.light * sample.light;
              pixels += 1;
              const previous = x > start ? samples[y * width + x - 1] : null;
              const above = y > 0 ? samples[(y - 1) * width + x] : null;
              if (previous) { edges += Math.abs(sample.light - previous.light); edgeCount += 1; }
              if (above) { edges += Math.abs(sample.light - above.light); edgeCount += 1; }
            }
          }
          const mean = pixels ? total / pixels : 0;
          const variance = pixels ? Math.max(0, totalSquared / pixels - mean * mean) : 1;
          return Math.sqrt(variance) * 0.58 + (edgeCount ? edges / edgeCount : 1) * 0.42;
        };
        const zoneWidth = Math.max(1, Math.floor(width * 0.38));
        const leftInformation = information(0, zoneWidth);
        const rightInformation = information(width - zoneWidth, width);
        let safeArea = "center";
        if (leftInformation < rightInformation * 0.86) safeArea = "left";
        else if (rightInformation < leftInformation * 0.86) safeArea = "right";

        let saliencyTotal = 0;
        let saliencyX = 0;
        let saliencyY = 0;
        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const sample = samples[y * width + x];
            if (!sample) continue;
            const previous = x > 0 ? samples[y * width + x - 1] : null;
            const above = y > 0 ? samples[(y - 1) * width + x] : null;
            const edge = (previous ? Math.abs(sample.light - previous.light) : 0) +
              (above ? Math.abs(sample.light - above.light) : 0);
            const weight = 0.01 + Math.abs(sample.light - brightness) * 0.48 +
              sample.saturation * 0.34 + edge * 0.28;
            saliencyTotal += weight;
            saliencyX += (x + 0.5) / width * weight;
            saliencyY += (y + 0.5) / height * weight;
          }
        }
        let focusX = saliencyTotal ? saliencyX / saliencyTotal : 0.5;
        let focusY = saliencyTotal ? saliencyY / saliencyTotal : 0.5;
        if (safeArea === "left") focusX = Math.max(0.64, focusX);
        if (safeArea === "right") focusX = Math.min(0.36, focusX);
        focusX = clamp(focusX, 0.12, 0.88);
        focusY = clamp(focusY, 0.18, 0.82);

        const accentBin = bins.reduce((best, candidate) => candidate.weight > best.weight ? candidate : best, bins[0]);
        const accentRgb = accentBin.weight > 0 ? {
          r: accentBin.r / accentBin.weight,
          g: accentBin.g / accentBin.weight,
          b: accentBin.b / accentBin.weight,
        } : null;
        const aspect = ratio >= 2.25 ? "ultrawide" : ratio >= 1.45 ? "wide"
          : ratio >= 1.08 ? "landscape" : ratio >= 0.9 ? "square" : "portrait";
        finish({
          width: image.naturalWidth,
          height: image.naturalHeight,
          ratio,
          wide: ratio >= 1.75,
          aspect,
          brightness,
          shell: brightness >= 0.58 ? "light" : "dark",
          safeArea,
          focusX,
          focusY,
          taskMode: ratio >= 2.25 ? "banner" : "ambient",
          accentRgb,
        });
      } catch {
        finish(null);
      }
    };
    image.src = artUrl;
  });

  const pruneRelationalCssRules = (container) => {
    const rules = container?.cssRules;
    if (!rules || typeof container.deleteRule !== "function") return;
    for (let index = rules.length - 1; index >= 0; index -= 1) {
      const rule = rules[index];
      if (typeof rule?.selectorText === "string" && rule.selectorText.includes(":has(")) {
        container.deleteRule(index);
        metrics.relationalRulesRemoved += 1;
        continue;
      }
      if (rule?.cssRules && typeof rule.deleteRule === "function") {
        pruneRelationalCssRules(rule);
      }
    }
  };

  const compactDuplicateCssDeclarations = (container) => {
    const rules = container?.cssRules;
    if (!rules || typeof container.deleteRule !== "function") return;

    for (const rule of Array.from(rules)) {
      if (rule?.cssRules && typeof rule.deleteRule === "function") {
        compactDuplicateCssDeclarations(rule);
      }
    }

    /* This stylesheet is intentionally additive so older installations can
       be hot-updated safely. Over time that produces repeated, identical
       selectors. Remove only declarations that are provably shadowed by a
       later rule with the exact same selector and at-rule context. */
    const selectorGroups = new Map();
    for (const rule of Array.from(rules)) {
      if (rule?.type !== CSSRule.STYLE_RULE || typeof rule.selectorText !== "string") continue;
      const group = selectorGroups.get(rule.selectorText) || [];
      group.push(rule);
      selectorGroups.set(rule.selectorText, group);
    }

    for (const group of selectorGroups.values()) {
      if (group.length < 2) continue;
      const laterPriorities = new Map();
      for (let index = group.length - 1; index >= 0; index -= 1) {
        const style = group[index].style;
        for (const property of Array.from(style)) {
          const priority = style.getPropertyPriority(property);
          const laterPriority = laterPriorities.get(property);
          const isShadowed = laterPriority === "important"
            || (laterPriority !== undefined && priority !== "important");
          if (isShadowed) {
            style.removeProperty(property);
            metrics.duplicateDeclarationsRemoved += 1;
          } else {
            laterPriorities.set(property, priority);
          }
        }
      }
    }

    for (let index = rules.length - 1; index >= 0; index -= 1) {
      const rule = rules[index];
      if (rule?.type === CSSRule.STYLE_RULE && rule.style.length === 0) {
        container.deleteRule(index);
        metrics.duplicateRulesRemoved += 1;
      }
    }
  };

  const CSS_COMPILED_MARKER = "/* dream-skin-css-compiled */";
  const cssNeedsRuntimeNormalization = !String(cssText).includes(CSS_COMPILED_MARKER);

  const installStyle = () => {
    try {
      if (!("adoptedStyleSheets" in document) || typeof CSSStyleSheet !== "function") {
        throw new Error("Constructable stylesheets are unavailable");
      }
      const sheet = new CSSStyleSheet();
      if (typeof sheet.replaceSync !== "function") throw new Error("replaceSync is unavailable");
      sheet.replaceSync(cssText);
      /* New payloads are normalized by the maintenance build step. Keep the
         runtime fallback for older hot-loaded payloads, but do not make every
         renderer startup parse and rewrite a known-good 500KB stylesheet. */
      if (cssNeedsRuntimeNormalization) {
        pruneRelationalCssRules(sheet);
        compactDuplicateCssDeclarations(sheet);
      }
      /* The registry is intentionally shared across hot-reapply generations,
         so it can contain a sheet that is no longer owned by this payload.
         Never retain a constructable sheet that carries the dream-skin
         markers; keeping it would make two full skins cascade during a route
         handoff and produce the native-looking flash. Non-skin application
         sheets are preserved unchanged. */
      const retained = [...document.adoptedStyleSheets]
        .filter((candidate) => !isDreamSkinStyleSheet(candidate));
      document.adoptedStyleSheets = [...retained, sheet];
      styleRegistry.clear();
      styleRegistry.add(sheet);
      document.getElementById(STYLE_ID)?.remove();
      styleSheet = sheet;
      styleMode = "adopted";
      return;
    } catch {
      styleSheet = null;
    }

    styleNode = document.getElementById(STYLE_ID) || document.createElement("style");
    styleNode.id = STYLE_ID;
    styleNode.textContent = cssText;
    if (!styleNode.parentElement) (document.head || document.documentElement).appendChild(styleNode);
    styleMode = "style";
  };

  const ensureStyle = () => {
    if (styleMode === "adopted" && styleSheet) {
      pruneOrphanedDreamStyleSheets(styleSheet);
      const current = [...document.adoptedStyleSheets];
      if (!current.includes(styleSheet)) {
        document.adoptedStyleSheets = [...current, styleSheet];
        metrics.styleRepairs += 1;
      }
      return;
    }
    if (styleNode && document.getElementById(STYLE_ID) !== styleNode) {
      document.getElementById(STYLE_ID)?.remove();
      (document.head || document.documentElement).appendChild(styleNode);
      metrics.styleRepairs += 1;
    }
  };

  installStyle();

  /* The current home build no longer mounts its former suggestion cards.
     Reuse the native composer for a small project-aware launcher instead of
     maintaining a second task form. */
  const HOME_UI_ATTR = "data-dream-ui";
  const HOME_UI_VALUE = "home-suggestions";
  const removeHomeReplica = () => {
    for (const node of document.querySelectorAll(`[${HOME_UI_ATTR}="${HOME_UI_VALUE}"]`)) node.remove();
  };
  const fillHomeComposer = (prompt) => {
    const main = findMainSurface();
    const editor = main?.querySelector?.(
      '.composer-surface-chrome [contenteditable="true"], .composer-surface-chrome textarea, '
      + '[role="main"] [contenteditable="true"], [role="main"] textarea',
    );
    if (!editor) return false;
    editor.focus();
    if (editor instanceof HTMLTextAreaElement || editor instanceof HTMLInputElement) {
      const prototype = editor instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
      if (setter) setter.call(editor, prompt);
      else editor.value = prompt;
    } else {
      editor.textContent = prompt;
    }
    editor.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: prompt,
    }));
    editor.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  };
  const ensureHomeReplica = (home) => {
    const main = findMainSurface();
    const homeMain = home ? main?.querySelector?.('[role="main"]') : null;
    if (!homeMain?.isConnected) {
      removeHomeReplica();
      return;
    }
    let replica = homeMain.querySelector(`[${HOME_UI_ATTR}="${HOME_UI_VALUE}"]`);
    if (replica) {
      updateHomeModelRadar();
      return;
    }

    replica = document.createElement("div");
    replica.className = "dream-home-replica";
    replica.setAttribute(HOME_UI_ATTR, HOME_UI_VALUE);
    replica.setAttribute("aria-label", "新建任务快捷入口");

    const headingRow = document.createElement("div");
    headingRow.className = "dream-home-launcher-heading";
    const headingCopy = document.createElement("div");
    const eyebrow = document.createElement("span");
    eyebrow.className = "dream-home-launcher-eyebrow";
    eyebrow.textContent = "开始新任务";
    const heading = document.createElement("strong");
    heading.textContent = "选择一个起点，或直接在下方描述需求";
    headingCopy.append(eyebrow, heading);
    const radarBadge = document.createElement("span");
    radarBadge.className = "dream-home-radar-badge";
    radarBadge.setAttribute("data-dream-model-radar", "home");
    headingRow.append(headingCopy, radarBadge);
    replica.appendChild(headingRow);

    const cards = document.createElement("div");
    cards.className = "dream-home-launcher-cards";
    const entries = [
      {
        title: "继续当前工作",
        detail: "读取 Git 变更，接着完成实现与验证",
        prompt: "请查看当前 Git 状态和未完成的变更，继续完成实现，并运行必要的验证。",
      },
      {
        title: "快速理解项目",
        detail: "梳理入口、依赖、结构和运行方式",
        prompt: "请快速分析当前项目，说明目录结构、关键入口、依赖关系和本地运行方式。",
      },
      {
        title: "检查质量与风险",
        detail: "审查代码、测试覆盖和潜在回归",
        prompt: "请审查当前项目的代码质量、测试覆盖和潜在回归风险，并给出可执行的改进建议。",
      },
    ];
    const iconSources = [
      ...document.querySelectorAll("aside.app-shell-left-panel svg"),
      ...homeMain.querySelectorAll("svg"),
    ];
    entries.forEach((entry, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `dream-home-replica-card dream-home-replica-card-${index + 1}`;
      const icon = document.createElement("span");
      icon.className = "dream-home-replica-icon";
      const source = iconSources[index % Math.max(1, iconSources.length)];
      if (source) icon.appendChild(source.cloneNode(true));
      const title = document.createElement("strong");
      title.textContent = entry.title;
      const detail = document.createElement("span");
      detail.className = "dream-home-replica-detail";
      detail.textContent = entry.detail;
      const action = document.createElement("span");
      action.className = "dream-home-replica-action";
      action.textContent = "填入输入框";
      card.append(icon, title, detail, action);
      card.addEventListener("click", () => fillHomeComposer(entry.prompt));
      cards.appendChild(card);
    });
    replica.appendChild(cards);
    homeMain.appendChild(replica);
    updateHomeModelRadar();
  };

  /* Sidebar presentation is shared by task and home routes.  The native
     mode switcher, task button and account controls stay mounted and retain
     their original handlers; no extra interactive elements are introduced. */
  const SIDEBAR_UI_VALUE = "sidebar-greeting";
  const removeLegacySidebarUi = () => {
    let removed = 0;
    for (const node of document.querySelectorAll(
      `[${HOME_UI_ATTR}="${SIDEBAR_UI_VALUE}"], .dream-sidebar-greeting`,
    )) {
      node.remove();
      removed += 1;
    }
    metrics.sidebarLegacyNodesRemoved += removed;
  };
  const invalidateSidebarGreetingSize = () => {
    sidebarGreetingSizeCache = null;
  };
  const disconnectSidebarGreetingResizeObserver = () => {
    sidebarGreetingResizeObserver?.disconnect?.();
    sidebarGreetingResizeObserver = null;
    sidebarGreetingResizeTarget = null;
  };
  const ensureSidebarGreetingResizeObserver = (button) => {
    if (!(button instanceof Element) || typeof ResizeObserver !== "function") {
      disconnectSidebarGreetingResizeObserver();
      return;
    }
    if (sidebarGreetingResizeObserver && sidebarGreetingResizeTarget === button) return;
    disconnectSidebarGreetingResizeObserver();
    sidebarGreetingResizeObserver = new ResizeObserver((entries) => {
      /* The sidebar can change width without a window resize when its native
         rail collapses. Invalidate the measurement without reading layout;
         the next normal greeting repair will measure the new width. */
      const width = Number(entries?.[0]?.contentRect?.width);
      if (sidebarGreetingSizeCache?.button === button &&
        Number.isFinite(width) && Math.abs(width - sidebarGreetingSizeCache.buttonWidth) < 0.5) {
        return;
      }
      invalidateSidebarGreetingSize();
    });
    sidebarGreetingResizeObserver.observe(button);
    sidebarGreetingResizeTarget = button;
  };
  const removeSidebarGreeting = () => {
    invalidateSidebarGreetingSize();
    removeLegacySidebarUi();
    for (const button of document.querySelectorAll(`[${SIDEBAR_GREETING_ATTR}]`)) {
      button.removeAttribute(SIDEBAR_GREETING_ATTR);
      button.style?.removeProperty("--dream-greeting-font-size");
    }
  };
  const removeExperienceSidebarSlots = () => {
    for (const node of document.querySelectorAll('[data-dream-experience-slot="sidebar"]')) {
      node.removeAttribute("data-dream-experience-slot");
      node.removeAttribute("data-dream-experience-role");
      node.removeAttribute("data-dream-experience-pose");
    }
  };
  const syncExperienceSidebarSlots = () => {
    const sidebar = experienceStore.getViewModel().sidebar;
    const companion = document.querySelector(SIDEBAR_COMPANION_SURFACE_SELECTOR);
    const account = findSidebarAccountButton();
    const targets = [
      [companion, sidebar.companionRole],
      [account, sidebar.accountRole],
    ];
    if (!sidebar.enabled) {
      removeExperienceSidebarSlots();
      return;
    }
    for (const current of document.querySelectorAll('[data-dream-experience-slot="sidebar"]')) {
      if (!targets.some(([node]) => node === current)) {
        current.removeAttribute("data-dream-experience-slot");
        current.removeAttribute("data-dream-experience-role");
        current.removeAttribute("data-dream-experience-pose");
      }
    }
    for (const [node, role] of targets) {
      if (!(node instanceof Element)) continue;
      setAttribute(node, "data-dream-experience-slot", "sidebar");
      setAttribute(node, "data-dream-experience-role", role);
      setAttribute(node, "data-dream-experience-pose", sidebar.pose);
    }
  };
  let experienceSidebarStoreUnsubscribe = experienceStore.subscribe((viewModel, event) => {
    if (window[DISABLED_KEY] || !["WORK_STATE_CHANGED", "SCOPE_CHANGED", "TEMPLATE_SELECTED"].includes(event?.type)) return;
    if (!viewModel.sidebar.enabled) removeExperienceSidebarSlots();
    else syncExperienceSidebarSlots();
  });
  const DEFAULT_WORK_MOODS = Object.freeze([
    "先完成，再完美。",
    "把复杂的事拆小一点。",
    "专注十分钟，也算前进。",
    "现在适合安静地推进。",
    "把手头这一件做好。",
    "慢一点，思路会自己排好队。",
    "今天的灵感正在加载。",
    "清空一个小任务，再继续。",
    "留一点耐心给自己。",
    "这一步完成，下一步就会变轻。",
    "今天也会有一点点进展。",
    "给想法一点时间，它会长出来。",
  ]);
  const workMoodProfile = () => {
    const identity = themeIdentity(activeBackgroundVariant());
    const configured = Array.isArray(identity.workMoods)
      ? identity.workMoods.filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.trim()) : [];
    const moods = configured.length ? configured : [...DEFAULT_WORK_MOODS];
    const rotationMs = Number.isFinite(Number(identity.workMoodRotationMs))
      ? Math.max(15000, Math.min(120000, Number(identity.workMoodRotationMs))) : 30000;
    return { moods, rotationMs };
  };
  const currentWorkMood = () => {
    const { moods, rotationMs } = workMoodProfile();
    return moods[Math.floor(Date.now() / rotationMs) % moods.length];
  };
  const sidebarGreeting = () => {
    const working = document.documentElement.getAttribute("data-dream-work-state") === "working";
    if (working) return currentWorkMood();
    const hour = new Date().getHours();
    if (hour < 5) return "夜深了";
    if (hour < 11) return "早上好";
    if (hour < 14) return "中午好";
    if (hour < 18) return "下午好";
    if (hour < 23) return "晚上好";
    return "夜深了";
  };
  const syncSidebarGreetingSize = (button, greeting) => {
    if (!button || typeof button.getBoundingClientRect !== "function") return;
    const baseFontSize = 11.5;
    const cached = sidebarGreetingSizeCache;
    if (cached?.button === button && cached.greeting === greeting) {
      if (button.style.getPropertyValue("--dream-greeting-font-size") !== cached.value) {
        button.style.setProperty("--dream-greeting-font-size", cached.value);
      }
      return;
    }
    const pseudo = getComputedStyle(button, "::after");
    if (!sidebarGreetingMeasureContext) {
      sidebarGreetingMeasureCanvas ||= document.createElement("canvas");
      sidebarGreetingMeasureContext = sidebarGreetingMeasureCanvas.getContext("2d");
    }
    const context = sidebarGreetingMeasureContext;
    if (!context) return;
    context.font = `${pseudo.fontWeight} ${baseFontSize}px ${pseudo.fontFamily}`;
    const textWidth = context.measureText(greeting).width;
    /* The final CSS gives the mood lane the account cell width minus its
       left avatar lane and right breathing room. Recompute only when the
       mood changes or the window settles; this is not a layout observer. */
    const buttonWidth = button.getBoundingClientRect().width;
    const availableWidth = Math.max(96, buttonWidth - 70);
    const fontSize = textWidth > availableWidth
      ? Math.max(8.5, baseFontSize * availableWidth / textWidth)
      : baseFontSize;
    const value = `${fontSize.toFixed(2)}px`;
    sidebarGreetingSizeCache = { button, greeting, value, buttonWidth };
    if (button.style.getPropertyValue("--dream-greeting-font-size") !== value) {
      button.style.setProperty("--dream-greeting-font-size", value);
    }
  };
  const ensureSidebarGreeting = () => {
    removeLegacySidebarUi();
    const button = findSidebarAccountButton();
    for (const current of document.querySelectorAll(`[${SIDEBAR_GREETING_ATTR}]`)) {
      if (current !== button) current.removeAttribute(SIDEBAR_GREETING_ATTR);
    }
    if (button) {
      ensureSidebarGreetingResizeObserver(button);
      const greeting = sidebarGreeting();
      if (button.getAttribute(SIDEBAR_GREETING_ATTR) !== greeting) {
        button.setAttribute(SIDEBAR_GREETING_ATTR, greeting);
      }
      syncSidebarGreetingSize(button, greeting);
    }
  };

  const scheduleMoodRotation = () => {
    if (moodRotationTimer) clearInterval(moodRotationTimer);
    const { rotationMs } = workMoodProfile();
    moodRotationTimer = setInterval(() => {
      if (window[DISABLED_KEY] || document.visibilityState !== "visible") return;
      if (document.documentElement.getAttribute("data-dream-work-state") === "working") {
        ensureSidebarGreeting();
      }
    }, rotationMs);
  };

  const ensureNativeSidebarToggle = () => {
    const buttons = new Set(document.querySelectorAll(NATIVE_SIDEBAR_TOGGLE_SELECTOR));
    for (const current of document.querySelectorAll(`[${SIDEBAR_TOGGLE_ATTR}]`)) {
      if (!buttons.has(current)) current.removeAttribute(SIDEBAR_TOGGLE_ATTR);
    }
    for (const button of buttons) {
      if (button.getAttribute(SIDEBAR_TOGGLE_ATTR) !== "true") {
        button.setAttribute(SIDEBAR_TOGGLE_ATTR, "true");
      }
    }
  };

  const syncSidebarOverlayState = () => {
    const floating = Boolean(
      document.querySelector('aside[data-testid="app-shell-floating-left-panel"]'),
    );
    /* Codex owns expanded/collapsed width and header geometry. The skin only
       tracks whether the temporary floating rail overlaps the composer art. */
    document.documentElement?.removeAttribute(SIDEBAR_FLOATING_ATTR);
    for (const composer of document.querySelectorAll(COMPOSER_CHARACTER_SELECTOR)) {
      setAttribute(composer, SIDEBAR_FLOATING_ATTR, floating ? "true" : "false");
    }
  };

  const findSidebarProjectPortals = () => {
    const portals = new Set();
    for (const row of document.querySelectorAll(SIDEBAR_PROJECT_ROW_SELECTOR)) {
      const portal = row.closest('[role="tooltip"], [data-radix-popper-content-wrapper]');
      if (portal) portals.add(portal);
    }
    return portals;
  };

  /* Project details use a direct body portal rather than the Radix Popper
     wrapper used by the other menus. These nodes belong to Codex's React tree,
     so the skin may temporarily hide/re-anchor them but must never remove
     them. React owns their lifetime and removing one here races React's own
     reconciliation, which can surface as `removeChild`/"糟糕，出错了". */
  const sidebarProjectPortalStyleProperties = [
    "display",
    "visibility",
    "pointer-events",
    "position",
    "left",
    "top",
    "transform",
    "transition",
  ];
  const sidebarProjectPortalStyleSnapshots = new WeakMap();

  const rememberSidebarProjectPortalStyles = (portal) => {
    if (sidebarProjectPortalStyleSnapshots.has(portal)) return;
    const snapshot = {};
    for (const property of sidebarProjectPortalStyleProperties) {
      snapshot[property] = {
        value: portal.style.getPropertyValue(property),
        priority: portal.style.getPropertyPriority(property),
      };
    }
    sidebarProjectPortalStyleSnapshots.set(portal, snapshot);
  };

  const discardSidebarProjectPortals = () => {
    for (const portal of document.querySelectorAll(`[${SIDEBAR_PROJECT_PORTAL_ATTR}]`)) {
      const snapshot = sidebarProjectPortalStyleSnapshots.get(portal);
      if (snapshot) {
        for (const property of sidebarProjectPortalStyleProperties) {
          const previous = snapshot[property];
          if (previous.value) {
            portal.style.setProperty(property, previous.value, previous.priority);
          } else {
            portal.style.removeProperty(property);
          }
        }
        sidebarProjectPortalStyleSnapshots.delete(portal);
      }
      portal.removeAttribute(SIDEBAR_PROJECT_PORTAL_ATTR);
      portal.removeAttribute(SIDEBAR_PROJECT_POSITIONED_ATTR);
    }
  };

  const isSidebarProjectTrigger = (node) => node instanceof Element &&
    node.classList.contains("group/folder-row") &&
    node.matches(SIDEBAR_PROJECT_TRIGGER_SELECTOR);

  const hoveredSidebarProjectTrigger = () => {
    const current = sidebarProjectHoverTarget;
    if (isSidebarProjectTrigger(current) && current.isConnected && current.matches(":hover")) {
      return current;
    }
    for (const trigger of document.querySelectorAll(SIDEBAR_PROJECT_TRIGGER_SELECTOR)) {
      if (isSidebarProjectTrigger(trigger) && trigger.matches(":hover")) return trigger;
    }
    return isSidebarProjectTrigger(current) && current.isConnected ? current : null;
  };

  const repairSidebarProjectPortals = () => {
    sidebarProjectPortalRepairTimer = null;
    if (window[DISABLED_KEY]) return;
    const portals = findSidebarProjectPortals();
    if (!portals.size) return;
    const trigger = hoveredSidebarProjectTrigger();
    if (!trigger) {
      discardSidebarProjectPortals();
      return;
    }
    const triggerRect = trigger.getBoundingClientRect();
    if (triggerRect.width <= 0 || triggerRect.height <= 0) return;
    for (const portal of portals) {
      if (portal.getAttribute(SIDEBAR_PROJECT_PORTAL_ATTR) === "true") continue;
      rememberSidebarProjectPortalStyles(portal);
      const portalRect = portal.getBoundingClientRect();
      const width = Math.max(1, portalRect.width || 320);
      const height = Math.max(1, portalRect.height || 130);
      const gap = 4;
      let left = triggerRect.right + gap;
      if (left + width > globalThis.innerWidth - 8) {
        left = Math.max(8, triggerRect.left - width - gap);
      }
      let top = triggerRect.top + 1;
      if (top + height > globalThis.innerHeight - 8) {
        top = Math.max(8, globalThis.innerHeight - height - 8);
      }
      portal.style.setProperty("position", "fixed", "important");
      portal.style.setProperty("left", `${Math.round(left)}px`, "important");
      portal.style.setProperty("top", `${Math.round(top)}px`, "important");
      portal.style.setProperty("transform", "none", "important");
      portal.style.setProperty("transition", "none", "important");
      portal.setAttribute(SIDEBAR_PROJECT_POSITIONED_ATTR, "true");
    }
  };

  const scheduleSidebarProjectPortalRepair = (delay = 24) => {
    if (sidebarProjectPortalRepairTimer) clearTimeout(sidebarProjectPortalRepairTimer);
    sidebarProjectPortalRepairTimer = setTimeout(repairSidebarProjectPortals, Math.max(0, delay));
  };

  const removeNativeSidebarToggle = () => {
    for (const button of document.querySelectorAll(`[${SIDEBAR_TOGGLE_ATTR}]`)) {
      button.removeAttribute(SIDEBAR_TOGGLE_ATTR);
    }
  };

  const clearLegacyCharacterFrame = (node) => {
    if (!(node instanceof Element)) return;
    if (node.hasAttribute("data-dream-character-frame")) {
      node.removeAttribute("data-dream-character-frame");
    }
    if (node.hasAttribute("data-dream-reply-frame")) {
      node.removeAttribute("data-dream-reply-frame");
    }
    if (node.style.getPropertyValue("--dream-character-frame-x")) {
      node.style.removeProperty("--dream-character-frame-x");
    }
    if (node.style.getPropertyValue("--dream-character-frame-y")) {
      node.style.removeProperty("--dream-character-frame-y");
    }
  };

  const applyCharacterStyle = (node, attribute, style, presentation, { animate = false } = {}) => {
    if (!(node instanceof Element)) return;
    if (!presentation) return;
    const normalized = String(style);
    const previous = node.getAttribute(attribute);
    const changed = previous !== normalized;
    clearLegacyCharacterFrame(node);
    if (node.classList.contains("dream-character-swapping")) {
      node.classList.remove("dream-character-swapping");
    }
    if (changed) node.setAttribute(attribute, normalized);
    setStyleProperty(node, "--dream-character-size", presentation.size);
    setStyleProperty(node, "--dream-character-position", presentation.position);
    if (!changed) return;
    if (!animate || previous === null) return;
    node.classList.remove("dream-character-swapping");
    requestAnimationFrame(() => {
      if (!node.isConnected || node.getAttribute(attribute) !== normalized) return;
      node.classList.add("dream-character-swapping");
      setTimeout(() => node.classList.remove("dream-character-swapping"), 230);
    });
  };

  /* Collapsing the native rail mounts the floating panel in a later React
     pass. The first sidebar scan can therefore run before its account button
     exists. Retry only this small footer hook so the portrait survives the
     native remount without waking the full route repair. */
  const scheduleSidebarAccountRepair = () => {
    if (sidebarAccountRepairTimer || typeof setTimeout !== "function") return;
    sidebarAccountRepairAttempts = 0;
    const retry = () => {
      sidebarAccountRepairTimer = null;
      if (window[DISABLED_KEY]) return;
      const repaired = ensureSidebarAccountCharacter({ retry: false });
      if (!repaired && sidebarAccountRepairAttempts < 3 &&
        document.querySelector(SIDEBAR_PANEL_SELECTOR)) {
        sidebarAccountRepairAttempts += 1;
        sidebarAccountRepairTimer = setTimeout(retry, 80);
      } else {
        sidebarAccountRepairAttempts = 0;
      }
    };
    /* The floating rail can expose its account button in the same commit that
       mounts the panel. Try synchronously first so the portrait does not wait
       for the old 48ms safety timer; keep the short retries for a split React
       commit where the footer lands one frame later. */
    retry();
  };

  const isAssistantReplySpeaker = (value) => /chatgpt|assistant|codex/i.test(String(value || ""));
  const currentChatReplyScope = () => {
    const main = document.querySelector(
      'main:is(.main-surface, [class*="_MainContentSurface_"])',
    ) || document.querySelector("main") || document.querySelector('[role="main"]');
    return main?.querySelector?.(".thread-scroll-container") || main || null;
  };
  const assistantReplyFromNode = (node) => {
    if (!(node instanceof Element)) return null;
    const legacyReply = node.closest(ASSISTANT_REPLY_SELECTOR);
    if (legacyReply) return legacyReply;
    const heading = node.matches("h4.sr-only") ? node : node.querySelector("h4.sr-only");
    if (heading && isAssistantReplySpeaker(heading.textContent)) {
      return heading.closest("[data-content-search-unit-key]");
    }
    const row = node.closest("[data-content-search-unit-key]");
    const speaker = row?.querySelector("h4.sr-only")?.textContent;
    return isAssistantReplySpeaker(speaker) ? row : null;
  };
  const assistantReplyNodes = (scope = null) => {
    const root = scope?.querySelectorAll ? scope : currentChatReplyScope();
    if (!root?.querySelectorAll) return [];
    const replies = new Set();
    const inScope = (reply) => root === document || root === reply || root.contains(reply);
    const addReply = (reply) => {
      if (reply instanceof Element && reply.isConnected && inScope(reply)) replies.add(reply);
    };
    if (root instanceof Element && root.matches(ASSISTANT_REPLY_SELECTOR)) addReply(root);
    for (const reply of root.querySelectorAll(ASSISTANT_REPLY_SELECTOR)) {
      const speaker = reply.querySelector("h4.sr-only")?.textContent?.trim() || "";
      if (!speaker || isAssistantReplySpeaker(speaker)) addReply(reply);
    }
    for (const heading of root.querySelectorAll("h4.sr-only")) {
      if (!isAssistantReplySpeaker(heading.textContent)) continue;
      const reply = heading.closest("[data-content-search-unit-key]");
      if (reply) addReply(reply);
    }
    return [...replies];
  };

  const experienceChatSlotNodes = new Set();
  const clearExperienceChatSlot = (node) => {
    if (!(node instanceof Element)) return;
    node.removeAttribute("data-dream-experience-slot");
    node.removeAttribute("data-dream-experience-role");
    node.removeAttribute("data-dream-experience-pose");
    experienceChatSlotNodes.delete(node);
  };
  const forgetExperienceChatSlotsFromSubtree = (root) => {
    if (!(root instanceof Element)) return;
    if (experienceChatSlotNodes.has(root)) clearExperienceChatSlot(root);
    for (const node of root.querySelectorAll('[data-dream-experience-slot="chat"]')) {
      if (experienceChatSlotNodes.has(node)) clearExperienceChatSlot(node);
    }
  };
  const removeExperienceChatSlots = () => {
    for (const node of experienceChatSlotNodes) clearExperienceChatSlot(node);
    /* This compatibility sweep only runs when removing the experience, never
       during streaming/work-state updates. It also cleans slots left by a
       previous hot install that this instance did not cache. */
    for (const node of document.querySelectorAll('[data-dream-experience-slot="chat"]')) {
      clearExperienceChatSlot(node);
    }
    experienceChatSlotNodes.clear();
  };

  const syncExperienceChatSlots = (replies = [], { prune = true } = {}) => {
    const chat = experienceStore.getViewModel().chat;
    const targets = chat.enabled
      ? [...new Set(replies || [])]
        .filter((reply) => reply instanceof Element && reply.isConnected)
      : [];
    const targetSet = new Set(targets);
    for (const current of [...experienceChatSlotNodes]) {
      if (!current.isConnected || !chat.enabled || (prune && !targetSet.has(current))) {
        clearExperienceChatSlot(current);
      }
    }
    for (const reply of targets) {
      experienceChatSlotNodes.add(reply);
      setAttribute(reply, "data-dream-experience-slot", "chat");
      setAttribute(reply, "data-dream-experience-role", chat.assistantRole);
      setAttribute(reply, "data-dream-experience-pose", chat.pose);
    }
  };

  let experienceChatStoreUnsubscribe = experienceStore.subscribe((viewModel, event) => {
    if (window[DISABLED_KEY] || !["WORK_STATE_CHANGED", "SCOPE_CHANGED", "TEMPLATE_SELECTED"].includes(event?.type)) return;
    /* Work-state changes are frequent while a reply streams. Reuse the rows
       already owned by the experience and let the route/mutation path discover
       newly mounted rows; never rescan historic chat DOM just to update pose. */
    syncExperienceChatSlots([...experienceChatSlotNodes], { prune: false });
  });

  const removeExperienceComposerSlots = () => {
    for (const node of document.querySelectorAll('[data-dream-experience-slot="composer"]')) {
      node.removeAttribute("data-dream-experience-slot");
      node.removeAttribute("data-dream-experience-role");
      node.removeAttribute("data-dream-experience-pose");
    }
  };

  const syncExperienceComposerSlots = (viewModel = experienceStore.getViewModel()) => {
    const composer = viewModel.composer;
    const targets = [
      ...[...document.querySelectorAll(COMPOSER_CHARACTER_SELECTOR)]
        .map((node) => [node, composer.companionRole, composer.enabled.companion]),
      [document.getElementById("codex-quota-ring-composer"), composer.ringRole, composer.enabled.ring],
      [document.getElementById("codex-quota-ring-details"), composer.ringRole, composer.enabled.ring],
      [document.getElementById("codex-quota-ring-tooltip"), composer.ringRole, composer.enabled.ring],
      [document.getElementById("codex-quota-reset-composer"), composer.probabilityRole, composer.enabled.probability],
      [document.getElementById("codex-quota-reset-details"), composer.probabilityRole, composer.enabled.probability],
    ].filter(([node, role, enabled]) => node instanceof Element && enabled && role !== "none");
    const targetSet = new Set(targets.map(([node]) => node));
    for (const current of document.querySelectorAll('[data-dream-experience-slot="composer"]')) {
      if (targetSet.has(current)) continue;
      current.removeAttribute("data-dream-experience-slot");
      current.removeAttribute("data-dream-experience-role");
      current.removeAttribute("data-dream-experience-pose");
    }
    for (const [node, role] of targets) {
      setAttribute(node, "data-dream-experience-slot", "composer");
      setAttribute(node, "data-dream-experience-role", role);
      setAttribute(node, "data-dream-experience-pose", composer.pose);
    }
  };

  let experienceComposerStoreUnsubscribe = experienceStore.subscribe((viewModel, event) => {
    if (window[DISABLED_KEY] || !["WORK_STATE_CHANGED", "SCOPE_CHANGED", "TEMPLATE_SELECTED"].includes(event?.type)) return;
    syncExperienceComposerSlots(viewModel);
  });

  const ensureSidebarAccountCharacter = ({ retry = true } = {}) => {
    syncExperienceSidebarSlots();
    const account = findSidebarAccountButton();
    if (!(account instanceof Element)) {
      if (retry && experienceCapabilityEnabled("characters") &&
        document.querySelector(SIDEBAR_PANEL_SELECTOR)) {
        scheduleSidebarAccountRepair();
      }
      return false;
    }
    if (!account.hasAttribute(SIDEBAR_GREETING_ATTR)) ensureSidebarGreeting();
    if (!experienceCapabilityEnabled("characters")) {
      account.removeAttribute(CHARACTER_STYLE_ATTR);
      clearLegacyCharacterFrame(account);
      return true;
    }
    applyCharacterStyle(
      account,
      CHARACTER_STYLE_ATTR,
      FIXED_CHARACTER_STYLES.account,
      CHARACTER_PRESENTATIONS.account[FIXED_CHARACTER_STYLES.account],
    );
    sidebarAccountRepairAttempts = 0;
    return true;
  };

  const ensureCharacterVariants = ({ includeReplies = false, replies = null, fullScan = false } = {}) => {
    if (!isRendererVisible()) {
      backgroundRepairPending = true;
      return;
    }
    if (!experienceCapabilityEnabled("characters")) {
      if (includeReplies && replies !== null) {
        for (const reply of replies) {
          if (!(reply instanceof Element) || !reply.isConnected) continue;
          reply.removeAttribute("data-dream-experience-slot");
          reply.removeAttribute("data-dream-experience-role");
          reply.removeAttribute("data-dream-experience-pose");
          reply.removeAttribute(CHARACTER_REPLY_STYLE_ATTR);
          clearLegacyCharacterFrame(reply);
        }
      } else {
        removeCharacterVariants({ preserveComposerControls: true });
      }
      syncExperienceComposerSlots();
      return;
    }
    const incrementalReplyPass = includeReplies && replies !== null;
    if (!incrementalReplyPass) {
      ensureSidebarAccountCharacter();
      const composer = document.querySelector(COMPOSER_CHARACTER_SELECTOR);
      applyCharacterStyle(
        composer,
        CHARACTER_STYLE_ATTR,
        FIXED_CHARACTER_STYLES.composer,
        CHARACTER_PRESENTATIONS.composer[FIXED_CHARACTER_STYLES.composer],
      );
    }
    if (!includeReplies) return;
    /* Root repairs happen for many reasons unrelated to message content. A
       route/root pass must not turn those signals into a document-wide scan;
       the one explicit bootstrap seed below and mutation-scoped batches own
       reply discovery after this point. */
    if (!incrementalReplyPass && !fullScan) return;
    const replyTargets = incrementalReplyPass
      ? [...new Set(replies)].filter((reply) => reply instanceof Element && reply.isConnected)
      : assistantReplyNodes(currentChatReplyScope());
    if (incrementalReplyPass) metrics.replyIncrementalPasses += 1;
    else metrics.replyFullScans += 1;
    syncExperienceChatSlots(replyTargets, { prune: !incrementalReplyPass });
    replyTargets.forEach((reply) => {
      applyCharacterStyle(
        reply,
        CHARACTER_REPLY_STYLE_ATTR,
        FIXED_CHARACTER_STYLES.replies,
        CHARACTER_PRESENTATIONS.replies[FIXED_CHARACTER_STYLES.replies],
      );
    });
  };

  /* Assistant rows stream independently from the shell. Preserve their
     avatars by repairing only rows touched by the mutation batch: repeatedly
     scanning every historic assistant reply during a long stream can monopolize
     the renderer as the task grows. */
  const scheduleCharacterReplyRepair = (replies = null, delay = 160) => {
    if (!isRendererVisible()) {
      backgroundRepairPending = true;
      return;
    }
    if (replies) {
      for (const reply of replies) {
        if (reply instanceof Element && reply.isConnected) pendingCharacterReplyRows.add(reply);
      }
    }
    if (!pendingCharacterReplyRows.size) return;
    if (characterReplyRepairTimer) return;
    characterReplyRepairTimer = setTimeout(() => {
      characterReplyRepairTimer = null;
      if (window[DISABLED_KEY] ||
        document.documentElement?.getAttribute("data-dream-skin") !== "active") {
        pendingCharacterReplyRows.clear();
        return;
      }
      if (!isRendererVisible()) {
        backgroundRepairPending = true;
        pendingCharacterReplyRows.clear();
        return;
      }
      const rows = [];
      for (const reply of pendingCharacterReplyRows) {
        pendingCharacterReplyRows.delete(reply);
        if (reply instanceof Element && reply.isConnected) rows.push(reply);
        if (rows.length >= CHARACTER_REPLY_REPAIR_BATCH_SIZE) break;
      }
      if (rows.length) {
        metrics.replyIncrementalRows += rows.length;
        ensureCharacterVariants({ includeReplies: true, replies: rows });
      }
      if (pendingCharacterReplyRows.size) scheduleCharacterReplyRepair(null, delay);
    }, Math.max(0, delay));
  };

  const replyFromSubtreeWalkNode = (node) => {
    if (!(node instanceof Element)) return null;
    if (node.matches(ASSISTANT_REPLY_SELECTOR)) {
      const speaker = node.querySelector("h4.sr-only")?.textContent?.trim() || "";
      return !speaker || isAssistantReplySpeaker(speaker) ? node : null;
    }
    if (node.matches("h4.sr-only") && isAssistantReplySpeaker(node.textContent)) {
      return node.closest("[data-content-search-unit-key]");
    }
    return null;
  };

  const runCharacterReplySubtreeRepair = () => {
    characterReplySubtreeRepairTimer = null;
    if (window[DISABLED_KEY]) {
      pendingCharacterReplySubtrees.clear();
      return;
    }
    if (!isRendererVisible()) {
      backgroundRepairPending = true;
      return;
    }
    const rows = new Set();
    const startedAt = now();
    let visited = 0;
    for (const [root, state] of pendingCharacterReplySubtrees) {
      if (!(root instanceof Element) || !root.isConnected) {
        pendingCharacterReplySubtrees.delete(root);
        continue;
      }
      let node = state.started ? state.walker.nextNode() : root;
      state.started = true;
      while (node) {
        visited += 1;
        const reply = replyFromSubtreeWalkNode(node);
        if (reply instanceof Element && reply.isConnected) rows.add(reply);
        if (visited >= CHARACTER_REPLY_SUBTREE_BATCH_SIZE || now() - startedAt >= 8) break;
        node = state.walker.nextNode();
      }
      if (!node) pendingCharacterReplySubtrees.delete(root);
      if (visited >= CHARACTER_REPLY_SUBTREE_BATCH_SIZE || now() - startedAt >= 8) break;
    }
    if (rows.size) {
      metrics.replyIncrementalRows += rows.size;
      ensureCharacterVariants({ includeReplies: true, replies: [...rows] });
    }
    if (pendingCharacterReplySubtrees.size && !window[DISABLED_KEY]) {
      characterReplySubtreeRepairTimer = setTimeout(
        runCharacterReplySubtreeRepair,
        16,
      );
    }
  };

  const scheduleCharacterReplySubtreeRepair = (roots = []) => {
    const candidates = Array.isArray(roots) ? roots : [roots];
    for (const root of candidates) {
      if (!(root instanceof Element) || !root.isConnected) continue;
      const coveredByExisting = [...pendingCharacterReplySubtrees.keys()]
        .some((existing) => existing.isConnected && existing.contains(root));
      if (coveredByExisting) continue;
      for (const existing of [...pendingCharacterReplySubtrees.keys()]) {
        if (root.contains(existing)) pendingCharacterReplySubtrees.delete(existing);
      }
      if (typeof document.createTreeWalker !== "function") {
        /* Chromium supports TreeWalker, but keep a compatibility fallback for
           embedded shells that do not expose it. The normal reply scheduler
           still batches the fallback result before mutating the DOM. */
        scheduleCharacterReplyRepair(assistantReplyNodes(root), 0);
        continue;
      }
      pendingCharacterReplySubtrees.set(root, {
        walker: document.createTreeWalker(root, globalThis.NodeFilter?.SHOW_ELEMENT || 1),
        started: false,
      });
    }
    if (pendingCharacterReplySubtrees.size && !characterReplySubtreeRepairTimer) {
      characterReplySubtreeRepairTimer = setTimeout(
        runCharacterReplySubtreeRepair,
        0,
      );
    }
  };

  const removeCharacterVariants = ({ preserveComposerControls = false } = {}) => {
    removeExperienceSidebarSlots();
    removeExperienceChatSlots();
    if (!preserveComposerControls) removeExperienceComposerSlots();
    for (const node of document.querySelectorAll(
      `[${CHARACTER_STYLE_ATTR}], [${CHARACTER_REPLY_STYLE_ATTR}], [data-dream-character-frame], [data-dream-reply-frame]`,
    )) {
      node.removeAttribute(CHARACTER_STYLE_ATTR);
      node.removeAttribute(CHARACTER_REPLY_STYLE_ATTR);
      clearLegacyCharacterFrame(node);
      node.classList.remove("dream-character-swapping");
      node.style.removeProperty("--dream-character-size");
      node.style.removeProperty("--dream-character-position");
    }
  };

  /* The environment footer is deliberately mounted inside Codex's own
     summary host. This makes it part of the same lifecycle: no independent
     fixed panel is left behind when the native summary closes or floats. */
  const removeSummaryFooter = () => {
    for (const node of document.querySelectorAll(`[${SUMMARY_FOOTER_ATTR}]`)) node.remove();
  };

  const summaryText = (node) => String(node?.innerText || "")
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const summaryValues = (host) => {
    const buttons = [...host.querySelectorAll(SUMMARY_ITEM_SELECTOR)];
    const locationButton = host.querySelector('[data-composer-navigation-target="run-location"]');
    const changeButton = buttons.find((button) => /[+-]\s*\d/.test(button.innerText || ""));
    const location = summaryText(locationButton)[0] || "\u672c\u5730";
    const locationIndex = Math.max(0, buttons.indexOf(locationButton));
    const branchButton = buttons.slice(locationIndex + 1).find((button) =>
      button !== changeButton && button.hasAttribute("title"),
    );
    const branch = summaryText(branchButton)[0] || "\u2014";
    const changes = summaryText(changeButton).slice(1).join(" ") || "\u5df2\u540c\u6b65";
    return { location, branch, changes };
  };

  const setSummaryFooterValue = (footer, field, value) => {
    const node = footer.querySelector(`[data-dream-summary-field="${field}"]`);
    if (node && node.textContent !== value) node.textContent = value;
  };

  const buildSummaryFooter = () => {
    const footer = document.createElement("section");
    footer.setAttribute(SUMMARY_FOOTER_ATTR, "true");
    footer.setAttribute("aria-hidden", "true");
    const character = document.createElement("span");
    character.className = "dream-summary-footer-character";
    const content = document.createElement("div");
    content.className = "dream-summary-footer-content";
    const heading = document.createElement("div");
    heading.className = "dream-summary-footer-heading";
    heading.textContent = "\u672c\u5730\u5de5\u4f5c\u533a";
    const rows = document.createElement("div");
    rows.className = "dream-summary-footer-rows";
    const addRow = (field, label) => {
      const row = document.createElement("div");
      row.className = "dream-summary-footer-row";
      const name = document.createElement("span");
      name.textContent = label;
      const value = document.createElement("strong");
      value.setAttribute("data-dream-summary-field", field);
      row.append(name, value);
      rows.appendChild(row);
    };
    addRow("location", "\u4f4d\u7f6e");
    addRow("branch", "\u5206\u652f");
    addRow("changes", "\u53d8\u66f4");
    const status = document.createElement("div");
    status.className = "dream-summary-footer-status";
    status.textContent = "\u5df2\u540c\u6b65";
    content.append(heading, rows, status);
    footer.append(character, content);
    return footer;
  };

  const summaryCardFor = (host) => {
    const anchor = host.querySelector(SUMMARY_ITEM_SELECTOR);
    return anchor?.closest('[class*="bg-token-dropdown-background"]') ||
      anchor?.closest('div[class*="rounded-3xl"]');
  };

  const positionSummaryFooter = (host, footer) => {
    const card = summaryCardFor(host);
    if (!card) return;
    const hostRect = host.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const top = Math.max(0, Math.round(cardRect.bottom - hostRect.top + 12));
    const value = `${top}px`;
    if (footer.style.getPropertyValue("--dream-summary-footer-top") !== value) {
      footer.style.setProperty("--dream-summary-footer-top", value);
    }
  };

  const ensureSummaryFooter = () => {
    return; // TEMP bisect
    const hosts = [...document.querySelectorAll(SUMMARY_HOST_SELECTOR)].filter((host) => {
      const style = getComputedStyle(host);
      const rect = host.getBoundingClientRect();
      const card = summaryCardFor(host);
      if (!card) return false;
      const cardStyle = getComputedStyle(card);
      const cardRect = card.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" &&
        cardStyle.display !== "none" && cardStyle.visibility !== "hidden" &&
        rect.width > 0 && rect.height > 0 && cardRect.width > 0 && cardRect.height > 0 &&
        cardRect.right > 0 && cardRect.left < window.innerWidth &&
        cardRect.bottom > 0 && cardRect.top < window.innerHeight;
    });
    const hostSet = new Set(hosts);
    for (const footer of document.querySelectorAll(`[${SUMMARY_FOOTER_ATTR}]`)) {
      if (!hostSet.has(footer.parentElement)) footer.remove();
    }
    for (const host of hosts) {
      let footer = [...host.children].find((child) => child.hasAttribute?.(SUMMARY_FOOTER_ATTR));
      if (!footer) {
        footer = buildSummaryFooter();
        host.appendChild(footer);
      }
      const values = summaryValues(host);
      setSummaryFooterValue(footer, "location", values.location);
      setSummaryFooterValue(footer, "branch", values.branch);
      setSummaryFooterValue(footer, "changes", values.changes);
      positionSummaryFooter(host, footer);
    }
  };

  const scheduleSummaryFooter = (delay = 120) => {
    if (summaryRefreshTimer) clearTimeout(summaryRefreshTimer);
    summaryRefreshTimer = setTimeout(() => {
      summaryRefreshTimer = null;
      if (window[DISABLED_KEY]) return;
      if (document.documentElement?.getAttribute("data-dream-skin") === "active") ensureSummaryFooter();
      else removeSummaryFooter();
    }, Math.max(0, delay));
  };

  /* Codex 26.730 moved the native composer chrome class onto a generated
     layout root and then removed the readable class entirely. Recover the
     same semantic hook on the real input surface so the existing skin rules,
     quota alignment and companion art continue to follow the composer. */
  const ensureComposerCharacterStyle = (surface) => {
    if (!(surface instanceof Element)) return surface;
    /* The surface can be visible before the debounced root pass runs. Apply
       the fixed crop in this mutation turn so a thread switch never paints
       the generic contain-sized companion for one frame. */
    if (experienceCapabilityEnabled("characters")) {
      applyCharacterStyle(
        surface,
        CHARACTER_STYLE_ATTR,
        FIXED_CHARACTER_STYLES.composer,
        CHARACTER_PRESENTATIONS.composer[FIXED_CHARACTER_STYLES.composer],
      );
    } else {
      surface.removeAttribute(CHARACTER_STYLE_ATTR);
      clearLegacyCharacterFrame(surface);
    }
    return surface;
  };

  const ensureComposerSurfaceChrome = () => {
    const composerEditorSelector =
      '[data-codex-composer="true"], [contenteditable="true"], textarea';
    const roots = [...document.querySelectorAll('[data-codex-composer-root]')];
    const surfaces = [];
    for (const root of roots) {
      const candidates = [...root.querySelectorAll(
        '[data-composer-surface-variant], [class*="_ComposerLayoutRoot_"]',
      )].filter((candidate) => candidate.matches(composerEditorSelector) ||
        candidate.querySelector(composerEditorSelector));
      surfaces.push(...candidates);
    }
    /* During a project switch the old classed surface can remain connected for
       one React commit while the destination surface is already mounted. Do
       not let that stale node short-circuit the repair; normalize every live
       candidate. This routine runs in the route commit path, so do not read
       geometry here: viewport ranking was forcing a full layout before React
       had finished replacing the chat surface. */
    const existing = [...document.querySelectorAll(COMPOSER_CHARACTER_SELECTOR)]
      .filter((node) => node instanceof HTMLElement && node.isConnected &&
        (node.matches(composerEditorSelector) || node.querySelector(composerEditorSelector)));
    const allSurfaces = [...new Set([...existing, ...surfaces])];
    for (const surface of allSurfaces) {
      ensureComposerCharacterStyle(surface);
      surface.classList.add("composer-surface-chrome");
      surface.setAttribute(COMPOSER_SURFACE_REPAIR_ATTR, "true");
    }
    for (const node of document.querySelectorAll(
      `${COMPOSER_CHARACTER_SELECTOR}[${COMPOSER_SURFACE_REPAIR_ATTR}]`,
    )) {
      if (!allSurfaces.includes(node)) {
        node.classList.remove("composer-surface-chrome");
        node.removeAttribute(COMPOSER_SURFACE_REPAIR_ATTR);
      }
    }
    if (!allSurfaces.length) return null;
    /* Callers only need the semantic repair side effects. DOM order picks the
       newly mounted surface during the brief old/new overlap without a layout
       read; the quota dock maintains its own post-layout anchor. */
    const surface = allSurfaces.at(-1) || null;
    syncExperienceComposerSlots();
    return surface;
  };

  const removeComposerSurfaceChromeRepair = () => {
    for (const node of document.querySelectorAll(`[${COMPOSER_SURFACE_REPAIR_ATTR}]`)) {
      node.classList.remove("composer-surface-chrome");
      node.removeAttribute(COMPOSER_SURFACE_REPAIR_ATTR);
    }
  };

  const summaryMutationNeedsRefresh = (mutation) => {
    const belongsToSummary = (node) => node instanceof Element && (
      node.matches(SUMMARY_HOST_SELECTOR) || Boolean(node.closest(SUMMARY_HOST_SELECTOR))
    );
    if (belongsToSummary(mutation.target)) return true;
    return [...mutation.addedNodes].some((node) => node instanceof Element && (
      node.matches(SUMMARY_HOST_SELECTOR) || Boolean(node.querySelector(SUMMARY_HOST_SELECTOR))
    ));
  };

  const EXPERIENCE_WORKING_SELECTOR = [
    '[data-is-streaming="true"]',
    '[data-state="streaming"]',
    '[data-status="streaming"]',
    '[aria-busy="true"]',
    '[data-testid*="stop" i]',
    'button[aria-label*="Stop" i]',
    'button[aria-label*="\\505c\\6b62"]',
  ].join(", ");
  const EXPERIENCE_ERROR_SELECTOR = [
    '[data-state="error"]',
    '[data-status="error"]',
    '[data-error="true"]',
    '[data-message-error="true"]',
  ].join(", ");

  const cancelExperienceCompletion = () => {
    if (!experienceCompletionTimer) return;
    clearTimeout(experienceCompletionTimer);
    experienceCompletionTimer = null;
  };

  const nativeExperienceWorkSignal = () => {
    const online = globalThis.navigator?.onLine;
    if (online === false) return "offline";
    const main = findMainSurface();
    if (!main) return "idle";
    if (findThreadLoadingRoot() || main.querySelector(EXPERIENCE_WORKING_SELECTOR)) {
      return "working";
    }
    if (main.querySelector(EXPERIENCE_ERROR_SELECTOR)) return "error";
    return "idle";
  };

  const deriveExperienceWorkState = (readiness) => {
    if (readiness.settings || readiness.home) return "idle";
    if (readiness.loading) {
      cancelExperienceCompletion();
      return "working";
    }
    const signal = nativeExperienceWorkSignal();
    if (signal === "working") {
      cancelExperienceCompletion();
      return "working";
    }
    if (signal === "error" || signal === "offline") {
      cancelExperienceCompletion();
      return signal;
    }
    return ["working", "complete"].includes(experienceRuntimeState.work)
      ? "complete" : "idle";
  };

  const scheduleExperienceIdle = () => {
    if (experienceCompletionTimer) return;
    experienceCompletionTimer = setTimeout(() => {
      experienceCompletionTimer = null;
      if (!window[DISABLED_KEY] && experienceRuntimeState.work === "complete") {
        dispatchExperienceEvent("WORK_STATE_CHANGED", { work: "idle" });
      }
    }, 1200);
  };

  const applyRootState = (root) => {
    metrics.rootPasses += 1;
    ensureStyle();
    const readiness = rendererReadiness();
    const previousMode = root.getAttribute("data-dream-skin");
    const wasActive = ["active", "home-native", "settings", "native"].includes(previousMode);
    if (!readiness.ready) {
      /* Both routes briefly unmount their main content during navigation.
         Preserve the shared shell/background contract across that gap so the
         app does not flash native typography and repaint the wallpaper. */
      if (wasActive) {
        const transitionNow = now();
        if (routeTransitionStartedAt <= 0) routeTransitionStartedAt = transitionNow;
        const transitionElapsed = Math.max(0, transitionNow - routeTransitionStartedAt);
        if (routeTransitionTimedOut || transitionElapsed >= ROUTE_TRANSITION_MASK_MAX_MS) {
          /* A slow/new-task worktree is a valid native state, not a reason to
             keep the renderer behind an artificial full-surface mask. */
          routeTransitionTimedOut = true;
          removeThreadLoadingFallback();
          root.removeAttribute("data-dream-route-transition");
          if (readinessCheckTimer) clearTimeout(readinessCheckTimer);
          readinessCheckTimer = null;
          return { applied: true, readiness };
        }
        setAttribute(root, "data-dream-route-transition", "true");
        ensureThreadLoadingFallback();
        /* Keep one pending retry alive. Re-arming this timer from every root
           or route observer callback turns a slow home mount into a hot loop. */
        if (!readinessCheckTimer) {
          readinessCheckTimer = setTimeout(() => {
            readinessCheckTimer = null;
            if (!window[DISABLED_KEY]) scheduleEnsure({ root: true, scope: true }, 0);
          }, Math.min(
            ROUTE_TRANSITION_RETRY_MS,
            Math.max(1, ROUTE_TRANSITION_MASK_MAX_MS - transitionElapsed),
          ));
        }
        return { applied: true, readiness };
      }
      if (readinessCheckTimer) clearTimeout(readinessCheckTimer);
      readinessCheckTimer = null;
      routeTransitionStartedAt = 0;
      routeTransitionTimedOut = false;
      removeHomeReplica();
      removeSidebarGreeting();
      removeNativeSidebarToggle();
      root.removeAttribute(SIDEBAR_FLOATING_ATTR);
      removeCharacterVariants();
      removeSummaryFooter();
      for (const name of ROOT_ATTRS) root.removeAttribute(name);
      return { applied: false, readiness };
    }
    if (readinessCheckTimer) clearTimeout(readinessCheckTimer);
    readinessCheckTimer = null;
    routeTransitionStartedAt = 0;
    routeTransitionTimedOut = false;
    const experienceRoute = readiness.settings ? "settings" : readiness.home ? "home" : "thread";
    dispatchExperienceEvent("SCOPE_CHANGED", { route: experienceRoute, overlay: false });
    const experienceWork = deriveExperienceWorkState(readiness);
    dispatchExperienceEvent("WORK_STATE_CHANGED", { work: experienceWork });
    if (experienceWork === "complete") scheduleExperienceIdle();
    if (nativeThemeSelected) {
      for (const name of ROOT_ATTRS) root.removeAttribute(name);
      for (const attribute of [...(root.attributes || [])]) {
        if (attribute.name.startsWith("data-dream-")) root.removeAttribute(attribute.name);
      }
      for (const name of THEME_VARIABLES) root.style.removeProperty(name);
      for (const property of [...root.style]) {
        if (property.startsWith("--dream-") || property.startsWith("--ds-")) {
          root.style.removeProperty(property);
        }
      }
      setAttribute(root, "data-dream-skin", "native");
      setAttribute(root, "data-dream-theme-id", NATIVE_THEME_ID);
      removeHomeReplica();
      removeSummaryFooter();
      removeQuotaDom();
      removeSidebarGreeting();
      removeNativeSidebarToggle();
      removeCharacterVariants();
      removeComposerSurfaceChromeRepair();
      clearThreadLoadingStage();
      return { applied: true, readiness };
    }
    if (readiness.settings) {
      /* Settings keeps native control geometry, while a dedicated skin mode
         supplies the wallpaper, translucent panels and readable navigation. */
      removeHomeReplica();
      removeSummaryFooter();
      removeQuotaDom();
      removeBackgroundSwitcher();
      removeThreadLoadingFallback();
      clearThreadLoadingStage();
      root.removeAttribute("data-dream-route-transition");
      const shell = resolvedShell();
      setAttribute(root, "data-dream-skin", "settings");
      syncExperienceRootState(root);
      setAttribute(root, SHELL_ATTR, shell);
      root.removeAttribute("data-dream-home-ready");
      root.removeAttribute(NEW_TASK_SELECTED_ATTR);
      setStyleProperty(root, "--dream-skin-pet", petUrl ? `url("${petUrl}")` : "none");
      setStyleProperty(root, "--dream-skin-sidebar-companion",
        sidebarCompanionUrl ? `url("${sidebarCompanionUrl}")` : "none");
      setStyleProperty(root, "--dream-skin-sidebar-account-avatar",
        sidebarAccountAvatarUrl ? `url("${sidebarAccountAvatarUrl}")` : "none");
      setStyleProperty(root, "--dream-skin-avatar", chatAvatarUrl ? `url("${chatAvatarUrl}")` : "none");
      setStyleProperty(root, "--dream-skin-tibo-avatar", tiboAvatarUrl ? `url("${tiboAvatarUrl}")` : "none");
      setStyleProperty(root, "--dream-skin-companion",
        composerCompanionUrl ? `url("${composerCompanionUrl}")` : "none");
      applyActiveBackgroundVariant(root, shell);
      syncSidebarOverlayState();
      return { applied: true, readiness };
    }
    removeThreadLoadingFallback();
    root.removeAttribute("data-dream-route-transition");
    /* Old development builds mirrored sidebar transition state onto the root.
       The current skin lets Codex own rail geometry, so stale transition
       markers and width variables must never survive a hot upgrade. */
    root.removeAttribute("data-dream-sidebar-collapsing");
    root.style.removeProperty("--dream-sidebar-native-width");
    const shell = resolvedShell();
    setAttribute(root, "data-dream-skin", readiness.home ? "home-native" : "active");
    syncExperienceRootState(root);
    const hasCurrentSidebarItem = Boolean(document.querySelector(SIDEBAR_CURRENT_ITEM_SELECTOR));
    setAttribute(root, NEW_TASK_SELECTED_ATTR,
      readiness.home || !hasCurrentSidebarItem ? "true" : "false");
    setAttribute(root, SHELL_ATTR, shell);
    if (readiness.home) setAttribute(root, "data-dream-home-ready", "true");
    else root.removeAttribute("data-dream-home-ready");
    setStyleProperty(root, "--dream-skin-pet", petUrl ? `url("${petUrl}")` : "none");
    setStyleProperty(root, "--dream-skin-sidebar-companion", sidebarCompanionUrl ? `url("${sidebarCompanionUrl}")` : "none");
    setStyleProperty(root, "--dream-skin-sidebar-account-avatar", sidebarAccountAvatarUrl ? `url("${sidebarAccountAvatarUrl}")` : "none");
    setStyleProperty(root, "--dream-skin-avatar", chatAvatarUrl ? `url("${chatAvatarUrl}")` : "none");
    setStyleProperty(root, "--dream-skin-tibo-avatar", tiboAvatarUrl ? `url("${tiboAvatarUrl}")` : "none");
    setStyleProperty(root, "--dream-skin-companion", composerCompanionUrl ? `url("${composerCompanionUrl}")` : "none");
    applyActiveBackgroundVariant(root, shell);
    /* Wait until the destination thread is ready before attaching the semantic
       skin class. The CSS remount fallback still paints the native surface in
       the meantime, while this avoids mutating the outgoing Composer during
       the route gap. */
    ensureComposerSurfaceChrome();
    ensureHomeReplica(readiness.home);
    ensureSidebarGreeting();
    ensureNativeSidebarToggle();
    syncSidebarOverlayState();
    ensureCharacterVariants({ includeReplies: !readiness.home });
    if (readiness.home) removeSummaryFooter();
    else ensureSummaryFooter();
    if (!wasActive) {
      if (readinessCheckTimer) clearTimeout(readinessCheckTimer);
      readinessCheckTimer = setTimeout(() => {
        readinessCheckTimer = null;
        if (!window[DISABLED_KEY]) scheduleEnsure({ root: true, scope: true }, 0);
      }, 220);
    }
    return { applied: true, readiness };
  };

  const skinNeedsRepair = () => {
    const root = document.documentElement;
    const readiness = rendererReadiness();
    if (!readiness.ready) return false;
    const currentMode = root?.getAttribute("data-dream-skin") || "";
    if (nativeThemeSelected) {
      if (!root || currentMode !== "native") return true;
      if (styleMode === "adopted" && styleSheet) {
        try { return ![...document.adoptedStyleSheets].includes(styleSheet); } catch { return true; }
      }
      if (styleMode === "style" && styleNode) return document.getElementById(STYLE_ID) !== styleNode;
      return true;
    }
    const expectedMode = readiness.settings ? "settings" : readiness.home ? "home-native" : "active";
    if (!root || currentMode !== expectedMode) return true;
    if (!root.style.getPropertyValue("--dream-skin-art").trim()) return true;
    if (!root.style.getPropertyValue("--ds-bg").trim()) return true;
    if (petUrl && !root.style.getPropertyValue("--dream-skin-pet").trim()) return true;
    if (sidebarCompanionUrl && !root.style.getPropertyValue("--dream-skin-sidebar-companion").trim()) return true;
    if (sidebarAccountAvatarUrl && !root.style.getPropertyValue("--dream-skin-sidebar-account-avatar").trim()) return true;
    if (chatAvatarUrl && !root.style.getPropertyValue("--dream-skin-avatar").trim()) return true;
    if (composerCompanionUrl && !root.style.getPropertyValue("--dream-skin-companion").trim()) return true;
    if (document.querySelector('[data-codex-composer-root]') &&
      !document.querySelector(COMPOSER_CHARACTER_SELECTOR)) return true;
    if (styleMode === "adopted" && styleSheet) {
      try {
        return ![...document.adoptedStyleSheets].includes(styleSheet);
      } catch {
        return true;
      }
    }
    if (styleMode === "style" && styleNode) {
      return document.getElementById(STYLE_ID) !== styleNode;
    }
    return true;
  };

  const selectorHit = (key) => {
    const selector = selectorByKey.get(key)?.selector;
    if (!selector) return false;
    try { return Boolean(document.querySelector(selector)); } catch { return false; }
  };

  const isOpenNativeOverlay = (node) => {
    if (!(node instanceof Element) || !node.isConnected || node.hidden) return false;
    /* Persistent skin controls intentionally remain in document.body while
       hidden. They must not turn every scope refresh into an overlay pass. */
    if (node.matches(
      '[data-codex-quota], [data-dream-model-radar], ' +
      '#codex-model-radar-popover, #codex-background-switcher-menu',
    ) || node.closest(
      '[data-codex-quota], [data-dream-model-radar], ' +
      '#codex-model-radar-popover, #codex-background-switcher-menu',
    )) {
      return false;
    }
    if (node.getAttribute("aria-hidden") === "true") return false;
    const state = node.getAttribute("data-state");
    return state !== "closed" && state !== "hidden";
  };

  const openOverlaySelectorHit = (key) => {
    const selector = selectorByKey.get(key)?.selector;
    if (!selector) return false;
    try {
      return [...document.querySelectorAll(selector)].some(isOpenNativeOverlay);
    } catch {
      return false;
    }
  };

  const stableTestidHit = (testid) => {
    const selector = stableTestidSelector(testid);
    if (!selector) return false;
    try { return Boolean(document.querySelector(selector)); } catch { return false; }
  };

  /* Read the same authenticated Usage payload used by Codex itself. The
     renderer cannot call vscode://codex/account/* on every installed build,
     so use the Electron fetch bridge and keep a DOM/explicit-hook fallback. */
  const parseQuotaNumber = (value) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const match = String(value ?? "").trim().replace(/,/g, "")
      .match(/^([\d.]+)\s*(K|M|B)?$/i);
    if (!match) return null;
    const base = Number(match[1]);
    const scale = { K: 1_000, M: 1_000_000, B: 1_000_000_000 }[match[2]?.toUpperCase()] || 1;
    return Number.isFinite(base) ? base * scale : null;
  };

  const parseQuotaPercent = (value) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const match = String(value ?? "").replace(/,/g, "").match(/([\d.]+)\s*%?/);
    if (!match) return null;
    const percentage = Number(match[1]);
    return Number.isFinite(percentage) ? percentage : null;
  };

  const quotaText = (value, fallback = "") => typeof value === "string"
    ? value.trim().slice(0, 80) : fallback;

  const clampQuotaPercent = (value) => Number.isFinite(value)
    ? Math.max(0, Math.min(100, value)) : null;

  const quotaBridgeHeaders = {
    "OAI-Language": "en",
    "X-OpenAI-Attach-Auth": "1",
    "X-OpenAI-Attach-Integrity-State": "1",
    originator: "Codex Desktop",
  };

  const quotaRequestId = () => {
    if (typeof crypto === "object" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `codex-quota-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  const requestElectronBridge = (url, timeoutMs = 3500, headers = {}) => {
    const bridge = window.electronBridge;
    if (typeof bridge?.sendMessageFromView !== "function") return Promise.resolve(null);
    const requestId = quotaRequestId();
    return new Promise((resolve) => {
      let settled = false;
      let timeout = null;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        if (timeout) clearTimeout(timeout);
        window.removeEventListener("message", onMessage);
        resolve(value);
      };
      const onMessage = (event) => {
        const data = event?.data;
        if (!data || typeof data !== "object" || data.requestId !== requestId ||
          data.type !== "fetch-response") return;
        if (data.responseType !== "success" || data.status < 200 || data.status >= 300) {
          finish(null);
          return;
        }
        let body = null;
        try {
          body = typeof data.bodyJsonString === "string"
            ? JSON.parse(data.bodyJsonString) : data.bodyJsonString;
        } catch {}
        finish(body && (typeof body === "object" || typeof body === "string") ? body : null);
      };
      window.addEventListener("message", onMessage);
      try {
        Promise.resolve(bridge.sendMessageFromView({
          type: "fetch",
          requestId,
          method: "GET",
          url,
          headers,
          reportUploadProgress: false,
        })).catch(() => finish(null));
      } catch {
        finish(null);
      }
      timeout = setTimeout(() => finish(null), timeoutMs);
    });
  };
  const requestQuotaBridge = (url, timeoutMs = 3500) =>
    requestElectronBridge(url, timeoutMs, quotaBridgeHeaders);

  /* Newer Codex builds keep authenticated HTTP behind the renderer's own
     fetch service. Keep the legacy Electron bridge above for older builds,
     then discover the already-loaded app service when that bridge rejects a
     normal HTTP URL. This is read-only and uses the same service as Codex's
     native usage indicator. */
  let quotaHttpServicePromise = null;
  const getQuotaHttpService = () => {
    if (location.protocol !== "app:" || typeof document === "undefined") {
      return Promise.resolve(null);
    }
    if (!quotaHttpServicePromise) {
      quotaHttpServicePromise = (async () => {
        const scriptUrls = [
          ...(document.scripts || []),
        ].map((script) => script?.src || script?.getAttribute?.("src") || "");
        const resourceUrls = typeof performance?.getEntriesByType === "function"
          ? performance.getEntriesByType("resource").map((entry) => entry?.name || "") : [];
        let scriptUrl = [...scriptUrls, ...resourceUrls]
          .map((value) => {
            try { return new URL(value, location.href).href; } catch { return ""; }
          })
          .find((value) => /\/assets\/app-initial-[^/]+\.js(?:$|\?)/i.test(value));
        if (!scriptUrl) {
          const indexUrl = [...scriptUrls, ...resourceUrls]
            .map((value) => {
              try { return new URL(value, location.href).href; } catch { return ""; }
            })
            .find((value) => /\/assets\/index-[^/]+\.js(?:$|\?)/i.test(value));
          if (indexUrl) {
            try {
              const source = await (await fetch(indexUrl)).text();
              const match = source.match(/["'](?:\.\/)?(app-initial-[^"']+\.js)/i);
              if (match?.[1]) scriptUrl = new URL(match[1], indexUrl).href;
            } catch {}
          }
        }
        if (!scriptUrl) return null;
        let appModule = null;
        try { appModule = await import(scriptUrl); } catch { return null; }
        const candidates = Object.values(appModule || {}).filter((candidate) => {
          if (!candidate || (typeof candidate !== "object" && typeof candidate !== "function")) {
            return false;
          }
          return typeof candidate.safeGet === "function" &&
            typeof candidate.safePost === "function";
        });
        /* Some bundles export a lazy RPC promise as a function with proxy
           properties named safeGet/safePost. It passes the shape check but
           cannot execute a request. Prefer the concrete service object used by
           the native usage query, keeping a function fallback for older builds. */
        return candidates.find((candidate) => typeof candidate === "object") ||
          candidates.find((candidate) => typeof candidate === "function" &&
            /(?:safeGet|makeRequest)/.test(String(candidate.safeGet))) || null;
      })().catch(() => null);
    }
    return quotaHttpServicePromise;
  };
  const requestQuotaHttpService = async (url) => {
    const service = await getQuotaHttpService();
    if (!service) return null;
    try { return await service.safeGet(url); } catch { return null; }
  };
  /* The current desktop host routes public requests through its native HTTP
     service and rejects the old Electron bridge. The injector owns a narrow,
     unauthenticated fetch binding for the public Radar/X pages; keep the old
     bridge only as a compatibility fallback for older desktop builds. */
  const requestPublicBridge = async (url, timeoutMs = QUOTA_RADAR_REQUEST_TIMEOUT_MS, headers = {}) => {
    const publicPayload = await requestPublicFetch(url, timeoutMs);
    if (typeof publicPayload === "string" && publicPayload) return publicPayload;
    return requestElectronBridge(url, Math.min(timeoutMs, 4000), {
      Accept: "application/json, text/html;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "OAI-Language": "en",
      originator: "Codex Desktop",
      ...headers,
    });
  };

  const quotaResetText = (value) => {
    const raw = parseQuotaNumber(value);
    if (!Number.isFinite(raw)) return "";
    const milliseconds = raw > 10_000_000_000 ? raw : raw * 1000;
    const date = new Date(milliseconds);
    if (!Number.isFinite(date.getTime())) return "";
    try {
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date.toLocaleString();
    }
  };

  const quotaWindowKind = (minutes, label = "") => {
    const normalizedLabel = String(label || "").trim();
    if (/(?:month|monthly|月额度|本月)/i.test(normalizedLabel)) return "monthly";
    if (/(?:week|weekly|7\s*(?:day|d)|周额度|本周)/i.test(normalizedLabel)) return "weekly";
    if (/(?:5\s*(?:hour|hr|h)|5小时)/i.test(normalizedLabel)) return "five-hour";
    if (!Number.isFinite(minutes) || minutes <= 0) return "custom";
    if (minutes >= 27 * 1440 && minutes <= 32 * 1440) return "monthly";
    if (minutes >= 6 * 1440 && minutes <= 8 * 1440) return "weekly";
    if (minutes >= 4.5 * 60 && minutes <= 5.5 * 60) return "five-hour";
    if (minutes >= 1440) return "daily";
    if (minutes >= 60) return "hourly";
    return "minute";
  };

  const quotaWindowLabel = (minutes, providedLabel = "") => {
    const kind = quotaWindowKind(minutes, providedLabel);
    if (kind === "monthly") return "月额度";
    if (kind === "weekly") return "周额度";
    if (kind === "five-hour") return "5H 剩余";
    if (providedLabel) return quotaText(providedLabel);
    if (!Number.isFinite(minutes) || minutes <= 0) return "额度";
    if (minutes >= 1439) return `${Math.max(1, Math.round(minutes / 1440))}天额度`;
    if (minutes >= 60) return `${Math.max(1, Math.round(minutes / 60))}小时额度`;
    return `${Math.max(1, Math.round(minutes))}分钟额度`;
  };

  const quotaWindowShortLabel = (state) => {
    const minutes = Number(state?.windowMinutes);
    const kind = quotaWindowKind(minutes, state?.windowLabel);
    if (kind === "monthly") return "月";
    if (kind === "weekly") return "周";
    if (kind === "five-hour") return "5h";
    if (Number.isFinite(minutes) && minutes >= 1440) return `${Math.max(1, Math.round(minutes / 1440))}天`;
    if (Number.isFinite(minutes) && minutes >= 60) return `${Math.max(1, Math.round(minutes / 60))}h`;
    if (Number.isFinite(minutes) && minutes > 0) return `${Math.max(1, Math.round(minutes))}m`;
    return "额";
  };

  const quotaWindowKey = (state) => {
    const minutes = Number(state?.windowMinutes);
    const duration = Number.isFinite(minutes) ? Math.round(minutes) : "custom";
    return `${quotaWindowKind(minutes, state?.windowLabel)}:${duration}`;
  };

  const normalizeQuotaWindow = (candidate) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
    let used = parseQuotaNumber(candidate.used ?? candidate.usage);
    let limit = parseQuotaNumber(candidate.limit ?? candidate.total);
    let remaining = parseQuotaNumber(candidate.remaining ?? candidate.left);
    const explicitUsedPercent = parseQuotaPercent(
      candidate.usedPercentage ?? candidate.usedPercent ?? candidate.usagePercentage ??
      (candidate.percentageIsRemaining ? null : candidate.percentage ?? candidate.percent),
    );
    const explicitRemainingPercent = parseQuotaPercent(
      candidate.remainingPercentage ?? candidate.remainingPercent ?? candidate.leftPercentage ??
      (candidate.percentageIsRemaining ? candidate.percentage ?? candidate.percent : null),
    );

    if (!Number.isFinite(limit) && Number.isFinite(used) && Number.isFinite(remaining)) {
      limit = used + remaining;
    }
    if (!Number.isFinite(used) && Number.isFinite(limit) && Number.isFinite(remaining)) {
      used = Math.max(0, limit - remaining);
    }
    if (!Number.isFinite(remaining) && Number.isFinite(limit) && Number.isFinite(used)) {
      remaining = Math.max(0, limit - used);
    }
    const usedPercentage = Number.isFinite(explicitUsedPercent)
      ? clampQuotaPercent(explicitUsedPercent)
      : Number.isFinite(used) && Number.isFinite(limit) && limit > 0
        ? clampQuotaPercent(used / limit * 100) : null;
    const remainingPercentage = Number.isFinite(explicitRemainingPercent)
      ? clampQuotaPercent(explicitRemainingPercent)
      : Number.isFinite(usedPercentage)
        ? clampQuotaPercent(100 - usedPercentage) : null;
    if (!Number.isFinite(remainingPercentage)) return null;
    const windowMinutes = Number.isFinite(Number(candidate.windowMinutes))
      ? Number(candidate.windowMinutes) : null;
    return {
      status: "available",
      used: Number.isFinite(used) ? used : null,
      limit: Number.isFinite(limit) ? limit : null,
      remaining: Number.isFinite(remaining) ? remaining : null,
      usedPercentage,
      remainingPercentage,
      // Keep percentage as the value rendered by the compact meter: remaining.
      percentage: remainingPercentage,
      resetAt: quotaText(candidate.resetAt),
      updatedAt: quotaText(candidate.updatedAt),
      source: quotaText(candidate.source, "bridge"),
      freshness: quotaText(candidate.freshness, "live"),
      windowMinutes,
      windowLabel: quotaWindowLabel(windowMinutes, quotaText(candidate.windowLabel)),
      planType: quotaText(candidate.planType),
      creditsBalance: quotaText(candidate.creditsBalance),
    };
  };

  const quotaPrimaryWindow = (windows) => {
    if (!windows.length) return null;
    return windows.find((entry) => quotaWindowKind(entry.windowMinutes, entry.windowLabel) === "monthly") ||
      windows.find((entry) => quotaWindowKind(entry.windowMinutes, entry.windowLabel) === "weekly") ||
      windows.slice().sort((left, right) =>
        Number(right.windowMinutes || 0) - Number(left.windowMinutes || 0))[0];
  };

  const normalizeQuotaState = (candidate) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
    const shared = {
      planType: candidate.planType,
      creditsBalance: candidate.creditsBalance,
      updatedAt: candidate.updatedAt,
      source: candidate.source,
      freshness: candidate.freshness,
    };
    const suppliedWindows = Array.isArray(candidate.windows) ? candidate.windows : [];
    let normalizedWindows = suppliedWindows
      .map((entry) => normalizeQuotaWindow({ ...shared, ...entry }))
      .filter(Boolean);
    if (!normalizedWindows.length) {
      const single = normalizeQuotaWindow(candidate);
      if (!single) return null;
      normalizedWindows = [single];
    }
    /* The primary/secondary provider windows are authoritative. Some
       responses also expose an auxiliary window with the same duration;
       preserve the first provider entry instead of letting that auxiliary
       window overwrite the account's weekly percentage. */
    const dedupedWindows = [];
    const seenWindowKeys = new Set();
    for (const entry of normalizedWindows) {
      const key = quotaWindowKey(entry);
      if (seenWindowKeys.has(key)) continue;
      seenWindowKeys.add(key);
      dedupedWindows.push(entry);
    }
    dedupedWindows.sort((left, right) => Number(left.windowMinutes || 0) - Number(right.windowMinutes || 0));
    const primary = quotaPrimaryWindow(dedupedWindows);
    if (!primary) return null;
    return {
      ...primary,
      planType: quotaText(candidate.planType, primary.planType),
      creditsBalance: quotaText(candidate.creditsBalance, primary.creditsBalance),
      updatedAt: quotaText(candidate.updatedAt, primary.updatedAt),
      source: quotaText(candidate.source, primary.source),
      freshness: quotaText(candidate.freshness, primary.freshness),
      windows: dedupedWindows,
    };
  };

  const quotaWindows = (state) => state?.status === "available" && Array.isArray(state.windows) &&
    state.windows.length ? state.windows : state?.status === "available" ? [state] : [];

  /* Keep every provider window in state for reconciliation and future
     diagnostics. Only the composer ring selects one window for its compact
     display: prefer five-hour, then weekly, then another available window. */
  const quotaDisplayWindows = (stateOrWindows) => {
    const windows = Array.isArray(stateOrWindows)
      ? stateOrWindows : quotaWindows(stateOrWindows);
    if (!windows.length) return [];
    const preferred = windows.find((entry) =>
      quotaWindowKind(entry?.windowMinutes, entry?.windowLabel) === "five-hour",
    ) || windows.find((entry) =>
      quotaWindowKind(entry?.windowMinutes, entry?.windowLabel) === "weekly",
    ) || quotaPrimaryWindow(windows) || windows[0];
    return preferred ? [preferred] : [];
  };

  /* The Usage bridge exposes the next boundary, while the X/Tibo feed exposes
     the reason for a manual reset. Keep those two facts separate. In
     particular, reset_at minus the window duration is only a guessed window
     start; it is not evidence that a reset happened or that Codex was opened. */
  const quotaTimestampMs = (value, referenceMs = Date.now()) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      const milliseconds = value > 10_000_000_000 ? value : value * 1000;
      return Number.isFinite(new Date(milliseconds).getTime()) ? milliseconds : Number.NaN;
    }
    const raw = quotaText(value);
    if (!raw) return Number.NaN;
    const chinese = raw.match(/(\d{1,2})月\s*(\d{1,2})日(?:\s+|T)?(\d{1,2}):(\d{2})/);
    const slash = raw.match(/(?:^|\s)(\d{1,2})[\/-](\d{1,2})(?:\s+|T)(\d{1,2}):(\d{2})/);
    const clock = chinese || slash;
    if (clock) {
      const [, month, day, hour, minute] = clock;
      const reference = new Date(Number.isFinite(referenceMs) ? referenceMs : Date.now());
      const date = new Date(reference.getFullYear(), Number(month) - (chinese ? 1 : 1),
        Number(day), Number(hour), Number(minute));
      if (date.getTime() < reference.getTime() - 183 * 24 * 60 * 60 * 1000) {
        date.setFullYear(date.getFullYear() + 1);
      }
      return date.getTime();
    }
    const english = raw.match(/^([A-Za-z]{3,9})\s+(\d{1,2})(?:,\s*|\s+)(?:(\d{4})\s+)?(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (english) {
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const month = months.indexOf(english[1].slice(0, 3).toLowerCase());
      if (month >= 0) {
        const reference = new Date(Number.isFinite(referenceMs) ? referenceMs : Date.now());
        let hour = Number(english[4]);
        const meridiem = english[6]?.toUpperCase();
        if (meridiem === "PM" && hour < 12) hour += 12;
        if (meridiem === "AM" && hour === 12) hour = 0;
        const date = new Date(english[3] ? Number(english[3]) : reference.getFullYear(),
          month, Number(english[2]), hour, Number(english[5]));
        if (!english[3] && date.getTime() < reference.getTime() - 183 * 24 * 60 * 60 * 1000) {
          date.setFullYear(date.getFullYear() + 1);
        }
        return date.getTime();
      }
    }
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  };

  const quotaResetReconciliationDefaults = () => ({
    version: 3,
    resetStatus: "unknown",
    resetCause: "unknown",
    lastSyncAt: "",
    lastResetAt: "",
    resetVerifiedAt: "",
    nextResetAt: "",
    previousScheduledResetAt: "",
    resetWindowKey: "",
  });

  const normalizeQuotaResetReconciliation = (candidate) => ({
    ...quotaResetReconciliationDefaults(),
    ...(candidate && typeof candidate === "object" ? candidate : {}),
    version: 3,
    resetStatus: /^(?:confirmed|scheduled|unknown)$/.test(candidate?.resetStatus)
      ? candidate.resetStatus : "unknown",
    resetCause: /^(?:tibo-official|periodic|unknown)$/.test(candidate?.resetCause)
      ? candidate.resetCause : "unknown",
  });

  const readQuotaResetReconciliation = () => {
    try {
      return normalizeQuotaResetReconciliation(JSON.parse(
        localStorage.getItem(QUOTA_RESET_RECONCILIATION_KEY) || "null",
      ));
    } catch {
      return quotaResetReconciliationDefaults();
    }
  };

  const writeQuotaResetReconciliation = (state) => {
    const normalized = normalizeQuotaResetReconciliation(state);
    try { localStorage.setItem(QUOTA_RESET_RECONCILIATION_KEY, JSON.stringify(normalized)); } catch {}
    quotaResetReconciliation = normalized;
    return normalized;
  };

  const quotaPrimaryResetWindow = (state) => quotaPrimaryWindow(quotaWindows(state));

  const quotaConfirmedTiboResetAt = (resetInfo) => {
    const postAt = quotaText(resetInfo?.lastResetPostAt);
    const postText = String(resetInfo?.lastResetPostText || "");
    const hasExplicitPost = Boolean(resetInfo?.lastResetPostId || resetInfo?.lastResetUrl ||
      /(?:reset|quota|usage\s+limits?|rate\s+limits?)/i.test(postText));
    return hasExplicitPost && Number.isFinite(quotaTimestampMs(postAt)) ? postAt : "";
  };

  const quotaLastResetDisplayAt = (resetInfo, reconciliation = null) =>
    quotaConfirmedTiboResetAt(resetInfo) ||
    quotaText(reconciliation?.lastResetAt) ||
    quotaText(resetInfo?.lastResetAt);

  const deriveQuotaResetReconciliation = (current, previous, baseline = null,
    syncTimestamp = Date.now()) => {
    const next = normalizeQuotaResetReconciliation(baseline);
    if (current?.status !== "available") return next;
    const currentWindow = quotaPrimaryResetWindow(current) || current;
    const previousWindow = quotaPrimaryResetWindow(previous) || previous;
    const currentResetAt = quotaText(currentWindow?.resetAt);
    const previousResetAt = quotaText(previousWindow?.resetAt || next.nextResetAt);
    const currentResetMs = quotaTimestampMs(currentResetAt, syncTimestamp);
    const previousResetMs = quotaTimestampMs(previousResetAt, syncTimestamp);
    const previousScheduleChanged = Number.isFinite(previousResetMs) && Number.isFinite(currentResetMs) &&
      Math.abs(previousResetMs - currentResetMs) > 60 * 60 * 1000;
    const currentResetDisplay = currentResetAt || next.nextResetAt;
    const previousScheduledResetAt = previousScheduleChanged
      ? previousResetAt : next.previousScheduledResetAt;
    const hasConfirmedReset = next.resetStatus === "confirmed" && Boolean(next.lastResetAt);
    return {
      ...next,
      resetStatus: hasConfirmedReset ? "confirmed" : currentResetDisplay ? "scheduled" : "unknown",
      lastSyncAt: quotaText(current.updatedAt) || new Date(syncTimestamp).toISOString(),
      /* Only an explicit reset source may populate lastResetAt. */
      lastResetAt: next.lastResetAt,
      resetVerifiedAt: next.resetVerifiedAt,
      nextResetAt: currentResetDisplay,
      previousScheduledResetAt,
      resetWindowKey: quotaWindowKey(currentWindow),
    };
  };

  const reconcileQuotaReset = (current, previous = null, syncTimestamp = Date.now()) => {
    const baseline = quotaResetReconciliation || readQuotaResetReconciliation();
    return writeQuotaResetReconciliation(deriveQuotaResetReconciliation(
      current, previous, baseline, syncTimestamp,
    ));
  };

  const readQuotaFromCache = () => {
    try {
      const cached = JSON.parse(localStorage.getItem(QUOTA_STORAGE_KEY) || "null");
      const cachedAt = Number(cached?.cachedAt);
      if (!Number.isFinite(cachedAt) || Date.now() - cachedAt > QUOTA_CACHE_MAX_AGE_MS) return null;
      const state = normalizeQuotaState(cached?.state);
      if (!state) return null;
      state.source = "cache";
      state.freshness = "cached";
      state.windows = quotaWindows(state).map((entry) => ({
        ...entry,
        source: "cache",
        freshness: "cached",
      }));
      return state;
    } catch {
      return null;
    }
  };

  const writeQuotaCache = (state) => {
    if (state?.status !== "available") return;
    try {
      localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify({ cachedAt: Date.now(), state }));
    } catch {}
  };

  const stabilizeQuotaWindow = (state, previous) => {
    if (state?.status !== "available" || previous?.status !== "available") return state;
    const sameWindow = state.resetAt && previous.resetAt
      ? state.resetAt === previous.resetAt
      : quotaWindowKey(state) === quotaWindowKey(previous);
    const previousRemaining = Number(previous.remainingPercentage ?? previous.percentage);
    const nextRemaining = Number(state.remainingPercentage ?? state.percentage);
    if (!sameWindow || !Number.isFinite(previousRemaining) || !Number.isFinite(nextRemaining) ||
      nextRemaining <= previousRemaining) return state;
    return {
      ...state,
      usedPercentage: Math.max(0, 100 - previousRemaining),
      remainingPercentage: previousRemaining,
      percentage: previousRemaining,
    };
  };

  const isAuthoritativeLiveQuota = (state) =>
    /^codex-bridge$/i.test(String(state?.source || "")) &&
    String(state?.freshness || "") === "live";

  const stabilizeQuotaState = (state) => {
    /* A live /wham/usage response is authoritative. Its remaining value can
       legitimately jump upward after a reset or account change, so never
       replace it with the previous cached window. The monotonic guard remains
       for native/unknown snapshots that may arrive while the bridge is busy. */
    if (state?.status !== "available" || isAuthoritativeLiveQuota(state)) return state;
    const previous = quotaBridgeState || readQuotaFromCache();
    if (previous?.status !== "available") return state;
    const previousByKey = new Map(quotaWindows(previous).map((entry) =>
      [quotaWindowKey(entry), entry]));
    const windows = quotaWindows(state).map((entry) =>
      stabilizeQuotaWindow(entry, previousByKey.get(quotaWindowKey(entry))));
    return normalizeQuotaState({ ...state, windows }) || state;
  };

  /* Route changes can publish a native quota snapshot while the authoritative
     bridge request is still in flight. Keep the last trusted live value when
     an event has no timestamp, and reject snapshots that are older than the
     value already rendered. The bridge path already applies the monotonic
     window guard above; applying the same gate to the event path prevents a
     stale 67% snapshot from flashing before the live 64% value arrives. */
  const quotaSnapshotTimestamp = (state) => {
    const value = state?.updatedAt;
    if (typeof value === "number" && Number.isFinite(value)) {
      const milliseconds = value > 10_000_000_000 ? value : value * 1000;
      return Number.isFinite(new Date(milliseconds).getTime()) ? milliseconds : 0;
    }
    const parsed = Date.parse(String(value || ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const acceptQuotaSnapshot = (candidate) => {
    if (candidate?.status !== "available") return candidate;
    const previous = quotaBridgeState?.status === "available"
      ? quotaBridgeState
      : quotaState?.status === "available" ? quotaState : readQuotaFromCache();
    const stabilized = stabilizeQuotaState(candidate);
    if (previous?.status !== "available") return stabilized;
    const candidateAt = quotaSnapshotTimestamp(stabilized);
    const previousAt = quotaSnapshotTimestamp(previous);
    if (candidateAt && previousAt && candidateAt < previousAt) return null;
    const previousIsLive = previous.freshness === "live" ||
      /^codex-bridge/i.test(String(previous.source || ""));
    const candidateIsCodexLive = /^codex-bridge/i.test(String(stabilized.source || "")) &&
      (stabilized.freshness === "live" || !stabilized.freshness);
    if (previousIsLive && !candidateAt && !candidateIsCodexLive) return null;
    return stabilized;
  };

  const collectQuotaWindowCandidates = (value, results = [], seen = new Set(), depth = 0) => {
    if (!value || typeof value !== "object" || seen.has(value) || depth > 5) return results;
    seen.add(value);
    if (!Array.isArray(value) &&
      Number.isFinite(Number(value.limit_window_seconds ?? value.window_seconds)) &&
      (value.used_percent !== undefined || value.remaining_percent !== undefined)) {
      results.push(value);
      return results;
    }
    for (const child of Array.isArray(value) ? value : Object.values(value)) {
      collectQuotaWindowCandidates(child, results, seen, depth + 1);
    }
    return results;
  };

  const readQuotaFromCodexBridge = async () => {
    const urls = ["/wham/usage"];
    for (const url of urls) {
      const payload = await requestQuotaBridge(url) || await requestQuotaHttpService(url);
      if (!payload || typeof payload !== "object") continue;
      const rawWindows = collectQuotaWindowCandidates([
        payload.rate_limit,
        payload.additional_rate_limits,
      ]);
      if (!rawWindows.length) continue;
      const updatedAt = new Date().toISOString();
      const windows = rawWindows.map((entry) => {
        const windowMinutes = Number(entry.limit_window_seconds ?? entry.window_seconds) / 60;
        return {
          usedPercentage: entry.used_percent,
          remainingPercentage: entry.remaining_percent,
          resetAt: quotaResetText(entry.reset_at),
          updatedAt,
          source: "codex-bridge",
          freshness: "live",
          windowMinutes,
          windowLabel: quotaWindowLabel(windowMinutes, entry.window_label ?? entry.label),
          planType: payload.plan_type,
          creditsBalance: payload.credits?.balance,
        };
      });
      const state = normalizeQuotaState({
        windows,
        updatedAt,
        source: "codex-bridge",
        freshness: "live",
        planType: payload.plan_type,
        creditsBalance: payload.credits?.balance,
      });
      if (state) return state;
    }
    return null;
  };

  const readQuotaFromDom = () => {
    if (!document.body) return null;
    /* Bridge data is the source of truth. DOM parsing is only a short fallback
       while the native bridge is mounting, so keep it on quota-sized surfaces
       instead of walking every sidebar and message node. */
    const surfaceRoots = [
      document.querySelector(TASK_HEADER_SELECTOR),
      document.querySelector(".composer-surface-chrome"),
      ...document.querySelectorAll('[role="dialog"]:not(#codex-quota-popover)'),
    ].filter(Boolean);
    const nodes = [...new Set(surfaceRoots.flatMap((root) => [root, ...root.querySelectorAll("*")]))]
      .filter((node) => {
      if (!(node instanceof HTMLElement) || node.children.length > 6) return false;
      const text = node.innerText?.trim() || "";
      return text && text.length < 320 &&
        /(?:额度|quota|weekly\s+(?:limit|quota)|tokens?\s+(?:remaining|used)|usage\s+(?:limit|quota|remaining))/i.test(text);
      }).slice(0, 120);
    for (const node of nodes) {
      if (node.closest(`${QUOTA_SELECTOR}, [data-user-message-bubble], [data-response-annotation-target], [data-content-search-unit-key]`) ||
        node.matches(QUOTA_SELECTOR) || node.querySelector(QUOTA_SELECTOR)) continue;
      const text = node.innerText || "";
      const percent = text.match(/(?:^|[^\d])(100|\d{1,2})(?:\.\d+)?\s*%/);
      const pair = text.match(/([\d,.]+\s*[KMB]?)\s*[\/／]\s*([\d,.]+\s*[KMB]?)/i);
      const reset = text.match(/(?:重置|reset)[^\n]{0,56}/i)?.[0] || "";
      const updated = text.match(/(?:更新|updated?)[^\n]{0,56}/i)?.[0] || "";
      const remainingMatch = text.match(/(?:剩余|余量|remaining|left)\D{0,16}([\d,.]+\s*[KMB]?)/i);
      if (!percent && !pair && !remainingMatch) continue;
      let used = pair ? parseQuotaNumber(pair[1]) : null;
      let limit = pair ? parseQuotaNumber(pair[2]) : null;
      if (!pair) {
        const values = [...text.matchAll(/[\d,.]+(?:\s*[KMB])?/gi)]
          .map((match) => ({
            value: parseQuotaNumber(match[0]),
            raw: match[0],
            index: match.index ?? -1,
          }))
          .filter((entry) => Number.isFinite(entry.value) &&
            !/%/.test(text.slice(entry.index, entry.index + entry.raw.length + 2)))
          .map((entry) => entry.value);
        [used, limit] = values;
      }
      const state = normalizeQuotaState({
        percentage: percent?.[1],
        used,
        limit,
        remaining: remainingMatch?.[1],
        resetAt: reset,
        updatedAt: updated,
        source: "dom",
      });
      if (state) return state;
    }
    return null;
  };

  const readQuotaState = () => {
    if (quotaBridgeState) return quotaBridgeState;
    const controlled = [
      window.__CODEX_WEEKLY_QUOTA__,
      window.__CODEX_QUOTA__,
      window.__LINZI_WEEKLY_QUOTA__,
    ];
    for (const candidate of controlled) {
      const state = normalizeQuotaState(candidate);
      if (state) return state;
    }
    return readQuotaFromCache() || readQuotaFromDom() ||
      { status: "unavailable", percentage: null };
  };

  const quotaMostUrgentWindow = (state) => quotaWindows(state)
    .slice()
    .sort((left, right) =>
      Number(left.remainingPercentage ?? left.percentage ?? 101) -
      Number(right.remainingPercentage ?? right.percentage ?? 101))[0] || state;

  const quotaLevel = (state) => {
    if (state.status !== "available") return "unavailable";
    const urgent = quotaMostUrgentWindow(state);
    const remaining = Number(urgent?.remainingPercentage ?? urgent?.percentage);
    return remaining < 20 ? "critical"
      : remaining < 40 ? "warning"
        : remaining < 70 ? "normal" : "healthy";
  };
  const quotaColor = (state) => {
    /* Quota status must inherit the active Dream Skin palette. The previous
       HSL ramp always started at orange, which made every light preset look
       like a generic warning card even when the skin was blue or green. Keep
       the semantic level on data-level/data-signal; use the theme palette for
       the actual visual accent. */
    if (state.status !== "available") {
      return "var(--codex-quota-surface-muted, var(--ds-muted, #a5afb2))";
    }
    const colorState = Array.isArray(state.windows) ? quotaMostUrgentWindow(state) : state;
    const remaining = Math.max(0, Math.min(100,
      Number(colorState?.remainingPercentage ?? colorState?.percentage) || 0));
    const accent = "rgb(var(--codex-quota-surface-accent, var(--ds-accent-rgb, 71 142 213)))";
    const accentAlt = "rgb(var(--codex-quota-surface-accent-alt, var(--ds-accent-alt-rgb, 243 164 190)))";
    if (remaining < 20) {
      return `color-mix(in srgb, ${accentAlt} 72%, ${accent} 28%)`;
    }
    if (remaining < 40) {
      return `color-mix(in srgb, ${accent} 72%, ${accentAlt} 28%)`;
    }
    return accent;
  };
  const formatQuotaNumber = (value) => Number.isFinite(value)
    ? new Intl.NumberFormat().format(Math.round(value)) : "—";
  const formatQuotaUsd = (value) => Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) : "—";

  const readQuotaRadarCache = () => {
    try {
      const cached = JSON.parse(localStorage.getItem(QUOTA_RADAR_STORAGE_KEY) || "null");
      const cachedAt = Number(cached?.cachedAt);
      const weeklyUsd = Number(cached?.weeklyUsd);
      if (!Number.isFinite(cachedAt) || Date.now() - cachedAt > QUOTA_RADAR_CACHE_MAX_AGE_MS ||
        !Number.isFinite(weeklyUsd) || weeklyUsd <= 0) return null;
      return {
        status: "cached",
        weeklyUsd,
        tiers: cached.tiers && typeof cached.tiers === "object" ? cached.tiers : { Plus: weeklyUsd },
        source: quotaText(cached.source, "Codex Radar"),
        updatedAt: quotaText(cached.updatedAt),
        checkedAt: quotaText(cached.checkedAt),
        fetchedAt: quotaText(cached.fetchedAt),
        resetRadar: cached.resetRadar && typeof cached.resetRadar === "object"
          ? { ...cached.resetRadar, freshness: "cached" } : null,
      };
    } catch {
      return null;
    }
  };

  const writeQuotaRadarCache = (state) => {
    if (!state || !Number.isFinite(Number(state.weeklyUsd)) || Number(state.weeklyUsd) <= 0) return;
    try {
      localStorage.setItem(QUOTA_RADAR_STORAGE_KEY, JSON.stringify({
        cachedAt: Date.now(),
        weeklyUsd: Number(state.weeklyUsd),
        tiers: state.tiers,
        source: state.source,
        updatedAt: state.updatedAt,
        checkedAt: state.checkedAt,
        fetchedAt: state.fetchedAt,
        resetRadar: state.resetRadar,
      }));
    } catch {}
  };

  const decodePublicTextPayload = (payload) => {
    if (typeof payload === "string") return payload;
    if (!payload || typeof payload !== "object" || typeof payload.base64 !== "string") return "";
    try {
      const binary = atob(payload.base64);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      return "";
    }
  };

  const quotaRadarTimestamp = (value) => {
    const textValue = quotaText(value);
    const match = textValue.match(/(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
    if (!match) return textValue.replace(/更新$/u, "").trim();
    const now = new Date();
    let date = new Date(now.getFullYear(), Number(match[1]) - 1, Number(match[2]),
      Number(match[3]), Number(match[4]));
    if (date.getTime() > now.getTime() + 48 * 60 * 60 * 1000) {
      date = new Date(now.getFullYear() - 1, Number(match[1]) - 1, Number(match[2]),
        Number(match[3]), Number(match[4]));
    }
    return Number.isFinite(date.getTime()) ? date.toISOString() : textValue;
  };

  const resetRadarLevel = (probability) => probability >= 75 ? "high"
    : probability >= 40 ? "medium" : "low";

  const resetRadarLevelLabel = (level) => level === "high" ? "\u9ad8"
    : level === "medium" ? "\u4e2d" : "\u4f4e";

  const formatResetRadarTime = (value) => {
    const raw = quotaText(value);
    if (!raw) return "";
    const date = new Date(raw);
    if (!Number.isFinite(date.getTime())) {
      return raw.replace(/\s+/g, " ").trim();
    }
    const pad = (number) => String(number).padStart(2, "0");
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  /* The selected reset card uses a compact, locale-stable timestamp so the
     three metadata columns line up across light/dark skins. */
  const formatResetCardTime = (value) => {
    const raw = quotaText(value);
    if (!raw) return "";
    const chinese = raw.match(/(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
    const date = chinese
      ? new Date(new Date().getFullYear(), Number(chinese[1]) - 1, Number(chinese[2]),
        Number(chinese[3]), Number(chinese[4]))
      : new Date(raw);
    if (!Number.isFinite(date.getTime())) {
      return raw.replace(/\s*重置$/u, "").replace(/\//g, "-");
    }
    const pad = (number) => String(number).padStart(2, "0");
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatResetClockTime = (value) => {
    const formatted = formatResetCardTime(value);
    return formatted.match(/(?:^|\s)(\d{2}:\d{2})$/)?.[1] || formatted;
  };

  /* A scheduled reset post may name a weekday without promising an exact
     clock time. Resolve that weekday against the post/event timestamp, but
     keep the unknown time explicit instead of inventing an hour. */
  const scheduledResetTimeText = (value, referenceValue) => {
    const text = String(value ?? "").trim().slice(0, 500000);
    if (!text) return "";
    const reference = new Date(quotaText(referenceValue));
    // Preserve the author's zone label (PST is sometimes used colloquially
    // during PDT). Do not silently interpret a Pacific clock as local time.
    const pacificClock = text.match(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\s*(PST|PDT|PT)\b/i);
    if (pacificClock && Number.isFinite(reference.getTime())) {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles", year: "numeric", month: "numeric", day: "numeric",
      }).formatToParts(reference);
      const part = (type) => Number(parts.find((entry) => entry.type === type)?.value);
      const target = new Date(Date.UTC(part("year"), part("month") - 1,
        part("day") + (/\btomorrow\b/i.test(text) ? 1 : 0)));
      const hour = Number(pacificClock[1]) % 12 + (/pm/i.test(pacificClock[3]) ? 12 : 0);
      return `${target.getUTCMonth() + 1}/${target.getUTCDate()} ${String(hour).padStart(2, "0")}:${pacificClock[2] || "00"} ${pacificClock[4].toUpperCase()}（原文时间${/\b(?:around|about)\b/i.test(text) ? "，约" : ""}）`;
    }
    const relativeHours = text.match(/\b(?:in|within)\s+(?:the\s+)?next\s+(?:(\d+(?:\.\d+)?)\s+)?hours?(?:\s+or\s+so)?\b/i);
    if (relativeHours && Number.isFinite(reference.getTime())) {
      const hours = Math.max(.25, Math.min(24, Number(relativeHours[1] || 1)));
      const target = new Date(reference.getTime() + hours * 3_600_000);
      const pad = (number) => String(number).padStart(2, "0");
      const compactHours = Number.isInteger(hours) ? String(hours) : String(Math.round(hours * 10) / 10);
      return `${target.getMonth() + 1}/${target.getDate()} ${pad(target.getHours())}:${pad(target.getMinutes())} \u524d\uff08\u7ea6 ${compactHours} \u5c0f\u65f6\u5185\uff09`;
    }
    const relativeDay = text.match(/\b(?:tomorrow|the\s+following\s+day)\b/i);
    if (relativeDay && Number.isFinite(reference.getTime())) {
      const target = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() + 1);
      const pad = (number) => String(number).padStart(2, "0");
      const labels = ["\u5468\u65e5", "\u5468\u4e00", "\u5468\u4e8c", "\u5468\u4e09", "\u5468\u56db", "\u5468\u4e94", "\u5468\u516d"];
      return `${pad(target.getMonth() + 1)}-${pad(target.getDate())} ${labels[target.getDay()]} \u00b7 \u65f6\u523b\u5f85\u5b9a`;
    }
    const english = text.match(/\b(?:on|by|this|next)\s+(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/i);
    const chinese = text.match(/(?:\u672c\u5468|\u4e0b\u5468)?\u5468([\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u65e5\u5929])/);
    const englishDays = Object.freeze({ mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 });
    const chineseDays = Object.freeze({
      "\u4e00": 1, "\u4e8c": 2, "\u4e09": 3, "\u56db": 4,
      "\u4e94": 5, "\u516d": 6, "\u65e5": 0, "\u5929": 0,
    });
    const weekday = english
      ? englishDays[english[1].slice(0, 3).toLowerCase()]
      : chinese ? chineseDays[chinese[1]] : null;
    if (!Number.isInteger(weekday)) return "";
    if (!Number.isFinite(reference.getTime())) return "";
    let dayOffset = (weekday - reference.getDay() + 7) % 7;
    const explicitlyNext = Boolean(english && /^next\s/i.test(english[0])) ||
      Boolean(chinese && chinese[0].startsWith("\u4e0b\u5468"));
    if (dayOffset === 0 && explicitlyNext) dayOffset = 7;
    const target = new Date(reference.getFullYear(), reference.getMonth(),
      reference.getDate() + dayOffset);
    const pad = (number) => String(number).padStart(2, "0");
    const labels = ["\u5468\u65e5", "\u5468\u4e00", "\u5468\u4e8c", "\u5468\u4e09", "\u5468\u56db", "\u5468\u4e94", "\u5468\u516d"];
    return `${pad(target.getMonth() + 1)}-${pad(target.getDate())} ${labels[target.getDay()]} \u00b7 \u65f6\u523b\u5f85\u5b9a`;
  };

  /* The selected quota ring uses the compact timestamp from the reference
     card. Keep the source's timezone and accept both ISO values and the
     bridge's short local clock value. */
  const formatQuotaRingTime = (value) => {
    const raw = quotaText(value);
    if (!raw) return "";
    let date = new Date(raw);
    if (!Number.isFinite(date.getTime())) {
      const monthDay = raw.match(/(?:^|\s)(\d{1,2})[\/-](\d{1,2})(?:\s|T)(\d{1,2}):(\d{2})/);
      const clock = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      const now = new Date();
      if (monthDay) {
        date = new Date(now.getFullYear(), Number(monthDay[1]) - 1, Number(monthDay[2]),
          Number(monthDay[3]), Number(monthDay[4]));
      } else if (clock) {
        date = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
          Number(clock[1]), Number(clock[2]));
      }
    }
    if (!Number.isFinite(date.getTime())) return raw.replace(/\s+/g, " ").trim();
    return `${date.getMonth() + 1}/${date.getDate()} ` +
      `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const quotaRingRealtimeParts = (state) => {
    const radar = quotaRadarSnapshot();
    const radarTime = quotaText(radar?.fetchedAt || radar?.checkedAt);
    const sourceTime = radarTime || quotaText(state?.checkedAt) || quotaText(state?.updatedAt);
    const status = radar?.status === "live" || state?.freshness === "live" ? "实时"
      : String(radar?.status || state?.freshness || "").includes("cached") ? "缓存"
        : radar ? "本地兜底" : "等待同步";
    return {
      status,
      time: formatQuotaRingTime(sourceTime),
    };
  };

  const parseResetRadarSnapshot = (documentNode, sourceText = "") => {
    const judgement = documentNode.querySelector("section.reset-judgement");
    const tibo = documentNode.querySelector("[data-tibo-posts-updated-at][data-tibo-posts-fingerprint]") ||
      judgement;
    if (!judgement && !tibo) return null;

    const eventKind = quotaText(judgement?.getAttribute("data-reset-radar-event-kind"));
    const eventStatus = quotaText(judgement?.getAttribute("data-reset-radar-event-status"));
    const confirmation = quotaText(judgement?.getAttribute("data-reset-radar-confirmation"));
    const eventUpdatedAt = quotaText(judgement?.getAttribute("data-reset-radar-updated-at"));
    const tiboUpdatedAt = quotaText(tibo?.getAttribute("data-tibo-posts-updated-at"));
    const fingerprint = quotaText(tibo?.getAttribute("data-tibo-posts-fingerprint"));
    const posts = [...documentNode.querySelectorAll("[data-tibo-post-id][data-reset-relevance]")]
      .slice(0, 8)
      .map((node) => ({
        id: quotaText(node.getAttribute("data-tibo-post-id")),
        relevance: quotaText(node.getAttribute("data-reset-relevance")).toLowerCase(),
      }))
      .filter((post) => post.id && post.relevance);

    const relevanceScores = Object.freeze({
      none: 8,
      indirect: 18,
      related: 34,
      possible: 42,
      likely: 58,
      direct: 72,
      official: 92,
      confirmed: 96,
    });
    const strongestPost = posts.reduce((best, post) => {
      const score = relevanceScores[post.relevance] ?? 12;
      return score > best.score ? { ...post, score } : best;
    }, { id: "", relevance: "none", score: 8 });
    const latestPost = posts[0] || null;
    const latestRelevance = quotaText(latestPost?.relevance, "none").toLowerCase();

    const terminalEvent = /(?:completed|closed|window_closed|expired|cancelled)/i.test(
      `${eventKind} ${eventStatus}`,
    );
    const activeOfficialEvent = confirmation === "official" && !terminalEvent &&
      (/(?:announced|scheduled|pending|active|open|confirmed|in_progress)/i.test(eventStatus) ||
        /(?:announced|scheduled|upcoming|window_opened|signal)/i.test(eventKind));
    /* A later unrelated post must not erase an already active structured
       event. The event lifecycle is authoritative until it becomes terminal. */
    const hasResetSignal = activeOfficialEvent ||
      /^(?:direct|official|likely)$/.test(strongestPost.relevance);
    const nextResetTime = activeOfficialEvent
      ? scheduledResetTimeText(`${judgement?.textContent || ""} ${documentNode.body?.textContent || ""} ${sourceText}`,
        eventUpdatedAt || tiboUpdatedAt)
      : "";
    let probability = Math.max(activeOfficialEvent ? 92 : terminalEvent ? 8 : 10,
      strongestPost.score);

    const sourceTime = Date.parse(tiboUpdatedAt || eventUpdatedAt);
    const ageHours = Number.isFinite(sourceTime) ? Math.max(0, (Date.now() - sourceTime) / 3_600_000) : null;
    if (!activeOfficialEvent && Number.isFinite(ageHours) && ageHours > 168) {
      probability = Math.max(6, Math.round(probability * .45));
    } else if (!activeOfficialEvent && Number.isFinite(ageHours) && ageHours > 72) {
      probability = Math.max(7, Math.round(probability * .65));
    }
    probability = Math.max(0, Math.min(100, Math.round(probability)));
    const level = resetRadarLevel(probability);
    const levelLabel = resetRadarLevelLabel(level);
    const reason = activeOfficialEvent
      ? "\u5b98\u65b9\u91cd\u7f6e\u4fe1\u53f7\u5df2\u8fdb\u5165\u6d3b\u52a8\u72b6\u6001"
      : strongestPost.relevance === "indirect"
        ? "Tibo \u6700\u65b0\u52a8\u6001\u4ec5\u4e3a\u95f4\u63a5\u76f8\u5173\uff0c\u672a\u5f62\u6210\u5b98\u65b9\u901a\u77e5"
        : strongestPost.score >= 58
          ? "Tibo \u52a8\u6001\u51fa\u73b0\u8f83\u5f3a\u91cd\u7f6e\u4fe1\u53f7\uff0c\u4ecd\u9700\u5b98\u65b9\u786e\u8ba4"
          : terminalEvent
            ? "\u4e0a\u4e00\u8f6e\u91cd\u7f6e\u5df2\u5b8c\u6210\uff0c\u76ee\u524d\u65e0\u65b0\u7684\u76f4\u63a5\u4fe1\u53f7"
            : "Tibo \u6700\u65b0\u52a8\u6001\u672a\u663e\u793a\u660e\u786e\u91cd\u7f6e\u4fe1\u53f7";

    return {
      probability,
      level,
      levelLabel,
      reason,
      lastResetAt: terminalEvent ? eventUpdatedAt : "",
      nextProbability: probability,
      nextLevel: level,
      nextLevelLabel: levelLabel,
      nextReason: reason,
      nextResetTime,
      nextEventAt: activeOfficialEvent ? eventUpdatedAt : "",
      nextConfirmation: activeOfficialEvent ? confirmation : "",
      source: "Codex Radar · Tibo",
      eventKind,
      eventStatus,
      confirmation,
      eventUpdatedAt,
      tiboUpdatedAt,
      latestRelevance,
      hasResetSignal,
      fingerprint,
      strongestRelevance: strongestPost.relevance,
      postIds: posts.map((post) => post.id),
      checkedAt: new Date().toISOString(),
      freshness: Number.isFinite(ageHours) && ageHours > 72 ? "stale" : "live",
    };
  };

  const parseQuotaRadarPayload = (payload) => {
    const html = decodePublicTextPayload(payload);
    if (!html || typeof DOMParser !== "function") return null;
    const documentNode = new DOMParser().parseFromString(html, "text/html");
    const section = documentNode.querySelector("section.quota-radar");
    if (!section) return null;
    const tiers = {};
    for (const row of section.querySelectorAll(".quota-radar-row:not(.quota-radar-row-head)")) {
      const label = quotaText(row.querySelector("strong")?.textContent);
      const usd = Number(String(row.querySelector("span")?.textContent || "")
        .replace(/[^\d.]/g, ""));
      if (label && Number.isFinite(usd) && usd > 0 && usd <= 100000) tiers[label] = usd;
    }
    const weeklyUsd = Number(tiers.Plus);
    if (!Number.isFinite(weeklyUsd) || weeklyUsd <= 0) return null;
    const updatedLabel = quotaText(section.querySelector(".quota-radar-head h2 span")?.textContent);
    return {
      status: "live",
      weeklyUsd,
      tiers,
      source: "Codex Radar",
      updatedAt: quotaRadarTimestamp(updatedLabel),
      checkedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      resetRadar: parseResetRadarSnapshot(documentNode, html),
    };
  };

  /* The radar cache can be refreshed by a later request while the in-memory
     snapshot still points at the state captured during startup. Keep the
     latest reset sub-state visible even when the quota tiers themselves did
     not change; otherwise a fresh official next-round signal is silently
     replaced by the old post-reset fallback. */
  const quotaRadarSnapshot = () => {
    const memory = quotaRadarState;
    const cached = readQuotaRadarCache();
    if (!memory) return cached;
    if (!cached) return memory;
    const resetTimestampOf = (state) => {
      for (const value of [
        state?.eventUpdatedAt,
        state?.nextEventAt,
        state?.tiboUpdatedAt,
        state?.checkedAt,
      ]) {
        const timestamp = Date.parse(quotaText(value));
        if (Number.isFinite(timestamp)) return timestamp;
      }
      return Number.NEGATIVE_INFINITY;
    };
    const memoryReset = memory.resetRadar;
    const cachedReset = cached.resetRadar;
    if (cachedReset && (!memoryReset || resetTimestampOf(cachedReset) >= resetTimestampOf(memoryReset))) {
      return { ...memory, ...cached, resetRadar: cachedReset };
    }
    return memory;
  };

  const quotaRadarTierUsd = (radar, state) => {
    const configuredTier = quotaText(QUOTA_CONFIG.radar?.tier);
    const planType = String(state?.planType || "").toLowerCase();
    const tier = configuredTier || (planType === "pro" ? "20x Pro"
      : /(?:business|team)/i.test(planType) ? "5x Pro" : "Plus");
    const tierUsd = Number(radar?.tiers?.[tier]);
    return Number.isFinite(tierUsd) && tierUsd > 0 ? { tier, weeklyUsd: tierUsd }
      : { tier: "Plus", weeklyUsd: Number(radar?.weeklyUsd) };
  };

  const quotaRadarEstimate = (state) => {
    const radar = quotaRadarSnapshot();
    const tierEstimate = quotaRadarTierUsd(radar, state);
    const weeklyUsd = tierEstimate.weeklyUsd;
    const remainingPercentage = Number(state?.remainingPercentage ?? state?.percentage);
    const windowMinutes = Number(state?.windowMinutes);
    const isWeekly = Number.isFinite(windowMinutes)
      ? windowMinutes >= 6 * 24 * 60 && windowMinutes <= 8 * 24 * 60
      : /(?:week|7\s*(?:day|d)|本周|周额度)/i.test(String(state?.windowLabel || ""));
    if (state?.status !== "available" || !isWeekly || !Number.isFinite(weeklyUsd) || weeklyUsd <= 0 ||
      !Number.isFinite(remainingPercentage)) return null;
    return {
      weeklyUsd,
      remainingUsd: weeklyUsd * Math.max(0, Math.min(100, remainingPercentage)) / 100,
      tier: tierEstimate.tier,
      status: radar.status,
      source: quotaText(radar.source, "Codex Radar"),
      updatedAt: quotaText(radar.updatedAt),
      checkedAt: quotaText(radar.checkedAt),
      fetchedAt: quotaText(radar.fetchedAt),
    };
  };

  /* The provider exposes a percentage for the five-hour window but the
     public dollar reference is weekly. Use that weekly total as a clearly
     labelled equivalent for the composer card; it is not a native five-hour
     dollar limit. */
  const quotaWeeklyEquivalentEstimate = (state) => {
    const weeklyEstimate = quotaRadarEstimate(state);
    if (weeklyEstimate) return { ...weeklyEstimate, basis: "weekly" };
    const radar = quotaRadarSnapshot();
    const tierEstimate = quotaRadarTierUsd(radar, state);
    const weeklyUsd = tierEstimate.weeklyUsd;
    const remainingPercentage = Number(state?.remainingPercentage ?? state?.percentage);
    const windowMinutes = Number(state?.windowMinutes);
    const weeklyWindowMinutes = 7 * 24 * 60;
    const equivalentWindowMinutes = Number.isFinite(windowMinutes) && windowMinutes > 0
      ? windowMinutes : 5 * 60;
    if (state?.status !== "available" || !Number.isFinite(weeklyUsd) || weeklyUsd <= 0 ||
      !Number.isFinite(remainingPercentage)) return null;
    return {
      weeklyUsd,
      remainingUsd: weeklyUsd * (equivalentWindowMinutes / weeklyWindowMinutes) *
        Math.max(0, Math.min(100, remainingPercentage)) / 100,
      tier: tierEstimate.tier,
      status: radar.status,
      source: quotaText(radar.source, "Codex Radar"),
      updatedAt: quotaText(radar.updatedAt),
      checkedAt: quotaText(radar.checkedAt),
      fetchedAt: quotaText(radar.fetchedAt),
      windowMinutes: equivalentWindowMinutes,
      weeklyWindowMinutes,
      basis: "weekly-equivalent",
    };
  };

  const classifyTiboXPost = (post) => {
    const text = String(post?.text || "");
    const context = /(?:codex|chatgpt|\busage\b|rate\s+limits?|quota|paid\s+subscriptions?)/i.test(text);
    const resetMention = /\bresets?(?:ting)?\b/i.test(text);
    const bankedReset = /\bbanked\s+resets?\b/i.test(text);
    const planningIntent = /\bwhat\s+(?:should|could)\s+(?:we|i)\s+(?:ship|release|launch|build|announce)\b[\s\S]{0,56}\bnext\s+week\b/i.test(text) ||
      /\b(?:ship|release|launch|build|announce)\b[\s\S]{0,40}\bnext\s+week\b/i.test(text) ||
      /\bnext\s+week\b[\s\S]{0,40}\b(?:ship|release|launch|build|announce)\b/i.test(text);
    const feedbackIntent = context && (
      /\b(?:haven['’]?t|have\s+not)\s+(?:tried|used|started|adopted)\b[\s\S]{0,180}\b(?:considered|thought\s+about|wanted\s+to)\b[\s\S]{0,140}\b(?:holding|stopping|keeping|blocking)\b/i.test(text) ||
      /\b(?:what|which|why)\b[\s\S]{0,100}\b(?:holding|stopping|keeping|blocking|barrier|blocker|friction|obstacle)\b[\s\S]{0,100}\b(?:you|users?|people)\b/i.test(text) ||
      /\b(?:what|which|why)\b[\s\S]{0,100}\b(?:barrier|blocker|friction|obstacle)\b[\s\S]{0,100}\b(?:try|use|adopt|start)\b/i.test(text) ||
      (/\b(?:feedback|survey|research)\b/i.test(text) &&
        /\b(?:codex|chatgpt)\b/i.test(text))
    );
    const announcementIntent = context && !feedbackIntent && (
      /\b(?:now\s+available|available\s+now|is\s+live|launched?|released?|rolling\s+out|introducing|support(?:s|ed)?|shipped?)\b/i.test(text) ||
      /\bnew\s+(?:feature|model|version|release|desktop|integration)\b/i.test(text)
    );
    /* Completion messages are often terse replies such as "the reset is
       done". They become trustworthy only after the reply/thread context
       supplies the Codex or quota subject; a bare "done" never qualifies. */
    const completedResetWording = /(?:(?:i|we)(?:(?:\s+(?:have|has)|['’]ve)\s+(?:(?:now|just|already)\s+)?reset|\s+(?:now|just|already)\s+reset)|(?:usage|quota|(?:usage\s+|rate\s+)?limits?|paid\s+subscriptions?)\s+(?:have|has|were|was|are|is)\s+(?:(?:now|just|already)\s+)?(?:been\s+)?reset|(?:the\s+)?reset\s+(?:is|has|was)?\s*(?:(?:now|just|already)\s+)?(?:done|complete(?:d)?|finished|live|landed)|(?:reset|limits?)\s+(?:has|have|is|are|was|were)\s+(?:been\s+)?(?:completed|finished|done|reset)|(?:just|already)\s+(?:completed|finished)\s+(?:the\s+)?reset)/i;
    /* The official account also uses a deliberately short global form:
       "All reset for everyone." It omits Codex/usage nouns, so requiring the
       usual context gate would leave the previous forecast (for example 88%)
       visible after the actual global reset has landed. Keep this narrow to
       the explicit all/everyone wording rather than treating every bare
       "reset" as confirmation. */
    const globalResetConfirmation = /\ball\s+reset\s+for\s+everyone\b/i.test(text) ||
      /\beveryone(?:['’]s)?\s+(?:codex\s+|chatgpt\s+|usage\s+|quota\s+|rate\s+limits?\s+)?(?:has|have|was|were|is|are)?\s*(?:been\s+)?reset\b/i.test(text);
    const confirmedReset = !bankedReset && (
      globalResetConfirmation || (context && resetMention && completedResetWording.test(text))
    );
    /* A short follow-up can omit "Codex" while still carrying an explicit
       reset promise. A measured milestone plus reset language and a concrete
       near-term delivery window is an authoritative signal on Tibo's feed. */
    const milestoneReset = /\b(?:crossed|crossing|passed|past|reached|hit|blew\s+past)\b[\s\S]{0,56}\b\d+(?:\.\d+)?\s*[mk]\b/i.test(text) &&
      /\bresets?\b/i.test(text);
    const imminentReset = /\b(?:landing|coming|happening|arriving|rolling\s+out)\b[\s\S]{0,64}(?:\b(?:in|within)\s+(?:the\s+)?next\s+(?:\d+(?:\.\d+)?\s+)?hours?\b|\bsoon\b|\btoday\b|\btomorrow\b)/i.test(text);
    /* This is Tibo's shorthand teaser for the next quota round: the
       dashboard milestone is expected tomorrow and the Codex reference is
       explicit, even though the word "reset" is omitted from the post. Keep
       it as a strong inferred signal rather than claiming official
       confirmation. */
    const dashboardMilestoneReset = /\bdashboard\b[\s\S]{0,72}\b(?:hit|reach|reached|cross|crossed)\b[\s\S]{0,48}\b(?:a\s+)?new\s+milestone\b[\s\S]{0,72}\b(?:today|tomorrow|soon)\b[\s\S]{0,64}\b(?:hold\s+on\s+to|hang\s+on\s+to|keep)\s+(?:your\s+)?codex\b/i.test(text);
    const relativeScheduledReset = /\b(?:in|within)\s+(?:the\s+)?next\s+(?:\d+(?:\.\d+)?\s+)?hours?(?:\s+or\s+so)?\b/i.test(text) &&
      /\bresets?\b/i.test(text);
    /* Tibo sometimes makes the next-reset promise in a short reply without
       repeating "Codex" or "quota". For example: "I'll do another
       performative reset on Monday". Recurrence plus a concrete weekday/date
       is the missing context, not an unrelated use of reset. */
    const scheduledReset = relativeScheduledReset ||
      /\b(?:another|one\s+more|next|additional|again)\s+(?:performative\s+)?reset\b[\s\S]{0,64}\b(?:on|by|this|next)\s+(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?|the\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}[/-]\d{1,2})\b/i.test(text) ||
      /\b(?:on|by|this|next)\s+(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b[\s\S]{0,64}\b(?:another|one\s+more|next|additional|again)\s+(?:performative\s+)?reset\b/i.test(text);
    const officialMilestoneReset = milestoneReset && imminentReset;
    const promisedReset = /\b(?:will|going\s+to|about\s+to|plan(?:ning)?\s+to)\s+(?:(?:do|perform|carry\s+out)\s+(?:a\s+|another\s+|the\s+)?(?:global\s+|full\s+)?|be\s+)?reset\b/i.test(text) ||
      /\breset\s+(?:will\s+)?(?:land|arrive|happen|roll\s+out)\b/i.test(text) ||
      /\bresetting\s+(?:the\s+)?(?:usage\s+)?limits?\b/i.test(text);
    const directReset = !bankedReset && (officialMilestoneReset ||
      (context && promisedReset) || scheduledReset);
    const directScheduledReset = directReset && /(?:\b(?:in|within)\s+(?:the\s+)?next\s+(?:\d+(?:\.\d+)?\s+)?hours?\b|\b(?:today|tomorrow|the\s+following\s+day)\b|\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*(?:PST|PDT|PT)\b|\b(?:on|by|this|next)\s+(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?|\d{1,2}[/-]\d{1,2})\b)/i.test(text);
    const indirectReset = resetMention;
    const ageHours = Math.max(0, (Date.now() - Date.parse(post.createdAt)) / 3_600_000);
    let relevance = "none";
    let probability = 8;
    let outcome = "probability";
    const intentReason = feedbackIntent
      ? "Tibo 正在收集未使用 Codex 的阻碍与反馈，属于用户调研，不是额度重置承诺"
      : planningIntent
        ? "Tibo 正在询问下周产品发布内容，未给出额度重置承诺"
        : announcementIntent
          ? "Tibo 正在发布产品或平台更新，未给出额度重置承诺"
          : "Tibo 最新帖子未出现额度重置信号";
    let reason = intentReason;
    if (confirmedReset) {
      relevance = "confirmed";
      outcome = ageHours <= 48 ? "reset-confirmed" : "historical-reset";
      probability = ageHours <= 48 ? 100 : ageHours <= 96 ? 62 : 18;
      reason = "Tibo \u76f4\u63a5\u786e\u8ba4\u5df2\u91cd\u7f6e Codex \u4e0e ChatGPT Work \u7528\u91cf\u989d\u5ea6";
    } else if (officialMilestoneReset && !bankedReset) {
      relevance = "official";
      probability = ageHours <= 6 ? 96 : ageHours <= 24 ? 88 : ageHours <= 48 ? 72 : 30;
      reason = "Tibo \u660e\u786e\u8868\u793a\u7528\u6237\u91cc\u7a0b\u7891\u5df2\u7a81\u7834\uff0c\u4e14\u65b0\u4e00\u8f6e reset \u5373\u5c06\u843d\u5730";
    } else if (directReset) {
      relevance = "direct";
      probability = scheduledReset ? (ageHours <= 72 ? 92 : 48)
        : ageHours <= 24 ? 88 : ageHours <= 72 ? 48 : 14;
      reason = scheduledReset
        ? "Tibo \u76f4\u63a5\u9884\u544a\u4e0b\u4e00\u6b21\u91cd\u7f6e\u5e76\u7ed9\u51fa\u65e5\u671f"
        : "Tibo \u5e16\u5b50\u51fa\u73b0\u76f4\u63a5\u7684\u989d\u5ea6\u91cd\u7f6e\u884c\u52a8\u4fe1\u53f7";
    } else if (dashboardMilestoneReset) {
      relevance = "likely";
      probability = ageHours <= 24 ? 84 : ageHours <= 72 ? 68 : 26;
      reason = "Tibo \u901a\u8fc7 dashboard \u91cc\u7a0b\u7891\u548c\u660e\u65e5 Codex \u9884\u544a\u91ca\u653e\u4e86\u5f3a\u63a8\u65ad\u7684\u4e0b\u4e00\u8f6e\u91cd\u7f6e\u4fe1\u53f7";
    } else if (indirectReset) {
      relevance = "indirect";
      probability = ageHours <= 72 ? 18 : 8;
      reason = "Tibo \u5e16\u5b50\u63d0\u5230 reset\uff0c\u4f46\u6ca1\u6709\u989d\u5ea6\u5bf9\u8c61\u3001\u65f6\u95f4\u6216\u884c\u52a8\u6307\u4ee4";
    }
    const nextResetTime = (scheduledReset || dashboardMilestoneReset || directScheduledReset)
      ? scheduledResetTimeText(text, post.createdAt)
      : "";
    const intent = relevance === "none"
      ? feedbackIntent ? "feedback"
        : planningIntent ? "planning"
          : announcementIntent ? "announcement" : "general"
      : context && resetMention ? "reset" : "general";
    const intentConfidence = intent === "feedback" ? 88
      : intent === "planning" ? 84
        : intent === "announcement" ? 76
          : intent === "reset" ? 78 : 32;
    return {
      ...post,
      relevance,
      probability,
      outcome,
      reason,
      intent,
      intentConfidence,
      intentReason,
      ageHours,
      nextResetTime,
    };
  };

  const TIBO_RELEVANCE_RANK = Object.freeze({
    none: 0,
    indirect: 1,
    likely: 2,
    direct: 3,
    official: 4,
    confirmed: 5,
  });

  const tiboRelevanceRank = (post) => TIBO_RELEVANCE_RANK[post?.relevance] || 0;
  const tiboPostTimestamp = (post) => {
    const timestamp = Date.parse(quotaText(post?.createdAt));
    return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
  };

  /* A reset announcement is frequently split between a root post and short
     replies. Re-run the classifier with only that thread's local context;
     unrelated timeline neighbours are intentionally excluded to avoid
     manufacturing a signal from two independent posts. */
  const enrichTiboTimelinePosts = (posts) => {
    const byId = new Map(posts.map((post) => [post.id, post]));
    const rootIdFor = (post) => {
      const seen = new Set();
      let cursor = post;
      while (cursor?.replyToId && byId.has(cursor.replyToId) && !seen.has(cursor.id)) {
        seen.add(cursor.id);
        cursor = byId.get(cursor.replyToId);
      }
      return cursor?.id || post.id;
    };
    return posts.map((post) => {
      const related = [];
      const parent = post.replyToId ? byId.get(post.replyToId) : null;
      if (parent) related.push(parent);
      for (const candidate of posts) {
        if (candidate.id === post.id) continue;
        if (candidate.replyToId === post.id ||
          (post.replyToId && candidate.replyToId === post.replyToId)) related.push(candidate);
      }
      const support = [...new Map(related.map((candidate) => [candidate.id, candidate])).values()]
        .sort((left, right) => Math.abs(tiboPostTimestamp(left) - tiboPostTimestamp(post)) -
          Math.abs(tiboPostTimestamp(right) - tiboPostTimestamp(post)))
        .slice(0, 4);
      const contextPostIds = [post.id, ...support.map((candidate) => candidate.id)];
      const timelineGroupId = rootIdFor(post);
      if (!support.length) return { ...post, timelineGroupId, contextPostIds };

      const contextual = classifyTiboXPost({
        ...post,
        text: [post, ...support].map((candidate) => candidate.text).join("\n"),
      });
      if (tiboRelevanceRank(contextual) <= tiboRelevanceRank(post)) {
        return { ...post, timelineGroupId, contextPostIds };
      }
      return {
        ...post,
        relevance: contextual.relevance,
        probability: contextual.probability,
        outcome: contextual.outcome,
        intent: contextual.intent,
        intentConfidence: contextual.intentConfidence,
        intentReason: contextual.intentReason,
        ageHours: contextual.ageHours,
        nextResetTime: contextual.nextResetTime,
        reason: `${contextual.reason}（结合同一对话 ${contextPostIds.length} 条动态）`,
        timelineGroupId,
        contextPostIds,
      };
    });
  };

  const summarizeTiboTimelineEvidence = (posts) => {
    const latestTimestamp = tiboPostTimestamp(posts[0]);
    const recentPosts = posts.slice(0, TIBO_X_EVIDENCE_POST_LIMIT).filter((post) => {
      const timestamp = tiboPostTimestamp(post);
      return !Number.isFinite(latestTimestamp) || !Number.isFinite(timestamp) ||
        latestTimestamp - timestamp <= TIBO_X_EVIDENCE_WINDOW_MS;
    });
    const grouped = new Map();
    for (const post of recentPosts) {
      const key = quotaText(post.timelineGroupId, post.id);
      const current = grouped.get(key);
      if (!current || tiboRelevanceRank(post) > tiboRelevanceRank(current) ||
        (tiboRelevanceRank(post) === tiboRelevanceRank(current) &&
          (Number(post.probability) > Number(current.probability) ||
            tiboPostTimestamp(post) > tiboPostTimestamp(current)))) {
        grouped.set(key, post);
      }
    }
    const groupedPosts = [...grouped.values()];
    const latestReset = posts.find((post) => post.relevance === "confirmed") || null;
    const strongSignals = groupedPosts.filter((post) =>
      /^(?:direct|official|likely)$/.test(post.relevance));
    return {
      posts: recentPosts,
      groupedPosts,
      latestReset,
      scannedPostCount: recentPosts.length,
      availablePostCount: posts.length,
      relevantPostCount: groupedPosts.filter((post) => tiboRelevanceRank(post) > 0).length,
      confirmedPostCount: groupedPosts.filter((post) => post.relevance === "confirmed").length,
      strongSignalCount: strongSignals.length,
      planningPostCount: groupedPosts.filter((post) => post.intent === "planning").length,
      feedbackPostCount: groupedPosts.filter((post) => post.intent === "feedback").length,
      announcementPostCount: groupedPosts.filter((post) => post.intent === "announcement").length,
      contextualGroupCount: groupedPosts.filter((post) => post.contextPostIds?.length > 1).length,
      windowStartedAt: recentPosts.at(-1)?.createdAt || "",
    };
  };

  const summarizeTiboPostZh = (post) => {
    if (!post) return "等待 Tibo 最新动态";
    const text = String(post.text || "");
    if (post.relevance === "confirmed") {
      return "Tibo 表示已完成 Codex 与 ChatGPT Work 使用额度重置。";
    }
    if (post.relevance === "official" && post.nextResetTime) {
      return `\u5f3a\u4fe1\u53f7\uff1aTibo \u8868\u793a\u91cc\u7a0b\u7891\u5df2\u7a81\u7834\uff0creset \u9884\u8ba1\u5728 ${post.nextResetTime} \u843d\u5730\u3002`;
    }
    if (post.relevance === "official") {
      return "\u5f3a\u4fe1\u53f7\uff1aTibo \u660e\u786e\u8868\u793a\u65b0\u4e00\u8f6e reset \u5373\u5c06\u843d\u5730\u3002";
    }
    if (post.relevance === "direct" && post.nextResetTime) {
      return `Tibo 预告将在 ${post.nextResetTime} 进行下一轮额度重置。`;
    }
    if (post.relevance === "direct") return "Tibo 表示将进行新一轮额度重置。";
    if (post.relevance === "likely" && post.nextResetTime) {
      return `Tibo 通过 dashboard 里程碑预告下一轮额度重置，时间指向 ${post.nextResetTime}。`;
    }
    if (post.relevance === "likely") {
      return "Tibo 通过 dashboard 里程碑和 Codex 预告释放了强推断的下一轮重置信号。";
    }
    if (post.relevance === "indirect") return "动态提到了 reset，但没有给出明确的额度对象或时间。";
    if (post.intent === "feedback") {
      if (/\b(?:haven['’]?t|have\s+not)\s+(?:tried|used|started|adopted)\b[\s\S]{0,180}\b(?:considered|thought\s+about|wanted\s+to)\b/i.test(text)) {
        return "用户调研/反馈征集（明确）：Tibo 在询问考虑过但尚未使用 Codex 的主要阻碍；原文未提额度、用量或 reset。";
      }
      return "用户调研/反馈征集（明确）：Tibo 在收集 Codex 使用阻碍；原文未提额度、用量或 reset。";
    }
    if (post.intent === "planning" ||
      /\bwhat\s+(?:should|could)\s+(?:we|i)\s+(?:ship|release|launch|build|announce)\b[\s\S]{0,56}\bnext\s+week\b/i.test(text) ||
      /\b(?:ship|release|launch|build|announce)\b[\s\S]{0,40}\bnext\s+week\b/i.test(text)) {
      return "下周产品发布意向（弱）：Tibo 在征集“下周要发布什么”的建议；未提及额度、用量或 reset。";
    }
    if (post.intent === "announcement") {
      return "产品/平台公告：Tibo 在发布功能或平台更新；原文未提额度、用量或 reset。";
    }
    if (/what\s+is\s+an\s+obvious\s+thing[\s\S]{0,220}(?:codex|api|models?)[\s\S]{0,220}(?:within\s+reach|missing)/i.test(text)) {
      return "Tibo 在征集建议：Codex、API 或模型有哪些明明在能力范围内、却还没实现的事情？";
    }
    if (/(?:codex[\s\S]{0,80}chatgpt|chatgpt[\s\S]{0,80}codex)[\s\S]{0,100}\blinux\b/i.test(text)) {
      return "Tibo 表示 Codex 与 ChatGPT 桌面端现已支持 Linux。";
    }
    if (/\b(?:linux|macos|windows)\b/i.test(text) && /(?:desktop|桌面端)/i.test(text)) {
      return "Tibo 发布了 Codex 与 ChatGPT 桌面端的平台动态，未涉及额度重置。";
    }
    return "最新动态未给出明确的额度重置信号。";
  };

  const translateTiboPostZh = (post) => {
    const text = String(post?.text || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    const translations = [
      [
        /\ball\s+reset\s+for\s+everyone\b/i,
        "所有人的额度都已重置。和 Astra 一起享受这一周吧。",
      ],
      [
        /\beveryone['’]s\s+(?:usage\s+)?(?:limits?|quotas?)\s+(?:have\s+)?(?:been\s+)?reset\b/i,
        "所有人的用量额度都已重置。",
      ],
      [
        /\bsee\s+you\s+at\s+the\s+astra\s+party\b[\s\S]*\bexcited\s+to\s+meet\s+some\s+of\s+you\b/i,
        "期待在 Astra 聚会上见到你们中的一些人。",
      ],
      [
        /\bthanks\s+for\s+reading\b[\s\S]*\bglobal\s+reset\b[\s\S]*\ball\s+paid\s+subscriptions\b[\s\S]*\blands?\s+around\s+6\s*pm\s+(?:p(?:acific|t)|pst|pdt)\b/i,
        "谢谢大家阅读。我们会为所有付费订阅用户执行一次全局用量重置，这样大家在用额度做完有趣的 Blender 3D 建模后，还能继续享受 Astra。预计今天太平洋时间下午 6 点左右落地。",
      ],
      [
        /\bi\s+think\s+i\s+can\s+officially\s+say\s*:\s*we\s+are\s+so\s+back\b/i,
        "我想现在可以正式宣布：我们彻底回来了。",
      ],
      [
        /\bwe\s+are\s+so\s+back\b/i,
        "我们彻底回来了。",
      ],
      [
        /\bnever\s+gonna\s+give\s+you\s+up\b[\s\S]*\bnever\s+gonna\s+let\s+you\s+down\b/i,
        "永远不会放弃你，也永远不会让你失望……",
      ],
    ];
    return translations.find(([pattern]) => pattern.test(text))?.[1] || "";
  };

  const understandTiboPostZh = (post) => {
    const text = String(post?.text || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    if (post.relevance === "confirmed" || /\ball\s+reset\s+for\s+everyone\b/i.test(text)) {
      return "这是官方全局重置已落地的确认；“everyone”表示所有符合条件的用户，不是下一轮概率。";
    }
    if (/\bsee\s+you\s+at\s+the\s+astra\s+party\b/i.test(text)) {
      return "这是 Astra 活动/见面预告，语气积极，但没有提到额度、用量或 reset，因此不构成新的重置信号。";
    }
    if (post.relevance === "official" || post.relevance === "direct" || post.relevance === "likely") {
      return post.nextResetTime
        ? `这是额度重置预告，时间指向 ${post.nextResetTime}；目前仍属于预告，不等于已经落地。`
        : "这是明确的额度重置预告，仍需等待落地确认。";
    }
    if (post.intent === "feedback") return "这是用户调研/反馈征集，不是额度重置通知。";
    if (post.intent === "planning") return "这是下周产品规划意向，不代表额度会在下周重置。";
    if (post.intent === "announcement") return "这是产品或平台更新公告，当前没有额度重置含义。";
    if (/\bwe\s+are\s+so\s+back\b/i.test(text)) {
      return "这是恢复/进展类表达，语气表示状态回来了，但原文没有给出额度或 reset 的具体信息。";
    }
    if (post.relevance === "indirect") return "动态提到了 reset，但没有给出明确的额度对象或时间。";
    if (post.relevance === "none") return "这条动态目前没有提供明确的额度重置信号。";
    return summarizeTiboPostZh(post);
  };

  /* X embeds reply metadata on the Tweet record, while the text/timestamp
     live on its separate details record. Keep the two records aligned so the
     UI can tell a standalone post from a reply without guessing from text. */
  const tiboPostRelation = (html, encodedId, detailsIndex) => {
    const tweetKey = `"${encodedId}":$R`;
    const tweetStart = html.lastIndexOf(tweetKey, detailsIndex);
    if (tweetStart < 0) return { isReply: false, postKind: "post", replyToId: "" };
    const tweetEnd = html.indexOf(`,id:"${encodedId}"`, tweetStart);
    const record = html.slice(tweetStart, tweetEnd > tweetStart ? tweetEnd : detailsIndex);
    const reply = record.match(/reply_to_results:(?:\$R\[\d+\]=)?\{__ref:"TweetResults:(\d+)"\}/);
    return {
      isReply: Boolean(reply),
      postKind: reply ? "reply" : "post",
      replyToId: reply?.[1] || "",
    };
  };

  const parseTiboXPayload = (payload) => {
    const html = decodePublicTextPayload(payload);
    if (!html || !/@thsottiaux/i.test(html) || !/full_text/.test(html)) return null;
    // X stores long posts in NoteTweet records. Follow only this tweet's
    // references; a neighbouring post's long text must never be substituted.
    const recordById = (id) => {
      if (!id || !/^[A-Za-z0-9+/:=_-]+$/.test(id)) return "";
      const start = html.indexOf(`__id:"${id}"`);
      if (start < 0) return "";
      const end = html.indexOf('__id:"', start + 6);
      return html.slice(start, end < 0 ? html.length : end);
    };
    const longTextFor = (encodedId) => {
      const note = recordById(`client:${encodedId}:note_tweet`);
      const resultsId = note.match(/note_tweet_results:(?:\$R\[\d+\]=)?\{__ref:"([A-Za-z0-9+/=]+)"\}/)?.[1];
      const resultId = recordById(resultsId).match(/result:(?:\$R\[\d+\]=)?\{__ref:"([A-Za-z0-9+/=]+)"\}/)?.[1];
      const text = recordById(resultId).match(/\btext:("(?:\\.|[^"\\])*")/);
      try { return { text: text ? JSON.parse(text[1]) : "", incomplete: Boolean(note && !text) }; }
      catch { return { text: "", incomplete: true }; }
    };
    const posts = [];
    const seen = new Set();
    /* Keep fields inside their own `details` record. Matching a timestamp
       from one record to `full_text` in the next one makes a busy timeline
       silently reassign reset language to the wrong post, which is exactly
       the kind of single-post judgement this radar must avoid. */
    const details = [...html.matchAll(/__id:"client:([A-Za-z0-9+/=]+):details"/g)];
    for (let index = 0; index < details.length; index += 1) {
      const match = details[index];
      const detailsStart = match.index ?? -1;
      if (detailsStart < 0) continue;
      const detailsEnd = details[index + 1]?.index ?? html.length;
      const detailsRecord = html.slice(detailsStart, detailsEnd);
      const timeMatch = detailsRecord.match(/created_at_ms:(\d+)/);
      const textMatch = detailsRecord.match(/full_text:("(?:\\.|[^"\\])*")/);
      let decodedId = "";
      let text = "";
      try { decodedId = atob(match[1]); } catch {}
      try { text = textMatch ? JSON.parse(textMatch[1]) : ""; } catch {}
      const longText = longTextFor(match[1]);
      if (longText.text) text = longText.text;
      const id = decodedId.match(/^Tweet:(\d+)$/)?.[1] || "";
      const createdAtMs = Number(timeMatch?.[1]);
      if (!id || seen.has(id) || !text || !Number.isFinite(createdAtMs)) continue;
      seen.add(id);
      const relation = tiboPostRelation(html, match[1], detailsStart);
      posts.push({
        id,
        createdAt: new Date(createdAtMs).toISOString(),
        text: String(text).trim().slice(0, 20000),
        textIncomplete: longText.incomplete || String(text).length > 20000,
        url: `https://x.com/thsottiaux/status/${id}`,
        ...relation,
      });
    }
    posts.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
    posts.splice(TIBO_X_TIMELINE_POST_LIMIT);
    if (!posts.length) return null;
    const classified = enrichTiboTimelinePosts(posts.map(classifyTiboXPost));
    const evidence = summarizeTiboTimelineEvidence(classified);
    const latestPost = classified[0];
    const latestReset = evidence.latestReset;
    const lastResetTime = latestReset ? Date.parse(latestReset.createdAt) : Number.NEGATIVE_INFINITY;
    /* Choose one key post for the detail view, but calculate its confidence
       over the complete recent evidence window. Several independent strong
       posts may corroborate an upcoming reset; replies in the same thread are
       grouped first so they cannot inflate the confidence on their own. */
    const futureSignals = evidence.groupedPosts.filter((post) =>
      post.relevance !== "confirmed" && tiboPostTimestamp(post) > lastResetTime);
    const strongFutureCandidates = futureSignals
      .filter((post) => /^(?:direct|official|likely)$/.test(post.relevance))
      .sort((left, right) => right.probability - left.probability ||
        tiboPostTimestamp(right) - tiboPostTimestamp(left));
    const strongestFuture = futureSignals
      .filter((post) => /^(?:indirect|direct|official|likely)$/.test(post.relevance))
      .sort((left, right) =>
        right.probability - left.probability || tiboPostTimestamp(right) - tiboPostTimestamp(left))[0] || null;
    const strongestFutureDisplay = strongFutureCandidates[0] || null;
    /* Newer ordinary replies do not cancel an earlier, still-current reset
       promise. Only a completed reset or an expired schedule can close it. */
    const hasResetSignal = Boolean(strongestFuture &&
      /^(?:direct|official|likely)$/.test(strongestFuture.relevance));
    const corroborationBoost = Math.min(12, Math.max(0, strongFutureCandidates.length - 1) * 6);
    const nextProbability = latestReset && !strongestFuture ? 8
      : Math.max(0, Math.min(100, Math.round((strongestFuture?.probability ?? 8) +
        (hasResetSignal ? corroborationBoost : 0))));
    const nextLevel = resetRadarLevel(nextProbability);
    const nextReason = strongestFuture
      ? `${strongestFuture.reason}${strongFutureCandidates.length > 1
        ? `（近 ${evidence.scannedPostCount} 条中有 ${strongFutureCandidates.length} 条独立强信号相互印证）`
        : `（已核对近 ${evidence.scannedPostCount} 条动态）`}`
      : latestReset
      ? "\u521a\u5b8c\u6210\u4e00\u8f6e\u91cd\u7f6e\uff0c\u6682\u65e0\u4e0b\u4e00\u8f6e\u76f4\u63a5\u4fe1\u53f7"
      : "Tibo \u6700\u65b0\u52a8\u6001\u672a\u663e\u793a\u660e\u786e\u91cd\u7f6e\u4fe1\u53f7";
    const strongest = latestReset || strongestFuture || classified[0];
    /* An ordinary newer post/reply is still useful as "latest dynamic", but
       it must not replace the actual reset announcement in the original-post
       card. */
    const displayPost = strongestFutureDisplay || latestReset || latestPost;
    const probability = Math.max(0, Math.min(100, Math.round(strongest.probability)));
    const level = resetRadarLevel(probability);
    return {
      probability,
      level,
      levelLabel: resetRadarLevelLabel(level),
      reason: strongest.reason,
      lastResetAt: latestReset?.createdAt || "",
      lastResetPostId: latestReset?.id || "",
      lastResetUrl: latestReset?.url || "",
      lastResetPostText: latestReset?.text || "",
      lastResetPostSummaryZh: latestReset ? summarizeTiboPostZh(latestReset) : "",
      lastResetPostAt: latestReset?.createdAt || "",
      lastResetPostKind: latestReset?.postKind || "",
      lastResetPostIsReply: latestReset?.isReply === true,
      lastResetPostReplyToId: latestReset?.replyToId || "",
      nextProbability,
      nextLevel,
      nextLevelLabel: resetRadarLevelLabel(nextLevel),
      nextReason,
      nextResetTime: quotaText(strongestFuture?.nextResetTime),
      nextEventAt: quotaText(strongestFuture?.createdAt),
      nextConfirmation: /^(?:direct|official)$/.test(strongestFuture?.relevance || "") ? "official" : "inferred",
      nextSignalPostId: quotaText(strongestFuture?.id),
      source: "X · @thsottiaux",
      sourceUrl: displayPost.url,
      latestPostText: latestPost.text,
      latestPostSummaryZh: summarizeTiboPostZh(latestPost),
      latestPostUrl: latestPost.url,
      latestPostAt: latestPost.createdAt,
      latestPostKind: latestPost.postKind || "",
      latestPostIsReply: latestPost.isReply === true,
      latestPostReplyToId: latestPost.replyToId || "",
      latestPostRelevance: latestPost.relevance,
      latestPostIntent: latestPost.intent || "general",
      latestPostIntentConfidence: latestPost.intentConfidence,
      latestPostIntentReason: latestPost.intentReason || latestPost.reason,
      latestPostProbability: latestPost.probability,
      latestPostReason: latestPost.reason,
      latestPostNextResetTime: latestPost.nextResetTime || "",
      displayPostText: displayPost.text,
      displayPostSummaryZh: summarizeTiboPostZh(displayPost),
      displayPostUrl: displayPost.url,
      displayPostAt: displayPost.createdAt,
      displayPostKind: displayPost.postKind || "",
      displayPostIsReply: displayPost.isReply === true,
      displayPostReplyToId: displayPost.replyToId || "",
      displayPostRelevance: displayPost.relevance,
      displayPostIntent: displayPost.intent || "general",
      displayPostIntentConfidence: displayPost.intentConfidence,
      displayPostIntentReason: displayPost.intentReason || displayPost.reason,
      displayPostProbability: displayPost.probability,
      displayPostReason: displayPost.reason,
      displayPostNextResetTime: displayPost.nextResetTime || "",
      tiboUpdatedAt: latestPost.createdAt,
      newestPostAt: posts[0].createdAt,
      latestRelevance: latestPost.relevance,
      hasResetSignal,
      incompletePostCount: posts.filter((post) => post.textIncomplete).length,
      strongestRelevance: strongest.relevance,
      outcome: strongest.outcome,
      strongestPostId: strongest.id,
      timelineEvidence: {
        scannedPostCount: evidence.scannedPostCount,
        availablePostCount: evidence.availablePostCount,
        relevantPostCount: evidence.relevantPostCount,
        confirmedPostCount: evidence.confirmedPostCount,
        strongSignalCount: evidence.strongSignalCount,
        planningPostCount: evidence.planningPostCount,
        feedbackPostCount: evidence.feedbackPostCount,
        announcementPostCount: evidence.announcementPostCount,
        pendingSignalCount: strongFutureCandidates.length,
        contextualGroupCount: evidence.contextualGroupCount,
        windowStartedAt: evidence.windowStartedAt,
      },
      postIds: classified.slice(0, TIBO_X_EVIDENCE_POST_LIMIT).map((post) => post.id),
      checkedAt: new Date().toISOString(),
      freshness: "live",
    };
  };

  const TIBO_X_STALE_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  const readTiboRadarCache = ({ allowStale = false } = {}) => {
    try {
      const cached = JSON.parse(localStorage.getItem(TIBO_X_STORAGE_KEY) || "null");
      const cachedAt = Number(cached?.cachedAt);
      const age = Date.now() - cachedAt;
      if (!Number.isFinite(cachedAt) || age < 0 || age > TIBO_X_STALE_CACHE_MAX_AGE_MS ||
        Number(cached?.classifierVersion) !== TIBO_X_CLASSIFIER_VERSION ||
        !Number.isFinite(Number(cached?.state?.probability))) return null;
      if (!allowStale && age > TIBO_X_CACHE_MAX_AGE_MS) return null;
      return { ...cached.state, freshness: age > TIBO_X_CACHE_MAX_AGE_MS ? "stale" : "cached" };
    } catch {
      return null;
    }
  };

  const writeTiboRadarCache = (state) => {
    if (!state || !Number.isFinite(Number(state.probability))) return;
    try {
      localStorage.setItem(TIBO_X_STORAGE_KEY, JSON.stringify({
        classifierVersion: TIBO_X_CLASSIFIER_VERSION,
        cachedAt: Date.now(),
        state,
      }));
    } catch {}
  };

  /* The live X timeline can move the confirmed reset post outside the first
     page of results. Keep the newest known confirmed post as history rather
     than allowing a later burst of unrelated posts to make it disappear. */
  const mergeTiboResetHistory = (state, previous) => {
    if (!state || !previous) return state;
    const hasHistory = (value) => Boolean(value?.lastResetAt || value?.lastResetPostId ||
      value?.lastResetPostText || value?.lastResetUrl);
    const historyTimestamp = (value) => {
      const timestamp = Date.parse(quotaText(value?.lastResetPostAt || value?.lastResetAt));
      return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
    };
    if (!hasHistory(previous) ||
      (hasHistory(state) && historyTimestamp(state) >= historyTimestamp(previous))) return state;
    return {
      ...state,
      lastResetAt: previous.lastResetAt || "",
      lastResetPostId: previous.lastResetPostId || "",
      lastResetUrl: previous.lastResetUrl || "",
      lastResetPostText: previous.lastResetPostText || "",
      lastResetPostSummaryZh: previous.lastResetPostSummaryZh || "",
      lastResetPostAt: previous.lastResetPostAt || "",
      lastResetPostKind: previous.lastResetPostKind || "",
      lastResetPostIsReply: previous.lastResetPostIsReply === true,
      lastResetPostReplyToId: previous.lastResetPostReplyToId || "",
    };
  };

  const readTiboRadarPayload = async () => {
    const url = `${TIBO_X_URL}?tibo-refresh=${Date.now()}`;
    const bridgePayload = await requestPublicBridge(url, TIBO_X_REQUEST_TIMEOUT_MS, {
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    });
    let parsed = parseTiboXPayload(bridgePayload);
    if (!parsed && location.protocol !== "app:" && typeof globalThis.fetch === "function") {
      const controller = typeof AbortController === "function" ? new AbortController() : null;
      const timeout = setTimeout(() => controller?.abort(), TIBO_X_REQUEST_TIMEOUT_MS);
      try {
        const response = await globalThis.fetch(url, {
          cache: "no-store",
          credentials: "omit",
          signal: controller?.signal,
        });
        if (response.ok) parsed = parseTiboXPayload(await response.text());
      } finally {
        clearTimeout(timeout);
      }
    }
    if (!parsed) throw new Error("Tibo X payload is unavailable or invalid");
    return parsed;
  };

  const refreshTiboRadar = async () => {
    if (!QUOTA_ENABLED || !experienceCapabilityEnabled("quota") || nativeThemeSelected ||
      window[DISABLED_KEY] || tiboRadarRequest) return tiboRadarRequest;
    tiboRadarRequest = (async () => {
      try {
        const state = await readTiboRadarPayload();
        if (window[DISABLED_KEY]) return null;
        const previous = tiboRadarState || readTiboRadarCache({ allowStale: true });
        const mergedState = mergeTiboResetHistory(state, previous);
        tiboRadarState = mergedState;
        writeTiboRadarCache(mergedState);
        syncExperienceResetState(mergedState);
        scheduleQuotaEnsure(80);
        return mergedState;
      } catch {
        if (window[DISABLED_KEY]) return null;
        /* Keep the last usable post and its link visible when X is temporarily
           unavailable. The card is explicitly marked stale by the cache
           reader, but the action is not silently removed. */
        const cached = readTiboRadarCache({ allowStale: true });
        tiboRadarState = cached ? { ...cached, freshness: "stale", syncFailed: true }
          : { freshness: "stale", syncFailed: true };
        syncExperienceResetState(tiboRadarState);
        scheduleQuotaEnsure(80);
        return null;
      }
    })().finally(() => {
      tiboRadarRequest = null;
    });
    return tiboRadarRequest;
  };

  let resetDecisionCacheSignature = "";
  const readResetDecisionCache = () => {
    try {
      const cached = JSON.parse(localStorage.getItem(RESET_DECISION_STORAGE_KEY) || "null");
      const cachedAt = Number(cached?.cachedAt);
      if (!cached?.state || !Number.isFinite(cachedAt) ||
        Number(cached?.tiboClassifierVersion) !== TIBO_X_CLASSIFIER_VERSION ||
        Date.now() - cachedAt > RESET_DECISION_CACHE_MAX_AGE_MS) return null;
      return {
        ...cached.state,
        freshness: "decision-cached",
        nextSignalFallback: true,
      };
    } catch {
      return null;
    }
  };

  const writeResetDecisionCache = (state) => {
    if (!state || !Number.isFinite(Number(state.nextProbability ?? state.probability))) return;
    try {
      const signature = JSON.stringify([
        state.lastResetAt, state.outcome, state.nextProbability, state.nextResetTime,
        state.nextEventAt, state.nextConfirmation, state.hasResetSignal,
      ]);
      if (signature === resetDecisionCacheSignature) return;
      resetDecisionCacheSignature = signature;
      localStorage.setItem(RESET_DECISION_STORAGE_KEY,
        JSON.stringify({
          cachedAt: Date.now(),
          tiboClassifierVersion: TIBO_X_CLASSIFIER_VERSION,
          state,
        }));
    } catch {}
  };

  const resetTimestamp = (...values) => {
    for (const value of values) {
      const timestamp = Date.parse(quotaText(value));
      if (Number.isFinite(timestamp)) return timestamp;
    }
    return Number.NaN;
  };

  const resetSignalIsTerminal = (state) => /(?:completed|closed|window_closed|expired|cancelled)/i.test(
    `${state?.eventKind || ""} ${state?.eventStatus || ""} ${state?.nextSignalStatus || ""}`,
  );

  const resetScheduleDeadline = (label, referenceTimestamp, nowTimestamp) => {
    const match = quotaText(label).match(/^(\d{1,2})[\/-](\d{1,2})\b/);
    if (!match) return Number.NaN;
    const reference = new Date(Number.isFinite(referenceTimestamp) ? referenceTimestamp : nowTimestamp);
    const pacific = quotaText(label).match(/^(\d{1,2})[\/-](\d{1,2})\s+(\d{2}):(\d{2})\s+(PST|PDT|PT)\b/);
    if (pacific) {
      let year = reference.getUTCFullYear();
      let target = Date.UTC(year, Number(pacific[1]) - 1, Number(pacific[2]),
        Number(pacific[3]), Number(pacific[4]));
      if (target < reference.getTime() - 180 * 86400000) {
        target = Date.UTC(++year, Number(pacific[1]) - 1, Number(pacific[2]),
          Number(pacific[3]), Number(pacific[4]));
      }
      // PST/PDT retain the explicit source offset. PT follows the seasonal
      // Pacific offset. The grace window allows delayed rollouts.
      const seasonal = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles", timeZoneName: "shortOffset",
      }).formatToParts(new Date(target)).find((part) => part.type === "timeZoneName")?.value;
      const offset = pacific[5] === "PST" ? 8 : pacific[5] === "PDT" ? 7
        : Number(seasonal?.match(/GMT-(\d+)/)?.[1] || 8);
      return target + offset * 3600000 + RESET_SCHEDULE_GRACE_MS;
    }
    let target = new Date(reference.getFullYear(), Number(match[1]) - 1, Number(match[2]));
    if (target.getTime() < reference.getTime() - 180 * 24 * 60 * 60 * 1000) {
      target = new Date(reference.getFullYear() + 1, Number(match[1]) - 1, Number(match[2]));
    }
    return target.getTime() + RESET_SCHEDULE_GRACE_MS;
  };

  const resetSignalCandidate = (state, origin, lastResetTimestamp, nowTimestamp) => {
    if (!state || resetSignalIsTerminal(state) || state.nextSignalStatus === "none" ||
      state.nextPredictionStatus === "none") return null;
    /* An explicit null means that this source has no next-round forecast.
       Do not fall back to its historical/confidence `probability` field. */
    const hasExplicitNextProbability = Object.prototype.hasOwnProperty.call(state, "nextProbability");
    const probability = Number(hasExplicitNextProbability ? state.nextProbability : state.probability);
    if (!Number.isFinite(probability)) return null;
    const eventTimestamp = resetTimestamp(
      state.nextEventAt, state.eventUpdatedAt, state.tiboUpdatedAt, state.newestPostAt,
    );
    const explicitSignal = state.hasResetSignal === true || state.nextConfirmation === "official" ||
      /^(?:direct|official|likely)$/.test(quotaText(state.strongestRelevance).toLowerCase());
    if (!explicitSignal || probability < 40) return null;
    if (Number.isFinite(lastResetTimestamp) && Number.isFinite(eventTimestamp) &&
      eventTimestamp < lastResetTimestamp) return null;
    const nextResetTime = quotaText(state.nextResetTime);
    const deadline = resetScheduleDeadline(nextResetTime, eventTimestamp, nowTimestamp);
    if (Number.isFinite(deadline) && nowTimestamp > deadline) return null;
    if (!nextResetTime && Number.isFinite(eventTimestamp) &&
      nowTimestamp - eventTimestamp > RESET_SIGNAL_MAX_AGE_MS) return null;
    const confirmation = quotaText(state.nextConfirmation || state.confirmation);
    const authority = confirmation === "official" ? 3
      : /(?:X|Tibo)/i.test(String(state.nextSource || state.source || "")) ? 2 : 1;
    return {
      state,
      origin,
      probability: Math.max(0, Math.min(100, Math.round(probability))),
      eventTimestamp,
      nextResetTime,
      confirmation,
      authority,
      explicitSchedule: Boolean(nextResetTime),
    };
  };

  const resolveResetRadarState = (direct, radarReset, cachedDecision = null,
    nowTimestamp = Date.now()) => {
    const sources = [direct, radarReset, cachedDecision].filter((state) => state && typeof state === "object");
    if (!sources.length) return null;
    /* A cached decision is useful for a pending forecast, but its historical
       date may have been produced by an older heuristic. Only fresh provider
       data, or a cache carrying explicit post evidence, may establish a reset
       date. */
    const historySources = [direct, radarReset, cachedDecision].filter((state) =>
      state && state !== cachedDecision || state && (
        state.lastResetPostId || /(?:reset|quota|usage\s+limits?|rate\s+limits?)/i.test(
          String(state.lastResetPostText || ""),
        )
      ),
    );
    const resetTimes = historySources
      .map((state) => ({ value: quotaText(state.lastResetAt), time: resetTimestamp(state.lastResetAt) }))
      .filter((entry) => Number.isFinite(entry.time))
      .sort((left, right) => right.time - left.time);
    /* Radar may timestamp a closed window after the actual Tibo announcement.
       Prefer a source that carries the confirmed post when establishing the
       historical reset date; Radar remains the fallback when no post exists. */
    const tiboHistorySource = historySources.find((state) => state.lastResetPostId ||
      /(?:reset|quota|usage\s+limits?|rate\s+limits?)/i.test(String(state.lastResetPostText || "")));
    const tiboHistoryValue = quotaText(tiboHistorySource?.lastResetPostAt || tiboHistorySource?.lastResetAt);
    const tiboHistoryTimestamp = resetTimestamp(tiboHistorySource?.lastResetPostAt || tiboHistorySource?.lastResetAt);
    const lastResetAt = tiboHistoryValue || resetTimes[0]?.value || "";
    const lastResetTimestamp = Number.isFinite(tiboHistoryTimestamp)
      ? tiboHistoryTimestamp : resetTimes[0]?.time ?? Number.NaN;
    const freshSources = [direct, radarReset].filter(Boolean);
    const newestTerminalTimestamp = freshSources
      .filter(resetSignalIsTerminal)
      .map((state) => resetTimestamp(state.eventUpdatedAt, state.nextEventAt, state.tiboUpdatedAt))
      .filter(Number.isFinite)
      .sort((left, right) => right - left)[0] ?? Number.NaN;
    const candidates = [
      resetSignalCandidate(direct, "x", lastResetTimestamp, nowTimestamp),
      resetSignalCandidate(radarReset, "radar", lastResetTimestamp, nowTimestamp),
      resetSignalCandidate(cachedDecision, "decision-cache", lastResetTimestamp, nowTimestamp),
    ].filter(Boolean).filter((candidate) => !(Number.isFinite(newestTerminalTimestamp) &&
      (!Number.isFinite(candidate.eventTimestamp) || newestTerminalTimestamp >= candidate.eventTimestamp)));
    candidates.sort((left, right) => {
      const leftTime = Number.isFinite(left.eventTimestamp) ? left.eventTimestamp : 0;
      const rightTime = Number.isFinite(right.eventTimestamp) ? right.eventTimestamp : 0;
      return right.authority - left.authority ||
        Number(right.explicitSchedule) - Number(left.explicitSchedule) ||
        rightTime - leftTime || right.probability - left.probability;
    });
    /* A confirmed Tibo post describes the round that just ended. If Radar has
       an active official window, that signal must decide the next round even
       when the Tibo source reports its conservative post-reset value of 8%.
       Keep the normal ranking as the fallback for sources without an active
       official window. */
    const officialNext = candidates.find((candidate) =>
      candidate.confirmation === "official" &&
      (candidate.explicitSchedule || candidate.probability >= 75)) || null;
    const next = officialNext || candidates[0] || null;
    const base = direct || radarReset || cachedDecision;
    const resetConfirmed = Boolean(lastResetAt) || [direct, radarReset].some((state) =>
      state && /^(?:reset-confirmed|historical-reset)$/.test(String(state.outcome || "")) &&
      (state.lastResetAt || state.lastResetPostId || state.lastResetPostText),
    );
    /* `next` is intentionally the only source allowed to populate the next
       prediction. A terminal Radar window can confirm the previous round,
       but it must never become a new 72% forecast through fallback logic. */
    const nextProbability = next?.probability ?? null;
    const nextLevel = next ? resetRadarLevel(nextProbability) : "low";
    const nextState = next?.state || null;
    const nextFallback = Boolean(next && (next.origin === "decision-cache" ||
      /(?:cached|stale)/i.test(String(nextState?.freshness || nextState?.status || ""))));
    return {
      ...base,
      probability: resetConfirmed ? 100 : Number(base?.probability ?? 0),
      outcome: resetConfirmed ? "reset-confirmed"
        : /^(?:reset-confirmed|historical-reset)$/.test(String(base?.outcome || ""))
          ? "probability" : base?.outcome || "probability",
      lastResetAt,
      lastResetPostId: tiboHistorySource?.lastResetPostId || base?.lastResetPostId || "",
      lastResetUrl: tiboHistorySource?.lastResetUrl || base?.lastResetUrl || "",
      lastResetPostText: tiboHistorySource?.lastResetPostText || base?.lastResetPostText || "",
      lastResetPostSummaryZh: tiboHistorySource?.lastResetPostSummaryZh ||
        base?.lastResetPostSummaryZh || "",
      lastResetPostAt: tiboHistorySource?.lastResetPostAt || base?.lastResetPostAt || "",
      lastResetPostKind: tiboHistorySource?.lastResetPostKind || base?.lastResetPostKind || "",
      lastResetPostIsReply: tiboHistorySource?.lastResetPostIsReply === true ||
        base?.lastResetPostIsReply === true,
      lastResetPostReplyToId: tiboHistorySource?.lastResetPostReplyToId ||
        base?.lastResetPostReplyToId || "",
      nextProbability,
      nextLevel,
      nextLevelLabel: resetRadarLevelLabel(nextLevel),
      nextReason: next
        ? quotaText(nextState?.nextReason || nextState?.reason || base?.nextReason)
        : resetConfirmed
          ? "\u4e0a\u4e00\u8f6e\u5df2\u786e\u8ba4\u91cd\u7f6e\uff0c\u6682\u65e0\u4e0b\u4e00\u8f6e\u76f4\u63a5\u4fe1\u53f7"
          : quotaText(base?.nextReason || base?.reason, "\u6682\u65e0\u660e\u786e\u7684\u989d\u5ea6\u91cd\u7f6e\u4fe1\u53f7"),
      nextResetTime: next ? quotaText(nextState?.nextResetTime) : "",
      nextSource: next ? quotaText(nextState?.nextSource || nextState?.source) : "",
      nextEventAt: next ? quotaText(nextState?.nextEventAt || nextState?.eventUpdatedAt) : "",
      nextConfirmation: next ? quotaText(nextState?.nextConfirmation || nextState?.confirmation) : "",
      hasResetSignal: Boolean(next),
      nextSignalStatus: next ? nextFallback ? "cached" : "active" : "none",
      nextPredictionStatus: next ? nextFallback ? "cached" : "active" : "none",
      nextSignalFallback: nextFallback,
      decisionSources: [direct ? "x" : "", radarReset ? "radar" : "",
        cachedDecision ? "decision-cache" : ""].filter(Boolean),
    };
  };

  const quotaResetRadarSnapshot = () => {
    const direct = tiboRadarState || readTiboRadarCache({ allowStale: true });
    const radarReset = quotaRadarSnapshot()?.resetRadar;
    const cachedDecision = readResetDecisionCache();
    const resolved = resolveResetRadarState(direct, radarReset, cachedDecision);
    if (resolved && (direct || radarReset)) writeResetDecisionCache(resolved);
    return resolved;
  };

  /* A previous hot-injected renderer can finish an already-running async
     refresh after the corrected renderer has taken ownership. It must never
     be allowed to put the old `8% / 下次概率` copy back into the visible card.
     Observe only this small portal and restore the canonical resolved state;
     this is intentionally not a document-wide mutation observer. */
  const repairResetDisplay = () => {
    const resetLikelihood = document.getElementById("codex-quota-reset-composer");
    const resetDetails = document.getElementById("codex-quota-reset-details");
    const resetInfo = quotaResetRadarSnapshot();
    if (!resetLikelihood || !resetInfo) return;
    const resetReconciliation = reconcileQuotaResetCause(resetInfo);
    const resetConfirmed = resetReconciliation.resetStatus === "confirmed" ||
      resetInfo.outcome === "reset-confirmed";
    const nextSignal = quotaResetNextSignal(resetInfo, resetReconciliation);
    const hasNextSignal = nextSignal.active && !resetSignalIsTerminal(resetInfo);
    const nextProbability = hasNextSignal ? nextSignal.probability : Number.NaN;
    const nextLevel = hasNextSignal
      ? nextSignal.level
      : "low";
    const nextResetTime = hasNextSignal
      ? quotaText(resetInfo.nextResetTime, "\u65f6\u95f4\u5f85\u5b9a")
      : "\u6682\u65e0\u9884\u544a";
    const tiboPreviewAt = hasNextSignal
      ? quotaText(resetInfo.nextEventAt) || quotaText(resetInfo.eventUpdatedAt) ||
        quotaText(resetInfo.newestPostAt) || quotaText(resetInfo.tiboUpdatedAt)
      : "";
    const tiboPreviewText = tiboPreviewAt ? formatResetClockTime(tiboPreviewAt) : "\u7b49\u5f85\u65b0\u52a8\u6001";
    const officialNextSignal = hasNextSignal &&
      (resetInfo.nextConfirmation === "official" ||
        (Boolean(resetInfo.nextResetTime) && nextProbability >= 75));
    const resetSignalState = officialNextSignal ? "present" : hasNextSignal ? "present"
      : resetConfirmed || resetInfo.hasResetSignal === false ? "absent" : "unknown";
    const resetSignalText = officialNextSignal ? "\u5b98\u65b9\u4fe1\u53f7"
      : resetSignalState === "present" ? "\u6709\u4fe1\u53f7"
        : resetSignalState === "absent" ? "\u6682\u65e0\u4fe1\u53f7" : "\u5f85\u540c\u6b65";
    // The compact composer strip is a probability readout. Authority belongs
    // in the detail card/source text; showing “官方” here hid the useful 88%.
    const compactResetSignalValue = hasNextSignal && Number.isFinite(nextProbability)
      ? `${Math.round(nextProbability)}%` : "—";
    const earningTarget = resetLikelihood.querySelector("[data-codex-thread-earning]");
    if (earningTarget) {
      setAttribute(earningTarget, "data-thread-earning-reset-signal",
        `\u91cd\u7f6e\u4fe1\u53f7\u00b7${compactResetSignalValue}`);
      setAttribute(earningTarget, "data-thread-earning-reset-signal-label", "\u91cd\u7f6e\u4fe1\u53f7");
      setAttribute(earningTarget, "data-thread-earning-reset-signal-value", compactResetSignalValue);
    }
    const resetDateValue = quotaLastResetDisplayAt(resetInfo, resetReconciliation);
    const resetDate = resetDateValue ? formatResetCardTime(resetDateValue) : "";
    if (resetDateValue) resetInfo.lastResetAt = resetDateValue;
    const quotaResetAt = quotaDisplayWindows(quotaState || {}).find((entry) => entry?.resetAt)?.resetAt || "";
    const resetSignature = [quotaResetAt, resetInfo.outcome, resetDateValue,
      nextResetTime, tiboPreviewAt, resetSignalState].map(quotaText).join("|");
    const resetTip = [
      `\u4e0a\u8f6e\uff1a${resetConfirmed ? "\u5df2\u91cd\u7f6e" : "\u5f85\u786e\u8ba4"}`,
      `\u4e0b\u8f6e\uff1a${Number.isFinite(nextProbability) ? `${Math.round(nextProbability)}%` : "\u6682\u65e0\u76f4\u63a5\u4fe1\u53f7"}`,
      `Tibo \u9884\u544a\uff1a${tiboPreviewText}`,
      resetInfo.lastResetAt ? `\u4e0a\u6b21\u91cd\u7f6e\uff1a${formatResetRadarTime(resetInfo.lastResetAt)}`
        : "\u4e0a\u6b21\u91cd\u7f6e\uff1a\u5f85\u786e\u8ba4",
      `\u4e0b\u6b21\u91cd\u7f6e\uff1a${nextResetTime}`,
      `\u4fe1\u53f7\uff1a${resetSignalText}`,
      resetInfo.source ? `\u6570\u636e\u6765\u6e90\uff1a${quotaText(resetInfo.nextSource || resetInfo.source)}` : "",
    ].filter(Boolean).join("\n");
    const sourceText = quotaText(resetInfo.nextSource || resetInfo.source, "Codex Radar \u00b7 Tibo");
    resetDisplayRepairing = true;
    try {
      setAttribute(resetLikelihood, "data-freshness", resetInfo.freshness);
      setAttribute(resetLikelihood, "data-level", resetConfirmed ? "high" : resetInfo.level || nextLevel);
      setAttribute(resetLikelihood, "data-next-level", nextLevel);
      setAttribute(resetLikelihood, "data-outcome", resetConfirmed ? "confirmed" : "probability");
      setAttribute(resetLikelihood, "data-reset-signal", resetSignalState);
      setAttribute(resetLikelihood, "data-display-mode", resetDate ? "reset" : "unknown");
      setAttribute(resetLikelihood, "data-codex-reset-tip", resetTip);
      setAttribute(resetLikelihood, "data-codex-reset-signature", resetSignature);
      setAttribute(resetLikelihood, "aria-label", resetTip.replace(/\n/g, "\uff1b"));
      setTextContent(resetLikelihood.querySelector("[data-codex-reset-label]"), "");
      setTextContent(resetLikelihood.querySelector("[data-codex-reset-value]"), "");
      setTextContent(resetLikelihood.querySelector("[data-codex-reset-next-label]"), "\u91cd\u7f6e\u6982\u7387");
      setTextContent(resetLikelihood.querySelector("[data-codex-reset-next-value]"),
        hasNextSignal && Number.isFinite(nextProbability)
          ? `${Math.round(nextProbability)}%` : "\u65e0");
      setTextContent(resetLikelihood.querySelector("[data-codex-reset-date]"), resetDate);
      if (!resetDetails) return;
      setAttribute(resetDetails, "data-confirmed-reset", resetConfirmed ? "true" : "false");
      if (resetConfirmed) {
        setAttribute(resetLikelihood, "data-selected", "false");
        setAttribute(resetLikelihood, "aria-pressed", "false");
        setAttribute(resetDetails, "aria-hidden", "true");
      }
      setAttribute(resetDetails, "data-freshness", resetInfo.freshness);
      setAttribute(resetDetails, "data-level", resetConfirmed ? "high" : resetInfo.level || nextLevel);
      setAttribute(resetDetails, "data-next-level", nextLevel);
      setAttribute(resetDetails, "data-outcome", resetConfirmed ? "confirmed" : "probability");
      setAttribute(resetDetails, "data-reset-signal", resetSignalState);
      setTextContent(resetDetails.querySelector("[data-codex-reset-popover-status]"),
        resetConfirmed ? "\u5df2\u91cd\u7f6e" : "\u5f85\u786e\u8ba4");
      setTextContent(resetDetails.querySelector("[data-codex-reset-popover-next]"),
        Number.isFinite(nextProbability) ? `${Math.round(nextProbability)}%` : "\u2014");
      setTextContent(resetDetails.querySelector("[data-codex-reset-popover-next-level]"),
        hasNextSignal ? resetRadarLevelLabel(nextLevel) : "\u6682\u65e0\u4fe1\u53f7");
      setTextContent(resetDetails.querySelector("[data-codex-reset-popover-date]"), resetDate || "\u5f85\u786e\u8ba4");
      setTextContent(resetDetails.querySelector("[data-codex-reset-popover-next-time]"), nextResetTime);
      setTextContent(resetDetails.querySelector("[data-codex-reset-popover-tibo-time]"), tiboPreviewText);
      setTextContent(resetDetails.querySelector("[data-codex-reset-popover-signal]"), resetSignalText);
      setTextContent(resetDetails.querySelector("[data-codex-reset-popover-source]"), `\u6570\u636e\u6765\u6e90  ${sourceText}`);
    } finally {
      resetDisplayRepairing = false;
    }
  };

  const installResetDisplayGuard = () => {
    const root = document.getElementById("codex-quota-composer-portal");
    const node = document.getElementById("codex-quota-reset-composer");
    if (!root || !node) return;
    if (resetDisplayGuardRoot !== root) {
      resetDisplayObserver?.disconnect();
      resetDisplayGuardRoot = root;
      resetDisplayObserver = new MutationObserver(() => {
        if (resetDisplayRepairing) return;
        queueMicrotask(() => {
          if (!resetDisplayRepairing) repairResetDisplay();
        });
      });
      resetDisplayObserver.observe(root, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [
          "data-next-level", "data-outcome", "data-reset-signal",
          "data-codex-reset-tip", "data-codex-reset-signature",
        ],
      });
    }
    repairResetDisplay();
  };

  const readQuotaRadarPayload = async () => {
    const url = `${QUOTA_RADAR_URL}?quota-refresh=${Date.now()}`;
    const bridgePayload = await requestPublicBridge(url, QUOTA_RADAR_REQUEST_TIMEOUT_MS, {
      Accept: "text/html,application/xhtml+xml",
    });
    let parsed = parseQuotaRadarPayload(bridgePayload);
    if (!parsed && location.protocol !== "app:" && typeof globalThis.fetch === "function") {
      const controller = typeof AbortController === "function" ? new AbortController() : null;
      const timeout = setTimeout(() => controller?.abort(), QUOTA_RADAR_REQUEST_TIMEOUT_MS);
      try {
        const response = await globalThis.fetch(url, {
          cache: "no-store",
          credentials: "omit",
          signal: controller?.signal,
        });
        if (response.ok) parsed = parseQuotaRadarPayload(await response.text());
      } finally {
        clearTimeout(timeout);
      }
    }
    if (!parsed) throw new Error("Quota Radar payload is unavailable or invalid");
    return parsed;
  };

  const scheduleQuotaRadarRetry = () => {
    if (quotaRadarRetryTimer) clearTimeout(quotaRadarRetryTimer);
    const delay = Math.min(QUOTA_RADAR_RETRY_MAX_MS,
      QUOTA_RADAR_RETRY_BASE_MS * (2 ** Math.min(quotaRadarRetryCount - 1, 5)));
    quotaRadarRetryTimer = setTimeout(() => {
      quotaRadarRetryTimer = null;
      if (!window[DISABLED_KEY] && experienceCapabilityEnabled("quota")) {
        void refreshQuotaRadar();
      }
    }, delay);
  };

  const refreshQuotaRadar = async () => {
    if (!QUOTA_ENABLED || !experienceCapabilityEnabled("quota") || nativeThemeSelected ||
      window[DISABLED_KEY] || quotaRadarRequest) return quotaRadarRequest;
    quotaRadarRequest = (async () => {
      try {
        const state = await readQuotaRadarPayload();
        if (window[DISABLED_KEY]) return null;
        quotaRadarRetryCount = 0;
        if (quotaRadarRetryTimer) clearTimeout(quotaRadarRetryTimer);
        quotaRadarRetryTimer = null;
        quotaRadarState = state;
        writeQuotaRadarCache(state);
        syncExperienceResetState(state);
        ensureQuota();
        return state;
      } catch {
        if (window[DISABLED_KEY]) return null;
        quotaRadarRetryCount += 1;
        const fallback = readQuotaRadarCache();
        quotaRadarState = fallback ? { ...fallback, status: `${fallback.status}-stale` } : null;
        scheduleQuotaRadarRetry();
        syncExperienceResetState(quotaRadarState);
        ensureQuota();
        return null;
      }
    })().finally(() => {
      quotaRadarRequest = null;
    });
    return quotaRadarRequest;
  };

  const modelRadarPoint = (value) => {
    if (!value || typeof value !== "object") return null;
    const model = String(value.model || "").trim().slice(0, 48);
    const provider = String(value.provider || value.vendor || "").trim().slice(0, 32);
    const effort = String(value.effort || "").trim().toLowerCase().slice(0, 16);
    const iq = Number(value.iq);
    const price = Number(value.average_price_usd);
    const minutes = Number(value.average_minutes);
    if (!model || !effort || !Number.isFinite(iq) || !Number.isFinite(price) || price < 0) return null;
    return {
      model,
      provider,
      effort,
      iq,
      average_price_usd: price,
      average_minutes: Number.isFinite(minutes) && minutes >= 0 ? minutes : null,
    };
  };
  const modelRadarPointKey = (point) => `${point?.model || ""}:${point?.effort || ""}`;
  const modelRadarBareModel = (value) => String(
    typeof value === "string" ? value : value?.model || "",
  ).trim().replace(/^openai[/:]/i, "");
  /* Keep the family label derived from the model id. The old implementation
     used this function as an allow-list, which made every newly published
     model disappear until its exact id was added here by hand. */
  const modelRadarFamily = (point) => {
    const model = modelRadarBareModel(point);
    const legacyFamily = {
      "gpt-5.6-sol": "Sol",
      "gpt-5.6-terra": "Terra",
      "gpt-5.6-luna": "Luna",
      "gpt-5.5": "5.5",
    }[model.toLowerCase()];
    if (legacyFamily) return legacyFamily;
    const gptMatch = model.match(/^gpt-([\d.]+)(?:[-_](.+))?$/i);
    const family = gptMatch?.[2] || (gptMatch ? `GPT ${gptMatch[1]}` : model);
    return String(family || "模型")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((part) => /^gpt$/i.test(part) ? "GPT" : part
        ? `${part[0].toUpperCase()}${part.slice(1)}` : part)
      .join(" ");
  };
  /* The radar feed also contains third-party benchmark rows. Keep the
     recommendation surface scoped to models that Codex can plausibly expose,
     while allowing every future GPT/O/Codex model without another allow-list
     update. A provider field from the feed takes precedence when available. */
  const modelRadarIsCodexModel = (point) => {
    const model = modelRadarBareModel(point).toLowerCase();
    const provider = String(point?.provider || point?.vendor || "").trim().toLowerCase();
    if (/openai|chatgpt|codex/.test(provider)) return true;
    return /^(?:gpt-|o\d(?:$|[-_.])|codex[-_])/i.test(model);
  };
  const normalizeModelRadarSearchText = (value) => String(value || "")
    .toLowerCase()
    .replace(/[-_/:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const modelRadarModelTerms = (point) => {
    const model = modelRadarBareModel(point);
    const family = modelRadarFamily(point);
    return [...new Set([
      model,
      model.replace(/[-_/:]+/g, " "),
      model.replace(/^gpt-/i, ""),
      family,
      family.replace(/\s+/g, "-"),
    ].map(normalizeModelRadarSearchText).filter((term) => term.length >= 2))];
  };
  const modelRadarTextMatches = (text, point) => {
    const normalizedText = normalizeModelRadarSearchText(text);
    return modelRadarModelTerms(point).some((term) => normalizedText.includes(term));
  };
  const modelRadarLabel = (point) => {
    return `${modelRadarFamily(point)} ${point?.effort || ""}`.trim();
  };
  /* Family icons are remote public assets; the normal model-logo fallback is
     used when an icon cannot be loaded. */
  const MODEL_RADAR_FAMILY_ARTWORK = Object.freeze({
    Sol: "https://api.iconify.design/solar/sun-2-bold-duotone.svg?color=%23e8912f",
    Terra: "https://api.iconify.design/solar/earth-bold-duotone.svg?color=%233a8ea0",
    Luna: "https://api.iconify.design/solar/moon-bold-duotone.svg?color=%236d70b8",
  });
  const modelRadarArtwork = (point) => {
    const familyArtwork = MODEL_RADAR_FAMILY_ARTWORK[modelRadarFamily(point)];
    if (familyArtwork) return familyArtwork;
    return artUrl || "https://codexradar.com/assets/codex-logo.svg";
  };
  /* Preserve the existing visual order for known families only; unknown
     families are ranked after them and are never filtered out. */
  const MODEL_RADAR_FAMILY_ORDER = Object.freeze(["Astra", "Sol", "Terra", "Luna", "5.5"]);
  const MODEL_RADAR_EFFORT_ORDER = Object.freeze(["ultra", "max", "xhigh", "high", "medium", "low"]);
  const modelRadarRank = (value, order) => {
    const index = order.indexOf(value);
    return index >= 0 ? index : order.length;
  };
  const modelRadarSortedPoints = () => {
    const source = modelRadarState.points || [];
    if (modelRadarSortedPointsCache.source === source) {
      return modelRadarSortedPointsCache.points;
    }
    const points = source
      .map(modelRadarPoint)
      .filter(Boolean)
      .sort((left, right) => {
        const familyDelta = modelRadarRank(modelRadarFamily(left), MODEL_RADAR_FAMILY_ORDER) -
          modelRadarRank(modelRadarFamily(right), MODEL_RADAR_FAMILY_ORDER);
        if (familyDelta) return familyDelta;
        const modelDelta = modelRadarBareModel(left).localeCompare(
          modelRadarBareModel(right), undefined, { numeric: true, sensitivity: "base" },
        );
        if (modelDelta) return modelDelta;
        return modelRadarRank(left.effort, MODEL_RADAR_EFFORT_ORDER) -
          modelRadarRank(right.effort, MODEL_RADAR_EFFORT_ORDER);
      });
    modelRadarSortedPointsCache = { source, points };
    return points;
  };
  const modelRadarSelection = (minimum, maximum = Number.POSITIVE_INFINITY) => {
    const points = (modelRadarState.points || []).map(modelRadarPoint).filter(Boolean)
      .filter(modelRadarIsCodexModel)
      .filter((point) => point.iq >= minimum && point.iq < maximum);
    return points.sort((left, right) =>
      left.average_price_usd - right.average_price_usd ||
      right.iq - left.iq ||
      modelRadarLabel(left).localeCompare(modelRadarLabel(right)),
    )[0] || null;
  };
  const modelRadarDisplayPoints = () => {
    const sorted = modelRadarSortedPoints();
    if (modelRadarDisplayPointsCache.source === sorted) {
      return modelRadarDisplayPointsCache.points;
    }
    const points = sorted
      .filter(modelRadarIsCodexModel)
      .filter((point) => point.iq >= MODEL_RADAR_MIN_IQ);
    modelRadarDisplayPointsCache = { source: sorted, points };
    return points;
  };
  const modelRadarRecommendations = () => {
    const points = modelRadarDisplayPoints();
    if (modelRadarRecommendationsCache.points === points) {
      return modelRadarRecommendationsCache.value;
    }
    const valueScores = modelRadarValueScores();
    const valuePick = [...points]
      .sort((left, right) =>
        (valueScores.get(modelRadarPointKey(right)) || 0) -
          (valueScores.get(modelRadarPointKey(left)) || 0) ||
        right.iq - left.iq ||
        left.average_price_usd - right.average_price_usd,
      )[0] || null;
    const value = { high: valuePick, balanced: null };
    modelRadarRecommendationsCache = { points, value };
    return value;
  };
  const modelRadarValueScores = () => {
    const points = modelRadarDisplayPoints();
    if (modelRadarValueScoresCache.points === points) {
      return modelRadarValueScoresCache.scores;
    }
    if (!points.length) {
      const scores = new Map();
      modelRadarValueScoresCache = { points, scores };
      return scores;
    }
    /* A fixed $1 baseline represents the unavoidable request/session overhead.
       It prevents a small price difference below one dollar from overpowering
       a meaningful IQ difference: Luna Max at 103.1/$0.45 therefore outranks
       Luna xhigh at 88.4/$0.30, while expensive Sol tiers are still penalized. */
    const adjustedValues = points.map((point) =>
      point.iq / (1 + Math.max(0, point.average_price_usd)));
    const minimum = Math.min(...adjustedValues);
    const maximum = Math.max(...adjustedValues);
    const range = Math.max(0.001, maximum - minimum);
    const scores = new Map(points.map((point, index) => [
      modelRadarPointKey(point),
      Math.round(28 + ((adjustedValues[index] - minimum) / range) * 72),
    ]));
    modelRadarValueScoresCache = { points, scores };
    return scores;
  };
  const modelRadarBestKeys = () => {
    const points = modelRadarDisplayPoints();
    const bestIq = Math.max(...points.map((point) => point.iq), Number.NEGATIVE_INFINITY);
    return new Set(points
      .filter((point) => Math.abs(point.iq - bestIq) < 0.05)
      .map(modelRadarPointKey));
  };
  const selectedModelRadarPoint = () => modelRadarDisplayPoints()
    .find((point) => modelRadarPointKey(point) === modelRadarSelectionKey) || null;
  const formatModelRadarTime = (value) => {
    const when = new Date(value);
    if (Number.isNaN(when.getTime())) return "等待更新";
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(when).replace(/\//g, "/").replace(/\s+/, " ");
  };
  const modelRadarSummary = (point) => point
    ? `${modelRadarLabel(point)} · IQ ${point.iq.toFixed(2)} · $${point.average_price_usd.toFixed(2)}`
    : "暂无符合分档的数据";
  const updateHomeModelRadar = (recommendations = modelRadarRecommendations()) => {
    const recommendation = recommendations.high || recommendations.balanced;
    for (const badge of document.querySelectorAll('[data-dream-model-radar="home"]')) {
      setTextContent(badge, recommendation
        ? `推荐 ${modelRadarLabel(recommendation)} · IQ ${recommendation.iq.toFixed(2)}`
        : "推荐模型读取中");
    }
  };
  const removeModelRadarDom = () => {
    for (const id of MODEL_RADAR_IDS) removeQuotaElement(id);
  };
  const modelRadarEffortTerms = (effort) => ({
    low: ["low", "低"],
    medium: ["medium", "中"],
    high: ["high", "高"],
    xhigh: ["xhigh", "极高"],
    max: ["max", "最高"],
    ultra: ["ultra", "超高", "极限"],
  }[effort] || [effort]);
  const modelRadarNodeText = (node) =>
    String(node?.innerText || node?.textContent || "").trim().replace(/\s+/g, " ");
  const visibleModelRadarChoice = (node) => {
    if (!(node instanceof HTMLElement) || !node.isConnected ||
      node.closest("#codex-model-radar-popover")) return false;
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return false;
    return node.getClientRects().length > 0;
  };
  const tryNativeModelSelection = (point) => {
    const effortTerms = modelRadarEffortTerms(point.effort);
    const nativeButtons = [...document.querySelectorAll(
      '.composer-surface-chrome button[aria-haspopup="menu"]',
    )].filter((button) => visibleModelRadarChoice(button));
    const nativeButton = nativeButtons.find((button) =>
      modelRadarTextMatches(modelRadarNodeText(button), point)) || nativeButtons[0];
    if (!nativeButton) return;
    nativeButton.click();
    const startedAt = Date.now();
    let familyChosen = false;
    const applyVisibleChoice = () => {
      if (window[DISABLED_KEY] || Date.now() - startedAt > 1600) return;
      const choices = [...document.querySelectorAll(
        '[role="menuitem"], [role="option"], [role="radio"], [role="menu"] button',
      )].filter((node) => node !== nativeButton && visibleModelRadarChoice(node));
      const combined = choices.find((node) => {
        const text = modelRadarNodeText(node);
        return modelRadarTextMatches(text, point) &&
          effortTerms.some((term) => text.toLowerCase().includes(term.toLowerCase()));
      });
      if (combined) {
        combined.click();
        return;
      }
      if (!familyChosen) {
        const familyChoice = choices.find((node) => {
          return modelRadarTextMatches(modelRadarNodeText(node), point);
        });
        if (familyChoice) {
          familyChosen = true;
          familyChoice.click();
        }
      }
      const effortChoice = choices.find((node) => {
        const text = modelRadarNodeText(node).toLowerCase();
        return effortTerms.some((term) => text === term.toLowerCase() ||
          text.includes(term.toLowerCase()));
      });
      if (familyChosen && effortChoice) {
        effortChoice.click();
        return;
      }
      setTimeout(applyVisibleChoice, 90);
    };
    setTimeout(applyVisibleChoice, 60);
  };
  const selectModelRadarPoint = (point) => {
    const key = modelRadarPointKey(point);
    if (!key) return;
    modelRadarSelectionKey = key;
    try {
      localStorage.setItem(MODEL_RADAR_SELECTION_STORAGE_KEY, key);
    } catch {}
    updateModelRadarSurfaces();
    dispatchExperienceEvent("MODEL_UPDATED", {
      status: experienceModelPhase(modelRadarState),
      selectionKey: modelRadarSelectionKey,
    });
    tryNativeModelSelection(point);
  };
  const modelRadarRenderSignature = () => JSON.stringify({
    status: modelRadarState.status,
    updatedAt: modelRadarState.updatedAt,
    checkedAt: modelRadarState.checkedAt,
    fingerprint: modelRadarState.fingerprint,
    refreshing: modelRadarState.refreshing,
    refreshFeedback: modelRadarState.refreshFeedback,
    selection: modelRadarSelectionKey,
    points: modelRadarSortedPoints().map((point) => [
      modelRadarPointKey(point),
      Number(point.iq.toFixed(3)),
      Number(point.average_price_usd.toFixed(3)),
      Number.isFinite(point.average_minutes) ? Number(point.average_minutes.toFixed(3)) : null,
    ]),
  });
  const updateModelRadarView = (pill, popover) => {
    if (!pill || !popover) return;
    const recommendations = modelRadarRecommendations();
    const primary = recommendations.high || recommendations.balanced;
    let icon = pill.querySelector(".codex-model-radar-icon");
    let label = pill.querySelector(".codex-model-radar-label");
    let value = pill.querySelector(".codex-model-radar-value");
    let model = value?.querySelector(".codex-model-radar-model");
    let radarMeta = value?.querySelector(".codex-model-radar-header-meta");
    let radarPrice = value?.querySelector(".codex-model-radar-header-price");
    if (!icon || !label || !value || !model || !radarMeta || !radarPrice) {
      pill.replaceChildren();
      icon = document.createElement("span");
      icon.className = "codex-model-radar-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2.5 10.5 7.5 15.5 9l-5 1.5L9 15.5l-1.5-5L2.5 9l5-1.5L9 2.5Z"></path><path d="m14.2 2.2.35 1.25 1.25.35-1.25.35-.35 1.25-.35-1.25-1.25-.35 1.25-.35.35-1.25Z"></path></svg>';
      label = document.createElement("span");
      label.className = "codex-model-radar-label";
      value = document.createElement("strong");
      value.className = "codex-model-radar-value";
      model = document.createElement("span");
      model.className = "codex-model-radar-model";
      radarMeta = document.createElement("span");
      radarMeta.className = "codex-model-radar-header-meta";
      radarPrice = document.createElement("span");
      radarPrice.className = "codex-model-radar-header-price";
      value.append(model, radarMeta, radarPrice);
      pill.append(icon, label, value);
    }
    setTextContent(label, "推荐");
    /* Keep the compact header self-sufficient: the recommendation must expose
       the same IQ as the detail dialog; cost remains available in title/ARIA. */
    setTextContent(model, primary ? modelRadarLabel(primary) : "读取中");
    setTextContent(radarMeta, primary
      ? ` · IQ ${primary.iq.toFixed(2)}`
      : "");
    setTextContent(radarPrice, primary
      ? ` · $${primary.average_price_usd.toFixed(2)}`
      : "");
    const signature = modelRadarRenderSignature();
    if (popover.dataset.renderSignature === signature) {
      updateHomeModelRadar(recommendations);
      return;
    }
    popover.dataset.renderSignature = signature;

    /* Re-rendering the cards replaces the focused refresh button. Move focus
       to the dialog first so its focusout guard sees an in-dialog target and
       does not close an open popover during a refresh. */
    const preserveDialogFocus = !popover.hidden && popover.contains(document.activeElement);
    if (preserveDialogFocus) {
      try { popover.focus({ preventScroll: true }); } catch { popover.focus(); }
    }
    popover.replaceChildren();
    const head = document.createElement("div");
    head.className = "codex-model-radar-head";
    const heading = document.createElement("div");
    heading.className = "codex-model-radar-heading";
    const titleRow = document.createElement("div");
    titleRow.className = "codex-model-radar-title-row";
    const title = document.createElement("div");
    title.className = "codex-model-radar-title";
    title.textContent = "推荐模型 ·";
    titleRow.append(title);
    heading.append(titleRow);
    const meta = document.createElement("div");
    meta.className = "codex-model-radar-meta";
    const refreshVisualState = modelRadarState.refreshing
      ? "loading"
      : ["success", "error"].includes(modelRadarState.refreshFeedback)
        ? modelRadarState.refreshFeedback
        : "idle";
    const updated = document.createElement("time");
    updated.className = "codex-model-radar-data-time";
    updated.textContent = refreshVisualState === "success"
      ? "刚刚已刷新"
      : refreshVisualState === "error"
        ? "刷新失败"
        : `${formatModelRadarTime(modelRadarState.updatedAt)} \u6570\u636e`;
    const checked = document.createElement("span");
    checked.className = "codex-model-radar-check-time";
    checked.textContent = modelRadarState.refreshing
      ? "\u6b63\u5728\u68c0\u67e5\u66f4\u65b0\u2026"
      : modelRadarState.checkedAt
        ? `\u68c0\u67e5 ${formatModelRadarTime(modelRadarState.checkedAt)}`
        : "";
    const refresh = document.createElement("button");
    refresh.type = "button";
    refresh.className = "codex-model-radar-refresh";
    refresh.setAttribute("aria-label", refreshVisualState === "success"
      ? "模型数据已刷新"
      : refreshVisualState === "error"
        ? "刷新失败，点击重试"
        : "立即刷新模型数据");
    refresh.setAttribute("aria-busy", modelRadarState.refreshing ? "true" : "false");
    refresh.dataset.state = refreshVisualState;
    meta.dataset.state = refreshVisualState;
    refresh.disabled = modelRadarState.refreshing;
    const refreshIcon = document.createElement("img");
    refreshIcon.src = "https://api.iconify.design/solar/refresh-linear.svg?color=%23264a4d";
    refreshIcon.alt = "";
    refreshIcon.setAttribute("aria-hidden", "true");
    refresh.appendChild(refreshIcon);
    refresh.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void refreshModelRadar(true);
    });
    meta.append(updated, checked, refresh);
    head.append(heading, meta);

    const grid = document.createElement("div");
    grid.className = "codex-model-radar-grid";
    const primaryKey = modelRadarPointKey(primary);
    const bestKeys = modelRadarBestKeys();
    const valueScores = modelRadarValueScores();
    const bestValueScore = Math.max(...valueScores.values(), 0);
    for (const point of modelRadarDisplayPoints()) {
      const key = modelRadarPointKey(point);
      const valueScore = valueScores.get(key) || 28;
      const card = document.createElement("button");
      card.type = "button";
      card.className = "codex-model-radar-card";
      card.dataset.family = modelRadarFamily(point).toLowerCase().replace(/\./g, "-");
      card.dataset.effort = point.effort;
      card.dataset.selected = key === modelRadarSelectionKey ? "true" : "false";
      card.dataset.recommended = key === primaryKey ? "true" : "false";
      card.dataset.best = bestKeys.has(key) ? "true" : "false";
      card.style.setProperty("--model-radar-value", `${valueScore}%`);
      card.style.setProperty("--model-radar-value-opacity", String(0.45 + valueScore * 0.005));
      card.setAttribute("aria-pressed", key === modelRadarSelectionKey ? "true" : "false");
      card.setAttribute("aria-label", `选择 ${modelRadarSummary(point)}`);
      card.title = `${modelRadarSummary(point)} · 性价比 ${valueScore}/100`;

      const artwork = document.createElement("span");
      artwork.className = "codex-model-radar-card-artwork";
      const artworkImage = document.createElement("img");
      artworkImage.src = modelRadarArtwork(point);
      artworkImage.alt = "";
      artworkImage.setAttribute("aria-hidden", "true");
      artwork.appendChild(artworkImage);
      const content = document.createElement("span");
      content.className = "codex-model-radar-card-content";
      const name = document.createElement("span");
      name.className = "codex-model-radar-card-name";
      name.textContent = modelRadarLabel(point);
      const iq = document.createElement("strong");
      iq.className = "codex-model-radar-card-iq";
      iq.textContent = point.iq.toFixed(2);
      const price = document.createElement("span");
      price.className = "codex-model-radar-card-price";
      price.textContent = `$${point.average_price_usd.toFixed(2)}`;
      const badges = document.createElement("span");
      badges.className = "codex-model-radar-card-badges";
      const badgeSpecs = [];
      if (bestKeys.has(key)) badgeSpecs.push(["最优", "best"]);
      if (valueScore === bestValueScore) badgeSpecs.push(["性价比", "value"]);
      if (key === primaryKey) badgeSpecs.push(["推荐", "recommended"]);
      for (const [badgeLabel, badgeKind] of badgeSpecs) {
        const badge = document.createElement("span");
        badge.className = "codex-model-radar-card-badge";
        badge.dataset.kind = badgeKind;
        badge.textContent = badgeLabel;
        badges.appendChild(badge);
      }
      badges.hidden = !badgeSpecs.length;
      const progress = document.createElement("span");
      progress.className = "codex-model-radar-card-progress";
      progress.setAttribute("aria-hidden", "true");
      const progressFill = document.createElement("span");
      progress.appendChild(progressFill);
      content.append(name, iq);
      card.append(artwork, content, price, badges, progress);
      card.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        selectModelRadarPoint(point);
      });
      grid.appendChild(card);
    }

    const footer = document.createElement("div");
    footer.className = "codex-model-radar-footer";
    const legend = document.createElement("span");
    legend.className = "codex-model-radar-legend";
    legend.textContent = "横条越长，综合性价比越高";
    const source = document.createElement("span");
    source.className = "codex-model-radar-source";
    const sourcePrefix = "\u6570\u636e\u6765\u6e90\uff1aCodex Radar";
    source.textContent = modelRadarState.status === "live"
      ? `${sourcePrefix} · 实时`
      : modelRadarState.status === "cached"
        ? `${sourcePrefix} · 最近有效缓存`
        : `${sourcePrefix} · 暂无可用数据`;
    footer.append(legend, source);
    head.insertBefore(footer, meta);
    popover.append(head, grid);
    const pillTitle = primary ? `推荐模型 ${modelRadarSummary(primary)}` : "推荐模型读取中";
    setAttribute(pill, "title", pillTitle);
    setAttribute(pill, "aria-label", pillTitle);
    updateHomeModelRadar();
  };
  const positionModelRadarPopover = (pill, popover) => {
    if (!pill || !popover) return;
    const rect = pill.getBoundingClientRect();
    const viewportWidth = Number(globalThis.innerWidth) || document.documentElement.clientWidth || 800;
    const viewportHeight = Number(globalThis.innerHeight) || document.documentElement.clientHeight || 600;
    const viewportPadding = 16;
    const sidebar = document.querySelector(
      "aside.app-shell-left-panel, aside[data-testid=\"app-shell-floating-left-panel\"]",
    );
    const sidebarRect = sidebar?.getBoundingClientRect?.();
    const contentLeft = sidebarRect?.width > 0
      ? Math.round(sidebarRect.right + viewportPadding)
      : viewportPadding;
    /* The native side panel is a sibling of the main viewport and can stay
       mounted while the title bar still spans the full window. Do not let a
       fixed recommendation dialog paint over that panel. Its stable shape is
       a second, full-height aside; content text varies by the selected tool. */
    const rightPanel = [...document.querySelectorAll("aside")].find((candidate) => {
      if (candidate === sidebar) return false;
      const candidateRect = candidate.getBoundingClientRect?.();
      const candidateStyle = getComputedStyle(candidate);
      return candidateRect && candidateRect.left > contentLeft - 1 &&
        candidateRect.left < viewportWidth && candidateRect.width >= 280 &&
        candidateRect.height >= Math.max(240, viewportHeight * 0.55) &&
        candidateRect.right > 0 && candidateRect.top < viewportHeight &&
        candidateStyle.display !== "none" && candidateStyle.visibility !== "hidden" &&
        Number(candidateStyle.opacity || 1) > 0;
    });
    const rightPanelRect = rightPanel?.getBoundingClientRect?.();
    const contentRight = rightPanelRect
      ? Math.max(contentLeft, Math.min(viewportWidth - viewportPadding,
        Math.round(rightPanelRect.left - viewportPadding)))
      : viewportWidth - viewportPadding;
    const availableWidth = Math.max(0, contentRight - contentLeft);
    const viewportMaxWidth = Math.max(180, viewportWidth - viewportPadding * 2);
    const width = Math.min(520, viewportMaxWidth,
      Math.max(180, availableWidth || viewportMaxWidth));
    popover.style.width = `${Math.round(width)}px`;
    popover.style.maxWidth = `${Math.round(viewportMaxWidth)}px`;
    setAttribute(popover, "data-dream-model-radar-layout",
      width < 330 ? "narrow" : width < 460 ? "compact" : "wide");
    const minLeft = contentLeft;
    const maxLeft = Math.max(minLeft, contentRight - width);
    const centeredLeft = rect.left + (rect.width - width) / 2;
    popover.style.left = `${Math.round(Math.max(minLeft, Math.min(maxLeft, centeredLeft)))}px`;
    const popoverHeight = Math.max(180, popover.getBoundingClientRect().height || 0);
    const centeredTop = rect.bottom + 12;
    popover.style.top = `${Math.round(Math.max(12, Math.min(viewportHeight - popoverHeight - 12, centeredTop)))}px`;
  };
  const resolveExperienceHeaderHost = (host) => {
    let current = host;
    while (current instanceof Element &&
      current.getAttribute(EXPERIENCE_HEADER_GROUP_ATTR) === "true") {
      current = current.parentElement;
    }
    return current instanceof Element ? current : null;
  };
  const findExperienceHeaderGroup = (host) => {
    host = resolveExperienceHeaderHost(host);
    if (!(host instanceof Element)) return null;
    return [...host.children].find((node) =>
      node.getAttribute?.(EXPERIENCE_HEADER_GROUP_ATTR) === "true",
    ) || null;
  };
  const ensureExperienceHeaderGroup = (host) => {
    host = resolveExperienceHeaderHost(host);
    if (!(host instanceof Element)) return null;
    ensureHeaderInteractionHost(host);
    const existing = findExperienceHeaderGroup(host);
    if (existing) {
      ensureHeaderHitTestTarget(existing);
      return existing;
    }
    const group = document.createElement("div");
    group.className = "codex-experience-header-slot-group";
    group.setAttribute(EXPERIENCE_HEADER_GROUP_ATTR, "true");
    ensureHeaderHitTestTarget(group);
    host.appendChild(group);
    return group;
  };
  const ensureModelRadar = (host, quotaPill = null) => {
    host = resolveExperienceHeaderHost(host);
    if (!host || !experienceHeaderSlotEnabled("recommendation")) {
      removeModelRadarDom();
      return;
    }
    let pill = findHeaderUiNode("codex-model-radar-pill");
    let popover = findHeaderUiNode("codex-model-radar-popover");
    if (!pill || !popover) {
      removeModelRadarDom();
      pill = rememberHeaderUiNode(document.createElement("button"));
      pill.id = "codex-model-radar-pill";
      pill.type = "button";
      pill.setAttribute("aria-haspopup", "dialog");
      pill.setAttribute("aria-controls", "codex-model-radar-popover");
      pill.setAttribute("aria-expanded", "false");
      rememberHeaderUiNode(pill);
      popover = rememberHeaderUiNode(document.createElement("div"));
      popover.id = "codex-model-radar-popover";
      popover.setAttribute("role", "dialog");
      popover.setAttribute("aria-label", "推荐模型详情");
      popover.tabIndex = -1;
      popover.hidden = true;
      rememberHeaderUiNode(popover);
      document.body?.appendChild(popover);
      let hideTimer = null;
      let ignoreFocusoutUntil = 0;
      let dialogDismissCleanup = () => {};
      let clickPinned = false;
      let modelRadarRepositionCleanup = null;
      let modelRadarLayoutObserver = null;
      const modelRadarLayoutTargets = new Set();
      const repositionModelRadar = () => {
        if (!popover.hidden) positionModelRadarPopover(pill, popover);
      };
      const observeModelRadarLayoutTargets = () => {
        if (!modelRadarLayoutObserver) return;
        const targets = [
          document.querySelector("main:is(.main-surface, [class*=\"_MainContentSurface_\"])")?.querySelector(
            "[class*=\"_MainContentViewport_\"]",
          ),
          document.querySelector("main:is(.main-surface, [class*=\"_MainContentSurface_\"])")?.querySelector(
            "[class*=\"_MainContentClip_\"]",
          ),
          document.querySelector("aside.app-shell-left-panel"),
          ...document.querySelectorAll("aside"),
        ];
        for (const target of targets) {
          if (!(target instanceof Element) || modelRadarLayoutTargets.has(target)) continue;
          modelRadarLayoutTargets.add(target);
          modelRadarLayoutObserver.observe(target);
        }
      };
      const stopModelRadarRepositionTracking = () => {
        modelRadarRepositionCleanup?.();
        modelRadarRepositionCleanup = null;
        modelRadarLayoutObserver?.disconnect?.();
        modelRadarLayoutObserver = null;
        modelRadarLayoutTargets.clear();
      };
      const startModelRadarRepositionTracking = () => {
        if (!modelRadarRepositionCleanup) {
          modelRadarRepositionCleanup = resizeCoordinator.subscribe(
            repositionModelRadar,
            { scroll: true },
          );
        }
        if (!modelRadarLayoutObserver && typeof ResizeObserver === "function") {
          modelRadarLayoutObserver = new ResizeObserver(() => {
            observeModelRadarLayoutTargets();
            repositionModelRadar();
          });
        }
        observeModelRadarLayoutTargets();
      };
      const hide = () => {
        if (hideTimer) clearTimeout(hideTimer);
        clickPinned = false;
        stopModelRadarRepositionTracking();
        popover.hidden = true;
        pill.setAttribute("aria-expanded", "false");
      };
      const focusDialog = () => {
        const target = popover.querySelector(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) || popover;
        try { target.focus({ preventScroll: true }); } catch { target.focus(); }
      };
      const show = (refresh = false, moveFocus = false, pin = false) => {
        if (hideTimer) clearTimeout(hideTimer);
        if (pin) clickPinned = true;
        popover.hidden = false;
        pill.setAttribute("aria-expanded", "true");
        startModelRadarRepositionTracking();
        positionModelRadarPopover(pill, popover);
        if (refresh) void refreshModelRadar(true);
        if (moveFocus) focusDialog();
      };
      const scheduleHide = () => {
        if (clickPinned) return;
        if (popover.contains(document.activeElement)) return;
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(hide, 160);
      };
      const outsideClick = (event) => {
        if (!pill.contains(event.target) && !popover.contains(event.target)) hide();
      };
      pill.addEventListener("mouseenter", () => show());
      pill.addEventListener("focus", () => {
        if (pill.__codexSuppressDialogFocusOpen) return;
        show(true);
      });
      /* Mouseenter opens before click. A real click pins the panel open so it
         remains alive while the pointer travels from the title bar. */
      pill.addEventListener("click", (event) => {
        ignoreFocusoutUntil = performance.now() + 420;
        show(true, event.detail === 0, true);
      });
      pill.addEventListener("mouseleave", scheduleHide);
      popover.addEventListener("mouseenter", () => hideTimer && clearTimeout(hideTimer));
      popover.addEventListener("mouseleave", scheduleHide);
      document.addEventListener("click", outsideClick, true);
      dialogDismissCleanup = installDialogDismiss(
        pill,
        popover,
        hide,
        () => performance.now() < ignoreFocusoutUntil,
      );
      const cleanupControls = () => {
        if (hideTimer) clearTimeout(hideTimer);
        stopModelRadarRepositionTracking();
        document.removeEventListener("click", outsideClick, true);
        dialogDismissCleanup();
        dialogDismissCleanup = () => {};
      };
      pill.__codexQuotaCleanup = cleanupControls;
      popover.__codexQuotaCleanup = cleanupControls;
    }
    ensureHeaderHitTestTarget(pill);
    ensureHeaderHitTestTarget(popover);
    const group = findExperienceHeaderGroup(host);
    const target = group || host;
    if (pill.parentElement !== target) {
      if (quotaPill?.parentElement === target) target.insertBefore(pill, quotaPill);
      else target.appendChild(pill);
    }
    setAttribute(pill, "data-dream-experience-slot", "recommendation");
    if (popover.parentElement !== document.body) document.body?.appendChild(popover);
    updateModelRadarView(pill, popover);
  };

  const ensureRecommendationHeader = () => {
    if (!isRendererVisible()) {
      backgroundRepairPending = true;
      return;
    }
    const root = document.documentElement;
    const skinMode = root?.getAttribute("data-dream-skin");
    if (!root || !["active", "home-native"].includes(skinMode) ||
      !experienceHeaderSlotEnabled("recommendation")) {
      removeModelRadarDom();
      return;
    }
    const header = findTaskHeader();
    const host = findHeaderQuotaHost(header);
    if (!host) return;
    const quotaPill = findHeaderUiNode("codex-quota-pill");
    ensureModelRadar(host, quotaPill?.parentElement === host ? quotaPill : null);
    arrangeExperienceHeaderSlots(host);
  };
  const removeBackgroundSwitcher = () => {
    const nodes = new Set([
      ...document.querySelectorAll(`[id="${BACKGROUND_SWITCHER_ID}"]`),
      persistentHeaderUiNodes.get(BACKGROUND_SWITCHER_ID),
      document.getElementById(BACKGROUND_SWITCHER_MENU_ID),
    ]);
    for (const node of nodes) {
      node?.__codexBackgroundSwitcherCleanup?.();
      node?.remove?.();
    }
    persistentHeaderUiNodes.delete(BACKGROUND_SWITCHER_ID);
  };
  const positionBackgroundSwitcherMenu = (button, menu) => {
    if (!button || !menu || menu.hidden) return;
    const rect = button.getBoundingClientRect();
    const width = Math.max(196, Math.min(236, window.innerWidth - 16));
    menu.style.width = `${width}px`;
    const menuHeight = menu.offsetHeight || 220;
    const left = Math.min(Math.max(8, rect.right - width), Math.max(8, window.innerWidth - width - 8));
    const below = rect.bottom + 7;
    const top = below + menuHeight <= window.innerHeight - 8
      ? below : Math.max(8, rect.top - menuHeight - 7);
    menu.style.left = `${Math.round(left)}px`;
    menu.style.top = `${Math.round(top)}px`;
  };
  const updateBackgroundSwitcherView = (button, menu) => {
    const current = activeThemeOption();
    const labelText = current?.label || "主题";
    const label = button.querySelector(".codex-background-switcher-label");
    setTextContent(label, labelText);
    setAttribute(button, "title", `切换主题：当前为${labelText}`);
    setAttribute(button, "aria-label", `切换主题，当前为${labelText}`);
    setAttribute(button, "aria-haspopup", "menu");
    setAttribute(button, "aria-expanded", menu && !menu.hidden ? "true" : "false");
    setAttribute(button, "data-theme-id", current?.id || "default");
    if (!menu) return;
    const currentId = current?.id || "";
    const options = themeOptions();
    const optionSignature = options
      .map((option) => `${option.id}:${option.label}:${option.native === true ? "native" : "skin"}`)
      .join("\u001f");
    menu.setAttribute("aria-label", "主题选择");
    /* Do not rebuild the menu on every mutation repair. Replacing its
       children while it is open can discard the focused item and makes the
       native -> skin switch feel intermittent. Re-render only when the
       option list itself changes, then update the checked state in place. */
    if (menu.dataset.codexThemeOptionsSignature !== optionSignature ||
      menu.children.length !== options.length) {
      menu.replaceChildren();
      for (const option of options) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "codex-background-theme-option";
        item.setAttribute("role", "menuitemradio");
        item.setAttribute("data-theme-id", option.id);
        const optionLabel = document.createElement("span");
        optionLabel.className = "codex-background-theme-option-label";
        optionLabel.textContent = option.label;
        const optionState = document.createElement("span");
        optionState.className = "codex-background-theme-option-state";
        optionState.setAttribute("aria-hidden", "true");
        item.append(optionLabel, optionState);
        item.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setActiveThemeOption(option.id, { persist: true, animate: true });
          menu.hidden = true;
          updateBackgroundSwitcherView(button, menu);
        });
        menu.appendChild(item);
      }
      menu.dataset.codexThemeOptionsSignature = optionSignature;
    }
    for (const item of menu.querySelectorAll('[role="menuitemradio"]')) {
      const selected = item.getAttribute("data-theme-id") === currentId;
      item.setAttribute("aria-checked", selected ? "true" : "false");
      item.tabIndex = selected ? 0 : -1;
      setTextContent(
        item.querySelector(".codex-background-theme-option-state"),
        selected ? "当前" : "",
      );
    }
    if (!menu.hidden) positionBackgroundSwitcherMenu(button, menu);
  };
  const arrangeExperienceHeaderSlots = (host) => {
    host = resolveExperienceHeaderHost(host);
    if (!host) return;
    const group = ensureExperienceHeaderGroup(host);
    if (!group) return;
    ensureHeaderHitTestTarget(group);
    const nodes = new Map(Object.entries(EXPERIENCE_HEADER_SLOT_IDS).map(([slot, id]) => [
      slot, document.getElementById(id),
    ]));
    /* A previous renderer revision could leave a slot inside an obsolete
       group when the native header remounted. Pull the persistent controls
       back to the current header before rebuilding their visual order. */
    for (const node of nodes.values()) {
      if (!(node instanceof Element) || host.contains(node)) continue;
      if (node.closest(`[${EXPERIENCE_HEADER_GROUP_ATTR}="true"]`)) host.appendChild(node);
    }
    const order = experienceHeaderSlotOrder();
    const desired = order
      .filter((slot) => experienceHeaderSlotEnabled(slot))
      .map((slot) => nodes.get(slot))
      .filter((node) => node instanceof Element && host.contains(node));
    if (!desired.length) {
      group.remove();
      clearNativeHeaderTracks(host);
      for (const nested of document.querySelectorAll(`[${EXPERIENCE_HEADER_GROUP_ATTR}="true"]`)) {
        nested.remove();
      }
      removeExperienceHeaderHoverBridge();
      return;
    }
    const nestedGroups = [...document.querySelectorAll(`[${EXPERIENCE_HEADER_GROUP_ATTR}="true"]`)]
      .filter((nested) => nested !== group);
    setAttribute(group, "data-dream-experience-header-root", host.matches("header") ? "true" : "false");
    const firstDirectSlot = [...host.children].find((node) => desired.includes(node));
    if (group.parentElement !== host) host.appendChild(group);
    if (firstDirectSlot && firstDirectSlot !== group) host.insertBefore(group, firstDirectSlot);
    desired.forEach((node, index) => {
      const slot = order.find((candidate) => nodes.get(candidate) === node);
      ensureHeaderHitTestTarget(node);
      setAttribute(node, "data-dream-experience-slot", slot || "");
      setAttribute(node, "data-dream-experience-order", String(index));
      group.appendChild(node);
    });
    nestedGroups.forEach((nested) => nested.remove());
    markNativeHeaderTracks(host, group);
  };
  const getBackgroundSwitcherHost = (radar, quota) => {
    const hostForSlot = (node) => resolveExperienceHeaderHost(node?.parentElement);
    if (radar?.parentElement) return hostForSlot(radar);
    if (quota?.parentElement) return hostForSlot(quota);
    return document.querySelector(TASK_HEADER_SELECTOR) || null;
  };
  const ensureBackgroundSwitcher = () => {
    if (!isRendererVisible()) {
      backgroundRepairPending = true;
      return;
    }
    const root = document.documentElement;
    const skinMode = root?.getAttribute("data-dream-skin");
    if (!root || !["active", "home-native", "native"].includes(skinMode) ||
      backgroundVariants.length < 1 || !experienceHeaderSlotEnabled("theme")) {
      removeBackgroundSwitcher();
      return;
    }
    const radar = findHeaderUiNode("codex-model-radar-pill");
    const quota = findHeaderUiNode("codex-quota-pill");
    const host = getBackgroundSwitcherHost(radar, quota);
    if (!host) return;
    let button = findHeaderUiNode(BACKGROUND_SWITCHER_ID);
    let menu = document.getElementById(BACKGROUND_SWITCHER_MENU_ID);
    if (!button) {
      button = rememberHeaderUiNode(document.createElement("button"));
      button.id = BACKGROUND_SWITCHER_ID;
      button.type = "button";
      button.className = "codex-background-switcher";
      button.innerHTML = '<svg class="codex-background-switcher-icon" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 11.5c1.4-2.7 3-4.1 4.8-4.1 1.8 0 2.6 1.6 3.9 1.6 1 0 1.8-.6 2.3-1.8M3 14.5c1.6-1.8 3-2.6 4.5-2.6 1.7 0 2.5 1.1 4 1.1 1.2 0 2.2-.5 3.5-1.8M5 4.4h.01M9 3.1h.01M13.5 4.7h.01" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"></path><path d="m12.5 6.3 2.1 2.1-2.1 2.1" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="codex-background-switcher-label"></span>';
      rememberHeaderUiNode(button);
    }
    if (!menu) {
      menu = document.createElement("div");
      menu.id = BACKGROUND_SWITCHER_MENU_ID;
      menu.className = "codex-background-switcher-menu";
      menu.setAttribute("role", "menu");
      menu.hidden = true;
      document.body?.appendChild(menu);
    }
    if (!button.__codexBackgroundSwitcherBound) {
      const setMenuOpen = (open) => {
        menu.hidden = !open;
        setAttribute(button, "aria-expanded", open ? "true" : "false");
        unsubscribeViewportChange.setScroll?.(open);
        if (open) {
          updateBackgroundSwitcherView(button, menu);
          positionBackgroundSwitcherMenu(button, menu);
          menu.querySelector('[aria-checked="true"]')?.focus();
        }
      };
      const onButtonClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setMenuOpen(menu.hidden);
      };
      const onButtonKeydown = (event) => {
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setMenuOpen(true);
        }
      };
      const onMenuKeydown = (event) => {
        const items = [...menu.querySelectorAll('[role="menuitemradio"]')];
        const currentIndex = items.indexOf(document.activeElement);
        if (event.key === "Escape") {
          event.preventDefault();
          setMenuOpen(false);
          button.focus();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const delta = event.key === "ArrowDown" ? 1 : -1;
          items[(currentIndex + delta + items.length) % items.length]?.focus();
        }
      };
      const onOutsideClick = (event) => {
        if (!button.contains(event.target) && !menu.contains(event.target)) setMenuOpen(false);
      };
      const unsubscribeViewportChange = resizeCoordinator.subscribe(
        () => positionBackgroundSwitcherMenu(button, menu),
      );
      button.addEventListener("click", onButtonClick);
      button.addEventListener("keydown", onButtonKeydown);
      menu.addEventListener("keydown", onMenuKeydown);
      document.addEventListener("pointerdown", onOutsideClick, true);
      button.__codexBackgroundSwitcherBound = true;
      button.__codexBackgroundSwitcherCleanup = () => {
        unsubscribeViewportChange();
        button.removeEventListener("click", onButtonClick);
        button.removeEventListener("keydown", onButtonKeydown);
        menu.removeEventListener("keydown", onMenuKeydown);
        document.removeEventListener("pointerdown", onOutsideClick, true);
        delete button.__codexBackgroundSwitcherBound;
      };
    }
    ensureHeaderHitTestTarget(button);
    ensureHeaderHitTestTarget(menu);
    const group = findExperienceHeaderGroup(host);
    const target = group || host;
    const anchor = [radar, quota].find((node) => node?.parentElement === target) ||
      target.firstElementChild;
    if (button.parentElement !== target) {
      target.insertBefore(button, anchor || null);
    }
    setAttribute(button, "data-dream-experience-slot", "theme");
    if (menu.parentElement !== document.body) document.body?.appendChild(menu);
    updateBackgroundSwitcherView(button, menu);
    arrangeExperienceHeaderSlots(host);
  };
  const updateModelRadarSurfaces = () => {
    const pill = document.getElementById("codex-model-radar-pill");
    const popover = document.getElementById("codex-model-radar-popover");
    if (pill && popover) updateModelRadarView(pill, popover);
    else updateHomeModelRadar();
  };
  const requestModelRadarDirect = async (url, timeoutMs, force = false) => {
    if (typeof globalThis.fetch !== "function") return null;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timeout = setTimeout(() => controller?.abort(), timeoutMs);
    try {
      const response = await globalThis.fetch(url, {
        method: "GET",
        cache: force ? "reload" : "default",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          ...(force ? { "Cache-Control": "no-cache", Pragma: "no-cache" } : {}),
        },
        signal: controller?.signal,
      });
      if (!response.ok) return null;
      const payload = await response.json();
      return payload && typeof payload === "object" ? payload : null;
    } finally {
      clearTimeout(timeout);
    }
  };
  const modelRadarFiniteNumber = (value) => {
    if (typeof value === "boolean" || value == null || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };
  /* The page API intentionally returns the complete table rather than the
     already aggregated points used by the static snapshot. Mirror the small
     aggregation the page performs so both surfaces use identical IQ/price
     values and recommendation ordering. */
  const aggregateModelRadarTable = (payload) => {
    if (payload?.schema !== 1 || !Array.isArray(payload?.combos) ||
      !Array.isArray(payload?.tasks) || !payload?.cells ||
      typeof payload.cells !== "object") return null;
    const points = [];
    let sourceUpdatedAt = 0;
    for (const combo of payload.combos) {
      const model = String(combo?.model || "").trim();
      const effort = String(combo?.effort || "").trim().toLowerCase();
      if (!model || !effort) continue;
      let passed = 0;
      let validTasks = 0;
      let durationSum = 0;
      let durationSamples = 0;
      let priceSum = 0;
      let priceSamples = 0;
      let incompleteCostSamples = 0;
      let latestGradedAt = 0;
      for (const task of payload.tasks) {
        if (!task || task.id == null) continue;
        const runners = payload.cells[`${task.id}|${model}|${effort}`]?.ran_by;
        if (Array.isArray(runners)) {
          /* Match the page: the first runner is the latest valid result for a
             task in the table's deterministic ordering. */
          const runner = runners[0];
          if (runner && typeof runner === "object") {
            if (typeof runner.passed === "boolean") {
              validTasks += 1;
              if (runner.passed) passed += 1;
            }
            const duration = modelRadarFiniteNumber(runner.duration_sec);
            if (duration != null && duration > 0) {
              durationSum += duration / 60;
              durationSamples += 1;
            }
            const price = modelRadarFiniteNumber(runner.actual_cost_usd);
            if (price != null && price >= 0) {
              if (effort !== "ultra" || runner.cost_complete === true) {
                priceSum += price;
                priceSamples += 1;
              } else {
                incompleteCostSamples += 1;
              }
            }
            const gradedAt = Date.parse(String(runner.graded_at || ""));
            if (Number.isFinite(gradedAt)) {
              latestGradedAt = Math.max(latestGradedAt, gradedAt);
              sourceUpdatedAt = Math.max(sourceUpdatedAt, gradedAt);
            }
          }
        }
      }
      if (!validTasks || !priceSamples) continue;
      points.push({
        model,
        effort,
        iq: passed / validTasks * 150,
        average_price_usd: priceSum / priceSamples,
        average_minutes: durationSamples ? durationSum / durationSamples : null,
        passed,
        valid_tasks: validTasks,
        price_samples: priceSamples,
        duration_samples: durationSamples,
        incomplete_cost_samples: incompleteCostSamples,
        latest_graded_at: latestGradedAt ? new Date(latestGradedAt).toISOString() : null,
      });
    }
    const normalizedPoints = points.map(modelRadarPoint).filter(Boolean);
    if (!normalizedPoints.length) return null;
    const updatedAt = sourceUpdatedAt
      ? new Date(sourceUpdatedAt).toISOString()
      : String(payload.baseline_generated_at || new Date().toISOString());
    const fingerprint = [
      payload.baseline_generated_at,
      payload.discrimination_generated_at,
      updatedAt,
    ].filter(Boolean).join("|");
    return {
      points: normalizedPoints,
      source_updated_at: updatedAt,
      fingerprint,
    };
  };
  const normalizeModelRadarPayload = (payload) => {
    if (!payload || typeof payload !== "object") return null;
    if (Array.isArray(payload.points)) {
      const points = payload.points.map(modelRadarPoint).filter(Boolean);
      return points.length ? {
        payload,
        points,
      } : null;
    }
    const aggregate = aggregateModelRadarTable(payload);
    if (!aggregate) return null;
    return {
      payload: { ...payload, ...aggregate },
      points: aggregate.points,
    };
  };
  /* The public page prefers the weighted latest-three live metrics payload.
     Keep its IQ/price/minutes values intact so the compact desktop selector
     chooses the same recommendation as the page. The endpoint currently
     publishes schema 3 / equal_latest_3 as well; keep both live shapes ahead
     of the older table and snapshot fallbacks. */
  const normalizeModelRadarMetricsPayload = (payload) => {
    const schema = Number(payload?.schema);
    const mode = String(payload?.mode || "");
    if (![2, 3].includes(schema) ||
      !["weighted_latest_3", "equal_latest_3"].includes(mode) ||
      !Array.isArray(payload.points)) return null;
    const points = payload.points.map((point) => modelRadarPoint({
      ...point,
      passed: modelRadarFiniteNumber(point?.weighted_passed ?? point?.passed),
      valid_tasks: modelRadarFiniteNumber(point?.weighted_total ?? point?.total),
    })).filter(Boolean);
    if (!points.length) return null;
    return {
      payload: { ...payload, points },
      points,
    };
  };
  const parseModelRadarPublicBody = (body) => {
    if (typeof body !== "string" || !body) return null;
    try {
      const payload = JSON.parse(body);
      return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
    } catch {
      return null;
    }
  };
  const modelRadarSourceUrl = (sourceUrl, force) => {
    if (!force) return sourceUrl;
    /* A fixed `refresh=1` still lets the Electron bridge or an upstream CDN
       reuse the same response. Make every manual refresh a genuinely new
       request while keeping the normal polling URL cache-friendly. */
    const separator = sourceUrl.includes("?") ? "&" : "?";
    return `${sourceUrl}${separator}refresh=${Date.now()}`;
  };
  const requestModelRadarSource = async (sourceUrl, force) => {
    const url = modelRadarSourceUrl(sourceUrl, force);
    const bridgePayload = await requestElectronBridge(
      url,
      MODEL_RADAR_REQUEST_TIMEOUT_MS,
      {
        Accept: "application/json",
        ...(force ? { "Cache-Control": "no-cache", Pragma: "no-cache" } : {}),
      },
    );
    if (bridgePayload) return bridgePayload;
    const publicBody = await requestPublicFetch(url, MODEL_RADAR_REQUEST_TIMEOUT_MS);
    const publicPayload = parseModelRadarPublicBody(publicBody);
    if (publicPayload) return publicPayload;
    if (location.protocol === "app:") return null;
    return requestModelRadarDirect(url, MODEL_RADAR_REQUEST_TIMEOUT_MS, force);
  };
  const readModelRadarPayload = async (force = false) => {
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const sources = [
        [MODEL_RADAR_METRICS_URL, normalizeModelRadarMetricsPayload],
        [MODEL_RADAR_TABLE_URL, normalizeModelRadarPayload],
        [MODEL_RADAR_SNAPSHOT_URL, normalizeModelRadarPayload],
      ];
      for (const [sourceUrl, normalize] of sources) {
        try {
          const rawPayload = await requestModelRadarSource(sourceUrl, force);
          const normalized = normalize(rawPayload);
          if (!normalized) throw new Error("No intelligence-efficiency points");
          return normalized;
        } catch (error) {
          lastError = error;
        }
      }
      if (attempt === 0 && !window[DISABLED_KEY]) {
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }
    throw lastError || new Error("Model radar request failed");
  };
  const modelRadarCacheTimestamp = (state) => {
    for (const value of [state?.cachedAt, state?.checkedAt, state?.updatedAt]) {
      const timestamp = Date.parse(String(value || ""));
      if (Number.isFinite(timestamp)) return timestamp;
    }
    return 0;
  };
  const hasFreshModelRadarCache = (state, nowTimestamp = Date.now()) => {
    if (!Array.isArray(state?.points) || !state.points.length) return false;
    const cachedAt = modelRadarCacheTimestamp(state);
    if (!cachedAt) return false;
    const age = nowTimestamp - cachedAt;
    return age >= 0 && age <= MODEL_RADAR_CACHE_MAX_AGE_MS;
  };
  const readModelRadarCache = () => {
    try {
      const cached = JSON.parse(localStorage.getItem(MODEL_RADAR_STORAGE_KEY) || "null");
      const cachedPoints = Array.isArray(cached?.points)
        ? cached.points.map(modelRadarPoint).filter(Boolean) : [];
      const state = {
        status: "cached",
        updatedAt: String(cached?.updatedAt || ""),
        checkedAt: String(cached?.checkedAt || ""),
        cachedAt: String(cached?.cachedAt || cached?.checkedAt || cached?.updatedAt || ""),
        fingerprint: String(cached?.fingerprint || cached?.updatedAt || ""),
        refreshing: false,
        refreshFeedback: "",
        points: cachedPoints,
      };
      return hasFreshModelRadarCache(state) ? state : null;
    } catch {
      return null;
    }
  };
  const scheduleModelRadarRetry = () => {
    if (modelRadarRetryTimer) clearTimeout(modelRadarRetryTimer);
    const delay = Math.min(
      MODEL_RADAR_RETRY_MAX_MS,
      MODEL_RADAR_RETRY_BASE_MS * (2 ** Math.min(modelRadarRetryCount - 1, 3)),
    );
    modelRadarRetryTimer = setTimeout(() => {
      modelRadarRetryTimer = null;
      if (!window[DISABLED_KEY] && experienceHeaderSlotEnabled("recommendation")) {
        void refreshModelRadar();
      }
    }, delay);
  };
  const refreshModelRadar = async (force = false) => {
    if (nativeThemeSelected || !experienceHeaderSlotEnabled("recommendation") || window[DISABLED_KEY]) {
      return null;
    }
    if (modelRadarRequest) return modelRadarRequest;
    if (force && modelRadarFeedbackTimer) clearTimeout(modelRadarFeedbackTimer);
    if (force) modelRadarFeedbackTimer = null;
    const refreshStartedAt = Date.now();
    modelRadarState = {
      ...modelRadarState,
      refreshing: true,
      refreshFeedback: force ? "" : modelRadarState.refreshFeedback,
    };
    updateModelRadarSurfaces();
    dispatchExperienceEvent("MODEL_UPDATED", {
      status: experienceModelPhase(modelRadarState),
      selectionKey: modelRadarSelectionKey,
    });
    modelRadarRequest = (async () => {
      const checkedAt = new Date().toISOString();
      try {
        const { payload, points } = await readModelRadarPayload(force);
        if (window[DISABLED_KEY]) return modelRadarState;
        modelRadarRetryCount = 0;
        if (modelRadarRetryTimer) clearTimeout(modelRadarRetryTimer);
        modelRadarRetryTimer = null;
        if (force) {
          const remainingFeedbackDelay = Math.max(0, 520 - (Date.now() - refreshStartedAt));
          if (remainingFeedbackDelay) {
            await new Promise((resolve) => setTimeout(resolve, remainingFeedbackDelay));
          }
        }
        modelRadarState = {
          status: "live",
          updatedAt: String(payload.source_updated_at || checkedAt),
          checkedAt,
          cachedAt: checkedAt,
          fingerprint: String(payload.fingerprint || payload.source_updated_at || ""),
          refreshing: false,
          refreshFeedback: force ? "success" : "",
          points,
        };
        try {
          localStorage.setItem(MODEL_RADAR_STORAGE_KEY, JSON.stringify(modelRadarState));
        } catch {}
      } catch {
        if (window[DISABLED_KEY]) return modelRadarState;
        modelRadarRetryCount += 1;
        const keepCache = hasFreshModelRadarCache(modelRadarState);
        modelRadarState = {
          ...modelRadarState,
          status: keepCache ? "cached" : "unavailable",
          checkedAt,
          refreshing: false,
          refreshFeedback: force ? "error" : "",
          points: keepCache ? modelRadarState.points : [],
          updatedAt: keepCache ? modelRadarState.updatedAt : "",
          fingerprint: keepCache ? modelRadarState.fingerprint : "",
        };
        scheduleModelRadarRetry();
      }
      updateModelRadarSurfaces();
      dispatchExperienceEvent("MODEL_UPDATED", {
        status: experienceModelPhase(modelRadarState),
        selectionKey: modelRadarSelectionKey,
      });
      if (force) {
        modelRadarFeedbackTimer = setTimeout(() => {
          modelRadarFeedbackTimer = null;
          modelRadarState = { ...modelRadarState, refreshFeedback: "" };
          updateModelRadarSurfaces();
          dispatchExperienceEvent("MODEL_UPDATED", {
            status: experienceModelPhase(modelRadarState),
            selectionKey: modelRadarSelectionKey,
          });
        }, 1500);
      }
      return modelRadarState;
    })().finally(() => {
      modelRadarRequest = null;
    });
    return modelRadarRequest;
  };
  try {
    modelRadarSelectionKey = String(
      localStorage.getItem(MODEL_RADAR_SELECTION_STORAGE_KEY) || "",
    ).slice(0, 96);
  } catch {}
  const cachedModelRadarState = readModelRadarCache();
  if (cachedModelRadarState) modelRadarState = cachedModelRadarState;

  const quotaTiboInterpretationInnerMarkup = () =>
    '<small data-codex-quota="tibo-interpretation-label">翻译与理解：</small>' +
    '<div class="codex-quota-tibo-interpretation-copy">' +
      '<p><strong>翻译</strong><span data-codex-quota="tibo-translation"></span></p>' +
      '<p><strong>理解</strong><span data-codex-quota="tibo-understanding"></span></p>' +
    '</div>';

  const quotaMarkup = (compact = false) => compact
    ? '<span class="codex-quota-pill-brand" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="15" rx="2.5"></rect><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17"></path></svg><span>额度</span></span><span class="codex-quota-meter codex-quota-progress" data-codex-quota="progress"><span></span><strong class="codex-quota-percent" data-codex-quota="percent">—</strong></span>'
    : '<div class="codex-quota-center">' +
        '<header class="codex-quota-center-head">' +
          '<span class="codex-quota-center-title-line"><strong>额度中心</strong><span class="codex-quota-center-separator" aria-hidden="true">·</span><strong class="codex-quota-reset-title">重置雷达</strong><span class="codex-quota-window-badges" data-codex-quota="window-badges"></span><span class="codex-quota-center-source" data-codex-quota="quota-source">Codex Radar · Tibo</span></span>' +
          '<time class="codex-quota-live-time" data-codex-quota="updated" aria-live="polite">--:--:-- · 实时</time>' +
        '</header>' +
        '<div class="codex-quota-center-main">' +
          '<section class="codex-quota-hero" data-codex-quota="hero">' +
            '<div class="codex-quota-hero-ring" role="progressbar" aria-label="额度剩余百分比" aria-valuemin="0" aria-valuemax="100" data-codex-quota="hero-ring">' +
              '<span><strong data-codex-quota="hero-percent">—</strong><small data-codex-quota="hero-window">额度</small></span>' +
            '</div>' +
            '<div class="codex-quota-hero-summary">' +
              '<span class="codex-quota-hero-stat codex-quota-hero-stat-used"><i aria-hidden="true"></i><small>已用额度</small><strong data-codex-quota="used-percent">—</strong></span>' +
              '<span class="codex-quota-hero-stat codex-quota-hero-stat-remaining"><i aria-hidden="true"></i><small>剩余额度</small><strong data-codex-quota="remaining">—</strong></span>' +
              '<span class="codex-quota-hero-stat codex-quota-hero-stat-reset"><i aria-hidden="true"></i><small>额度更新</small><strong data-codex-quota="reset">—</strong></span>' +
            '</div>' +
            '<div class="codex-quota-hero-copy">' +
              '<span data-codex-quota="hero-label">当前状态</span>' +
              '<strong data-codex-quota="hero-value">等待同步</strong>' +
              '<em data-codex-quota="hero-status">状态 · 同步中</em>' +
            '</div>' +
          '</section>' +
          '<section class="codex-quota-tibo">' +
            '<header class="codex-quota-tibo-head">' +
              '<span class="codex-quota-tibo-avatar" aria-hidden="true"></span>' +
              '<span class="codex-quota-tibo-identity"><span class="codex-quota-tibo-title-row"><strong>Tibo 动态</strong><a class="codex-quota-tibo-link-button" data-codex-quota="tibo-link" target="_blank" rel="noopener noreferrer">查看动态</a></span><small data-codex-quota="tibo-location">来源：X · @thsottiaux · IP/位置未公开 · PT</small></span>' +
              '<span class="codex-quota-tibo-clock" aria-label="Tibo 所在地当前时间（美国太平洋时间）"><time data-codex-quota="tibo-local-time-value">--:--:--</time><em data-codex-quota="tibo-local-date">--</em></span>' +
              '<time data-codex-quota="tibo-time" class="codex-quota-tibo-post-time" aria-hidden="true"></time>' +
            '</header>' +
            '<div class="codex-quota-tibo-copy" data-codex-quota="tibo-original-wrap"><small><span data-codex-quota="tibo-original-label">关键动态：</span><time class="codex-quota-tibo-published" data-codex-quota="tibo-published">发布时间待同步</time></small><p data-codex-quota="tibo-original"></p></div>' +
            '<div class="codex-quota-tibo-analysis"><small data-codex-quota="tibo-analysis-label">近期证据：</small><p data-codex-quota="tibo-analysis"></p></div>' +
            '<div class="codex-quota-tibo-latest"><small data-codex-quota="tibo-latest-label">最新原文：</small><p data-codex-quota="tibo-latest"></p></div>' +
            '<div class="codex-quota-tibo-verdict"><small data-codex-quota="tibo-verdict-label">综合判断：</small><p data-codex-quota="tibo-verdict"></p></div>' +
            '<div class="codex-quota-tibo-interpretation" data-codex-quota="tibo-interpretation-wrap">' +
              quotaTiboInterpretationInnerMarkup() +
            '</div>' +
          '</section>' +
        '</div>' +
        '<section class="codex-quota-bottom" aria-label="重置状态与当前会话">' +
          '<section class="codex-quota-token">' +
            '<section class="codex-quota-session-summary" aria-label="当前会话 Token">' +
              '<span class="codex-quota-session-orbit" aria-hidden="true"><span class="codex-quota-session-avatar"></span></span>' +
              '<span class="codex-quota-session-copy">' +
                '<strong>当前会话 Token</strong>' +
                '<strong class="codex-quota-session-total" data-codex-quota="token-total-primary">—</strong>' +
              '</span>' +
            '</section>' +
            '<header class="codex-quota-token-meta"><strong>当前会话 Token</strong><small data-codex-quota="token-note">当前会话 · 等待原生 Token</small></header>' +
            '<div class="codex-quota-token-grid">' +
              '<span><small>总计 / <em class="codex-quota-token-cost" data-codex-quota="token-total-cost">—</em></small><strong>—</strong></span>' +
              '<span><small>输入 / <em class="codex-quota-token-cost" data-codex-quota="token-input-cost">—</em></small><strong>—</strong></span>' +
              '<span><small>输出 / <em class="codex-quota-token-cost" data-codex-quota="token-output-cost">—</em></small><strong>—</strong></span>' +
              '<span><small>缓存命中率</small><strong>—</strong></span>' +
            '</div>' +
            '<div class="codex-quota-token-bar" data-state="unavailable" aria-hidden="true"><span></span><span></span><span></span></div>' +
          '</section>' +
          '<section class="codex-quota-reset-radar" aria-label="重置雷达">' +
            '<div class="codex-quota-reset-grid">' +
              '<span><small>上轮</small><strong data-codex-quota="reset-last-status">未确认</strong><em data-codex-quota="reset-last-time">—</em></span>' +
              '<span><small>下轮</small><strong data-codex-quota="reset-next">—</strong><em data-codex-quota="reset-next-time">等待信号</em></span>' +
              '<span><small>信号</small><strong data-codex-quota="reset-signal">暂无信号</strong><em data-codex-quota="reset-confidence">—</em></span>' +
            '</div>' +
          '</section>' +
        '</section>' +
      '</div>';

  const ensureQuotaMetaLayout = (node) => {
    const usedSection = node?.querySelector(".codex-quota-meta-grid > section:first-child");
    const copy = usedSection?.querySelector(".codex-quota-meta-copy");
    if (usedSection && copy) {
      usedSection.classList.add("codex-quota-meta-used");
      let remaining = copy.querySelector('[data-codex-quota="remaining"]');
      if (!remaining) {
        remaining = document.createElement("em");
        remaining.setAttribute("data-codex-quota", "remaining");
        remaining.textContent = "—";
        copy.appendChild(remaining);
      }
      let remainingLabel = copy.querySelector(".codex-quota-meta-remaining-label");
      if (!remainingLabel) {
        remainingLabel = document.createElement("small");
        remainingLabel.className = "codex-quota-meta-remaining-label";
        remainingLabel.textContent = "剩余";
        copy.insertBefore(remainingLabel, remaining);
      }
    }
    const originalSmall = node.querySelector(".codex-quota-tibo-copy > small");
    let originalLabel = originalSmall?.querySelector('[data-codex-quota="tibo-original-label"]');
    if (!originalLabel && originalSmall) {
      originalLabel = document.createElement("span");
      originalLabel.setAttribute("data-codex-quota", "tibo-original-label");
      const published = originalSmall.querySelector('[data-codex-quota="tibo-published"]');
      originalSmall.replaceChildren(originalLabel, ...(published ? [published] : []));
    }
    if (originalLabel) setTextContent(originalLabel, "关键动态：");
    [
      ["tibo-analysis-label", ".codex-quota-tibo-analysis > small", "近期证据："],
      ["tibo-latest-label", ".codex-quota-tibo-latest > small", "最新原文："],
      ["tibo-verdict-label", ".codex-quota-tibo-verdict > small", "综合判断："],
    ].forEach(([key, selector, label]) => {
      const target = node.querySelector(`[data-codex-quota="${key}"]`) || node.querySelector(selector);
      if (target && !target.hasAttribute("data-codex-quota")) {
        target.setAttribute("data-codex-quota", key);
      }
      setTextContent(target, label);
    });
    const tokenRoles = ["token-total", "token-input", "token-output", "token-cache"];
    [...node.querySelectorAll(".codex-quota-token-grid > span")].forEach((cell, index) => {
      const value = cell.querySelector("strong");
      const role = tokenRoles[index];
      if (value && role) value.setAttribute("data-codex-quota", role);
      if (index > 2) return;
      const label = cell.querySelector("small");
      if (!label) return;
      const costRole = ["token-total-cost", "token-input-cost", "token-output-cost"][index];
      let cost = label.querySelector('[data-codex-quota="' + costRole + '"]');
      if (!cost) {
        label.append(document.createTextNode(" / "));
        cost = document.createElement("em");
        cost.className = "codex-quota-token-cost";
        cost.setAttribute("data-codex-quota", costRole);
        cost.textContent = "—";
        label.appendChild(cost);
      }
    });
  };

  const ensureQuotaResetLayout = (node) => {
    const grid = node?.querySelector(".codex-quota-reset-grid");
    if (!grid) return;
    [...grid.children].forEach((cell, index) => {
      if (!(cell instanceof Element)) return;
      const small = [...cell.children].find((child) => child.matches("small"));
      const time = [...cell.children].find((child) => child.matches("em"));
      const value = [...cell.children].find((child) => child.matches("strong"));
      if (!small && !time && !value) return;
      const top = document.createElement("span");
      top.className = "codex-quota-reset-top";
      cell.insertBefore(top, cell.firstChild);
      const bottom = document.createElement("span");
      bottom.className = "codex-quota-reset-bottom";
      cell.insertBefore(bottom, top.nextSibling);
      const logo = document.createElement("span");
      logo.className = "codex-quota-reset-slot-logo";
      logo.setAttribute("aria-hidden", "true");
      logo.innerHTML = index === 1
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="15" rx="2.5"></rect><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17"></path></svg>'
        : index === 2
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h3l2.2-6 3.6 12 2.2-6H20"></path></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 12l5.7-5.7M12 4v2M20 12h-2"></path></svg>';
      const topCopy = document.createElement("span");
      topCopy.className = "codex-quota-reset-top-copy";
      top.appendChild(logo);
      top.appendChild(topCopy);
      if (time) topCopy.appendChild(time);
      if (small) {
        small.className = "codex-quota-reset-bottom-label";
        small.textContent = index === 1 ? "下轮：" : index === 2 ? "信号：" : "上轮：";
        bottom.appendChild(small);
      }
      if (value) bottom.appendChild(value);
    });
  };

  const ensureQuotaTiboInterpretationLayout = (node) => {
    const card = node?.querySelector?.(".codex-quota-tibo");
    if (!card) return null;
    let block = card.querySelector('[data-codex-quota="tibo-interpretation-wrap"]');
    if (!block) {
      block = document.createElement("div");
      block.className = "codex-quota-tibo-interpretation";
      block.setAttribute("data-codex-quota", "tibo-interpretation-wrap");
      card.appendChild(block);
    }
    if (!block.querySelector('[data-codex-quota="tibo-translation"]') ||
      !block.querySelector('[data-codex-quota="tibo-understanding"]')) {
      block.innerHTML = quotaTiboInterpretationInnerMarkup();
    }
    return block;
  };

  const sessionTokenNumber = (value) => {
    const parsed = parseQuotaNumber(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  };

  const sessionTokenFirstNumber = (value, keys, depth = 0, seen = new Set()) => {
    if (!value || typeof value !== "object" || depth > 4 || seen.has(value)) return null;
    seen.add(value);
    for (const key of keys) {
      const parsed = sessionTokenNumber(value[key]);
      if (Number.isFinite(parsed)) return parsed;
    }
    for (const child of Array.isArray(value) ? value : Object.values(value)) {
      if (!child || typeof child !== "object") continue;
      const parsed = sessionTokenFirstNumber(child, keys, depth + 1, seen);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };

  const normalizeNativeSessionUsage = (usage) => {
    if (!usage || typeof usage !== "object") return null;
    const groups = Array.isArray(usage.groups)
      ? usage.groups
      : usage.groups && typeof usage.groups === "object"
        ? Object.values(usage.groups)
        : [];
    let groupInput = 0;
    let groupOutput = 0;
    let groupCached = 0;
    let hasGroupInput = false;
    let hasGroupOutput = false;
    let hasGroupCached = false;
    for (const group of groups) {
      if (!group || typeof group !== "object") continue;
      const directInput = sessionTokenFirstNumber(group, [
        "inputTokens", "input_tokens", "totalInputTokens", "total_input_tokens",
        "promptTokens", "prompt_tokens", "promptTokenCount", "inputTokenCount",
      ]);
      const uncachedInput = sessionTokenFirstNumber(group, [
        "netNewInputTokens", "net_new_input_tokens", "uncachedInputTokens",
        "uncached_input_tokens", "cacheCreationInputTokens", "cache_creation_input_tokens",
      ]);
      const cachedInput = sessionTokenFirstNumber(group, [
        "cachedInputTokens", "cached_input_tokens", "cacheReadInputTokens",
        "cache_read_input_tokens", "cacheReadTokens", "cache_read_tokens",
        "cachedTokens", "cached_tokens", "cacheHitTokens", "cache_hit_tokens",
      ]);
      const output = sessionTokenFirstNumber(group, [
        "outputTokens", "output_tokens", "completionTokens", "completion_tokens",
        "completionTokenCount", "outputTokenCount",
      ]);
      if (Number.isFinite(directInput)) {
        groupInput += directInput;
        hasGroupInput = true;
      } else if (Number.isFinite(uncachedInput) || Number.isFinite(cachedInput)) {
        groupInput += (uncachedInput || 0) + (cachedInput || 0);
        hasGroupInput = true;
      }
      if (Number.isFinite(cachedInput)) {
        groupCached += cachedInput;
        hasGroupCached = true;
      }
      if (Number.isFinite(output)) {
        groupOutput += output;
        hasGroupOutput = true;
      }
    }
    const directInput = sessionTokenFirstNumber(usage, [
      "inputTokens", "input_tokens", "totalInputTokens", "total_input_tokens",
      "promptTokens", "prompt_tokens", "promptTokenCount", "inputTokenCount",
    ]);
    const uncachedInput = sessionTokenFirstNumber(usage, [
      "netNewInputTokens", "net_new_input_tokens", "uncachedInputTokens",
      "uncached_input_tokens", "cacheCreationInputTokens", "cache_creation_input_tokens",
    ]);
    const directCached = sessionTokenFirstNumber(usage, [
      "cachedInputTokens", "cached_input_tokens", "cacheReadInputTokens",
      "cache_read_input_tokens", "cacheReadTokens", "cache_read_tokens",
      "cachedTokens", "cached_tokens", "cacheHitTokens", "cache_hit_tokens",
    ]);
    const directOutput = sessionTokenFirstNumber(usage, [
      "outputTokens", "output_tokens", "completionTokens", "completion_tokens",
      "completionTokenCount", "outputTokenCount",
    ]);
    const input = Number.isFinite(directInput) ? directInput
      : Number.isFinite(uncachedInput) || Number.isFinite(directCached)
        ? (uncachedInput || 0) + (directCached || 0)
        : hasGroupInput ? groupInput : null;
    const cached = Number.isFinite(directCached)
      ? directCached : hasGroupCached ? groupCached : null;
    const output = Number.isFinite(directOutput)
      ? directOutput : hasGroupOutput ? groupOutput : null;
    const total = sessionTokenFirstNumber(usage, [
      "totalTokens", "total_tokens", "total_token_count", "tokenCount", "totalTokenCount",
    ]) ?? (Number.isFinite(input) || Number.isFinite(output)
      ? (input || 0) + (output || 0) : null);
    if (![input, output, cached, total].some((value) => Number.isFinite(value))) return null;
    return {
      inputTokens: input,
      outputTokens: output,
      cachedInputTokens: cached,
      totalTokens: total,
      exactBreakdown: Number.isFinite(input) && Number.isFinite(output),
      cacheExact: Number.isFinite(cached),
    };
  };

  const normalizeSessionThreadId = (value) => {
    const candidate = String(value || "").trim();
    return SESSION_THREAD_ID_PATTERN.test(candidate) ? candidate.toLowerCase() : "";
  };

  const readActiveSessionThreadId = () => {
    const attributes = [
      "data-above-composer-conversation-id",
      "data-conversation-id",
      "data-thread-id",
    ];
    for (const attribute of attributes) {
      const elements = [...document.querySelectorAll("[" + attribute + "]")].reverse();
      for (const element of elements) {
        const threadId = normalizeSessionThreadId(element.getAttribute(attribute));
        if (threadId) return threadId;
      }
    }
    return "";
  };

  /* The composer amount is a local visual work clock. It is not tied to Codex
     quota or API cost: it models today's accrued share of the requested
     monthly salary. The monthly amount is divided by a fixed 23.5 workdays,
     then accrued across two paid windows: 09:00–12:00 and 13:30–18:30. The
     lunch break is not counted. The thread id only binds the existing native
     composer slot; the amount itself is always derived from today's wall clock
     so switching threads cannot resurrect a stale per-thread total. */
  const threadEarningDayKey = (date = new Date()) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  const threadEarningIsWorkday = (date) => date.getDay() !== 0 && date.getDay() !== 6;
  const threadEarningWorkStart = (date) => new Date(
    date.getFullYear(), date.getMonth(), date.getDate(),
    Math.floor(THREAD_EARNING_WORK_START_MINUTES / 60),
    THREAD_EARNING_WORK_START_MINUTES % 60, 0, 0,
  ).getTime();
  const threadEarningAtMinutes = (date, minutes) => new Date(
    date.getFullYear(), date.getMonth(), date.getDate(),
    Math.floor(minutes / 60), minutes % 60, 0, 0,
  ).getTime();
  const threadEarningOverlapMs = (date, fromMs, toMs, startMinutes, endMinutes) => {
    const startMs = threadEarningAtMinutes(date, startMinutes);
    const endMs = threadEarningAtMinutes(date, endMinutes);
    return Math.max(0, Math.min(toMs, endMs) - Math.max(fromMs, startMs));
  };
  const threadEarningAmountBetween = (fromMs, toMs) => {
    if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || toMs <= fromMs) return 0;
    const from = new Date(fromMs);
    const to = new Date(toMs);
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const lastDay = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    const dailyAmount = THREAD_EARNING_MONTHLY_CNY / THREAD_EARNING_FIXED_WORKDAYS;
    const paidMinuteMs = 60 * 1000;
    let amount = 0;
    let guard = 0;
    while (day.getTime() <= lastDay.getTime() && guard++ < 370) {
      if (threadEarningIsWorkday(day)) {
        const morningMs = threadEarningOverlapMs(
          day, fromMs, toMs,
          THREAD_EARNING_WORK_START_MINUTES, THREAD_EARNING_BREAK_START_MINUTES,
        );
        const afternoonMs = threadEarningOverlapMs(
          day, fromMs, toMs,
          THREAD_EARNING_BREAK_END_MINUTES, THREAD_EARNING_WORK_END_MINUTES,
        );
        const paidMs = morningMs + afternoonMs;
        amount += (paidMs / paidMinuteMs) *
          (dailyAmount / THREAD_EARNING_PAID_MINUTES);
      }
      day.setDate(day.getDate() + 1);
      day.setHours(0, 0, 0, 0);
    }
    return amount;
  };
  const threadEarningAmountAt = (date) => {
    if (!(date instanceof Date) || !threadEarningIsWorkday(date)) return 0;
    return threadEarningAmountBetween(threadEarningWorkStart(date), date.getTime());
  };
  const readThreadEarningStore = (date = new Date()) => {
    const dayKey = threadEarningDayKey(date);
    let parsed = null;
    try {
      parsed = JSON.parse(localStorage.getItem(THREAD_EARNING_STORAGE_KEY) || "null");
    } catch {}
    if (!parsed || parsed.version !== THREAD_EARNING_STORAGE_VERSION || parsed.dayKey !== dayKey ||
      !parsed.threads || typeof parsed.threads !== "object" || Array.isArray(parsed.threads)) {
      return { version: THREAD_EARNING_STORAGE_VERSION, dayKey, threads: {} };
    }
    const threads = {};
    for (const [threadId, record] of Object.entries(parsed.threads).slice(0, THREAD_EARNING_MAX_RECORDS)) {
      if (!SESSION_THREAD_ID_PATTERN.test(threadId) || !record || typeof record !== "object") continue;
      const amount = Number(record.amount);
      if (!Number.isFinite(amount) || amount < 0) continue;
      threads[threadId] = {
        amount,
        updatedAt: Number.isFinite(Number(record.updatedAt)) ? Number(record.updatedAt) : 0,
      };
    }
    return { version: THREAD_EARNING_STORAGE_VERSION, dayKey, threads };
  };
  const writeThreadEarningStore = (store) => {
    if (!store || typeof store !== "object") return;
    try { localStorage.setItem(THREAD_EARNING_STORAGE_KEY, JSON.stringify(store)); } catch {}
  };
  const threadEarningRecord = (store, threadId, initialAmount = 0) => {
    if (!store.threads[threadId]) {
      store.threads[threadId] = {
        amount: Math.max(0, Number(initialAmount) || 0),
        updatedAt: 0,
      };
    }
    return store.threads[threadId];
  };
  const threadEarningFormatter = (() => {
    try {
      return new Intl.NumberFormat("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return null;
    }
  })();
  const formatThreadEarningAmount = (amount) => {
    const normalized = Math.max(0, Number(amount) || 0);
    return threadEarningFormatter?.format(normalized) || normalized.toFixed(2);
  };
  const THREAD_EARNING_DAILY_CNY = THREAD_EARNING_FIXED_WORKDAYS > 0
    ? THREAD_EARNING_MONTHLY_CNY / THREAD_EARNING_FIXED_WORKDAYS : 0;
  const THREAD_EARNING_AMOUNT_BAND_COUNT = THREAD_EARNING_SPEED_MODES.length;
  const THREAD_EARNING_AMOUNT_BAND_SIZE_CNY = THREAD_EARNING_DAILY_CNY > 0
    ? THREAD_EARNING_DAILY_CNY / THREAD_EARNING_AMOUNT_BAND_COUNT : 0;
  const THREAD_EARNING_GLYPH_ROLL_CLASS = "codex-thread-earning-glyph-rolling-backward";
  const THREAD_EARNING_PARTICLE_LAYOUT = [
    /* The progress track begins at x=14px inside the 210px capsule. All
       particles therefore originate at the capsule's x=28px ring edge. */
    { left: "14px", top: "14px", dx: "48px", dy: "-10px", size: "2.8px", delay: "-0.05s" },
    { left: "14px", top: "14px", dx: "62px", dy: "-7px", size: "2.1px", delay: "-0.22s" },
    { left: "14px", top: "14px", dx: "76px", dy: "-3px", size: "2.7px", delay: "-0.39s" },
    { left: "14px", top: "14px", dx: "90px", dy: "6px", size: "2.2px", delay: "-0.56s" },
    { left: "14px", top: "14px", dx: "104px", dy: "11px", size: "3px", delay: "-0.73s" },
    { left: "14px", top: "14px", dx: "118px", dy: "9px", size: "2px", delay: "-0.91s" },
    { left: "14px", top: "14px", dx: "132px", dy: "-10px", size: "2.4px", delay: "-1.08s" },
    { left: "14px", top: "14px", dx: "146px", dy: "7px", size: "2.1px", delay: "-1.25s" },
    { left: "14px", top: "14px", dx: "158px", dy: "-8px", size: "2.8px", delay: "-1.43s" },
    { left: "14px", top: "14px", dx: "170px", dy: "5px", size: "2px", delay: "-1.60s" },
    { left: "14px", top: "14px", dx: "156px", dy: "-6px", size: "2.5px", delay: "-1.78s" },
    { left: "14px", top: "14px", dx: "138px", dy: "8px", size: "2px", delay: "-1.96s" },
    { left: "14px", top: "14px", dx: "116px", dy: "-5px", size: "2.6px", delay: "-2.14s" },
    { left: "14px", top: "14px", dx: "84px", dy: "4px", size: "1.9px", delay: "-2.32s" },
  ];
  const THREAD_EARNING_PARTICLE_LAYOUT_VERSION = "canvas-v1";
  /* Particles moved from fourteen animated DOM spans to one small canvas per
     capsule. The stream keeps the same rhythm: every particle still leaves the
     ring edge, travels right, and fans up or down along its own dy. Drawing
     happens once per frame with a pre-rendered sprite, so there is no
     shadowBlur and no per-particle compositing layer. */
  const THREAD_EARNING_PARTICLE_COUNT = [14, 18, 24, 30];   /* LOW FAST SUPER MAX */
  const THREAD_EARNING_MODE_RGB = [
    "64 132 232", "22 157 191", "113 83 219", "199 68 168",
  ];
  const THREAD_EARNING_FIELD_TIERS = [
    { size: 2.0, tail: 12, dur: 1.45, star: 0.00, spread: 7 },
    { size: 3.0, tail: 20, dur: 1.12, star: 0.18, spread: 10 },
    { size: 4.2, tail: 30, dur: 0.86, star: 0.45, spread: 13 },
  ];
  const THREAD_EARNING_SPRITE = document.createElement("canvas");
  const THREAD_EARNING_SPRITE_PX = 32;
  THREAD_EARNING_SPRITE.width = THREAD_EARNING_SPRITE_PX;
  THREAD_EARNING_SPRITE.height = THREAD_EARNING_SPRITE_PX;
  const threadEarningSpriteCtx = THREAD_EARNING_SPRITE.getContext("2d");
  const paintThreadEarningSprite = (rgbText) => {
    if (!threadEarningSpriteCtx) return;
    if (THREAD_EARNING_SPRITE.dataset.rgb === rgbText) return;
    THREAD_EARNING_SPRITE.dataset.rgb = rgbText;
    const parts = String(rgbText || "64 132 232").split(/[\s,]+/).map(Number);
    const r = parts[0] || 64;
    const g = parts[1] || 132;
    const b = parts[2] || 232;
    const half = THREAD_EARNING_SPRITE_PX / 2;
    threadEarningSpriteCtx.clearRect(0, 0, THREAD_EARNING_SPRITE_PX, THREAD_EARNING_SPRITE_PX);
    const gradient = threadEarningSpriteCtx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.22, "rgba(255,255,255,.92)");
    gradient.addColorStop(0.42, "rgba(" + r + "," + g + "," + b + ",.8)");
    gradient.addColorStop(1, "rgba(" + r + "," + g + "," + b + ",0)");
    threadEarningSpriteCtx.fillStyle = gradient;
    threadEarningSpriteCtx.beginPath();
    threadEarningSpriteCtx.arc(half, half, half, 0, Math.PI * 2);
    threadEarningSpriteCtx.fill();
    threadEarningSpriteCtx.fillStyle = `rgb(${r} ${g} ${b} / .85)`;
    threadEarningSpriteCtx.beginPath();
    threadEarningSpriteCtx.arc(half, half, THREAD_EARNING_SPRITE_PX * .1, 0, Math.PI * 2);
    threadEarningSpriteCtx.fill();
  };
  paintThreadEarningSprite("64 132 232");
  const threadEarningFields = new WeakMap();
  const threadEarningLiveFields = [];
  const createThreadEarningField = (canvas) => {
    const context = canvas.getContext("2d");
    const field = {
      canvas, context,
      width: 196, height: 28, dpr: 1,
      flow: [], sparks: [], ripples: [],
      dotsDuration: 1633, count: 14, fillX: 0, hover: false,
      pending: 0,
      resize() {
        const rect = canvas.getBoundingClientRect();
        this.width = Math.max(1, Math.round(rect.width || 196));
        this.height = Math.max(1, Math.round(rect.height || 28));
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        const pixelWidth = Math.round(this.width * this.dpr);
        const pixelHeight = Math.round(this.height * this.dpr);
        if (canvas.width === pixelWidth && canvas.height === pixelHeight) return;
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        if (context) context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      },
      configure(count, dotsDuration) {
        const previousDuration = this.dotsDuration;
        this.dotsDuration = dotsDuration || this.dotsDuration;
        this.count = count || this.count;
        this.resize();
        while (this.flow.length > this.count) this.flow.pop();
        while (this.flow.length < this.count) {
          this.flow.push(this.makeFlow(this.flow.length));
        }
        if (previousDuration !== this.dotsDuration) {
          for (const particle of this.flow) {
            const phase = particle.t / particle.dur;
            particle.dur = this.dotsDuration * THREAD_EARNING_FIELD_TIERS[particle.tier].dur;
            particle.t = phase * particle.dur;
          }
        }
      },
      makeFlow(index) {
        const tier = THREAD_EARNING_FIELD_TIERS[index % 3];
        const particle = {
          tier: index % 3,
          dur: this.dotsDuration * tier.dur,
          size: tier.size,
          tail: tier.tail,
          star: false,
          dx: 0, dy: 0, y0: 0, t: 0,
          delay: (index / Math.max(1, this.count)) * 1900 + Math.random() * 260,
        };
        this.resetFlow(particle, tier);
        return particle;
      },
      resetFlow(particle, tier) {
        const spread = (tier || THREAD_EARNING_FIELD_TIERS[particle.tier]).spread;
        particle.dx = 46 + Math.random() * 128;
        particle.dy = (Math.random() * 2 - 1) * spread;
        particle.y0 = this.height / 2 + (Math.random() * 2 - 1) * 4;
        particle.t = 0;
        particle.star = Math.random() < (tier || THREAD_EARNING_FIELD_TIERS[particle.tier]).star;
      },
      burst(x, layout, scale) {
        if (!layout || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
        layout.forEach((spec) => {
          this.sparks.push({
            x, y: this.height / 2,
            vx: (spec.dx * (scale || 1)) / 680,
            vy: (spec.dy * (scale || 1)) / 680,
            size: spec.size, t: -(spec.delay || 0), life: 680,
          });
        });
      },
      ripple(x) {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
        this.ripples.push({ x, t: 0, life: 620 });
      },
      blit(x, y, size, alpha, tail, star) {
        if (!context || alpha <= 0.01) return;
        const box = size * 3.2;
        if (tail > 2) {
          context.globalAlpha = alpha * 0.42;
          context.drawImage(THREAD_EARNING_SPRITE,
            x - box / 2 - tail, y - box * 0.18, box + tail, box * 0.36);
        }
        context.globalAlpha = alpha;
        context.drawImage(THREAD_EARNING_SPRITE, x - box / 2, y - box / 2, box, box);
        if (star) {
          context.globalAlpha = alpha * 0.85;
          context.fillStyle = "#fff";
          context.fillRect(x - tail * 0.5, y - 0.5, tail, 1.1);
        }
      },
      draw(step) {
        if (!context || document.hidden) return;
        const ctx = context;
        const advance = this.hover ? step * 1.6 : step;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.globalCompositeOperation = "source-over";
        for (let i = 0; i < this.flow.length; i++) {
          const particle = this.flow[i];
          if (particle.delay > 0) { particle.delay -= advance; continue; }
          particle.t += advance;
          if (particle.t >= particle.dur) {
            this.resetFlow(particle, THREAD_EARNING_FIELD_TIERS[particle.tier]);
          }
          const k = particle.t / particle.dur;
          const x = 28 + particle.dx * k;
          const y = particle.y0 + particle.dy * k;
          let alpha = k < 0.12 ? (k / 0.12) * 0.96 : 0.96 - (k - 0.12) * (0.96 / 0.88);
          alpha *= x < this.fillX ? 1 : 0.85;
          this.blit(x, y, particle.size, Math.max(0, alpha), particle.tail * (0.5 + k), particle.star);
        }
        for (let i = this.sparks.length - 1; i >= 0; i--) {
          const spark = this.sparks[i];
          spark.t += advance;
          if (spark.t < 0) continue;
          if (spark.t >= spark.life) { this.sparks.splice(i, 1); continue; }
          spark.vy += 0.000012 * advance;
          const drag = Math.pow(0.9975, advance / 16);
          spark.vx *= drag;
          spark.vy *= drag;
          spark.x += spark.vx * advance;
          spark.y += spark.vy * advance;
          const k = spark.t / spark.life;
          let alpha = k < 0.18 ? (k / 0.18) * 0.98 : 0.98 * (1 - (k - 0.18) / 0.82);
          alpha *= spark.x < this.fillX ? 1 : 0.6;
          this.blit(spark.x, spark.y, spark.size * (1 - k * 0.4), Math.max(0, alpha), 6, false);
        }
        ctx.globalCompositeOperation = "source-over";
        for (let i = this.ripples.length - 1; i >= 0; i--) {
          const ring = this.ripples[i];
          ring.t += advance;
          if (ring.t >= ring.life) { this.ripples.splice(i, 1); continue; }
          const k = ring.t / ring.life;
          ctx.globalAlpha = (1 - k) * 0.9;
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ring.x, this.height / 2, 4 + k * 38, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      },
    };
    field.resize();
    threadEarningFields.set(canvas, field);
    threadEarningLiveFields.push(field);
    resumeThreadEarningFields();
    return field;
  };
  const threadEarningFieldOf = (layer) => threadEarningFields.get(layer) || null;
  const reconnectThreadEarningField = (layer) => {
    const field = threadEarningFieldOf(layer);
    if (!field || !layer.isConnected) return;
    // Route swaps temporarily detach the cached portal. The WeakMap still
    // owns the field even after the draw loop has pruned its active entry.
    if (!threadEarningLiveFields.includes(field)) threadEarningLiveFields.push(field);
    resumeThreadEarningFields();
  };
  const configureThreadEarningField = (target, count, dotsDuration) => {
    const layer = target?.querySelector?.("[data-thread-earning-progress-particles]");
    const field = layer ? threadEarningFieldOf(layer) : null;
    if (!field) return;
    field.configure(count, dotsDuration);
  };
  const paintThreadEarningFieldSprite = (rgbText) => paintThreadEarningSprite(rgbText);
  let threadEarningFieldLast = 0;
  let threadEarningFieldRaf = 0;
  const threadEarningMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const threadEarningFxMetrics = { frames: 0, totalMs: 0, maxMs: 0 };
  function resumeThreadEarningFields() {
    if (threadEarningFieldRaf || document.hidden || threadEarningMotionQuery.matches ||
      !threadEarningLiveFields.some(field => field.canvas.isConnected)) return;
    threadEarningFieldLast = 0;
    threadEarningFieldRaf = requestAnimationFrame(threadEarningFieldFrame);
  }
  const threadEarningFieldFrame = (now) => {
    threadEarningFieldRaf = 0;
    if (window[STATE_KEY]?.installToken !== installToken || window[DISABLED_KEY]) return;
    if (document.hidden || threadEarningMotionQuery.matches) { threadEarningFieldLast = 0; return; }
    const drawStart = performance.now();
    const dt = Math.min(now - (threadEarningFieldLast || now), 50);
    threadEarningFieldLast = now;
    for (let i = threadEarningLiveFields.length - 1; i >= 0; i--) {
      const field = threadEarningLiveFields[i];
      if (!field.canvas.isConnected) {
        threadEarningLiveFields.splice(i, 1); continue;
      }
      field.draw(dt);
    }
    const cost = performance.now() - drawStart;
    threadEarningFxMetrics.frames++;
    threadEarningFxMetrics.totalMs += cost;
    threadEarningFxMetrics.maxMs = Math.max(threadEarningFxMetrics.maxMs, cost);
    if (threadEarningLiveFields.length) {
      threadEarningFieldRaf = requestAnimationFrame(threadEarningFieldFrame);
    }
  };
  document.addEventListener("visibilitychange", resumeThreadEarningFields);
  threadEarningMotionQuery.addEventListener("change", resumeThreadEarningFields);
  window.__CODEX_EARNING_FX_METRICS__ = threadEarningFxMetrics;
  /* Borrow the reference effect's one-shot burst, but keep it inside the
     existing quota capsule. The regular stream remains deterministic; this
     small fan only appears when the amount actually advances. */
  const THREAD_EARNING_BURST_LAYOUT = [
    { dx: -12, dy: -8,  size: 2.2, delay: 0 },
    { dx: -5,  dy: -12, size: 1.8, delay: 16 },
    { dx: 8,   dy: -10, size: 2.8, delay: 32 },
    { dx: 14,  dy: -3,  size: 1.9, delay: 10 },
    { dx: 16,  dy: 7,   size: 2.4, delay: 26 },
    { dx: 6,   dy: 12,  size: 1.8, delay: 42 },
    { dx: -8,  dy: 10,  size: 2.5, delay: 22 },
    { dx: -15, dy: 3,   size: 1.7, delay: 38 },
  ];
  const threadEarningProgressState = new WeakMap();
  const threadEarningProgressRatio = (amount) => {
    const normalized = Math.max(0, Number(amount) || 0);
    if (!(THREAD_EARNING_DAILY_CNY > 0)) return 0;
    return Math.max(0, Math.min(1, normalized / THREAD_EARNING_DAILY_CNY));
  };
  const threadEarningAmountBand = (amount) => {
    const normalized = Math.max(0, Number(amount) || 0);
    if (!(THREAD_EARNING_AMOUNT_BAND_SIZE_CNY > 0)) return 0;
    return Math.max(0, Math.min(
      THREAD_EARNING_AMOUNT_BAND_COUNT - 1,
      Math.floor(normalized / THREAD_EARNING_AMOUNT_BAND_SIZE_CNY),
    ));
  };
  const threadEarningAmountSpeedMode = (amount) =>
    THREAD_EARNING_SPEED_MODES[threadEarningAmountBand(amount)] || THREAD_EARNING_SPEED_MODES[0];
  const clampThreadEarningSpeed = (speed) => {
    const normalized = Number(speed);
    if (!Number.isFinite(normalized)) return THREAD_EARNING_SPEED_DEFAULT;
    return Math.max(THREAD_EARNING_SPEED_MIN,
      Math.min(THREAD_EARNING_SPEED_MAX, normalized));
  };
  const threadEarningSpeedMode = (speed) => {
    const normalized = clampThreadEarningSpeed(speed);
    return THREAD_EARNING_SPEED_MODES.reduce((closest, mode) =>
      Math.abs(mode.speed - normalized) < Math.abs(closest.speed - normalized) ? mode : closest,
    THREAD_EARNING_SPEED_MODES[0]);
  };
  const normalizeThreadEarningSpeed = (speed) => threadEarningSpeedMode(speed).speed;
  const readThreadEarningSpeed = () => {
    try {
      const stored = localStorage.getItem(THREAD_EARNING_SPEED_STORAGE_KEY);
      return stored === null ? THREAD_EARNING_SPEED_DEFAULT : normalizeThreadEarningSpeed(Number(stored));
    } catch {
      return THREAD_EARNING_SPEED_DEFAULT;
    }
  };
  const writeThreadEarningSpeed = (speed) => {
    try {
      localStorage.setItem(THREAD_EARNING_SPEED_STORAGE_KEY, String(speed));
    } catch {}
  };
  const applyThreadEarningSpeed = (target, speed) => {
    const normalized = clampThreadEarningSpeed(speed);
    setStyleProperty(target, "--codex-thread-earning-speed", String(normalized));
    const bandIndex = Math.max(0, Math.min(THREAD_EARNING_PARTICLE_COUNT.length - 1,
      THREAD_EARNING_SPEED_MODES.findIndex((mode) => mode.speed === normalized)));
    paintThreadEarningFieldSprite(THREAD_EARNING_MODE_RGB[bandIndex] || "64 132 232");
    configureThreadEarningField(target, THREAD_EARNING_PARTICLE_COUNT[bandIndex],
      Math.round(850 * Math.sqrt(2.4 / normalized)));
    setStyleProperty(target, "--codex-thread-earning-progress-duration",
      `${Math.round(900 / normalized)}ms`);
    setStyleProperty(target, "--codex-thread-earning-tail-duration",
      `${Math.round(1000 / normalized)}ms`);
    setStyleProperty(target, "--codex-thread-earning-dots-duration",
      `${Math.round(850 * Math.sqrt(2.4 / normalized))}ms`);
    setStyleProperty(target, "--codex-thread-earning-sweep-duration",
      `${Math.round(3200 / normalized)}ms`);
    setStyleProperty(target, "--codex-thread-earning-roll-duration",
      `${Math.round(240 / normalized)}ms`);
    return normalized;
  };
  const threadEarningGlyphIsDigit = (character) => /^\d$/.test(character);
  const createThreadEarningGlyph = (track, character) => {
    const glyph = document.createElement("span");
    glyph.className = "codex-thread-earning-glyph";
    setAttribute(glyph, "data-thread-earning-glyph", character);
    setAttribute(glyph, "data-thread-earning-glyph-type",
      threadEarningGlyphIsDigit(character) ? "digit" : "separator");
    const previous = document.createElement("span");
    previous.className = "codex-thread-earning-glyph-previous";
    setAttribute(previous, "data-thread-earning-glyph-previous", "");
    glyph.appendChild(previous);
    const isDigit = threadEarningGlyphIsDigit(character);
    let reel = null;
    let separator = null;
    if (isDigit) {
      /* Odometer reel: ten faces stacked inside a one-digit window. */
      reel = document.createElement("span");
      reel.className = "codex-thread-earning-glyph-reel";
      setAttribute(reel, "data-thread-earning-glyph-reel", "");
      for (let digit = 0; digit < 30; digit += 1) {
        const face = document.createElement("i");
        face.textContent = String(digit % 10);
        reel.appendChild(face);
      }
      const start = Number(character) || 0;
      setStyleProperty(reel, "--codex-thread-earning-glyph-pos", String(start));
      glyph.appendChild(reel);
    } else {
      separator = document.createElement("span");
      separator.className = "codex-thread-earning-glyph-separator";
      setAttribute(separator, "data-thread-earning-glyph-separator", "");
      setTextContent(separator, character);
      glyph.appendChild(separator);
    }
    track.appendChild(glyph);
    return {
      glyph, previous, reel, separator, character,
      pos: isDigit ? Number(character) || 0 : 0,
      rollFrame: 0, rollTimer: 0, rollToken: 0, rolling: false,
    };
  };
  const ensureThreadEarningProgressMarkup = (target, amount = null) => {
    let progress = target.querySelector("[data-thread-earning-progress]");
    let fill = progress?.querySelector("[data-thread-earning-progress-fill]");
    let value = progress?.querySelector("[data-thread-earning-progress-value]");
    if (!progress || !fill || !value || progress.parentElement !== target) {
      target.replaceChildren();
      progress = document.createElement("span");
      progress.className = "codex-thread-earning-progress";
      setAttribute(progress, "data-thread-earning-progress", "0");
      setAttribute(progress, "role", "button");
      setAttribute(progress, "tabindex", "0");
      fill = document.createElement("span");
      fill.className = "codex-thread-earning-progress-fill";
      setAttribute(fill, "data-thread-earning-progress-fill", "");
      setAttribute(fill, "aria-hidden", "true");
      value = document.createElement("span");
      value.className = "codex-thread-earning-progress-value";
      setAttribute(value, "data-thread-earning-progress-value", "");
      setAttribute(value, "aria-hidden", "true");
      progress.append(fill, value);
      target.appendChild(progress);
    }
    progress.removeAttribute("aria-hidden");
    setAttribute(progress, "role", "button");
    setAttribute(progress, "tabindex", "0");
    let track = value?.querySelector("[data-thread-earning-progress-value-track]");
    if (value && (!track || track.parentElement !== value)) {
      value.replaceChildren();
      track = document.createElement("span");
      track.className = "codex-thread-earning-progress-value-track";
      setAttribute(track, "data-thread-earning-progress-value-track", "");
      value.appendChild(track);
    }
    let signal = value?.querySelector("[data-thread-earning-progress-signal]");
    if (value && (!signal || signal.parentElement !== value)) {
      signal = document.createElement("span");
      signal.className = "codex-thread-earning-progress-signal";
      setAttribute(signal, "data-thread-earning-progress-signal", "");
      setAttribute(signal, "aria-hidden", "true");
      value.insertBefore(signal, track);
    } else if (value && signal.nextElementSibling !== track) {
      value.insertBefore(signal, track);
    }
    let signalLabel = signal?.querySelector("[data-thread-earning-progress-signal-label]");
    let signalValue = signal?.querySelector("[data-thread-earning-progress-signal-value]");
    if (signal && (!signalLabel || signalLabel.parentElement !== signal ||
      !signalValue || signalValue.parentElement !== signal)) {
      signal.replaceChildren();
      signalLabel = document.createElement("span");
      signalLabel.className = "codex-thread-earning-progress-signal-label";
      setAttribute(signalLabel, "data-thread-earning-progress-signal-label", "");
      signalValue = document.createElement("strong");
      signalValue.className = "codex-thread-earning-progress-signal-value";
      setAttribute(signalValue, "data-thread-earning-progress-signal-value", "");
      signal.append(signalLabel, signalValue);
    }
    const signalText = target.getAttribute("data-thread-earning-reset-signal") || "";
    const signalSeparatorIndex = signalText.indexOf("\u00b7");
    const signalLabelText = target.getAttribute("data-thread-earning-reset-signal-label") ||
      (signalSeparatorIndex >= 0 ? signalText.slice(0, signalSeparatorIndex) : signalText) ||
      "\u91cd\u7f6e\u4fe1\u53f7";
    const signalValueText = target.getAttribute("data-thread-earning-reset-signal-value") ||
      (signalSeparatorIndex >= 0 ? signalText.slice(signalSeparatorIndex + 1) : "");
    setAttribute(target, "data-thread-earning-reset-signal-label", signalLabelText);
    setAttribute(target, "data-thread-earning-reset-signal-value", signalValueText);
    setTextContent(signalLabel, signalLabelText);
    setTextContent(signalValue, signalValueText);
    let particleLayer = progress.querySelector("[data-thread-earning-progress-particles]");
    let particleNodes = particleLayer
      ? [...particleLayer.querySelectorAll("[data-thread-earning-particle]")]
      : [];
    const hasExpectedParticles = particleLayer?.tagName === "CANVAS" &&
      threadEarningFields.has(particleLayer) &&
      particleLayer?.getAttribute("data-thread-earning-particle-layout") ===
        THREAD_EARNING_PARTICLE_LAYOUT_VERSION;
    if (!particleLayer || !hasExpectedParticles || particleLayer.parentElement !== progress ||
      particleLayer.nextElementSibling !== value) {
      particleLayer?.remove?.();
      particleLayer = document.createElement("canvas");
      particleLayer.className = "codex-thread-earning-progress-particles";
      setAttribute(particleLayer, "data-thread-earning-progress-particles", "");
      setAttribute(particleLayer, "data-thread-earning-particle-layout",
        THREAD_EARNING_PARTICLE_LAYOUT_VERSION);
      setAttribute(particleLayer, "aria-hidden", "true");
      particleNodes = [];
      progress.insertBefore(particleLayer, value);
      const field = createThreadEarningField(particleLayer);
      field.configure(THREAD_EARNING_PARTICLE_COUNT[
        Math.min(THREAD_EARNING_PARTICLE_COUNT.length - 1,
          Math.max(0, Number(target.getAttribute("data-thread-earning-speed-band")) || 0))],
        Number(target.style.getPropertyValue("--codex-thread-earning-dots-duration")
          .replace("ms", "")) || 1633);
    }
    reconnectThreadEarningField(particleLayer);
    if (!progress.__codexThreadEarningFieldHover) {
      progress.__codexThreadEarningFieldHover = true;
      const readField = () => threadEarningFieldOf(
        progress.querySelector("[data-thread-earning-progress-particles]"));
      progress.addEventListener("mouseenter", () => {
        const field = readField();
        if (field) field.hover = true;
      });
      progress.addEventListener("mouseleave", () => {
        const field = readField();
        if (field) field.hover = false;
      });
    }
    target.querySelector("[data-thread-earning-speed-control]")?.remove?.();
    let state = threadEarningProgressState.get(target);
    if (!state || state.progress !== progress || state.fill !== fill || state.value !== value ||
      state.track !== track || state.signal !== signal || state.signalLabel !== signalLabel ||
      state.signalValue !== signalValue || state.particleLayer !== particleLayer) {
      state = {
        target, progress, fill, value, track, signal, signalLabel, signalValue, particleLayer,
        speed: THREAD_EARNING_SPEED_DEFAULT,
        speedApplied: false,
        amountBand: -1,
        manualSpeed: target.getAttribute("data-thread-earning-speed-source") === "manual",
        setSpeedMetadata: null,
        glyphs: [], amountText: "", progressPercent: -1, rollingCount: 0,
        lastBurstAt: 0,
      };
      threadEarningProgressState.set(target, state);
    }
    if (!Number.isInteger(state.amountBand)) state.amountBand = -1;
    if (typeof state.manualSpeed !== "boolean") {
      state.manualSpeed = target.getAttribute("data-thread-earning-speed-source") === "manual";
    }
    const setSpeedMetadata = (selectedMode) => {
      const unchanged = state.speedApplied && state.speed === selectedMode.speed &&
        progress.getAttribute("data-thread-earning-speed-mode") === selectedMode.id;
      state.speed = selectedMode.speed;
      setAttribute(progress, "data-thread-earning-speed-mode", selectedMode.id);
      const amountLabel = target.getAttribute("data-thread-earning-state") === "unbound"
        ? "当前线程金额待绑定"
        : `今日累计金额 ${formatThreadEarningAmount(amount ?? Number(target.getAttribute("data-thread-earning-value")))} 元`;
      setAttribute(progress, "aria-label", `${amountLabel}，当前动效速度 ${selectedMode.label}，点击临时切换动效速度`);
      setAttribute(progress, "title", `${selectedMode.label} · 点击临时切换速度`);
      if (unchanged) return;
      applyThreadEarningSpeed(target, selectedMode.speed);
      state.speedApplied = true;
    };
    state.setSpeedMetadata = setSpeedMetadata;
    const amountForMode = amount === null
      ? Number(target.getAttribute("data-thread-earning-value")) : Number(amount);
    const selectedMode = state.manualSpeed || !Number.isFinite(amountForMode)
      ? threadEarningSpeedMode(readThreadEarningSpeed())
      : threadEarningAmountSpeedMode(amountForMode);
    setSpeedMetadata(selectedMode);
    if (progress.__codexThreadEarningSpeedOwner !== state) {
      const previousClickHandler = progress.__codexThreadEarningSpeedHandler;
      const previousKeydownHandler = progress.__codexThreadEarningSpeedKeydownHandler;
      if (typeof previousClickHandler === "function") {
        progress.removeEventListener("click", previousClickHandler);
      }
      if (typeof previousKeydownHandler === "function") {
        progress.removeEventListener("keydown", previousKeydownHandler);
      }
      const cycleSpeed = () => {
        const currentMode = threadEarningSpeedMode(state.speed);
        const currentIndex = THREAD_EARNING_SPEED_MODES.findIndex((mode) => mode.id === currentMode.id);
        const nextMode = THREAD_EARNING_SPEED_MODES[(currentIndex + 1) % THREAD_EARNING_SPEED_MODES.length];
        state.manualSpeed = true;
        setAttribute(target, "data-thread-earning-speed-source", "manual");
        setSpeedMetadata(nextMode);
        writeThreadEarningSpeed(nextMode.speed);
      };
      const onSpeedClick = () => cycleSpeed();
      const onSpeedKeydown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (event.repeat) return;
        cycleSpeed();
      };
      progress.addEventListener("click", onSpeedClick);
      progress.addEventListener("keydown", onSpeedKeydown);
      progress.__codexThreadEarningSpeedHandler = onSpeedClick;
      progress.__codexThreadEarningSpeedKeydownHandler = onSpeedKeydown;
      progress.__codexThreadEarningSpeedOwner = state;
    }
    return state;
  };
  const triggerThreadEarningProgressBurst = (state, ratio) => {
    if (!state?.particleLayer) return;
    const field = threadEarningFieldOf(state.particleLayer);
    if (!field) return;
    const now = typeof performance?.now === "function" ? performance.now() : Date.now();
    if (now - (state.lastBurstAt || 0) < 260) return;
    state.lastBurstAt = now;
    field.sparks.length = 0;
    const x = Math.max(16, Math.min(field.width - 16, ratio * field.width));
    field.burst(x, THREAD_EARNING_BURST_LAYOUT, 1);
  };
  const stopThreadEarningGlyphRoll = (state, glyph) => {
    if (!state || !glyph) return;
    glyph.rollToken = (glyph.rollToken || 0) + 1;
    if (glyph.rollFrame && typeof window.cancelAnimationFrame === "function") {
      window.cancelAnimationFrame(glyph.rollFrame);
    }
    if (glyph.rollTimer) window.clearTimeout(glyph.rollTimer);
    if (glyph.rolling) state.rollingCount = Math.max(0, state.rollingCount - 1);
    glyph.rollFrame = 0;
    glyph.rollTimer = 0;
    glyph.rolling = false;
    glyph.glyph.classList.remove(THREAD_EARNING_GLYPH_ROLL_CLASS);
  };
  const triggerThreadEarningGlyphRoll = (state, glyph, nextCharacter, order = 0) => {
    if (!state?.target || !glyph?.glyph?.isConnected) return;
    stopThreadEarningGlyphRoll(state, glyph);
    const digit = Number(nextCharacter);
    if (!glyph.reel || !Number.isFinite(digit)) {
      if (glyph.separator) setTextContent(glyph.separator, nextCharacter);
      return;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setStyleProperty(glyph.reel, "--codex-thread-earning-glyph-pos", String(digit));
      glyph.pos = digit;
      return;
    }
    state.rollingCount += 1;
    glyph.rolling = true;
    const token = (glyph.rollToken || 0) + 1;
    glyph.rollToken = token;
    /* Three repeated sets provide a bounded downward revolution. Rebase to
       the equivalent face before each run so positions never accumulate. */
    const start = 20 + ((glyph.pos % 10) + 10) % 10;
    const target = start - (((start - digit) % 10) + 10);
    glyph.reel.style.setProperty("transition", "none", "important");
    setStyleProperty(glyph.reel, "--codex-thread-earning-glyph-pos", String(start));
    void glyph.reel.offsetHeight;
    glyph.reel.style.removeProperty("transition");
    const delay = Math.max(0, order) * 26;
    setStyleProperty(glyph.reel, "transition-delay", `${delay}ms`);
    setStyleProperty(glyph.reel, "--codex-thread-earning-glyph-pos", String(target));
    glyph.pos = target;
    const settle = () => {
      if (token !== glyph.rollToken) return;
      glyph.rollTimer = 0;
      if (glyph.rolling) state.rollingCount = Math.max(0, state.rollingCount - 1);
      glyph.rolling = false;
      if (state.target.isConnected && state.rollingCount === 0) {
        setAttribute(state.target, "data-thread-earning-rolling", "false");
      }
    };
    if (typeof window.requestAnimationFrame === "function") {
      glyph.rollFrame = window.requestAnimationFrame(() => {
        glyph.rollFrame = 0;
        if (token !== glyph.rollToken) return;
        glyph.rollTimer = window.setTimeout(settle, 560 + delay);
      });
    } else {
      glyph.rollTimer = window.setTimeout(settle, 560 + delay);
    }
  };
  const rebuildThreadEarningValue = (state, amountText) => {
    state.glyphs.forEach((glyph) => stopThreadEarningGlyphRoll(state, glyph));
    state.track.replaceChildren();
    state.glyphs = [...String(amountText)].map((character) =>
      createThreadEarningGlyph(state.track, character));
    state.amountText = String(amountText);
  };
  const updateThreadEarningValue = (state, amountText) => {
    const nextText = String(amountText);
    const matches = state.glyphs.length === nextText.length && state.glyphs.every((glyph, index) => {
      const nextCharacter = nextText[index];
      return glyph.glyph.getAttribute("data-thread-earning-glyph-type") ===
        (threadEarningGlyphIsDigit(nextCharacter) ? "digit" : "separator");
    });
    if (!matches) {
      rebuildThreadEarningValue(state, nextText);
      return false;
    }
    let changed = false;
    const length = nextText.length;
    state.glyphs.forEach((glyph, index) => {
      const nextCharacter = nextText[index];
      if (glyph.character === nextCharacter) return;
      changed = true;
      if (glyph.reel && threadEarningGlyphIsDigit(nextCharacter)) {
        /* Cascade like a real odometer: the last digit turns first. */
        triggerThreadEarningGlyphRoll(state, glyph, nextCharacter, length - 1 - index);
      } else if (glyph.separator) {
        setTextContent(glyph.separator, nextCharacter);
      }
      glyph.character = nextCharacter;
      setAttribute(glyph.glyph, "data-thread-earning-glyph", nextCharacter);
    });
    state.amountText = nextText;
    return changed;
  };
  const clearThreadEarningProgress = (target) => {
    const state = ensureThreadEarningProgressMarkup(target);
    state.glyphs.forEach((glyph) => stopThreadEarningGlyphRoll(state, glyph));
    if (state.amountText !== "—") rebuildThreadEarningValue(state, "—");
    setStyleProperty(state.fill, "--codex-thread-earning-progress-transform", "scaleX(0)");
    setStyleProperty(state.progress, "--earning-ratio", "0");
    setAttribute(state.progress, "data-thread-earning-progress", "0");
    setAttribute(target, "data-thread-earning-progress", "0");
    setAttribute(target, "data-thread-earning-rolling", "false");
    setStyleProperty(state.particleLayer, "--codex-thread-earning-particle-clip-right", "0%");
    setTextContent(state.signalLabel, target.getAttribute("data-thread-earning-reset-signal-label") ||
      "\u91cd\u7f6e\u4fe1\u53f7");
    setTextContent(state.signalValue, target.getAttribute("data-thread-earning-reset-signal-value") || "");
    state.amountText = "—";
    state.progressPercent = 0;
    state.amountBand = -1;
    state.lastBurstAt = 0;
    state.particleLayer.querySelectorAll("[data-thread-earning-progress-burst]").forEach((node) => {
      node.remove();
    });
    state.manualSpeed = false;
    target.removeAttribute("data-thread-earning-speed-source");
    target.removeAttribute("data-thread-earning-speed-band");
    state.progress.removeAttribute("data-thread-earning-speed-band");
    state.setSpeedMetadata?.(THREAD_EARNING_SPEED_MODES[0]);
  };
  const updateThreadEarningProgress = (target, amount) => {
    const normalized = Math.max(0, Number(amount) || 0);
    const amountBand = threadEarningAmountBand(normalized);
    const state = ensureThreadEarningProgressMarkup(target, normalized);
    const crossedAmountBand = state.amountBand !== -1 && state.amountBand !== amountBand;
    if (crossedAmountBand) {
      state.manualSpeed = false;
      target.removeAttribute("data-thread-earning-speed-source");
    }
    state.amountBand = amountBand;
    setAttribute(target, "data-thread-earning-speed-band", String(amountBand));
    setAttribute(state.progress, "data-thread-earning-speed-band", String(amountBand));
    if (!state.manualSpeed) {
      state.setSpeedMetadata?.(threadEarningAmountSpeedMode(normalized));
      setAttribute(target, "data-thread-earning-speed-source", "amount");
    }
    const amountText = formatThreadEarningAmount(normalized);
    const ratio = threadEarningProgressRatio(normalized);
    const progressPercent = Number((ratio * 100).toFixed(2));
    if (state.amountText !== amountText) {
      const changed = updateThreadEarningValue(state, amountText);
      setAttribute(target, "data-thread-earning-rolling",
        changed && state.rollingCount > 0 ? "backward" : "false");
    }
    setAttribute(target, "data-thread-earning-value", String(normalized));
    setTextContent(state.signalLabel, target.getAttribute("data-thread-earning-reset-signal-label") ||
      "\u91cd\u7f6e\u4fe1\u53f7");
    setTextContent(state.signalValue, target.getAttribute("data-thread-earning-reset-signal-value") || "");
    if (state.progressPercent !== progressPercent) {
      const previousProgressPercent = state.progressPercent;
      setStyleProperty(state.fill, "--codex-thread-earning-progress-transform", `scaleX(${ratio})`);
      setStyleProperty(state.progress, "--earning-ratio", String(ratio));
      const field = threadEarningFieldOf(state.particleLayer);
      if (field) field.fillX = ratio * field.width;
      setAttribute(state.progress, "data-thread-earning-progress", String(progressPercent));
      setAttribute(target, "data-thread-earning-progress", String(progressPercent));
      setStyleProperty(state.particleLayer, "--codex-thread-earning-particle-clip-right", "0%");
      if (previousProgressPercent >= 0 && progressPercent > previousProgressPercent) {
        triggerThreadEarningProgressBurst(state, ratio);
      }
      state.progressPercent = progressPercent;
    }
  };
  const threadEarningIsInWorkWindow = (date) => {
    if (!threadEarningIsWorkday(date)) return false;
    const minutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
    return (minutes >= THREAD_EARNING_WORK_START_MINUTES &&
      minutes < THREAD_EARNING_BREAK_START_MINUTES) ||
      (minutes >= THREAD_EARNING_BREAK_END_MINUTES &&
        minutes < THREAD_EARNING_WORK_END_MINUTES);
  };
  const renderThreadEarning = (node, amount, date, threadId) => {
    const target = node?.querySelector?.("[data-codex-thread-earning]");
    if (!target) return;
    const dayKey = threadEarningDayKey(date);
    if (!threadId) {
      setAttribute(target, "data-thread-earning-state", "unbound");
      clearThreadEarningProgress(target);
      target.removeAttribute("data-thread-earning-value");
      setAttribute(target, "aria-label", "当前线程金额待绑定");
      setAttribute(target, "data-thread-earning-state", "unbound");
      target.removeAttribute("title");
      return;
    }
    const text = formatThreadEarningAmount(amount);
    setAttribute(target, "aria-label", `今日累计金额 ${text} 元`);
    setAttribute(target, "data-thread-earning-day", dayKey);
    setAttribute(target, "data-thread-earning-state",
      threadEarningIsInWorkWindow(date) ? "working" : "idle");
    target.removeAttribute("title");
    updateThreadEarningProgress(target, amount);
  };
  const stopThreadEarningRuntime = () => {
    if (!threadEarningRuntime) return;
    try { threadEarningRuntime.stop(); } catch {}
    threadEarningRuntime = null;
  };
  const ensureThreadEarningRuntime = (node) => {
    if (!(node instanceof HTMLElement) || !ownsRenderer()) return;
    if (!threadEarningRuntime) {
      const runtime = {
        timer: null,
        node,
        store: null,
        dayKey: "",
        activeThreadId: "",
        lastTickAt: 0,
        lastPersistAt: 0,
        persist(now = Date.now()) {
          if (!this.store) return;
          const entries = Object.entries(this.store.threads)
            .sort((left, right) => Number(right[1]?.updatedAt || 0) - Number(left[1]?.updatedAt || 0))
            .slice(0, THREAD_EARNING_MAX_RECORDS);
          this.store.threads = Object.fromEntries(entries);
          writeThreadEarningStore(this.store);
          this.lastPersistAt = now;
        },
        stop() {
          if (this.timer !== null) window.clearInterval(this.timer);
          this.timer = null;
          const target = this.node?.querySelector?.("[data-codex-thread-earning]");
          if (target) clearThreadEarningProgress(target);
          threadEarningRuntimes.delete(this);
          this.persist();
        },
        start(nextNode) {
          if (!ownsRenderer()) return;
          this.node = nextNode;
          if (this.timer === null) {
            const now = Date.now();
            this.dayKey = threadEarningDayKey(new Date(now));
            this.store = readThreadEarningStore(new Date(now));
            this.activeThreadId = "";
            this.lastTickAt = now;
            this.lastPersistAt = 0;
            this.timer = window.setInterval(() => this.tick(), THREAD_EARNING_TICK_MS);
          }
          this.tick();
        },
        tick() {
          if (!ownsRenderer()) {
            this.stop();
            return;
          }
          const now = Date.now();
          if (!isRendererVisible()) {
            this.lastTickAt = now;
            return;
          }
          const date = new Date(now);
          const dayKey = threadEarningDayKey(date);
          if (this.dayKey !== dayKey || !this.store) {
            this.dayKey = dayKey;
            this.store = readThreadEarningStore(date);
            this.activeThreadId = "";
            this.lastTickAt = now;
            this.lastPersistAt = 0;
          }
          if (!this.node?.isConnected) {
            /* React replaces the composer subtree during a conversation
               switch. Keep the per-thread clock alive through that short
               gap and attach it to the replacement node on the next tick;
               an explicit quota cleanup still stops the runtime. */
            const replacement = document.getElementById("codex-quota-reset-composer");
            if (!(replacement instanceof HTMLElement) || !replacement.isConnected) {
              this.lastTickAt = now;
              return;
            }
            this.node = replacement;
            this.lastTickAt = now;
          }
          const threadId = readActiveSessionThreadId();
          if (!threadId) {
            this.activeThreadId = "";
            this.lastTickAt = now;
            renderThreadEarning(this.node, 0, date, "");
            return;
          }
          const record = threadEarningRecord(this.store, threadId, threadEarningAmountAt(date));
          const switchedThread = threadId !== this.activeThreadId;
          this.activeThreadId = threadId;
          this.lastTickAt = now;
          /* Stored records are only a bounded compatibility cache. Never use
             their old value as the source of truth: the displayed amount is
             recalculated from the current work clock on every visible tick. */
          record.amount = threadEarningAmountAt(date);
          record.updatedAt = now;
          renderThreadEarning(this.node, record.amount, date, threadId);
          if (switchedThread || now - this.lastPersistAt >= THREAD_EARNING_PERSIST_MS) {
            this.persist(now);
          }
        },
      };
      threadEarningRuntime = runtime;
      threadEarningRuntimes.add(runtime);
    }
    threadEarningRuntime.start(node);
  };

  const clearNativeSessionUsageCache = () => {
    sessionTokenContextNode = null;
    sessionTokenLastNativeScan = 0;
    sessionTokenNativeUsageCache = null;
  };

  const readNativeSessionUsage = (activeThreadId = readActiveSessionThreadId()) => {
    if (!activeThreadId) {
      sessionTokenActiveThreadId = "";
      clearNativeSessionUsageCache();
      return null;
    }
    if (activeThreadId !== sessionTokenActiveThreadId) {
      sessionTokenActiveThreadId = activeThreadId;
      clearNativeSessionUsageCache();
    }
    const now = Date.now();
    if (sessionTokenContextNode && !sessionTokenContextNode.isConnected) {
      clearNativeSessionUsageCache();
    }
    const scanInterval = sessionTokenNativeUsageCache
      ? SESSION_TOKEN_NATIVE_SCAN_MS : SESSION_TOKEN_NATIVE_MISS_SCAN_MS;
    if (now - sessionTokenLastNativeScan < scanInterval) {
      return sessionTokenNativeUsageCache;
    }
    sessionTokenLastNativeScan = now;
    let context = null;
    let usage = null;
    const seenFibers = new Set();
    const inspectFiber = (start) => {
      const queue = [];
      let parent = start;
      let parentDepth = 0;
      while (parent && parentDepth++ < 28) {
        queue.push(parent);
        parent = parent.return;
      }
      let steps = 0;
      while (queue.length && steps++ < 2200 && !(context && usage)) {
        const fiber = queue.shift();
        if (!fiber || seenFibers.has(fiber)) continue;
        seenFibers.add(fiber);
        for (const props of [fiber.memoizedProps, fiber.pendingProps]) {
          if (!props || typeof props !== "object") continue;
          const rawContext = props.contextUsage;
          if (rawContext && typeof rawContext === "object" &&
            Number.isFinite(sessionTokenNumber(rawContext.usedTokens))) {
            context = {
              usedTokens: sessionTokenNumber(rawContext.usedTokens),
              contextWindow: sessionTokenNumber(rawContext.contextWindow),
              remainingTokens: sessionTokenNumber(rawContext.remainingTokens),
            };
          }
          const candidateUsage = normalizeNativeSessionUsage(
            props.usage || props.tokenUsage || props.sessionUsage || props.token_usage ||
            props.session_usage || props.usageStats || props.usage_stats ||
            props.responseUsage || props.response_usage || props.tokenMetrics || props.token_metrics,
          );
          if (candidateUsage) usage = candidateUsage;
        }
        if (fiber.child) queue.push(fiber.child);
        if (fiber.sibling) queue.push(fiber.sibling);
        for (const ref of [fiber.ref, fiber.stateNode]) {
          const element = ref?.current instanceof Element ? ref.current
            : ref instanceof Element ? ref : null;
          if (!element) continue;
          const fiberKey = Object.keys(element).find((key) => key.startsWith("__reactFiber$"));
          if (fiberKey) queue.push(element[fiberKey]);
        }
      }
    };
    const inspectElement = (element) => {
      if (!(element instanceof Element)) return;
      const fiberKey = Object.keys(element).find((key) => key.startsWith("__reactFiber$"));
      if (fiberKey) inspectFiber(element[fiberKey]);
    };
    const contextCandidates = [
      sessionTokenContextNode,
      ...[...document.querySelectorAll('[aria-label*="%"]')].filter((element) =>
        /\d{1,3}\s*%/.test(element.getAttribute("aria-label") || "")),
    ].filter((element, index, list) => element?.isConnected && list.indexOf(element) === index);
    for (const element of contextCandidates.slice(0, 10)) {
      inspectElement(element);
      if (context) {
        sessionTokenContextNode = element;
        break;
      }
    }
    if (!context || !usage) {
      for (const element of [
        ...document.querySelectorAll("[data-content-search-turn-key], [data-turn-key]"),
        document.querySelector("main"),
      ].filter(Boolean).slice(-24)) {
        inspectElement(element);
        if (context && usage) break;
      }
    }
    sessionTokenNativeUsageCache = context || usage ? { context, usage } : null;
    return sessionTokenNativeUsageCache;
  };

  const readSessionUsageSnapshot = (activeThreadId = readActiveSessionThreadId()) => {
    const snapshot = window.__CODEX_DREAM_SKIN_SESSION_USAGE__;
    if (!snapshot || typeof snapshot !== "object" || snapshot.status !== "available") return null;
    const snapshotThreadId = normalizeSessionThreadId(snapshot.threadId);
    if (!activeThreadId || !snapshotThreadId || activeThreadId !== snapshotThreadId) return null;
    const inputTokens = sessionTokenNumber(snapshot.inputTokens);
    const outputTokens = sessionTokenNumber(snapshot.outputTokens);
    const totalTokens = sessionTokenNumber(snapshot.totalTokens);
    if (![inputTokens, outputTokens, totalTokens].some((value) => Number.isFinite(value))) {
      return null;
    }
    return {
      usage: {
        inputTokens: inputTokens ?? 0,
        outputTokens: outputTokens ?? 0,
        totalTokens: totalTokens ?? (inputTokens || 0) + (outputTokens || 0),
        cachedInputTokens: sessionTokenNumber(snapshot.cachedInputTokens),
        cacheWriteInputTokens: sessionTokenNumber(snapshot.cacheWriteInputTokens),
        exactBreakdown: snapshot.exactBreakdown !== false,
        cacheExact: snapshot.cacheExact !== false,
      },
      snapshot,
    };
  };

  const formatSessionTokenCount = (value) => Number.isFinite(value)
    ? new Intl.NumberFormat("en-US").format(Math.round(value)) : "—";
  const formatSessionTokenCompact = (value) => {
    if (!Number.isFinite(value)) return "—";
    const absolute = Math.abs(value);
    const unit = absolute >= 1e9 ? "B" : absolute >= 1e6 ? "M" : absolute >= 1e3 ? "K" : "";
    if (!unit) return new Intl.NumberFormat("en-US").format(Math.round(value));
    const divisor = unit === "B" ? 1e9 : unit === "M" ? 1e6 : 1e3;
    const compact = (value / divisor).toFixed(2).replace(/\.?0+$/, "");
    return compact + unit;
  };
  const formatSessionPercent = (value, estimated = false) => Number.isFinite(value)
    ? (estimated ? "≈" : "") + Math.round(Math.max(0, Math.min(100, value))) + "%" : "—";

  const currentModelRadarDescriptor = () => {
    const nativeCandidates = [...document.querySelectorAll(
      '[data-codex-intelligence-trigger="true"], .composer-surface-chrome button[aria-haspopup="menu"]',
    )];
    const isVisible = (button) => {
      const style = getComputedStyle(button);
      return style.display !== "none" && style.visibility !== "hidden" &&
        button.getClientRects().length > 0;
    };
    const hasModelLabel = (button) => {
      const text = modelRadarNodeText(button);
      return modelRadarSortedPoints()
        .filter(modelRadarIsCodexModel)
        .some((point) => modelRadarTextMatches(text, point)) ||
        /(?:Sol|Terra|Luna|GPT[- ]?5\.5|5\.5)/i.test(text);
    };
    const nativeButton = nativeCandidates.find((button) => isVisible(button) && hasModelLabel(button)) ||
      nativeCandidates.find(isVisible);
    const nativeText = modelRadarNodeText(nativeButton);
    const lowerText = nativeText.toLowerCase();
    const nativeRadarPoint = modelRadarSortedPoints()
      .filter(modelRadarIsCodexModel)
      .find((point) => modelRadarTextMatches(nativeText, point));
    const nativeModelAttribute = nativeButton?.getAttribute("data-model") ||
      nativeButton?.getAttribute("data-model-id") ||
      nativeButton?.getAttribute("data-selected-model") || "";
    let model = modelRadarBareModel(nativeModelAttribute) || nativeRadarPoint?.model || (
      lowerText.includes("terra") ? "gpt-5.6-terra"
        : lowerText.includes("luna") ? "gpt-5.6-luna"
          : lowerText.includes("sol") ? "gpt-5.6-sol"
            : /(?:gpt[- ]?5\.5|5\.5)/i.test(nativeText) ? "gpt-5.5" : ""
    );
    let effort = String(nativeButton?.getAttribute("data-selected-reasoning-effort") || "")
      .trim().toLowerCase();
    if (!["low", "medium", "high", "xhigh", "max", "ultra"].includes(effort)) {
      const effortHints = [
        ["ultra", /\bultra\b|超高|极限/i],
        ["max", /\bmax\b|最高/i],
        ["xhigh", /\bxhigh\b|极高/i],
        ["high", /\bhigh\b|高/i],
        ["medium", /\bmedium\b|中/i],
        ["low", /\blow\b|低/i],
      ];
      effort = effortHints.find(([, pattern]) => pattern.test(nativeText))?.[0] ||
        nativeRadarPoint?.effort || "";
    }
    if ((!model || !effort) && modelRadarSelectionKey) {
      const [selectedModel, selectedEffort] = String(modelRadarSelectionKey).split(":");
      if (!model && selectedModel) model = selectedModel;
      if (!effort && selectedEffort) effort = selectedEffort;
    }
    const family = model ? modelRadarFamily({ model }) : "";
    return {
      model,
      effort,
      family,
      label: family && effort ? `${family} ${effort}` : family || "当前模型",
    };
  };

  const currentModelRadarPoint = () => {
    const descriptor = currentModelRadarDescriptor();
    const points = modelRadarSortedPoints();
    const point = points.find((candidate) =>
      (!descriptor.model || candidate.model === descriptor.model) &&
      (!descriptor.effort || candidate.effort === descriptor.effort)) ||
      points.find((candidate) => descriptor.model && candidate.model === descriptor.model) ||
      selectedModelRadarPoint() || null;
    return { descriptor, point };
  };

  /* The injector supplies exact per-session usage from Codex's local JSONL
     token_count events. Prices are only an API-equivalent calculation using
     the current OpenAI public standard rates; Codex subscription usage is not
     an API invoice. */
  const SESSION_PUBLIC_FALLBACK_PRICING = Object.freeze({
    "gpt-5.6-sol": { input: 4, cachedInput: 0.4, cacheWrite: 5, output: 20 },
    "gpt-5.6-terra": { input: 2, cachedInput: 0.2, cacheWrite: 2.5, output: 12 },
    "gpt-5.6-luna": { input: 0.2, cachedInput: 0.02, cacheWrite: 0.25, output: 1.2 },
  });
  const SESSION_PUBLIC_FALLBACK_PRICE_REVISION = "2026-08-31";
  const normalizeSessionCostModel = (value) => {
    const model = String(value || "").trim().toLowerCase();
    if (model === "gpt-5.6" || model.includes("gpt-5.6-sol")) return "gpt-5.6-sol";
    if (model.includes("gpt-5.6-terra")) return "gpt-5.6-terra";
    if (model.includes("gpt-5.6-luna")) return "gpt-5.6-luna";
    return "";
  };
  const sessionCostFallbackDescriptor = (stats) => {
    const current = currentModelRadarDescriptor();
    const currentModel = normalizeSessionCostModel(current.model);
    if (SESSION_PUBLIC_FALLBACK_PRICING[currentModel]) {
      return {
        model: currentModel,
        modelLabel: current.label || "当前模型",
      };
    }
    const sessionModel = normalizeSessionCostModel(stats?.model);
    if (!SESSION_PUBLIC_FALLBACK_PRICING[sessionModel]) return null;
    const family = sessionModel === "gpt-5.6-sol" ? "Sol"
      : sessionModel === "gpt-5.6-terra" ? "Terra" : "Luna";
    return {
      model: sessionModel,
      modelLabel: stats?.modelLabel || `${family}（会话模型）`,
    };
  };
  const estimateSessionTokenCost = (stats) => {
    const publicCost = stats?.publicCost;
    if (publicCost?.status === "available") {
      return {
        status: "available",
        fallback: false,
        modelLabel: publicCost.modelLabel || stats?.modelLabel || "当前模型",
        totalUsd: publicCost.totalUsd,
        inputUsd: publicCost.inputUsd,
        outputUsd: publicCost.outputUsd,
        cachedInputUsd: publicCost.cachedInputUsd,
        cacheWriteUsd: publicCost.cacheWriteUsd,
        source: publicCost.source,
        priceRevision: publicCost.priceRevision,
        longContextRequests: publicCost.longContextRequests,
      };
    }
    const fallback = sessionCostFallbackDescriptor(stats);
    if (!fallback) {
      return {
        status: "unavailable",
        modelLabel: stats?.modelLabel || "当前模型",
      };
    }
    const rates = SESSION_PUBLIC_FALLBACK_PRICING[fallback.model];
    const inputTokens = Math.max(0, Number(stats?.inputTokens) || 0);
    const cachedInputTokens = Math.min(inputTokens,
      Math.max(0, Number(stats?.cachedInputTokens) || 0));
    const cacheWriteInputTokens = Math.max(0, Number(stats?.cacheWriteInputTokens) || 0);
    const outputTokens = Math.max(0, Number(stats?.outputTokens) || 0);
    const uncachedInputUsd = (inputTokens - cachedInputTokens) * rates.input / 1e6;
    const cachedInputUsd = cachedInputTokens * rates.cachedInput / 1e6;
    const cacheWriteUsd = cacheWriteInputTokens * rates.cacheWrite / 1e6;
    const inputUsd = uncachedInputUsd + cachedInputUsd + cacheWriteUsd;
    const outputUsd = outputTokens * rates.output / 1e6;
    return {
      status: "available",
      fallback: true,
      modelLabel: fallback.modelLabel,
      totalUsd: inputUsd + outputUsd,
      inputUsd,
      outputUsd,
      cachedInputUsd,
      cacheWriteUsd,
      source: "当前模型 OpenAI API 公开价（兜底估算）",
      priceRevision: SESSION_PUBLIC_FALLBACK_PRICE_REVISION,
      longContextRequests: null,
    };
  };

  const formatSessionCost = (value) => Number.isFinite(value)
    ? `≈$${Math.max(0, value).toFixed(2)}` : "—";

  const readSessionTokenStats = () => {
    const rawSnapshot = window.__CODEX_DREAM_SKIN_SESSION_USAGE__;
    const activeThreadId = readActiveSessionThreadId();
    const snapshotThreadId = normalizeSessionThreadId(rawSnapshot?.threadId);
    const snapshotBelongsToActiveThread = !snapshotThreadId ||
      Boolean(activeThreadId && activeThreadId === snapshotThreadId);
    /* A React fiber can survive a route transition while its props still
       describe the previous conversation. Do not use that native fallback
       when the bridge has already identified a different session. Exact
       session-log data is sufficient on its own, so keep the expensive Fiber
       traversal strictly as an unavailable-bridge fallback. */
    const snapshot = snapshotBelongsToActiveThread
      ? readSessionUsageSnapshot(activeThreadId) : null;
    const native = snapshotBelongsToActiveThread && !snapshot
      ? readNativeSessionUsage(activeThreadId) || {} : {};
    const bridgedUsage = snapshot?.usage || null;
    const nativeUsage = native.usage || {};
    const context = native.context || {};
    const contextTokens = Number.isFinite(context.usedTokens) ? context.usedTokens : null;
    const hasNativeData = [
      bridgedUsage?.inputTokens,
      bridgedUsage?.outputTokens,
      bridgedUsage?.totalTokens,
      nativeUsage.inputTokens,
      nativeUsage.outputTokens,
      nativeUsage.totalTokens,
      contextTokens,
    ].some((value) => Number.isFinite(value));
    const usage = bridgedUsage || nativeUsage;
    const inputTokens = Number.isFinite(usage.inputTokens)
      ? usage.inputTokens : 0;
    const outputTokens = Number.isFinite(usage.outputTokens)
      ? usage.outputTokens : 0;
    const totalTokens = Math.max(
      Number.isFinite(usage.totalTokens) ? usage.totalTokens : 0,
      Number.isFinite(contextTokens) ? contextTokens : 0,
      inputTokens + outputTokens,
    );
    if (!hasNativeData || totalTokens <= 0) return { status: "unavailable" };
    const nativeCacheTokens = Number.isFinite(usage.cachedInputTokens)
      ? usage.cachedInputTokens : null;
    const estimatedCacheTokens = nativeCacheTokens == null && Number.isFinite(contextTokens) &&
      inputTokens + outputTokens > 0
      ? Math.max(0, totalTokens - inputTokens - outputTokens) : null;
    const cachedInputTokens = nativeCacheTokens ?? estimatedCacheTokens;
    const cacheHitPercent = Number.isFinite(cachedInputTokens)
      ? Math.max(0, Math.min(100, cachedInputTokens /
        Math.max(1, nativeCacheTokens == null ? totalTokens : inputTokens) * 100)) : null;
    const contextWindow = Number.isFinite(context.contextWindow) ? context.contextWindow
      : Number.isFinite(snapshot?.snapshot?.modelContextWindow)
        ? snapshot.snapshot.modelContextWindow : null;
    const contextPercent = Number.isFinite(contextTokens) && contextWindow > 0
      ? Math.max(0, Math.min(100, contextTokens / contextWindow * 100)) : null;
    return {
      status: "available",
      inputTokens,
      outputTokens,
      cachedInputTokens,
      cacheWriteInputTokens: Number.isFinite(usage.cacheWriteInputTokens)
        ? usage.cacheWriteInputTokens : 0,
      cacheHitPercent,
      totalTokens,
      contextTokens,
      contextWindow,
      remainingTokens: Number.isFinite(context.remainingTokens) ? context.remainingTokens : null,
      contextPercent,
      cacheEstimated: nativeCacheTokens == null && estimatedCacheTokens != null,
      exactBreakdown: bridgedUsage?.exactBreakdown === true || nativeUsage.exactBreakdown === true,
      source: bridgedUsage ? "session-log"
        : nativeUsage.exactBreakdown === true ? "native"
        : contextTokens != null ? "context-estimate"
          : "native-partial",
      model: snapshot?.snapshot?.model || "",
      modelLabel: snapshot?.snapshot?.modelLabel || "",
      publicCost: snapshot?.snapshot?.publicCost || null,
      currentTurn: snapshot?.snapshot?.currentTurn || null,
    };
  };

  const updateSessionTokenView = (node) => {
    if (!node?.isConnected || node.hidden || node.getAttribute("aria-hidden") === "true") return;
    const nodeStyle = getComputedStyle(node);
    if (nodeStyle.display === "none" || nodeStyle.visibility === "hidden" ||
      node.getClientRects().length === 0) return;
    const token = node?.querySelector(".codex-quota-token");
    if (!token) return;
    const stats = readSessionTokenStats();
    const setTokenText = (role, value) => {
      const target = token.querySelector('[data-codex-quota="' + role + '"]');
      if (target && target.textContent !== value) target.textContent = value;
    };
    if (stats.status !== "available") {
      setTokenText("token-total", "—");
      setTokenText("token-input", "—");
      setTokenText("token-output", "—");
      setTokenText("token-cache", "—");
      setTokenText("token-total-primary", "—");
      setTokenText("token-cache-primary", "—");
      setTokenText("token-total-cost", "—");
      setTokenText("token-input-cost", "—");
      setTokenText("token-output-cost", "—");
      setAttribute(token, "data-state", "unavailable");
      setAttribute(token, "data-cost-source", "unavailable");
      setTextContent(token.querySelector('[data-codex-quota="token-note"]') ||
        token.querySelector("header small"), "当前会话 · 等待原生 Token");
      setAttribute(token, "title", "当前会话 Token 与费用等待可用数据");
      return;
    }
    const cost = estimateSessionTokenCost(stats);
    setTokenText("token-total", formatSessionTokenCompact(stats.totalTokens));
    setTokenText("token-input", formatSessionTokenCompact(stats.inputTokens));
    setTokenText("token-output", formatSessionTokenCompact(stats.outputTokens));
    setTokenText("token-cache", formatSessionPercent(stats.cacheHitPercent, stats.cacheEstimated));
    setTokenText("token-total-primary", formatSessionTokenCompact(stats.totalTokens));
    setTokenText("token-cache-primary", formatSessionPercent(stats.cacheHitPercent, stats.cacheEstimated));
    setTokenText("token-total-cost", formatSessionCost(cost.totalUsd));
    setTokenText("token-input-cost", formatSessionCost(cost.inputUsd));
    setTokenText("token-output-cost", formatSessionCost(cost.outputUsd));
    const usageNote = stats.source === "session-log" ? "原生 Token · 会话累计"
      : stats.exactBreakdown ? "原生 Token"
      : stats.contextPercent != null ? `上下文 ${Math.round(stats.contextPercent)}%` : "原生数据不完整";
    const note = cost.status === "available"
      ? `${cost.modelLabel} · ${cost.fallback ? "当前模型兜底估算" : "公开价估算"} ${formatSessionCost(cost.totalUsd)} · ${usageNote}`
      : `公开价格待同步 · ${usageNote}`;
    setTextContent(token.querySelector('[data-codex-quota="token-note"]') ||
      token.querySelector("header small"), note);
    setAttribute(token, "title", cost.status === "available"
      ? cost.fallback
        ? `按当前界面的 ${cost.modelLabel} 公开 API 标准价格兜底估算：输入含缓存与缓存写入 ${formatSessionCost(cost.inputUsd)}，输出 ${formatSessionCost(cost.outputUsd)}，合计 ${formatSessionCost(cost.totalUsd)}。历史模型或长上下文分档不能逐请求还原；这不是 Codex 订阅账单。`
        : `按 ${cost.modelLabel} 的 OpenAI 公开 API 标准价格计算：输入含缓存与缓存写入 ${formatSessionCost(cost.inputUsd)}，输出 ${formatSessionCost(cost.outputUsd)}，合计 ${formatSessionCost(cost.totalUsd)}。这是 API 等价值，不是 Codex 订阅账单。`
      : "当前模型的 OpenAI 公开价格尚未同步，Token 费用暂不可估算。");
    setAttribute(token, "data-cost-source", cost.status === "available"
      ? cost.fallback ? "fallback" : "exact" : "unavailable");
    setAttribute(token, "data-state", stats.exactBreakdown ? "native" : "estimated");
    const bar = token.querySelector(".codex-quota-token-bar");
    if (bar) {
      const total = Math.max(1, stats.totalTokens);
      const input = Math.max(0, Math.min(100, stats.inputTokens / total * 100));
      const output = Math.max(0, Math.min(100 - input, stats.outputTokens / total * 100));
      const cache = Number.isFinite(stats.cachedInputTokens)
        ? Math.max(0, Math.min(100 - input - output, stats.cachedInputTokens / total * 100))
        : Math.max(0, 100 - input - output);
      setStyleProperty(bar, "--codex-quota-token-input", input.toFixed(2) + "%");
      setStyleProperty(bar, "--codex-quota-token-output", output.toFixed(2) + "%");
      setStyleProperty(bar, "--codex-quota-token-cache", cache.toFixed(2) + "%");
      setAttribute(bar, "data-state", stats.exactBreakdown ? "native" : "estimated");
      const contextLabel = stats.contextPercent == null ? ""
        : " \u00b7 \u4e0a\u4e0b\u6587 " + Math.round(stats.contextPercent) + "%";
      setAttribute(bar, "aria-label",
        "\u5f53\u524d\u4f1a\u8bdd Token \u603b\u8ba1 " + formatSessionTokenCount(stats.totalTokens) + contextLabel);
    }
  };

  const systemClockFormatter = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const systemDateFormatter = new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const systemClockParts = (value = new Date()) => {
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) {
      return { time: "--:--:--", date: "日期待确认" };
    }
    const clockParts = systemClockFormatter.formatToParts(date);
    const dateParts = systemDateFormatter.formatToParts(date);
    const valueOf = (parts, type, fallback = "") => parts.find((part) => part.type === type)?.value || fallback;
    return {
      time: `${valueOf(clockParts, "hour", "00")}:${valueOf(clockParts, "minute", "00")}:${valueOf(clockParts, "second", "00")}`,
      date: `${valueOf(dateParts, "month")}月${valueOf(dateParts, "day")}日 ${valueOf(dateParts, "weekday")}`,
    };
  };
  const quotaUpdatedText = (state, now = new Date()) => {
    const freshness = quotaText(state?.freshness);
    const suffix = freshness === "cached" || freshness === "stale" ? " · 缓存"
      : freshness === "live" ? " · 实时" : "";
    return `${systemClockParts(now).time}${suffix}`;
  };

  const quotaRadarUpdatedText = (radar) => {
    if (!radar) return "";
    /* updatedAt is the source page's publication time. Only fetchedAt or
       checkedAt may be labelled as real-time in the UI. */
    let time = quotaText(radar.fetchedAt || radar.checkedAt || radar.updatedAt);
    const date = new Date(time);
    if (time && Number.isFinite(date.getTime())) {
      const formatter = new Intl.DateTimeFormat("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      time = formatter.format(date);
    }
    const status = radar.status === "live" ? "实时"
      : String(radar.status || "").includes("cached") ? "缓存"
        : "本地兜底";
    return [status, time].filter(Boolean).join(" · ");
  };

  const formatQuotaResetDisplay = (value) => {
    const raw = quotaText(value);
    if (!raw) return "";
    const chinese = raw.match(/(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
    const date = chinese
      ? new Date(new Date().getFullYear(), Number(chinese[1]) - 1, Number(chinese[2]),
        Number(chinese[3]), Number(chinese[4]))
      : new Date(raw);
    if (!Number.isFinite(date.getTime())) return raw.replace(/\s*重置$/u, "");
    return new Intl.DateTimeFormat("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  const formatQuotaHeroResetDisplay = (value) => {
    const raw = quotaText(value);
    if (!raw) return "";
    const chinese = raw.match(/(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
    const date = chinese
      ? new Date(new Date().getFullYear(), Number(chinese[1]) - 1, Number(chinese[2]),
        Number(chinese[3]), Number(chinese[4]))
      : new Date(raw);
    if (!Number.isFinite(date.getTime())) return raw.replace(/\s*重置$/u, "");
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getMonth() + 1}月${date.getDate()}日${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const quotaHealthLabel = (state) => {
    const level = quotaLevel(state);
    if (level === "healthy") return "充足";
    if (level === "normal") return "正常";
    if (level === "warning") return "偏低";
    if (level === "critical") return "紧张";
    return state?.status === "loading" ? "同步中" : "不可用";
  };

  /* quotaText is intentionally capped for compact metadata. Post bodies need
     their full signal text because "reset" may appear after the first 80
     characters. */
  const decodeTiboHtmlText = (value) => {
    const text = typeof value === "string" ? value : "";
    if (!text || !/(?:&(?:amp|lt|gt|quot|apos);|&#(?:x[\da-f]+|\d+);)/i.test(text)) return text;
    try {
      const decoder = document.createElement("textarea");
      decoder.innerHTML = text;
      return decoder.value || text;
    } catch {
      return text;
    }
  };

  const tiboPostText = (value) => typeof value === "string"
    ? decodeTiboHtmlText(value.trim().slice(0, 2000)) : "";

 const quotaTiboPreview = (resetSnapshot = null, resetSignal = null, resetReconciliation = null) => {
   const direct = tiboRadarState || readTiboRadarCache({ allowStale: true });
   const reset = resetSnapshot || quotaResetRadarSnapshot();
   const resetSignalActive = Boolean(resetSignal?.active && !resetSignalIsTerminal(reset));
   const latest = tiboPostText(direct?.latestPostText || reset?.latestPostText);
   const displayText = tiboPostText(direct?.displayPostText || reset?.displayPostText);
   const latestRelevance = quotaText(
     direct?.latestPostRelevance || direct?.latestRelevance ||
     reset?.latestPostRelevance || reset?.latestRelevance,
     "none",
   ).toLowerCase();
   const latestPostIntent = quotaText(
     direct?.latestPostIntent || reset?.latestPostIntent,
   ).toLowerCase();
   const latestPostSummary = quotaText(
     direct?.latestPostSummaryZh || reset?.latestPostSummaryZh,
   );
   const latestPost = {
     text: latest || (displayText && displayText === latest ? displayText : ""),
     at: quotaText(
       direct?.latestPostAt || direct?.tiboUpdatedAt || direct?.newestPostAt ||
       (displayText && displayText === latest ? direct?.displayPostAt : "") ||
        reset?.latestPostAt || reset?.tiboUpdatedAt || reset?.newestPostAt,
      ),
      url: quotaText(
        direct?.latestPostUrl || reset?.latestPostUrl ||
        (displayText && displayText === latest ? direct?.displayPostUrl || reset?.displayPostUrl : ""),
      ),
     kind: quotaText(direct?.latestPostKind || reset?.latestPostKind ||
       (displayText && displayText === latest ? direct?.displayPostKind || reset?.displayPostKind : "")),
     isReply: direct?.latestPostIsReply === true || reset?.latestPostIsReply === true,
      relevance: latestRelevance,
      intent: latestPostIntent,
      summary: latestPostSummary,
      probability: Number(direct?.latestPostProbability ?? reset?.latestPostProbability),
      reason: quotaText(direct?.latestPostReason || reset?.latestPostReason),
      nextResetTime: quotaText(direct?.latestPostNextResetTime || reset?.latestPostNextResetTime),
   };
   const postCandidates = [
     {
       text: tiboPostText(direct?.displayPostText),
       at: quotaText(direct?.displayPostAt),
       url: quotaText(direct?.displayPostUrl),
       kind: quotaText(direct?.displayPostKind),
       isReply: direct?.displayPostIsReply === true,
        relevance: quotaText(direct?.displayPostRelevance || direct?.strongestRelevance).toLowerCase(),
        probability: Number(direct?.displayPostProbability ?? direct?.probability),
        reason: quotaText(direct?.displayPostReason || direct?.reason),
        nextResetTime: quotaText(direct?.displayPostNextResetTime || direct?.nextResetTime),
     },
     {
       text: tiboPostText(reset?.displayPostText),
       at: quotaText(reset?.displayPostAt),
       url: quotaText(reset?.displayPostUrl),
       kind: quotaText(reset?.displayPostKind),
       isReply: reset?.displayPostIsReply === true,
        relevance: quotaText(reset?.displayPostRelevance || reset?.strongestRelevance).toLowerCase(),
        probability: Number(reset?.displayPostProbability ?? reset?.probability),
        reason: quotaText(reset?.displayPostReason || reset?.reason),
        nextResetTime: quotaText(reset?.displayPostNextResetTime || reset?.nextResetTime),
     },
     {
       text: tiboPostText(direct?.lastResetPostText),
       at: quotaText(direct?.lastResetPostAt || direct?.lastResetAt),
       url: quotaText(direct?.lastResetUrl),
       kind: quotaText(direct?.lastResetPostKind),
       isReply: direct?.lastResetPostIsReply === true,
        relevance: direct?.lastResetPostText ? "confirmed" : "none",
        probability: direct?.lastResetPostText ? 100 : Number.NaN,
        reason: quotaText(direct?.lastResetPostSummaryZh),
        nextResetTime: "",
     },
     {
       text: tiboPostText(reset?.lastResetPostText),
       at: quotaText(reset?.lastResetPostAt || reset?.lastResetAt),
       url: quotaText(reset?.lastResetUrl),
       kind: quotaText(reset?.lastResetPostKind),
       isReply: reset?.lastResetPostIsReply === true,
        relevance: reset?.lastResetPostText ? "confirmed" : "none",
        probability: reset?.lastResetPostText ? 100 : Number.NaN,
        reason: quotaText(reset?.lastResetPostSummaryZh),
        nextResetTime: "",
     },
      latestPost,
   ];
    const keyPost = (resetSignalActive ? postCandidates.find((candidate) => candidate.text &&
      /^(?:direct|official|likely)$/.test(candidate.relevance)) : null) ||
      postCandidates.find((candidate) => candidate.text &&
      candidate.relevance === "confirmed") ||
      postCandidates.find((candidate) => candidate.text &&
      /^(?:confirmed|direct|official|likely)$/.test(candidate.relevance)) ||
      postCandidates.find((candidate) => candidate.text &&
        /(?:reset|quota|usage\s+limits?|rate\s+limits?)/i.test(candidate.text)) || null;
    const evidence = direct?.timelineEvidence || reset?.timelineEvidence || {};
    const scannedPostCount = Math.max(0, Number(evidence.scannedPostCount) || 0);
    const relevantPostCount = Math.max(0, Number(evidence.relevantPostCount) || 0);
    const confirmedPostCount = Math.max(0, Number(evidence.confirmedPostCount) || 0);
    const planningPostCount = Math.max(0, Number(evidence.planningPostCount) || 0);
    const feedbackPostCount = Math.max(0, Number(evidence.feedbackPostCount) || 0);
    const announcementPostCount = Math.max(0, Number(evidence.announcementPostCount) || 0);
    const pendingSignalCount = Math.max(0, Number(
      evidence.pendingSignalCount ?? evidence.strongSignalCount,
    ) || 0);
    const contextualGroupCount = Math.max(0, Number(evidence.contextualGroupCount) || 0);
   const resetProbability = Number(resetSignal?.probability ?? reset?.nextProbability);
   const resetTime = quotaText(reset?.nextResetTime);
   const resetReason = quotaText(reset?.nextReason || reset?.reason);
   const resetConfirmation = quotaText(reset?.nextConfirmation || reset?.confirmation).toLowerCase();
    const lastResetAt = quotaText(reset?.lastResetPostAt || reset?.lastResetAt ||
      direct?.lastResetPostAt || direct?.lastResetAt || resetReconciliation?.lastResetAt);
    const resetWasConfirmed = Boolean(lastResetAt) ||
      resetReconciliation?.resetStatus === "confirmed" ||
      /^(?:reset-confirmed|historical-reset)$/.test(
        quotaText(reset?.outcome || direct?.outcome).toLowerCase(),
      );
    const latestPlanning = latestPost.intent === "planning" ||
      (latestPost.relevance === "none" &&
        /\bwhat\s+(?:should|could)\s+(?:we|i)\s+(?:ship|release|launch|build|announce)\b[\s\S]{0,56}\bnext\s+week\b/i.test(
          latestPost.text,
        )) ||
      (latestPost.relevance === "none" &&
        /\b(?:ship|release|launch|build|announce)\b[\s\S]{0,40}\bnext\s+week\b/i.test(
          latestPost.text,
        ));
    const latestFeedback = latestPost.intent === "feedback" ||
      (latestPost.relevance === "none" &&
        /\b(?:haven['’]?t|have\s+not)\s+(?:tried|used|started|adopted)\b[\s\S]{0,180}\b(?:considered|thought\s+about|wanted\s+to)\b[\s\S]{0,140}\b(?:holding|stopping|keeping|blocking)\b/i.test(
          latestPost.text,
        )) ||
      (latestPost.relevance === "none" &&
        /\b(?:what|which|why)\b[\s\S]{0,100}\b(?:holding|stopping|keeping|blocking|barrier|blocker|friction|obstacle)\b[\s\S]{0,100}\b(?:you|users?|people)\b/i.test(
          latestPost.text,
        ));
    const latestAnnouncement = latestPost.intent === "announcement";
    const latestIntentLabel = latestFeedback ? "用户调研"
      : latestPlanning ? "下周发布意向"
        : latestAnnouncement ? "产品公告" : "";
    const interpretationPost = resetSignalActive
      ? (keyPost || latestPost)
      : (latestPost.text ? latestPost : keyPost);
    const translation = translateTiboPostZh(interpretationPost);
    const understanding = understandTiboPostZh(interpretationPost);
    const latestInterpretation = latestFeedback
      ? summarizeTiboPostZh({ ...latestPost, intent: "feedback" })
      : latestPlanning
        ? "下周产品发布意向（弱）：Tibo 在征集“下周要发布什么”的建议；原文未提额度、用量或 reset。"
        : latestAnnouncement
          ? summarizeTiboPostZh({ ...latestPost, intent: "announcement" })
      : latestPost.relevance === "none" && latestPost.summary &&
        !/最新动态未给出明确的额度重置信号/.test(latestPost.summary)
        ? latestPost.summary : "";
    const evidenceAnalysis = scannedPostCount
      ? [
        `已综合最近 ${scannedPostCount} 条动态`,
        confirmedPostCount ? `确认重置 ${confirmedPostCount} 处` :
          resetWasConfirmed ? "额度状态已确认上轮重置；Tibo 确认帖待同步" : "未发现确认重置",
        pendingSignalCount ? `待落地强信号 ${pendingSignalCount} 处` : "暂无待落地强信号",
        planningPostCount ? `下周规划线索 ${planningPostCount} 处` : "",
        feedbackPostCount ? `用户调研线索 ${feedbackPostCount} 处` : "",
        announcementPostCount ? `产品公告 ${announcementPostCount} 处` : "",
        relevantPostCount > pendingSignalCount + confirmedPostCount
          ? `相关线索 ${relevantPostCount - pendingSignalCount - confirmedPostCount} 处` : "",
        contextualGroupCount ? `含 ${contextualGroupCount} 组回复联合判断` : "",
      ].filter(Boolean).join(" · ")
      : "等待 Tibo 最新动态同步。";
    const resetAnalysis = resetSignalActive
      ? [
        resetConfirmation === "official" ? "官方确认 reset" : "检测到 reset 信号",
        Number.isFinite(resetProbability) ? `当前判断：${Math.round(resetProbability)}%` : "",
        resetTime ? `时间：${resetTime}` : "时间待定",
        resetReason ? `依据：${resetReason}` : "",
      ].filter(Boolean).join(" · ")
      : "";
   const resetVerdict = resetConfirmation === "official"
     ? `reset 信号已确认${resetTime ? `，预计在 ${resetTime} 落地` : "，等待落地"}。`
     : Number.isFinite(resetProbability) && resetProbability >= 75
       ? `reset 信号较强${resetTime ? `，预计在 ${resetTime} 落地` : "，等待确认"}。`
       : "检测到 reset 信号，等待进一步确认。";
   const strongOfficialSignal = resetSignalActive && resetConfirmation === "official";
    const signalTime = resetTime || keyPost?.nextResetTime || "时间待同步";
    const compactQuotaEvidence = scannedPostCount
      ? `近 ${scannedPostCount} 条中：确认重置 ${confirmedPostCount} 处，待落地额度强信号 ${pendingSignalCount} 处。`
      : "";
    const displayAnalysis = resetSignalActive
      ? [
        evidenceAnalysis,
        latestInterpretation ? `最新原文推测：${latestInterpretation}` : "",
        resetAnalysis,
      ].filter(Boolean).join(" · ")
      : latestInterpretation
        ? [latestInterpretation, compactQuotaEvidence].filter(Boolean).join(" ")
        : [evidenceAnalysis, resetAnalysis].filter(Boolean).join(" · ");
   const displayVerdict = resetSignalActive
     ? strongOfficialSignal
       ? `强信号已确认：reset 预计在 ${signalTime} 落地。`
       : resetVerdict
      : keyPost?.relevance === "confirmed" || resetWasConfirmed
        ? latestFeedback
          ? "上轮已重置；最新动态是用户调研/反馈征集，不作为下轮额度信号。"
          : latestPlanning
            ? "上轮已重置；下轮额度暂无信号。此帖是下周发布意向，不作为 reset 预测。"
            : latestAnnouncement
              ? "上轮已重置；最新动态是产品公告，不作为下轮额度信号。"
              : `已识别上轮重置；${pendingSignalCount
                ? "下一轮信号仍在核对。" : "近期未出现新的下轮信号。"}`
        : latestFeedback
          ? "此帖是用户调研/反馈征集，未构成额度 reset 信号。"
          : latestPlanning
            ? "此帖是下周产品规划意向，未构成额度 reset 信号。"
            : latestAnnouncement
              ? "此帖是产品/平台公告，未构成额度 reset 信号。"
              : keyPost && /^(?:direct|official|likely)$/.test(keyPost.relevance)
          ? "近期动态出现重置信号，仍需等待落地或更多确认。"
          : scannedPostCount
            ? `已核对近 ${scannedPostCount} 条动态，未发现明确的额度重置信号。`
            : "等待 Tibo 最新动态同步。";
   return {
     reset,
      mode: resetSignalActive ? "signal" : keyPost?.text || latestPost.text ? "verbose" : "compact",
      original: keyPost?.text || "",
      originalLabel: keyPost?.relevance === "confirmed" ? "最近确认：" : "关键动态：",
     analysis: direct?.syncFailed ? `动态同步失败，以下为缓存证据，不能据此排除新信号。${displayAnalysis}`
       : direct?.incompletePostCount ? `有 ${direct.incompletePostCount} 条长文未完整读取，时间与信号可能遗漏。${displayAnalysis}` : displayAnalysis,
      analysisLabel: resetSignalActive ? "近期证据：" :
        latestInterpretation ? "原文推测：" : "近期证据：",
      analysisVisible: Boolean(displayAnalysis),
      verdict: direct?.syncFailed && !resetSignalActive
       ? "动态同步失败，最新重置信号待核实。"
       : direct?.incompletePostCount && !resetSignalActive
          ? "部分长文不完整，暂不能排除新的重置信号。" : displayVerdict,
      verdictLabel: latestInterpretation ? "额度判断：" : "综合判断：",
      translation,
      understanding,
      interpretationVisible: Boolean(interpretationPost?.text && (translation || understanding)),
      latest: latestPost.text || "暂无最新动态",
      latestLabel: "最新原文：",
     probability: resetSignalActive && Number.isFinite(resetProbability)
       ? Math.max(0, Math.min(100, Math.round(resetProbability)))
        : keyPost && Number.isFinite(keyPost.probability)
          ? Math.max(0, Math.min(100, Math.round(keyPost.probability))) : null,
     signalActive: resetSignalActive,
      planningSignal: latestPlanning,
      feedbackSignal: latestFeedback,
      announcementSignal: latestAnnouncement,
      planningPostCount,
      feedbackPostCount,
      announcementPostCount,
      latestIntentLabel,
      latestIntent: latestFeedback ? "feedback"
        : latestPlanning ? "planning"
          : latestAnnouncement ? "announcement" : latestPost.intent || "general",
     relevance: keyPost?.relevance || latestRelevance,
     postAt: quotaText(
        keyPost?.at || latestPost.at || direct?.tiboUpdatedAt || reset?.tiboUpdatedAt,
     ),
     time: formatQuotaRingTime(
        keyPost?.at || latestPost.at || direct?.tiboUpdatedAt || reset?.tiboUpdatedAt || reset?.checkedAt,
     ),
      url: keyPost?.url || latestPost.url,
      postKind: keyPost?.kind || latestPost.kind,
      isReply: keyPost?.isReply ?? latestPost.isReply,
     source: quotaText(direct?.source || reset?.source, "X · @thsottiaux"),
   };
 };

  const reconcileQuotaResetCause = (resetInfo) => {
    const current = normalizeQuotaResetReconciliation(
      quotaResetReconciliation || readQuotaResetReconciliation(),
    );
    if (!resetInfo || typeof resetInfo !== "object") return current;
    const tiboResetAt = quotaConfirmedTiboResetAt(resetInfo);
    const tiboResetAtMs = quotaTimestampMs(tiboResetAt);
    const currentResetAtMs = quotaTimestampMs(current.lastResetAt);
    const sourceIsCurrent = Boolean(tiboResetAt) &&
      (!Number.isFinite(currentResetAtMs) || tiboResetAtMs >= currentResetAtMs);
    if (sourceIsCurrent && (current.resetStatus !== "confirmed" ||
      current.resetCause !== "tibo-official" || current.lastResetAt !== tiboResetAt)) {
      return writeQuotaResetReconciliation({
        ...current,
        resetStatus: "confirmed",
        resetCause: "tibo-official",
        lastResetAt: tiboResetAt,
        resetVerifiedAt: quotaText(resetInfo?.checkedAt) || new Date().toISOString(),
      });
    }
    if (current.resetStatus !== "confirmed") return current;
    const officialEvidence = Boolean(tiboResetAt) || resetInfo?.nextConfirmation === "official" ||
      resetInfo?.strongestRelevance === "official" ||
      Boolean(resetInfo?.lastResetPostId && /(?:reset|quota|usage\s+limits?|rate\s+limits?)/i.test(
        String(resetInfo.lastResetPostText || ""),
      ));
    const resetAtMs = quotaTimestampMs(current.lastResetAt);
    const relatedSignal = [
      resetInfo?.nextEventAt,
      resetInfo?.lastResetPostAt,
      resetInfo?.lastResetAt,
      resetInfo?.tiboUpdatedAt,
    ].map((value) => quotaTimestampMs(value)).filter(Number.isFinite)
      .some((timestamp) => !Number.isFinite(resetAtMs) || Math.abs(timestamp - resetAtMs) <= 36 * 60 * 60 * 1000);
    const cause = officialEvidence && relatedSignal ? "tibo-official" : "periodic";
    if (current.resetCause !== cause) return writeQuotaResetReconciliation({ ...current, resetCause: cause });
    return current;
  };

  const quotaResetNextSignal = (resetInfo, reconciliation) => {
    const hasRawSignal = resetInfo?.hasResetSignal === true &&
      resetInfo?.nextSignalStatus !== "none" && resetInfo?.nextPredictionStatus !== "none" &&
      Number.isFinite(Number(resetInfo?.nextProbability));
    const resetAtMs = quotaTimestampMs(reconciliation?.lastResetAt);
    const signalAtMs = quotaTimestampMs(
      resetInfo?.nextEventAt || resetInfo?.eventUpdatedAt || resetInfo?.nextSignalAt,
    );
    const staleSignal = reconciliation?.resetStatus === "confirmed" &&
      (!Number.isFinite(signalAtMs) || (Number.isFinite(resetAtMs) && signalAtMs < resetAtMs));
    const active = hasRawSignal && !staleSignal;
    const probability = active ? Number(resetInfo.nextProbability) : Number.NaN;
    return {
      active,
      probability,
      level: active
        ? resetInfo?.nextLevelLabel || resetRadarLevelLabel(resetInfo?.nextLevel)
        : "低",
      staleSignal,
    };
  };

  const formatTiboPostTime = (value) => {
    const raw = quotaText(value);
    const date = new Date(raw);
    if (!raw || !Number.isFinite(date.getTime())) {
      return { time: "--:--:--", date: "\u65e5\u671f\u5f85\u786e\u8ba4", zone: TIBO_X_TIME_LABEL };
    }
    const parts = new Intl.DateTimeFormat("zh-CN", {
      timeZone: TIBO_X_TIME_ZONE,
      month: "numeric",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const valueOf = (type, fallback = "") => parts.find((part) => part.type === type)?.value || fallback;
    return {
      time: `${valueOf("hour", "00")}:${valueOf("minute", "00")}:${valueOf("second", "00")}`,
      date: `${valueOf("month")}\u6708${valueOf("day")}\u65e5 ${valueOf("weekday")}`,
      zone: TIBO_X_TIME_LABEL,
    };
  };

  const formatTiboResetDisplay = (value) => {
    const raw = quotaText(value);
    const date = new Date(raw);
    if (!raw || !Number.isFinite(date.getTime())) return "";
    const parts = new Intl.DateTimeFormat("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const valueOf = (type, fallback = "") => parts.find((part) => part.type === type)?.value || fallback;
    return `${valueOf("month")}/${valueOf("day")} ${valueOf("hour", "00")}:${valueOf("minute", "00")} \u672c\u5730`;
  };

  const updateTiboPostTimeView = (node, tibo) => {
    if (!node) return;
    const posted = formatTiboPostTime(tibo?.postAt);
    const published = tibo?.postAt
      ? `${tibo?.originalLabel || "关键动态"} ${posted.date} ${posted.time.slice(0, 5)} ${posted.zone}`
      : "发布时间待同步";
    const publishedNode = node.querySelector('[data-codex-quota="tibo-published"]');
    setTextContent(publishedNode, published);
    if (publishedNode && tibo?.postAt) setAttribute(publishedNode, "datetime", quotaText(tibo.postAt));
    else publishedNode?.removeAttribute("datetime");
    setTextContent(node.querySelector('[data-codex-quota="tibo-location"]'),
      `\u6765\u6e90\uff1aX \u00b7 @thsottiaux \u00b7 ${tibo?.isReply ? "\u56de\u590d" : tibo?.postKind ? "\u52a8\u6001" : "\u7c7b\u578b\u5f85\u786e\u8ba4"} \u00b7 IP/\u4f4d\u7f6e\u672a\u516c\u5f00 \u00b7 ${posted.zone}`);
  };

  const updateTiboLocalClockViews = (now = new Date()) => {
    const local = formatTiboPostTime(now.toISOString());
    /* The same quota card is rendered in the header popover and in the
       environment panel. Keep both surfaces on the live Tibo clock; the
       panel must not retain the template's --:--:-- / -- placeholders. */
    for (const clock of document.querySelectorAll(
      "#codex-quota-popover .codex-quota-tibo-clock, #codex-quota-panel .codex-quota-tibo-clock",
    )) {
      if (clock.closest("[hidden]")) continue;
      setTextContent(clock.querySelector('[data-codex-quota="tibo-local-time-value"]'), local.time);
      setTextContent(clock.querySelector('[data-codex-quota="tibo-local-date"]'), local.date);
      setAttribute(clock, "aria-label", `Tibo \u6240\u5728\u5730\u5f53\u524d\u65f6\u95f4\uff1a${local.date} ${local.time} ${local.zone}`);
    }
  };

  const prepareQuotaTiboText = (node, preferredPx = null) => {
    if (!node || !node.textContent?.trim()) return;
    if (Number.isFinite(preferredPx)) {
      node.style.setProperty("font-size", `${preferredPx}px`, "important");
    }
    node.style.setProperty("-webkit-line-clamp", "unset", "important");
    node.style.setProperty("overflow", "visible", "important");
    node.style.setProperty("text-overflow", "clip", "important");
    node.setAttribute("data-codex-quota-fit", "full");
  };

  const quotaTiboTextIsOverlong = (node, maxLines) => {
    if (!node || !node.textContent?.trim()) return false;
    const lineHeight = Number.parseFloat(getComputedStyle(node).lineHeight) || 16;
    return node.scrollHeight > lineHeight * maxLines + 1.5;
  };

  const syncQuotaTiboHeight = (root) => {
    const center = root?.querySelector?.(".codex-quota-center");
    const card = root?.querySelector?.(".codex-quota-tibo");
    const main = root?.querySelector?.(".codex-quota-center-main");
    const hero = root?.querySelector?.(".codex-quota-hero");
    if (!center || !card || !main || !hero) return;

    const rows = [
      { node: root.querySelector('[data-codex-quota="tibo-latest"]'), maxLines: 4 },
      { node: root.querySelector('[data-codex-quota="tibo-analysis"]'), maxLines: 3 },
      { node: root.querySelector('[data-codex-quota="tibo-verdict"]'), maxLines: 2 },
      { node: root.querySelector('[data-codex-quota="tibo-translation"]'), maxLines: 3 },
      { node: root.querySelector('[data-codex-quota="tibo-understanding"]'), maxLines: 3 },
    ].filter(({ node }) => node?.textContent?.trim() && !node.closest("[hidden]"));

    if (!rows.length) return;

    card.setAttribute("data-codex-tibo-sizing", "expanded");
    main.setAttribute("data-codex-tibo-sizing", "expanded");
    hero.setAttribute("data-codex-tibo-sizing", "expanded");
    center.setAttribute("data-codex-tibo-sizing", "expanded");
    center.style.setProperty("grid-template-rows", "32px auto 136px", "important");
    center.style.setProperty("height", "auto", "important");
    center.style.setProperty("overflow", "visible", "important");
    card.style.setProperty("height", "auto", "important");
    card.style.setProperty("min-height", "286px", "important");
    card.style.setProperty("overflow", "visible", "important");
    main.style.setProperty("height", "auto", "important");
    main.style.setProperty("overflow", "visible", "important");
    hero.style.setProperty("height", "auto", "important");
    hero.style.setProperty("min-height", "286px", "important");

    const allTooLong = rows.length > 1 && rows.every(({ node, maxLines }) =>
      quotaTiboTextIsOverlong(node, maxLines));
    if (!allTooLong) return;

    card.setAttribute("data-codex-tibo-sizing", "compact");
    main.setAttribute("data-codex-tibo-sizing", "compact");
    hero.setAttribute("data-codex-tibo-sizing", "compact");
    center.setAttribute("data-codex-tibo-sizing", "compact");
    center.style.setProperty("grid-template-rows", "32px 286px 136px", "important");
    center.style.setProperty("height", "auto", "important");
    center.style.setProperty("overflow", "visible", "important");
    card.style.setProperty("height", "286px", "important");
    card.style.setProperty("min-height", "0", "important");
    card.style.setProperty("overflow", "hidden", "important");
    main.style.setProperty("height", "286px", "important");
    main.style.setProperty("overflow", "hidden", "important");
    hero.style.setProperty("height", "286px", "important");
    hero.style.setProperty("min-height", "0", "important");
    for (const { node, maxLines } of rows) {
      node.style.setProperty("-webkit-line-clamp", String(maxLines), "important");
      node.style.setProperty("overflow", "hidden", "important");
      node.style.setProperty("text-overflow", "ellipsis", "important");
      node.setAttribute("data-codex-quota-fit", "compact");
    }
  };

  const updateQuotaSystemClockViews = (now = new Date()) => {
    for (const updatedNode of document.querySelectorAll('[data-codex-quota="updated"]')) {
      if (updatedNode.closest("[hidden]")) continue;
      setTextContent(updatedNode, quotaUpdatedText(quotaState, now));
    }
    updateTiboLocalClockViews(now);
  };

  const quotaDetailSurfaceIsVisible = () => {
    if (document.visibilityState !== "visible") return false;
    return [
      document.getElementById("codex-quota-popover"),
      document.getElementById("codex-quota-panel"),
    ].some((surface) => {
      if (!(surface instanceof HTMLElement) || !surface.isConnected || surface.hidden) return false;
      const style = getComputedStyle(surface);
      if (style.display === "none" || style.visibility === "hidden") return false;
      const rect = surface.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  };

  const ensureQuotaSystemClock = () => {
    if (!quotaDetailSurfaceIsVisible()) {
      quotaSystemClockRuntime?.stop?.();
      return;
    }
    if (quotaSystemClockRuntime) {
      quotaSystemClockRuntime.start?.();
      return;
    }
    const previousRuntime = window[QUOTA_SYSTEM_CLOCK_RUNTIME_KEY];
    if (previousRuntime && typeof previousRuntime.stop === "function") {
      try { previousRuntime.stop(); } catch {}
    }
    const runtime = {
      timer: null,
      start() {
        if (this.timer !== null || typeof window.setInterval !== "function") return;
        this.timer = window.setInterval(() => runtime.tick(), 1000);
      },
      stop() {
        if (this.timer !== null) window.clearInterval(this.timer);
        this.timer = null;
      },
      tick: () => {
        if (window[QUOTA_SYSTEM_CLOCK_RUNTIME_KEY] !== runtime || window[DISABLED_KEY]) {
          runtime.stop();
          return;
        }
        if (!quotaDetailSurfaceIsVisible()) {
          runtime.stop();
          return;
        }
        updateQuotaSystemClockViews();
      },
    };
    quotaSystemClockRuntime = runtime;
    window[QUOTA_SYSTEM_CLOCK_RUNTIME_KEY] = runtime;
    runtime.start();
    updateQuotaSystemClockViews();
  };

  const syncQuotaThemeSurface = (node) => {
    if (!node || typeof getComputedStyle !== "function") return;
    const rootStyle = getComputedStyle(document.documentElement);
    const properties = [
      ["text", "--ds-text"],
      ["muted", "--ds-muted"],
      ["panel-rgb", "--ds-panel-rgb"],
      ["panel-2-rgb", "--ds-panel-2-rgb"],
      ["line-rgb", "--ds-line-rgb"],
      ["bg-rgb", "--ds-bg-rgb"],
      ["accent-rgb", "--ds-accent-rgb"],
      ["accent-alt-rgb", "--ds-accent-alt-rgb"],
    ];
    for (const [target, source] of properties) {
      const value = rootStyle.getPropertyValue(source).trim();
      if (value) setStyleProperty(node, `--codex-quota-theme-${target}`, value);
    }
    const panel = rootStyle.getPropertyValue("--ds-panel-rgb").match(/[\d.]+/g)?.slice(0, 3)
      .map(Number);
    if (panel?.length === 3 && panel.every(Number.isFinite)) {
      const linear = panel.map((value) => {
        const channel = Math.max(0, Math.min(255, value)) / 255;
        return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
      });
      const luminance = .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
      setAttribute(node, "data-theme-tone", luminance > .46 ? "light" : "dark");
    }
  };

  /* Theme switching changes the root palette synchronously, while quota data
     is intentionally refreshed less often. Repaint existing quota surfaces
     immediately so a new wallpaper never carries the previous theme's ring,
     Tibo title, or token accent until the next data poll. */
  const refreshQuotaThemeViews = () => {
    if (!document?.documentElement) return;
    const roots = [
      document.getElementById("codex-quota-pill"),
      document.getElementById("codex-quota-popover"),
      document.getElementById("codex-quota-panel"),
      document.getElementById("codex-quota-composer-portal"),
      document.getElementById("codex-quota-ring-composer"),
      document.getElementById("codex-quota-ring-details"),
      document.getElementById("codex-quota-ring-tooltip"),
      document.getElementById("codex-quota-reset-composer"),
      document.getElementById("codex-quota-reset-details"),
    ].filter((node, index, list) => node instanceof HTMLElement && list.indexOf(node) === index);
    const accent = "rgb(var(--codex-quota-surface-accent, var(--ds-accent-rgb, 71 142 213)))";
    for (const root of roots) {
      syncQuotaThemeSurface(root);
      if (root.style.getPropertyValue("--codex-quota-color")) {
        setStyleProperty(root, "--codex-quota-color", accent);
      }
      for (const node of root.querySelectorAll("[style]")) {
        if (node.style.getPropertyValue("--codex-quota-color")) {
          setStyleProperty(node, "--codex-quota-color", accent);
        }
      }
    }
  };

  const updateQuotaProgress = (progress, state) => {
    const available = state?.status === "available";
    const remainingPercent = available
      ? Math.round(state.remainingPercentage ?? state.percentage) : 0;
    if (progress) setStyleProperty(progress, "--codex-quota-progress", available ? `${remainingPercent}%` : "0%");
    const fill = progress?.firstElementChild;
    if (fill) {
      const scale = available ? Math.max(0, Math.min(1, remainingPercent / 100)) : 0;
      setStyleProperty(fill, "position", "absolute");
      setStyleProperty(fill, "inset", "0");
      setStyleProperty(fill, "width", "100%");
      setStyleProperty(fill, "max-width", "none");
      setStyleProperty(fill, "min-width", "0");
      setStyleProperty(fill, "transform-origin", "left center");
      setStyleProperty(fill, "transform", `scaleX(${scale})`);
      setAttribute(progress, "aria-valuenow", String(remainingPercent));
    }
  };

  const updateQuotaView = (node, state, compact = false) => {
    if (!node) return;
    syncQuotaThemeSurface(node);
    setAttribute(node, "data-level", quotaLevel(state));
    setStyleProperty(node, "--codex-quota-color", quotaColor(state));
    const available = state.status === "available";
    const loading = state.status === "loading";
    const windows = quotaWindows(state);
    const urgent = available ? quotaMostUrgentWindow(state) : state;
    const view = compact ? "compact:v2" : `detail:v5:${Math.max(1, windows.length)}:${windows
      .map(quotaWindowKey).join("|")}`;
    if (node.dataset.codexQuotaView !== view) {
      node.innerHTML = quotaMarkup(compact, windows.length);
      node.dataset.codexQuotaView = view;
    }
    ensureQuotaMetaLayout(node);
    ensureQuotaResetLayout(node);
    ensureQuotaTiboInterpretationLayout(node);
    const setText = (role, value) => {
      const target = node.querySelector(`[data-codex-quota="${role}"]`);
      if (target && target.textContent !== value) target.textContent = value;
    };
    if (compact) {
      // The compact pill and the detail card must describe the same provider
      // window. The old pill was hard-coded to weekly while the primary
      // window could be monthly, producing contradictory 97% labels.
      const compactWindow = available ? quotaPrimaryWindow(windows) || urgent : state;
      const quotaBrandLabel = node.querySelector(".codex-quota-pill-brand > span");
      const compactWindowLabel = compactWindow?.windowLabel || "额度";
      const compactRemaining = Number(compactWindow?.remainingPercentage ?? compactWindow?.percentage);
      if (quotaBrandLabel && quotaBrandLabel.textContent !== compactWindowLabel) {
        quotaBrandLabel.textContent = compactWindowLabel;
      }
      setAttribute(node, "aria-label", `${compactWindowLabel} ${Number.isFinite(compactRemaining)
        ? `${Math.round(compactRemaining)}%` : "暂不可用"}`);
      const compactAvailable = compactWindow?.status === "available";
      const compactText = compactAvailable
        ? `${Math.round(compactWindow.remainingPercentage ?? compactWindow.percentage)}%` : "";
      const radar = compactAvailable ? quotaRadarEstimate(compactWindow) : null;
      setText("percent", available
        ? `${compactText}${radar ? ` · ${formatQuotaUsd(radar.remainingUsd)}` : ""}`
        : loading ? "额度同步中…" : "额度不可用");
      updateQuotaProgress(node.querySelector('[data-codex-quota="progress"]'), compactWindow);
    } else {
      const primary = available ? quotaPrimaryWindow(windows) || urgent : state;
      const primaryAvailable = primary?.status === "available";
      const remaining = primaryAvailable
        ? Math.round(primary.remainingPercentage ?? primary.percentage) : 0;
      const health = quotaHealthLabel(primary);
      const radar = primaryAvailable ? quotaRadarEstimate(primary) : null;
      const hero = node.querySelector('[data-codex-quota="hero"]');
      const heroRing = node.querySelector('[data-codex-quota="hero-ring"]');
      if (hero) {
        setAttribute(hero, "data-level", quotaLevel(primary));
        setStyleProperty(hero, "--codex-quota-color", quotaColor(primary));
        setStyleProperty(hero, "--codex-quota-angle", `${Math.max(0, Math.min(360, remaining * 3.6))}deg`);
      }
      if (heroRing) setAttribute(heroRing, "aria-valuenow", String(remaining));
      setText("hero-percent", primaryAvailable ? `${remaining}%` : "—");
      setText("hero-window", primary?.windowLabel || "额度");
      setText("hero-label", radar ? "剩余" : "当前状态");
      setText("hero-value", primaryAvailable
        ? radar ? formatQuotaUsd(radar.remainingUsd) : health
        : loading ? "正在同步" : "暂不可用");
      setText("hero-status", `状态 · ${health}`);

      setText("hero-label", primaryAvailable ? "\u989d\u5ea6\u72b6\u6001" : "\u5f53\u524d\u72b6\u6001");
      setText("hero-value", primaryAvailable ? health : loading ? "\u6b63\u5728\u540c\u6b65" : "\u6682\u4e0d\u53ef\u7528");
      setText("hero-status", primaryAvailable
        ? "\u7a97\u53e3 \u00b7 " + (primary?.windowLabel || "\u989d\u5ea6")
        : "\u7b49\u5f85\u6570\u636e");
      const badgeHost = node.querySelector('[data-codex-quota="window-badges"]');
      if (badgeHost) {
        const badgeSignature = available
          ? `${state.freshness || ""}:` + windows
            .map((entry) => `${quotaWindowKey(entry)}:${Math.round(entry.percentage)}`).join("|")
          : state.status;
        if (badgeHost.dataset.signature !== badgeSignature) {
          badgeHost.replaceChildren();
          const badgeWindows = available ? windows : [{
            windowLabel: loading ? "同步中" : "额度不可用",
            percentage: null,
          }];
          for (const entry of badgeWindows) {
            const badge = document.createElement("span");
            const label = document.createElement("strong");
            const value = document.createElement("em");
            label.textContent = entry.windowLabel || "额度";
            value.textContent = available && windows.length === 1
              ? state.freshness === "live" ? "实时" : /(?:cached|stale)/i.test(String(state.freshness || ""))
                ? "缓存" : ""
              : Number.isFinite(Number(entry.percentage)) ? `${Math.round(entry.percentage)}%` : "";
            badge.append(label, value);
            badgeHost.appendChild(badge);
          }
          badgeHost.dataset.signature = badgeSignature;
        }
      }

      setText("used-percent", primaryAvailable && Number.isFinite(primary.usedPercentage)
        ? `${Math.round(primary.usedPercentage)}%` : "—");
      const nextQuotaResetText = formatQuotaHeroResetDisplay(primary?.resetAt) || primary?.resetAt || "—";
      setText("reset", nextQuotaResetText);
      const resetHeroStat = node.querySelector(".codex-quota-hero-stat-reset");
      if (resetHeroStat) {
        const resetConfirmed = quotaResetReconciliation?.resetStatus === "confirmed";
        setAttribute(resetHeroStat, "data-reset-state", resetConfirmed ? "confirmed" : "scheduled");
        setAttribute(resetHeroStat, "title", `下次更新：${nextQuotaResetText}`);
      }
      setText("updated", quotaUpdatedText(state));

      setText("remaining", radar
        ? formatQuotaUsd(radar.remainingUsd)
        : primaryAvailable ? `${remaining}%` : "—");
      const resetInfo = quotaResetRadarSnapshot();
      const resetReconciliation = reconcileQuotaResetCause(resetInfo);
      const nextSignal = quotaResetNextSignal(resetInfo, resetReconciliation);
      const resetSignalActive = nextSignal.active && !resetSignalIsTerminal(resetInfo);
      const tibo = quotaTiboPreview(
        resetInfo,
        { ...nextSignal, active: resetSignalActive },
        resetReconciliation,
      );
      updateTiboPostTimeView(node, tibo);
      ensureQuotaSystemClock();
      const originalWrap = node.querySelector('[data-codex-quota="tibo-original-wrap"]');
      const analysisWrap = node.querySelector(".codex-quota-tibo-analysis");
      const verdictWrap = node.querySelector(".codex-quota-tibo-verdict");
      const interpretationWrap = node.querySelector('[data-codex-quota="tibo-interpretation-wrap"]');
      const tiboCard = node.querySelector(".codex-quota-tibo");
      for (const footer of tiboCard?.querySelectorAll(":scope > footer") || []) footer.remove();
      const signalTibo = resetSignalActive &&
        quotaText(resetInfo?.nextConfirmation || resetInfo?.confirmation).toLowerCase() === "official";
      const expandedTibo = tibo.mode !== "compact";
      if (originalWrap) originalWrap.hidden = !expandedTibo || !tibo.original;
      if (analysisWrap) analysisWrap.hidden = !tibo.analysisVisible;
      if (verdictWrap) verdictWrap.hidden = false;
      if (interpretationWrap) interpretationWrap.hidden = !tibo.interpretationVisible;
      setText("tibo-original-label", tibo.originalLabel || "关键动态：");
      const analysisLabel = analysisWrap?.querySelector("small");
      if (analysisLabel) setTextContent(analysisLabel, tibo.analysisLabel || "近期证据：");
      setText("tibo-latest-label", tibo.latestLabel || "最新原文：");
      const verdictLabel = verdictWrap?.querySelector("small");
      if (verdictLabel) setTextContent(verdictLabel,
        signalTibo ? "综合结论：" : tibo.verdictLabel || "综合判断：");
      if (tiboCard) {
        setAttribute(tiboCard, "data-signal", signalTibo ? "strong" : tibo.signalActive ? "active" : "idle");
        setAttribute(tiboCard, "data-relevance", tibo.relevance || "none");
        setAttribute(tiboCard, "data-latest-intent", tibo.latestIntent || "general");
        setAttribute(tiboCard, "data-evidence-mode", tibo.mode || "compact");
        setAttribute(tiboCard, "aria-label", tibo.verdict || "Tibo reset 信号待同步");
      }
      setText("tibo-original", tibo.original || "");
      const originalNode = node.querySelector('[data-codex-quota="tibo-original"]');
      if (originalNode) {
        originalNode.removeAttribute("title");
        originalNode.setAttribute("aria-label", tibo.original || "暂无原文");
      }
      setText("tibo-analysis", tibo.analysis || "暂无可用分析");
      setText("tibo-latest", tibo.latest || "暂无最新动态");
      setText("tibo-verdict", tibo.verdict || "最新动态未出现 reset 信号。");
      setText("tibo-interpretation-label", "翻译与理解：");
      setText("tibo-translation", tibo.translation || "暂未生成可靠译文。");
      setText("tibo-understanding", tibo.understanding || "暂未形成明确解读。");
      prepareQuotaTiboText(node.querySelector('[data-codex-quota="tibo-latest"]'), 12);
      if (tibo.analysisVisible) {
        prepareQuotaTiboText(node.querySelector('[data-codex-quota="tibo-analysis"]'), 12.25);
      }
      prepareQuotaTiboText(node.querySelector('[data-codex-quota="tibo-verdict"]'));
      prepareQuotaTiboText(node.querySelector('[data-codex-quota="tibo-translation"]'), 11.5);
      prepareQuotaTiboText(node.querySelector('[data-codex-quota="tibo-understanding"]'), 11.5);
      syncQuotaTiboHeight(node);
      const latestNode = node.querySelector('[data-codex-quota="tibo-latest"]');
      const latestBox = latestNode?.closest(".codex-quota-tibo-latest");
      if (latestNode) {
        latestNode.removeAttribute("title");
        latestNode.setAttribute("aria-label", tibo.latest || "暂无最新动态");
      }
      if (latestBox) {
        latestBox.hidden = false;
        latestBox.removeAttribute("tabindex");
        latestBox.setAttribute("aria-label", `最新动态：${tibo.latest || "暂无最新动态"}`);
      }
      const verdictNode = node.querySelector('[data-codex-quota="tibo-verdict"]');
      if (verdictNode) verdictNode.setAttribute("aria-label", tibo.verdict || "暂无分析判断");
      setText("tibo-time", tibo.time || "待同步");
      setText("tibo-source", `来源 ${tibo.source}`);
      const tiboLink = node.querySelector('[data-codex-quota="tibo-link"]');
      if (tiboLink) {
        tiboLink.hidden = !tibo.url;
        if (tibo.url) setAttribute(tiboLink, "href", tibo.url);
        else tiboLink.removeAttribute("href");
      }
      const confirmedTiboResetAt = quotaConfirmedTiboResetAt(resetInfo);
      const resetLastAt = quotaLastResetDisplayAt(resetInfo, resetReconciliation);
      const resetLastDisplay = confirmedTiboResetAt && resetLastAt === confirmedTiboResetAt
        ? formatTiboResetDisplay(resetLastAt)
        : formatQuotaResetDisplay(resetLastAt) || resetLastAt;
      const hasSignal = resetSignalActive;
      const nonResetIntent = !hasSignal && Boolean(tibo.latestIntentLabel);
      const nonResetIntentLabel = tibo.latestIntentLabel || "非额度动态";
      const nextProbability = hasSignal ? nextSignal.probability : Number.NaN;
      const strongResetSignal = hasSignal && nextProbability >= 75 &&
        resetInfo?.nextConfirmation === "official";
      setText("quota-source", "Codex Radar · Tibo");
      const resetLastSlot = node.querySelector(".codex-quota-reset-grid > span:first-child");
      setTextContent(resetLastSlot?.querySelector("small"), "上轮");
      setAttribute(resetLastSlot, "data-display-mode", resetLastAt ? "reset" : "unknown");
      setText("reset-last-status", resetLastAt ? "已重置" : "未确认");
      setText("reset-last-time", resetLastAt ? resetLastDisplay : "暂无记录");
      setText("reset-next", hasSignal
        ? `${Math.round(nextProbability)}% · ${nextSignal.level}` : "暂无信号");
      setText("reset-next-time", hasSignal
        ? quotaText(resetInfo?.nextResetTime, "时间待定")
        : nonResetIntent ? `非额度 · ${nonResetIntentLabel}` : "等待额度信号");
      setText("reset-signal", hasSignal && Number.isFinite(nextProbability)
        ? `${Math.round(nextProbability)}%`
        : nonResetIntent ? "非额度信号" : "暂无信号");
      setText("reset-confidence", hasSignal
        ? resetInfo?.nextSignalFallback ? "缓存 · 待确认"
          : strongResetSignal ? "强信号" : "等待确认"
        : nonResetIntent ? nonResetIntentLabel : "等待额度信号");
      const resetRadar = node.querySelector(".codex-quota-reset-radar");
      if (resetRadar) {
        resetRadar.removeAttribute("data-session-first-use");
        setAttribute(resetRadar, "aria-label",
          `重置状态：${resetLastAt ? `上轮已重置 ${formatQuotaResetDisplay(resetLastAt) || resetLastAt}` : "上轮待确认"}${nonResetIntent ? `；最新动态为${nonResetIntentLabel}，非额度信号` : ""}`);
        setAttribute(resetRadar, "data-signal", hasSignal ? "active" : "idle");
        setAttribute(resetRadar, "data-signal-context", nonResetIntent ? tibo.latestIntent : "none");
        setAttribute(resetRadar, "data-signal-level",
          strongResetSignal ? "strong" : hasSignal ? "active" : "idle");
      }
      updateSessionTokenView(node);

    }
  };

  const updateQuotaRing = (node, state, level, index = 0) => {
    if (!node) return;
    const available = state.status === "available";
    const remainingPercent = available
      ? Math.round(state.remainingPercentage ?? state.percentage) : 0;
    setAttribute(node, "data-level", level || quotaLevel(state));
    setStyleProperty(node, "--codex-quota-color", quotaColor(state));
    setStyleProperty(node, "--codex-quota-ring-progress-paint",
      `url(#codex-quota-ring-progress-grad-${index})`);
    setStyleProperty(node, "--codex-quota-ring-gloss-paint",
      `url(#codex-quota-ring-gloss-grad-${index})`);
    setStyleProperty(node, "--codex-quota-ring-progress", `${remainingPercent}%`);
    const ringCircumference = 2 * Math.PI * 82;
    const ringOffset = ringCircumference * (1 - remainingPercent / 100);
    const progress = node.querySelector("[data-codex-quota-ring-progress]");
    if (progress) setStyleProperty(progress, "stroke-dashoffset", String(ringOffset));
    const gloss = node.querySelector("[data-codex-quota-ring-gloss]");
    if (gloss) setStyleProperty(gloss, "stroke-dashoffset", String(ringOffset));
    const value = node.querySelector("[data-codex-quota-ring-value]");
    setTextContent(value, available ? String(remainingPercent) : "—");
    setAttribute(node, "data-codex-quota-low",
      available && remainingPercent < 20 ? "true" : "false");
  };

  const quotaRingItemMarkup = (index) => `<span class="codex-quota-ring-item" data-codex-quota-ring-window="${index}"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="codex-quota-ring-progress-grad-${index}" class="codex-quota-ring-progress-gradient" x1="18" y1="18" x2="182" y2="182" gradientUnits="userSpaceOnUse"><stop class="codex-quota-ring-progress-start" offset="0%"></stop><stop class="codex-quota-ring-progress-mid" offset="48%"></stop><stop class="codex-quota-ring-progress-end" offset="100%"></stop></linearGradient><linearGradient id="codex-quota-ring-gloss-grad-${index}" class="codex-quota-ring-gloss-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="white" stop-opacity=".7"></stop><stop offset="40%" stop-color="white" stop-opacity=".15"></stop><stop offset="100%" stop-color="white" stop-opacity="0"></stop></linearGradient></defs><circle class="codex-quota-ring-track-shadow" cx="100" cy="100" r="82"></circle><circle class="codex-quota-ring-track" cx="100" cy="100" r="82"></circle><circle class="codex-quota-ring-progress" data-codex-quota-ring-progress cx="100" cy="100" r="82"></circle><circle class="codex-quota-ring-gloss" data-codex-quota-ring-gloss cx="100" cy="100" r="82"></circle></svg><span><strong data-codex-quota-ring-value>—</strong><small>%</small></span></span>`;

  const quotaRingMarkup = (count = 1) => Array.from({ length: Math.max(1, count) }, (_, index) =>
    quotaRingItemMarkup(index)).join("");

  /* Shared by quota UI and route readiness. This used to live only inside
     rendererReadiness, so project pages crashed when the composer quota ring
     checked visibility during injection. */
  const isVisibleInViewport = (node) => {
    if (!node?.isConnected) return false;
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = node.getBoundingClientRect();
    metrics.layoutReads += 1;
    return rect.width > 1 && rect.height > 1 && rect.right > 0 && rect.bottom > 0 &&
      rect.left < window.innerWidth && rect.top < window.innerHeight;
  };

  /* Composer information surfaces live in a viewport portal. Prefer the
     native composer edge as the anchor (with the complete sticky footer as a
     fallback), then let the card overlap that edge without resizing the
     editor. */
  const positionComposerInfoSurface = (surface, anchor) => {
    if (!surface?.isConnected || !anchor?.isConnected) return;
    const footers = [...document.querySelectorAll("[data-thread-scroll-footer]")];
    const footer = footers.find(isVisibleInViewport) || footers.at(-1) || null;
    const composer = anchor.closest(".composer-surface-chrome") ||
      document.querySelector(".composer-surface-chrome");
    const composerRect = composer?.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const safeTop = composerRect?.top ?? footer?.getBoundingClientRect().top ?? anchorRect.top;
    const surfaceWidth = surface.offsetWidth || 320;
    const surfaceHeight = surface.offsetHeight || 96;
    const resetCluster = document.getElementById("codex-quota-reset-composer");
    const resetClusterRect = resetCluster?.isConnected ? resetCluster.getBoundingClientRect() : null;
    /* Align the flyout with the quota/reset cluster, not the message column's
       action icons immediately above it. This leaves copy/rating controls free. */
    const preferredCenter = composerRect
      ? composerRect.left + composerRect.width / 2
      : resetClusterRect
        ? resetClusterRect.left + resetClusterRect.width / 2
        : anchorRect.right + surfaceWidth / 2;
    const visibleWidth = surfaceWidth * 0.6667;
    const left = clamp(
      preferredCenter,
      12 + visibleWidth / 2,
      window.innerWidth - 12 - visibleWidth / 2,
    );
    const top = Math.max(12, safeTop - surfaceHeight + 2);
    surface.style.left = `${Math.round(left)}px`;
    surface.style.top = `${Math.round(top)}px`;
  };

  /* The expanded ring card is wider than the 28px meter. Align it with the
     composer/footer rather than the tiny ring itself, while keeping it inside
     the viewport at narrow widths. Its bottom edge intentionally tucks over
     the composer so the selected surface reads as an attached overlay. */
  const positionQuotaRingSurface = (surface, anchor) => {
    if (!surface?.isConnected || !anchor?.isConnected) return;
    const footers = [...document.querySelectorAll("[data-thread-scroll-footer]")];
    const footer = footers.find(isVisibleInViewport) || footers.at(-1) || null;
    const composer = anchor.closest(".composer-surface-chrome") ||
      document.querySelector(".composer-surface-chrome");
    const composerRect = composer?.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const safeTop = composerRect?.top ?? footer?.getBoundingClientRect().top ?? anchorRect.top;
    const surfaceWidth = surface.offsetWidth || 560;
    const surfaceHeight = surface.offsetHeight || 116;
    const preferredCenter = composerRect
      ? composerRect.left + composerRect.width / 2
      : anchorRect.left + surfaceWidth / 2;
    const visibleWidth = surfaceWidth * 0.6667;
    const left = clamp(
      preferredCenter,
      12 + visibleWidth / 2,
      window.innerWidth - 12 - visibleWidth / 2,
    );
    const top = Math.max(12, safeTop - surfaceHeight + 2);
    surface.style.left = `${Math.round(left)}px`;
    surface.style.top = `${Math.round(top)}px`;
  };

  /* Native Codex rebuilds the sticky thread footer and the composer subtree
     when a conversation changes. Keep the injected footer controls in the
     composer surface itself, beside the native add-context and permissions
     controls. The portal remains absolutely positioned so it does not widen
     the native grid, but it now shares the composer's containing block and
     lifetime instead of floating from the main chat surface. */
  const findQuotaComposerPortal = () => {
    const connected = document.getElementById("codex-quota-composer-portal");
    if (connected) return rememberHeaderUiNode(connected);
    const cached = persistentHeaderUiNodes.get("codex-quota-composer-portal");
    return cached instanceof Element ? cached : null;
  };

  const ensureQuotaComposerPortal = (composer) => {
    if (!composer?.isConnected) return findQuotaComposerPortal();
    let portal = findQuotaComposerPortal();
    if (!portal) {
      portal = document.createElement("span");
      portal.id = "codex-quota-composer-portal";
      portal.setAttribute("data-codex-quota", "composer-portal");
      portal.setAttribute("aria-label", "聊天窗额度状态");
      rememberHeaderUiNode(portal);
    }
    if (portal.parentElement !== composer) {
      setAttribute(portal, 'data-state', 'hidden');
      composer.appendChild(portal);
    }
    const particleCanvas = portal.querySelector("[data-thread-earning-progress-particles]");
    if (particleCanvas) reconnectThreadEarningField(particleCanvas);
    return portal;
  };

  const positionQuotaComposerPortal = (portal, permissions, wrapper, composer) => {
    if (!portal?.isConnected || !permissions?.isConnected || !wrapper?.isConnected ||
      !composer?.isConnected) {
      return false;
    }
    const composerRect = composer.getBoundingClientRect();
    const permissionRect = permissions.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    if (composerRect.width < 1 || composerRect.height < 1 ||
      permissionRect.width < 1 || permissionRect.height < 1 || wrapperRect.width < 1) {
      return false;
    }
    const portalHeight = portal.getBoundingClientRect().height || 28;
    const left = Math.max(0, wrapperRect.right - composerRect.left + 9);
    const bottom = Math.max(
      0,
      composerRect.bottom - permissionRect.bottom + (permissionRect.height - portalHeight) / 2,
    );
    setStyleProperty(portal, "--codex-quota-composer-left", `${Math.round(left)}px`);
    setStyleProperty(portal, "--codex-quota-composer-bottom", `${Math.round(bottom)}px`);
    portal.removeAttribute('data-state');
    return true;
  };

  const positionQuotaComposerPortalFromDom = () => {
    const portal = findQuotaComposerPortal();
    const permissions = document.querySelector('[data-composer-navigation-target="permissions"]');
    const composer = permissions?.closest(".composer-surface-chrome") ||
      document.querySelector(".composer-surface-chrome");
    if (!portal || !permissions || !composer) return false;
    return positionQuotaComposerPortal(portal, permissions, permissions.parentElement, composer);
  };

  const cancelQuotaComposerPortalPosition = () => {
    if (quotaComposerPortalPositionFrame !== null) {
      if (quotaComposerPortalPositionUsesAnimationFrame &&
        typeof globalThis.cancelAnimationFrame === "function") {
        globalThis.cancelAnimationFrame(quotaComposerPortalPositionFrame);
      } else {
        clearTimeout(quotaComposerPortalPositionFrame);
      }
    }
    quotaComposerPortalPositionFrame = null;
    quotaComposerPortalPositionUsesAnimationFrame = false;
    if (quotaComposerPortalPositionRetryTimer !== null) {
      clearTimeout(quotaComposerPortalPositionRetryTimer);
      quotaComposerPortalPositionRetryTimer = null;
    }
  };

  const scheduleQuotaComposerPortalPosition = (attempt = 0) => {
    if (quotaComposerPortalPositionFrame !== null ||
      quotaComposerPortalPositionRetryTimer !== null) return;
    const position = () => {
      quotaComposerPortalPositionFrame = null;
      quotaComposerPortalPositionUsesAnimationFrame = false;
      const positioned = !window[DISABLED_KEY] && positionQuotaComposerPortalFromDom();
      /* The first frame after a React replacement can still contain the
         outgoing permissions control. Retry only twice, off the route task,
         so the new portal never stays hidden without reintroducing a poll. */
      if (!positioned && !window[DISABLED_KEY] && attempt < 2) {
        quotaComposerPortalPositionRetryTimer = setTimeout(() => {
          quotaComposerPortalPositionRetryTimer = null;
          scheduleQuotaComposerPortalPosition(attempt + 1);
        }, 80);
      }
    };
    if (typeof globalThis.requestAnimationFrame === "function") {
      quotaComposerPortalPositionUsesAnimationFrame = true;
      quotaComposerPortalPositionFrame = globalThis.requestAnimationFrame(position);
    } else {
      quotaComposerPortalPositionFrame = setTimeout(position, 0);
    }
  };

  const disconnectQuotaComposerResizeObserver = () => {
    quotaComposerResizeObserver?.disconnect();
    quotaComposerResizeObserver = null;
    quotaComposerResizeTargets = [];
  };

  const ensureQuotaComposerResizeObserver = (composer, permissions) => {
    if (!(composer instanceof Element)) {
      disconnectQuotaComposerResizeObserver();
      return false;
    }
    if (typeof ResizeObserver !== "function") return false;
    const editor = composer.querySelector('[contenteditable="true"], textarea');
    const targets = [composer, permissions?.parentElement, editor]
      .filter((node, index, list) => node instanceof Element && node.isConnected && list.indexOf(node) === index);
    const unchanged = quotaComposerResizeObserver &&
      quotaComposerResizeTargets.length === targets.length &&
      targets.every((target, index) => target === quotaComposerResizeTargets[index]);
    if (unchanged) return true;
    quotaComposerResizeObserver?.disconnect();
    quotaComposerResizeObserver = new ResizeObserver(() => {
      /* ResizeObserver runs after native layout and before paint. Positioning
         synchronously here prevents a one-frame jump while the editor wraps. */
      positionQuotaComposerPortalFromDom();
    });
    targets.forEach((target) => quotaComposerResizeObserver.observe(target));
    quotaComposerResizeTargets = targets;
    return true;
  };

  const hideQuotaComposerPortal = () => {
    cancelQuotaComposerPortalPosition();
    const portal = findQuotaComposerPortal();
    const ring = document.getElementById("codex-quota-ring-composer");
    const resetLikelihood = document.getElementById("codex-quota-reset-composer");
    const ringDetails = document.getElementById("codex-quota-ring-details");
    const resetDetails = document.getElementById("codex-quota-reset-details");
    portal?.setAttribute("data-state", "hidden");
    ring?.setAttribute("aria-hidden", "true");
    resetLikelihood?.setAttribute("aria-hidden", "true");
    ringDetails?.setAttribute("aria-hidden", "true");
    resetDetails?.setAttribute("aria-hidden", "true");
    ring?.setAttribute("data-selected", "false");
    resetLikelihood?.setAttribute("data-selected", "false");
  };

  const scheduleQuotaComposerPortalHide = () => {
    if (quotaComposerHideTimer) clearTimeout(quotaComposerHideTimer);
    quotaComposerHideTimer = setTimeout(() => {
      quotaComposerHideTimer = null;
      const permissions = document.querySelector('[data-composer-navigation-target="permissions"]');
      const rect = permissions?.getBoundingClientRect();
      const visible = Boolean(rect && rect.width > 1 && rect.height > 1 &&
        rect.right > 0 && rect.bottom > 0 &&
        rect.left < window.innerWidth && rect.top < window.innerHeight);
      const loading = typeof findThreadLoadingRoot === "function" && findThreadLoadingRoot();
      const transitioning = document.documentElement?.getAttribute("data-dream-route-transition") === "true";
      if (!visible && (loading || transitioning)) {
        scheduleQuotaComposerPortalHide();
        return;
      }
      if (!visible) hideQuotaComposerPortal();
    }, 360);
  };

  const ensureComposerQuotaRing = (state, level) => {
    const composerViewModel = experienceStore.getViewModel().composer;
    const ringEnabled = composerViewModel.enabled.ring && experienceCapabilityEnabled("quota");
    const probabilityEnabled = composerViewModel.enabled.probability && experienceCapabilityEnabled("quota");
    const permissions = document.querySelector('[data-composer-navigation-target="permissions"]');
    const wrapper = permissions?.parentElement;
    const composer = permissions?.closest(".composer-surface-chrome") ||
      document.querySelector(".composer-surface-chrome");
    const main = findMainSurface();
    const portal = ensureQuotaComposerPortal(composer);
    let ring = document.getElementById("codex-quota-ring-composer");
    let ringTooltip = document.getElementById("codex-quota-ring-tooltip");
    let ringDetails = document.getElementById("codex-quota-ring-details");
    let resetLikelihood = document.getElementById("codex-quota-reset-composer");
    let resetDetails = document.getElementById("codex-quota-reset-details");
    /* Keep route repair free of synchronous geometry reads. The portal is
       initially hidden and its ResizeObserver supplies the post-layout
       position; semantic visibility is enough to decide whether to retain it
       across React's short old/new composer overlap. */
    const visible = Boolean(
      permissions?.isConnected && !permissions.hidden &&
      permissions.getAttribute("aria-hidden") !== "true" &&
      wrapper?.isConnected && composer?.isConnected && main?.isConnected && portal?.isConnected,
    );
    if (!permissions || !wrapper || !composer || !main || !portal || !visible) {
      disconnectQuotaComposerResizeObserver();
      document.querySelectorAll("[data-codex-quota-footer]").forEach((node) => {
        node.removeAttribute("data-codex-quota-footer");
      });
      /* Leave the same nodes in the stable portal while React swaps the
         conversation. A short grace period prevents a missing intermediate
         permissions button from becoming a visible remove/reinsert frame. */
      scheduleQuotaComposerPortalHide();
      return;
    }
    if (quotaComposerHideTimer) clearTimeout(quotaComposerHideTimer);
    quotaComposerHideTimer = null;
    setImportantStyleProperty(composer, "position", "relative");
    const observingPortalLayout = ensureQuotaComposerResizeObserver(composer, permissions);
    if (portal.getAttribute("data-state") === "hidden" && !observingPortalLayout) {
      /* Only use a frame fallback on runtimes without ResizeObserver. On
         supported builds the observer measures after layout; a rAF geometry
         read would force the exact layout this route path is avoiding. */
      scheduleQuotaComposerPortalPosition();
    }
    /* Remove markers left by the old in-composer implementation. The stable
       portal owns the layout now, so the native grid never changes columns. */
    document.querySelectorAll("[data-codex-quota-footer]").forEach((node) => {
      node.removeAttribute("data-codex-quota-footer");
    });
    if (!ring) {
      ring = document.createElement("span");
      ring.id = "codex-quota-ring-composer";
      ring.setAttribute("data-codex-quota", "composer-ring");
    }
    ring.hidden = !ringEnabled;
    if (ringEnabled) {
      ring.removeAttribute("aria-hidden");
      ring.tabIndex = 0;
    } else {
      setAttribute(ring, "aria-hidden", "true");
      ring.tabIndex = -1;
      setAttribute(ring, "data-selected", "false");
      setAttribute(ring, "aria-expanded", "false");
      setAttribute(ring, "aria-pressed", "false");
    }
    if (ring.parentElement !== portal) portal.appendChild(ring);
    const windows = quotaWindows(state);
    const renderWindows = windows.length
      ? quotaDisplayWindows(windows) : [{ status: state.status, windowLabel: "额度" }];
    const signature = renderWindows.map(quotaWindowKey).join("|");
    if (ring.dataset.codexQuotaRingView !== signature) {
      ring.innerHTML = quotaRingMarkup(renderWindows.length);
      ring.dataset.codexQuotaRingView = signature;
    }
    renderWindows.forEach((entry, index) => {
      const item = ring.querySelector(`[data-codex-quota-ring-window="${index}"]`);
      updateQuotaRing(item, entry, quotaLevel(entry), index);
    });
    if (!ringDetails) {
      ringDetails = document.createElement("span");
      ringDetails.id = "codex-quota-ring-details";
      ringDetails.className = "codex-quota-ring-card";
      ringDetails.setAttribute("data-codex-quota", "composer-ring-details");
      ringDetails.setAttribute("role", "dialog");
      ringDetails.setAttribute("aria-label", "额度详情");
      ringDetails.setAttribute("aria-hidden", "true");
    }
    /* Rebuild older hot-reload markup into the compact reference card. */
    if (!ringDetails.querySelector("[data-codex-quota-ring-card-main]")) {
      ringDetails.innerHTML =
        '<span class="codex-quota-ring-card-main" data-codex-quota-ring-card-main>' +
          '<span class="codex-quota-ring-card-icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M4 19V5"></path><path d="M4 19h17"></path>' +
              '<path d="m6.5 15.5 3.7-4.2 3.2 2.1 5.1-6"></path>' +
              '<circle cx="6.5" cy="15.5" r="1.1"></circle><circle cx="10.2" cy="11.3" r="1.1"></circle>' +
              '<circle cx="13.4" cy="13.4" r="1.1"></circle><circle cx="18.5" cy="7.4" r="1.1"></circle>' +
            '</svg>' +
          '</span>' +
          '<span class="codex-quota-ring-card-copy">' +
            '<span class="codex-quota-ring-card-window" data-codex-quota-ring-card-window></span>' +
            '<span class="codex-quota-ring-card-dot" aria-hidden="true">·</span>' +
            '<span class="codex-quota-ring-card-label">剩余</span>' +
            '<strong data-codex-quota-ring-card-percent></strong>' +
          '</span>' +
        '</span>' +
        '<span class="codex-quota-ring-card-divider" aria-hidden="true"></span>' +
        '<span class="codex-quota-ring-card-section">' +
          '<span class="codex-quota-ring-card-icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="12" cy="12" r="8.4"></circle><path d="M12 7.2v9.6M14.8 9.3c-.6-.7-1.5-1.1-2.8-1.1-1.5 0-2.5.8-2.5 1.9 0 2.8 5.3 1.2 5.3 4.2 0 1.2-1.1 2-2.8 2-1.3 0-2.4-.4-3-1.2"></path>' +
            '</svg>' +
          '</span>' +
          '<span class="codex-quota-ring-card-copy">' +
            '<span class="codex-quota-ring-card-label">预估</span>' +
            '<strong data-codex-quota-ring-card-estimate></strong>' +
          '</span>' +
        '</span>' +
        '<span class="codex-quota-ring-card-divider" aria-hidden="true"></span>' +
        '<span class="codex-quota-ring-card-section">' +
          '<span class="codex-quota-ring-card-icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="12" cy="12" r="8.4"></circle><path d="M12 7v5l3.3 2"></path>' +
            '</svg>' +
          '</span>' +
          '<span class="codex-quota-ring-card-copy">' +
            '<span class="codex-quota-ring-card-label" data-codex-quota-ring-card-time-label>额度更新</span>' +
            '<strong data-codex-quota-ring-card-time></strong>' +
          '</span>' +
        '</span>';
    }
    if (document.body && ringDetails.parentElement !== document.body) document.body.appendChild(ringDetails);
    setAttribute(ring, "aria-controls", ringDetails.id);
    if (!ring.dataset.codexQuotaSelectedWindow) ring.dataset.codexQuotaSelectedWindow = "0";
    const selectedWindowIndex = Math.max(0, Math.min(
      renderWindows.length - 1,
      Number.parseInt(ring.dataset.codexQuotaSelectedWindow, 10) || 0,
    ));
    ring.dataset.codexQuotaSelectedWindow = String(selectedWindowIndex);
    const selectedWindow = renderWindows[selectedWindowIndex] || renderWindows[0];
    const selectedRadar = quotaWeeklyEquivalentEstimate(selectedWindow);
    const selectedAvailable = selectedWindow?.status === "available";
    const selectedPercent = selectedAvailable
      ? `${Math.round(selectedWindow.remainingPercentage ?? selectedWindow.percentage)}%` : "—";
    const selectedEstimate = selectedRadar ? formatQuotaUsd(selectedRadar.remainingUsd) : "—";
    const realtime = quotaRingRealtimeParts(state);
    const displayResetWindow = renderWindows.find((entry) => entry?.resetAt) || selectedWindow;
    const nextQuotaResetTime = formatQuotaRingTime(displayResetWindow?.resetAt);
    const ringCardWindow = ringDetails.querySelector("[data-codex-quota-ring-card-window]");
    const ringCardPercent = ringDetails.querySelector("[data-codex-quota-ring-card-percent]");
    const ringCardEstimate = ringDetails.querySelector("[data-codex-quota-ring-card-estimate]");
    const ringCardTimeLabel = ringDetails.querySelector("[data-codex-quota-ring-card-time-label]");
    const ringCardTime = ringDetails.querySelector("[data-codex-quota-ring-card-time]");
    const ringCardLabels = ringDetails.querySelectorAll(".codex-quota-ring-card-label");
    const selectedWindowKind = quotaWindowKind(selectedWindow?.windowMinutes, selectedWindow?.windowLabel);
    const selectedRemainingLabel = selectedWindowKind === "five-hour"
      ? `${selectedWindow?.windowLabel || "5H 剩余"} ${selectedPercent}`
      : `${selectedWindow?.windowLabel || "额度"} · 剩余 ${selectedPercent}`;
    setTextContent(ringCardLabels[0], selectedWindowKind === "five-hour" ? "" : "剩余");
    setTextContent(ringCardLabels[1], selectedRadar?.basis === "weekly-equivalent" ? "周额度折算" : "预估");
    setTextContent(ringCardTimeLabel, "额度更新");
    setTextContent(ringCardWindow, selectedWindow?.windowLabel || "额度");
    setTextContent(ringCardPercent, selectedPercent);
    setTextContent(ringCardEstimate, selectedEstimate);
    setTextContent(ringCardTimeLabel, "额度更新");
    setTextContent(ringCardTime, nextQuotaResetTime || "等待同步");
    setAttribute(ringDetails, "data-level", quotaLevel(selectedWindow));
    setAttribute(ringDetails, "data-window-kind",
      quotaWindowKind(selectedWindow?.windowMinutes, selectedWindow?.windowLabel));
    setAttribute(ringDetails, "data-freshness", selectedWindow?.freshness || state?.freshness || "unknown");
    const selectedEstimateLabel = selectedRadar?.basis === "weekly-equivalent"
      ? `按周额度折算（${Math.round(selectedRadar.windowMinutes / 60)}小时/168小时）` : "预计";
    setAttribute(ringDetails, "aria-label",
      `${selectedRemainingLabel} · ${selectedEstimateLabel} ${selectedEstimate} · 下次额度更新 ${nextQuotaResetTime || "等待同步"} · ${realtime.status}`);
    const ringSelected = ring.getAttribute("data-selected") === "true";
    setAttribute(ring, "aria-expanded", ringSelected ? "true" : "false");
    ringDetails.hidden = !ringEnabled;
    setAttribute(ringDetails, "aria-hidden", ringEnabled && ringSelected ? "false" : "true");
    if (ringSelected) positionQuotaRingSurface(ringDetails, ring);
    const resetRadar = quotaResetRadarSnapshot();
    const quotaResetEntry = renderWindows.find((entry) => entry.resetAt) || null;
    const quotaResetAt = quotaResetEntry?.resetAt || "";
    const resetInfo = probabilityEnabled && (resetRadar || quotaResetAt) ? {
      ...(resetRadar || {}),
      outcome: resetRadar?.outcome || "probability",
      level: resetRadar?.level || "low",
      nextLevel: resetRadar?.nextLevel || "low",
      nextLevelLabel: quotaText(resetRadar?.nextLevelLabel, "待观察"),
      nextReason: quotaText(resetRadar?.nextReason, "尚无新的重置信号"),
      reason: quotaText(resetRadar?.reason, "等待重置信号确认"),
      freshness: quotaText(resetRadar?.freshness || state?.freshness, "live"),
    } : null;
    /* Older builds nested reset forecasting inside the quota ring. Keep the
       ring visually unchanged and move reset information into its own sibling. */
    ring.querySelector(":scope > .codex-quota-reset-likelihood")?.remove();
    if (!resetInfo) {
      resetLikelihood?.__codexQuotaCleanup?.();
      resetLikelihood?.remove();
      resetDetails?.remove();
      resetLikelihood = null;
      resetDetails = null;
    } else {
      if (!resetLikelihood) {
        resetLikelihood = document.createElement("span");
        resetLikelihood.id = "codex-quota-reset-composer";
        resetLikelihood.className = "codex-quota-reset-likelihood";
        resetLikelihood.setAttribute("data-codex-quota", "reset");
      }
      resetLikelihood.tabIndex = 0;
      resetLikelihood.removeAttribute("aria-hidden");
      if (resetLikelihood.parentElement !== portal || resetLikelihood.previousElementSibling !== ring) {
        portal.appendChild(resetLikelihood);
      }
      if (!resetLikelihood.querySelector("[data-codex-reset-next-value]")) {
        resetLikelihood.innerHTML = '<span data-codex-reset-label></span><strong data-codex-reset-value></strong>' +
          '<span class="codex-quota-reset-divider" aria-hidden="true">\u00b7</span>' +
          '<span data-codex-reset-next-label></span><strong data-codex-reset-next-value></strong>' +
          '<span class="codex-quota-thread-earning" data-codex-thread-earning aria-live="polite">0.00</span>' +
          '<span class="codex-quota-reset-date" data-codex-reset-date></span>';
      }
      /* A running renderer can retain the old sibling markup during a hot
         reload. Add the new date slot without replacing the visible state. */
      if (!resetLikelihood.querySelector("[data-codex-reset-date]")) {
        const dateNode = document.createElement("span");
        dateNode.className = "codex-quota-reset-date";
        dateNode.setAttribute("data-codex-reset-date", "");
        resetLikelihood.appendChild(dateNode);
      }
      if (!resetLikelihood.querySelector("[data-codex-thread-earning]")) {
        const earningNode = document.createElement("span");
        earningNode.className = "codex-quota-thread-earning";
        earningNode.setAttribute("data-codex-thread-earning", "");
        earningNode.setAttribute("aria-live", "polite");
        earningNode.textContent = "0.00";
        const dateNode = resetLikelihood.querySelector("[data-codex-reset-date]");
        if (dateNode) resetLikelihood.insertBefore(earningNode, dateNode);
        else resetLikelihood.appendChild(earningNode);
      }
      /* Keep details in a viewport portal. Putting the card in normal composer
         flow made the 98px editor expand into a large blank panel; nesting it
         under the toolbar covered the editor. The portal avoids both bugs. */
      resetLikelihood.querySelector("[data-codex-reset-popover]")?.remove();
      if (!resetDetails) {
        resetDetails = document.createElement("span");
        resetDetails.id = "codex-quota-reset-details";
        resetDetails.className = "codex-quota-reset-popover";
        resetDetails.setAttribute("data-codex-reset-popover", "");
        resetDetails.setAttribute("data-codex-quota", "reset-details");
        resetDetails.setAttribute("role", "tooltip");
        resetDetails.setAttribute("aria-hidden", "true");
      }
      /* Rebuild old hot-reload markup into the reference-style status card.
         The portal stays detached from composer layout. */
      if (!resetDetails.querySelector("[data-codex-reset-card-hero]") ||
        resetDetails.querySelector(".codex-quota-reset-card-brand > strong")?.textContent !== "\u4e0a\u8f6e") {
        resetDetails.innerHTML =
          '<span class="codex-quota-reset-card-header">' +
            '<span class="codex-quota-reset-card-brand">' +
              '<span class="codex-quota-reset-card-icon" aria-hidden="true">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
                  '<rect x="5" y="4" width="14" height="17" rx="3"></rect>' +
                  '<path d="M9 4.5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8v.7"></path>' +
                  '<path d="m8.5 13 2.4 2.4 4.8-5"></path>' +
                '</svg>' +
              '</span>' +
              '<strong>\u4e0a\u8f6e</strong>' +
            '</span>' +
            '<span class="codex-quota-reset-popover-source" data-codex-reset-popover-source></span>' +
          '</span>' +
          '<span class="codex-quota-reset-card-divider" aria-hidden="true"></span>' +
          '<span class="codex-quota-reset-card-hero" data-codex-reset-card-hero>' +
            '<strong class="codex-quota-reset-card-status" data-codex-reset-popover-status></strong>' +
            '<span class="codex-quota-reset-card-hero-divider" aria-hidden="true">\u00b7</span>' +
            '<span class="codex-quota-reset-card-next-label">\u4e0b\u8f6e</span>' +
            '<strong class="codex-quota-reset-card-next-percent" data-codex-reset-popover-next></strong>' +
            '<strong class="codex-quota-reset-card-next-level" data-codex-reset-popover-next-level></strong>' +
          '</span>' +
          '<span class="codex-quota-reset-popover-meta">' +
            '<span class="codex-quota-reset-popover-meta-item" data-codex-reset-meta="tibo">' +
              '<span class="codex-quota-reset-popover-meta-icon" aria-hidden="true">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
                  '<path d="M20 11a8 8 0 0 0-13.7-5.7L4 7.6"></path><path d="M4 4v3.6h3.6"></path><path d="M4 13a8 8 0 0 0 13.7 5.7L20 16.4"></path><path d="M20 20v-3.6h-3.6"></path>' +
                '</svg>' +
              '</span>' +
              '<span class="codex-quota-reset-popover-meta-copy"><span data-codex-reset-meta-label="tibo">Tibo</span><strong data-codex-reset-popover-tibo-time></strong></span>' +
            '</span>' +
            '<span class="codex-quota-reset-popover-meta-item" data-codex-reset-meta="times">' +
              '<span class="codex-quota-reset-popover-meta-icon" aria-hidden="true">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
                  '<rect x="3.5" y="5" width="17" height="15" rx="2.5"></rect><path d="M7 3v4M17 3v4M3.5 9.5h17"></path>' +
                '</svg>' +
              '</span>' +
              '<span class="codex-quota-reset-time-stack">' +
                '<span class="codex-quota-reset-time-row" data-codex-reset-time="last"><span>\u4e0a\u6b21</span><strong data-codex-reset-popover-date></strong></span>' +
                '<span class="codex-quota-reset-time-row" data-codex-reset-time="next"><span>\u4e0b\u6b21</span><strong data-codex-reset-popover-next-time></strong></span>' +
              '</span>' +
            '</span>' +
            '<span class="codex-quota-reset-popover-meta-item" data-codex-reset-meta="signal" data-codex-reset-popover-signal-state>' +
              '<span class="codex-quota-reset-popover-meta-icon" aria-hidden="true">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
                  '<path d="M3 9.5a13 13 0 0 1 18 0"></path><path d="M6.5 13a8 8 0 0 1 11 0"></path><path d="M10 16.5a3 3 0 0 1 4 0"></path><path d="M12 20h.01"></path>' +
                '</svg>' +
              '</span>' +
              '<span class="codex-quota-reset-popover-meta-copy"><span data-codex-reset-meta-label="signal">Reset</span><strong data-codex-reset-popover-signal></strong></span>' +
            '</span>' +
          '</span>';
      }
      if (document.body && resetDetails.parentElement !== document.body) document.body.appendChild(resetDetails);
      setAttribute(resetLikelihood, "aria-controls", resetDetails.id);
      if (!resetLikelihood.dataset.codexResetInteraction) {
        resetLikelihood.dataset.codexResetInteraction = "true";
        resetLikelihood.setAttribute("role", "button");
        resetLikelihood.setAttribute("aria-pressed", "false");
        const isConfirmedReset = () =>
          resetLikelihood.getAttribute("data-outcome") === "confirmed";
        const setResetSelection = (selected) => {
          selected = Boolean(selected) && !isConfirmedReset();
          unsubscribeResetViewportChange?.setScroll?.(selected);
          setAttribute(resetLikelihood, "data-selected", selected ? "true" : "false");
          setAttribute(resetLikelihood, "aria-pressed", selected ? "true" : "false");
          const details = document.getElementById("codex-quota-reset-details");
          if (details) {
          if (selected) {
              const quotaTip = document.getElementById("codex-quota-ring-tooltip");
              if (quotaTip) setAttribute(quotaTip, "aria-hidden", "true");
              const ringDetails = document.getElementById("codex-quota-ring-details");
              const ring = document.getElementById("codex-quota-ring-composer");
              if (ringDetails) setAttribute(ringDetails, "aria-hidden", "true");
              if (ring) {
                setAttribute(ring, "data-selected", "false");
                setAttribute(ring, "aria-pressed", "false");
                setAttribute(ring, "aria-expanded", "false");
              }
              positionComposerInfoSurface(details, resetLikelihood);
            }
            setAttribute(details, "aria-hidden", selected ? "false" : "true");
          }
        };
        const toggleResetSelection = () => {
          const selected = resetLikelihood.getAttribute("data-selected") === "true";
          setResetSelection(!selected);
        };
        const onResetMouseEnter = () => {
          if (isConfirmedReset()) {
            setResetSelection(false);
            return;
          }
          unsubscribeResetViewportChange?.setScroll?.(true);
          const details = document.getElementById("codex-quota-reset-details");
          if (details) {
            const quotaTip = document.getElementById("codex-quota-ring-tooltip");
            if (quotaTip) setAttribute(quotaTip, "aria-hidden", "true");
            const ringDetails = document.getElementById("codex-quota-ring-details");
            const ring = document.getElementById("codex-quota-ring-composer");
            if (ringDetails) setAttribute(ringDetails, "aria-hidden", "true");
            if (ring) {
              setAttribute(ring, "data-selected", "false");
              setAttribute(ring, "aria-pressed", "false");
              setAttribute(ring, "aria-expanded", "false");
            }
            positionComposerInfoSurface(details, resetLikelihood);
            setAttribute(details, "aria-hidden", "false");
          }
        };
        const onResetMouseLeave = () => {
          if (resetLikelihood.getAttribute("data-selected") === "true") return;
          unsubscribeResetViewportChange?.setScroll?.(false);
          const details = document.getElementById("codex-quota-reset-details");
          if (details) setAttribute(details, "aria-hidden", "true");
        };
        const onResetFocus = () => onResetMouseEnter();
        const onResetBlur = () => onResetMouseLeave();
        const unsubscribeResetViewportChange = resizeCoordinator.subscribe(() => {
          const details = document.getElementById("codex-quota-reset-details");
          if (details?.getAttribute("aria-hidden") === "false") {
            positionComposerInfoSurface(details, resetLikelihood);
          }
        });
        const onResetKeydown = (event) => {
          if (event.key === "Escape") {
            setResetSelection(false);
            resetLikelihood.blur();
            return;
          }
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          toggleResetSelection();
        };
        const onResetOutsideClick = (event) => {
          if (resetLikelihood.contains(event.target)) return;
          setResetSelection(false);
        };
        resetLikelihood.addEventListener("click", toggleResetSelection);
        resetLikelihood.addEventListener("mouseenter", onResetMouseEnter);
        resetLikelihood.addEventListener("mouseleave", onResetMouseLeave);
        resetLikelihood.addEventListener("focus", onResetFocus);
        resetLikelihood.addEventListener("blur", onResetBlur);
        resetLikelihood.addEventListener("keydown", onResetKeydown);
        document.addEventListener("click", onResetOutsideClick, true);
        resetLikelihood.__codexQuotaCleanup = () => {
          unsubscribeResetViewportChange();
          resetLikelihood.removeEventListener("click", toggleResetSelection);
          resetLikelihood.removeEventListener("mouseenter", onResetMouseEnter);
          resetLikelihood.removeEventListener("mouseleave", onResetMouseLeave);
          resetLikelihood.removeEventListener("focus", onResetFocus);
          resetLikelihood.removeEventListener("blur", onResetBlur);
          resetLikelihood.removeEventListener("keydown", onResetKeydown);
          document.removeEventListener("click", onResetOutsideClick, true);
        };
      }
      setAttribute(resetLikelihood, "data-freshness", resetInfo.freshness);
      const resetLabel = resetLikelihood.querySelector("[data-codex-reset-label]");
      const resetValue = resetLikelihood.querySelector("[data-codex-reset-value]");
      const nextLabel = resetLikelihood.querySelector("[data-codex-reset-next-label]");
      const nextValue = resetLikelihood.querySelector("[data-codex-reset-next-value]");
      const popoverStatus = resetDetails?.querySelector("[data-codex-reset-popover-status]");
      const popoverBrand = resetDetails?.querySelector(".codex-quota-reset-card-brand > strong");
      const popoverNextLabel = resetDetails?.querySelector(".codex-quota-reset-card-next-label");
      const popoverNext = resetDetails?.querySelector("[data-codex-reset-popover-next]");
      const popoverNextLevel = resetDetails?.querySelector("[data-codex-reset-popover-next-level]");
      const popoverDate = resetDetails?.querySelector("[data-codex-reset-popover-date]");
      const popoverNextTime = resetDetails?.querySelector("[data-codex-reset-popover-next-time]");
      const popoverSource = resetDetails?.querySelector("[data-codex-reset-popover-source]");
      const popoverTiboTime = resetDetails?.querySelector("[data-codex-reset-popover-tibo-time]");
      const popoverSignal = resetDetails?.querySelector("[data-codex-reset-popover-signal]");
      const popoverSignalState = resetDetails?.querySelector("[data-codex-reset-popover-signal-state]");
      setTextContent(popoverBrand, "\u4e0a\u8f6e");
      setTextContent(popoverNextLabel, "\u4e0b\u8f6e");
      /* Keep the visible strip compact enough for the composer while its
         tooltip and accessible label retain the fully descriptive wording. */
      setTextContent(resetDetails?.querySelector('[data-codex-reset-meta-label="tibo"]'), "Tibo\u9884\u544a");
       setTextContent(resetDetails?.querySelector('[data-codex-reset-meta-label="signal"]'), "");
       const resetReconciliation = reconcileQuotaResetCause(resetInfo);
       const resetConfirmed = resetReconciliation.resetStatus === "confirmed" ||
         resetInfo.outcome === "reset-confirmed";
      const nextSignal = quotaResetNextSignal(resetInfo, resetReconciliation);
      const hasTiboPreviewSignal = nextSignal.active && !resetSignalIsTerminal(resetInfo);
      const tiboPreviewAt = hasTiboPreviewSignal
        ? quotaText(resetInfo.nextEventAt) || quotaText(resetInfo.eventUpdatedAt) ||
          quotaText(resetInfo.newestPostAt) || quotaText(resetInfo.tiboUpdatedAt)
        : "";
      const tiboPreviewText = tiboPreviewAt ? formatResetClockTime(tiboPreviewAt) : "\u7b49\u5f85\u65b0\u52a8\u6001";
      const hasNextSignal = nextSignal.active && !resetSignalIsTerminal(resetInfo);
      const nextProbability = hasNextSignal ? nextSignal.probability : Number.NaN;
      const nextResetTime = hasNextSignal
        ? quotaText(resetInfo.nextResetTime, "\u65f6\u95f4\u5f85\u5b9a")
        : "\u6682\u65e0\u9884\u544a";
      const officialNextSignal = hasNextSignal &&
        (resetInfo.nextConfirmation === "official" ||
          (Boolean(resetInfo.nextResetTime) && nextProbability >= 75));
       const resetSignalState = officialNextSignal ? "present" : hasNextSignal ? "present"
         : resetConfirmed || resetInfo.hasResetSignal === false ? "absent" : "unknown";
       const resetSignalText = officialNextSignal ? "\u5b98\u65b9\u4fe1\u53f7"
         : resetSignalState === "present" ? "\u6709\u4fe1\u53f7"
           : resetSignalState === "absent" ? "\u6682\u65e0\u4fe1\u53f7" : "\u5f85\u540c\u6b65";
      // Keep the composer strip numeric. The official/source distinction is
      // retained in the hover detail and Tibo evidence rows.
      const compactResetSignalValue = hasNextSignal && Number.isFinite(nextProbability)
        ? `${Math.round(nextProbability)}%` : "—";
      const earningTarget = resetLikelihood.querySelector("[data-codex-thread-earning]");
      if (earningTarget) {
        setAttribute(earningTarget, "data-thread-earning-reset-signal",
          `\u91cd\u7f6e\u4fe1\u53f7\u00b7${compactResetSignalValue}`);
        setAttribute(earningTarget, "data-thread-earning-reset-signal-label", "\u91cd\u7f6e\u4fe1\u53f7");
        setAttribute(earningTarget, "data-thread-earning-reset-signal-value", compactResetSignalValue);
      }
      const nextLevel = hasNextSignal
        ? quotaText(resetInfo.nextLevel) || resetRadarLevel(nextProbability)
        : "low";
      const popoverNextText = Number.isFinite(nextProbability)
        ? `${Math.round(nextProbability)}%` : "—";
      setAttribute(resetLikelihood, "data-level", resetConfirmed ? "high" : resetInfo.level || nextLevel);
      setAttribute(resetLikelihood, "data-next-level", nextLevel);
      setAttribute(resetLikelihood, "data-outcome", resetConfirmed ? "confirmed" : "probability");
      setAttribute(resetDetails, "data-level", resetConfirmed ? "high" : resetInfo.level || nextLevel);
      setAttribute(resetDetails, "data-next-level", nextLevel);
      setAttribute(resetDetails, "data-outcome", resetConfirmed ? "confirmed" : "probability");
      setAttribute(resetDetails, "data-reset-signal", resetSignalState);
      setAttribute(popoverSignalState, "data-reset-signal", resetSignalState);
      const resetDateValue = quotaLastResetDisplayAt(resetInfo, resetReconciliation);
      if (resetDateValue) resetInfo.lastResetAt = resetDateValue;
       const resetSignature = [quotaResetAt, resetInfo.outcome, resetDateValue,
         nextResetTime, tiboPreviewAt, resetSignalState]
         .map(quotaText).join("|");
      if (resetLikelihood.dataset.codexResetSignature !== resetSignature) {
        resetLikelihood.dataset.codexResetSignature = resetSignature;
        setAttribute(resetLikelihood, "data-selected", "false");
        setAttribute(resetLikelihood, "aria-pressed", "false");
        if (resetDetails) setAttribute(resetDetails, "aria-hidden", "true");
      }
      /* The composer uses the short, scannable status agreed for the chat
         window. The full round/date/provenance breakdown remains in the
         hover card and the accessible tooltip above. */
       const actualResetDate = resetDateValue ? formatResetCardTime(resetDateValue) : "";
       setTextContent(resetLabel, "");
       setTextContent(resetValue, "");
      setTextContent(nextLabel, "\u91cd\u7f6e\u6982\u7387");
      setTextContent(nextValue,
        hasNextSignal && Number.isFinite(nextProbability)
          ? `${Math.round(nextProbability)}%` : "\u65e0");
       const resetDate = actualResetDate;
       setAttribute(resetLikelihood, "data-display-mode", actualResetDate ? "reset" : "unknown");
       setTextContent(resetLikelihood.querySelector("[data-codex-reset-date]"), resetDate);
      setTextContent(popoverStatus, resetConfirmed ? "\u5df2\u91cd\u7f6e" : "\u5f85\u786e\u8ba4");
      setTextContent(popoverNext, popoverNextText);
      /* The numeric probability is enough in the compact detail row; keep the
         low/medium/high level for the parent control and data attributes. */
      setTextContent(popoverNextLevel, "");
       setTextContent(popoverDate, actualResetDate || "\u5f85\u786e\u8ba4");
      setTextContent(popoverNextTime, nextResetTime);
      setTextContent(popoverTiboTime, tiboPreviewText);
      setTextContent(popoverSignal, resetSignalText);
      setTextContent(popoverSource, resetInfo.source ? `\u6765\u6e90  ${resetInfo.source}` : "Codex Radar \u00b7 \u5b9e\u65f6");
      if (resetDetails?.getAttribute("aria-hidden") === "false") {
        positionComposerInfoSurface(resetDetails, resetLikelihood);
      }
    }
    if (resetLikelihood) ensureThreadEarningRuntime(resetLikelihood);
    else stopThreadEarningRuntime();
    setAttribute(ring, "data-level", level);
    const tip = renderWindows.length ? renderWindows.map((entry) => {
      const remaining = Math.round(entry.remainingPercentage ?? entry.percentage);
      const radar = quotaWeeklyEquivalentEstimate(entry);
      const estimateLabel = radar?.basis === "weekly-equivalent"
        ? `按周额度折算（${Math.round(radar.windowMinutes / 60)}小时/168小时）` : "预计";
      const remainingLabel = quotaWindowKind(entry?.windowMinutes, entry?.windowLabel) === "five-hour"
        ? `${entry.windowLabel || "5H 剩余"} ${remaining}%`
        : `${entry.windowLabel || "额度"} · 剩余 ${remaining}%`;
      return `${remainingLabel}${radar
        ? ` · ${estimateLabel} ${formatQuotaUsd(radar.remainingUsd)}（${quotaRadarUpdatedText(radar)}）` : ""}`;
    }).join("；") : state.status === "loading" ? "额度同步中" : "额度暂不可用";
    const resetReconciliation = reconcileQuotaResetCause(resetInfo);
    const resetConfirmed = resetReconciliation.resetStatus === "confirmed" ||
      resetInfo?.outcome === "reset-confirmed";
    const nextSignal = quotaResetNextSignal(resetInfo, resetReconciliation);
    const hasNextSignal = nextSignal.active && !resetSignalIsTerminal(resetInfo);
    const nextProbability = hasNextSignal ? nextSignal.probability : Number.NaN;
    const nextProbabilityText = hasNextSignal
      ? `${Math.round(nextProbability)}%` : "\u6682\u65e0\u76f4\u63a5\u4fe1\u53f7";
    const tiboPreviewAt = hasNextSignal
      ? quotaText(resetInfo?.nextEventAt) || quotaText(resetInfo?.eventUpdatedAt) ||
        quotaText(resetInfo?.newestPostAt) || quotaText(resetInfo?.tiboUpdatedAt)
      : "";
    const tiboPreviewText = tiboPreviewAt ? formatResetRadarTime(tiboPreviewAt) : "\u7b49\u5f85\u65b0\u52a8\u6001";
    const nextResetTime = hasNextSignal
      ? quotaText(resetInfo?.nextResetTime, "\u65f6\u523b\u5f85\u5b9a")
      : "\u6682\u65e0\u9884\u544a";
    const officialNextSignal = hasNextSignal &&
      (resetInfo?.nextConfirmation === "official" ||
        (Boolean(resetInfo?.nextResetTime) && nextProbability >= 75));
    const resetSignalText = officialNextSignal ? "\u5b98\u65b9\u4fe1\u53f7"
      : hasNextSignal ? "\u6709\u4fe1\u53f7"
        : resetConfirmed || resetInfo?.hasResetSignal === false ? "\u6682\u65e0\u4fe1\u53f7" : "\u5f85\u540c\u6b65";
    const resetDateValue = quotaLastResetDisplayAt(resetInfo, resetReconciliation);
    if (resetInfo && resetDateValue) resetInfo.lastResetAt = resetDateValue;
    const resetLines = resetInfo ? [
      `\u4e0a\u8f6e\uff1a${resetConfirmed ? "\u5df2\u91cd\u7f6e" : "\u5f85\u786e\u8ba4"}`,
      `\u4e0b\u8f6e\uff1a${nextProbabilityText}`,
      `Tibo \u9884\u544a\uff1a${tiboPreviewText}`,
      resetInfo.lastResetAt
        ? `\u4e0a\u6b21\u91cd\u7f6e\uff1a${formatResetRadarTime(resetInfo.lastResetAt)}`
        : "\u4e0a\u6b21\u91cd\u7f6e\uff1a\u5f85\u786e\u8ba4",
      `\u4e0b\u6b21\u91cd\u7f6e\uff1a${nextResetTime}`,
      `\u4fe1\u53f7\uff1a${resetSignalText}`,
      resetInfo.source ? `\u6570\u636e\u6765\u6e90\uff1a${resetInfo.source}` : "",
    ].filter(Boolean) : [];
    setAttribute(ring, "data-codex-quota-tip", tip);
    setAttribute(ring, "aria-label", tip.replace(/\n/g, "\uff1b"));
    if (!ringTooltip) {
      ringTooltip = document.createElement("span");
      ringTooltip.id = "codex-quota-ring-tooltip";
      ringTooltip.setAttribute("data-codex-quota", "composer-ring-tooltip");
      ringTooltip.setAttribute("role", "tooltip");
      ringTooltip.setAttribute("aria-hidden", "true");
    }
    setTextContent(ringTooltip, tip);
    if (document.body && ringTooltip.parentElement !== document.body) document.body.appendChild(ringTooltip);
    if (!ringEnabled) setAttribute(ringTooltip, "aria-hidden", "true");
    setAttribute(ring, "aria-describedby", ringTooltip.id);
    if (!ring.dataset.codexQuotaTooltipInteraction) {
      ring.dataset.codexQuotaTooltipInteraction = "true";
      ring.setAttribute("role", "button");
      ring.setAttribute("aria-pressed", "false");
      const getRingDetails = () => document.getElementById("codex-quota-ring-details");
      const setRingSelection = (selected, index = ring.dataset.codexQuotaSelectedWindow || "0") => {
        const details = getRingDetails();
        ring.dataset.codexQuotaSelectedWindow = String(index);
        setAttribute(ring, "data-selected", selected ? "true" : "false");
        setAttribute(ring, "aria-pressed", selected ? "true" : "false");
        setAttribute(ring, "aria-expanded", selected ? "true" : "false");
        if (selected) {
          const tooltip = document.getElementById("codex-quota-ring-tooltip");
          if (tooltip) setAttribute(tooltip, "aria-hidden", "true");
          const reset = document.getElementById("codex-quota-reset-composer");
          if (reset) {
            setAttribute(reset, "data-selected", "false");
            setAttribute(reset, "aria-pressed", "false");
          }
          const resetCard = document.getElementById("codex-quota-reset-details");
          if (resetCard) setAttribute(resetCard, "aria-hidden", "true");
          if (details) {
            positionQuotaRingSurface(details, ring);
            setAttribute(details, "aria-hidden", "false");
          }
        } else if (details) {
          setAttribute(details, "aria-hidden", "true");
        }
        setRingViewportTracking(selected);
      };
      /* The compact ring used to expose a one-line hover tooltip. That tooltip
         made the selected-card redesign look as if it had not loaded after a
         route change, because the old surface won the hover race. Reuse the
         reference card for hover/focus previews and keep the legacy tooltip
         permanently hidden; click/keyboard selection still pins the card. */
      const showRingTooltip = () => {
        const tooltip = document.getElementById("codex-quota-ring-tooltip");
        if (tooltip) setAttribute(tooltip, "aria-hidden", "true");
        if (ring.getAttribute("data-selected") === "true") return;
        const details = getRingDetails();
        if (!details) return;
        const reset = document.getElementById("codex-quota-reset-composer");
        const resetCard = document.getElementById("codex-quota-reset-details");
        if (reset) {
          setAttribute(reset, "data-selected", "false");
          setAttribute(reset, "aria-pressed", "false");
        }
        if (resetCard) setAttribute(resetCard, "aria-hidden", "true");
        positionQuotaRingSurface(details, ring);
        setAttribute(details, "aria-hidden", "false");
        setRingViewportTracking(true);
      };
      const hideRingTooltip = () => {
        const tooltip = document.getElementById("codex-quota-ring-tooltip");
        if (tooltip) setAttribute(tooltip, "aria-hidden", "true");
        const details = getRingDetails();
        if (details && ring.getAttribute("data-selected") !== "true") {
          setAttribute(details, "aria-hidden", "true");
        }
        if (ring.getAttribute("data-selected") !== "true") {
          setRingViewportTracking(false);
        }
      };
      const toggleRingSelection = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = event.target instanceof Element
          ? event.target.closest("[data-codex-quota-ring-window]") : null;
        const index = item?.getAttribute("data-codex-quota-ring-window") ||
          ring.dataset.codexQuotaSelectedWindow || "0";
        const selected = ring.getAttribute("data-selected") === "true";
        setRingSelection(!selected || String(index) !== ring.dataset.codexQuotaSelectedWindow, index);
        if (ring.getAttribute("data-selected") === "true") {
          /* Re-render the selected window immediately without changing the
             ring's footprint. The next quota poll will refresh its values. */
          ensureQuota();
        }
      };
      const onRingKeydown = (event) => {
        if (event.key === "Escape") {
          setRingSelection(false);
          hideRingTooltip();
          ring.blur();
          return;
        }
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        toggleRingSelection(event);
      };
      const onRingOutsideClick = (event) => {
        const details = getRingDetails();
        if (ring.contains(event.target) || details?.contains(event.target)) return;
        setRingSelection(false);
      };
      let ringViewportTracking = false;
      let unsubscribeRingViewportChange = null;
      const setRingViewportTracking = (active) => {
        const next = Boolean(active);
        if (next === ringViewportTracking) {
          if (next) runRingViewportChange();
          return;
        }
        ringViewportTracking = next;
        if (next) {
          unsubscribeRingViewportChange = resizeCoordinator.subscribe(
            runRingViewportChange, { scroll: true },
          );
          runRingViewportChange();
          return;
        }
        unsubscribeRingViewportChange?.();
        unsubscribeRingViewportChange = null;
      };
      const runRingViewportChange = () => {
        if (!ringViewportTracking || !ring.isConnected) return;
        const tooltip = document.getElementById("codex-quota-ring-tooltip");
        const details = getRingDetails();
        const ringSurfaceOpen = ring.getAttribute("data-selected") === "true" ||
          tooltip?.getAttribute("aria-hidden") === "false" ||
          details?.getAttribute("aria-hidden") === "false";
        if (!ringSurfaceOpen) {
          setRingViewportTracking(false);
          return;
        }
        const permissions = document.querySelector('[data-composer-navigation-target="permissions"]');
        const composer = permissions?.closest(".composer-surface-chrome") ||
          document.querySelector(".composer-surface-chrome");
        positionQuotaComposerPortal(
          findQuotaComposerPortal(),
          permissions,
          permissions?.parentElement,
          composer,
        );
        if (tooltip?.getAttribute("aria-hidden") === "false") {
          positionComposerInfoSurface(tooltip, ring);
        }
        if (details?.getAttribute("aria-hidden") === "false") {
          positionQuotaRingSurface(details, ring);
        }
      };
      ring.addEventListener("click", toggleRingSelection);
      ring.addEventListener("mouseenter", showRingTooltip);
      ring.addEventListener("mouseleave", hideRingTooltip);
      ring.addEventListener("focus", showRingTooltip);
      ring.addEventListener("blur", hideRingTooltip);
      ring.addEventListener("keydown", onRingKeydown);
      document.addEventListener("click", onRingOutsideClick, true);
      ring.__codexQuotaCleanup = () => {
        setRingViewportTracking(false);
        ring.removeEventListener("click", toggleRingSelection);
        ring.removeEventListener("mouseenter", showRingTooltip);
        ring.removeEventListener("mouseleave", hideRingTooltip);
        ring.removeEventListener("focus", showRingTooltip);
        ring.removeEventListener("blur", hideRingTooltip);
        ring.removeEventListener("keydown", onRingKeydown);
        document.removeEventListener("click", onRingOutsideClick, true);
      };
    }
    if (ringTooltip.getAttribute("aria-hidden") === "false") {
      positionComposerInfoSurface(ringTooltip, ring);
    }
    if (resetLikelihood && resetInfo) {
      const resetTip = resetLines.join("\n");
      setAttribute(resetLikelihood, "data-codex-reset-tip", resetTip);
      /* The themed card is the visible tooltip. Keep the accessible name but
         remove the browser's native title bubble so the two tips do not stack. */
      resetLikelihood.removeAttribute("title");
      setAttribute(resetLikelihood, "aria-label", resetTip.replace(/\n/g, "\uff1b"));
      installResetDisplayGuard();
    } else if (!resetInfo) {
      resetDisplayObserver?.disconnect();
      resetDisplayObserver = null;
      resetDisplayGuardRoot = null;
    }
    syncExperienceComposerSlots();
    if (ringEnabled) {
      /* The scheduler can initialize before the composer mounts. Pull the
         first quota deadline back to the foreground cadence once the live
         composer ring is present, without postponing later refreshes. */
      experienceSchedulerNext.quota = Math.min(
        experienceSchedulerNext.quota || 0,
        Date.now() + QUOTA_REFRESH_MS,
      );
    }
  };

  const refreshQuotaFromBridge = async () => {
    if (!QUOTA_ENABLED || !experienceCapabilityEnabled("quota") || nativeThemeSelected ||
      window[DISABLED_KEY] || quotaBridgeRequest) return quotaBridgeRequest;
    quotaBridgeRequest = (async () => {
      let state = null;
      try {
        state = await readQuotaFromCodexBridge();
      } catch {}
      if (window[STATE_KEY]?.installToken !== installToken || window[DISABLED_KEY]) return null;
      if (state && !window[DISABLED_KEY]) {
        const previous = quotaBridgeState?.status === "available"
          ? quotaBridgeState : readQuotaFromCache();
        state = stabilizeQuotaState(state);
        reconcileQuotaReset(state, previous, Date.now());
        quotaRetryCount = 0;
        if (quotaRetryTimer) clearTimeout(quotaRetryTimer);
        quotaRetryTimer = null;
        quotaBridgeState = state;
        quotaState = state;
        window.__CODEX_WEEKLY_QUOTA__ = state;
        window.__CODEX_QUOTA__ = state;
        writeQuotaCache(state);
        syncExperienceResetState(quotaResetRadarSnapshot());
        scheduleQuotaEnsure(80);
      } else if (!window[DISABLED_KEY]) {
        quotaRetryCount += 1;
        const cached = readQuotaFromCache();
        const previous = quotaBridgeState?.status === "available"
          ? normalizeQuotaState({
            ...quotaBridgeState,
            source: "codex-bridge-stale",
            freshness: "stale",
            windows: quotaWindows(quotaBridgeState).map((entry) => ({
              ...entry,
              source: "codex-bridge-stale",
              freshness: "stale",
            })),
          })
          : null;
        const fallback = cached || previous;
        quotaBridgeState = fallback;
        quotaState = fallback || (quotaRetryCount < 3
          ? { status: "loading", percentage: null }
          : { status: "unavailable", percentage: null });
        if (fallback) {
          window.__CODEX_WEEKLY_QUOTA__ = fallback;
          window.__CODEX_QUOTA__ = fallback;
        }
        syncExperienceResetState(quotaResetRadarSnapshot());
        scheduleQuotaEnsure(80);
        if (!quotaRetryTimer && quotaRetryCount < 3) {
          const delay = Math.min(60000, 5000 * (2 ** Math.min(quotaRetryCount, 3)));
          quotaRetryTimer = setTimeout(() => {
            quotaRetryTimer = null;
            if (window[STATE_KEY]?.installToken !== installToken || window[DISABLED_KEY] ||
              !experienceCapabilityEnabled("quota")) return;
            void refreshQuotaFromBridge();
          }, delay);
        }
      }
      return state;
    })().finally(() => {
      quotaBridgeRequest = null;
    });
    return quotaBridgeRequest;
  };

  const removeQuotaElement = (id) => {
    const nodes = [...new Set([
      ...document.querySelectorAll(`[id="${id}"]`),
      persistentHeaderUiNodes.get(id),
    ].filter(Boolean))];
    for (const node of nodes) {
      node.__codexQuotaCleanup?.();
      node.remove();
    }
    persistentHeaderUiNodes.delete(id);
  };

  const dedupeQuotaElement = (id) => {
    const nodes = [...document.querySelectorAll(`[id="${id}"]`)];
    const keep = findHeaderUiNode(id);
    const preferred = keep instanceof Element ? keep : nodes[0];
    if (!preferred) return;
    /* Persistent controls may be detached for one React commit while the
       replacement header is mounting. Preserve the cached control and remove
       only real duplicates; deleting the cached node here loses its listeners
       and forces a visible value reset on the next ensure pass. */
    for (const node of nodes) {
      if (node === preferred) continue;
      node.__codexQuotaCleanup?.();
      node.remove();
    }
  };

  const removeQuotaDom = () => {
    cancelQuotaComposerPortalPosition();
    disconnectQuotaComposerResizeObserver();
    for (const id of [...QUOTA_IDS, ...LEGACY_QUOTA_IDS]) removeQuotaElement(id);
    removeModelRadarDom();
    for (const node of document.querySelectorAll('[data-codex-quota], [data-dream-model-radar]')) {
      node.__codexQuotaCleanup?.();
      node.remove();
    }
  };

  const findMainSurface = () => document.querySelector(
    'main:is(.main-surface, [class*="_MainContentSurface_"])',
  ) || document.querySelector("main") || document.querySelector('[role="main"]');

  const removeThreadLoadingFallback = () => {
    const selector = "[" + THREAD_LOADING_FALLBACK_ATTR + "]";
    for (const node of document.querySelectorAll(selector)) node.remove();
  };

  const clearThreadLoadingStage = () => {
    removeThreadLoadingFallback();
    for (const node of document.querySelectorAll(
      `[${THREAD_LOADING_STAGE_ATTR}], [${THREAD_LOADING_PORTAL_ATTR}]`,
    )) {
      node.removeAttribute(THREAD_LOADING_STAGE_ATTR);
      node.removeAttribute(THREAD_LOADING_PORTAL_ATTR);
    }
  };

  const findThreadLoadingRoot = () => {
    const main = findMainSurface();
    const candidates = new Set([
      ...document.querySelectorAll(THREAD_LOADING_ROOT_SELECTOR),
      ...(main?.querySelectorAll?.(THREAD_LOADING_ROOT_NODE_SELECTOR) || []),
    ]);
    for (const candidate of candidates) {
      if (candidate.matches(".openai-blossom-shimmer")) return candidate;
      const style = getComputedStyle(candidate);
      if (
        style.getPropertyValue("--openai-blossom-shimmer-base").trim() &&
        style.getPropertyValue("--openai-blossom-shimmer-highlight").trim()
      ) {
        return candidate;
      }
    }
    return null;
  };

  /* The native loading overlay is absolutely centered inside the thread
     stage. Mark only that short-lived stage so CSS can preserve its native
     height without bringing the completed-turn spacer back. */
  const ensureThreadLoadingStage = () => {
    const loader = findThreadLoadingRoot();
    const stage = loader?.closest(
      '.thread-scroll-container > div[class*="min-h-full"], ' +
      '.thread-scroll-container > div',
    ) || null;
    const portal = loader?.closest("[data-mcp-app-portal-target]") || null;
    for (const node of document.querySelectorAll(`[${THREAD_LOADING_STAGE_ATTR}]`)) {
      if (node !== stage) node.removeAttribute(THREAD_LOADING_STAGE_ATTR);
    }
    for (const node of document.querySelectorAll(`[${THREAD_LOADING_PORTAL_ATTR}]`)) {
      if (node !== portal) node.removeAttribute(THREAD_LOADING_PORTAL_ATTR);
    }
    if (stage) stage.setAttribute(THREAD_LOADING_STAGE_ATTR, "true");
    if (portal && stage?.contains(portal)) {
      portal.setAttribute(THREAD_LOADING_PORTAL_ATTR, "true");
    }
    if (loader) removeThreadLoadingFallback();
  };

  const ensureThreadLoadingFallback = () => {
    const root = document.documentElement;
    const transitioning = root?.getAttribute("data-dream-route-transition") === "true";
    if (!transitioning || findThreadLoadingRoot()) {
      removeThreadLoadingFallback();
      return;
    }
    const main = findMainSurface();
    const host = main?.querySelector?.(".thread-scroll-container") || main;
    if (!host?.isConnected) {
      removeThreadLoadingFallback();
      return;
    }
    const selector = "[" + THREAD_LOADING_FALLBACK_ATTR + "]";
    let fallback = document.querySelector(selector);
    if (!(fallback instanceof HTMLElement)) {
      removeThreadLoadingFallback();
      fallback = document.createElement("div");
      fallback.setAttribute(THREAD_LOADING_FALLBACK_ATTR, "true");
      fallback.setAttribute("aria-hidden", "true");
      fallback.innerHTML =
        "<svg width=\"21\" height=\"21\" viewBox=\"0 0 21 21\" fill=\"none\" " +
        "xmlns=\"http://www.w3.org/2000/svg\">" +
        "<path d=\"" + THREAD_LOADING_LOGO_PATH + "\" fill=\"currentColor\"></path>" +
        "</svg>";
    }
    if (fallback.parentElement !== host) host.appendChild(fallback);
  };

  /* Utility routes share the settings paint mode, never task decorations.
     Match route roots, not task IDs, search parameters or translated text.
     Hash routing is accepted only for an explicit #/ route. */
  let routePathSnapshot = null;
  let routeSnapshotDepth = 0;
  const withRouteSnapshot = (action) => {
    routeSnapshotDepth += 1;
    try { return action(); } finally {
      if (--routeSnapshotDepth === 0) routePathSnapshot = null;
    }
  };
  const renderedPagePath = () => {
    if (routeSnapshotDepth === 0) return readRenderedPagePath();
    return routePathSnapshot ?? (routePathSnapshot = readRenderedPagePath());
  };
  const readRenderedPagePath = () => {
    metrics.routeContextReads += 1;
    // The desktop uses a memory router: location often stays /index.html.
    // Read only the committed ancestor context of the current main surface;
    // never traverse conversation children or pending React props.
    const main = findMainSurface() || document.querySelector('main, [role="main"]');
    if (main) {
      const key = Object.keys(main).find((name) => name.startsWith("__reactFiber$"));
      const initial = key ? main[key] : null;
      for (const candidate of [initial, initial?.alternate]) {
        let fiber = candidate;
        let route = "";
        let depth = 0;
        while (fiber && depth++ < 160) {
          const value = fiber.memoizedProps?.value;
          const pathname = value?.location?.pathname ||
            (typeof value?.routeKind === "string" ? value.pathname : "");
          if (!route && typeof pathname === "string" && pathname.startsWith("/")) route = pathname;
          if (!fiber.return) {
            if (fiber.stateNode?.current === fiber && route) return route;
            break;
          }
          fiber = fiber.return;
        }
      }
    }
    const pathname = globalThis.location?.pathname || "";
    const hash = globalThis.location?.hash || "";
    const route = hash.startsWith("#/") ? hash.slice(1) : pathname;
    return route === "/index.html" ? "" : route;
  };
  const nativeSurfaceRoute = () => {
    const route = renderedPagePath();
    return /^\/(settings?|plugins|skills|automations|projects|library)(?:\/|[?#]|$)/i
      .exec(route)?.[1]?.toLowerCase() || "";
  };

  /* Settings is a native surface. It can contain an article-like layout,
     which used to satisfy the generic task readiness check and caused the
     full skin to be applied to settings controls. */
  const isSettingsRoute = () => {
    const route = renderedPagePath();
    if (route) return /^\/(settings?|plugins|skills|automations|projects|library)(?:\/|[?#]|$)/i.test(route);
    if (document.querySelector('#settings-search, #plugins-page-search, #plugins-page-manage-search, #plugins-store-page-search')) return true;
    if (document.querySelector('input[name="appearance-theme"], [data-testid="theme-preview"]')) return true;
    if ([...document.querySelectorAll(
      'aside.app-shell-left-panel nav, ' +
      'aside[data-testid="app-shell-floating-left-panel"] nav',
    )].some((nav) => [SETTINGS_NAV_LABEL, "Settings"].includes(nav.getAttribute("aria-label")))) return true;
    /* Never infer settings from page text: normal project tasks can mention
       words such as “permissions”, which would incorrectly disable the skin.
       Settings routes must expose a URL or a stable native settings anchor. */
    return false;
  };

  const findTaskHeader = () => {
    const main = findMainSurface();
    const scoped = main?.querySelector?.(TASK_HEADER_SELECTOR) || main?.querySelector?.("header");
    if (scoped) return scoped;
    /* A native menu/dialog can temporarily detach the main surface while its
       task header remains mounted. Header widgets must still have an anchor in
       that interval; otherwise quota/recommendation become hover-only in some
       overlay/window states. Prefer Codex's semantic header selector, then a
       draggable top header from the same renderer. */
    return document.querySelector(TASK_HEADER_SELECTOR) ||
      [...document.querySelectorAll("header")].find((candidate) => {
        const className = String(candidate.className || "");
        return className.includes("draggable") || className.includes("app-header-tint") ||
          className.includes("_Header_");
      }) || null;
  };

  /* Codex 26.721 mounts a short-lived empty shell before it renders either a
     task or the native home cards. Applying the old home layout during that
     shell leaves a convincing-but-empty artwork page. Only activate after a
     usable task surface exists, or after every anchor the customized home
     layout relies on has mounted. */
  const rendererReadiness = () => {
    const main = findMainSurface();
    if (isSettingsRoute() && (main?.isConnected || document.querySelector('main, [role="main"]')?.isConnected)) {
      return { ready: true, home: false, settings: true };
    }
    if (!main?.isConnected) return { ready: false, home: false };
    const homeIcon = main.querySelector?.('[data-testid="home-icon"]');
    if (homeIcon) {
      /* Codex 26.721 changed the home composition while retaining enough old
         test IDs to satisfy the previous selector contract. The separate
         home-native skin state paints only safe chrome and never enables the
         legacy fixed-geometry home rules. */
      return { ready: true, home: true };
    }
    const loadingRoot = findThreadLoadingRoot();
    if (loadingRoot) return { ready: true, home: false, loading: true };
    /* A ready thread can contain hundreds of streamed markdown/unit nodes.
       The previous readiness guard checked every candidate's geometry on each
       route pass, even though the main surface already owns the viewport
       boundary. Require one real task marker, then read only that boundary;
       this keeps the guard O(1) with respect to chat length. */
    const taskSurface = main.querySelector?.(
      '[data-content-search-turn-key], [data-content-search-unit-key], ' +
      '[class*="_markdown"], [data-testid="exec-shell-body"], article',
    );
    if (taskSurface && isVisibleInViewport(main)) {
      return { ready: true, home: false };
    }
    /* The worktree setup view is native but can be mounted without the
       blossom class/variables used by older Codex builds. Treat its explicit
       status text as a usable loading surface so the route mask can close. */
    const startupText = String(main.textContent || "").replace(/\s+/g, " ").trim();
    if (TASK_STARTUP_STATUS_RE.test(startupText)) {
      return { ready: true, home: false, loading: true };
    }
    return { ready: false, home: false };
  };

  const findHeaderQuotaHost = (header) => {
    /* The custom experience controls share a centered overlay. Native title
       and window-action cells stay untouched outside this host. */
    ensureHeaderInteractionHost(header);
    return header instanceof Element ? header : null;
  };

  const findEnvironmentPanel = () => {
    const isEnvironmentPanel = (node) => {
      if (!(node instanceof HTMLElement) || node.closest(":is(aside.app-shell-left-panel, aside[data-testid=\"app-shell-floating-left-panel\"])")) return false;
      const rect = node.getBoundingClientRect();
      const text = node.innerText?.slice(0, 240) || "";
      return rect.width > 180 && rect.width < 460 && rect.height > 100 &&
        rect.right > globalThis.innerWidth - 70 &&
        /(?:环境|environment|workspace|工作目录)/i.test(text);
    };
    if (environmentPanelCache?.isConnected && isEnvironmentPanel(environmentPanelCache)) {
      return environmentPanelCache;
    }
    environmentPanelCache = null;
    /* The native environment drawer is an aside/section. Scanning every div
       and reading innerText during quota refresh made first render scale with
       the entire thread DOM. */
    const matches = [...document.querySelectorAll("aside, section")].filter(isEnvironmentPanel);
    environmentPanelCache = matches.sort((left, right) =>
      left.getBoundingClientRect().width - right.getBoundingClientRect().width,
    )[0] || null;
    return environmentPanelCache;
  };

  const positionQuotaPopover = (pill, popover) => {
    const rect = pill.getBoundingClientRect();
    const viewportWidth = Number(globalThis.innerWidth) || document.documentElement.clientWidth || 800;
    const viewportHeight = Number(globalThis.innerHeight) || document.documentElement.clientHeight || 600;
    const popoverWidth = Math.min(
      Math.max(popover.offsetWidth || 580, 280),
      Math.max(280, viewportWidth - 24),
    );
    const left = Math.min(
      viewportWidth - popoverWidth - 12,
      Math.max(12, rect.right - popoverWidth),
    );
    const popoverHeight = Math.min(Math.max(popover.offsetHeight || 0, 180), viewportHeight - 24);
    const below = rect.bottom + 8;
    const top = below + popoverHeight <= viewportHeight - 12
      ? below
      : Math.max(12, rect.top - popoverHeight - 8);
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  };

  const ensureQuota = () => {
    if (!isRendererVisible()) {
      backgroundRepairPending = true;
      return;
    }
    /* A quota refresh can finish after the user has switched to the native
       theme.  Do not let that stale async completion recreate the composer
       portal: native mode intentionally removes all skin-owned quota markup,
       and the unscoped native SVG fallback would otherwise expand to the full
       main surface and paint as a giant black circle. */
    const skinMode = document.documentElement?.getAttribute("data-dream-skin") || "";
    if (nativeThemeSelected || !["active", "home-native"].includes(skinMode)) {
      removeQuotaDom();
      return;
    }
    /* Async quota refreshes can finish after the route has already changed.
       Settings must never recreate skin-owned header widgets. */
    if (isSettingsRoute()) {
      removeQuotaDom();
      return;
    }
    if (!QUOTA_ENABLED || !experienceCapabilityEnabled("quota")) {
      dispatchExperienceEvent("QUOTA_UPDATED", { status: "unavailable" });
      removeQuotaDom();
      return;
    }
    for (const id of LEGACY_QUOTA_IDS) removeQuotaElement(id);
    for (const id of QUOTA_IDS) dedupeQuotaElement(id);
    const header = findTaskHeader();
    if (!header) {
      /* Project/branch changes temporarily replace the native header. Keep the
         exact controls and listeners in memory so the new header gets them
         back in the same rendering turn instead of showing an empty frame. */
      for (const id of ["codex-quota-popover", "codex-model-radar-popover"]) {
        const popover = findHeaderUiNode(id);
        if (popover) popover.hidden = true;
      }
      return;
    }
    ensureQuotaSurfaceObserver();
    if (!quotaState) quotaState = readQuotaState();
    const state = quotaState;
    dispatchExperienceEvent("QUOTA_UPDATED", { status: experienceQuotaPhase(state) });
    const level = quotaLevel(state);

    let recommendationHeaderEnsured = false;
    if (QUOTA_CONFIG.showInHeader !== false && experienceHeaderSlotEnabled("quota")) {
      const host = findHeaderQuotaHost(header);
      if (host) {
        let pill = findHeaderUiNode("codex-quota-pill");
        let ring = document.getElementById("codex-quota-ring-pill");
        let popover = findHeaderUiNode("codex-quota-popover");
        if (!pill || !popover) {
          removeQuotaElement("codex-quota-pill");
          removeQuotaElement("codex-quota-ring-pill");
          removeQuotaElement("codex-quota-popover");
          ring = null;
          pill = rememberHeaderUiNode(document.createElement("button"));
          pill.id = "codex-quota-pill";
          pill.type = "button";
          pill.setAttribute("aria-haspopup", "dialog");
          pill.setAttribute("aria-controls", "codex-quota-popover");
          pill.setAttribute("aria-expanded", "false");
          pill.setAttribute("data-codex-quota", "pill");
          rememberHeaderUiNode(pill);
          popover = rememberHeaderUiNode(document.createElement("div"));
          popover.id = "codex-quota-popover";
          popover.setAttribute("role", "dialog");
          popover.setAttribute("aria-label", "额度详情");
          popover.tabIndex = -1;
          popover.hidden = true;
          popover.setAttribute("data-codex-quota", "popover");
          rememberHeaderUiNode(popover);
          document.body?.appendChild(popover);

          let hideTimer = null;
          let ignoreFocusoutUntil = 0;
          let dialogDismissCleanup = () => {};
          let clickPinned = false;
          const hide = () => {
            if (hideTimer) clearTimeout(hideTimer);
            clickPinned = false;
            popover.hidden = true;
            pill.setAttribute("aria-expanded", "false");
            unsubscribeReposition?.setScroll?.(false);
            ensureQuotaSystemClock();
          };
          const focusDialog = () => {
            const target = popover.querySelector(
              'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
            ) || popover;
            try { target.focus({ preventScroll: true }); } catch { target.focus(); }
          };
          const show = (moveFocus = false, pin = false) => {
            if (hideTimer) clearTimeout(hideTimer);
            if (pin) clickPinned = true;
            /* The detail card contains layout-aware Tibo and token sections.
               Build them only when the user opens it, rather than on every
               header repair while the card is hidden. */
            popover.hidden = false;
            pill.setAttribute("aria-expanded", "true");
            updateQuotaView(popover, quotaState || state, false);
            unsubscribeReposition?.setScroll?.(true);
            ensureQuotaSystemClock();
            positionQuotaPopover(pill, popover);
            experienceSchedulerNext.quota = Date.now() + QUOTA_REFRESH_MS;
            void refreshQuotaFromBridge();
            if (moveFocus) focusDialog();
          };
          const scheduleHide = () => {
            if (clickPinned) return;
            if (popover.contains(document.activeElement)) return;
            if (hideTimer) clearTimeout(hideTimer);
            hideTimer = setTimeout(hide, 140);
          };
          const unsubscribeReposition = resizeCoordinator.subscribe(() => {
            if (!popover.hidden) positionQuotaPopover(pill, popover);
          });
          const outsideClick = (event) => {
            if (!pill.contains(event.target) && !popover.contains(event.target)) hide();
          };
          pill.addEventListener("mouseenter", () => show());
          pill.addEventListener("focus", () => {
            if (pill.__codexSuppressDialogFocusOpen) return;
            show();
          });
          pill.addEventListener("click", (event) => {
            ignoreFocusoutUntil = performance.now() + 420;
            show(event.detail === 0, true);
          });
          pill.addEventListener("mouseleave", scheduleHide);
          popover.addEventListener("mouseenter", () => hideTimer && clearTimeout(hideTimer));
          popover.addEventListener("mouseleave", scheduleHide);
          document.addEventListener("click", outsideClick, true);
          dialogDismissCleanup = installDialogDismiss(
            pill,
            popover,
            hide,
            () => performance.now() < ignoreFocusoutUntil,
          );
          const cleanupControls = () => {
            if (hideTimer) clearTimeout(hideTimer);
            unsubscribeReposition();
            document.removeEventListener("click", outsideClick, true);
            dialogDismissCleanup();
            dialogDismissCleanup = () => {};
          };
          pill.__codexQuotaCleanup = cleanupControls;
          popover.__codexQuotaCleanup = cleanupControls;
        }
        ensureHeaderHitTestTarget(pill);
        ensureHeaderHitTestTarget(popover);
        if (ring) {
          removeQuotaElement("codex-quota-ring-pill");
          ring = null;
        }
        const group = findExperienceHeaderGroup(host);
        const target = group || host;
        if (pill.parentElement !== target) {
          target.insertBefore(pill, target.firstChild);
        }
        setAttribute(pill, "data-dream-experience-slot", "quota");
        if (popover.parentElement !== document.body) document.body?.appendChild(popover);
        setAttribute(pill, "data-level", level);
        setAttribute(popover, "data-level", level);
        updateQuotaView(pill, state, true);
        if (!popover.hidden) updateQuotaView(popover, state, false);
        const quotaTitle = state.status === "available"
          ? quotaWindows(state).map((entry) =>
            `${quotaWindowKind(entry?.windowMinutes, entry?.windowLabel) === "five-hour"
              ? `${entry.windowLabel || "5H 剩余"} ${Math.round(entry.percentage)}%`
              : `${entry.windowLabel || "额度"}剩余 ${Math.round(entry.percentage)}%`} · 已使用 ${Math.round(entry.usedPercentage ?? 100 - entry.percentage)}%`,
          ).join("；")
          : state.status === "loading" ? "额度同步中" : "额度暂不可用";
        setAttribute(pill, "title", quotaTitle);
        setAttribute(pill, "aria-label", quotaTitle);
        ensureModelRadar(host, pill);
        arrangeExperienceHeaderSlots(host);
        recommendationHeaderEnsured = true;
      } else {
        /* A host added later in this native commit is handled by the header
           observer. Do not start a zero-delay retry loop while it is absent. */
        return;
      }
    } else {
      removeQuotaElement("codex-quota-pill");
      removeQuotaElement("codex-quota-ring-pill");
      removeQuotaElement("codex-quota-popover");
    }

    /* The header quota path above already refreshed the model recommendation.
       Preserve the independent recommendation path when the quota slot is
       disabled, but avoid repeating the same sort/render during each full
       route repair. */
    if (!recommendationHeaderEnsured) ensureRecommendationHeader();
    ensureComposerQuotaRing(state, level);

    const environment = QUOTA_CONFIG.showInEnvironment !== false ? findEnvironmentPanel() : null;
    let panel = document.getElementById("codex-quota-panel");
    if (!environment) {
      panel?.remove();
      return;
    }
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "codex-quota-panel";
      panel.setAttribute("aria-label", "额度");
      panel.setAttribute("data-codex-quota", "panel");
    }
    if (panel.parentElement !== environment) environment.insertBefore(panel, environment.firstElementChild);
    panel.dataset.level = level;
    updateQuotaView(panel, state, false);
  };

  const scopeMatches = (scope, baseState, overlay) => {
    const active = new Set([baseState]);
    if (baseState !== "settings") active.add("all");
    if (overlay) active.add("overlay");
    const tokens = String(scope || "all").toLowerCase().match(/[a-z]+/g) || ["all"];
    return tokens.some((token) => token !== "config" && active.has(token));
  };

  const detectScope = () => {
    const overlay = openOverlaySelectorHit("overlay-menu") ||
      openOverlaySelectorHit("overlay-dialog") || openOverlaySelectorHit("overlay-popper");
    let baseState = "thread";
    if (isSettingsRoute() || selectorHit("appearance-radio") || stableTestidHit("theme-preview")) baseState = "settings";
    else if (selectorHit("home-icon") || selectorHit("home-route")) baseState = "home";
    else if (!selectorHit("shell-main")) baseState = "settings";
    const missingL1 = SELECTOR_CONTRACT.selectors
      .filter((entry) => entry.tier === "L1" && entry.required &&
        scopeMatches(entry.scope, baseState, overlay) && !selectorHit(entry.key))
      .map((entry) => entry.key);
    return {
      state: overlay ? "overlay" : baseState,
      baseState,
      overlay,
      // Settings can replace or partially replace the app shell. It is always
      // an L0 scope; never treat missing home/thread anchors as a failure.
      level: baseState === "settings" || missingL1.length ? "L0" : "L1",
      missingL1,
    };
  };

  const refreshScope = () => {
    metrics.routePasses += 1;
    const scope = detectScope();
    dispatchExperienceEvent("SCOPE_CHANGED", {
      route: scope.baseState,
      overlay: scope.overlay,
    });
    const state = window[STATE_KEY];
    if (state?.installToken === installToken) state.scope = scope;
    return scope;
  };

  const ensure = ({ root: rootPass = true, scope: scopePass = false } = {}) => withRouteSnapshot(() => {
    if (window[DISABLED_KEY]) return;
    /* A timer/observer callback from a superseded hot-reapply can run after
       the new payload has cleared the shared disabled flag. Keep that callback
       from re-attaching its old stylesheet or rebuilding stale skin DOM. */
    const liveState = window[STATE_KEY];
    if (!liveState || liveState.installToken !== installToken) return;
    const root = document.documentElement;
    if (!root) return;
    const visible = isRendererVisible();
    if (!visible) {
      backgroundRepairPending = true;
      /* A hot reapply can clear the old root contract while the Electron
         window is still backgrounded. Restore the lightweight root/style
         state once, but defer quota, character, and layout work until the
         visibility handler reports that the window is foregrounded. */
      const mode = root.getAttribute("data-dream-skin");
      const rootPaintReady = nativeThemeSelected
        ? mode === "native"
        : ["active", "home-native", "settings"].includes(mode) &&
          Boolean(root.style.getPropertyValue("--dream-skin-art").trim()) &&
          Boolean(root.style.getPropertyValue("--ds-bg").trim());
      let styleReady = true;
      if (styleMode === "adopted" && styleSheet) {
        try { styleReady = [...document.adoptedStyleSheets].includes(styleSheet); } catch { styleReady = false; }
      } else if (styleMode === "style" && styleNode) {
        styleReady = document.getElementById(STYLE_ID) === styleNode;
      }
      if (rootPaintReady && styleReady) return;
    }
    metrics.ensureCalls += 1;
    componentBoundaryTransactionDepth += 1;
    markComponentBoundaryDirty();
    try {
      const rootState = rootPass ? applyRootState(root) : null;
      const skinMode = rootPass
        ? (rootState?.applied ? root.getAttribute("data-dream-skin") : null)
        : root.getAttribute("data-dream-skin");
      if (!visible) return;
      if (["active", "home-native"].includes(skinMode)) {
        /* During a native route commit, quota/environment scans and header
           layout reads can starve React before the replacement home mounts.
           Keep only the loading-stage/fallback repair until readiness returns. */
        /* applyRootState already measured the main surface for this exact
           repair. Reusing it avoids a second forced style/layout read after
           the root theme attributes have changed. */
        const readiness = rootState?.readiness || rendererReadiness();
        const transitioning = root.getAttribute("data-dream-route-transition") === "true";
        if (!readiness.ready && (transitioning || routeTransitionTimedOut)) {
          ensureThreadLoadingStage();
          if (transitioning) ensureThreadLoadingFallback();
          else removeThreadLoadingFallback();
          return;
        }
        ensureThreadLoadingStage();
        if (root.getAttribute("data-dream-route-transition") === "true") {
          ensureThreadLoadingFallback();
        } else {
          removeThreadLoadingFallback();
        }
        componentBoundaries?.ComposerDock?.ensure?.();
        ensureQuota();
        componentBoundaries?.HeaderExperienceGroup?.ensure?.();
      } else if (skinMode === "native") {
        clearThreadLoadingStage();
        removeQuotaDom();
        removeHomeReplica();
        removeSidebarGreeting();
        removeNativeSidebarToggle();
        removeCharacterVariants();
        removeSummaryFooter();
        componentBoundaries?.HeaderExperienceGroup?.ensure?.();
      } else {
        clearThreadLoadingStage();
        removeQuotaDom();
        removeBackgroundSwitcher();
      }
      /* One registry pass records the current component roots after the visual
         repair has settled. It does not move or restyle native nodes. */
      syncComponentBoundaries();
      if (scopePass) refreshScope();
    } finally {
      componentBoundaryTransactionDepth -= 1;
    }
  });

  const cleanup = () => {
    const state = window[STATE_KEY];
    if (state?.installToken !== installToken) return false;
    window[DISABLED_KEY] = true;
    cancelAnimationFrame(threadEarningFieldRaf);
    threadEarningFieldRaf = 0;
    document.removeEventListener("visibilitychange", resumeThreadEarningFields);
    threadEarningMotionQuery.removeEventListener("change", resumeThreadEarningFields);
    threadEarningLiveFields.length = 0;
    for (const key of ["__CODEX_WEEKLY_QUOTA__", "__CODEX_QUOTA__", "__LINZI_WEEKLY_QUOTA__"]) {
      try { delete window[key]; } catch {}
    }
    const root = document.documentElement;
    for (const name of ROOT_ATTRS) root?.removeAttribute(name);
    for (const attribute of [...(root?.attributes || [])]) {
      if (attribute.name.startsWith("data-dream-")) root.removeAttribute(attribute.name);
    }
    for (const name of THEME_VARIABLES) root?.style.removeProperty(name);
    for (const property of [...(root?.style || [])]) {
      if (property.startsWith("--dream-") || property.startsWith("--ds-")) {
        root.style.removeProperty(property);
      }
    }
    state?.rootObserver?.disconnect();
    state?.routeObserver?.disconnect();
    routeObserverDeepTargets = new Set();
    routeObserverLifecycleTargets = new Set();
    for (const node of componentBoundaryNodes) {
      node.removeAttribute(COMPONENT_BOUNDARY_ATTR);
    }
    componentBoundaryNodes = new Set();
    componentBoundarySnapshot = null;
    componentBoundaryDirty = true;
    componentBoundaryTransactionDepth = 0;
    quotaObserver?.disconnect();
    quotaObserver = null;
    quotaObservedHeader = null;
    quotaObservedComposer = null;
    resetDisplayObserver?.disconnect();
    resetDisplayObserver = null;
    resetDisplayGuardRoot = null;
    resetDisplayRepairing = false;
    summaryObserver?.disconnect();
    if (interactionRepairTimer) clearTimeout(interactionRepairTimer);
    if (readinessCheckTimer) clearTimeout(readinessCheckTimer);
    if (summaryRefreshTimer) clearTimeout(summaryRefreshTimer);
    if (characterReplyRepairTimer) clearTimeout(characterReplyRepairTimer);
    if (characterReplySubtreeRepairTimer) clearTimeout(characterReplySubtreeRepairTimer);
    pendingCharacterReplyRows.clear();
    pendingCharacterReplySubtrees.clear();
    disconnectSidebarGreetingResizeObserver();
    sidebarGreetingSizeCache = null;
    headerSpaceObserver?.disconnect();
    headerSpaceObserver = null;
    headerSpaceHost?.removeAttribute('data-dream-header-cramped');
    headerSpaceHost = null;
    headerSpaceComposer = null;
    sidebarGreetingMeasureCanvas = null;
    sidebarGreetingMeasureContext = null;
    if (moodRotationTimer) clearInterval(moodRotationTimer);
    if (routeEnsureTimer) clearTimeout(routeEnsureTimer);
    if (routeFollowupTimer) clearTimeout(routeFollowupTimer);
    if (resizeRepairTimer) clearTimeout(resizeRepairTimer);
    if (sidebarProjectPortalRepairTimer) clearTimeout(sidebarProjectPortalRepairTimer);
    if (sidebarAccountRepairTimer) clearTimeout(sidebarAccountRepairTimer);
    if (experienceCompletionTimer) clearTimeout(experienceCompletionTimer);
    if (backgroundPreloadTimer) clearTimeout(backgroundPreloadTimer);
    for (const timer of visibilityResumeTimers) clearTimeout(timer);
    visibilityResumeTimers.clear();
    backgroundRepairPending = false;
    document.documentElement?.removeAttribute("data-dream-resizing");
    if (backgroundSwitchTimer) clearTimeout(backgroundSwitchTimer);
    if (quotaComposerHideTimer) clearTimeout(quotaComposerHideTimer);
    cancelQuotaComposerPortalPosition();
    routeEnsureTimer = null;
    routeFollowupTimer = null;
    routeTransitionStartedAt = 0;
    routeTransitionTimedOut = false;
    routeUrlSignature = "";
    characterReplyRepairTimer = null;
    characterReplySubtreeRepairTimer = null;
    resizeRepairTimer = null;
    sidebarProjectPortalRepairTimer = null;
    sidebarAccountRepairTimer = null;
    sidebarAccountRepairAttempts = 0;
    sidebarProjectHoverTarget = null;
    backgroundSwitchTimer = null;
    experienceCompletionTimer = null;
    backgroundPreloadTimer = null;
    backgroundPreloadPromise = null;
    quotaComposerHideTimer = null;
    quotaComposerPortalPositionFrame = null;
    quotaComposerPortalPositionUsesAnimationFrame = false;
    quotaComposerPortalPositionRetryTimer = null;
    moodRotationTimer = null;
    if (quotaPollTimer) clearInterval(quotaPollTimer);
    if (sessionTokenTimer) clearInterval(sessionTokenTimer);
    if (quotaScheduleTimer) clearTimeout(quotaScheduleTimer);
    if (quotaRetryTimer) clearTimeout(quotaRetryTimer);
    if (quotaRadarTimer) clearInterval(quotaRadarTimer);
    if (quotaSystemClockRuntime) {
      try { quotaSystemClockRuntime.stop(); } catch {}
      if (window[QUOTA_SYSTEM_CLOCK_RUNTIME_KEY] === quotaSystemClockRuntime) {
        delete window[QUOTA_SYSTEM_CLOCK_RUNTIME_KEY];
      }
    }
    stopThreadEarningRuntime();
    for (const runtime of threadEarningRuntimes) {
      try { runtime?.stop?.(); } catch {}
    }
    threadEarningRuntimes.clear();
    if (window[THREAD_EARNING_RUNTIME_REGISTRY_KEY] === threadEarningRuntimes) {
      delete window[THREAD_EARNING_RUNTIME_REGISTRY_KEY];
    }
    if (quotaRadarRetryTimer) clearTimeout(quotaRadarRetryTimer);
    if (tiboRadarTimer) clearInterval(tiboRadarTimer);
    quotaRetryTimer = null;
    sessionTokenTimer = null;
    sessionTokenContextNode = null;
    sessionTokenActiveThreadId = "";
    sessionTokenLastNativeScan = 0;
    sessionTokenNativeUsageCache = null;
    quotaRetryCount = 0;
    quotaSystemClockRuntime = null;
    quotaRadarRetryTimer = null;
    quotaRadarRetryCount = 0;
    if (modelRadarTimer) clearInterval(modelRadarTimer);
    if (modelRadarRetryTimer) clearTimeout(modelRadarRetryTimer);
    if (modelRadarFeedbackTimer) clearTimeout(modelRadarFeedbackTimer);
    modelRadarFeedbackTimer = null;
    if (pointerRepairHandler && typeof document.removeEventListener === "function") {
      document.removeEventListener("pointerdown", pointerRepairHandler, true);
      document.removeEventListener("pointerup", pointerRepairHandler, true);
    }
    removeExperienceHeaderHoverBridge();
    if (sidebarProjectPointerHandler && typeof document.removeEventListener === "function") {
      document.removeEventListener("pointerover", sidebarProjectPointerHandler, true);
      document.removeEventListener("pointerout", sidebarProjectPointerHandler, true);
    }
    if (projectNavigationLockHandler && typeof document.removeEventListener === "function") {
      document.removeEventListener("pointerdown", projectNavigationLockHandler, true);
      document.removeEventListener("keydown", projectNavigationLockHandler, true);
    }
    if (globalThis[PROJECT_NAVIGATION_LOCK_KEY] === projectNavigationLockHandler) {
      try { delete globalThis[PROJECT_NAVIGATION_LOCK_KEY]; } catch {}
    }
    projectNavigationLockHandler = null;
    if (focusRepairHandler && typeof document.removeEventListener === "function") {
      document.removeEventListener("focusin", focusRepairHandler, true);
    }
    clearNativeHeaderTracks(experienceHeaderTrackState.host);
    resizeCoordinatorCleanup?.();
    resizeCoordinatorCleanup = null;
    resizeCoordinator.dispose();
    if (visibilityRepairHandler && typeof document.removeEventListener === "function") {
      document.removeEventListener("visibilitychange", visibilityRepairHandler);
    }
    if (networkOnlineHandler && typeof window.removeEventListener === "function") {
      window.removeEventListener("online", networkOnlineHandler);
    }
    if (networkOfflineHandler && typeof window.removeEventListener === "function") {
      window.removeEventListener("offline", networkOfflineHandler);
    }
    if (quotaEventHandler && typeof window.removeEventListener === "function") {
      window.removeEventListener("codex:quota-update", quotaEventHandler);
    }
    removeQuotaDom();
    removeBackgroundSwitcher();
    removeHomeReplica();
    removeSidebarGreeting();
    removeNativeSidebarToggle();
    discardSidebarProjectPortals();
    root?.removeAttribute(SIDEBAR_FLOATING_ATTR);
    for (const node of document.querySelectorAll(
      `[${SIDEBAR_FLOATING_ATTR}]`,
    )) {
      node.removeAttribute(SIDEBAR_FLOATING_ATTR);
    }
    clearThreadLoadingStage();
    root?.style.removeProperty("--dream-sidebar-native-width");
    removeCharacterVariants();
    removeComposerSurfaceChromeRepair();
    removeSummaryFooter();
    if (bodyReadyHandler && typeof document.removeEventListener === "function") {
      document.removeEventListener("DOMContentLoaded", bodyReadyHandler);
    }
    if (experienceSchedulerTimer !== null) clearTimeout(experienceSchedulerTimer);
    experienceSchedulerTimer = null;
    if (state) state.timer = null;
    if (state?.scheduler?.timeout) clearTimeout(state.scheduler.timeout);
    if (analysisTimer) clearTimeout(analysisTimer);
    if (state?.mediaHandler && state?.mediaQuery) {
      try { state.mediaQuery.removeEventListener("change", state.mediaHandler); } catch {}
    }
    if (state?.navigationHandler && state?.navigation) {
      try { state.navigation.removeEventListener("navigate", state.navigationHandler); } catch {}
    }
    if (state?.routeSignalHandler && typeof window.removeEventListener === "function") {
      window.removeEventListener("codex-dream-skin-route-change", state.routeSignalHandler);
      window.removeEventListener("popstate", state.routeSignalHandler);
      window.removeEventListener("hashchange", state.routeSignalHandler);
    }
    if (typeof state?.routeHistoryRestore === "function") {
      try { state.routeHistoryRestore(); } catch {}
    }
    routeHistoryRestore = null;
    if (styleSheet) {
      try {
        document.adoptedStyleSheets = [...document.adoptedStyleSheets]
          .filter((candidate) => candidate !== styleSheet);
      } catch {}
      styleRegistry.delete(styleSheet);
    }
    styleNode?.remove();
    if (document.getElementById(STYLE_ID) === styleNode) document.getElementById(STYLE_ID)?.remove();
    if (styleRegistry.size === 0) delete window[STYLE_REGISTRY_KEY];
    if (state?.artUrl) URL.revokeObjectURL(state.artUrl);
    if (state?.petUrl) URL.revokeObjectURL(state.petUrl);
    if (state?.sidebarCompanionUrl) URL.revokeObjectURL(state.sidebarCompanionUrl);
    if (state?.sidebarAccountAvatarUrl) URL.revokeObjectURL(state.sidebarAccountAvatarUrl);
    if (state?.chatAvatarUrl && state.chatAvatarUrl !== state.sidebarAccountAvatarUrl) {
      URL.revokeObjectURL(state.chatAvatarUrl);
    }
    if (state?.composerCompanionUrl) URL.revokeObjectURL(state.composerCompanionUrl);
    if (state?.tiboAvatarUrl) URL.revokeObjectURL(state.tiboAvatarUrl);
    backgroundDecodeCache.clear();
    for (const url of Object.values(baseOptionalAssetUrls)) {
      if (url) URL.revokeObjectURL(url);
    }
    for (const assetCache of variantOptionalAssetUrls.values()) {
      for (const url of Object.values(assetCache)) {
        if (url) URL.revokeObjectURL(url);
      }
    }
    for (const url of lazyAssetObjectUrls.values()) {
      if (url) URL.revokeObjectURL(url);
    }
    lazyAssetObjectUrls.clear();
    for (const variant of state?.backgroundVariants || []) {
      if (variant?.url && variant.url !== state?.artUrl) URL.revokeObjectURL(variant.url);
    }
    for (const pending of lazyAssetRequests.values()) {
      clearTimeout(pending.timeout);
      if (pending.fallbackTimer) clearTimeout(pending.fallbackTimer);
      pending.resolve(null);
    }
    lazyAssetRequests.clear();
    lazyAssetInFlight.clear();
    if (globalThis[lazyAssetResponseKey] === lazyAssetResponse) {
      if (previousLazyAssetResponse) globalThis[lazyAssetResponseKey] = previousLazyAssetResponse;
      else delete globalThis[lazyAssetResponseKey];
    }
    delete globalThis[lazyAssetFallbackKey];
    experienceSidebarStoreUnsubscribe?.();
    experienceSidebarStoreUnsubscribe = null;
    experienceChatStoreUnsubscribe?.();
    experienceChatStoreUnsubscribe = null;
    experienceComposerStoreUnsubscribe?.();
    experienceComposerStoreUnsubscribe = null;
    experienceRootStoreUnsubscribe?.();
    experienceRootStoreUnsubscribe = null;
    experienceSubscribers.clear();
    delete window[STATE_KEY];
    return true;
  };

  const scheduler = { timeout: null, root: false, scope: false };
  const flushScheduledEnsure = () => {
    if (scheduler.timeout) clearTimeout(scheduler.timeout);
    scheduler.timeout = null;
    const pending = { root: scheduler.root, scope: scheduler.scope };
    scheduler.root = false;
    scheduler.scope = false;
    ensure(pending);
  };
  const scheduleEnsure = ({ root = false, scope = false } = {}, delay = 64) => {
    scheduler.root ||= root;
    scheduler.scope ||= scope;
    if (!isRendererVisible()) {
      backgroundRepairPending = true;
      return;
    }
    /* A route mutation is a stronger signal than the root attribute observer.
       Let its zero-delay pass replace a pending 64ms root pass so one route
       change produces one consolidated repair instead of two layouts. */
    if (scheduler.timeout) {
      if (delay > 0) return;
      clearTimeout(scheduler.timeout);
      scheduler.timeout = null;
    }
    scheduler.timeout = setTimeout(flushScheduledEnsure, delay);
  };
  const routeRepairNeeded = () => {
    const root = document.documentElement;
    if (!(root instanceof Element)) return false;
    return root.getAttribute("data-dream-route-transition") === "true" || skinNeedsRepair();
  };
  const scheduleRouteEnsure = (delay = 220) => {
    if (routeEnsureTimer) clearTimeout(routeEnsureTimer);
    routeEnsureTimer = setTimeout(() => {
      routeEnsureTimer = null;
      /* History, sidebar-pointer, and mutation observers can all report the
         same chat switch. Once the first route pass restored the shell, later
         callbacks must not run another expensive full repair. */
      if (!window[DISABLED_KEY] && routeRepairNeeded()) {
        scheduleEnsure({ root: true, scope: true }, 0);
      }
    }, Math.max(0, delay));
  };
  const lockActiveThemeDuringRoute = ({ restart = false } = {}) => {
    if (window[DISABLED_KEY] || nativeThemeSelected) return false;
    /* Hot-reapply can leave a browser event callback alive for one turn while
       the new payload is taking ownership. A stale callback must not append
       its old constructable stylesheet or repaint the previous theme. */
    const liveState = window[STATE_KEY];
    if (!liveState || liveState.installToken !== installToken) return false;
    const root = document.documentElement;
    if (!(root instanceof Element)) return false;
    const skinMode = root.getAttribute("data-dream-skin");
    if (![
      "active", "home-native", "settings",
    ].includes(skinMode)) return false;
    const variant = activeBackgroundVariant();
    if (!variant) return false;
    const transitioning = root.getAttribute("data-dream-route-transition") === "true";
    if (routeTransitionTimedOut && !restart && !transitioning) {
      /* The native startup surface is already exposed. Do not reopen the
         artificial mask on each observer batch while worktree setup waits. */
      return true;
    }
    if (restart || routeTransitionStartedAt <= 0) {
      routeTransitionStartedAt = now();
      routeTransitionTimedOut = false;
    }
    const previousVariantId = root.getAttribute("data-dream-background-variant");
    ensureStyle();
    /* Mark the transition before React unmounts the old project. The CSS keeps
       the existing wallpaper and shell paint in place until the destination
       surface is ready, so a stale/native skin cannot occupy one frame. */
    setAttribute(root, "data-dream-route-transition", "true");
    setAttribute(root, "data-dream-background-variant", variant.id);
    setAttribute(root, "data-dream-theme-id", variant.id);
    setAttribute(root, "data-dream-experience-variant", variant.id);
    if (previousVariantId !== variant.id ||
      !root.style.getPropertyValue("--dream-skin-art").trim()) {
      applyActiveBackgroundVariant(root, resolvedShell());
      setAttribute(root, "data-dream-experience-variant", variant.id);
    }
    pruneOrphanedDreamStyleSheets(styleSheet);
    return true;
  };
  const ROUTE_MUTATION_ANCHOR_SELECTOR = [
    'main:is(.main-surface, [class*="_MainContentSurface_"])',
    'aside.app-shell-left-panel',
    'aside[data-testid="app-shell-floating-left-panel"]',
    TASK_HEADER_SELECTOR,
    '[data-testid="home-icon"]',
    '[role="main"]',
    '[role="menu"]',
    '[role="dialog"]',
    '[data-radix-popper-content-wrapper]',
    'input[name="appearance-theme"]',
    '[data-testid="theme-preview"]',
    '[data-codex-composer-root]',
    '[data-composer-surface-variant]',
    THREAD_LOADING_ROOT_NODE_SELECTOR,
  ].join(', ');
  const routeMutationNeedsEnsure = (mutation) => {
    if (mutation.type === "attributes") {
      return mutation.target instanceof Element && mutation.target.matches([
        'main:is(.main-surface, [class*="_MainContentSurface_"])',
        'aside.app-shell-left-panel',
        'aside[data-testid="app-shell-floating-left-panel"]',
         '[data-testid="home-icon"]',
         '[role="main"]',
         '[aria-current="page"]',
         THREAD_LOADING_ROOT_SELECTOR,
       ].join(', '));
    }
    if (mutation.type !== "childList") return false;
    const isRouteAnchor = (node) => node instanceof Element && (
      node.matches(ROUTE_MUTATION_ANCHOR_SELECTOR) ||
      Boolean(node.querySelector(ROUTE_MUTATION_ANCHOR_SELECTOR))
    );
    return [...mutation.addedNodes, ...mutation.removedNodes].some(isRouteAnchor);
  };
  const sidebarMutationOnly = (mutation) => {
    if (mutation.type !== "childList") return false;
    const target = mutation.target;
    if (target instanceof Element && target.closest(SIDEBAR_PANEL_SELECTOR)) return true;
    const changed = [...mutation.addedNodes, ...mutation.removedNodes]
      .filter((node) => node instanceof Element);
    if (!changed.length) return false;
    return changed.every((node) => {
      if (node.matches(SIDEBAR_PANEL_SELECTOR) || node.closest(SIDEBAR_PANEL_SELECTOR)) return true;
      const nestedSidebar = node.querySelector(SIDEBAR_PANEL_SELECTOR);
      if (!nestedSidebar) return false;
      return !node.matches('main:is(.main-surface, [class*="_MainContentSurface_"])') &&
        !node.querySelector('main:is(.main-surface, [class*="_MainContentSurface_"])') &&
        !node.matches('[data-codex-composer-root]') &&
        !node.querySelector('[data-codex-composer-root]');
    });
  };
  const mutationTouchesSidebar = (mutation) => {
    if (mutation.type !== "childList") return false;
    if (mutation.target instanceof Element && mutation.target.closest(SIDEBAR_PANEL_SELECTOR)) {
      return true;
    }
    return [...mutation.addedNodes, ...mutation.removedNodes].some((node) =>
      node instanceof Element && (
        node.matches(SIDEBAR_PANEL_SELECTOR) || Boolean(node.querySelector(SIDEBAR_PANEL_SELECTOR))
      ));
  };
  const sidebarPanelLifecycleMutation = (mutation) => {
    if (mutation.type !== "childList") return false;
    if (mutation.target instanceof Element && mutation.target.closest(SIDEBAR_PANEL_SELECTOR)) {
      return false;
    }
    return [...mutation.addedNodes, ...mutation.removedNodes].some((node) =>
      node instanceof Element && (
        node.matches(SIDEBAR_PANEL_SELECTOR) || Boolean(node.querySelector(SIDEBAR_PANEL_SELECTOR))
      )
    );
  };
  const mutationTouchesSidebarProjectPortal = (mutation) => {
    if (mutation.type !== "childList") return false;
    const touches = (node) => node instanceof Element && (
      (node.matches('[role="tooltip"]') && Boolean(node.querySelector(SIDEBAR_PROJECT_ROW_SELECTOR))) ||
      Boolean(node.querySelector(`[role="tooltip"] ${SIDEBAR_PROJECT_ROW_SELECTOR}`))
    );
    return [...mutation.addedNodes, ...mutation.removedNodes].some(touches);
  };
  const ROUTE_OBSERVER_DEEP_SELECTOR = [
    'main:is(.main-surface, [class*="_MainContentSurface_"])',
    SIDEBAR_PANEL_SELECTOR,
    '[role="main"]',
    '[data-codex-composer-root]',
    '[data-composer-surface-variant]',
    ".composer-surface-chrome",
  ].join(", ");
  const syncRouteObserverTargets = () => {
    if (!routeObserver || typeof document.querySelectorAll !== "function") return;
    const deepTargets = new Set([...document.querySelectorAll(ROUTE_OBSERVER_DEEP_SELECTOR)]
      .filter((node) => node instanceof Element && node.isConnected));
    const lifecycleTargets = new Set();
    if (document.body) lifecycleTargets.add(document.body);
    for (const target of deepTargets) {
      if (target.parentElement) lifecycleTargets.add(target.parentElement);
    }
    const sameTargets = (left, right) => left.size === right.size &&
      [...left].every((node) => right.has(node));
    if (sameTargets(deepTargets, routeObserverDeepTargets) &&
      sameTargets(lifecycleTargets, routeObserverLifecycleTargets)) return;
    routeObserver.disconnect();
    routeObserverDeepTargets = deepTargets;
    routeObserverLifecycleTargets = lifecycleTargets;
    for (const target of deepTargets) {
      routeObserver.observe(target, { childList: true, subtree: true });
    }
    for (const target of lifecycleTargets) {
      if (deepTargets.has(target)) continue;
      routeObserver.observe(target, { childList: true, subtree: false });
    }
  };

  const routeObserverTargetsNeedSync = (mutations) => {
    if ([...routeObserverDeepTargets, ...routeObserverLifecycleTargets]
      .some((node) => !(node instanceof Element) || !node.isConnected)) {
      return true;
    }
    /* Deep targets observe streamed message content. Only a direct child-list
       change on a lifecycle parent can replace one of those roots; avoiding a
       document query on every nested message mutation keeps the hot path
       proportional to actual component remounts. */
    return mutations.some((mutation) => mutation.type === "childList" &&
      routeObserverLifecycleTargets.has(mutation.target));
  };
  const mutationHasElementChange = (mutation) => mutation.type !== "childList" ||
    [...mutation.addedNodes, ...mutation.removedNodes].some((node) => node instanceof Element);
  const nodeBelongsToAssistantReply = (node) => {
    if (!(node instanceof Element)) return false;
    const row = node.closest("[data-content-search-unit-key]");
    if (!row) return false;
    if (row.matches(ASSISTANT_REPLY_SELECTOR)) return true;
    return isAssistantReplySpeaker(row.querySelector("h4.sr-only")?.textContent);
  };
  const mutationOnlyTouchesAssistantReply = (mutation) => {
    if (mutation.type !== "childList") return false;
    const changed = [...mutation.addedNodes, ...mutation.removedNodes];
    if (!changed.length) return false;
    return changed.every((node) => node instanceof Element
      ? nodeBelongsToAssistantReply(node)
      : nodeBelongsToAssistantReply(mutation.target));
  };
  const assistantReplyRowsFromMutations = (mutations) => {
    const rows = new Set();
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.removedNodes) {
        forgetExperienceChatSlotsFromSubtree(node);
      }
      const targetReply = assistantReplyFromNode(mutation.target);
      for (const node of [...mutation.addedNodes, ...mutation.removedNodes]) {
        const reply = assistantReplyFromNode(node) || targetReply;
        if (reply instanceof Element && reply.isConnected) rows.add(reply);
      }
    }
    return rows;
  };
  const assistantReplySubtreesFromMutations = (mutations) => {
    const roots = [];
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element) || !node.isConnected) continue;
        const isReplyDescendant = nodeBelongsToAssistantReply(node);
        const isChatRoot = node.matches(CHAT_REPLY_SUBTREE_SELECTOR) ||
          Boolean(node.querySelector(CHAT_REPLY_SUBTREE_SELECTOR));
        if (isReplyDescendant || isChatRoot) roots.push(node);
      }
    }
    return roots;
  };

  const scheduleInteractionRepair = (delay = 96, scope = true) => {
    if (window[DISABLED_KEY]) return;
    if (interactionRepairTimer) clearTimeout(interactionRepairTimer);
    interactionRepairTimer = setTimeout(() => {
      interactionRepairTimer = null;
      if (window[DISABLED_KEY] || !skinNeedsRepair()) return;
      scheduleEnsure({ root: true, scope }, 0);
    }, Math.max(0, delay));
  };
  const scheduleQuotaEnsure = (delay = 120) => {
    if (!isRendererVisible()) {
      backgroundRepairPending = true;
      return;
    }
    if (quotaScheduleTimer) clearTimeout(quotaScheduleTimer);
    quotaScheduleTimer = setTimeout(() => {
      quotaScheduleTimer = null;
      if (!isRendererVisible()) {
        backgroundRepairPending = true;
        return;
      }
      ensureQuota();
    }, delay);
  };
  const mutationTouchesPersistentHeaderUi = (mutation) => {
    if (mutation.type !== "childList") return false;
    const touchesPersistentUi = (node) => {
      if (!(node instanceof Element)) return false;
      if (PERSISTENT_HEADER_UI_IDS.has(node.id)) return true;
      for (const id of PERSISTENT_HEADER_UI_IDS) {
        if (node.querySelector(`#${id}`)) return true;
      }
      return false;
    };
    return [...mutation.addedNodes, ...mutation.removedNodes].some(touchesPersistentUi);
  };
  const ensureQuotaSurfaceObserver = () => {
    if (typeof MutationObserver !== "function") return;
    const header = findTaskHeader();
    const composer = document.querySelector(".composer-surface-chrome");
    if (quotaObserver && quotaObservedHeader === header && quotaObservedComposer === composer) return;
    quotaObserver?.disconnect();
    quotaObserver = null;
    quotaObservedHeader = header;
    quotaObservedComposer = composer;
    const hosts = [...new Set([header, composer].filter((node) => node?.isConnected))];
    if (!hosts.length) return;
    quotaObserver = new MutationObserver((mutations, observer) => {
      if (window[DISABLED_KEY]) return;
      if (!isRendererVisible()) {
        backgroundRepairPending = true;
        return;
      }
      const skinMode = document.documentElement?.getAttribute("data-dream-skin");
      if (!["active", "home-native"].includes(skinMode)) return;
      /* Sidebar width changes reshuffle native header slots without touching
         any injected surface. Ignore those mutations so a native rail toggle
         cannot synchronously rerun quota/theme layout work before paint. */
      const hostDisconnected = Boolean(
        (quotaObservedHeader && !quotaObservedHeader.isConnected) ||
        (quotaObservedComposer && !quotaObservedComposer.isConnected)
      );
      const persistentUiDetached = mutations.some(mutationTouchesPersistentHeaderUi) &&
        [...PERSISTENT_HEADER_UI_IDS].some((id) => {
          const cached = persistentHeaderUiNodes.get(id);
          return cached instanceof Element && !cached.isConnected;
        });
      if (!hostDisconnected && !persistentUiDetached) return;
      /* React can still be committing the destination header in this callback.
         Coalesce the repair after that commit instead of moving quota/theme
         nodes inside the native reconciliation turn. */
      observer.disconnect();
      if (quotaObserver === observer) quotaObserver = null;
      quotaObservedHeader = null;
      quotaObservedComposer = null;
      scheduleEnsure({ root: true }, 96);
    });
    hosts.forEach((host) => quotaObserver.observe(host, { childList: true, subtree: true }));
  };
  if (typeof MutationObserver === "function") {
    rootObserver = new MutationObserver((mutations) => {
      // A skin mode commit already applied its dependent styles. Do not
      // schedule another full repair 64ms later for our own attribute writes.
      // Native appearance changes and external removal/corruption still repair.
      const needsRepair = mutations.some((mutation) =>
        mutation.target !== document.documentElement ||
        !ownedRootAttributeWrites.has(mutation.attributeName) ||
        mutation.target.getAttribute(mutation.attributeName) !== ownedRootAttributeWrites.get(mutation.attributeName));
      ownedRootAttributeWrites.clear();
      if (needsRepair) scheduleEnsure({ root: true });
    });
    routeObserver = new MutationObserver((mutations) => withRouteSnapshot(() => {
      if (!isRendererVisible()) {
        backgroundRepairPending = true;
        return;
      }
      /* Streaming text produces Text-node-only child-list records. Route
         history hooks already own URL changes, and a text node cannot replace
         a tracked surface, so skip all route work for this hot-path batch. */
      if (!mutations.some(mutationHasElementChange)) return;
      const assistantReplyRows = assistantReplyRowsFromMutations(mutations);
      scheduleCharacterReplySubtreeRepair(assistantReplySubtreesFromMutations(mutations));
      /* A streamed assistant row may mount several small DOM fragments per
         response. Those fragments cannot replace the route shell, sidebar, or
         composer, so only coalesce the avatar repair instead of re-evaluating
         every route and layout guard for each batch. */
      if (mutations.every(mutationOnlyTouchesAssistantReply)) {
        scheduleCharacterReplyRepair(assistantReplyRows);
        return;
      }
      /* Some native route transitions update history before replacing the
         shared shell. Catch that transition even when the replacement does
         not touch one of the tracked anchor nodes. */
      let routeSignalDetected = false;
      if (typeof readRouteSignature === "function" &&
        readRouteSignature() !== routeUrlSignature) {
        routeChangeHandler();
        routeSignalDetected = true;
      }
      /* Settings uses the same app URL as the main shell. Its native
         "返回应用" action replaces the main content without changing
         history, so URL-only signals cannot see the transition. Once the
         settings markers disappear and a usable main surface is present,
         recompute the root immediately instead of waiting for the safety
         scheduler. */
      if (!routeSignalDetected && typeof rendererReadiness === "function") {
        const skinMode = document.documentElement?.getAttribute("data-dream-skin");
        const settingsLike = skinMode === "settings" || isSettingsRoute();
        if (settingsLike) {
          const readiness = rendererReadiness();
          const modeMismatch = readiness.ready &&
            Boolean(readiness.settings) !== (skinMode === "settings");
          if (modeMismatch) {
            routeChangeHandler();
            routeSignalDetected = true;
          }
        }
      }
      /* Rebind only when a tracked component root was replaced. The body
         lifecycle target remains child-list-only, so message text and image
         mounts no longer wake this route callback. */
      if (routeObserverTargetsNeedSync(mutations)) syncRouteObserverTargets();
      if (assistantReplyRows.size) {
        scheduleCharacterReplyRepair(assistantReplyRows);
      }
      if (mutations.some(sidebarPanelLifecycleMutation)) {
        /* Sidebar geometry and animation remain fully native. Only discard a
           project hover card whose anchor disappeared with the old rail. */
        discardSidebarProjectPortals();
        sidebarProjectHoverTarget = null;
      }
      const sidebarTouched = mutations.some(mutationTouchesSidebar);
      if (mutations.some(mutationTouchesSidebarProjectPortal) || sidebarTouched) {
        /* Radix may publish the portal before its floating geometry has
           settled. Re-anchor it after the same mutation turn as the native
           sidebar, so a stale transform cannot survive a project-list reflow. */
        scheduleSidebarProjectPortalRepair();
      }
      if (sidebarTouched) {
        syncSidebarOverlayState();
        ensureNativeSidebarToggle();
        ensureSidebarGreeting();
        ensureSidebarAccountCharacter();
      }
      const routeMutations = mutations.filter(routeMutationNeedsEnsure);
      if (!routeMutations.length) return;
      /* Collapsing/expanding the rail remounts only the sidebar in Codex
         26.803. Its global CSS applies immediately; running quota, composer,
          and route repairs here forces a second layout during the native rail
          transition and is the source of the visible hitch. Keep this path to
          sidebar-only state and character hooks. */
      if (routeMutations.every(sidebarMutationOnly)) {
        metrics.sidebarFastPaths += 1;
        /* A sidebar child-list batch was already repaired above. Attribute-
           only route mutations still need the lightweight pass once. */
        if (!sidebarTouched) {
          syncSidebarOverlayState();
          ensureNativeSidebarToggle();
          ensureSidebarGreeting();
          ensureSidebarAccountCharacter();
        }
        return;
      }
      /* Do not touch the outgoing Composer during the route commit. The CSS
         fallback already paints the stable native surface hooks while React
         replaces the dock; adding the semantic class here causes a second
         style/layout pass in the same frame and can make the editor blink. */
      const skinMode = document.documentElement?.getAttribute("data-dream-skin");
      if (["active", "home-native"].includes(skinMode)) {
        lockActiveThemeDuringRoute();
        /* MutationObserver callbacks run before the next paint. Marking the
           freshly mounted native loader here closes the one-frame window in
           which the intrinsic-height thread rule could collapse its stage. */
        if (findThreadLoadingRoot()) {
          ensureThreadLoadingStage();
        } else if (!rendererReadiness().ready) {
          document.documentElement?.setAttribute("data-dream-route-transition", "true");
          ensureThreadLoadingFallback();
        }
        /* The consolidated delayed route pass below owns the Composer,
           quota, header, and background widgets after the route commit. */
      }
      scheduleRouteEnsure(72);
    }));
    /* Summary footer rendering is intentionally disabled. Do not keep a
       document-wide observer alive for a no-op repair path. */
    summaryObserver = null;
    syncRouteObserverTargets();
  }
  quotaEventHandler = (event) => {
    const detail = event?.detail;
    const candidate = detail?.quota && typeof detail.quota === "object" ? detail.quota : detail;
    if (candidate && typeof candidate === "object") {
      const controlledState = normalizeQuotaState(candidate);
      if (controlledState) {
        const acceptedState = acceptQuotaSnapshot(controlledState);
        if (acceptedState) {
          const previous = quotaBridgeState?.status === "available"
            ? quotaBridgeState : readQuotaFromCache();
          reconcileQuotaReset(acceptedState, previous, Date.now());
          quotaBridgeState = acceptedState;
          quotaState = acceptedState;
          window.__CODEX_WEEKLY_QUOTA__ = acceptedState;
          window.__CODEX_QUOTA__ = acceptedState;
        }
      }
    }
    if (!quotaState || quotaState.status !== "available") quotaState = readQuotaState();
    writeQuotaCache(quotaState);
    syncExperienceResetState(quotaResetRadarSnapshot());
    if (!isRendererVisible()) {
      backgroundRepairPending = true;
      return;
    }
    /* Bridge responses may arrive while Codex is replacing a composer or
       processing a send. Let that native work settle before repainting the
       optional quota surfaces. */
    scheduleQuotaEnsure(80);
  };
  if (typeof window.addEventListener === "function") {
    window.addEventListener("codex:quota-update", quotaEventHandler);
  }
  quotaResetReconciliation = readQuotaResetReconciliation();
  quotaState = readQuotaState();
  if (quotaState?.status === "unavailable") {
    quotaState = { status: "loading", percentage: null };
  }
  quotaRadarState = readQuotaRadarCache();

  let mediaQuery = null;
  let mediaHandler = null;
  try {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaHandler = () => scheduleEnsure({ root: true });
  } catch {}

  const ROUTE_CHANGE_EVENT = "codex-dream-skin-route-change";
  const readRouteSignature = () => {
    const location = globalThis.location;
    if (!location) return "";
    return `${renderedPagePath()}|${location.pathname || ""}${location.search || ""}${location.hash || ""}`;
  };
  const routeChangeHandler = () => withRouteSnapshot(() => {
    if (window[DISABLED_KEY]) return;
    metrics.navigationEvents += 1;
    const nextRouteSignature = readRouteSignature();
    const routeChanged = nextRouteSignature !== routeUrlSignature;
    routeUrlSignature = nextRouteSignature;
    if (!isRendererVisible()) {
      backgroundRepairPending = true;
      return;
    }

    /* Archive and task navigation can synchronously unmount the header and
       composer. Do not add skin DOM work to that native transition; one short
       delayed pass still catches the replacement shell before it is noticed. */
    lockActiveThemeDuringRoute({ restart: routeChanged });
    const readiness = rendererReadiness();
    const utilityTransition = readiness.ready && (
      readiness.settings || document.documentElement?.getAttribute("data-dream-skin") === "settings"
    );
    if (utilityTransition) {
      // A memory-router commit is observed before paint. Apply its mode in
      // this turn so settings does not spend 72ms wearing the previous page.
      ensure({ root: true, scope: true });
    } else {
      scheduleRouteEnsure(72);
    }

    /* Native React routing can commit the replacement shell after the history
       event. Keep one bounded follow-up, but make it conditional so a healthy
       destination does not pay for a second complete repair. */
    if (routeFollowupTimer) clearTimeout(routeFollowupTimer);
    routeFollowupTimer = setTimeout(() => {
      routeFollowupTimer = null;
      if (!window[DISABLED_KEY] && routeRepairNeeded()) scheduleRouteEnsure(0);
    }, 260);
  });
  const installRouteHistoryHooks = () => {
    const historyApi = globalThis.history;
    if (!historyApi) return null;
    const restoreEntries = [];
    for (const method of ["pushState", "replaceState"]) {
      const original = historyApi[method];
      if (typeof original !== "function") continue;
      const wrapped = function (...args) {
        const previousRoute = readRouteSignature();
        const result = original.apply(this, args);
        if (readRouteSignature() !== previousRoute && typeof window.dispatchEvent === "function") {
          try { window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT)); } catch {}
        }
        return result;
      };
      try {
        historyApi[method] = wrapped;
      } catch {
        continue;
      }
      if (historyApi[method] === wrapped) restoreEntries.push({ method, original, wrapped });
    }
    return () => {
      for (const { method, original, wrapped } of restoreEntries) {
        if (historyApi[method] !== wrapped) continue;
        try { historyApi[method] = original; } catch {}
      }
    };
  };
  routeUrlSignature = readRouteSignature();
  routeHistoryRestore = installRouteHistoryHooks();
  const navigationApi = window.navigation && typeof window.navigation.addEventListener === "function"
    ? window.navigation : null;
  const navigationHandler = navigationApi ? routeChangeHandler : null;

  const updateExperienceNetwork = () => {
    const online = globalThis.navigator?.onLine;
    const network = online === false ? "offline" : online === true ? "online" : "unknown";
    dispatchExperienceEvent("NETWORK_CHANGED", { network });
    if (network === "offline") dispatchExperienceEvent("WORK_STATE_CHANGED", { work: "offline" });
    else if (experienceRuntimeState.work === "offline") {
      dispatchExperienceEvent("WORK_STATE_CHANGED", { work: "idle" });
    }
    if (!window[DISABLED_KEY]) scheduleEnsure({ root: true, scope: true }, 0);
  };
  networkOnlineHandler = updateExperienceNetwork;
  networkOfflineHandler = updateExperienceNetwork;
  if (typeof window.addEventListener === "function") {
    window.addEventListener("online", networkOnlineHandler);
    window.addEventListener("offline", networkOfflineHandler);
  }
  updateExperienceNetwork();

  /* Keep the injected UI as one component system even though the renderer
     bundle is still emitted as a single file. These are ownership contracts,
     not a second layout engine: existing ensure/remove functions remain the
     source of truth, while each boundary exposes its roots and lifecycle for
     diagnostics and future extraction into source modules. */
  const LayoutTokens = Object.freeze({
    version: COMPONENT_BOUNDARY_VERSION,
    header: Object.freeze({
      selector: TASK_HEADER_SELECTOR,
      track: "centered-fixed",
      height: 36,
      gap: 8,
      zIndex: 40,
    }),
    composer: Object.freeze({
      selector: COMPOSER_CHARACTER_SELECTOR,
      gap: 8,
      radius: 24,
      quotaAnchor: "permissions",
    }),
    sidebar: Object.freeze({
      selector: SIDEBAR_PANEL_SELECTOR,
      rail: "native",
      footer: "account-greeting",
    }),
    overlay: Object.freeze({
      zIndex: 2147483000,
      viewportPadding: 12,
      openOnly: true,
    }),
  });

  const overlayBoundarySelector = [
    "#codex-quota-popover",
    "#codex-model-radar-popover",
    "#codex-background-switcher-menu",
    "#codex-quota-panel",
    "#codex-quota-composer-portal",
  ].join(", ");

  const boundaryRoots = {
    HeaderExperienceGroup: () => {
      const header = findTaskHeader();
      const group = header?.querySelector?.(`[${EXPERIENCE_HEADER_GROUP_ATTR}="true"]`);
      return [header, group].filter((node) => node instanceof Element && node.isConnected);
    },
    ComposerDock: () => [...document.querySelectorAll(COMPOSER_CHARACTER_SELECTOR)]
      .filter((node) => node instanceof Element && node.isConnected),
    SidebarFooter: () => [...document.querySelectorAll(SIDEBAR_PANEL_SELECTOR)]
      .filter((node) => node instanceof Element && node.isConnected),
    OverlayManager: () => [...document.querySelectorAll(overlayBoundarySelector)]
      .filter((node) => node instanceof Element && node.isConnected),
    MutationRouter: () => [...new Set([
      ...routeObserverDeepTargets,
      ...routeObserverLifecycleTargets,
    ])].filter((node) => node instanceof Element && node.isConnected),
  };

  const syncComponentBoundaries = () => {
    if (!componentBoundaryDirty && componentBoundarySnapshot) {
      return componentBoundarySnapshot;
    }
    const next = new Map();
    const mark = (node, name) => {
      if (!(node instanceof Element) || !node.isConnected) return;
      let names = next.get(node);
      if (!names) {
        names = new Set();
        next.set(node, names);
      }
      names.add(name);
    };
    for (const [name, roots] of Object.entries(boundaryRoots)) {
      for (const root of roots()) mark(root, name);
    }
    for (const node of componentBoundaryNodes) {
      if (!next.has(node)) node.removeAttribute(COMPONENT_BOUNDARY_ATTR);
    }
    for (const [node, names] of next) {
      const value = [...names].join(" ");
      if (node.getAttribute(COMPONENT_BOUNDARY_ATTR) !== value) {
        node.setAttribute(COMPONENT_BOUNDARY_ATTR, value);
      }
    }
    componentBoundaryNodes = new Set(next.keys());
    const counts = {};
    for (const names of next.values()) {
      for (const name of names) counts[name] = (counts[name] || 0) + 1;
    }
    componentBoundarySnapshot = Object.freeze({
      version: COMPONENT_BOUNDARY_VERSION,
      counts: Object.freeze(counts),
      totalRoots: next.size,
    });
    componentBoundaryDirty = false;
    return componentBoundarySnapshot;
  };

  const commitComponentBoundaryIfIdle = () => {
    if (componentBoundaryTransactionDepth > 0) return componentBoundarySnapshot;
    return syncComponentBoundaries();
  };

  componentBoundaries = Object.freeze({
    HeaderExperienceGroup: Object.freeze({
      name: "HeaderExperienceGroup",
      selector: TASK_HEADER_SELECTOR,
      roots: boundaryRoots.HeaderExperienceGroup,
      ensure: () => {
        markComponentBoundaryDirty();
        ensureRecommendationHeader();
        ensureBackgroundSwitcher();
        return commitComponentBoundaryIfIdle();
      },
      remove: () => {
        markComponentBoundaryDirty();
        removeModelRadarDom();
        removeBackgroundSwitcher();
        return commitComponentBoundaryIfIdle();
      },
    }),
    ComposerDock: Object.freeze({
      name: "ComposerDock",
      selector: COMPOSER_CHARACTER_SELECTOR,
      roots: boundaryRoots.ComposerDock,
      ensure: () => {
        markComponentBoundaryDirty();
        ensureComposerSurfaceChrome();
        return commitComponentBoundaryIfIdle();
      },
      remove: () => {
        markComponentBoundaryDirty();
        removeComposerSurfaceChromeRepair();
        return commitComponentBoundaryIfIdle();
      },
    }),
    SidebarFooter: Object.freeze({
      name: "SidebarFooter",
      selector: SIDEBAR_PANEL_SELECTOR,
      roots: boundaryRoots.SidebarFooter,
      ensure: () => {
        markComponentBoundaryDirty();
        ensureSidebarGreeting();
        ensureNativeSidebarToggle();
        ensureSidebarAccountCharacter();
        return commitComponentBoundaryIfIdle();
      },
      remove: () => {
        markComponentBoundaryDirty();
        removeSidebarGreeting();
        removeNativeSidebarToggle();
        return commitComponentBoundaryIfIdle();
      },
    }),
    OverlayManager: Object.freeze({
      name: "OverlayManager",
      selector: overlayBoundarySelector,
      roots: boundaryRoots.OverlayManager,
      ensure: () => {
        markComponentBoundaryDirty();
        ensureQuotaSurfaceObserver();
        return commitComponentBoundaryIfIdle();
      },
      remove: () => {
        markComponentBoundaryDirty();
        quotaObserver?.disconnect();
        quotaObserver = null;
        quotaObservedHeader = null;
        quotaObservedComposer = null;
        return commitComponentBoundaryIfIdle();
      },
    }),
    ResizeCoordinator: Object.freeze({
      name: "ResizeCoordinator",
      subscribe: resizeCoordinator.subscribe,
      snapshot: resizeCoordinator.snapshot,
      dispose: resizeCoordinator.dispose,
    }),
    MutationRouter: Object.freeze({
      name: "MutationRouter",
      observer: () => routeObserver,
      roots: boundaryRoots.MutationRouter,
      syncTargets: syncRouteObserverTargets,
    }),
    LayoutTokens,
    sync: syncComponentBoundaries,
  });

  window[STATE_KEY] = {
    ensure,
    cleanup,
    refreshQuotaFromBridge,
    refreshQuotaRadar,
    refreshTiboRadar,
    refreshModelRadar,
    rootObserver,
    quotaObserver,
    routeObserver,
    resizeCoordinator,
    components: componentBoundaries,
    componentSnapshot: syncComponentBoundaries,
    timer: null,
    quotaPollTimer: null,
    quotaRadarTimer: null,
    tiboRadarTimer: null,
    modelRadarTimer: null,
    scheduler,
    mediaQuery,
    mediaHandler,
    navigation: navigationApi,
    navigationHandler,
    routeSignalHandler: routeChangeHandler,
    routeHistoryRestore,
    artUrl,
    backgroundVariants,
    activeBackgroundVariantId: () => activeBackgroundVariantId,
    activeThemeOption: () => activeThemeOption()?.id || NATIVE_THEME_ID,
    setActiveBackgroundVariant,
    setActiveThemeOption,
    quotaDiagnostics: Object.freeze({
      normalize: (candidate) => normalizeQuotaState(candidate),
      windowKind: (minutes, label) => quotaWindowKind(Number(minutes), label),
      windowLabel: (minutes, label) => quotaWindowLabel(Number(minutes), label),
      snapshot: () => ({ quotaState, quotaRadarState, tiboRadarState }),
      resetReconciliation: () => ({ ...(quotaResetReconciliation || {}) }),
      deriveResetReconciliation: (current, previous, baseline, now) =>
        deriveQuotaResetReconciliation(current, previous, baseline, Number(now) || Date.now()),
      parseRadarPayload: (payload) => parseQuotaRadarPayload(payload),
      parseTiboPayload: (payload) => parseTiboXPayload(payload),
      classifyTiboPost: (post) => classifyTiboXPost(post),
      resolveReset: (direct, radar, cached, now) =>
        resolveResetRadarState(direct, radar, cached, Number(now) || Date.now()),
      resetSnapshot: () => quotaResetRadarSnapshot(),
      readResetDecisionCache: () => readResetDecisionCache(),
    }),
    petUrl,
    sidebarCompanionUrl,
    sidebarAccountAvatarUrl,
    chatAvatarUrl,
    composerCompanionUrl,
    tiboAvatarUrl,
    installToken,
    styleMode,
    styleNode,
    styleSheet,
    styleRevision: STYLE_REVISION,
    analysis: artAnalysis,
    artMetadata: ART_METADATA,
    scope: null,
    selectorsSchema: SELECTOR_CONTRACT.schema,
    metrics,
    version: VERSION,
    themeId: THEME.id || "custom",
    experienceId: EXPERIENCE?.id || "default-experience",
    experience: EXPERIENCE,
    experienceStore,
    experienceState: () => experienceStore.getState(),
    experienceViewModel: () => experienceStore.getViewModel(),
    dispatchExperienceEvent,
    revision: PAYLOAD_REVISION,
    detectShellAppearance,
  };
  const firstEnsureStartedAt = now();
  const initiallyVisible = syncRendererVisibilityState();
  let initialScope = null;
  if (initiallyVisible) {
    ensure({ root: true });
    ensureQuotaSystemClock();
    void hydrateOptionalAssets().catch(() => {});
    scheduleBackgroundVariantPreload();
    /* Seed the existing thread immediately; the body observer below repairs
       assistant rows that Codex mounts later or replaces while streaming. */
    ensureCharacterVariants({ includeReplies: true, fullScan: true });
    scheduleMoodRotation();
    initialScope = refreshScope();
  } else {
    backgroundRepairPending = true;
  }
  metrics.firstEnsureMs = Number((now() - firstEnsureStartedAt).toFixed(3));

  if (rootObserver) {
    const rootAttributes = [
      "class", "data-theme", "data-appearance", "data-color-mode",
      "data-dream-skin", SHELL_ATTR,
      "data-dream-background-variant", "data-dream-background-switching",
      "data-dream-art-wide", "data-dream-art-safe", "data-dream-task-mode",
      "data-dream-art-safe-area", "data-dream-art-task-mode", "data-dream-art-aspect",
      "data-dream-art-ready", "data-dream-home-ready", "data-dream-work-state",
      "data-dream-window-hidden",
    ];
    const shellAttributes = ["class", "data-theme", "data-appearance", "data-color-mode"];
    const observeAttributes = (node, attributes) => {
      if (!node) return;
      rootObserver.observe(node, {
        attributes: true,
        attributeFilter: attributes,
      });
    };
    observeAttributes(document.documentElement, rootAttributes);
    if (document.body) observeAttributes(document.body, shellAttributes);
    else if (typeof document.addEventListener === "function") {
      bodyReadyHandler = () => {
        if (window[DISABLED_KEY]) return;
        observeAttributes(document.body, shellAttributes);
        syncRouteObserverTargets();
      };
      document.addEventListener("DOMContentLoaded", bodyReadyHandler, { once: true });
    }
  }
  /* Thread rows are native React buttons. Their route can be replaced without
     changing history or touching a tracked main anchor, so the normal route
     observer may only see a sidebar-only mutation. Capture the navigation
     gesture before React handles it and freeze the active skin for the whole
     commit. Project rows only expand/collapse the sidebar; treating those as
     route changes creates an unnecessary paint/layout transition. */
  const previousProjectNavigationLockHandler = globalThis[PROJECT_NAVIGATION_LOCK_KEY];
  if (typeof previousProjectNavigationLockHandler === "function") {
    document.removeEventListener("pointerdown", previousProjectNavigationLockHandler, true);
    document.removeEventListener("keydown", previousProjectNavigationLockHandler, true);
  }
  projectNavigationLockHandler = (event) => {
    /* Cleanup removes the previous listener in the normal path, but Chromium
       can still deliver an already queued event to that old closure. Only the
       handler currently registered in the global slot may touch the skin. */
    if (globalThis[PROJECT_NAVIGATION_LOCK_KEY] !== projectNavigationLockHandler) return;
    const target = event?.target;
    if (!(target instanceof Element)) return;
    if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
    if (target.closest("button, [data-sidebar-project-drop-zone]")) return;
    const row = target.closest('[role="button"][data-app-action-sidebar-thread-row]');
    if (!(row instanceof Element) || row.getAttribute("aria-disabled") === "true") return;
    if (row.getAttribute("data-app-action-sidebar-thread-selected") === "true") return;
    if (lockActiveThemeDuringRoute()) scheduleRouteEnsure(72);
  };
  globalThis[PROJECT_NAVIGATION_LOCK_KEY] = projectNavigationLockHandler;
  pointerRepairHandler = (event) => {
    const target = event?.target;
    if (!(target instanceof Element)) return;
    if (target.closest(NATIVE_SIDEBAR_TOGGLE_SELECTOR)) return;
    const sidebarTarget = target.closest(SIDEBAR_PANEL_SELECTOR);
    const shellTarget = target.closest(
      `${SIDEBAR_PANEL_SELECTOR}, ${TASK_HEADER_SELECTOR}, [data-testid="home-icon"]`,
    );
    /* Pointer events fire for every message control, editor keystroke helper,
       and toolbar action. Only native shell interactions need a repair pass;
       keeping the general document path free avoids timer churn and layout
       work directly after ordinary clicks. */
    if (!shellTarget) return;
    /* Project/workspace folders can add many nodes at once. They already use
       Codex's own state management, so a root repair on both pointer phases
       only competes with the folder layout and makes the rail feel sticky.
       Reserve the delayed check for the actual hide/show control. */
    if (sidebarTarget) return;
    scheduleInteractionRepair(220, false);
  };
  sidebarProjectPointerHandler = (event) => {
    const target = event?.target;
    if (!(target instanceof Element)) return;
    if (event.type === "pointerover" &&
      target.closest('aside[data-testid="app-shell-floating-left-panel"]')) {
      const account = findSidebarAccountButton();
      if (!account?.matches(`[${CHARACTER_STYLE_ATTR}="${FIXED_CHARACTER_STYLES.account}"]`)) {
        ensureSidebarAccountCharacter();
      }
    }
    const trigger = target.closest(SIDEBAR_PROJECT_TRIGGER_SELECTOR);
    const portal = target.closest('[role="tooltip"]');
    if (event.type === "pointerover") {
      if (isSidebarProjectTrigger(trigger)) {
        sidebarProjectHoverTarget = trigger;
        scheduleSidebarProjectPortalRepair(32);
      } else if (portal?.querySelector(SIDEBAR_PROJECT_ROW_SELECTOR)) {
        scheduleSidebarProjectPortalRepair(0);
      }
      return;
    }
    if (event.type === "pointerout") {
      const related = event.relatedTarget;
      if (related instanceof Element && (
        related.closest(SIDEBAR_PROJECT_TRIGGER_SELECTOR) ||
        related.closest('[role="tooltip"]')
      )) return;
      if (sidebarProjectHoverTarget === trigger) sidebarProjectHoverTarget = null;
    }
  };
  focusRepairHandler = (event) => {
    const target = event?.target;
    if (!(target instanceof Element)) return;
    if (target.closest(NATIVE_SIDEBAR_TOGGLE_SELECTOR)) return;
    const sidebarTarget = target.closest(SIDEBAR_PANEL_SELECTOR);
    const shellTarget = target.closest(
      `${SIDEBAR_PANEL_SELECTOR}, ${TASK_HEADER_SELECTOR}, [data-testid="home-icon"]`,
    );
    if (!shellTarget || sidebarTarget) return;
    scheduleInteractionRepair(180, false);
  };
  const quotaComposerRingIsVisible = () => {
    if (document.visibilityState !== "visible") return false;
    const ring = document.getElementById("codex-quota-ring-composer");
    if (!(ring instanceof HTMLElement) || !ring.isConnected || ring.hidden) return false;
    if (ring.getAttribute("aria-hidden") === "true") return false;
    /* This timer runs while the app is idle. The composer is sticky in the
       visible renderer, and its portal exposes explicit hidden state, so a
       geometry read here only creates a periodic jank source. */
    return ring.closest('#codex-quota-composer-portal[data-state="hidden"]') === null;
  };
  const quotaSurfaceIsVisible = () => {
    if (nativeThemeSelected || !experienceCapabilityEnabled("quota")) return false;
    /* The composer ring is a live quota surface even when its detail card is
       closed. Keep it on the foreground refresh cadence so the input chrome
       cannot sit on a stale cached percentage for the background interval. */
    return quotaDetailSurfaceIsVisible() || quotaComposerRingIsVisible();
  };
  const stopExperienceScheduler = () => {
    if (experienceSchedulerTimer !== null) clearTimeout(experienceSchedulerTimer);
    experienceSchedulerTimer = null;
    if (window[STATE_KEY]) window[STATE_KEY].timer = null;
  };
  const scheduleExperienceScheduler = (delay = EXPERIENCE_SCHEDULER_TICK_MS) => {
    if (window[DISABLED_KEY] || document.visibilityState !== "visible") {
      stopExperienceScheduler();
      return;
    }
    if (experienceSchedulerTimer !== null) return;
    experienceSchedulerTimer = setTimeout(() => {
      experienceSchedulerTimer = null;
      try {
        runExperienceScheduler();
      } catch {
        /* A transient DOM teardown must not permanently disable the shared
           scheduler; the next visible tick will retry after the shell settles. */
        scheduleExperienceScheduler();
      }
    }, Math.max(0, delay));
    if (window[STATE_KEY]) window[STATE_KEY].timer = experienceSchedulerTimer;
  };
  const resetExperienceSchedulerDeadlines = (now = Date.now()) => {
    experienceSchedulerNext.safety = now + EXPERIENCE_SCHEDULER_SAFETY_MS;
    experienceSchedulerNext.quota = now + (quotaSurfaceIsVisible()
      ? QUOTA_REFRESH_MS : QUOTA_BACKGROUND_REFRESH_MS);
    experienceSchedulerNext.session = now + SESSION_TOKEN_VIEW_REFRESH_MS;
    experienceSchedulerNext.quotaRadar = now + QUOTA_RADAR_REFRESH_MS;
    experienceSchedulerNext.tiboRadar = now + TIBO_X_REFRESH_MS;
    experienceSchedulerNext.modelRadar = now + MODEL_RADAR_REFRESH_MS;
  };
  const runVisibleSessionTokenRefresh = () => {
    if (!quotaSurfaceIsVisible()) return;
    const visibleSurfaces = [...document.querySelectorAll("#codex-quota-popover, #codex-quota-panel")]
      .filter((surface) => {
        if (!surface.isConnected) return false;
        const style = getComputedStyle(surface);
        const rect = surface.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" &&
          rect.width > 0 && rect.height > 0;
      });
    for (const surface of visibleSurfaces) updateSessionTokenView(surface);
  };
  const runExperienceScheduler = () => {
    if (window[DISABLED_KEY] || document.visibilityState !== "visible") {
      stopExperienceScheduler();
      return;
    }
    const current = Date.now();
    if (current >= experienceSchedulerNext.safety) {
      metrics.safetyPasses += 1;
      ensure({ root: true });
      experienceSchedulerNext.safety = current + EXPERIENCE_SCHEDULER_SAFETY_MS;
    }
    if (current >= experienceSchedulerNext.quota) {
      const detailVisible = quotaSurfaceIsVisible();
      if (detailVisible) {
        quotaState = readQuotaState();
        ensureQuota();
      }
      void refreshQuotaFromBridge();
      experienceSchedulerNext.quota = current + (detailVisible
        ? QUOTA_REFRESH_MS : QUOTA_BACKGROUND_REFRESH_MS);
    }
    if (current >= experienceSchedulerNext.session) {
      runVisibleSessionTokenRefresh();
      experienceSchedulerNext.session = current + SESSION_TOKEN_VIEW_REFRESH_MS;
    }
    if (current >= experienceSchedulerNext.quotaRadar) {
      if (quotaSurfaceIsVisible()) void refreshQuotaRadar();
      experienceSchedulerNext.quotaRadar = current + QUOTA_RADAR_REFRESH_MS;
    }
    if (current >= experienceSchedulerNext.tiboRadar) {
      if (quotaSurfaceIsVisible()) void refreshTiboRadar();
      experienceSchedulerNext.tiboRadar = current + TIBO_X_REFRESH_MS;
    }
    if (current >= experienceSchedulerNext.modelRadar) {
      if (experienceHeaderSlotEnabled("recommendation")) void refreshModelRadar();
      experienceSchedulerNext.modelRadar = current + MODEL_RADAR_REFRESH_MS;
    }
    scheduleExperienceScheduler();
  };
  const startExperienceScheduler = ({ reset = false } = {}) => {
    if (reset || !experienceSchedulerNext.safety) resetExperienceSchedulerDeadlines();
    scheduleExperienceScheduler();
  };
  const clearVisibilityResumeWork = () => {
    for (const timer of visibilityResumeTimers) clearTimeout(timer);
    visibilityResumeTimers.clear();
  };
  const queueVisibleResumeWork = (delay, work) => {
    const timer = setTimeout(() => {
      visibilityResumeTimers.delete(timer);
      if (window[DISABLED_KEY] || !isRendererVisible()) return;
      try { work(); } catch {}
    }, Math.max(0, delay));
    visibilityResumeTimers.add(timer);
  };
  const scheduleVisibleOptionalRefreshes = ({ requireSurface = true } = {}) => {
    queueVisibleResumeWork(180, () => {
      if (experienceCapabilityEnabled("quota") &&
        (!requireSurface || quotaSurfaceIsVisible())) {
        void refreshQuotaFromBridge();
      }
    });
    queueVisibleResumeWork(520, () => {
      if (experienceCapabilityEnabled("quota") &&
        (!requireSurface || quotaSurfaceIsVisible())) {
        void refreshQuotaRadar();
      }
    });
    queueVisibleResumeWork(860, () => {
      if (experienceCapabilityEnabled("quota") &&
        (!requireSurface || quotaSurfaceIsVisible())) {
        void refreshTiboRadar();
      }
    });
    queueVisibleResumeWork(1200, () => {
      if (experienceHeaderSlotEnabled("recommendation")) void refreshModelRadar();
    });
  };
  const resumeVisibleRendererWork = () => {
    clearVisibilityResumeWork();
    if (window[DISABLED_KEY] || !isRendererVisible()) return;
    const needsScopeRepair = backgroundRepairPending;
    backgroundRepairPending = false;
    rootObserver?.takeRecords();
    routeObserver?.takeRecords();
    quotaObserver?.takeRecords();
    ensureQuotaSystemClock();
    void hydrateOptionalAssets().catch(() => {});
    scheduleMoodRotation();
    scheduleEnsure({ root: true, scope: needsScopeRepair }, 0);
    if (pendingCharacterReplySubtrees.size) scheduleCharacterReplySubtreeRepair();
    quotaSystemClockRuntime?.tick();
    /* The earning clock intentionally pauses while hidden. Render once on the
       foreground edge so its value and visible flip cards do not wait for the
       next interval tick after a long background period. */
    threadEarningRuntime?.tick();
    scheduleSidebarProjectPortalRepair(0);
    /* Let the native shell paint before each optional data refresh. A single
       foreground event previously launched all of these requests together,
       which could freeze an older Electron renderer after a long background
       interval. */
    scheduleVisibleOptionalRefreshes();
    startExperienceScheduler({ reset: true });
  };
  visibilityRepairHandler = () => {
    if (syncRendererVisibilityState()) {
      resumeVisibleRendererWork();
      return;
    }
    backgroundRepairPending = true;
    clearVisibilityResumeWork();
    if (scheduler.timeout) clearTimeout(scheduler.timeout);
    scheduler.timeout = null;
    scheduler.root = false;
    scheduler.scope = false;
    if (interactionRepairTimer) clearTimeout(interactionRepairTimer);
    interactionRepairTimer = null;
    if (characterReplyRepairTimer) clearTimeout(characterReplyRepairTimer);
    if (characterReplySubtreeRepairTimer) clearTimeout(characterReplySubtreeRepairTimer);
    characterReplyRepairTimer = null;
    characterReplySubtreeRepairTimer = null;
    pendingCharacterReplyRows.clear();
    if (moodRotationTimer) clearInterval(moodRotationTimer);
    moodRotationTimer = null;
    rootObserver?.takeRecords();
    routeObserver?.takeRecords();
    quotaObserver?.takeRecords();
    quotaSystemClockRuntime?.stop?.();
    stopExperienceScheduler();
  };
  resizeRepairHandler = () => {
    if (!isRendererVisible()) {
      backgroundRepairPending = true;
      return;
    }
    /* Window maximize/restore emits a burst of resize events. Keep this path
       deliberately light while the native flex shell is settling: a full
       skin pass reads several layout surfaces and makes sidebar expansion
       feel sticky. Only refresh the small pieces whose containing blocks can
       actually move after the final resize tick. */
    if (resizeRepairTimer) clearTimeout(resizeRepairTimer);
    invalidateSidebarGreetingSize();
    document.documentElement?.setAttribute("data-dream-resizing", "true");
    resizeRepairTimer = setTimeout(() => {
      resizeRepairTimer = null;
      if (window[DISABLED_KEY]) return;
      document.documentElement?.removeAttribute("data-dream-resizing");
      ensureComposerSurfaceChrome();
      ensureNativeSidebarToggle();
      ensureSidebarGreeting();
      if (findSidebarProjectPortals().size) scheduleSidebarProjectPortalRepair(0);
      const skin = document.documentElement?.getAttribute("data-dream-skin");
      if (skin === "active" || skin === "home-native") {
        scheduleQuotaEnsure(0);
      }
    }, 240);
  };
  if (typeof document.addEventListener === "function") {
    document.addEventListener("pointerdown", projectNavigationLockHandler, true);
    document.addEventListener("keydown", projectNavigationLockHandler, true);
    document.addEventListener("pointerover", sidebarProjectPointerHandler, true);
    document.addEventListener("pointerout", sidebarProjectPointerHandler, true);
    document.addEventListener("pointerdown", pointerRepairHandler, true);
    document.addEventListener("pointerup", pointerRepairHandler, true);
    document.addEventListener("focusin", focusRepairHandler, true);
    document.addEventListener("visibilitychange", visibilityRepairHandler);
  }
  if (typeof window.addEventListener === "function") {
    resizeCoordinatorCleanup = resizeCoordinator.subscribe(resizeRepairHandler);
  }
  if (initiallyVisible) {
    scheduleSidebarProjectPortalRepair(0);
    clearVisibilityResumeWork();
    scheduleVisibleOptionalRefreshes({ requireSurface: false });
    resetExperienceSchedulerDeadlines();
    startExperienceScheduler();
  } else {
    /* A hot reapply can run while Electron keeps the page backgrounded. The
       optional scheduler stays paused, but the root wallpaper/skin contract
       must still be restored so the first visible frame is not native. */
    ensure({ root: true });
  }
  if (mediaHandler && mediaQuery && typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", mediaHandler);
  }
  if (typeof window.addEventListener === "function") {
    window.addEventListener(ROUTE_CHANGE_EVENT, routeChangeHandler);
    window.addEventListener("popstate", routeChangeHandler);
    window.addEventListener("hashchange", routeChangeHandler);
  }
  if (navigationHandler && navigationApi) {
    navigationApi.addEventListener("navigate", navigationHandler);
  }
  const analysisPromise = artAnalysis ? Promise.resolve(null) : analyzeArt();
  window[STATE_KEY].analysisTimer = analysisTimer;
  analysisPromise.then((analysis) => {
    const state = window[STATE_KEY];
    if (!analysis || state?.installToken !== installToken || window[DISABLED_KEY]) return;
    artAnalysis = analysis;
    state.analysis = analysis;
    if (typeof THEME.artKey === "string") {
      analysisCache.set(THEME.artKey, analysis);
      while (analysisCache.size > 8) analysisCache.delete(analysisCache.keys().next().value);
    }
    ensure({ root: true });
  }).catch(() => {});
  return {
    installed: true,
    version: VERSION,
    themeId: THEME.id || "custom",
    revision: PAYLOAD_REVISION,
    shell: resolvedShell(),
    scope: initialScope,
    styleMode,
    analysis: artAnalysis,
  };
})(__DREAM_SKIN_CSS_JSON__, __DREAM_SKIN_ART_JSON__, __DREAM_SKIN_BACKGROUND_VARIANTS_JSON__, __DREAM_SKIN_PET_JSON__, __DREAM_SKIN_SIDEBAR_COMPANION_JSON__, __DREAM_SKIN_SIDEBAR_ACCOUNT_AVATAR_JSON__, __DREAM_SKIN_COMPOSER_COMPANION_JSON__, __DREAM_SKIN_TIBO_AVATAR_JSON__, __DREAM_SKIN_THEME_JSON__, __DREAM_SKIN_LAZY_ASSET_MANIFEST_JSON__)
