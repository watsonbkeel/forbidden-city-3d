import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='baozhong-east-hall',done=new WeakSet();
const GATE={kind:'gate',name:'重华门',x:120.2,z:460};
const HALL={kind:'hall',name:'重华宫',x:118.9,z:498.3,w:21.5,d:8.6,pad:1,ph:.75,colH:5.49,roof:'xieshan',enter:true,throne:true};
const COURT={kind:'courtWalls',x0:92.62,x1:145.18,z0:460,z1:505.6,gates:[{side:'s',at:120.2,gate:'重华门'}],source:'estimated'};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone){const r=kit?.root;let exists=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-D16E18CADB')exists=true;});if(!r||r.name!=='west-six'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(kit)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||(kit.ownedTextures&&!mutable(kit.ownedTextures))||zone.items?.filter(i=>same(i,GATE)).length!==1||zone.items?.filter(i=>same(i,HALL)).length!==1||zone.items?.filter(i=>same(i,COURT)).length!==1||exists||done.has(kit))throw Error('Exact mutable untransformed Baozhong east-side host required, once only');}
/** Official text/plan supports this east companion3x1 yellow hard-gable form.
 * Front partitions/colors/counts/steps are generic engineering fit, not a named
 * facade photo or a mirror of Yude asserted as evidence. No Guxiang interior. */
export function buildBaozhongEastHall(kit,zone){
 if(zone?.id!=='west-six')return false;validateHost(kit,zone);
 const s=new CourtKit(kit.lib,'west-six'),cache=new Map();let f,meta;
 const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_baozhong_east_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);s.owned.push(m);}return cache.get(key);};
 try{
  for(const n of['stone_slab','wall_brick','wood_column','wall_red','caihua_beam','roof_tile','rafters','dougong_band'])material(n);
  f=s.frame(99.15,496.5,-Math.PI/2);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=s.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color,stone=false)=>{const q=mesh(role,applyBoxUV(new T.BoxGeometry(w,h,d),kit.lib.tileSize(name)),material(name,color),x,y,z);if(stone)q.userData.baozhongEastStoneTop=role;return q;};
  const red=0x954b3e,wood=0x813e32,green=0x3d594b,paper=0x7e8478;
  box('real-low-stone-platform-fit','stone_slab',10.8,.45,7,0,.225,-.4,undefined,true);
  for(let i=1;i<=2;i++)box('real-small-central-step-fit','stone_slab',2.8,.15*i,.65,0,.075*i,-5+.65*i,undefined,true);
  box('closed-unseen-rear-fit','wall_red',9.8,4.25,.28,0,2.575,2.16,red);
  // Masonry ends at the eave-column centreline, not a projected front pier.
  for(const x of[-4.76,4.76])box('no-pier-lower-gable-wall-fit','wall_red',.28,4.25,4.6,x,2.575,0,red);
  box('closed-upper-front-header-fit','wall_red',9.8,.85,.26,0,4.275,-2.3,red);
  for(const x of[-4.9,-1.6333333333333,1.6333333333333,4.9]){mesh('plain-front-eave-column-fit',new T.CylinderGeometry(.14,.18,4,12),material('wood_column',wood),x,2.45,-2.3);box('front-bay-jamb-fit','wood_column',.14,3.4,.26,x,2.15,-2.3,wood);}
  box('painted-front-eave-beam-fit','caihua_beam',9.9,.25,.3,0,4.575,-2.3);
  box('plain-painted-door-lintel-fit','caihua_beam',9.75,.26,.16,0,3.98,-2.43);
  box('closed-middle-partition-door-fit','wood_column',2.98,3.4,.16,0,2.15,-2.32,wood);
  for(const x of[-.78,.78]){box('middle-upper-paper-panel-fit','wood_column',1.42,2.02,.035,x,2.77,-2.425,paper);box('middle-lower-wood-panel-fit','wood_column',1.42,1.1,.035,x,1.05,-2.425,wood);for(const dx of[-.74,.74])box('middle-leaf-border-fit','wood_column',.045,3.35,.045,x+dx,2.15,-2.47,green);for(const y of[.48,1.64,3.82])box('middle-leaf-cross-fit','wood_column',1.5,.045,.045,x,y,-2.47,green);for(const dx of[-.38,0,.38])box('coarse-rectangular-lattice-fit','wood_column',.026,1.96,.035,x+dx,2.77,-2.47,green);for(const y of[2.25,2.77,3.29])box('coarse-rectangular-lattice-fit','wood_column',1.42,.026,.035,x,y,-2.47,green);}
  for(const c of[-3.2666666666667,3.2666666666667]){
   box('window-masonry-sill-fit','wall_brick',2.96,.75,.28,c,.825,-2.3);
   box('side-sill-window-group-fit','wood_column',2.9,2.65,.16,c,2.525,-2.32,green);
   for(const dx of[-.735,.735]){const x=c+dx;box('plain-sill-window-field-fit','wood_column',1.34,2.48,.035,x,2.525,-2.425,paper);for(const q of[-.65,0,.65])box('coarse-rectangular-lattice-fit','wood_column',.032,2.48,.035,x+q,2.525,-2.47,green);for(const y of[1.3,1.92,2.54,3.16,3.75])box('coarse-rectangular-lattice-fit','wood_column',1.38,.032,.035,x,y,-2.47,green);}
   for(const dx of[-1.48,1.48])box('plain-window-group-frame-fit','wood_column',.08,2.73,.06,c+dx,2.525,-2.47,wood);for(const y of[1.16,3.89])box('plain-window-group-frame-fit','wood_column',3.04,.08,.06,c,y,-2.47,wood);
  }
  const tiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(n=>[n,kit.lib.tileSize(n)])),aspects=new Map(['dougong_band','caihua_beam'].map(n=>[n,kit.lib.aspect(n)])),old=s.lib;
  s.lib={material:n=>cache.get(n+':'),tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};let roof;
  try{roof=s.roof(f,{type:'gable',hardGableEnd:true,width:9.8,depth:4.6,baseY:4.7,height:1.5,overhang:.55,brackets:false,detail:'low'});}finally{s.lib=old;}
  roof.name=ID+'/yellow-hard-gable-roof-fit';f.updateWorldMatrix(true,true);
  const tile=[],walls=[];roof.traverse(m=>{if(!m.isMesh)return;if(m.material===material('roof_tile'))tile.push(m);if(m.material===material('wall_red'))walls.push(m);});if(tile.length!==1||walls.length!==1)throw Error('Exact new hard-gable factory surfaces required');
  // Read this new Float32 roof's real edge: nominal2.85 lies9.5e-8 beyond it.
  // Sample at most1micrometre inside for robust profile extraction only.
  tile[0].geometry.computeBoundingBox();const tileBounds=tile[0].geometry.boundingBox;
  const tileY=z=>{const sampleZ=T.MathUtils.clamp(z,tileBounds.min.z+1e-6,tileBounds.max.z-1e-6),origin=f.localToWorld(new T.Vector3(0,30,sampleZ)),h=new T.Raycaster(origin,new T.Vector3(0,-1,0)).intersectObject(tile[0],false)[0];if(!h)throw Error('New actual gable tile profile missing');return h.point.y;};
  // Only this new factory's thin gable/rake copy is replaced by true thick
  // closed end pieces. The roof top and every existing hall remain untouched.
  for(const m of walls){m.removeFromParent();m.geometry.dispose();}
  const shapeFrom=points=>new T.Shape(points.map(p=>new T.Vector2(...p)));
  const upper=[];for(let i=0;i<=24;i++){const z=-2.3+4.6*i/24;upper.push([-z,Math.max(4.7,tileY(z)-.15)]);}upper.sort((a,b)=>a[0]-b[0]);
  const trim=[];for(let i=0;i<=32;i++){const z=-2.85+5.7*i/32;trim.push([-z,tileY(z)+.05]);}trim.sort((a,b)=>a[0]-b[0]);const trimPoly=[...trim,...trim.toReversed().map(p=>[p[0],p[1]-.28])];
  for(const sign of[-1,1]){const g=mesh('real-thick-upper-gable-fit',new T.ExtrudeGeometry(shapeFrom(upper),{depth:.26,bevelEnabled:false}),material('wall_red',red),sign>0?4.64:-4.9,0,0);g.rotation.y=Math.PI/2;const t=mesh('real-thick-glazed-rake-trim-fit',new T.ExtrudeGeometry(shapeFrom(trimPoly),{depth:.08,bevelEnabled:false}),material('roof_tile',0xc6a34b),sign>0?4.824:-4.904,0,0);t.rotation.y=Math.PI/2;}
  // Remove only factory zero-area triangles in this new copy. No shared roof
  // source or retained instance is changed, nor is any positive-area face cut.
  f.traverse(m=>{if(!m.isMesh)return;if(!m.name.startsWith(ID+'/'))m.name=ID+'/roof-shell-fit/'+m.name;if(!m.material.name.startsWith('r163_baozhong_east_'))m.material.name='r163_baozhong_east_roof_'+(m.material.name||m.material.type);const g=m.geometry,p=g.attributes.position,ix=g.index,rows=[];for(let i=0;i<(ix?.count??p.count);i+=3){const js=[0,1,2].map(j=>ix?.getX(i+j)??i+j),v=js.map(j=>new T.Vector3().fromBufferAttribute(p,j));if(new T.Triangle(...v).getArea()>1e-12)rows.push(...js);}if(rows.length===(ix?.count??p.count))return;const q=new T.BufferGeometry();for(const[key,a]of Object.entries(g.attributes)){const values=[];for(const j of rows)for(let c=0;c<a.itemSize;c++)values.push(a.array[j*a.itemSize+c]);q.setAttribute(key,new T.BufferAttribute(new a.array.constructor(values),a.itemSize,a.normalized));}m.geometry=q;g.dispose();});
  f.updateWorldMatrix(true,true);let n=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.baozhongEastStoneTop){const b=new T.Box3().setFromObject(m);b.baozhongEastStoneTop=m.userData.baozhongEastStoneTop;b.baozhongEastMesh=m.uuid;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;top.baozhongEastStoneTop=m.userData.baozhongEastStoneTop;s.walkables.push({type:'box',box:top,rescue:false});return;}
   const v=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...q).getArea()>1e-12)v.push(...q.flatMap(p=>p.toArray()));}if(!v.length)throw Error('Empty Baozhong east owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const t=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+n+++'/'+m.name.slice(ID.length+1)),b=t.box.clone();b.triangleSupport=t;b.baozhongEastMesh=m.uuid;s.colliders.push(b);}finally{g.dispose();}
  });
  const bounds=new T.Box3().setFromObject(f);if(!new T.Box3(new T.Vector3(94.4,-1e-6,490.7),new T.Vector3(104.2,9,502.3)).containsBox(bounds))throw Error('Baozhong east escaped clear reserve '+JSON.stringify(bounds));
  meta={id:ID,sourceObjectId:'FC-D16E18CADB',originalOrdinal:3,name:'葆中殿',identity:'CHONGHUA_MIDDLE_COURT_EAST_SIDE_BAOZHONG_NOT_YUDE_OR_GENERIC_REBUILT_ZHONGZHENG',front:'WEST_MODEL_POSITIVE_X',bayGrid:[3,1],roof:'YELLOW_HARD_GABLE',noProjectingMasonryPier:true,namedFacadePhotoVerified:false,facadeMirroredAsEvidence:false,facadeEvidence:'OFFICIAL_TEXT_PLAN_AND_EXPLICIT_COMMON_STYLE_FIT_NOT_NAMED_PHOTO_RESTORATION',guxiangzhaiInteriorComplete:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,admission:'CLOSED_UNKNOWN_INTERIOR_REAL_LOW_EXTERIOR_LEDGE_ONLY',source:'https://www.dpm.org.cn/explore/building/236506.html',paper:'https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf',paperSHA256:'3836ed20880121a3d711a94635aaf440cd9762aaac8279b116a98029aebbc841',planFigure:9,paperPrintedPages:[135,136],sourceSupported:['official text names middle-court eastBaozhong3bays/1deep/yellow hard-gable;Guxiangzhai is an indoor inscription only','official journal printed135 explicitly includes Baozhong among no-projecting-masonry-pier hard-gables;printed136figure9 east-side position and west-facing court orientation','figure8 is only a compound gable/eave partial view, not an identified wholeBaozhong front'],fit:['all metric coordinates/dimensions/heights,9.8x4.6body/10.8x7platform and .45height/two .15rise .65run real treads','common CourtKit hard-gable shell and own thick closed upper ends/hidden rear, no projecting front masonry pier','central closed two-leaf partition/two side sill-window groups with two fields each/coarse rectangular lattice/common red-green column and painted beam finish are engineering fit, not namedFacade evidence or mirroredYude inventory'],excluded:['exteriorGuxiangzhai plaque/unknown room or bookcase/interior completion/current public opening','moving oldChonghua/Chongjing/Yude/courtWalls or z487passage, invented well pavilion/gallery/new maps/rooms','other namedHall dimensions/LongenGlossary as source proof, oldroof/physics edits/invisible ramps,main/upload/Pages'],unknown:['named complete near-facade photograph, surveyed dimensions/door-window subdivisions/paint/step counts and original detailed no-pier ends','unseen back/interior/current actual admission/whole architectural acceptance','GPU/PBR/browser/mobile/all-zone streaming/fullhistory;parentc46 completeWorld unverified aftertwoSIGKILLs']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 kit.root.add(f);kit.colliders.push(...s.colliders);kit.walkables.push(...s.walkables);kit.owned.push(...s.owned);done.add(kit);return{frame:f,meta};
}
