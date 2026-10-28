import * as THREE from 'three';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/1442[1024].jpg';
// Half-plane clipping makes irregular polygon cells, not a rectangular grid.
function clip(poly,a,b,c){const out=[];for(let i=0;i<poly.length;i++){const u=poly[i],v=poly[(i+1)%poly.length],du=a*u[0]+b*u[1]-c,dv=a*v[0]+b*v[1]-c;if(du<=0)out.push(u);if((du<0)!==(dv<0)){const t=du/(du-dv);out.push([u[0]+t*(v[0]-u[0]),u[1]+t*(v[1]-u[1])]);}}return out;}
/** Source-visible motif families only. Original full-wrap continuation is a
 * decorative fit, not unseen-side evidence, physical relief or photo pixels. */
export function fitBiluoFinialSurface(c,m){
 const {p,f,kit}=c;
 if(p.key!=='biluo'||p.id!=='place-ningshou-47ec73915d'||p.localW!==5||p.localD!==4.9||p.ph!==.5||p.rot!==0||f.parent!==kit.root||f.position.x!==p.x||f.position.y!==0||f.position.z!==p.z||f.rotation.x||f.rotation.y||f.rotation.z||!f.scale.equals(new THREE.Vector3(1,1,1))||f.userData.biluoFinialSurface)throw Error('Biluo finial registered frame mismatch');
 if(m.parent!==f||m.userData.role!=='r68-biluo-finial-ovoid'||m.position.x||m.position.z||m.position.y!==p.ph+3.2+2.8+.81||m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(new THREE.Vector3(.30,.40,.30))||m.material!==c.mats.blue)throw Error('Biluo finial identity/transform mismatch');
 const expected=new THREE.SphereGeometry(1,24,16);try{for(const key of ['position','normal','uv','index']){const a=key==='index'?m.geometry.index:m.geometry.attributes[key],b=key==='index'?expected.index:expected.attributes[key];if(!a||a.itemSize!==b.itemSize||a.count!==b.count||a.array.some((v,i)=>!Object.is(v,b.array[i])))throw Error('Biluo finial original buffer mismatch');}}finally{expected.dispose();}
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#287c82';ctx.fillRect(0,0,1024,512);
 let seed=47235;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},sites=[];
 for(let i=0;i<240;i++)sites.push([random()*1024,random()*512]);
 const all=sites.flatMap(v=>[-1024,0,1024].map(dx=>[v[0]+dx,v[1]]));ctx.strokeStyle='#d6d5b5';ctx.lineWidth=4.4;ctx.lineJoin='round';
 for(const v of all){let poly=[[-24,0],[1048,0],[1048,512],[-24,512]];for(const w of all){if(v===w)continue;poly=clip(poly,2*(w[0]-v[0]),2*(w[1]-v[1]),w[0]**2+w[1]**2-v[0]**2-v[1]**2);if(!poly.length)break;}if(poly.length){ctx.beginPath();ctx.moveTo(...poly[0]);poly.slice(1).forEach(q=>ctx.lineTo(...q));ctx.closePath();ctx.stroke();}}
 // Five separated rounded petals and a small centre. Not raised geometry or
 // measured flower positions/counts. Wrap copies keep the original UV seam.
 let flowers=0;for(let i=0;i<sites.length;i+=5){const [x,y]=sites[i];if(y<30||y>482)continue;flowers++;for(const dx of [-1024,0,1024]){ctx.save();ctx.translate(x+dx,y);ctx.scale(1.65,1.65);for(let k=0;k<5;k++){const a=k*2*Math.PI/5-Math.PI/2;ctx.beginPath();ctx.ellipse(Math.cos(a)*5.8,Math.sin(a)*5.8,4.8,3.7,a,0,2*Math.PI);ctx.fillStyle='#e3ddbd';ctx.fill();ctx.strokeStyle='#8c936f';ctx.lineWidth=.9;ctx.stroke();}ctx.beginPath();ctx.arc(0,0,2.5,0,2*Math.PI);ctx.fillStyle='#c5b77f';ctx.fill();ctx.restore();}}
 // Identical edge texels seal the equirectangular wrap at finite sampling.
 ctx.drawImage(canvas,0,0,1,512,1023,0,1,512);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=THREE.RepeatWrapping;map.wrapT=THREE.ClampToEdgeWrapping;map.anisotropy=4;
 const mat=new THREE.MeshStandardMaterial({name:'biluo-finial-ice-plum-surface-fit',map,color:0xffffff,roughness:.7,metalness:0});kit.owned.push(mat);(kit.ownedTextures??=[]).push(map);m.material=mat;m.userData.biluoFinialSurface=true;m.userData.patternStatus='ICE_CRACKLE_FIVE_PETAL_SURFACE_FIT_NOT_RELIEF';
 return f.userData.biluoFinialSurface={originalObjectId:'FC-47EC73915D',source:PHOTO,scope:'EXISTING_OVOID_FINIAL_SURFACE_ONLY',dimensionStatus:'RETAINED_MODEL_ENVELOPE_NOT_SURVEYED',patternStatus:'ORIGINAL_DETERMINISTIC_ICE_CRACKLE_AND_FIVE_PETAL_SURFACE_APPROXIMATION',reliefStatus:'SOURCE_RAISED_FLOWERS_NOT_RECONSTRUCTED_IN_GEOMETRY',backStatus:'ORIGINAL_FITTED_CONTINUATION_NOT_INDEPENDENTLY_VERIFIED',flowerCount:flowers,countStatus:'MODEL_PATTERN_NOT_SOURCE_COUNT',photographyDate:null,wholeObjectAccepted:false,remaining:['Actual raised flower relief and exact ice-crackle layout','Lower petal supports and decorated bowl/neck','Backside independent evidence','Complete pavilion, mountain/bridge relationship and interior acceptance']};
}
