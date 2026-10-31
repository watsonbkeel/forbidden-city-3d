import fs from 'node:fs';
import * as T from '../r157-wumen-joint-layout-1622/node_modules/three/build/three.module.js';
import {CollisionManager} from '../r157-wumen-joint-layout-1622/src/utils/Collision.js';
import {buildWumenAscentContactRig} from '../r157-wumen-joint-layout-1622/scripts/photo-fidelity/batches/wumen-joint-layout/ascent-contact.mjs';
import {registerWumenJointAscentOwners,validateWumenJointAscentBinding} from '../r157-wumen-joint-layout-1622/src/controls/WumenJointAscentContact.js';
const cases=[
 ['zero-instance mesh',({rig})=>{const p=rig.pieces[0],old=p.mesh;const m=new T.InstancedMesh(old.geometry,old.material,0);m.name=old.name;p.mesh=m;}],
 ['position morph +100m',({rig})=>{const m=rig.pieces[0].mesh,a=m.geometry.attributes.position.clone();for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)+100);m.geometry.morphAttributes.position=[a];m.updateMorphTargets();m.morphTargetInfluences[0]=1;}],
 ['colorWrite false',({mat})=>{mat.colorWrite=false;}],
 ['alphaTest 2',({mat})=>{mat.alphaTest=2;}],
 ['detached visible mesh after registration',({rig})=>{const g=new T.Group();g.add(rig.pieces[0].mesh);return()=>g.remove(rig.pieces[0].mesh);}],
 ['non-CollisionManager object',state=>{state.cm={colliders:state.cm.colliders,walkables:state.cm.walkables};}],
];
const results=[];
for(const [name,mutate]of cases){const mat=new T.MeshStandardMaterial(),rig=buildWumenAscentContactRig(mat),cm=new CollisionManager();for(const p of rig.pieces){cm.addColliders(p.colliders);cm.addWalkable(p.walkable);}const state={mat,rig,cm};let b;try{const after=mutate(state);b=registerWumenJointAscentOwners(state.cm,rig.pieces);after?.();const r=validateWumenJointAscentBinding(state.cm);results.push({name,accepted:!!r,type:rig.pieces[0].mesh.type,isInstancedMesh:!!rig.pieces[0].mesh.isInstancedMesh});}catch(e){results.push({name,accepted:false,error:String(e)});}finally{b?.dispose();rig.dispose();mat.dispose();}}
fs.writeFileSync(new URL('./probes.json',import.meta.url),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
