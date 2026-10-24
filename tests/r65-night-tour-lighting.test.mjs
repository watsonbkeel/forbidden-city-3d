import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Environment} from '../src/scene/Environment.js';
import {getBeijingDayCycle} from '../src/scene/sky/BeijingDayCycle.js';
import {nightTourLighting} from '../src/scene/sky/NightTourLighting.js';
test('moon/fill gains are bounded continuous night-only aids; no daylight/time/exposure forgery',()=>{
 let prev=nightTourLighting(0);for(let i=1;i<=1000;i++){const n=nightTourLighting(i/1000);assert.ok(n.moonIntensity<=prev.moonIntensity+1e-12);assert.ok(Math.abs(n.moonIntensity-prev.moonIntensity)<.003);prev=n;}
 assert.equal(nightTourLighting(1).moonIntensity,0);assert.equal(nightTourLighting(1).hemisphereBoost,0);assert.equal(nightTourLighting(0).moonIntensity,.42);
 const renderer={toneMappingExposure:.7},e=new Environment(new THREE.Scene(),renderer,{});e.setupSky();e.setupFog();e.setupLights();
 for(const hour of['00','05','17','23']){const date=new Date(`2026-10-23T${hour}:25:00+08:00`);e.applyDayCycle(date);const l=getBeijingDayCycle(date).lighting;assert.equal(e.dayCycle.lighting.daylight,l.daylight);assert.equal(e.dirLight.intensity,l.sunIntensity);assert.equal(e.moonLight.castShadow,false);assert.equal(renderer.toneMappingExposure,.7);assert.equal(e.scene.children.filter(o=>o.isLight).length,4);}
 const noon=new Date('2026-06-21T12:00:00+08:00');e.applyDayCycle(noon);assert.equal(e.moonLight.intensity,0);assert.equal(e.hemiLight.intensity,.5);assert.equal(e.fillLight.intensity,.25);
 e.applyDayCycle(new Date('2026-10-23T00:00:00+08:00'));assert.equal(e.dirLight.intensity,0);assert.equal(e.hemiLight.intensity,1.1);assert.equal(e.fillLight.intensity,.65);assert.ok(e.sky.material.uniforms.topColor.value.r<.2);
 e.dispose();e.dispose();assert.equal(e.scene.children.length,0);
});
