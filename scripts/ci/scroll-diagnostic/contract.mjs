import {writeResultJSON,requireThat} from '../bilingual-ui/common.mjs';
export const PNGS=Object.freeze(['primary-endpoint.png','primary-directory-endpoint.png','control-endpoint.png','control-directory-endpoint.png']);
export const LIMITS=Object.freeze({contexts:2,browserSeconds:90,evidenceBytes:8*1024*1024,recordBytes:512*1024,logBytes:64*1024});
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const same=(a,b,keys)=>a&&b&&keys.every(k=>JSON.stringify(a[k])===JSON.stringify(b[k]));
export function fields(value,names,label){requireThat(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join('\0')===[...names].sort().join('\0'),'Invalid '+label+' fields');}
export function finiteFields(value,names,label){for(const key of names)requireThat(finite(value[key]),'Invalid '+label+'.'+key);}
export function text(value,max,label,empty=true){requireThat(typeof value==='string'&&value.length<=max&&(empty||value.length>0),'Invalid '+label);}
export function assertComparisonFields(r){
 fields(r.baseline,['scroll','height','client','query','focus'],'baseline');finiteFields(r.baseline,['scroll','height','client'],'baseline');text(r.baseline.query,4096,'baseline.query');text(r.baseline.focus,256,'baseline.focus');
 requireThat(r.baseline.client>0&&r.baseline.height>r.baseline.client&&r.baseline.scroll>0&&r.baseline.scroll<=r.baseline.height-r.baseline.client,'Invalid baseline scroll range');
 for(const key of ['pre','afterSet','after']){const v=r[key];fields(v,['scroll','query','focus','locale','storeLocale','fontStatus','readyState'],key);finiteFields(v,['scroll'],key);text(v.query,4096,key+'.query');text(v.focus,256,key+'.focus');requireThat(['zh-CN','en'].includes(v.locale)&&['zh-CN','en'].includes(v.storeLocale)&&['loaded','loading','unsupported'].includes(v.fontStatus)&&['loading','interactive','complete'].includes(v.readyState),'Invalid scalar state');}
 fields(r.range,['scroll','max','client','height'],'range');finiteFields(r.range,['scroll','max','client','height'],'range');requireThat(r.range.client>=0&&r.range.height>=0&&r.range.max===Math.max(0,r.range.height-r.range.client),'Invalid observed scroll range');
}
export function classify(r){
 const blocked=reason=>({primaryContract:'failed',controlEligible:false,reason});
 if(!r||!r.baseline||!r.pre||!r.afterSet||!r.after||!r.range||!Array.isArray(r.errors))return blocked('unknown-record');
 try{assertComparisonFields(r);}catch{return blocked('unknown-comparison-fields');}
 const b=r.baseline,a=r.after,p=r.pre,z=r.range;
 if(![p,r.afterSet,a].every(s=>['loaded','loading','unsupported'].includes(s.fontStatus)&&['loading','interactive','complete'].includes(s.readyState)))return blocked('unknown-font-document-state');
 if(!['zh-CN','en'].includes(r.target)||r.errors.length)return blocked('unexpected-error');
 if(![b.scroll,b.height,b.client,p.scroll,a.scroll,r.afterSet.scroll,z.scroll,z.max,z.client,z.height].every(finite)||b.height<=b.client||b.client<=0||b.scroll<=0||b.scroll>b.height-b.client||z.client<=0||z.height<z.client||z.max!==z.height-z.client||a.scroll<0||a.scroll>z.max||z.scroll!==a.scroll)return blocked('unknown-or-invalid-range');
 if(!same(b,a,['scroll','query','focus'])){
  if(!same(p,a,['fontStatus','readyState'])||!same(p,r.afterSet,['fontStatus','readyState'])||!same(b,p,['scroll','query','focus'])||p.locale!==(r.target==='zh-CN'?'en':'zh-CN')||p.storeLocale!==p.locale)return blocked('pre-switch-drift');
  if(!same(b,r.afterSet,['query','focus'])||!same(b,a,['query','focus'])||a.locale!==r.target||a.storeLocale!==r.target||r.afterSet.locale!==r.target||r.afterSet.storeLocale!==r.target)return blocked('not-scroll-only');
  if(b.scroll>z.max)return blocked('baseline-would-clamp');
  return {primaryContract:'failed',controlEligible:true,reason:'exact-scroll-only-mismatch'};
 }
 if(a.locale!==r.target||a.storeLocale!==r.target)return blocked('wrong-locale');
 return {primaryContract:'passed',controlEligible:false,reason:'exact-state-preserved'};
}
export function controlAllowed(records){
 if(!Array.isArray(records)||records.length<1||records.length>2)return false;
 if(records[0].target!=='zh-CN'||(records.length===2&&records[1].target!=='en'))return false;
 const b=records[0].baseline;
 for(let i=0;i<records.length;i++){
  const r=records[i];try{assertComparisonFields(r);}catch{return false;}
  const trail=[r.pre,r.afterSet,r.after];
  if(!trail.every(v=>same(records[0].pre,v,['fontStatus','readyState'])&&same(b,v,['query','focus'])))return false;
  if(r.pre.locale!==(r.target==='zh-CN'?'en':'zh-CN')||r.pre.storeLocale!==r.pre.locale||r.afterSet.locale!==r.target||r.afterSet.storeLocale!==r.target)return false;
  if(i>0&&!same(records[i-1].after,r.pre,['scroll','query','focus','locale','storeLocale','fontStatus','readyState']))return false;
  if(i<records.length-1&&!trail.every(v=>same(b,v,['scroll','query','focus'])))return false;
  if(!same(b,r.baseline,['scroll','height','client','query','focus']))return false;
  if(!same(b,r.pre,['scroll','query','focus']))return false;
  const state=classify(r);if(i===records.length-1)return state.controlEligible;
  if(state.primaryContract!=='passed')return false;
 }
 return false;
}
export function publish(destination,value,writer=writeResultJSON){requireThat(Buffer.byteLength(JSON.stringify(value,null,2)+'\n')<=LIMITS.recordBytes,'Diagnostic record limit exceeded');writer(destination,value);}
export function publishThenAssert(record,persist,assertion){persist(record);return assertion();}
