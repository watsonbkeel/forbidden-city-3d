import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture,meshes,roles} from '../lib/r58-court-facade-fixture.mjs';
import {buildSurveyedPavilion} from '../../src/scene/palace/special/SurveyedPavilion.js';
import {prunePavilionCoveredFaces} from '../../src/render/PavilionRenderGeometry.js';

const draw=g=>Array.from(g.index?.array??Array.from({length:g.attributes.position.count},(_,i)=>i));
// Independently classify area from the raw position and submitted triangle
// indices; no render report or product pruning procedure is used to do this.
function zeroAreaOffsets(g){
  const points=g.attributes.position, ids=draw(g), result=[];
  const shape=new THREE.Triangle();
  for(let i=0;i<ids.length;i+=3){
    shape.a.fromBufferAttribute(points,ids[i]);
    shape.b.fromBufferAttribute(points,ids[i+1]);
    shape.c.fromBufferAttribute(points,ids[i+2]);
    const area=shape.getArea();
    if(area<5e-10)result.push([i/3,area,ids.slice(i,i+3),shape.a.equals(shape.b)||shape.a.equals(shape.c)||shape.b.equals(shape.c)]);
  }
  return result;
}
function bars(groups, role, count) {
  for(const group of groups){
    const parts=roles(group,role);
    assert.equal(parts.length,count,role+' per actual leaf');
    assert.ok(parts.every(m=>m.isMesh && m.visible && draw(m.geometry).length>0),role+' remains submitted, not just tagged');
  }
}

test('Current Hongyi removes only covered registered faces and keeps every upper and paired-window bar',t=>{
  const sources=new Map(),boxes=new Set(),attached=new Set();
  let f,reference,actualReport;
  try{
    // Own anchored Hongyi, with the same plaque-off/entry-open renderer scope
    // as the original test, not a mirrored Tiren or archived product.
    f=fixture('hongyi',{enter:true,plaque:false},(kit,opts)=>{
      assert.equal(opts.sideGalleryConnections,undefined,'this guard is restricted to the freestanding pavilion');
      const result=buildSurveyedPavilion(kit,opts);actualReport=result.renderGeometry;return result;
    },kit=>{
      for(const method of ['mesh','box','roof']){
        const original=kit[method].bind(kit);
        kit[method]=(...args)=>{
          const object=original(...args);
          if(method==='box')boxes.add(object);
          object.traverse(mesh=>{
            if(!mesh.isMesh)return;
            sources.get(mesh)?.dispose();
            sources.set(mesh,mesh.geometry.clone());
          });
          return object;
        };
      }
    });
    assert.equal(f.g.profile,'hongyi');assert.equal(f.g.facing,'east');
    const current=meshes(f.frame);
    reference=f.frame.clone(true);
    const prior=meshes(reference);
    assert.equal(current.length,prior.length);
    const detached=new Map();
    for(const [i,mesh] of current.entries()){
      const raw=sources.get(mesh);
      assert.ok(raw,'an actual current source capture is required for every mesh');
      prior[i].geometry=raw;attached.add(raw);detached.set(mesh,prior[i]);
    }
    const realBoxes=[...boxes].map(m=>detached.get(m));
    assert.ok(realBoxes.length>0 && realBoxes.every(Boolean),'every explicit current solid maps into the detached tree');
    let rawDegenerate=0;
    for (const [i,m] of prior.entries()) {
      const rawZero=zeroAreaOffsets(m.geometry);
      if(rawZero.length) {
        // The shared hip-roof generator collapses its triangular side patches
        // to the ridge endpoints. Only actual coincident-vertex triangles there
        // are allowed before pruning; a resolved tessellation with none is fine.
        assert.equal(m.parent.userData.role,'upper-hip-roof');
        assert.equal(m.name,'roof_wudian_roof_tile_material');
        assert.ok(rawZero.every(([,area,,repeated])=>area===0 && repeated),'only collapsed roof triangles may be in the source');
      }
      assert.deepEqual(zeroAreaOffsets(current[i].geometry),[],m.name+' submits no degenerate triangle');
      rawDegenerate+=rawZero.length;
    }
    const expected=prunePavilionCoveredFaces(reference,realBoxes);
    assert.equal(expected.degenerateTriangles,rawDegenerate,'independently measured raw zero-area geometry');
    assert.equal(expected.removedTriangles,expected.coveredTriangles+rawDegenerate);
    assert.ok(expected.coveredTriangles>0);
    assert.deepEqual(actualReport,expected,'moderate current reduction comes only from these actual registered volumes');
    assert.equal(current.reduce((sum,m)=>sum+draw(m.geometry).length/3,0),expected.retainedTriangles);
    for(const [i,mesh] of current.entries()){
      const live=mesh.geometry,checked=prior[i].geometry;
      assert.deepEqual(draw(live),draw(checked),mesh.name+' ordered source triangle indices');
      assert.deepEqual(Object.keys(live.attributes),Object.keys(checked.attributes));
      for(const [name,attribute] of Object.entries(checked.attributes)){
        const got=live.attributes[name];
        assert.equal(got.itemSize,attribute.itemSize);assert.equal(got.normalized,attribute.normalized);
        assert.deepEqual(got.array,attribute.array,mesh.name+' retains all '+name+' source values');
      }
    }
    const upper=roles(f.frame,'upper-lattice-leaf'),lower=roles(f.frame,'lower-window-leaf');
    assert.equal(upper.length,28);
    assert.equal(lower.length,12);
    for(const window of roles(f.frame,'lower-window'))assert.equal(roles(window,'lower-window-leaf').length,2);
    assert.equal(roles(f.frame,'lower-window').length,6);
    bars(upper,'upper-lattice-bar',6);
    bars(lower,'lower-window-leaf-bar',6);
    bars(lower,'lower-window-leaf-crossbar',6);
    assert.equal(roles(f.frame,'lower-window-bar').length,0,'do not resurrect the deliberate pre-pairing grille');
    assert.equal(f.frame.userData.pavilion.balcony.supports,24);
    t.diagnostic('current source/covered/raw-degenerate/submitted: '+[expected.sourceTriangles,expected.coveredTriangles,rawDegenerate,expected.retainedTriangles].join('/'));
  }finally{
    if(reference)for(const g of new Set(meshes(reference).map(m=>m.geometry)))g.dispose();
    for(const g of sources.values())if(!attached.has(g))g.dispose();
    if(f){f.cm.clear();f.kit.dispose(f.kit.root);f.lib.dispose();}
  }
});
