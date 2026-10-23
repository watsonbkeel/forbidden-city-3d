// Actual isolated production assembly, rendered before/after with identical
// cameras. CPU diagnostic colors are explicit substitutes for unloaded textures.
import fs from 'node:fs';import {gzipSync} from 'node:zlib';import {createHash} from 'node:crypto';import * as THREE from 'three';
import {fixture,meshes,rows,columns,hash,nav} from '../lib/r62-fengxian-rear-fixture.mjs';
import {FENGXIAN_REAR_VIEWS} from '../lib/r62-fengxian-rear-world-check.mjs';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
const out=process.argv[2]??'reports/r62-fengxian-rear-bays';fs.mkdirSync(out,{recursive:true});
const sourcePaths=['src/scene/palace/special/FengxianRearProfile.js','src/scene/palace/kit.js','src/scene/palace/interiors.js','src/scene/RoofBuilder.js','data/zones/east-six.json','tests/lib/r62-fengxian-rear-fixture.mjs','tests/lib/r62-fengxian-rear-world-check.mjs','tests/r62-fengxian-rear-bays.test.mjs','tests/r62-fengxian-rear-bays/export-diagnostic.mjs','tests/r62-fengxian-rear-bays/render-diagnostic.py'];
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const palette={wood_column:0x922b23,caihua_beam:0x3a7c7d,dougong_band:0x38696b,wall_red:0x87382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,lattice_doors:0x944c3a,sumeru_band:0xb6b2a6,kit_floor_flat:0x494947};
const report={baselineCommit:'6b396800b6a03582aebf513fcef4966e9f5d0db3',sourceSHA256:Object.fromEntries(sourcePaths.map(p=>[p,sha(p)])),scope:'ACTUAL_ISOLATED_PRODUCTION_HALL_CPU_DIAGNOSTIC_NOT_BROWSER_OR_PHOTOGRAPHIC_ACCEPTANCE',reference:{url:'https://www.dpm.org.cn/explore/building/236430.html',scope:'Official text: rear hall nine bays, single-eave wudian roof only. No front-hall photograph used.',photographyDate:null},stages:[]};
for(const candidate of[false,true]){
 const f=fixture(candidate),stage=candidate?'after':'before',record={stage,columns:columns(f).length,meshes:meshes(f.frame).length,geometryHash:hash(rows(f.frame)),navigationHash:hash(nav(f.kit)),views:[]};
 f.merged=f.kit.finish();f.merged.updateMatrixWorld(true);
 const triangles=[];for(const m of meshes(f.merged)){
  const geo=m.geometry,p=geo.attributes.position,n=geo.attributes.normal,ix=geo.index,nm=new THREE.Matrix3().getNormalMatrix(m.matrixWorld);
  for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(j=>ix?ix.getX(i+j):i+j),v=ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),nn=ids.map(j=>new THREE.Vector3().fromBufferAttribute(n,j).applyNormalMatrix(nm).toArray());const mat=Array.isArray(m.material)?m.material[geo.groups.find(g=>i>=g.start&&i<g.start+g.count)?.materialIndex??0]:m.material,name=solidMaterialNameAt(m,i/3).replace(/_material$/,'');const c=palette[name]?new THREE.Color(palette[name]).toArray():mat.color.toArray();triangles.push({v,n:nn,c:[c,c,c],side:mat.side,character:false});}
 }
 for(const view of FENGXIAN_REAR_VIEWS){const camera=new THREE.PerspectiveCamera(view.fov,960/540,.03,160),world=p=>new THREE.Vector3(p[0]-182.5,p[1],p[2]+283.4);camera.position.copy(world(view.eye));camera.lookAt(world(view.target));camera.updateMatrixWorld(true);const cameraData={position:camera.position.toArray(),target:world(view.target).toArray(),fov:view.fov,aspect:camera.aspect,matrixWorldInverse:camera.matrixWorldInverse.toArray(),projectionMatrix:camera.projectionMatrix.toArray()};const file=`fengxian-rear-${view.name}-${stage}.json.gz`;const data={kind:report.scope,label:`FENGXIAN REAR / ${view.name} / ${stage} / ${record.columns} eave columns`,camera:cameraData,sourceCharacterInstances:0,triangles};fs.writeFileSync(`${out}/${file}`,gzipSync(JSON.stringify(data)));record.views.push({file,sha256:sha(`${out}/${file}`),camera:cameraData,triangles:triangles.length});}
 report.stages.push(record);f.dispose();
}
fs.writeFileSync(`${out}/capture.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.stages.map(s=>({stage:s.stage,columns:s.columns,meshes:s.meshes,triangles:s.views[0].triangles}))));
