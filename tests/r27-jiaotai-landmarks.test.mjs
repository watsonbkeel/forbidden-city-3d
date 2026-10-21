import {restorePreR30Navigation} from './lib/r30-qianqing-passage-retention.mjs';
import {restorePreR28SceneRows} from './lib/r28-jiaotai-central-retention.mjs';
import {restorePreR32Navigation,restorePreR32SceneRows} from './lib/r32-scene-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {PLAYER} from '../src/config/constants.js';
import {library,hash,sceneRows} from './lib/inner-palace-fixture.mjs';
import {replayTerrace} from './lib/terrace-walk.mjs';
import {JIAOTAI_LANDMARKS as P,buildJiaotaiLandmarkLevel,installJiaotaiLandmarks} from '../src/scene/palace/special/JiaotaiLandmarks.js';
import {JIAOTAI_ART as A,jiaotaiLandmarkMaterial,mapJiaotaiBoxUV,mapJiaotaiSolidUV} from '../src/scene/palace/special/JiaotaiLandmarkArt.js';
const close=(a,b,e=1e-5)=>assert.ok(Math.abs(a-b)<=e,`${a} != ${b}`);
const scene=new T.Scene(),b=new PalaceBuilder(scene,library());b.buildAll(PALACE_LAYOUT);
const historicalR31Navigation=restorePreR32Navigation({colliders:b.colliders,walkables:b.walkables});
const hall=scene.getObjectByName('后三宫'),meta=hall.userData.jiaotaiLandmarks,frame=meta.frame,lod=hall.getObjectByName('jiaotai-timekeeping-detail');
const cm=new CollisionManager();cm.addColliders(b.colliders);cm.addWalkables(b.walkables);
const raw=buildJiaotaiLandmarkLevel(new T.MeshStandardMaterial(),true);
const faces=g=>(g.index?.count??g.attributes.position.count)/3;

test('official Qing-chi proportions and approximate metre registration remain explicitly separate',()=>{
 assert.equal(P.originalClockChi.height,17.4);assert.deepEqual(P.originalClockChi.layers,[8.4,5.4,3.6]);
 assert.equal(P.originalClockChi.baseWidth,6.9);assert.equal(P.originalClockChi.baseDepth,5.55);assert.equal(P.originalClockChi.dialDiameter,3);
 assert.match(P.heightStatus,/NOT_CONVERTED_QING_CHI/);assert.match(P.placementStatus,/ESTIMATED/);assert.match(A.status,/SCHEMATIC/);
 const q=P.originalClockChi,c=raw.children[0],foot=c.getObjectByName('clock-stepped-foot'),dial=c.getObjectByName('clock-dial');
 close(foot.geometry.parameters.width/P.clock.height,q.baseWidth/q.height);close(foot.geometry.parameters.depth/P.clock.height,q.baseDepth/q.height);close(dial.geometry.parameters.width/P.clock.height,q.dialDiameter/q.height);
 assert.equal(raw.children[0].userData.landmark.side,'west');assert.equal(raw.children[1].userData.landmark.side,'east');
 for(const [i,x]of[[0,-1],[1,1]]){const front=new T.Vector3(0,0,-1).applyQuaternion(raw.children[i].quaternion);close(front.x,x);close(front.z,0);}
});

test('clock is a sculpted crown and dial; clepsydra is a separate double-eave pavilion with three visible reservoirs',()=>{
 const clock=raw.children[0],water=raw.children[1];assert.ok(clock.getObjectByName('clock-sculpted-crown-silhouette'));assert.ok(clock.getObjectByName('clock-dial'));assert.ok(!clock.children.some(x=>/^clepsydra-(lower|upper)-eave$/.test(x.name)));
 assert.equal(water.children.filter(x=>/^clepsydra-(lower|upper)-eave$/.test(x.name)).length,2);assert.equal(water.children.filter(x=>x.name==='clepsydra-visible-tapered-reservoir').length,3);assert.ok(!water.getObjectByName('clock-dial'));
 for(const roof of water.children.filter(x=>/^clepsydra-(lower|upper)-eave$/.test(x.name))){assert.equal(faces(roof.geometry),14);const n=roof.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert.ok(n.getY(i)>0,'outward/upward roof incl. top cap');}
 const heights=water.children.filter(x=>x.name==='clepsydra-visible-tapered-reservoir').map(x=>x.position.y);assert.ok(heights[0]>heights[1]&&heights[1]>heights[2]);
});

