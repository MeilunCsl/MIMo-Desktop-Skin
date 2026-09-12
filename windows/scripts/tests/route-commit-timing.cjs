const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../../assets/renderer-inject.js'),'utf8');
const start=source.indexOf('  const routeChangeHandler =');
const end=source.indexOf('  const installRouteHistoryHooks =',start);
const calls=[];
const context=vm.createContext({withRouteSnapshot:fn=>fn(),window:{},DISABLED_KEY:'disabled',metrics:{navigationEvents:0},routeUrlSignature:'old',
  readRouteSignature:()=>'/settings',isRendererVisible:()=>true,backgroundRepairPending:false,
  lockActiveThemeDuringRoute:()=>calls.push('lock'),rendererReadiness:()=>({ready:true,settings:true}),
  document:{documentElement:{getAttribute:()=> 'active'}},ensure:()=>calls.push('ensure'),
  scheduleRouteEnsure:delay=>calls.push(delay),routeFollowupTimer:null,setTimeout:()=>1,clearTimeout:()=>{},routeRepairNeeded:()=>false});
vm.runInContext(source.slice(start,end)+'\nglobalThis.change=routeChangeHandler;',context);
context.change();assert.deepEqual(calls,['lock','ensure'],'enter settings is synchronous');
calls.length=0;context.rendererReadiness=()=>({ready:true,settings:false});
context.document.documentElement.getAttribute=()=> 'settings';context.change();
assert.deepEqual(calls,['lock','ensure'],'return from settings is synchronous');
calls.length=0;context.document.documentElement.getAttribute=()=> 'active';context.change();
assert.deepEqual(calls,['lock',72],'ordinary task navigation keeps existing deferred work');
console.log('PASS: settings round-trip repairs before deferred paint; task navigation remains deferred');
