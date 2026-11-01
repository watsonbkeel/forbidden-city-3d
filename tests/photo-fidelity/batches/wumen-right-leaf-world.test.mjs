import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildR52World} from '../../lib/r52-world.mjs';
import {captureRightLeaf} from '../../lib/wumen-right-leaf-fixture.mjs';
// Actual World installation only: never invoke the installer in this consumer.
test('uninjected cumulative World retains one actual right Wumen stud face with unchanged physics counts',async()=>{
 const c=captureRightLeaf(),T=c.THREE,expected=[];let target;c.group.traverse(o=>{if(o.userData.wumenRightLeafStuds)target=o;});
 for(const cap of target.children){const g=cap.geometry.toNonIndexed();g.applyMatrix4(cap.matrixWorld);for(let i=0;i<g.attributes.position.count;i++)expected.push(new T.Vector3().fromBufferAttribute(g.attributes.position,i).add(new T.Vector3(c.data.position.x,0,c.data.position.z)));g.dispose();}c.builder.dispose();
 const W=await buildR52World();try{global.gc?.();const matches=[],records=[];W.scene.traverse(o=>{if(o.isMesh&&o.material?.name==='wumen_right_yemen_stud_gold_fit')matches.push(o);for(const r of o.userData.architecture??[])if(r.id==='axis/wumen-lower/west-yemen/visible-studs')records.push(r);});
 assert.equal(matches.length,1);assert.equal(records.length,1);assert.equal(records[0].visibleSiteCount,69);assert.deepEqual(records[0].absentSites,[[7,8],[8,8]]);assert.deepEqual(records[0].unobservedSites,[[9,1]]);
 const mesh=matches[0];W.scene.updateMatrixWorld(true);const verify=()=>{for(let o=mesh;o;o=o.parent)assert.equal(o.visible,true);assert.equal(mesh.material.visible,true);assert(mesh.material.opacity>0||!mesh.material.transparent);const a=mesh.geometry.attributes.position;assert.equal(a.count,expected.length);for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld);assert(p.distanceTo(expected[i])<1e-5,'actual merged world cap vertex '+i);}};verify();
 mesh.visible=false;assert.throws(verify);mesh.visible=true;const a=mesh.geometry.attributes.position,x=a.getX(0);a.setX(0,x+.1);assert.throws(verify);a.setX(0,x);verify();
 assert.equal(W.cm.colliders.length,30882);assert.equal(W.cm.walkables.length,1365);assert.equal(W.cm.colliders.filter(c=>c.mesh?.material?.name==='wumen_right_yemen_stud_gold_fit').length,0);
 const result={scope:'ACTUAL_CUMULATIVE_WORLD_NO_INSTALLER_INJECTION',caps:69,triangles:expected.length/3,colliders:W.cm.colliders.length,supports:W.cm.walkables.length,mergedWorldVertexTolerance:1e-5,negativeControls:['hidden actual mesh','actual vertex displaced'],wholeObjectAccepted:false};if(process.env.WUMEN_RIGHT_WORLD_OUT)fs.writeFileSync(process.env.WUMEN_RIGHT_WORLD_OUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
 }finally{W.dispose();}
});
