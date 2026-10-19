import * as THREE from 'three';
import source from '../../../../data/architecture/taihe-dais-front.json' with {type:'json'};
import { TAIHE_CORE as P } from './TaiheCoreProfile.js';
import { TAIHE_DAIS_FALLBACK_DATA } from './TaiheDaisFallbackData.js';
export const TAIHE_DAIS_FRONT=source;
const floats=s=>{const b=Uint8Array.from(atob(s),c=>c.charCodeAt(0)),v=new DataView(b.buffer),a=new Float32Array(b.length/4);for(let i=0;i<a.length;i++)a[i]=v.getFloat32(i*4,true);return a;};
export function appendTaiheDaisFront(group,materials) {
  for(const batch of TAIHE_DAIS_FALLBACK_DATA) {
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(floats(batch.position),3));geo.setAttribute('normal',new THREE.BufferAttribute(floats(batch.normal),3));
    const mesh=new THREE.Mesh(geo,materials[batch.material]);mesh.name=`taihe-three-front-flights-${batch.material}`;group.add(mesh);
  }
}
export function buildTaiheDaisFrontNavigation(builder,{x0,z0,y}) {
  const d=P.dais,r=source, toe=z0+d.z0-d.steps*d.stepRun;
  for(const f of r.frontFlights)for(let k=0;k<d.steps;k++){
    const za=toe+k*d.stepRun;
    builder.walkables.push({type:'box',rescue:false,box:new THREE.Box3(new THREE.Vector3(x0+f.x-f.width/2,y,za),new THREE.Vector3(x0+f.x+f.width/2,y+d.height*(k+1)/d.steps,za+d.stepRun))});
  }
  // Same independent cover as the visible thin sheet: support follows its
  // first/last stair nosings. This is a gameplay surface, not admission advice.
  builder.walkables.push({type:'ramp',axis:'z',minX:x0-r.cover.width/2,maxX:x0+r.cover.width/2,minZ:toe,maxZ:z0+d.z0-d.stepRun,a0:toe,a1:z0+d.z0-d.stepRun,y0:y+d.height/d.steps+r.cover.offset,y1:y+d.height+r.cover.offset});
  // Seven tight, height-following intervals per rail, never a full-height wall.
  for(const x of r.railX)for(let k=0;k<d.steps;k++){
    const za=toe+k*d.stepRun;
    builder.col(x0+x-r.railWidth/2,y+d.height*k/d.steps,za,x0+x+r.railWidth/2,y+d.height*(k+1)/d.steps+r.railHeight,za+d.stepRun);
  }
  const t=r.incenseTables;
  for(const x of t.x)builder.col(x0+x-t.width*.53,y,z0+t.z-t.depth*.53,x0+x+t.width*.53,y+t.totalHeight,z0+t.z+t.depth*.53);
}
