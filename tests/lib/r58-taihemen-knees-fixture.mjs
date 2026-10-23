// Taihemen only, through the actual production builder and merge path.
// The before case removes only the single new knee call in memory. No source
// file is rewritten and no older enclosure/roof state is substituted.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {library} from './inner-palace-fixture.mjs';
export const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const builderURL=new URL('../../src/scene/PalaceBuilder.js',import.meta.url);
const enclosureURL=new URL('../../src/scene/palace/special/TaihemenEnclosure.js',import.meta.url);
export const hook='  buildTaihemenSouthKnees(builder, group, {x0,z0,y,w,d,H,beamH,r});';
export const enclosureSource=readFileSync(enclosureURL,'utf8');
if(enclosureSource.split(hook).length!==2)throw Error('Expected exactly one Taihemen knees hookup');
const absolute=(source,base)=>source.replace(/from '([^']+)'/g,(_,s)=>`from '${s==='three'?import.meta.resolve('three'):new URL(s,base).href}'`);
const dataURL=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const previousEnclosure=dataURL(absolute(enclosureSource.replace(hook,''),enclosureURL));
const builderSource=readFileSync(builderURL,'utf8');
const current=await import(builderURL.href);
const previous=await import(dataURL(absolute(builderSource,builderURL).replace(new URL('./palace/special/TaihemenEnclosure.js',builderURL).href,previousEnclosure)));
export function triangleRows(root,{includeKnees=true,onlyKnees=false}={}){
 root.updateMatrixWorld(true);const rows=[];
 root.traverse(m=>{if(!m.isMesh)return;const isKnee=m.material.name==='taihemen-south-knee-teal';if((!includeKnees&&isKnee)||(onlyKnees&&!isKnee))return;
  const p=m.geometry.attributes.position,idx=m.geometry.index;
  const mat={name:m.material.name,color:m.material.color?.getHex(),side:m.material.side,roughness:m.material.roughness,metalness:m.material.metalness,transparent:m.material.transparent,opacity:m.material.opacity,depthWrite:m.material.depthWrite};
  for(let i=0;i<(idx?.count??p.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);
   rows.push({material:mat,v:ids.map(k=>new THREE.Vector3().fromBufferAttribute(p,k).applyMatrix4(m.matrixWorld).toArray()),attributes:ids.map(k=>Object.fromEntries(Object.entries(m.geometry.attributes).map(([name,a])=>[name,Array.from(a.array.subarray(k*a.itemSize,(k+1)*a.itemSize))])))});
  }
 });return rows;
}
export function kneeFixture({candidate=true}={}){
 const Base=(candidate?current:previous).PalaceBuilder;
 class Tracked extends Base{
  column(...args){super.column(...args);this.columns??=[];this.columns.push(args.slice(3));}
 }
 const scene=new THREE.Scene(),builder=new Tracked(scene,library()),data=structuredClone(PALACE_LAYOUT.find(g=>g.name==='太和门'));
 builder.buildGate(data);scene.updateMatrixWorld(true);const root=scene.getObjectByName('太和门');
 const cm=new CollisionManager();cm.addColliders(builder.colliders);cm.addWalkables(builder.walkables);
 return {THREE,scene,builder,root,cm,data,p:root.userData.taihemenSouth};
}
