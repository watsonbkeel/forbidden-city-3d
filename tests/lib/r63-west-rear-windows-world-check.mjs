// Read-only consumer of an already built, bounded world. No full world build.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {replayTerrace,traceTerraceGround} from './terrace-walk.mjs';
import {assertCourtRouteHeadClearance} from './r58-court-facade-world-check.mjs';
const profiles={24:{id:'lijingxuan',x:94.5,z:450.2,split:3.57},47:{id:'tongdaotang',x:149.3,z:449.8,split:3.03}};
export const WEST_REAR_SOUTH_WINDOW_VIEWS=[
 {name:'south-whole',eye:[0,6.5,-38],target:[0,5.0,0],fov:49},
 {name:'south-window-close',eye:[-5.24,3.3,-14.8],target:[-5.24,2.9,-6.45],fov:43},
 {name:'south-oblique',eye:[-23,7,-30],target:[0,4.7,-1],fov:53},
];
const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;};
function context(W,index){assert.ok(W?.scene&&W.cm?.checkCollision&&W.cm?.getGroundHeight,'already-built scene and actual CollisionManager required');assert.ok(profiles[index]);W.scene.updateMatrixWorld(true);return profiles[index];}
export function assertWestRearSouthWindowsInWorld(W,index){
 if(index===undefined)return{scope:'BOTH_EXISTING_WEST_REAR_HALLS',targets:[24,47].map(i=>({itemIndex:i,...assertWestRearSouthWindowsInWorld(W,i)}))};
 const p=context(W,index),local=(x,y,z)=>new THREE.Vector3(p.x+x,y,p.z+z),records=[];
 W.scene.traverse(o=>{for(const r of[o.userData.structure,...(o.userData.architecture??[])])if(r?.id===`west-six/${p.id}`)records.push(r);});
 assert.equal(records.length,1,'exactly one target assembly');const meta=records[0].westRearSouthWindows;assert.equal(meta?.windowCount,4);assert.equal(meta.itemIndex,index);assert.equal(meta.accepted,false);assert.equal(meta.photographyDate,null);
 const ray=(x,y)=>new THREE.Raycaster(local(x,y,-7.1),new THREE.Vector3(0,0,1),0,1.1).intersectObject(W.scene,true).filter(h=>visible(h.object));
 const upperRectangularContacts=[],triangleContacts=[],contact=(x,y,mat)=>{const h=ray(x,y)[0];assert.ok(h,mat);assert.equal(solidMaterialNameAt(h.object,h.faceIndex),`west_rear_${p.id}_${mat}`);triangleContacts.push({local:[x,y,-7.1],material:mat,hit:h.point.toArray()});};
 for(const cx of[-10.48,-5.24,5.24,10.48]){
  contact(cx,.9,'sill');contact(cx-2.28+.05,2.5,'frame');
  // Center of first lower pane, not a divider or its lower decorative bars.
  const a=cx-2.28+.1,b=a+4.36/(index===24?3:2)-.055;
  contact((a+b)/2,2.1,'glazing_fit');
  const find=(mat)=>{for(let yy=0;yy<24;yy++)for(let xx=0;xx<30;xx++){const x=a+.035+(b-a-.07)*(xx+.5)/30,y=p.split+.075+(4.61032-p.split-.075)*(yy+.5)/24,h=ray(x,y)[0];if(h&&solidMaterialNameAt(h.object,h.faceIndex)===`west_rear_${p.id}_${mat}`){contact(x,y,mat);return;}}assert.fail(`actual ${mat} triangles absent`);};
  find('upper_recess');if(index===24)find('diagonal_lattice');
  if(index===47){
   const windowIndex=[-10.48,-5.24,5.24,10.48].indexOf(cx),lo=3.085,hi=4.63032;
   const upperProbe=(x,y,role,fieldIndex,cellIndex=null)=>{const h=ray(x,y)[0];assert.ok(h,`upper rectangular ${role} triangle required`);assert.equal(solidMaterialNameAt(h.object,h.faceIndex),'west_rear_tongdaotang_frame',`upper rectangular ${role} actual material`);assert.ok(Math.abs(h.point.z-(p.z-6.515))<1e-4,`upper rectangular ${role} front plane`);upperRectangularContacts.push({windowIndex,fieldIndex,cellIndex,role,local:[x,y,-7.1],hit:h.point.toArray()});};
   // Every nested rectangle is checked, not merely an outer jamb or a search
   // that can succeed on one surviving grille elsewhere in the same bay.
   for(let fieldIndex=0;fieldIndex<2;fieldIndex++){
    const leftEdge=cx-2.18+fieldIndex*2.18+(fieldIndex?.055:0),rightEdge=cx-2.18+(fieldIndex+1)*2.18-(fieldIndex===0?.055:0),cell=(rightEdge-leftEdge)/3;
    for(let j=0;j<3;j++){
     const left=leftEdge+j*cell+.065,right=leftEdge+(j+1)*cell-.065,bottom=lo+.10+(j===1?.07:0),top=hi-.10-(j===1?.07:0),vy=(bottom+top)/2+.057,hx=(left+right)/2;
     for(const x of[left+.016,right-.016])upperProbe(x,vy,'outer-rectangle-vertical',fieldIndex,j);
     for(const x of[left+.116,right-.116])upperProbe(x,vy,'nested-rectangle-vertical',fieldIndex,j);
     for(const y of[bottom+.016,top-.016])upperProbe(hx,y,'outer-rectangle-horizontal',fieldIndex,j);
     for(const y of[bottom+.176,top-.176])upperProbe(hx,y,'nested-rectangle-horizontal',fieldIndex,j);
    }
    // Sample the short connections outside the first rectangle, so a surviving
    // rectangle edge cannot hide removal of these three horizontal links.
    for(const fraction of[.25,.5,.75])upperProbe(leftEdge+.02,lo+(hi-lo)*fraction,'horizontal-interconnection',fieldIndex);
   }
  }
  assert.equal(W.cm.checkCollision(local(cx,2.1,-6.45),.45),true,'original closed-window collider');
 }
 let openPortalRays=0;for(const x of[-.65,0,.65]){assert.equal(ray(x,2.2).length,0,'central portal remains genuinely open');assert.equal(W.cm.checkCollision(local(x,2.2,-6.45),.45),false);openPortalRays++;}
 return{scope:'ALREADY_BUILT_W_ACTUAL_TRIANGLES_NOT_BROWSER_ACCEPTANCE',windowCount:4,triangleContacts,upperRectangularContacts,openPortalRays};
}
export function replayWestRearSouthDoorInWorld(t,W,{index,fps=60,backward=false,sprint=false,compoundApproach=false}={}){
 const p=context(W,index),isolatedPoints=[[0,-10.5],[0,-1.5],[3,-1.5],[-3,-1.5],[0,-1.5],[0,-10.5],[0,-1.5],[0,-10.5]].map(([x,z])=>[p.x+x,p.z+z]);
 // Lijing's isolated center start lies inside the preserved Chuxiu main hall
 // in the compound. Its closed north wall is not a route: enter the rear gap
 // from the existing east side instead. The original witness stays unchanged.
 const points=compoundApproach&&index===24?[[110.5,440],[110.5,442.5],[94.5,442.5],[94.5,448.7],[97.5,448.7],[91.5,448.7],[94.5,448.7],[94.5,442.5],[110.5,442.5],[110.5,440],[110.5,442.5],[94.5,442.5],[94.5,448.7],[94.5,442.5],[110.5,442.5],[110.5,440]]:compoundApproach&&index===47?[[149.3,441.5],[149.3,448.3],[152.3,448.3],[146.3,448.3],[149.3,448.3],[149.3,441.5],[149.3,448.3],[149.3,441.5]]:isolatedPoints;
 const trace=traceTerraceGround(W.cm,{flights:[]});try{const r=replayTerrace(t,{THREE,cm:W.cm},points,{fps,backward,sprint,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.ok(r.maxFeet>=.45-1e-6,'existing terrace reached');assert.ok(!trace.samples.some(s=>['rescue','unverified'].includes(s.source)),'actual support, no rescue or invented ground');return{...r,index,fps,backward,sprint,compoundApproach,routePoints:points,headClearance:assertCourtRouteHeadClearance(W,r),scope:'ACTUAL_CONTROLLER_BOUNDED_WORLD_NOT_BROWSER_ACCEPTANCE'};}finally{trace.restore();}
}
