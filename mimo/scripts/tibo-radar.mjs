/**
 * Tibo reset radar (MiMo port)
 * ---------------------------------------------------------------------------
 * 从 Node 侧抓取 https://x.com/thsottiaux 公开页，解析时间线并分类额度重置信号。
 * 数据源与分类规则对齐 Codex 版的 parseTiboXPayload / classifyTiboXPost。
 * 渲染层无法直接 fetch x.com（CORS），所以必须在注入器进程完成。
 */

const TIBO_X_URL = 'https://x.com/thsottiaux';
const TIBO_X_REQUEST_TIMEOUT_MS = 15000;
const TIBO_X_TIMELINE_POST_LIMIT = 36;
const STORAGE_KEY = 'mimo-dream-tibo-radar';
const CLASSIFIER_VERSION = 10;
const CACHE_MAX_AGE_MS = 60 * 60 * 1000;
const STALE_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const RELEVANCE_RANK = Object.freeze({
  none: 0, indirect: 1, likely: 2, direct: 3, official: 4, confirmed: 5,
});

export const resetRadarLevel = (probability) =>
  probability >= 75 ? 'high' : probability >= 40 ? 'medium' : 'low';

export const resetRadarLevelLabel = (level) =>
  level === 'high' ? '偏高' : level === 'medium' ? '中等' : '偏低';

