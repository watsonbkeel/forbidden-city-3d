import * as T from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236450.html';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e98340ec50d8.jpg';
const scalar=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
function geometryEqual(a,b){return a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.itemSize===b.index.itemSize&&a.index.normalized===b.index.normalized&&a.index.array.constructor===b.index.array.constructor&&a.index.count===b.index.count&&a.index.array.every((v,i)=>v===b.index.array[i]));}
function canonical(o){return o.visible===true&&o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.scale.equals(new T.Vector3(1,1,1));}
function meshMatches(m,{name,w,h,d,x,y,z,material,rotation=0,band},kit){if(!m?.isMesh||m.name!==name||!canonical(m)||m.children.length||m.rotation.x||m.rotation.z||m.rotation.y!==rotation||!scalar(m.position.x,x)||!scalar(m.position.y,y)||!scalar(m.position.z,z)||m.material!==material||!material||Array.isArray(material)||material.visible===false||material.opacity===0)return false;let ref=new T.BoxGeometry(w,h,d);try{if(band)ref=applyBandUV(ref,kit.lib.tileSize('lattice_doors'));return geometryEqual(m.geometry,ref);}finally{ref.dispose();}}
function textureMaterial(kit,name,draw){const canvas=typeof document==='undefined'?null:document.createElement('canvas');if(canvas){canvas.width=256;canvas.height=256;}const context=canvas?.getContext('2d');if(context)draw(context,256);const texture=context?new T.CanvasTexture(canvas):null;if(texture){texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;texture.name=name+'-simplified-pattern';}const material=new T.MeshStandardMaterial({name,color:0xffffff,map:texture,roughness:.84,transparent:false,opacity:1,depthWrite:true});material.userData={source:PHOTO,exactCarving:false,textureBytesRGBA8:texture?256*256*4:0};material.addEventListener('dispose',()=>texture?.dispose());kit.owned.push(material);return material;}
function diamondPattern(c,n){c.fillStyle='#302c26';c.fillRect(0,0,n,n);c.strokeStyle='#ad8151';c.lineWidth=2;const step=32;for(let row=-1;row<18;row++)for(let col=-1;col<10;col++){const x=col*step+(row%2?step/2:0),y=row*step/2;c.beginPath();c.moveTo(x-14,y);c.lineTo(x,y-14);c.lineTo(x+14,y);c.lineTo(x,y+14);c.closePath();c.stroke();}/* type fit only: no assertion exact four-bowl carving */}
function glassPattern(c,n){c.fillStyle='#c2b78e';c.fillRect(0,0,n,n);c.fillStyle='#514b38';c.fillRect(0,0,n,n*.44);c.strokeStyle='#813729';c.lineWidth=4;for(let x=0;x<=n;x+=n/8){c.beginPath();c.moveTo(x,0);c.lineTo(x,n);c.stroke();}for(const y of[0,n*.15,n*.30,n*.44,n*.59,n*.74,n*.88,n]){c.beginPath();c.moveTo(0,y);c.lineTo(n,y);c.stroke();}c.strokeStyle='#d3b573';c.lineWidth=2;c.strokeRect(2,2,n-4,n-4);}
function doorPattern(c,n){diamondPattern(c,n);c.fillStyle='#7d3327';c.fillRect(0,n*.60,n,n*.40);c.strokeStyle='#c5a05c';c.lineWidth=4;for(const[y,h]of[[.62,.09],[.76,.20]]){c.strokeRect(n*.06,n*y,n*.88,n*h);c.strokeRect(n*.13,n*(y+.018),n*.74,n*(h-.036));}/* plain panel format, not copied carved flowers or calligraphy */}
/** Visual-only: neither this function nor its helpers create/remove/update a
 * collider, walkable, source surface, scope, room, map or navigation record. */
