import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {nansansuoFixture} from './lib/r59-nansansuo-inventory-fixture.mjs';
import {setupInput} from './lib/input-fixture.mjs';
import {galleryEntryPoints,runGalleryControllerRoute} from './lib/r58-gallery-world-check.mjs';
const a=nansansuoFixture(),scene=new THREE.Scene();scene.add(a.z.kit.root);const results=[];
for(const row of a.rows)for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`Nansansuo declaration ${row.index} actual door round trip ${fps}Hz ${sprint?'sprint':'walk'} ${backward?'S':'W'}`,t=>{
 const input=setupInput(t);input.cm.addColliders(a.z.kit.colliders);input.cm.addWalkables(a.z.kit.walkables);
 const r=row.rooms[0],entry=galleryEntryPoints(r);entry.splice(2,0,[(r.min.x+r.max.x)/2,(r.min.z+r.max.z)/2],entry[1]);
 const result=runGalleryControllerRoute({scene,cm:input.cm,camera:input.camera,controls:input.c},entry,{fps,sprint,backward,tick:input.advance});
 assert.ok(result.arrived,JSON.stringify(result));assert.ok(result.minFeet>=-.001);assert.ok(result.maxFeet>=.89&&result.maxFeet<=.901);
 results.push({target:r.furnishingPolicy.target,points:entry,...result});
});
test.after(()=>{fs.mkdirSync('reports/r59-nansansuo-inventory',{recursive:true});fs.writeFileSync('reports/r59-nansansuo-inventory/controller.json',JSON.stringify({scope:'Six retained candidate entrances, actual controls/collision at 10/60Hz, W/S, walk/sprint. Not historical or browser acceptance.',results},null,2)+'\n');a.dispose()});
