import fs from'node:fs';import{ZoneBase}from'../../src/scene/zones/ZoneBase.js';import{library}from'../lib/inner-palace-fixture.mjs';import assert from'node:assert/strict';
const api=await import('../../src/scene/palace/special/YiheJingqiConnector.js').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return{};throw e});
export const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/ningshou.json',import.meta.url)));
export function fixture({build=true}={}){const b=new ZoneBase(library(),structuredClone(zone));for(const name of['颐和轩','景祺阁'])b.buildHall(zone.items.find(i=>i.name===name));const f={b,kit:b.kit,result:null,dispose(){b.kit.dispose(b.kit.root)}};if(build)f.result=apply(f);return f}
export function apply(f,z=zone){assert.equal(typeof api.buildYiheJingqiConnector,'function');return api.buildYiheJingqiConnector(f.kit,z)}
export const state=f=>JSON.stringify({children:f.kit.root.children.map(x=>({id:x.uuid,children:x.children.map(c=>c.uuid)})),c:f.kit.colliders.map(c=>({min:c.min,max:c.max,keys:Object.keys(c)})),w:f.kit.walkables,o:f.kit.owned.map(m=>m.uuid),rooms:f.kit.rooms,maps:f.kit.mapItems,regions:f.kit.regions});
export function meshes(root){const a=[];root.traverse(o=>{if(o.isMesh)a.push(o)});return a}
