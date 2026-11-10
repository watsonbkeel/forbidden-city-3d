// First product import must stay kit itself. No DOM, loader or product preload.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
assert.equal(typeof document,'undefined');
const kit=await import('../../src/scene/palace/kit.js');
const {FACE}=await import('../../src/scene/palace/FaceDirections.js');
const {ZoneBase}=await import('../../src/scene/zones/ZoneBase.js');
const {REMAINING_OUTER_PROFILES:profiles}=await import('../../src/scene/palace/special/RemainingOuterHalls.js');
const read=p=>fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const sha=s=>createHash('sha256').update(s).digest('hex');

test('cold kit preserves public FACE object identity, descriptors and shared mutability',()=>{
 assert.deepEqual(Object.keys(kit).sort(),['CourtKit','FACE']);assert.equal(typeof kit.CourtKit,'function');
 assert.equal(kit.FACE,FACE);assert.equal(Object.getPrototypeOf(FACE),Object.prototype);assert.equal(Object.isExtensible(FACE),true);
 const expected={south:0,north:Math.PI,east:Math.PI/2,west:-Math.PI/2};
 assert.deepEqual(Reflect.ownKeys(FACE),Object.keys(expected));assert.deepEqual(FACE,expected);
 for(const [key,value]of Object.entries(expected)){
  assert.deepEqual(Object.getOwnPropertyDescriptor(FACE,key),{value,writable:true,enumerable:true,configurable:true});
  assert.equal(ZoneBase.prototype.parseRot(key),value);
 }
 const prior=Object.getOwnPropertyDescriptor(FACE,'north');
 try{FACE.north=.125;assert.equal(kit.FACE.north,.125);assert.equal(ZoneBase.prototype.parseRot('north'),.125);}
 finally{Object.defineProperty(FACE,'north',prior);}
 assert.deepEqual(FACE,expected);
});

test('cold kit keeps all outer profiles and six eager navigation directions',()=>{
 assert.equal(profiles.length,27);assert.equal(Object.isFrozen(profiles),true);
 for(const p of profiles){assert.equal(Object.isFrozen(p),true);assert.equal(Object.isFrozen(p.unknown),true);}
 const nav=profiles.filter(p=>p.navigation);
 assert.deepEqual(nav.map(p=>p.key),['baoxiang','jiyun','ciyin','cining','dafotang','shouan']);
 assert.deepEqual(nav.map(p=>p.navigation.rotation),[-Math.PI/2,Math.PI/2,0,0,0,0]);
 for(const {navigation:n}of nav){
  assert.equal(Object.isFrozen(n),true);assert.equal(n.runtimeReady,true);
  for(const value of [n.rotation,n.localWidth,n.localDepth,n.floorY,n.pad])assert.ok(Number.isFinite(value));
  for(const point of [n.primaryEntry,n.secondaryEntry,n.outwardNormal,n.center,...n.approachPoints].filter(Boolean))
   for(const value of Object.values(point))assert.ok(Number.isFinite(value));
 }
});

test('only the reviewed leaf and two exact source inverses change production',()=>{
 const declaration="export const FACE = { south: 0, north: Math.PI, east: Math.PI / 2, west: -Math.PI / 2 }; // 本场景东 = -X";
 assert.equal(read('src/scene/palace/FaceDirections.js'),'/** 朝向：正面（局部 -Z）朝向给定世界方向时的 rot */\n'+declaration+'\n');
 for(const [path,current,prior,hash]of [
  ['src/scene/palace/kit.js',"export { FACE } from './FaceDirections.js';",declaration,'92fa007e818ec4949a104af53fcba868ca17888a886dffacf784525a55e946fd'],
  ['src/scene/palace/special/RemainingOuterHalls.js',"import { FACE } from '../FaceDirections.js';","import { FACE } from '../kit.js';",'40691c08fbc2ef0232b8d688e0ddc73321d4a916d82fcdc1f9fb0076cb1b1af0']
 ]){const s=read(path);assert.equal(s.split(current).length,2,path+' exact unique delta');assert.equal(sha(s.replace(current,prior)),hash,path+' exact inverse');}
 for(const [path,hash]of Object.entries({
  'src/scene/zones/ZoneBase.js':'d4a8f7007a30650fdc1621c3744afa927722ba72cd2598a2d284ab2f9de6eda5',
  'src/scene/zones/ZoneManager.js':'c90f60a7770436381a953becc3c29ab3bce3e7c98e79c67c11c97c76d4515b19',
  'src/scene/palace/special/XiananContactSources.js':'61a98d35ccc41ab038dd52384f93129032ca9bae0b6f1ffc55a91974e054a6a1',
  'src/scene/palace/special/HuiyaoLou.js':'6675e15cbd735c2cdb9ae41028ab13a09b281b3188946ecb5d77428b894da7f2'
 }))assert.equal(sha(read(path)),hash,path+' unchanged authority/build bytes');
});
