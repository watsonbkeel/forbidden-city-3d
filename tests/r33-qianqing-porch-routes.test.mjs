import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {registerHooks} from 'node:module';
registerHooks({load(u,c,n){if(u.endsWith('.json'))return{format:'module',source:'export default '+fs.readFileSync(new URL(u),'utf8'),shortCircuit:true};return n(u,c)}});
import * as T from 'three';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {buildWorld,walkStraight} from './lib/world.mjs';import {qianqingVisibleSignatures} from '../src/scene/interior/QianqingAuxiliarySignature.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url));
async function asset(path){const b=read(path);return(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),'')).scene;}
const W=await buildWorld();
function route(points){let feet=2.16;for(let i=1;i<points.length;i++){const r=walkStraight(W,points[i-1],points[i],{feet0:feet,step:.05});assert.ok(r.reached>=r.total-.1,JSON.stringify({points,i,r}));feet=r.feet;}}
for(const state of['B','S'])test(`${state}: both end passages, both continuous verandas and centre connections remain walkable`,async()=>{
 if(state==='S'){const c=JSON.parse(read('data/interiors/qianqing.json')),r=await asset('public'+c.model);r.position.set(0,2.16,316.8);r.updateMatrixWorld(true);r.traverse(o=>{if(!o.isMesh)return;const box=new T.Box3().setFromObject(o);if(o.name.startsWith('COL_'))W.cm.addCollider(box,'interior:qianqing');if(o.name.startsWith('WALK_'))W.cm.addWalkable({type:'box',box,rescue:false},'interior:qianqing');});}
 for(const s of[-1,1])for(const offset of[-1.25,0,1.25]){const x=s*(23-46/18)+offset;route([[x,301],[x,332],[x,301]]);}
 for(const z of[305.8,327.8])route([[-20.444444,z],[0,z],[20.444444,z],[0,z],[-20.444444,z]]);
 route([[0,301],[0,313.7],[6.45,313.7],[6.45,331],[0,331],[0,327.8]]);
 for(const s of[-1,1]){const blocked=walkStraight(W,[s*12,305.8],[s*12,310],{feet0:2.16,step:.05});assert.ok(blocked.reached<2,'window must still block');const wall=walkStraight(W,[s*20.44,319],[s*15,319],{feet0:2.16,step:.05});assert.ok(wall.reached<3,'enclosed side wall must still block');}
});
test('floor-only optional layer retains exact old floor geometry and all 27 proxy bounds, removes only stale columns',async()=>{
 const old=await asset('public/models/interiors/qianqing-r32.glb'),now=await asset('public/models/interiors/qianqing-r33.glb');
 const a=qianqingVisibleSignatures(old),b=qianqingVisibleSignatures(now);assert.equal(a.length,4);assert.equal(b.length,2);assert.deepEqual(b,a.filter(x=>!['merged_red_lacquer','merged_stone'].includes(x.name)));
 const proxies=r=>{r.updateMatrixWorld(true);const out=[];r.traverse(o=>{if(o.isMesh&&/^(COL_|WALK_)/.test(o.name)){const q=new T.Box3().setFromObject(o);out.push([o.name,q.min.toArray(),q.max.toArray()]);}});return out.sort((a,b)=>a[0].localeCompare(b[0]));};assert.equal(proxies(now).length,27);assert.deepEqual(proxies(now),proxies(old));
});