test('two fixed envelopes enclose all near and far vertices, including the inward projecting water-clock foot',()=>{
 const added=historicalR31Navigation.colliders.slice(-2);assert.equal(added.length,2);
 for(const fine of[true,false]){const root=buildJiaotaiLandmarkLevel(raw.children[0].children[0].material,fine);for(let i=0;i<2;i++){
  const bb=new T.Box3().setFromObject(root.children[i]);bb.translate(new T.Vector3(frame.x,frame.y,frame.z));const c=added[i];for(const a of['x','y','z']){assert.ok(bb.min[a]>=c.min[a]-1e-5);assert.ok(bb.max[a]<=c.max[a]+1e-5);}
  close(bb.min.y,frame.y);close(bb.max.y,frame.y+P[i?'clepsydra':'clock'].height);
 }}
 close(added[1].min.x,frame.x+P.clepsydra.x-P.clepsydra.depth*.44);close(added[1].max.x,frame.x+P.clepsydra.x+P.clepsydra.depth*.66);
 for(const p of[P.clock,P.clepsydra])assert.equal(cm.checkCollision(new T.Vector3(p.x,frame.y+PLAYER.HEIGHT,frame.z+p.z)),true);
});

test('historical R27 retains previous 2487 colliders and 120 walkables, with only two artifact solids added',()=>{
 assert.equal(restorePreR30Navigation(historicalR31Navigation).colliders.length,2489);assert.equal(historicalR31Navigation.colliders.length,2503);assert.equal(historicalR31Navigation.walkables.length,120);assert.equal(hash((()=>{const n=restorePreR30Navigation(historicalR31Navigation);return{colliders:n.colliders.slice(0,-2),walkables:n.walkables};})()),'a1668d4eaf2b4ea21b0ea5a45fb421ef299ff48888d4d23bb1f60396be825853');
 assert.equal(meta.navigation,'FIXED_NEAR_ENVELOPES_BOTH_LODS');const before=hash({c:b.colliders,w:b.walkables}),cam=new T.PerspectiveCamera();for(const dist of[0,200,0,90,100]){cam.position.set(frame.x,frame.y,frame.z+dist);cam.updateMatrixWorld(true);lod.update(cam);assert.equal(hash({c:b.colliders,w:b.walkables}),before);}
 const originalGroups={午门:'be7045098ed7f2cd79bdd037ec87a89cca6ddc022978063942bdf5ca45c1e46f',三台:'093376bff24c244359e8034a844edf852bbcb1599cfb26285598050df5df0a09'};const rows=restorePreR32SceneRows(sceneRows(scene));for(const [name,h]of Object.entries(originalGroups))assert.equal(rows[name].hash,h);
});

test('both resident detail levels count toward geometry; only one material batch is drawn at a time',()=>{
 assert.equal(lod.levels.length,2);assert.equal(lod.levels[1].distance,90);assert.equal(lod.levels[1].hysteresis,.1);
 assert.deepEqual(lod.levels.map(x=>x.object.children.length),[1,1]);assert.deepEqual(lod.levels.map(x=>faces(x.object.children[0].geometry)),[1024,142]);assert.equal(lod.levels[0].object.children[0].material,lod.levels[1].object.children[0].material);
 const rows=Object.values(restorePreR28SceneRows(sceneRows(scene)));assert.equal(rows.reduce((s,r)=>s+r.meshes,0),166);assert.equal(rows.reduce((s,r)=>s+r.triangles,0),189241);
 scene.updateMatrixWorld(true);const cam=new T.PerspectiveCamera();for(const [d,near]of[[5,true],[180,false],[10,true]]){cam.position.set(frame.x,frame.y,frame.z+d);cam.updateMatrixWorld(true);lod.update(cam);assert.equal(lod.levels[0].object.visible,near);assert.equal(lod.levels[1].object.visible,!near);}
});

