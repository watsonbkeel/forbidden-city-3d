import * as T from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236506.html';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff075737310.jpg';
function opaque(m){return m.visible===true&&m.transparent===false&&m.opacity===1&&m.alphaTest===0&&!m.alphaMap&&!m.alphaHash&&m.depthWrite===true&&m.depthTest===true&&m.colorWrite===true&&m.side===T.FrontSide&&m.blending===T.NormalBlending&&!m.wireframe;}
const scalar=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
function geometryEqual(a,b){return a.morphTargetsRelative===b.morphTargetsRelative&&Object.keys(a.morphAttributes).length===0&&a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.itemSize===b.index.itemSize&&a.index.normalized===b.index.normalized&&a.index.array.constructor===b.index.array.constructor&&a.index.count===b.index.count&&a.index.array.every((v,i)=>v===b.index.array[i]));}
function canonical(o){return o.visible===true&&o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.scale.equals(new T.Vector3(1,1,1));}
function meshMatches(m,{name,w,h,d,x,y,z,material,rotation=0,band},kit){if(!m?.isMesh||m.name!==name||!canonical(m)||m.children.length||m.rotation.x||m.rotation.z||m.rotation.y!==rotation||!scalar(m.position.x,x)||!scalar(m.position.y,y)||!scalar(m.position.z,z)||m.material!==material||!material||Array.isArray(material)||!opaque(material))return false;let ref=new T.BoxGeometry(w,h,d);try{if(band)ref=applyBandUV(ref,kit.lib.tileSize('lattice_doors'));return geometryEqual(m.geometry,ref);}finally{ref.dispose();}}
function canAddMetadata(record){if(!Object.isExtensible(record))return false;for(let o=record;o;o=Object.getPrototypeOf(o))if(Object.getOwnPropertyDescriptor(o,'chonghuaSouthVisual'))return false;return true;}
function geometryResources(g){if(!g)return [];const attributes=[g.index,...Object.values(g.attributes??{}),...Object.values(g.morphAttributes??{}).flat()];return [g,...attributes.flatMap(a=>a?[a,a.data,a.array,a.data?.array,a.array?.buffer,a.data?.array?.buffer].filter(Boolean):[])];}
function assertUnborrowedWindows(root,targets){const owners=new Map();for(const {g}of targets)for(const mesh of g.children)for(const resource of geometryResources(mesh.geometry)){if(owners.has(resource)&&owners.get(resource)!==mesh)throw Error('Chonghua retired window resource borrowed by another source');owners.set(resource,mesh);}root.traverse(object=>{for(const resource of geometryResources(object.geometry))if(owners.has(resource)&&owners.get(resource)!==object)throw Error('Chonghua retired window resource borrowed elsewhere in kit');});}
function textureMaterial(kit,name,draw){const canvas=typeof document==='undefined'?null:document.createElement('canvas');if(canvas){canvas.width=256;canvas.height=256;}const context=canvas?.getContext('2d');if(context)draw(context,256);const texture=context?new T.CanvasTexture(canvas):null;if(texture){texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;texture.name=name+'-simplified-pattern';}const material=new T.MeshStandardMaterial({name,color:0xffffff,map:texture,roughness:.84,transparent:false,opacity:1,depthWrite:true});material.userData={source:PHOTO,exactCarving:false,textureBytesRGBA8:texture?256*256*4:0};material.addEventListener('dispose',()=>texture?.dispose());kit.owned.push(material);return material;}
function gridPattern(c,n,lower=false){c.fillStyle=lower?'#8c9690':'#242c29';c.fillRect(0,0,n,n);c.strokeStyle=lower?'#3f5955':'#49635c';c.lineWidth=6;for(const inset of[10,29,48]){const a=inset,b=n-inset,step=18;c.beginPath();c.moveTo(a,n*.5);c.lineTo(a,a);c.lineTo(n*.5-step,a);c.lineTo(n*.5-step,a+step);c.lineTo(n*.5+step,a+step);c.lineTo(n*.5+step,a);c.lineTo(b,a);c.lineTo(b,b);c.lineTo(n*.5+step,b);c.lineTo(n*.5+step,b-step);c.lineTo(n*.5-step,b-step);c.lineTo(n*.5-step,b);c.lineTo(a,b);c.lineTo(a,n*.5);c.stroke();}c.strokeStyle='#687b72';c.lineWidth=3;c.strokeRect(2,2,n-4,n-4);/* photo-supported rectangular-grid type, not exact historic carving */}
/** Visual-only: neither this function nor its helpers create/remove/update a
 * collider, walkable, source surface, scope, room, map or navigation record. */
