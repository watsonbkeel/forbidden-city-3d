import * as T from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b70481d5f.jpg';
const same=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
const canonical=o=>o.visible===true&&o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.scale.equals(new T.Vector3(1,1,1))&&!o.rotation.x&&!o.rotation.y&&!o.rotation.z;
const noEvents=o=>!o._listeners||Object.values(o._listeners).every(a=>a.length===0);
function sameGeometry(a,b){return a.morphTargetsRelative===b.morphTargetsRelative&&Object.keys(a.morphAttributes).length===0&&a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.itemSize===b.index.itemSize&&a.index.normalized===b.index.normalized&&a.index.array.constructor===b.index.array.constructor&&a.index.count===b.index.count&&a.index.array.every((v,i)=>v===b.index.array[i]));}
function geometryResources(g){if(!g)return [];const attributes=[g.index,...Object.values(g.attributes??{}),...Object.values(g.morphAttributes??{}).flat()];return [g,...attributes.flatMap(a=>a?[a,a.data,a.array,a.data?.array,a.array?.buffer,a.data?.array?.buffer].filter(Boolean):[])];}
function writableMetadata(o){if(!Object.isExtensible(o))return false;for(let p=o;p;p=Object.getPrototypeOf(p))if(Object.getOwnPropertyDescriptor(p,'wenhuaSouthWindows'))return false;return true;}
function boxGeometry(a,b,c,d,e,f){const g=new T.BoxGeometry(1,1,1),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)<0?a:b,p.getY(i)<0?c:d,p.getZ(i)<0?e:f);return g;}

