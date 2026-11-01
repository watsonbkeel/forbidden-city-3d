// Test transport: make the exact production whitelist/dispatch additions
// present BEFORE shared-hooks.mjs receives either shared source. Deliberately
// independent of that helper, so its early-return branch is really exercised.
import {registerHooks} from 'node:module';
const controls=new URL('../../../../src/controls/',import.meta.url);
const once=(s,a,b)=>{if(s.split(a).length!==2)throw Error('Preinstalled production hook context drift: '+a);return s.replace(a,b);};
registerHooks({load(url,context,nextLoad){const r=nextLoad(url,context);if(r.format!=='module'||!r.source)return r;let s=typeof r.source==='string'?r.source:new TextDecoder().decode(r.source),changed=false;
 if(url===new URL('XiqingRoofSurface.js',controls).href&&!s.includes('import {WENHUA_GATE_APPROACH_IDS}')){s="import {WENHUA_GATE_APPROACH_IDS} from './WenhuaGateApproachSupport.js';\n"+once(s,'const IDS=new Set([','const IDS=new Set([...WENHUA_GATE_APPROACH_IDS,');changed=true;}
 if(url===new URL('FurnitureMotion.js',controls).href&&!s.includes('import {validateWenhuaGateApproachScope}')){s="import {validateWenhuaGateApproachScope} from './WenhuaGateApproachSupport.js';\n"+s;s=once(s,"||!['wuying-central-balustrades'","||!['wenhua-gate-approaches','wuying-central-balustrades'");s=once(s,"  if(input.kind==='qianqing-screen-caps')validateQianqingScreenScope(input,ownerBox,region);","  if(input.kind==='wenhua-gate-approaches')validateWenhuaGateApproachScope(input,ownerBox,region);\n  if(input.kind==='qianqing-screen-caps')validateQianqingScreenScope(input,ownerBox,region);");changed=true;}
 return changed?{...r,source:s}:r;
}});
