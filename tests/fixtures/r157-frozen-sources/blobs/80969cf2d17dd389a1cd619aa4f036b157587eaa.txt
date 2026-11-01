import * as T from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d1a7ac164e.jpg';
const same=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
const canonical=o=>o.visible===true&&o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.scale.equals(new T.Vector3(1,1,1))&&!o.rotation.x&&!o.rotation.y&&!o.rotation.z;
const noEvents=o=>!o._listeners||Object.values(o._listeners).every(a=>a.length===0);
function sameGeometry(a,b){return a.morphTargetsRelative===b.morphTargetsRelative&&Object.keys(a.morphAttributes).length===0&&a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.itemSize===b.index.itemSize&&a.index.normalized===b.index.normalized&&a.index.array.constructor===b.index.array.constructor&&a.index.count===b.index.count&&a.index.array.every((v,i)=>v===b.index.array[i]));}
function geometryResources(g){if(!g)return [];const attributes=[g.index,...Object.values(g.attributes??{}),...Object.values(g.morphAttributes??{}).flat()];return [g,...attributes.flatMap(a=>a?[a,a.data,a.array,a.data?.array,a.array?.buffer,a.data?.array?.buffer].filter(Boolean):[])];}
function writableMetadata(o){if(!Object.isExtensible(o))return false;for(let p=o;p;p=Object.getPrototypeOf(p))if(Object.getOwnPropertyDescriptor(p,'yikunInnerSouthWindows'))return false;return true;}
function boxGeometry(a,b,c,d,e,f){const g=new T.BoxGeometry(1,1,1),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)<0?a:b,p.getY(i)<0?c:d,p.getZ(i)<0?e:f);return g;}

