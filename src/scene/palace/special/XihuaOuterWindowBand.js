import * as THREE from 'three';
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/dc/8238%5B1024%5D.jpg';
/** Photo-constrained pale outer frames only. Leaf spacing and tiny lattice
 * marks are fitted; this is not a tracing or evidence about the other faces. */
export function xihuaOuterWindowPixels(){
 const w=1024,h=256,data=new Uint8Array(w*h*4),groups=[[-10.85,-7.38,4],[-7.02,-2.58,4],[-2.22,2.22,6],[2.58,7.02,4],[7.38,10.85,4]];
 for(let py=0;py<h;py++)for(let px=0;px<w;px++){
  const x=-10.85+21.7*(px+.5)/w,v=(py+.5)/h,g=groups.find(([a,b])=>x>=a&&x<=b);let c=[104,35,27];
  if(g){const u=(x-g[0])/(g[1]-g[0]),cell=u*g[2],cu=cell%1,edge=cu<.065||cu>.935||v<.025||v>.975;
   if(edge)c=[227,214,177];else{const a=(cu-.065)/.87*4,b=(v-.025)/.95*14,dx=a-Math.floor(a)-.5,dy=b-Math.floor(b)-.5,r=Math.hypot(dx,dy);const ink=Math.abs(Math.abs(dx)+Math.abs(dy)-.52)<.075||Math.abs(r-.27)<.055;c=ink?[200,184,142]:[59,43,29];}}
  const o=(py*w+px)*4;data[o]=c[0];data[o+1]=c[1];data[o+2]=c[2];data[o+3]=255;
 }return data;
}
export function applyXihuaOuterWindowBand(kit,f,item){
 if(item?.name!=='西华门')return false;
 if(item.cityGateProfile!=='east-west'||item.x!==360.5||item.z!==-260.6||item.rot!=='west'||f.position.x!==360.5||f.position.z!==-260.6||f.rotation.y!==-Math.PI/2||!f.scale.equals(new THREE.Vector3(1,1,1))||f.userData.xihuaOuterWindowBand)throw Error('Xihua outer-band identity or duplicate application');
 const targets=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('lattice_doors'));
 if(targets.length!==1)throw Error('Xihua retained lattice-box identity drift');const old=targets[0],geo=old.geometry,p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;
 if(Object.keys(geo.attributes).sort().join(',')!=='normal,position,uv'||Object.keys(geo.morphAttributes).length||geo.drawRange.start!==0||geo.drawRange.count!==Infinity||geo.index||p.count!==36||!n||!uv||old.position.x||Math.abs(old.position.y-11.76)>1e-8||old.position.z||old.rotation.x||old.rotation.y||old.rotation.z||!old.scale.equals(new THREE.Vector3(1,1,1))||!old.visible||old.material.transparent||old.material.opacity!==1)throw Error('Xihua retained box geometry drift');
 const front=[];for(let i=0;i<36;i++)if(n.getZ(i)<-.99)front.push(i);
 if(front.length!==6||front.some(i=>Math.abs(p.getZ(i)+3.35)>1e-5)||Math.abs(Math.min(...front.map(i=>p.getX(i)))+10.85)>1e-5||Math.abs(Math.max(...front.map(i=>p.getX(i)))-10.85)>1e-5||Math.abs(Math.min(...front.map(i=>p.getY(i)))+2.46)>1e-5||Math.abs(Math.max(...front.map(i=>p.getY(i)))-2.46)>1e-5)throw Error('Xihua outer face bounds drift');
 // Retain all attributes of the other five faces. The band below the existing
 // balustrade top is occluded in the source and retains its previous UVs.
 const arrays={position:[],normal:[],uv:[]};for(let i=0;i<36;i++)if(!front.includes(i))for(const key of Object.keys(arrays)){const a=geo.attributes[key];for(let j=0;j<a.itemSize;j++)arrays[key].push(a.array[i*a.itemSize+j]);}
 const lo=Math.min(...front.map(i=>p.getY(i))),hi=Math.max(...front.map(i=>p.getY(i))),left=Math.min(...front.map(i=>p.getX(i))),right=Math.max(...front.map(i=>p.getX(i))),z=p.getZ(front[0]),cut=10.35-old.position.y;
 const bottomLeft=front.find(i=>p.getX(i)===left&&p.getY(i)===lo),bottomRight=front.find(i=>p.getX(i)===right&&p.getY(i)===lo),topLeft=front.find(i=>p.getX(i)===left&&p.getY(i)===hi);if([bottomLeft,bottomRight,topLeft].some(i=>i===undefined))throw Error('Missing retained UV corners');
 const uL=uv.getX(bottomLeft),uR=uv.getX(bottomRight),v0=uv.getY(bottomLeft),v1=uv.getY(topLeft);
 for(const [x,y]of[[left,lo],[left,cut],[right,lo],[right,lo],[left,cut],[right,cut]]){arrays.position.push(x,y,z);arrays.normal.push(0,0,-1);arrays.uv.push(uL+(x-left)/(right-left)*(uR-uL),v0+(y-lo)/(hi-lo)*(v1-v0));}
 const body=new THREE.BufferGeometry();for(const[key,values]of Object.entries(arrays))body.setAttribute(key,new THREE.Float32BufferAttribute(values,key==='uv'?2:3));body.computeBoundingBox();body.computeBoundingSphere();
 const skin=new THREE.BufferGeometry(),pos=[],norm=[],tex=[];for(const[x,y]of[[left,cut],[left,hi],[right,cut],[right,cut],[left,hi],[right,hi]]){pos.push(x,y,z);norm.push(0,0,-1);tex.push((x-left)/(right-left),(y-cut)/(hi-cut));}skin.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));skin.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));skin.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));skin.computeBoundingBox();skin.computeBoundingSphere();
 const texture=new THREE.DataTexture(xihuaOuterWindowPixels(),1024,256,THREE.RGBAFormat,THREE.UnsignedByteType);texture.name='xihua_fitted_outer_pale_windows';texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;(kit.ownedTextures??=[]).push(texture);
 const mat=new THREE.MeshStandardMaterial({name:'xihua_photo_outer_window_band',color:0xffffff,map:texture,roughness:.85,metalness:0});kit.owned.push(mat);
 old.geometry=body;geo.dispose();const mesh=kit.mesh(f,skin,mat,old.position.x,old.position.y,old.position.z);mesh.name='xihua-photo-outer-window-band';
 const meta={objectId:'FC-6B7C231BFD',source:SOURCE,status:'PARTIAL_FITTED_VISIBLE_COLOR_AND_WINDOW_GROUPS',accepted:false,localFace:'-Z_OUTSIDE_WEST',globalY:[10.35,14.22],groupCount:5,leafCounts:[4,4,6,4,4],leafCountsStatus:'MODEL_FIT_NOT_INDEPENDENT_COUNT_VERIFICATION',latticeMotif:'SIMPLIFIED_NOT_TRACED',unseenSides:'UNCHANGED',lowerOccludedBand:'RETAINED_ORIGINAL_UV',navigationChanged:false,netTriangleDelta:2,textureBytes:1024*256*4};mesh.userData.xihuaOuterWindowBand=meta;f.userData.xihuaOuterWindowBand=meta;return true;
}
