import * as T from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';

const PAGE='https://www.dpm.org.cn/explore/building/236531.html';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b70481d5f.jpg';
const close=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
const events=o=>!o._listeners||Object.values(o._listeners).every(a=>a.length===0);
const canonical=o=>o.visible&&o.matrixAutoUpdate&&o.matrixWorldAutoUpdate&&o.scale.equals(new T.Vector3(1,1,1))&&!o.rotation.x&&!o.rotation.z;
const writable=(o,k)=>{if(!Object.isExtensible(o))return false;for(let p=o;p;p=Object.getPrototypeOf(p))if(Object.getOwnPropertyDescriptor(p,k))return false;return true;};
const writableData=(o,k)=>{if(!Object.isExtensible(o))return false;for(let p=o;p;p=Object.getPrototypeOf(p)){const d=Object.getOwnPropertyDescriptor(p,k);if(d)return 'value'in d&&d.writable===true;}return true;};
function resources(g){return[g,...[g.index,...Object.values(g.attributes??{}),...Object.values(g.morphAttributes??{}).flat()].flatMap(a=>a?[a,a.data,a.array,a.data?.array,a.array?.buffer,a.data?.array?.buffer].filter(Boolean):[])];}
function exactGeometry(a,b){return a&&a.morphTargetsRelative===b.morphTargetsRelative&&!Object.keys(a.morphAttributes).length&&a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.count===b.index.count&&a.index.array.every((n,i)=>n===b.index.array[i]));}

/** The documented SIX south central leaves only. Two outer closed leaves and
 * four folded leaves are a reversible public-route pose, NOT a measured hinge
 * pose or visitor-access claim. Front/rear halls, exhibits and floor datum stay.
 * Call after finishWenhuaSouthWindows, before the ordinary CourtKit merge.
 */
