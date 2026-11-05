import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate, triangleInstance} from '../../../utils/TriangleSupport.js';

const done=new WeakSet(), ID='zhongzheng-main-hall';
export const ZHONGZHENG_MAIN_FIT=Object.freeze({x:216,z:422,reserve:Object.freeze([205,0,412,227,12,431])});
const HOST={kind:'gate',name:'建福门',x:183.7,z:409.4};
const COURT={kind:'courtWalls',x0:178.6,x1:245,z0:409.4,z1:520,gates:[{side:'s',at:183.7,gate:'建福门'}]};
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit,zone){const r=kit?.root,ids=[];r?.traverse(o=>{if(o.userData.structure?.sourceObjectId)ids.push(o.userData.structure.sourceObjectId)});if(!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(kit)||!Object.isExtensible(r)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions','plaques'].some(k=>!mutable(kit[k]))||!zone.items||[HOST,COURT].some(h=>zone.items.filter(q=>JSON.stringify(q)===JSON.stringify(h)).length!==1)||['FC-F0C6383E88','FC-3295FB46B4'].some(id=>ids.filter(q=>q===id).length!==1)||ids.includes('FC-66378DAD81')||done.has(kit))throw Error('Exact mutable Zhongzheng north host required, once only')}

/** Three bays, one depth and front baoxia are source supported. Coordinates,
 * roof form/section, colors and closed facade are finite fits, not a survey.
 * The old transverse wall remains. The historic platform link is NOT built. */
export function buildZhongzhengMainHall(kit,zone){
 if(zone?.id!=='outer-west')return false;
 validate(kit,zone);
 const p=ZHONGZHENG_MAIN_FIT,f=new T.Group();f.name=ID;f.position.set(p.x,0,p.z);
 const geometries=new Set(),materials=new Set(),cache=new Map(),colliders=[],walkables=[];let published=false;
 const mat=(name,color)=>{const key=name+':'+color;if(!cache.has(key)){const m=new T.MeshStandardMaterial();materials.add(m);m.copy(kit.lib.material(name));m.name='r165_zhongzheng_'+key;m.color.setHex(color);m.map=null;m.normalMap=null;cache.set(key,m)}return cache.get(key)};
 const tri=(v,a,b,c,n)=>{const q=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a)).cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a)));v.push(...a,...(q.dot(new T.Vector3(...n))>=0?[...b,...c]:[...c,...b]))};
 const quad=(v,a,b,c,d,n)=>{tri(v,a,b,c,n);tri(v,a,c,d,n)};
 try{
  const mesh=(role,v,name,color,stone=false)=>{const g=new T.BufferGeometry();geometries.add(g);g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();applyBoxUV(g,2);const m=new T.Mesh(g,mat(name,color));m.name=ID+'/'+role;m.userData={zhongzhengMainRole:role,zhongzhengMainStone:stone};m.castShadow=m.receiveShadow=true;f.add(m);return m};
  const box=(role,w,h,d,x,y,z,name,color,stone=false)=>{const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,q=z-d/2,r=z+d/2,v=[];quad(v,[a,c,q],[a,e,q],[b,e,q],[b,c,q],[0,0,-1]);quad(v,[a,c,r],[b,c,r],[b,e,r],[a,e,r],[0,0,1]);quad(v,[a,c,q],[a,c,r],[a,e,r],[a,e,q],[-1,0,0]);quad(v,[b,c,q],[b,e,q],[b,e,r],[b,c,r],[1,0,0]);quad(v,[a,c,q],[b,c,q],[b,c,r],[a,c,r],[0,-1,0]);quad(v,[a,e,q],[a,e,r],[b,e,r],[b,e,q],[0,1,0]);return mesh(role,v,name,color,stone)};
  const prism=(role,left,right,section,name,color,swap=false)=>{const v=[],faces=T.ShapeUtils.triangulateShape(section.map(([q,y])=>new T.Vector2(q,y)),[]),point=(x,i)=>swap?[section[i][0],section[i][1],x]:[x,section[i][1],section[i][0]],normal=n=>swap?[n[2],n[1],n[0]]:n;for(const ids of faces){tri(v,...ids.map(i=>point(left,i)),normal([-1,0,0]));tri(v,...ids.map(i=>point(right,i)),normal([1,0,0]))}for(let i=0;i<section.length;i++){const j=(i+1)%section.length,dq=section[j][0]-section[i][0],dy=section[j][1]-section[i][1];quad(v,point(left,i),point(right,i),point(right,j),point(left,j),normal([0,dq,-dy]))}return mesh(role,v,name,color)};
  const stone=0xaaa69b,red=0x984a35,dark=0x394b3f,green=0x34584e,yellow=0xc3a151;
  box('main-stone-platform',18.8,.6,9.6,0,.3,.4,'stone_slab',stone,true);
  box('front-projection-stone-platform',7.4,.6,3.2,0,.3,-6,'stone_slab',stone,true);
  for(let i=1;i<=4;i++)box('fitted-low-tread',3,.15*i,.5,0,.075*i,-9.6+(i-.5)*.5,'stone_slab',stone,true);
  box('closed-hidden-core-fit',16.8,3.85,5.9,0,2.525,.35,'wall_red',red);
  for(const x of[-8.4,-2.8,2.8,8.4])box('three-bay-front-post',.3,3.95,.3,x,2.575,-3.25,'wood_column',red);
  for(const x of[-2.6,2.6])box('front-projection-post',.3,3.95,.3,x,2.575,-6.25,'wood_column',red);
  for(const x of[-5.6,5.6]){box('fitted-side-window-group',4.8,1.8,.12,x,2.8,-2.66,'wood_column',dark);for(const dx of[-2.35,0,2.35])box('fitted-window-mullion',.08,1.9,.06,x+dx,2.8,-2.75,'wood_column',red);for(const y of[1.9,2.8,3.7])box('fitted-window-rail',4.82,.08,.06,x,y,-2.75,'wood_column',red)}
  for(const x of[-1.875,-.625,.625,1.875])box('fitted-central-closed-leaf',1.22,3.3,.16,x,2.25,-2.68,'wood_column',red);
  box('front-projection-bearing',5.6,.3,.3,0,4.5,-6.25,'caihua_beam',green);
  for(const x of[-2.6,2.6])box('projection-side-bearing',.25,.54,3.1,x,4.60,-4.7,'wood_column',red);
  box('hidden-main-ridge-bearing',16.8,2.25,.24,0,5.555,0,'wood_column',red);
  const xs=[-9.2,-8.4,-5.6,-3.2,-2.6,-1.6,0,1.6,2.6,3.2,5.6,8.4,9.2],zs=[-7.2,-6.25,-4.2,-3.25,-2.6,-1.6,0,1.6,2.6,3.3,4.2];
  const inside=(i,j)=>j>=2||(xs[i]>=-3.2&&xs[i+1]<=3.2);
  const height=(x,z)=>Math.max(z>=-4.2?4.8+2*(1-Math.abs(z)/4.2):-Infinity,Math.abs(x)<=3.2&&z<=0?4.8+.95*(1-Math.abs(x)/3.2):-Infinity);
  // Split each cell exactly at the two fitted planes' intersection. Sampling
  // max only at corners would inflate a sawtooth strip along the roof valley.
  const clipped=(poly,positive)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a[2],db=b[2],ina=positive?da>=0:da<=0,inb=positive?db>=0:db<=0;if(ina)out.push(a);if(ina!==inb){const t=da/(da-db);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1]),0])}}return out.filter((p,i)=>i===0||Math.hypot(p[0]-out[i-1][0],p[1]-out[i-1][1])>1e-10)};
  const solid=(role,choose,offset,bottom,name,color)=>{const top=[],edges=new Map(),key=a=>a.map(n=>Math.round(n*1e7)).join(',');for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){if(!choose(i,j))continue;const active=xs[i]>=-3.2&&xs[i+1]<=3.2&&zs[j]>=-4.2&&zs[j+1]<=0,poly=[[xs[i],zs[j]],[xs[i+1],zs[j]],[xs[i+1],zs[j+1]],[xs[i],zs[j+1]]].map(([x,z])=>[x,z,active?(4.8+2*(1-Math.abs(z)/4.2))-(4.8+.95*(1-Math.abs(x)/3.2)):1]),parts=active?[clipped(poly,true),clipped(poly,false)]:[poly];for(const part of parts){if(part.length<3)continue;const pts=part.map(([x,z])=>[x,height(x,z)+offset,z]);for(let k=1;k<pts.length-1;k++){if(new T.Triangle(new T.Vector3(...pts[0]),new T.Vector3(...pts[k]),new T.Vector3(...pts[k+1])).getArea()<1e-10)continue;tri(top,pts[0],pts[k],pts[k+1],[0,1,0])}}}
   const v=[...top],lower=a=>[a[0],bottom===null?a[1]-.14:bottom,a[2]];for(let i=0;i<top.length;i+=9){const q=[top.slice(i,i+3),top.slice(i+3,i+6),top.slice(i+6,i+9)];tri(v,...q.map(lower),[0,-1,0]);for(let k=0;k<3;k++){const a=q[k],b=q[(k+1)%3],id=[key(a),key(b)].sort().join('|');if(edges.has(id))edges.delete(id);else edges.set(id,[a,b])}}for(const[a,b]of edges.values())quad(v,a,lower(a),lower(b),b,[-(b[2]-a[2]),0,b[0]-a[0]]);return mesh(role,v,name,color)};
  solid('continuous-thick-composite-roof-fit',inside,0,null,'roof_tile',yellow);
  // The intersection split makes these the exact same piecewise planes as
  // the actual roof triangles. Tests compare the real ray-hit underside.
  const sample=height;
  for(const[role,j]of[['main-front-bearing',3],['main-rear-bearing',8]])solid(role,(i,k)=>i>=1&&i<xs.length-2&&k===j,-.12,4.35,'caihua_beam',green);
  const end=[[-2.6,4.43],[-2.6,sample(8.4,-2.6)-.12],...zs.filter(z=>z>-2.6&&z<3.3).map(z=>[z,sample(8.4,z)-.12]),[3.3,sample(8.4,3.3)-.12],[3.3,4.43]];
  prism('closed-main-end-bearing',-8.45,-8.15,end,'wall_red',red);prism('closed-main-end-bearing',8.15,8.45,end,'wall_red',red);
  const front=[[-2.6,4.50],[-2.6,sample(-2.6,-6.25)-.12],...xs.filter(x=>x>-2.6&&x<2.6).map(x=>[x,sample(x,-6.25)-.12]),[2.6,sample(2.6,-6.25)-.12],[2.6,4.50]];
  prism('closed-front-projection-gable-bearing',-6.35,-6.15,front,'wall_red',red,true);
  f.updateWorldMatrix(true,true);const bound=new T.Box3().setFromObject(f),reserve=new T.Box3(new T.Vector3(...p.reserve.slice(0,3)),new T.Vector3(...p.reserve.slice(3)));reserve.min.y=-1e-6;if(!reserve.containsBox(bound))throw Error('Zhongzheng escaped exact fitted reserve');
  kit.root.traverse(m=>{if(m.isMesh&&bound.intersectsBox(new T.Box3().setFromObject(m)))throw Error('Zhongzheng intersects old actual mesh')});if(kit.colliders.some(c=>bound.intersectsBox(c)))throw Error('Zhongzheng intersects old contact');
  let ordinal=0;f.traverse(m=>{if(!m.isMesh)return;const b=new T.Box3().setFromObject(m);b.zhongzhengMainMesh=m.uuid;if(m.userData.zhongzhengMainStone){colliders.push(b);const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false})}else{const support=triangleInstance(createTriangleTemplate(m.geometry),f.position.toArray(),ID+'/'+ordinal++),c=support.box.clone();c.triangleSupport=support;c.zhongzhengMainMesh=m.uuid;colliders.push(c)}});
  const meta={id:ID,name:'中正殿',sourceObjectId:'FC-66378DAD81',source:'https://www.dpm.org.cn/Uploads/File/2021/08/24/u6124c44d8868f.pdf',sourcePublication:'紫禁城2021年第8期 罗文华《中正殿区域的佛殿》',sourcePages:['print20 named compound photograph','print21 three bays, one depth and front baoxia'],reconstructionSource:'https://www.dpm.org.cn/classify_detail/181812.html',relativePositionSource:'https://www.dpm.org.cn/learing_detail/261960.html',bays:3,depthBays:1,frontProjection:true,front:'SOUTH',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,historicalPlatformConnected:false,sourceSupported:['three-bay one-depth main hall with front baoxia','main hall north of Xiangyun/Baohua and south of Danyuan','reconstructed after the 1923 fire, completion reported in 2012'],fitted:['absolute position, south orientation and all dimensions','continuous thick composite two-slope roof classification and hidden closure','coarse colors, closed door/window pattern, front posts and four low steps','standalone wall-north access through existing Jianfu gate bypass'],unknown:['surveyed dimensions, complete current roof/facade/paint details and interior','historical platform connection is absent, retained transverse wall blocks direct axis','current admission and exact historical stair configuration'],excluded:['changing old walls or building the unverified historic platform connection','invented interior, statues, plaque inscription, room/map/teleport','whole-court/photo/GPU/mobile/performance acceptance'],newRooms:0,newMapItems:0,newTeleportTargets:0};f.userData.structure=meta;
  const lengths={colliders:kit.colliders.length,walkables:kit.walkables.length,owned:kit.owned.length};try{kit.root.add(f);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);published=true}catch(e){f.removeFromParent();for(const[k,n]of Object.entries(lengths))kit[k].length=n;throw e}return{frame:f,meta};
 }finally{if(!published){for(const g of geometries)g.dispose();for(const m of materials)m.dispose()}}
}
