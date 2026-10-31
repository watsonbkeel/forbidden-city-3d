// WITHDRAWN HYPOTHESIS: explicit in-memory injection only, never an app hook.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {performance} from 'node:perf_hooks';
import * as T from 'three';
import {PALACE_LAYOUT} from '../../../../src/scene/Layout.js';
import {PalaceBuilder} from '../../../../src/scene/PalaceBuilder.js';
import {CollisionManager} from '../../../../src/utils/Collision.js';
import {realTextureLibrary} from '../../../../tests/lib/r48-real-texture-library.mjs';
import '../../../../tests/lib/inner-palace-fixture.mjs';
import {assertTaihemenSouthCeilingInWorld} from '../../../../tests/lib/r157-taihemen-ceiling-world-check.mjs';
const out=process.argv[2]??'/tmp/r157-taihemen-hypothesis-evidence';fs.mkdirSync(out,{recursive:true});
const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const absolute=(s,u)=>s.replace(/from '([^']+)'/g,(_,p)=>`from '${p==='three'?import.meta.resolve('three'):new URL(p,u).href}'`),dataURL=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const encURL=new URL('../../../../src/scene/palace/special/TaihemenEnclosure.js',import.meta.url),builderURL=new URL('../../../../src/scene/PalaceBuilder.js',import.meta.url),enc=fs.readFileSync(encURL,'utf8');
const hook='  buildTaihemenSouthCeiling(builder, group, {x0,z0,y,w,d,H,beamH,r});';if(enc.includes(hook))throw Error('Withdrawn geometry must not be hooked to production');
const knee='  buildTaihemenSouthKnees(builder, group, {x0,z0,y,w,d,H,beamH,r});';
const hURL=new URL('./hypothesis/TaihemenSouthCeiling.js',import.meta.url);
const hEnc=dataURL(absolute(`import {buildTaihemenSouthCeiling} from '${hURL.href}';\n`+enc.replace(knee,knee+'\n'+hook),encURL));
const Candidate=(await import(dataURL(absolute(fs.readFileSync(builderURL,'utf8'),builderURL).replace(new URL('./palace/special/TaihemenEnclosure.js',builderURL).href,hEnc)))).PalaceBuilder;
const files=['src/scene/Layout.js','src/scene/palace/special/TaihemenEnclosure.js','scripts/photo-fidelity/batches/r157-taihemen/hypothesis/TaihemenSouthCeiling.js','src/scene/PalaceBuilder.js','src/utils/MergeUtils.js'];
const report={kind:'WITHDRAWN_HYPOTHESIS_MERGE_NOT_PRODUCTION_OR_BROWSER',base:'c9b25a71',captureHEAD:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceHashes:Object.fromEntries(files.map(p=>[p,hash(fs.readFileSync(p,'utf8'))])),baselineMethod:'Before is actual current production. After explicitly injects the WITHDRAWN unsupported ceiling hypothesis in memory; neither state changes source files.',gpuAcceptance:false,sourceCameraMatched:false,states:{}};
const palette={roof_tile:'#ba913e',kit_ridge:'#bc9c53',wood_column:'#8b3b28',wall_red:'#a34b37',wall_brick:'#71695b',stone_slab:'#90897e',marble:'#d1c9b8',rafters:'#514631',caihua_beam:'#3e665a',dougong_band:'#4f6651',lattice_doors:'#4c3528',sumeru_band:'#c4bcad',balustrade:'#d2cabb',yulu:'#bcb3a3','taihemen-south-knee-teal':'#316363'};
function stats(root){let triangles=0,bytes=0,meshes=0;const gs=new Set(),ms=new Set();root.traverse(m=>{if(!m.isMesh)return;meshes++;triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;gs.add(m.geometry);ms.add(m.material);});for(const g of gs){for(const a of Object.values(g.attributes))bytes+=a.array.byteLength;if(g.index)bytes+=g.index.array.byteLength;}return{meshes,triangles,geometryBytes:bytes,materials:ms.size};}
function rows(root,omit=false){root.updateMatrixWorld(true);const rows=[];root.traverse(m=>{if(!m.isMesh||(omit&&m.material.name.startsWith('taihemen-south-ceiling-')))return;const a=m.geometry.attributes.position,ix=m.geometry.index,n=m.material.name.replace(/_material$/,'');for(let i=0;i<(ix?.count??a.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k);rows.push({v:ids.map(j=>new T.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).toArray()),material:n,color:m.material.name.startsWith('taihemen-south-ceiling-')?'#'+m.material.color.getHexString():palette[n]??'#8b683f',side:m.material.side});}});return rows;}
for(const [state,Base] of [['before',PalaceBuilder],['after',Candidate]]){
 let final;const samples=[];
 for(let run=0;run<6;run++){
  global.gc?.();const lib=realTextureLibrary(),scene=new T.Scene(),builder=new Base(scene,lib),start=performance.now();builder.buildGate(structuredClone(PALACE_LAYOUT.find(x=>x.name==='太和门')));const end=performance.now(),root=scene.getObjectByName('太和门');if(run)samples.push(end-start);
  if(run===5){const cm=new CollisionManager();cm.addColliders(builder.colliders);cm.addWalkables(builder.walkables);const triangles=rows(root);final={...stats(root),buildMergeSamplesMs:samples,buildMergeMedianMs:[...samples].sort((a,b)=>a-b)[2],geometryHash:hash(triangles),retainedTrianglesHash:hash(rows(root,true)),collidersHash:hash(builder.colliders),walkablesHash:hash(builder.walkables)};
   if(state==='after')final.existingWorld=assertTaihemenSouthCeilingInWorld({scene,cm});
   for(const view of [{id:'porch-looking-south',eye:[0,5.14,-217.1],target:[0,8.8,-230],fov:85},{id:'south-front',eye:[0,5.14,-270],target:[0,10,-224.47],fov:47}]){
    const camera=new T.PerspectiveCamera(view.fov,16/9,.03,200);camera.position.fromArray(view.eye);camera.lookAt(...view.target);camera.updateMatrixWorld(true);
    fs.writeFileSync(path.join(out,`${view.id}-${state}.json.gz`),gzipSync(JSON.stringify({state,view:view.id,kind:report.kind,warning:'Flat-palette CPU triangle diagnostic only: no production texture, WebGL lighting/shadow, source-camera matching or visual acceptance.',camera:{...view,aspect:16/9,width:1280,height:720,matrixWorldInverse:camera.matrixWorldInverse.toArray(),projectionMatrix:camera.projectionMatrix.toArray()},triangles})));
   }
  }builder.dispose();lib.dispose();
 }report.states[state]=final;
}
const a=report.states.after,b=report.states.before;report.delta=Object.fromEntries(['meshes','triangles','geometryBytes','materials'].map(k=>[k,a[k]-b[k]]));report.retained=Object.fromEntries(['retainedTrianglesHash','collidersHash','walkablesHash'].map(k=>[k,a[k]===b[k]]));
report.costBoundary='Node component construction+merge only; not browser/GPU draw calls, frame rate, device memory or whole-scene speed';
fs.writeFileSync(path.join(out,'geometry-summary.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
