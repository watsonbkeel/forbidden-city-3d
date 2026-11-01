import * as T from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236518.html';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d39e4779a2.jpg';
const scalar=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
function geometryEqual(a,b){return a.morphTargetsRelative===b.morphTargetsRelative&&Object.keys(a.morphAttributes).length===0&&a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.itemSize===b.index.itemSize&&a.index.normalized===b.index.normalized&&a.index.array.constructor===b.index.array.constructor&&a.index.count===b.index.count&&a.index.array.every((v,i)=>v===b.index.array[i]));}
function canonical(o){return o.visible===true&&o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.scale.equals(new T.Vector3(1,1,1));}
function meshMatches(m,{name,w,h,d,x,y,z,material,rotation=0,band},kit){if(!m?.isMesh||m.name!==name||!canonical(m)||m.children.length||m.rotation.x||m.rotation.z||m.rotation.y!==rotation||!scalar(m.position.x,x)||!scalar(m.position.y,y)||!scalar(m.position.z,z)||m.material!==material||!material||Array.isArray(material)||material.visible===false||material.opacity===0)return false;let ref=new T.BoxGeometry(w,h,d);try{if(band)ref=applyBandUV(ref,kit.lib.tileSize('lattice_doors'));return geometryEqual(m.geometry,ref);}finally{ref.dispose();}}
function canAddMetadata(record){if(!Object.isExtensible(record))return false;for(let o=record;o;o=Object.getPrototypeOf(o))if(Object.getOwnPropertyDescriptor(o,'yongheSouthVisual'))return false;return true;}
function geometryResources(g){if(!g)return [];const attributes=[g.index,...Object.values(g.attributes??{}),...Object.values(g.morphAttributes??{}).flat()];return [g,...attributes.flatMap(a=>a?[a,a.data,a.array,a.data?.array,a.array?.buffer,a.data?.array?.buffer].filter(Boolean):[])];}
function assertUnborrowedWindows(root,targets){const owners=new Map();for(const {g}of targets)for(const mesh of g.children)for(const resource of geometryResources(mesh.geometry)){if(owners.has(resource)&&owners.get(resource)!==mesh)throw Error('Yonghe retired window resource borrowed by another source');owners.set(resource,mesh);}root.traverse(object=>{for(const resource of geometryResources(object.geometry))if(owners.has(resource)&&owners.get(resource)!==object)throw Error('Yonghe retired window resource borrowed elsewhere in kit');});}
function textureMaterial(kit,name,draw){const canvas=typeof document==='undefined'?null:document.createElement('canvas');if(canvas){canvas.width=256;canvas.height=256;}const context=canvas?.getContext('2d');if(context)draw(context,256);const texture=context?new T.CanvasTexture(canvas):null;if(texture){texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;texture.name=name+'-simplified-pattern';}const material=new T.MeshStandardMaterial({name,color:0xffffff,map:texture,roughness:.84,transparent:false,opacity:1,depthWrite:true});material.userData={source:PHOTO,exactCarving:false,textureBytesRGBA8:texture?256*256*4:0};material.addEventListener('dispose',()=>texture?.dispose());kit.owned.push(material);return material;}
function gridPattern(c,n){c.fillStyle='#241d18';c.fillRect(0,0,n,n);c.strokeStyle='#8a3c2b';c.lineWidth=6;for(const inset of[9,27,45]){const a=inset,b=n-inset,step=20;c.beginPath();c.moveTo(a,n*.50);c.lineTo(a,a);c.lineTo(n*.50-step,a);c.lineTo(n*.50-step,a+step);c.lineTo(n*.50+step,a+step);c.lineTo(n*.50+step,a);c.lineTo(b,a);c.lineTo(b,b);c.lineTo(n*.50+step,b);c.lineTo(n*.50+step,b-step);c.lineTo(n*.50-step,b-step);c.lineTo(n*.50-step,b);c.lineTo(a,b);c.lineTo(a,n*.50);c.stroke();}c.strokeStyle='#b59354';c.lineWidth=2;c.strokeRect(2,2,n-4,n-4);/* original stepped rectangular interpretation, not exact traditional carving */}
function glassPattern(c,n){c.fillStyle='#bfc4c2';c.fillRect(0,0,n,n);c.strokeStyle='#737b77';c.lineWidth=3;c.strokeRect(3,3,n-6,n-6);/* pale gray photographic appearance; opaque fit, not measured transmission */}
function doorPattern(c,n){c.fillStyle='#29241f';c.fillRect(0,0,n,n);c.strokeStyle='#514438';c.lineWidth=5;for(const y of[.06,.37,.70])c.strokeRect(n*.09,n*y,n*.82,n*.23);/* abstract dark timber divisions, not a historic leaf count or carving facsimile */}
/** Visual-only: neither this function nor its helpers create/remove/update a
 * collider, walkable, source surface, scope, room, map or navigation record. */
