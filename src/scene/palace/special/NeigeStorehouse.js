import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='neige-storehouse-candidate-a',FIT='PHOTO_TOPOLOGY_ENGINEERING_FIT_NOT_SURVEYED';
export const NEIGE_STORE_FIT=Object.freeze({x:-221,z:-365,width:42,depth:12,eave:5.4,ridge:8.7,front:'north'});
export const NEIGE_STORE_SOURCES=Object.freeze([
 'https://www.dpm.org.cn/explore/building/236579.html',
 'https://img.dpm.org.cn/Uploads/Picture/dc/8358.jpg',
 'https://www.dpm.org.cn/Uploads/pdf/6179/T00018_00.pdf',
 'https://www.dpm.org.cn/Uploads/pdf/6179/T00025_00.pdf',
 'https://www.dpm.org.cn/Uploads/pdf/6179/T00026_00.pdf',
 'https://www.dpm.org.cn/Uploads/File/pdf/dc/90/c9/dc90c935d785bbdf396ad66173ebf391.pdf',
]);
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Only one exterior; the photo does not identify red-book versus records store.
 * North windows and masonry are sourced; repeated spacing, dimensions, roof
 * tone and unphotographed faces are reversible fits, not a building survey.
 * Closed visible doors do not assert real visitor admission. No interior model. */
