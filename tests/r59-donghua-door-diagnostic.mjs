// Actual production component + CourtKit.finish, real local project textures.
// CPU software perspective raster and ray evidence. NEVER browser acceptance.
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import * as THREE from 'three';
import {library,gate,sceneFor,probe,triangles,binding,hash,textureHash,goldRuns} from './lib/r59-donghua-door-fixture.mjs';
import {applyDonghuaCentralDoorFront} from '../src/scene/palace/special/DonghuaCentralDoorFront.js';
import {assertDonghuaCentralDoorFrontInWorld} from './lib/r59-donghua-world-check.mjs';
const out='reports/r59-donghua-door-rows',tmp='/tmp/r59-donghua-door-render';mkdirSync(out,{recursive:true});mkdirSync(tmp,{recursive:true});
const views=[
 {name:'central-north-leaf',eye:[-370.98,1.7,-257],target:[-370.98,2.25,-254.515],fov:108},
 {name:'central-south-leaf',eye:[-370.98,1.7,-257],target:[-370.98,2.25,-259.485],fov:108},
];
const records=[];
for(const quality of ['hd','sd'])for(const stage of ['before','after']){
 const lib=await library(quality),c=gate(lib),beforePhysics=hash([c.kit.colliders,c.kit.walkables,c.kit.rooms,c.kit.mapItems]);
 if(stage==='after')applyDonghuaCentralDoorFront(c.kit,c.frame,binding);
 const source=triangles(c.frame,{material:false}),beforeFinish=probe(sceneFor(c),{correct:stage==='after'}),W=sceneFor(c,{finish:true});W.library=lib;
 const maps=[],materials=[],rows=[];
 W.scene.traverse(m=>{if(!m.isMesh)return;const mat=m.material;let mi=materials.indexOf(mat);
  if(mi<0){mi=materials.length;materials.push(mat);if(mat.map){const file=`${tmp}/${quality}-${stage}-map-${mi}.png`;writeFileSync(file,mat.map.image.toBuffer('image/png'));mat.map.updateMatrix();maps[mi]={file,flipY:mat.map.flipY,matrix:mat.map.matrix.toArray(),wrapS:mat.map.wrapS,wrapT:mat.map.wrapT};}}
  const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,idx=g.index,normalMatrix=new THREE.Matrix3().getNormalMatrix(m.matrixWorld);
  for(let i=0;i<(idx?.count??p.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);rows.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new THREE.Vector3().fromBufferAttribute(n,j).applyMatrix3(normalMatrix).normalize().toArray()),uv:ids.map(j=>[uv.getX(j),uv.getY(j)]),mi,side:mat.side});}
 });
 const viewReports=[];
 // HD same-camera snippets. SD is separately verified with real pixels/rays.
 if(quality==='hd')for(const view of views){
  const camera=new THREE.PerspectiveCamera(view.fov,900/650,.03,50);camera.position.fromArray(view.eye);camera.lookAt(...view.target);camera.updateMatrixWorld(true);
  const data={scope:'ACTUAL_MERGED_CITY_GATE_REAL_LOCAL_PROJECT_TEXTURES_CPU_NOT_BROWSER',stage,view:view.name,triangles:rows,maps,materials:materials.map(m=>({name:m.name,color:m.color.toArray()})),camera:{position:view.eye,matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov:view.fov}};
  const file=`${tmp}/${stage}-${view.name}.json.gz`;writeFileSync(file,gzipSync(JSON.stringify(data)));
  execFileSync('python',['tests/lib/r58-zuoyi-visible-raster.py',file,`${out}/${stage}-${view.name}.png`],{stdio:'inherit'});
  viewReports.push({...view,legal:!W.cm.checkCollision(camera.position,.5),ground:W.cm.getGroundHeight(view.eye[0],view.eye[2],.45)});
 }
 const mat=stage==='after'?lib.materials.get('donghua_central_nine_row_front'):lib.material('door_studded');
 if(quality==='hd')writeFileSync(`${out}/${stage}-runtime-albedo.png`,mat.map.image.toBuffer('image/png'));
 records.push({quality,stage,triangles:rows.length,mergedMeshes:W.root.children.length,
  preMergeGeometrySha256:hash(source.map(JSON.stringify).sort()),mergedGeometrySha256:hash(triangles(W.scene,{material:false}).map(JSON.stringify).sort()),
  beforePhysicsSha256:beforePhysics,afterPhysicsSha256:hash([c.kit.colliders,c.kit.walkables,c.kit.rooms,c.kit.mapItems]),
  colorPixelsSha256:textureHash(mat.map),normalPixelsSha256:textureHash(mat.normalMap),rows:goldRuns(mat.map.image).length,columnLayout:goldRuns(mat.map.image,'x',stage==='after'?85/926:85/1024,[.04,.96]).length,
  beforeFinish,afterFinish:probe(W,{correct:stage==='after'}),worldConsumer:stage==='after'?assertDonghuaCentralDoorFrontInWorld(W):null,views:viewReports});
 c.kit.dispose(W.root);lib.dispose();
}
const report={scope:'BOUNDED_REAL_BUILDER_COMPONENT_AND_EXISTING_WORLD_CONSUMER_CPU_NOT_BROWSER',objectId:'FC-C8AD5BD621',binding,
 baselineCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),implementationContentSha256:hash(readFileSync('src/scene/palace/special/DonghuaCentralDoorFront.js','utf8')),
 officialPixelsIncluded:false,photographDate:'UNSPECIFIED',referencePage:'https://www.dpm.org.cn/explore/building/236502.html',referenceImage:'https://img.dpm.org.cn/Uploads/Picture/dc/3912[1024].jpg',
 rowsRemovedIn1024Asset:[136,234],displayFitY:[0,6],verticalScale:1024/926,
 acceptance:'PARTIAL_COUNT_CORRECTED; BROWSER_VERIFY_PENDING; HARDWARE_COLOR_SPACING_ASPECT_UNCALIBRATED',
 limitation:'Eight column layout, nine vertical rows; existing ring interrupts grid positions. Not a claim of 72 individually reconstructed studs. All non-target skins/portals and west gate remain unchanged.',records};
writeFileSync(`${out}/actual-component-diagnostic.json`,JSON.stringify(report,null,2)+'\n');
console.log(records.map(r=>({quality:r.quality,stage:r.stage,triangles:r.triangles,meshes:r.mergedMeshes,geometry:r.mergedGeometrySha256,visibleRows:r.afterFinish.map(o=>o.rows.filter(x=>x.visible).length)})));
