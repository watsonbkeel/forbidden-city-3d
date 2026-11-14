import * as T from 'three';
// Engineering-only colour region on the original continuous surface.
// No new shell/curls, no measured or historical hairline claim.
const smooth=T.MathUtils.smoothstep;
export function scalpWeight(x,y,z){
 if(y<=2.035||y>2.25||Math.abs(x)>.205)return 0;
 const lower=2.04+.03*(Math.abs(x)/.18)**2,vertical=smooth(y,lower,lower+.022),back=1-smooth(z,-.035,0),side=smooth(Math.abs(x),.08,.12)*smooth(y,2.10,2.13),top=smooth(y,2.205,2.225),front=Math.max(side,top)*(1-smooth(z,.035,.075));
 return Math.max(0,Math.min(1,vertical*Math.max(back,front)));
}
export function prepareScalpBorder(g){
 const p=g.attributes.position,art=new Set(),gold=new Set(),adj=new Map();
 for(const q of g.groups)if(q.materialIndex===0||q.materialIndex===1)for(let j=q.start;j<q.start+q.count;j+=3){const ids=[g.index.getX(j),g.index.getX(j+1),g.index.getX(j+2)];for(const i of ids)(q.materialIndex===0?art:gold).add(i);if(q.materialIndex===1)for(let k=0;k<3;k++){const a=ids[k],b=ids[(k+1)%3],d=Math.hypot(p.getX(a)-p.getX(b),p.getY(a)-p.getY(b),p.getZ(a)-p.getZ(b));for(const[x,y]of[[a,b],[b,a]]){if(!adj.has(x))adj.set(x,new Map());adj.get(x).set(y,d);}}}
 const dist=new Float64Array(p.count).fill(Infinity),queue=[];for(const i of art)if(gold.has(i)){dist[i]=0;queue.push(i);}for(let h=0;h<queue.length;h++){const a=queue[h];for(const[b,d]of adj.get(a)??[]){const nd=dist[a]+d;if(nd<.025&&nd<dist[b]){dist[b]=nd;queue.push(b);}}}
 const weights=Float32Array.from(dist,d=>Number.isFinite(d)?smooth(d,0,.025):1);g.setAttribute('studyScalpBorder',new T.BufferAttribute(weights,1));return g;
}
export function createContinuousScalpMaterial(){
 const m=new T.MeshStandardMaterial({color:0xad8146,roughness:.76,metalness:.16}),brown=new T.Color(0x6a4c2f);
 m.onBeforeCompile=s=>{for(const [src,tokens]of[[s.vertexShader,['#include <common>','#include <begin_vertex>']],[s.fragmentShader,['#include <common>','#include <map_fragment>']]])if(tokens.some(t=>!src.includes(t)))throw Error('continuous scalp shader template mismatch');s.uniforms.scalpBrown={value:brown};
 s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vScalpPosition; attribute float studyScalpBorder; varying float vScalpBorder;').replace('#include <begin_vertex>','#include <begin_vertex>\nvScalpPosition=position;vScalpBorder=studyScalpBorder;');
 s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
 varying vec3 vScalpPosition; varying float vScalpBorder; uniform vec3 scalpBrown;
 float scalpMask(vec3 p){if(p.y<=2.035||p.y>2.25||abs(p.x)>.205)return 0.0;
 float lower=2.04+.03*pow(abs(p.x)/.18,2.0);
 float vertical=smoothstep(lower,lower+.022,p.y),back=1.0-smoothstep(-.035,0.0,p.z);
 float side=smoothstep(.08,.12,abs(p.x))*smoothstep(2.10,2.13,p.y),top=smoothstep(2.205,2.225,p.y);
 float front=max(side,top)*(1.0-smoothstep(.035,.075,p.z));return clamp(vertical*max(back,front),0.0,1.0);}
 `).replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,scalpBrown,scalpMask(vScalpPosition)*clamp(vScalpBorder,0.0,1.0));');};m.customProgramCacheKey=()=> 'unified-scalp-engineering-mask-v1';return m;
}
// Diagnostic-only wrapper: share the exact scalp shader, but modify only
// the art material's non-image fallback. No geometry/texture ownership.
export function installUnifiedScalp(art){
 const scalp=createContinuousScalpMaterial(),oldCompile=art.onBeforeCompile,oldKey=art.customProgramCacheKey;
 const template={uniforms:{},vertexShader:'#include <common>\n#include <begin_vertex>',fragmentShader:'#include <common>\n#include <map_fragment>'};scalp.onBeforeCompile(template);
 const common=template.fragmentShader.split('#include <map_fragment>')[0].replace('#include <common>','').replace('varying float vScalpBorder;','');
 const injectVertex=s=>{if(!s.vertexShader.includes('#include <common>')||!s.vertexShader.includes('#include <begin_vertex>'))throw Error('unified scalp vertex template mismatch');s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vScalpPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nvScalpPosition=position;');};
 scalp.onBeforeCompile=s=>{injectVertex(s);if(!s.fragmentShader.includes('#include <common>')||!s.fragmentShader.includes('#include <map_fragment>'))throw Error('unified scalp gold template mismatch');s.uniforms.scalpBrown=template.uniforms.scalpBrown;s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>'+common).replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,scalpBrown,scalpMask(vScalpPosition));');};
 art.onBeforeCompile=s=>{oldCompile.call(art,s);const expression='mix(studyGold,studyTexel.rgb,clamp(vStudyArtBlend,0.0,1.0))';if(s.fragmentShader.split(expression).length!==2||s.fragmentShader.split('diffuseColor.rgb *= studyGold;').length!==2)throw Error('unified scalp art template mismatch');injectVertex(s);s.uniforms.scalpBrown=template.uniforms.scalpBrown;s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>'+common).replace(expression,'mix(mix(studyGold,scalpBrown,scalpMask(vScalpPosition)),studyTexel.rgb,clamp(vStudyArtBlend,0.0,1.0))').replace('diffuseColor.rgb *= studyGold;','diffuseColor.rgb *= mix(studyGold,scalpBrown,scalpMask(vScalpPosition));');};
 const key=oldKey.call(art);art.customProgramCacheKey=()=>key+'|unified-scalp-fallback-v1';scalp.customProgramCacheKey=()=> 'unified-scalp-gold-v1';art.needsUpdate=true;return scalp;
}
