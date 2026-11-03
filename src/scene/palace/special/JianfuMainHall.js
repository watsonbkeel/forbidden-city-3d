import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='jianfu-main-hall',done=new WeakSet();
const GATE={kind:'gate',name:'建福门',x:183.7,z:409.4};
const HALL={kind:'hall',name:'延春阁',x:216,z:485.5,w:23.5,d:24.3,pad:.8,ph:.75,colH:10.24,roof:'pavilion',layers:2};
const COURT={kind:'courtWalls',x0:178.6,x1:245,z0:409.4,z1:520,gates:[{side:'s',at:183.7,gate:'建福门'}]};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function guard(kit,zone){const r=kit?.root,find=(kind,name)=>zone.items?.filter(i=>i.kind===kind&&i.name===name)??[];let exists=false;r?.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-255E648E8D')exists=true;});if(!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||done.has(kit)||exists||find('gate','建福门').length!==1||!same(find('gate','建福门')[0],GATE)||find('hall','延春阁').length!==1||!same(find('hall','延春阁')[0],HALL)||zone.items?.filter(i=>same(i,COURT)).length!==1)throw Error('Exact original mutable untransformed Jianfu main host required, once only');}

function geometry(v){const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3)),uv=[];for(let i=0;i<v.length;i+=3)uv.push(v[i]/1.2,v[i+2]/1.2);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
function rollRoof(){const sets=[[],[],[]],nx=16,nz=20,hz=6.15,cut=.6,hx=t=>t<=cut?4.5:4.5+(t-cut)/(1-cut)*1.45,Y=t=>5.1+1.4*Math.pow(Math.max(0,Math.cos(t*Math.PI/2)),1.3),point=(u,z)=>[hx(Math.abs(z)/hz)*u,Y(Math.abs(z)/hz),z],low=p=>[p[0],p[1]-.14,p[2]],tri=(v,a,b,c)=>v.push(...a,...b,...c),quad=(v,a,b,c,d)=>{tri(v,a,b,c);tri(v,a,c,d);},cell=(v,q)=>{quad(v,...q);quad(sets[2],...q.map(low).toReversed());for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4];quad(v,a,low(a),low(b),b);}};
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=-hz+2*hz*j/nz,b=-hz+2*hz*(j+1)/nz,u=-1+2*i/nx,U=-1+2*(i+1)/nx;cell(sets[i===0||i===nx-1||j===0||j===nz-1?1:0],[point(u,a),point(u,b),point(U,b),point(U,a)]);}
 for(const sign of[-1,1])for(let i=0;i<8;i++)for(let j=0;j<8;j++){const t=cut+(1-cut)*j/8,T=cut+(1-cut)*(j+1)/8,u=-1+2*i/8,U=-1+2*(i+1)/8,p=(t,u)=>[sign*hx(t),Y(t),u*t*hz],q=[p(t,u),p(t,U),p(T,U),p(T,u)];cell(sets[i===0||i===7||j===7?1:0],sign>0?q:q.toReversed());}
 return{geometries:sets.map(geometry),Y,hz,cut};
}
/** Official 3x3 yellow/green rolled hipped-gable main hall behind blue Fuchen.
 * Group panorama and text fit only, never the nine-bay Jingsheng facade. */
