import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {existsSync} from 'node:fs';
const url=new URL('../src/utils/OverheadShape.js',import.meta.url),api=existsSync(url)?await import(url):null;
const makeBox=()=>new THREE.Box3(new THREE.Vector3(-2,3,8),new THREE.Vector3(2,9,9.2));
const shape=()=>({type:'piecewise-linear-x',points:[[-2,3],[-1,5],[0,6],[1,5],[2,3]],minZ:8,maxZ:9.2,topY:9,sourceId:'test/north-head'});
const clone=()=>{assert.equal(typeof api?.cloneOverheadShape,'function','missing strict curved overhead shape');return api.cloneOverheadShape(shape(),makeBox());};
test('strict immutable shape clone is separate from input at every point',()=>{
 const input=shape(),copy=clone();assert.deepEqual(copy,input);assert.ok(Object.isFrozen(copy)&&Object.isFrozen(copy.points)&&copy.points.every(Object.isFrozen));
 const live=api.cloneOverheadShape(input,makeBox());input.points[0][1]=900;input.points.push([3,2]);assert.equal(live.points[0][1],3);assert.equal(live.points.length,5);
});
test('invalid source, type, finite/order requirements and box mismatch fail closed',()=>{
 clone();const b=makeBox();for(const bad of [null,{}, {...shape(),type:'box'},{...shape(),sourceId:''},{...shape(),sourceId:4},{...shape(),points:[]},{...shape(),points:[[0,3]]},{...shape(),points:[[-2,3],[-2,4],[2,3]]},{...shape(),points:[[-2,3],[2,Infinity]]},{...shape(),points:[[-2,NaN],[2,3]]},{...shape(),points:[[-2,3,4],[2,3]]},{...shape(),points:[[-2,3],[0,10],[2,3]]},{...shape(),minZ:NaN},{...shape(),minZ:9.2},{...shape(),minZ:8.1},{...shape(),maxZ:9.1},{...shape(),topY:10},{...shape(),points:[[-1.9,3],[2,3]]},{...shape(),points:[[-2,3],[1.9,3]]},{...shape(),points:[[-2,4],[2,4]]}])assert.throws(()=>api.cloneOverheadShape(bad,b),TypeError);
 for(const key of ['x','y','z'])for(const side of ['min','max']){const box=makeBox();box[side][key]=Infinity;assert.throws(()=>api.cloneOverheadShape(shape(),box),TypeError);}
 assert.throws(()=>api.cloneOverheadShape(shape(),{}),TypeError);
});
test('footprint clips segments and uses entire footprint, not center height or broadphase bottom',()=>{
 const s=clone();assert.equal(api.overheadHeightAtFootprint(s,-.25,.25,8.4,8.6),5.75);
 assert.equal(api.overheadHeightAtFootprint(s,1.5,1.8,8.4,8.6),3.4);
 assert.equal(api.overheadHeightAtFootprint(s,-5,-1.5,8.4,8.6),3);
 assert.equal(api.overheadHeightAtFootprint(s,0,0,8.4,8.6),6);
 for(const q of [[3,4,8,9],[-4,-3,8,9],[-1,1,7,7.9],[-1,1,9.3,10]])assert.equal(api.overheadHeightAtFootprint(s,...q),Infinity);
 assert.equal(api.overheadHeightAtFootprint(s,2,3,9.2,10),3,'closed-boundary contact');
 for(const q of [[1,-1,8,9],[0,1,9,8],[NaN,1,8,9],[0,Infinity,8,9]])assert.throws(()=>api.overheadHeightAtFootprint(s,...q),TypeError);
});
test('internal valley is included, not endpoints only or semicircle assumptions',()=>{
 clone();const input={...shape(),points:[[-2,4],[-1,3],[0,6],[1,3.5],[2,4]]},s=api.cloneOverheadShape(input,makeBox());assert.equal(api.overheadHeightAtFootprint(s,-1.5,1.5,8,9),3);
});
test('solid curved volume ignores broadphase void and bounds its top and z band',()=>{
 const s=clone(),b=(x0,y0,z0,x1,y1,z1)=>new THREE.Box3(new THREE.Vector3(x0,y0,z0),new THREE.Vector3(x1,y1,z1));
 assert.equal(api.overheadIntersectsBox(s,b(-.25,3.5,8.2,.25,5.7,9)),false);
 assert.equal(api.overheadIntersectsBox(s,b(-.25,3.5,8.2,.25,5.76,9)),true);
 assert.equal(api.overheadIntersectsBox(s,b(-.25,9.01,8.2,.25,10,9)),false);
 assert.equal(api.overheadIntersectsBox(s,b(-.25,3.5,9.21,.25,8,10)),false);
 assert.equal(api.overheadIntersectsBox(s,b(3,3.5,8.2,4,8,9)),false);
 assert.equal(api.overheadIntersectsBox(s,b(-.25,5.75,8.2,.25,5.75,9)),true);
 assert.throws(()=>api.overheadIntersectsBox(s,b(1,4,8,-1,5,9)),TypeError);
});
