import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';

const NAME='r242_taiji_south_green_registers_fit';
const PROGRAM='r242-taiji-south-green-registers-v3';
const SOURCE={kind:'gate',name:'太极门',x:139.5,z:304.5,plaque:false};
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-7;
const fail=what=>{throw Error('Taiji south gate '+what);};

// Exact current source slot, not a same-name or equal-value item elsewhere.
export function validateTaijiSouthGateSource(zoneJson,item){
 if(zoneJson?.id!=='west-six'||zoneJson.items?.[28]!==item)return false;
 if(!item||Object.keys(item).length!==Object.keys(SOURCE).length||Object.entries(SOURCE).some(([k,v])=>item[k]!==v))fail('source changed');
 return true;
}

function ordinaryTransform(o,position){
 return o?.position?.toArray().every((v,i)=>near(v,position[i]))&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.toArray().every(v=>v===1)&&o.matrixAutoUpdate===true;
}
function component(mesh,position,dimensions,material,tileSize){
 const g=mesh?.geometry;
 if(mesh?.constructor!==T.Mesh||mesh.parent===null||mesh.children.length||!ordinaryTransform(mesh,position)||mesh.material!==material||mesh.visible!==true||mesh.userData.noMerge||mesh.isSkinnedMesh||mesh.isInstancedMesh||mesh.morphTargetInfluences?.length||mesh.customDepthMaterial||mesh.customDistanceMaterial||g?.constructor!==T.BufferGeometry||g.type!=='BufferGeometry'||g.index!==null||Object.keys(g.morphAttributes).length)fail('component changed');
 if(Object.keys(g.attributes).sort().join(',')!=='normal,position,uv')fail('component attributes changed');
 for(const [key,size]of [['position',3],['normal',3],['uv',2]]){const a=g.attributes[key];if(!a?.isBufferAttribute||a.itemSize!==size||a.count!==36||a.normalized||!(a.array instanceof Float32Array)||!a.array.every(Number.isFinite))fail('component attributes changed');}
 // Check the actual full box surface, not only its nominal parameter envelope.
 const ref=applyBoxUV(new T.BoxGeometry(...dimensions),tileSize);
 try{for(const key of ['position','normal','uv']){const a=g.attributes[key].array,b=ref.attributes[key].array;if(a.length!==b.length||a.some((x,i)=>x!==b[i]))fail('component surface changed');}if(JSON.stringify(g.groups)!==JSON.stringify(ref.groups)||g.drawRange.start!==ref.drawRange.start||g.drawRange.count!==ref.drawRange.count)fail('component draw range changed');}finally{ref.dispose();}
}

function addShader(shader){
 const checks=[['vertexShader','#include <common>'],['vertexShader','#include <project_vertex>'],['fragmentShader','#include <common>'],['fragmentShader','#include <color_fragment>']];
 for(const [key,marker]of checks)if(typeof shader[key]!=='string'||shader[key].split(marker).length!==2)fail('shader marker changed: '+marker);
 const varyings='\nvarying vec3 vR242WorldPosition;\nvarying vec3 vR242WorldNormal;';
 const green=new T.Color('#3f7657').toArray().map(v=>v.toFixed(10)).join(', '),yellow=new T.Color('#c59b3c').toArray().map(v=>v.toFixed(10)).join(', ');
 const vertex=shader.vertexShader.replace('#include <common>','#include <common>'+varyings).replace('#include <project_vertex>','#include <project_vertex>\nvR242WorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvR242WorldNormal = normalize(mat3(modelMatrix) * objectNormal);');
 // Layout/colors are photo fits, not measured dimensions. Original map, normal,
 // roughness, alpha and lighting remain; no image pixels or texture are added.
 const fragment=shader.fragmentShader.replace('#include <common>','#include <common>'+varyings).replace('#include <color_fragment>',`#include <color_fragment>
vec3 p = vR242WorldPosition;
vec3 n = normalize(vR242WorldNormal);
bool r242Front = n.z < -0.999 && abs(p.z - 303.1) < 0.0001 && p.x >= 136.3 && p.x <= 142.7 && p.y >= 4.65 && p.y <= 5.4;
bool r251Trim = n.z < -0.999 && abs(p.z - 303.1) < 0.0001 && p.y >= 1.0 && p.y < 4.65 && ((p.x >= 136.3 && p.x <= 136.46) || (p.x >= 137.54 && p.x <= 137.7) || (p.x >= 141.3 && p.x <= 141.46) || (p.x >= 142.54 && p.x <= 142.7));
bool r263Bottom = n.z < -0.999 && abs(p.z - 303.1) < 0.0001 && p.y >= 1.0 && p.y < 1.10 && ((p.x >= 136.3 && p.x <= 137.7) || (p.x >= 141.3 && p.x <= 142.7));
if (r242Front) {
  if (p.y < 4.95) diffuseColor.rgb = vec3(${green});
  else if (p.y < 5.03) diffuseColor.rgb = vec3(${yellow});
  else diffuseColor.rgb = vec3(${green});
} else if (r251Trim) {
  diffuseColor.rgb = vec3(${yellow});
} else if (r263Bottom) {
  diffuseColor.rgb = vec3(${yellow});
}`);
 shader.vertexShader=vertex;shader.fragmentShader=fragment;
}

