import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CharacterManager} from '../src/scene/characters/CharacterManager.js';
function fixture({approved=true,schedule='ceremony-daylight'}={}){
 const camera=new THREE.PerspectiveCamera(60,1,.1,1000);camera.position.set(0,1.6,6);camera.lookAt(0,1,0);camera.updateMatrixWorld();
 const actor={id:'emperor',required:true,priority:100,templateId:'emperor-ceremonial',schedule,placement:{mode:'surface'},behavior:{basePose:'standing'}};
 let selected=[],resolves=0,revision=0;const adapter={getRevision:()=>revision,resolve:()=>{resolves++;return{status:'ready',position:[0,0,0],rotationYRad:0}}};
 const renderer={render:a=>(selected=a,{renderCopies:a.length}),clear:()=>selected=[],dispose(){}};
 const manager=new CharacterManager({registry:{actors:[actor]},adapter,renderer,contentApproved:approved});
 return{camera,manager,get selected(){return selected},get resolves(){return resolves},reload(){revision++},step(dt=1/60,options={}){manager.update(dt,{camera,...options})}};
}
test('newly ready required emperor fades in over 0.35 seconds without moving or duplicate copies',()=>{
 const f=fixture();f.step();assert.equal(f.manager.snapshot().loaded,1);assert.equal(f.selected.length,1);assert.ok(f.selected[0].visibility>0&&f.selected[0].visibility<.1);
 let last=0;for(let i=0;i<25;i++){f.step();assert.equal(f.selected.length,1);assert.deepEqual(f.selected[0].position,[0,0,0]);assert.ok(f.selected[0].visibility>=last);last=f.selected[0].visibility;}assert.equal(last,1);
});
test('LOD and quality changes never restart readiness fade',()=>{
 const f=fixture();for(let i=0;i<5;i++)f.step(.1);for(const distance of[8,25,70,25,8]){f.camera.position.z=distance;f.camera.lookAt(0,1,0);f.step(.016,{quality:distance===25?'low':'high'});assert.equal(f.selected[0].visibility,1);}
});
test('hidden/resumed frame does not fast-forward readiness fade',()=>{
 const f=fixture();f.step(.05);const before=f.selected[0].visibility;f.step(30,{hidden:true});f.step(30);assert.equal(f.selected[0].visibility,before);f.step(.05);assert.ok(f.selected[0].visibility>before&&f.selected[0].visibility<1);
});
test('readiness fade cannot bypass night, disabled or unapproved gates',()=>{
 const f=fixture();f.step(.1,{daylight:0});assert.equal(f.selected.length,0);f.manager.setEnabled(false);f.step(.1);assert.equal(f.selected.length,0);const gated=fixture({approved:false});gated.step(.1);assert.equal(gated.resolves,0);assert.equal(gated.selected.length,0);
});
test('a genuinely new support revision restarts fade, but ordinary updates do not',()=>{
 const f=fixture();for(let i=0;i<5;i++)f.step(.1);assert.equal(f.selected[0].visibility,1);f.reload();f.step(.016);assert.ok(f.selected[0].visibility>0&&f.selected[0].visibility<.1);f.step(.016);assert.ok(f.selected[0].visibility<.2);
});
