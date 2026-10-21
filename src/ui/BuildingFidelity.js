import data from '../../data/architecture/building-fidelity.json' with {type:'json'};
const implementations=new Set(['generic-placeholder','dedicated-partial','withheld','shared-pavilion']);
export function validateBuildingFidelity(registry){
 if(registry?.schemaVersion!==1||!Array.isArray(registry.buildings))throw Error('Building fidelity registry schema mismatch');
 const ids=new Set(),bindings=new Set(),catalogIds=new Set();
 for(const b of registry.buildings){
  const binding=`${b.zone}/${b.name}`;
  if(!b.id||ids.has(b.id)||!b.name||!b.zone||bindings.has(binding))throw Error('Duplicate or missing building identity');
  ids.add(b.id);bindings.add(binding);
  if(b.catalogId){if(catalogIds.has(b.catalogId))throw Error('Duplicate building catalog binding');catalogIds.add(b.catalogId);}
  for(const scope of ['interior','exterior']){const p=b[scope];if(!p||!implementations.has(p.implementation)||p.accepted!==false||p.dimensions!=='includes-model-fits'||!Array.isArray(p.unresolved)||!p.unresolved.length)throw Error('Building fidelity needs explicit incomplete interior/exterior boundaries');}
  if(!Array.isArray(b.claims)||!Array.isArray(b.changes)||!Array.isArray(b.auxiliaryProfiles)||b.validation?.visual!=='not-verified')throw Error('Building fidelity lacks change/validation boundary');
  for(const c of b.claims){let url;try{url=new URL(c.source);}catch{throw Error('Building claim needs official source');}if(url.protocol!=='https:'||!(url.hostname==='dpm.org.cn'||url.hostname.endsWith('.dpm.org.cn'))||!['interior','exterior'].includes(c.scope)||!c.text||!c.targetState||typeof c.implemented!=='boolean')throw Error('Building claim must separate official evidence and implementation');}
 }
 return registry;
}
export const BUILDING_FIDELITY=validateBuildingFidelity(data);
const byName=new Map(data.buildings.map(b=>[b.name,b]));
const byCatalog=new Map(data.buildings.filter(b=>b.catalogId).map(b=>[b.catalogId,b]));
export const buildingFidelityFor=(name,catalogId)=>catalogId?byCatalog.get(catalogId)??byName.get(name)??null:byName.get(name)??null;
export function buildingFidelityText(record){
 if(!record)return null;
 const state=(scope)=>{
  const part=record[scope],updated=record.changes.some(c=>c.area===scope);
  if(part.implementation==='withheld')return '布局尚未复原';
  if(updated)return '局部依据官方资料调整';
  if(part.implementation==='dedicated-partial')return '已有专用模型，细部待核';
  return scope==='interior'?'通用示意，布局待核实':'通用轮廓，逐栋细部待核';
 };
 const auxiliary=record.changes.some(c=>c.area==='auxiliary-exterior')?'附属后殿已局部调整，正殿另行核验。':'';
 return {short:'内外分项复原 · 尚未完整验收',detail:`外观：${state('exterior')}。内饰：${state('interior')}。${auxiliary}尺寸含模型合理拟合，不代表完整实测复原。${record.interior.implementation==='withheld'?record.interior.unresolved[0]:''}`};
}
