import fs from'node:fs';import{CourtKit}from'../../src/scene/palace/kit.js';import{library}from'../lib/inner-palace-fixture.mjs';
export const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
export const modulePath='../../src/scene/palace/special/FuyiThreeBay.js';
export async function api(){const assert=(await import('node:assert/strict')).default;assert.ok(fs.existsSync(new URL(modulePath,import.meta.url)),'K18 independent three-bay exterior absent');return import(modulePath);}
export function fixture(){const lib=library(),kit=new CourtKit(lib,'outer-west');return{lib,kit,dispose(){kit.dispose(kit.root)}}}
export function meshes(root){const out=[];root.traverse(m=>{if(m.isMesh)out.push(m)});return out}
export function state(k){return JSON.stringify({children:k.root.children.map(x=>x.uuid),c:k.colliders,w:k.walkables,owned:k.owned.map(x=>x.uuid),rooms:k.rooms,maps:k.mapItems,regions:k.regions,plaques:k.plaques})}
export async function compoundFixture(){const{compoundFixture:old}=await import('../r165-xuanshou-south-front/fixture.mjs'),{buildXuanshouSouthFront}=await import('../../src/scene/palace/special/XuanshouSouthFront.js'),f=await old();buildXuanshouSouthFront(f.kit,zone);return f}
