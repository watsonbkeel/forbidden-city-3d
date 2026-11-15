import * as T from 'three';
export const STUDY_GOLD=0xad8146;
// Same geometry/material partitions, softened only inside verified art faces.
// Texture is never sampled on invalid-alpha geometry to disguise a hole.
export function prepareStudyArtBlend(g){
 const p=g.attributes.position,n=g.attributes.normal,index=g.index,art=new Uint8Array(p.count),gold=new Uint8Array(p.count),adj=Array.from({length:p.count},()=>new Set());
 for(const group of g.groups)if(group.materialIndex===0||group.materialIndex===1)for(let j=group.start;j<group.start+group.count;j+=3){const ids=[index.getX(j),index.getX(j+1),index.getX(j+2)];for(const i of ids)(group.materialIndex===0?art:gold)[i]=1;if(group.materialIndex===0)for(const [a,b]of[[ids[0],ids[1]],[ids[1],ids[2]],[ids[2],ids[0]]]){adj[a].add(b);adj[b].add(a);}}
 const distances=new Float64Array(p.count).fill(Infinity),heap=[];
 const push=(d,id)=>{let i=heap.length;heap.push([d,id]);while(i){const parent=(i-1)>>1;if(heap[parent][0]<=d)break;heap[i]=heap[parent];i=parent;}heap[i]=[d,id];};
 const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1][0]<heap[child][0])child++;if(heap[child][0]>=last[0])break;heap[i]=heap[child];i=child;}heap[i]=last;}return first;};
 for(let i=0;i<p.count;i++)if(art[i]&&gold[i]){distances[i]=0;push(0,i);}
 while(heap.length){const[d,i]=pop();if(d!==distances[i]||d>=.08)continue;for(const j of adj[i]){const next=d+Math.hypot(p.getX(i)-p.getX(j),p.getY(i)-p.getY(j),p.getZ(i)-p.getZ(j));if(next<distances[j]){distances[j]=next;push(next,j);}}}
 // Keep identity-bearing verified head/palm artwork at oblique normals.
 // Boundary vertices remain gold; .025 is a vertex-distance target, not a
 // guaranteed pixel/world-width band on the sampled .025m body mesh.
 const rectangle=(x,y,r)=>T.MathUtils.smoothstep(Math.min(x-r[0],r[1]-x,y-r[2],r[3]-y),-.02,0);
 const protection=(x,y)=>Math.max(T.MathUtils.smoothstep(y,1.76,1.80),rectangle(x,y,[-.45,-.315,.913,1.207]),rectangle(x,y,[-.126,.198,1.104,1.206]));
 const blend=new Float32Array(p.count);for(let i=0;i<p.count;i++)if(art[i]){const t=Math.min(1,distances[i]/.08),normal=T.MathUtils.smoothstep(n.getZ(i),.25,.7),base=t*t*(3-2*t)*normal,q=Math.min(1,distances[i]/.025),kept=q*q*(3-2*q),protect=protection(p.getX(i),p.getY(i));blend[i]=base+(kept-base)*protect;}

 g.setAttribute('studyArtBlend',new T.BufferAttribute(blend,1));return{method:'VERIFIED_ART_REGIONAL_DETAIL_PRESERVATION',distanceMetres:.08,detailDistanceTargetMetres:.025,detailBandWidthGuaranteed:false,protectedRegions:['head-face-hair','right-hand','left-palm'],regionFeatherMetres:.02,goldColour:STUDY_GOLD};
}
export function createStudyArtMaterial(texture){
 const material=new T.MeshStandardMaterial({name:'generated-art-soft-partition',map:texture??null,color:0xffffff,roughness:.76,metalness:.16});
 material.customProgramCacheKey=()=> 'central-study-art-blend-v2';
 material.onBeforeCompile=shader=>{
  if(!shader.vertexShader.includes('#include <begin_vertex>')||!shader.fragmentShader.includes('#include <map_fragment>'))throw Error('Unsupported art transition shader layout');
  shader.uniforms.studyGold={value:new T.Color(STUDY_GOLD)};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float studyArtBlend; varying float vStudyArtBlend;').replace('#include <begin_vertex>','#include <begin_vertex>\nvStudyArtBlend=studyArtBlend;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 studyGold; varying float vStudyArtBlend;').replace('#include <map_fragment>',`#ifdef USE_MAP
 vec4 studyTexel=texture2D(map,vMapUv);
 diffuseColor.rgb *= mix(studyGold,studyTexel.rgb,clamp(vStudyArtBlend,0.0,1.0));
#else
 diffuseColor.rgb *= studyGold;
#endif`);
 };return material;
}
