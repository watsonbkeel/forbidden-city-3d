import test from 'node:test';
import assert from 'node:assert/strict';
import {captureGate} from '../../lib/gate-tower-fixture.mjs';
import {triangleBodyIntersects} from '../../../src/utils/TriangleSupport.js';
import {buildWumenLowerBase} from '../../../src/scene/palace/special/WumenLowerBase.js';
import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';
import {CollisionManager} from '../../../src/utils/Collision.js';
import {realTextureLibrary} from '../../lib/r48-real-texture-library.mjs';

function meshGaps(c,{axis='x',from,to,step=.1,origin,direction}){
 const T=c.THREE,ray=new T.Raycaster(),out=[];let start=null;
 c.group.updateMatrixWorld(true);
 for(let a=from;a<=to+1e-8;a+=step){
  const p=new T.Vector3(...origin);p[axis]=a;
  ray.set(p,new T.Vector3(...direction));ray.far=.35;
  const hit=ray.intersectObject(c.group,true).some(h=>h.distance<.35);
  if(!hit&&start===null)start=a;
  if((hit||a>=to-1e-8)&&start!==null){if(a-start>=1)out.push([start,a-step]);start=null;}
 }
 return out;
}

// Own official north oblique shows five masonry openings, independent of
// visitor access policy. This samples only the entrance lip, not an assumed
// straight north/south tunnel or a guessed side-mouth coordinate.
test('Actual Wumen north masonry has five distinct low entrance openings',()=>{
 const {THREE:T,group,builder,data}=captureGate();
 try {
  group.updateMatrixWorld(true);
  const ray=new T.Raycaster(),ranges=[];let start=null;
  // captureGate deliberately intercepts finish before its world translation;
  // the visible group is local, unlike builder.colliders which are world-space.
  const half=data.dimensions.platformWidth/2,z=data.dimensions.platformNorth+.05;
  for(let x=-half+.25;x<half;x+=.25){
   ray.set(new T.Vector3(x,1.5,z),new T.Vector3(0,0,-1));ray.far=.35;
   const blocked=ray.intersectObject(group,true).some(h=>h.distance<.35);
   if(!blocked&&start===null)start=x;
   if(blocked&&start!==null){if(x-start>=1)ranges.push([start,x-.25]);start=null;}
  }
  assert.equal(ranges.length,5,'Own north photo has five mouths; actual mesh entrance gaps='+JSON.stringify(ranges));
 } finally {builder.dispose();}
});

test('South front retains three distinct mouths with source-bounded centre width and side spacing',()=>{
 const c=captureGate();try{
  const gaps=meshGaps(c,{from:-39,to:39,origin:[0,1.5,-13.55],direction:[0,0,1]});
  assert.equal(gaps.length,3,JSON.stringify(gaps));
  const centreWidth=gaps[1][1]-gaps[1][0],axes=gaps.map(([a,b])=>(a+b)/2);
  assert.ok(centreWidth>=5&&centreWidth<=6,'Own south/north sources do not support inherited9m centre mouth: '+centreWidth);
  for(const i of[0,2])assert.ok(Math.abs(axes[i])>=14&&Math.abs(axes[i])<=15,'Straight channel engineering compromise must not keep inherited±17.5: '+axes[i]);
 }finally{c.builder.dispose();}
});

test('Each hidden lateral portal has a real mutually-facing wing-wall mouth near the inner north corner',()=>{
 const c=captureGate();try{for(const side of[-1,1]){
  const gaps=meshGaps(c,{axis:'z',from:-30,to:-13.45,origin:[side*40.35,1.5,0],direction:[side,0,0]});
  assert.equal(gaps.length,1,'Side mouth must cut actual wing masonry, not a north/south front hole: '+JSON.stringify({side,gaps}));
  assert.ok(gaps[0][1]<-13.3&&gaps[0][0]>-23,'Explicit near-corner engineering family, not measured location');
 }}finally{c.builder.dispose();}
});

