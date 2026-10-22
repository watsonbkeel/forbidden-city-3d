import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {buildWuyingObservedCases} from '../src/scene/palace/special/WuyingObservedCases.js';
const baseline=JSON.parse(readFileSync(new URL('../reports/r52-wuying-forms/before-fingerprints.json',import.meta.url)));
const keys=['d111','d112','59','61'];
function fixture(){
 const kit={owned:[],ownedTextures:[],colliders:[],col(...v){this.colliders.push(v.slice(1));}};
 const materials=Object.fromEntries(['frame','glass','light','plinth','paper'].map(k=>[k,new THREE.MeshStandardMaterial({name:k,color:k==='plinth'?0xe8e4dc:0x777777})]));
 const root=new THREE.Group();for(const part of['front','rear'])buildWuyingObservedCases(kit,root,{part,ph:0,exhibit:{designSource:'isolated-unchanged-case-fixture'}},materials);root.updateMatrixWorld(true);
 return{kit,root,cases:root.children.filter(n=>n.userData.role==='wuying-independent-case')};
}
const find=(cases,key)=>cases.find(c=>c.userData.scene===`scene_${key}`);
const form=c=>c.children.find(n=>n.userData.role==='wuying-ceramic-form');
const byRole=(c,role)=>c.children.filter(n=>n.userData.role===role);
function fingerprint(c){
 const geometry=g=>({type:g.type,parameters:g.parameters,attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,array:Array.from(a.array)}])),index:g.index?Array.from(g.index.array):null});
 const material=m=>({name:m.name,color:m.color.toArray(),roughness:m.roughness,map:m.map?{name:m.map.name,data:Array.from(m.map.image.data),width:m.map.image.width,height:m.map.image.height}:null});
 const row={transform:c.matrix.toArray(),meta:c.userData,parts:c.children.filter(n=>n.isMesh).map(n=>({role:n.userData.role,meta:n.userData,transform:n.matrix.toArray(),geometry:geometry(n.geometry),material:material(n.material)}))};
 return createHash('sha256').update(JSON.stringify(row)).digest('hex');
}
test('R52 refines exactly four source-mapped forms, without claiming identity, measured size or reverse decoration',()=>{
 const{cases}=fixture();assert.equal(cases.length,16);
 for(const key of keys){const c=find(cases,key),f=form(c);assert.equal(f.userData.refinement,'R52_FRONT_PHOTO_FORM');assert.equal(f.userData.objectIdentity,null);assert.equal(f.userData.dimensionStatus,'VISUAL_FIT_NOT_MEASURED');assert.equal(f.userData.photographyDate,null);assert.equal(f.userData.actualPeriod,'2021_OPENING_PANORAMA_NOT_2026_INVENTORY');assert.equal(f.userData.source,c.userData.source);assert.equal(f.userData.unseenSurfacePolicy,'NEUTRAL_NO_INVENTED_REVERSE_DECORATION');assert.ok(f.userData.formParameters.profile.length>15);assert.ok(f.userData.supportedFeatures.length);assert.ok(f.userData.fittedFeatures.length);assert.ok(f.userData.unknownFeatures.includes('rear ornament'));assert.equal(f.material.map,null,'no invented photo texture');}
});
test('the d111 crown is open and individually articulated, not the prior closed conical stack',()=>{
 const{cases}=fixture(),c=find(cases,'d111'),f=form(c),p=f.geometry.parameters.points;
 assert.ok(p.some(v=>v.y>.5&&v.x>.065),'open top ring needs a real nonzero-radius lip');
 const relief=byRole(c,'observed-crown-relief');assert.ok(relief.length>=5);assert.equal(new Set(relief.map(n=>JSON.stringify(n.geometry.attributes.position.array))).size,relief.length,'crown parts must have individual forms');
 for(const r of relief){assert.ok(r.position.z<0);assert.equal(r.userData.surfaceEvidence,'VISIBLE_FRONT_RELIEF_SIMPLIFIED_NOT_EXACT_SCULPTURE');}
 const hits=new THREE.Raycaster(f.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.8,0)),new THREE.Vector3(0,-1,0),0,1).intersectObject(f,false);assert.ok(hits.length);assert.ok(hits[0].point.y<1.025+.54*.75,'top must not be capped by a conical apex');
});
test('the d112 fitted mouth, pedestal and front layered relief are distinct from d111',()=>{
 const{cases}=fixture(),c=find(cases,'d112'),f=form(c),p=f.geometry.parameters.points;
 assert.ok(p.some(v=>v.y>.73&&v.x>.09),'mouth must flare beyond the narrow neck');
 assert.ok(p.some(v=>v.y<.08&&v.x>.10),'base must flare beneath pedestal');
 assert.ok(byRole(c,'observed-layered-shoulder').length>=9);assert.ok(byRole(c,'observed-neck-collar').length>=2);
 for(const r of byRole(c,'observed-layered-shoulder')){r.geometry.computeBoundingBox();assert.ok(r.geometry.boundingBox.max.z<.001,'front-only relief must not invent rear ornaments');}
 assert.notDeepEqual(f.geometry.parameters.points,form(find(cases,'d111')).geometry.parameters.points);
});
test('59 has outward-rising non-torus handles and three fitted bulbous feet that touch the original support plane',()=>{
 const{cases}=fixture(),c=find(cases,'59'),f=form(c),ears=byRole(c,'observed-vessel-ear'),legs=byRole(c,'observed-tripod-leg');
 assert.equal(ears.length,2);assert.equal(legs.length,3);
 for(const ear of ears){assert.notEqual(ear.geometry.type,'TorusGeometry');const b=new THREE.Box3().setFromObject(ear);assert.ok(b.max.y>1.025+.59*.92);assert.ok(b.max.y-b.min.y>.59*.20);}
 for(const leg of legs){assert.equal(leg.geometry.type,'LatheGeometry');const b=new THREE.Box3().setFromObject(leg);assert.ok(Math.abs(b.min.y-1.025)<1e-6,'foot retains original contact plane');const origin=leg.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.002,0));const join=new THREE.Raycaster(origin,new THREE.Vector3(0,1,0),0,.5).intersectObject(f,false);assert.ok(join.length&&join[0].point.y<b.max.y-.005,'each actual foot must overlap the belly, not float below it');}
 const origin=f.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.8,0));const hit=new THREE.Raycaster(origin,new THREE.Vector3(0,-1,0),0,.9).intersectObject(f,false);assert.ok(hit.length);assert.ok(hit[0].point.y<1.025+.59*.5,'actual hollow mouth');
});
test('61 has a separate low-domed fitted lid and bulb finial, not a sharp generic conical top',()=>{
 const{cases}=fixture(),c=find(cases,'61');assert.equal(byRole(c,'observed-vessel-lid').length,1);assert.equal(byRole(c,'observed-lid-finial').length,1);
 const lid=byRole(c,'observed-vessel-lid')[0],finial=byRole(c,'observed-lid-finial')[0];assert.equal(lid.geometry.type,'LatheGeometry');assert.equal(finial.geometry.type,'LatheGeometry');
 const lb=new THREE.Box3().setFromObject(lid),fb=new THREE.Box3().setFromObject(finial);assert.ok(lb.max.x-lb.min.x>(lb.max.y-lb.min.y)*3);assert.ok(fb.min.y<=lb.max.y+.001);assert.ok(fb.max.y>lb.max.y);
});
test('R52 preserves exact R37 d102/60, the other ten complete cases, and all sixteen case collisions',()=>{
 const{cases,kit}=fixture();let preserved=0;for(const c of cases){const key=c.userData.scene.replace('scene_','');if(keys.includes(key))continue;assert.equal(fingerprint(c),baseline.cases[key],key);preserved++;}assert.equal(preserved,12);assert.deepEqual(kit.colliders,baseline.colliders);
});
test('all new geometry has finite position/normal/uv values, fits its old case and stays within a small triangle budget',()=>{
 const{cases,kit}=fixture();let tris=0;
 for(const key of keys){const c=find(cases,key);for(const n of c.children.filter(n=>n.isMesh&&(n.userData.refinement==='R52_FRONT_PHOTO_FORM'||['wuying-ceramic-form','observed-vessel-ear','observed-tripod-leg'].includes(n.userData.role)))){for(const a of Object.values(n.geometry.attributes))assert.ok(Array.from(a.array).every(Number.isFinite));n.geometry.computeBoundingBox();n.updateMatrix();const b=n.geometry.boundingBox.clone().applyMatrix4(n.matrix);assert.ok(b.min.x>-.49&&b.max.x<.49&&b.min.z>-.49&&b.max.z<.49,key);assert.ok(b.min.y>1.0249&&b.max.y<2,key);tris+=(n.geometry.index?.count??n.geometry.attributes.position.count)/3;assert.ok(kit.owned.includes(n.material),'private material must remain disposal-owned');}}
 assert.ok(tris<22000,`four-object triangle budget: ${tris}`);
});

