import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yude-west-hall',done=new WeakSet();
const GATE={kind:'gate',name:'重华门',x:120.2,z:460};
const HALL={kind:'hall',name:'重华宫',x:118.9,z:498.3,w:21.5,d:8.6,pad:1,ph:.75,colH:5.49,roof:'xieshan',enter:true,throne:true};
const COURT={kind:'courtWalls',x0:92.62,x1:145.18,z0:460,z1:505.6,gates:[{side:'s',at:120.2,gate:'重华门'}],source:'estimated'};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone){const r=kit?.root;let exists=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-EDE61DA470')exists=true;});if(!r||r.name!=='west-six'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(kit)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||(kit.ownedTextures&&!mutable(kit.ownedTextures))||zone.items?.filter(i=>same(i,GATE)).length!==1||zone.items?.filter(i=>same(i,HALL)).length!==1||zone.items?.filter(i=>same(i,COURT)).length!==1||exists||done.has(kit))throw Error('Exact mutable untransformed Yude west-side host required, once only');}
/** Text/plan and explicitly marked peer-style fit only. No named front photo
 * is verified; this is not Wuying Yude Bath or a Ningshou Yizhai interior. */
export function buildYudeWestHall(kit,zone){
 if(zone?.id!=='west-six')return false;validateHost(kit,zone);
 const s=new CourtKit(kit.lib,'west-six'),cache=new Map();let f,meta;
 const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_yude_west_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);s.owned.push(m);}return cache.get(key);};
 try{
  for(const n of['stone_slab','wall_brick','wood_column','wall_red','caihua_beam','roof_tile','rafters','dougong_band'])material(n);
  f=s.frame(139.5,496.5,Math.PI/2);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=s.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color,stone=false)=>{const q=mesh(role,applyBoxUV(new T.BoxGeometry(w,h,d),kit.lib.tileSize(name)),material(name,color),x,y,z);if(stone)q.userData.yudeWestStoneTop=role;return q;};
  const red=0x984a3c,wood=0x843e30,green=0x375547,paper=0x7a8174;
  box('real-low-stone-platform-fit','stone_slab',11.2,.45,7,0,.225,-.2,undefined,true);
  for(let i=1;i<=2;i++)box('real-small-central-step-fit','stone_slab',2.8,.15*i,.7,0,.075*i,-5.45+.7*i,undefined,true);
  box('closed-unseen-rear-fit','wall_red',10.2,4.25,.28,0,2.575,2.26,red);
  // Masonry ends at the eave-column centreline, not a projected front pier.
  for(const x of[-4.96,4.96])box('no-pier-lower-gable-wall-fit','wall_red',.28,4.25,4.8,x,2.575,0,red);
  box('closed-upper-front-header-fit','wall_red',10.2,.85,.26,0,4.275,-2.4,red);
  for(const x of[-5.1,-1.7,1.7,5.1]){mesh('plain-front-eave-column-fit',new T.CylinderGeometry(.14,.18,4,12),material('wood_column',wood),x,2.45,-2.4);box('front-bay-jamb-fit','wood_column',.14,3.4,.26,x,2.15,-2.4,wood);}
  box('painted-front-eave-beam-fit','caihua_beam',10.3,.25,.3,0,4.575,-2.4);
  box('plain-painted-door-lintel-fit','caihua_beam',10.15,.26,.16,0,3.98,-2.53);
  box('closed-middle-partition-door-fit','wood_column',3.14,3.4,.16,0,2.15,-2.42,wood);
  for(const x of[-.78,.78]){box('middle-upper-paper-panel-fit','wood_column',1.42,2.02,.035,x,2.77,-2.525,paper);box('middle-lower-wood-panel-fit','wood_column',1.42,1.1,.035,x,1.05,-2.525,wood);for(const dx of[-.74,.74])box('middle-leaf-border-fit','wood_column',.045,3.35,.045,x+dx,2.15,-2.57,green);for(const y of[.48,1.64,3.82])box('middle-leaf-cross-fit','wood_column',1.5,.045,.045,x,y,-2.57,green);for(const dx of[-.38,0,.38])box('coarse-rectangular-lattice-fit','wood_column',.026,1.96,.035,x+dx,2.77,-2.57,green);for(const y of[2.25,2.77,3.29])box('coarse-rectangular-lattice-fit','wood_column',1.42,.026,.035,x,y,-2.57,green);}
  for(const c of[-3.4,3.4]){
   box('window-masonry-sill-fit','wall_brick',3.16,.75,.28,c,.825,-2.4);
   box('side-sill-window-group-fit','wood_column',3.1,2.65,.16,c,2.525,-2.42,green);
   for(const dx of[-.99,0,.99]){const x=c+dx;box('plain-sill-window-field-fit','wood_column',.9,2.48,.035,x,2.525,-2.525,paper);for(const q of[-.45,0,.45])box('coarse-rectangular-lattice-fit','wood_column',.032,2.48,.035,x+q,2.525,-2.57,green);for(const y of[1.3,1.92,2.54,3.16,3.75])box('coarse-rectangular-lattice-fit','wood_column',.94,.032,.035,x,y,-2.57,green);}
   for(const dx of[-1.58,1.58])box('plain-window-group-frame-fit','wood_column',.08,2.73,.06,c+dx,2.525,-2.57,wood);for(const y of[1.16,3.89])box('plain-window-group-frame-fit','wood_column',3.24,.08,.06,c,y,-2.57,wood);
  }
  const tiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(n=>[n,kit.lib.tileSize(n)])),aspects=new Map(['dougong_band','caihua_beam'].map(n=>[n,kit.lib.aspect(n)])),old=s.lib;
  s.lib={material:n=>cache.get(n+':'),tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};let roof;
  try{roof=s.roof(f,{type:'gable',hardGableEnd:true,width:10.2,depth:4.8,baseY:4.7,height:1.5,overhang:.55,brackets:false,detail:'low'});}finally{s.lib=old;}
  roof.name=ID+'/yellow-hard-gable-roof-fit';f.updateWorldMatrix(true,true);
  const tile=[],walls=[];roof.traverse(m=>{if(!m.isMesh)return;if(m.material===material('roof_tile'))tile.push(m);if(m.material===material('wall_red'))walls.push(m);});if(tile.length!==1||walls.length!==1)throw Error('Exact new hard-gable factory surfaces required');
  const tileY=z=>{const origin=f.localToWorld(new T.Vector3(0,30,z)),h=new T.Raycaster(origin,new T.Vector3(0,-1,0)).intersectObject(tile[0],false)[0];if(!h)throw Error('New actual gable tile profile missing');return h.point.y;};
  // Only this new factory's thin gable/rake copy is replaced by true thick
  // closed end pieces. The roof top and every existing hall remain untouched.
  for(const m of walls){m.removeFromParent();m.geometry.dispose();}
  const shapeFrom=points=>new T.Shape(points.map(p=>new T.Vector2(...p)));
  const upper=[];for(let i=0;i<=24;i++){const z=-2.4+4.8*i/24;upper.push([-z,Math.max(4.7,tileY(z)-.15)]);}upper.sort((a,b)=>a[0]-b[0]);
  const trim=[];for(let i=0;i<=32;i++){const z=-2.95+5.9*i/32;trim.push([-z,tileY(z)+.05]);}trim.sort((a,b)=>a[0]-b[0]);const trimPoly=[...trim,...trim.toReversed().map(p=>[p[0],p[1]-.28])];
  for(const sign of[-1,1]){const g=mesh('real-thick-upper-gable-fit',new T.ExtrudeGeometry(shapeFrom(upper),{depth:.26,bevelEnabled:false}),material('wall_red',red),sign>0?4.84:-5.1,0,0);g.rotation.y=Math.PI/2;const t=mesh('real-thick-glazed-rake-trim-fit',new T.ExtrudeGeometry(shapeFrom(trimPoly),{depth:.08,bevelEnabled:false}),material('roof_tile',0xc6a34b),sign>0?5.024:-5.104,0,0);t.rotation.y=Math.PI/2;}
  // Remove only factory zero-area triangles in this new copy. No shared roof
  // source or retained instance is changed, nor is any positive-area face cut.
  f.traverse(m=>{if(!m.isMesh)return;if(!m.name.startsWith(ID+'/'))m.name=ID+'/roof-shell-fit/'+m.name;if(!m.material.name.startsWith('r163_yude_west_'))m.material.name='r163_yude_west_roof_'+(m.material.name||m.material.type);const g=m.geometry,p=g.attributes.position,ix=g.index,rows=[];for(let i=0;i<(ix?.count??p.count);i+=3){const js=[0,1,2].map(j=>ix?.getX(i+j)??i+j),v=js.map(j=>new T.Vector3().fromBufferAttribute(p,j));if(new T.Triangle(...v).getArea()>1e-12)rows.push(...js);}if(rows.length===(ix?.count??p.count))return;const q=new T.BufferGeometry();for(const[key,a]of Object.entries(g.attributes)){const values=[];for(const j of rows)for(let c=0;c<a.itemSize;c++)values.push(a.array[j*a.itemSize+c]);q.setAttribute(key,new T.BufferAttribute(new a.array.constructor(values),a.itemSize,a.normalized));}m.geometry=q;g.dispose();});
  f.updateWorldMatrix(true,true);let n=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.yudeWestStoneTop){const b=new T.Box3().setFromObject(m);b.yudeWestStoneTop=m.userData.yudeWestStoneTop;b.yudeWestMesh=m.uuid;if(m.userData.yudeWestExtraSkin)b.yudeWestExtraSkin=true;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});return;}
   const v=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...q).getArea()>1e-12)v.push(...q.flatMap(p=>p.toArray()));}if(!v.length)throw Error('Empty Yude west owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const t=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+n+++'/'+m.name.slice(ID.length+1)),b=t.box.clone();b.triangleSupport=t;b.yudeWestMesh=m.uuid;if(m.userData.yudeWestExtraSkin)b.yudeWestExtraSkin=true;s.colliders.push(b);}finally{g.dispose();}
  });
  const bounds=new T.Box3().setFromObject(f);if(!new T.Box3(new T.Vector3(134.2,-1e-6,490.7),new T.Vector3(143,9,502.3)).containsBox(bounds))throw Error('Yude west escaped clear reserve '+JSON.stringify(bounds));
  meta={id:ID,sourceObjectId:'FC-EDE61DA470',originalOrdinal:4,sourceLine:651,name:'重华宫浴德殿外观拟合',identity:'CHONGHUA_MIDDLE_COURT_WEST_SIDE_NOT_WUYING_BATH_OR_NINGSHOU_YIZHAI',front:'EAST_MODEL_NEGATIVE_X',bayGrid:[3,1],roof:'YELLOW_HARD_GABLE',noProjectingMasonryPier:true,namedFacadePhotoVerified:false,facadeEvidence:'TEXT_PLAN_AND_EXPLICIT_PEER_STYLE_FIT_NOT_PHOTO_RESTORATION',yizhaiInteriorComplete:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,admission:'CLOSED_INTERIOR_REAL_SMALL_OUTSIDE_STAIR_LEDGE_ONLY',source:'https://www.dpm.org.cn/explore/building/236506.html',paper:'https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf',paperSHA256:'3836ed20880121a3d711a94635aaf440cd9762aaac8279b116a98029aebbc841',planFigure:9,paperPrintedPages:[135,136],sourceSupported:['official middle-court west side hall3bays/1deep/yellow hard-gable, interior nameYizhai only','official article printed135 namesYude as no-projecting-masonry-pier form; figure9 places it west/east-facing','figure8 is a compound gable/eave partial view, not an identified completeYude front'],fit:['all metric coordinates/10.2x4.8body, .45platform/three .15rises/outereave ledge and hidden rear/end closures','new low-detail hard-gable factory top with closed thick upper gables/trim, no front masonry projection','central closed partition door/two sill-window groups and coarse rectangular lattice/member/count/color/common painted-beam finish from peer type, not named photo inventory'],excluded:['WuyingYudeBath/NingshouYizhai identities, interior inscription/furnishings or fabricated exterior plaque','moving original middleChonghua/Chongjing/walls, extra baoxia/gallery, new room/map teleport','s5eff07573438b interior attribution/full room acceptance, original detailed carving/beast inventory','global physics/invisible supports, upload/main/Pages'],unknown:['named complete current facade photo, surveyed dimensions/door-window divisions, exact no-pier end details and original paint','hidden back/interior/current actual admission and whole object acceptance','GPU/browser/mobile/all-streaming and prior teleport behavior']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 kit.root.add(f);kit.colliders.push(...s.colliders);kit.walkables.push(...s.walkables);kit.owned.push(...s.owned);done.add(kit);return{frame:f,meta};
}
