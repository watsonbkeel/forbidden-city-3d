// Exact proposed whitelist/dispatch additions. This rehearses integration in
// memory only; the dedicated branch never writes these shared source files.
import {registerHooks} from 'node:module';
const controls=new URL('../../../../src/controls/',import.meta.url);
const replace=(s,a,b)=>{if(s.split(a).length!==2)throw Error('Wenhua integration context changed: '+a);return s.replace(a,b);};
export function proposeWenhuaSharedHook(source,url){
 if(url===new URL('XiqingRoofSurface.js',controls).href){
  if(source.includes("import {WENHUA_GATE_APPROACH_IDS}"))return source;
  source="import {WENHUA_GATE_APPROACH_IDS} from './WenhuaGateApproachSupport.js';\n"+source;
  return replace(source,'const IDS=new Set([','const IDS=new Set([...WENHUA_GATE_APPROACH_IDS,');
 }
 if(url===new URL('FurnitureMotion.js',controls).href){
  if(!source.includes("import {validateWenhuaGateApproachScope}")){
   source="import {validateWenhuaGateApproachScope} from './WenhuaGateApproachSupport.js';\n"+source;
   source=replace(source,"||!['wuying-central-balustrades'","||!['wenhua-gate-approaches','wuying-central-balustrades'");
   source=replace(source,"  if(input.kind==='qianqing-screen-caps')validateQianqingScreenScope(input,ownerBox,region);","  if(input.kind==='wenhua-gate-approaches')validateWenhuaGateApproachScope(input,ownerBox,region);\n  if(input.kind==='qianqing-screen-caps')validateQianqingScreenScope(input,ownerBox,region);");
  }
  if(process.env.WENHUA_MUTANT==='no-scope')source=replace(source,'return furnitureRegionIndex(cm).regions.some(r=>{',"return furnitureRegionIndex(cm).regions.some(r=>{\n    if(r.kind==='wenhua-gate-approaches')return false;");
  return source;
 }
 return source;
}
if(process.env.WENHUA_SHARED_HOOKS!=='off')registerHooks({load(url,context,nextLoad){const r=nextLoad(url,context);if(r.format==='module'&&r.source){const source=typeof r.source==='string'?r.source:new TextDecoder().decode(r.source);const patched=proposeWenhuaSharedHook(source,url);if(patched!==source)return {...r,source:patched};}return r;}});
