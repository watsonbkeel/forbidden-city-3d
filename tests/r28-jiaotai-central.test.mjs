import {verifiedR33AddedProductPaths} from './lib/r33-product-inventory.mjs';
import {verifiedR31AddedProductPaths,verifiedR32AddedProductPaths} from './lib/r32-product-inventory.mjs';
import {restorePreR32Navigation} from './lib/r32-scene-retention.mjs';
import {r30Source,restorePreR30Navigation} from './lib/r30-qianqing-passage-retention.mjs';
import {restorePreR29Source,restorePreR29Capture,r29Source} from './lib/r29-qianqing-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {buildRoof} from '../src/scene/RoofBuilder.js';
import {library,hash,sceneRows} from './lib/inner-palace-fixture.mjs';
import {JIAOTAI_CENTRAL as P,jiaotaiFrame,jiaotaiCeilingRing} from '../src/scene/palace/special/JiaotaiCeilingFrame.js';
import {buildJiaotaiCaissonLevel,buildJiaotaiBackdrop,installJiaotaiCentral} from '../src/scene/palace/special/JiaotaiCentralInterior.js';
import {jiaotaiCentralMaterial,centralUV} from '../src/scene/palace/special/JiaotaiCentralArt.js';
const base=JSON.parse(fs.readFileSync(new URL('./fixtures/r28-jiaotai-baseline.json',import.meta.url)));
const scene=new T.Scene(),b=new PalaceBuilder(scene,library());b.buildAll(PALACE_LAYOUT);scene.updateMatrixWorld(true);
const hall=scene.getObjectByName('后三宫'),lod=hall.getObjectByName('jiaotai-central-ceiling-detail');
const faces=g=>(g.index?.count??g.attributes.position.count)/3;
const close=(a,c,e=1e-5)=>assert.ok(Math.abs(a-c)<e,`${a} != ${c}`);
const raw=buildJiaotaiCaissonLevel(new T.MeshStandardMaterial({side:T.DoubleSide}),true);raw.updateMatrixWorld(true);
const frame=jiaotaiFrame({w:19,d:19,H:6.2});

