import assert from 'node:assert/strict';
import {PLAYER} from '../../src/config/constants.js';
import {wenhuaGateDescentProof} from '../../src/scene/palace/special/WenhuaGateApproaches.js';
import {xiqingSurfaceFootContact} from '../../src/controls/XiqingRoofSurface.js';
import {withTerrainController} from './r91-controller-clock.mjs';
import {createPhysicalWaypointDriver} from './physical-waypoints.mjs';
import {reachFrom} from './world.mjs';

/** Exact original source ownership, not a coordinate exemption. The caller owns
 * the already finished world, original CM and all neighboring collision owners.
 * No product changes or registered source replacement occur in this adapter. */
export function bindWenhuaCurrentAccess(W,g){
 assert.equal(g.zone,'outer-east','Wenhua source zone');
 const zones=W.zones.map(z=>z.json??z).filter(z=>z.id==='outer-east');assert.equal(zones.length,1,'unique source zone');
 const item=zones[0].items[0];assert.equal(g.item,item,'original canonical item identity');assert.equal(item.southGateProfile,'wenhua');assert.equal(item.name,'文华门');
 const finished=W.finishedZones?.filter(z=>z.id==='outer-east');assert.equal(finished?.length,1,'one actual finished source zone');
 const f=finished[0],kit=f.builder.kit;assert.equal(f.group,f.builder.group,'original builder finished group');assert.equal(f.group,f.data?.group,'finished group source');assert.equal(f.group.visible,true,'visible finished source group');assert.equal(f.group.position.lengthSq(),0,'unmoved finished source group');assert.ok(f.group.rotation.toArray().slice(0,3).every(v=>v===0)&&f.group.scale.toArray().every(v=>v===1),'untransformed finished source group');assert.equal(g.x,item.x);assert.equal(g.z,item.z);
 const records=f.group.userData.architecture.filter(r=>r.id==='south-gate:wenhua');assert.equal(records.length,1,'unique finished source metadata');
 assert.equal(records[0].wenhuaGateApproaches?.south.run,2.56);assert.equal(records[0].wenhuaGateApproaches?.north.run,8);
 const owned=W.cm.colliders.filter(c=>W.ownerOf(c)?.zone===g.zone&&W.ownerOf(c)?.item===item);assert.equal(owned.length,30,'complete original source owner count');assert.equal(new Set(owned.map(c=>c.mesh)).size,30,'unique original source owners');
 for(const c of owned){assert.equal(kit.colliders.filter(v=>v===c.mesh).length,1,'original kit source owner');assert.equal(f.data.colliders.filter(v=>v===c.mesh).length,1,'original finished source owner');assert.ok(c.box.equals(c.mesh),'registered source bounds');assert.equal(W.cm.colliders.filter(v=>v.mesh===c.mesh).length,1,'unique registered source owner');
  if(c.mesh.xiqingRoofSurface){assert.equal(c.xiqingRoofSurface?.id,c.mesh.xiqingRoofSurface.id,'registered source identity');assert.deepEqual(c.xiqingRoofSurface.template,c.mesh.xiqingRoofSurface.template,'registered source template');assert.ok(c.xiqingRoofSurface.box.equals(c.box),'registered source shape bounds');}
 }
 const one=id=>{const a=owned.filter(c=>c.xiqingRoofSurface?.id===id);assert.equal(a.length,1,'unique approach source owner '+id);return a[0];};
 const south=one('wenhua-gate-approach-south'),north=one('wenhua-gate-approach-north'),proof=wenhuaGateDescentProof(south.mesh);
 assert.ok(proof&&proof.kit===kit,'actual immutable descent source proof');assert.equal(proof.frame.userData.structure.id,'south-gate:wenhua');
 const posts=owned.filter(c=>c.furnitureMotionScope?.kind==='wenhua-gate-approaches');assert.equal(posts.length,1,'unique actual source dispatch post');assert.ok(posts[0].mesh.wenhuaGateApproach?.kind==='REAL_PLAIN_POST','visible source post');
 const caps=south.xiqingRoofSurface.template.triangles.filter(q=>Number.isInteger(q.source.retainedOriginalTriangle));assert.ok(caps.length>=2,'retained actual cap faces required');
 const capY=caps[0].triangle.a.y;assert.ok(Number.isFinite(capY)&&capY>0);assert.ok(caps.every(q=>q.normal.y>0&&[q.triangle.a,q.triangle.b,q.triangle.c].every(p=>p.y===capY)),'actual planar cap');
 const contact=xiqingSurfaceFootContact(south.xiqingRoofSurface,item.x,item.z,capY,.5);assert.ok(contact&&Number.isInteger(contact.source.retainedOriginalTriangle),'gate footprint must touch retained actual cap');assert.equal(contact.height,capY);
 assert.equal(W.cm.getGroundHeight(item.x,item.z,capY,0,.5),capY,'actual all-owner support equals cap');
 const centerBlocked=W.cm.checkCollision(new W.THREE.Vector3(item.x,capY+PLAYER.HEIGHT,item.z),.5);assert.equal(centerBlocked,false,'actual source-height center blocked');
 const legacyFeet=records[0].ph;assert.ok(Number.isFinite(legacyFeet),'finite original nominal source height');assert.equal(legacyFeet,g.platformY,'original gate QA nominal datum');const legacyCenterBlocked=W.cm.checkCollision(new W.THREE.Vector3(item.x,legacyFeet+PLAYER.HEIGHT,item.z),.5);assert.equal(legacyCenterBlocked,true,'old nominal source datum remains invalid');
 const slope=c=>{const faces=c.xiqingRoofSurface.template.triangles.filter(q=>q.normal.y>0&&q.box.min.y===0&&q.box.max.y===capY&&q.box.min.x<=item.x-.5&&q.box.max.x>=item.x+.5&&q.box.min.z!==q.box.max.z);assert.equal(faces.length,2,'two actual center incline faces');const points=faces.flatMap(q=>[q.triangle.a,q.triangle.b,q.triangle.c]),toe=points.filter(p=>p.y===0).map(p=>p.z),top=points.filter(p=>p.y===capY).map(p=>p.z);assert.ok(toe.length&&top.length);assert.equal(new Set(toe).size,1);assert.equal(new Set(top).size,1);return{toe:toe[0],top:top[0]};};
 const s=slope(south),n=slope(north);assert.ok(s.toe<s.top&&s.top<item.z&&item.z<n.top&&n.top<n.toe,'actual approach direction');
 assert.ok(W.environmentScene,'actual Environment scene required');
 const ground=(x,z)=>{W.environmentScene.updateMatrixWorld(true);const hit=new W.THREE.Raycaster(new W.THREE.Vector3(x,.05,z),new W.THREE.Vector3(0,-1,0),0,.1).intersectObject(W.environmentScene,true)[0];assert.ok(hit&&hit.object.userData.environmentGroundSource===true&&Math.abs(hit.point.y)<1e-10,'actual Environment ground witness required');return hit;};
 ground(item.x,s.toe-4);ground(item.x,n.toe+4);
 return {receipt:{profile:'wenhua-current-source-access',capY,southToe:s.toe,northToe:n.toe,southTop:s.top,northTop:n.top,southExtent:item.z-s.toe,northExtent:n.toe-item.z,colliders:owned.length,legacyFeet,legacyCenterBlocked,centerBlocked,scope:'EXACT_CALLER_WORLD_GATE_ONLY_NOT_HALL_ROUTES'},ground};
}

