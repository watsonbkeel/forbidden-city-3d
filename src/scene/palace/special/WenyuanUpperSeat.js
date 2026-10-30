import * as T from 'three';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/1538[1024].jpg';
const ID='place-outer-east-fd3d76e74d';
const PREFIX='wenyuan-third-floor-photo-bed-';
const same=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
const canonical=o=>o.visible===true&&o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.scale.equals(new T.Vector3(1,1,1))&&!o.rotation.x&&!o.rotation.y&&!o.rotation.z;
const noEvents=o=>!o._listeners||Object.values(o._listeners).every(a=>a.length===0);
function sameGeometry(a,b){return a.morphTargetsRelative===b.morphTargetsRelative&&Object.keys(a.morphAttributes).length===0&&a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.itemSize===b.index.itemSize&&a.index.normalized===b.index.normalized&&a.index.array.constructor===b.index.array.constructor&&a.index.count===b.index.count&&a.index.array.every((v,i)=>v===b.index.array[i]));}
function geometryResources(g){if(!g)return [];const attributes=[g.index,...Object.values(g.attributes??{}),...Object.values(g.morphAttributes??{}).flat()];return [g,...attributes.flatMap(a=>a?[a,a.data,a.array,a.data?.array,a.array?.buffer,a.data?.array?.buffer].filter(Boolean):[])];}
function writableMetadata(o){if(!Object.isExtensible(o))return false;for(let p=o;p;p=Object.getPrototypeOf(p))if(Object.getOwnPropertyDescriptor(p,'wenyuanUpperSeat'))return false;return true;}
function boxGeometry(a,b,c,d,e,f){const g=new T.BoxGeometry(1,1,1),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)<0?a:b,p.getY(i)<0?c:d,p.getZ(i)<0?e:f);return g;}
/** Apply after registration: no collision sources, routes or support planes change. */
export function applyWenyuanUpperSeat(kit,f){
 const s=f?.userData.structure;
 if(kit?.root.name!=='outer-east'||f?.parent!==kit.root||!canonical(kit.root)||kit.root.parent!==null||kit.root.position.lengthSq()||!canonical(f)||!same(f.position.x,-186.5)||!same(f.position.z,-132.8)||f.position.y||s?.id!=='wenyuan-pavilion'||s.remainingProfile!=='wenyuan'||s.remainingId!==ID||s.w!==40.5||s.d!==17.9||s.upperFloor!==5.5||s.navigation?.upperDestinations!=='WITHHELD_PENDING_REAL_CONTROLLER_ACCEPTANCE'||!f.userData.r143WenyuanFrame||!writableMetadata(f.userData)||!writableMetadata(s)||!noEvents(f))throw Error('Exact registered Wenyuan third-floor seat host required');
 const rows=[['base',2.3,.5,1.6,-3.375,5.75,2.5],['back',2.3,1.2,.12,-3.375,6.6,3.24],['side',.1,.5,1.5,-4.475,6.25,2.5],['side',.1,.5,1.5,-2.275,6.25,2.5]],targets=f.children.filter(m=>m.name.startsWith(PREFIX)),wood=kit.owned.find(m=>m.name==='r48_outer_timber');
 if(targets.length!==4||!wood?.isMeshStandardMaterial||wood.transparent||wood.opacity!==1||!wood.visible||!wood.depthWrite||!wood.depthTest||!wood.colorWrite||wood.alphaTest||wood.alphaMap||wood.alphaHash||wood.side!==T.FrontSide||wood.blending!==T.NormalBlending||wood.wireframe)throw Error('Wenyuan original four opaque timber seat sources required');
 for(let i=0;i<4;i++){
  const m=targets[i],[kind,w,h,d,x,y,z]=rows[i],g=new T.BoxGeometry(w,h,d);let valid;
  try{valid=m.isMesh&&m.name===PREFIX+kind&&m.parent===f&&canonical(m)&&m.children.length===0&&same(m.position.x,x)&&same(m.position.y,y)&&same(m.position.z,z)&&m.material===wood&&sameGeometry(m.geometry,g)&&noEvents(m)&&noEvents(m.geometry)&&m.userData.role===PREFIX+kind&&m.userData.remainingOuterId===ID&&m.userData.source===PHOTO&&m.userData.level===3&&m.userData.photographyDate===null;}finally{g.dispose();}
  if(!valid)throw Error('Wenyuan original seat source changed: '+i);
 }
 const owners=new Map();for(const m of targets)for(const resource of geometryResources(m.geometry)){if(owners.has(resource)&&owners.get(resource)!==m)throw Error('Wenyuan seat resource borrowed by another source');owners.set(resource,m);}
 kit.root.traverse(o=>{for(const resource of geometryResources(o.geometry))if(owners.has(resource)&&owners.get(resource)!==o)throw Error('Wenyuan seat resource borrowed elsewhere in kit');});
 const meta={entityId:'FC-FD3D76E74D',sourcePage:'https://www.dpm.org.cn/explore/building/236513.html',photo:PHOTO,photographyDate:null,level:3,sourcePartCount:4,scope:'COMPLETE_RETAINED_LOW_SEAT_ENSEMBLE_ONLY',dimensionStatus:'RETAINED_FITTED_BOX_ENVELOPES_WITH_PHOTO_FITTED_CUSHION_AND_RAIL_PROPORTIONS_NOT_SURVEYED',backing:'OPAQUE_RETAINED_BACK_AND_SIDE_SOLIDS_NO_NEW_APERTURE',pattern:'SIMPLIFIED_RECTANGULAR_RELIEF_NOT_EXACT_CARVING',upholstery:'PLAIN_YELLOW_CUSHIONS_EMBROIDERY_UNMODELED',highFrame:'R143_RETAINED_NOT_IDENTIFIED_AS_MOVABLE_BED_CANOPY',physics:'ALL_ORIGINAL_COLLISION_AND_NAVIGATION_UNCHANGED',wholeHallAccepted:false,visualAcceptance:'VERIFY_PENDING'};
 const mats=[],geos=[],groups=[];
 try{
  for(const[name,color,roughness]of[['wood',0x4b3625,.82],['recess',0x241e17,.92],['yellow',0xc7a34b,.96],['rail',0x795c35,.84]])mats.push(new T.MeshStandardMaterial({name:'wenyuan-upper-seat-'+name+'-fit',color,roughness}));
  const mesh=(group,geo,mi,role)=>{geos.push(geo);const m=new T.Mesh(geo,mats[mi]);m.castShadow=m.receiveShadow=true;m.name='wenyuan-upper-seat-'+role;m.userData={wenyuanSeatRole:role,...meta};group.add(m);return m;};
  for(let i=0;i<4;i++){
   const old=targets[i],g=new T.Group();g.name='wenyuan-upper-seat-part-'+i;g.position.copy(old.position);g.userData={sourcePart:i,sourceRole:old.name,...meta};groups.push(g);
   // The private geometry bounds are taken from original Float32 vertices.
   const b=new T.Box3().setFromBufferAttribute(old.geometry.attributes.position),[a,c,e]=b.min.toArray(),[d,h,j]=b.max.toArray();
   const box=(role,mi,x0,x1,y0,y1,z0,z1)=>mesh(g,boxGeometry(x0,x1,y0,y1,z0,z1),mi,role);
   if(i===0){
    const cut=h-.085;box('timber-base',0,a,d,c,cut,e,j);box('yellow-seat-cushion',2,a,d,cut,h,e,j);
   }else if(i===1){
    // Solid rectangular back remains. Only its front shallow layer is relieved.
    const cut=e+.035;box('timber-back-backing',0,a,d,c,h,cut,j);
    box('back-left-margin',0,a,a+.035,c,h,e,cut);box('back-right-margin',0,d-.035,d,c,h,e,cut);
    box('back-top-margin',0,a,d,h-.035,h,e,cut);box('back-bottom-margin',0,a,d,c,c+.025,e,cut);
    // A central scalloped cushion, not a cut-out or loss of the back board.
    const shape=new T.Shape();shape.moveTo(-.65,c+.025);shape.lineTo(.65,c+.025);shape.lineTo(.65,c+.38);shape.bezierCurveTo(.65,c+.56,.52,c+.57,.49,c+.68);shape.bezierCurveTo(.46,c+.78,.28,c+.85,.23,c+.91);shape.bezierCurveTo(.12,c+.94,.10,c+1.03,0,c+1.06);shape.bezierCurveTo(-.10,c+1.03,-.12,c+.94,-.23,c+.91);shape.bezierCurveTo(-.28,c+.85,-.46,c+.78,-.49,c+.68);shape.bezierCurveTo(-.52,c+.57,-.65,c+.56,-.65,c+.38);shape.closePath();
    const geo=new T.ExtrudeGeometry(shape,{depth:cut-e,bevelEnabled:false,curveSegments:8,steps:1});geo.translate(0,0,e);mesh(g,geo,2,'scalloped-back-cushion');
   }else{
    // Full solid backing prevents the schematic grille from advertising a hole.
    // Frame and relief stay inside the source slab on both visible side faces.
    box('side-backing',1,a,d,c,h,e,j);
    const lo=c+.22,hi=h-.025;
    for(const sign of[-1,1]){
     const x0=sign<0?a:a+.065,x1=sign<0?d-.065:d;
     // backing is inset only where the raised joinery receives it below.
     // Slab keeps exact original outline; bars receive a shallow outward face
     // within that outline by narrowing the backing after its creation below.
     for(const yy of[lo,hi])box('side-geometric-rail',3,x0,x1,yy-.014,yy+.014,e+.03,j-.03);
     for(const zz of[e+.035,j-.035])box('side-frame',0,x0,x1,c,h,zz-.025,zz+.025);
     box('side-lower-panel',0,x0,x1,c,lo-.035,e+.055,j-.055);
     for(let k=0;k<3;k++){
      const z=e+.20+k*.54,z0=z-.14,z1=z+.14,y0=lo+.043,y1=hi-.043;
      for(const yy of[y0,y1])box('side-geometric-rail',3,x0,x1,yy-.01,yy+.01,z0,z1);
      for(const zz of[z0,z1])box('side-geometric-rail',3,x0,x1,y0,y1,zz-.01,zz+.01);
     }
    }
    const backing=g.children[0],bp=backing.geometry.attributes.position;for(let k=0;k<bp.count;k++)bp.setX(k,bp.getX(k)<0?a+.034:d-.034);bp.needsUpdate=true;
    // Outer silhouette remains the source box via full-height end frames.
   }
  }
 }catch(error){for(const g of geos)g.dispose();for(const m of mats)m.dispose();throw error;}
 // No external event callbacks occur in this validated commit section.
 for(const g of groups)f.add(g);for(const m of targets){f.remove(m);m.geometry.dispose();}
 kit.owned.push(...mats);f.userData.wenyuanUpperSeat=meta;s.wenyuanUpperSeat=meta;return meta;
}
export function finishWenyuanUpperSeat(kit){const frames=kit.root.children.filter(f=>f.userData.structure?.remainingProfile==='wenyuan');if(!frames.length)return false;if(frames.length!==1)throw Error('Duplicate Wenyuan seat host');return applyWenyuanUpperSeat(kit,frames[0]);}