test('all atlas coordinates are finite and roof/panel/dial surfaces use only designated padded cells',()=>{
 raw.traverse(m=>{if(!m.isMesh)return;const uv=m.geometry.attributes.uv;assert.equal(uv.count,m.geometry.attributes.position.count);for(const v of uv.array)assert.ok(Number.isFinite(v)&&v>=0&&v<=1);});
 const box=mapJiaotaiBoxUV(new T.BoxGeometry(),[0,1,2,3,4,5]);for(let f=0;f<6;f++){const x=f%4,y=Math.floor(f/4);for(let i=f*4;i<f*4+4;i++){assert.ok(box.attributes.uv.getX(i)>x/4&&box.attributes.uv.getX(i)<(x+1)/4);assert.ok(box.attributes.uv.getY(i)>(1-(y+1)/2)&&box.attributes.uv.getY(i)<1-y/2);}}
 for(const bad of[-1,8,NaN,1.5])assert.throws(()=>mapJiaotaiBoxUV(new T.BoxGeometry(),[bad,0,0,0,0,0]));for(const bad of[0,3,8,NaN])assert.throws(()=>mapJiaotaiSolidUV(new T.ConeGeometry(),bad));assert.throws(()=>mapJiaotaiBoxUV(new T.PlaneGeometry(),[0,0,0,0,0,0]));
});

test('private shared atlas is cached, non-emissive, sRGB and disposed once without altering existing gold',()=>{
 const owner=new PalaceBuilder(new T.Scene(),library()),gold=owner.ownMat('existing-gold',{color:0xc9a13b,metalness:.8}),before=gold.toJSON();
 const mat=jiaotaiLandmarkMaterial(owner);assert.equal(mat,jiaotaiLandmarkMaterial(owner));assert.deepEqual(gold.toJSON(),before);assert.equal(mat.map.image.width,1024);assert.equal(mat.map.image.height,512);assert.equal(mat.map.colorSpace,T.SRGBColorSpace);assert.equal(mat.emissive.getHex(),0);assert.equal(mat.transparent,false);
 let disposed=0;mat.map.addEventListener('dispose',()=>disposed++);owner.dispose();mat.dispose();assert.equal(disposed,1);
});

test('unregistered or duplicated installation fails before introducing more geometry',()=>{
 assert.throws(()=>installJiaotaiLandmarks(b,hall),/already installed/);assert.throws(()=>installJiaotaiLandmarks(b,new T.Group()),/Unregistered/);assert.throws(()=>buildJiaotaiLandmarkLevel(raw.children[0].children[0].material,0),/Explicit/);
 const owner=new PalaceBuilder(new T.Scene(),library());owner.ox=1;assert.throws(()=>installJiaotaiLandmarks(owner,hall),/world-aligned/);owner.dispose();
});

const z=frame.z,paths={
 southToNorth:[[0,z-11],[0,z-3],[3.5,z-3],[3.5,z+7.2],[0,z+7.2],[0,z+11]],
 westToSouth:[[11,z],[8.1,z],[8.1,z-1.9],[7.2,z-1.9],[7.2,z-3],[0,z-3],[0,z-11]],
 eastToSouth:[[-11,z],[-8.1,z],[-8.1,z-1.9],[-7.2,z-1.9],[-7.2,z-3],[0,z-3],[0,z-11]],
};
for(const [name,path]of Object.entries(paths))for(const reverse of[false,true])test(`real controller ${name} ${reverse?'reverse':'forward'} at 60fps`,t=>{
 const out=replayTerrace(t,{THREE:T,cm},reverse?[...path].reverse():path,{fps:60});assert.equal(out.arrived,true,JSON.stringify(out));
});

