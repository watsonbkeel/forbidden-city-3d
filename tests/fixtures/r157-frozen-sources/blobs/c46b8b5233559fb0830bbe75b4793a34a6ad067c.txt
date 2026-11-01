import {fitMiddleNorthVisibleHall} from './MiddleNorthVisibleHall.js';
import * as T from 'three';
const RECORDS={12:{name:'中左门',x:-77,id:'FC-DFB682AF14',group:25},14:{name:'中右门',x:80,id:'FC-85E0528ECA',group:19}};
const near=(a,b)=>Math.abs(a-b)<1e-8;
const tag=(m,role)=>{m.name=role;m.userData.role=role;return m;};
/** Independent own photographs establish south perforation / north solid panels.
 * Existing north enclosure depth, roof, columns and supports remain UNMEASURED.
 * This is not a generic style and does not certify complete gate interiors. */
export function applyMiddleAxisFacades(kit,f,{zoneId,itemIndex,item}){
 const r=RECORDS[itemIndex];if(zoneId!=='axis-courts'||!r)return false;
 if(item.name!==r.name||item.x!==r.x||item.z!==-12.2||item.style!=='hall'||item.rot!==undefined||item.gateProfile!==undefined)throw Error('Middle-axis identity changed');
 const walls=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('wall_red')&&near(Math.abs(m.position.x),4.4)&&near(m.position.y,3.55)&&near(m.position.z,0));
 const leaves=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('door_studded'));
 if(walls.length!==2||leaves.length!==2||walls.some(m=>{m.geometry.computeBoundingBox();const d=m.geometry.boundingBox.getSize(new T.Vector3());return Math.abs(d.x-3.6)>1e-6||Math.abs(d.y-6.2)>1e-6||Math.abs(d.z-.6)>1e-6;})||leaves.some(m=>!near(m.geometry.parameters.width,2.25)||!near(m.geometry.parameters.height,4.4)||m.geometry.index.count!==36))throw Error('Middle-axis retained geometry changed '+JSON.stringify({walls:walls.map(m=>m.geometry.parameters),leaves:leaves.map(m=>m.geometry.parameters)}));
 // Validate/fit the roof before touching facade-owned resources; roof failure is atomic.
 fitMiddleNorthVisibleHall(kit,f,{zoneId,itemIndex,item});
 const ochre=new T.MeshStandardMaterial({color:itemIndex===12?0x956f4d:0x987653,roughness:.95}),edge=new T.MeshStandardMaterial({color:0x42685f,roughness:.9});kit.owned.push(ochre,edge);
 const box=(parent,role,mat,w,h,d,x,y,z)=>tag(kit.mesh(parent,new T.BoxGeometry(w,h,d),typeof mat==='string'?kit.lib.material(mat):mat,x,y,z),role);
 for(const wall of walls){
  // Replace, rather than cover with a coplanar skin, the original north face.
  const g=wall.geometry,front=[],keep=[];if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));for(let i=0;i<g.index.count;i+=3){const ids=[0,1,2].map(j=>g.index.getX(i+j));(ids.every(j=>g.attributes.normal.getZ(j)===1)?front:keep).push(...ids);}
  if(front.length!==6)throw Error('Middle-axis north face changed');
  const skin=g.clone();skin.setIndex(front);skin.clearGroups();g.setIndex(keep);g.clearGroups();tag(kit.mesh(wall,skin,ochre,0,0,0),'middle-axis-north-ochre-panel');
  const x=wall.position.x;
  for(const dx of[-1,1])box(f,'middle-axis-north-border',edge,.055,5.2,.03,x+dx*1.74,4.05,.315);
  const window=tag(new T.Group(),'middle-axis-south-window');f.add(window);
  const transom=tag(new T.Group(),'middle-axis-south-transom');f.add(transom);
  // Three lower lights and three small upper lights, open through the plane.
  // Grid density/colors are display fit, not a measured grille census.
  box(window,'middle-axis-south-brick-foot','wall_brick',3.6,.8,.25,x,.85,-2.9);
  box(window,'middle-axis-south-low-panel','wall_red',3.6,.55,.18,x,1.525,-2.9);
  box(window,'middle-axis-south-mid-band','wall_red',3.6,.5,.18,x,4.65,-2.9);
  box(transom,'middle-axis-south-upper-band','wall_red',3.6,.5,.18,x,6.15,-2.9);
  const light=(group,cx,cy,w,h,diamond)=>{
   for(const dx of[-1,1])box(group,'middle-axis-window-frame','wood_column',.085,h+.12,.16,cx+dx*w/2,cy,-2.9);
   for(const dy of[-1,1])box(group,'middle-axis-window-frame','wood_column',w,.085,.16,cx,cy+dy*h/2,-2.9);
   if(!diamond){for(let u=-w/2+.14;u<w/2;u+=.14)box(group,'middle-axis-grid','wood_column',.025,h,.06,cx+u,cy,-2.9);for(let v=-h/2+.14;v<h/2;v+=.14)box(group,'middle-axis-grid','wood_column',w,.025,.06,cx,cy+v,-2.9);}
   else for(const slope of[-1,1])for(let b=-h/2-w/2+.16;b<h/2+w/2;b+=.20){const lo=Math.max(-w/2,slope===1?-h/2-b:b-h/2),hi=Math.min(w/2,slope===1?h/2-b:b+h/2);if(hi<=lo)continue;const m=box(group,'middle-axis-diamond-grid','wood_column',(hi-lo)*Math.SQRT2,.025,.06,cx+(lo+hi)/2,cy+slope*(lo+hi)/2+b,-2.9);m.rotation.z=slope*Math.PI/4;}
  };
  for(const [i,dx]of[-1.15,0,1.15].entries()){light(window,x+dx,3.1,.98,2.6,i!==1);light(transom,x+dx,5.4,.78,.75,true);}
  kit.col(f,x-1.8,.45,-3.025,x+1.8,6.4,-2.775);
 }
 for(const leaf of leaves){const g=leaf.geometry,front=[],keep=[];for(let i=0;i<g.index.count;i+=3){const ids=[0,1,2].map(j=>g.index.getX(i+j));(ids.every(j=>g.attributes.normal.getZ(j)===-1)?front:keep).push(...ids);}const skin=g.clone();skin.setIndex(front);skin.clearGroups();g.setIndex(keep);g.clearGroups();leaf.material=kit.lacquer;tag(leaf,'middle-axis-door-leaf');tag(kit.mesh(leaf,skin,kit.lib.material('door_studded'),0,0,0),'middle-axis-studded-face');leaf.position.y=.45;leaf.rotation.y=Math.sign(leaf.position.x)*Math.PI/2;
  // BoxGeometry is already translated to its foot; use actual transformed bounds.
  leaf.updateMatrix();g.computeBoundingBox();const b=g.boundingBox.clone().applyMatrix4(leaf.matrix);kit.col(f,b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z);
 }
 f.userData.structure={...f.userData.structure,id:`axis-courts/items/${itemIndex}`,objectId:r.id,sourceGroup:r.group,wholeObjectAccepted:false,scope:'OWN_SOUTH_PERFORATED_NORTH_SOLID_AND_OPEN_LEAVES',dimensionStatus:'INHERITED_UNMEASURED',retainedUnknown:['north-porch-depth','north-side-partitions','roof-interior','ramps-rails']};return true;
}
