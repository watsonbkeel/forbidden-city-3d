import test from 'node:test';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as T from 'three';
import { PLAYER } from '../src/config/constants.js';
import { CourtKit } from '../src/scene/palace/kit.js';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { buildWenyuanPavilion } from '../src/scene/palace/special/WenyuanPavilion.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { replayTerrace, traceTerraceGround } from './lib/terrace-walk.mjs';
import * as api from '../src/scene/palace/special/RemainingOuterHalls.js';
const row=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/outer-scope.json',import.meta.url))).find(r=>r.name==='文渊阁');
const kit=new CourtKit(library(),row.zone),b=buildWenyuanPavilion(kit,row.baselineItem),{f,g}=api.augmentRemainingHall(kit,row.baselineItem,b,api.resolveRemainingProfile(row.zone,row.baselineItem));kit.root.updateMatrixWorld(true);
const data=JSON.parse(readFileSync(new URL('../data/zones/outer-east.json',import.meta.url)));
class Preview extends ZoneBase{constructor(){super(library(),data);}buildHall(item){const p=api.resolveRemainingProfile(data.id,item);if(p?.mode==='replace')return api.buildRemainingHall(this.kit,item,p);const b=super.buildHall(item);return p?.mode==='augment'&&b.f.userData.remainingOuter?.id!==p.id?api.augmentRemainingHall(this.kit,item,b,p):b;}}
const zone=new Preview(),built=zone.build(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);const W={THREE:T,cm};
const meshes=[];f.traverse(m=>{if(!m.isMesh||!m.visible)return;const p=m.geometry.attributes.position,ix=m.geometry.index,ts=[];for(let k=0;k<(ix?.count??p.count);k+=3)ts.push(new T.Triangle(...[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(k+j):k+j).applyMatrix4(m.matrixWorld))));meshes.push({m,b:new T.Box3().setFromObject(m),ts});});
const local=ps=>ps.map(([x,z])=>{const q=f.localToWorld(new T.Vector3(x,0,z));return[q.x,q.z]});
const entry=g.navigation.points.map(p=>[p.x,p.z]);
const inside=[...entry,...local([[-3.375,-6.45]])];
const stairs=g.navigation.interiorStairRoutes[0].points.map(p=>[p.x,p.z]);
const mid=[...inside,...local([[16.05,-6.45]]),...stairs.slice(1,4)];
const up=[...inside,...local([[16.05,-6.45]]),...stairs.slice(1)];
const probes=[
 {id:'ground-folded-door',points:[...entry,...local([[-6.2,-7.95]])]},
 {id:'ground-screen-rail',points:[...inside,...local([[-1.1,-6.45],[-1.1,3.5],[-.5,3.5],[-.5,4.4]])]},
 {id:'ground-first-flight-side',points:[...inside,...local([[14.3,-6.45],[14.3,-2],[15.5,-2]])]},
 {id:'mid-front-lintel',points:[...mid,...local([[10,.85],[10,-6.46],[-3.375,-6.46],[-3.375,-8.4]])]},
 {id:'mid-second-flight-under',points:[...mid,...local([[10,.85],[10,-7],[18.12,-7],[18.12,-4.1]])]},
 {id:'upper-front-windows',points:[...up.slice(0,-1),...local([[13.1,-7.4],[-15.6,-7.4]])]},
 {id:'upper-side-gable',points:[...up,...local([[-18.9,-3.4]])]},
 {id:'upper-rear-windows',points:[...up,...local([[13.1,7.4],[-15.6,7.4]])]},
];
const report={moduleHash:createHash('sha256').update(readFileSync(new URL('../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url))).digest('hex'),method:'Actual FirstPersonControls at feet 0, official model pond entry first, full zone collisions, actual transformed render triangles against body feet + .351 to feet + 1.649 and radius .499. No starting inside or on upper floors. Clear low-step contacts whose entire mesh top is within STEP_UP are excluded. Settled feet/ground frames only (difference <= .02).',probes:[]};
test('Wenyuan candidate reachability diagnostics',t=>{for(const probe of probes){const trace=traceTerraceGround(cm,{flights:[]});let r;try{r=replayTerrace(t,W,probe.points,{fps:60,sprint:false,recordFrames:true});}finally{trace.restore()};const hits=new Map(),all=[];for(const frame of r.frames){if(Math.abs(frame.feet-frame.ground)>.02)continue;const body=new T.Box3(new T.Vector3(frame.x-.499,frame.feet+.351,frame.z-.499),new T.Vector3(frame.x+.499,frame.feet+PLAYER.HEIGHT-.051,frame.z+.499));for(const q of meshes){if(!body.intersectsBox(q.b))continue;const k=q.ts.findIndex(tri=>body.intersectsTriangle(tri));if(k<0)continue;if(q.b.max.y<=frame.ground+PLAYER.STEP_UP+1e-6)continue;const key=[q.m.userData.role||'legacy',q.m.material?.name,Math.abs(frame.ground-3.15)<.01?'middle':frame.ground>5.4?'upper':frame.ground<.51?'ground':'stair'].join(' / ');const tri=q.ts[k],rec={key,frame,local:{x:frame.x-row.baselineItem.x,z:frame.z-row.baselineItem.z},mesh:{name:q.m.name,role:q.m.userData.role,material:q.m.material?.name,local:q.m.position.toArray(),box:{min:q.b.min.toArray(),max:q.b.max.toArray()},userData:q.m.userData},body:{min:body.min.toArray(),max:body.max.toArray()},triangle: [tri.a.toArray(),tri.b.toArray(),tri.c.toArray()],productionCollision:cm.checkCollision(new T.Vector3(frame.x,frame.feet+PLAYER.HEIGHT,frame.z))};if(!hits.has(key))hits.set(key,rec);all.push(rec);}}
 const rec={id:probe.id,points:probe.points,arrived:r.arrived,stuckAt:r.stuckAt,startFeet:r.startFeet,maxFeet:r.maxFeet,end:r.end,frames:r.frames.length,unsafeGround:trace.samples.filter(s=>s.source==='rescue'||s.source==='unverified'),firstByClass:[...hits.values()],allHitFrames:all.length};report.probes.push(rec);console.log(JSON.stringify({id:rec.id,arrived:rec.arrived,stuckAt:rec.stuckAt,end:rec.end,classes:[...hits.keys()],unsafe:rec.unsafeGround.length,first:rec.firstByClass.map(h=>({key:h.key,local:h.local,ground:h.frame.ground,feet:h.frame.feet,waypoint:h.frame.waypoint}))}));}
if(process.env.R48_WRITE_OUTER_WENYUAN_PROBE==='1')writeFileSync(new URL('../docs/current-state/r48-remaining/outer-body-wenyuan-probe.json',import.meta.url),JSON.stringify(report,null,2));zone.dispose();kit.dispose(kit.root);});
