import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {readyScene} from '../../scripts/r120/ready-scene.mjs';
import {buildQianqingCentralLevel,QIANQING_CENTRAL} from '../../src/scene/palace/QianqingCentralSetting.js';
import {QIANQING_CEILING} from '../../src/scene/palace/QianqingCeiling.js';
const h=await readyScene(),lod=h.scene.getObjectByName('qianqing-central-setting-detail'),f=lod.parent.userData.qianqingCentral,mat=h.builder._own.get('qianqing-central-private-atlas');
test.after(()=>h.dispose());
const raw=buildQianqingCentralLevel(mat,f,true);raw.updateMatrixWorld(true);
function finalBounds(m){const g=m.geometry.clone();g.applyMatrix4(m.matrixWorld);g.computeBoundingBox();const b=g.boundingBox.clone();g.dispose();return b;}
test('R120 axial plaque and dragon band are a bounded combined photo-fit in actual Float32 geometry',()=>{
 const p=finalBounds(raw.getObjectByName('qianqing-zhengdaguangming-plaque')),b=finalBounds(raw.getObjectByName('qianqing-high-gilt-frieze')),back=finalBounds(raw.getObjectByName('qianqing-red-rear-frame'));
 assert.ok(Math.abs((p.max.x-p.min.x)/(b.max.x-b.min.x)-.75)<1e-6,'old plaque/band ratio .53 must change as a whole assembly');
 assert.ok(Math.abs((b.max.y-b.min.y)/(b.max.x-b.min.x)-.19)<1e-6,'old shallow frieze ratio .119 must change');
 const crest=new T.Box3();raw.children.filter(m=>m.name.startsWith('qianqing-open-carved-crest')).forEach(m=>crest.union(finalBounds(m)));
 assert.ok(b.min.y-crest.max.y>.0399);assert.ok(p.min.y-b.max.y>.0699);assert.ok(back.max.y-p.max.y>.0499);
 assert.ok(p.max.x<back.max.x&&b.max.x<back.max.x);assert.equal(f.y,2.16);assert.equal(f.stepRun,1.3);assert.equal(f.plaque.leftToRight,'明光大正');
 assert.equal(raw.children.filter(m=>m.name.startsWith('qianqing-five-screen-panel-')).length,5);assert.equal(raw.children.filter(m=>m.name.startsWith('qianqing-three-stairs-')).length,15);
});
test('R120 four actual open rail rows have lower connections and source-mapped finite owners, not filled boxes',()=>{
 const rows=raw.children.filter(m=>m.name.startsWith('qianqing-open-stair-rail-'));assert.equal(rows.length,4,'four existing rail planes must receive the open assembly');
 const owners=h.builder.colliders.filter(c=>c.furnitureMotionScope?.id?.startsWith('qianqing-stair-rail-'));assert.equal(owners.length,4);
 for(let i=0;i<4;i++){const o=owners[i];assert.equal(o.furnitureMotionScope.id,'qianqing-stair-rail-'+i);assert.ok(o.xiqingRoofSurface,'no bounding-box-only rail');assert.ok(o.max.x-o.min.x<.18);assert.ok(o.max.z-o.min.z<1.9);assert.ok(o.xiqingRoofSurface.template.sourceFaces.length>100);for(const face of o.xiqingRoofSurface.template.sourceFaces){const mesh=lod.levels[0].object.children[face.source.mesh],p=mesh.geometry.attributes.position;face.vertices.forEach((v,j)=>assert.deepEqual(v.toArray(),new T.Vector3().fromBufferAttribute(p,face.source.triangle*3+j).applyMatrix4(mesh.matrixWorld).toArray()));}}
 const far=buildQianqingCentralLevel(mat,f,false);assert.equal(far.children.filter(m=>m.name.startsWith('qianqing-open-stair-rail-')).length,0);
});
test('R120 real coffer reveals add shallow oblique faces within original 23x12 continuous ceiling envelope, far unchanged',()=>{
 const c=h.scene.getObjectByName(QIANQING_CEILING.id),near=c.levels[0].object,far=c.levels[1].object;assert.equal(c.userData.caisson,false);assert.equal(QIANQING_CEILING.nx,23);assert.equal(QIANQING_CEILING.nz,12);
 let sloped=0;near.traverse(m=>{if(!m.isMesh||m.material.map)return;const p=m.geometry.attributes.position,n=m.geometry.attributes.normal;for(let i=0;i<p.count;i+=3){if(Math.abs(n.getY(i))>.01&&Math.abs(n.getY(i))<.99){sloped++;assert.ok(n.getY(i)<0,'FrontSide reveals must face the room below');}for(let j=0;j<3;j++)assert.ok(p.getY(i+j)>=-.120001&&p.getY(i+j)<=.000001);}});assert.equal(sloped,23*12*8,'four actual shallow reveal quads per existing cell');
 assert.equal(far.children.length,1);assert.equal(far.children[0].geometry.attributes.position.count,4);assert.deepEqual(far.children[0].material.map.repeat.toArray(),[23,12]);
});
test('R120 retained 106 central parts, all six display objects, far ceiling, and every old collider/walkable are exact R119',async()=>{const {retained}=await import('../../scripts/r120/capture-retained.mjs'),{default:fs}=await import('node:fs');const before=JSON.parse(fs.readFileSync(new URL('../fixtures/r120/r119-retained.json',import.meta.url))),after=await retained();for(const k of Object.keys(before).filter(k=>k!=='sourceFingerprint'))assert.deepEqual(after[k],before[k],k);});
