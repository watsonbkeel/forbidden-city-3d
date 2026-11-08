import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {fixture} from './fixture.mjs';
import {buildDafotangMainBuddha} from '../../src/scene/palace/special/DafotangMainBuddha.js';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {triangleFootContact,triangleBodyIntersects} from '../../src/utils/TriangleSupport.js';

test('the real host source adds exactly one principal after retained warm-room partitions and before ceiling/finish',()=>{
 const source=fs.readFileSync(new URL('../../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url),'utf8');
 assert.equal(source.split("import {buildDafotangMainBuddha} from './DafotangMainBuddha.js';").length-1,1);
 const start=source.indexOf('function buildCeremonialHall('),end=source.indexOf('function buildCiningModernDisplay('),body=source.slice(start,end);
 assert.equal(body.split('buildDafotangMainBuddha(c)').length-1,1);
 assert.ok(body.indexOf('buildDafotangMainBuddha(c)')>body.indexOf("g.partitionEvidence='THREE_SECTIONS_OFFICIAL__3_2_2_BAY_SPLIT_AND_DOOR_LOCATIONS_FITTED'"));
 assert.ok(body.indexOf('buildDafotangMainBuddha(c)')<body.indexOf('plainCeiling(c,'));
 assert.match(body,/if\(p\.key==='dafotang'\)buildDafotangMainBuddha\(c\);/);
});
test('actual kit merge and dispose preserve cloneable feature metadata, CPU triangles and independent resource lifetime on a descriptor host',()=>{
 const c=fixture(),out=buildDafotangMainBuddha(c),events=new Map(),materials=[...c.kit.owned];for(const m of out.meshes)m.geometry.addEventListener('dispose',()=>events.set(m.geometry,(events.get(m.geometry)??0)+1));for(const m of materials)m.addEventListener('dispose',()=>events.set(m,(events.get(m)??0)+1));
 // Mirrors the unchanged RemainingOuterHalls.finish projection. No real hall
 // is built in this low-memory test; actual host retention remains separate.
 c.f.userData.structure={...c.g,remainingProfile:'dafotang'};c.kit.buildPlaqueAtlas=()=>{};
 const merged=CourtKit.prototype.finish.call(c.kit);const meta=merged.userData.architecture.find(r=>r.id==='place-outer-west-6cae88b6a2');assert.deepEqual(meta.historicalPrincipal,out.meta);assert.deepEqual(meta.inventory,c.g.inventory);assert.notEqual(meta.historicalPrincipal,c.g.historicalPrincipal);
 for(const m of out.meshes)assert.equal(events.get(m.geometry),1);for(const m of materials)assert.equal(events.get(m),undefined);
 for(const b of out.contacts.filter(b=>b.triangleSupport)){assert.ok(b.triangleSupport.template.triangles.length);assert.ok(b.triangleSupport.template.triangles.every(t=>t.triangle.getArea()>1e-12));}
 let mergedCount=0,disposed=0;merged.traverse(o=>{if(o.geometry){mergedCount++;o.geometry.addEventListener('dispose',()=>disposed++);}});assert.equal(mergedCount,4);
 CourtKit.prototype.dispose.call(c.kit,merged);assert.equal(disposed,4);for(const m of materials)assert.equal(events.get(m),1);assert.equal(c.kit.colliders.length,0);assert.equal(c.kit.walkables.length,0);
});
test('component-only side/front body boxes remain clear and triangle support is explicitly not mistaken for no physical support',()=>{
 const c=fixture(),out=buildDafotangMainBuddha(c);try{
 for(const[x,z]of[[0,2.9],[-2,2.9],[-2,5.6],[2,2.9],[2,5.6]]){const body=new T.Box3(new T.Vector3(221.9+x-.5,.9+.08,241.1+z-.5),new T.Vector3(221.9+x+.5,.9+1.7,241.1+z+.5));for(const b of out.contacts)assert.equal(b.triangleSupport?triangleBodyIntersects(b.triangleSupport,body):b.intersectsBox(body),false,'component-only retained design points');}
 const hits=out.contacts.filter(b=>b.triangleSupport).map(b=>triangleFootContact(b.triangleSupport,221.9,246.7,.5,4)).filter(Boolean);assert.ok(hits.length>0);assert.ok(hits.some(h=>h.height>1.7));assert.equal(c.kit.walkables.length,0,'Zero explicit walkables does not mean triangles lack support');
 }finally{c.f.traverse(o=>o.geometry?.dispose());c.kit.owned.forEach(m=>m.dispose());}
});
