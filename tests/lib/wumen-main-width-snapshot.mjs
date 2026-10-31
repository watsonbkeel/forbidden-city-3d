import {captureGate,meshFingerprint} from './gate-tower-fixture.mjs';
import {renderStateHash} from './r157-wumen-main-signature.mjs';
import {digest,verifyStudFace} from './wumen-right-leaf-fixture.mjs';
export function snapshotWidth(c=captureGate()){
 c.group.updateMatrixWorld(true); const mainWorld=c.tower.userData.colliders.map(b=>b.clone().translate(new c.THREE.Vector3(c.data.position.x,c.tower.position.y,c.data.position.z)));
 const outside=[...c.builder.colliders];for(const b of mainWorld){const i=outside.findIndex(x=>x.equals(b));if(i<0)throw Error('Missing registered main collider');outside.splice(i,1);}
 verifyStudFace(c);
 return {outside:{geometry:meshFingerprint(c.group,c.tower),render:c.group.children.filter(o=>o!==c.tower).map(renderStateHash),physics:digest(outside),supports:digest(c.builder.walkables),colliders:outside.length,supportCount:c.builder.walkables.length},
 pose:{position:c.tower.position.toArray(),quaternion:c.tower.quaternion.toArray(),scale:c.tower.scale.toArray(),anchor:c.data.position},
 rows:c.tower.children.map((m,i)=>({i,part:m.userData.gatePart,data:m.userData,position:m.position.toArray(),quaternion:m.quaternion.toArray(),scale:m.scale.toArray(),visible:m.visible,render:renderStateHash(m),geometry:{attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,array:Array.from(a.array)}])),index:m.geometry.index?Array.from(m.geometry.index.array):null,groups:m.geometry.groups}})),
 localColliders:c.tower.userData.colliders.map(b=>({min:b.min.toArray(),max:b.max.toArray()})),metadata:c.tower.userData.structure};
}
