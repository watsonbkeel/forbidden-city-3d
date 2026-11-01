import fs from 'node:fs';import crypto from 'node:crypto';
import {buildR52World} from '../r158-arrow-integrate/tests/lib/r52-world.mjs';
import {taiheWorldPhysics} from '../r158-arrow-integrate/tests/lib/r157-taihe-world-retention.mjs';
const W=await buildR52World();try{
 const p=taiheWorldPhysics(W),old=p.rows.filter(c=>Math.abs((c.min[0]+c.max[0])/2)===17&&c.min[1]===8&&c.max[1]===11&&Math.abs(c.max[0]-c.min[0]-1.6)<1e-9);
 if(old.length!==2)throw Error('expected exactly two old instruments, got '+old.length);
 const excluded=new Set(old),retained=p.rows.filter(c=>!excluded.has(c)).map(c=>crypto.createHash('sha256').update(JSON.stringify(c)).digest('hex')).sort();
 fs.writeFileSync(new URL('world-physics-before.json',import.meta.url),JSON.stringify({base:'055947f1b2f13cb26b809bf1098d48f0a978cb32',total:p.rows.length,removed:old,retained,walkables:p.walkables,rivers:p.rivers},null,2)+'\n');console.log(JSON.stringify({total:p.rows.length,removed:old,retained:retained.length}));
}finally{W.dispose();}
