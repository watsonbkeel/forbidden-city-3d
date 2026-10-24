import * as THREE from 'three';
import profile from '../../../../data/architecture/hongde-court.json' with {type:'json'};
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
export const HONGDE=freeze(profile);
/** Independent Hongde photo fit. No mirrored court wall or historic interior claim. */
export function buildHongdeCourt(k,zone){
 const p=HONGDE;if(zone.id!=='garden'||zone.hongdeProfile!==p.id)throw Error('Hongde requires garden opt-in');
 const f=k.frame(p.x,p.z);f.name='弘德殿';f.userData.structure={...p,id:'garden/hongde-exterior',streamLayer:'B'};
 const half=p.width/2,y=p.floorY,H=p.columnHeight,bay=p.width/3;
 const box=(name,w,h,d,x,cy,z,solid=false)=>{const m=k.box(f,name,w,h,d,x,cy,z);if(solid)k.col(f,x-w/2,cy-h/2,z-d/2,x+w/2,cy+h/2,z+d/2);return m;};
 const depth=p.rearZ-p.frontZ;
 box('stone_slab',p.width+.5,y,depth+.6,0,y/2,(p.frontZ+p.rearZ)/2);
 k.walkBox(f,-half-.25,p.frontZ-.3,half+.25,p.rearZ+.3,y);
 // Front porch and main door are independently parameterized from Hongde photograph.
 const mat=k.lib.material('wood_column');
 for(let i=0;i<=3;i++){const x=-half+i*bay;k.mesh(f,new THREE.CylinderGeometry(.23,.26,H,12),mat,x,y+H/2,p.frontZ).userData.role='hongde-porch-column';k.col(f,x-.26,y,p.frontZ-.26,x+.26,y+H,p.frontZ+.26);}
 for(const z of[p.frontZ,p.facadeZ])box('caihua_beam',p.width+.3,.45,.36,0,y+H-.225,z);
 for(const s of[-1,1]){
  box('caihua_beam',.36,.45,p.facadeZ-p.frontZ,s*half,y+H-.225,(p.frontZ+p.facadeZ)/2);
  const sideDepth=p.rearZ-p.facadeZ;box('wall_red',.4,H,sideDepth,s*half,y+H/2,(p.rearZ+p.facadeZ)/2,true);
  const x=s*bay;box('wall_brick',bay-.35,.8,.3,x,y+.4,p.facadeZ,true);
  box('lattice_doors',bay-.35,2.5,.18,x,y+2.05,p.facadeZ,true);
  box('caihua_beam',bay-.3,.22,.25,x,y+3.42,p.facadeZ);
  const w=(bay-p.doorWidth)/2;box('lattice_doors',w,3.35,.18,s*(p.doorWidth/2+w/2),y+1.675,p.facadeZ,true);
 }
 box('wall_red',p.width,H,.4,0,y+H/2,p.rearZ,true);
 box('wall_red',p.width,.65,.3,0,y+H-.325,p.facadeZ,true);
 for(const roof of p.roofs){const r=k.roof(f,{type:'xieshan',width:p.width+roof.overhang,depth:roof.depth,baseY:roof.baseY,height:roof.height,brackets:true},0,roof.z);r.userData.role='hongde-'+roof.role+'-roof';}
 // The historical door is shut in the photograph. Open tour door and identity label are adaptations.
 k.plaque(f,'弘德殿',0,y+3.8,p.facadeZ-.22,1.8,.5);k.plaques.at(-1).layout='horizontal';
 k._lastFurnish=null;k.registerRoom(f,{name:'弘德殿',kind:'interpretive-empty-shell',x0:-half+.3,x1:half-.3,z0:p.facadeZ,z1:p.rearZ-.3,y,h:H,doors:[{x:0,z:p.facadeZ}]});
 Object.assign(k.rooms.at(-1),{spawns:[],cover:[],inventoryStatus:'UNMODELLED',lightingStatus:'VIRTUAL_TOUR_NOT_HISTORICAL_LAMPS'});
 k.mapRect(f,'hall','弘德殿',p.width,depth);return f;
}
