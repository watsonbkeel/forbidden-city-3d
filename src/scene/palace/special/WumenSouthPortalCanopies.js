import * as THREE from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';

// FC-AD4377DF51 / R58-A N3. The photo resolves three small yellow-tiled
// protective eaves, not bracket details or a surveyed roof/attachment section.
export const WUMEN_SOUTH_CANOPY_FIT=Object.freeze({
  sideOverhang:.7,projection:1.1,wallOverlap:.04,frontBottomAboveHead:.1,
  thickness:.18,rise:.2,
  source:'https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0aaffe2cc85.jpg',
  evidence:'three-south-canopies-photo-fit; section-and-dimensions-not-measured',
});
export function wumenSouthCanopyProfiles({openings,southZ,platformHeight}){
  if(southZ!==-13.3||platformHeight!==12||!Array.isArray(openings)||openings.length!==3
    ||openings.some((o,i)=>o.x!==[-17.5,0,17.5][i]||o.w!==[5,9,5][i])){
    throw new Error('Wumen south canopies require the retained three south mouths');
  }
  const f=WUMEN_SOUTH_CANOPY_FIT;
  return Object.freeze(openings.map(o=>Object.freeze({centerX:o.x,portalWidth:o.w,width:o.w+2*f.sideOverhang,
    headY:o.w>=8?8:6.5,frontZ:southZ-f.projection,backZ:southZ+f.wallOverlap,
    depth:f.projection+f.wallOverlap,wallJunction:'conservative-overlap; hidden-connection-unknown'})));
}

/** Adds one final group containing three plain closed tile wedges. Do not use
 * generic hall roofs, invent brackets, move existing doors or register overhead
 * AABBs. Existing ownership/disposal applies to these ordinary scene meshes.
 */
export function buildWumenSouthPortalCanopies(builder,parent,options){
  const profiles=wumenSouthCanopyProfiles(options),f=WUMEN_SOUTH_CANOPY_FIT;
  const group=new THREE.Group();group.name='wumen-south-three-canopies';
  group.userData.structure={id:'axis/wumen-south-three-canopies',objectId:'FC-AD4377DF51',facet:'south-protective-canopies',
    count:3,evidence:f.evidence,source:f.source,acceptance:'VERIFY_PENDING',unknowns:['pitch-depth-width-unmeasured','bracket-and-back-connection-unresolved']};
  for(const p of profiles){
    const canopy=new THREE.Group();canopy.name=`wumen-south-canopy-${p.centerX}`;canopy.userData.portalCenter=p.centerX;
    const geo=new THREE.BoxGeometry(p.width,f.thickness,p.depth),a=geo.attributes.position;
    for(let i=0;i<a.count;i++){
      const t=(a.getZ(i)+p.depth/2)/p.depth;
      a.setY(i,p.headY+f.frontBottomAboveHead+f.rise*t+a.getY(i)+f.thickness/2);
    }
    geo.computeVertexNormals();
    const mesh=new THREE.Mesh(applyBoxUV(geo,builder.library.tileSize('roof_tile')),builder.library.material('roof_tile'));
    mesh.name='wumen-south-canopy-plain-tiles';mesh.position.set(p.centerX,0,(p.frontZ+p.backZ)/2);
    mesh.castShadow=mesh.receiveShadow=true;canopy.add(mesh);group.add(canopy);
  }
  parent.add(group);return group;
}