test('exact historical R31/R30 reversal retains the entire R27 navigation and frozen other palace groups',()=>{
 assert.equal(hash((()=>{const n=restorePreR30Navigation({colliders:b.colliders,walkables:b.walkables});return{c:n.colliders,w:n.walkables};})()),base.navigation);assert.equal(restorePreR30Navigation({colliders:b.colliders,walkables:b.walkables}).colliders.length,2489);const historicalR31=restorePreR32Navigation({colliders:b.colliders,walkables:b.walkables});assert.equal(historicalR31.colliders.length,2503);assert.equal(historicalR31.walkables.length,120);
 // The old group fixture was captured after matrix updates; the full resident
 // capture records rows before that update. Rebuild that exact historical view.
 const historicalScene=new T.Scene(),historicalBuilder=new HistoricalR27PalaceBuilder(historicalScene,library());
 try{historicalBuilder.buildAll(PALACE_LAYOUT);historicalScene.updateMatrixWorld(true);const rows=sceneRows(historicalScene);for(const[k,v]of Object.entries(base.groups))if(k!=='后三宫')assert.deepEqual(rows[k],v);}finally{historicalBuilder.dispose();}
 assert.match(P.dimensionStatus,/NOT_SURVEY/);assert.equal(hall.userData.jiaotaiCentral.navigation,'ORIGINAL_REGISTRATIONS_UNCHANGED');
});
test('one-bay square opening has four downward UV-preserving strips and rejects altered registrations',()=>{
 const g=jiaotaiCeilingRing({W:19,D:19,y:8.33,tile:1.6,opening:frame});assert.equal(faces(g),8);let area=0;const a=g.attributes.position,uv=g.attributes.uv,n=g.attributes.normal;
 for(let i=0;i<a.count;i++){assert.ok(n.getY(i)<-.99);close(uv.getX(i),a.getX(i)/1.6);close(uv.getY(i),a.getZ(i)/1.6);}
 for(let i=0;i<g.index.count;i+=3){const ps=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(a,g.index.getX(i+k)));area+=ps[1].sub(ps[0]).cross(ps[2].sub(ps[0])).length()/2;}close(area,19*19-6.2*6.2,1e-4);
 const m=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));m.updateMatrixWorld();const ray=(x,z)=>new T.Raycaster(new T.Vector3(x,0,z),new T.Vector3(0,1,0)).intersectObject(m);
 assert.equal(ray(0,P.centreZ).length,0);assert.ok(ray(4,P.centreZ).length);assert.ok(ray(0,-1).length);
 for(const change of[{id:'other'},{minZ:0},{maxX:3.11}])assert.throws(()=>jiaotaiCeilingRing({W:19,D:19,y:8.33,tile:1.6,opening:{...frame,...change}}));
 assert.throws(()=>jiaotaiFrame({w:20,d:19,H:6.2}));assert.throws(()=>jiaotaiCeilingRing({W:6,D:19,y:8,tile:1.6,opening:frame}));
});
test('only hidden single-roof planar closure changes; tiles, brackets and every exterior roof mesh stay exact',()=>{
 const o={type:'pavilion',width:19.4,depth:19.4,baseY:8.36,layers:1,brackets:true,sides:4,height:5.2,overhang:2.5};
 const old=buildRoof(library(),o),next=buildRoof(library(),{...o,jiaotaiCeilingOpening:frame});
 const capture=r=>r.children.filter(m=>m.material.name!=='rafters').map(m=>({name:m.name,material:m.material.name,p:m.position.toArray(),a:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[...a.array]])),i:m.geometry.index?[...m.geometry.index.array]:null}));
 assert.deepEqual(capture(next),capture(old));
 const roofRay=new T.Raycaster(new T.Vector3(0,8.34,P.centreZ),new T.Vector3(0,1,0));next.updateMatrixWorld(true);
 next.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.side=T.DoubleSide;}});
 const hit=roofRay.intersectObject(next,true);assert.ok(hit.length);assert.ok(hit[0].point.y>2.16+P.bodyH+P.rise,'caisson crown must fit below retained roof');
 assert.throws(()=>buildRoof(library(),{...o,type:'wudian',jiaotaiCeilingOpening:frame}),/four-sided/);
});
test('both levels close the cavity, retain central mirror and stay inside the square envelope',()=>{
 for(const fine of[true,false]){const r=buildJiaotaiCaissonLevel(raw.children[0].material,fine);r.updateMatrixWorld(true);assert.equal(r.children.filter(x=>x.name==='central-xuanyuan-mirror').length,1);
  const bb=new T.Box3().setFromObject(r);assert.ok(bb.min.x>=-3.3-1e-5&&bb.max.x<=3.3+1e-5);assert.ok(bb.min.z>=-3.3-1e-5&&bb.max.z<=3.3+1e-5);close(bb.max.y,P.bodyH+P.rise);
  for(const x of[-3.09,-3,-2,-1,0,1,2,3,3.09])for(const z of[-3.09,-3,-2,-1,0,1,2,3,3.09]){const hit=new T.Raycaster(new T.Vector3(x,5,z),new T.Vector3(0,1,0)).intersectObject(r,true);assert.ok(hit.length,`hole at ${x},${z}`);}
  const mirror=r.getObjectByName('central-xuanyuan-mirror'),stem=r.getObjectByName('mirror-suspension');close(stem.position.y-stem.geometry.parameters.height/2,mirror.position.y+P.mirrorRadius);
 }
 assert.equal(raw.children.filter(x=>x.name==='polygonal-red-rail').length,16);assert.ok(raw.getObjectByName('coiled-dragon-body'));assert.ok(raw.getObjectByName('round-dragon-field'));
});
test('rear plaque overlaps the lower edge of the upper field and leaves a gap above the inscription panel',()=>{
 const g=new T.Group();buildJiaotaiBackdrop(b,g,{x0:0,ty:3.41,tz:358.42,depth:5.2,thW:4.56});g.updateMatrixWorld(true);
 const plaque=g.getObjectByName('jiaotai-wuwei-plaque'),upper=g.getObjectByName('jiaotai-upper-gilt-screen-field'),lower=g.getObjectByName('jiaotai-lower-inscription-field-untranscribed');
 const box=m=>new T.Box3().setFromObject(m),a=box(plaque),u=box(upper),l=box(lower);assert.ok(a.min.y<u.min.y&&a.max.y>u.min.y);assert.ok(a.min.y>l.max.y+.1);close(plaque.geometry.parameters.width/upper.geometry.parameters.width,.44);
 assert.ok(a.max.z<u.min.z);const bounds=box(g);assert.ok(bounds.min.x>-2.28&&bounds.max.x<2.28);assert.ok(bounds.max.z<360.5);
 const hangers=g.children.filter(m=>m.name==='jiaotai-plaque-hanger');assert.equal(hangers.length,2);for(const m of hangers)close(box(m).min.y,a.max.y);
});
test('atlas artwork is cached and isolated; UVs are finite within their chosen padded cells',()=>{
 const owner=new PalaceBuilder(new T.Scene(),library()),gold=owner.ownMat('gold-original',{color:0xaa9955}),before=gold.toJSON(),m=jiaotaiCentralMaterial(owner);assert.equal(m,jiaotaiCentralMaterial(owner));assert.deepEqual(gold.toJSON(),before);assert.equal(m.map.colorSpace,T.SRGBColorSpace);assert.equal(m.map.image.width,1024);assert.equal(m.map.image.height,512);
 raw.traverse(n=>{if(!n.isMesh)return;for(const v of n.geometry.attributes.uv.array)assert.ok(Number.isFinite(v)&&v>0&&v<1);});
 for(let cell=0;cell<8;cell++){const g=centralUV(new T.BoxGeometry(),cell);for(let i=0;i<g.attributes.uv.count;i++){const u=g.attributes.uv.getX(i),v=g.attributes.uv.getY(i);assert.ok(u>cell%4/4&&u<(cell%4+1)/4);assert.ok(v>1-(Math.floor(cell/4)+1)/2&&v<1-Math.floor(cell/4)/2);}}
 assert.throws(()=>centralUV(new T.BoxGeometry(),8));let disposed=0;m.map.addEventListener('dispose',()=>disposed++);owner.dispose();m.dispose();assert.equal(disposed,1);
});
test('two resident levels share one private batch; LOD never changes navigation',()=>{
 assert.equal(lod.levels.length,2);assert.deepEqual(lod.levels.map(x=>x.object.children.length),[1,1]);assert.deepEqual(lod.levels.map(x=>faces(x.object.children[0].geometry)),[1298,172]);
 const cam=new T.PerspectiveCamera();for(const [d,near]of[[5,true],[200,false],[5,true]]){cam.position.copy(lod.position).add(new T.Vector3(0,0,d));cam.updateMatrixWorld(true);lod.update(cam);assert.equal(lod.levels[0].object.visible,near);assert.equal(lod.levels[1].object.visible,!near);assert.equal(hash((()=>{const n=restorePreR30Navigation({colliders:b.colliders,walkables:b.walkables});return{c:n.colliders,w:n.walkables};})()),base.navigation);}
 assert.throws(()=>installJiaotaiCentral(b,hall),/already installed/);assert.throws(()=>installJiaotaiCentral(b,new T.Group()),/Unregistered/);
});

