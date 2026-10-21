import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {resolveRemainingProfile,buildRemainingHall,augmentRemainingHall} from '../src/scene/palace/special/RemainingResidentialHalls.js';
const rows=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/residential-scope.json',import.meta.url)));
function fixture(row){const item=row.baselineItem,p=resolveRemainingProfile(row.zone,item),kit=new CourtKit(library(),row.zone),built=p.mode==='augment'?augmentRemainingHall(kit,item,kit.hall(item),p):buildRemainingHall(kit,item,p);kit.root.updateMatrixWorld(true);return{item,p,kit,...built};}
const collect=(root,predicate)=>{const out=[];root.traverse(o=>{if(predicate(o))out.push(o);});return out;};
for(const row of rows.filter(r=>r.name!=='延禧宫')){
 test(`R48 ${row.name} main roof has actual outward top and downward underside FrontSide faces before and after merge`,()=>{
  const{item,kit,f}=fixture(row),roof=f.children.find(o=>o.name.startsWith('roof_'));assert.ok(roof);
  const top=collect(roof,o=>o.isMesh&&o.material?.name==='roof_tile'),under=collect(roof,o=>o.isMesh&&o.material?.name==='rafters');assert.ok(top.length&&under.length);assert.ok([...top,...under].every(m=>m.material.side===THREE.FrontSide));
  const ray=new THREE.Raycaster(),x=item.x+.31,z=item.z+.71,base=item.ph+item.colH;
  ray.set(new THREE.Vector3(x,base+20,z),new THREE.Vector3(0,-1,0));let hit=ray.intersectObjects(top)[0];assert.ok(hit);assert.ok(hit.face.normal.y>0);
  ray.set(new THREE.Vector3(x,base-.04,z),new THREE.Vector3(0,1,0));hit=ray.intersectObjects(under)[0];assert.ok(hit);assert.ok(hit.face.normal.y<0);const bracket=collect(roof,o=>o.isMesh&&o.material?.name==='dougong_band');const bracketBox=bracket.length?new THREE.Box3().setFromObject(bracket[0]):null;const supportY=bracketBox?bracketBox.max.y:base;if(bracketBox)assert.ok(Math.abs(bracketBox.min.y-base)<1e-5,'retained bracket band starts on column/beam top');assert.ok(Math.abs(hit.point.y-supportY)<1e-5,'underside rests on actual bracket band or direct beam top');
  const merged=kit.finish();merged.updateMatrixWorld(true);ray.set(new THREE.Vector3(x,base-.04,z),new THREE.Vector3(0,1,0));hit=ray.intersectObject(merged,true)[0];assert.ok(hit);assert.equal(hit.object.material.name,'rafters');assert.ok(hit.face.normal.y<0);assert.ok(Math.abs(hit.point.y-supportY)<1e-5);kit.dispose(merged);
 });
 const p=resolveRemainingProfile(row.zone,row.baselineItem);
 if(p.shell?.hardGableEnd)test(`R48 ${row.name} hard-gable end planes close both attics with outward visible faces`,()=>{
  const{item,kit,f}=fixture(row),roof=f.children.find(o=>o.name==='roof_gable'),ray=new THREE.Raycaster();assert.ok(roof);
  for(const s of[-1,1]){ray.set(new THREE.Vector3(item.x+s*(item.w/2+1),item.ph+item.colH+.4,item.z),new THREE.Vector3(-s,0,0));const hit=ray.intersectObject(roof,true)[0];assert.ok(hit,'gable attic must not expose the opposite end');assert.ok(Math.abs(hit.point.x-(item.x+s*item.w/2))<.08);assert.ok(hit.face.normal.x*s>.9);}
  kit.dispose(kit.finish());
 });
}
