import fs from'node:fs';import * as THREE from'three';import{CourtKit}from'../../src/scene/palace/kit.js';import{library}from'./inner-palace-fixture.mjs';import{resolveRemainingProfile,buildRemainingHall}from'../../src/scene/palace/special/RemainingNingshouHalls.js';
export function makeXishang(){const rows=JSON.parse(fs.readFileSync(new URL('../../reports/r83-xishang-channel/baseline-scope.json',import.meta.url))),item=structuredClone(rows.find(r=>r.name==='禊赏亭').baselineItem),p=resolveRemainingProfile('ningshou',item),kit=new CourtKit(library(),'ningshou'),built=buildRemainingHall(kit,item,p);built.f.updateMatrixWorld(true);return{kit,p,...built};}
export function roleNodes(f,role){const out=[];f.traverse(m=>{if(m.userData.role===role)out.push(m);});return out;}
export {THREE};
