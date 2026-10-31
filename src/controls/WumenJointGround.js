import {WUMEN_JOINT_ASCENT_FIT} from './WumenJointAscentFit.js';

// Explicit local experiment only. These are subsets of one real ground top,
// not extra floors. Window boundaries are authorization limits, not walls.
const id='wumen-joint/test-ground';
const patches=['east','west'].map(side=>{
 const e=WUMEN_JOINT_ASCENT_FIT.pieces.find(p=>p.id===`${side}/entry`);
 return Object.freeze({id:`${side}/ground-approach`,sourceID:id,coordinateSpace:'WUMEN_LOCAL_XZ',axis:'x',minX:e.minX,maxX:e.maxX,minZ:e.maxZ,maxZ:e.maxZ+2,a0:e.minX,a1:e.maxX,y0:0,y1:0,authorityWindowNotPhysicalBoundary:true});
});
export const WUMEN_JOINT_GROUND_FIT=Object.freeze({id,coordinateSpace:'WUMEN_LOCAL_XZ',scope:'LOCAL_TEST_GROUND_NOT_ENVIRONMENT_WORLD_ACCEPTANCE',runtimeInstalled:false,routeAcceptance:false,bounds:Object.freeze([Object.freeze([-110,-.25,-40]),Object.freeze([110,0,40])]),patches:Object.freeze(patches)});

import * as THREE from 'three';
import {assertWumenJointOrdinarySurface,materialRecord,ordinaryExecution,plainRecord} from './WumenJointOrdinarySurface.js';
const fail=message=>{throw new TypeError(`Wumen joint ground: ${message}`);};
// Independent authored reference, not a recording of the supplied live owner.
const reference=new THREE.BoxGeometry(220,.25,80);reference.translate(0,-.125,0);reference.computeBoundingBox();reference.computeBoundingSphere();
const sameArray=(a,b)=>a?.length===b.length&&b.every((n,i)=>Object.is(a[i],n));
const flatBox=new THREE.Box3(new THREE.Vector3(-110,0,-40),new THREE.Vector3(110,0,40));
function sameAttribute(a,b){return ordinaryExecution(a,['isBufferAttribute'],['meshPerAttribute','data','buffer'])&&a.array?.constructor===b.array.constructor&&sameArray(a.array,b.array)&&['itemSize','count','normalized','gpuType','usage'].every(k=>a[k]===b[k])&&Array.isArray(a.updateRanges)&&a.updateRanges.length===0&&a.onUploadCallback===THREE.BufferAttribute.prototype.onUploadCallback;}
export function validateWumenJointTestGround(cm,owner,prior,index){
 const m=owner?.mesh,{material,ancestors}=assertWumenJointOrdinarySurface(m,id),g=m.geometry;
 if(!ordinaryExecution(g,['isBufferGeometry'],['instanceCount','_maxInstanceCount'])||Object.getPrototypeOf(g)!==THREE.BoxGeometry.prototype||m.morphTargetInfluences!==undefined||m.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender||!g.morphAttributes||Object.getPrototypeOf(g.morphAttributes)!==Object.prototype||Reflect.ownKeys(g.morphAttributes).length||Reflect.ownKeys(g.attributes).sort().join(',')!==Reflect.ownKeys(reference.attributes).sort().join(',')||Object.keys(reference.attributes).some(k=>!sameAttribute(g.attributes[k],reference.attributes[k]))||!sameAttribute(g.index,reference.index)||JSON.stringify(g.groups)!==JSON.stringify(reference.groups)||g.drawRange.start!==0||g.drawRange.count!==Infinity||!g.boundingBox?.equals(reference.boundingBox)||(g.boundingSphere!==null&&!g.boundingSphere?.equals(reference.boundingSphere)))fail('actual canonical whole visible ground geometry');
 const box=owner.collider,w=owner.walkable;
 if(!box?.isBox3||!box.equals(reference.boundingBox)||!plainRecord(w,['type','box','rescue'])||w.type!=='box'||w.rescue!==false||!w.box?.isBox3||!w.box.equals(flatBox))fail('authored ground body and flat top');
 const bodyRows=index.byMesh.get(box)??[],walkRows=cm.walkables.filter(r=>r.type==='box'&&r.box?.isBox3&&r.box.equals(flatBox));
 if(bodyRows.length!==1||!plainRecord(bodyRows[0],['mesh','box','tag'])||bodyRows[0].mesh!==box||!bodyRows[0].box?.equals(reference.boundingBox))fail('unique live ground body');
 if(walkRows.length!==1||!plainRecord(walkRows[0],['type','box','rescue','tag'])||walkRows[0].rescue!==false)fail('unique live ground flat support');
 const record={mesh:m,parent:m.parent,ancestors,geometry:g,material,materialState:materialRecord(material),collider:box,authoredWalkable:w,bodyRow:bodyRows[0],bodyTag:bodyRows[0].tag,walkable:walkRows[0],walkableTag:walkRows[0].tag};
 if(prior&&(['mesh','parent','geometry','material','materialState','collider','authoredWalkable','bodyRow','bodyTag','walkable','walkableTag'].some(k=>prior[k]!==record[k])||prior.ancestors.length!==ancestors.length||prior.ancestors.some((p,i)=>p!==ancestors[i])))fail('registered ground source identity changed');
 return record;
}
