import * as T from 'three';
const ID='dafotang-main-plaque-modern-semantic-fit-v1',PLACE='place-outer-west-6cae88b6a2';
const OFFSET=new T.Vector3(221.9,0,241.1),installed=new WeakSet();
const PATH='textures/dafotang/wanshou-wujiang-modern-tc-r259.png';
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?('value'in d&&d.writable):Object.isExtensible(o)&&!(k in o);};
const identity=o=>o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));
function metadata(){return{id:ID,status:'HISTORICAL_MAIN_PLAQUE_MODERN_SEMANTIC_APPROXIMATION',text:'萬壽無疆',visualLeftToRight:'疆無壽萬',
 sourceUrls:['https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf','https://img.dpm.org.cn/Uploads/File/2018/06/04/u5b153792a88ab.pdf'],sourcePages:['2015:printed306-307:fig24','2014:printed080'],
 dimensions:{width:3.865,height:1.44,thickness:.045,unit:'m',basis:'SOURCE_TOTAL_OUTSIDE_ENVELOPE_INCLUDING_FRAME'},
 mount:{position:[0,7.25,4.4],normal:[0,0,-1],status:'MODEL_FIT_NOT_SURVEY'},
 representation:'ONE_PLAIN_BACK_BOARD_AND_ONE_SINGLE_SIDED_MODERN_TC_RASTER_FRONT',font:'Noto Sans CJK TC Regular2.004; TTC face3; modern lettering, not Kangxi calligraphy',
 asset:{path:PATH,sourceLicensePath:'textures/dafotang/wanshou-wujiang-modern-tc-r259.SOURCE-LICENSE.txt',sha256:'8b814c7439788f2eb0f4bedbe08f7e674de18120d0bb4f1d38e1175943f8e70e',width:768,height:286,required:true},
 runtimeStateLocation:'RETAINED_MESH_AND_MATERIAL_USER_DATA',runtimeMeshNames:[ID+'/body',ID+'/front'],runtimeMaterialNames:[ID+'/body-material',ID+'/front-material'],
 unmodeled:['historical brushwork and embroidery','dragon border, seals and inscription','measured hanging height/depth/hardware','historical reverse'],
 fitted:['mount and south-facing orientation','plain frame bands, colour and reverse'],currentMuseumInventoryVerified:false,wholeHallComplete:false,
 collision:'DECORATIVE_ONLY_NO_SUPPORT_OR_BLOCKING; flying camera may pass through',newColliders:0,newWalkables:0,newRooms:0};}

/** Two geometries only. Materials/map are borrowed. Internal raster bands never
 * expand the sourced TOTAL envelope. +X is a south viewer's left. */
