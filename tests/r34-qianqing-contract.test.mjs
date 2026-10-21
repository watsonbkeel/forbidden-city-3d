import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';import {PALACE_LAYOUT} from '../src/scene/Layout.js';import {library} from './lib/inner-palace-fixture.mjs';import {validateQianqingAuxiliary} from '../src/scene/interior/QianqingAuxiliaryContract.js';
const cfg=JSON.parse(fs.readFileSync(new URL('../data/interiors/qianqing.json',import.meta.url))),bytes=fs.readFileSync(new URL('../public'+cfg.model,import.meta.url));
for(const mutation of ['missing-frontage','wrong-frontage','missing-warm-rooms','wrong-warm-boundary'])test('optional Qianqing floor refuses '+mutation+' permanent structure',async()=>{
 const scene=new T.Scene(),b=new PalaceBuilder(scene,library());b.buildAll(PALACE_LAYOUT);const h=scene.getObjectByName('后三宫');
 const r=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
 try{if(mutation==='missing-frontage')delete h.userData.qianqingFrontageFit;if(mutation==='wrong-frontage')h.userData.qianqingFrontageFit.x[3]+=.1;if(mutation==='missing-warm-rooms')delete h.userData.qianqingWarmRooms;if(mutation==='wrong-warm-boundary')h.userData.qianqingWarmRooms.innerX[1]+=.1;
 assert.throws(()=>validateQianqingAuxiliary(r,cfg,scene),/frontage|warm-room/);
 }finally{b.dispose();}
});