test('Real retained12.3m ascent landing can enter the top slab without Float32 world-bake lip',()=>{
 const c=captureGate();try{
  const owner=c.builder.colliders.find(b=>b.wumenLowerSlab==='axis/wumen-lower/main-top');assert.ok(owner);assert.equal(owner.min.y,12);assert.equal(owner.max.y,12.3);
  for(const side of[-1,1]){const body=new c.THREE.Box3(new c.THREE.Vector3(side*60.1-.5,12.3+1e-8,-420.1),new c.THREE.Vector3(side*60.1+.5,14,-419.1));assert.equal(owner.intersectsBox(body),false,'unchanged ascent floor must not catch a quantized slab side');}
 }finally{c.builder.dispose();}
});

test('Five portals own distinct identities and open/closed physical leaves rather than hidden base blockers',()=>{
 const c=captureGate();try{for(const open of[true,false]){
  const b=new PalaceBuilder(new c.THREE.Scene(),c.lib);let root;b.finish=g=>{root=g;g.updateMatrixWorld(true);return g;};
  try{b.buildGate({...c.data,lowerDoorsOpen:open});const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.colliders);cm.addWalkables(b.walkables);const ids=[];root.traverse(m=>{if(m.userData.structure?.id?.startsWith('axis/wumen-lower/')&&m.userData.structure.kind)ids.push(m.userData.structure.id);});assert.equal(new Set(ids).size,5);
   for(const[x,z]of[[-14.5,-12.3],[0,-12.3],[14.5,-12.3],[-40.6,-16.5],[40.6,-16.5]])assert.equal(cm.checkCollision(new c.THREE.Vector3(x,1.7,z-419.6),.3),!open,JSON.stringify({open,x,z}));
  }finally{b.dispose();}
 }}finally{c.builder.dispose();}
});

test('Duplicate lower-base installation rejects before allocation',()=>{
 const c=captureGate();try{const before=[c.group.children.length,c.builder.colliders.length,c.builder.ownedMaterials.length];assert.throws(()=>buildWumenLowerBase(c.builder,c.group,c.data),/already|duplicate/i);assert.deepEqual([c.group.children.length,c.builder.colliders.length,c.builder.ownedMaterials.length],before);}finally{c.builder.dispose();}
});

test('Retained exterior and inner-wing base band keeps its original0.1m visible projection',()=>{
 const c=captureGate();try{for(const side of[-1,1]){
  const outer=new c.THREE.Raycaster(new c.THREE.Vector3(side*61,.6,0),new c.THREE.Vector3(-side,0,0),0,2).intersectObject(c.group,true)[0];assert.ok(outer);assert.ok(Math.abs(Math.abs(outer.point.x)-60.1)<1e-4);
  const inner=new c.THREE.Raycaster(new c.THREE.Vector3(side*40,.6,-40),new c.THREE.Vector3(side,0,0),0,2).intersectObject(c.group,true)[0];assert.ok(inner);assert.ok(Math.abs(Math.abs(inner.point.x)-40.5)<1e-4);
 }}finally{c.builder.dispose();}
});

test('New portal solids and three protective canopies retain architectural shadow flags',()=>{
 const c=captureGate();try{let n=0;c.group.traverse(m=>{if(['north-arched-cap','north-arched-lining','door-solid','south-protective-canopy'].includes(m.userData.wumenLowerPart)){n++;assert.equal(m.castShadow,true);assert.equal(m.receiveShadow,true);}});assert.equal(n,23);}finally{c.builder.dispose();}
});

