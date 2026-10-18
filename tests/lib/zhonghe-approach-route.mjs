import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';

/** Derive test contacts from built stairs, rather than routing through the
 * carved central stone. The actual controller is never modified here. */
export function captureZhongheApproaches(side=1) {
 const mats=new Map(),lib={material:n=>mats.get(n)??(mats.set(n,new THREE.MeshStandardMaterial({name:n})),mats.get(n)),tileSize:()=>2};
 const b=new PalaceBuilder(new THREE.Scene(),lib),groups=[];
 b.buildHall=()=>{};b.terraceOrnaments=()=>{};b.finish=g=>{groups.push(g);g.userData.architecture??=[];return g;};
 b.buildComplex(PALACE_LAYOUT.filter(h=>['太和殿','中和殿','保和殿'].includes(h.name)),
  {name:'三台',apron:14,margin:4,bottom:{halfW:65,z0:-54,z1:178}});
 const stones=[];for(const g of groups)g.traverse(o=>{if(o.userData.imperialApproach)stones.push(o.userData.imperialApproach);});
 const result={};
 for(const p of stones){
  const r=b.walkables.find(r=>r.type==='ramp'&&r.axis==='z'&&Math.sign((r.minX+r.maxX)/2)===side&&r.a0===p.zEdge&&r.y0===p.y1);
  if(!r)throw Error('Zhonghe side stair missing');
  const x=(r.minX+r.maxX)/2,dir=p.dir;
  result[dir<0?'south':'north']={ramp:{...r},stone:{...p},points:[
   [0,r.a1+dir*3],[x,r.a1+dir*3],[x,r.a1],[x,r.a0],[x,r.a0-dir*.6],[0,r.a0-dir*.6],
  ]};
 }
 for(const g of groups)g.traverse(o=>o.geometry?.dispose());for(const m of mats.values())m.dispose();
 if(!result.south||!result.north)throw Error('Both Zhonghe approaches required');return result;
}
