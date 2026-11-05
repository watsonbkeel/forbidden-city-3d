import assert from'node:assert/strict';
import*as T from'three';
import{PLAYER}from'../../src/config/constants.js';
import{triangleBodySweepFraction}from'../../src/utils/TriangleSupport.js';
import{furnitureContact}from'../../src/controls/FurnitureMotion.js';
import{fixture as player}from'../lib/r72-player-fixture.mjs';
import{createPhysicalWaypointDriver}from'../lib/physical-waypoints.mjs';
export function highExits(cm,{cases=[[-240.05,391],[-239.7,381.8],[-239.7,379]],rates=[10,30,60,144]}={}){
 const rows=[];
 for(const[x,z]of cases)for(const fps of rates){
  const clean=[],p=player({after:fn=>clean.push(fn)}),c=p.controls,impacts=[];
  const expectedRole=z<379.8?'low-gallery-flat-roof':z<383?'south-climbing-roof':'main-yellow-rolled-hip-gable-roof',expectedMesh='xuhui-gallery/'+expectedRole;
  const originalTriangle=cm.resolveTriangleVertical,originalFurniture=cm.resolveFurnitureVertical,ownTriangle=Object.hasOwn(cm,'resolveTriangleVertical'),ownFurniture=Object.hasOwn(cm,'resolveFurnitureVertical');
  let pending=[];
  try{
   // Observe the real, unchanged vertical solver. For sloped roofs its first
   // visible-triangle body impact legitimately slides rather than landing flat.
   cm.resolveTriangleVertical=function(...args){
    const out=originalTriangle.apply(this,args);if(!out||args[3]>=args[2])return out;
    const[xx,zz,from,to,,radius=.5,height=PLAYER.HEIGHT]=args,body=y=>new T.Box3(new T.Vector3(xx-radius,y+1e-8,zz-radius),new T.Vector3(xx+radius,y+height,zz+radius)),start=body(from),target=body(to);
    let first=null;
    for(const collider of this.queryBox(start.clone().union(target))){if(!collider.triangleSupport)continue;const fraction=triangleBodySweepFraction(collider.triangleSupport,start,target,{includeBoundary:true});if(fraction!==null&&(!first||fraction<first.fraction))first={collider,fraction}}
    const resolved=first&&from+(to-from)*Math.max(0,first.fraction-1e-9);
    const footMatches=!out.landed||out.kind==='foot-impact'&&out.witness?.instanceId===first?.collider.triangleSupport.id&&Math.abs(out.witness.height-out.feet)<1e-7;
    if(footMatches&&first?.collider.mesh?.xuhuiMesh===expectedMesh&&Math.abs(out.feet-resolved)<1e-6&&['foot-impact','bounded-body-slide','blocked-body-impact'].includes(out.kind))pending.push({kind:out.kind,mesh:first.collider.mesh.xuhuiMesh,instanceId:first.collider.triangleSupport.id,fraction:first.fraction,fromFeet:from,toFeet:to,resolvedFeet:out.feet,resolvedX:out.x,resolvedZ:out.z,landed:out.landed,footWitness:out.witness?{instanceId:out.witness.instanceId,height:out.witness.height}:null});
    return out;
   };
   cm.resolveFurnitureVertical=function(...args){
    const out=originalFurniture.apply(this,args),state=args[0];
    if(out?.landed&&out.onSupport&&state.feetY>out.feetY){const contact=furnitureContact(this,out.x,out.z,out.feetY,.5),owner=contact.surface?.owner;if(contact.poseClear&&owner?.mesh?.xuhuiMesh===expectedMesh&&contact.surface.height===out.feetY)pending.push({kind:'ordinary-box-foot-impact',mesh:owner.mesh.xuhuiMesh,fromFeet:state.feetY,resolvedFeet:out.feetY,resolvedX:out.x,resolvedZ:out.z,landed:true,sourceTop:owner.box.max.y})}
    return out;
   };
   c.collisionManager=cm;c.setPosition(x,1.7,z);c.feetY=10;c.groundY=0;c.camera.position.y=11.7;c.verticalVelocity=0;c.airborne=true;
   for(let i=0;i<fps*5;i++){
    pending=[];p.step(1/fps);
    for(const impact of pending)if(Math.abs(c.feetY-impact.resolvedFeet)<1e-6&&Math.abs(p.camera.position.x-impact.resolvedX)<1e-6&&Math.abs(p.camera.position.z-impact.resolvedZ)<1e-6&&(!impact.landed||c.onSupport&&!c.airborne))impacts.push({...impact,frame:i+1,controllerConsumed:true});
   }
   const landed=c.feetY,roofContact=impacts.length>0;
   assert.ok(roofContact,'actual roof impact missing '+JSON.stringify({x,z,fps,expectedMesh,landed}));
   assert.ok(Number.isFinite(landed)&&landed>=0&&landed<7.5,JSON.stringify({x,z,fps,landed}));assert.ok(!cm.checkCollision(p.camera.position,.5));
   const physical=()=>[p.camera.position.x-c.bobOffset.x,p.camera.position.z-c.bobOffset.z],d=createPhysicalWaypointDriver([physical(),[-243.5,z],[-245,z]]);c.moveForward=true;let frame=0;
   while(!d.complete&&frame++<fps*20){const before=physical(),q=d.command(before,false);c.canSprint=q.canSprint;p.camera.position.sub(c.bobOffset);p.camera.lookAt(q.target[0],p.camera.position.y,q.target[1]);p.camera.position.add(c.bobOffset);p.camera.updateMatrixWorld(true);p.step(1/fps);d.observe(before,physical())}
   c.moveForward=false;for(let i=0;i<fps*2;i++)p.step(1/fps);
   assert.ok(d.complete,JSON.stringify({x,z,fps,landed,end:physical(),feet:c.feetY}));assert.ok(Math.abs(c.feetY)<.03,JSON.stringify({x,z,fps,landed,end:physical(),feet:c.feetY}));assert.ok(!cm.checkCollision(p.camera.position,.5));
   rows.push({x,z,fps,expectedMesh,roofHeight:impacts[0].resolvedFeet,roofContact,impactCount:impacts.length,firstImpact:impacts[0],landed,end:[...physical(),c.feetY]});
  }finally{if(ownTriangle)cm.resolveTriangleVertical=originalTriangle;else delete cm.resolveTriangleVertical;if(ownFurniture)cm.resolveFurnitureVertical=originalFurniture;else delete cm.resolveFurnitureVertical;for(const fn of clean.reverse())fn()}
 }
 return rows;
}