export function checkWenhuaCurrentAccess(W,g){
 const bound=bindWenhuaCurrentAccess(W,g),r=bound.receipt,{cm,THREE}=W,item=g.item;
 const result={...r,bodyContract:'ORIGINAL_NATIVE_LOGICAL_STEP_NOT_RENDERED_VOLUME_ZERO_INTERSECTION',runs:[],outside:[],faults:[]};
 for(const offset of [0,2.1])for(const fps of [10,30,60]){
  const x=item.x+offset,zs=[r.southToe-4,r.southToe,r.southTop,item.z,r.northTop,r.northToe,r.northToe+4],go=zs.map(z=>[x,z]),points=[...go,...go.slice(0,-1).reverse()],row={offset,fps,arrived:false,crossings:0,maxFeet:0};
  try{bound.ground(x,zs[0]);bound.ground(x,zs.at(-1));withTerrainController(cm,(c,cam,tick)=>{
   const driver=createPhysicalWaypointDriver(points);c.setPosition(x,PLAYER.HEIGHT,zs[0]);assert.equal(c.feetY,0);assert.equal(c.airborne,false);assert.equal(cm.checkCollision(cam.position,.5),false,'actual legal ground start');c.moveForward=true;
   const pos=()=>[cam.position.x-c.bobOffset.x,cam.position.z-c.bobOffset.z];let stagnant=0;
   for(let frame=0;frame<fps*45&&!driver.complete;frame++){
    const a=pos(),cmd=driver.command(a,false);cam.position.sub(c.bobOffset);cam.lookAt(cmd.target[0],cam.position.y,cmd.target[1]);cam.position.add(c.bobOffset);cam.updateMatrixWorld(true);tick(fps);const b=pos();driver.observe(a,b);assert.ok([...b,c.feetY,c.groundY].every(Number.isFinite));row.maxFeet=Math.max(row.maxFeet,c.feetY);stagnant=Math.hypot(b[0]-a[0],b[1]-a[1])<1e-8?stagnant+1:0;if(stagnant>fps*2)break;
   }
   row.arrived=driver.complete;row.crossings=driver.diagnostics.crossings.length;row.last=pos();assert.equal(driver.complete,true,'actual continuous Wenhua route blocked');assert.equal(row.crossings,points.length-1);assert.equal(row.maxFeet,r.capY,'actual source cap traversed');
   c.moveForward=false;for(let frame=0;frame<fps*2;frame++)tick(fps);row.endFeet=c.feetY;assert.equal(row.endFeet,0);assert.equal(c.airborne,false);bound.ground(...pos());
  });}catch(e){row.error=e.message;result.faults.push(`lane ${offset} ${fps}Hz ${e.message}`);}result.runs.push(row);
 }
 for(const [side,sign,extent]of [['south',-1,r.southExtent],['north',1,r.northExtent]]){
  const start=[item.x,item.z+sign*(extent+.7)],required=extent+12;bound.ground(...start);
  const check=reachFrom(W,start,[item.x,item.z],required,(x,z)=>(z-item.z)*sign<extent,.5,{gate:'wenhua-current-source-access',side});
  result.outside.push({side,start,required,...check});if(check.blockedStart)result.faults.push(side+' actual toe+0.7 blocked');else if(check.maxDist<required)result.faults.push(side+' original twelve metre outside reach failed');
 }
 return result;
}