// R28 retention is tested against the complete independently reconstructed R27
// scene. Existing R27 and older assertions retain their original thresholds.
import path from 'node:path';
import {createHash} from 'node:crypto';
import {HistoricalR27PalaceBuilder} from './lib/historical-r27-jiaotai-fixture.mjs';
import {captureJiaotaiScene} from './lib/r27-jiaotai-capture.mjs';
import {r28Source,r28Scene,restorePreR28Source,assertR28AddedSource,assertR28RetainedSource,restorePreR28SceneRow,restorePreR28SceneRows,restorePreR28MeshRows,restorePreR28GraphRows,restorePreR28Materials,assertR28NavigationIdentity,restorePreR28Capture} from './lib/r28-jiaotai-central-retention.mjs';
import {restorePreR27Source,restorePreR27SceneRows,restorePreR27MeshRows,restorePreR27GraphRows,restorePreR27Materials} from './lib/r27-jiaotai-retention.mjs';
import {restorePreR26FriezeSource,restorePreR26FriezeSceneRows,restorePreR26FriezeMeshRows} from './lib/r26-qianqing-frieze-retention.mjs';
import r27Registry from './fixtures/r27-jiaotai-scene-delta.json' with {type:'json'};
const r28Root=new URL('../',import.meta.url),r28Read=p=>restorePreR29Source(p,fs.readFileSync(new URL(p,r28Root)));
const r28SHA=x=>createHash('sha256').update(x).digest('hex');
const r28Current=restorePreR29Capture(captureJiaotaiScene(PalaceBuilder)),r28Previous=captureJiaotaiScene(HistoricalR27PalaceBuilder);

