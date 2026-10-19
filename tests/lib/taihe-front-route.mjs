import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';

export function captureTaiheFrontTiers() {
  const mats=new Map();
  const lib={material:n=>mats.get(n)??(mats.set(n,new THREE.MeshStandardMaterial({name:n})),mats.get(n)),tileSize:()=>2};
  const b=new PalaceBuilder(new THREE.Scene(),lib);b.buildHall=()=>{};b.terraceOrnaments=()=>{};
  const groups=[];b.finish=g=>{groups.push(g);g.userData.architecture??=[];return g;};
  b.buildComplex(PALACE_LAYOUT.filter(h=>['太和殿','中和殿','保和殿'].includes(h.name)),
    {name:'三台',apron:14,margin:4,bottom:{halfW:65,z0:-54,z1:178}});
  const tiers=structuredClone(b.taiheSouthTiers);
  for(const g of groups)g.traverse(o=>o.geometry?.dispose());for(const m of mats.values())m.dispose();
  return tiers;
}

/** Contacts come from the actual builder; no changing column positions or
 * skipping the ornament row. Turn to the central small stair on the moon platform. */
export function taiheFrontPoints(tiers,side=1,endZ=-10) {
  const outer=tiers.filter(t=>!t.plinth),plinth=tiers.find(t=>t.plinth);
  const flights=outer.map(t=>t.flights.find(f=>Math.sign(f.centerX)===side));
  const p=plinth.flights.find(f=>f.centerX===0),x=flights[0].centerX;
  return [[x,flights[0].zToe-4],...flights.flatMap(f=>[[x,f.zToe],[x,f.zEdge]]),
    [x,flights.at(-1).zEdge+1.2],[x,p.zToe-2.9],[0,p.zToe-2.9],
    [0,p.zToe],[0,p.zEdge],[0,endZ]];
}