test('Actual production material merge releases each owned geometry/material once and preserves borrowed library material',()=>{
 const c=captureGate(),lib=realTextureLibrary(),scene=new c.THREE.Scene(),b=new PalaceBuilder(scene,lib),counts=new Map();
 const watch=o=>{if(counts.has(o))return;counts.set(o,0);o.addEventListener('dispose',()=>counts.set(o,counts.get(o)+1));};
 let borrowedDisposals=0;lib.material('wall_red').addEventListener('dispose',()=>borrowedDisposals++);
 b.finish=g=>{g.traverse(m=>{if(m.geometry)watch(m.geometry);});for(const m of b.ownedMaterials)watch(m);const result=PalaceBuilder.prototype.finish.call(b,g);result.traverse(m=>{if(m.geometry)watch(m.geometry);});return result;};
 try{b.buildGate(c.data);b.dispose();assert.equal(borrowedDisposals,0);assert.ok(counts.size>50);for(const[o,n]of counts)assert.equal(n,1,o.type+' '+o.name);}
 finally{b.dispose();lib.dispose();c.builder.dispose();}
});

test('Retained band atlas uses its original full-height band mapping, not tiled box UVs',()=>{
 const c=captureGate();try{let n=0;c.group.traverse(m=>{if(!['base-band','retained-perimeter-band'].includes(m.userData.wumenLowerPart))return;const normal=m.geometry.attributes.normal,uv=m.geometry.attributes.uv;for(let i=0;i<uv.count;i++)if(Math.abs(normal.getY(i))<.5){n++;assert.ok(uv.getY(i)===0||uv.getY(i)===1,'band vertical atlas must occupy0..1');}});assert.ok(n>100);}finally{c.builder.dispose();}
});

test('Only the source-visible north neck vertical jambs receive brick lining, not the unknown deep tunnel',()=>{
 const c=captureGate();try{c.group.updateMatrixWorld(true);
  for(const[x,width]of[[-48,3.8],[-14.5,4.7],[0,5.4],[14.5,4.7],[48,3.8]])for(const side of[-1,1])for(const z of[18,16]){
   const hit=new c.THREE.Raycaster(new c.THREE.Vector3(x,2,z),new c.THREE.Vector3(side,0,0),0,width).intersectObject(c.group,true)[0];assert.ok(hit);
   const mat=Array.isArray(hit.object.material)?hit.object.material[hit.face.materialIndex]:hit.object.material;
   assert.equal(mat,c.lib.material(z===18?'wall_brick':'wall_red'),'bounded north-neck jamb material '+JSON.stringify({x,side,z}));
  }
 }finally{c.builder.dispose();}
});

test('Production material merge retains brick jamb faces and the unchanged five clear north apertures',()=>{
 const c=captureGate(),scene=new c.THREE.Scene(),b=new PalaceBuilder(scene,c.lib);
 try{b.buildGate(c.data);scene.updateMatrixWorld(true);
  for(const[x,width]of[[-48,3.8],[-14.5,4.7],[0,5.4],[14.5,4.7],[48,3.8]]){
   for(const side of[-1,1]){
    const hit=new c.THREE.Raycaster(new c.THREE.Vector3(x,2,18-419.6),new c.THREE.Vector3(side,0,0),0,width).intersectObject(scene,true)[0];assert.ok(hit);assert.equal(hit.object.material,c.lib.material('wall_brick'));assert.ok(Math.abs(hit.distance-width/2)<1e-4);
   }
   const ray=new c.THREE.Raycaster(new c.THREE.Vector3(x,1.5,18.7-419.6),new c.THREE.Vector3(0,0,-1),0,.35);assert.equal(ray.intersectObject(scene,true).length,0);
  }
 }finally{b.dispose();c.builder.dispose();}
});

test('North-neck split brick faces share one vertical atlas phase across the retained band height',()=>{
 const c=captureGate();try{let faces=0;const tile=c.lib.tileSize('wall_brick');c.group.traverse(m=>{if(m.userData.wumenLowerPart!=='north-vertical-jamb-lining')return;faces++;const p=m.geometry.attributes.position,uv=m.geometry.attributes.uv;for(let i=0;i<p.count;i++)assert.ok(Math.abs(uv.getY(i)-(p.getY(i)+m.position.y)/tile)<1e-5,'brick V must use one common object-space height rather than restart at each split');});assert.ok(faces>=10);}finally{c.builder.dispose();}
});

