import assert from 'node:assert/strict';
import {PLAYER} from '../../src/config/constants.js';
import {shoukangGeometry} from '../../src/scene/palace/special/ShoukangHall.js';
import {SHOUKANG_ENTRY_REGION} from '../../src/controls/ShoukangEntrySupport.js';
import {shoukangEntryEnvironmentWitness} from '../../src/controls/ShoukangEntryEnvironmentWitness.js';
import {triangleOpenIntersection} from '../../scripts/r120/triangle-open-oracle.mjs';
import {withTerrainController} from './r91-controller-clock.mjs';
import {createPhysicalWaypointDriver} from './physical-waypoints.mjs';
import {walkStraight} from './world.mjs';
const bounds=b=>[...b.min.toArray(),...b.max.toArray()];
const supportKey=w=>JSON.stringify(w.box?bounds(w.box):[...w.min,...w.max]);
/** Caller owns the actual completed world, collision manager, source geometry,
 * Environment and disposal. No reconstruction, native motion forgery, global
 * step change, source-solid removal or midway position/feet rewrite occurs.
 */
export function checkShoukangCurrentAccess(W){
 const zone=W.zones.map(z=>z.json??z).find(z=>z.id==='outer-west');assert.ok(zone,'source zone required');
 const fronts=zone.items.filter(i=>i.structure==='shoukang-front-hall');assert.equal(fronts.length,1,'unique canonical source');
 const front=fronts[0],geometry=shoukangGeometry(front);assert.equal(zone.items[47],front,'canonical source item identity');
 const finished=W.finishedZones?.filter(z=>z.id==='outer-west')??[];assert.equal(finished.length,1,'one finished source zone required');const actual=finished[0];
 const records=(actual.group.userData.architecture??[]).filter(r=>r.id===geometry.id);assert.equal(records.length,1,'finished source architecture required');
 const record=records[0];assert.equal(record.profile,geometry.profile);assert.deepEqual(record.bayAxes,geometry.bayAxes);assert.equal(record.southEnclosure?.physicalOwners,40);assert.equal(record.southEnclosure?.doorLeaves,12);assert.equal(record.southEnclosure?.windowLeaves,8);
 const owned=W.cm.colliders.filter(c=>W.ownerOf(c)?.zone===zone.id&&W.ownerOf(c)?.item===front),source=owned.map(c=>c.mesh);
 assert.equal(owned.length,171,'actual source owner count');assert.equal(new Set(source).size,171,'duplicate source owner');
 for(const c of owned){assert.ok(actual.data.colliders.filter(b=>b===c.mesh).length===1&&actual.builder.kit.colliders.filter(b=>b===c.mesh).length===1,'original finished source owner required');assert.ok(c.box.equals(c.mesh),'exact source bounds');for(const k of ['triangleSupport','xiqingRoofSurface']){assert.equal(c[k]?.id,c.mesh[k]?.id,'exact source shape');if(c[k]){assert.deepEqual(c[k].template,c.mesh[k].template,'exact source template');if(c[k].offset)assert.ok(c[k].offset.equals(c.mesh[k].offset),'exact source offset');}}}
 const count={total:171,box:source.filter(c=>!c.xiqingRoofSurface&&!c.triangleSupport).length,xiqing:source.filter(c=>c.xiqingRoofSurface).length,triangle:source.filter(c=>c.triangleSupport).length};assert.deepEqual(count,{total:171,box:124,xiqing:7,triangle:40});
 assert.equal(source.filter(c=>c.triangleSupport?.id.startsWith('shoukang-south-leaf:')).length,40);assert.equal(source.filter(c=>c.r140ShoukangSouthStep).length,35);
 const support=actual.builder.kit.walkables.filter(w=>w.r140ShoukangSouthStep);assert.equal(support.length,28,'actual source support count');for(const w of support){assert.ok(actual.data.walkables.includes(w),'finished source support identity');assert.equal(W.cm.walkables.filter(c=>c.type==='box'&&supportKey(c)===supportKey(w)).length,1,'actual source support missing/duplicated');}
 const stepOwners=owned.filter(c=>c.furnitureMotionScope?.kind==='shoukang-south-steps');assert.equal(stepOwners.length,1,'unique source step scope');const step=stepOwners[0],ss=step.mesh.furnitureMotionScope;assert.ok(ss,'original source step scope');assert.deepEqual(step.furnitureMotionScope,{kind:ss.kind,id:ss.id,groundY:ss.groundY,minX:step.mesh.min.x+ss.minOffsetX,maxX:step.mesh.min.x+ss.maxOffsetX,minZ:step.mesh.min.z+ss.minOffsetZ,maxZ:step.mesh.min.z+ss.maxOffsetZ},'exact source step scope');
 const ground=shoukangEntryEnvironmentWitness(W.cm,{...SHOUKANG_ENTRY_REGION,id:'shoukang-entry',kind:'shoukang-entry'},289.2,193.9,.5);assert.equal(ground?.source,'existing-environment-ground-shoukang-entry','actual original ground witness required');assert.equal(ground.height,0);assert.ok(W.environmentScene,'actual Environment scene required');
 const {THREE,cm}=W,body=(x,z,feet)=>new THREE.Box3(new THREE.Vector3(x-.5,feet,z-.5),new THREE.Vector3(x+.5,feet+PLAYER.HEIGHT,z+.5));
 const intersects=box=>source.flatMap((c,i)=>{if(!box.intersectsBox(c))return [];const shape=c.xiqingRoofSurface??c.triangleSupport;if(shape){for(const{triangle:t}of shape.template.triangles){const vertices=[t.a,t.b,t.c].map(v=>shape.offset?v.clone().add(shape.offset):v);if(triangleOpenIntersection(vertices,box).penetrates)return[{i,kind:'triangle',id:shape.id}];}return [];}return ['x','y','z'].every(k=>Math.min(box.max[k],c.max[k])>Math.max(box.min[k],c.min[k]))?[{i,kind:'box',bounds:bounds(c)}]:[];});
 const result={profile:'shoukang-current-native-front-access',identity:geometry.id,sourceCounts:count,sourceSupports:28,strictOracle:'FULL_RENDERED_BODY_POSITIVE_VOLUME_BOX_AND_SOURCE_TRIANGLE',legacyObservations:{center:walkStraight(W,[289.2,218.1],[289.2,223.3])},negative:[],runs:[],faults:[]};
 for(const[id,p,kind]of [['actual-side-wall',[275.75,231,.75],'box'],['actual-central-stone',[289.2,220.35,0],'triangle'],['old-negative-side-column',[287,222.3,.75],'box'],['old-positive-side-column',[291.4,222.3,.75],'box']]){const hits=intersects(body(...p));assert.ok(hits.some(h=>h.kind===kind),id+' true source penetration required');if(kind==='triangle')assert.ok(hits.some(h=>h.id?.startsWith('shoukang-south-slope')));if(id.includes('side-column')){const axis=geometry.bayAxes[id.startsWith('old-negative')?2:3],expected=[front.x+(axis-.31),front.ph,front.z+(-front.d/2-.31),front.x+(axis+.31),front.ph+3,front.z+(-front.d/2+.31)];assert.ok(hits.some(h=>h.kind==='box'&&JSON.stringify(h.bounds)===JSON.stringify(expected)),id+' exact original front column required');}result.negative.push({id,point:p,hits});}
 for(const lateral of [0,-2,2])for(const fps of [10,30,60]){
  const x=front.x+lateral,one=lateral===0?[[x,218.1],[x,218.9],[x,219.4],[x,221.3],[x,223.4],[x,226]]:[[x,218.1],[x,219.4],[x,222.8],[front.x,222.8],[front.x,224.3],[front.x,226]],points=[...one,...one.slice(0,-1).reverse()],row={lateral,fps,arrived:false,crossings:0,strictOverlapFrames:0,maxZ:-Infinity};
  try{withTerrainController(cm,(c,cam,tick)=>{
   const driver=createPhysicalWaypointDriver(points);c.setPosition(x,PLAYER.HEIGHT,218.1);assert.equal(c.feetY,0);assert.equal(c.groundY,0);assert.equal(cm.checkCollision(new THREE.Vector3(x,PLAYER.HEIGHT,218.1),.5),false,'actual legal ground start');assert.equal(intersects(body(x,218.1,0)).length,0);c.moveForward=true;let stagnant=0;const pos=()=>[cam.position.x-c.bobOffset.x,cam.position.z-c.bobOffset.z];
   for(let f=0;f<fps*30&&!driver.complete;f++){
    const a=pos(),cmd=driver.command(a,false);cam.position.sub(c.bobOffset);cam.lookAt(cmd.target[0],cam.position.y,cmd.target[1]);cam.position.add(c.bobOffset);cam.updateMatrixWorld(true);tick(fps);const b=pos();driver.observe(a,b);assert.ok([...b,c.feetY,c.groundY].every(Number.isFinite));row.maxZ=Math.max(row.maxZ,b[1]);const hits=intersects(body(...b,c.feetY));if(hits.length){row.strictOverlapFrames++;row.firstOverlap??={frame:f,point:[...b,c.feetY],hits};}stagnant=Math.hypot(b[0]-a[0],b[1]-a[1])<1e-8?stagnant+1:0;if(stagnant>fps*2)break;
   }
   row.arrived=driver.complete;row.crossings=driver.diagnostics.crossings.length;row.last=pos();assert.equal(driver.complete,true,'actual continuous doorway roundtrip blocked');assert.equal(row.crossings,points.length-1);assert.ok(row.maxZ>=226,'actual interior not reached');assert.equal(row.strictOverlapFrames,0,'strict actual hall body overlap');
   c.moveForward=false;for(let f=0;f<fps*2;f++){tick(fps);assert.equal(intersects(body(...pos(),c.feetY)).length,0,'strict settled body');}assert.equal(c.feetY,0);assert.equal(c.airborne,false);const end=pos(),hit=new THREE.Raycaster(new THREE.Vector3(end[0],.05,end[1]),new THREE.Vector3(0,-1,0),0,.1).intersectObject(W.environmentScene,true)[0];assert.ok(hit&&hit.object.userData.environmentGroundSource===true&&Math.abs(hit.point.y)<1e-10,'actual Environment ground raycast');row.endFeet=c.feetY;row.end=end;
  });}catch(error){row.error={name:error.name,message:error.message};result.faults.push(`${lateral} ${fps}Hz ${error.message}`);}
  result.runs.push(row);
 }
 return result;
}