/** Four whole south window groups; no original collision or opening changes. */
export function applyWenhuaSouthWindows(kit,f){
 const s=f?.userData.structure;
 if(kit?.root.name!=='outer-east'||f?.parent!==kit.root||!canonical(kit.root)||kit.root.parent!==null||kit.root.position.lengthSq()||!canonical(f)||!same(f.position.x,-186.4)||!same(f.position.z,-199)||f.position.y||s?.profile!=='wenhua-front'||s.id!=='outer-east/wenhua-front'||s.w!==30.8||s.d!==17||s.ph!==1.2||s.bays!==5||!writableMetadata(f.userData)||!writableMetadata(s)||!noEvents(f))throw Error('Exact registered Wenhua south window host required');
 const mat=kit.lib.material('lattice_doors'),w=30.8/5-.68,h=(7.68-.85)*.8,y=1.2+h/2,indices=[0,1,3,4],sources=f.children.filter(m=>m.isMesh&&m.material===mat&&m.position.z===-8.5);
 const sourceMaterial=mat.map===(kit.lib.colors instanceof Map?kit.lib.colors.get('lattice_doors')??null:null)&&mat.normalMap===(kit.lib.normals instanceof Map?kit.lib.normals.get('lattice_doors')??null:null)&&['aoMap','lightMap','bumpMap','roughnessMap','metalnessMap','emissiveMap','envMap','displacementMap'].every(k=>mat[k]===null)&&mat.displacementScale===1&&mat.displacementBias===0&&mat.color.getHex()===0xffffff&&mat.emissive.getHex()===0&&mat.metalness===0&&mat.normalScale.equals(new T.Vector2(1,1))&&mat.onBeforeCompile===T.Material.prototype.onBeforeCompile&&mat.customProgramCacheKey===T.Material.prototype.customProgramCacheKey;
 if(!sourceMaterial||sources.length!==4||!mat.isMeshStandardMaterial||mat.transparent||mat.opacity!==1||!mat.visible||!mat.depthWrite||!mat.depthTest||!mat.colorWrite||mat.alphaTest||mat.alphaMap||mat.alphaHash||mat.side!==T.FrontSide||mat.blending!==T.NormalBlending||mat.wireframe)throw Error('Wenhua original four opaque windows required');
 for(let i=0;i<4;i++){
  const m=sources[i],g=applyBandUV(new T.BoxGeometry(w,h,.14),kit.lib.tileSize('lattice_doors'));let valid;
  try{valid=m.name===''&&canonical(m)&&m.children.length===0&&same(m.position.x,-30.8/2+(indices[i]+.5)*30.8/5)&&same(m.position.y,y)&&sameGeometry(m.geometry,g)&&noEvents(m)&&noEvents(m.geometry)&&Object.keys(m.userData).length===0;}finally{g.dispose();}
  if(!valid)throw Error('Wenhua original window source changed: '+i);
 }
 const owners=new Map();for(const m of sources)for(const resource of geometryResources(m.geometry)){if(owners.has(resource)&&owners.get(resource)!==m)throw Error('Wenhua source resources shared');owners.set(resource,m);}
 kit.root.traverse(o=>{for(const resource of geometryResources(o.geometry))if(owners.has(resource)&&owners.get(resource)!==o)throw Error('Wenhua source resource borrowed elsewhere');});
 const meta={entityId:'FC-CD0B5AC9DE',sourcePage:'https://www.dpm.org.cn/explore/building/236531.html',photo:PHOTO,photographyDate:null,scope:'FOUR_COMPLETE_SOUTH_FLANK_WINDOW_GROUPS_ONLY',leaves:4,lattice:'THREE_DIRECTION_60_DEGREE_OUTLINE_NOT_EXACT_SIX_BOWL_CARVING',sill:'PALE_GREY_MASONRY_COLOR_FIT_MATERIAL_SUBTYPE_UNVERIFIED',dimensions:'RETAINED_SLAB_ENVELOPES_FIELD_PROPORTIONS_PHOTO_FITTED_NOT_SURVEYED',backing:'CONTINUOUS_OPAQUE_SOURCE_VOLUME_NO_NEW_APERTURE',physics:'ALL_COLLIDERS_WALKABLES_ROOMS_REGIONS_MAP_UNCHANGED',centralDoors:'TWO_OPEN_MODEL_LEAVES_RETAINED_SIX_SOURCE_LEAF_COMPOSITION_PENDING',wholeHallAccepted:false,visualAcceptance:'VERIFY_PENDING'};
 const mats=[],geos=[],groups=[];
 try{
  for(const[name,color]of[['red',0x983b2d],['dark',0x302b26],['masonry',0xb9b3a5]])mats.push(new T.MeshStandardMaterial({name:'wenhua-south-window-'+name+'-fit',color,roughness:.87}));
  for(let i=0;i<4;i++){
   const old=sources[i],g=new T.Group();groups.push(g);g.name='wenhua-south-window-bay-'+indices[i];g.position.copy(old.position);g.userData={...meta,wenhuaWindowBay:indices[i]};
   const b=new T.Box3().setFromBufferAttribute(old.geometry.attributes.position),a=b.min.x,d=b.max.x,c=b.min.y,h=b.max.y,e=b.min.z,j=b.max.z,cut=e+.025;
   const mesh=(geo,mi,role,leaf=null)=>{geos.push(geo);const m=new T.Mesh(geo,mats[mi]);m.name='wenhua-south-window-'+role;m.castShadow=m.receiveShadow=true;m.userData={...meta,wenhuaWindowRole:role,leaf,bay:indices[i]};g.add(m);return m;};
   const box=(role,mi,x0,x1,y0,y1,z0=e,z1=cut,leaf=null)=>mesh(boxGeometry(x0,x1,y0,y1,z0,z1),mi,role,leaf);
   // Complete source slab remains solid behind the shallow front composition.
   box('continuous-backing',1,a,d,c,h,cut-.002,j);
   const sill=c+.78,lower=sill+.34,frame=.055;
   box('masonry-sill',2,a,d,c,sill);box('lower-sill-rail',0,a,d,sill,sill+.065);
   for(let leaf=0;leaf<4;leaf++){
    const x0=a+(d-a)*leaf/4,x1=a+(d-a)*(leaf+1)/4,xc=(x0+x1)/2;
    box('leaf-backing',1,x0,x1,sill,h,e+.018,cut+.001,leaf);
    box('lower-panel',0,x0,x1,sill+.04,lower, e,cut,leaf);
    for(const xx of[x0,x1-frame])box('leaf-stile',0,xx,xx+frame,sill,h,e,cut,leaf);
    for(const yy of[lower,h-frame])box('leaf-rail',0,x0,x1,yy,yy+frame,e,cut,leaf);
    // Inset grid is clipped as closed bars, not transparent or traversable holes.
    const half=[(x1-x0)/2-frame-.025,(h-lower-frame)/2-.025],cy=(lower+frame+h)/2,pitch=.22,t=.019;
    for(const degree of[0,60,-60]){
     const angle=degree*Math.PI/180,dir=[Math.cos(angle),Math.sin(angle)],normal=[-dir[1],dir[0]],reach=Math.abs(normal[0])*half[0]+Math.abs(normal[1])*half[1];
     for(let k=Math.ceil(-reach/pitch);k<=Math.floor(reach/pitch);k++){
      const p=[normal[0]*k*pitch,normal[1]*k*pitch];let lo=-Infinity,hi=Infinity;
      for(let axis=0;axis<2;axis++){if(Math.abs(dir[axis])<1e-8){if(Math.abs(p[axis])>half[axis]){lo=1;hi=0;break;}}else{const v0=(-half[axis]-p[axis])/dir[axis],v1=(half[axis]-p[axis])/dir[axis];lo=Math.max(lo,Math.min(v0,v1));hi=Math.min(hi,Math.max(v0,v1));}}
      if(hi-lo<.02)continue;const geo=new T.BoxGeometry(hi-lo,t,cut-e);geos.push(geo);geo.rotateZ(angle);geo.translate(xc+p[0]+dir[0]*(hi+lo)/2,cy+p[1]+dir[1]*(hi+lo)/2,(e+cut)/2);geos.pop();const bar=mesh(geo,0,'lattice-bar',leaf);bar.userData.direction=degree;
     }
    }
   }
  }
 }catch(error){for(const g of geos)g.dispose();for(const m of mats)m.dispose();throw error;}
 for(const g of groups)f.add(g);for(const m of sources){f.remove(m);m.geometry.dispose();}
 kit.owned.push(...mats);f.userData.wenhuaSouthWindows=meta;s.wenhuaSouthWindows=meta;return meta;
}
export function finishWenhuaSouthWindows(kit){const frames=kit.root.children.filter(f=>f.userData.structure?.profile==='wenhua-front');if(!frames.length)return false;if(frames.length!==1)throw Error('Duplicate Wenhua window host');return applyWenhuaSouthWindows(kit,frames[0]);}