/** Two whole inner-flank south window groups; no original collision or opening changes. */
export function applyYikunInnerSouthWindows(kit,f){
 const s=f?.userData.structure;
 if(kit?.root.name!=='west-six'||f?.parent!==kit.root||!canonical(kit.root)||kit.root.parent!==null||kit.root.position.lengthSq()||!canonical(f)||!same(f.position.x,94)||!same(f.position.z,382.5)||f.position.y||s?.profile!=='yikun-domestic'||s.id!=='west-six/yikun-domestic'||s.retainedEnvelope?.w!==27.1||s.retainedEnvelope.d!==13.8||s.retainedEnvelope.bays!==5||!writableMetadata(f.userData)||!writableMetadata(s)||!noEvents(f))throw Error('Exact registered Yikun inner south window host required');
 const mat=kit.lib.material('lattice_doors'),w=27.1/5-.68,h=(6.72-6.72*.12)*.8,y=.6+h/2,indices=[1,3],sources=f.children.filter(m=>m.isMesh&&m.material===mat&&m.position.z===-6.9&&same(Math.abs(m.position.x),27.1/5));
 const sourceMaterial=mat.map===(kit.lib.colors instanceof Map?kit.lib.colors.get('lattice_doors')??null:null)&&mat.normalMap===(kit.lib.normals instanceof Map?kit.lib.normals.get('lattice_doors')??null:null)&&['aoMap','lightMap','bumpMap','roughnessMap','metalnessMap','emissiveMap','envMap','displacementMap'].every(k=>mat[k]===null)&&mat.displacementScale===1&&mat.displacementBias===0&&mat.color.getHex()===0xffffff&&mat.emissive.getHex()===0&&mat.metalness===0&&mat.normalScale.equals(new T.Vector2(1,1))&&mat.onBeforeCompile===T.Material.prototype.onBeforeCompile&&mat.customProgramCacheKey===T.Material.prototype.customProgramCacheKey;
 if(!sourceMaterial||sources.length!==2||!mat.isMeshStandardMaterial||mat.transparent||mat.opacity!==1||!mat.visible||!mat.depthWrite||!mat.depthTest||!mat.colorWrite||mat.alphaTest||mat.alphaMap||mat.alphaHash||mat.side!==T.FrontSide||mat.blending!==T.NormalBlending||mat.wireframe)throw Error('Yikun inner original two inner opaque windows required');
 for(let i=0;i<2;i++){
  const m=sources[i],g=applyBandUV(new T.BoxGeometry(w,h,.14),kit.lib.tileSize('lattice_doors'));let valid;
  try{valid=m.name===''&&canonical(m)&&m.children.length===0&&same(m.position.x,-27.1/2+(indices[i]+.5)*27.1/5)&&same(m.position.y,y)&&sameGeometry(m.geometry,g)&&noEvents(m)&&noEvents(m.geometry)&&Object.keys(m.userData).length===0;}finally{g.dispose();}
  if(!valid)throw Error('Yikun inner original window source changed: '+i);
 }
 const owners=new Map();for(const m of sources)for(const resource of geometryResources(m.geometry)){if(owners.has(resource)&&owners.get(resource)!==m)throw Error('Yikun inner source resources shared');owners.set(resource,m);}
 kit.root.traverse(o=>{for(const resource of geometryResources(o.geometry))if(owners.has(resource)&&owners.get(resource)!==o)throw Error('Yikun inner source resource borrowed elsewhere');});
 const meta={entityId:'FC-374B36682D',sourcePage:'https://www.dpm.org.cn/explore/building/236517.html',photo:PHOTO,panorama:'https://pano.dpm.org.cn/#/panorama?regionId=52&secondAreaId=52&vpId=3085&sphPicId=1943317447325827072',photographyDate:null,scope:'TWO_COMPLETE_INNER_SOUTH_FLANK_GROUPS_BAYS_1_3_ONLY',fieldsPerBay:3,fieldCountStatus:'PHOTO_INFORMED_THREE_VISUAL_FIELDS_NOT_SURVEYED_OPERABLE_LEAF_COUNT',lattice:'BUBUJIN_RECTILINEAR_CLASS_ORIGINAL_ART_NOT_EXACT_CARVING',ornament:'WANZI_TUANSHOU_NOT_REPRODUCED_NO_FONT_SUBSTITUTION',outerWindows:'BAYS_0_4_BYTE_EXACT_PENDING_COVER_SUBDIVISION_EVIDENCE',sill:'GREY_MASONRY_COLOR_FIT_MATERIAL_SUBTYPE_UNVERIFIED',dimensions:'RETAINED_SLAB_ENVELOPES_FIELD_PROPORTIONS_PHOTO_FITTED_NOT_SURVEYED',backing:'CONTINUOUS_OPAQUE_SOURCE_VOLUME_NO_NEW_APERTURE',glazing:'OPAQUE_TONAL_FIT_NO_PHOTO_REFLECTION_OR_NEW_TRANSPARENCY',physics:'ALL_COLLIDERS_WALKABLES_ROOMS_REGIONS_MAP_UNCHANGED',centralDoors:'UNCHANGED_OPERATIONAL_OPEN_LEAVES_NOT_PHOTO_POSE',wholeHallAccepted:false,visualAcceptance:'GPU_AND_EXACT_CARVING_PENDING'};
 const mats=[],geos=[],groups=[],textures=[];
 try{
  for(const[name,color]of[['red-timber',0x923c30],['dark',0x252622],['masonry',0x82847b]])mats.push(new T.MeshStandardMaterial({name:'yikun-south-window-'+name+'-fit',color,roughness:.87}));
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Yikun inner lattice requires canvas context');
  ctx.fillStyle='#252622';ctx.fillRect(0,0,256,256);
  // Original rectilinear stepped class fit. The named Wan/round-longevity
  // carving is deliberately NOT replaced by invented glyphs or a font symbol.
  ctx.strokeStyle='#a14837';ctx.lineWidth=3;ctx.lineJoin='miter';
  const step=[[-25,-28],[-9,-28],[-9,-9],[9,-9],[9,-28],[25,-28],[25,28],[9,28],[9,9],[-9,9],[-9,28],[-25,28]];
  for(let row=0;row<3;row++)for(let col=0;col<4;col++){
   const x=32+col*64,y=(row+.5)*256/3;ctx.strokeRect(x-31,y-40,62,80);ctx.beginPath();ctx.moveTo(x+step[0][0],y+step[0][1]);for(const[dx,dy]of step.slice(1))ctx.lineTo(x+dx,y+dy);ctx.closePath();ctx.stroke();
  }
  const map=new T.CanvasTexture(canvas);textures.push(map);map.name='yikun-south-stepped-lattice-original-vector';map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
  const finish=new T.MeshStandardMaterial({name:'yikun-south-window-stepped-lattice-fit',map,color:0xffffff,roughness:.87});finish.userData={originalProceduralArt:true,exactCarving:false,textureBytesRGBA8:256*256*4};mats.push(finish);mats.push(new T.MeshStandardMaterial({name:'yikun-south-window-dark-glazing-fit',color:0x222d2b,roughness:.36}));mats.push(new T.MeshStandardMaterial({name:'yikun-south-window-gold-tone-outline-fit',color:0xaa8c4b,roughness:.75}));
  for(let i=0;i<2;i++){
   const old=sources[i],g=new T.Group();groups.push(g);g.name='yikun-south-window-bay-'+indices[i];g.position.copy(old.position);g.userData={...meta,yikunWindowBay:indices[i]};
   const b=new T.Box3().setFromBufferAttribute(old.geometry.attributes.position),a=b.min.x,d=b.max.x,c=b.min.y,h=b.max.y,e=b.min.z,j=b.max.z,cut=e+.025;
   const mesh=(geo,mi,role,leaf=null)=>{geos.push(geo);const m=new T.Mesh(geo,mats[mi]);m.name='yikun-south-window-'+role;m.castShadow=m.receiveShadow=true;m.userData={...meta,yikunWindowRole:role,leaf,bay:indices[i]};g.add(m);return m;};
   const box=(role,mi,x0,x1,y0,y1,z0=e,z1=cut,leaf=null)=>mesh(boxGeometry(x0,x1,y0,y1,z0,z1),mi,role,leaf);
   // Complete source slab remains solid behind the shallow front composition.
   box('continuous-backing',1,a,d,c,h,cut-.002,j);
   const sill=c+.82,frame=.065;
   box('masonry-sill',2,a,d,c,sill);box('lower-sill-rail',0,a,d,sill,sill+.065);
   for(let leaf=0;leaf<3;leaf++){
    const x0=a+(d-a)*leaf/3,x1=a+(d-a)*(leaf+1)/3;
    box('leaf-backing',1,x0,x1,sill,h,e+.018,cut+.001,leaf);
    for(const xx of[x0,x1-frame])box('leaf-stile',0,xx,xx+frame,sill,h,e,cut,leaf);
    for(const yy of[sill,h-frame])box('leaf-rail',0,x0,x1,yy,yy+frame,e,cut,leaf);
    const split=sill+(h-sill)*.54;
    box('field-transom',0,x0,x1,split-.04,split+.04,e,cut,leaf);
    // Recess glazing behind the thin gold-tone border to avoid coplanar faces.
    box('lower-glazing-field',4,x0+frame,x1-frame,sill+frame,split-.04,e+.002,cut,leaf);
    for(const xx of[x0+frame,x1-frame-.018])box('lower-gold-outline',5,xx,xx+.018,sill+frame,split-.04,e,cut,leaf);
    for(const yy of[sill+frame,split-.058])box('lower-gold-outline',5,x0+frame,x1-frame,yy,yy+.018,e,cut,leaf);
    const field=box('upper-stepped-field',3,x0+frame,x1-frame,split+.04,h-frame,e,cut,leaf);
    const uv=field.geometry.attributes.uv;for(const group of field.geometry.groups)if(group.materialIndex!==5)for(let n=group.start;n<group.start+group.count;n++){const ix=field.geometry.index.getX(n);uv.setXY(ix,.01,.01);}uv.needsUpdate=true;
   }
  }
 }catch(error){for(const g of geos)g.dispose();for(const m of mats)m.dispose();for(const t of textures)t.dispose();throw error;}
 for(const g of groups)f.add(g);for(const m of sources){f.remove(m);m.geometry.dispose();}
 for(const m of mats)if(m.map)m.addEventListener('dispose',()=>m.map.dispose());
 kit.owned.push(...mats);f.userData.yikunInnerSouthWindows=meta;s.yikunInnerSouthWindows=meta;return meta;
}
export function finishYikunInnerSouthWindows(kit){const frames=kit.root.children.filter(f=>f.userData.structure?.profile==='yikun-domestic');if(!frames.length)return false;if(frames.length!==1)throw Error('Duplicate Yikun inner window host');return applyYikunInnerSouthWindows(kit,frames[0]);}
