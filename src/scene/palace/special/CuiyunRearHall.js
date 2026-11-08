import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='cuiyun-rear-hall',done=new WeakSet();
export const CUIYUN_REAR_FIT=Object.freeze({x:118.9,z:507.5,width:18,depth:4,floor:.3,roofBase:4.5,northWallZ:511.2});
const COURT={kind:'courtWalls',x0:92.62,x1:145.18,z0:460,z1:505.6,gates:[{side:'s',at:120.2,gate:'重华门'}],source:'estimated'};
const HALL={kind:'hall',name:'重华宫',x:118.9,z:498.3,w:21.5,d:8.6,pad:1,ph:.75,colH:5.49,roof:'xieshan',enter:true,throne:true};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function geometry(g){return{index:g.index?Array.from(g.index.array):null,groups:g.groups,attributes:Object.fromEntries(Object.keys(g.attributes).sort().map(n=>[n,{size:g.attributes[n].itemSize,normalized:g.attributes[n].normalized,array:Array.from(g.attributes[n].array)}]))};}
function tree(o){return{position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),visible:o.visible,geometry:o.geometry?geometry(o.geometry):null,material:o.material?{name:o.material.name,color:o.material.color?.getHex(),map:o.material.map?.uuid??null,side:o.material.side,transparent:o.material.transparent,opacity:o.material.opacity}:null,children:o.children.map(tree)};}
function validate(kit,zone){
 const root=kit?.root;let duplicate=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-8A90E1618A')duplicate=true});
 if(!root||root.name!=='west-six'||root.parent||root.position.lengthSq()||!root.quaternion.equals(new T.Quaternion())||!root.scale.equals(new T.Vector3(1,1,1))||!root.matrix.equals(new T.Matrix4())||!root.matrixWorld.equals(new T.Matrix4())||!mutable(root.children)||!Object.isExtensible(kit)||['colliders','walkables','rooms','mapItems','regions','owned'].some(k=>!mutable(kit[k]))||!same(zone.items?.[53],COURT)||!same(zone.items?.[54],HALL)||done.has(kit)||duplicate)throw Error('Exact mutable H5 host required once');
 const matches=root.children.filter(o=>same(o.position.toArray(),[118.9,0,505.6])&&Math.abs(o.rotation.y)<1e-12);
 if(matches.length!==1)throw Error('Exact original north courtyard wall required');const old=matches[0],ref=new CourtKit(kit.lib,'west-six');ref.ridge=kit.ridge;ref.gold=kit.gold;
 try{ref.wall(92.62,505.6,145.18,505.6);if(!same(tree(old),tree(ref.root.children[0])))throw Error('Original north wall geometry/material/transform changed');const b=ref.colliders[0],cs=kit.colliders.filter(c=>c.isBox3&&!c.triangleSupport&&same(c.min.toArray(),b.min.toArray())&&same(c.max.toArray(),b.max.toArray()));if(cs.length!==1)throw Error('Original north wall collider changed');
  const gs=new Set();old.traverse(o=>{if(o.geometry)gs.add(o.geometry)});let shared=false;root.traverse(o=>{if(o.geometry&&gs.has(o.geometry)){let p=o;while(p&&p!==old)p=p.parent;if(p!==old)shared=true}});if(shared)throw Error('Original north wall geometry is shared outside its owner');return{old,collider:cs[0],geometries:gs};
 }finally{ref.dispose(ref.root);}
}
function registerTriangles(kit,m){
 const p=m.geometry.attributes.position,ix=m.geometry.index,origin=new T.Vector3().setFromMatrixPosition(m.matrixWorld),matrix=m.matrixWorld.clone();matrix.setPosition(0,0,0);const vertices=[];
 for(let k=0;k<(ix?.count??p.count);k+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(matrix));if(new T.Triangle(...v).getArea()>1e-12)vertices.push(...v.flatMap(v=>v.toArray()));}
 if(!vertices.length)throw Error('Empty H5 visible owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),origin.toArray(),m.name+'/'+m.uuid),c=shape.box.clone();c.triangleSupport=shape;c.cuiyunRearMesh=m.uuid;c.cuiyunRearRole=m.name;kit.colliders.push(c);}finally{g.dispose();}
}
/** The own plan and official text support five bays and the hard-gable form.
 * The shallow north-court fit is not a surveyed restoration or a new interior. */
