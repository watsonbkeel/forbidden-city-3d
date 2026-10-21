/**
 * Read-only Huangji triangle inventory. Usage:
 * node tests/r48-ningshou-huangji-column-envelope.mjs . > column-envelopes.json
 * Dependencies: repository's existing Three.js, tests/lib/cpu-draco.mjs and pinned shipped Draco decoder.
 * All bounds use decoded POSITION + decoded indices, after full glTF scene hierarchy matrixWorld.
 * All coordinates are model metres, not historical survey measurements.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const repo=path.resolve(process.argv[2]||new URL('../',import.meta.url).pathname);
const imp=p=>import(pathToFileURL(path.join(repo,p)));
const {GLTFLoader}=await imp('node_modules/three/examples/jsm/loaders/GLTFLoader.js');
const {Vector3,Matrix4,Quaternion,MeshStandardMaterial}=await imp('node_modules/three/build/three.module.js');
const {cpuDracoLoader}=await imp('tests/lib/cpu-draco.mjs');
const cfgPath='data/interiors/huangji.json',cfgBytes=fs.readFileSync(path.join(repo,cfgPath)),cfg=JSON.parse(cfgBytes);
const assetPath='public/models/interiors/huangji-aligned-0a79ec49e8cd.glb',bytes=fs.readFileSync(path.join(repo,assetPath));
const sha=b=>createHash('sha256').update(b).digest('hex');
assert.equal(sha(bytes),'0a79ec49e8cd442d363fdc6bccf4074d9e214ef3b0f3b56eba618297c1e88cc6');
const glbJson=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
const loader=new GLTFLoader().setDRACOLoader(await cpuDracoLoader());
const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
gltf.scene.updateMatrixWorld(true);
const round=v=>Number(v.toFixed(9));
const fresh=()=>({min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity],triangles:0,area:0,byMesh:{},byMaterial:{}});
function add(b,v){for(let k=0;k<3;k++){b.min[k]=Math.min(b.min[k],v[k]);b.max[k]=Math.max(b.max[k],v[k]);}}
function addTri(b,t,pts=t.pts){pts.forEach(v=>add(b,v));b.triangles++;b.area+=t.area;b.byMesh[t.mesh]=(b.byMesh[t.mesh]??0)+1;b.byMaterial[t.material]=(b.byMaterial[t.material]??0)+1;}
function result(b){return b.triangles?{min:b.min.map(round),max:b.max.map(round),size:b.max.map((v,k)=>round(v-b.min[k])),triangles:b.triangles,triangleArea:round(b.area),byMesh:b.byMesh,byMaterial:b.byMaterial}:null;}
const triangles=[],meshes=[];let vertices=0;
gltf.scene.traverse(o=>{
 if(!o.isMesh)return;
 const p=o.geometry.attributes.position,index=o.geometry.index,ps=Array.from({length:p.count},(_,i)=>new Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).toArray()),b=fresh(),hidden=/^(COL_|WALK_)/.test(o.name);vertices+=p.count;
 for(let i=0;i<(index?.count??p.count);i+=3){
  const ids=[0,1,2].map(k=>index?index.getX(i+k):i+k),pts=ids.map(id=>ps[id]);assert.ok(pts.every(p=>p.every(Number.isFinite)));
  const a=new Vector3(...pts[1]).sub(new Vector3(...pts[0])),c=new Vector3(...pts[2]).sub(new Vector3(...pts[0]));
  const t={mesh:o.name,material:o.material?.name??'',hidden,pts,area:a.cross(c).length()*.5};triangles.push(t);addTri(b,t);
 }
 meshes.push({name:o.name,material:o.material?.name??'',runtimeVisible:!hidden,vertexCount:p.count,indexCount:index?.count??null,fullHierarchyMatrixWithinGLB:o.matrixWorld.toArray().map(round),bounds:result(b)});
});
const groups={visible:fresh(),hidden:fresh(),floor:fresh(),caisson:fresh(),furnitureAndDais:fresh(),columns:fresh(),columnFrontEast:fresh(),columnFrontWest:fresh(),columnRearEast:fresh(),columnRearWest:fresh()};
function all(t,p){return t.pts.every(p);}
for(const t of triangles){
 addTri(groups[t.hidden?'hidden':'visible'],t);if(t.hidden)continue;
 // Exhaustive spatial partition verified against the decoded triangles. Material
 // labels disambiguate the red caisson frame from columns; no node name is used.
 if(all(t,p=>p[1]<.1)&&['brick_grout','gold_brick'].includes(t.material)){t.region='floor';}
 else if(['gold_lacquer','stone'].includes(t.material)&&all(t,p=>Math.abs(p[0])>3.1)){
  assert.ok(all(t,p=>Math.sign(p[0])===Math.sign(t.pts[0][0])));
  assert.ok(all(t,p=>(p[2]<8.75)===(t.pts[0][2]<8.75)));
  t.region=`column${t.pts[0][2]<8.75?'Front':'Rear'}${t.pts[0][0]<0?'East':'West'}`;
  addTri(groups.columns,t);
 }else if(all(t,p=>p[1]>5.5)){t.region='caisson';}
 else if(all(t,p=>Math.abs(p[0])<3.1&&p[1]<4.8)){t.region='furnitureAndDais';}
 else throw Error('Unclassified or straddling triangle '+JSON.stringify(t));
 addTri(groups[t.region],t);
}
assert.equal(groups.visible.triangles,groups.floor.triangles+groups.caisson.triangles+groups.furnitureAndDais.triangles+groups.columns.triangles);
assert.equal(groups.visible.triangles,24024);assert.equal(groups.hidden.triangles,72);
// Clip actual triangles against horizontal planes. This avoids expanding a
// high-ceiling hole to include a dragon ornament several metres farther down.
function clipY(poly,plane,lower){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ia=lower?a[1]>=plane:a[1]<=plane,ib=lower?b[1]>=plane:b[1]<=plane;if(ia)out.push(a);if(ia!==ib){const t=(plane-a[1])/(b[1]-a[1]);out.push(a.map((v,k)=>v+(b[k]-v)*t));}}return out;}
function slab(y0,y1){const output={};for(const t of triangles){if(t.hidden||t.region==='floor')continue;let p=clipY(t.pts,y0,true);if(p.length)p=clipY(p,y1,false);if(p.length>=2){const b=output[t.region]??(output[t.region]=fresh());addTri(b,t,p);}}return{yRange:[y0,y1],boundsByRegion:Object.fromEntries(Object.entries(output).map(([k,b])=>[k,result(b)])),note:'Triangle count is intersecting original triangles; bounds use exactly clipped vertices. Triangle area remains original full triangle area and is not the clipped area.'};}
// Runtime placement is T(frame + anchor) * R_y(frame.rot), outside GLB hierarchy.
// Ground mode queries the collision scene at the hall centre on every install.
const floorY=1.5;
const placement=new Matrix4().compose(new Vector3(cfg.frame.x+(cfg.anchor?.x??0),floorY+(cfg.anchor?.y??0),cfg.frame.z+(cfg.anchor?.z??0)),new Quaternion().setFromAxisAngle(new Vector3(0,1,0),cfg.frame.rot??0),new Vector3(1,1,1));
const placed={};for(const t of triangles){if(t.hidden)continue;const b=placed[t.region]??(placed[t.region]=fresh()),w=t.pts.map(p=>new Vector3(...p).applyMatrix4(placement).toArray());addTri(b,t,w);}
// Build only the existing kit hall body using exact CourtKit code. Roof and
// plaque output are irrelevant to the four B-tier throne primitives and skipped.
const hall=JSON.parse(fs.readFileSync(path.join(repo,'data/zones/ningshou.json'))).items.find(x=>x.name==='皇极殿');
const {CourtKit}=await imp('src/scene/palace/kit.js');
const cache=new Map(),lib={tileSize(){return 1;},material(name){if(!cache.has(name))cache.set(name,new MeshStandardMaterial({name}));return cache.get(name);}};
const kit=new CourtKit(lib);kit.roof=()=>null;kit.hall({...hall,plaque:false});kit.root.updateMatrixWorld(true);
const kitFurniture=[];
kit.root.traverse(o=>{if(!o.isMesh||![kit.gold,kit.lacquer].includes(o.material))return;const g=o.geometry,p=g.attributes.position,index=g.index,b=fresh();for(let i=0;i<(index?.count??p.count);i+=3){const pts=[0,1,2].map(k=>new Vector3().fromBufferAttribute(p,index?index.getX(i+k):i+k).applyMatrix4(o.matrixWorld).sub(new Vector3(hall.x,hall.ph,hall.z)).toArray());addTri(b,{mesh:o.name||'(unnamed kit box)',material:o.material.name,pts,area:0});}kitFurniture.push({material:o.material.name,geometry:g.type,parameters:g.parameters,hallFloorRelativeBounds:result(b)});});
assert.equal(kitFurniture.length,4);
const kitFloorCandidates=kit.walkables.filter(w=>w.type==='box'&&w.box.min.x<=hall.x&&w.box.max.x>=hall.x&&w.box.min.z<=hall.z&&w.box.max.z>=hall.z).map(w=>w.box.max.y);
assert.deepEqual(kitFloorCandidates,[1.5]);
const caisson=groups.caisson,margin=.05;
const output={
 generatedBy:'tests/r48-ningshou-huangji-column-envelope.mjs',method:'GLTFLoader with pinned local CPU Draco decoder; actual POSITION and triangle index decoding; full node/ancestor matrixWorld; no accessor min/max used',coordinateStatus:'Existing model geometry only, not a historical survey or official dimensional evidence',
 asset:{path:assetPath,sha256:sha(bytes),bytes:bytes.length,scene:glbJson.scene??0,extensionsRequired:glbJson.extensionsRequired,sourceNodes:glbJson.nodes,vertexCount:vertices,triangleCount:triangles.length},configSnapshot:{path:cfgPath,sha256:sha(cfgBytes),config:cfg},
 placement:{formula:'world = T(frame.x + anchor.x, floorY + anchor.y, frame.z + anchor.z) * R_y(frame.rot) * GLB node matrixWorld * decoded position',groundMode:cfg.floor,groundQuery:'cm.getGroundHeight(cfg.frame.x, cfg.frame.z, 0, 999)',verifiedKitSupportY:floorY,kitCentreWalkableHeights:kitFloorCandidates,worldMatrixAtKitSupport:placement.toArray().map(round),additionalScaling:false,alreadyBakedAlignment:'All non-floor top-level nodes carry the -0.8 m Z alignment from align_huangji_backdoor.mjs. Do not apply it again.',caveat:'The 1.5 m runtime Y assumes the retained hall kit support remains highest at the centre; a changed collision scene requires a new runtime ground query.'},
 totals:Object.fromEntries(Object.entries(groups).map(([k,b])=>[k,result(b)])),
 meshes,ceilingSlabs:[slab(7.63,7.80),slab(7.77,7.77),slab(7.20,7.80),slab(5.75,7.80)],
 worldBoundsAtKitSupport:Object.fromEntries(Object.entries(placed).map(([k,b])=>[k,result(b)])),
 ceilingAvoidance:{wholeCaissonLocalBounds:result(caisson),conservativeRectangleWith5cmMargin:{minX:round(caisson.min[0]-margin),maxX:round(caisson.max[0]+margin),minZ:round(caisson.min[2]-margin),maxZ:round(caisson.max[2]+margin)},caissonModelCentreXZ:[0,8.2],columnModelCentresXZ:[[-3.9,6.4],[3.9,6.4],[-3.9,11.1],[3.9,11.1]],recommendation:'Retain caisson and all four columns. Cut ceiling panels around the actual caisson footprint; separately cut around each shaft using the slab that matches the new panel vertical interval. Whole-column bounds include lower decorative dragons and bases and are intentionally more conservative.',baselineRawKitCeilingFloorRelativeY:round(hall.colH-Math.min(.85,Math.max(.45,hall.colH*.12))-.02),baselineRawKitCeilingHasCaissonIntersectionAtExactlyItsPlane:false,baselineRawKitCeilingIntersectsGoldColumnShafts:true},
 kitThroneOverlap:{state:'BASELINE_RAW_KIT_BEFORE_R48_ATOMIC_SWITCH',bTierStillVisible:true,reason:'Raw CourtKit comparison only. The current R48 loader atomically hides these four fallback meshes on successful aligned-layer installation.',actualKitFurniture:kitFurniture,glbFurnitureBounds:result(groups.furnitureAndDais),geometryFinding:'The asset contains a low dais, upper dais, throne, cushion and seven-panel screen. The baseline raw kit furniture overlaps this asset; the current R48 atomic switch prevents simultaneous rendered layers.',warning:'Do not add another throne or move the kit when correcting bays without explicitly preserving/removing its existing furniture: kit tw depends on bay width; changing bays from 15 to 9 widens kit tw from 4.648 to 5 while the asset upper dais stays about 4.9 wide.'},
 proxySemantics:{hiddenAtInstall:true,COL:'Five meshes, 60 triangles. Box3 colliders, not rendered. Columns only cover y=0..3; these are not visual pillar extents.',WALK:'One mesh, 12 triangles. Low dais support, not rendered; max y is 0.299987793 local after Draco decoding.',visibleImportant:'Visible columns and their stone bases live inside merged_gold_lacquer/merged_stone; caisson spans blue/gold/red/pearl material batches. Do not select whole material batches when trying to preserve or hide only one feature.'},
 sourceFiles:['assets-src/interiors/huangji.py','assets-src/interiors/throne_hall.py','assets-src/interiors/align_huangji_backdoor.mjs','src/scene/interior/InteriorLoader.js','src/scene/palace/kit.js'],validation:{decodedAll15MeshInstances:true,decodedAll15PrimitiveIndices:true,exhaustiveSpatialPartition:true,visibleMeshCount:meshes.filter(m=>m.runtimeVisible).length,hiddenMeshCount:meshes.filter(m=>!m.runtimeVisible).length,assertionsPassed:true}
};
const columnSlabs=Array.from({length:12},(_,i)=>{const s=slab(i*.25,(i+1)*.25);s.boundsByRegion=Object.fromEntries(Object.entries(s.boundsByRegion).filter(([k])=>k.startsWith('column')));return s;});
console.log(JSON.stringify({asset:{path:assetPath,sha256:sha(bytes)},method:output.method,coordinates:'GLB scene-local AFTER every node/ancestor transform, BEFORE final InteriorLoader frame placement; baked -0.8 Z alignment already included and must not be repeated',placement:output.placement,componentPartition:'All vertices of gold_lacquer or stone triangles have abs(x)>3.1; each triangle stays within one X sign and one Z side of8.75. This exhaustively separates four pillars without using the whole merged material mesh.',retainedOriginalCOL:output.meshes.filter(m=>/^COL_[0-3]$/.test(m.name)).map(m=>({name:m.name,bounds:m.bounds})),slabHeight:.25,range:[0,3],columnSlabs,notHistoricalSurvey:true,noProductChanges:true},null,2));
