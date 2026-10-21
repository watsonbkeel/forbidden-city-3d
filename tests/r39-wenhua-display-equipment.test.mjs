import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library,hash} from './lib/inner-palace-fixture.mjs';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/r39-south-navigation-baseline.json',import.meta.url)));
const zone=id=>JSON.parse(readFileSync(new URL(`../data/zones/${id}.json`,import.meta.url)));
const nodes=(root,role)=>{const out=[];root.traverse(o=>{if(o.userData.role===role)out.push(o);});return out;};
function fixture(profile){const data=zone(profile.startsWith('wenhua')?'outer-east':'outer-west'),b=new ZoneBase(library(),data);b.buildHall(data.items.find(i=>i.southCourtProfile===profile));b.kit.root.updateMatrixWorld(true);return b;}

test('R39 Wenhua connector has two aisle-facing sloping boards, with fitted dimensions and dated provenance',()=>{
 const b=fixture('wenhua-connector'),boards=nodes(b.kit.root,'wenhua-scroll-support');
 assert.equal(boards.length,2);
 for(const board of boards){
  assert.ok(Math.abs(board.rotation.z)>.2&&Math.abs(board.rotation.z)<.7,'flat table is not the photographed inclined board');
  assert.equal(Math.sign(board.rotation.z),Math.sign(board.position.x),'outer edge rises, lower edge faces the central aisle');
  assert.equal(board.userData.dimensionStatus,'VISUAL_FIT_NOT_MEASURED');
  assert.equal(board.userData.photographyDate,null);
  assert.equal(board.userData.actualPeriod,'2026_09_FIRST_PERIOD_STRUCTURE__SECOND_PERIOD_OBJECTS_UNVERIFIED');
  assert.match(board.userData.source,/a057\.tiles\/f\//);
  const caseNode=nodes(b.kit.root,'wenhua-display-case').find(c=>board.position.x>c.userData.bounds.x0&&board.position.x<c.userData.bounds.x1);
  const bound=new THREE.Box3().setFromObject(board),cb=new THREE.Box3().setFromObject(caseNode);
  assert.ok(cb.containsBox(bound),'inclined support remains inside existing glass case');
 }
});

test('R39 Wenhua connector retaining lips meet the lower board edge inside glass, not the visitor path',()=>{
 const b=fixture('wenhua-connector'),boards=nodes(b.kit.root,'wenhua-scroll-support'),lips=nodes(b.kit.root,'wenhua-scroll-retaining-lip');
 assert.equal(lips.length,2);
 for(const board of boards){
  const lip=lips.find(l=>Math.sign(l.position.x)===Math.sign(board.position.x));
  assert.ok(lip);assert.ok(Math.abs(lip.position.x)<Math.abs(board.position.x));
  const q=new THREE.Vector3(-Math.sign(board.position.x)*board.geometry.parameters.width/2,board.geometry.parameters.height/2,0).applyEuler(board.rotation).add(board.position);
  assert.ok(lip.position.distanceTo(q)<.07,'retainer joins the low support edge rather than floating');
  assert.equal(lip.userData.dimensionStatus,'VISUAL_FIT_NOT_MEASURED');
 }
});

test('R39 slope is scoped to the connector; front island and rear horizontal supports stay flat',()=>{
 for(const part of ['front','rear']){const b=fixture('wenhua-'+part);for(const board of nodes(b.kit.root,'wenhua-scroll-support'))assert.deepEqual(board.rotation.toArray(),[0,0,0,'XYZ']);assert.equal(nodes(b.kit.root,'wenhua-scroll-retaining-lip').length,0);}
});

test('R39 all six southern halls preserve exact R38 collision, floors, rooms, doors, spawns, maps and regions',()=>{
 for(const [profile,expected] of Object.entries(baseline.halls)){const {kit}=fixture(profile);assert.equal(hash({colliders:kit.colliders,walkables:kit.walkables,rooms:kit.rooms,mapItems:kit.mapItems,regions:kit.regions}),expected,profile);}
});

test('R39 Wenhua circular screen has crossbars and substantial panel posts, clipped outside the actual opening',()=>{
 const b=fixture('wenhua-front'),root=b.kit.root,bars=nodes(root,'wenhua-horizontal-screen-muntin'),posts=nodes(root,'wenhua-screen-panel-post');
 assert.ok(bars.length>=6,'photo shows horizontal muntins, not only vertical sticks');
 assert.ok(posts.length>=4,'photo shows divided framed panels');
 assert.equal(nodes(root,'wenhua-circular-screen').length,1);
 const screen=nodes(root,'wenhua-circular-screen')[0],cy=1.45,r=1.65;
 for(const m of [...bars,...posts]){
  assert.equal(m.userData.dimensionStatus,'VISUAL_FIT_NOT_MEASURED');assert.match(m.userData.source,/a035\.tiles\/f\//);
  const p=m.geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i)+m.position.x,yy=p.getY(i)+m.position.y-screen.position.y;
   assert.ok(Math.hypot(x,yy-cy)>=r-1e-6,'frame vertex must not enter circular opening');
  }
 }
 // Ray-test the complete screen hardware on a dense interior grid, not metadata.
 for(let x=-1.5;x<=1.5;x+=.15)for(let yy=.1;yy<3;yy+=.15){if(Math.hypot(x,yy-cy)>r-.08)continue;
  const world=screen.parent.localToWorld(new THREE.Vector3(x,screen.position.y+yy,screen.position.z-1));
  const ray=new THREE.Raycaster(world,new THREE.Vector3(0,0,1),0,2);
  assert.equal(ray.intersectObjects([...bars,...posts],false).length,0,'crossbar must not bridge visitor opening');
 }
});
