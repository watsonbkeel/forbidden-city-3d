// Rehearse the exact minimal owner hookup without editing shared production
// files. Baseline mode removes only this named hook when run after integration.
import {readFileSync} from 'node:fs';
export async function loadTongdaoZoneBase({enabled=false}={}){
 const url=new URL('../../src/scene/zones/ZoneBase.js',import.meta.url);
 let source=readFileSync(url,'utf8');
 source=source.replace(/^import \{\s*applyTongdaoRoof\s*\} from ['"]\.\.\/palace\/special\/TongdaoRoof.js['"];\n/m,'');
 source=source.replace(/^\s*applyTongdaoRoof\(this.kit,\s*this.zoneJson.id,\s*this.zoneJson.items.indexOf\(item\),\s*item,\s*result\);\n/m,'');
 if(enabled){
  const marker='    if(item.auxiliaryIdentity!==undefined){';
  if(!source.includes(marker))throw Error('Tongdao hookup context changed');
  source="import {applyTongdaoRoof} from '../palace/special/TongdaoRoof.js';\n"+source.replace(marker,'    applyTongdaoRoof(this.kit,this.zoneJson.id,this.zoneJson.items.indexOf(item),item,result);\n'+marker);
 }
 source=source.replace(/from (['"])(\.\.?\/[^'"]+)\1/g,(_,q,p)=>`from '${new URL(p,url).href}'`);
 source=source.replace("from 'three'",`from '${import.meta.resolve('three')}'`);
 return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}
