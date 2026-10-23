// Run after the integration owner applies the two-line ZoneBase hook.
// This deliberately fails before wiring, rather than treating direct helper
// tests as proof that production dispatch already invokes the correction.
import test from 'node:test';
import assert from 'node:assert/strict';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library,axis,triangles,goldRuns} from './lib/r58-zuoyi-door-fixture.mjs';
const skins=root=>triangles(root).filter(t=>t.material==='zuoyi_nine_row_front');
async function built({zoneId='axis-courts',index=2,item={...axis.items[2]}}={}){
 const lib=await library(),items=Array.from({length:4},()=>({kind:'region'}));items[index]=item;
 const zone=new ZoneBase(lib,{...axis,id:zoneId,items});const width=zone.buildGate(item),root=zone.kit.finish();return{lib,zone,root,width};
}
test('production ZoneBase dispatch reaches two real nine-row fronts at the exact declaration',async()=>{
 const {lib,zone,root,width}=await built();assert.equal(skins(root).length,4);assert.equal(width,12.4);
 const mat=root.children.find(m=>m.material.name==='zuoyi_nine_row_front').material;assert.equal(goldRuns(mat.map.image).length,9);
 assert.equal(zone.kit.colliders.length,18);assert.equal(zone.kit.walkables.length,1);
 zone.kit.dispose(root);lib.dispose();
});
for(const [label,options]of Object.entries({otherZone:{zoneId:'outer-east'},otherOrdinal:{index:3},otherAnchor:{item:{...axis.items[2],x:-106.46}},otherRotation:{item:{...axis.items[2],rot:'west'}},pairedGate:{index:3,item:{...axis.items[3]}}}))test(`production dispatch rejects ${label}`,async()=>{
 const {lib,zone,root}=await built(options);assert.equal(skins(root).length,0);assert.equal(lib.materials.has('zuoyi_nine_row_front'),false);zone.kit.dispose(root);lib.dispose();
});
