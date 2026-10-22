import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as T from 'three';
import '../../tests/lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from '../../tests/lib/r48-real-texture-library.mjs';
import {ZoneBase as Current} from '../../src/scene/zones/ZoneBase.js';
import {ZoneBase as Baseline} from '../../../r49-reported-regressions/src/scene/zones/ZoneBase.js';
const base=path.resolve('.'),outdir=path.join(base,'scratch/r49b-global-independent-review');
const hash=v=>crypto.createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
function capture(Cls,data,item){
 const lib=realTextureLibrary(),z=new Cls(lib,data),pairs=[],nonplaque=[],allowedCanopies=new Set(['yonghe-open-canopy','r48-chonghua-three-bay-baoxia']);
 if(item.kind==='hall')z.buildHall(item);else z.buildGate(item);
 z.kit.root.updateMatrixWorld(true);
 const exclusions=new Set(z.kit.plaques.flatMap(p=>[p.mesh,p.frame]));
 const descendantsOfAllowed=m=>{for(let a=m;a;a=a.parent)if(allowedCanopies.has(a.name))return true;return false;};
 z.kit.root.traverse(m=>{if(!m.isMesh||exclusions.has(m)||descendantsOfAllowed(m))return;
 const g=m.geometry;nonplaque.push({name:m.name,matrix:m.matrixWorld.toArray(),material:m.material?.name,attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,hash:hash(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength))}])),index:g.index?hash(Buffer.from(g.index.array.buffer,g.index.array.byteOffset,g.index.array.byteLength)):null});});
 for(const p of z.kit.plaques){const gp=p.mesh.geometry.parameters,gf=p.frame?.geometry.parameters;
 const pairValid=!!p.frame&&p.frame.parent===p.mesh.parent&&Math.abs(p.mesh.position.x-p.frame.position.x)<1e-9&&Math.abs(p.mesh.position.y-p.frame.position.y)<1e-9&&Math.abs(p.frame.position.z-p.mesh.position.z-.06)<1e-9;
 pairs.push({text:p.text,pairValid,face:[...p.mesh.position],faceDimensions:[gp.width*p.mesh.scale.x,gp.height*p.mesh.scale.y],frameDimensions:gf?[gf.width*p.frame.scale.x,gf.height*p.frame.scale.y,gf.depth]:null,layout:p.layout??'vertical',mount:p.mesh.userData.nameboardMount??p.mesh.userData.hallNameboardMount??null});}
 const record={plaques:pairs,nonplaqueHash:hash(nonplaque),nonplaqueMeshes:nonplaque.length,walkablesHash:hash(z.kit.walkables),roomsHash:hash(z.kit.rooms),collidersHash:hash(z.kit.colliders)};
 z.kit.root.traverse(m=>m.geometry?.dispose());z.kit.dispose();lib.dispose();return record;
}
const rows=[];
for(const file of fs.readdirSync('data/zones').filter(f=>f.endsWith('.json'))){const d=JSON.parse(fs.readFileSync('data/zones/'+file));
 for(const item of d.items.filter(i=>i.name&&['gate','hall'].includes(i.kind))){const b=capture(Baseline,d,item);globalThis.gc?.();const c=capture(Current,d,item);globalThis.gc?.();rows.push({zone:d.id,name:item.name,kind:item.kind,historicalSite:!!item.historicalSite,plaqueCountBefore:b.plaques.length,plaqueCountAfter:c.plaques.length,nonplaqueEqual:b.nonplaqueHash===c.nonplaqueHash,nonplaqueMeshesBefore:b.nonplaqueMeshes,nonplaqueMeshesAfter:c.nonplaqueMeshes,walkablesEqual:b.walkablesHash===c.walkablesHash,roomsEqual:b.roomsHash===c.roomsHash,collidersEqual:b.collidersHash===c.collidersHash,before:b.plaques,after:c.plaques});console.error(rows.length,d.id,item.name);}
}
const summary={namedZoneEntities:rows.length,hallEntries:rows.filter(r=>r.kind==='hall').length,gateEntries:rows.filter(r=>r.kind==='gate').length,hallRegisteredBoards:rows.filter(r=>r.kind==='hall').reduce((s,r)=>s+r.plaqueCountAfter,0),gateRegisteredBoards:rows.filter(r=>r.kind==='gate').reduce((s,r)=>s+r.plaqueCountAfter,0),invalidPairs:rows.filter(r=>r.after.some(p=>!p.pairValid)).map(r=>r.name),nonplaqueChangesExcludingApprovedCanopies:rows.filter(r=>!r.nonplaqueEqual).map(r=>({zone:r.zone,name:r.name,old:r.nonplaqueMeshesBefore,new:r.nonplaqueMeshesAfter})),navigationChanges:rows.filter(r=>!r.walkablesEqual||!r.roomsEqual||!r.collidersEqual).map(r=>({name:r.name,walkablesEqual:r.walkablesEqual,roomsEqual:r.roomsEqual,collidersEqual:r.collidersEqual})),plaqueCountChanges:rows.filter(r=>r.plaqueCountBefore!==r.plaqueCountAfter).map(r=>r.name)};
fs.writeFileSync(path.join(outdir,'inventory-and-scope.json'),JSON.stringify({summary,method:'Per named zone item current/baseline production builders with real TextureLibrary and inert textures. Hashes exclude exact registered panel/backing objects and both approved canopy subtrees only; no GPU or photo acceptance.',rows},null,2));
console.log(JSON.stringify(summary,null,2));
