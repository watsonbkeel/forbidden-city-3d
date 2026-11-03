import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='zhongzheng-east-hall',done=new WeakSet();
const GATE={kind:'gate',name:'建福门',x:183.7,z:409.4};
const HALL={kind:'hall',name:'延春阁',x:216,z:485.5,w:23.5,d:24.3,pad:.8,ph:.75,colH:10.24,roof:'pavilion',layers:2};
const COURT={kind:'courtWalls',x0:178.6,x1:245,z0:409.4,z1:520,gates:[{side:'s',at:183.7,gate:'建福门'}]};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(k,z){const r=k?.root;let exists=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-E5EEAB2373')exists=true;});if(!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(k)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(q=>!mutable(k[q]))||z.items?.filter(i=>same(i,GATE)).length!==1||z.items?.filter(i=>same(i,HALL)).length!==1||z.items?.filter(i=>same(i,COURT)).length!==1||exists||done.has(k))throw Error('Exact mutable untransformed Yuhua east host required, once only');}
/** Plan/group-view/reconstruction identity only. No named near facade is verified. */
export function buildZhongzhengEastHall(kit,zone){
 if(zone?.id!=='outer-west')return false;validateHost(kit,zone);
 const s=new CourtKit(kit.lib,'outer-west'),cache=new Map();s.ridge.name='r163_zhongzheng_east_private_ridge';s.gold.name='r163_zhongzheng_east_private_gold';let f,meta;
 const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_zhongzheng_east_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);s.owned.push(m);}return cache.get(key);};
 try{
  for(const n of['stone_slab','wall_brick','wood_column','wall_red','caihua_beam','roof_tile','rafters','dougong_band'])material(n);
  f=s.frame(191.2,397.5,-Math.PI/2);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=s.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color,stone=false)=>{const tile=kit.lib.tileSize(name),mat=material(name,color),q=mesh(role,applyBoxUV(new T.BoxGeometry(w,h,d),tile),mat,x,y,z);if(stone)q.userData.zhongzhengEastStoneTop=role;return q;};
  const red=0x914b40,wood=0x74412f,green=0x3b6454,paper=0x7e877a;
  box('real-low-stone-platform-fit','stone_slab',12,.45,7.4,0,.225,-.4,undefined,true);
  for(let i=1;i<=2;i++)box('real-small-central-step-fit','stone_slab',2.8,.15*i,.7,0,.075*i,-5.85+.7*i,undefined,true);
  box('closed-unseen-rear-fit','wall_red',11,4.25,.28,0,2.575,2.41,red);
  box('closed-unseen-front-backing-fit','wall_red',11,3.4,.24,0,2.15,-2.43,red);
  // Plain closed side wall is a conservative hidden-face fit, not a verified end form.
  for(const x of[-5.36,5.36])box('plain-closed-side-wall-fit','wall_red',.28,4.25,5.1,x,2.575,0,red);
  box('closed-upper-front-header-fit','wall_red',11,.85,.26,0,4.275,-2.55,red);
  for(const x of[-5.5,-11/6,11/6,5.5]){mesh('plain-front-eave-column-fit',new T.CylinderGeometry(.14,.18,4,12),material('wood_column',wood),x,2.45,-2.55);box('front-bay-jamb-fit','wood_column',.14,3.4,.26,x,2.15,-2.55,wood);}
  box('painted-front-eave-beam-fit','caihua_beam',11.1,.25,.3,0,4.575,-2.55);
  box('plain-painted-door-lintel-fit','caihua_beam',10.95,.26,.16,0,3.98,-2.68);
  box('closed-middle-partition-door-fit','wood_column',3.14,3.4,.16,0,2.15,-2.57,wood);
  for(const x of[-.78,.78]){box('middle-upper-paper-panel-fit','wood_column',1.42,2.02,.035,x,2.77,-2.675,paper);box('middle-lower-wood-panel-fit','wood_column',1.42,1.1,.035,x,1.05,-2.675,wood);for(const dx of[-.74,.74])box('middle-leaf-border-fit','wood_column',.045,3.35,.045,x+dx,2.15,-2.72,green);for(const y of[.48,1.64,3.82])box('middle-leaf-cross-fit','wood_column',1.5,.045,.045,x,y,-2.72,green);for(const dx of[-.38,0,.38])box('coarse-rectangular-lattice-fit','wood_column',.026,1.96,.035,x+dx,2.77,-2.72,green);for(const y of[2.25,2.77,3.29])box('coarse-rectangular-lattice-fit','wood_column',1.42,.026,.035,x,y,-2.72,green);}
  for(const c of[-11/3,11/3]){
   box('window-masonry-sill-fit','wall_brick',3.16,.75,.28,c,.825,-2.55);
   box('side-sill-window-group-fit','wood_column',3.1,2.65,.16,c,2.525,-2.57,green);
   for(const dx of[-.99,0,.99]){const x=c+dx;box('plain-sill-window-field-fit','wood_column',.9,2.48,.035,x,2.525,-2.675,paper);for(const q of[-.45,0,.45])box('coarse-rectangular-lattice-fit','wood_column',.032,2.48,.035,x+q,2.525,-2.72,green);for(const y of[1.3,1.92,2.54,3.16,3.75])box('coarse-rectangular-lattice-fit','wood_column',.94,.032,.035,x,y,-2.72,green);}
   for(const dx of[-1.58,1.58])box('plain-window-group-frame-fit','wood_column',.08,2.73,.06,c+dx,2.525,-2.72,wood);for(const y of[1.16,3.89])box('plain-window-group-frame-fit','wood_column',3.24,.08,.06,c,y,-2.72,wood);
  }
  const tiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(n=>[n,kit.lib.tileSize(n)])),aspects=new Map(['dougong_band','caihua_beam'].map(n=>[n,kit.lib.aspect(n)])),old=s.lib;
  s.lib={material:n=>cache.get(n+':'),tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};let roof;
  try{roof=s.roof(f,{type:'gable',hardGableEnd:false,width:11,depth:5.1,baseY:4.7,height:1.45,overhang:.55,brackets:false,detail:'low'});}finally{s.lib=old;}
  roof.name=ID+'/conservative-yellow-straight-ridge-two-slope-roof-fit';f.updateWorldMatrix(true,true);
  const tile=[],walls=[];roof.traverse(m=>{if(!m.isMesh)return;if(m.material===material('roof_tile'))tile.push(m);if(m.material===material('wall_red'))walls.push(m);});if(tile.length!==1||walls.length!==1)throw Error('Exact new two-slope factory surfaces required');
  const tileY=z=>{z=Math.max(-3.0999,Math.min(3.0999,z));const origin=f.localToWorld(new T.Vector3(0,30,z)),h=new T.Raycaster(origin,new T.Vector3(0,-1,0)).intersectObject(tile[0],false)[0];if(!h)throw Error('New actual gable tile profile missing');return h.point.y;};
  // Only this new factory's thin gable/rake copy is replaced by true thick
  // closed end pieces. The roof top and every existing hall remain untouched.
  for(const m of walls){m.removeFromParent();m.geometry.dispose();}
  const shapeFrom=points=>new T.Shape(points.map(p=>new T.Vector2(...p)));
  const upper=[];for(let i=0;i<=24;i++){const z=-2.55+5.1*i/24;upper.push([-z,Math.max(4.7,tileY(z)-.15)]);}upper.sort((a,b)=>a[0]-b[0]);
  const trim=[];for(let i=0;i<=32;i++){const z=-3.1+6.2*i/32;trim.push([-z,tileY(z)+.05]);}trim.sort((a,b)=>a[0]-b[0]);const trimPoly=[...trim,...trim.toReversed().map(p=>[p[0],p[1]-.28])];
  for(const sign of[-1,1]){const g=mesh('real-thick-upper-end-closure-fit',new T.ExtrudeGeometry(shapeFrom(upper),{depth:.26,bevelEnabled:false}),material('wall_red',red),sign>0?5.24:-5.5,0,0);g.rotation.y=Math.PI/2;const t=mesh('real-thick-glazed-rake-trim-fit',new T.ExtrudeGeometry(shapeFrom(trimPoly),{depth:.08,bevelEnabled:false}),material('roof_tile',0xc6a34b),sign>0?5.424:-5.504,0,0);t.rotation.y=Math.PI/2;}
  // Remove only factory zero-area triangles in this new copy. No shared roof
  // source or retained instance is changed, nor is any positive-area face cut.
  f.traverse(m=>{if(!m.isMesh)return;if(!m.name.startsWith(ID+'/'))m.name=ID+'/roof-shell-fit/'+m.name;if(!m.material.name.startsWith('r163_zhongzheng_east_'))m.material.name='r163_zhongzheng_east_roof_'+(m.material.name||m.material.type);const g=m.geometry,p=g.attributes.position,ix=g.index,rows=[];for(let i=0;i<(ix?.count??p.count);i+=3){const js=[0,1,2].map(j=>ix?.getX(i+j)??i+j),v=js.map(j=>new T.Vector3().fromBufferAttribute(p,j));if(new T.Triangle(...v).getArea()>1e-12)rows.push(...js);}if(rows.length===(ix?.count??p.count))return;const q=new T.BufferGeometry();for(const[key,a]of Object.entries(g.attributes)){const values=[];for(const j of rows)for(let c=0;c<a.itemSize;c++)values.push(a.array[j*a.itemSize+c]);q.setAttribute(key,new T.BufferAttribute(new a.array.constructor(values),a.itemSize,a.normalized));}m.geometry=q;g.dispose();});
  f.updateWorldMatrix(true,true);let n=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.zhongzhengEastStoneTop){const b=new T.Box3().setFromObject(m);b.zhongzhengEastStoneTop=m.userData.zhongzhengEastStoneTop;b.zhongzhengEastMesh=m.uuid;if(m.userData.zhongzhengEastExtraSkin)b.zhongzhengEastExtraSkin=true;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});return;}
   const v=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...q).getArea()>1e-12)v.push(...q.flatMap(p=>p.toArray()));}if(!v.length)throw Error('Empty Zhongzheng east owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const t=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+n+++'/'+m.name.slice(ID.length+1)),b=t.box.clone();b.triangleSupport=t;b.zhongzhengEastMesh=m.uuid;if(m.userData.zhongzhengEastExtraSkin)b.zhongzhengEastExtraSkin=true;s.colliders.push(b);}finally{g.dispose();}
  });
  const bounds=new T.Box3().setFromObject(f);if(!new T.Box3(new T.Vector3(185.2,-1e-6,391),new T.Vector3(197.2,9,404)).containsBox(bounds))throw Error('Zhongzheng east escaped clear reserve '+JSON.stringify(bounds));
  meta={id:ID,sourceObjectId:'FC-E5EEAB2373',originalOrdinal:31,name:'中正殿东配殿复建侧殿有限外观拟合',front:'WEST_MODEL_POSITIVE_X',exteriorLevels:1,namedNearFacadeVerified:false,officialBayCount:null,officialRoofType:null,modelBayGrid:[3,1],modelDimensions:[11,5.1],modelRoof:'GENERIC_YELLOW_STRAIGHT_RIDGE_TWO_SLOPE_WITH_SMALL_END_OVERHANG_FIT',rebuiltAreaCompletion:2012,wholeObjectAccepted:false,currentAdmissionVerified:false,interiorComplete:false,newRooms:0,newMapItems:0,admission:'CLOSED_CORE_REAL_LOW_EXTERIOR_LEDGE_ONLY',source:'https://www.dpm.org.cn/Uploads/File/2021/08/24/u6124c44d8868f.pdf#page=7',printedPage:20,filePage:7,reconstructionSource:'https://www.dpm.org.cn/classify_detail/181812.html',dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',sourceSupported:['official2021 plan/group view: east side hall of Zhongzheng court east of Xiangyun, one storey/yellow roof/straight ridge and two slopes/red wall','official2012-11-27 completion announcement explicitly lists Zhongzheng east/west side halls destroyed1923 and reconstructed in this area','west-facing orientation is location/plan/step cross-inference, not measured facade proof'],fit:['all coordinates/dimensions/heights/hidden back and end closures,11x5.1body and .45low ledge/two .15-rise .7-run treads','generic single yellow two-slope engine shell with small end overhang is conservative engineering fit; hard/hanging/hipped-gable type is NOT verified','three-bay-looking model grid/central closed partition and rectangular sill window panels/red columns/green frames/paint are fitted unknown near-facade details, not another named hall photograph or official count'],excluded:['Yuhua east two-storey portrait hall identity or facade; official page-end Longen Gate/five-bay/two-depth glossary as this hall data','mainZhongzheng bay count transferred as source proof, unknown interior/plaque/altars/admission/new maps/rooms','moving oldwall/183.7/406/Xiangyun four stair approaches, invisible ramps/global physics, remote/main/Pages'],unknown:['named near facade/true bay and door-window counts/full roof type/metric survey/hidden elevations','present room/public admission/whole-building architectural acceptance','GPU/PBR/browser/mobile/all-zone streaming/dynamic crowds/fullhistory']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 kit.root.add(f);kit.colliders.push(...s.colliders);kit.walkables.push(...s.walkables);kit.owned.push(...s.owned);done.add(kit);return{frame:f,meta};
}
