import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {captureBaoheDepth} from './lib/baohe-depth-capture.mjs';
const a=captureBaoheDepth('保和殿');
test('only54 buried lower caps removed; unchanged14sides,top,attributes,placement and shadow',()=>{
 const geo=a.columns[0].mesh.geometry,p=geo.parameters;
 const original=new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height,p.radialSegments,p.heightSegments,p.openEnded);
 const bottom=original.groups.find(g=>g.materialIndex===2);
 assert.equal(p.radialSegments,14);assert.equal(a.columns.length,54);
 assert.deepEqual(Array.from(geo.index.array),Array.from(original.index.array.slice(0,bottom.start)));
 assert.deepEqual(geo.groups,original.groups.filter(g=>g.materialIndex!==2));
 for(const key of Object.keys(original.attributes))assert.deepEqual(geo.attributes[key].array,original.attributes[key].array,key);
 assert.equal((original.index.count-geo.index.count)/3*54,756);
 for(const{mesh}of a.columns){assert.equal(mesh.geometry,geo);assert.equal(mesh.castShadow,true);assert.equal(mesh.position.y-p.height/2,9.9375);}
 const floor=a.group.children.find(m=>m.geometry?.type==='PlaneGeometry'&&Math.abs(m.position.y-9.9675)<1e-9);
 assert.ok(floor);assert.equal(floor.material.transparent,false);assert.equal(floor.material.opacity,1);
 const[w,d]=[floor.geometry.parameters.width,floor.geometry.parameters.height];
 for(const{mesh}of a.columns){assert.ok(Math.abs(mesh.position.x)<=w/2);if(Math.abs(mesh.position.x)+p.radiusBottom>w/2){const wall=a.boxes.find(b=>b.material==='wall_brick'&&Math.abs(b.position[0]-mesh.position.x)<1e-9);assert.ok(wall);assert.ok(p.radiusBottom<wall.size[0]/2);assert.equal(wall.mesh.material.transparent,false);}assert.ok(Math.abs(mesh.position.z)+p.radiusBottom<d/2);}
});
for(const hall of['太和殿','乾清宫'])test(`${hall} retains both original cap groups`,()=>{
 for(const{mesh}of captureBaoheDepth(hall).columns)assert.ok(mesh.geometry.groups.some(g=>g.materialIndex===2));
});
