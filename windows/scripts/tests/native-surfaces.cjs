const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../assets/renderer-inject.js'), 'utf8');
const start = source.indexOf('  let routePathSnapshot =');
const end = source.indexOf('  const findTaskHeader =', start);
assert.ok(start > 0 && end > start);
const context = vm.createContext({ metrics:{routeContextReads:0}, location: {}, findMainSurface: () => null, SETTINGS_NAV_LABEL: '设置', document: {
  querySelector: () => null, querySelectorAll: () => [],
} });
vm.runInContext(source.slice(start, end) + '\nglobalThis.classify = isSettingsRoute;', context);
for (const route of ['/settings', '/settings/plugins-settings', '/settings/security', '/plugins', '/plugins/vendor/plugin', '/skills', '/automations', '/projects', '/library/media']) {
  context.location = { pathname: route, hash: '' };
  assert.equal(context.classify(), true, route);
  context.location = { pathname: '/index.html', hash: '#' + route };
  assert.equal(context.classify(), true, '#' + route);
}
for (const route of ['/thread/settings', '/task/plugins', '/projects-notes', '/settings-old', '/thread/my-settings-task', '/']) {
  context.location = { pathname: route, hash: '#plugins' };
  assert.equal(context.classify(), false, route);
}
context.location = { pathname:'/index.html', hash:'' };
context.document.querySelectorAll = () => [{ getAttribute: () => 'Settings' }];
assert.equal(context.classify(), true, 'English settings navigation');
context.document.querySelectorAll = () => [{ getAttribute: () => '设置' }];
assert.equal(context.classify(), true, 'Chinese settings navigation');
context.document.querySelectorAll = () => [];
context.location = { pathname:'/plugins', hash:'' };
context.findMainSurface = () => null;
context.document.querySelector = selector => selector === 'main, [role="main"]' ? { isConnected:true } : null;
const readyStart = source.indexOf('  const rendererReadiness =');
const readyEnd = source.indexOf('  const findHeaderQuotaHost =', readyStart);
vm.runInContext(source.slice(readyStart, readyEnd) + '\nglobalThis.readiness = rendererReadiness;', context);
assert.equal(context.readiness().settings,true,'utility page without old main-surface class');
context.document.querySelector = () => null;
assert.equal(context.readiness().ready,false,'do not mark an absent page ready');
// The address bar never changes in the current desktop memory router.
context.location = { pathname:'/index.html', hash:'' };
const currentRoot = { return:null };
const staleRoot = { return:null, stateNode:{current:currentRoot} };
currentRoot.stateNode = {current:currentRoot};
const current = {memoizedProps:{value:{location:{pathname:'/settings'}}},return:currentRoot};
const stale = {memoizedProps:{value:{location:{pathname:'/settings'}}},return:staleRoot,alternate:current};
context.findMainSurface = () => ({ __reactFiber$test:stale, isConnected:true });
for(let i=0;i<20;i++) {
  current.memoizedProps.value.location.pathname='/settings/general';
  assert.equal(context.classify(),true);
  current.memoizedProps.value.location.pathname='/local/a-task';
  // Stale navigation/input anchors must not override the committed task.
  context.document.querySelector = () => ({isConnected:true});
  assert.equal(context.classify(),false);
  current.memoizedProps.value.location.pathname='/plugins/example';
  assert.equal(context.classify(),true);
}
console.log('PASS: utility routes, nested routes, hash routing, task false positives, bilingual navigation');

const before=context.metrics.routeContextReads;
vm.runInContext('withRouteSnapshot(()=>{ for(let i=0;i<100;i++) isSettingsRoute(); })',context);
assert.equal(context.metrics.routeContextReads-before,1,'one committed route traversal per repair transaction');
current.memoizedProps.value.location.pathname='/local/returned';
assert.equal(context.classify(),false,'snapshot does not survive a transaction');
