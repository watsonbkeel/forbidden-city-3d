// Wumen-only fixture. No world construction. Production PalaceBuilder stays unedited here.
import * as THREE from 'three';
import {buildHallBody} from '../../src/scene/HallKit.js';
import {captureGate,meshFingerprint} from './gate-tower-fixture.mjs';
export const TARGET='INSTANCE-A-WUMEN-EAST-NORTH-PAVILION';
export function pavilionBody(group,data) {
 const d=data.dimensions,x=-(d.wingInnerX+.6+d.wingHallWidth/2),z=-.5-d.cornerPavilion/2;
 const bodies=group.children.filter(c=>Math.abs(c.position.x-x)<1e-8&&Math.abs(c.position.z-z)<1e-8&&c.userData.topY===7.5);
 if(bodies.length!==1)throw Error('Expected one existing northeast pavilion body, not a child slot');
 return bodies[0];
}
export function northColumns(body) {return body.children.filter(c=>c.geometry?.type==='CylinderGeometry'&&Math.abs(c.position.z-5.5)<1e-8).sort((a,b)=>a.position.x-b.position.x);}
export function captureSource() {
 const c=captureGate(),body=pavilionBody(c.group,c.data);
 // After integrator hookup, recreate only the explicitly frozen HallKit body for
 // source comparison; verify its exact frozen fingerprint in regression.
 if(body.userData.structure?.id===TARGET){
  const index=c.group.children.indexOf(body),old=buildHallBody(c.lib,{width:11,depth:11,height:7.5,bays:3,facade:'lattice'});
  old.position.copy(body.position);c.group.remove(body);c.group.add(old);c.group.children.splice(c.group.children.indexOf(old),1);c.group.children.splice(index,0,old);
 }
 c.group.updateMatrixWorld(true);c.body=pavilionBody(c.group,c.data);return c;
}
export function applyCandidate(c,api) {api?.refineWumenPavilionNorthColumns(c.body,{instanceId:TARGET});c.group.updateMatrixWorld(true);return c;}
export function bodyFingerprint(body){return meshFingerprint(body);}
export function rawGeometry(root){root.updateMatrixWorld(true);const rows=[];root.traverse(o=>{if(!o.isMesh)return;rows.push({name:o.name,geometryType:o.geometry.type,parameters:o.geometry.parameters,position:o.position.toArray(),matrixWorld:o.matrixWorld.toArray(),material:o.material.name,attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,array:Array.from(a.array)}])),index:o.geometry.index?Array.from(o.geometry.index.array):null});});return rows;}