export function applyChonghuaSouthVisual(kit,item,f,p){
 if(p?.key!=='chonghua-middle-name-fit'||kit.root.name!=='west-six'||item.name!=='重华宫'||item.x!==118.9||item.z!==498.3||item.w!==21.5||item.d!==8.6||item.ph!==.75||item.colH!==5.49||item.enter!==true||item.rot!==undefined||f.parent!==kit.root||!canonical(kit.root)||kit.root.parent!==null||kit.root.position.lengthSq()||kit.root.rotation.x||kit.root.rotation.y||kit.root.rotation.z||!canonical(f)||!scalar(f.position.x,118.9)||!scalar(f.position.z,498.3)||f.position.y||f.rotation.x||f.rotation.y||f.rotation.z||f.userData.structure?.profile!=='chonghua-middle-name-fit'||f.userData.chonghuaSouthVisual)throw Error('Exact canonical Chonghua south visual host required');
 if(!canAddMetadata(f.userData)||!canAddMetadata(f.userData.structure))throw Error('Writable Chonghua visual metadata required');
 const bay=21.5/5,width=bay-2*bay*.07,height=(5.49-5.49*.12)*.8,floor=.75,z=-8.6/2,upper=height-.95,mid=floor+.95+upper/2,wood=kit.lib.material('wood_column'),originalPanel=kit.owned.find(m=>m.name==='r48_chonghua-middle-name-fit_schematic_lattice'),brick=kit.lib.material('wall_brick');
 const groups=f.children.filter(g=>g.name==='r48-residential-window'&&g.userData.side===-1);if(groups.length!==4)throw Error('Chonghua requires exactly four original south windows');
 const expectedIndices=[0,1,3,4],targets=[];
 for(const[index,g]of groups.entries()){
  const bayIndex=expectedIndices[index],x=-21.5/2+(bayIndex+.5)*bay;
  if(g.userData.source!==SOURCE||g.userData.catalogId!=='place-west-six-dc1832baf2'||g.userData.bayIndex!==bayIndex||!canonical(g)||g.position.lengthSq()||g.rotation.x||g.rotation.y||g.rotation.z||g.children.length!==9)throw Error('Chonghua original closed window identity changed');
  const rows=[['sill',width,.95,.38,x,floor+.475,z,brick],['panel',width-.12,upper-.08,.06,x,mid,z,originalPanel],...[-1,1].map(sign=>['jamb',.12,upper,.16,x+sign*(width-.12)/2,mid,z-.055,wood]),...[floor+.95+.05,floor+height-.05].map(y=>['rail',width,.1,.16,x,y,z-.055,wood]),...[1,2].map(k=>['mullion',.08,upper,.13,x-width/2+k*width/3,mid,z-.06,wood]),['transom',width,.09,.13,x,floor+.95+upper*.48,z-.06,wood]];
  for(let k=0;k<rows.length;k++){const[role,w,h,d,x,y,z,material]=rows[k];if(!meshMatches(g.children[k],{name:'r48-residential-window-'+role,w,h,d,x,y,z,material},kit))throw Error('Chonghua original window source differs: '+bayIndex+'/'+role);}
  targets.push({g,x,bayIndex});
 }
 if([f,...targets.map(t=>t.g)].some(o=>Object.values(o._listeners??{}).some(list=>list.length)))throw Error('Chonghua eventful live graph cannot be replaced atomically');
 assertUnborrowedWindows(kit.root,targets);
 if(targets.some(({g})=>g.children.some(m=>Object.values(m.geometry._listeners??{}).some(list=>list.length))))throw Error('Chonghua eventful retired geometry cannot be disposed atomically');
 const startOwned=kit.owned.length,staged=[];
 try{
  const gridded=textureMaterial(kit,'chonghua-south-upper-grid-fit',(c,n)=>gridPattern(c,n)),lower=textureMaterial(kit,'chonghua-south-lower-grid-fit',(c,n)=>gridPattern(c,n,true)),red=new T.MeshStandardMaterial({name:'chonghua-south-red-frame-fit',color:0x813a2b,roughness:.85}),outline=new T.MeshStandardMaterial({name:'chonghua-south-teal-outline-fit',color:0x526b63,roughness:.85});kit.owned.push(red,outline);
  const put=(g,role,w,h,d,x,y,z,material)=>{const geo=new T.BoxGeometry(w,h,d);let m;try{m=kit.mesh(g,geo,material,x,y,z)}catch(error){geo.dispose();throw error;}m.name='chonghua-south-'+role;m.userData={chonghuaVisualRole:role,source:PHOTO,fit:'REVERSIBLE_VISUAL_FIT_PHYSICS_UNCHANGED'};return m;};
  for(const{g:old,x,bayIndex}of targets){const count=2,g=new T.Group();g.name=old.name;g.userData={...old.userData,chonghuaWindow:{bayIndex,panelCount:count,panelCountStatus:'TWO_COLUMNS_PHOTO_SUPPORTED_DIMENSIONS_FITTED',exactCarving:false,scope:'ORIGINAL_WINDOW_ENVELOPE_VISUAL_ONLY'}};staged.push(g);
   // Preserve exact original outer frame/sill geometry. Only frame finish changes.
   for(const m of [old.children[0],...old.children.slice(2,6)]){const geo=m.geometry.clone();let copy;try{copy=kit.mesh(g,geo,m===old.children[0]?m.material:red,...m.position.toArray())}catch(e){geo.dispose();throw e;}copy.name=m.name;copy.userData={...m.userData,chonghuaVisualRole:'retained-outer-frame'};}
   const inner=width-.24,divider=.08,field=(inner-(count-1)*divider)/count,lo=floor+.95+.1,hi=floor+height-.1,split=lo+(hi-lo)*.52,lowerH=split-lo-.05,upperH=hi-split-.05;
   for(let k=0;k<count;k++){const cx=x-inner/2+field/2+k*(field+divider);
    put(g,'upper-grid-field',field,upperH,.06,cx,split+.05+upperH/2,z,gridded);
    put(g,'lower-grid-field',field,lowerH,.06,cx,lo+lowerH/2,z,lower);
    for(const sign of[-1,1])put(g,'painted-outline',.018,hi-lo,.018,cx+sign*(field/2-.018), (hi+lo)/2,z-.035,outline);
   }
   for(let k=1;k<count;k++)put(g,'major-divider',divider,hi-lo,.13,x-inner/2+k*field+(k-.5)*divider,(hi+lo)/2,z-.04,red);
   put(g,'full-transom',inner,.10,.13,x,split,z-.04,red);
  }
  // Only now alter the live graph. Physics arrays and existing leaves' geometry
  // and matrices are intentionally untouched, including inherited deficiencies.
  for(let i=0;i<targets.length;i++){f.add(staged[i]);targets[i].g.removeFromParent();}
  const metadata={source:SOURCE,photo:PHOTO,scope:'SOUTH_VISUAL_ONLY_PHYSICS_UNCHANGED',wholePalaceAccepted:false,windowCount:4,openLeafCount:0,textureFit:'SIMPLIFIED_PATTERN_NOT_FINE_CARVING',inheritedPhysics:'UNCHANGED_NOT_UPGRADED_OR_CERTIFIED',unverified:['upper-window/column physical closure','exact window field proportions and optical transmission','original door leaves unchanged','exact pane proportions and wood weathering','current exhibition/interior','GPU visual/performance']};f.userData.chonghuaSouthVisual=metadata;f.userData.structure.chonghuaSouthVisual=metadata;
  for(const{g}of targets)g.traverse(m=>m.geometry?.dispose());return metadata;
 }catch(error){for(const g of staged)g.traverse(m=>m.geometry?.dispose());for(const m of kit.owned.slice(startOwned))m.dispose();kit.owned.length=startOwned;throw error;}
}
