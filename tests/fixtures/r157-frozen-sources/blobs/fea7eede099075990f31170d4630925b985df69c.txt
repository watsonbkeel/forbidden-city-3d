import * as T from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const PHOTO='https://pano.dpm.org.cn/#/panorama?regionId=70&secondAreaId=147&vpId=3542&sphPicId=1943424062764208128';
const same=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
const canonical=o=>o.visible===true&&o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.scale.equals(new T.Vector3(1,1,1))&&!o.rotation.x&&!o.rotation.y&&!o.rotation.z;
const noEvents=o=>!o._listeners||Object.values(o._listeners).every(a=>a.length===0);
function sameGeometry(a,b){return a.morphTargetsRelative===b.morphTargetsRelative&&Object.keys(a.morphAttributes).length===0&&a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.itemSize===b.index.itemSize&&a.index.normalized===b.index.normalized&&a.index.array.constructor===b.index.array.constructor&&a.index.count===b.index.count&&a.index.array.every((v,i)=>v===b.index.array[i]));}
function geometryResources(g){if(!g)return [];const attributes=[g.index,...Object.values(g.attributes??{}),...Object.values(g.morphAttributes??{}).flat()];return [g,...attributes.flatMap(a=>a?[a,a.data,a.array,a.data?.array,a.array?.buffer,a.data?.array?.buffer].filter(Boolean):[])];}
function writableMetadata(o){if(!Object.isExtensible(o))return false;for(let p=o;p;p=Object.getPrototypeOf(p))if(Object.getOwnPropertyDescriptor(p,'wuyingSouthWindows'))return false;return true;}
function boxGeometry(a,b,c,d,e,f){const g=new T.BoxGeometry(1,1,1),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)<0?a:b,p.getY(i)<0?c:d,p.getZ(i)<0?e:f);return g;}

