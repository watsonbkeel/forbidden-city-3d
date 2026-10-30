import * as T from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236475.html';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997ce692053.jpg';
const scalar=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
function geometryEqual(a,b){return a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.itemSize===b.index.itemSize&&a.index.normalized===b.index.normalized&&a.index.array.constructor===b.index.array.constructor&&a.index.count===b.index.count&&a.index.array.every((v,i)=>v===b.index.array[i]));}
function canonical(o){return o.visible===true&&o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.scale.equals(new T.Vector3(1,1,1));}
function meshMatches(m,{name,w,h,d,x,y,z,material,rotation=0,band},kit){if(!m?.isMesh||m.name!==name||!canonical(m)||m.children.length||m.rotation.x||m.rotation.z||m.rotation.y!==rotation||!scalar(m.position.x,x)||!scalar(m.position.y,y)||!scalar(m.position.z,z)||m.material!==material||!material||Array.isArray(material)||material.visible===false||material.opacity===0)return false;let ref=new T.BoxGeometry(w,h,d);try{if(band)ref=applyBandUV(ref,kit.lib.tileSize('lattice_doors'));return geometryEqual(m.geometry,ref);}finally{ref.dispose();}}
function canAddMetadata(record){if(!Object.isExtensible(record))return false;for(let o=record;o;o=Object.getPrototypeOf(o))if(Object.getOwnPropertyDescriptor(o,'taijiSouthVisual'))return false;return true;}
function geometryResources(g){if(!g)return [];const attributes=[g.index,...Object.values(g.attributes??{}),...Object.values(g.morphAttributes??{}).flat()];return [g,...attributes.flatMap(a=>a?[a,a.data,a.array,a.data?.array,a.array?.buffer,a.data?.array?.buffer].filter(Boolean):[])];}
function assertUnborrowedWindows(root,targets){const owners=new Map();for(const {g}of targets)for(const mesh of g.children)for(const resource of geometryResources(mesh.geometry)){if(owners.has(resource)&&owners.get(resource)!==mesh)throw Error('Taiji retired window resource borrowed by another source');owners.set(resource,mesh);}root.traverse(object=>{for(const resource of geometryResources(object.geometry))if(owners.has(resource)&&owners.get(resource)!==object)throw Error('Taiji retired window resource borrowed elsewhere in kit');});}
function textureMaterial(kit,name,draw){const canvas=typeof document==='undefined'?null:document.createElement('canvas');if(canvas){canvas.width=256;canvas.height=256;}const context=canvas?.getContext('2d');if(context)draw(context,256);const texture=context?new T.CanvasTexture(canvas):null;if(texture){texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;texture.name=name+'-simplified-pattern';}const material=new T.MeshStandardMaterial({name,color:0xffffff,map:texture,roughness:.84,transparent:false,opacity:1,depthWrite:true});material.userData={source:PHOTO,exactCarving:false,textureBytesRGBA8:texture?256*256*4:0};material.addEventListener('dispose',()=>texture?.dispose());kit.owned.push(material);return material;}
function stepPattern(c,n){c.fillStyle='#221f1a';c.fillRect(0,0,n,n);c.strokeStyle='#982e25';c.lineWidth=5;for(let col=0;col<2;col++){const x=col*n/2;for(const inset of[10,25])c.strokeRect(x+inset,18+inset,n/2-2*inset,n-36-2*inset);for(const y of[18, n-18]){c.beginPath();c.moveTo(x,y);c.lineTo(x+n/2,y);c.stroke();}}c.lineWidth=2;c.strokeStyle='#b39558';c.strokeRect(2,2,n-4,n-4);}
function glassPattern(c,n){c.fillStyle='#252a28';c.fillRect(0,0,n,n);c.fillStyle='#343b36';c.fillRect(n*.06,n*.06,n*.88,n*.88);c.strokeStyle='#997f48';c.lineWidth=2;c.strokeRect(2,2,n-4,n-4);/* tonal glass fit, not a photographed reflection or transparent passage */}
function doorPattern(c,n){c.fillStyle='#41372b';c.fillRect(0,0,n,n);c.strokeStyle='#947b45';c.lineWidth=3;for(const[y,h]of[[.04,.49],[.59,.11],[.75,.21]]){c.strokeRect(n*.07,n*y,n*.86,n*h);c.strokeRect(n*.12,n*(y+.02),n*.76,n*(h-.04));}c.lineWidth=1;for(let y=12;y<n*.51;y+=12)for(let x=16;x<n-12;x+=18){c.strokeRect(x,y,10,8);}/* schematic lattice/panel finish only; exact longevity carving unverified */}
/** Visual-only: neither this function nor its helpers create/remove/update a
 * collider, walkable, source surface, scope, room, map or navigation record. */
