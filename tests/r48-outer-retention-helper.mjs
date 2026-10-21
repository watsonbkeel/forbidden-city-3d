import {createHash} from 'node:crypto';
import {CourtKit} from '../src/scene/palace/kit.js';
import {buildWenyuanPavilion} from '../src/scene/palace/special/WenyuanPavilion.js';
import {buildYudeBath} from '../src/scene/palace/special/YudeBath.js';
import {library} from './lib/inner-palace-fixture.mjs';
import * as api from '../src/scene/palace/special/RemainingOuterHalls.js';
export function retentionSignature(row){
 const kit=new CourtKit(library(),row.zone),p=api.resolveRemainingProfile(row.zone,row.baselineItem);
 try{const built=p.mode==='replace'?api.buildRemainingHall(kit,row.baselineItem,p):api.augmentRemainingHall(kit,row.baselineItem,p.key==='wenyuan'?buildWenyuanPavilion(kit,row.baselineItem):p.key==='yude'?buildYudeBath(kit,row.baselineItem):kit.hall(row.baselineItem),p);kit.buildPlaqueAtlas();kit.root.updateMatrixWorld(true);
 const hash=createHash('sha256');let meshes=0,triangles=0;
 built.f.traverse(n=>{if(!n.isMesh)return;meshes++;const g=n.geometry;triangles+=(g.index?.count??g.attributes.position.count)/3;hash.update(JSON.stringify({name:n.name,matrix:n.matrixWorld.elements,materials:(Array.isArray(n.material)?n.material:[n.material]).map(m=>({name:m.name,color:m.color?.getHex(),side:m.side,transparent:m.transparent,opacity:m.opacity})),index:g.index?Array.from(g.index.array):null,attributes:Object.fromEntries(Object.entries(g.attributes).map(([key,a])=>[key,Array.from(a.array)]))}));});
 const encode=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');return{geometry:hash.digest('hex'),meshes,triangles,colliders:encode(kit.colliders),walkables:encode(kit.walkables),rooms:encode(kit.rooms),regions:encode(kit.regions),mapItems:encode(kit.mapItems),navigation:encode(p.navigation)};
 }finally{kit.dispose(kit.root)}
}
