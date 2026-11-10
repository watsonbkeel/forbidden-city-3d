import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {ZoneLoadMetrics} from '../../src/scene/zones/ZoneLoadMetrics.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {buildSilhouette} from '../../src/render/SilhouetteBuilder.js';
const zone=()=>JSON.parse(fs.readFileSync(new URL('../../data/zones/yuqing-south-entry.json',import.meta.url)));
test('the real new-zone build reaches the finished production graph and only its own physical owners',t=>{
 const lib=realTextureLibrary(),b=new ZoneBase(lib,zone());t.after(()=>{b.dispose();lib.dispose()});const d=b.build();
 assert.equal(d.group.name,'yuqing-south-entry');assert.equal(d.group.userData.architecture.filter(m=>m.sourceObjectId==='FC-E8CC6A03C1').length,1);assert.equal(d.group.userData.architecture.length,1,'old zone hooks must not emit into new host');
 assert.deepEqual(d.mapItems,[]);assert.deepEqual(d.rooms,[]);assert.equal(d.regions.length,1);assert.deepEqual(d.regions[0],{name:'前星门',minX:-138.2,maxX:-130.8,minZ:191.6,maxZ:194.6});
 assert.ok(d.colliders.length>10);assert.equal(d.walkables.length,2);for(const c of d.colliders)assert.equal(typeof c.qianxingMesh,'string');
 const reserve=new T.Box3(new T.Vector3(-138.2,-1e-6,191.6),new T.Vector3(-130.8,5.7,194.6));d.group.updateMatrixWorld(true);let n=0;d.group.traverse(m=>{if(!m.isMesh)return;n++;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)assert.ok(reserve.containsPoint(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld)),m.name)});assert.ok(n>0);
 const silhouette=buildSilhouette(d.group);assert.ok(silhouette?.isMesh);silhouette.geometry.dispose();silhouette.material.dispose();
});
test('diagnostic metrics recognize only the newly registered exact zone ID and still reject unknown IDs',()=>{
 const m=new ZoneLoadMetrics(()=>0);m.finish(m.begin('yuqing-south-entry','startup'),'ok');assert.equal(m.snapshot().lastStartup.zone,'yuqing-south-entry');m.finish(m.begin('yuqing-south-entry-extra','cold'),'ok');assert.equal(m.snapshot().lastLoad.zone,'unknown');
});
