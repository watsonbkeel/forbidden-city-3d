import * as T from 'three';
import {applyBandUV,applyBoxUV} from '../../../utils/GeometryUV.js';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/4712%5B1024%5D.jpg';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
const writable=(o,k)=>Object.getOwnPropertyDescriptor(o,k)?.writable===true;
const canonical=o=>o.visible===true&&o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.scale.equals(new T.Vector3(1,1,1));
function equalGeometry(a,b){return a?.isBufferGeometry&&a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.isBufferAttribute&&!p.isInterleavedBufferAttribute&&p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.itemSize===b.index.itemSize&&a.index.normalized===b.index.normalized&&a.index.count===b.index.count&&a.index.array.constructor===b.index.array.constructor&&a.index.array.every((v,i)=>v===b.index.array[i]));}
function matches(kit,m,{name='',w,h,d,x,y,z,material,rotation=0,uv}){
 if(!m?.isMesh||m.name!==name||!canonical(m)||m.children.length||m.renderOrder!==0||m.layers.mask!==1||m.customDepthMaterial!==undefined||m.customDistanceMaterial!==undefined||m.rotation.x||m.rotation.z||m.rotation.y!==rotation||!near(m.position.x,x)||!near(m.position.y,y)||!near(m.position.z,z)||m.material!==material||!material||Array.isArray(material)||material.visible!==true||material.opacity!==1||material.side!==T.FrontSide||material.transparent!==false||material.vertexColors!==false||material.depthWrite!==true||material.depthTest!==true||material.alphaTest!==0||material.wireframe!==false||material.blending!==T.NormalBlending||material.polygonOffset!==false||material.clippingPlanes!==null)return false;
 let ref=new T.BoxGeometry(w,h,d);try{if(uv==='band')ref=applyBandUV(ref,kit.lib.tileSize('lattice_doors'));if(uv==='box')ref=applyBoxUV(ref,kit.lib.tileSize('wall_red'));return equalGeometry(m.geometry,ref);}finally{ref.dispose();}
}
function finish(kit,name,width,height,draw,color){
 const c=typeof document==='undefined'?null:document.createElement('canvas');if(c){c.width=width;c.height=height;}const ctx=c?.getContext('2d');if(ctx)draw(ctx,width,height);
 const map=ctx?new T.CanvasTexture(c):null;if(map){map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;map.name=name+'-pattern-fit';}
 const m=new T.MeshStandardMaterial({name,map,color:map?0xffffff:color,roughness:.84});m.userData={source:PHOTO,exactCarving:false,baseRGBA8Bytes:map?width*height*4:0};let disposed=false;m.addEventListener('dispose',()=>{if(!disposed){disposed=true;map?.dispose();}});kit.owned.push(m);return m;
}
function lattice(c,w,h){
 c.fillStyle='#24201d';c.fillRect(0,0,w,h);c.strokeStyle='#7f3329';c.lineWidth=3;
 // Simplified repeated diagonal/circular lattice type, not an exact carving count.
 const step=32;for(let row=-1;row<=Math.ceil(h/(step/2))+1;row++)for(let col=-1;col<=Math.ceil(w/step)+1;col++){const x=col*step+(row%2?step/2:0),y=row*step/2;c.beginPath();c.moveTo(x-step/2,y);c.lineTo(x,y-step/2);c.lineTo(x+step/2,y);c.lineTo(x,y+step/2);c.closePath();c.stroke();c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.stroke();}
 c.strokeStyle='#c2a265';c.lineWidth=4;c.strokeRect(2,2,w-4,h-4);
}
function door(c,w,h){
 lattice(c,w,h);c.fillStyle='#81382c';c.fillRect(0,h*.64,w,h*.36);c.strokeStyle='#c6a968';c.lineWidth=4;
 c.strokeRect(w*.07,h*.665,w*.86,h*.055);c.strokeRect(w*.07,h*.75,w*.86,h*.22);
 // Paired broad scrolling lower-panel outline visible in the photo; fitted curves.
 c.beginPath();c.moveTo(w*.5,h*.77);c.bezierCurveTo(w*.46,h*.81,w*.19,h*.80,w*.18,h*.88);c.bezierCurveTo(w*.15,h*.95,w*.44,h*.96,w*.44,h*.88);c.bezierCurveTo(w*.43,h*.84,w*.30,h*.85,w*.34,h*.90);c.stroke();
 c.beginPath();c.moveTo(w*.5,h*.77);c.bezierCurveTo(w*.54,h*.81,w*.81,h*.80,w*.82,h*.88);c.bezierCurveTo(w*.85,h*.95,w*.56,h*.96,w*.56,h*.88);c.bezierCurveTo(w*.57,h*.84,w*.70,h*.85,w*.66,h*.90);c.stroke();
}
function overhead(c,w,h){
 c.fillStyle='#465a51';c.fillRect(0,0,w,h);c.strokeStyle='#a39874';c.lineWidth=4;
 for(let i=0;i<3;i++){const x=i*w/3,span=w/3;c.strokeRect(x+5,6,span-10,h-12);c.strokeRect(x+14,14,span-28,h-28);for(const sign of[-1,1]){const cx=x+span/2+sign*span*.34;c.beginPath();c.moveTo(cx-sign*span*.06,12);c.lineTo(cx,h*.35);c.lineTo(cx-sign*span*.06,h*.50);c.lineTo(cx,h*.65);c.lineTo(cx-sign*span*.06,h-12);c.stroke();}c.beginPath();c.ellipse(x+span/2,h/2,span*.12,h*.24,0,0,Math.PI*2);c.stroke();}
}
function faces(source,front){const ids=[];for(let i=0;i<source.attributes.position.count;i+=3){const tri=[i,i+1,i+2];if(tri.every(j=>source.attributes.normal.getZ(j)===-1)===front)ids.push(...tri);}if(ids.length!==(front?6:30))throw Error('Xianfu exact overhead source triangles required');const g=new T.BufferGeometry();try{for(const[k,a]of Object.entries(source.attributes)){const v=new a.array.constructor(ids.length*a.itemSize);ids.forEach((id,i)=>{for(let j=0;j<a.itemSize;j++)v[i*a.itemSize+j]=a.array[id*a.itemSize+j]});g.setAttribute(k,new T.BufferAttribute(v,a.itemSize,a.normalized));}return g;}catch(e){g.dispose();throw e;}}
/** Exact target only. All inherited physical/nav records remain unchanged. */
export function applyXianfuSouthVisual(kit,item,f,p){
 if(p?.key!=='xianfu-front'||kit.root.name!=='west-six'||item.name!=='咸福宫'||item.x!==149.8||item.z!==430.3||item.w!==20.5||item.d!==13.8||item.ph!==.6||item.colH!==6.72||item.bays!==3||item.roof!=='wudian'||item.enter!==true||item.rot!==undefined||f.parent!==kit.root||!canonical(kit.root)||kit.root.parent!==null||kit.root.position.lengthSq()||kit.root.rotation.x||kit.root.rotation.y||kit.root.rotation.z||!canonical(f)||!near(f.position.x,item.x)||!near(f.position.z,item.z)||f.position.y||f.rotation.x||f.rotation.y||f.rotation.z||f.userData.structure?.profile!==p.key)throw Error('Exact canonical Xianfu host required');
 for(const o of[f.userData,f.userData.structure])if(!Object.isExtensible(o)||Object.getOwnPropertyDescriptor(o,'xianfuSouthVisual'))throw Error('Writable fresh Xianfu metadata required');
 if(Object.isFrozen(f.children)||Object.isFrozen(kit.owned))throw Error('Writable Xianfu child/ownership arrays required');
 const bay=item.w/3,width=bay-.68,height=(6.72-6.72*.12)*.8,floor=.6,z=-6.9,upper=height-.95,mid=floor+.95+upper/2,wood=kit.lib.material('wood_column'),paper=kit.owned.filter(m=>m.name==='r48_xianfu-front_schematic_lattice'),brick=kit.lib.material('wall_brick');
 if(paper.length!==1)throw Error('Unique Xianfu original window material required');
 const groups=f.children.filter(g=>g.name==='r48-residential-window'&&g.userData.side===-1);if(groups.length!==2)throw Error('Xianfu requires two original south windows');const targets=[];
 for(const [index,g]of groups.entries()){
  const bayIndex=index*2,x=-20.5/2+(bayIndex+.5)*bay;
  if(g.userData.bayIndex!==bayIndex||g.userData.catalogId!=='place-west-six-99f5aa211a'||!canonical(g)||g.position.lengthSq()||g.rotation.x||g.rotation.y||g.rotation.z||g.children.length!==9)throw Error('Xianfu original window identity changed');
  const rows=[['sill',width,.95,.38,x,floor+.475,z,brick],['panel',width-.12,upper-.08,.06,x,mid,z,paper[0]],...[-1,1].map(s=>['jamb',.12,upper,.16,x+s*(width-.12)/2,mid,z-.055,wood]),...[floor+.95+.05,floor+height-.05].map(y=>['rail',width,.1,.16,x,y,z-.055,wood]),...[1,2].map(k=>['mullion',.08,upper,.13,x-width/2+k*width/3,mid,z-.06,wood]),['transom',width,.09,.13,x,floor+.95+upper*.48,z-.06,wood]];
  rows.forEach(([role,w,h,d,x,y,z,material],i)=>{if(!matches(kit,g.children[i],{name:'r48-residential-window-'+role,w,h,d,x,y,z,material}))throw Error('Xianfu original window geometry changed: '+role);});targets.push({g,x,bayIndex});
 }
 const doorMat=kit.lib.material('lattice_doors'),leaves=f.children.filter(m=>m.isMesh&&m.material===doorMat&&m.rotation.y===Math.PI/2&&m.position.z<0);if(leaves.length!==2)throw Error('Xianfu requires exactly two open south leaves');
 leaves.forEach((m,i)=>{if(!writable(m,'material')||!writable(m,'userData')||!matches(kit,m,{w:bay*.26,h:height,d:.1,x:(i===0?-1:1)*(bay/2-.34-.08),y:floor+height/2,z:z+bay*.13+.2,material:doorMat,rotation:Math.PI/2,uv:'band'}))throw Error('Xianfu original open leaf changed');});
 const hh=6.72-6.72*.12-height,bandCandidates=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('wall_red')&&near(m.position.z,z)&&near(m.position.y,floor+height+hh/2));if(bandCandidates.length!==1)throw Error('Unique Xianfu overhead wall required');const band=bandCandidates[0];
 if(!writable(band,'geometry')||!matches(kit,band,{w:item.w,h:hh,d:.3,x:0,y:floor+height+hh/2,z,material:kit.lib.material('wall_red'),uv:'box'}))throw Error('Xianfu overhead source changed');
 const retired=new Set([...groups.flatMap(g=>g.children.map(m=>m.geometry)),band.geometry]);if(retired.size!==19)throw Error('Exclusive Xianfu source geometries required');kit.root.traverse(m=>{if(m.geometry&&retired.has(m.geometry)&&m!==band&&!groups.includes(m.parent))throw Error('Borrowed Xianfu source geometry');});
 const ownedStart=kit.owned.length,staged=[];let front,rest;
 try{
  const pattern=finish(kit,'xianfu-south-lattice-fit',256,512,lattice,0x592b24),leaf=finish(kit,'xianfu-south-open-panel-fit',256,512,door,0x81382c),paint=finish(kit,'xianfu-south-overhead-fit',768,128,overhead,0x465a51),red=new T.MeshStandardMaterial({name:'xianfu-south-frame-fit',color:0x81382c,roughness:.85});kit.owned.push(red);
  if(leaf.map){leaf.map.repeat.set(kit.lib.tileSize('lattice_doors')/(bay*.26),1);leaf.map.offset.set(.5,0);leaf.map.updateMatrix();}
  if(paint.map){const t=kit.lib.tileSize('wall_red');paint.map.repeat.set(t/item.w,t/hh);paint.map.offset.set(.5,.5);paint.map.updateMatrix();}
  const put=(g,role,w,h,d,x,y,z,mat)=>{const geo=new T.BoxGeometry(w,h,d);let m;try{m=kit.mesh(g,geo,mat,x,y,z);}catch(e){geo.dispose();throw e;}m.name='xianfu-south-'+role;m.userData={xianfuVisualRole:role,source:PHOTO};return m;};
  for(const{g:old,x,bayIndex}of targets){const g=new T.Group();g.name=old.name;g.userData={...old.userData,xianfuWindow:{bayIndex,fields:4,exactCarving:false}};staged.push(g);
   for(const m of[old.children[0],...old.children.slice(2,6)]){const geo=m.geometry.clone();let copy;try{copy=kit.mesh(g,geo,m===old.children[0]?m.material:red,...m.position.toArray());}catch(e){geo.dispose();throw e;}copy.castShadow=m.castShadow;copy.receiveShadow=m.receiveShadow;copy.name=m.name;copy.userData={...m.userData,xianfuVisualRole:'retained-outer-frame'};}
   const inner=width-.24,divider=.08,cell=(inner-3*divider)/4,lo=floor+.95+.05,hi=floor+height-.05;
   for(let k=0;k<4;k++)put(g,'lattice-field',cell,hi-lo,.06,x-inner/2+cell/2+k*(cell+divider),(hi+lo)/2,z,pattern);
   for(let k=1;k<4;k++)put(g,'major-divider',divider,hi-lo,.13,x-inner/2+k*cell+(k-.5)*divider,(hi+lo)/2,z-.06,red);
  }
  front=faces(band.geometry,true);rest=faces(band.geometry,false);const face=new T.Mesh(front,paint);face.position.copy(band.position);face.quaternion.copy(band.quaternion);face.scale.copy(band.scale);face.castShadow=band.castShadow;face.receiveShadow=band.receiveShadow;face.name='xianfu-original-overhead-front';face.userData={xianfuVisualRole:'original-overhead-front',source:PHOTO,geometry:'EXACT_RETAINED_SOURCE_TRIANGLES'};
  const metadata={source:PHOTO,scope:'THREE_BAY_SOUTH_ENCLOSURE_VISUAL_ONLY',wholePalaceAccepted:false,windowCount:2,fieldsPerWindow:4,openLeafCount:2,photographedClosedLeafCount:4,pose:'RETAINED_TWO_OPEN_LEAVES_NOT_CLOSED_PHOTO_POSE',physics:'EXACT_INHERITED_RECORDS_UNCHANGED_NOT_NEWLY_CERTIFIED',unverified:['exact lattice and painted/carved motifs','survey dimensions','closed-photo central upper transom not added across operational aperture','interior/current display inventory','inherited upper-window/column closure','GPU pixels/performance']};
  // After complete validation and allocation, commit. Arbitrary throwing graph
  // event/disposal callbacks during commit are outside this atomicity promise.
  for(let i=0;i<targets.length;i++){f.add(staged[i]);targets[i].g.removeFromParent();}for(const m of leaves){m.material=leaf;m.userData={...m.userData,xianfuVisualRole:'retained-open-leaf-finish',source:PHOTO};}const old=band.geometry;band.geometry=rest;f.add(face);f.userData.xianfuSouthVisual=metadata;f.userData.structure.xianfuSouthVisual=metadata;old.dispose();for(const{g}of targets)g.traverse(m=>m.geometry?.dispose());return metadata;
 }catch(e){for(const g of staged)g.traverse(m=>m.geometry?.dispose());front?.dispose();rest?.dispose();for(const m of kit.owned.slice(ownedStart))m.dispose();kit.owned.length=ownedStart;throw e;}
}
