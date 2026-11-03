import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='ninghui-hall',done=new WeakSet();
const GATE={kind:'gate',name:'建福门',x:183.7,z:409.4};
const HALL={kind:'hall',name:'延春阁',x:216,z:485.5,w:23.5,d:24.3,pad:.8,ph:.75,colH:10.24,roof:'pavilion',layers:2};
const COURT={kind:'courtWalls',x0:178.6,x1:245,z0:409.4,z1:520,gates:[{side:'s',at:183.7,gate:'建福门'}]};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function guard(kit,zone){const r=kit?.root,find=(kind,name)=>zone.items?.filter(i=>i.kind===kind&&i.name===name)??[];let exists=false;r?.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-7463C11B05')exists=true;});if(!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||done.has(kit)||exists||find('gate','建福门').length!==1||!same(find('gate','建福门')[0],GATE)||find('hall','延春阁').length!==1||!same(find('hall','延春阁')[0],HALL)||zone.items?.filter(i=>same(i,COURT)).length!==1)throw Error('Exact original mutable untransformed Ninghui host required, once only');}

function geometry(v){const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3)),uv=[];for(let i=0;i<v.length;i+=3)uv.push(v[i]/1.2,v[i+2]/1.2);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
function rollRoof(){const sets=[[],[],[]],nx=16,nz=20,hz=3.55,cut=.6,hx=t=>t<=cut?4.5:4.5+(t-cut)/(1-cut)*1.45,Y=t=>4.85+1.1*Math.pow(Math.max(0,Math.cos(t*Math.PI/2)),1.3),point=(u,z)=>[hx(Math.abs(z)/hz)*u,Y(Math.abs(z)/hz),z],low=p=>[p[0],p[1]-.14,p[2]],tri=(v,a,b,c)=>v.push(...a,...b,...c),quad=(v,a,b,c,d)=>{tri(v,a,b,c);tri(v,a,c,d);},cell=(v,q)=>{quad(v,...q);quad(sets[2],...q.map(low).toReversed());for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4];quad(v,a,low(a),low(b),b);}};
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=-hz+2*hz*j/nz,b=-hz+2*hz*(j+1)/nz,u=-1+2*i/nx,U=-1+2*(i+1)/nx;cell(sets[i===0||i===nx-1||j===0||j===nz-1?1:0],[point(u,a),point(u,b),point(U,b),point(U,a)]);}
 for(const sign of[-1,1])for(let i=0;i<8;i++)for(let j=0;j<8;j++){const t=cut+(1-cut)*j/8,T=cut+(1-cut)*(j+1)/8,u=-1+2*i/8,U=-1+2*(i+1)/8,p=(t,u)=>[sign*hx(t),Y(t),u*t*hz],q=[p(t,u),p(t,U),p(T,U),p(T,u)];cell(sets[i===0||i===7||j===7?1:0],sign>0?q:q.toReversed());}
 return{geometries:sets.map(geometry),Y,hz,cut};
}
/** Own figure20 plus an official reconstruction proposal, not surveyed original
 * joinery, a NingShou Sanyouxuan replica or present public admission. */
