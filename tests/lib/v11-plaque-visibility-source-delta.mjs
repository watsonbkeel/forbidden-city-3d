import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

// One finite plaque-only mounting correction against immutable rejected V11 bytes.
// No roof geometry, camera, other plaque or rendering branch is normalized away.
export const PLAQUE_VISIBILITY_DELTA = {
  "path": "src/scene/palace/special/GatePlaques.js",
  "historicalCommit": "bb5efdb7e7b9191ea3da878ad0b99e99881df39e",
  "historicalSHA256": "e162d69a0a4401dd40d5b83e525dfc3b3d5d69643081347b0e15686a65bcd436",
  "before": "  const depth=.12, offset=.08, margin=.1;\n  const soffit=band.upperSoffit, t=(band.halfDepth+offset+depth)/soffit.halfDepth, q=1-t;\n  // Evaluate the actual upper roof underside at the plaque's outward front.\n  const upperY=Math.min(band.upperY,soffit.eaveY+soffit.height*(soffit.coefficient*q+(1-soffit.coefficient)*q*q)-soffit.thickness);\n  const height=Math.min(3.2,upperY-band.lowerY-2*margin);\n  if(height<=0) throw new Error('No clear inter-eave band for the Wumen plaque');\n  const mesh=createGatePlaque(builder,{id:'wumen-south-gate-name-plaque',text:'午門',width:height*.9,height,depth,layout:'vertical',style:'gate-name',side:'south'});\n  mesh.position.set(0,(band.lowerY+upperY)/2,-band.halfDepth-offset);\n  mesh.userData.gatePlaque.source=SOURCE.wumen;\n  mesh.userData.gatePlaque.mount={kind:'generated-double-eave-band',lowerY:band.lowerY,upperY,margin,\n    surfaceGap:offset,dimensionBasis:'FITTED_TO_RETAINED_ROOF_NOT_SURVEY'};",
  "after": "  const depth=.12, offset=.08, margin=.1, maxHeight=3.2;\n  const soffit=band.upperSoffit;\n  // RoofBuilder's existing t=1 rafter face extends down by 1.5 * th.\n  // Fitting only to the soffit above the wall hid the upper glyph behind it.\n  const upperY=soffit.eaveY-soffit.thickness*1.5;\n  roof.updateMatrixWorld(true);\n  // Find the retained lower ridge's south face, not an arbitrary viewing ray.\n  // The plaque stays just outside that face so its lower portion is not masked.\n  const ridgeRay=new THREE.Raycaster(new THREE.Vector3(0,band.lowerY-.01,-soffit.halfDepth-offset),new THREE.Vector3(0,0,1),0,soffit.halfDepth);\n  const ridgeHit=ridgeRay.intersectObject(roof,true)[0];\n  if(ridgeHit?.object.material.name!=='roof_ridge_glaze') throw new Error('Wumen lower ridge surface is unavailable');\n  const backZ=Math.min(-band.halfDepth,ridgeHit.point.z)-offset;\n  // Six bounded cross-section probes cover the whole maximum plaque footprint.\n  // Downward rays alone at the old wall plane would miss the vertical ridge.\n  const lowerSamples=[];\n  for(const x of [-maxHeight*.45,0,maxHeight*.45]) for(const z of [backZ,backZ-depth]) {\n    const hit=new THREE.Raycaster(new THREE.Vector3(x,upperY-.01,z),new THREE.Vector3(0,-1,0)).intersectObject(roof,true)[0];\n    if(hit?.object.material!==builder.library.material('roof_tile')) throw new Error('Wumen lower roof surface is unavailable');\n    lowerSamples.push(hit.point.y);\n  }\n  const lowerY=Math.max(...lowerSamples), height=Math.min(maxHeight,upperY-lowerY-2*margin);\n  if(height<=0) throw new Error('No clear inter-eave band for the Wumen plaque');\n  const mesh=createGatePlaque(builder,{id:'wumen-south-gate-name-plaque',text:'午門',width:height*.9,height,depth,layout:'vertical',style:'gate-name',side:'south'});\n  mesh.position.set(0,(lowerY+upperY)/2,backZ);\n  mesh.userData.gatePlaque.source=SOURCE.wumen;\n  mesh.userData.gatePlaque.mount={kind:'generated-visible-double-eave-band',lowerY,upperY,margin,\n    upperFasciaBottomY:upperY,lowerRidgeFrontZ:ridgeHit.point.z,lowerRidgeTopY:band.lowerY,\n    surfaceGap:offset,wallStandOff:-backZ-band.halfDepth,surfaceProbeCount:7,\n    dimensionBasis:'FITTED_TO_RETAINED_FASCIA_AND_LOWER_ROOF_NOT_SURVEY'};"
};

export function restoreRejectedPlaqueSource(current){
 const {before,after,historicalSHA256}=PLAQUE_VISIBILITY_DELTA;
 const source=current.toString();
 assert.equal(source.split(after).length-1,1,'Exactly one finite Wumen mount replacement required');
 const restored=Buffer.from(source.replace(after,before));
 assert.equal(createHash('sha256').update(restored).digest('hex'),historicalSHA256,'Unrelated plaque source changed');
 return restored;
}
