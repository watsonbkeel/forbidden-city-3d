import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import {augmentRemainingHall,resolveRemainingProfile} from '../src/scene/palace/special/RemainingResidentialHalls.js';
import {YANGXIN_WEST_ROOM_PLAN as P} from '../src/scene/palace/special/YangxinWestWarmRooms.js';
import {actualYangxinRoot} from './r53-yangxin/glb-fixture.mjs';
import {auditYangxinWorld} from './r88-yangxin/world-audit.mjs';
registerHooks({load(url,ctx,next){if(url.endsWith('.json'))return{format:'module',source:`export default ${readFileSync(new URL(url),'utf8')}`,shortCircuit:true};return next(url,ctx);}});
const {InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js');
const item=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/residential-scope.json',import.meta.url))).find(r=>r.name==='养心殿').baselineItem;
const cfg=JSON.parse(readFileSync(new URL('../data/interiors/yangxin.json',import.meta.url)));
function fixture(){const kit=new CourtKit(library(),'west-six'),b=kit.hall(item);augmentRemainingHall(kit,item,b,resolveRemainingProfile('west-six',item));kit.root.updateMatrixWorld(true);const scene=new THREE.Scene();scene.add(kit.root);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders,'west-six');cm.addWalkables(kit.walkables,'west-six');const loader=new InteriorLoader(scene,cm,{registry:{yangxin:cfg}});return{kit,...b,scene,cm,loader};}
async function load(w){const root=await actualYangxinRoot();w.loader.gltf.load=(_u,ok)=>ok({scene:root});assert.equal(await w.loader.load('yangxin'),true);w.loader.update({x:item.x,z:item.z},performance.now()+500);return root;}
function visibleBoxes(root){const list=[];root.updateWorldMatrix(true,true);root.traverse(m=>{if(m.isMesh&&m.visible&&!/^(COL_|WALK_)/.test(m.name))list.push({m,box:new THREE.Box3().setFromObject(m)});});return list;}
function intersectsTriangles(box,mesh){const p=mesh.geometry.attributes.position,idx=mesh.geometry.index,pts=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],t=new THREE.Triangle();for(let i=0;i<(idx?.count??p.count);i+=3){for(let j=0;j<3;j++)pts[j].fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld);t.set(...pts);if(box.intersectsTriangle(t))return true;}return false;}

