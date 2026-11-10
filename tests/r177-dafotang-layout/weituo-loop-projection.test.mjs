// Front-screen sides are tested with actual geometry and the approved camera.
import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath,pathToFileURL} from 'node:url';
const repo=process.env.R255_REPO??fileURLToPath(new URL('../../',import.meta.url)),T=await import(pathToFileURL(repo+'/node_modules/three/build/three.module.js'));
const {createDafotangWeituo}=await import(pathToFileURL(repo+'/src/scene/palace/special/DafotangWeituo.js'));
test('R255 source figure14 high loop is viewer-right and existing lower design-fit geometry is preserved',()=>{
 const materials={body:new T.MeshStandardMaterial(),trim:new T.MeshStandardMaterial()},out=createDafotangWeituo({materials});
 try{
  const camera=new T.OrthographicCamera(-.91,.91,1.215,-1.215,.01,30);camera.position.set(0,1.14,-6);camera.lookAt(0,1.085,0);camera.updateMatrixWorld(true);
  assert.ok(new T.Vector3(.3,1,0).project(camera).x<0,'local +X really projects to viewer-left');
  const measure=role=>{const found=out.meshes.filter(m=>m.userData.dafotangWeituoRole===role);assert.equal(found.length,1);const p=found[0].geometry.attributes.position;let minX=Infinity,maxX=-Infinity,maxY=-Infinity;for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).project(camera);minX=Math.min(minX,v.x);maxX=Math.max(maxX,v.x);maxY=Math.max(maxY,v.y);}return{minX,maxX,maxY,vertices:p.count};};
  const high=measure('high-ribbon-loop'),lower=measure('shoulder-ribbon-loop');
  assert.ok(high.minX>0,'source14 high rising loop must be on viewer-right');
  // This lower loop is the unchanged pre-correction design fit. Its side is
  // NOT presented as a newly established source14 opposite-side fact.
  const expectedLower=new T.TubeGeometry(new T.CatmullRomCurve3([[-.27,1.61,.08],[-.58,1.65,.05],[-.60,1.46,.04],[-.43,1.36,.04],[-.29,1.49,.07]].map(p=>new T.Vector3(...p)),true),16,.025,5,true);
  try{const a=out.meshes.find(m=>m.userData.dafotangWeituoRole==='shoulder-ribbon-loop').geometry.attributes.position,b=expectedLower.attributes.position;assert.equal(a.count,b.count);for(let i=0;i<a.count;i++){const actual=new T.Vector3().fromBufferAttribute(a,i),before=new T.Vector3().fromBufferAttribute(b,i);assert.ok(actual.equals(before),'lower fitted loop vertex unchanged');assert.ok(actual.project(camera).equals(before.project(camera)),'lower fitted loop projection unchanged');}}finally{expectedLower.dispose();}
  assert.equal(out.meshes.length,33);assert.equal(out.meshes.reduce((n,m)=>n+m.geometry.index.count/3,0),3904);
  console.log('R255_LOOP_PROJECTION '+JSON.stringify({high,lower}));
 }finally{out.dispose();Object.values(materials).forEach(m=>m.dispose());}
});
