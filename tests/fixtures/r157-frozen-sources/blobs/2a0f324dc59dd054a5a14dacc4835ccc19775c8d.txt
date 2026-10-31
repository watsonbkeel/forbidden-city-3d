import * as THREE from 'three';
import profile from '../../../../data/architecture/zhaoren-court.json' with {type:'json'};
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
export const ZHAOREN=freeze(profile);
/** Local exterior fit only. Existing Qianqing platform/rails remain untouched. */
export function buildZhaorenCourt(k,zone){
 const p=ZHAOREN;if(zone.id!=='garden'||zone.zhaorenProfile!==p.id)throw Error('Zhaoren requires garden opt-in');
 const f=k.frame(p.x,p.z);f.name='昭仁殿';f.userData.structure={...p,id:'garden/zhaoren-exterior',streamLayer:'B'};
 const half=p.width/2,y=p.floorY,H=p.columnHeight,bay=p.width/3;
 const box=(name,w,h,d,x,cy,z,solid=false)=>{const m=k.box(f,name,w,h,d,x,cy,z);if(solid)k.col(f,x-w/2,cy-h/2,z-d/2,x+w/2,cy+h/2,z+d/2);return m;};
 // Low single-stone support; never a second2m platform. Outer edge stays below x=-28.
 box('stone_slab',p.width+.6,y,14.6,0,y/2,0);k.walkBox(f,-half-.3,-7.3,half+.3,7.3,y);
 // Rear/side shells keep a simple return path via the central south door.
 for(const s of[-1,1])box('wall_red',.42,H,11,s*half,y+H/2,1.5,true);
 box('wall_red',p.width,H,.42,0,y+H/2,7,true);
 // Four front columns make exactly three porch bays.
 const mat=k.lib.material('wood_column');
 for(let i=0;i<=3;i++){const x=-half+i*bay;const m=k.mesh(f,new THREE.CylinderGeometry(.24,.27,H,12),mat,x,y+H/2,-7);m.userData.role='zhaoren-porch-column';k.col(f,x-.27,y,-7.27,x+.27,y+H,-6.73);}
 for(const z of[-7,-4])box('caihua_beam',p.width+.35,.48,.38,0,y+H-.24,z);
 for(const s of[-1,1])box('caihua_beam',.38,.48,3,s*half,y+H-.24,-5.5);
 // Two sill-window side bays, not floor-height generic lattice doors.
 for(const s of[-1,1]){const x=s*bay;box('wall_brick',bay-.35,.9,.3,x,y+.45,-4,true);box('lattice_doors',bay-.35,2.55,.16,x,y+.9+1.275,-4,true);box('caihua_beam',bay-.3,.25,.25,x,y+3.6,-4);}
 // Central doorway is gameplay-open; its width is a disclosed fit, not survey.
 const opening=2.8;for(const s of[-1,1]){const w=(bay-opening)/2;box('lattice_doors',w,3.4,.18,s*(opening/2+w/2),y+1.7,-4,true);}
 box('wall_red',p.width,.7,.3,0,y+H-.35,-4,true);
 // Distinct connected front, main and rear massing. Rear silhouette is provisional.
 for(const o of[{z:0,d:8.8,base:5.0,h:2.2,role:'main'},{z:-5.6,d:3.8,base:y+H,h:1.35,role:'porch'},{z:5.5,d:3.8,base:4.7,h:1.3,role:'rear'}]){
  const r=k.roof(f,{type:'xieshan',width:p.width+.8,depth:o.d,baseY:o.base,height:o.h,brackets:true},0,o.z);r.userData.role='zhaoren-'+o.role+'-roof';
 }
 // Only the short eastern segment visible in the oblique photo; no inferred closure.
 box('wall_red',.45,3.1,6,-9.4,1.55,-5,true);box('stone_slab',.65,.12,6.1,-9.4,3.16,-5);
 k.plaque(f,'昭仁殿',0,y+3.85,-4.22,1.8,.55);k.plaques.at(-1).layout='horizontal';
 // Gameplay lighting coverage only: no invented historical furnishings or NPC spawn.
 k._lastFurnish=null;
 k.registerRoom(f,{name:'昭仁殿',kind:'interpretive-empty-shell',x0:-half+.3,x1:half-.3,z0:-4,z1:6.7,y,h:H,doors:[{x:0,z:-4}]});
 Object.assign(k.rooms.at(-1),{spawns:[],cover:[],inventoryStatus:'UNMODELLED',lightingStatus:'VIRTUAL_TOUR_NOT_HISTORICAL_LAMPS'});
 k.mapRect(f,'hall','昭仁殿',p.width,14);
 return f;
}
