import {independentR33Source} from './lib/r34-source-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {TAIHE_CORE as P} from '../src/scene/palace/special/TaiheCoreProfile.js';
import {TAIHE_BEAM_TRIAL} from '../src/scene/palace/special/TaiheBeamFrame.js';
import {installTaihePlaqueSurround} from '../src/scene/palace/special/TaihePlaqueFrame.js';
import {validateTaiheCore} from '../src/scene/interior/TaiheCoreContract.js';
const read = path => fs.readFileSync(new URL('../' + path, import.meta.url));
const sha = b => createHash('sha256').update(b).digest('hex');
const cfg = JSON.parse(read('data/interiors/taihe.json'));
const baseBytes = read('public/models/interiors/taihe-dais-front-24481a47ba8d.glb');
const bytes = read('public' + cfg.model);
const decode = async b => (await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '')).scene;
const meshes = root => { const result = []; root.traverse(o => { if (o.isMesh) result.push(o); }); return result; };
const near = (a, b, message) => assert.ok(Math.abs(a-b)<1e-5, message ?? `${a} != ${b}`);

test('R33 plaque uses the nearer existing beam while dimensions and the rest of the hall profile remain fixed', () => {
  near(P.plaque.z + .08, P.columns.goldZ[0] - TAIHE_BEAM_TRIAL.width / 2);
  assert.equal(P.plaque.width, 6.8); assert.equal(P.plaque.height, 2.8);
  assert.equal(P.plaque.bottomY, 6.4); assert.equal(P.ceilingY, 9.47375);
  assert.equal(P.couplets.width, 1); assert.equal(P.couplets.height, 7.5);
  assert.equal(P.couplets.z, 5.05); assert.equal(P.couplets.bottomY, .85);
  assert.deepEqual(P.columns.goldZ, [-5.5868,5.6019,13.0647]);
  assert.equal(P.columns.radius, .5); assert.equal(P.columns.height, 9.47375);
  assert.equal(P.caisson.z, 9.51); assert.equal(P.caisson.topY, 11.27375);
  assert.match(P.hangingFit?.classification ?? '', /photo-informed.*not surveyed/);
});

test('entrance eye-height projections separate the plaque bottom from receding couplet tops', () => {
  for (const eyeZ of [-20, -18.5, -16, -13]) for (const eyeY of [1.5, 1.7, 1.9]) {
    const bottom = Math.atan2(P.plaque.bottomY - eyeY, P.plaque.z - .08 - eyeZ);
    const top = Math.atan2(P.couplets.bottomY + P.couplets.height - eyeY, P.couplets.z - .07 - eyeZ);
    assert.ok(bottom > top + .04, `Entrance ${eyeZ}/${eyeY}: plaque must project above the couplet tops`);
  }
  // Inside and behind the front row, the plaque is genuinely overhead/behind,
  // never a camera-facing billboard moved along with the viewer.
  assert.ok(P.plaque.z < -3); assert.ok(P.plaque.z < 0);
  assert.ok(P.plaque.bottomY > 1.9 + 4);
});

// Frozen R33 byte-only proof; all runtime/loader tests below keep raw current cfg/bytes.
test('frozen R33 decoded asset changes only the 28 source-owned plaque Z coordinates', async () => {
  const frozenCfg = JSON.parse(independentR33Source('data/interiors/taihe.json'));
  const frozenBytes = read('public' + frozenCfg.model);
  assert.equal(sha(frozenBytes), frozenCfg.asset.sha256);
  const old = meshes(await decode(baseBytes)), current = meshes(await decode(frozenBytes));
  assert.equal(current.length, 8); let changed = 0;
  for (let mi=0; mi<old.length; mi++) {
    const a=old[mi], b=current[mi];
    assert.equal(a.material.name,b.material.name); assert.deepEqual(a.matrix.toArray(),b.matrix.toArray());
    assert.deepEqual(a.geometry.index.array,b.geometry.index.array);
    for (const [key, attribute] of Object.entries(a.geometry.attributes)) {
      const values=b.geometry.attributes[key].array;
      assert.equal(attribute.array.length, values.length);
      for (let j=0; j<values.length; j++) {
        if (attribute.array[j]===values[j]) continue;
        assert.equal(key,'position'); assert.equal(j%3,2);
        assert.ok(['taihe_dark_wood','taihe_glyph_atlas'].includes(a.material.name));
        const i=j-j%3; assert.ok(Math.abs(attribute.array[i])<3.5);
        assert.ok(attribute.array[i+1]>6.3 && attribute.array[i+1]<9.3);
        assert.ok(attribute.array[j]>4.9 && attribute.array[j]<5.2);
        near(values[j]-attribute.array[j],P.plaque.z-5.05); changed++;
      }
    }
  }
  assert.equal(changed,28);
});

