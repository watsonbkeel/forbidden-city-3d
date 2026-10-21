// Full-world collisions and rivers are retained. On the old worker base only,
// replace outer-east with its single-dispatch real-library build; in integration
// this yields the same zone again. All other production world zones stay present.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import {PLAYER} from '../src/config/constants.js';
import {TextureLibrary,TEXTURE_SPECS} from '../src/utils/TextureLibrary.js';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {buildWorld} from './lib/world.mjs';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import * as api from '../src/scene/palace/special/RemainingOuterHalls.js';
const W=await buildWorld({realMaterials:true,retainScene:true}),data=JSON.parse(readFileSync(new URL('../data/zones/outer-east.json',import.meta.url)));
const lib=new TextureLibrary();for(const key of Object.keys(TEXTURE_SPECS))lib.colors.set(key,new T.Texture({width:64,height:64}));
class Preview extends ZoneBase {
 constructor(){super(lib,data);this.kit.finish=()=>{this.kit.root.updateMatrixWorld(true);return this.kit.root;};}
 buildHall(item){const p=api.resolveRemainingProfile(data.id,item);const b=p?.mode==='replace'?api.buildRemainingHall(this.kit,item,p):super.buildHall(item);const result=p?.mode==='augment'&&b.f.userData.remainingOuter?.id!==p.id?api.augmentRemainingHall(this.kit,item,b,p):b;if(item.name==='文渊阁')this.wenyuan=result;return result;}
}
const zone=new Preview(),built=zone.build();W.cm.removeByTag(data.id);W.cm.addColliders(built.colliders,data.id);W.cm.addWalkables(built.walkables,data.id);
const {f,g}=zone.wenyuan,step=f.getObjectByName('wenyuan-access-safety-entry-tread'),fit=g.accessSafetyEntryStep,meshRows=[];
zone.kit.root.traverse(m=>{if(!m.isMesh||!m.visible)return;const a=m.geometry.attributes.position,ix=m.geometry.index,triangles=[];for(let i=0;i<(ix?.count??a.count);i+=3)triangles.push(new T.Triangle(...[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i+j):i+j).applyMatrix4(m.matrixWorld))));meshRows.push({m,box:new T.Box3().setFromObject(m),triangles});});
const hallMeshes=meshRows.filter(r=>{for(let n=r.m;n;n=n.parent)if(n===f)return true;return false;});
const world=(x,z,y=0)=>f.localToWorld(new T.Vector3(x,y,z));
const stepBox=new T.Box3().setFromObject(step),ray=new T.Raycaster();
const nearStatic=[],pathBounds=new T.Box3(new T.Vector3(-195,-4,-158),new T.Vector3(-183,3,-139));
W.scene.updateMatrixWorld(true);W.scene.traverse(m=>{if(!m.isMesh||!m.visible||!new T.Box3().setFromObject(m).intersectsBox(pathBounds))return;const a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){const tri=new T.Triangle(...[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i+j):i+j).applyMatrix4(m.matrixWorld)));if(new T.Box3().setFromPoints([tri.a,tri.b,tri.c]).intersectsBox(pathBounds))nearStatic.push({tri,water:!!m.userData.isWater||m.name.startsWith('water:'),name:m.name});}});

