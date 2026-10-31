import * as THREE from 'three';
import {isDonghuaCentralDoorTarget} from './DonghuaCentralDoorFront.js';

const SOURCE='https://img.dpm.org.cn/Uploads/Picture/dc/3912%5B1024%5D.jpg';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-5;
const identity=o=>o.scale.toArray().every(v=>v===1)&&near(o.rotation.x,0)&&near(o.rotation.y,0)&&near(o.rotation.z,0);

/** Observed east elevation only; no borrowed Xihua image or hidden-side claim.
 * Five visible pale lattice groups/red surrounds and a pale, coursed stone
 * plinth are visible in official 3912 and its linked img0013 deep zoom.
 * Leaf spacing, motif, colors, profile and all metric values remain model fit.
 * This hook does not rebuild the shared gate, touch studs or change physics.
 */
export function applyDonghuaExteriorEnvelope(kit,frame,binding){
 if(!isDonghuaCentralDoorTarget(binding)||frame?.parent!==kit.root||frame.name!=='city-gate-东华门'||
  !near(frame.position.x,-365.8)||!near(frame.position.y,0)||!near(frame.position.z,-257)||
  !near(frame.rotation.x,0)||!near(frame.rotation.y,Math.PI/2)||!near(frame.rotation.z,0)||
  !frame.scale.toArray().every(v=>v===1)||frame.userData.structure?.id!=='city-gates/donghua'||
  frame.userData.donghuaExteriorEnvelope)return false;
 const lattice=kit.lib.material('lattice_doors'),brick=kit.lib.material('wall_brick');
 const windows=frame.children.filter(o=>o.isMesh&&o.material===lattice);
 const bases=frame.children.filter(o=>o.isMesh&&o.material===brick&&near(o.position.y,.5));
 if(windows.length!==1||bases.length!==4)return false;
 const win=windows[0],targets=[win,...bases],faces=[];
 for(const old of targets){
  const g=old.geometry,p=g?.attributes.position,n=g?.attributes.normal,uv=g?.attributes.uv;
  if(!identity(old)||!old.visible||old.children.length||g.index||p?.count!==36||!n||!uv||
   Object.keys(g.attributes).sort().join(',')!=='normal,position,uv'||Object.keys(g.morphAttributes).length)return false;
  const front=[];for(let i=0;i<36;i++)if(n.getZ(i)<-.99)front.push(i);
  if(front.length!==6||!front.every(i=>near(p.getZ(i),old===win?-3.35:-7.5)))return false;
  faces.push({old,g,front,left:Math.min(...front.map(i=>p.getX(i))),right:Math.max(...front.map(i=>p.getX(i))),
   bottom:Math.min(...front.map(i=>p.getY(i))),top:Math.max(...front.map(i=>p.getY(i)))});
 }
 const w=faces[0];if(!near(win.position.x,0)||!near(win.position.y,11.76)||!near(win.position.z,0)||!near(w.left,-10.85)||!near(w.right,10.85)||!near(w.bottom,-2.46)||!near(w.top,2.46))return false;
 const expected=[[-13.075,3.85],[-4.2,2.9],[4.2,2.9],[13.075,3.85]];
 if(!bases.every((m,i)=>near(m.position.x,expected[i][0])&&near(m.position.z,0)&&near(faces[i+1].right-faces[i+1].left,expected[i][1])&&near(faces[i+1].bottom,-.5)&&near(faces[i+1].top,.5)))return false;
 // Prepare off-scene: no original geometry, resource registry or metadata is
 // changed until every replacement and skin has been constructed successfully.
 const staging=new THREE.Group();staging.name='donghua-front-envelope-candidate';
 const prepared=[],newGeometry=new Set(),newMaterials=[];let texture;
 const ownedLength=kit.owned.length,hadTextures=Object.hasOwn(kit,'ownedTextures'),oldTextures=kit.ownedTextures,textureLength=oldTextures?.length??0;
 const oldRecord={own:Object.hasOwn(frame.userData,'donghuaExteriorEnvelope'),value:frame.userData.donghuaExteriorEnvelope};
 const oldStructureRecord={own:Object.hasOwn(frame.userData.structure,'donghuaExteriorEnvelope'),value:frame.userData.structure.donghuaExteriorEnvelope};
 const releaseCandidate=()=>{for(const g of newGeometry)g.dispose();for(const m of newMaterials)m.dispose();texture?.dispose();};
 try{
  texture=new THREE.DataTexture(windowPixels(),1024,256,THREE.RGBAFormat,THREE.UnsignedByteType);
  texture.name='donghua_front_window_fit';texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.LinearFilter;
  texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;
  const windowMat=new THREE.MeshStandardMaterial({name:'donghua_front_five_window_groups',color:0xffffff,map:texture,roughness:.87,metalness:0});newMaterials.push(windowMat);
  const stoneMat=new THREE.MeshStandardMaterial({name:'donghua_front_stone_plinth',color:0xc6c1ad,roughness:.94,metalness:0});newMaterials.push(stoneMat);
  for(const face of faces){
   const {old,g,front,left,right,bottom,top}=face,keep={position:[],normal:[],uv:[]};
   for(let i=0;i<36;i++)if(!front.includes(i))for(const key of Object.keys(keep)){
    const a=g.attributes[key];for(let j=0;j<a.itemSize;j++)keep[key].push(a.array[i*a.itemSize+j]);
   }
   const body=geometry(keep,newGeometry);
   const positions=[],uvs=[],add=(x,y,z)=>{positions.push(x,y,z);uvs.push((x-left)/(right-left),(y-bottom)/(top-bottom));};
   // All steps remain inside the ORIGINAL masonry/collider envelope. The 8cm maximum
   // recess is a reversible visual fit, not a measured stone moulding section.
   const profile=old===win?[[bottom,-3.35],[top,-3.35]]:
    [[-.5,-7.5],[-.36,-7.5],[-.28,-7.44],[-.16,-7.42],[.22,-7.42],[.32,-7.46],[.42,-7.5],[.5,-7.5]];
   for(let i=1;i<profile.length;i++){
    const [y0,z0]=profile[i-1],[y1,z1]=profile[i];
    for(const [x,y,z]of[[left,y0,z0],[left,y1,z1],[right,y0,z0],[right,y0,z0],[left,y1,z1],[right,y1,z1]])add(x,y,z);
   }
   const skin=geometry({position:positions,uv:uvs},newGeometry),mesh=kit.mesh(staging,skin,old===win?windowMat:stoneMat,old.position.x,old.position.y,old.position.z);
   mesh.name=old===win?'donghua-front-five-window-groups':'donghua-front-coursed-stone-plinth';
   prepared.push({old,g,body});
  }
  const record={objectId:'FC-C8AD5BD621',source:SOURCE,referenceSha256:'1aafb6e70f95b73b9fece78e6a41137d50ac348f3494b38108e21779928e89d7',
   status:'VERIFY_PENDING_EAST_FRONT_FITTED_CANDIDATE',accepted:false,face:'LOCAL_MINUS_Z_OUTSIDE_EAST',visibleWindowGroups:5,
   modelFitOnly:['dimensions','colors','lattice motif','leaf spacing and count','stone profile'],unseenFaces:'UNCHANGED',
   preserved:['three original portals and vaults','roof and plaque','central nine-row door correction','all physics and semantic records'],
   navigationChanged:false,netTriangleDelta:48,addedMaterials:2,addedTextureBytes:1024*256*4};
  // One scene attachment, then non-allocating swaps. Keep the originals alive
  // until attachment/ownership/metadata commit; an event-hook failure rolls back.
  frame.add(staging);
  for(const {old,body}of prepared)old.geometry=body;
  kit.owned.push(...newMaterials);(kit.ownedTextures??=[]).push(texture);
  frame.userData.donghuaExteriorEnvelope=record;frame.userData.structure.donghuaExteriorEnvelope=record;
 }catch(error){
  for(const {old,g}of prepared)old.geometry=g;
  if(staging.parent)staging.removeFromParent();
  kit.owned.length=ownedLength;
  if(hadTextures){kit.ownedTextures=oldTextures;if(oldTextures)oldTextures.length=textureLength;}else delete kit.ownedTextures;
  if(oldRecord.own)frame.userData.donghuaExteriorEnvelope=oldRecord.value;else delete frame.userData.donghuaExteriorEnvelope;
  if(oldStructureRecord.own)frame.userData.structure.donghuaExteriorEnvelope=oldStructureRecord.value;else delete frame.userData.structure.donghuaExteriorEnvelope;
  releaseCandidate();throw error;
 }
 for(const {g}of prepared)g.dispose();
 return true;
}
function geometry(arrays,resources){
 const g=new THREE.BufferGeometry();resources.add(g);for(const [key,a]of Object.entries(arrays))g.setAttribute(key,new THREE.Float32BufferAttribute(a,key==='uv'?2:3));
 if(!g.attributes.normal)g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
}
function windowPixels(){
 const width=1024,height=256,data=new Uint8Array(width*height*4);
 const groups=[[-10.85,-7.55],[-6.85,-2.75],[-2.05,2.05],[2.75,6.85],[7.55,10.85]];
 for(let py=0;py<height;py++)for(let px=0;px<width;px++){
  const x=-10.85+21.7*(px+.5)/width,y=9.3+4.92*(py+.5)/height,g=groups.find(([a,b])=>x>=a&&x<=b);let color=[114,37,27];
  if(g&&y>=10.35&&y<13.55){
   const v=(y-10.35)/3.2,u=(x-g[0])/(g[1]-g[0]),cell=u*4,cu=cell%1;
   // Four fitted subdivisions make the visible grouping legible. Tiny motif
   // is deliberately simplified; no claim to a traced historic lattice.
   if(cu<.045||cu>.955||v<.035||v>.965)color=[161,111,57];
   else{const a=cu*4,b=v*12,dx=a%1-.5,dy=b%1-.5;
    const ink=Math.abs(Math.abs(dx)+Math.abs(dy)-.5)<.065||Math.abs(Math.hypot(dx,dy)-.21)<.04;color=ink?[215,205,167]:[49,47,32];}
  }else if(g&&y>=13.7&&y<14.1)color=[48,41,28];
  const i=(py*width+px)*4;data.set([...color,255],i);
 }return data;
}
