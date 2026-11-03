import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='shufang-front-hall',done=new WeakSet();
const GATE={kind:'gate',name:'重华门',x:120.2,z:460};
const HALL={kind:'hall',name:'重华宫',x:118.9,z:498.3,w:21.5,d:8.6,pad:1,ph:.75,colH:5.49,roof:'xieshan',enter:true,throne:true};
const COURT={kind:'courtWalls',x0:92.62,x1:145.18,z0:460,z1:505.6,gates:[{side:'s',at:120.2,gate:'重华门'}],source:'estimated'};
export const SHUFANG_FRONT_FIT=Object.freeze({x:82,z:497.7,width:14,depth:9.6,bayGrid:Object.freeze([5,3]),platformY:.6,bounds:Object.freeze([73.9,0,489,90.1,11,505])});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone){const r=kit?.root,find=(kind,name)=>zone.items?.filter(i=>i.kind===kind&&i.name===name)??[];let existing=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-AD667FFA69')existing=true;});if(find('gate','重华门').length!==1||!same(find('gate','重华门')[0],GATE)||find('hall','重华宫').length!==1||!same(find('hall','重华宫')[0],HALL)||zone.items?.filter(i=>same(i,COURT)).length!==1||!r||r.name!=='west-six'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(r)||!mutable(r.children)||!Object.isExtensible(kit)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||done.has(kit)||existing)throw Error('Exact untransformed mutable Shufang front host required, once only');}
/** Own exterior only. A closed wind screen does not authorize a guessed room,
 * rear connecting passage, Jinzhao Yucui rear hall or public admission. */
export function buildShufangFrontHall(kit,zone){
 if(zone?.id!=='west-six')return false;validateHost(kit,zone);
 const s=new CourtKit(kit.lib,'west-six'),cache=new Map();let f,meta;
 const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_shufang_front_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);s.owned.push(m);}return cache.get(key);};
 try{
  f=s.frame(82,497.7);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=s.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color,stone=false)=>{const q=mesh(role,applyBoxUV(new T.BoxGeometry(w,h,d),kit.lib.tileSize(name)),material(name,color),x,y,z);if(stone)q.userData.shufangFrontStoneTop=role;return q;};
  box('real-stone-platform-fit','stone_slab',15.2,.6,11.1,0,.3,0,undefined,true);
  // Three visible treads plus the actual platform give four .15m rises.
  for(let i=1;i<=3;i++)box('real-central-stair-fit','stone_slab',3.2,.15*i,.8,0,.075*i,-8.35+.8*i,undefined,true);
  const green=0x236352,red=0x8c342b,apron=0x775047,glaze=0x476166;
  box('closed-unseen-rear-fit','wall_red',14,5.6,.26,0,3.4,4.67,0x9b493b);
  for(const x of[-6.87,6.87])box('closed-unseen-side-fit','wall_red',.26,5.6,7.6,x,3.4,1,0x9b493b);
  box('closed-main-attic-header-fit','wall_red',14,1.55,.26,0,5.425,-2.8,0x345c4b);
  for(const x of[-7,-4.2,-1.4,1.4,4.2,7]){
   mesh('green-front-column-fit',new T.CylinderGeometry(.14,.18,5.3,12),material('wood_column',green),x,3.25,-4.8);
   box('front-wall-green-bay-post-fit','wood_column',.16,4.05,.24,x,2.625,-2.86,green);
  }
  for(const z of[-4.8,4.8])box('painted-eave-beam-fit','caihua_beam',14.25,.4,.35,0,6,z);
  for(const x of[-7,7])box('painted-side-eave-beam-fit','caihua_beam',.35,.4,9.6,x,6,0);
  for(const x of[-7,-4.2,-1.4,1.4,4.2,7])box('plain-porch-roof-bearing-fit','wood_column',.3,.3,2.05,x,5.95,-3.8,green);
  box('closed-middle-wind-door-fit','wood_column',2.48,4.05,.18,0,2.625,-2.83,green);
  // Coarse wind-screen frame/glazing/curtain follows the own facade photo,
  // never the unrelated ceremonial gold-panel door used by a generic hall.
  for(const x of[-1.2,-.47,.47,1.2])box('wind-door-red-frame-fit','wood_column',.075,3.95,.075,x,2.625,-2.965,red);
  for(const y of[.67,2.7,3.55,4.58])box('wind-door-red-cross-frame-fit','wood_column',2.45,.075,.075,0,y,-2.965,red);
  box('wind-door-curtain-fit','wood_column',.84,2.73,.035,0,2.045,-3.025,0xa48275);
  for(let i=0;i<9;i++)box('curtain-coarse-fold-fit','wood_column',.018,2.7,.016,-.37+i*.0925,2.045,-3.055,i%2?0xb39386:0x927165);
  for(const x of[-.83,.83]){box('wind-door-side-glazing-fit','wood_column',.57,1.69,.035,x,3.63,-3.025,glaze);box('wind-door-side-lower-panel-fit','wood_column',.57,1.9,.035,x,1.675,-3.025,apron);}
  for(const y of[3.7,4.15])box('wind-door-upper-transom-fit','wood_column',.86,.32,.035,0,y,-3.025,glaze);
  for(const c of[-5.6,-2.8,2.8,5.6]){
   box('window-masonry-sill-fit','wall_brick',2.63,.82,.28,c,1.01,-2.8);
   box('side-sill-window-group-fit','wood_column',2.6,3.17,.16,c,3.005,-2.83,apron);
   for(let j=0;j<3;j++){
    const x=c+(j-1)*.83;box('side-window-glazing-fit','wood_column',.73,1.43,.035,x,3.79,-2.945,glaze);
    for(const y of[3.1,3.8,4.48])box('window-coarse-grid-fit','wood_column',.77,.035,.04,x,y,-2.98,0x322e29);
    for(const dx of[-.38,0,.38])box('window-coarse-grid-fit','wood_column',.035,1.45,.04,x+dx,3.79,-2.98,0x322e29);
    for(const dx of[-.41,.41])box('window-green-leaf-border-fit','wood_column',.07,3.2,.07,x+dx,3.005,-3.0,green);
    for(const dx of[-.22,0,.22])box('window-coarse-lower-board-fit','wood_column',.025,1.6,.035,x+dx,2.23,-2.97,0x936a5c);
   }
   for(const y of[1.44,4.61])box('window-green-group-frame-fit','wood_column',2.64,.075,.075,c,y,-3.0,green);
  }
  // The central stair opening stays real and full-height. Other low rails
  // are actual visible collision meshes, not an invisible frontage barrier.
  for(const[a,b]of[[-7.15,-1.72],[1.72,7.15]]){
   for(const y of[.78,1.47])box('low-geometric-rail-fit','wood_column',b-a,.09,.11,(a+b)/2,y,-5.2,red);
   for(let i=0;i<=8;i++){const x=a+(b-a)*i/8;box('low-geometric-rail-fit','wood_column',.06,.63,.08,x,1.125,-5.2,red);if(i<8){const cx=x+(b-a)/16;for(const dy of[-.13,.13])box('low-geometric-rail-fit','wood_column',(b-a)/8*.62,.05,.07,cx,1.125+dy,-5.2,red);}}
   for(const x of[a,b])box('rail-green-end-post-fit','wood_column',.14,1.05,.18,x,1.125,-5.2,green);
  }
  box('photo-supported-inner-painted-lintel-fit','caihua_beam',14,.43,.12,0,5.15,-3.02);
  for(const y of[5.56,5.95])box('upper-geometric-transom-fit','wood_column',14,.055,.07,0,y,-3.01,red);
  for(let i=0;i<20;i++){const x=-6.65+i*.7;for(const dx of[-.29,.29])box('upper-geometric-transom-fit','wood_column',.035,.34,.07,x+dx,5.755,-3.02,0xb3ad91);for(const dy of[-.09,.09])box('upper-geometric-transom-fit','wood_column',.57,.03,.07,x,5.755+dy,-3.02,0xb3ad91);}
  // Plaque shape only. Fine historical characters and gold carving are not
  // legible enough here to fabricate and are explicitly outside this fit.
  box('blue-vertical-nameboard-fit','wood_column',.56,.97,.09,0,5.25,-3.13,0x233f66);
  for(const x of[-.315,.315])box('plain-gold-plaque-border-fit','wood_column',.07,1.09,.11,x,5.25,-3.15,0xb89643);
  for(const y of[4.74,5.76])box('plain-gold-plaque-border-fit','wood_column',.7,.07,.11,0,y,-3.15,0xb89643);
  // Resolve every fallible input before allocating the shared roof factory.
  for(const n of['roof_tile','rafters','dougong_band','caihua_beam','wood_column','wall_red'])material(n);
  const tiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(n=>[n,kit.lib.tileSize(n)])),aspects=new Map(['dougong_band','caihua_beam'].map(n=>[n,kit.lib.aspect(n)])),old=s.lib;
  s.lib={material:n=>cache.get(n+':'),tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};let roof;
  try{roof=s.roof(f,{type:'xieshan',width:14,depth:9.6,baseY:6.2,height:2.5,overhang:.65,brackets:false,detail:'low'});}finally{s.lib=old;}
  roof.name=ID+'/yellow-single-xieshan-roof-fit';roof.userData.shufangRoofType='xieshan';
  // Remove only factory zero-area triangles in this new copy. No shared roof
  // source or retained instance is changed, nor is any positive-area face cut.
  roof.traverse(m=>{if(!m.isMesh)return;m.name=ID+'/roof-shell-fit/'+m.name;if(!m.material.name.startsWith('r163_shufang_front_'))m.material.name='r163_shufang_front_roof_'+(m.material.name||m.material.type);const g=m.geometry,p=g.attributes.position,ix=g.index,rows=[];for(let i=0;i<(ix?.count??p.count);i+=3){const js=[0,1,2].map(j=>ix?.getX(i+j)??i+j),v=js.map(j=>new T.Vector3().fromBufferAttribute(p,j));if(new T.Triangle(...v).getArea()>1e-12)rows.push(...js);}if(rows.length===(ix?.count??p.count))return;const q=new T.BufferGeometry();for(const[key,a]of Object.entries(g.attributes)){const values=[];for(const j of rows)for(let c=0;c<a.itemSize;c++)values.push(a.array[j*a.itemSize+c]);q.setAttribute(key,new T.BufferAttribute(new a.array.constructor(values),a.itemSize,a.normalized));}m.geometry=q;g.dispose();});
  f.updateWorldMatrix(true,true);let n=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.shufangFrontStoneTop){const b=new T.Box3().setFromObject(m);b.shufangFrontStoneTop=m.userData.shufangFrontStoneTop;b.shufangFrontMesh=m.uuid;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});return;}
   const v=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...q).getArea()>1e-12)v.push(...q.flatMap(p=>p.toArray()));}if(!v.length)throw Error('Empty Shufang front owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const t=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+n+++'/'+m.name.slice(ID.length+1)),b=t.box.clone();b.triangleSupport=t;b.shufangFrontMesh=m.uuid;s.colliders.push(b);}finally{g.dispose();}
  });
  const bounds=new T.Box3().setFromObject(f);if(!new T.Box3(new T.Vector3(73.9,-1e-6,489),new T.Vector3(90.1,11,505)).containsBox(bounds))throw Error('Shufang front escaped independently clear envelope '+JSON.stringify(bounds));
  meta={id:ID,sourceObjectId:'FC-AD667FFA69',name:'漱芳斋前殿',bayGrid:[5,3],front:'SOUTH_MODEL_ZERO',roof:'YELLOW_XIESHAN',eaveCount:1,dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,admission:'CLOSED_WIND_DOOR_EXTERIOR_VERANDA_ONLY',source:'https://www.dpm.org.cn/explore/building/236449.html',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefa881e51f.jpg',ownPhotoSHA256:'feafe7196ba0307d11a8689e164fcf88099ce60c97bbfb44c0daac5acc7edfd5',sourceSupported:['five bays across and three deep, yellow glazed xieshan roof; front middle wind door and side sill windows','own front photo: green columns, red/green wind-screen frame with glazing/curtain, dark upper windows and lower wood panels','central grey stone stair, low red/green geometric veranda rails, painted beams and blue vertical plaque shape','south-facing front inferred from official opposing northern face of southern courtyard stage'],fit:['all coordinates and compressed14m width/9.6m depth, platform .6m and four .15m rises, coarse colors/repeats','generic low-detail single xieshan curve, hidden roof/back/sides and plain ceiling/attic closure','closed wind-door pose and opaque coarse glazing/curtain, three leaf divisions per side group and rail motifs','plain blue/gold plaque outline without fabricated glyphs'],excluded:['Jinzhao Yucui rear hall, connecting passage, Jingqixuan and Gaoyunqing room or indoor furniture','old stage/courtyard/main hall/wall edits, new public admission or room/map labels','unseen side galleries/wing halls, original fine calligraphy/carvings and counted roof beasts','global physics edits, invisible ramps/rescue supports, remote/main/Pages'],unknown:['surveyed dimensions/full facade and roof profile, unseen rear/side construction','present-day admission and full original paint/decoration','GPU/browser/mobile/full streaming and whole-building acceptance']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 kit.root.add(f);kit.colliders.push(...s.colliders);kit.walkables.push(...s.walkables);kit.owned.push(...s.owned);done.add(kit);return{frame:f,meta};
}
