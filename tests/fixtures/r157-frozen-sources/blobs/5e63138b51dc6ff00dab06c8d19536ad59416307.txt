import * as THREE from 'three';
import { applyBandUV } from '../../../utils/GeometryUV.js';
import { TAIHE_CORE as P } from './TaiheCoreProfile.js';

// The official interior photographs establish real beam side/underside faces.
// These cross-sections and registration are a bounded visual estimate, not a survey.
// Reuse the retained central column stations; do not extend the generic outer grid.
export const TAIHE_BEAM_TRIAL = Object.freeze({ width: .46, bottomY: 8.7, triangles: 60 });
function beamGeometry(w,h,d,tile) {
  const source=new THREE.BoxGeometry(w,h,d),indices=[];
  // Upper faces touch the opaque ceiling and cannot be seen from the hall.
  // Keep every underside, end and side face, including their outward normals.
  for(let i=0;i<source.index.count;i+=3) {
    if(source.attributes.normal.getY(source.index.getX(i))>.99)continue;
    for(let j=0;j<3;j++)indices.push(source.index.getX(i+j));
  }
  source.setIndex(indices);source.clearGroups();
  const geometry=applyBandUV(source,tile);source.dispose();return geometry;
}
export function buildTaiheBeamFrame(builder,parent,{x0,z0,y}) {
  const q=TAIHE_BEAM_TRIAL,h=P.ceilingY-q.bottomY,span=P.columns.x[1]-P.columns.x[0];
  const stations=[P.columns.redCompanionZ,...P.columns.goldZ],z0row=stations[0],z1row=stations.at(-1);
  const material=builder.library.material('caihua_beam'),tile=builder.library.tileSize('caihua_beam');
  const put=(w,d,x,z,direction)=>{
    const mesh=new THREE.Mesh(beamGeometry(w,h,d,tile),material);
    mesh.position.set(x0+x,y+q.bottomY+h/2,z0+z);mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.name='taihe-central-beam';mesh.userData.taihePermanent='central-beam';mesh.userData.taiheBeamDirection=direction;
    parent.add(mesh);
  };
  for(const z of stations)put(span+q.width,q.width,0,z,'transverse');
  for(const x of P.columns.x)put(q.width,z1row-z0row-q.width,x,(z0row+z1row)/2,'longitudinal');
}