test('asset identity, inventory and existing eight-batch 18k runtime contract agree', async () => {
  const root=await decode(bytes), contract=root.getObjectByName('TAIHE_CORE_CONTRACT').userData;
  assert.equal(sha(bytes),cfg.asset.sha256); assert.equal(bytes.length,cfg.asset.encodedBytes);
  assert.equal(contract.profileSHA256,sha(read('data/architecture/taihe-core.json')));
  assert.equal(contract.hangingFitBaseAssetSHA256,sha(baseBytes));
  assert.equal(contract.hangingFitChangedVertices,28);
  const inventory=JSON.parse(contract.inventory);
  for(const name of ['plaque_frame','plaque_letters']){
    const item=inventory.find(v=>v.name===name);assert.ok(item);
    near((item.min[2]+item.max[2])/2,P.plaque.z-(name==='plaque_letters'?.081:0));
  }
  assert.deepEqual(validateTaiheCore(root,cfg),{triangles:17924,meshes:8});
  const result=installTaihePlaqueSurround(root);
  assert.equal(result.triangles,17938);assert.ok(result.triangles+TAIHE_BEAM_TRIAL.triangles<18000);
});

test('mismatched new hanging-fit identity is rejected before installation',async()=>{
  const root=await decode(bytes);
  root.getObjectByName('TAIHE_CORE_CONTRACT').userData.hangingFitChangedVertices=27;
  assert.throws(()=>validateTaiheCore(root,cfg),/hanging fit identity mismatch/);
});