export function applyTaijiSouthGateGlaze(kit,frame,zoneJson,item){
 if(!validateTaijiSouthGateSource(zoneJson,item))return false;
 const root=kit?.root;
 if(frame?.parent!==root||root?.children.at(-1)!==frame||!ordinaryTransform(root,[0,0,0])||!ordinaryTransform(frame,[139.5,0,304.5])||frame.children.length!==10||frame.userData.structure?.gateKind!=='wall'||frame.userData.structure?.portalCount!==1||frame.userData.structure?.storeys!==1||frame.userData.structure?.eaveCount!==1)fail('component frame changed');
 const source=kit.lib.material('wall_red');
 if(source?.constructor!==T.MeshStandardMaterial||source.onBeforeCompile!==T.Material.prototype.onBeforeCompile||source.customProgramCacheKey!==T.Material.prototype.customProgramCacheKey||source.displacementMap||source.transparent||source.opacity!==1||source.side!==T.FrontSide||source.alphaMap||source.alphaTest||source.vertexColors||source.clippingPlanes||!Array.isArray(kit.owned))fail('material source changed');
 const tileSize=kit.lib.tileSize('wall_red');
 if(!Number.isFinite(tileSize)||tileSize<=0)fail('material source tile size changed');
 const selected=[frame.children[1],frame.children[3],frame.children[4]];
 component(selected[0],[-2.5,3.45,0],[1.4,4.9,2.8],source,tileSize);
 component(selected[1],[2.5,3.45,0],[1.4,4.9,2.8],source,tileSize);
 component(selected[2],[0,5.15,0],[3.6,1.5,2.8],source,tileSize);
 let material;
 try{
  material=source.clone();material.name=NAME;
  material.userData={...material.userData,taijiSouthGateGlaze:{status:'photo-fit-not-surveyed',verticalTrim:{status:'photo-fit-not-surveyed',width:0.16,y:[1,4.65],upperExclusive:true,x:[[136.3,136.46],[137.54,137.7],[141.3,141.46],[142.54,142.7]]},bottomTrim:{status:'photo-fit-not-surveyed',height:0.10,y:[1,1.10],upperExclusive:true,x:[[136.3,137.7],[141.3,142.7]]},bands:[[4.65,4.95,'green'],[4.95,5.03,'yellow'],[5.03,5.4,'green']],colors:{green:'#3f7657',yellow:'#c59b3c'},source:'https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/FZFpYviOjXBmmTCpJaGYn2TGpB6DphJJQVt1CqpC.jpg'}};
  material.onBeforeCompile=addShader;material.customProgramCacheKey=()=>PROGRAM;
 }catch(error){material?.dispose();throw error;}
 kit.owned.push(material);
 for(const mesh of selected)mesh.material=material;
 return true;
}