// Performance successor: preserve the reviewed f8dd0ea forms, not a new design.
test('four reviewed forms keep every fitting parameter and real part under the 9000 triangle integration allocation',()=>{
 const high=JSON.parse(readFileSync(new URL('../reports/r52-wuying-forms/performance-successor/high-detail-contracts.json',import.meta.url)));
 const{cases}=fixture();let triangles=0;
 for(const key of keys){const c=find(cases,key),f=form(c),parts=c.children.filter(n=>n.isMesh&&(n.userData.refinement==='R52_FRONT_PHOTO_FORM'||['wuying-ceramic-form','observed-vessel-ear','observed-tripod-leg'].includes(n.userData.role)));
  assert.deepEqual(f.userData.formParameters,high[key].parameters,`${key}: numeric source fit must be unchanged`);assert.deepEqual(parts.map(n=>n.userData.role),high[key].roles,`${key}: no actual front/rear/inner component may be removed`);
  triangles+=parts.reduce((n,p)=>n+(p.geometry.index?.count??p.geometry.attributes.position.count)/3,0);
 }assert.ok(triangles<=9000,`A integration allocation 9000, actual ${triangles}`);
});

test('the optimized d112 mouth still has an inner wall and a deep closed floor',()=>{
 const{cases}=fixture(),f=form(find(cases,'d112')),origin=f.getWorldPosition(new THREE.Vector3());
 const down=new THREE.Raycaster(origin.clone().add(new THREE.Vector3(0,.8,0)),new THREE.Vector3(0,-1,0),0,1).intersectObject(f,false);
 assert.ok(down.length);assert.ok(down[0].point.y-origin.y>.05&&down[0].point.y-origin.y<.3,'not an erased floor or an opaque mouth cap');
 const side=new THREE.Raycaster(origin.clone().add(new THREE.Vector3(0,.69,0)),new THREE.Vector3(1,0,0),0,.2).intersectObject(f,false);assert.ok(side.length&&side[0].point.x-origin.x>.04,'inner mouth wall is physically present');
});
