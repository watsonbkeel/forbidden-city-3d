import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {CHARACTER_REGISTRY} from '../data/characters/index.js';
import {CharacterRenderer} from '../src/scene/characters/CharacterRenderer.js';
import {characterEnvironmentMotion} from '../src/scene/characters/CharacterBehavior.js';
import {submissionBatchKey} from './lib/r52-submission-batch-key.mjs';
test('evidence batch lookup matches actual Renderer for every original and added actor',()=>{
 const fragment=JSON.parse(fs.readFileSync(new URL('../reports/r52-gate-patrol/registry-fragment.json',import.meta.url))),scene=new T.Scene(),renderer=new CharacterRenderer({scene});
 const rows=[...CHARACTER_REGISTRY.actors,...fragment.actors].map((a,i)=>({...a,pose:a.behavior.basePose,lod:2,position:[i,0,0],rotationYRad:0,animation:characterEnvironmentMotion(a,0),visibility:.008333333767950535}));
 try{renderer.render(rows);for(const a of rows){const key=submissionBatchKey(a),b=renderer.batches.get(key);assert.ok(b,a.id+' '+key);assert.equal(b.mesh.count,rows.filter(r=>submissionBatchKey(r)===key).length);}
  for(const id of ['taihe-emperor-01','chuxiu-consort-01','yongshou-maid-01']){const a=rows.find(a=>a.id===id);if(a)assert.ok(renderer.batches.has(submissionBatchKey(a)));}
 }finally{renderer.dispose();}
});