for(const open of[true,false])for(const anchor of[[0,-419.6],[73.25,80.875]])test(`All ten actual leaf bodies match render transforms and clear exterior probes: open=${open}, anchor=${anchor}`,()=>{
 const c=captureGate(),b=new PalaceBuilder(new c.THREE.Scene(),c.lib);let root;b.finish=g=>{root=g;g.updateMatrixWorld(true);return g;};
 try{b.buildGate({...c.data,position:{x:anchor[0],z:anchor[1]},lowerDoorsOpen:open});const leaves=[];root.traverse(m=>{if(m.userData.wumenLowerPart==='door-solid')leaves.push(m);});const owners=b.colliders.filter(o=>o.triangleSupport?.id.includes('/leaf/'));assert.equal(leaves.length,10);assert.equal(owners.length,10);const used=new Set();
  for(const leaf of leaves){const center=leaf.getWorldPosition(new c.THREE.Vector3()).add(new c.THREE.Vector3(anchor[0],0,anchor[1]));const near=new c.THREE.Box3().setFromCenterAndSize(center,new c.THREE.Vector3(.04,.04,.04));const matches=owners.filter(o=>triangleBodyIntersects(o.triangleSupport,near));assert.equal(matches.length,1);used.add(matches[0]);
   const expected=new c.THREE.Box3().setFromObject(leaf).translate(new c.THREE.Vector3(anchor[0],0,anchor[1]));assert.ok(expected.min.distanceTo(matches[0].min)<1e-6);assert.ok(expected.max.distanceTo(matches[0].max)<1e-6);
   for(const sign of[-1,1]){const outside=new c.THREE.Vector3(0,0,sign*.2).applyMatrix4(leaf.matrixWorld).add(new c.THREE.Vector3(anchor[0],0,anchor[1]));const probe=new c.THREE.Box3().setFromCenterAndSize(outside,new c.THREE.Vector3(.04,.04,.04));assert.equal(triangleBodyIntersects(matches[0].triangleSupport,probe),false,'own leaf proxy must not enlarge its physical thickness');}
  }assert.equal(used.size,10);
 }finally{b.dispose();c.builder.dispose();}
});

test('Retained three upper slabs keep the authored exact12.3 support datum without a competing quantized triangle floor',()=>{
 const c=captureGate();try{const cm=new CollisionManager();cm.rivers=[];cm.addColliders(c.builder.colliders);cm.addWalkables(c.builder.walkables);for(const[x,z]of[[0,0],[-50,-45],[50,-45]])assert.equal(cm.getGroundHeight(x,z-419.6,12.3,.6),12.3);}finally{c.builder.dispose();}
});

test('Three authored slab floors are real bounded non-rescue surfaces; original13 supports remain separately registered',()=>{
 const c=captureGate();try{const floors=c.builder.walkables.filter(w=>w.wumenLowerSlab);assert.equal(floors.length,3);assert.equal(c.builder.walkables.length,16);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(c.builder.colliders);cm.addWalkables(c.builder.walkables);
  for(const floor of floors){assert.equal(floor.rescue,false);const body=c.builder.colliders.find(b=>b.wumenLowerSlab===floor.wumenLowerSlab);assert.ok(body);assert.deepEqual([floor.box.min.x,floor.box.max.x,floor.box.min.z,floor.box.max.z],[body.min.x,body.max.x,body.min.z,body.max.z]);assert.equal(floor.box.min.y,body.max.y);const p=floor.box.getCenter(new c.THREE.Vector3());assert.equal(cm.getGroundHeight(p.x,p.z,0,.6),0,'never rescue a ground visitor onto12.3');}
  for(const x of[-50,50]){assert.equal(cm.getGroundHeight(x,-62.59-419.6,12.3,.6),12.3);assert.equal(cm.getGroundHeight(x,-62.61-419.6,12.3,.6),0,'no support beyond actual southern stone edge');}
 }finally{c.builder.dispose();}
});
