import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='yinghua-east-ear-hall',done=new WeakSet();
export const YINGHUA_EAST_EAR_FIT=Object.freeze({x:254.7,z:483.8,width:8.4,depth:6,floor:.3,roofBase:6.2,wallX:249.825,wallStart:473,wallEnd:490.5});
const COURT={kind:'courtWalls',x0:252,x1:302,z0:454.9,z1:513.03,gates:[{side:'s',at:277.2,gate:'英华殿山门'}],source:'estimated'};
const HALL={kind:'hall',name:'英华殿',x:276.6,z:489.9,w:32.7,d:18.2,pad:1,ph:.9,colH:7.36,roof:'wudian',enter:true,structure:'ritual-hall',ritualProfile:'yinghua-five-bay-wudian-v1',bays:5};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function geometry(g){return{index:g.index?Array.from(g.index.array):null,groups:g.groups,attributes:Object.fromEntries(Object.keys(g.attributes).sort().map(n=>[n,{size:g.attributes[n].itemSize,normalized:g.attributes[n].normalized,array:Array.from(g.attributes[n].array)}]))};}
function tree(o){return{position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),visible:o.visible,geometry:o.geometry?geometry(o.geometry):null,material:o.material?{name:o.material.name,color:o.material.color?.getHex(),map:o.material.map?.uuid??null,side:o.material.side,transparent:o.material.transparent,opacity:o.material.opacity}:null,children:o.children.map(tree)};}
function validate(kit,zone){
 const root=kit?.root;let duplicate=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-634F1BA680')duplicate=true});
 if(!root||root.name!=='outer-west'||root.parent||root.position.lengthSq()||!root.quaternion.equals(new T.Quaternion())||!root.scale.equals(new T.Vector3(1,1,1))||!root.matrix.equals(new T.Matrix4())||!root.matrixWorld.equals(new T.Matrix4())||!mutable(root.children)||!Object.isExtensible(kit)||['colliders','walkables','rooms','mapItems','regions','owned'].some(k=>!mutable(kit[k]))||!same(zone.items?.[42],COURT)||!same(zone.items?.[43],HALL)||done.has(kit)||duplicate)throw Error('Exact mutable H42 host required once');
 const matches=root.children.filter(o=>o.userData.yinghuaWestEarCourtFit&&same(o.position.toArray(),[252,0,(454.9+513.03)/2])&&Math.abs(o.rotation.y-Math.PI/2)<1e-12);
 if(matches.length!==1)throw Error('Exact original east courtyard wall required');const old=matches[0],ref=new CourtKit(kit.lib,'outer-west');ref.ridge=kit.ridge;ref.gold=kit.gold;
 try{ref.wall(252,454.9,252,513.03);if(!same(tree(old),tree(ref.root.children[0])))throw Error('Original east wall geometry/material/transform changed');const b=ref.colliders[0],cs=kit.colliders.filter(c=>c.isBox3&&!c.triangleSupport&&same(c.min.toArray(),b.min.toArray())&&same(c.max.toArray(),b.max.toArray()));if(cs.length!==1)throw Error('Original east wall collider changed');
  const gs=new Set();old.traverse(o=>{if(o.geometry)gs.add(o.geometry)});let shared=false;root.traverse(o=>{if(o.geometry&&gs.has(o.geometry)){let p=o;while(p&&p!==old)p=p.parent;if(p!==old)shared=true}});if(shared)throw Error('Original east wall geometry is shared outside its owner');return{old,collider:cs[0],geometries:gs};
 }finally{ref.dispose(ref.root);}
}
function registerTriangles(kit,m){
 const p=m.geometry.attributes.position,ix=m.geometry.index,origin=new T.Vector3().setFromMatrixPosition(m.matrixWorld),matrix=m.matrixWorld.clone();matrix.setPosition(0,0,0);const vertices=[];
 for(let k=0;k<(ix?.count??p.count);k+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(matrix));if(new T.Triangle(...v).getArea()>1e-12)vertices.push(...v.flatMap(v=>v.toArray()));}
 if(!vertices.length)throw Error('Empty H42 visible owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),origin.toArray(),m.name+'/'+m.uuid),c=shape.box.clone();c.triangleSupport=shape;c.yinghuaEastEarMesh=m.uuid;c.yinghuaEastEarRole=m.name;kit.colliders.push(c);}finally{g.dispose();}
}
/** Official text supplies the common three-bay form. No west-ear photo detail,
 * invented interior or automatic teleport is substituted for this named ear. */