export function createDafotangMainPlaque({materials}={}){
 if(!materials?.body?.isMaterial||!materials?.front?.isMaterial||materials.body===materials.front||materials.body.map||!materials.front.map?.isTexture||materials.front.side!==T.FrontSide)throw Error('Distinct plain body and single-front textured materials required');
 const group=new T.Group(),meshes=[],geometries=[],released=new Set();group.name=ID;
 const keep=g=>{geometries.push(g);g.addEventListener('dispose',()=>released.add(g));return g;};
 const dispose=()=>{for(const m of meshes)m.removeFromParent();group.removeFromParent();for(const g of geometries)if(!released.has(g))g.dispose();};
 try{
  const body=new T.Mesh(keep(new T.BoxGeometry(3.865,1.44,.045)),materials.body);body.position.set(0,7.25,4.4);meshes.push(body);
  const front=new T.Mesh(keep(new T.PlaneGeometry(3.865,1.44)),materials.front);front.rotation.y=Math.PI;front.position.set(0,7.25,4.3775);meshes.push(front);
  for(const[m,role]of[[body,'body'],[front,'front']]){m.name=ID+'/'+role;m.userData={noMerge:true,dafotangMainPlaqueRole:role};m.visible=false;m.castShadow=false;m.receiveShadow=true;group.add(m);}
  const meta=metadata();group.userData.dafotangMainPlaque=meta;return{group,meshes,metadata:meta,dispose};
 }catch(error){dispose();throw error;}
}
function bounds(m){const p=m.geometry?.attributes?.position;if(!p||p.itemSize!==3||!p.count)throw Error('Actual retained leaf geometry required');const b=new T.Box3().setFromBufferAttribute(p).applyMatrix4(m.matrixWorld);if(b.isEmpty()||![...b.min.toArray(),...b.max.toArray()].every(Number.isFinite))throw Error('Finite retained leaf bounds required');return b;}
function validate(c){const{kit,f,g,p}=c??{};
 if(installed.has(f)||g?.mainPlaqueFit)throw Error('Dafotang main plaque already installed; once only');
 if(p?.id!==PLACE||p.key!=='dafotang'||p.zone!=='outer-west'||g?.id!==PLACE||g.w!==45.7||g.d!==16.2||g.y!==.9||g.h!==7.84||g.bays!==7||g.front!==-8.1||g.rear!==8.1||g.inventory?.status!=='UNKNOWN'||g.historicalPrincipal?.id!=='dafotang-shakyamuni-historical-fit'||g.historicLayout?.id!=='dafotang-historic-spatial-fit-v1'||g.eastCabinetsFit?.id!=='dafotang-east-cabinets-source-fit-v1'||!writable(g,'mainPlaqueFit')||!f||f.parent!==kit?.root||kit.root.name!=='outer-west'||kit.root.parent||!identity(kit.root)||!f.position.equals(OFFSET)||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||[f,kit.root].some(o=>!o.visible||!o.matrixAutoUpdate||!o.matrixWorldAutoUpdate)||!mutable(f.children)||!mutable(kit.owned)||!mutable(kit.colliders)||!(kit.ownedTextures===undefined?writable(kit,'ownedTextures'):mutable(kit.ownedTextures)))throw Error('Exact writable unchanged Dafotang host required');
 const shrine=f.children.filter(o=>o.name===g.historicLayout.id);if(shrine.length!==1||!identity(shrine[0])||!shrine[0].visible||!shrine[0].matrixAutoUpdate||!shrine[0].matrixWorldAutoUpdate||shrine[0].userData.dafotangHistoricLayout!==g.historicLayout)throw Error('Unique retained shrine owner required');
 // Refresh Object3D matrix caches/dirty flags only; never populate old geometry bounds.
 f.updateWorldMatrix(true,true);const counts={'dafotang-plain-ceiling':0,'dafotang-transverse-ceiling-frame':0,'dafotang-longitudinal-ceiling-frame':0};
 const candidate=new T.Box3(new T.Vector3(-1.9325,6.53,4.3775),new T.Vector3(1.9325,7.97,4.4225)).translate(OFFSET);let top=0;
 f.traverse(m=>{if(!m.isMesh)return;if(m.name in counts)counts[m.name]++;const b=bounds(m);if(m.userData.dafotangLayoutRole==='upper-front-entablature'){top++;if([[b.min.x-OFFSET.x,-2.5],[b.max.x-OFFSET.x,2.5],[b.min.y,6.23],[b.max.y,6.45],[b.min.z-OFFSET.z,4.41],[b.max.z-OFFSET.z,4.69]].some(([a,want])=>Math.abs(a-want)>2e-6))throw Error('Retained shrine top envelope changed');}if(b.intersectsBox(candidate))throw Error('Main plaque intersects retained leaf geometry');});
 if(top!==1||counts['dafotang-plain-ceiling']!==1||counts['dafotang-transverse-ceiling-frame']!==6||counts['dafotang-longitudinal-ceiling-frame']!==2)throw Error('Actual retained ceiling and beam leaves required before main plaque');
}
/** Atomic additive install; two noMerge leaves survive the synchronous keep
 * branch. Static architecture metadata is not a live clone of runtime state. */
