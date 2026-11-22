import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PLAYER} from '../../src/config/constants.js';
import {fixture,nodes,physical,roles} from '../lib/r58-court-facade-fixture.mjs';

const rawPhysics=kit=>JSON.stringify(physical(kit));
function actualGate(extra={},capture=()=>{}) {
  let before;
  const f=fixture('longzong',extra,null,kit=>{
    const mapRect=kit.mapRect.bind(kit);
    kit.mapRect=(host,...args)=>{
      const result=mapRect(host,...args);
      before=rawPhysics(kit);
      capture(host);
      return result;
    };
  });
  assert.equal(typeof before,'string','actual pre-clip observation');
  assert.equal(rawPhysics(f.kit),before,'platform render change cannot alter physical rows');
  return {...f,before};
}
function close(f,merged) {
  f.cm.clear();
  f.kit.dispose(merged??f.kit.root);
  f.lib.dispose();
}

test('Current Longzong retains its anchored fitted entrance through door and plaque modes',()=>{
  for(const open of [true,false])for(const plaque of [true,false]){
    const f=actualGate({open,plaque});
    try{
      assert.equal(f.g.facing,'west');
      assert.equal(f.frame.rotation.y,3*Math.PI/2);
      assert.equal(f.frame.userData.structure.openState,open?'playable-open':'closed');
      const fitted=nodes(f.frame).filter(x=>x.userData.longzongWindowLeaf);
      assert.equal(fitted.length,8);
      for(const bay of [0,4]){
        const siblings=fitted.filter(x=>x.userData.longzongWindowLeaf.bay===bay);
        assert.equal(siblings.length,4);
        for(const leaf of siblings)assert.equal(roles(leaf,'longzong-front-leaf-wood').length,14);
      }
      assert.equal(roles(f.frame,'gate-window-bar').length,36,'original rear window bars still belong to current gate');
      const forward=new THREE.Vector3(0,0,1).transformDirection(f.frame.matrixWorld);
      for(const p of f.g.portals){
        const leaves=roles(f.frame,'gate-door-leaf').filter(x=>x.userData.bay===p.bay);
        assert.equal(leaves.length,2);
        assert.ok(leaves.every(x=>x.userData.open===open));
        const [x,z]=f.g.toWorld(p.centerX,f.g.doorZ);
        assert.equal(f.cm.checkCollision(new THREE.Vector3(x,f.g.platformY+PLAYER.HEIGHT,z),.5),!open);
        for(const sign of [-1,1]){
          const origin=new THREE.Vector3(p.centerX+sign*p.clearWidth*.24,f.g.platformY+PLAYER.HEIGHT,f.g.doorZ-1.7).applyMatrix4(f.frame.matrixWorld);
          assert.equal(new THREE.Raycaster(origin,forward,0,3.4).intersectObjects(leaves,true).length>0,!open,'both individual leaf positions visibly close');
        }
      }
      assert.equal(f.kit.plaques.length,plaque?1:0);
      if(plaque){
        const record=f.kit.plaques[0];
        assert.equal(record.text,'隆宗门');
        assert.equal(record.mesh.parent,f.frame);assert.equal(record.frame.parent,f.frame);
        f.kit.buildPlaqueAtlas();
        assert.ok(record.mesh.material?.map?.isCanvasTexture && f.kit.owned.includes(record.mesh.material));
        assert.equal(rawPhysics(f.kit),f.before);
      }
    } finally {close(f);}
  }
  const generic=actualGate({x:37.25,z:-62.75,rot:'east',open:true,plaque:true});
  try{
    assert.equal(generic.frame.userData.longzongHallFrontFit,undefined);
    assert.equal(roles(generic.frame,'longzong-front-leaf-wood').length,0);
    assert.equal(roles(generic.frame,'gate-window-bar').length,72,'source-bound fit cannot leak to the relocated gate');
  } finally {close(generic);}
});