test.after(()=>{zone.dispose();lib.dispose();});
test('R48 Wenyuan entry has one visible tread, exact cap-backed support and retained sill',()=>{
 assert.equal(step.userData.status,'MODEL_ACCESS_SAFETY_FIT_NOT_HISTORIC_OBJECT');assert.equal(step.userData.source,null);assert.equal(fit.originalPlatform,'RETAINED_UNMODIFIED');assert.equal(fit.sillFit.frontRetreat,.08);
 assert.ok(Math.abs(stepBox.min.x+192.91)<1e-6&&Math.abs(stepBox.max.x+186.84)<1e-6);
 assert.ok(Math.abs(stepBox.min.z+142.4)<1e-6&&Math.abs(stepBox.max.z+142.31)<1e-6);assert.ok(Math.abs(stepBox.max.y-.51)<1e-6);
 const sill=f.children.find(m=>m.isMesh&&Math.abs(m.position.x+3.375)<1e-8&&Math.abs(m.position.z+8.91)<1e-8&&Math.abs(m.position.y-.61)<1e-8);assert.ok(sill);assert.ok(Math.abs(new T.Box3().setFromObject(sill).getSize(new T.Vector3()).y-.22)<1e-7);const sb=new T.Box3().setFromObject(sill);assert.ok(Math.abs(sb.min.z-stepBox.min.z-.58)<1e-6);assert.ok(Math.abs(sb.max.z+141.6)<1e-6);
 const support=zone.kit.walkables.filter(w=>w.type==='box'&&Math.abs(w.box.max.y-.51)<1e-9&&Math.abs(w.box.min.z+142.4)<1e-8);assert.equal(support.length,1);assert.equal(support[0].rescue,false);assert.ok(Math.abs(support[0].box.max.z+142.25)<1e-8);
 // Every point in the added walkable lies on the new stone or old projecting
 // cap, not an invisible pad. Top normals must be physically outward.
 let hits=0;for(let x=fit.x0+.02;x<fit.x1;x+=.2)for(let z=fit.z0+.005;z<fit.retainedCapSupportEnd;z+=.025){const v=world(x,z,.7);ray.set(v,new T.Vector3(0,-1,0));ray.far=.3;const hit=ray.intersectObjects(hallMeshes.map(q=>q.m),false)[0];assert.ok(hit,'walkable without real top');assert.ok(Math.abs(hit.point.y-fit.top)<2e-6);assert.ok(hit.face.normal.clone().transformDirection(hit.object.matrixWorld).y>.99);hits++;}assert.ok(hits>150);
 // All foreign rendered geometry including the pond rim and bridge is kept;
 // the new slab must not intrude into its volume or any water sheet.
 const interior=stepBox.clone().expandByScalar(-2e-5),waterFootprint=stepBox.clone();waterFootprint.min.y=-4;waterFootprint.max.y=3;
 for(const q of nearStatic){assert.equal(interior.intersectsTriangle(q.tri),false,'new stone must only meet, not overlap, real bridge/masonry triangles: '+q.name);if(q.water)assert.equal(waterFootprint.intersectsTriangle(q.tri),false,'new stone occupies existing rendered water');}
 const foreign=meshRows.filter(q=>!hallMeshes.includes(q));for(const q of foreign){const overlap=stepBox.clone().intersect(q.box);if(overlap.isEmpty())continue;const size=overlap.getSize(new T.Vector3());assert.ok(Math.min(size.x,size.y,size.z)<1e-6,`entry slab intersects ${q.m.name}/${q.m.material?.name}`);}
});
for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])for(const offset of[-2,-.6,-.003,0,.003,.6,2])for(const phase of[-.003,0,.003])test('R48 Wenyuan full-world pond/entry round trip real body and visible feet '+JSON.stringify({fps,sprint,backward,offset,phase}),t=>{
 const a=g.navigation.points.map(p=>[p.x,p.z]);for(let k=1;k<a.length;k++)a[k][1]+=phase;for(let k=2;k<a.length;k++)a[k][0]+=offset;const points=[...a,...a.slice(0,-1).reverse()],trace=traceTerraceGround(W.cm,{flights:[]});let r;
 try{r=replayTerrace(t,W,points,{fps,sprint,backward,recordFrames:true});}finally{trace.restore();}
 assert.equal(r.arrived,true,JSON.stringify({stuck:r.stuckAt,end:r.end}));assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=.49);assert.ok(r.end[2]<.03);assert.equal(trace.samples.some(s=>s.source==='rescue'||s.source==='unverified'),false);
 for(const frame of r.frames){
  const body=new T.Box3(new T.Vector3(frame.x-.499,frame.feet+.351,frame.z-.499),new T.Vector3(frame.x+.499,frame.feet+PLAYER.HEIGHT-1e-6,frame.z+.499));
  for(const q of hallMeshes){if(q.box.max.y<=frame.ground+PLAYER.STEP_UP+1e-6||!q.box.intersectsBox(body))continue;assert.equal(q.triangles.some(tri=>body.intersectsTriangle(tri)),false,JSON.stringify({frame,mesh:q.m.name,local:q.m.position.toArray()}));}
  if(frame.ground>.001&&frame.ground<.53){ray.set(new T.Vector3(frame.x,frame.ground+.065,frame.z),new T.Vector3(0,-1,0));ray.far=.09;const hit=ray.intersectObjects(hallMeshes.map(q=>q.m),false)[0],staticHits=nearStatic.map(q=>ray.ray.intersectTriangle(q.tri.a,q.tri.b,q.tri.c,true,new T.Vector3())).filter(v=>v&&v.y<=frame.ground+.065&&v.y>=frame.ground-.025);assert.ok((hit&&Math.abs(hit.point.y-frame.ground)<.025)||staticHits.some(v=>Math.abs(v.y-frame.ground)<.025),'positive bridge/entry support has no visible same-height top');}
 }
});
