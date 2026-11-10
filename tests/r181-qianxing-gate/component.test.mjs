import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
const source=new URL('../../src/scene/palace/special/QianxingGlazedGate.js',import.meta.url);
const module=fs.existsSync(source)?await import(source):{};
const zone={id:'yuqing-south-entry',name:'前星门与毓庆宫南入口',bounds:{x0:-145,x1:-130.25,z0:184,z1:205},neighbors:['east-six','axis-courts'],items:[]};
function build(t){assert.equal(typeof module.buildQianxingGlazedGate,'function','independent E45 builder must exist');const lib=realTextureLibrary(),kit=new CourtKit(lib,zone.id);t.after(()=>{kit.dispose(kit.root);lib.dispose()});return{kit,...module.buildQianxingGlazedGate(kit,structuredClone(zone))};}
const meshes=f=>{const out=[];f.traverse(m=>{if(m.isMesh)out.push(m)});return out;};
test('E45 builds its own source-bound facade rather than renaming E46 or only adding text',t=>{
 const{kit,frame,meta}=build(t);assert.equal(frame.parent,kit.root);assert.equal(meta.sourceObjectId,'FC-E8CC6A03C1');assert.equal(meta.name,'前星门');assert.equal(meta.id,'qianxing-glazed-gate-fit');assert.equal(meta.pose,'GAME_OPEN_MODEL_FIT');assert.equal(meta.surveyed,false);assert.equal(meta.compoundComplete,false);assert.equal(meta.currentAdmissionVerified,false);
 const ms=meshes(frame),roles=role=>ms.filter(m=>m.userData.qianxingRole===role);
 for(const[role,n]of[['open-leaf',2],['ornamental-panel',2],['yellow-main-roof',1],['threshold',1]])assert.equal(roles(role).length,n,role);
 assert.ok(roles('yellow-main-roof')[0].geometry.attributes.position.count>36,'actual shaped roof');assert.ok(kit.colliders.length>0);assert.ok(kit.walkables.length>0);assert.equal(kit.mapItems.length,0);assert.equal(kit.rooms.length,0);
});
test('all actual gate vertices, open leaves and physical contacts stay inside its independent reserve south of unchanged E46',t=>{
 const{kit,frame}=build(t);frame.updateWorldMatrix(true,true);const reserve=new T.Box3(new T.Vector3(-138.2,-1e-6,191.6),new T.Vector3(-130.8,5.7,194.6));
 for(const m of meshes(frame)){assert.ok(m.visible);const p=m.geometry.attributes.position;assert.ok(p.count>0);for(let i=0;i<p.count;i++)assert.ok(reserve.containsPoint(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld)),m.name);}
 for(const c of kit.colliders)assert.ok(reserve.containsBox(c),'real contact reserve');for(const w of kit.walkables){assert.ok(reserve.containsBox(w.box));assert.equal(w.rescue,false);}
 assert.ok(new T.Box3().setFromObject(frame).max.z<=194.6);assert.ok(205-new T.Box3().setFromObject(frame).max.z>=10.4-1e-6,'first-court gap is retained');
});
