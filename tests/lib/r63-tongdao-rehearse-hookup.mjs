// Optional Node-only loader for running frozen tests against the exact proposed
// hookup. It modifies no file and does not hide or rewrite historical assertions.
import {registerHooks} from 'node:module';
registerHooks({load(url,context,nextLoad){const result=nextLoad(url,context);if(!url.endsWith('/src/scene/zones/ZoneBase.js'))return result;let source=String(result.source);if(!source.includes('applyTongdaoRoof(')){source="import {applyTongdaoRoof} from '../palace/special/TongdaoRoof.js';\n"+source.replace('    if(item.auxiliaryIdentity!==undefined){','    applyTongdaoRoof(this.kit,this.zoneJson.id,this.zoneJson.items.indexOf(item),item,result);\n    if(item.auxiliaryIdentity!==undefined){');}return{...result,source};}});
