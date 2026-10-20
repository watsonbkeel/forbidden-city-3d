import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {library} from './lib/inner-palace-fixture.mjs';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {QIANQING_SPATIAL_FIT,qianqingDepthGrid,qianqingColumnPresent} from '../src/scene/palace/QianqingDepthGrid.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const hall=PALACE_LAYOUT.find(x=>x.name==='乾清宫');
function fixture(){const b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();b.buildHall(g,hall,2.16,{heightReferenceY:7});g.updateMatrixWorld(true);return{b,g};}
test('official five depth bays are six finite ordered provisional stations with retained outer anchors',()=>{
 const p=qianqingDepthGrid(25);assert.equal(p.depthBays,5);assert.equal(p.z.length,6);assert.deepEqual(p.z,[-12.5,-9.5,-4.5,4.5,9.5,12.5]);
 assert.ok(p.z.every((z,i)=>Number.isFinite(z)&&(!i||z>p.z[i-1])));assert.equal(p.frontDoorZ,p.z[1]);assert.equal(p.rearDoorZ,p.z[4]);
 assert.match(QIANQING_SPATIAL_FIT.status,/FIT_NOT_SURVEY/);assert.equal(QIANQING_SPATIAL_FIT.official.depthBays,5);
 for(const d of[0,-1,NaN,24,26])assert.throws(()=>qianqingDepthGrid(d));
});
test('explicit front central reduction and retained display exclusion do not erase entire depth rows',()=>{
 for(const i of[4,5]){assert.equal(qianqingColumnPresent(i,1),false);assert.equal(qianqingColumnPresent(i,3),false);for(const k of[0,2,4,5])assert.equal(qianqingColumnPresent(i,k),true);}
 for(const i of[0,1,2,3,6,7,8,9])for(let k=0;k<6;k++)assert.equal(qianqingColumnPresent(i,k),true);
 assert.throws(()=>qianqingColumnPresent(10,2));assert.throws(()=>qianqingColumnPresent(2,6));
});
test('real hall uses 56 permanent red columns with exact matching collision, no stale four-row stations',()=>{
 const{b,g}=fixture();try{const rows=g.children.filter(o=>o.userData.qianqingColumn);assert.equal(rows.length,56);
 const stations=new Set(rows.map(m=>m.userData.qianqingColumn.k));assert.equal(stations.size,6);
 for(const m of rows){const{j,k}=m.userData.qianqingColumn;close(m.position.z,316.8+qianqingDepthGrid(25).z[k]);assert.ok(qianqingColumnPresent(j,k));
 assert.ok(b.colliders.some(c=>c.min.x<m.position.x&&c.max.x>m.position.x&&c.min.z<m.position.z&&c.max.z>m.position.z&&Math.abs(c.max.y-5.16)<1e-6),'column must have actual permanent collision');}
 assert.equal(g.userData.qianqingDepthFit.id,QIANQING_SPATIAL_FIT.id);
 }finally{b.dispose();}
});
test('front and rear porches join both end passages without moving exterior mouths or central display',()=>{
 const{b,g}=fixture();try{const f=g.userData.qianqingPassages;assert.deepEqual([f.zSouth,f.zNorth],[304.3,329.3]);assert.deepEqual([f.wallSouth,f.wallNorth],[307.3,326.3]);
 const leaves=g.children.filter(m=>m.userData.qianqingFrontEnclosure?.kind==='leaf');assert.equal(leaves.length,6);for(const m of leaves)assert.ok(m.position.z>307.3);
 const walls=g.children.filter(m=>m.userData.qianqingPassage?.kind==='inner-wall');assert.equal(walls.length,4);for(const m of walls){const box=new T.Box3().setFromObject(m);assert.ok(box.min.z>=307.3-1e-5&&box.max.z<=326.3+1e-5);}
 assert.ok(b.colliders.some(c=>Math.abs(c.min.z-316.5)<1e-6&&Math.abs(c.max.z-324.8)<1e-6&&c.min.x<0&&c.max.x>0),'same central display exclusion');
 }finally{b.dispose();}
});
