import * as THREE from 'three';
import { PalaceBuilder } from '../../src/scene/PalaceBuilder.js';
import { PALACE_LAYOUT } from '../../src/scene/Layout.js';
/** Derive contacts from actual production terrace construction. No browser. */
export function captureTaihemenSouth(){
 const mats=new Map(),library={material:n=>mats.get(n)??(mats.set(n,new THREE.MeshStandardMaterial({name:n})),mats.get(n)),tileSize:()=>2};
 const b=new PalaceBuilder(new THREE.Scene(),library),groups=[];b.buildHall=()=>{};b.finish=g=>{groups.push(g);return g;};
 b.buildGate(PALACE_LAYOUT.find(h=>h.name==='太和门'));
 const p=structuredClone(groups[0].userData.taihemenSouth);
 for(const g of groups)g.traverse(o=>o.geometry?.dispose());for(const m of mats.values())m.dispose();
 return p;
}
export function taihemenSouthPoints(p,side=1){
 const f=p.flights.find(f=>Math.sign(f.centerX)===side);
 // The first turn must clear retained south facade columns, not pass through
 // them on the one-metre apron. This is an authored safe route, not a survey.
 return [[0,p.zToe-3],[f.centerX,p.zToe-3],[f.centerX,p.zToe],[f.centerX,p.zEdge],[f.centerX,p.zEdge+2.5],[0,p.zEdge+2.5]];
}
