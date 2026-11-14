import * as T from 'three';
// Diagnostic-only sample: NOT used by the Buddha factory or replicated on a cap.
// Same original source pixels; feathering is an engineering colour treatment,
// not a clean historic hair extraction or a recovered normal/PBR material.
export const CURL_SAMPLE_ROIS=[[439,77,460,98],[476,77,498,98],[542,77,564,98]];
export function createSingleCurlSample(texture,variant){
 if(!Number.isInteger(variant)||variant<0||variant>2)throw Error('sample variant');
 const geometry=new T.SphereGeometry(1,48,32),p=geometry.attributes.position,uv=geometry.attributes.uv,w=new Float32Array(p.count),roi=CURL_SAMPLE_ROIS[variant];
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,y);uv.setXY(i,(roi[0]+.5+(x+1)*.5*(roi[2]-roi[0]-1))/1024,1-(roi[1]+.5+(1-y)*.5*(roi[3]-roi[1]-1))/1536);w[i]=z<=0?0:1-T.MathUtils.smoothstep(r,.50,.88);}
 geometry.clearGroups();geometry.setAttribute('curlBlend',new T.BufferAttribute(w,1));
 const material=new T.MeshStandardMaterial({map:texture,color:texture?0xffffff:0x6a4c2f,roughness:.88,metalness:.08}),brown=new T.Color(0x6a4c2f);
 material.onBeforeCompile=shader=>{for(const [source,markers]of[[shader.vertexShader,['#include <common>','#include <begin_vertex>']],[shader.fragmentShader,['#include <common>','#include <map_fragment>']]])if(markers.some(marker=>!source.includes(marker)))throw Error('single curl shader template mismatch');shader.uniforms.curlBrown={value:brown};shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float curlBlend; varying float vCurlBlend;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCurlBlend=curlBlend;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 curlBrown; varying float vCurlBlend;').replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=mix(curlBrown,diffuseColor.rgb,clamp(vCurlBlend,0.0,1.0));');};material.customProgramCacheKey=()=> 'single-curl-soft-radial-v1';return {geometry,material};
}
