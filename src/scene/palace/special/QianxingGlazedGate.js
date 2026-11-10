import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='qianxing-glazed-gate-fit',SOURCE_ID='FC-E8CC6A03C1',ZONE='yuqing-south-entry';
const SOURCE='https://wwj.beijing.gov.cn/bjww/resource/cms/article/bjww_362762/744041239/2026061517055186218.pdf';
const installed=new WeakSet();
const arrays=['colliders','walkables','owned','rooms','mapItems','regions','plaques'];
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
export const QIANXING_GATE_FIT=Object.freeze({x:-134.5,z:193,rotation:0,bounds:Object.freeze([-138.2,0,191.6,-130.8,5.7,194.6])});
function validate(kit,zone){
 const r=kit?.root;let duplicate=false;r?.traverse(o=>{if(o.userData.structure?.sourceObjectId===SOURCE_ID)duplicate=true});
 if(installed.has(kit)||duplicate)throw Error('Qianxing identity must be installed once; duplicate refused');
 if(!r||r.name!==ZONE||r.parent||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(r)||!mutable(r.children)||!Object.isExtensible(kit)||arrays.some(k=>!mutable(kit[k]))||JSON.stringify(zone.bounds)!=='{"x0":-145,"x1":-130.25,"z0":184,"z1":205}'||zone.items?.length!==0)throw Error('Exact mutable untransformed Qianxing host and source bounds required');
}

/** Own limited facade and short south wall. Not the entire first courtyard.
 * The photograph is closed; open leaves are a separate game-tour fit.
 * All dimensions, hidden faces, simplified ornament and colours are MODEL_FIT. */