test('direct paths through either new artifact remain physically blocked',()=>{
 for(const p of[P.clock,P.clepsydra]){assert.equal(cm.checkCollision(new T.Vector3(p.x,frame.y+PLAYER.HEIGHT,z)),true);assert.equal(cm.checkCollision(new T.Vector3(p.x,frame.y+PLAYER.HEIGHT,z-2.1)),false);}
});

test('clock crown, dial case and finials are connected in both detail levels and the dial does not expand at distance',()=>{
 const fine=raw.children[0],far=buildJiaotaiLandmarkLevel(fine.children[0].material,false).children[0];
 const caseTop=g=>{const m=g.getObjectByName('clock-dial-case');return m.position.y+m.geometry.parameters.height/2;};
 const cornice=fine.getObjectByName('clock-upper-cornice');assert.ok(caseTop(fine)>=cornice.position.y-cornice.geometry.parameters.height/2);
 const crown=fine.getObjectByName('clock-sculpted-crown-silhouette');assert.ok(crown.position.y<=cornice.position.y+cornice.geometry.parameters.height/2);
 const farCrown=far.getObjectByName('clock-far-crown');close(caseTop(far),farCrown.position.y-farCrown.geometry.parameters.height/2);
 const nearDial=fine.getObjectByName('clock-dial'),farDial=far.getObjectByName('clock-far-dial');close(nearDial.geometry.parameters.width,farDial.geometry.parameters.width);close(nearDial.geometry.parameters.height,farDial.geometry.parameters.height);close(nearDial.position.y,farDial.position.y);
 const tip=fine.getObjectByName('clock-central-finial');assert.ok(tip.position.z>=crown.position.z&&tip.position.z<=crown.position.z+.055);crown.geometry.computeBoundingBox();assert.ok(tip.position.y-tip.geometry.parameters.height/2<=crown.position.y+crown.geometry.boundingBox.max.y);
 const posts=fine.children.filter(m=>m.name==='clock-crown-post'),tips=fine.children.filter(m=>m.name==='clock-crown-point');for(let i=0;i<4;i++)close(posts[i].position.y+posts[i].geometry.parameters.height/2,tips[i].position.y-tips[i].geometry.parameters.height/2);
});

test('pavilion upper drum reaches the actual upper roof surface; reservoir supports are physically connected',()=>{
 const water=raw.children[1],drum=water.getObjectByName('clepsydra-upper-drum'),roof=water.getObjectByName('clepsydra-upper-eave');
 const clone=roof.clone();clone.updateMatrixWorld(true);const top=drum.position.y+drum.geometry.parameters.height/2;
 for(const x of[-drum.geometry.parameters.width/2,0,drum.geometry.parameters.width/2])for(const z of[-drum.geometry.parameters.depth/2,0,drum.geometry.parameters.depth/2]){
  const hits=new T.Raycaster(new T.Vector3(x,10,z),new T.Vector3(0,-1,0)).intersectObject(clone);assert.ok(hits.length);close(hits[0].point.y,top);
 }
 const pots=water.children.filter(m=>m.name==='clepsydra-visible-tapered-reservoir'),supports=water.children.filter(m=>['clepsydra-reservoir-shelf','clepsydra-front-step','clepsydra-upper-deck'].includes(m.name));
 for(const pot of pots){pot.geometry.computeBoundingBox();const bottom=pot.position.y+pot.geometry.boundingBox.min.y;assert.ok(supports.some(m=>{const y=m.position.y+m.geometry.parameters.height/2;return y>=bottom-1e-5&&y<pot.position.y&&Math.abs(m.position.z-pot.position.z)<m.geometry.parameters.depth/2;}));}
});
