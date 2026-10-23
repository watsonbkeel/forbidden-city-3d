// Bounded actual component geometry only. Never constructs the world or a browser.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import zlib from 'node:zlib';
import * as THREE from 'three';
import {fixture,snapshot,hash,meshes,geometryHealth,triangles} from '../../tests/lib/r58-court-facade-fixture.mjs';
const baselineHead='26f67a6655df110d2b530a10d55ce10e27157b82',profile=process.argv[2];
if(!['xihe','tiren'].includes(profile))throw Error('Pass xihe or tiren');
const stem=profile==='xihe'?'SideGate':'SurveyedPavilion',sourcePath=`src/scene/palace/special/${stem}.js`,sourceURL=new URL('../../'+sourcePath,import.meta.url);
let source=execFileSync('git',['show',`${baselineHead}:${sourcePath}`],{encoding:'utf8'});
source=source.replace(/from\s+(['"])([^'"]+)\1/g,(_,quote,id)=>`from ${quote}${id==='three'?import.meta.resolve('three'):new URL(id,sourceURL).href}${quote}`);
const original=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const before=fixture(profile,{},original[`build${stem}`]),after=fixture(profile),baseline=JSON.parse(fs.readFileSync(new URL('../../tests/fixtures/r58-court-facade-baseline.json',import.meta.url))).profiles[profile];
if(snapshot(before).all!==baseline.all||snapshot(before).physics!==baseline.physics)throw Error('True baseline construction does not match frozen geometry/registration hashes');
const out=`reports/r58-court-facade-details/${profile}`;fs.mkdirSync(out,{recursive:true});
const g=after.g;
const views=profile==='xihe'?[
 {name:'courtyard-wide',eye:[0,1.7,38],target:[0,7,0],fov:53},
 {name:'curved-pair',eye:[-2.9,after.cm.getGroundHeight(...g.toWorld(-2.9,9),g.platformY)+1.7,9],target:[-2.9,7.5,4.94],fov:56},
]:[
 {name:'lower-front',eye:[-6,1.7,-57],target:[0,11,0],fov:55},
 {name:'paired-leaves',eye:[-10.4,g.platform.y+1.7,g.lower.front-8],target:[-10.4,g.lower.floorY+2.4,g.lower.front],fov:44},
];
function capture(f,view,state){
 const world=p=>new THREE.Vector3(...p).applyMatrix4(f.frame.matrixWorld),camera=new THREE.PerspectiveCamera(view.fov,960/540,.03,200);camera.position.copy(world(view.eye));camera.lookAt(world(view.target));camera.updateMatrixWorld(true);f.frame.updateMatrixWorld(true);
 const rows=[];for(const o of meshes(f.frame)){const geo=o.geometry,p=geo.attributes.position,n=geo.attributes.normal,idx=geo.index,nm=new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
  // Flat diagnostic palette only, not replacement textures or claims about paint fidelity.
  const color=new THREE.Color(({wood_column:0x8c2d22,caihua_beam:0x357e80,dougong_band:0x335d62,wall_red:0x89382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,kit_lacquer:0x75251f})[o.material.name.replace(/_material$/, '')]??0x93866d).toArray();
  for(let i=0;i<(idx?.count??p.count);i+=3){const v=[],normal=[];for(let j=0;j<3;j++){const k=idx?idx.getX(i+j):i+j;v.push(new THREE.Vector3().fromBufferAttribute(p,k).applyMatrix4(o.matrixWorld).toArray());normal.push(new THREE.Vector3().fromBufferAttribute(n,k).applyNormalMatrix(nm).toArray());}rows.push({v,n:normal,c:[color,color,color],side:o.material.side});}
 }
 const label=`${profile}-${view.name}-${state}`,cameraData={position:camera.position.toArray(),target:world(view.target).toArray(),fov:camera.fov,matrixWorldInverse:camera.matrixWorldInverse.toArray(),localEye:view.eye,localTarget:view.target};
 const data={kind:'BOUNDED ACTUAL GEOMETRY CPU DIAGNOSTIC; NOT GAME OR WEBGL ACCEPTANCE',label,camera:cameraData,triangles:rows};fs.writeFileSync(`${out}/${label}.json.gz`,zlib.gzipSync(JSON.stringify(data)));return cameraData;
}
const proof={scope:'ACTUAL BOUNDED GEOMETRY CPU DIAGNOSTIC. No browser, texture, GPU, final acceptance or 2026 current-condition claim.',profile,baselineHead,baseline:snapshot(before),candidate:snapshot(after),health:{before:geometryHealth(before.frame),after:geometryHealth(after.frame)},triangleDelta:triangles(after.frame)-triangles(before.frame),cameras:{},sourceFiles:{},officialPhotoRedistribution:false};
for(const view of views){proof.cameras[view.name]=capture(before,view,'before');capture(after,view,'after');}
for(const path of [sourcePath,`src/scene/palace/special/${profile==='xihe'?'SideGateExteriorDetails':'PavilionLowerWindowLeaves'}.js`])proof.sourceFiles[path]=createHash('sha256').update(fs.readFileSync(path)).digest('hex');
for(const [key,f]of [['before',before],['after',after]]){const root=f.kit.finish();proof[key+'Merged']={triangles:triangles(root),draws:meshes(root).length};f.kit.dispose(root);}
fs.writeFileSync(`${out}/proof.json`,JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof,null,2));
