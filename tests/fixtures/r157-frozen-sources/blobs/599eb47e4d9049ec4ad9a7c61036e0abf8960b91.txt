import * as T from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236544.html',PHOTOS=['https://img.dpm.org.cn/Uploads/Picture/dc/8041.jpg','https://img.dpm.org.cn/Uploads/Picture/dc/8042.jpg'];
function opaque(m){return m.visible===true&&m.transparent===false&&m.opacity===1&&m.alphaTest===0&&!m.alphaMap&&!m.alphaHash&&m.depthWrite===true&&m.depthTest===true&&m.colorWrite===true&&m.side===T.FrontSide&&m.blending===T.NormalBlending&&!m.wireframe;}
const scalar=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
function geometryEqual(a,b){return a.morphTargetsRelative===b.morphTargetsRelative&&Object.keys(a.morphAttributes).length===0&&a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.itemSize===b.index.itemSize&&a.index.normalized===b.index.normalized&&a.index.array.constructor===b.index.array.constructor&&a.index.count===b.index.count&&a.index.array.every((v,i)=>v===b.index.array[i]));}
function canonical(o){return o.visible===true&&o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.scale.equals(new T.Vector3(1,1,1));}
function meshMatches(m,{name,w,h,d,x,y,z,material,rotation=0,band},kit){if(!m?.isMesh||m.name!==name||!canonical(m)||m.children.length||m.rotation.x||m.rotation.z||m.rotation.y!==rotation||!scalar(m.position.x,x)||!scalar(m.position.y,y)||!scalar(m.position.z,z)||m.material!==material||!material||Array.isArray(material)||!opaque(material))return false;let ref=new T.BoxGeometry(w,h,d);try{if(band)ref=applyBandUV(ref,kit.lib.tileSize('lattice_doors'));return geometryEqual(m.geometry,ref);}finally{ref.dispose();}}
function canAddMetadata(record){if(!Object.isExtensible(record))return false;for(let o=record;o;o=Object.getPrototypeOf(o))if(Object.getOwnPropertyDescriptor(o,'tiyuanCoverVisual'))return false;return true;}
// Original procedural low-relief impression, not copied historic floral artwork.
// Opaque dark interstices remain source solids, not newly certified openwork holes.
function relief(c,w,h,kind){
 c.fillStyle='#211e1b';c.fillRect(0,0,w,h);
 for(let row=0;row<8;row++)for(let col=0;col<12;col++){
  const x=(col+.5+(row%2)*.25)*w/12,y=(row+.5)*h/8,r=Math.min(w/12,h/8)*.34;
  c.strokeStyle=(row+col)%2?'#4d4538':'#403a31';c.lineWidth=2;c.beginPath();c.moveTo(x-r,y+r);
  c.bezierCurveTo(x+r,y+r,x-r,y-r,x+r,y-r);c.stroke();
  for(const sign of[-1,1]){c.fillStyle='#575044';c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+sign*r*1.5,y-r*.8,x+sign*r*.6,y-r);c.quadraticCurveTo(x-sign*r*.3,y-r*.5,x,y);c.fill();}
 }
 c.strokeStyle='#342b22';c.lineWidth=7;c.strokeRect(3,3,w-6,h-6);
 // Warm border cues confined to original body surfaces; no aperture is filled.
 c.strokeStyle='#744333';c.lineWidth=9;c.beginPath();
 if(kind==='lower'){c.moveTo(w*.28,5);c.lineTo(w*.72,5)}
 if(kind==='upper'){c.moveTo(w*.28,h-5);c.lineTo(w*.72,h-5)}
 if(kind==='flank'){c.moveTo(5,0);c.lineTo(5,h);c.moveTo(w-5,0);c.lineTo(w-5,h)}
 c.stroke();
}
function finishMaterial(kit,kind){
 const canvas=typeof document==='undefined'?null:document.createElement('canvas');if(canvas){canvas.width=512;canvas.height=256;}
 const context=canvas?.getContext('2d');if(context)relief(context,512,256,kind);
 const texture=context?new T.CanvasTexture(canvas):null;if(texture){texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;texture.name='tiyuan-cover-'+kind+'-original-relief-impression';}
 const m=new T.MeshStandardMaterial({name:'tiyuan-cover-'+kind+'-fit',color:texture?0xffffff:0x302a23,map:texture,roughness:.88,transparent:false,opacity:1,depthWrite:true});
 m.userData={sources:PHOTOS,exactCarving:false,textureBytesRGBA8:texture?512*256*4:0,opaqueSourcePreserved:true};m.addEventListener('dispose',()=>texture?.dispose());kit.owned.push(m);return m;
}
/** Every original mesh, geometry, UV and transform remains; finishes only. */
export function applyTiyuanCoverVisual(kit,item,f,p){
 const expected={name:'太极殿后殿',x:150.1,z:348.2,w:26.2,d:12.9,ph:.45,colH:6.08,bays:5,backDoor:true};
 if(p?.key!=='tiyuan-through-stage'||kit.root.name!=='west-six'||Object.entries(expected).some(([k,v])=>item[k]!==v)||item.rot!==undefined||f.parent!==kit.root||!canonical(kit.root)||kit.root.parent!==null||kit.root.position.lengthSq()||kit.root.rotation.x||kit.root.rotation.y||kit.root.rotation.z||!canonical(f)||!scalar(f.position.x,150.1)||!scalar(f.position.z,348.2)||f.position.y||f.rotation.x||f.rotation.y||f.rotation.z||f.userData.structure?.profile!=='tiyuan-through-stage'||f.userData.tiyuanCoverVisual)throw Error('Exact registered Tiyuan cover host required');
 if(!canAddMetadata(f.userData)||!canAddMetadata(f.userData.structure))throw Error('Writable Tiyuan cover metadata required');
 const groups=f.children.filter(g=>g.name==='r48-residential-boundary'&&g.userData.type==='open-floral-cover'),wood=kit.owned.find(m=>m.name==='r48_tiyuan-through-stage_inner_timber_fit'),targets=[];
 if(groups.length!==3)throw Error('Tiyuan requires three original cover ensembles');
 const floor=.45,H=4.1,front=-12.9/2+.18,rear=12.9/2-.18,opening=[-1.2-3.2,-1.2+3.2];
 for(const[i,g]of groups.entries()){
  const bay=i+1,x=-26.2/2+bay*26.2/5;
  if(!canonical(g)||g.position.lengthSq()||g.rotation.x||g.rotation.y||g.rotation.z||g.userData.bay!==bay||g.userData.catalogId!=='place-west-six-5ca8837bae'||g.userData.source!==SOURCE||!scalar(g.userData.x,x)||JSON.stringify(g.userData.opening)!==JSON.stringify(opening)||g.children.length!==15)throw Error('Tiyuan original cover identity changed');
  const rows=[...[front,...opening,rear].map(z=>['r48-residential-partition-post',.14,H,.14,x,floor+H/2,z,'frame']),['r48-residential-partition-head',.16,.28,rear-front,x,floor+H-.14,(front+rear)/2,'frame']];
  for(const[a,b]of[[front,opening[0]-.07],[opening[1]+.07,rear]]){
   const d=b-a,z=(a+b)/2,slot=Math.min(.75,d*.5),low=1.15,high=2.55,sideDepth=(d-slot)/2;
   rows.push(['r48-tiyuan-carved-side-type-lower',.12,low,d,x,floor+low/2,z,'lower'],['r48-tiyuan-carved-side-type-upper',.12,H-.28-high,d,x,floor+(H-.28+high)/2,z,'upper']);
   for(const sign of[-1,1])rows.push(['r48-tiyuan-carved-side-type-flank',.12,high-low,sideDepth,x,floor+(low+high)/2,z+sign*(slot+sideDepth)/2,'flank']);
   // Two coincident inherited heads are deliberately retained, not silently deduplicated.
   rows.push(['r48-tiyuan-open-cover-head-fit',.12,.5,opening[1]-opening[0],x,floor+H-.45,-1.2,'head']);
  }
  rows.forEach(([name,w,h,d,x,y,z,kind],j)=>{const m=g.children[j];if(!meshMatches(m,{name,w,h,d,x,y,z,material:wood},kit))throw Error('Tiyuan original cover source changed: '+bay+'/'+name);if(!['material','userData'].every(k=>Object.getOwnPropertyDescriptor(m,k)?.writable===true))throw Error('Writable Tiyuan cover finish fields required');targets.push({m,kind});});
 }
 const ownedStart=kit.owned.length;
 try{
  const mats=Object.fromEntries(['lower','upper','flank','head'].map(kind=>[kind,finishMaterial(kit,kind)]));
  mats.frame=new T.MeshStandardMaterial({name:'tiyuan-cover-frame-fit',color:0x392b22,roughness:.88});kit.owned.push(mats.frame);
  const meta={source:SOURCE,photos:PHOTOS,coverCount:3,finishedMeshCount:45,geometryChanged:false,wholePalaceAccepted:false,scope:'THREE_COMPLETE_EXISTING_INTERIOR_COVER_FINISHES_ONLY',positionConfidence:'THREE_INHERITED_MODEL_FIT_LOCATIONS_NOT_PHOTO_TO_BAY_IDENTIFICATION',pattern:'ORIGINAL_PROCEDURAL_RELIEF_IMPRESSION_NOT_CARVING_FACSIMILE',sourceBodies:'ALL_ORIGINAL_OPAQUE_GEOMETRY_AND_PHYSICS_RETAINED',inheritedCoincidentHeadsPerCover:2,unverified:['exact floral motifs and historical arrangement','photograph-to-specific-boundary orientation','complete inventory','whole-object physical acceptance','GPU/raster visuals and performance']};
  const assignments=targets.map(({m,kind})=>({m,material:mats[kind],userData:{...m.userData,tiyuanCoverRole:kind,finishPhotos:PHOTOS}}));
  for(const a of assignments){a.m.material=a.material;a.m.userData=a.userData;}f.userData.tiyuanCoverVisual=meta;f.userData.structure.tiyuanCoverVisual=meta;return meta;
 }catch(error){for(const m of kit.owned.slice(ownedStart))m.dispose();kit.owned.length=ownedStart;throw error;}
}
const pending=new WeakMap();
export function stageTiyuanCoverVisual(kit,item,f,p){if(pending.has(kit))throw Error('Duplicate staged Tiyuan cover finish');pending.set(kit,{item,f,p});}
export function finishTiyuanCoverVisual(kit){const next=pending.get(kit);if(!next)return false;const result=applyTiyuanCoverVisual(kit,next.item,next.f,next.p);pending.delete(kit);return result;}
