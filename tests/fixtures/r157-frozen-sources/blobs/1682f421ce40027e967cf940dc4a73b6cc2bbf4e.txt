import * as THREE from 'three';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efeecf846027.jpg';
/** Original vector approximation of the photographed front green/gold band.
 * Surface only: relief depth and exact carving/paint technique are unverified. */
export function fitFanhuaFloorFascia(c){
 const {p,f,kit}=c;
 if(p.key!=='fanhua'||p.id!=='place-ningshou-d40cef5893'||p.localW!==25.8||p.localD!==8.6||p.upperFloorY!==3.85||p.rot!==0||f.parent!==kit.root||f.position.x!==p.x||f.position.y!==0||f.position.z!==p.z||f.rotation.x||f.rotation.y||f.rotation.z||!f.scale.equals(new THREE.Vector3(1,1,1))||f.userData.fanhuaFloorFascia)throw Error('Fanhua floor fascia requires unchanged registered frame');
 const matches=f.children.filter(m=>m.userData.role==='painted-beam-band'&&Math.abs(m.position.y-3.63)<1e-8&&Math.abs(m.position.z+4.45)<1e-8);
 if(matches.length!==1)throw Error('Fanhua front floor band identity mismatch');
 const m=matches[0],g=m.geometry,par=g.parameters;
 if(m.position.x!==0||m.rotation.x||m.rotation.y||m.rotation.z||par?.width!==25.8||par.height!==.13||par.depth!==.035||Array.isArray(m.material)||m.scale.x!==1||m.scale.y!==1||m.scale.z!==1)throw Error('Fanhua floor fascia shape mismatch');
 const expected=new THREE.BoxGeometry(25.8,.13,.035);
 try{for(const key of ['position','normal','uv','index']){const a=key==='index'?g.index:g.attributes[key],b=key==='index'?expected.index:expected.attributes[key];if(!a||a.itemSize!==b.itemSize||a.count!==b.count||a.array.length!==b.array.length||a.array.some((v,i)=>!Object.is(v,b.array[i])))throw Error('Fanhua floor fascia ordered buffer mismatch');}}finally{expected.dispose();}
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#215b4d';ctx.fillRect(0,0,256,128);ctx.strokeStyle='#c9a85d';ctx.lineWidth=5;ctx.lineJoin='round';ctx.lineCap='round';
 // Linked opposed curls, not pasted photographic pixels. Each repeat joins
 // its neighbours at y=64; the fitted repeat count is not a source count.
 for(const flip of [false,true]){ctx.save();if(flip){ctx.translate(256,128);ctx.scale(-1,-1);}ctx.beginPath();ctx.moveTo(0,64);ctx.bezierCurveTo(24,64,24,22,64,20);ctx.bezierCurveTo(104,16,130,41,124,70);ctx.bezierCurveTo(118,99,77,102,64,79);ctx.bezierCurveTo(53,59,70,43,85,48);ctx.bezierCurveTo(101,53,98,70,87,69);ctx.stroke();ctx.restore();}
 ctx.beginPath();ctx.moveTo(0,64);ctx.bezierCurveTo(26,57,26,18,55,16);ctx.bezierCurveTo(84,0,102,13,128,19);ctx.bezierCurveTo(154,13,172,0,201,16);ctx.bezierCurveTo(230,18,230,57,256,64);ctx.bezierCurveTo(230,71,230,110,201,112);ctx.bezierCurveTo(172,128,154,115,128,109);ctx.bezierCurveTo(102,115,84,128,55,112);ctx.bezierCurveTo(26,110,26,71,0,64);ctx.stroke();
 for(const y of [6,122]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=THREE.RepeatWrapping;map.wrapT=THREE.ClampToEdgeWrapping;map.repeat.set(52,1);map.anisotropy=4;
 const mat=new THREE.MeshStandardMaterial({name:'fanhua-front-floor-green-gold-scroll-fit',map,color:0xffffff,roughness:.8,metalness:0});kit.owned.push(mat);(kit.ownedTextures??=[]).push(map);
 // Front (-Z) only. Other faces sample a plain green texel; no unobserved
 // backside ornament. Box shape/ordered positions remain, Y fit stays within
 // the original support beam [3.41,3.77]. No new collision/support is made.
 const uv=g.attributes.uv;for(const group of g.groups)if(group.materialIndex!==5)for(let i=group.start;i<group.start+group.count;i++){const j=g.index.getX(i);uv.setXY(j,.5/256,.5/128);}uv.needsUpdate=true;
 m.material=mat;m.scale.y=.30/.13;m.position.y=3.59;m.userData.fanhuaFloorFascia=true;
 return f.userData.fanhuaFloorFascia={originalObjectId:'FC-D40CEF5893',source:PHOTO,scope:'FRONT_FIRST_FLOOR_BEAM_SURFACE_ONLY',dimensionStatus:'PHOTO_RELATIONSHIP_MODEL_FIT_NOT_SURVEYED',patternStatus:'ORIGINAL_VECTOR_APPROXIMATION_NOT_EXACT_CARVING',reliefDepth:'UNVERIFIED_NOT_MODELLED',repeatCount:52,repeatCountStatus:'MODEL_FIT_NOT_PHOTO_COUNT',photographyDate:null,wholeObjectAccepted:false,remaining:['Exact carved relief and original decorative detail','Back and side floor friezes independently unverified','Complete interior inventory and remaining hall geometry']};
}