export function applyTaijiSouthVisual(kit,item,f,p){
 if(p?.key!=='taiji-front'||kit.root.name!=='west-six'||item.name!=='太极殿'||item.x!==150.2||item.z!==329.9||item.w!==27.1||item.d!==13.8||item.ph!==.6||item.colH!==6.72||item.enter!==true||item.rot!==undefined||f.parent!==kit.root||!canonical(kit.root)||kit.root.parent!==null||kit.root.position.lengthSq()||kit.root.rotation.x||kit.root.rotation.y||kit.root.rotation.z||!canonical(f)||!scalar(f.position.x,150.2)||!scalar(f.position.z,329.9)||f.position.y||f.rotation.x||f.rotation.y||f.rotation.z||f.userData.structure?.profile!=='taiji-front'||f.userData.taijiSouthVisual)throw Error('Exact canonical Taiji south visual host required');
 if(!canAddMetadata(f.userData)||!canAddMetadata(f.userData.structure))throw Error('Writable Taiji visual metadata required');
 const bay=27.1/5,width=bay-.68,height=(6.72-6.72*.12)*.8,floor=.6,z=-5.3,upper=height-.95,mid=floor+.95+upper/2,wood=kit.lib.material('wood_column'),paper=kit.owned.find(m=>m.name==='r48_taiji-front_schematic_lattice'),brick=kit.lib.material('wall_brick');
 const groups=f.children.filter(g=>g.name==='r48-residential-window'&&g.userData.side===-1);if(groups.length!==4)throw Error('Taiji requires exactly four original south windows');
 const expectedIndices=[0,1,3,4],targets=[];
 for(const[index,g]of groups.entries()){
  const bayIndex=expectedIndices[index],x=-27.1/2+(bayIndex+.5)*bay;
  if(g.userData.bayIndex!==bayIndex||g.userData.catalogId!=='place-west-six-bbdb208a58'||!canonical(g)||g.position.lengthSq()||g.rotation.x||g.rotation.y||g.rotation.z||g.children.length!==9)throw Error('Taiji original closed window identity changed');
  const rows=[['sill',width,.95,.38,x,floor+.475,z,brick],['panel',width-.12,upper-.08,.06,x,mid,z,paper],...[-1,1].map(s=>['jamb',.12,upper,.16,x+s*(width-.12)/2,mid,z-.055,wood]),...[floor+.95+.05,floor+height-.05].map(y=>['rail',width,.1,.16,x,y,z-.055,wood]),...[1,2].map(k=>['mullion',.08,upper,.13,x-width/2+k*width/3,mid,z-.06,wood]),['transom',width,.09,.13,x,floor+.95+upper*.48,z-.06,wood]];
  for(let k=0;k<rows.length;k++){const[role,w,h,d,x,y,z,material]=rows[k];if(!meshMatches(g.children[k],{name:'r48-residential-window-'+role,w,h,d,x,y,z,material},kit))throw Error('Taiji original window source differs: '+bayIndex+'/'+role);}
  targets.push({g,x,bayIndex});
 }
 const doorMaterial=kit.lib.material('lattice_doors'),leaves=f.children.filter(m=>m.isMesh&&m.material===doorMaterial&&m.rotation.y===Math.PI/2&&m.position.z<0);
 if(leaves.length!==2)throw Error('Taiji requires two retained operational south leaves');
 for(const[index,m]of leaves.entries()){if(!['material','userData'].every(k=>Object.getOwnPropertyDescriptor(m,k)?.writable===true))throw Error('Writable retained leaf finish required');const sign=index===0?-1:1;if(!meshMatches(m,{name:'',w:bay*.26,h:height,d:.1,x:sign*(bay/2-.34-.08),y:floor+height/2,z:z+bay*.13+.2,material:doorMaterial,rotation:Math.PI/2,band:true},kit))throw Error('Taiji original open leaf source changed');}
 assertUnborrowedWindows(kit.root,targets);
 const startOwned=kit.owned.length,staged=[];
 try{
  const stepped=textureMaterial(kit,'taiji-south-stepped-upper-fit',stepPattern),glass=textureMaterial(kit,'taiji-south-rectangular-glazing-fit',glassPattern),door=textureMaterial(kit,'taiji-south-open-door-panel-fit',doorPattern),red=new T.MeshStandardMaterial({name:'taiji-south-red-frame-fit',color:0x873b2c,roughness:.85}),gold=new T.MeshStandardMaterial({name:'taiji-south-painted-outline-fit',color:0xb49252,roughness:.8});kit.owned.push(red,gold);
  // Retain original band UVs, but fit this private full-panel texture to one leaf.
  if(door.map){door.map.repeat.set(kit.lib.tileSize('lattice_doors')/(bay*.26),1);door.map.offset.set(.5,0);door.map.updateMatrix();}

  const put=(g,role,w,h,d,x,y,z,material)=>{const geo=new T.BoxGeometry(w,h,d);let m;try{m=kit.mesh(g,geo,material,x,y,z)}catch(error){geo.dispose();throw error;}m.name='taiji-south-'+role;m.userData={taijiVisualRole:role,source:PHOTO,fit:'REVERSIBLE_VISUAL_FIT_PHYSICS_UNCHANGED'};return m;};
  for(const{g:old,x,bayIndex}of targets){const g=new T.Group();g.name=old.name;g.userData={...old.userData,taijiWindow:{bayIndex,panelCount:3,panelCountStatus:'RETAINED_MODEL_COUNT_NOT_MEASURED_SURVEY',exactCarving:false,scope:'ORIGINAL_WINDOW_ENVELOPE_VISUAL_ONLY'}};staged.push(g);
   // Preserve exact original outer frame/sill geometry. Only frame finish changes.
   for(const m of [old.children[0],...old.children.slice(2,6)]){const geo=m.geometry.clone();let copy;try{copy=kit.mesh(g,geo,m===old.children[0]?m.material:red,...m.position.toArray())}catch(e){geo.dispose();throw e;}copy.name=m.name;copy.userData={...m.userData,taijiVisualRole:'retained-outer-frame'};}
   const inner=width-.24,divider=.08,field=(inner-2*divider)/3,lo=floor+.95+.1,hi=floor+height-.1,split=lo+(hi-lo)*.52,lowerH=split-lo-.05,upperH=hi-split-.05;
   for(let k=0;k<3;k++){const cx=x-inner/2+field/2+k*(field+divider);
    put(g,'upper-stepped-field',field,upperH,.06,cx,split+.05+upperH/2,z,stepped);
    put(g,'lower-glass-field',field,lowerH,.06,cx,lo+lowerH/2,z,glass);
    for(const sign of[-1,1])put(g,'gold-outline',.018,hi-lo,.018,cx+sign*(field/2-.018), (hi+lo)/2,z-.121,gold);
   }
   for(const sign of[-1,1])put(g,'major-divider',divider,hi-lo,.13,x+sign*(field+divider)/2,(hi+lo)/2,z-.06,red);
   put(g,'full-transom',inner,.10,.13,x,split,z-.06,red);
  }
  // Only now alter the live graph. Physics arrays and existing leaves' geometry
  // and matrices are intentionally untouched, including inherited deficiencies.
  for(let i=0;i<targets.length;i++){f.add(staged[i]);targets[i].g.removeFromParent();}
  for(const m of leaves){m.material=door;m.userData={...m.userData,taijiVisualRole:'retained-open-leaf-finish',source:PHOTO,pose:'UNCHANGED_OPERATIONAL_OPEN_POSE_NOT_PHOTO_CLOSED_COUNT'};}
  const metadata={source:SOURCE,photo:PHOTO,scope:'SOUTH_VISUAL_ONLY_PHYSICS_UNCHANGED',wholePalaceAccepted:false,windowCount:4,openLeafCount:2,textureFit:'SIMPLIFIED_PATTERN_NOT_FINE_CARVING',inheritedPhysics:'UNCHANGED_NOT_UPGRADED_OR_CERTIFIED',unverified:['upper-window/column physical closure','exact window field count/proportions','exact leaf count and closed historic pose','tree-obscured fine details','current exhibition/interior','GPU visual/performance']};f.userData.taijiSouthVisual=metadata;f.userData.structure.taijiSouthVisual=metadata;
  for(const{g}of targets)g.traverse(m=>m.geometry?.dispose());return metadata;
 }catch(error){for(const g of staged)g.traverse(m=>m.geometry?.dispose());for(const m of kit.owned.slice(startOwned))m.dispose();kit.owned.length=startOwned;throw error;}
}
