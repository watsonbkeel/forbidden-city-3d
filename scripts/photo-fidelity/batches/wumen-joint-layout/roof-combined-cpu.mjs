import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import crypto from 'node:crypto';import {pathToFileURL} from 'node:url';import * as T from 'three';
import {buildRoofDiagnostic,roofDiagnosticTriangles,diagnoseRoofBoundaries} from './roof-combined.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
export function exportRoofDiagnostic(out){
 if(fs.existsSync(out))throw Error('Output already exists');
 const proof={accepted:false,runtimeInstalled:false,supportVerified:false,scope:'UNINSTALLED_PARTIAL_ROOF_SURFACES_AND_TRIM_CPU_DIAGNOSTIC',coordinateSpace:'BOTH_MODES_SAME_UNINSTALLED_REFERENCE_XZ_NOT_OLD_BUILDING_PLACEMENT',views:{},modes:{},sourceHashes:{},limitations:['Predecessor is offline old-parameter reconstruction, NOT original RoofBuilder mesh bytes.','Roof surfaces and trim only; no main tower, walls, beams, fans, columns, platforms or physics.','Diagnostic palette, no historical texture/alpha, GPU, shadows or building/support acceptance.','Coplanar/tangent triangle-contact ambiguity and declared open trim/surface boundaries remain unresolved.']};
 for(const p of ['roof-combined-cpu.mjs','roof-combined.mjs','roof-section-evaluator.mjs','roof-section-surfaces.mjs','roof-section-trims.mjs','upper-contract.mjs','upper-contract.json','profile.mjs','source-registration.json','platform-cpu.mjs','render-roof-combined-cpu.py']){const name=`scripts/photo-fidelity/batches/wumen-joint-layout/${p}`;proof.sourceHashes[name]=hash(fs.readFileSync(name));}
 fs.mkdirSync(out,{recursive:true});
 for(const mode of ['predecessor','proposal']){const c=buildRoofDiagnostic(mode);try{
  const triangles=roofDiagnosticTriangles(c);if(triangles.length!==10288)throw Error('Complete actual draw denominator mismatch');
  const diagnosis=diagnoseRoofBoundaries(c),file=`boundaries-${mode}.json`;fs.writeFileSync(path.join(out,file),JSON.stringify(diagnosis,null,2)+'\n');proof.modes[mode]={triangles:triangles.length,meshes:c.layers.reduce((n,x)=>n+x.surface.group.children.length+x.trim.group.children.length,0),boundaryFile:file,boundarySHA:hash(fs.readFileSync(path.join(out,file)))};
  for(const[name,eye,target,fov]of [['overview',[145,147,125],[0,22,-40],48],['ne-pavilion',[-78,47,30],[-50.919,23,.447],44],['east-wing',[-93,57,-31],[-50.5,23,-41],54]]){
   const camera=new T.PerspectiveCamera(fov,1.5,.1,600);camera.position.fromArray(eye);camera.lookAt(new T.Vector3().fromArray(target));camera.updateMatrixWorld(true);
   const cam={position:eye,target,fov,aspect:1.5,matrixWorldInverse:camera.matrixWorldInverse.toArray()},label=`wumen-roof-${name}-${mode}`,file=label+'.json.gz';
   fs.writeFileSync(path.join(out,file),zlib.gzipSync(JSON.stringify({label,kind:proof.scope,diagnosticSize:[1200,800],camera:cam,triangles,sourceCharacterInstances:0})));
   proof.views[`${name}-${mode}`]={mode,camera:cam,file,triangles:triangles.length,sha256:hash(fs.readFileSync(path.join(out,file)))};
  }
 }finally{c.dispose();}}
 fs.writeFileSync(path.join(out,'PROOF.json'),JSON.stringify(proof,null,2)+'\n');return proof;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){if(!process.argv[2])throw Error('New output directory required');exportRoofDiagnostic(process.argv[2]);}
