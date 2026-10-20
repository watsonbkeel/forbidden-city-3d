import {restoreR34NightCheckpointIfPresent} from '../lib/r34-night-checkpoint-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {getBeijingDayCycle} from '../../src/scene/sky/BeijingDayCycle.js';
import {Environment} from '../../src/scene/Environment.js';
const state = hour => getBeijingDayCycle(new Date(`2026-06-21T${hour}:00:00+08:00`));
test('R34 night raises readable ambient and warm fill without raising sky or daylight exposure', () => {
 const n=state('00').lighting,d=state('12').lighting;
 assert.ok(n.hemisphereIntensity>=.85); assert.ok(n.fillIntensity>=.45);
 assert.ok(n.fillColor[0]>n.fillColor[2]);
 assert.equal(d.hemisphereIntensity,.5); assert.equal(d.fillIntensity,.25); assert.equal(d.environmentIntensity,.6);
 assert.ok(n.skyTop.every((c,i)=>c<d.skyTop[i])); assert.equal(n.sunIntensity,0);
});
test('R34 existing garden lamp faces glow only at night with no new lights, collision geometry or shadows', () => {
 const e=new Environment(new THREE.Scene(),{toneMappingExposure:1.2},{});
 e.setupSky();e.setupFog();e.setupLights();e.applyDayCycle(new Date('2026-06-21T00:00:00+08:00'));
 const glow=e.nightLampGlow;
 assert.ok(glow?.isInstancedMesh);assert.equal(glow.count,4);assert.equal(glow.castShadow,false);assert.equal(glow.visible,true);
 assert.equal(e.scene.children.filter(o=>o.isLight).length,3);
 assert.ok(glow.material.color.r>glow.material.color.b);assert.equal(glow.material.toneMapped,false);
 const m=new THREE.Matrix4(),p=new THREE.Vector3(); const sites=[];
 for(let i=0;i<glow.count;i++){glow.getMatrixAt(i,m);p.setFromMatrixPosition(m);sites.push(p.toArray().map(n=>Number(n.toFixed(3))));}
 assert.deepEqual(sites,[[-3.3,2,463.1],[3.3,2,463.1],[-3.3,2,471.1],[3.3,2,471.1]]);
 e.setTimePreview(new Date('2026-06-21T12:00:00+08:00'));assert.equal(glow.visible,false);
 e.setTimePreview(new Date('2026-06-21T00:00:00+08:00'));assert.equal(glow.visible,true);
 let geometry=0,material=0;glow.geometry.addEventListener('dispose',()=>geometry++);glow.material.addEventListener('dispose',()=>material++);e.dispose();e.dispose();assert.equal(geometry,1);assert.equal(material,1);
});
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {r34NightSource,restorePreR34NightSource} from '../lib/r34-night-source-retention.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const [path,d] of Object.entries(r34NightSource.files)) test(`Frozen R34 lighting-only checkpoint reverses to R33 and rejects mutations: ${path}`,()=>{
 const bytes=restoreR34NightCheckpointIfPresent(path,fs.readFileSync(new URL('../../'+path,import.meta.url)));
 assert.equal(sha(bytes),d.candidateSHA256);assert.equal(sha(restorePreR34NightSource(path,bytes)),d.baselineSHA256);
 assert.throws(()=>restorePreR34NightSource(path,Buffer.concat([bytes,Buffer.from('\n')])));
 for(const h of d.deltas)assert.throws(()=>restorePreR34NightSource(path,Buffer.from(bytes.toString().replace(h.after,h.before))));
});
test('R34 night illuminates paving, facade normals and eave undersides globally while retaining noon separation',()=>{
 const n=state('00').lighting,d=state('12').lighting;
 const luminance=c=>c[0]*.2126+c[1]*.7152+c[2]*.0722;
 const irradiance=(l,normal)=>{
  const hemi=(normal[1]+1)/2;
  const fill=Math.max(0,(-normal[0]+normal[1]-normal[2])/Math.sqrt(3));
  return l.hemisphereIntensity*(luminance(l.hemisphereSkyColor)*hemi+luminance(l.hemisphereGroundColor)*(1-hemi))+l.fillIntensity*luminance(l.fillColor)*fill;
 };
 for(const normal of [[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,-1,0]])assert.ok(irradiance(n,normal)>.30,`readable normal ${normal}`);
 assert.ok(n.hemisphereIntensity+n.fillIntensity<d.sunIntensity+d.hemisphereIntensity+d.fillIntensity);
});
