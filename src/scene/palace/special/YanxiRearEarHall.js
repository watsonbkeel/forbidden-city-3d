import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate, triangleInstance} from '../../../utils/TriangleSupport.js';

const done = new WeakSet(), ID = 'yangxin-yanxi-rear-ear';
export const YANXI_REAR_FIT = Object.freeze({x:132.75,z:291.65,reserve:Object.freeze([122.5,0,287,143,6.5,296.3])});
const HOST_MAIN = {kind:'hall',name:'养心殿',x:108.6,z:277.5,w:36,d:12,pad:1,ph:.6,colH:7.68,roof:'xieshan',enter:true,throne:true};
const HOST_EAST = {kind:'hall',x:87.6,z:290.9,w:16.9,d:8.7,pad:.5,ph:.45,colH:5.44,roof:'gable',brackets:false,map:'hall'};
const mutable = a => Array.isArray(a) && Object.isExtensible(a) && Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit, zone) {
  const r=kit?.root, ids=[];r?.traverse(o=>{if(o.userData.structure?.sourceObjectId)ids.push(o.userData.structure.sourceObjectId)});
  const exact = zone.items && [HOST_MAIN,HOST_EAST].every(h=>zone.items.filter(q=>JSON.stringify(q)===JSON.stringify(h)).length===1);
  if(!r || r.name!=='west-six' || r.parent || r.position.lengthSq() || !r.quaternion.equals(new T.Quaternion()) || !r.scale.equals(new T.Vector3(1,1,1)) || !r.matrix.equals(new T.Matrix4()) || !r.matrixWorld.equals(new T.Matrix4()) || !Object.isExtensible(kit) || !mutable(r.children) || ['colliders','walkables','owned','rooms','mapItems','regions','plaques'].some(k=>!mutable(kit[k])) || !exact || ['FC-3C56B72795','FC-20D1EE8FAB'].some(id=>ids.filter(q=>q===id).length!==1) || ids.includes('FC-9A513A5499') || done.has(kit))throw Error('Exact mutable Yanxi and companion host required, once only');
}

/** DPM2017 print297/298: NW west ear, five bays/front porch/one depth,
 * yellow glazed single-eave rolled roof and inspected front facade. The
 * central rear hall/joint is absent here and is deliberately NOT invented. */
