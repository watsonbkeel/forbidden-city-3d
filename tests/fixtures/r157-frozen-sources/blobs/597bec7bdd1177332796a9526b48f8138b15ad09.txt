import * as THREE from 'three';
import { TAIHE_CORE as P } from './TaiheCoreProfile.js';
import { TAIHE_BEAM_TRIAL } from './TaiheBeamFrame.js';

// Overall6.8x2.8m is museum-published. Inner field and molding depths are
// photo-fit trials, not a measured profile. No photograph/extra atlas is used.
export const TAIHE_PLAQUE_FRAME = Object.freeze({
 fieldWidth:6,fieldHeight:2,addedTriangles:16,removedTriangles:2,baseTriangles:17924,
 rings:Object.freeze([
  [6.8,2.8,.080,6.12,2.12,.125,'taihe_dark_gold'],
  [6.12,2.12,.125,6.00,2.00,.081,'taihe_lacquer'],
 ].map(Object.freeze)),
});
const applied=new WeakMap();
const fail=why=>{throw Error('Taihe plaque surround: '+why);};
const near=(a,b)=>Math.abs(a-b)<1e-5;
export function plaqueFrameTriangles() {
 const batches=new Map(),center=P.plaque.bottomY+P.plaque.height/2;
 const corners=(w,h,d)=>[[-w/2,center-h/2,P.plaque.z-d],[w/2,center-h/2,P.plaque.z-d],[w/2,center+h/2,P.plaque.z-d],[-w/2,center+h/2,P.plaque.z-d]];
 for(const [w,h,d,wi,hi,di,mat]of TAIHE_PLAQUE_FRAME.rings){
  const out=corners(w,h,d),inside=corners(wi,hi,di),b=batches.get(mat)??{position:[],normal:[],uv:[]};
  for(let i=0;i<4;i++){const j=(i+1)%4;for(const tri of[[out[i],inside[i],out[j]],[out[j],inside[i],inside[j]]]){
   const a=new THREE.Vector3(...tri[0]),n=new THREE.Vector3(...tri[1]).sub(a).cross(new THREE.Vector3(...tri[2]).sub(a)).normalize();
   if(!Number.isFinite(n.z)||n.z>=0)fail('non-south-facing profile');
   for(const p of tri){b.position.push(...p);b.normal.push(...n.toArray());b.uv.push(0,0);}
  }}batches.set(mat,b);
 }
 return batches;
}
/** Bounded post-decode geometry installation inside the existing8 owned batches.
 * All changes are prepared before attachment. GPU upload has not happened yet;
 * replacing these owned CPU attributes cannot strand an uploaded buffer.
 * Runtime total is checked against the same18k cap, including the net14 and the existing60 permanent beam triangles.
 */
