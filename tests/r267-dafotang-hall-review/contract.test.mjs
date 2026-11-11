import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const file=new URL('./contract.mjs',import.meta.url);
test('minimal real-hall review contract exists',()=>assert.ok(existsSync(file),'contract.mjs is not implemented yet'));
if(existsSync(file)){
 const {LABEL,VIEWS,SETTINGS,requireReady,requireCaptureSet}=await import(file);
 const good=()=>({identity:{head:'a'.repeat(40),tree:'b'.repeat(40),parent:'aa11a2b92fcd858581397bac58c4ac637e04ed57',productTree:'8ac63f05ae9c968ab00d1b52711cff30144c4290'},physicsConsumer:'NONE',source:{layoutOwners:85,upperBandOwners:1,principalSupports:3,subjects:['amitabha','shakyamuni','bhaisajyaguru']},textures:{manifest:true,fallbacks:[],missingNormals:[],errors:[]},plaque:{status:'ready',leaves:2,visible:true},fonts:{status:'loaded',cjk:true},gl:{lost:false},draw:{calls:20,triangles:10000}});
 test('four declared views include actual west and east translations',()=>{assert.equal(VIEWS.length,4);assert.equal(new Set(VIEWS.map(v=>v.id)).size,4);const w=VIEWS[2],e=VIEWS[3];assert.ok(w.position[0]>0&&e.position[0]<0);assert.notDeepEqual(w.position,e.position);assert.equal(SETTINGS.exposure,.7);assert.equal(SETTINGS.postProcessing,'DISABLED_DECLARED');assert.equal(LABEL,'R266大佛堂外观核验 · 隔离真实单堂 · 非导航/碰撞验收');});
 test('only exact frozen-source ready hall is admitted',()=>{assert.equal(requireReady(good()),true);for(const mutate of [r=>r.identity.head='',r=>r.identity.parent='c'.repeat(40),r=>r.physicsConsumer='PLAYER',r=>r.source.layoutOwners=84,r=>r.source.upperBandOwners=0,r=>r.source.principalSupports=2,r=>r.source.subjects.pop()]){const r=good();mutate(r);assert.throws(()=>requireReady(r));}});
 test('texture fallback, absent normal, plaque, font and GL failures fail closed',()=>{for(const mutate of [r=>r.textures.manifest=false,r=>r.textures.fallbacks.push('gold'),r=>r.textures.missingNormals.push('wall_red'),r=>r.textures.errors.push('network'),r=>r.plaque.status='loading',r=>r.plaque.visible=false,r=>r.fonts.cjk=false,r=>r.gl.lost=true,r=>r.draw.triangles=0]){const r=good();mutate(r);assert.throws(()=>requireReady(r));}});
 test('four exact PNG records are necessary but not semantic acceptance',()=>{const rows=VIEWS.map(v=>({id:v.id,file:v.id+'.png',bytes:1234,width:1280,height:800,sha256:'a'.repeat(64)}));assert.equal(requireCaptureSet(rows),true);for(const bad of [rows.slice(1),[...rows,rows[0]],rows.map((x,i)=>i?x:{...x,width:1}),rows.map((x,i)=>i?x:{...x,sha256:''})])assert.throws(()=>requireCaptureSet(bad));});
}