test('R28 retention pins the frozen candidate, exact R27 tree, three integration sources, three modules and all 110 preceding fixtures',()=>{
 assert.equal(r28SHA(r28Read('tests/fixtures/r28-jiaotai-central-source-delta.json')),'f6f3ad1d79c7c46936da42bd7ea12bec4051e69ef03aa9cd6a84985be695612a');
 assert.equal(r28SHA(r28Read('tests/fixtures/r28-jiaotai-central-scene-delta.json')),'4ab7b74082268615e71e39443c294bb8e9e6407953c4dc71ad7ccc9afd0cc061');
 for(const f of[r28Source,r28Scene]){assert.equal(f.base,'16f2350b7366761a4f66b4bbf0729acbf9a9b951');assert.equal(f.baseTree,'4636664375da84b5fa3f5bbb3c34d2ebeef1fce0');assert.equal(f.candidate,'81c6163b195193879db7ae8d94d02c39b7747e2b');assert.match(f.scope,/Historical assertions only/);}
 assert.deepEqual(Object.keys(r28Source.files),['src/scene/PalaceBuilder.js','src/scene/RoofBuilder.js','src/scene/palace/special/SquareHalls.js']);
 assert.deepEqual(Object.values(r28Source.files).map(d=>d.deltas.length),[4,2,5]);
 assert.deepEqual(Object.keys(r28Source.addedFiles),['src/scene/palace/special/JiaotaiCeilingFrame.js','src/scene/palace/special/JiaotaiCentralArt.js','src/scene/palace/special/JiaotaiCentralInterior.js']);
 assert.equal(Object.keys(r28Source.retainedFiles).length,277);assert.equal(Object.keys(r28Source.preservedFixtures).length,110);
 for(const[p,digest]of Object.entries(r28Source.preservedFixtures))assert.equal(r28SHA(r28Read(p)),digest,p);
 const actual=['src','data','public'].flatMap(dir=>fs.readdirSync(new URL(dir+'/',r28Root),{recursive:true,withFileTypes:true}).filter(x=>x.isFile()).map(x=>path.relative(r28Root.pathname,path.join(x.parentPath,x.name)))).sort();
 assert.deepEqual([...Object.keys(r28Source.files),...Object.keys(r28Source.addedFiles),...Object.keys(r30Source.addedFiles),...Object.keys(r29Source.addedFiles).filter(p=>/^(src|data|public)\//.test(p)),...Object.keys(r28Source.retainedFiles).filter(p=>/^(src|data|public)\//.test(p)),...verifiedR31AddedProductPaths(),...verifiedR32AddedProductPaths(),...verifiedR33AddedProductPaths()].sort(),actual);
});

test('all 11 exact R28 integration hunks reverse only after full-source binding; partial, missing, duplicate and unrelated edits fail closed',()=>{
 for(const[p,d]of Object.entries(r28Source.files)){
  const bytes=r28Read(p),copy=Buffer.from(bytes),text=bytes.toString(),old=restorePreR28Source(p,bytes);
  assert.equal(r28SHA(bytes),d.candidateSHA256);assert.equal(r28SHA(old),d.baselineSHA256);assert.equal(restorePreR28Source(p,old),old);assert.deepEqual(bytes,copy);
  const bad=['',text+'\n',text+text,'// unknown drift\n'+text,text.replace('import','/* unrelated */ import')];
  for(const h of d.deltas){assert.equal(text.split(h.after).length,2);assert.equal(old.toString().split(h.before).length,2);for(const replacement of['',h.before,h.after+h.after])bad.push(text.replace(h.after,replacement));}
  for(const value of bad)for(const restore of[restorePreR28Source,restorePreR27Source,restorePreR26FriezeSource])assert.throws(()=>restore(p,Buffer.from(value)),p);
  for(const value of[old.toString()+'\n',old.toString()+old.toString()])assert.throws(()=>restorePreR28Source(p,Buffer.from(value)),p);
 }
 const p='src/scene/PalaceBuilder.js';assert.throws(()=>restorePreR28Source(p,restorePreR27Source(p,r28Read(p))),'R26 is not an accepted R27/R28 source');
});

test('every R28 added and retained module, runtime asset and route rejects changed or absent bytes',()=>{
 for(const[paths,check]of[[r28Source.addedFiles,assertR28AddedSource],[r28Source.retainedFiles,assertR28RetainedSource]]){
  for(const p of Object.keys(paths)){const bytes=r28Read(p),changed=Buffer.from(bytes);changed[Math.floor(changed.length/2)]^=1;assert.equal(check(p,bytes),bytes);
   for(const bad of[Buffer.alloc(0),Buffer.concat([bytes,bytes]),Buffer.concat([bytes,Buffer.from('\n')]),changed])assert.throws(()=>check(p,bad),p);}
  assert.throws(()=>check('src/scene/Unregistered.js',Buffer.from('unknown')));
 }
});

test('portable R27 snapshot restores both dependent integrations in memory without Git, network, runtime writes or a current-builder fallback',()=>{
 const text=r28Read('tests/lib/historical-r27-jiaotai-fixture.mjs').toString();
 for(const fn of['restorePreR28Source','assertR28AddedSource','assertR28RetainedSource'])assert.ok(text.includes(fn+'(path,read(path))'));
 for(const p of['src/scene/RoofBuilder.js','src/scene/palace/special/SquareHalls.js'])assert.ok(text.includes(p));
 assert.doesNotMatch(text,/child_process|execSync|execFile|fetch\(|https?:\/\/|\/workspace\/|writeFile|import\s*\{\s*PalaceBuilder\s*\}\s*from/);
 assert.notEqual(PalaceBuilder,HistoricalR27PalaceBuilder);
 assert.equal(hash(r28Previous),r28Scene.beforeCaptureSHA256);assert.equal(hash(r28Current),r28Scene.afterCaptureSHA256);
 assert.deepEqual(restorePreR28Capture(r28Current),r28Previous);assert.equal(restorePreR28Capture(r28Previous),r28Previous);
});

test('R28 retains every other top-level group and both timekeeping LODs; complete mesh identities reverse to exact R27 and preceding assertions',()=>{
 assert.deepEqual(r28Scene.names,['后三宫']);for(const[name,row]of Object.entries(r28Scene.unchanged))assert.deepEqual(r28Current.rows[name],row,name);
 assert.deepEqual([r28Previous.meshes.length,r28Current.meshes.length],[166,168]);assert.deepEqual([r28Previous.geometryBytes,r28Current.geometryBytes],[18408404,18491660]);
 assert.deepEqual([r28Previous,r28Current].map(c=>Object.values(c.rows).reduce((n,r)=>n+r.triangles,0)),[189241,190105]);
 assert.deepEqual(r28Scene.meshes.changes.map(d=>[d.beforeIndex,d.before.length,d.afterIndex,d.after.length]),[[137,1,137,1],[143,1,143,1],[146,1,146,1],[148,1,148,1],[152,6,152,6],[166,0,166,2]]);
 assert.deepEqual(r28Current.meshes.slice(0,130),r28Previous.meshes.slice(0,130));
 assert.deepEqual(r28Current.meshes.slice(164,166),r28Previous.meshes.slice(164,166),'both resident clock/leak levels unchanged');
 assert.deepEqual(restorePreR28MeshRows(r28Current.meshes),r28Previous.meshes);assert.deepEqual(restorePreR28SceneRows(r28Current.rows),r28Previous.rows);
 assert.equal(hash(restorePreR27SceneRows(r28Current.rows)),r27Registry.beforeSHA256);assert.equal(hash(restorePreR27MeshRows(r28Current.meshes)),r27Registry.meshes.beforeSHA256);
 assert.deepEqual(restorePreR26FriezeSceneRows(r28Current.rows),restorePreR26FriezeSceneRows(r28Previous.rows));assert.deepEqual(restorePreR26FriezeMeshRows(r28Current.meshes),restorePreR26FriezeMeshRows(r28Previous.meshes));
});

test('full resident graph binds central metadata, two levels, world transforms and private material replacement without altering clock/leak identities',()=>{
 const before=r28Previous.graph,after=r28Current.graph;
 assert.deepEqual([before.length,after.length],[182,187]);assert.deepEqual(restorePreR28GraphRows(after),before);
 const oldParent=before.find(n=>n.name==='后三宫'),parent=after.find(n=>n.name==='后三宫');
 assert.deepEqual(parent.userData.jiaotaiLandmarks,oldParent.userData.jiaotaiLandmarks);assert.deepEqual(parent.children.slice(0,-1),oldParent.children);
 for(const key of['matrix','matrixWorld','position','quaternion','scale','visible','castShadow','receiveShadow'])assert.deepEqual(parent[key],oldParent[key]);
 const clock=before.findIndex(n=>n.name==='jiaotai-timekeeping-detail');assert.deepEqual(after.slice(clock,clock+5),before.slice(clock,clock+5));
 const added=after.slice(182);assert.deepEqual(added.map(n=>n.type),['LOD','Group','Mesh','Group','Mesh']);assert.equal(added[0].name,'jiaotai-central-ceiling-detail');
 assert.deepEqual(added[0].levels.map(l=>[l.distance,l.hysteresis]),[[0,0],[90,.1]]);assert.deepEqual(added.filter(n=>n.type==='Group').map(n=>n.visible),[true,false]);assert.deepEqual(added.filter(n=>n.type==='Mesh').map(n=>n.triangles),[1298,172]);
 assert.deepEqual(restorePreR28Materials(r28Current.materials),r28Previous.materials);assert.deepEqual([r28Previous.uniqueMaterials,r28Current.uniqueMaterials],[86,86]);assert.deepEqual([r28Previous.uniqueTextures,r28Current.uniqueTextures],[22,22]);
 const mats=r28Current.materials.find(([name])=>name==='后三宫')[1],central=mats.filter(m=>m.name==='jiaotai-central-atlas');assert.equal(central.length,3);assert.deepEqual(central[0],central[1]);assert.deepEqual(central[1],central[2]);assert.deepEqual(central[0].map.image,{width:1024,height:512});assert.equal(central[0].map.colorSpace,'srgb');
 assert.equal(hash(restorePreR27GraphRows(after)),r27Registry.graph.beforeSHA256);assert.equal(hash(restorePreR27Materials(r28Current.materials)),r27Registry.materials.beforeSHA256);
});

test('R28 scene reversals reject missing, extra, reordered and mutated old or new groups and meshes without spatial exclusions',()=>{
 for(const rows of[r28Current.rows,r28Previous.rows])for(const name of Object.keys(rows)){
  const missing=structuredClone(rows);delete missing[name];const geometry=structuredClone(rows);geometry[name].hash='unknown';const count=structuredClone(rows);count[name].triangles++;
  for(const bad of[missing,geometry,count,{...rows,extra:rows[name]}])for(const restore of[restorePreR28SceneRows,restorePreR27SceneRows,restorePreR26FriezeSceneRows])assert.throws(()=>restore(bad));
 }
 assert.throws(()=>restorePreR28SceneRow('后三宫',{...r28Current.rows['后三宫'],hash:'unknown'}));
 for(const rows of[r28Current.meshes,r28Previous.meshes])for(const i of new Set([0,129,130,137,143,146,148,152,157,164,165,rows.length-1])){
  const missing=structuredClone(rows);missing.splice(i,1);const duplicate=structuredClone(rows);duplicate.splice(i,0,structuredClone(rows[i]));const reorder=structuredClone(rows),other=i?i-1:1;[reorder[i],reorder[other]]=[reorder[other],reorder[i]];
  const geometry=structuredClone(rows);geometry[i].geometrySHA256='unknown';const material=structuredClone(rows);material[i].materialSHA256='unknown';const matrix=structuredClone(rows);matrix[i].matrix[13]+=.001;const data=structuredClone(rows);data[i].userData.unknown=true;
  for(const bad of[missing,duplicate,reorder,geometry,material,matrix,data])for(const restore of[restorePreR28MeshRows,restorePreR27MeshRows])assert.throws(()=>restore(bad));
 }
 for(const d of r28Scene.meshes.changes){const partial=structuredClone(r28Current.meshes);partial.splice(d.afterIndex,d.after.length,...structuredClone(d.before));assert.throws(()=>restorePreR28MeshRows(partial));}
});

test('R28 ancestor, LOD, material, atlas and metadata drift fails closed for current and historical captures',()=>{
 for(const rows of[r28Current.graph,r28Previous.graph])for(const i of new Set([0,139,147,153,156,158,162,167,177,rows.length-1])){
  const missing=structuredClone(rows);missing.splice(i,1);const duplicate=structuredClone(rows);duplicate.splice(i,0,structuredClone(rows[i]));const world=structuredClone(rows);world[i].matrixWorld[13]+=.001;const data=structuredClone(rows);data[i].userData.unknown=true;const visible=structuredClone(rows);visible[i].visible=!visible[i].visible;
  for(const bad of[missing,duplicate,world,data,visible])assert.throws(()=>restorePreR28GraphRows(bad));
 }
 for(const i of[182,183,184,185,186]){const missing=structuredClone(r28Current.graph);missing.splice(i,1);assert.throws(()=>restorePreR28GraphRows(missing));}
 for(const key of['distance','hysteresis']){const bad=structuredClone(r28Current.graph);bad[182].levels[1][key]+=.01;assert.throws(()=>restorePreR28GraphRows(bad));}
 const metadata=structuredClone(r28Current.graph);delete metadata[139].userData.jiaotaiCentral;assert.throws(()=>restorePreR28GraphRows(metadata));
 for(const rows of[r28Current.materials,r28Previous.materials])for(let i=0;i<rows.length;i++){
  const missing=structuredClone(rows);missing.splice(i,1);const changed=structuredClone(rows);changed[i][1][0].roughness+=.01;
  for(const bad of[missing,changed])assert.throws(()=>restorePreR28Materials(bad));
 }
 for(const index of[22,36,37]){const bad=structuredClone(r28Current.materials);bad.find(([name])=>name==='后三宫')[1][index].map.image.width++;assert.throws(()=>restorePreR28Materials(bad));}
 for(const key of['geometryBytes','uniqueMaterials','uniqueTextures']){const bad=structuredClone(r28Current);bad[key]++;assert.throws(()=>restorePreR28Capture(bad));}
});

test('R28 keeps all 2489 colliders and 120 walkables ordered and byte-exact, rejecting missing, reordered, duplicate and mutated records',()=>{
 assert.deepEqual(r28Current.navigation,r28Previous.navigation);assert.equal(assertR28NavigationIdentity(r28Current.navigation),r28Current.navigation);assert.equal(hash(r28Current.navigation),r27Registry.navigation.afterSHA256);
 for(const nav of[r28Current.navigation,r28Previous.navigation])for(const key of['colliders','walkables']){
  const missing=structuredClone(nav);missing[key].pop();const duplicate=structuredClone(nav);duplicate[key].push(structuredClone(nav[key][0]));const reordered=structuredClone(nav);reordered[key].reverse();const extra=structuredClone(nav);extra.unknown=true;
  for(const bad of[missing,duplicate,reordered,extra])assert.throws(()=>assertR28NavigationIdentity(bad));
  for(const i of[0,Math.floor(nav[key].length/2),nav[key].length-1]){const bad=structuredClone(nav);bad[key][i].unknown=true;assert.throws(()=>assertR28NavigationIdentity(bad));}
 }
});
