import test from 'node:test';
import assert from 'node:assert/strict';
import {captureRightLeaf} from '../../lib/wumen-right-leaf-fixture.mjs';
const faces=c=>{const out=[];c.group.traverse(o=>{if(o.userData.wumenSidePortalFace)out.push(o);});return out;};
test('actual Wumen production entry builds two independently identified eleven-panel side-portal finishes',()=>{
 const c=captureRightLeaf();try{
  const all=faces(c);assert.equal(all.length,2,'two real exterior groups, not a preview installer');
  assert.deepEqual(all.map(g=>g.userData.wumenSidePortalFace.portalId).sort(),['east-yemen','west-yemen']);
  for(const g of all){assert.equal(g.children.filter(o=>o.userData.portalFacePart==='yellow-panel').length,11);assert.equal(g.children.filter(o=>o.userData.portalFacePart==='stone-frame').length,4);assert.equal(g.children.filter(o=>o.userData.portalFacePart==='unreconstructed-inscription-field').length,1);}
  assert.equal(c.builder.colliders.length,452);assert.equal(c.builder.walkables.length,16);
 }finally{c.builder.dispose();}
});
import fs from 'node:fs';
import {retainedSignature,digest,verifyStudFace} from '../../lib/wumen-right-leaf-fixture.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-side-portal/before-db1.json',import.meta.url)));
test('both real leaf poses preserve every original recorded object and all 452 physical rows/16 supports',()=>{
 for(const open of [true,false]){const c=captureRightLeaf(open);try{
  const all=faces(c);assert.equal(all.length,2);verifyStudFace(c);
  const copy=c.group.clone(true),remove=[];copy.traverse(o=>{if(o.userData.wumenSidePortalFace)remove.push(o);});assert.equal(remove.length,2);for(const g of remove)g.removeFromParent();
  assert.equal(digest(retainedSignature({...c,group:copy})),digest(baseline[open?'open':'closed']));
  assert.equal(faces(c).length,2,'original actual scene remains installed');
 }finally{c.builder.dispose();}}
});
import {attachWumenSidePortalFaces} from '../../../src/scene/palace/special/WumenSidePortalFaces.js';
import {WUMEN_LOWER_PROFILE} from '../../../src/scene/palace/special/WumenLowerBase.js';
test('frozen host rejects before resource allocation or registration',()=>{
 const c=captureRightLeaf();try{const root=new c.THREE.Group();root.name='wumen-lower-five-portals';Object.freeze(root.children);const n=c.builder.ownedMaterials.length;
 assert.throws(()=>attachWumenSidePortalFaces(c.builder,root,WUMEN_LOWER_PROFILE));assert.equal(c.builder.ownedMaterials.length,n);assert.equal(root.children.length,0);
 }finally{c.builder.dispose();}
});
import {verifyPortalFaces,portalFaceGroups} from '../../lib/wumen-side-portal-fixture.mjs';
test('actual front finishes match all authored vertices/normal/UV, independent identities and courtyard wall planes',()=>{for(const open of [true,false]){const c=captureRightLeaf(open);try{assert.deepEqual(verifyPortalFaces(c),{groups:2,panels:22,frames:8,neutralFields:2,meshes:32});}finally{c.builder.dispose();}}});
test('face verifier rejects omitted/hidden/scaled/flipped/material/geometry and source identity mutations',()=>{
 for(const mutate of [
 (g)=>{g.visible=false;},(g)=>{g.parent.visible=false;},(g)=>{g.scale.x=2;},(g)=>{g.rotation.y*=-1;},(g)=>{g.position.x+=.02;},(g)=>{g.remove(g.children[0]);},(g)=>{g.children[0].visible=false;},(g)=>{g.children[0].scale.x*=.9;},(g)=>{g.children[0].material.transparent=true;g.children[0].material.opacity=0;},(g)=>{g.children[0].geometry.attributes.position.setX(0,0);},(g)=>{g.userData.wumenSidePortalFace.sourceImageSHA256='wrong';}
 ]){const c=captureRightLeaf();try{mutate(portalFaceGroups(c)[0]);assert.throws(()=>verifyPortalFaces(c));}finally{c.builder.dispose();}}
});
test('host add failure rolls back all newly owned resources and leaves the original host intact',()=>{
 const c=captureRightLeaf();try{const root=new c.THREE.Group();root.name='wumen-lower-five-portals';const keep=new c.THREE.Group();root.add(keep);const n=c.builder.ownedMaterials.length,add=root.add;root.add=function(...args){add.apply(this,args);throw Error('FAULT_ADD');};
 assert.throws(()=>attachWumenSidePortalFaces(c.builder,root,WUMEN_LOWER_PROFILE),/FAULT_ADD/);assert.equal(root.children.length,1);assert.equal(root.children[0],keep);assert.equal(c.builder.ownedMaterials.length,n);
 }finally{c.builder.dispose();}
});
test('real canonical finish retains all 384 new face triangles, two identities and the unchanged physical rows',async()=>{
 const {PalaceBuilder}=await import('../../../src/scene/PalaceBuilder.js'),{realTextureLibrary}=await import('../../lib/r48-real-texture-library.mjs');
 for(const open of [true,false]){const c=captureRightLeaf(open),lib=realTextureLibrary(),scene=new c.THREE.Scene(),b=new PalaceBuilder(scene,lib);try{
  verifyPortalFaces(c);b.buildGate({...c.data,lowerDoorsOpen:open});const root=scene.children.find(o=>o.name==='午门');assert(root);const targets=portalFaceGroups(c),materialNames=new Set(targets.flatMap(g=>g.children.map(m=>m.material.name)));let vertices=0;
  for(const name of materialNames){const matches=root.children.filter(m=>m.material?.name===name);assert.equal(matches.length,1);const actual=matches[0],expected=[];for(const g of targets)for(const m of g.children)if(m.material.name===name){const geo=m.geometry.toNonIndexed();geo.applyMatrix4(m.matrixWorld);expected.push(...geo.attributes.position.array);geo.dispose();}assert.deepEqual(Array.from(actual.geometry.attributes.position.array),expected);vertices+=actual.geometry.attributes.position.count;}
  assert.equal(vertices,32*12*3);for(const id of ['east-yemen','west-yemen'])assert.equal(root.userData.architecture.filter(o=>o.id===`axis/wumen-lower/${id}/exterior-front-finish`).length,1);
  assert.equal(digest(b.colliders),digest(c.builder.colliders));assert.equal(digest(b.walkables),digest(c.builder.walkables));
 }finally{b.dispose();lib.dispose();c.builder.dispose();}}
});
test('duplicate and invalid owners reject without allocation; detached fault retirement attempts all resources',()=>{
 const c=captureRightLeaf();try{const root=portalFaceGroups(c)[0].parent,n=c.builder.ownedMaterials.length,children=[...root.children];assert.throws(()=>attachWumenSidePortalFaces(c.builder,root,WUMEN_LOWER_PROFILE),/already/);assert.equal(c.builder.ownedMaterials.length,n);assert.deepEqual(root.children,children);
  const bad={...WUMEN_LOWER_PROFILE,lateral:WUMEN_LOWER_PROFILE.lateral.map(o=>({...o,sign:-o.sign}))},detached=new c.THREE.Group();detached.name='wumen-lower-five-portals';assert.throws(()=>attachWumenSidePortalFaces(c.builder,detached,bad));assert.equal(c.builder.ownedMaterials.length,n);
  let retired=0;const original=detached.add;detached.add=function(...groups){original.apply(this,groups);const resources=new Set(groups.flatMap(g=>g.children.flatMap(m=>[m.geometry,m.material])));assert.equal(resources.size,4);for(const r of resources)r.addEventListener('dispose',()=>{retired++;throw Error('FAULT_DISPOSE');});throw Error('FAULT_REGISTER');};let e;try{attachWumenSidePortalFaces(c.builder,detached,WUMEN_LOWER_PROFILE);}catch(err){e=err;}assert.equal(e.message,'FAULT_REGISTER');assert.equal(e.wumenPortalCleanupErrors.length,4);assert.equal(retired,4);assert.equal(detached.children.length,0);assert.equal(c.builder.ownedMaterials.length,n);
 }finally{c.builder.dispose();}
});
test('actual matrix and effective front material mutations are rejected rather than trusting local pose fields',()=>{
 for(const mutate of [
 g=>{const m=g.children[0];m.updateMatrix();m.matrixAutoUpdate=false;m.matrix.elements[12]+=.2;},
 g=>{g.children[0].material.side=1;},g=>{g.children[0].material.roughness=.1;},
 ]){const c=captureRightLeaf();try{verifyPortalFaces(c);mutate(portalFaceGroups(c)[0]);assert.throws(()=>verifyPortalFaces(c));}finally{c.builder.dispose();}}
});
test('comparison admission rejects invented target metadata or texture state before removing new owners',()=>{
 for(const mutate of [g=>{g.userData.wumenSidePortalFace.panelCountEvidence='SURVEYED';},g=>{g.userData.structure.extra='unregistered';},(g,c)=>{g.children[0].material.map=new c.THREE.Texture();}]){
  const c=captureRightLeaf();try{mutate(portalFaceGroups(c)[0],c);assert.throws(()=>verifyPortalFaces(c));}finally{c.builder.dispose();}
 }
});
