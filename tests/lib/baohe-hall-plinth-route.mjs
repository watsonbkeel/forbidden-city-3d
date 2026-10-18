import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
export function captureBaoheHallPlinth(){
 const mats=new Map(),lib={material:n=>mats.get(n)??(mats.set(n,new THREE.MeshStandardMaterial({name:n})),mats.get(n)),tileSize:()=>2};
 const b=new PalaceBuilder(new THREE.Scene(),lib),groups=[];b.buildHall=()=>{};b.terraceOrnaments=()=>{};b.finish=g=>{groups.push(g);g.userData.architecture??=[];return g;};
 b.buildComplex(PALACE_LAYOUT.filter(h=>['太和殿','中和殿','保和殿'].includes(h.name)),{name:'三台',apron:14,margin:4,bottom:{halfW:65,z0:-54,z1:178}});
 const p=structuredClone(b.baoheHallPlinth);for(const g of groups)g.traverse(o=>o.geometry?.dispose());for(const m of mats.values())m.dispose();return p;
}
/** Leave through the real door, descend beside the stone, rejoin the same axis. */
export function baoheHallNorthDescent(p,side=1){const f=p.flights.find(f=>f.kind==='inner'&&f.side===side),x=(f.minX+f.maxX)/2;
 return [[x,p.zEdge-3.5],[x,p.zEdge],[x,p.zToe],[x,p.zToe+1.4],[0,p.zToe+1.4]];
}