export function buildNinghuiHall(kit,zone){
 if(zone?.id!=='outer-west')return false;guard(kit,zone);
 const s=new CourtKit(kit.lib,'outer-west'),cache=new Map();let f,meta;
 const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_ninghui_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);s.owned.push(m);}return cache.get(key);};
 try{
  for(const n of['stone_slab','wall_red','wall_brick','wood_column','caihua_beam','roof_tile','rafters'])material(n);
  f=s.frame(238,469,Math.PI/2);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=s.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color,stone=false)=>{const q=mesh(role,applyBoxUV(new T.BoxGeometry(w,h,d),kit.lib.tileSize(name)),material(name,color),x,y,z);if(stone)q.userData.ninghuiStoneTop=role;return q;};
  const red=0x973f30,green=0x2f6a50,grey=0xb8c3ae,dark=0x253b32;
  box('real-stone-platform-fit','stone_slab',11.6,.6,7.4,0,.3,0,undefined,true);
  for(let i=1;i<=3;i++)box('real-central-stair-fit','stone_slab',3,.15*i,.8,0,.075*i,-6.5+.8*i,undefined,true);
  box('closed-unseen-rear-fit','wall_red',10.8,4.15,.26,0,2.675,2.87,red);
  for(const x of[-5.27,5.27])box('closed-unseen-side-fit','wall_red',.26,4.15,4.1,x,2.675,.8,red);
  for(const x of[-5.4,-1.8,1.8,5.4]){mesh('red-veranda-column-fit',new T.CylinderGeometry(.14,.18,4.1,12),material('wood_column',red),x,2.65,-3);box('red-facade-bay-post-fit','wood_column',.17,3.7,.25,x,2.45,-1.25,red);box('real-veranda-depth-beam-fit','wood_column',.22,.23,1.75,x,4.585,-2.125,red);}
  box('closed-green-middle-door-fit','wood_column',3.36,3.65,.18,0,2.425,-1.25,green);
  for(const x of[-.84,.84]){box('pale-closed-middle-screen-fit','wood_column',1.47,2.25,.035,x,2.91,-1.365,0xb8b69c);box('red-lower-door-field-fit','wood_column',1.47,1.02,.035,x,1.23,-1.365,0x7f3f2e);for(const dx of[-.77,.77])box('green-door-leaf-border-fit','wood_column',.065,3.55,.065,x+dx,2.425,-1.4,green);for(const y of[.66,1.77,4.2])box('green-door-cross-frame-fit','wood_column',1.6,.065,.065,x,y,-1.4,green);}
  for(const c of[-3.6,3.6]){
   box('side-window-masonry-sill-fit','wall_brick',3.35,.7,.3,c,.95,-1.25);
   box('side-sill-window-group-fit','wood_column',3.32,2.9,.17,c,2.75,-1.25,green);
   for(const dx of[-.8,.8])for(const[y,h,col]of[[1.97,1.2,grey],[3.45,1.1,dark]]){
    const x=c+dx;box('green-window-field-fit','wood_column',1.44,h,.035,x,y,-1.365,col);
    for(const inset of[0,.15]){const w=1.38-2*inset,H=h-.06-2*inset;for(const sign of[-1,1]){box('stepped-rectangular-lattice-fit','wood_column',.035,H,.035,x+sign*w/2,y,-1.395,green);box('stepped-rectangular-lattice-fit','wood_column',w,.035,.035,x,y+sign*H/2,-1.395,green);}}
    box('stepped-rectangular-lattice-fit','wood_column',.035,h,.035,x,y,-1.395,green);
   }
   for(const dx of[-1.68,0,1.68])box('red-window-major-frame-fit','wood_column',.085,3.06,.085,c+dx,2.75,-1.42,red);
   for(const y of[1.23,2.69,4.25])box('red-window-major-frame-fit','wood_column',3.45,.085,.085,c,y,-1.42,red);
  }
  box('front-painted-beam-fit','caihua_beam',11,.31,.3,0,4.545,-3);
  box('inner-painted-header-fit','caihua_beam',10.8,.27,.22,0,4.39,-1.35);
  // Actual low stone balustrade. Central stair aperture remains body-clear.
  for(const[a,b]of[[-5.65,-1.35],[1.65,5.65]]){for(const y of[.8,1.43])box('white-stone-front-rail-fit','stone_slab',b-a,.12,.16,(a+b)/2,y,-3.4,0xd9d9c9);for(let i=1;i<7;i++)box('white-stone-front-baluster-fit','stone_slab',.065,.54,.1,a+(b-a)*i/7,1.12,-3.4,0xd9d9c9);for(const x of[a,b]){box('white-stone-real-rail-post-fit','stone_slab',.19,.96,.2,x,1.08,-3.4,0xd9d9c9);mesh('plain-stone-post-cap-fit',new T.SphereGeometry(.13,8,6),material('stone_slab',0xd9d9c9),x,1.6,-3.4);}}
  const r=rollRoof(),[yellow,edge,under]=r.geometries;
  const top=mesh('thick-yellow-roll-roof-fit',yellow,material('roof_tile')),ed=mesh('thick-green-roll-roof-edge-fit',edge,material('roof_tile',0x3d7857)),bottom=mesh('thick-painted-roof-underside-fit',under,material('rafters'));f.updateWorldMatrix(true,true);
  const underRoof=(x,z)=>{const origin=f.localToWorld(new T.Vector3(x,4.35,z)),hit=new T.Raycaster(origin,new T.Vector3(0,1,0)).intersectObject(bottom,false)[0];if(!hit)throw Error('Actual Ninghui roof underside missing');return hit.point.y;};
  for(const x of[-5.4,-1.8,1.8,5.4]){const h=underRoof(x,-3)-4.7;if(h<=0)throw Error('Unsupported Ninghui front roof');box('real-roof-bearing-fit','wood_column',.21,h,.21,x,4.7+h/2,-3,red);}
  // Thick upper gable faces and all profiled attic infill use real roof contacts.
  const mid=r.cut*r.hz,base=r.Y(r.cut)-.14,poly=[[-mid,base]];for(let i=1;i<=24;i++){const z=-mid+2*mid*i/24;poly.push([-z,r.Y(Math.abs(z)/r.hz)-.14]);}poly.sort((a,b)=>a[0]-b[0]);const outline=[[-mid,base],...poly.filter(p=>p[0]>-mid+1e-7&&p[0]<mid-1e-7),[mid,base]];
  const gableShape=new T.Shape();gableShape.moveTo(outline[0][0],outline[0][1]);for(const p of outline.slice(1))gableShape.lineTo(...p);gableShape.closePath();
  for(const sign of[-1,1]){const q=mesh('real-thick-upper-gable-closure-fit',new T.ExtrudeGeometry(gableShape,{depth:.14,bevelEnabled:false}),material('wood_column',red),sign>0?4.36:-4.5,0,0);q.rotation.y=Math.PI/2;}
  const prof=(axis,at,start,end)=>{const points=[];for(let i=0;i<=24;i++){const u=start+(end-start)*i/24,x=axis==='x'?u:at,z=axis==='x'?at:u;points.push([axis==='x'?u:-u,underRoof(x,z)]);}points.sort((a,b)=>a[0]-b[0]);const contour=[[points[0][0],4.36],[points.at(-1)[0],4.36],...points.toReversed()],shape=new T.Shape(contour.map(p=>new T.Vector2(...p))),q=mesh('real-profiled-attic-closure-fit',new T.ExtrudeGeometry(shape,{depth:.22,bevelEnabled:false}),material('wall_red',red),axis==='x'?0:at-.11,0,axis==='x'?at-.11:0);if(axis==='z')q.rotation.y=Math.PI/2;};
  for(const z of[-1.25,2.85])prof('x',z,-5.4,5.4);for(const x of[-5.4,5.4])prof('z',x,-1.25,2.85);
  // Remove only factory zero-area triangles in this new copy. No shared roof
  // source or retained instance is changed, nor is any positive-area face cut.
  f.traverse(m=>{if(!m.isMesh)return;if(!m.name.startsWith(ID+'/'))m.name=ID+'/roof-shell-fit/'+m.name;if(!m.material.name.startsWith('r163_ninghui_'))m.material.name='r163_ninghui_roof_'+(m.material.name||m.material.type);const g=m.geometry,p=g.attributes.position,ix=g.index,rows=[];for(let i=0;i<(ix?.count??p.count);i+=3){const js=[0,1,2].map(j=>ix?.getX(i+j)??i+j),v=js.map(j=>new T.Vector3().fromBufferAttribute(p,j));if(new T.Triangle(...v).getArea()>1e-12)rows.push(...js);}if(rows.length===(ix?.count??p.count))return;const q=new T.BufferGeometry();for(const[key,a]of Object.entries(g.attributes)){const values=[];for(const j of rows)for(let c=0;c<a.itemSize;c++)values.push(a.array[j*a.itemSize+c]);q.setAttribute(key,new T.BufferAttribute(new a.array.constructor(values),a.itemSize,a.normalized));}m.geometry=q;g.dispose();});
  f.updateWorldMatrix(true,true);let n=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.ninghuiStoneTop){const b=new T.Box3().setFromObject(m);b.ninghuiStoneTop=m.userData.ninghuiStoneTop;b.ninghuiMesh=m.uuid;if(m.userData.ninghuiExtraSkin)b.ninghuiExtraSkin=true;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});return;}
   const v=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...q).getArea()>1e-12)v.push(...q.flatMap(p=>p.toArray()));}if(!v.length)throw Error('Empty Ninghui owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const t=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+n+++'/'+m.name.slice(ID.length+1)),b=t.box.clone();b.triangleSupport=t;b.ninghuiMesh=m.uuid;if(m.userData.ninghuiExtraSkin)b.ninghuiExtraSkin=true;s.colliders.push(b);}finally{g.dispose();}
  });
  const bounds=new T.Box3().setFromObject(f);if(!new T.Box3(new T.Vector3(231.6,-1e-6,462.7),new T.Vector3(242,8,475.3)).containsBox(bounds))throw Error('Ninghui escaped actual clear reserve '+JSON.stringify(bounds));
  meta={id:ID,sourceObjectId:'FC-7463C11B05',originalOrdinal:25,sourceLine:672,name:'凝晖堂可走前廊外观',front:'EAST_MODEL_NEGATIVE_X',bayGrid:[3,1],roof:'YELLOW_GREEN_HIPPED_GABLE_ROLL_FIT',eaveCount:1,sourceFigure:20,sourcePrintedPage:365,sourceFilePage:13,wholeObjectAccepted:false,sanyouxuanInteriorComplete:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,admission:'CLOSED_INTERIOR_EXTERIOR_STAIR_VERANDA_ONLY',phase:'OFFICIAL_RECONSTRUCTION_PROPOSAL_AND_UNDATED_EXTERIOR_FIT',source:'https://www.dpm.org.cn/lemmas/242214.html',ownPhotoPDF:'https://www.dpm.org.cn/Uploads/File/2020/03/27/u5e7db6f5d6c90.pdf#page=13',photoPDFSHA256:'4b529156c251ff40108f82a07f7b3d29e7878481bde82b1aeb608f2e89dea071',restoration:'https://www.dpm.org.cn/Uploads/pdf/3016/T00037_00.pdf',restorationItem:8,restorationSHA256:'5bd07b9ff3a95a07a4fc9635b91cd20bc932e9d74dee20fc5f5ba7c048a70692',sourceSupported:['official three east-facing bays; south roomSanyouxuan is not a separate building','own figure20: red columns/frames, green geometric windows, painted low eave, stone veranda/white balustrade/central stair','official reconstruction item8: three across/one deep/front porch, hipped-gable roll roof, yellow tile/green edge, stepped lattice and partition doors'],fit:['all coordinates/10.8mwidth/6mdepth, .6mplatform/four .15rises and railing/member/panel counts','closed thick rolled roof cells/upper gable and profiled unseen infill; plain reconstructed roof curves/edges and color approximations','closed central screen pose, coarse rectangular stepped lattice, stone rail/post caps and common painted-beam atlas, not exact carving/paint'],excluded:['NingshouSanyouxuan figures15–18, full south-room/interior or original religious/furniture inventory','guessed inscriptions/planting/sculpture/rooms/teleports or public admission','Bilin/Jicui/Yanchun or old walls/controls/physics changes, upload/main/Pages'],unknown:['survey/current complete facade dimensions, exact roof joinery,6purlin/bracket inventory and paint/carving','unseen back/interior/current public opening/photo capture date','GPU/browser/mobile/all-streaming and whole-item acceptance']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 kit.root.add(f);kit.colliders.push(...s.colliders);kit.walkables.push(...s.walkables);kit.owned.push(...s.owned);done.add(kit);return{frame:f,meta};
}
