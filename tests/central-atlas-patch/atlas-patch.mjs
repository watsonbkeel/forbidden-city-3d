import * as T from 'three';
export const SOURCE_ROI=Object.freeze([437,46,482,91]);
const center=[.18*Math.cos(.55)*Math.sin(2.06),2.005+.22*Math.sin(.55),.16*Math.cos(.55)*Math.cos(2.06)];
const unit=v=>{const n=Math.hypot(...v);return v.map(x=>x/n);};
const tangentU=unit([.18*Math.cos(2.06),0,-.16*Math.sin(2.06)]),normal=unit([center[0]/(.18*.18),(center[1]-2.005)/(.22*.22),center[2]/(.16*.16)]),tangentV=unit([normal[1]*tangentU[2]-normal[2]*tangentU[1],normal[2]*tangentU[0]-normal[0]*tangentU[2],normal[0]*tangentU[1]-normal[1]*tangentU[0]]);
export function patchCoordinates(x,y,z){if(!Number.isFinite(x+y+z))throw Error('finite patch position');const d=[x-center[0],y-center[1],z-center[2]];return[.5+d.reduce((s,v,i)=>s+v*tangentU[i],0)/.06,.5-d.reduce((s,v,i)=>s+v*tangentV[i],0)/.06];}
export function patchWeight(u,v){const s=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);return s(0,.15,u)*(1-s(.85,1,u))*s(0,.15,v)*(1-s(.85,1,v));}
export function createPatchSampler(source){if(!source?.isTexture||source.image?.width!==1024||source.image?.height!==1536)throw Error('fixed atlas texture');const t=source.clone();t.generateMipmaps=false;t.minFilter=T.LinearFilter;t.magFilter=T.LinearFilter;t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.needsUpdate=true;return t;}
const sub=(a,b)=>a.map((x,i)=>x-b[i]),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function preparePatch(g){
 const p=g.attributes.position,elig=g.attributes.studyScalpEligible,idx=g.index;if(!p||!elig||!idx||p.count>100000||idx.count>500000)throw Error('frozen patch geometry');
 const uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++)uv.set(patchCoordinates(p.getX(i),p.getY(i),p.getZ(i)),2*i);
 let triangles=0,minMM=Infinity,maxMM=0,maxAnisotropy=0,minArea=Infinity,maxArea=0;
 const pos=i=>[p.getX(i),p.getY(i),p.getZ(i)];
 for(const group of g.groups)for(let j=group.start;j<group.start+group.count;j+=3){const ids=[idx.getX(j),idx.getX(j+1),idx.getX(j+2)],ps=ids.map(pos),us=ids.map(i=>[uv[2*i],uv[2*i+1]]);
  if(!ps.some(a=>Math.hypot(...sub(a,center))<.10))continue;
  if(Math.max(...us.map(a=>a[0]))<=0||Math.min(...us.map(a=>a[0]))>=1||Math.max(...us.map(a=>a[1]))<=0||Math.min(...us.map(a=>a[1]))>=1)continue;
  if(group.materialIndex!==1||ids.some(i=>elig.getX(i)!==1)||ps.some(a=>a[2]>=.015||a[1]<2.04))throw Error('patch touches protected geometry');
  const e1=sub(ps[1],ps[0]),e2=sub(ps[2],ps[0]),len=Math.hypot(...e1),a=e1.map(x=>x/len),n=cross(e1,e2),nl=Math.hypot(...n),b=cross(n.map(x=>x/nl),a),xx=dot(e2,a),yy=dot(e2,b);
  const u1=(us[1][0]-us[0][0])*44,v1=(us[1][1]-us[0][1])*44,u2=(us[2][0]-us[0][0])*44,v2=(us[2][1]-us[0][1])*44,det=u1*v2-u2*v1;if(!Number.isFinite(det)||Math.abs(det)<1e-10)throw Error('degenerate patch UV');if(det>=0)throw Error('flipped patch UV');
  const J=[(len*v2-xx*v1)/det,(-len*u2+xx*u1)/det,-yy*v1/det,yy*u1/det].map(x=>x*1000),aa=J[0]**2+J[1]**2,bb=J[2]**2+J[3]**2,ab=J[0]*J[2]+J[1]*J[3],disc=Math.sqrt((aa-bb)**2+4*ab**2),hi=Math.sqrt((aa+bb+disc)/2),lo=Math.sqrt((aa+bb-disc)/2),ratio=hi/lo;
  if(!Number.isFinite(ratio)||ratio>1.5)throw Error('patch anisotropy '+ratio);triangles++;minMM=Math.min(minMM,lo);maxMM=Math.max(maxMM,hi);maxAnisotropy=Math.max(maxAnisotropy,ratio);minArea=Math.min(minArea,hi*lo);maxArea=Math.max(maxArea,hi*lo);
 }
 if(!triangles)throw Error('empty patch');g.setAttribute('studyHairUV',new T.BufferAttribute(uv,2));return{scope:'ONE_CONTINUOUS_GENERATED_ART_COLOR_PATCH_NOT_HISTORICAL',sourceROI:SOURCE_ROI,sourcePixels:[45,45],fadeFraction:.15,sourcePixelSpan:44,triangles,minMMPerPixel:minMM,maxMMPerPixel:maxMM,maxAnisotropy,minMM2PerPixel:minArea,maxMM2PerPixel:maxArea,geometryMoved:false,originalUVChanged:false};
}
export function installPatch(material,source,{enabled=true}={}){
 if(typeof enabled!=='boolean')throw Error('fixed patch enable');const texture=createPatchSampler(source),old=material.onBeforeCompile,key=material.customProgramCacheKey();
 material.onBeforeCompile=s=>{old.call(material,s);for(const token of['#include <common>','#include <map_fragment>'])if(!s.fragmentShader.includes(token))throw Error('patch shader template');s.uniforms.patchAtlas={value:texture};s.uniforms.patchEnabled={value:enabled?1:0};s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 studyHairUV;varying vec2 vHairPatchUV;').replace('#include <begin_vertex>','#include <begin_vertex>\nvHairPatchUV=studyHairUV;');s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
 varying vec2 vHairPatchUV;uniform sampler2D patchAtlas;uniform float patchEnabled;
 `);const marker='diffuseColor.rgb=mix(diffuseColor.rgb,scalpBrown,contourMask(vScalpPosition));';if(!s.fragmentShader.includes(marker))throw Error('patch requires contour gold');s.fragmentShader=s.fragmentShader.replace(marker,marker+`
 vec2 q=vHairPatchUV;float w=smoothstep(0.0,.15,q.x)*(1.0-smoothstep(.85,1.0,q.x))*smoothstep(0.0,.15,q.y)*(1.0-smoothstep(.85,1.0,q.y));
 w*=patchEnabled*contourMask(vScalpPosition);if(distance(vScalpPosition,vec3(${center.join(',')}))>.10||vScalpPosition.z>=.015||vScalpPosition.y<2.04)w=0.0;
 vec2 pixel=vec2(437.5,46.5)+clamp(q,0.0,1.0)*44.0;vec3 color=texture2D(patchAtlas,vec2(pixel.x/1024.0,1.0-pixel.y/1536.0)).rgb;diffuseColor.rgb=mix(diffuseColor.rgb,color,w);
 `);};material.customProgramCacheKey=()=>key+'|single-continuous-atlas-patch-v1';material.needsUpdate=true;return{texture,dispose(){texture.dispose();}};
}
