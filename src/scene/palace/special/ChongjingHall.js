import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {fitCanopyToMainRoof} from './CanopyRoofSurfaceJoint.js';
const ID='chongjing-hall',done=new WeakSet();
const GATE={kind:'gate',name:'重华门',x:120.2,z:460};
const HALL={kind:'hall',name:'重华宫',x:118.9,z:498.3,w:21.5,d:8.6,pad:1,ph:.75,colH:5.49,roof:'xieshan',enter:true,throne:true};
const COURT={kind:'courtWalls',x0:92.62,x1:145.18,z0:460,z1:505.6,gates:[{side:'s',at:120.2,gate:'重华门'}],source:'estimated'};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone){const r=kit?.root;let exists=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-ED17D936A5')exists=true;});if(!r||r.name!=='west-six'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(kit)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||(kit.ownedTextures&&!mutable(kit.ownedTextures))||zone.items?.filter(i=>same(i,GATE)).length!==1||zone.items?.filter(i=>same(i,HALL)).length!==1||zone.items?.filter(i=>same(i,COURT)).length!==1||exists||done.has(kit))throw Error('Exact mutable untransformed Chongjing front-court host required, once only');}
/** Source-supported topology/photo features, dimensions and unseen faces fitted.
 * This separate first-court hall does not replace the existing middle hall.
 * Closed exterior only: no Leshantang room/inventory/admission completion. */
export function buildChongjingHall(kit,zone){
 if(zone?.id!=='west-six')return false;validateHost(kit,zone);
 const s=new CourtKit(kit.lib,'west-six'),cache=new Map();let f,meta;
 const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_chongjing_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);s.owned.push(m);}return cache.get(key);};
 try{
  f=s.frame(120,478.4);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=s.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color,stone=false)=>{const q=mesh(role,applyBoxUV(new T.BoxGeometry(w,h,d),kit.lib.tileSize(name)),material(name,color),x,y,z);if(stone)q.userData.chongjingStoneTop=role;return q;};
  box('real-main-stone-platform-fit','stone_slab',23.4,.6,12.8,0,.3,0,undefined,true);
  box('real-baoxia-stone-platform-fit','stone_slab',14.4,.6,3.2,0,.3,-8,undefined,true);
  for(let i=1;i<=3;i++)box('real-central-stair-fit','stone_slab',4.2,.15*i,.8,0,.075*i,-12.4+.8*i,undefined,true);
  const red=0x943d32,green=0x395c53,glaze=0x718e8a,dark=0x1c3537;
  box('closed-unseen-rear-fit','wall_red',22,5.6,.28,0,3.4,5.56,0x9b493b);
  for(const x of[-10.86,10.86])box('closed-unseen-side-fit','wall_red',.28,5.6,11.4,x,3.4,0,0x9b493b);
  box('closed-front-attic-header-fit','wall_red',22,1.35,.24,0,5.525,-5.7,red);
  for(const x of[-11,-6.6,-2.2,2.2,6.6,11]){mesh('main-red-front-column-fit',new T.CylinderGeometry(.18,.21,5.4,12),material('wood_column',red),x,3.3,-5.7);box('front-wall-bay-jamb-fit','wood_column',.16,4.1,.26,x,2.65,-5.72,red);}
  for(const z of[-5.7,5.7])box('main-painted-eave-beam-fit','caihua_beam',22.35,.35,.35,0,6.025,z);
  for(const x of[-11,11])box('main-painted-side-beam-fit','caihua_beam',.35,.35,11.4,x,6.025,0);
  // Four actual closed leaves: upper pale screen, restrained coin-type lattice
  // and red/gold lower field. Not a fabricated open wind-door or room entrance.
  for(let i=0;i<4;i++){
   const x=-1.575+i*1.05;box('closed-central-coin-lattice-leaf-fit','wood_column',1.01,4.12,.16,x,2.66,-5.72,red);
   box('pale-central-screen-fit','wood_column',.86,2.3,.035,x,3.42,-5.82,0xc5bba1);
   for(const y of[.7,2.24,4.61])box('door-gold-outline-fit','wood_column',1.02,.035,.03,x,y,-5.85,0xb79546);
   for(const dx of[-.49,.49])box('door-gold-outline-fit','wood_column',.035,3.95,.03,x+dx,2.65,-5.85,0xb79546);
   for(const y of[1.22,1.71]){const ring=mesh('schematic-ancient-coin-lattice-fit',new T.TorusGeometry(.18,.016,4,12),material('wood_column',0xb79546),x,y,-5.84);for(const dx of[-.077,.077])box('coin-square-hole-fit','wood_column',.018,.15,.025,x+dx,y,-5.86,0xb79546);for(const dy of[-.077,.077])box('coin-square-hole-fit','wood_column',.15,.018,.025,x,y+dy,-5.86,0xb79546);}
  }
  for(const c of[-8.8,-4.4,4.4,8.8]){
   box('window-masonry-sill-fit','wall_brick',4.16,.82,.28,c,1.01,-5.7);
   box('side-sill-window-group-fit','wood_column',4.12,3.25,.16,c,3.025,-5.72,green);
   for(const dx of[-1.02,1.02]){
    const x=c+dx;for(const[y,h,col]of[[2.22,1.36,glaze],[3.82,1.28,dark]]){
     box('upper-lower-window-field-fit','wood_column',1.88,h,.035,x,y,-5.825,col);
     for(const inset of[0,.18]){const w=1.82-2*inset,H=h-.06-2*inset;for(const q of[-1,1]){box('blue-green-geometric-lattice-fit','wood_column',.035,H,.04,x+q*w/2,y,-5.86,green);box('blue-green-geometric-lattice-fit','wood_column',w,.035,.04,x,y+q*H/2,-5.86,green);}}
     for(const q of[-.4,0,.4])box('blue-green-geometric-lattice-fit','wood_column',.035,h-.08,.04,x+q,y,-5.86,green);
    }
   }
   for(const y of[1.43,2.98,4.65])box('window-major-cross-frame-fit','wood_column',4.16,.1,.08,c,y,-5.86,red);
   for(const dx of[-2.08,0,2.08])box('window-major-cross-frame-fit','wood_column',.1,3.32,.08,c+dx,3.04,-5.86,red);
  }
  for(const x of[-6.6,-2.2,2.2,6.6]){
   mesh('red-three-bay-baoxia-column-fit',new T.CylinderGeometry(.19,.22,5.35,12),material('wood_column',red),x,3.275,-8.9);
   box('baoxia-real-depth-bearing-fit','wood_column',.26,.26,3.2,x,5.82,-7.3,red);
  }
  box('baoxia-painted-front-beam-fit','caihua_beam',13.7,.38,.35,0,5.76,-8.9);
  // Coarse supported bracket bands, not copied carved historical ornament.
  for(const x of[-6.6,-4.4,-2.2,0,2.2,4.4,6.6]){box('coarse-baoxia-bearing-block-fit','wood_column',.46,.22,.48,x,5.99,-8.9,green);box('coarse-baoxia-bearing-block-fit','wood_column',.78,.12,.3,x,6.13,-8.9,0xa18c67);}
  // Two photo-supported vats: open-profile real bronze vessels, handles and
  // individual stone feet. The simple surfaces/handle count are engineering fits.
  for(const x of[-9.1,9.1]){
   const profile=[[.75,0],[1.01,.12],[1.15,.55],[1.16,1.12],[1.08,1.35],[.98,1.35],[1.05,1.08],[1.03,.55],[.87,.2],[.75,.16]].map(p=>new T.Vector2(...p));
   mesh('real-bronze-water-vat-fit',new T.LatheGeometry(profile,24),material('wood_column',0x53594e),x,.2,-9.35);
   mesh('vat-real-bottom-fit',new T.CylinderGeometry(.76,.76,.16,24),material('wood_column',0x53594e),x,.28,-9.35);
   for(const dx of[-.68,.68])for(const dz of[-.46,.46])box('vat-real-stone-foot-fit','stone_slab',.42,.2,.42,x+dx,.1,-9.35+dz);
   for(const sign of[-1,1]){const q=mesh('schematic-vat-side-ring-fit',new T.TorusGeometry(.17,.042,6,12),material('wood_column',0x6c6c58),x+sign*1.12,.9,-9.35);q.rotation.y=Math.PI/2;}
  }
  for(const n of['roof_tile','rafters','dougong_band','caihua_beam','wood_column','wall_red'])material(n);
  const tiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(n=>[n,kit.lib.tileSize(n)])),aspects=new Map(['dougong_band','caihua_beam'].map(n=>[n,kit.lib.aspect(n)])),old=s.lib;
  s.lib={material:n=>cache.get(n+':'),tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};let roof;
  try{roof=s.roof(f,{type:'xieshan',width:22,depth:11.4,baseY:6.2,height:2.8,overhang:.6,brackets:false,detail:'low'});}finally{s.lib=old;}
  roof.traverse(m=>{if(m.isMesh&&m.material===material('roof_tile'))m.name='roof_xieshan_roof_tile';});
  // New auxiliary roll roof, positive physical shell, locally trimmed only to
  // the actual new main roof. No existing canopy or old roof is selected.
  const aux=[],curve=(x,z)=>6.18+Math.sin((z+9.55)/5.35*Math.PI)*1.12+.18*Math.pow(Math.abs(x)/7.05,8),nx=20,nz=32,verts=[],uv=[],ix=[];
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const x=-7.05+14.1*i/nx,z=-9.55+5.35*j/nz;verts.push(x,curve(x,z),z);uv.push((x+7.05)/1.2,(z+9.55)/1.2);}
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=i*(nz+1)+j,b=a+nz+1;ix.push(a,a+1,b,b,a+1,b+1);}
  const geo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(verts,3)).setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();
  const top=mesh('three-bay-yellow-roll-roof-fit',geo,material('roof_tile'));aux.push(top);
  const under=geo.clone();under.translate(0,-.12,0);const rev=[...ix];for(let i=0;i<rev.length;i+=3)[rev[i+1],rev[i+2]]=[rev[i+2],rev[i+1]];under.setIndex(rev);under.computeVertexNormals();aux.push(mesh('roll-roof-real-underside-fit',under,material('rafters')));
  for(const x of[-7.05,7.05]){const v=[],u=[],ind=[];for(let j=0;j<=nz;j++){const z=-9.55+5.35*j/nz;v.push(x,5.92,z,x,curve(x,z)-.12,z);u.push(j/nz,0,j/nz,1);}for(let j=0;j<nz;j++){const a=j*2;ind.push(a,a+1,a+2,a+1,a+3,a+2);}if(x<0)for(let i=0;i<ind.length;i+=3)[ind[i+1],ind[i+2]]=[ind[i+2],ind[i+1]];const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3)).setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(ind);g.computeVertexNormals();aux.push(mesh('plain-roll-roof-side-fascia-fit',g,material('wood_column',red)));}
  box('roll-roof-front-edge-fit','wood_column',14.1,.16,.15,0,6.11,-9.55,red);
  const joint=fitCanopyToMainRoof({hall:f,mainRoof:roof,meshes:aux,capParent:f,capMaterial:material('roof_tile')});
  // Preserve the clipped outward faces exactly. Add real inward skins and
  // boundary quads, 40mm inside, rather than changing materials to DoubleSide.
  // Derive edges from the actual clipped fascia, including its roof-joint cut.
  const sideFaces=aux.filter(m=>m.name===ID+'/plain-roll-roof-side-fascia-fit');
  for(const outer of sideFaces){
   const p=outer.geometry.attributes.position,idx=outer.geometry.index,sign=Math.sign(p.getX(0)),depth=.04;
   const inner=outer.geometry.clone(),a=inner.attributes.position;
   for(let i=0;i<a.count;i++)a.setX(i,a.getX(i)-sign*depth);
   const reversed=idx?Array.from(idx.array):Array.from({length:a.count},(_,i)=>i);for(let i=0;i<reversed.length;i+=3)[reversed[i+1],reversed[i+2]]=[reversed[i+2],reversed[i+1]];inner.setIndex(reversed);inner.computeVertexNormals();
   const skin=mesh('roll-roof-side-inner-face-fit',inner,outer.material);skin.userData.chongjingFasciaSkin=true;
   const edges=new Map(),key=v=>v.map(x=>Math.round(x/1e-5)).join(',');
   for(let i=0;i<(idx?.count??p.count);i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,idx?.getX(i+j)??i+j).toArray());for(let j=0;j<3;j++){const A=v[j],B=v[(j+1)%3],ka=key(A),kb=key(B);if(ka===kb)continue;const k=ka<kb?ka+'|'+kb:kb+'|'+ka;if(edges.has(k))edges.get(k).count++;else edges.set(k,{A,B,count:1});}}
   const v=[],uv=[],put=(A,B,C)=>{for(const q of[A,B,C]){v.push(...q);uv.push(q[1],q[2]);}};
   for(const{A,B,count}of edges.values())if(count===1){const C=[A[0]-sign*depth,A[1],A[2]],D=[B[0]-sign*depth,B[1],B[2]];put(A,C,D);put(A,D,B);}
   if(!v.length)throw Error('Actual clipped fascia boundary required');
   const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3)).setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();const cap=mesh('roll-roof-side-edge-cap-fit',g,outer.material);cap.userData.chongjingFasciaSkin=true;
  }
  // Remove only factory zero-area triangles in this new copy. No shared roof
  // source or retained instance is changed, nor is any positive-area face cut.
  f.traverse(m=>{if(!m.isMesh)return;if(!m.name.startsWith(ID+'/'))m.name=ID+'/roof-shell-fit/'+m.name;if(!m.material.name.startsWith('r163_chongjing_'))m.material.name='r163_chongjing_roof_'+(m.material.name||m.material.type);const g=m.geometry,p=g.attributes.position,ix=g.index,rows=[],tri=new T.Triangle();for(let i=0;i<(ix?.count??p.count);i+=3){const a=ix?.getX(i)??i,b=ix?.getX(i+1)??i+1,c=ix?.getX(i+2)??i+2;tri.a.fromBufferAttribute(p,a);tri.b.fromBufferAttribute(p,b);tri.c.fromBufferAttribute(p,c);if(tri.getArea()>1e-12)rows.push(a,b,c);}if(rows.length===(ix?.count??p.count))return;const q=new T.BufferGeometry();for(const[key,a]of Object.entries(g.attributes)){const values=[];for(const j of rows)for(let c=0;c<a.itemSize;c++)values.push(a.array[j*a.itemSize+c]);q.setAttribute(key,new T.BufferAttribute(new a.array.constructor(values),a.itemSize,a.normalized));}m.geometry=q;g.dispose();});
  f.updateWorldMatrix(true,true);let n=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.chongjingStoneTop){const b=new T.Box3().setFromObject(m);b.chongjingStoneTop=m.userData.chongjingStoneTop;b.chongjingMesh=m.uuid;if(m.userData.chongjingFasciaSkin)b.chongjingFasciaSkin=true;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});return;}
   // These scratch points belong only to this traversal callback. Keep the same
   // transform -> Float32 rounding -> area test order, without per-vertex arrays.
   const v=[],a=m.geometry.attributes.position,ix=m.geometry.index,tri=new T.Triangle(),q=[tri.a,tri.b,tri.c];
   for(let i=0;i<(ix?.count??a.count);i+=3){
    for(let j=0;j<3;j++)q[j].fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld);
    for(const p of q)p.set(Math.fround(p.x),Math.fround(p.y),Math.fround(p.z));
    if(tri.getArea()>1e-12)for(const p of q)v.push(p.x,p.y,p.z);
   }if(!v.length)throw Error('Empty Chongjing owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const t=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+n+++'/'+m.name.slice(ID.length+1)),b=t.box.clone();b.triangleSupport=t;b.chongjingMesh=m.uuid;if(m.userData.chongjingFasciaSkin)b.chongjingFasciaSkin=true;s.colliders.push(b);}finally{g.dispose();}
  });
  const bounds=new T.Box3().setFromObject(f);if(!new T.Box3(new T.Vector3(107,-1e-6,465),new T.Vector3(133,13,485.5)).containsBox(bounds))throw Error('Chongjing escaped clear envelope '+JSON.stringify(bounds));
  meta={id:ID,sourceObjectId:'FC-ED17D936A5',originalOrdinal:2,sourceLine:649,name:'崇敬殿外观局部',identity:'FIRST_COURT_DISTINCT_FROM_EXISTING_MIDDLE_CHONGHUA',bayGrid:[5,3],baoxiaBays:3,baoxiaRoof:'PHOTO_SUPPORTED_ROLL_ROOF',roof:'YELLOW_XIESHAN',roofJoint:joint,fasciaSkin:{depth:.04,existingOuterFacesAndOwnersUnchanged:true,insideAndBoundaryFaces:true,materialSide:'FRONT_SIDE'},front:'SOUTH_MODEL_ZERO',wholeObjectAccepted:false,leshantangInteriorComplete:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,admission:'CLOSED_CENTRAL_LEAVES_EXTERIOR_VERANDA_ONLY',source:'https://www.dpm.org.cn/explore/building/236506.html',ownExterior:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff075737310.jpg',ownExteriorSHA256:'13ea0b1d374295b4c36b59c92c2dfec9fe408137e1e3cff412a7573bead3f31e',captionSource:'https://img.dpm.org.cn/Uploads/File/2020/10/23/u5f9255173a228.pdf#page=13',captionPrintedPage:62,interiorReferenceOnly:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff075738d0d.jpg',sourceSupported:['official first-court5bays/3deep yellow xieshan; front3bay baoxia, central4ancient-coin lattice leaves and other sill windows','own exterior and caption: projecting3bay roll roof, red columns, blue-green upper/lower geometric windows, grey central stair and paired bronze vats','Leshantang is the interior nameboard, not a separate hall'],fit:['all coordinates/dimensions,22x11.4main/13.2baoxia/.6platform and4x.15rises','generic main xieshan curve and hidden back/sides, simplified roll-roof curve and actual clipped/capped surface join','coarse facade colors/lattice/coin type, pale screens/closed pose, plain brackets, vat profile/feet/handles, no exact carving'],excluded:['old middle Chonghua hall/canopy/rooms/furniture or any old wall/gate/route modification','complete Leshantang interior/nameboard/furniture, invented exterior inscriptions or real public admission','side halls/full court reconstruction, historic phase restoration, counted roof beasts/fine carving','invisible ramps/rescue supports/global physics, uploads/main/Pages'],unknown:['surveyed scale, unseen roof/back/sides and original paint/carving precision','actual open state and full Leshantang interior/furnishing inventory','GPU/browser/mobile/full streaming and whole-item acceptance']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 kit.root.add(f);kit.colliders.push(...s.colliders);kit.walkables.push(...s.walkables);kit.owned.push(...s.owned);if(s.ownedTextures)(kit.ownedTextures??=[]).push(...s.ownedTextures);done.add(kit);return{frame:f,meta};
}
