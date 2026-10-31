import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library} from '../lib/inner-palace-fixture.mjs';
// Real production import only: no replacement loader or installer.
test('actual Qianqing buildHall installs one source-bounded 72-beast and 8-rider record',()=>{
 const b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();
 try{b.buildHall(g,PALACE_LAYOUT.find(h=>h.name==='乾清宫'),2.16,{heightReferenceY:7});
 const records=g.userData.hallWalkingBeasts??[];
 assert.equal(records.length,1);assert.equal(records[0].animalTotal,72);assert.equal(records[0].riderTotal,8);
 }finally{b.dispose();}
});
