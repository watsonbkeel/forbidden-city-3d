import * as THREE from 'three';

// Official front photographs place these three nameboards between roof tiers.
// Existing board size/art is deliberately retained: neither is surveyed here.
export const DOUBLE_EAVE_NAMEBOARDS = Object.freeze(['太和殿','保和殿','乾清宫','太和门','坤宁宫','皇极殿','慈宁宫','奉先殿']);
export const HALL_NAMEBOARD_MOUNT = Object.freeze({
  wallGap: .12, surfaceMargin: .03,
  status: 'OFFICIAL_PHOTO_TOPOLOGY_MODEL_FIT_NOT_SURVEY',
});

export function positionHallNameboard(plaque, roof, name, {fitSizeToBand=false}={}) {
  if (!DOUBLE_EAVE_NAMEBOARDS.includes(name)) return false;
  const band=roof.userData.doubleEaveMountingBand;
  const {width,height,depth}=plaque.geometry.parameters;
  if (!band || ![width,height,depth,band.lowerY,band.upperY,band.halfDepth].every(Number.isFinite)
      || Math.min(width,height,depth)<=0 || band.upperY<=band.lowerY) {
    throw Error('Verified double-eave nameboard requires finite generated roof bounds');
  }
  roof.updateWorldMatrix(true,true);
  const z=-band.halfDepth-HALL_NAMEBOARD_MOUNT.wallGap-depth/2;
  const mid=(band.lowerY+band.upperY)/2;
  const lower=[],upper=[];
  // Inspect actual lower tiles and upper soffit/rafter surfaces at both faces
  // and three horizontal stations. Do not resize or move the roof to fit.
  for (const x of [-width/2,0,width/2]) for (const zz of [z-depth/2,z+depth/2]) {
    const origin=roof.localToWorld(new THREE.Vector3(x,mid,zz));
    const hits=[-1,1].map(d=>new THREE.Raycaster(origin,new THREE.Vector3(0,d,0),0,20).intersectObject(roof,true)[0]);
    // The real TextureLibrary appends _material; lightweight CPU fixtures do
    // not. Accept only these explicit equivalent semantic material names.
    if (!hits[0] || !hits[1] || !['roof_tile','roof_tile_material'].includes(hits[0].object.material.name)
        || !['rafters','rafters_material','roof_soffit','roof_soffit_material'].includes(hits[1].object.material.name)) {
      throw Error('Nameboard roof-surface clearance could not be established');
    }
    lower.push(roof.worldToLocal(hits[0].point.clone()).y);
    upper.push(roof.worldToLocal(hits[1].point.clone()).y);
  }
  const lowerY=Math.max(band.lowerY,...lower),upperY=Math.min(band.upperY,...upper);
  const available=upperY-lowerY-2*HALL_NAMEBOARD_MOUNT.surfaceMargin;
  const sizeScale=fitSizeToBand?Math.min(1,available/height):1;
  if (sizeScale<.7 || available<height*sizeScale-1e-8) {
    throw Error('Retained nameboard does not fit roof band; do not silently shrink it');
  }
  if(sizeScale!==1)plaque.scale.set(sizeScale,sizeScale,1);
  const local=new THREE.Vector3(0,(lowerY+upperY)/2,z);
  const world=roof.localToWorld(local.clone());
  plaque.position.copy(plaque.parent?plaque.parent.worldToLocal(world):world);
  plaque.rotation.y=Math.PI;
  plaque.userData.hallNameboardMount={name,...HALL_NAMEBOARD_MOUNT,
    lowerY,upperY,localPosition:local.toArray(),surfaceProbes:12,
    retainedDimensions:{width,height,depth},
    fittedDimensions:{width:width*sizeScale,height:height*sizeScale,depth},
    sizeScale,sizeFitStatus:sizeScale===1?'ORIGINAL_SIZE_RETAINED':'EXPLICIT_SOURCE_GUIDED_MODEL_FIT_NOT_SURVEY',
    appearanceStatus:name==='乾清宫'?'SIMPLIFIED_HAN_ONLY_MANCHU_AND_CARVED_FRAME_UNRESOLVED':'SIMPLIFIED_SYSTEM_FONT_AND_RECTANGULAR_FRAME',
  };
  return true;
}
