import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {fixture} from './fixture.mjs';
import {assertOriginalObjects,applyFrozenFrontHallExpectation,assertYangxingRetained,assertGateHookOrder,sideOnlySource,gateHooks} from './cumulative-contract.mjs';
for(const mode of ['unrelated-original','rear-pier-bound','first-adjusted-contact','second-adjusted-contact','walkable','extra-tagged-contact','extra-tagged-walkable'])test('cumulative retention rejects '+mode+' drift',()=>{
 const old=fixture({before:true}),current=fixture();
 try{
  applyFrozenFrontHallExpectation(old);
  if(mode==='unrelated-original')current.f.children[0].geometry.attributes.position.array[0]+=.01;
  if(mode==='rear-pier-bound'){const p=current.f.children[22].geometry.attributes.position;for(let i=0;i<p.count;i++)if(p.getZ(i)>4)p.setZ(i,p.getZ(i)+.01)}
  if(mode==='first-adjusted-contact')current.kit.colliders[19].min.z+=.01;
  if(mode==='second-adjusted-contact')current.kit.colliders[20].min.z+=.01;
  if(mode==='walkable')current.kit.walkables[0].box.max.y+=.01;
  if(mode==='extra-tagged-contact'){const c=new T.Box3(new T.Vector3(),new T.Vector3(1,1,1));c.r164NingshouSideStep=true;current.kit.colliders.push(c)}
  if(mode==='extra-tagged-walkable')current.kit.walkables.push({type:'box',box:new T.Box3(new T.Vector3(),new T.Vector3(1,0,1)),r164NingshouSideStep:true});
  assert.throws(()=>assertOriginalObjects(current,old));
 }finally{old.dispose();current.dispose()}
});
test('side-only retention still rejects an unrelated original mesh change',()=>{const a=fixture({before:true}),b=fixture({before:true});try{b.f.children[0].geometry.attributes.position.array[0]+=.01;assert.throws(()=>assertOriginalObjects(b,a))}finally{a.dispose();b.dispose()}});
const source=fs.readFileSync(new URL('../../src/scene/zones/ZoneBase.js',import.meta.url),'utf8');
test('test adapter rejects reordered production hooks',()=>{const changed=source.replace(gateHooks.join(''),[gateHooks[1],gateHooks[0],gateHooks[2]].join(''));assert.throws(()=>assertGateHookOrder(changed));assert.throws(()=>sideOnlySource(changed))});
for(const [index,line] of gateHooks.entries())test('test adapter rejects missing or repeated hook '+index,()=>{assert.throws(()=>sideOnlySource(source.replace(line,'')));assert.throws(()=>sideOnlySource(source+line))});
for(const mode of ['missing','extra-child','extra-group','unknown-marked','changed-original','new-contact','changed-walkable','changed-placement','changed-geometry'])test('Yangxing exact later addition rejects '+mode,()=>{
 const old=fixture({before:true,name:'养性门'}),current=fixture({name:'养性门'}),g=current.f.children.at(-1);let extra;
 try{
  if(mode==='missing')current.f.remove(g);
  if(mode==='extra-child'){extra=new T.Group();g.add(extra)}
  if(mode==='extra-group'){extra=new T.Group();extra.userData.structure={id:'place-ningshou-65cdb57c48-front-ceiling'};current.f.add(extra)}
  if(mode==='unknown-marked'){extra=new T.Group();extra.userData.yangxingFrontCeiling=true;current.f.add(extra)}
  if(mode==='changed-original')current.f.children[0].geometry.attributes.position.array[0]+=.01;
  if(mode==='new-contact')current.kit.colliders.push(new T.Box3(new T.Vector3(),new T.Vector3(1,1,1)));
  if(mode==='changed-walkable')current.kit.walkables[0].box.max.y+=.01;
  if(mode==='changed-placement')g.children[0].position.y+=.01;
  if(mode==='changed-geometry')g.children[1].geometry.attributes.position.array[0]+=.01;
  assert.throws(()=>assertYangxingRetained(current,old));
 }finally{if(g.parent!==current.f)current.f.add(g);extra?.removeFromParent();old.dispose();current.dispose()}
});
