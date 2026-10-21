import fs from 'node:fs';
import {validateBuildingFidelity} from '../src/ui/BuildingFidelity.js';
const dir='docs/current-state/r48-remaining/';
const baseline=JSON.parse(fs.readFileSync(dir+'remaining-70-baseline.json'));
const ids=new Set(baseline.remaining.map(x=>x.id));
const registry=JSON.parse(fs.readFileSync('data/architecture/building-fidelity.json'));
const patches=['residential','ningshou','outer','integration'].flatMap(group=>{const file=dir+group+'-ledger-patch.json';return fs.existsSync(file)?JSON.parse(fs.readFileSync(file)).map(p=>({...p,group})):[];});
const seen=new Set(),statuses=new Set(['actual-change','reviewed-retained','evidence-blocked']);
const words={'actual-change':'局部实际更新','reviewed-retained':'复核保留既有模型','evidence-blocked':'证据不足，未新增复原'};
for(const p of patches){
 if(!ids.has(p.id)||seen.has(p.id))throw Error('Out-of-scope or duplicate R48 identity '+p.id);seen.add(p.id);
 const b=registry.buildings.find(b=>b.id===p.id);if(!b)throw Error('Missing R48 registry identity '+p.id);
 for(const scope of ['exterior','interior'])if(!statuses.has(p.scopes?.[scope]?.status)||!Array.isArray(p.scopes[scope].changes))throw Error('R48 requires independently classified exterior/interior scopes '+p.id);
 b.changes=b.changes.filter(c=>c.release!=='R48');
 b.claims=b.claims.filter(c=>c.release!=='R48');
 for(const c of (p.factualClaims??[]).filter(c=>c.scope!=='photo-boundary'))b.claims.push({...c,targetState:c.targetState??'按官方文字或选定照片理解局部形制；照片拍摄日期及完整当前库存未核定。',implemented:c.implemented===true,release:'R48'});
 for(const scope of ['exterior','interior']){const s=p.scopes[scope];
  b[scope]=structuredClone(baseline.remaining.find(r=>r.id===p.id)[scope]);
  if(s.status==='actual-change'){b[scope].implementation='dedicated-partial';for(const text of s.changes)b.changes.push({area:scope,release:'R48',text});}
  b[scope].unresolved=[...new Set([...(baseline.remaining.find(r=>r.id===p.id)?.[scope]?.unresolved??[]),...(p.unknown??[]),...(p.fitted??[]),'局部变化不等于完整建筑或现存陈设验收。'])];
 }
 b.r48Review={exterior:p.scopes.exterior,interior:p.scopes.interior,blockers:p.blockers??[],actualChanges:p.actualChanges??[],sourceTarget:p.status,photoReferences:[...(p.photoReferences??[]),...(p.factualClaims??[]).filter(c=>c.scope==='photo-boundary')],complete:false};
 b.publicNote=`本轮外观：${words[p.scopes.exterior.status]}；内饰：${words[p.scopes.interior.status]}。${[...p.scopes.exterior.changes,...p.scopes.interior.changes].join('；')}。${(p.unknown??[]).slice(0,2).join('')}`;
}
validateBuildingFidelity(registry);
fs.writeFileSync('data/architecture/building-fidelity.json',JSON.stringify(registry,null,2)+'\n');
// A reviewed source is not automatically evidence for the opposite scope. Keep that
// distinction visible, including when the available source cannot resolve an interior.
function scopeReceipt(p,scope){
 if(!p)return {status:'pending',changes:[],evidence:[]};
 const s=p.scopes[scope], direct=(p.factualClaims??[]).filter(c=>c.scope===scope&&c.source);
 const declared=(Array.isArray(s.source)?s.source:s.source?[s.source]:[]).map(source=>({source,targetState:s.targetPeriod}));
 const dated=c=>{const photo=(p.photoReferences??[]).find(q=>q.source===c.source);return {source:c.source,targetState:c.targetState??s.targetPeriod??photo?.resourcePeriod??'来源所指年代与照片拍摄日期未明确；不视为2026现场调查。',photographyDate:photo?.photographyDate??s.photographyDate??null,relationship:c.relationship??'局部事实或选定参照；不证明完整建筑现状',...(photo?.sourceNotes?{sourceNotes:photo.sourceNotes}:{}),...((c.claim??c.text)?{claim:c.claim??c.text}:{})};};
 const evidence=(s.evidence??(direct.length?direct:declared)).map(dated);
 if(!evidence.length){
  const reviewed=[...new Set([...(p.sourcesReviewed??[]),...(p.factualClaims??[]).map(c=>c.source).filter(Boolean)])];
  for(const source of reviewed)evidence.push({source,targetState:'来源年代按原条目；照片拍摄日期未核，上传日期不作为拍摄日期。',relationship:'仅列已核来源入口；未提供本侧完整现状依据，不把另一侧事实移作本侧证明'});
 }
 return {...s,evidence,limitations:p.unknown??[],modelFits:p.fitted??[]};
}
const progress=baseline.remaining.map(r=>{const p=patches.find(p=>p.id===r.id);return{id:r.id,name:r.name,zone:r.zone,exterior:scopeReceipt(p,'exterior'),interior:scopeReceipt(p,'interior'),blockers:p?.blockers??[],accepted:false};});
fs.writeFileSync(dir+'current-70-status.json',JSON.stringify({baseline:baseline.baseline,total:70,classification:'Per-scope local implementation status; not whole-building completion or acceptance',buildings:progress},null,2)+'\n');
console.log(JSON.stringify({classified:patches.length,remaining:70-patches.length,actualChanged:patches.filter(p=>Object.values(p.scopes).some(s=>s.status==='actual-change')).length}));
