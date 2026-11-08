import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yinghua-west-ear-hall',done=new WeakSet(),wallsDone=new WeakSet();
const HALL={kind:'hall',name:'英华殿',x:276.6,z:489.9,w:32.7,d:18.2,pad:1,ph:.9,colH:7.36,roof:'wudian',enter:true,structure:'ritual-hall',ritualProfile:'yinghua-five-bay-wudian-v1',bays:5};
const GATE={kind:'gate',name:'英华门',x:277.2,z:461.4,gateProfile:'yinghua',gateKind:'single-arched'};
const COURT={kind:'courtWalls',x0:252,x1:302,z0:454.9,z1:513.03,gates:[{side:'s',at:277.2,gate:'英华殿山门'}],source:'estimated'};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function host(kit){const r=kit?.root;if(!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k])||!Object.getOwnPropertyDescriptor(kit[k],'length')?.writable))throw Error('Exact mutable untransformed outer-west host required');}
function publish(kit,staged){kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);}
/** The original estimated wall bisects and hides the western third bay. A
 * local closed dogleg puts the complete ear hall inside the courtyard. The
 * three original other sides and west wall outside z473..490.5 stay fixed. */
export function buildYinghuaWestEarCourtWalls(kit,item,zoneId,gateWidth=11.4){
 if(zoneId!=='outer-west'||!item?.gates?.some(g=>g.gate==='英华殿山门'))return false;
 host(kit);if(!same(item,COURT)||gateWidth!==11.4||wallsDone.has(kit))throw Error('Exact original Yinghua courtyard wall, once only, required');
 const s=new CourtKit(kit.lib,'outer-west');s.ridge=kit.ridge;s.gold=kit.gold;
 try{
  s.wall(252,454.9,302,454.9,{gaps:[{at:277.2,w:gateWidth}]});
  s.wall(252,513.03,302,513.03);s.wall(252,454.9,252,513.03);
  s.wall(302,454.9,302,473);s.wall(302,490.5,302,513.03);
  const start=s.root.children.length,cs=s.colliders.length;
  s.wall(302,473,306.5,473);s.wall(306.5,473,306.5,490.5);s.wall(306.5,490.5,302,490.5);
  // New walls own their actual complete masonry/cap geometry. Do not copy the
  // historical generic wall's intentionally low 3m physics into a new fit.
  s.colliders.splice(cs);s.root.updateWorldMatrix(true,true);let owner=0;
  for(const f of s.root.children.slice(start))f.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index,vertices=[];
   for(let k=0;k<(ix?.count??p.count);k+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld)).map(v=>new T.Vector3(...v.toArray().map(Math.fround)));if(new T.Triangle(...v).getArea()>1e-12)vertices.push(...v.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],'yinghua-west-ear-wall/'+owner++),b=shape.box.clone();b.triangleSupport=shape;s.colliders.push(b);}finally{g.dispose();}
  });
  for(const f of s.root.children){f.userData.yinghuaWestEarCourtFit=true;}
 }catch(e){s.dispose(s.root);throw e;}
 publish(kit,s);wallsDone.add(kit);return true;
}
export function buildYinghuaWestEarHall(kit,zone){
 if(zone?.id!=='outer-west')return false;
 host(kit);if(!same(zone.items?.[41],GATE)||!same(zone.items?.[42],COURT)||!same(zone.items?.[43],HALL)||done.has(kit))throw Error('Exact original Yinghua tuples and host, once only, required');
 let existing=false;kit.root.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-BA2BB4F70D')existing=true;});if(existing)throw Error('Yinghua west ear host already installed');
 const s=new CourtKit(kit.lib,'outer-west'),privateMaterials=new Map();let f,meta;
 for(const m of s.owned)m.name='r163_yinghua_west_ear_'+m.name;
 const material=n=>{if(!privateMaterials.has(n)){const m=n==='painted_header_fit'||n==='plain_panel_fit'?new T.MeshStandardMaterial({color:n==='painted_header_fit'?0x3e443c:0x625747,roughness:.93}):kit.lib.material(n).clone();m.name='r163_yinghua_west_ear_'+n;s.owned.push(m);privateMaterials.set(n,m);}return privateMaterials.get(n);};
 try{
  f=s.frame(299.6,483.8,0);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z,stone=false)=>{const m0=material(mat),tile=mat==='painted_header_fit'||mat==='plain_panel_fit'?1:kit.lib.tileSize(mat),g=applyBoxUV(new T.BoxGeometry(w,h,d),tile),m=s.mesh(f,g,m0,x,y,z);m.name=ID+'/'+role;if(stone)m.userData.yinghuaWestEarStoneTop=true;return m;};
  // Real stone approaches only. The small plinth abuts the old main plinth
  // in plan but is not a new route into the main hall or an invented interior.
  box('platform-fit','wall_brick',11.3,.3,7.8,0,.15,-.3,true);
  box('front-step-fit','stone_slab',2.8,.1,.5,0,.05,-4.95,true);
  box('front-step-fit','stone_slab',2.8,.2,.5,0,.1,-4.45,true);
  const floor=.3,top=6.4;
  box('closed-rear-wall-fit','wall_red',10.2,top-floor,.3,0,(top+floor)/2,2.85);
  for(const x of [-4.95,4.95])box('closed-gable-wall-fit','wall_red',.3,top-floor,5.7,x,(top+floor)/2,0);
  box('front-header-fit','painted_header_fit',10.2,2.25,.3,0,5.275,-2.85);
  for(const x of [-5.1,-1.7,1.7,5.1])box('front-bay-post-fit','wood_column',.2,3.85,.32,x,2.225,-2.85);
  // Four closed middle leaves are source-positive. Their pose and simplified
  // double-cross diamond lattice are reversible fits, not a tracing of 8420.
  const lattice=(cx,cy,w,h,z)=>{
   for(const dx of [-w/2,w/2])box('lattice-border-fit','wood_column',.045,h,.045,cx+dx,cy,z);
   for(const dy of [-h/2,h/2])box('lattice-border-fit','wood_column',w,.045,.045,cx,cy+dy,z);
   const pitch=.3;for(let row=0;row<Math.floor(h/pitch);row++){const yy=cy-h/2+pitch*(row+.5),hw=Math.min(w*.42,.16),hh=pitch*.46;for(const sx of [-1,1])for(const sy of [-1,1]){const dx=sx*hw,dy=sy*hh,len=Math.hypot(dx,dy),m=box('double-cross-diamond-lattice-fit','wood_column',len,.026,.035,cx+dx/2,yy+dy/2,z);m.rotation.z=Math.atan2(dy,dx);}}
  };
  for(let i=0;i<4;i++){const x=(i-1.5)*.79;box('closed-middle-door-leaf-fit','wood_column',.77,3.75,.16,x,2.175,-2.87);box('middle-door-lower-panel-fit','wall_red',.65,1.05,.055,x,.925,-2.975);box('middle-door-upper-panel-fit','plain_panel_fit',.65,2.45,.055,x,2.825,-2.975);lattice(x,2.825,.65,2.45,-3.025);}
  for(const center of [-3.4,3.4]){
   box('window-sill-fit','wall_brick',3.2,.9,.3,center,.75,-2.85);
   for(let i=0;i<4;i++){const x=center+(i-1.5)*.79;box('sill-window-leaf-fit','plain_panel_fit',.76,2.75,.16,x,2.575,-2.87);lattice(x,2.575,.69,2.65,-2.98);}
  }
  // Resolve fallible library dependencies before the shared roof builder
  // allocates its own ridge/finial materials. Its factory has no error handle
  // for those early allocations, so this opt-in builder supplies cached inputs.
  for(const n of ['roof_tile','rafters','dougong_band','caihua_beam','wood_column','wall_red'])material(n);
  const tiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(n=>[n,kit.lib.tileSize(n)]));
  const aspects=new Map(['dougong_band','caihua_beam'].map(n=>[n,kit.lib.aspect(n)]));
  const roofLib={material:n=>privateMaterials.get(n),tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};
  const old=s.lib;s.lib=roofLib;try{const roof=s.roof(f,{type:'gable',hardGableEnd:true,width:10.2,depth:6,baseY:6.4,height:1.25,overhang:.65,brackets:false});roof.name=ID+'/yellow-hard-gable-roof-fit';}finally{s.lib=old;}
  f.updateWorldMatrix(true,true);let owner=0;
  f.traverse(m=>{if(!m.isMesh)return;
   if(m.userData.yinghuaWestEarStoneTop){const b=new T.Box3().setFromObject(m);b.yinghuaWestEarMesh=m.uuid;b.yinghuaWestEarStoneTop=m.name;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});return;}
   const p=m.geometry.attributes.position,ix=m.geometry.index,vertices=[];
   for(let k=0;k<(ix?.count??p.count);k+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld)).map(v=>new T.Vector3(...v.toArray().map(Math.fround)));if(new T.Triangle(...v).getArea()>1e-12)vertices.push(...v.flatMap(v=>v.toArray()));}
   if(!vertices.length)throw Error('Empty west ear owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+owner++),b=shape.box.clone();b.triangleSupport=shape;b.yinghuaWestEarMesh=m.uuid;s.colliders.push(b);}finally{g.dispose();}
  });
  const bounds=new T.Box3().setFromObject(f);if(!new T.Box3(new T.Vector3(293.9,-1e-6,478),new T.Vector3(305.5,8.04,489)).containsBox(bounds))throw Error('West ear escaped fitted reserve '+JSON.stringify({min:bounds.min.toArray(),max:bounds.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-BA2BB4F70D',name:'英华殿西耳殿',bays:3,width:10.2,depth:6,front:'SOUTH_NEGATIVE_Z',roof:'YELLOW_HARD_GABLE',wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,doorState:'CLOSED_EXTERIOR_FIT_NO_INTERIOR_ACCESS',source:'https://www.dpm.org.cn/explore/building/236568.html',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/dc/8420.jpg',measuredPaper:'https://img.dpm.org.cn/Uploads/File/pdf/88/89/92/888992eeedc46dea9c3432f8d88052fc.pdf',sourceSupported:['three-bay yellow hard-gable ear hall, four middle doors and four sill-window leaves in each side bay','ears and retained main hall in one east-west line; south-facing identification is topology/photo inference','lower roof partly hidden by trees in own gallery 8420'],fit:['all dimensions/coordinates/heights/colors, compact 10.2m width chosen against retained over-wide main hall','closed leaf pose, coarse double-cross lattice, low platform and two real approach steps','hidden rear/gables and roof detail; estimated west-wall interval z473..490.5 offset locally to x306.5 with two real closed return walls; all other original court walls retained'],unknown:['surveyed ear-hall size, exact roof profile/carvings, complete facade/back and platform stair count','present-day visitor access and GPU/mobile appearance'],excluded:['main hall changes','second gate or invented porch corridor','interior shrines/furniture, invented plaque/text','air barriers, ramps or rescue supports']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 publish(kit,s);done.add(kit);return{frame:f,meta};
}
