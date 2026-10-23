import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {PLAYER} from '../src/config/constants.js';

function curve(){
 const box=new THREE.Box3(new THREE.Vector3(0,3,0),new THREE.Vector3(4,8,1));
 box.overhead={type:'piecewise-linear-x',points:[[0,3],[2,5],[4,3]],minZ:0,maxZ:1,topY:8,sourceId:'axis/wumen-north-head/0'};
 return box;
}
function fixture(){const cm=new CollisionManager();cm.rivers=[];const box=curve();cm.addCollider(box,'scoped');return {cm,box};}
test('explicit curved solid uses real underside, not its enclosing box',()=>{
 const {cm}=fixture();
 assert.equal(cm.checkCollision(new THREE.Vector3(2,4,.5),.2),false,'clear centre space inside the broad-phase AABB');
 assert.equal(cm.checkCollision(new THREE.Vector3(.4,3.3,.5),.5),true,'outer footprint reaches the low shoulder');
 assert.equal(cm.checkCollision(new THREE.Vector3(2,4,1.50001),.5),false);
});
test('upward sweep clamps the full footprint and never merely samples its centre',()=>{
 const {cm}=fixture();
 const allowed=cm.limitUpwardFeet(.6,.5,0,3,.5,PLAYER.HEIGHT);
 assert.ok(allowed>1.398&&allowed<1.4,`${allowed}: x=.1 has underside3.1, not centre3.6`);
 assert.equal(cm.limitUpwardFeet(2,.5,0,2,.5,PLAYER.HEIGHT),2);
});
test('descending, zero movement, outside footprint and above the cap remain unchanged',()=>{
 const {cm}=fixture();
 for(const [x,z,from,to] of [[.6,.5,2,1],[.6,.5,1,1],[8,.5,0,4],[.6,2,0,4],[.6,.5,8,9]])
  assert.equal(cm.limitUpwardFeet(x,z,from,to,.5,PLAYER.HEIGHT),to);
});
test('exact contact stops upward motion without pulling the feet downward',()=>{
 const {cm}=fixture(),from=3.1-PLAYER.HEIGHT;
 assert.equal(cm.limitUpwardFeet(.6,.5,from,from+.2,.5,PLAYER.HEIGHT),from);
});
test('unmarked historical boxes retain collision and upward behaviour',()=>{
 const cm=new CollisionManager();cm.rivers=[];const box=curve();delete box.overhead;cm.addCollider(box,'old');
 assert.equal(cm.checkCollision(new THREE.Vector3(2,4,.5),.2),true);
 assert.equal(cm.limitUpwardFeet(2,.5,0,4,.5,PLAYER.HEIGHT),4);
});
test('registration deep-clones immutable curve data and rejects malformed data atomically',()=>{
 const {cm,box}=fixture(),saved=cm.colliders[0].overhead;
 assert.ok(saved&&Object.isFrozen(saved)&&Object.isFrozen(saved.points)&&Object.isFrozen(saved.points[0]));
 box.overhead.points[0][1]=0;assert.equal(saved.points[0][1],3);
 const bad=curve();bad.overhead.points[1][0]=0;const n=cm.colliders.length;
 assert.throws(()=>cm.addCollider(bad,'bad'),TypeError);assert.equal(cm.colliders.length,n);
});
test('tag removal and clear remove the scoped ceiling without stale side registries',()=>{
 const {cm}=fixture();cm.removeByTag('scoped');assert.equal(cm.colliders.length,0);
 assert.equal(cm.limitUpwardFeet(.6,.5,0,3),3);
 cm.addCollider(curve(),'again');cm.clear();assert.equal(cm.limitUpwardFeet(.6,.5,0,3),3);
});
test('unchanged source update preserves the tagged shape; malformed updates fail before mutation',()=>{
 const {cm,box}=fixture();cm.updateCollider(box);assert.equal(cm.colliders[0].overhead.points[0][1],3);
 const before=cm.colliders[0].box.clone();box.min.x=-1;
 assert.throws(()=>cm.updateCollider(box),TypeError);assert.ok(cm.colliders[0].box.equals(before));
});
test('head-only curve proxies do not turn broadphase topY into an extra support surface',()=>{
 const {cm}=fixture();
 assert.equal(cm.supportHeight(2,.5,8),-Infinity);
 const legacy=curve();delete legacy.overhead;cm.addCollider(legacy,'old');
 assert.equal(cm.supportHeight(2,.5,8),8,'untagged support behavior is retained');
});