export function buildCuiyunRearHall(kit,zone){
 if(zone?.id!=='west-six')return false;
 const prior=validate(kit,zone),s=new CourtKit(kit.lib,'west-six'),p=CUIYUN_REAR_FIT,allocated=new Set();let frame,meta;
 try{
  const mats=new Map(),material=n=>{if(!mats.has(n)){const m=kit.lib.material(n).clone();m.name='r175_cuiyun_'+n;mats.set(n,m);s.owned.push(m);}return mats.get(n);};
  frame=s.frame(p.x,p.z);frame.name=ID;
  const box=(role,n,w,h,d,x,y,z,stone=false)=>{let g=new T.BoxGeometry(w,h,d);allocated.add(g);const mat=material(n),next=applyBoxUV(g,kit.lib.tileSize(n));if(next!==g){allocated.delete(g);g=next;allocated.add(g);}const m=s.mesh(frame,g,mat,x,y,z);m.name=ID+'/'+role;if(stone)m.userData.cuiyunRearStone=true;return m;};
  box('real-low-platform-fit','stone_slab',18.6,.3,5.5,0,.15,-.15,true);
  box('real-lower-step-fit','stone_slab',3,.1,.45,0,.05,-3.575,true);
  box('real-upper-step-fit','stone_slab',3,.2,.45,0,.1,-3.125,true);
  box('closed-north-wall-fit','wall_red',18,4.2,.24,0,2.4,1.88);
  for(const x of[-8.88,8.88])box('no-projecting-pier-side-wall-fit','wall_red',.24,4.2,3.76,x,2.4,0);
  box('plain-front-header-fit','wood_column',18,.7,.24,0,4.15,-1.88);
  for(const x of[-9,-5.4,-1.8,1.8,5.4,9])box('five-bay-post-fit','wood_column',.16,3.5,.28,x,2.05,-1.88);
  for(const z of[-1.88,1.88])box('plain-eave-beam-fit','caihua_beam',18,.22,.3,0,4.39,z);
  // The source does not show a named facade pattern; restrained rectangular
  // divisions are disclosed fits, not borrowed carvings or fabricated plaques.
  for(let i=0;i<4;i++){const x=(i-1.5)*.85;box('closed-center-leaf-fit','wood_column',.83,3.48,.14,x,2.04,-1.89);for(const yy of[1.2,2.05,2.9])box('plain-door-cross-rail-fit','wood_column',.83,.035,.045,x,yy,-1.99);}
  for(const cx of[-7.2,-3.6,3.6,7.2]){box('window-masonry-sill-fit','wall_brick',3.4,.9,.24,cx,.75,-1.88);box('sill-window-group-fit','wood_column',3.4,2.6,.14,cx,2.5,-1.89);for(const dx of[-1.12,0,1.12])box('schematic-window-mullion-fit','wood_column',.045,2.55,.045,cx+dx,2.5,-1.99);for(const y of[1.65,2.5,3.35])box('schematic-window-cross-fit','wood_column',3.38,.045,.045,cx,y,-1.99);}
  for(const n of['roof_tile','rafters','dougong_band','caihua_beam','wood_column','wall_red'])material(n);
  const tiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(n=>[n,kit.lib.tileSize(n)])),aspects=new Map(['dougong_band','caihua_beam'].map(n=>[n,kit.lib.aspect(n)])),lib=s.lib;
  s.lib={material:n=>mats.get(n),tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};
  try{const roof=s.roof(frame,{type:'gable',hardGableEnd:true,width:18,depth:4,baseY:4.5,height:1.35,overhang:.4,brackets:false});roof.name=ID+'/yellow-hard-gable-roof-fit';}finally{s.lib=lib;}
  const wallStart=s.root.children.length,colliderStart=s.colliders.length;
  s.wall(92.62,p.northWallZ,145.18,p.northWallZ);s.wall(92.62,505.6,92.62,p.northWallZ);s.wall(145.18,505.6,145.18,p.northWallZ);s.colliders.length=colliderStart;
  for(const[i,f]of s.root.children.slice(wallStart).entries()){f.name=ID+'/north-wall-fit-'+i;f.userData.cuiyunRearCourtFit=true;let j=0;f.traverse(m=>{if(m.isMesh)m.name=f.name+'/'+j++;});}
  s.root.updateWorldMatrix(true,true);
  frame.traverse(m=>{if(!m.isMesh)return;if(m.userData.cuiyunRearStone){const b=new T.Box3().setFromObject(m);b.cuiyunRearMesh=m.uuid;b.cuiyunRearRole=m.name;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});}else registerTriangles(s,m);});
  for(const f of s.root.children.slice(wallStart))f.traverse(m=>{if(m.isMesh)registerTriangles(s,m)});
  const bounds=new T.Box3().setFromObject(frame);if(!new T.Box3(new T.Vector3(109.5,-1e-6,503.6),new T.Vector3(128.3,7,510.2)).containsBox(bounds))throw Error('Cuiyun escaped fitted reserve '+JSON.stringify(bounds));
  for(const f of s.root.children.slice(wallStart))if(new T.Box3().setFromObject(f).max.z>zone.bounds.z1)throw Error('North court escaped original west-six extent');
  meta={id:ID,sourceObjectId:'FC-8A90E1618A',name:'翠云馆',bays:5,depthBays:1,storeys:1,roof:'YELLOW_HARD_GABLE_NO_PROJECTING_PIER',front:'SOUTH_NEGATIVE_Z',ownFacadePhoto:null,surveyed:false,wholeObjectAccepted:false,restorationOfPreviouslyCountedItem:true,newRooms:0,newMapItems:0,source:'https://www.dpm.org.cn/explore/building/236506.html',planSource:'https://www.dpm.org.cn/Uploads/File/pdf/ed/2d/69/ed2d6957f0bfae487a7bbfd49bd8ef36.pdf',planFigure:'printed p141 fig13',topologySource:'https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf',topologyPages:[135,136],doorState:'CLOSED_EXTERIOR_MODEL_FIT_NO_INTERIOR_ACCESS',sourceSupported:['separate rear-court principal hall behind the retained middle Chonghua hall','five bays and one bay deep, yellow hard-gable roof, middle door and other sill windows','no projecting masonry pier; own plan shows a south central stair'],fit:['all coordinates, compressed18x4 footprint, equal bay widths, heights and hidden faces','plain window subdivisions/material finish and closed visiting pose, no exact facade photo','real .3m platform and two .1/.2m treads','only old north wall shifted from505.6 to511.2 with two closed side extensions; original zone bound512.1 retained'],unknown:['surveyed dimensions, named current facade photograph and detailed carving','exact interior layout/Changchun Study furnishings, public visitor admission','GPU/mobile rendering and complete historical state'],excluded:['renaming or moving the middle Chonghua hall','borrowed Chongjing porch, vats or nameboard; unverified two-storey exterior','complete side rooms/side halls/court reconstruction or automatic teleport']};frame.userData.structure=meta;
 }catch(e){const attached=new Set();s.root.traverse(o=>{if(o.geometry)attached.add(o.geometry)});s.dispose(s.root);for(const g of allocated)if(!attached.has(g))g.dispose();throw e;}
 const stagedChildren=[...s.root.children],oldChildren=[...kit.root.children],oldStreams=Object.fromEntries(['colliders','walkables','owned'].map(k=>[k,[...kit[k]]]));
 try{kit.root.remove(prior.old);kit.colliders.splice(kit.colliders.indexOf(prior.collider),1);kit.root.add(...[...s.root.children]);for(const k of['colliders','walkables','owned'])kit[k].push(...s[k]);}
 catch(e){kit.root.remove(...[...kit.root.children]);kit.root.add(...oldChildren);for(const[k,a]of Object.entries(oldStreams))kit[k].splice(0,kit[k].length,...a);s.root.add(...stagedChildren);s.dispose(s.root);throw e;}
 for(const g of prior.geometries)g.dispose();done.add(kit);return{frame,meta,replacedWall:prior.old,replacedCollider:prior.collider};
}
