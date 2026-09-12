const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../../assets/renderer-inject.js'), 'utf8');
function section(first, next) {
  const start = source.indexOf(`const ${first} =`);
  const end = source.indexOf(`const ${next} =`, start);
  assert.ok(start >= 0 && end > start);
  return source.slice(start, end);
}
const now = Date.parse('2026-09-08T01:30:00Z');
class Clock extends Date { static now() { return now; } }
const api = vm.runInNewContext([
  section('scheduledResetTimeText', 'formatQuotaRingTime'),
  section('classifyTiboXPost', 'TIBO_X_STALE_CACHE_MAX_AGE_MS'),
  section('resetTimestamp', 'quotaResetRadarSnapshot'),
  '({ classifyTiboXPost, parseTiboXPayload, scheduledResetTimeText, resolveResetRadarState, resetScheduleDeadline, summarizeTiboPostZh, translateTiboPostZh, understandTiboPostZh })',
].join('\n'), {
  Date: Clock, Intl, atob, console,
  quotaText: (value, fallback = '') => String(value ?? '').trim() || fallback,
  decodePublicTextPayload: value => value,
  resetRadarLevel: p => p >= 75 ? 'high' : p >= 40 ? 'medium' : 'low',
  resetRadarLevelLabel: value => value,
  TIBO_X_TIMELINE_POST_LIMIT: 36, TIBO_X_EVIDENCE_POST_LIMIT: 16,
  TIBO_X_EVIDENCE_WINDOW_MS: 7 * 86400000,
  RESET_SCHEDULE_GRACE_MS: 36 * 3600000, RESET_SIGNAL_MAX_AGE_MS: 4 * 86400000,
});
const createdAt = '2026-09-07T19:20:00Z';
const announcement = 'Thanks for reading. We will do a global reset of the usage for all paid subscriptions so that you can keep enjoying Astra after burning through all of it doing fun 3D modeling in blender. The work week is about to start. Lands around 6pm PST today.';
const classified = api.classifyTiboXPost({ text: announcement, createdAt });
assert.equal(classified.relevance, 'direct');
assert.match(classified.nextResetTime, /^9\/7 18:00 PST/);
const globalConfirmation = api.classifyTiboXPost({
  text: 'All reset for everyone. Enjoy the week with Astra.',
  createdAt: '2026-09-07T22:00:00Z',
});
assert.equal(globalConfirmation.relevance, 'confirmed');
assert.equal(globalConfirmation.outcome, 'reset-confirmed');
assert.equal(globalConfirmation.probability, 100);
assert.equal(api.translateTiboPostZh({
  text: 'See you at the Astra party. Excited to meet some of you.',
}), '期待在 Astra 聚会上见到你们中的一些人。');
assert.match(api.understandTiboPostZh({
  text: 'See you at the Astra party. Excited to meet some of you.',
  relevance: 'none',
}), /Astra.*没有提到额度.*不构成新的重置信号/);
assert.equal(api.translateTiboPostZh({
  text: 'All reset for everyone. Enjoy the week with Astra.',
}), '所有人的额度都已重置。和 Astra 一起享受这一周吧。');
const postResetPayload = payload([
  ['5', '2026-09-08T01:00:00Z', 'See you at the Astra party. Excited to meet some of you.'],
  ['4', '2026-09-07T22:00:00Z', 'All reset for everyone. Enjoy the week with Astra.'],
  ['2', createdAt, announcement],
]);
const postResetState = api.parseTiboXPayload(postResetPayload);
assert.equal(postResetState.lastResetPostId, '4');
assert.equal(postResetState.nextSignalPostId, '');
const postResetResolved = api.resolveResetRadarState(postResetState, null, null, now);
assert.equal(postResetResolved.outcome, 'reset-confirmed');
assert.equal(postResetResolved.nextSignalStatus, 'none');
assert.equal(postResetResolved.nextProbability, null);
for (const text of [
  'Your Codex and ChatGPT Work reset will land at 6pm PST.',
  'We will reset Codex usage today. Lands around 6pm PT today.',
  'We are going to perform a full reset of usage. Lands at 6pm PDT tomorrow.',
]) {
  const result = api.classifyTiboXPost({ text, createdAt });
  assert.equal(result.relevance, 'direct', text);
  assert.ok(result.nextResetTime, text);
}
for (const text of [
  'We will do a full banked reset for Codex users. Lands at 6pm PST today.',
  'I will reset my router today.',
  'What should we ship next week for Codex?',
]) assert.ok(!['confirmed', 'direct', 'official'].includes(api.classifyTiboXPost({text, createdAt}).relevance), text);
assert.match(api.scheduledResetTimeText('6pm PT tomorrow', '2026-09-08T01:00:00Z'), /^9\/8 18:00 PT/);
function payload(posts) {
  return '@thsottiaux ' + posts.map(([id, at, text]) =>
    `__id:"client:${Buffer.from(`Tweet:${id}`).toString('base64')}:details",created_at_ms:${Date.parse(at)},full_text:${JSON.stringify(text)}`
  ).join('\n');
}
const result = api.parseTiboXPayload(payload([
  ['3', '2026-09-08T01:00:00Z', 'I think I can officially say: we are so back'],
  ['2', createdAt, announcement],
  ['1', '2026-08-31T01:00:00Z', 'We have reset Codex usage limits.'],
]));
assert.equal(result.latestPostRelevance, 'none');
assert.equal(result.hasResetSignal, true);
assert.equal(result.nextSignalPostId, '2');
assert.equal(result.displayPostRelevance, 'direct');
assert.equal(result.lastResetPostId, '1');
assert.equal(result.timelineEvidence.pendingSignalCount, 1);
const encoded = Buffer.from('Tweet:2').toString('base64');
const noteRecords = ` __id:"client:${encoded}:note_tweet",note_tweet_results:{__ref:"results2"} __id:"results2",result:{__ref:"note2"} __id:"note2",text:${JSON.stringify(announcement)}`;
const longPayload = payload([
  ['3', '2026-09-08T01:00:00Z', 'we are so back'],
  ['2', createdAt, 'Thanks for reading. We will do a global reset of the usage for all paid subscriptions so that you can keep'],
]) + noteRecords;
const longResult = api.parseTiboXPayload(longPayload);
assert.match(longResult.nextResetTime, /^9\/7 18:00 PST/);
assert.equal(longResult.incompletePostCount, 0);
assert.equal(longResult.latestPostText, 'we are so back', 'Long text must stay with its owner');
const resolved = api.resolveResetRadarState(longResult, null, null, now);
assert.equal(resolved.hasResetSignal, true);
assert.match(resolved.nextResetTime, /18:00 PST/);
assert.equal(api.resetScheduleDeadline('9/7 18:00 PST', Date.parse(createdAt), now),
  Date.parse('2026-09-08T02:00:00Z') + 36 * 3600000);