export function applyWenhuaCentralDoors(kit,f){
 const s=f?.userData.structure;
 if(kit?.root.name!=='outer-east'||kit.root.parent!==null||kit.root.position.lengthSq()||!canonical(kit.root)||kit.root.rotation.y||f?.parent!==kit.root||!canonical(f)||f.rotation.y||!close(f.position.x,-186.4)||!close(f.position.z,-199)||f.position.y||s?.id!=='outer-east/wenhua-front'||s.profile!=='wenhua-front'||s.w!==30.8||s.d!==17||s.ph!==1.2||s.bays!==5||!writable(f.userData,'wenhuaCentralDoors')||!writable(s,'wenhuaCentralDoors')||!events(f))throw Error('Exact registered Wenhua central door host required');
 const windowMeta=f.userData.wenhuaSouthWindows;
 if(windowMeta&&!writableData(windowMeta,'centralDoors'))throw Error('Wenhua existing south-window metadata is read-only');
 const bay=30.8/5,height=(7.68-.85)*.8,floor=1.2,doorZ=-8.5,oldZ=doorZ+bay*.13+.2;
 const material=kit.lib.material('lattice_doors'),sources=f.children.filter(m=>m.isMesh&&m.material===material&&close(m.position.z,oldZ));
 const materialSource=material.map===(kit.lib.colors instanceof Map?kit.lib.colors.get('lattice_doors')??null:null)&&material.normalMap===(kit.lib.normals instanceof Map?kit.lib.normals.get('lattice_doors')??null:null)&&['aoMap','lightMap','bumpMap','roughnessMap','metalnessMap','emissiveMap','envMap','displacementMap'].every(k=>material[k]===null)&&material.color.getHex()===0xffffff&&material.emissive.getHex()===0&&material.metalness===0&&material.normalScale.equals(new T.Vector2(1,1));
 if(!materialSource||sources.length!==2||!material.isMeshStandardMaterial||material.transparent||material.opacity!==1||material.side!==T.FrontSide||!material.visible||!material.depthWrite||!material.depthTest||material.alphaTest||material.alphaMap||material.displacementMap||material.onBeforeCompile!==T.Material.prototype.onBeforeCompile||material.customProgramCacheKey!==T.Material.prototype.customProgramCacheKey)throw Error('Wenhua two original south open leaves required');
 for(let i=0;i<2;i++){
  const m=sources[i],g=applyBandUV(new T.BoxGeometry(bay*.26,height,.1),kit.lib.tileSize('lattice_doors'));let valid;
  try{valid=m.name===''&&canonical(m)&&close(m.rotation.y,Math.PI/2)&&close(m.position.x,(i?1:-1)*(bay/2-.34-.08))&&close(m.position.y,floor+height/2)&&!m.children.length&&!Object.keys(m.userData).length&&exactGeometry(m.geometry,g)&&events(m)&&events(m.geometry);}finally{g.dispose();}
  if(!valid)throw Error('Wenhua original south leaf changed: '+i);
 }
 const owners=new Map();for(const m of sources)for(const resource of resources(m.geometry)){if(owners.has(resource)&&owners.get(resource)!==m)throw Error('Wenhua source leaf resources shared');owners.set(resource,m);}
 kit.root.traverse(o=>{if(o.geometry)for(const resource of resources(o.geometry))if(owners.has(resource)&&owners.get(resource)!==o)throw Error('Wenhua source leaf resource borrowed');});
 const meta={entityId:'FC-CD0B5AC9DE',sourcePage:PAGE,photo:PHOTO,photographyDate:null,scope:'SOUTH_CENTRAL_SIX_LEAF_ENSEMBLE_ONLY',leaves:6,countAuthority:'OFFICIAL_BUILDING_TEXT_SIX_DOORS_NOT_A_WINDOW_COUNT',pose:'TWO_OUTER_CLOSED_FOUR_FOLDED_REVERSIBLE_ACCESS_FIT_NOT_MEASURED_PHOTO_POSE',lattice:'THREE_DIRECTION_OUTLINE_NOT_EXACT_CARVED_SIX_BOWL',dimensions:'RETAINED_BAY_AND_HEIGHT_ENVELOPE_DIVIDED_IN_SIX_NOT_SURVEY',surface:'RED_OUTER_AND_TWO_VISIBLE_WEATHERED_INNER_LEAF_COLOR_FIT_HIDDEN_LEAF_SURFACES_UNVERIFIED',physics:'SIX_MATCHING_THIN_LEAF_BOXES_ADDED_EXISTING_COLLIDERS_AND_ALL_FLOORS_RETAINED',clearWidth:2*(bay/2-.34-(bay-.68)/6),accepted:false,visualAcceptance:'VERIFY_PENDING',unverified:['exact hinge angles and hidden-leaf pose','exact carved repeat-unit topology and paint','side/rear facades and current exhibition inventory','GPU/device performance and whole-courtyard acceptance']};
 const groups=[],geometries=[],materials=[],colliders=[];
 const width=(bay-.68)/6,half=(bay-.68)/2;
 try{
  for(const[name,color]of[['red',0x983b2d],['aged',0x8c6559],['dark',0x332a26]])materials.push(new T.MeshStandardMaterial({name:'wenhua-central-door-'+name+'-fit',color,roughness:.87}));
  for(let leaf=0;leaf<6;leaf++){
   // Half the .10m leaf thickness joins the folded depth to the closed leaf
   // at a shared plane, without the former .03m corner-volume penetration.
   const side=leaf<3?-1:1,part=leaf%3,g=new T.Group();groups.push(g);g.name='wenhua-central-six-leaf-'+leaf;g.userData={wenhuaCentralDoorLeaf:leaf,pose:part===0?'CLOSED_SIDE_LEAF_FIT':'FOLDED_SIDE_LEAF_FIT',...meta};g.position.set(side*(part===0?half-width/2:half-width+.06+(part-1)*.14),floor+height/2,part===0?doorZ:doorZ+width/2+.05);g.rotation.y=part===0?0:side*Math.PI/2;
   const color=part===1?1:0;
   const mesh=(geo,mi,role)=>{geometries.push(geo);const m=new T.Mesh(geo,materials[mi]);m.name='wenhua-central-'+role;m.castShadow=m.receiveShadow=true;m.userData={wenhuaDoorRole:role,leaf};g.add(m);return m;};
   const box=(role,mi,w,h,d,x,y,z)=>{const geo=new T.BoxGeometry(w,h,d);geo.translate(x,y,z);return mesh(geo,mi,role);};
   // Complete opaque solid backing avoids transparent/false lattice passages.
   box('continuous-leaf-backing',2,width,height,.075,0,0,.0125);
   const bottom=-height/2,top=height/2,lower=bottom+height*.28,rail=.065,stile=.055,z=-.0375;
   box('lower-panel',color,width-.08,lower-bottom,.025,0,(bottom+lower)/2,z);
   for(const x of[-width/2+stile/2,width/2-stile/2])box('stile',color,stile,height,.025,x,0,z);
   for(const y of[bottom+rail/2,lower,top-rail/2])box('rail',color,width-2*stile,rail,.025,0,y,z);
   // Photograph supports three-direction lattice rhythm. This is explicitly a
   // contour fit, not invented carving or a borrowed palace's exact pattern.
   const hx=width/2-stile-.025,hy=(top-rail/2-lower-rail/2)/2-.025,cy=(top+lower)/2,pitch=.19;
   for(const degree of[0,60,-60]){
    const angle=degree*Math.PI/180,dir=[Math.cos(angle),Math.sin(angle)],normal=[-dir[1],dir[0]],reach=Math.abs(normal[0])*hx+Math.abs(normal[1])*hy;
    for(let k=Math.ceil(-reach/pitch);k<=Math.floor(reach/pitch);k++){
     const p=[normal[0]*k*pitch,normal[1]*k*pitch];let lo=-Infinity,hi=Infinity;
     for(let a=0;a<2;a++){const h=a?hy:hx;if(Math.abs(dir[a])<1e-8){if(Math.abs(p[a])>h){lo=1;hi=0;break;}}else{const u=(-h-p[a])/dir[a],v=(h-p[a])/dir[a];lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));}}
     if(hi-lo<.02)continue;const geo=new T.BoxGeometry(hi-lo,.018,.025);geo.rotateZ(angle);geo.translate(p[0]+dir[0]*(hi+lo)/2,cy+p[1]+dir[1]*(hi+lo)/2,z);mesh(geo,color,'lattice-bar').userData.direction=degree;
    }
   }
   g.updateMatrix();const collider=new T.Box3(new T.Vector3(-width/2,-height/2,-.05),new T.Vector3(width/2,height/2,.05));collider.applyMatrix4(g.matrix).translate(f.position);colliders.push(collider);
  }
 }catch(error){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw error;}
 for(const g of groups)f.add(g);
 for(const m of sources){f.remove(m);m.geometry.dispose();}
 kit.colliders.push(...colliders);kit.owned.push(...materials);f.userData.wenhuaCentralDoors=meta;s.wenhuaCentralDoors=meta;
 if(f.userData.wenhuaSouthWindows)f.userData.wenhuaSouthWindows.centralDoors='SIX_SOURCE_COUNTED_LEAVES_FITTED_OPEN_POSE_SEE_WENHUA_CENTRAL_DOORS';
 return meta;
}
export function finishWenhuaCentralDoors(kit){const fs=kit.root.children.filter(f=>f.userData.structure?.profile==='wenhua-front');if(!fs.length)return false;if(fs.length!==1)throw Error('Duplicate Wenhua central door host');return applyWenhuaCentralDoors(kit,fs[0]);}
