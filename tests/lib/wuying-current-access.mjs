import assert from 'node:assert/strict';
import {PLAYER} from '../../src/config/constants.js';
import {southCourtGateGeometry} from '../../src/scene/palace/special/SouthCourtGates.js';
import {wuyingGateToGallery} from './r52-wuying-routes.mjs';
import {createPhysicalWaypointDriver} from './physical-waypoints.mjs';
import {withTerrainController} from './r91-controller-clock.mjs';
import {gateGeom,hallGeom} from './world.mjs';

const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const bounds=b=>[...b.min.toArray(),...b.max.toArray()];
function supportKey(w){
 if(w.type==='box')return ['box',...(w.box?bounds(w.box):[...w.min,...w.max]),w.rescue!==false];
 return ['ramp',...['axis','minX','maxX','minZ','maxZ','a0','a1','y0','y1','crossMin0','crossMax0','crossMin1','crossMax1'].map(k=>w[k]??null)];
}

/** Exact source-topology migration on the caller's already-built real world.
 * No new world, altered controller, raised spawn, renamed known failure or
 * primitive deletion. The ordinary logical step contract is not a claim of
 * zero intersection of the separately retained full rendered-foot volume.
 */
export function checkWuyingCurrentAccess(W){
 const zone=W.zones.map(z=>z.json??z).find(z=>z.id==='outer-west');
 assert.ok(zone,'Wuying source zone required');
 const gates=zone.items.filter(i=>i.southGateProfile==='wuying'),fronts=zone.items.filter(i=>i.southCourtProfile==='wuying-front');
 assert.equal(gates.length,1,'unique Wuying gate source');assert.equal(fronts.length,1,'unique Wuying front source');
 const gate=gates[0],front=fronts[0],source=southCourtGateGeometry(gate),gg=gateGeom(gate),hg=hallGeom(front);
 assert.equal(front.x,219.5);assert.equal(front.z,-199.2);assert.equal(front.ph,1.2);
 const records=W.finishedZones?.filter(z=>z.id==='outer-west').flatMap(z=>z.group.userData.architecture??[]).filter(r=>r.remainingProfile==='wuying'&&r.moonTerrace)??[];
 assert.equal(records.length,1,'finished current Wuying source record required');const moon=records[0].moonTerrace;
 assert.ok(moon.removedCoveredGateRamp&&moon.removedCoveredHallRamp,'exact covered source ramps required');
 assert.equal(moon.addedWalkables.length,19,'actual current Wuying support count');
 for(const ref of moon.addedWalkables){assert.equal(ref.rescue,false,'source rescue disabled');assert.equal(W.cm.walkables.filter(w=>equal(supportKey(w),supportKey(ref))).length,1,'actual current Wuying support missing/duplicated');}
 for(const ref of [moon.removedCoveredGateRamp,moon.removedCoveredHallRamp])assert.equal(W.cm.walkables.filter(w=>equal(supportKey(w),supportKey(ref))).length,0,'covered ramp unexpectedly restored');
 const owned=W.cm.colliders.filter(c=>W.ownerOf(c)?.item===front);
 for(const ref of moon.addedColliders)assert.ok(owned.some(c=>equal(bounds(c.box),[...ref.min,...ref.max])),'actual current Wuying solid missing');
 const {THREE,cm}=W,result={profile:'wuying-current-side-access',supports:19,negative:[],runs:[],faults:[],bodyContract:'ORIGINAL_LOGICAL_STEP_NOT_STRICT_RENDERED_FOOT_ZERO_INTERSECTION'};
 const sourceBoxes=moon.addedColliders.map(r=>new THREE.Box3(new THREE.Vector3(...r.min),new THREE.Vector3(...r.max)));
 for(const [id,p]of [['old-gate-north-ground',[gg.x,gg.z+gg.half+.7]],['old-hall-middle-ground',hg.toW(hg.doorX,-(hg.PD/2+hg.run+2))]]){
  const low=cm.getGroundHeight(...p,0,PLAYER.STEP_UP),actual=cm.getGroundHeight(...p,Infinity,PLAYER.STEP_UP);
  const body=new THREE.Box3(new THREE.Vector3(p[0]-.5,0,p[1]-.5),new THREE.Vector3(p[0]+.5,PLAYER.HEIGHT,p[1]+.5));
  const sourceIntersections=sourceBoxes.filter(b=>['x','y','z'].every(k=>Math.min(body.max[k],b.max[k])>Math.max(body.min[k],b.min[k]))).length;
  const blocked=cm.checkCollision(new THREE.Vector3(p[0],low+PLAYER.HEIGHT,p[1]),.5);
  assert.equal(low,0,id+' retains original low datum');assert.ok(actual>PLAYER.STEP_UP&&blocked&&sourceIntersections>0,id+' exact source obstruction required');
  result.negative.push({id,point:p,low,actual,blocked,sourceIntersections});
 }
 for(const side of ['west','east'])for(const fps of [10,30,60]){
  const go=wuyingGateToGallery(gate,front,{side}),points=[...go,...go.slice(0,-1).reverse()],row={side,fps,arrived:false,crossings:0,acceptedSubsteps:0,groundSamples:0,maxRise:0,northEscape:0,requiredNorthEscape:gg.half+12};
  const originalCheck=cm.checkCollision,originalGround=cm.getGroundHeight,descriptors=['checkCollision','getGroundHeight'].map(k=>[k,Object.getOwnPropertyDescriptor(cm,k)]);
  try{withTerrainController(cm,(c,cam,tick)=>{
   const [x,z]=points[0],driver=createPhysicalWaypointDriver(points);c.setPosition(x,PLAYER.HEIGHT,z);assert.equal(c.feetY,0,'actual ground start');assert.equal(c.airborne,false);assert.equal(cm.checkCollision(new THREE.Vector3(x,PLAYER.HEIGHT,z),.5),false,'legal outside start');
   // Observe exact native arguments and returns, never supply a height or a
   // substitute body. Every check, including negative/marked-shape checks,
   // continues through the original production implementation.
   cm.checkCollision=function(...args){const hit=originalCheck.apply(this,args);if(args[2]&&!hit){assert.ok(args[0].toArray().every(Number.isFinite));row.acceptedSubsteps++;}return hit;};
   cm.getGroundHeight=function(...args){const h=originalGround.apply(this,args),feet=args[2]??0,step=args[3]??.6;assert.ok(Number.isFinite(h)&&Number.isFinite(feet));assert.ok(h-feet<=step+1e-6,'unexpected rescue/rise');row.groundSamples++;row.maxRise=Math.max(row.maxRise,h-feet);return h;};
   c.moveForward=true;const pos=()=>[cam.position.x-c.bobOffset.x,cam.position.z-c.bobOffset.z];let stagnant=0;
   for(let f=0;f<fps*100&&!driver.complete;f++){
    const a=pos(),cmd=driver.command(a,false);cam.position.sub(c.bobOffset);cam.lookAt(cmd.target[0],cam.position.y,cmd.target[1]);cam.position.add(c.bobOffset);cam.updateMatrixWorld(true);tick(fps);const b=pos();driver.observe(a,b);
    assert.ok([...b,c.feetY,c.groundY].every(Number.isFinite));if(b[1]-source.z>=gg.half)row.northEscape=Math.max(row.northEscape,Math.hypot(b[0]-source.x,b[1]-source.z));
    stagnant=Math.hypot(b[0]-a[0],b[1]-a[1])<1e-8?stagnant+1:0;if(stagnant>fps*2)break;
   }
   row.arrived=driver.complete;row.crossings=driver.diagnostics.crossings.length;row.last=pos();
   if(!driver.complete){result.faults.push(`${side} ${fps}Hz blocked at point ${driver.index}: ${JSON.stringify(row.last)}`);return;}
   assert.equal(row.crossings,points.length-1);assert.ok(row.northEscape>=row.requiredNorthEscape,'current north route remains enclosed');assert.ok(row.acceptedSubsteps>0&&row.groundSamples>0);
   c.moveForward=false;for(let f=0;f<fps*2;f++)tick(fps);row.endFeet=c.feetY;assert.equal(c.feetY,0);assert.equal(c.airborne,false);
  });}finally{for(const [key,descriptor]of descriptors){if(descriptor)Object.defineProperty(cm,key,descriptor);else delete cm[key];}}
  result.runs.push(row);
 }
 return result;
}