export function buildDafotangMainPlaque(c,{imageLoader,baseURL=import.meta.env?.BASE_URL??'/'}={}){
 validate(c);if(typeof baseURL!=='string'||!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(baseURL))throw Error('Same-origin Vite base path required');
 const{kit,f,g}=c,prior={children:[...f.children],owned:[...kit.owned],textureDescriptor:Object.getOwnPropertyDescriptor(kit,'ownedTextures'),textures:kit.ownedTextures?[...kit.ownedTextures]:null,metadata:Object.getOwnPropertyDescriptor(g,'mainPlaqueFit')};
 const state={status:'loading',error:null},materials=[],released=new Set();let texture,out,published=false,manualDisposed=false;
 const terminal=()=>{state.status='disposed';for(const m of materials)m.visible=false;for(const m of out?.meshes??[])m.visible=false;};
 const stop=()=>{terminal();out?.dispose();};
 const track=r=>{r.addEventListener('dispose',()=>{released.add(r);stop();});return r;};
 const release=()=>{stop();for(const m of materials)if(!released.has(m))m.dispose();if(texture&&!released.has(texture))texture.dispose();};
 const detachOwners=()=>{for(const m of materials){const i=kit.owned.indexOf(m);if(i>=0)Array.prototype.splice.call(kit.owned,i,1);}if(kit.ownedTextures){const i=kit.ownedTextures.indexOf(texture);if(i>=0)Array.prototype.splice.call(kit.ownedTextures,i,1);if(!prior.textureDescriptor&&!kit.ownedTextures.length)delete kit.ownedTextures;}};
 const dispose=()=>{if(manualDisposed)return;manualDisposed=true;detachOwners();release();};
 const failed=()=>{if(state.status!=='loading')return;state.status='failed';state.error='PNG_LOAD_OR_DECODE_FAILED';for(const m of materials)m.visible=false;for(const m of out.meshes)m.visible=false;};
 const close=image=>{try{image?.close?.();}catch{/* No owned resources can be resurrected by an image close failure. */}};
 try{
  texture=track(new T.Texture());texture.colorSpace=T.SRGBColorSpace;texture.flipY=true;
  for(const params of[{name:ID+'/body-material',color:0x66503c,roughness:.9,metalness:0,visible:false},{name:ID+'/front-material',color:0xffffff,map:texture,side:T.FrontSide,roughness:.9,metalness:0,visible:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}])materials.push(track(new T.MeshStandardMaterial(params)));
  out=createDafotangMainPlaque({materials:{body:materials[0],front:materials[1]}});
  // Geometry disposal may occur inside the host's traversal: only mark/hide,
  // never detach children or dispose a sibling from this event.
  for(const m of out.meshes)m.geometry.addEventListener('dispose',terminal);
  for(const m of materials)m.userData.dafotangMainPlaqueState=state;for(const m of out.meshes)m.userData.dafotangMainPlaqueState=state;
  f.add(out.group);kit.owned.push(...materials);(kit.ownedTextures??=[]).push(texture);g.mainPlaqueFit=out.metadata;installed.add(f);published=true;
  (imageLoader??new T.ImageLoader()).load(baseURL+PATH,image=>{
   if(state.status!=='loading'){if((state.status==='disposed'||state.status==='failed')&&image!==texture.image)close(image);return;}
   try{
    if(!image||image.complete===false||(image.naturalWidth??image.width)!==768||(image.naturalHeight??image.height)!==286)throw Error('Decoded PNG dimensions required');
    texture.image=image;texture.needsUpdate=true;for(const m of materials)m.visible=true;for(const m of out.meshes)m.visible=true;state.status='ready';
   }catch{if(texture.image===image)texture.image=null;failed();close(image);}
  },undefined,failed);
  return{group:out.group,meshes:out.meshes,metadata:out.metadata,state,texture,dispose};
 }catch(error){
  if(out?.group.parent===f)out.group.parent=null;Array.prototype.splice.call(f.children,0,f.children.length,...prior.children);for(const child of prior.children)child.parent=f;
  Array.prototype.splice.call(kit.owned,0,kit.owned.length,...prior.owned);
  if(prior.textureDescriptor){Object.defineProperty(kit,'ownedTextures',prior.textureDescriptor);Array.prototype.splice.call(kit.ownedTextures,0,kit.ownedTextures.length,...prior.textures);}else delete kit.ownedTextures;
  if(prior.metadata)Object.defineProperty(g,'mainPlaqueFit',prior.metadata);else delete g.mainPlaqueFit;if(published)installed.delete(f);release();throw error;
 }
}
