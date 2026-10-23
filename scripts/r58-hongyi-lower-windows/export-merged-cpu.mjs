// Bounded real production component before/after merge, never a second world.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture,snapshot,hash,meshRows,lowerWindow,physical,meshes,geometryHealth,triangles} from '../../tests/lib/r58-court-facade-fixture.mjs';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
const baselineHead='c85e770daa0d952bb9a5614b0d8fa920c44650b2',sourcePath='src/scene/palace/special/SurveyedPavilion.js';
const sourceURL=new URL('../../'+sourcePath,import.meta.url);
let source=execFileSync('git',['show',`${baselineHead}:${sourcePath}`],{encoding:'utf8'});
source=source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,sourceURL).href}${q}`);
const original=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const before=fixture('hongyi',{plaque:true},original.buildSurveyedPavilion),after=fixture('hongyi',{plaque:true});
for(const f of [before,after])f.kit.buildPlaqueAtlas();
const frozen=JSON.parse(fs.readFileSync(new URL('../../tests/fixtures/r58-hongyi-lower-baseline.json',import.meta.url)));
assert.deepEqual(snapshot(before),frozen.hongyiWithPlaque,'actual c85e770 builder must reproduce the frozen baseline');
assert.equal(hash(meshRows(after.frame,lowerWindow)),frozen.hongyiWithPlaque.retainedWithoutLowerWindows);
assert.deepEqual(physical(after.kit),physical(before.kit));
const out='reports/r58-hongyi-lower-windows';fs.mkdirSync(out,{recursive:true});
const g=after.g,cx=(g.lower.columnXs[6]+g.lower.columnXs[7])/2;
const views=[
 {name:'whole-front',eye:[0,1.7,-57],target:[0,11,0],fov:55},
 {name:'paired-leaves',eye:[cx,g.platform.y+1.7,g.lower.front-8],target:[cx,g.lower.floorY+2.5,g.lower.front],fov:36},
 {name:'paired-oblique',eye:[cx-2.5,g.platform.y+1.7,g.lower.front-7],target:[cx,g.lower.floorY+2.5,g.lower.front],fov:39},
];
const proof={objectId:'FC-A43B1DAB0B',status:'VERIFY_PENDING',scope:'ACTUAL PRODUCTION-MERGED COMPONENT CPU DIAGNOSTIC; NOT BROWSER, GPU, TEXTURE OR PRESENT-2026 ACCEPTANCE',baselineHead,
 baseline:snapshot(before),candidate:snapshot(after),health:{before:geometryHealth(before.frame),after:geometryHealth(after.frame)},physicalDelta:Object.fromEntries(Object.entries(physical(before.kit)).map(([key,v])=>[key,physical(after.kit)[key].length-v.length])),
 retainedHash:hash(meshRows(after.frame,lowerWindow)),cameras:{},sourceFiles:{},officialPhotoRedistribution:false};
for(const [state,f]of [['before',before],['after',after]]){
 const root=f.kit.finish();root.updateMatrixWorld(true);proof[state+'Merged']={triangles:triangles(root),draws:meshes(root).length,geometryHash:hash(meshRows(root)),health:geometryHealth(root)};
 for(const view of views){
  const world=p=>new THREE.Vector3(...p).applyMatrix4(f.frame.matrixWorld),camera=new THREE.PerspectiveCamera(view.fov,960/540,.03,200);camera.position.copy(world(view.eye));camera.lookAt(world(view.target));camera.updateMatrixWorld(true);
  const cameraData={position:camera.position.toArray(),target:world(view.target).toArray(),fov:camera.fov,matrixWorldInverse:camera.matrixWorldInverse.toArray(),localEye:view.eye,localTarget:view.target};
  if(proof.cameras[view.name])assert.deepEqual(cameraData,proof.cameras[view.name]);else proof.cameras[view.name]=cameraData;
  const rows=[];
  for(const o of meshes(root)){
   const geo=o.geometry,p=geo.attributes.position,n=geo.attributes.normal,idx=geo.index,nm=new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
   for(let i=0;i<(idx?.count??p.count);i+=3){
    const material=solidMaterialNameAt(o,i/3).replace(/_material$/,''),color=new THREE.Color(({wood_column:0x8c2d22,caihua_beam:0x357e80,dougong_band:0x335d62,wall_red:0x89382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,kit_lacquer:0x75251f,kit_plaques:0x172c63})[material]??0x93866d).toArray();
    const v=[],normal=[];for(let j=0;j<3;j++){const k=idx?idx.getX(i+j):i+j;v.push(new THREE.Vector3().fromBufferAttribute(p,k).applyMatrix4(o.matrixWorld).toArray());normal.push(new THREE.Vector3().fromBufferAttribute(n,k).applyNormalMatrix(nm).toArray());}rows.push({v,n:normal,c:[color,color,color],side:o.material.side});
   }
  }
  const label=`hongyi-${view.name}-${state}`;fs.writeFileSync(`${out}/${label}.json.gz`,zlib.gzipSync(JSON.stringify({kind:proof.scope,label,camera:cameraData,triangles:rows})));
 }
 f.kit.dispose(root);
}
for(const path of [sourcePath,'src/scene/palace/special/HongyiLowerWindowLeaves.js','src/scene/palace/special/PavilionLowerWindowLeaves.js','tests/lib/r58-hongyi-window-world-check.mjs'])proof.sourceFiles[path]=createHash('sha256').update(fs.readFileSync(path)).digest('hex');
proof.triangleDelta=proof.afterMerged.triangles-proof.beforeMerged.triangles;
fs.writeFileSync(`${out}/proof.json`,JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof,null,2));