export function buildQianxingGlazedGate(kit,zone){
 if(zone?.id!==ZONE)return false;validate(kit,zone);
 const p=QIANXING_GATE_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
 const geometries=new Set(),materials=new Map(),contacts=[],walkables=[];let published=false;
 const own=g=>{geometries.add(g);return g};
 const palette={stone:0xc2b9a5,red:0x9e4035,door:0x852f29,green:0x386d50,yellow:0xccab50,gold:0xb59c59};
 const material=kind=>{if(!materials.has(kind)){const m=new T.MeshStandardMaterial({color:palette[kind],roughness:kind==='green'||kind==='yellow'?.55:.86});m.name=`qianxing_${kind==='yellow'?'roof_tile':kind==='green'?'glazework':kind}_model_fit`;materials.set(kind,m)}return materials.get(kind)};
 const mesh=(role,g,kind,x=0,y=0,z=0,parent=frame,walkable=false)=>{own(g);const m=new T.Mesh(g,material(kind));m.name=ID+'/'+role;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;m.userData={qianxingRole:role,qianxingWalkable:walkable};parent.add(m);return m};
 const box=(role,w,h,d,x,y,z,kind,parent=frame,walkable=false)=>mesh(role,new T.BoxGeometry(w,h,d),kind,x,y,z,parent,walkable);
 // Closed hipped roof, with its underside at the exact support plane. The
 // front roof terminates at the higher wall face instead of passing through it.
 const roof=(role,w,d,bottom,eave,rise,z)=>{
  const nx=16,nz=10,v=[];const pt=(i,j,low=false)=>{const x=-w/2+w*i/nx,q=-d/2+d*j/nz;return[x,low?bottom:eave+rise*Math.max(0,Math.min(1-Math.abs(q)/(d/2),(w/2-Math.abs(x))/(d/2))),q]};
  const quad=(a,b,c,d,n)=>{for(const tri of[[a,b,c],[a,c,d]]){const t=new T.Triangle(...tri.map(q=>new T.Vector3(...q)));if(t.getNormal(new T.Vector3()).dot(new T.Vector3(...n))<0)[tri[1],tri[2]]=[tri[2],tri[1]];v.push(...tri.flat())}};
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){quad(pt(i,j),pt(i+1,j),pt(i+1,j+1),pt(i,j+1),[0,1,0]);quad(pt(i,j,true),pt(i+1,j,true),pt(i+1,j+1,true),pt(i,j+1,true),[0,-1,0])}
  for(let i=0;i<nx;i++){quad(pt(i,0,true),pt(i+1,0,true),pt(i+1,0),pt(i,0),[0,0,-1]);quad(pt(i,nz,true),pt(i+1,nz,true),pt(i+1,nz),pt(i,nz),[0,0,1])}
  for(let j=0;j<nz;j++){quad(pt(0,j,true),pt(0,j+1,true),pt(0,j+1),pt(0,j),[-1,0,0]);quad(pt(nx,j,true),pt(nx,j+1,true),pt(nx,j+1),pt(nx,j),[1,0,0])}
  const g=own(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();return mesh(role,g,'yellow',0,0,z);
 };
 try{
  for(const side of[-1,1]){
   // Adjacent volumes meet; no full-height red sheet remains behind the hole.
   box('short-self-owned-wall',.78,5.5,.4,side*3.29,2.75,.4,'red');
   box('pier-stone-foot',1.7,.6,1.2,side*2.05,.3,0,'stone');
   box('red-pier-core',1.7,3.35,1,side*2.05,2.275,.1,'red');
   box('ornamental-panel',1.26,2.6,.06,side*2.05,2.15,-.43,'red');
   for(const dx of[-.76,.76])box('green-panel-edge',.12,3.2,.08,side*2.05+dx,2.2,-.44,'green');
   for(const y of[.66,3.74])box('green-panel-band',1.4,.12,.08,side*2.05,y,-.44,'green');
   const oval=mesh('simplified-panel-oval',new T.TorusGeometry(.37,.035,6,24),'gold',side*2.05,2.15,-.51);oval.scale.y=1.32;
   const centre=mesh('simplified-panel-centre',new T.CylinderGeometry(.28,.28,.025,24),'green',side*2.05,2.15,-.49);centre.rotation.x=Math.PI/2;centre.scale.z=1.32;
   // One hinge per leaf. Closed reference leaf extends toward the centre;
   // the game-open rotation places the solid leaf behind its own jamb.
   // The hinge lies on the back face, not inside the leaf thickness: opening
   // does not rotate half the leaf into the existing stone/pier volume.
   const hinge=new T.Group();hinge.name=ID+'/leaf-hinge';hinge.position.set(side*1.2,.12,.02);hinge.rotation.y=side*Math.PI/2;hinge.userData={qianxingHinge:true,pose:'GAME_OPEN_MODEL_FIT',side};frame.add(hinge);
   box('open-leaf',1.2,3.2,.14,-side*.6,1.6,-.07,'door',hinge);
   for(let row=0;row<6;row++)for(let col=0;col<4;col++)mesh('coarse-door-stud',new T.OctahedronGeometry(.025),'gold',-side*(.16+col*.28),.35+row*.5,-.165,hinge);
  }
  box('solid-door-transom',2.4,.63,1,0,3.635,.1,'green');
  box('upper-red-wall',5.8,1.55,.4,0,4.725,.4,'red');
  roof('yellow-main-roof',6.4,1.5,3.95,4.04,.55,-.55);
  roof('yellow-wall-cap',7.38,.6,5.5,5.54,.13,.4);
  box('threshold',2.4,.12,1.5,0,.06,0,'stone',frame,true);
  box('low-front-tread',2.4,.06,.65,0,.03,-1.075,'stone',frame,true);
  frame.updateWorldMatrix(true,true);
  const reserve=new T.Box3(new T.Vector3(-138.2,-1e-6,191.6),new T.Vector3(-130.8,5.7,194.6));
  const inverseFrame=frame.matrixWorld.clone().invert();
  frame.traverse(m=>{if(!m.isMesh)return;const b=new T.Box3().setFromObject(m);if(!reserve.containsBox(b))throw Error('Qianxing solid escaped finite fitted reserve: '+m.name+' '+JSON.stringify([b.min.toArray(),b.max.toArray()]));
   if(m.userData.qianxingWalkable){const c=b.clone();c.qianxingMesh=m.uuid;contacts.push(c);const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,qianxingMesh:m.uuid});return}
   const g=own(m.geometry.clone());g.applyMatrix4(inverseFrame.clone().multiply(m.matrixWorld));const shape=triangleInstance(createTriangleTemplate(g),[p.x,0,p.z],m.name+'/'+m.uuid);g.dispose();geometries.delete(g);const c=shape.box.clone();c.triangleSupport=shape;c.qianxingMesh=m.uuid;contacts.push(c);
  });
  const meta={id:ID,sourceObjectId:SOURCE_ID,name:'前星门',scope:'LIMITED_GATE_FRONT_OWN_SOUTH_WALL_AND_LOW_STONE',pose:'GAME_OPEN_MODEL_FIT',portalCount:1,leafCount:2,surveyed:false,compoundComplete:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newMapItems:0,newRooms:0,source:SOURCE,sourcePage:55,printedPage:50,publisher:'北京市文物局',dimensionStatus:'MODEL_FIT',fit:{x:p.x,z:p.z,bounds:[...p.bounds]},
   sourceSupported:['Captioned Qianxing front: yellow small roof, green glazed frame, side panels, paired red studded leaves and pale stone bases','Named plan: Qianxing south, first courtyard, Xiangxu north; separate source identities'],
   fitted:['All game coordinates, dimensions, hidden surfaces, colours and simplified ornament','Fixed inward-open ninety-degree leaves for game passage; photograph shows closed leaves','Own capped short wall only, not a reconstructed entire courtyard'],unknown:['Photograph date, measured dimensions, exact ornament and present-day opening'],excluded:['Published source pixels','Xiangxu and existing palace walls','Full first-courtyard enclosure and unverified travel targets']};
  frame.userData.structure=meta;
  const saved=Object.fromEntries(arrays.map(k=>[k,kit[k].length]));
  try{kit.root.add(frame);kit.colliders.push(...contacts);kit.walkables.push(...walkables);kit.owned.push(...materials.values());kit.region('前星门',-138.2,-130.8,191.6,194.6);installed.add(kit);published=true;return{frame,meta};}
  catch(error){if(frame.parent===kit.root){const i=kit.root.children.indexOf(frame);if(i>=0)kit.root.children.splice(i,1);frame.parent=null}for(const k of arrays)kit[k].length=saved[k];throw error;}
 }catch(error){if(!published){for(const g of geometries)g.dispose();for(const m of materials.values())m.dispose()}throw error;}
}
