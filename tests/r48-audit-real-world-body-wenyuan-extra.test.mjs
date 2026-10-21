// Independent frozen-commit audit variant: real material API, entire world, no stripped rivers.
import {buildWorld} from './lib/world.mjs';
const auditWorld=await buildWorld({realMaterials:true});
// R48 audit regression: generated from real entry replays on RemainingOuterHalls
// SHA-256 2ffeaf1fa9be545335ccb5eda0a092845dd750e8935655ab2551dddfaef572a9.
// Baseline is intentionally RED in four approach directions; both ordinary bypasses must stay GREEN.
// Render-body checks cover the full 1.7 m head, not the production top trim.
// Tangency tolerance: 1 mm in XZ / lower edge; 1 micrometre at head height.
// A repair may block the final attack; entry and each required stair stay required.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import {PLAYER} from '../src/config/constants.js';
import {CourtKit} from '../src/scene/palace/kit.js';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {buildWenyuanPavilion} from '../src/scene/palace/special/WenyuanPavilion.js';
import {realTextureLibrary as library} from './lib/r48-real-texture-library.mjs';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import * as api from '../src/scene/palace/special/RemainingOuterHalls.js';
const row=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/outer-scope.json',import.meta.url))).find(r=>r.name==='文渊阁');
const kit=new CourtKit(library(),row.zone),base=buildWenyuanPavilion(kit,row.baselineItem);
const{f,g}=api.augmentRemainingHall(kit,row.baselineItem,base,api.resolveRemainingProfile(row.zone,row.baselineItem));
kit.root.updateMatrixWorld(true);
const data=JSON.parse(readFileSync(new URL('../data/zones/outer-east.json',import.meta.url)));
class Preview extends ZoneBase{
 constructor(){super(library(),data);}
 buildHall(item){const p=api.resolveRemainingProfile(data.id,item);if(p?.mode==='replace')return api.buildRemainingHall(this.kit,item,p);const b=super.buildHall(item);return p?.mode==='augment'&&b.f.userData.remainingOuter?.id!==p.id?api.augmentRemainingHall(this.kit,item,b,p):b;}
}
const zone=new Preview(),built=zone.build(),cm=auditWorld.cm;
const MODES=process.env.WENYUAN_FPS?[{fps:Number(process.env.WENYUAN_FPS),sprint:process.env.WENYUAN_SPRINT==='1',backward:process.env.WENYUAN_BACKWARD==='1'}]:[10,60].flatMap(fps=>[false,true].flatMap(sprint=>[false,true].map(backward=>({fps,sprint,backward}))));
const W={THREE:T,cm},meshes=[];
f.traverse(m=>{if(!m.isMesh||!m.visible)return;const p=m.geometry.attributes.position,ix=m.geometry.index,triangles=[];for(let k=0;k<(ix?.count??p.count);k+=3)triangles.push(new T.Triangle(...[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(k+j):k+j).applyMatrix4(m.matrixWorld))));meshes.push({m,box:new T.Box3().setFromObject(m),triangles});});
test.after(()=>{zone.dispose();kit.dispose(kit.root);});
const local=ps=>ps.map(([x,z])=>{const q=f.localToWorld(new T.Vector3(x,0,z));return[q.x,q.z]});
const entry=g.navigation.points.map(p=>[p.x,p.z]);
const inside=[...entry,...local([[-3.375,-4.5]])];
const stairs=g.navigation.interiorStairRoutes[0].points.map(p=>[p.x,p.z]);
const stairApproach=[...inside,...local([[12,-4.5],[12,-6.8],[16.05,-6.8]])];
const mid=[...stairApproach,...stairs.slice(1,4)];
const up=[...stairApproach,...stairs.slice(1)];
const cases=[
 {id:'first underside from right',level:.5,ready:9,points:[...inside,...local([[12,-4.5],[12,-6.8],[18.5,-6.8],[18.5,-2],[16.5,-2]])],target:()=>true},
 {id:'first underside from high end',level:.5,ready:8,points:[...inside,...local([[14.3,-4.5],[14.3,1.1],[16.05,1.1],[16.05,-2]])],target:()=>true},
 {id:'second underside high left approach',level:3.15,ready:14,points:[...mid,...local([[10,.85],[10,-7],[17.8,-7],[17.8,-4.1]])],target:()=>true},
 {id:'second underside high right approach',level:3.15,ready:14,points:[...mid,...local([[10,.85],[10,-7],[18.5,-7],[18.5,-4.1]])],target:()=>true},
 {id:'first ground bypass stays usable',level:.5,ready:5,bypass:true,points:[...inside,...local([[14.3,-4.5],[14.3,1.1],[18.5,1.1],[18.5,-6.8]])],target:()=>true},
 {id:'second middle high bypass stays usable',level:3.15,ready:11,bypass:true,points:[...mid,...local([[10,.85],[10,-7],[18.12,-7]])],target:()=>true},
];
function run(t,points,opts={}){const trace=traceTerraceGround(cm,{flights:[]});try{const result=replayTerrace(t,W,points,{recordFrames:true,...opts});assert.equal(result.startFeet,0);assert.equal(trace.samples.some(s=>s.source==='rescue'||s.source==='unverified'),false,'No rescue lift or forged ground support');return result;}finally{trace.restore();}}
for(const mode of MODES)test('R48 Wenyuan real pond entrance reaches both stairs before body attacks '+JSON.stringify(mode),t=>{const r=run(t,up,mode);assert.equal(r.arrived,true);assert.ok(r.maxFeet>=5.48);});
for(const mode of MODES)for(const c of cases)test('R48 Wenyuan body clearance: '+c.id+' '+JSON.stringify(mode),t=>{
 const r=run(t,c.points,mode);if(c.bypass)assert.equal(r.arrived,true,'Safety rails must retain the legitimate route around the low-headroom area');assert.ok(r.maxFeet>=c.level-.02,'Must physically climb to required level');
 assert.ok(r.frames.some(q=>q.waypoint>=c.ready&&Math.abs(q.ground-c.level)<.02),'Must physically reach the attack approach, not pass by being blocked earlier');
 for(const frame of r.frames){
  if(Math.abs(frame.feet-frame.ground)>.02)continue;
  const body=new T.Box3(new T.Vector3(frame.x-.499,frame.feet+.351,frame.z-.499),new T.Vector3(frame.x+.499,frame.feet+PLAYER.HEIGHT-1e-6,frame.z+.499));
  for(const q of meshes){
   if(q.box.max.y<=frame.ground+PLAYER.STEP_UP+1e-6||!q.box.intersectsBox(body))continue;
   const triangle=q.triangles.find(tri=>body.intersectsTriangle(tri));if(!triangle)continue;
   assert.fail(JSON.stringify({id:c.id,arrived:r.arrived,frame,local:{x:frame.x-row.baselineItem.x,z:frame.z-row.baselineItem.z},role:q.m.userData.role,material:q.m.material?.name,meshLocal:q.m.position.toArray(),body:{min:body.min.toArray(),max:body.max.toArray()},triangle:[triangle.a.toArray(),triangle.b.toArray(),triangle.c.toArray()],productionCollision:cm.checkCollision(new T.Vector3(frame.x,frame.feet+PLAYER.HEIGHT,frame.z))}));
  }
 }
});