export function buildNeigeStorehouse(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,arrays=['colliders','walkables','rooms','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||!kit.root.children.some(o=>o.userData.structure?.id==='neige-main-court')||kit.root.children.some(o=>o.userData.structure?.id===ID)||arrays.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children)||typeof kit.lib?.material!=='function')throw Error('Neige storehouse requires original outer-east after main court, once, untransformed');
 const p=NEIGE_STORE_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
 const owned=[],geometries=[],colliders=[];
 const brick=kit.lib.material('wall_brick'),stoneBase=kit.lib.material('stone_slab');
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.9});owned.push(m);return m;};
 const stone=material('neige-store-stone',0xb5b09e),iron=material('neige-store-iron',0x30312c),red=material('neige-store-door-red',0x852c22),roofMat=material('neige-store-weathered-roof',0xa38d5d),wood=material('neige-store-lintel',0x564231);
 const add=(parts,geo,mat,role)=>{if(mat===brick||mat===stoneBase)geo=applyBoxUV(geo,kit.lib.tileSize(mat===brick?'wall_brick':'stone_slab'));geometries.push(geo);const m=new T.Mesh(geo,mat);m.name='neige-store-'+role;m.castShadow=m.receiveShadow=true;m.userData.storeRole=role;parts.push(m);frame.add(m);return m;};
 const box=(parts,role,mat,w,h,d,x,y,z)=>add(parts,new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role);
 const own=(parts,key)=>{frame.updateMatrixWorld(true);const a=[];for(const m of parts){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const v=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);a.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}}const geo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(a,3));try{const shape=triangleInstance(createTriangleTemplate(geo),[0,0,0],ID+':'+key),c=shape.box.clone();c.triangleSupport=shape;c.neigeStore={id:key,objectId:'FC-40EB11CF20'};colliders.push(c);for(const m of parts)m.userData.storeOwner=shape.id;}finally{geo.dispose();}};
 const solid=(key,role,mat,w,h,d,x,y,z)=>{const a=[];box(a,role,mat,w,h,d,x,y,z);own(a,key);};
 const prism=(section,x0,x1)=>{const sh=new T.Shape();section.forEach(([z,y],i)=>sh[i?'lineTo':'moveTo'](z,y));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:x1-x0,steps:1,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 const windowFits=[-17,-6,0,6,17].map(x=>({x,width:2,height:2.2,bottom:2.6})),doorFits=[-12,12].map(x=>({x,width:2.6,height:3.3,bottom:0}));
 try{
  solid('foundation','store-foundation',brick,42.4,.28,12.4,0,-.14,0);
  solid('ground-floor','store-ground-floor',stoneBase,41.5,.06,11.5,0,-.03,0);
  solid('south-wall','store-masonry',brick,42.4,5.4,.5,0,2.7,-5.75);
  for(const s of[-1,1])solid('end-wall-'+s,'store-masonry',brick,.5,5.4,12,s*20.95,2.7,0);
  const holes=[...windowFits,...doorFits].sort((a,b)=>a.x-b.x),xs=[-21.2,...holes.flatMap(h=>[h.x-h.width/2,h.x+h.width/2]),21.2],ys=[...new Set([0,5.4,...holes.flatMap(h=>[h.bottom,h.bottom+h.height])])].sort((a,b)=>a-b);
  // Real masonry cells around apertures. No plate/box caps the window holes.
  const north=[];for(let i=1;i<xs.length;i++)for(let j=1;j<ys.length;j++){const x=(xs[i-1]+xs[i])/2,y=(ys[j-1]+ys[j])/2;if(holes.some(h=>x>h.x-h.width/2&&x<h.x+h.width/2&&y>h.bottom&&y<h.bottom+h.height))continue;box(north,'store-masonry',brick,xs[i]-xs[i-1],ys[j]-ys[j-1],.5,x,y,5.75);}own(north,'north-perforated-masonry');
  for(const w of windowFits){const a=[],cy=w.bottom+w.height/2;
   for(const s of[-1,1])box(a,'window-stone-frame',stone,.19,w.height+.38,.66,w.x+s*(w.width/2+.095),cy,5.85);
   for(const y of[w.bottom-.095,w.bottom+w.height+.095])box(a,'window-stone-frame',stone,w.width,.19,.66,w.x,y,5.85);
   own(a,'window-stone-'+w.x);
   const bars=[];for(let i=-3;i<=3;i++)box(bars,'window-iron-bar',iron,.065,w.height,.065,w.x+i*.25,cy,5.89);
   for(const y of[w.bottom+.045,w.bottom+w.height-.045])box(bars,'window-iron-rail',iron,w.width,.09,.09,w.x,y,5.89);own(bars,'window-bars-'+w.x);
   for(const s of[-1,1]){const a=[],x=w.x+s*1.55;box(a,'window-open-iron-shutter',iron,1.04,w.height,.075,x,cy,6.18);for(const yy of[w.bottom+.12,cy,w.bottom+w.height-.12])box(a,'shutter-iron-strap',iron,1.06,.065,.105,x,yy,6.235);for(const xx of[x-.47,x+.47])box(a,'shutter-edge',iron,.055,w.height,.105,xx,cy,6.235);own(a,'window-shutter-'+w.x+'-'+s);}
  }
  for(const d of doorFits){const a=[];
   for(const s of[-1,1])box(a,'door-stone-frame',stone,.23,d.height+.25,.71,d.x+s*(d.width/2+.115),(d.height+.25)/2,5.87);
   box(a,'door-stone-frame',stone,d.width,.25,.71,d.x,d.height+.125,5.87);
   box(a,'door-plain-lintel',wood,d.width+.42,.24,.47,d.x,d.height+.38,5.94);own(a,'door-jamb-'+d.x);
   for(const s of[-1,1]){const q=[],x=d.x+s*d.width/4;box(q,'closed-red-door-leaf',red,d.width/2-.012,d.height,.12,x,d.height/2,5.99);
    // Iron-clad inner backing and straps are material/structural cues from025,
    // not a reconstruction of the unknown historical rivet census.
    box(q,'door-iron-backing',iron,d.width/2-.025,d.height-.025,.035,x,d.height/2,5.91);
    for(const y of[.3,1.65,3])box(q,'door-iron-inner-strap',iron,d.width/2-.02,.055,.06,x,y,5.88);
    box(q,'door-latch',iron,.32,.07,.09,d.x+s*.16,1.56,6.08);box(q,'door-handle',iron,.055,.21,.09,d.x+s*.22,1.44,6.08);own(q,'door-leaf-'+d.x+'-'+s);
   }
   solid('door-threshold-'+d.x,'door-low-stone-sill',stone,d.width,.10,.63,d.x,.05,5.87);
  }
  const n=20,half=6.65,curve=z=>p.eave+(p.ridge-p.eave)*(.45*(1-Math.abs(z)/half)+.55*(1-Math.abs(z)/half)**2),points=Array.from({length:n+1},(_,i)=>{const z=-half+2*half*i/n;return[z,curve(z)];});
  for(const s of[-1,1]){const a=[],section=[[-6,5.15],[6,5.15]];for(let i=0;i<=n;i++){const z=6-12*i/n;section.push([z,curve(z)-.205]);}add(a,prism(section,s<0?-21.2:20.7,s<0?-20.7:21.2),brick,'store-gable');own(a,'gable-'+s);}
  const roof=[];add(roof,prism([...points,...points.toReversed().map(([z,y])=>[z,y-.20])],-21.2,21.2),roofMat,'roof-shell');
  // Low repeated rolls establish a tiled surface, not an exact tile inventory.
  const rollCount=88;for(let i=0;i<=rollCount;i++){const x=-21.15+42.3*i/rollCount,path=new T.CatmullRomCurve3(points.map(([z,y])=>new T.Vector3(x,y+.02,-z)));add(roof,new T.TubeGeometry(path,20,.042,5,false),roofMat,'roof-tile-roll');for(const t of[0,1]){const v=path.getPoint(t),normal=path.getTangent(t).multiplyScalar(t===0?-1:1),disc=new T.CircleGeometry(.042,5);disc.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),normal)));disc.translate(...v.toArray());add(roof,disc,roofMat,'roof-tile-cap');}}
  box(roof,'roof-plain-ridge',roofMat,42.5,.19,.23,0,8.79,0);own(roof,'closed-pitched-roof');
 }catch(error){geometries.forEach(g=>g.dispose());owned.forEach(m=>m.dispose());throw error;}
 const meta={id:ID,objectId:'FC-40EB11CF20',name:'内阁大库（具体库别待核）',...p,dimensions:FIT,identityUnresolved:true,representedStorehouses:1,wholeObjectAccepted:false,interiorFurnishings:0,windowFits,doorFits,doorState:'VISIBLE_CLOSED_SOURCE026_NOT_PUBLIC_ADMISSION',sourceUrls:[...NEIGE_STORE_SOURCES],sourcePhotographDate:null,scope:'ONE_MASONRY_EXTERIOR_NORTH_WINDOW_DOOR_SEGMENT_ONLY',unknown:['red-book versus records store photo identity','measured position and dimensions','full opening count and exact repeated spacing','roof material type, tone and ridge details','unphotographed south and end elevations','interior floors, stairs and furnishings','current public admission and completed2023repairs','GPU/mobile visual acceptance'],triangleOwners:colliders.length};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...owned);kit.mapItems.push({kind:'hall',name:meta.name,x:p.x,z:p.z,w:42,d:12,rot:Math.PI,objectId:meta.objectId,sourceStatus:FIT});
 return{frame,meta,colliders};
}
