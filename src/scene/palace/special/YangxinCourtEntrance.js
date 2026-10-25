import * as THREE from 'three';
import profile from '../../../../data/architecture/yangxin-court-entrance.json' with {type:'json'};
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
export const YANGXIN_ENTRANCE=freeze(profile);

/** Independently evidenced glazed gate. Unknown remote wall joins are not built. */
export function buildYangxinCourtEntrance(kit,zone){
 const p=YANGXIN_ENTRANCE;
 if(zone.id!=='west-six'||zone.yangxinEntranceProfile!==p.id)throw Error('Yangxin entrance requires explicit west-six identity/profile');
 const f=kit.frame(p.x,p.z);f.name='养心门';f.userData={role:'r73-yangxin-glazed-entrance',profile:p,streamLayer:'B',structure:{...p,id:'west-six/yangxin-entrance',streamLayer:'B'}};
 const mat=(name,color,roughness)=>{const m=new THREE.MeshStandardMaterial({name:'r73-yangxin-'+name,color,roughness});kit.owned.push(m);return m;};
 const red=mat('red-field',0x872d2b,.72),green=mat('green-glaze',0x286e62,.35),gold=mat('ochre-glaze',0xc8a342,.35),stone=mat('stone',0xc2b9a4,.9),wood=mat('wood',0x542f21,.65);
 const box=(role,m,x0,x1,y0,y1,z0,z1,solid=true)=>{
  const mesh=kit.mesh(f,new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),m,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
  mesh.name=role;mesh.userData={role,dimensionStatus:p.dimensionStatus};
  if(solid){kit.col(f,x0,y0,z0,x1,y1,z1);kit.walkBox(f,x0,z0,x1,z1,y1);Object.assign(kit.walkables.at(-1),{rescue:false,sourceRole:role});}return mesh;
 };
 const half=p.centralWidth/2,outer=p.totalWidth/2,portal=p.opening.width/2,hd=p.depth/2;
 for(const s of[-1,1]){
  const a=s<0?-half:portal,b=s<0?-portal:half;
  box('r73-glazed-pier',red,a,b,p.floor,p.bodyTop,-hd,hd);
  box('r73-stone-plinth',stone,a-.07,b+.07,0,.42,-hd-.08,hd+.08);
  const c=s<0?-outer:half,d=s<0?-half:outer;
  box('r73-side-screen',red,c,d,0,p.sideTop,-hd,hd);
  box('r73-side-screen-base',stone,c,d,0,.36,-hd-.08,hd+.08);
  for(const x of[a,b-.14])box('r73-gold-glazed-edge',gold,x,x+.14,.42,p.bodyTop,-hd-.045,-hd,false);
  for(const y of[p.sideTop-.4,p.sideTop-.12])box('r73-side-glaze-band',green,c,d,y,y+.12,-hd-.045,-hd,false);
  const roof=kit.roof(f,{type:'xieshan',width:d-c+.4,depth:1.65,baseY:p.sideTop,height:.65,brackets:false});roof.position.x=(c+d)/2;roof.userData.role='r73-side-roof';
 }
 box('r73-portal-head',red,-portal,portal,p.opening.height,p.bodyTop,-hd,hd);
 for(const y of[p.bodyTop-.8,p.bodyTop-.4])box('r73-central-glaze-band',green,-half,half,y,y+.22,-hd-.07,-hd,false);
 const roof=kit.roof(f,{type:'xieshan',width:p.centralWidth+.6,depth:1.9,baseY:p.bodyTop,height:p.roofHeight,brackets:false});roof.userData.role='r73-central-roof';
 box('r73-low-threshold',stone,-portal,portal,0,p.floor,-hd-.2,hd+.2);
 const w=p.woodScreen,wh=w.width/2,wo=w.openingWidth/2,z=w.offsetZ;
 for(const s of[-1,1])box('r73-wood-screen',wood,s<0?-wh:wo,s<0?-wo:wh,0,w.height,z-w.depth/2,z+w.depth/2);
 box('r73-wood-screen-head',wood,-wo,wo,w.openingHeight,w.height,z-w.depth/2,z+w.depth/2);
 // Keep the readable modern identity entirely above the portal and on the front face.
 kit.plaque(f,'养心门',0,p.plaque.centreY,-hd-.16,p.plaque.width,p.plaque.height);
 kit.mapRect(f,'gate','养心门',p.totalWidth,p.depth);
 return f;
}