export function buildYinghuaEastEarHall(kit,zone){
 if(zone?.id!=='outer-west')return false;
 const prior=validate(kit,zone),s=new CourtKit(kit.lib,'outer-west'),p=YINGHUA_EAST_EAR_FIT,allocated=new Set();let frame,meta;
 try{
  const mats=new Map(),material=n=>{if(!mats.has(n)){const m=kit.lib.material(n).clone();m.name='r174_east_ear_'+n;mats.set(n,m);s.owned.push(m);}return mats.get(n);};
  frame=s.frame(p.x,p.z,0);frame.name=ID;
  const box=(role,n,w,h,d,x,y,z,stone=false)=>{let g=new T.BoxGeometry(w,h,d);allocated.add(g);const mat=material(n),next=applyBoxUV(g,kit.lib.tileSize(n));if(next!==g){allocated.delete(g);g=next;allocated.add(g);}const m=s.mesh(frame,g,mat,x,y,z);m.name=ID+'/'+role;if(stone)m.userData.yinghuaEastEarStone=true;return m;};
  box('low-platform-fit','wall_brick',8.8,.3,7.8,0,.15,-.3,true);
  box('south-step-low-fit','stone_slab',2.4,.1,.5,0,.05,-4.95,true);
  box('south-step-upper-fit','stone_slab',2.4,.2,.5,0,.1,-4.45,true);
  box('closed-north-wall-fit','wall_red',8.4,5.9,.24,0,3.25,2.88);
  for(const x of[-4.08,4.08])box('closed-gable-wall-fit','wall_red',.24,5.9,5.76,x,3.25,0);
  box('plain-front-header-fit','wood_column',8.4,2,.24,0,5.2,-2.88);
  for(const x of[-4.2,-1.4,1.4,4.2])box('three-bay-post-fit','wood_column',.18,3.9,.3,x,2.25,-2.88);
  // Plain continuous panels with a sparse double-cross diamond indication.
  // Exact carving/color and the closed visitor pose remain modelling fits.
  const lattice=(x,y,w,h)=>{for(const dx of[-w/2,w/2])box('plain-lattice-border-fit','wood_column',.035,h,.035,x+dx,y,-3.005);for(const dy of[-h/2,h/2])box('plain-lattice-border-fit','wood_column',w,.035,.035,x,y+dy,-3.005);
   for(const yy of[y-h*.28,y,y+h*.28])for(const sign of[-1,1]){const a=box('double-cross-lattice-fit','wood_column',Math.hypot(w*.8,h*.22),.023,.035,x,yy,-3.005);a.rotation.z=sign*Math.atan2(h*.22,w*.8);}};
  for(let i=0;i<4;i++){const x=(i-1.5)*.64;box('closed-middle-leaf-fit','wood_column',.62,3.8,.14,x,2.2,-2.89);lattice(x,2.8,.52,2.3);}
  for(const cx of[-2.8,2.8]){box('window-sill-fit','wall_brick',2.6,1,.24,cx,.8,-2.88);for(let i=0;i<4;i++){const x=cx+(i-1.5)*.64;box('sill-window-leaf-fit','wood_column',.62,2.8,.14,x,2.7,-2.89);lattice(x,2.7,.52,2.6);}}
  for(const n of['roof_tile','rafters','dougong_band','caihua_beam','wood_column','wall_red'])material(n);
  const tiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(n=>[n,kit.lib.tileSize(n)])),aspects=new Map(['dougong_band','caihua_beam'].map(n=>[n,kit.lib.aspect(n)])),lib=s.lib;
  s.lib={material:n=>mats.get(n),tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};
  try{const roof=s.roof(frame,{type:'gable',hardGableEnd:true,width:8.4,depth:6,baseY:6.2,height:1.15,overhang:.5,brackets:false});roof.name=ID+'/yellow-hard-gable-roof-fit';}finally{s.lib=lib;}
  // Only the original east wall is replaced. End segments retain the existing
  // low generic physics; the three new dogleg pieces own full visible meshes.
  const start=s.root.children.length;
  s.wall(252,454.9,252,473);s.wall(252,490.5,252,513.03);
  const middle=s.root.children.length,colliderStart=s.colliders.length;
  s.wall(252,473,p.wallX,473,{t:.4});s.wall(p.wallX,473,p.wallX,490.5,{t:.4});s.wall(p.wallX,490.5,252,490.5,{t:.4});s.colliders.length=colliderStart;
  for(const [i,f]of s.root.children.slice(start).entries()){f.name=ID+'/east-wall-piece-'+i;f.userData.yinghuaEastEarCourtFit=true;let j=0;f.traverse(m=>{if(m.isMesh)m.name=f.name+'/'+j++;});}
  s.root.updateWorldMatrix(true,true);
  frame.traverse(m=>{if(!m.isMesh)return;if(m.userData.yinghuaEastEarStone){const b=new T.Box3().setFromObject(m);b.yinghuaEastEarMesh=m.uuid;b.yinghuaEastEarRole=m.name;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});}else registerTriangles(s,m);});
  for(const f of s.root.children.slice(middle))f.traverse(m=>{if(m.isMesh)registerTriangles(s,m)});
  const bounds=new T.Box3().setFromObject(frame);if(!new T.Box3(new T.Vector3(250.2,-1e-6,478),new T.Vector3(259.15,8.1,489)).containsBox(bounds))throw Error('East ear escaped fitted reserve '+JSON.stringify(bounds));
  for(const f of s.root.children.slice(middle))if(new T.Box3().setFromObject(f).min.x<249.25)throw Error('East wall escaped protected outside route margin');
  meta={id:ID,sourceObjectId:'FC-634F1BA680',name:'英华殿东耳殿',bays:3,width:8.4,depth:6,front:'SOUTH_NEGATIVE_Z',roof:'YELLOW_HARD_GABLE',ownFacadePhoto:null,wholeObjectAccepted:false,surveyed:false,restorationOfPreviouslyCountedItem:true,newRooms:0,newMapItems:0,source:'https://www.dpm.org.cn/explore/building/236568.html',planSource:'https://www.cactch.org.cn/webfile/upload/2021/02-04/22-02-570611-194311783.pdf',planFigure:'printed p236 fig11',doorState:'CLOSED_EXTERIOR_FIT_NO_INTERIOR_ACCESS',sourceSupported:['separately named eastern ear in the plan','official common ear-hall form: three bays, yellow hard-gable roof, four middle door leaves and four sill-window leaves per side bay, double-cross lattice'],fit:['all dimensions, positions, colors, hidden faces and simplified lattice','closed visiting pose, shallow platform and two real steps','east courtyard wall only z473..490.5 moved locally to x249.825 with two closed returns'],unknown:['own current facade photograph and surveyed dimensions','exact carving, furnishings, historical or current visitor entry','GPU and mobile rendering'],excluded:['copied west-ear facade details or identity','invented plaque, shrine or interior room','new teleport, invisible barriers or rescue supports']};frame.userData.structure=meta;
 }catch(e){const attached=new Set();s.root.traverse(o=>{if(o.geometry)attached.add(o.geometry)});s.dispose(s.root);for(const g of allocated)if(!attached.has(g))g.dispose();throw e;}
 const stagedChildren=[...s.root.children],oldChildren=[...kit.root.children],oldStreams=Object.fromEntries(['colliders','walkables','owned'].map(k=>[k,[...kit[k]]]));
 try{kit.root.remove(prior.old);kit.colliders.splice(kit.colliders.indexOf(prior.collider),1);kit.root.add(...[...s.root.children]);for(const k of['colliders','walkables','owned'])kit[k].push(...s[k]);}
 catch(e){kit.root.remove(...[...kit.root.children]);kit.root.add(...oldChildren);for(const[k,a]of Object.entries(oldStreams))kit[k].splice(0,kit[k].length,...a);s.root.add(...stagedChildren);s.dispose(s.root);throw e;}
 for(const g of prior.geometries)g.dispose();done.add(kit);return{frame,meta,replacedWall:prior.old,replacedCollider:prior.collider};
}
