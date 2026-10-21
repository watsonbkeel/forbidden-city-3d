// Independent frozen-commit audit variant: real material API, entire world, no stripped rivers.
import {buildWorld} from './lib/world.mjs';
const auditWorld=await buildWorld({realMaterials:true});
// R48 audit regression: generated from real entry replays on RemainingOuterHalls
// SHA-256 2ffeaf1fa9be545335ccb5eda0a092845dd750e8935655ab2551dddfaef572a9.
// All-segment audit: the original 46c4c84 freeze exposes one inherited entrance-sill class.
// Render-body checks cover the full 1.7 m head, not the production top trim.
// Tangency tolerance: 1 mm in XZ / lower edge; 1 micrometre at head height.
// A repair may block the final attack; entry and each required stair stay required.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const auditHits=[];
test.after(()=>{const compact={totalHits:auditHits.length,unique:[...new Set(auditHits.map(h=>JSON.stringify({role:h.role,material:h.material,meshLocal:h.meshLocal,level:h.frame.ground})))],hits:auditHits};if(process.env.R48_WRITE_AUDIT_REPORTS==='1')writeFileSync(new URL('../docs/current-state/r48-remaining/independent-real-materials/58b0431-wenyuan-accepted-substep-diagnostic.json',import.meta.url),JSON.stringify(compact,null,2));console.log(JSON.stringify({totalHits:compact.totalHits,unique:compact.unique}));assert.equal(compact.totalHits,0,'Accepted production substeps must not occupy visible body triangles');});
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

const acceptedSubsteps=[];let auditingMove=false;
const savedMove=cm.getValidPosition,savedCheck=cm.checkCollision;
cm.getValidPosition=function(...args){auditingMove=true;try{return savedMove.apply(this,args);}finally{auditingMove=false;}};
cm.checkCollision=function(position,...args){const result=savedCheck.call(this,position,...args);if(auditingMove&&!result)acceptedSubsteps.push({x:position.x,z:position.z,feet:position.y-PLAYER.HEIGHT,ground:position.y-PLAYER.HEIGHT,source:'accepted production getValidPosition substep'});return result;};

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
 {id:'ground folded door',level:.5,ready:4,points:[...entry,...local([[-6.2,-7.95]])],target:m=>m.material?.name==='lattice_doors'},
 {id:'ground screen rails',level:.5,ready:8,points:[...inside,...local([[-1.1,-4.5],[-1.1,3.5],[-.5,3.5],[-.5,4.4]])],target:m=>m.userData.role==='wenyuan-ground-photo-screen-rail'},
 {id:'ground first flight underside',level:.5,ready:7,points:[...inside,...local([[14.3,-4.5],[14.3,-2],[15.5,-2]])],target:m=>['wenyuan-level-stair-tread','wenyuan-level-stair-riser'].includes(m.userData.role)},
 {id:'middle front lintel and infill',level:3.15,ready:14,points:[...mid,...local([[10,.85],[10,-6.46],[-3.375,-6.46],[-3.375,-8.4]])],target:m=>['caihua_beam','wall_red'].includes(m.material?.name)},
 {id:'middle second flight underside',level:3.15,ready:14,points:[...mid,...local([[10,.85],[10,-7],[18.12,-7],[18.12,-4.1]])],target:m=>['wenyuan-level-stair-tread','wenyuan-level-stair-riser'].includes(m.userData.role)},
 {id:'third front windows and columns',level:5.5,ready:16,points:[...up.slice(0,-1),...local([[13.1,-7.4],[-15.6,-7.4]])],target:m=>['lattice_doors','wenyuan_sourced_green_wood_columns'].includes(m.material?.name)&&m.position.z<0},
 {id:'third side masonry',level:5.5,ready:17,points:[...up,...local([[-18.9,-3.4]])],target:m=>m.material?.name==='wall_brick'},
 {id:'third rear windows and columns',level:5.5,ready:18,points:[...up,...local([[14.2,-3.4],[14.2,7.4],[-15.6,7.4]])],target:m=>['lattice_doors','wenyuan_sourced_green_wood_columns'].includes(m.material?.name)&&m.position.z>0},
];
function run(t,points,opts={}){acceptedSubsteps.length=0;const trace=traceTerraceGround(cm,{flights:[]});try{const result=replayTerrace(t,W,points,{recordFrames:true,...opts});assert.equal(result.startFeet,0);assert.equal(trace.samples.some(s=>s.source==='rescue'||s.source==='unverified'),false,'No rescue lift or forged ground support');return result;}finally{trace.restore();}}
for(const mode of MODES)test('R48 Wenyuan real pond entrance reaches both stairs before body attacks '+JSON.stringify(mode),t=>{const r=run(t,up,mode);assert.equal(r.arrived,true);assert.ok(r.maxFeet>=5.48);});
for(const mode of MODES)for(const c of cases)test('R48 Wenyuan body clearance: '+c.id+' '+JSON.stringify(mode),t=>{
 const r=run(t,c.points,mode);assert.ok(r.maxFeet>=c.level-.02,'Must physically climb to required level');
 assert.ok(r.frames.some(q=>q.waypoint>=c.ready&&Math.abs(q.ground-c.level)<.02),'Must physically reach the attack approach, not pass by being blocked earlier');
 for(const frame of acceptedSubsteps){
  if(Math.abs(frame.feet-frame.ground)>.02)continue;
  const body=new T.Box3(new T.Vector3(frame.x-.499,frame.feet+.351,frame.z-.499),new T.Vector3(frame.x+.499,frame.feet+PLAYER.HEIGHT-1e-6,frame.z+.499));
  for(const q of meshes){
   if(q.box.max.y<=frame.ground+PLAYER.STEP_UP+1e-6||!q.box.intersectsBox(body))continue;
   const triangle=q.triangles.find(tri=>body.intersectsTriangle(tri));if(!triangle)continue;
   auditHits.push(JSON.parse(JSON.stringify({id:c.id,arrived:r.arrived,frame,local:{x:frame.x-row.baselineItem.x,z:frame.z-row.baselineItem.z},role:q.m.userData.role,material:q.m.material?.name,meshLocal:q.m.position.toArray(),body:{min:body.min.toArray(),max:body.max.toArray()},triangle:[triangle.a.toArray(),triangle.b.toArray(),triangle.c.toArray()],productionCollision:cm.checkCollision(new T.Vector3(frame.x,frame.feet+PLAYER.HEIGHT,frame.z))})));
  }
 }
});