/** Four whole south window groups; no original collision or opening changes. */
export function applyWuyingSouthWindows(kit,f){
 const s=f?.userData.structure;
 if(kit?.root.name!=='outer-west'||f?.parent!==kit.root||!canonical(kit.root)||kit.root.parent!==null||kit.root.position.lengthSq()||!canonical(f)||!same(f.position.x,219.5)||!same(f.position.z,-199.2)||f.position.y||s?.profile!=='wuying-front'||s.id!=='outer-west/wuying-front'||s.w!==31.8||s.d!==16.8||s.ph!==1.2||s.bays!==5||!writableMetadata(f.userData)||!writableMetadata(s)||!noEvents(f))throw Error('Exact registered Wuying south window host required');
 const mat=kit.lib.material('lattice_doors'),w=31.8/5-.68,h=(7.68-.85)*.8,y=1.2+h/2,indices=[0,1,3,4],sources=f.children.filter(m=>m.isMesh&&m.material===mat&&m.position.z===-8.4);
 const sourceMaterial=mat.map===(kit.lib.colors instanceof Map?kit.lib.colors.get('lattice_doors')??null:null)&&mat.normalMap===(kit.lib.normals instanceof Map?kit.lib.normals.get('lattice_doors')??null:null)&&['aoMap','lightMap','bumpMap','roughnessMap','metalnessMap','emissiveMap','envMap','displacementMap'].every(k=>mat[k]===null)&&mat.displacementScale===1&&mat.displacementBias===0&&mat.color.getHex()===0xffffff&&mat.emissive.getHex()===0&&mat.metalness===0&&mat.normalScale.equals(new T.Vector2(1,1))&&mat.onBeforeCompile===T.Material.prototype.onBeforeCompile&&mat.customProgramCacheKey===T.Material.prototype.customProgramCacheKey;
 if(!sourceMaterial||sources.length!==4||!mat.isMeshStandardMaterial||mat.transparent||mat.opacity!==1||!mat.visible||!mat.depthWrite||!mat.depthTest||!mat.colorWrite||mat.alphaTest||mat.alphaMap||mat.alphaHash||mat.side!==T.FrontSide||mat.blending!==T.NormalBlending||mat.wireframe)throw Error('Wuying original four opaque windows required');
 for(let i=0;i<4;i++){
  const m=sources[i],g=applyBandUV(new T.BoxGeometry(w,h,.14),kit.lib.tileSize('lattice_doors'));let valid;
  try{valid=m.name===''&&canonical(m)&&m.children.length===0&&same(m.position.x,-31.8/2+(indices[i]+.5)*31.8/5)&&same(m.position.y,y)&&sameGeometry(m.geometry,g)&&noEvents(m)&&noEvents(m.geometry)&&Object.keys(m.userData).length===0;}finally{g.dispose();}
  if(!valid)throw Error('Wuying original window source changed: '+i);
 }
 const owners=new Map();for(const m of sources)for(const resource of geometryResources(m.geometry)){if(owners.has(resource)&&owners.get(resource)!==m)throw Error('Wuying source resources shared');owners.set(resource,m);}
 kit.root.traverse(o=>{for(const resource of geometryResources(o.geometry))if(owners.has(resource)&&owners.get(resource)!==o)throw Error('Wuying source resource borrowed elsewhere');});
 const meta={entityId:'FC-786C150547',sourcePage:'https://www.dpm.org.cn/explore/building/236500.html',photo:PHOTO,photographyDate:null,scope:'FOUR_COMPLETE_SOUTH_FLANK_WINDOW_GROUPS_ONLY',leaves:4,lattice:'ORIGINAL_CURVED_OVERLAPPING_CELL_SURFACE_FIT_NOT_EXACT_CARVING',sill:'PALE_GREY_MASONRY_COLOR_FIT_MATERIAL_SUBTYPE_UNVERIFIED',dimensions:'RETAINED_SLAB_ENVELOPES_FIELD_PROPORTIONS_PHOTO_FITTED_NOT_SURVEYED',backing:'CONTINUOUS_OPAQUE_SOURCE_VOLUME_NO_NEW_APERTURE',physics:'ALL_COLLIDERS_WALKABLES_ROOMS_REGIONS_MAP_UNCHANGED',centralDoors:'TWO_OPEN_MODEL_LEAVES_RETAINED_SIX_SOURCE_LEAF_COMPOSITION_PENDING',wholeHallAccepted:false,visualAcceptance:'VERIFY_PENDING'};
 const mats=[],geos=[],groups=[],textures=[];
 try{
  for(const[name,color]of[['red',0x9f4933],['dark',0x655f52],['masonry',0xaaa69a]])mats.push(new T.MeshStandardMaterial({name:'wuying-south-window-'+name+'-fit',color,roughness:.87}));
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=768;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Wuying lattice requires canvas context');
  ctx.fillStyle='#655f52';ctx.fillRect(0,0,256,768);
  // Original overlapping curved loops, not copied image pixels or exact carved nodes.
  // Radius exceeds half-pitch: neighboring outlines CROSS instead of merely
  // touching as a honeycomb; the source has interlaced curved members.
  const pitch=76,rowHeight=pitch*Math.sqrt(3)/2,r=pitch*.62;
  for(let row=-1;row<=13;row++)for(let col=-1;col<=4;col++){
   const x=col*pitch+(row%2)*pitch/2,y=row*rowHeight;
   ctx.beginPath();ctx.moveTo(x+r,y);
   for(let k=0;k<6;k++){const a=(k+1)*Math.PI/3,mid=(k+.5)*Math.PI/3;ctx.quadraticCurveTo(x+r*1.30*Math.cos(mid),y+r*1.30*Math.sin(mid),x+r*Math.cos(a),y+r*Math.sin(a));}
   ctx.closePath();ctx.lineJoin='round';ctx.lineWidth=5;ctx.strokeStyle='#843f2e';ctx.stroke();ctx.lineWidth=2.5;ctx.strokeStyle='#b85d42';ctx.stroke();
  }
  const map=new T.CanvasTexture(canvas);textures.push(map);map.name='wuying-south-curved-cell-original-vector';map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
  const finish=new T.MeshStandardMaterial({name:'wuying-south-window-curved-cell-fit',map,color:0xffffff,roughness:.87});finish.userData={originalProceduralArt:true,exactCarving:false,textureBytesRGBA8:256*768*4};mats.push(finish);
  for(let i=0;i<4;i++){
   const old=sources[i],g=new T.Group();groups.push(g);g.name='wuying-south-window-bay-'+indices[i];g.position.copy(old.position);g.userData={...meta,wuyingWindowBay:indices[i]};
   const b=new T.Box3().setFromBufferAttribute(old.geometry.attributes.position),a=b.min.x,d=b.max.x,c=b.min.y,h=b.max.y,e=b.min.z,j=b.max.z,cut=e+.025;
   const mesh=(geo,mi,role,leaf=null)=>{geos.push(geo);const m=new T.Mesh(geo,mats[mi]);m.name='wuying-south-window-'+role;m.castShadow=m.receiveShadow=true;m.userData={...meta,wuyingWindowRole:role,leaf,bay:indices[i]};g.add(m);return m;};
   const box=(role,mi,x0,x1,y0,y1,z0=e,z1=cut,leaf=null)=>mesh(boxGeometry(x0,x1,y0,y1,z0,z1),mi,role,leaf);
   // Complete source slab remains solid behind the shallow front composition.
   box('continuous-backing',1,a,d,c,h,cut-.002,j);
   const sill=c+.82,frame=.055;
   box('masonry-sill',2,a,d,c,sill);box('lower-sill-rail',0,a,d,sill,sill+.065);
   for(let leaf=0;leaf<4;leaf++){
    const x0=a+(d-a)*leaf/4,x1=a+(d-a)*(leaf+1)/4;
    box('leaf-backing',1,x0,x1,sill,h,e+.018,cut+.001,leaf);
    for(const xx of[x0,x1-frame])box('leaf-stile',0,xx,xx+frame,sill,h,e,cut,leaf);
    for(const yy of[sill,h-frame])box('leaf-rail',0,x0,x1,yy,yy+frame,e,cut,leaf);
    const field=box('curved-lattice-surface',3,x0+frame,x1-frame,sill+frame,h-frame,e,cut,leaf);
    const uv=field.geometry.attributes.uv;for(const group of field.geometry.groups)if(group.materialIndex!==5)for(let n=group.start;n<group.start+group.count;n++){const ix=field.geometry.index.getX(n);uv.setXY(ix,.01,.01);}uv.needsUpdate=true;
   }
  }
 }catch(error){for(const g of geos)g.dispose();for(const m of mats)m.dispose();for(const t of textures)t.dispose();throw error;}
 for(const g of groups)f.add(g);for(const m of sources){f.remove(m);m.geometry.dispose();}
 for(const m of mats)if(m.map)m.addEventListener('dispose',()=>m.map.dispose());
 kit.owned.push(...mats);f.userData.wuyingSouthWindows=meta;s.wuyingSouthWindows=meta;return meta;
}
export function finishWuyingSouthWindows(kit){const frames=kit.root.children.filter(f=>f.userData.structure?.profile==='wuying-front');if(!frames.length)return false;if(frames.length!==1)throw Error('Duplicate Wuying window host');return applyWuyingSouthWindows(kit,frames[0]);}