export function classifyTiboXPost(post) {
  const text = String(post?.text || '');
  const context = /(?:codex|chatgpt|\busage\b|rate\s+limits?|quota|paid\s+subscriptions?)/i.test(text);
  const resetMention = /\bresets?(?:ting)?\b/i.test(text);
  const bankedReset = /\bbanked\s+resets?\b/i.test(text);
  const planningIntent = /\bwhat\s+(?:should|could)\s+(?:we|i)\s+(?:ship|release|launch|build|announce)\b[\s\S]{0,56}\bnext\s+week\b/i.test(text) ||
    /\b(?:ship|release|launch|build|announce)\b[\s\S]{0,40}\bnext\s+week\b/i.test(text);
  const feedbackIntent = context && (
    /\bfeedback\b/i.test(text) && /\b(?:codex|chatgpt)\b/i.test(text)
  );
  const announcementIntent = context && !feedbackIntent && (
    /\b(?:now\s+available|available\s+now|is\s+live|launched?|released?|rolling\s+out|introducing)\b/i.test(text)
  );
  const completedResetWording = /(?:(?:i|we)(?:(?:\s+(?:have|has)|['’]ve)\s+(?:(?:now|just|already)\s+)?reset|\s+(?:now|just|already)\s+reset)|(?:usage|quota|(?:usage\s+|rate\s+)?limits?|paid\s+subscriptions?)\s+(?:have|has|were|was|are|is)\s+(?:(?:now|just|already)\s+)?(?:been\s+)?reset|(?:the\s+)?reset\s+(?:is|has|was)?\s*(?:(?:now|just|already)\s+)?(?:done|complete(?:d)?|finished|live|landed))/i;
  const globalResetConfirmation = /\ball\s+reset\s+for\s+everyone\b/i.test(text) ||
    /\beveryone(?:['’]s)?\s+(?:codex\s+|chatgpt\s+|usage\s+|quota\s+|rate\s+limits?\s+)?(?:has|have|was|were|is|are)?\s*(?:been\s+)?reset\b/i.test(text);
  const confirmedReset = !bankedReset && (
    globalResetConfirmation || (context && resetMention && completedResetWording.test(text))
  );
  const milestoneReset = /\b(?:crossed|crossing|passed|past|reached|hit|blew\s+past)\b[\s\S]{0,56}\b\d+(?:\.\d+)?\s*[mk]\b/i.test(text) &&
    /\bresets?\b/i.test(text);
  const imminentReset = /\b(?:landing|coming|happening|arriving|rolling\s+out)\b[\s\S]{0,64}(?:\b(?:in|within)\s+(?:the\s+)?next\s+(?:\d+(?:\.\d+)?\s+)?hours?\b|\bsoon\b|\btoday\b|\btomorrow\b)/i.test(text);
  const dashboardMilestoneReset = /\bdashboard\b[\s\S]{0,72}\b(?:hit|reach|reached|cross|crossed)\b[\s\S]{0,48}\b(?:a\s+)?new\s+milestone\b[\s\S]{0,72}\b(?:today|tomorrow|soon)\b[\s\S]{0,64}\b(?:hold\s+on\s+to|hang\s+on\s+to|keep)\s+(?:your\s+)?codex\b/i.test(text);
  const relativeScheduledReset = /\b(?:in|within)\s+(?:the\s+)?next\s+(?:\d+(?:\.\d+)?\s+)?hours?(?:\s+or\s+so)?\b/i.test(text) &&
    /\bresets?\b/i.test(text);
  const scheduledReset = relativeScheduledReset ||
    /\b(?:another|one\s+more|next|additional|again)\s+(?:performative\s+)?reset\b[\s\S]{0,64}\b(?:on|by|this|next)\s+(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?|the\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}[/-]\d{1,2})\b/i.test(text);
  const officialMilestoneReset = milestoneReset && imminentReset;
  const promisedReset = /\b(?:will|going\s+to|about\s+to|plan(?:ning)?\s+to)\s+(?:(?:do|perform|carry\s+out)\s+(?:a\s+|another\s+|the\s+)?(?:global\s+|full\s+)?|be\s+)?reset\b/i.test(text) ||
    /\breset\s+(?:will\s+)?(?:land|arrive|happen|roll\s+out)\b/i.test(text) ||
    /\bresetting\s+(?:the\s+)?(?:usage\s+)?limits?\b/i.test(text);
  // 「a reset is also landing by midnight today」这类句式：reset + landing + 时间
  const landingReset = /\breset\s+(?:is\s+)?(?:also\s+)?landing\b/i.test(text) ||
    /\b(?:a\s+|the\s+)?reset\b[\s\S]{0,36}\b(?:landing|coming|arriving|happening)\b[\s\S]{0,48}\b(?:today|tonight|midnight|tomorrow|soon)\b/i.test(text);
  const directReset = !bankedReset && (officialMilestoneReset || landingReset || (context && promisedReset) || scheduledReset);
  const indirectReset = resetMention;
  const ageHours = Math.max(0, (Date.now() - Date.parse(post.createdAt)) / 3_600_000);
  let relevance = 'none';
  let probability = 8;
  let outcome = 'probability';
  let reason = 'Tibo 最新帖子未出现额度重置信号';
  if (planningIntent) reason = 'Tibo 正在询问下周产品发布内容，未给出额度重置承诺';
  else if (feedbackIntent) reason = 'Tibo 正在收集反馈，不是额度重置承诺';
  else if (announcementIntent) reason = 'Tibo 正在发布产品更新，未给出额度重置承诺';

  if (confirmedReset) {
    relevance = 'confirmed';
    outcome = ageHours <= 48 ? 'reset-confirmed' : 'historical-reset';
    probability = ageHours <= 48 ? 100 : ageHours <= 96 ? 62 : 18;
    reason = 'Tibo 直接确认已重置 Codex 与 ChatGPT Work 用量额度';
  } else if (officialMilestoneReset && !bankedReset) {
    relevance = 'official';
    probability = ageHours <= 6 ? 96 : ageHours <= 24 ? 88 : ageHours <= 48 ? 72 : 30;
    reason = 'Tibo 明确表示用户里程碑已突破，且新一轮 reset 即将落地';
  } else if (directReset) {
    relevance = 'direct';
    probability = landingReset ? (ageHours <= 24 ? 94 : ageHours <= 48 ? 78 : 40)
      : scheduledReset ? (ageHours <= 72 ? 92 : 48)
        : ageHours <= 24 ? 88 : ageHours <= 72 ? 48 : 14;
    reason = landingReset
      ? 'Tibo 表示 reset 正在落地（含 midnight/today 等时间点）'
      : scheduledReset
        ? 'Tibo 直接预告下一次重置并给出日期'
        : 'Tibo 帖子出现直接的额度重置行动信号';
  } else if (dashboardMilestoneReset) {
    relevance = 'likely';
    probability = ageHours <= 24 ? 84 : ageHours <= 72 ? 68 : 26;
    reason = 'Tibo 通过 dashboard 里程碑和明日 Codex 预告释放了强推断的重置信号';
  } else if (indirectReset) {
    relevance = 'indirect';
    probability = ageHours <= 72 ? 18 : 8;
    reason = 'Tibo 帖子提到 reset，但没有额度对象、时间或行动指令';
  }

  return {
    ...post,
    relevance,
    probability,
    outcome,
    reason,
    ageHours,
  };
}

export function summarizeTiboPostZh(post) {
  if (!post) return '等待 Tibo 最新动态';
  const text = String(post.text || '');
  if (post.relevance === 'confirmed') {
    return 'Tibo 表示已完成 Codex 与 ChatGPT Work 使用额度重置。';
  }
  if (post.relevance === 'official') return '强信号：Tibo 明确表示新一轮 reset 即将落地。';
  if (/\breset\s+(?:is\s+)?(?:also\s+)?landing\b/i.test(text)) {
    return 'Tibo 表示 reset 正在落地，并给出当天/午夜前的时间点。';
  }
  if (post.relevance === 'direct') return 'Tibo 表示将进行新一轮额度重置。';
  if (post.relevance === 'likely') return 'Tibo 通过 dashboard 里程碑和 Codex 预告释放了强推断的下一轮重置信号。';
  if (post.relevance === 'indirect') return '动态提到了 reset，但没有给出明确的额度对象或时间。';
  if (/\bwhat\s+(?:should|could)\s+(?:we|i)\s+(?:ship|release|launch|build|announce)\b[\s\S]{0,56}\bnext\s+week\b/i.test(text) ||
    /\b(?:ship|release|launch|build|announce)\b[\s\S]{0,40}\bnext\s+week\b/i.test(text)) {
    return '下周产品发布意向（弱）：Tibo 在征集“下周要发布什么”的建议；未提及额度、用量或 reset。';
  }
  if (/(?:codex|chatgpt|\busage\b|quota)/i.test(text) &&
    /\b(?:now\s+available|available\s+now|is\s+live|launched?|released?|rolling\s+out|introducing)\b/i.test(text)) {
    return '产品/平台公告：Tibo 在发布功能或平台更新；原文未提额度、用量或 reset。';
  }
  return '最新动态未给出明确的额度重置信号。';
}

export function translateTiboPostZh(post) {
  const text = String(post?.text || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const rules = [
    [/\ball\s+reset\s+for\s+everyone\b/i, '所有人的额度都已重置。和 Astra 一起享受这一周吧。'],
    [/\beveryone['’]s\s+(?:usage\s+)?(?:limits?|quotas?)\s+(?:have\s+)?(?:been\s+)?reset\b/i, '所有人的用量额度都已重置。'],
    [/\ba\s+reset\s+(?:is\s+)?(?:also\s+)?landing\b[\s\S]{0,40}\bmidnight\s+today\b/i,
      '当然，一轮重置也会在今天午夜前落地。'],
    [/\breset\s+(?:is\s+)?(?:also\s+)?landing\b[\s\S]{0,40}\btoday\b/i,
      '一轮重置也将在今天落地。'],
    [/\bwe\s+are\s+so\s+back\b/i, '我们彻底回来了。'],
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] || '';
}

export function understandTiboPostZh(post) {
  const text = String(post?.text || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (post.relevance === 'confirmed' || /\ball\s+reset\s+for\s+everyone\b/i.test(text)) {
    return '这是官方全局重置已落地的确认；“everyone”表示所有符合条件的用户，不是下一轮概率。';
  }
  if (/\breset\s+(?:is\s+)?(?:also\s+)?landing\b/i.test(text)) {
    return '这是明确的额度重置预告：reset 正在/即将落地，并给出了今天/午夜前的时间点；仍需等待落地确认。';
  }
  if (post.relevance === 'official' || post.relevance === 'direct' || post.relevance === 'likely') {
    return '这是明确的额度重置预告，仍需等待落地确认。';
  }
  if (/\bfeedback\b/i.test(text) && /(?:codex|chatgpt)/i.test(text)) {
    return '这是用户调研/反馈征集，不是额度重置通知。';
  }
  if (/\bwhat\s+(?:should|could)\s+(?:we|i)\s+(?:ship|release|launch)\b/i.test(text)) {
    return '这是下周产品规划意向，不代表额度会在下周重置。';
  }
  if (post.relevance === 'indirect') return '动态提到了 reset，但没有给出明确的额度对象或时间。';
  if (post.relevance === 'none') return '这条动态目前没有提供明确的额度重置信号。';
  return summarizeTiboPostZh(post);
}

export function parseTiboXPayload(payload) {
  const html = String(payload || '');
  if (!html || !/@thsottiaux/i.test(html) || !/full_text/.test(html)) return null;
  const recordById = (id) => {
    if (!id || !/^[A-Za-z0-9+/:=_-]+$/.test(id)) return '';
    const start = html.indexOf(`__id:"${id}"`);
    if (start < 0) return '';
    const end = html.indexOf('__id:"', start + 6);
    return html.slice(start, end < 0 ? html.length : end);
  };
  const longTextFor = (encodedId) => {
    const note = recordById(`client:${encodedId}:note_tweet`);
    const resultsId = note.match(/note_tweet_results:(?:\$R\[\d+\]=)?\{__ref:"([A-Za-z0-9+/=]+)"\}/)?.[1];
    const resultId = recordById(resultsId).match(/result:(?:\$R\[\d+\]=)?\{__ref:"([A-Za-z0-9+/=]+)"\}/)?.[1];
    const text = recordById(resultId).match(/\btext:("(?:\\.|[^"\\])*")/);
    try { return text ? JSON.parse(text[1]) : ''; } catch { return ''; }
  };
  const posts = [];
  const seen = new Set();
  const details = [...html.matchAll(/__id:"client:([A-Za-z0-9+/=]+):details"/g)];
  for (let index = 0; index < details.length; index += 1) {
    const match = details[index];
    const detailsStart = match.index ?? -1;
    if (detailsStart < 0) continue;
    const detailsEnd = details[index + 1]?.index ?? html.length;
    const detailsRecord = html.slice(detailsStart, detailsEnd);
    const timeMatch = detailsRecord.match(/created_at_ms:(\d+)/);
    const textMatch = detailsRecord.match(/full_text:("(?:\\.|[^"\\])*")/);
    let decodedId = '';
    let text = '';
    try { decodedId = Buffer.from(match[1], 'base64').toString('utf8'); } catch { /* ignore */ }
    try { text = textMatch ? JSON.parse(textMatch[1]) : ''; } catch { /* ignore */ }
    const longText = longTextFor(match[1]);
    if (longText) text = longText;
    const id = decodedId.match(/^Tweet:(\d+)$/)?.[1] || '';
    const createdAtMs = Number(timeMatch?.[1]);
    if (!id || seen.has(id) || !text || !Number.isFinite(createdAtMs)) continue;
    seen.add(id);
    posts.push({
      id,
      createdAt: new Date(createdAtMs).toISOString(),
      text: String(text).trim().slice(0, 20000),
      url: `https://x.com/thsottiaux/status/${id}`,
    });
  }
  posts.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  posts.splice(TIBO_X_TIMELINE_POST_LIMIT);
  if (!posts.length) return null;

  const classified = posts.map(classifyTiboXPost);
  const latest = classified[0];
  const confirmed = classified.find((p) => p.relevance === 'confirmed');
  const strong = classified
    .filter((p) => /^(?:direct|official|likely)$/.test(p.relevance))
    .sort((a, b) => b.probability - a.probability || Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  const key = strong || confirmed || latest;
  const probability = Math.max(0, Math.min(100, Math.round(key?.probability ?? 8)));
  const level = resetRadarLevel(probability);
  return {
    probability,
    level,
    levelLabel: resetRadarLevelLabel(level),
    reason: key?.reason || 'Tibo 最新动态未显示明确重置信号',
    lastResetAt: confirmed?.createdAt || '',
    lastResetUrl: confirmed?.url || '',
    latestPostAt: latest?.createdAt || '',
    latestPostText: (latest?.text || '').slice(0, 180),
    latestPostUrl: latest?.url || '',
    keyPostText: (key?.text || '').slice(0, 220),
    keyPostUrl: key?.url || '',
    summaryZh: summarizeTiboPostZh(key || latest),
    translation: translateTiboPostZh(key || latest),
    understanding: understandTiboPostZh(key || latest),
    scannedPostCount: classified.length,
    relevance: key?.relevance || 'none',
    freshness: 'live',
    classifierVersion: CLASSIFIER_VERSION,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchTiboHtml(url = TIBO_X_URL) {
  const target = `${url}${url.includes('?') ? '&' : '?'}tibo-refresh=${Date.now()}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIBO_X_REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(target, {
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) throw new Error(`Tibo HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function refreshTiboRadar() {
  try {
    const html = await fetchTiboHtml();
    const parsed = parseTiboXPayload(html);
    if (parsed) return parsed;
    return {
      probability: 8,
      level: 'low',
      levelLabel: '偏低',
      reason: '未能从公开页解析出有效时间线（页面结构变化或反爬）',
      freshness: 'stale',
      syncFailed: true,
      classifierVersion: CLASSIFIER_VERSION,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      probability: 8,
      level: 'low',
      levelLabel: '偏低',
      reason: `Tibo 动态同步失败：${err?.message || err}`,
      freshness: 'stale',
      syncFailed: true,
      classifierVersion: CLASSIFIER_VERSION,
      fetchedAt: new Date().toISOString(),
    };
  }
}

export function compactSignalText(state) {
  if (!state) return '—';
  if (state.relevance === 'confirmed') return '已重置';
  if (state.probability >= 40) return state.probability + '%';
  if (state.relevance === 'indirect') return '待观察';
  return '—';
}

export { STORAGE_KEY, RELEVANCE_RANK, CLASSIFIER_VERSION, CACHE_MAX_AGE_MS, STALE_CACHE_MAX_AGE_MS };