export function buildJianfuMainHall(kit,zone){
 if(zone?.id!=='outer-west')return false;guard(kit,zone);
 const s=new CourtKit(kit.lib,'outer-west'),cache=new Map();let f,meta;
 const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_jianfu_main_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);s.owned.push(m);}return cache.get(key);};
 try{
  for(const n of['stone_slab','wall_red','wall_brick','wood_column','caihua_beam','roof_tile','rafters'])material(n);
  f=s.frame(187.5,449.5,0);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=s.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color,stone=false)=>{const m=material(name,color),tile=kit.lib.tileSize(name),q=mesh(role,applyBoxUV(new T.BoxGeometry(w,h,d),tile),m,x,y,z);if(stone)q.userData.jianfuMainStoneTop=role;return q;};
  const red=0x973d2f,green=0x3c7053,black=0x292d28,gold=0xb7a067,paper=0x8d927c;
  box('real-three-deep-stone-platform-fit','stone_slab',11.8,.6,12,0,.3,0,undefined,true);
  for(const sign of[-1,1])for(let i=1;i<=3;i++)box('real-front-back-central-step-fit','stone_slab',3,.15*i,.7,0,.075*i,sign*(8.45-.7*i),undefined,true);
  for(const x of[-4.97,4.97])box('closed-unseen-three-depth-side-fit','wall_red',.26,4.2,8.06,x,2.7,0,red);
  // Four depth-grid column lines make the fitted three-deep side legible.
  for(const x of[-5.1,5.1])for(const z of[-3.9,-1.3,1.3,3.9])box('three-depth-side-bay-post-fit','wood_column',.2,3.65,.18,x,2.425,z,red);
  const line=(x1,y1,x2,y2,z)=>{const dx=x2-x1,dy=y2-y1,q=box('coarse-three-direction-diamond-grid-fit','wood_column',Math.hypot(dx,dy),.025,.035,(x1+x2)/2,(y1+y2)/2,z,gold);q.rotation.z=Math.atan2(dy,dx);};
  for(const sign of[-1,1]){
   const plane=sign*3.9,outer=sign*4.035;
   box('closed-front-back-upper-header-fit','wall_red',10.4,.55,.26,0,4.525,plane,red);
   for(const x of[-1.2,-.4,.4,1.2]){
    box('four-central-closed-door-leaf-fit','wood_column',.8,3.65,.16,x,2.425,plane,black);
    box('door-upper-muted-field-fit','wood_column',.67,2.2,.035,x,3.02,outer,paper);box('black-door-low-panel-fit','wood_column',.67,1.12,.035,x,1.27,outer,black);
    for(const dx of[-.37,.37])box('gold-door-leaf-frame-fit','wood_column',.04,3.55,.04,x+dx,2.425,outer+sign*.025,gold);for(const y of[.66,1.85,4.19])box('gold-door-leaf-frame-fit','wood_column',.76,.04,.04,x,y,outer+sign*.025,gold);
    for(const y of[-1.08,-.54,0,.54,1.08])line(x-.33,3.02+y,x+.33,3.02+y,outer+sign*.035);
    for(const k of[-Math.sqrt(3),Math.sqrt(3)])for(const b of[-1.5,-.9,-.3,.3,.9,1.5]){const ends=[(-1.1-b)/k,(1.1-b)/k].sort((a,b)=>a-b),lo=Math.max(-.33,ends[0]),hi=Math.min(.33,ends[1]);if(hi-lo>.01)line(x+lo,3.02+k*lo+b,x+hi,3.02+k*hi+b,outer+sign*.035);}
   }
   for(const c of[-3.4,3.4]){
    if(sign>0){box('rear-side-brick-wall-fit','wall_brick',3.2,3.65,.28,c,2.425,plane);continue;}
    box('front-window-masonry-sill-fit','wall_brick',3.2,.7,.3,c,.95,plane);
    box('front-side-sill-window-fit','wood_column',3.2,2.95,.16,c,2.775,plane,black);
    for(const dx of[-.8,.8]){const x=c+dx;box('front-window-muted-field-fit','wood_column',1.46,2.8,.035,x,2.775,outer,paper);for(const q of[-.72,-.36,0,.36,.72])box('front-window-coarse-grid-fit','wood_column',.03,2.8,.04,x+q,2.775,outer-.035,gold);for(const y of[1.38,2.08,2.78,3.48,4.17])box('front-window-coarse-grid-fit','wood_column',1.48,.03,.04,x,y,outer-.035,gold);}for(const dx of[-1.6,0,1.6])box('black-window-group-frame-fit','wood_column',.075,3.05,.05,c+dx,2.775,outer-.06,black);
   }
   for(const x of[-5.1,-1.7,1.7,5.1]){
    mesh('red-front-back-veranda-column-fit',new T.CylinderGeometry(.14,.18,3.8,12),material('wood_column',red),x,2.5,sign*5.6);
    box('red-inner-facade-bay-post-fit','wood_column',.2,3.65,.26,x,2.425,plane,red);box('real-veranda-depth-beam-fit','wood_column',.2,.23,1.7,x,4.5,sign*4.75,red);
    box('simple-bracket-seat-fit','wood_column',.34,.12,.42,x,4.46,sign*5.6,green);box('simple-bracket-cross-arm-fit','wood_column',.58,.1,.3,x,4.56,sign*5.6,red);box('simple-bracket-cross-arm-fit','wood_column',.28,.1,.64,x,4.65,sign*5.6,green);
   }
   box('front-back-painted-eave-beam-fit','caihua_beam',10.45,.24,.32,0,4.82,sign*5.6);box('front-back-inner-painted-lintel-fit','caihua_beam',10.2,.24,.24,0,4.3,plane);
  }
  const topMat=material('roof_tile'),edgeMat=material('roof_tile',green),underMat=material('rafters'),r=rollRoof();mesh('yellow-roll-roof-fit',r.geometries[0],topMat);mesh('green-roll-roof-edge-fit',r.geometries[1],edgeMat);const bottom=mesh('real-roll-roof-underside-fit',r.geometries[2],underMat);f.updateWorldMatrix(true,true);
  const underRoof=(x,z)=>{const origin=f.localToWorld(new T.Vector3(x,4.7,z)),hit=new T.Raycaster(origin,new T.Vector3(0,1,0)).intersectObject(bottom,false)[0];if(!hit)throw Error('Actual Jianfu main thick roll underside missing '+JSON.stringify({x,z}));return hit.point.y;};
  for(const z of[-5.6,5.6])for(const x of[-5.1,-1.7,1.7,5.1]){const h=underRoof(x,z)-4.94;if(h<=0)throw Error('Jianfu main porch bearing gap');box('real-porch-roof-bearing-fit','wood_column',.2,h,.2,x,4.94+h/2,z,red);}
  // Select the central roll underside inside its shared hip boundary, not the
  // lower hip at x=4.5. Both real thick end faces close the high gable.
  const mid=r.cut*r.hz,ends=[];for(let i=0;i<=24;i++){const z=-mid+2*mid*i/24;ends.push([-z,underRoof(4.45,z)]);}ends.sort((a,b)=>a[0]-b[0]);const gable=new T.Shape(ends.map(p=>new T.Vector2(...p)));
  for(const sign of[-1,1]){const q=mesh('real-thick-upper-roll-gable-fit',new T.ExtrudeGeometry(gable,{depth:.14,bevelEnabled:false}),material('wood_column',red),sign>0?4.36:-4.5,0,0);q.rotation.y=Math.PI/2;}
  const prof=(axis,at,start,end)=>{const points=[];for(let i=0;i<=24;i++){const u=start+(end-start)*i/24,x=axis==='x'?u:at,z=axis==='x'?at:u;points.push([axis==='x'?u:-u,underRoof(x,z)]);}points.sort((a,b)=>a[0]-b[0]);const contour=[[points[0][0],4.6],[points.at(-1)[0],4.6],...points.toReversed()],shape=new T.Shape(contour.map(p=>new T.Vector2(...p))),q=mesh(axis==='z'?'real-profiled-attic-side-closure-fit':'real-profiled-attic-front-back-closure-fit',new T.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:false}),material('wall_red',red),axis==='x'?0:at-.12,0,axis==='x'?at-.12:0);if(axis==='z')q.rotation.y=Math.PI/2;};
  for(const z of[-3.9,3.9])prof('x',z,-5.1,5.1);for(const x of[-5.1,5.1])prof('z',x,-3.9,3.9);
  // Only remove zero-area faces introduced in this new extrusion/cell copy.
  f.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,p=g.attributes.position,ix=g.index,rows=[];for(let i=0;i<(ix?.count??p.count);i+=3){const js=[0,1,2].map(j=>ix?.getX(i+j)??i+j),v=js.map(j=>new T.Vector3().fromBufferAttribute(p,j));if(new T.Triangle(...v).getArea()>1e-12)rows.push(...js);}if(rows.length===(ix?.count??p.count))return;const q=new T.BufferGeometry();for(const[key,a]of Object.entries(g.attributes)){const values=[];for(const j of rows)for(let c=0;c<a.itemSize;c++)values.push(a.array[j*a.itemSize+c]);q.setAttribute(key,new T.BufferAttribute(new a.array.constructor(values),a.itemSize,a.normalized));}m.geometry=q;g.dispose();});
  f.updateWorldMatrix(true,true);let n=0;f.traverse(m=>{if(!m.isMesh)return;if(m.userData.jianfuMainStoneTop){const b=new T.Box3().setFromObject(m);b.jianfuMainStoneTop=m.userData.jianfuMainStoneTop;b.jianfuMainMesh=m.uuid;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});return;}const v=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...q).getArea()>1e-12)v.push(...q.flatMap(p=>p.toArray()));}if(!v.length)throw Error('Empty Jianfu main physical owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const t=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+n+++'/'+m.name.slice(ID.length+1)),b=t.box.clone();b.triangleSupport=t;b.jianfuMainMesh=m.uuid;s.colliders.push(b);}finally{g.dispose();}});
  if(!new T.Box3(new T.Vector3(181.3,-1e-6,441.2),new T.Vector3(193.7,9,457.8)).containsBox(new T.Box3().setFromObject(f)))throw Error('Jianfu main escaped actual clear compact reserve');
  meta={id:ID,sourceObjectId:'FC-255E648E8D',originalOrdinal:12,sourceLine:659,name:'建福宫正殿三间三进深外观拟合',front:'SOUTH_MODEL_ZERO',bayGrid:[3,3],roof:'YELLOW_GREEN_HIPPED_GABLE_ROLL_FIT',porchFaces:2,centralDoorLeavesPerFace:4,frontSideFields:'SILL_WINDOWS',rearSideFields:'BRICK_WALLS',wholeObjectAccepted:false,currentAdmissionVerified:false,interiorComplete:false,rearAndSideGalleriesComplete:false,newRooms:0,newMapItems:0,dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',admission:'CLOSED_CORE_REAL_EXTERIOR_FRONT_BACK_PORCHES_ONLY',source:'https://www.dpm.org.cn/explore/building/236524.html',ownOverviewPDF:'https://www.dpm.org.cn/Uploads/File/2021/08/24/u6124c44d8868f.pdf#page=41',pdfSHA256:'478fba0f0b61ae285de829266047491b908bbda6cb107fa6165a88d60b84b9b4',printedPage:54,filePage:41,sourceSupported:['official main hall3across/3deep yellow glazed tile/green trim rolled hipped-gable and eave brackets','front/rear central four closed diamond-lattice partition leaves; front side sill windows and rear side brick walls','official compound south-to-north overview: yellow main hall behind blue Fuchen, not9bay Jingsheng'],fit:['all coordinates/10.2x7.8mclosed core and depth grid,1.7mfront-back porches/11.9x12.3mroof','0.6mstone platform/four0.15rises each side, simplified bracket counts/roof curves/hidden attic and ends','red columns/common painted beam atlas, coarse three-direction lattice/black-gold door palette and unreadable fine joinery, rear brick color'],excluded:['Jingsheng own facade photo substitution, unknown full rear/front photo fidelity or five-bay claims','interior throne/bu-wei-wu-xian plaque/kang/partitions/paper/inventory, exterior invented text','unverified9bay side galleries/court walls/rooms/teleports, old structures/controls/physics changes, upload/main/Pages'],unknown:['surveyed measures/current full facade detail/door lattice and original construction count','unseen side-back surfaces/interior/current real admission/whole item acceptance','GPU/PBR/browser/mobile/all streaming/all historical tests']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 kit.root.add(f);kit.colliders.push(...s.colliders);kit.walkables.push(...s.walkables);kit.owned.push(...s.owned);done.add(kit);return{frame:f,meta};
}