const incomplete = api.parseTiboXPayload(longPayload.replace('__id:"note2"', '__id:"missing"'));
assert.equal(incomplete.incompletePostCount, 1);
const previewContext = {
  tiboRadarState: result,
  quotaText: (value, fallback = '') => String(value ?? '').trim() || fallback,
  tiboPostText: value => String(value || ''),
  resetSignalIsTerminal: () => false,
  formatQuotaRingTime: value => value,
  summarizeTiboPostZh: api.summarizeTiboPostZh,
  translateTiboPostZh: api.translateTiboPostZh,
  understandTiboPostZh: api.understandTiboPostZh,
};
const preview = vm.runInNewContext(section('quotaTiboPreview', 'reconcileQuotaResetCause') + '\nquotaTiboPreview;', previewContext);
const view = preview(api.resolveResetRadarState(result, null, null, now), {active: true, probability: 88});
assert.equal(view.original, announcement, 'Pending announcement must take precedence over historical confirmation');
assert.match(view.verdict, /18:00 PST/);
assert.match(view.translation, /全局用量重置/);
assert.match(view.understanding, /额度重置预告/);
assert.equal(view.interpretationVisible, true);
const ordinaryView = preview(api.resolveResetRadarState(result, null, null, now), {active: false});
assert.equal(ordinaryView.translation, '我想现在可以正式宣布：我们彻底回来了。');
assert.match(ordinaryView.understanding, /恢复/);
previewContext.tiboRadarState = {...result, syncFailed: true};
assert.match(preview(result, {active: false}).verdict, /同步失败/);
previewContext.tiboRadarState = {...result, incompletePostCount: 1};
assert.match(preview(result, {active: false}).verdict, /长文不完整/);
if (process.argv[2]) {
  const live = api.parseTiboXPayload(fs.readFileSync(process.argv[2], 'utf8'));
  assert.equal(live.nextSignalPostId, '2097043464538264003');
  assert.match(live.nextResetTime, /18:00 PST/);
  console.log('PASS: real X long post detected with its scheduled Pacific time');
}
console.log('PASS: scheduled global reset, Pacific date, banked/irrelevant exclusions, history and newer ordinary post');