export function applyYongheSouthVisual(kit,item,f,p){
 if(p?.profile!=='yonghe-open-baoxia'||kit.root.name!=='east-six'||item.name!=='永和宫'||item.x!==-149||item.z!==379.1||item.w!==27.8||item.d!==12||item.ph!==.6||item.colH!==6.72||item.enter!==true||item.rot!==undefined||f.parent!==kit.root||!canonical(kit.root)||kit.root.parent!==null||kit.root.position.lengthSq()||kit.root.rotation.x||kit.root.rotation.y||kit.root.rotation.z||!canonical(f)||!scalar(f.position.x,-149)||!scalar(f.position.z,379.1)||f.position.y||f.rotation.x||f.rotation.y||f.rotation.z||f.userData.structure?.profile!=='yonghe-open-baoxia'||f.userData.yongheSouthVisual)throw Error('Exact canonical Yonghe south visual host required');
 if(!canAddMetadata(f.userData)||!canAddMetadata(f.userData.structure))throw Error('Writable Yonghe visual metadata required');
 const bay=27.8/5,width=bay-.68,height=(6.72-6.72*.12)*.8,floor=.6,z=-12/2,upper=height-.9,mid=floor+.9+upper/2,wood=kit.lib.material('wood_column'),originalPanel=kit.owned.filter(m=>m.name==='east_plain_window_panel_fit').at(-1),brick=kit.lib.material('wall_brick');
 const groups=f.children.filter(g=>g.name==='east-facade-sill-window');if(groups.length!==4)throw Error('Yonghe requires exactly four original south windows');
 const expectedIndices=[0,1,3,4],targets=[];
 for(const[index,g]of groups.entries()){
  const bayIndex=expectedIndices[index],x=-27.8/2+(bayIndex+.5)*bay;
  if(g.userData.source!==SOURCE||g.userData.localZ!==z||!canonical(g)||g.position.lengthSq()||g.rotation.x||g.rotation.y||g.rotation.z||g.children.length!==31)throw Error('Yonghe original closed window identity changed');
  const split=floor+.9+upper*.46,upperH=floor+height-.12-split;
  const rows=[['masonry-sill',width,.9,.24,x,floor+.45,z,brick],['plain-panel',width-.12,upper-.12,.055,x,mid,z,originalPanel],...[-1,1].map(sign=>['jamb',.1,upper,.15,x+sign*(width-.1)/2,mid,z-.025,wood]),...[floor+.9+.05,floor+height-.05].map(y=>['frame-rail',width,.1,.15,x,y,z-.025,wood]),['section-rail',width,.12,.15,x,split,z-.04,wood]];
  for(let col=0;col<3;col++){const cx=x+(col-1)*width/3,ww=width/3-.14;for(const inset of[0,.14]){const w=ww-2*inset,h=upperH-.20-2*inset,cy=split+upperH/2;for(const sign of[-1,1])rows.push(['upper-frame',.045,h,.10,cx+sign*w/2,cy,z-.07,wood]);for(const sign of[-1,1])rows.push(['upper-frame',w,.045,.10,cx,cy+sign*h/2,z-.07,wood]);}}
  for(let k=0;k<rows.length;k++){const[role,w,h,d,x,y,z,material]=rows[k];if(!meshMatches(g.children[k],{name:'east-window-'+role,w,h,d,x,y,z,material},kit))throw Error('Yonghe original window source differs: '+bayIndex+'/'+role);}
  targets.push({g,x,bayIndex});
 }
 const doorMaterial=kit.lib.material('lattice_doors'),leaves=f.children.filter(m=>m.isMesh&&m.material===doorMaterial&&m.rotation.y===Math.PI/2&&m.position.z<0);
 if(leaves.length!==2)throw Error('Yonghe requires two retained operational south leaves');
 for(const[index,m]of leaves.entries()){if(!['material','userData'].every(k=>Object.getOwnPropertyDescriptor(m,k)?.writable===true))throw Error('Writable retained leaf finish required');const sign=index===0?-1:1;if(!meshMatches(m,{name:'',w:bay*.26,h:height,d:.1,x:sign*(bay/2-.34-.08),y:floor+height/2,z:z+bay*.13+.2,material:doorMaterial,rotation:Math.PI/2,band:true},kit))throw Error('Yonghe original open leaf source changed');}
 if([f,...targets.map(t=>t.g)].some(o=>Object.values(o._listeners??{}).some(list=>list.length)))throw Error('Yonghe eventful live graph cannot be replaced atomically');
 assertUnborrowedWindows(kit.root,targets);
 if(targets.some(({g})=>g.children.some(m=>Object.values(m.geometry._listeners??{}).some(list=>list.length))))throw Error('Yonghe eventful retired geometry cannot be disposed atomically');
 const startOwned=kit.owned.length,staged=[];
 try{
  const gridded=textureMaterial(kit,'yonghe-south-stepped-upper-fit',gridPattern),glass=textureMaterial(kit,'yonghe-south-pale-glazing-fit',glassPattern),door=textureMaterial(kit,'yonghe-south-open-door-panel-fit',doorPattern),red=new T.MeshStandardMaterial({name:'yonghe-south-red-frame-fit',color:0x873b2c,roughness:.85}),gold=new T.MeshStandardMaterial({name:'yonghe-south-painted-outline-fit',color:0xb49252,roughness:.8});kit.owned.push(red,gold);
  // Retain original band UVs, but fit this private full-panel texture to one leaf.
  if(door.map){door.map.repeat.set(kit.lib.tileSize('lattice_doors')/(bay*.26),1);door.map.offset.set(.5,0);door.map.updateMatrix();}

  const put=(g,role,w,h,d,x,y,z,material)=>{const geo=new T.BoxGeometry(w,h,d);let m;try{m=kit.mesh(g,geo,material,x,y,z)}catch(error){geo.dispose();throw error;}m.name='yonghe-south-'+role;m.userData={yongheVisualRole:role,source:PHOTO,fit:'REVERSIBLE_VISUAL_FIT_PHYSICS_UNCHANGED'};return m;};
  for(const{g:old,x,bayIndex}of targets){const count=3,g=new T.Group();g.name=old.name;g.userData={...old.userData,yongheWindow:{bayIndex,panelCount:count,panelCountStatus:'INNER_THREE_PHOTO_SUPPORTED_OUTER_THREE_RETAINED_MODEL_FIT',exactCarving:false,scope:'ORIGINAL_WINDOW_ENVELOPE_VISUAL_ONLY'}};staged.push(g);
   // Preserve exact original outer frame/sill geometry. Only frame finish changes.
   for(const m of [old.children[0],...old.children.slice(2,6)]){const geo=m.geometry.clone();let copy;try{copy=kit.mesh(g,geo,m===old.children[0]?m.material:red,...m.position.toArray())}catch(e){geo.dispose();throw e;}copy.name=m.name;copy.userData={...m.userData,yongheVisualRole:'retained-outer-frame'};}
   const inner=width-.24,divider=.08,field=(inner-(count-1)*divider)/count,lo=floor+.9+.1,hi=floor+height-.1,split=lo+(hi-lo)*.52,lowerH=split-lo-.05,upperH=hi-split-.05;
   for(let k=0;k<count;k++){const cx=x-inner/2+field/2+k*(field+divider);
    put(g,'upper-stepped-field',field,upperH,.06,cx,split+.05+upperH/2,z,gridded);
    put(g,'lower-glazing-field',field,lowerH,.06,cx,lo+lowerH/2,z,glass);
    for(const sign of[-1,1])put(g,'gold-outline',.018,hi-lo,.018,cx+sign*(field/2-.018), (hi+lo)/2,z-.035,gold);
   }
   for(let k=1;k<count;k++)put(g,'major-divider',divider,hi-lo,.13,x-inner/2+k*field+(k-.5)*divider,(hi+lo)/2,z-.04,red);
   put(g,'full-transom',inner,.10,.13,x,split,z-.04,red);
  }
  // Only now alter the live graph. Physics arrays and existing leaves' geometry
  // and matrices are intentionally untouched, including inherited deficiencies.
  for(let i=0;i<targets.length;i++){f.add(staged[i]);targets[i].g.removeFromParent();}
  for(const m of leaves){m.material=door;m.userData={...m.userData,yongheVisualRole:'retained-open-leaf-finish',source:PHOTO,pose:'UNCHANGED_OPERATIONAL_OPEN_POSE_NOT_PHOTO_CLOSED_COUNT'};}
  const metadata={source:SOURCE,photo:PHOTO,scope:'SOUTH_VISUAL_ONLY_PHYSICS_UNCHANGED',wholePalaceAccepted:false,windowCount:4,openLeafCount:2,textureFit:'SIMPLIFIED_PATTERN_NOT_FINE_CARVING',inheritedPhysics:'UNCHANGED_NOT_UPGRADED_OR_CERTIFIED',unverified:['upper-window/column physical closure','exact window field proportions and optical transmission','exact leaf count and closed historic pose','tree-obscured fine details','current exhibition/interior','GPU visual/performance']};f.userData.yongheSouthVisual=metadata;f.userData.structure.yongheSouthVisual=metadata;
  for(const{g}of targets)g.traverse(m=>m.geometry?.dispose());return metadata;
 }catch(error){for(const g of staged)g.traverse(m=>m.geometry?.dispose());for(const m of kit.owned.slice(startOwned))m.dispose();kit.owned.length=startOwned;throw error;}
}
