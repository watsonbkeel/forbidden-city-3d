import crypto from 'node:crypto';
import {captureGate} from './gate-tower-fixture.mjs';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
export const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v,(key,value)=>key==='uuid'?'RANDOM_UUID_NORMALIZED':value)).digest('hex');
export function captureRightLeaf(open=true){const c=captureGate();if(!open){c.builder.dispose();c.builder=new PalaceBuilder(new c.THREE.Scene(),c.lib);c.builder.finish=g=>{c.group=g;g.updateMatrixWorld(true);return g;};c.builder.buildGate({...c.data,lowerDoorsOpen:false});}return c;}
export function retainedSignature(c){
 const rows=[];c.group.updateMatrixWorld(true);
 function visit(o,path){if(o.userData.wumenRightLeafStuds)return;const r={path,type:o.type,name:o.name,visible:o.visible,layers:o.layers.mask,renderOrder:o.renderOrder,matrix:o.matrixWorld.toArray(),userData:o.userData};if(o.geometry)r.geometry={attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,{size:a.itemSize,values:Array.from(a.array)}])),index:o.geometry.index?Array.from(o.geometry.index.array):null,groups:o.geometry.groups};if(o.material)r.material=(Array.isArray(o.material)?o.material:[o.material]).map(m=>({name:m.name,type:m.type,color:m.color?.getHex(),roughness:m.roughness,metalness:m.metalness,side:m.side,visible:m.visible,transparent:m.transparent,opacity:m.opacity}));rows.push(digest(r));o.children.forEach((q,i)=>visit(q,path+'/'+i));}visit(c.group,'');
 return{objects:rows,colliders:digest(c.builder.colliders),walkables:digest(c.builder.walkables),colliderCount:c.builder.colliders.length,supportCount:c.builder.walkables.length};
}
export function verifyStudFace(c){
 const T=c.THREE,all=[];c.group.traverse(o=>{if(o.userData.wumenRightLeafStuds)all.push(o);});const check=(v,m)=>{if(!v)throw Error(m);};check(all.length===1,'one target group');const g=all[0],leaf=g.parent.children.find(o=>o.userData.wumenLowerPart==='door-solid');check(leaf,'own leaf');
 c.group.updateMatrixWorld(true);check(g.matrix.elements.every((v,i)=>Math.abs(v-leaf.matrix.elements[i])<1e-12),'group relative matrix equals leaf');
 for(let o=g;o;o=o.parent)check(o.visible,'ancestor visible');
 check(g.children.length===69,'69 visible sites');const used=new Set(),inverse=new T.Matrix4().copy(leaf.matrixWorld).invert(),w=leaf.geometry.parameters.width,h=leaf.geometry.parameters.height;
 for(const m of g.children){check(m.isMesh&&m.visible&&m.material.visible&&(!m.material.transparent||m.material.opacity>0),'visible actual cap');const [r,col]=m.userData.site,key=r+','+col;check(Number.isInteger(r)&&r>=1&&r<=9&&Number.isInteger(col)&&col>=1&&col<=8&&!used.has(key),'site identity');used.add(key);check(!['7,8','8,8','9,1'].includes(key),'unrendered site');
  const expected=new T.Matrix4().compose(new T.Vector3((.5-(.065+(col-1)*.875/7))*w,(.5-(.035+(r-1)*.935/8))*h,-.11),new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2),new T.Vector3(w*.0275,.015,w*.0275)),actual=new T.Matrix4().copy(inverse).multiply(m.matrixWorld);check(actual.elements.every((v,i)=>Math.abs(v-expected.elements[i])<1e-10),'cap->leaf actual matrix');
  const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const v=new T.Vector3().fromBufferAttribute(a,i),p=v.clone().applyMatrix4(actual),q=v.applyMatrix4(expected);check(p.distanceTo(q)<1e-9,'actual relative vertex');}
 }
 check(used.has('8,7'),'visible r8c7 retained');return g;
}