export function buildYanxiRearEarHall(kit, zone) {
  if(zone?.id!=='west-six')return false;
  validate(kit,zone);
  const p=YANXI_REAR_FIT, f=new T.Group();f.name=ID;f.position.set(p.x,0,p.z);
  const geometries=new Set(),materials=new Set(),cache=new Map(),colliders=[],walkables=[];
  let published=false;
  const mat=(name,color)=>{const key=name+':'+color;if(!cache.has(key)){const m=new T.MeshStandardMaterial();materials.add(m);m.copy(kit.lib.material(name));m.name='r165_yanxi_'+key;m.color.setHex(color);m.map=null;m.normalMap=null;cache.set(key,m)}return cache.get(key)};
  const tri=(v,a,b,c,n)=>{const normal=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a)).cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a)));v.push(...a,...(normal.dot(new T.Vector3(...n))>=0?[...b,...c]:[...c,...b]))};
  const quad=(v,a,b,c,d,n)=>{tri(v,a,b,c,n);tri(v,a,c,d,n)};
  try {
    const mesh=(role,v,name,color,stone=false)=>{
      const g=new T.BufferGeometry();geometries.add(g);g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();applyBoxUV(g,2);
      const m=new T.Mesh(g,mat(name,color));m.name=ID+'/'+role;m.userData={yanxiRole:role,yanxiStone:stone};m.castShadow=m.receiveShadow=true;f.add(m);return m;
    };
    const box=(role,w,h,d,x,y,z,name,color,stone=false)=>{
      const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,q=z-d/2,r=z+d/2,v=[];
      quad(v,[a,c,q],[a,e,q],[b,e,q],[b,c,q],[0,0,-1]);quad(v,[a,c,r],[b,c,r],[b,e,r],[a,e,r],[0,0,1]);quad(v,[a,c,q],[a,c,r],[a,e,r],[a,e,q],[-1,0,0]);quad(v,[b,c,q],[b,e,q],[b,e,r],[b,c,r],[1,0,0]);quad(v,[a,c,q],[b,c,q],[b,c,r],[a,c,r],[0,-1,0]);quad(v,[a,e,q],[a,e,r],[b,e,r],[b,e,q],[0,1,0]);return mesh(role,v,name,color,stone);
    };
    const prism=(role,left,right,section,name,color)=>{
      const v=[],faces=T.ShapeUtils.triangulateShape(section.map(([z,y])=>new T.Vector2(z,y)),[]),point=(x,i)=>[x,section[i][1],section[i][0]];
      for(const ids of faces){tri(v,...ids.map(i=>point(left,i)),[-1,0,0]);tri(v,...ids.map(i=>point(right,i)),[1,0,0])}
      for(let i=0;i<section.length;i++){const j=(i+1)%section.length,dz=section[j][0]-section[i][0],dy=section[j][1]-section[i][1];quad(v,point(left,i),point(right,i),point(right,j),point(left,j),[0,dz,-dy])}return mesh(role,v,name,color);
    };
    const stone=0x9b9a90,red=0x8f483b,dark=0x4d4035,pale=0xada58b,yellow=0xc3a151;
    box('grey-platform',19.2,.45,6.4,0,.225,.2,'stone_slab',stone,true);
    for(let i=1;i<=3;i++)box('fitted-low-tread',3,.15*i,.5,0,.075*i,-4.5+(i-.5)*.5,'stone_slab',stone,true);
    box('closed-hidden-core-fit',18.4,3.7,3.8,0,2.3,.95,'wall_red',red);
    for(const x of[-9.2,-5.52,-1.84,1.84,5.52,9.2])box('front-column',.27,3.8,.27,x,2.35,-2.65,'wood_column',red);
    for(const x of[-7.36,-3.68,3.68,7.36]){
      box('side-window-group',3.25,1.8,.10,x,2.72,-1.00,'wood_column',dark);
      for(const dx of[-1.57,0,1.57])box('fitted-window-mullion',.07,1.91,.055,x+dx,2.72,-1.08,'wood_column',red);
      for(const y of[1.82,2.72,3.62])box('fitted-window-rail',3.28,.07,.055,x,y,-1.08,'wood_column',red);
    }
    for(const x of[-.82,.82])box('central-closed-door-leaf',1.58,3.3,.12,x,2.1,-1,'wood_column',red);
    box('pale-ground-painted-beam-fit',18.6,.30,.36,0,4.3,-2.7,'caihua_beam',pale);
    for(let i=0;i<10;i++)box('coarse-dark-beam-panel-fit',1.45,.14,.035,-8.37+i*1.86,4.30,-2.89,'wood_column',dark);
    box('front-roof-bearing',19,.26,.24,0,4.30,-2.65,'wood_column',red);
    box('rear-roof-bearing',19,.26,.24,0,4.30,2.65,'wood_column',red);
    box('rolled-roof-centre-bearing',19,1.60,.20,0,4.82,0,'wood_column',red);
    box('closed-hidden-ceiling-fit',18.4,.12,5.4,0,4.10,.2,'wood_column',red);
    const top=[-3.75,-3.35,-2.75,-1.9,-1.2,-.7,-.35,0,.35,.7,1.2,1.9,2.75,3.35,3.75].map(z=>[z,Math.abs(z)<=2.75?4.5+1.27*Math.cos(Math.PI*z/5.5):Math.abs(z)<=3.35?4.45:4.55]);
    const sampled=z=>{const i=top.findIndex((q,i)=>i+1<top.length&&z>=q[0]&&z<=top[i+1][0]),a=top[i],b=top[i+1];return a[1]+(b[1]-a[1])*(z-a[0])/(b[0]-a[0])};
    const end=[[-.95,4.10],[-.95,sampled(-.95)-.10],...top.filter(q=>q[0]>-.95&&q[0]<2.85).map(([z,y])=>[z,y-.10]),[2.85,sampled(2.85)-.10],[2.85,4.10]];
    prism('closed-hidden-rolled-end-fit',-9.25,-8.95,end,'wall_red',red);prism('closed-hidden-rolled-end-fit',8.95,9.25,end,'wall_red',red);
    prism('yellow-continuous-rolled-cover-fit',-9.85,9.85,[...top,...top.map(([z,y])=>[z,y-.16]).reverse()],'roof_tile',yellow);
    const rib=[...top.map(([z,y])=>[z,y+.055]),...top.map(([z,y])=>[z,y-.015]).reverse()];
    for(let i=0;i<25;i++){const x=-9.6+i*19.2/24;prism('yellow-continuous-rolled-rib',x-.055,x+.055,rib,'roof_tile',yellow)}
    f.updateWorldMatrix(true,true);
    const bound=new T.Box3().setFromObject(f),reserve=new T.Box3(new T.Vector3(...p.reserve.slice(0,3)),new T.Vector3(...p.reserve.slice(3)));reserve.min.y=-1e-6;
    if(!reserve.containsBox(bound))throw Error('Yanxi escaped exact fitted reserve');
    kit.root.traverse(m=>{if(m.isMesh&&bound.intersectsBox(new T.Box3().setFromObject(m)))throw Error('Yanxi intersects old actual mesh')});
    if(kit.colliders.some(c=>bound.intersectsBox(c)))throw Error('Yanxi intersects old contact');
    let ordinal=0;f.traverse(m=>{if(!m.isMesh)return;const b=new T.Box3().setFromObject(m);b.yanxiMesh=m.uuid;if(m.userData.yanxiStone){colliders.push(b);const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false})}else{const support=triangleInstance(createTriangleTemplate(m.geometry),f.position.toArray(),ID+'/'+ordinal++),c=support.box.clone();c.triangleSupport=support;c.yanxiMesh=m.uuid;colliders.push(c)}});
    const meta={id:ID,name:'燕喜堂',aliases:['燕禧堂'],sourceObjectId:'FC-9A513A5499',source:'https://www.dpm.org.cn/Uploads/File/2020/04/15/u5e96a5f41ce74.pdf',sourcePublication:'故宫学刊2017, 纪立芳/杨红/曹明璐',sourcePages:['print297 five-bay/one-depth/front-porch/yellow-glazed single-eave rolled-roof text','print298 inspected front/central-door photographs'],compoundPlan:'https://img.dpm.org.cn/Uploads/File/2023/11/14/u655324ce75cbc.pdf',compoundPlanPage:'print115 northwest rear-ear relation, coordinates fitted',bays:5,depthBays:1,front:'SOUTH',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,centralRearHallBuilt:false,jointBuilt:false,sourceSupported:['west rear ear at compound northwest, distinct from east Tishun','five bays, front porch, one room depth','yellow glazed single-eave rolled roof','red front posts, side window groups/central leaves, grey raised base and central stone steps visible'],fitted:['absolute position and every dimension, south orientation from plan, equal subdivisions','sampled rolled roof section/end closure, hidden back and thickness','coarse front paint panels/colors, closed leaf pose, window pattern and three tread dimensions'],unknown:['precise surveyed geometry, complete roof/end photographs and current facade state','central rear hall and historical attached joint absent from model','fine painted motifs, interior furnishings and current admission'],excluded:['renaming or duplicating east anonymous shell','invented central rear hall, connector, rooms/maps/teleports','complete courtyard/photo/GPU/mobile/performance acceptance'],newRooms:0,newMapItems:0,newTeleportTargets:0};f.userData.structure=meta;
    const lengths={colliders:kit.colliders.length,walkables:kit.walkables.length,owned:kit.owned.length};
    try{kit.root.add(f);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);published=true}catch(e){f.removeFromParent();for(const[k,n]of Object.entries(lengths))kit[k].length=n;throw e}
    return {frame:f,meta};
  }finally{if(!published){for(const g of geometries)g.dispose();for(const m of materials)m.dispose()}}
}