test('R88 successor R53 actual S GLB proxies stream in/out without removing permanent west-room geometry or collisions',async()=>{
 const w=fixture(),white=w.f.getObjectByName('r53-yangxin-west-warm-rooms'),before=w.cm.colliders.length,owned=w.kit.owned.filter(m=>m.name.startsWith('r53-yangxin')),counts=owned.map(m=>{const v={n:0};m.addEventListener('dispose',()=>v.n++);return v;});
 for(let i=0;i<3;i++){const r=await load(w);assert.equal(r.children.filter(m=>m.name.startsWith('COL_')).length,36);assert.equal(w.cm.colliders.length,before+36);assert.equal(white.parent,w.f);assert.equal(w.loader.halls.get('yangxin').fade,null);w.loader.unload('yangxin');assert.equal(w.cm.colliders.length,before);assert.equal(white.parent,w.f);assert.ok(counts.every(v=>v.n===0));}
 w.loader.dispose();assert.equal(w.cm.colliders.length,before);w.kit.dispose(w.kit.root);assert.ok(counts.every(v=>v.n===1));
});
test('R88 successor R53 in-flight S load cancellation preserves west-room structure and allows a later actual reload',async()=>{
 const w=fixture(),before=w.cm.colliders.length;let done;w.loader.gltf.load=(_u,ok)=>done=ok;const pending=w.loader.load('yangxin');w.loader.unload('yangxin');done({scene:await actualYangxinRoot()});assert.equal(await pending,false);assert.equal(w.cm.colliders.length,before);await load(w);assert.equal(w.cm.colliders.length,before+36);w.loader.dispose();assert.equal(w.cm.colliders.length,before);
});
for(const fps of[10,60])for(const sprint of[false,true])test(`R88 successor R53 actual S controls preserve all two-turn doorway routes, ${fps}Hz sprint=${sprint}`,async t=>{
 const w=fixture();await load(w);const points=[[0,-16],[0,-3],[4.8,-3],[4.8,-.84],...P.route,...P.route.slice(0,-1).reverse(),[4.8,-.84],[4.8,-3],[0,-3],[0,-16]].map(([x,z])=>[item.x+x,item.z+z]);const tr=traceTerraceGround(w.cm,{flights:[]});try{const r=replayTerrace(t,{...w,THREE},points,{fps,sprint});assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(tr.samples.some(s=>s.source==='rescue'),false);}finally{tr.restore();w.loader.dispose();}
});
for(const layer of['B','S'])test(`R88 successor R53 ${layer} visible triangles leave the complete 1m-wide player body clear, not just proxy boxes`,async()=>{
 const w=fixture();if(layer==='S')await load(w);const rows=visibleBoxes(w.scene),origin=new THREE.Vector3(item.x,item.ph,item.z),path=[[4.8,-.84],...P.route];let samples=0;
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/.08);for(let k=0;k<=n;k++){const x=THREE.MathUtils.lerp(a[0],b[0],k/n),z=THREE.MathUtils.lerp(a[1],b[1],k/n),box=new THREE.Box3(new THREE.Vector3(x-.5,.35,z-.5).add(origin),new THREE.Vector3(x+.5,1.65,z+.5).add(origin));samples++;for(const r of rows)if(box.intersectsBox(r.box))assert.equal(intersectsTriangles(box,r.m),false,`${layer}: ${r.m.name||r.m.material.name} at ${x},${z}`);}}
 assert.ok(samples>150);w.loader.dispose();
});
test('R88 successor R53 all new navigation spawns stay clear when actual S collision proxies are installed',async()=>{
 const w=fixture();await load(w);for(const r of w.kit.rooms.filter(r=>r.kind==='r53-yangxin-source-room'))for(const p of[...r.doors,...r.spawns])assert.equal(w.cm.checkCollision(new THREE.Vector3(p.x,item.ph+1.7,p.z),.5),false,r.name);w.loader.dispose();
});

test('R88 successor R53 real ZoneManager unload/re-entry recreates the four rooms and removes every tagged collision/support',async()=>{
 const {ZoneManager}=await import('../src/scene/zones/ZoneManager.js'),oldWindow=globalThis.window;globalThis.window={location:{search:''}};
 const zm=new ZoneManager(),scene=new THREE.Scene(),cm=new CollisionManager();cm.rivers=[];const zone=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));zm.register(zone);
 try{zm.init(scene,library(),cm,{x:item.x,z:item.z});const baseC=cm.colliders.length,baseW=cm.walkables.length;assert.ok(baseC>100);for(let i=0;i<3;i++){const entry=zm.loaded.get('west-six');assert.ok(entry);assert.equal(entry.data.rooms.filter(r=>r.kind==='r53-yangxin-source-room').length,4);const a=entry.data.group.userData.architecture.find(a=>a.catalogId===P.catalogId);assert.equal(a.yangxinWestWarmRooms.stage,P.stage);assert.equal(cm.colliders.length,baseC);assert.equal(cm.walkables.length,baseW);const owned=entry.builder.kit.owned.filter(m=>m.name.startsWith('r53-')),counts=owned.map(m=>{const q={n:0};m.addEventListener('dispose',()=>q.n++);return q;});assert.equal(owned.length,10);zm.unloadZone('west-six');assert.equal(cm.colliders.length,0);assert.equal(cm.walkables.length,0);assert.ok(counts.every(q=>q.n===1));if(i<2)zm.loadZone('west-six');}}
 finally{zm.dispose();globalThis.window=oldWindow;}
});

test('R88 successor R53 reusable caller-world audit also verifies actual loaded S, never simulated proxy evidence',async()=>{const w=fixture();await load(w);const result=auditYangxinWorld({...w,rooms:w.kit.rooms},{layer:'S'});assert.equal(result.ok,true,JSON.stringify(result.blocked));assert.equal(result.actualSProxyCount,36);w.loader.dispose();});
