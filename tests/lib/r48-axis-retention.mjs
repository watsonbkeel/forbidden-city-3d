import * as THREE from 'three';
import {hash,serial,library,hallSurfaces} from './inner-palace-fixture.mjs';
export async function captureAxis(root=new URL('../../',import.meta.url)){
 const {PalaceBuilder}=await import(new URL('src/scene/PalaceBuilder.js',root)),{PALACE_LAYOUT}=await import(new URL('src/scene/Layout.js',root));
 const b=new PalaceBuilder(new THREE.Scene(),library()),out={},original=b.buildHall;
 b.buildHall=function(g,data,y,opts){const childStart=g.children.length,cStart=this.colliders.length,wStart=this.walkables.length;const result=original.call(this,g,data,y,opts),part=new THREE.Group();for(const m of g.children.slice(childStart))part.add(m.clone(true));part.updateMatrixWorld(true);
 const all=hallSurfaces(part,y),newBaohe=[],boxes=[];part.traverse(m=>{if(!m.isMesh||!m.userData.baoheWarmRoom)return;newBaohe.push(m);if(m.userData.baoheWarmRoom.role==='plain-fitted-crest')return;const box=new THREE.Box3().setFromObject(m);box.translate(new THREE.Vector3(this.ox,0,this.oz));boxes.push(box);});for(const m of newBaohe)m.removeFromParent();
 const colliders=this.colliders.slice(cStart),same=(a,c)=>a.min.distanceTo(c.min)<1e-5&&a.max.distanceTo(c.max)<1e-5;
 out[data.name]={geometry:hash(all),withoutBaoheAddition:hash(hallSurfaces(part,y)),newBaoheMeshes:newBaohe.length,colliders:hash(colliders.map(serial)),withoutBaoheColliders:hash(colliders.filter(c=>!boxes.some(box=>same(box,c))).map(serial)),walkables:hash(this.walkables.slice(wStart))};return result;};
 try{b.buildAll(PALACE_LAYOUT);return out;}finally{b.dispose();}
}
