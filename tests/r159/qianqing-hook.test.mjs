import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library} from '../lib/inner-palace-fixture.mjs';
import {signature} from '../lib/r58-hall-beast-fixture.mjs';

// Rehearsal only. No production owner is patched or written by this loader.
const url=new URL('../../src/scene/PalaceBuilder.js',import.meta.url);
const current=readFileSync(url,'utf8');
const anchor="      ...(data.name === '保和殿' ? { walkingBeastProfile: 'baohe' } : {}),";
const hook="      ...(data.name === '乾清宫' ? { walkingBeastProfile: 'qianqing' } : {}),";
assert.equal(current.split(anchor).length,2,'hook requires one exact current owner anchor');
assert.ok(current.split(hook).length<=2,'no duplicate production hookup');
const hasHook=current.includes(hook),alternative=hasHook?current.replace(hook+'\n',''):current.replace(anchor,anchor+'\n'+hook);
let text=alternative.replace(/from (['"])(\.\.?\/[^'"]+)\1/g,(_,q,p)=>`from '${new URL(p,url).href}'`);
text=text.replace("from 'three'",`from '${import.meta.resolve('three')}'`);
const {PalaceBuilder:Alternative}=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
const Baseline=hasHook?Alternative:PalaceBuilder,Hooked=hasHook?PalaceBuilder:Alternative;

test('R159 exact PalaceBuilder hook rehearsal retains every non-roof part and all Qianqing physics',()=>{
  const data=PALACE_LAYOUT.find(h=>h.name==='乾清宫'),rows=[];
  for(const Builder of[Baseline,Hooked]){
    const b=new Builder(new T.Scene(),library()),g=new T.Group();
    b.buildHall(g,data,2.16,{heightReferenceY:7});g.updateMatrixWorld(true);
    const roofs=g.children.filter(x=>x.userData.doubleEaveMountingBand);
    assert.equal(roofs.length,1);const roof=roofs[0];roof.removeFromParent();
    rows.push({nonRoof:signature(g),roof:signature(roof),records:g.userData.hallWalkingBeasts??[],physics:JSON.stringify({colliders:b.colliders,walkables:b.walkables}),metadata:JSON.stringify({...g.userData,hallWalkingBeasts:undefined})});
    g.add(roof);b.scene.add(g);b.dispose();
  }
  assert.deepEqual(rows[1].nonRoof,rows[0].nonRoof);
  assert.equal(rows[1].physics,rows[0].physics);
  assert.equal(rows[1].metadata,rows[0].metadata);
  assert.notDeepEqual(rows[1].roof,rows[0].roof);
  assert.equal(rows[0].records.length,0);assert.equal(rows[1].records.length,1);
  assert.equal(rows[1].records[0].animalTotal,72);assert.equal(rows[1].records[0].riderTotal,8);
});
