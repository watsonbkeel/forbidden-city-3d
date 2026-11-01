import * as THREE from 'three';
/** Only the two shifted R123 corridor ramps. The source is the already rendered
 * sheet and adjacent closed landing, not the lower center-only walkable. No
 * new render geometry, invisible floor, global body or contact math. */
export function bindChuxiuCorridorRamp(kit,frame,landing,mesh,side){
 if(!['east','west'].includes(side)||frame.name!=='chuxiu-return-corridor'||frame.parent!==kit.root||landing.parent!==frame||mesh.parent!==frame||landing.name!=='chuxiu-corridor-floor'||mesh.name!=='chuxiu-corridor-threshold-ramp'||mesh.material!==kit.lib.material('stone_slab')||landing.material!==mesh.material)throw Error('Chuxiu corridor current source mismatch');
 frame.updateWorldMatrix(true,true);
 const p=mesh.geometry.attributes.position,ix=mesh.geometry.index,ax=side==='east'?82.4:105,bx=side==='east'?84.6:107.2;
 const expected=[ax,.46,420.6,bx,.46,420.6,ax,.61,421.6,bx,.61,421.6].map(Math.fround);
 if(p?.itemSize!==3||p.count!==4||!ix||ix.count!==6||![0,2,1,1,2,3].every((v,i)=>ix.getX(i)===v)||!expected.every((v,i)=>p.array[i]===v)||!mesh.matrixWorld.equals(new THREE.Matrix4()))throw Error('Chuxiu corridor finished ramp changed');
 const points=[],q=landing.geometry.attributes.position;
 if(q?.count!==36||landing.geometry.index)throw Error('Chuxiu corridor landing box changed');
 const canonical=new THREE.BoxGeometry(bx-ax,.46,420.601-411.94),closed=canonical.toNonIndexed();
 const intact=q.array.every((v,i)=>v===closed.attributes.position.array[i]);canonical.dispose();closed.dispose();
 if(!intact)throw Error('Chuxiu corridor landing closed faces changed');
 for(let i=0;i<q.count;i++){const v=new THREE.Vector3().fromBufferAttribute(q,i).applyMatrix4(landing.matrixWorld);points.push(v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z)));}
 const owner=new THREE.Box3().setFromPoints(points);
 if(owner.max.y!==Math.fround(.46)||owner.min.y!==Math.fround(.23-Math.fround(.23))||owner.min.x!==Math.fround(ax)||owner.max.x!==Math.fround(bx)||owner.min.z!==Math.fround(411.94)||owner.max.z!==Math.fround(420.601))throw Error('Chuxiu corridor finished landing changed');
 const ramp={type:'ramp',axis:'z',minX:p.getX(0),maxX:p.getX(1),minZ:p.getZ(0),maxZ:p.getZ(2),a0:p.getZ(0),a1:p.getZ(2),y0:p.getY(0),y1:p.getY(2)};
 owner.furnitureMotionScope={kind:'stair-interface',id:`chuxiu-corridor-${side}-ramp`,groundY:0,ramp,rampOrigin:owner.min.toArray(),minOffsetX:-1,maxOffsetX:owner.max.x-owner.min.x+1,minOffsetZ:419.5-owner.min.z,maxOffsetZ:424-owner.min.z};
 owner.chuxiuCorridorSource={id:`chuxiu-corridor-${side}-landing`,source:'actual-F32-closed-landing-and-rectangular-ramp'};
 kit.colliders.push(owner);return owner;
}