// Direct current-production build: no historical source or fixture restoration.
const context = new Proxy({}, {get:()=>()=>({data:[]}),set:()=>true});
globalThis.document = {createElement:()=>({getContext:()=>context,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const {PalaceBuilder}=await import('../src/scene/PalaceBuilder.js');
const {PALACE_LAYOUT}=await import('../src/scene/Layout.js');
function currentHall(){
  const materials=new Map();
  const library={material:(name,props={})=>{const key=name+JSON.stringify(props);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({name,...props}));return materials.get(key);},tileSize:()=>1,aspect:()=>1};
  const builder=new PalaceBuilder(new THREE.Scene(),library),group=new THREE.Group();
  builder.buildHall(group,structuredClone(PALACE_LAYOUT.find(v=>v.name==='太和殿')),P.frame.floorY);
  group.updateMatrixWorld(true);return {builder,group};
}
function plaqueBounds(root, floorY=0){
  const points=[];
  root.updateMatrixWorld(true);
  for(const mesh of meshes(root)){
    const a=mesh.geometry.attributes.position,indices=mesh.geometry.index;
    for(let i=0;i<(indices?.count??a.count);i++){
      const j=indices?indices.getX(i):i;
      const point=new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(mesh.matrixWorld);
      if(Math.abs(point.x)<=3.401&&point.y-floorY>6.39&&point.y-floorY<9.21&&Math.abs(point.z-P.plaque.z)<.17)points.push(point);
    }
  }
  assert.ok(points.length>=36,'visible referenced plaque vertices required');
  return new THREE.Box3().setFromPoints(points);
}

test('built B and decoded S preserve the same hanging outer silhouette at the fitted depth',async()=>{
  const {builder,group}=currentHall();
  try{
    const fallback=new THREE.Group();
    for(const mesh of meshes(group).filter(m=>m.userData.taiheCoreOwner))fallback.add(mesh.clone());
    assert.equal(meshes(fallback).length,8);
    assert.equal(meshes(fallback).reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),1600);
    const fine=await decode(bytes);installTaihePlaqueSurround(fine);
    const b=plaqueBounds(fallback,P.frame.floorY),s=plaqueBounds(fine);
    for(const bound of ['min','max']){near(b[bound].x,s[bound].x);near(b[bound].y-P.frame.floorY,s[bound].y);}
    near(b.max.z,s.max.z);near(b.max.z,P.plaque.z+.08);
    near(b.min.y-P.frame.floorY,P.plaque.bottomY);near(s.max.y,P.plaque.bottomY+P.plaque.height);
  }finally{builder.dispose();}
});

test('real beam supports the upper plaque back and all corners retain positive roof-shell clearance',()=>{
  const {builder,group}=currentHall();
  try{
    const beams=meshes(group).filter(m=>m.userData.taihePermanent==='central-beam');
    const roof=group.children.find(m=>m.name==='roof_wudian');assert.ok(roof);
    for(const x of [-3.3,0,3.3]){
      const support=new THREE.Raycaster(new THREE.Vector3(x,P.frame.floorY+9,P.plaque.z+.075),new THREE.Vector3(0,0,1),0,.1).intersectObjects(beams,true);
      assert.ok(support.length,'upper back must touch the existing transverse beam');near(support[0].distance,.005);
    }
    for(const x of [-3.4,0,3.4])for(const z of [P.plaque.z-.125,P.plaque.z+.08]){
      const ray=new THREE.Raycaster(new THREE.Vector3(x,P.frame.floorY+9.2,z),new THREE.Vector3(0,1,0));
      const hits=ray.intersectObject(roof,true);assert.ok(hits.length);assert.ok(hits[0].distance>.27);
    }
  }finally{builder.dispose();}
});

test('actual entrance, close and return sightlines hit the fixed plaque without changing navigation',async()=>{
  const {builder,group}=currentHall();
  try{
    const before=JSON.stringify({colliders:builder.colliders,walkables:builder.walkables});
    const fine=await decode(bytes);installTaihePlaqueSurround(fine);fine.position.y=P.frame.floorY;group.add(fine);group.updateMatrixWorld(true);
    const owned=meshes(fine),target=new THREE.Vector3(0,P.frame.floorY+7.8,P.plaque.z);
    for(const eyeZ of [-18.5,-10,-3,0]){
      const eye=new THREE.Vector3(0,P.frame.floorY+1.7,eyeZ),direction=target.clone().sub(eye).normalize();
      const hit=new THREE.Raycaster(eye,direction).intersectObjects(owned,true)[0];
      assert.ok(hit,`plaque sightline at ${eyeZ}`);assert.ok(Math.abs(hit.point.z-P.plaque.z)<.17);
      assert.ok(hit.point.y-P.frame.floorY>6.4&&hit.point.y-P.frame.floorY<9.2);
    }
    assert.equal(JSON.stringify({colliders:builder.colliders,walkables:builder.walkables}),before);
  }finally{builder.dispose();}
});

test('R33 fitted hanging survives actual loader success, unload, failure and re-entry without duplicated cores or navigation',async()=>{
  // Registry retains bundler-era JSON imports without attributes; the hook only
  // makes those JSON imports executable under Node, and does not replace code.
  const {registerHooks}=await import('node:module');
  const hooks=registerHooks({load(url,context,next){if(url.endsWith('.json'))return {format:'module',source:`export default ${fs.readFileSync(new URL(url),'utf8')}`,shortCircuit:true};return next(url,context);}});
  const {InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js');
  const {CollisionManager}=await import('../src/utils/Collision.js');
  const {builder,group}=currentHall(),scene=new THREE.Scene(),cm=new CollisionManager();
  cm.addColliders(builder.colliders,'permanent');cm.addWalkables(builder.walkables,'permanent');
  cm.addWalkable({type:'box',box:new THREE.Box3(new THREE.Vector3(-31.5,P.frame.floorY,-18.5),new THREE.Vector3(31.5,P.frame.floorY,18.5))},'floor');
  scene.add(group);const loader=new InteriorLoader(scene,cm,{registry:{taihe:cfg}});
  const fallback=meshes(group).filter(m=>m.userData.taiheCoreOwner);
  const navigation=()=>JSON.stringify({colliders:cm.colliders.map(c=>c.box),walkables:cm.walkables});
  const before=navigation();
  const visible=loaded=>{assert.ok(fallback.every(m=>m.visible===!loaded));assert.equal(loader.getGroup('taihe')?.visible??false,loaded);assert.equal(navigation(),before);};
  try{
    for(let i=0;i<2;i++){
      const root=await decode(bytes);loader.gltf.load=(_url,ok)=>ok({scene:root});
      assert.equal(await loader.load('taihe'),true);visible(true);
      const box=plaqueBounds(loader.getGroup('taihe'),P.frame.floorY);near(box.max.z,P.plaque.z+.08);
      loader.unload('taihe');visible(false);
    }
    const invalid=await decode(bytes);invalid.getObjectByName('TAIHE_CORE_CONTRACT').userData.hangingFitDeltaZ=0;
    loader.gltf.load=(_url,ok)=>ok({scene:invalid});
    const warn=console.warn;console.warn=()=>{};
    try{assert.equal(await loader.load('taihe'),false);}finally{console.warn=warn;}
    visible(false);loader.unload('taihe');
    let ready;loader.gltf.load=(_url,ok)=>{ready=ok;};
    const pending=loader.load('taihe');loader.unload('taihe');ready({scene:await decode(bytes)});
    assert.equal(await pending,false);visible(false);
    const root=await decode(bytes);loader.gltf.load=(_url,ok)=>ok({scene:root});
    assert.equal(await loader.load('taihe'),true);visible(true);
  }finally{loader.dispose();builder.dispose();hooks.deregister();}
});
