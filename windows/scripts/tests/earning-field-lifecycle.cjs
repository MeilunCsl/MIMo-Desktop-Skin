const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../../assets/renderer-inject.js'), 'utf8');
const slice = (start, end) => source.slice(source.indexOf(start), source.indexOf(end));
const callbacks = new Map();
let serial = 0;
const token = {};
const context = {
  window: { skin: { installToken: token } }, STATE_KEY: 'skin', DISABLED_KEY: 'disabled',
  installToken: token, document: { hidden: false }, performance: { now: () => 0 },
  requestAnimationFrame: fn => { const id = ++serial; callbacks.set(id, fn); return id; },
};
vm.createContext(context);
vm.runInContext(`
  const threadEarningFields = new WeakMap();
  const threadEarningLiveFields = [];
  let threadEarningFieldLast = 0, threadEarningFieldRaf = 0;
  const threadEarningMotionQuery = {matches:false};
  const threadEarningFxMetrics = {frames:0,totalMs:0,maxMs:0};
  ${slice('  const threadEarningFieldOf =', '  const configureThreadEarningField =')}
  ${slice('  function resumeThreadEarningFields()', '  document.addEventListener("visibilitychange", resumeThreadEarningFields)')}
  globalThis.field = {canvas:{isConnected:true},draw(){this.draws=(this.draws||0)+1}};
  threadEarningFields.set(field.canvas, field);
  globalThis.connect = () => reconnectThreadEarningField(field.canvas);
  globalThis.count = () => threadEarningLiveFields.length;
`, context);
const frame = () => { const batch = [...callbacks.values()]; callbacks.clear(); batch.forEach(fn => fn(16 * serial)); };
context.connect(); frame();
assert.equal(context.field.draws, 1);
for (let i = 0; i < 10; i++) {
  context.field.canvas.isConnected = false; frame();
  assert.equal(context.count(), 0);
  assert.equal(callbacks.size, 0);
  context.field.canvas.isConnected = true;
  context.connect(); context.connect();
  assert.equal(context.count(), 1);
  assert.equal(callbacks.size, 1);
  frame();
}
assert.equal(context.field.draws, 11);
context.document.hidden = true; frame();
assert.equal(callbacks.size, 0);
context.document.hidden = false; context.connect(); frame();
assert.equal(context.field.draws, 12);
console.log('PASS: 10 detach/reattach cycles, no duplicate loops, hidden/resume');
