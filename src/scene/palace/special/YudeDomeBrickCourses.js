import * as THREE from 'three';
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/dc/7415.jpg';
const fingerprint=a=>{let h=2166136261;for(const x of new Uint8Array(a.buffer,a.byteOffset,a.byteLength))h=Math.imul(h^x,16777619);return(h>>>0).toString(16);};
const EXPECTED={position:[1235,3,'793bf8d3'],uv:[1235,2,'3b0dd86b'],normal:[1235,3,'401515e7'],index:[6912,1,'9837e801']};
/** Procedural, fitted brick joints only. The official photo is a reference, not
 * a bundled texture; no wear, calligraphy or historical brick count is claimed.
 * U is longitude, V is the existing radial cap coordinate (not wall UVs). */
export function yudeDomeCoursePixels(size=512){
 if(size!==512)throw Error('Yude dome texture has a fixed bounded resolution');
 const data=new Uint8Array(size*size*4),R=(2.55**2+1.65**2)/(2*1.65)-.12,opening=.525,outer=2.425,arc0=R*Math.asin(opening/R);
 for(let y=0;y<size;y++){const r=opening+(outer-opening)*y/(size-1),arc=R*Math.asin(r/R)-arc0,course=Math.floor(arc/.16),phase=arc-course*.16,midR=R*Math.sin((arc0+(course+.5)*.16)/R),count=Math.max(6,Math.round(2*Math.PI*midR/.32));
  for(let x=0;x<size;x++){const u=x/(size-1),v=u*count+(course%2)*.5,across=v-Math.floor(v),mortar=phase<.007||Math.min(across,1-across)*2*Math.PI*r/count<.004,p=(y*size+x)*4,shade=mortar?169:248;data[p]=shade;data[p+1]=mortar?167:248;data[p+2]=mortar?156:246;data[p+3]=255;}}
 return data;
}
export function applyYudeDomeBrickCourses(kit,frame){
 const g=frame?.userData.structure;
 if(!g||g.id!=='yude-bath-compound'||g.x!==246||g.z!==-177.2||g.front?.ph!==.5||g.bath?.x!==-3.3||g.bath?.z!==12||g.bath?.w!==5.4||g.bath?.d!==5.4||g.bath?.h!==3.1||g.bath?.domeRadius!==2.55||g.bath?.domeRise!==1.65||g.bath?.lanternWidth!==1.25||g.yudeDomeBrickCourses||frame.parent!==kit?.root||frame.position.x!==246||frame.position.y!==0||frame.position.z!==-177.2||frame.rotation.x||frame.rotation.y||frame.rotation.z||!frame.scale.equals(new THREE.Vector3(1,1,1)))return false;
 const targets=[];frame.traverse(m=>{if(m.userData.role==='yude-white-glazed-inner-dome')targets.push(m);});if(targets.length!==1)return false;
 const m=targets[0],geo=m.geometry;
 if(!m.isMesh||!m.visible||m.parent!==frame||m.position.lengthSq()||m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(new THREE.Vector3(1,1,1))||!m.material.isMeshStandardMaterial||m.material.name!=='r48_outer_white_glaze'||m.material.color.getHex()!==0xd2ccb4||m.material.map||m.material.transparent||m.material.opacity!==1||m.material.side!==THREE.FrontSide||geo.groups.length||geo.drawRange.start!==0||geo.drawRange.count!==Infinity||Object.keys(geo.attributes).sort().join(',')!=='normal,position,uv'||Object.keys(geo.morphAttributes).length)return false;
 for(const[k,[count,itemSize,signature]]of Object.entries(EXPECTED)){const a=k==='index'?geo.index:geo.attributes[k];if(!a||a.isInterleavedBufferAttribute||a.normalized||a.count!==count||a.itemSize!==itemSize||fingerprint(a.array)!==signature)return false;}
 const texture=new THREE.DataTexture(yudeDomeCoursePixels(),512,512,THREE.RGBAFormat,THREE.UnsignedByteType);texture.name='yude_photo_constrained_dome_courses_512';texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.RepeatWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;(kit.ownedTextures??=[]).push(texture);
 const material=m.material.clone();material.name='remaining_outer_yude_photo_dome_courses';material.map=texture;kit.owned.push(material);m.material=material;
 const meta={source:SOURCE,photographyDate:null,status:'VERIFY_PENDING',accepted:false,scope:'EXISTING_INWARD_DOME_ALBEDO_JOINTS_ONLY',geometryChanged:false,uvChanged:false,navigationChanged:false,access:'CLOSED_REAR_NOT_VISITOR_ACCESS',dimensionStatus:'COURSE_SIZE_AND_BRICK_COUNT_FITTED_NOT_SURVEYED',exactBrickCount:null,sourcePixelsRedistributed:false,textureResolution:512,textureBytes:512*512*4,unknown:'Exact brick module, glazing response, aging, mortar depth and current access remain unverified.'};g.yudeDomeBrickCourses=meta;m.userData.yudeDomeBrickCourses={...meta};return true;
}
