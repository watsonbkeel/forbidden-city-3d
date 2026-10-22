// Reusable CPU audit. Consume the caller's already-built R52/R53 world; this
// helper never builds a world or loads/unloads an interior. S claims require
// the real InteriorLoader's collision tag to be present in that same world.
import * as THREE from 'three';
import {YANGXIN_WEST_ROOM_PLAN as P} from '../../src/scene/palace/special/YangxinWestWarmRooms.js';
export const YANGXIN_WORLD_FRAME=Object.freeze({x:108.6,z:277.5,floorY:.6,playerRadius:.5});
export function yangxinWorldRoute({roundTrip=true,includeApproach=true}={}) {
  const prefix=includeApproach?[[0,-16],[0,-3],[4.8,-3],[4.8,-.84]]:[[4.8,-.84]];
  const local=[...prefix,...P.route];if(roundTrip)local.push(...local.slice(0,-1).reverse());
  return local.map(([x,z])=>[YANGXIN_WORLD_FRAME.x+x,YANGXIN_WORLD_FRAME.z+z]);
}
function candidates(scene,routeBounds){
  const rows=[],p=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],bb=new THREE.Box3(),inst=new THREE.Matrix4(),matrix=new THREE.Matrix4();
  scene.updateWorldMatrix(true,true);
  scene.traverseVisible(m=>{if(!m.isMesh||!m.material||/^(COL_|WALK_)/.test(m.name))return;
    const pos=m.geometry?.attributes.position,idx=m.geometry?.index;if(!pos)return;
    if(!new THREE.Box3().setFromObject(m).intersectsBox(routeBounds))return;
    for(let j=0;j<(m.isInstancedMesh?m.count:1);j++){
      if(m.isInstancedMesh){m.getMatrixAt(j,inst);matrix.multiplyMatrices(m.matrixWorld,inst);}else matrix.copy(m.matrixWorld);
      for(let i=0;i<(idx?.count??pos.count);i+=3){for(let k=0;k<3;k++)p[k].fromBufferAttribute(pos,idx?idx.getX(i+k):i+k).applyMatrix4(matrix);bb.setFromPoints(p);if(bb.intersectsBox(routeBounds))rows.push({name:m.name||m.material.name,box:bb.clone(),triangle:new THREE.Triangle(...p.map(v=>v.clone()))});}
    }
  });return rows;
}
export function auditYangxinWorld(W,{layer='B'}={}) {
  if(!['B','S'].includes(layer))throw Error('Specify the actual B or S layer');
  if(!W.scene||!W.cm)throw Error('The caller must supply its already-built scene and collision manager');
  const sCount=W.cm.colliders.filter(c=>c.tag==='interior:yangxin').length;
  if((layer==='S'&&sCount!==10)||(layer==='B'&&sCount!==0))throw Error(`Requested ${layer}, but actual interior:yangxin collision count is ${sCount}`);
  const sGroup=W.scene.getObjectByName('interior:yangxin');let sMeshes=0,sTriangles=0,sOpaque=true;
  if(sGroup){let ancestor=sGroup;while(ancestor){if(!ancestor.visible)sOpaque=false;ancestor=ancestor.parent;}sGroup.traverseVisible(m=>{if(!m.isMesh||/^(COL_|WALK_)/.test(m.name))return;sMeshes++;sTriangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;for(const mat of(Array.isArray(m.material)?m.material:[m.material]))if(!mat?.visible||mat.opacity<=0)sOpaque=false;});}
  if(layer==='S'&&(!sGroup||sMeshes!==11||sTriangles!==8720||!sOpaque))throw Error(`Actual visible S geometry missing/incomplete: ${sMeshes} meshes, ${sTriangles} triangles, visible=${sOpaque}`);
  if(layer==='B'&&sGroup)throw Error('Requested B but an interior:yangxin scene group remains');
  const rooms=(W.rooms??W.zoneManager?.allRooms??[]).filter(r=>r.kind==='r53-yangxin-source-room');if(rooms.length!==4)throw Error(`Expected four R53 Yangxin rooms, got ${rooms.length}`);
  const mats=new Set();W.scene.traverseVisible(o=>{for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m?.name.startsWith('r53-yangxin-'))mats.add(m.name);});if(mats.size!==10)throw Error(`Expected ten permanent R53 materials, got ${mats.size}`);
  const route=yangxinWorldRoute({roundTrip:false,includeApproach:false}),{floorY,playerRadius:r}=YANGXIN_WORLD_FRAME;
  const bounds=new THREE.Box3().setFromPoints(route.map(([x,z])=>new THREE.Vector3(x,floorY+.35,z)));bounds.expandByVector(new THREE.Vector3(r,0,r));bounds.max.y=floorY+1.65;
  const rows=candidates(W.scene,bounds),body=new THREE.Box3(),pos=new THREE.Vector3(),blocked=[];let samples=0;
  for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/.08);for(let j=0;j<=n;j++){
    const x=THREE.MathUtils.lerp(a[0],b[0],j/n),z=THREE.MathUtils.lerp(a[1],b[1],j/n);samples++;pos.set(x,floorY+1.7,z);
    if(W.cm.checkCollision(pos,r))blocked.push({kind:'collision',x,z});
    body.min.set(x-r,floorY+.35,z-r);body.max.set(x+r,floorY+1.65,z+r);
    for(const row of rows)if(body.intersectsBox(row.box)&&body.intersectsTriangle(row.triangle)){blocked.push({kind:'visible-triangle',name:row.name,x,z});break;}
  }}
  for(const room of rooms)for(const p of[...room.doors,...room.spawns])if(W.cm.checkCollision(pos.set(p.x,floorY+1.7,p.z),r))blocked.push({kind:'room-point',room:room.name,...p});
  return{ok:blocked.length===0,layer,actualSProxyCount:sCount,actualSVisibleMeshes:sMeshes,actualSVisibleTriangles:sTriangles,roomCount:rooms.length,permanentMaterialCount:mats.size,samples,candidateTriangles:rows.length,blocked,physicalReplayRoute:yangxinWorldRoute(),scope:'ACTUAL_CALLER_WORLD_1M_BODY_AND_VISIBLE_TRIANGLES; NO_BROWSER_OR_GPU_CLAIM'};
}