export function installTaihePlaqueSurround(root) {
 if(applied.has(root))fail('already installed');
 const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o);});
 const count=()=>meshes.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0);
 if(meshes.length!==8||count()!==TAIHE_PLAQUE_FRAME.baseTriangles)fail('unexpected decoded base');
 if(count()+TAIHE_PLAQUE_FRAME.addedTriangles-TAIHE_PLAQUE_FRAME.removedTriangles+TAIHE_BEAM_TRIAL.triangles>P.budgets.sVisibleTriangles)fail('unchanged18k core plus beam budget exceeded');
 const unique=name=>{const list=meshes.filter(m=>m.material.name===name);if(list.length!==1)fail('missing/duplicate '+name);return list[0];};
 const glyph=unique('taihe_glyph_atlas'),gold=unique('taihe_dark_gold'),red=unique('taihe_lacquer'),backing=unique('taihe_dark_wood');
 for(const m of[glyph,gold,red,backing]){
  m.updateMatrix();if(!m.matrix.equals(new THREE.Matrix4()))fail('unexpected local registration');
  const g=m.geometry;if(meshes.filter(o=>o.geometry===g).length!==1||!g.index||Object.keys(g.attributes).sort().join(',')!==(m===glyph?'normal,position,uv':'normal,position'))fail('unexpected geometry ownership/layout');
  if(![Uint16Array,Uint32Array].includes(g.index.array.constructor)||!g.index.array.every(i=>i<g.attributes.position.count))fail('invalid indices');
  for(const [key,a]of Object.entries(g.attributes))if(a.isInterleavedBufferAttribute||a.count!==g.attributes.position.count||!(a.array instanceof Float32Array)||!a.array.every(Number.isFinite))fail('invalid '+key);
 }
 const g=glyph.geometry,pos=g.attributes.position,uv=g.attributes.uv,norm=g.attributes.normal,ids=[];
 const cy=P.plaque.bottomY+P.plaque.height/2;
 for(let i=0;i<pos.count;i++)if(near(Math.abs(pos.getX(i)),(P.plaque.width-.18)/2)&&near(Math.abs(pos.getY(i)-cy),(P.plaque.height-.18)/2)&&near(pos.getZ(i),P.plaque.z-.081))ids.push(i);
 if(ids.length!==4||new Set(ids.map(i=>[Math.sign(pos.getX(i)),Math.sign(pos.getY(i)-cy)].join(','))).size!==4)fail('plaque quad identity');
 for(const i of ids){if(!near(norm.getX(i),0)||!near(norm.getY(i),0)||!near(norm.getZ(i),-1)||![0,1].some(v=>near(uv.getX(i),v))||![.625,1].some(v=>near(uv.getY(i),v)))fail('plaque atlas/normal identity');}
 const selected=new Set(ids);let faces=0;for(let k=0;k<g.index.count;k+=3){const hit=[0,1,2].map(j=>selected.has(g.index.getX(k+j)));if(hit.some(Boolean)){if(!hit.every(Boolean))fail('shared plaque vertex');faces++;}}if(faces!==2)fail('plaque face identity');
 // Retire only the two planar backing-front triangles now fully covered by
 // the frame rings plus the existing lettering quad. Keep every side/back face.
 const bg=backing.geometry,bp=bg.attributes.position,bn=bg.attributes.normal,retired=[];
 for(let k=0;k<bg.index.count;k+=3){const v=[0,1,2].map(j=>bg.index.getX(k+j));if(v.every(i=>near(Math.abs(bp.getX(i)),P.plaque.width/2)&&near(Math.abs(bp.getY(i)-cy),P.plaque.height/2)&&near(bp.getZ(i),P.plaque.z-.08)&&near(bn.getZ(i),-1)))retired.push(k);}
 if(retired.length!==2)fail('backing front identity');
 const retiredSet=new Set(retired),kept=Array.from(bg.index.array).filter((_,i)=>!retiredSet.has(i-i%3));
 const backingIndex=new THREE.BufferAttribute(new bg.index.array.constructor(kept),1);
 const prepared=[];
 for(const [name,b]of plaqueFrameTriangles()){
  const m=unique(name),geo=m.geometry,attributes={};const offset=geo.attributes.position.count;
  for(const [key,old]of Object.entries(geo.attributes)){const a=new Float32Array(old.array.length+b[key].length);a.set(old.array);a.set(b[key],old.array.length);attributes[key]=new THREE.BufferAttribute(a,old.itemSize,old.normalized);}
  const added=b.position.length/3,Type=geo.index.array.constructor,index=new Type(geo.index.count+added);index.set(geo.index.array);for(let i=0;i<added;i++)index[geo.index.count+i]=offset+i;
  prepared.push({geo,attributes,index:new THREE.BufferAttribute(index,1)});
 }
 const resized=pos.clone();for(const i of ids)resized.setXY(i,Math.sign(pos.getX(i))*TAIHE_PLAQUE_FRAME.fieldWidth/2,cy+Math.sign(pos.getY(i)-cy)*TAIHE_PLAQUE_FRAME.fieldHeight/2);
 for(const row of prepared){for(const[key,a]of Object.entries(row.attributes))row.geo.setAttribute(key,a);row.geo.setIndex(row.index);row.geo.computeBoundingBox();row.geo.computeBoundingSphere();}
 bg.setIndex(backingIndex);
 g.setAttribute('position',resized);g.computeBoundingBox();g.computeBoundingSphere();
 const result=Object.freeze({triangles:count(),addedTriangles:TAIHE_PLAQUE_FRAME.addedTriangles,removedTriangles:TAIHE_PLAQUE_FRAME.removedTriangles,meshes:meshes.length,changedGlyphVertices:ids.length});
 if(result.triangles!==17938)fail('final geometry count');applied.set(root,result);return result;
}