function box(mesh) {
  mesh.updateMatrix();
  mesh.geometry.computeBoundingBox();
  return mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrix);
}
function submittedFaces(mesh) {
  const g=mesh.geometry,p=g.attributes.position,ix=g.index;
  return Array.from({length:(ix?.count??p.count)/3},(_,i)=>new THREE.Triangle(...[0,1,2].map(k=>
    new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i*3+k):i*3+k).applyMatrix4(mesh.matrix))));
}
const axes=['x','y','z'];
const sides=['x','z'];
const eps=1e-5;
test('Current Longzong paving owns the approved clipped seam before and after material merge',()=>{
  let before;
  const f=actualGate({open:true,plaque:true},host=>{
    const bases=roles(host,'gate-platform'),caps=roles(host,'gate-platform-paving');
    assert.equal(bases.length,1);assert.equal(caps.length,1);
    const [base]=bases,[cap]=caps;
    before={base,cap,domain:box(base),cover:box(cap),faces:submittedFaces(base).length,
      buffers:Object.fromEntries(Object.entries(base.geometry.attributes).map(([k,a])=>[k,a.array.slice()]))};
  });
  let merged;
  try{
    const {base,cap,domain,cover}=before;
    const cut=cover.min.y;
    assert.equal(before.faces,12,'observed former complete masonry box before both render edits');
    for(const axis of sides){
      assert.equal(domain.min[axis],cover.min[axis]);assert.equal(domain.max[axis],cover.max[axis]);
    }
    assert.ok(Math.abs(domain.max.y-cover.max.y)<eps);
    const dimensions=domain.getSize(new THREE.Vector3());
    const retained=submittedFaces(base),areas=new Map();
    assert.equal(retained.length,14,'authorized side split creates two net render triangles');
    for(const face of retained){
      const n=face.getNormal(new THREE.Vector3());
      const axis=axes.find(k=>Math.abs(n[k])>1-1e-7),sign=n[axis]>0?1:-1;
      assert.ok(axis && !(axis==='y'&&sign===1),'masonry no longer owns upward surface');
      const plane=domain[sign>0?'max':'min'][axis];
      for(const v of [face.a,face.b,face.c]){
        assert.ok(Math.abs(v[axis]-plane)<eps);
        assert.ok(v.y<=cut+eps && v.y>=domain.min.y-eps);
      }
      const key=axis+sign;
      areas.set(key,(areas.get(key)??0)+face.getArea());
    }
    assert.equal(areas.size,5);
    for(const [key,area] of [
      ['x1',dimensions.z*(cut-domain.min.y)],['x-1',dimensions.z*(cut-domain.min.y)],
      ['z1',dimensions.x*(cut-domain.min.y)],['z-1',dimensions.x*(cut-domain.min.y)],['y-1',dimensions.x*dimensions.z],
    ])assert.ok(Math.abs(areas.get(key)-area)<eps,key+' complete exposed surface area');
    for(const [name,array] of Object.entries(before.buffers))assert.deepEqual(base.geometry.attributes[name].array.slice(0,array.length),array);
    assert.equal(submittedFaces(cap).filter(t=>t.getNormal(new THREE.Vector3()).y>1-1e-7).length,2);
    const witnesses=[];
    for(const axis of sides)for(const sign of [-1,1]){
      const point=cover.getCenter(new THREE.Vector3());
      point[axis]=cover[sign>0?'max':'min'][axis];
      point.applyMatrix4(f.frame.matrixWorld);
      const normal=new THREE.Vector3();normal[axis]=sign;normal.transformDirection(f.frame.matrixWorld);
      witnesses.push({point,normal});
    }
    const baseMaterial=base.material,capMaterial=cap.material;
    const assertSeam=(parts,isMerged)=>{
      for(const witness of witnesses){
        const {normal}=witness,p=witness.point.clone();
        if(isMerged){const axis=sides.find(k=>Math.abs(normal[k])>1-1e-7);p[axis]=Math.fround(p[axis]);}
        const points=new THREE.Raycaster(p.clone().addScaledVector(normal,1.7),normal.clone().negate(),0,2)
          .intersectObjects(parts,true).filter(h=>h.point.distanceTo(p)<eps);
        assert.ok(points.some(h=>h.object.material===capMaterial),'actual original cap remains at seam');
        assert.ok(!points.some(h=>h.object.material===baseMaterial),'covered coincident masonry cannot win at seam');
      }
    };
    assertSeam([base,cap],false);
    merged=f.kit.finish();merged.updateMatrixWorld(true);
    assertSeam([merged],true);
    assert.equal(rawPhysics(f.kit),f.before,'final batching retains actual physical descriptors');
  } finally {close(f,merged);}
});