export function applyYongshouSouthVisual(kit,item,f,p){
 if(p?.key!=='yongshou-front'||kit.root.name!=='west-six'||item.name!=='永寿宫'||item.x!==94.9||item.z!==331||item.w!==27.1||item.d!==13.8||item.ph!==.6||item.colH!==6.72||item.enter!==true||item.rot!==undefined||f.parent!==kit.root||!canonical(kit.root)||kit.root.parent!==null||kit.root.position.lengthSq()||kit.root.rotation.x||kit.root.rotation.y||kit.root.rotation.z||!canonical(f)||!scalar(f.position.x,94.9)||!scalar(f.position.z,331)||f.position.y||f.rotation.x||f.rotation.y||f.rotation.z||f.userData.structure?.profile!=='yongshou-front'||f.userData.yongshouSouthVisual)throw Error('Exact canonical Yongshou south visual host required');
 if(!Object.isExtensible(f.userData)||Object.getOwnPropertyDescriptor(f.userData,'yongshouSouthVisual')||!Object.isExtensible(f.userData.structure)||Object.getOwnPropertyDescriptor(f.userData.structure,'yongshouSouthVisual'))throw Error('Writable Yongshou visual metadata required');
 const bay=27.1/5,width=bay-.68,height=(6.72-6.72*.12)*.8,floor=.6,z=-6.9,upper=height-.95,mid=floor+.95+upper/2,wood=kit.lib.material('wood_column'),paper=kit.owned.find(m=>m.name==='r48_yongshou-front_schematic_lattice'),brick=kit.lib.material('wall_brick');
 const groups=f.children.filter(g=>g.name==='r48-residential-window'&&g.userData.side===-1);if(groups.length!==4)throw Error('Yongshou requires exactly four original south windows');
 const expectedIndices=[0,1,3,4],targets=[];
 for(const[index,g]of groups.entries()){
  const bayIndex=expectedIndices[index],x=-27.1/2+(bayIndex+.5)*bay;
  if(g.userData.bayIndex!==bayIndex||g.userData.catalogId!=='place-west-six-62bf56b1f3'||!canonical(g)||g.position.lengthSq()||g.rotation.x||g.rotation.y||g.rotation.z||g.children.length!==9)throw Error('Yongshou original closed window identity changed');
  const rows=[['sill',width,.95,.38,x,floor+.475,z,brick],['panel',width-.12,upper-.08,.06,x,mid,z,paper],...[-1,1].map(s=>['jamb',.12,upper,.16,x+s*(width-.12)/2,mid,z-.055,wood]),...[floor+.95+.05,floor+height-.05].map(y=>['rail',width,.1,.16,x,y,z-.055,wood]),...[1,2].map(k=>['mullion',.08,upper,.13,x-width/2+k*width/3,mid,z-.06,wood]),['transom',width,.09,.13,x,floor+.95+upper*.48,z-.06,wood]];
  for(let k=0;k<rows.length;k++){const[role,w,h,d,x,y,z,material]=rows[k];if(!meshMatches(g.children[k],{name:'r48-residential-window-'+role,w,h,d,x,y,z,material},kit))throw Error('Yongshou original window source differs: '+bayIndex+'/'+role);}
  targets.push({g,x,bayIndex});
 }
 const doorMaterial=kit.lib.material('lattice_doors'),leaves=f.children.filter(m=>m.isMesh&&m.material===doorMaterial&&m.rotation.y===Math.PI/2&&m.position.z<0);
 if(leaves.length!==2)throw Error('Yongshou requires two retained operational south leaves');
 for(const[index,m]of leaves.entries()){if(!['material','userData'].every(k=>Object.getOwnPropertyDescriptor(m,k)?.writable===true))throw Error('Writable retained leaf finish required');const sign=index===0?-1:1;if(!meshMatches(m,{name:'',w:bay*.26,h:height,d:.1,x:sign*(bay/2-.34-.08),y:floor+height/2,z:z+bay*.13+.2,material:doorMaterial,rotation:Math.PI/2,band:true},kit))throw Error('Yongshou original open leaf source changed');}
 const startOwned=kit.owned.length,staged=[];
 try{
  const diamond=textureMaterial(kit,'yongshou-south-side-diamond-fit',diamondPattern),glass=textureMaterial(kit,'yongshou-south-rectangular-glazing-fit',glassPattern),door=textureMaterial(kit,'yongshou-south-open-door-panel-fit',doorPattern),red=new T.MeshStandardMaterial({name:'yongshou-south-red-frame-fit',color:0x873b2c,roughness:.85}),gold=new T.MeshStandardMaterial({name:'yongshou-south-painted-outline-fit',color:0xb49252,roughness:.8});kit.owned.push(red,gold);
  // Retain original band UVs, but fit this private full-panel texture to one leaf.
  if(door.map){door.map.repeat.set(kit.lib.tileSize('lattice_doors')/(bay*.26),1);door.map.offset.set(.5,0);door.map.updateMatrix();}

  const put=(g,role,w,h,d,x,y,z,material)=>{const geo=new T.BoxGeometry(w,h,d);let m;try{m=kit.mesh(g,geo,material,x,y,z)}catch(error){geo.dispose();throw error;}m.name='yongshou-south-'+role;m.userData={yongshouVisualRole:role,source:PHOTO,fit:'REVERSIBLE_VISUAL_FIT_PHYSICS_UNCHANGED'};return m;};
  for(const{g:old,x,bayIndex}of targets){const g=new T.Group();g.name=old.name;g.userData={...old.userData,yongshouWindow:{bayIndex,centerRatio:.56,exactCarving:false,scope:'ORIGINAL_WINDOW_ENVELOPE_VISUAL_ONLY'}};staged.push(g);
   // Preserve exact original outer frame/sill geometry. Only frame finish changes.
   for(const m of [old.children[0],...old.children.slice(2,6)]){const geo=m.geometry.clone();let copy;try{copy=kit.mesh(g,geo,m===old.children[0]?m.material:red,...m.position.toArray())}catch(e){geo.dispose();throw e;}copy.name=m.name;copy.userData={...m.userData,yongshouVisualRole:'retained-outer-frame'};}
   const inner=width-.24,cw=inner*.56,divider=.08,sw=(inner-cw-2*divider)/2,lo=floor+.95+.1,hi=floor+height-.1,hh=hi-lo,cy=(hi+lo)/2;
   put(g,'wide-glazed-center',cw,hh,.06,x,cy,z,glass);
   for(const sign of[-1,1]){const sx=x+sign*(cw/2+divider+sw/2);put(g,'side-diamond-'+(sign<0?'left':'right'),sw,hh,.06,sx,cy,z,diamond);put(g,'major-divider',divider,hh,.13,x+sign*(cw/2+divider/2),cy,z-.06,red);}
   put(g,'central-divider',.065,hh,.13,x,cy,z-.06,red);
   put(g,'center-transom',cw,.10,.13,x,lo+hh*.56,z-.06,red);
   for(const sign of[-1,1])put(g,'gold-outline',.018,hh,.018,x+sign*(cw/2-.018),cy,z-.13+.009,gold);
  }
  // Only now alter the live graph. Physics arrays and existing leaves' geometry
  // and matrices are intentionally untouched, including inherited deficiencies.
  for(let i=0;i<targets.length;i++){f.add(staged[i]);targets[i].g.removeFromParent();}
  for(const m of leaves){m.material=door;m.userData={...m.userData,yongshouVisualRole:'retained-open-leaf-finish',source:PHOTO,pose:'UNCHANGED_OPERATIONAL_OPEN_POSE_NOT_PHOTO_CLOSED_COUNT'};}
  const metadata={source:SOURCE,photo:PHOTO,scope:'SOUTH_VISUAL_ONLY_PHYSICS_UNCHANGED',wholePalaceAccepted:false,windowCount:4,openLeafCount:2,textureFit:'SIMPLIFIED_PATTERN_NOT_FINE_CARVING',inheritedPhysics:'UNCHANGED_NOT_UPGRADED_OR_CERTIFIED',unverified:['upper-window/column physical closure','exact leaf count and closed historic pose','tree-obscured fine details','current exhibition/interior','GPU visual/performance']};f.userData.yongshouSouthVisual=metadata;f.userData.structure.yongshouSouthVisual=metadata;
  for(const{g}of targets)g.traverse(m=>m.geometry?.dispose());return metadata;
 }catch(error){for(const g of staged)g.traverse(m=>m.geometry?.dispose());for(const m of kit.owned.slice(startOwned))m.dispose();kit.owned.length=startOwned;throw error;}
}
