import test from 'node:test';
import {registerHooks} from 'node:module';
registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
import assert from 'node:assert/strict';
import fs from 'node:fs';import zlib from 'node:zlib';
import {fixture,T,zone} from './fixture.mjs';
import {buildYinghuaStelePavilion} from '../../src/scene/palace/special/YinghuaStelePavilion.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../lib/bounded-qa-clock.mjs';
import {approaches,negativePlans,globalPlans} from './plans.mjs';
const out=process.env.R163_AUTHOR_OUT??'/tmp/r163-yinghua-stele-2114';
function save(name,r){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/'+name+'.json.gz',zlib.gzipSync(JSON.stringify(r)));}
const run=(t,cm,p,fps,sprint,startFeet=0)=>({...p,fps,sprint,...withBoundedQaMocks(t,q=>replayKunning(q,{THREE:T,cm},p.pts,{fps,sprint,startFeet,recordFrames:true}))});
const clear=(cm,x,z,feet)=>!cm.checkCollision(new T.Vector3(x,feet+1.7,z),.5);
function summary(q){return {name:q.name,fps:q.fps,sprint:q.sprint,arrived:q.arrived,frames:q.frames.length,peak:Math.max(...q.frames.map(f=>Math.abs(f.feet-f.ground))),end:q.end};}
test('actual FirstPerson both bypasses both directions walk/sprint 10/60Hz; center/pillar/rail native blocks and deleted-stele negative control',t=>{
 const f=fixture(),r={rows:[],negative:[],removed:[]};try{
 buildYinghuaStelePavilion(f.kit,zone);const cm=new CollisionManager();cm.addColliders(f.kit.colliders,'new');cm.addWalkables(f.kit.walkables,'new');
 for(const p of approaches)for(const fps of [10,60])for(const sprint of [false,true]){assert.ok(clear(cm,...p.pts[0],0));r.rows.push(run(t,cm,p,fps,sprint));}
 for(const p of negativePlans){assert.ok(clear(cm,...p.pts[0],.12),p.name);r.negative.push(run(t,cm,p,60,true,.12));}
 const bare=new CollisionManager();bare.addColliders(f.kit.colliders.filter(c=>!['stele','stele-base'].includes(c.yinghuaRole)),'removed-stele');bare.addWalkables(f.kit.walkables,'new');r.removed.push(run(t,bare,negativePlans[0],60,true,.12));
 r.summary=r.rows.map(summary);console.log(JSON.stringify({rows:r.summary,negative:r.negative.map(summary),removed:r.removed.map(summary)}));
 assert.ok(r.rows.every(q=>q.arrived),'all routes arrive');assert.ok(r.summary.every(q=>q.peak<=.300001),'local feet-ground');
 for(const q of r.rows){assert.ok(clear(cm,q.end[0],q.end[1],q.end[2]));assert.ok(q.frames.some(f=>Math.abs(f.feet-.12)<1e-6),'actual slab contact');for(const f of q.frames)assert.ok(clear(cm,f.x,f.z,f.feet),`native overlap ${q.name} ${JSON.stringify(f)}`);}
 assert.ok(r.negative.every(q=>!q.arrived),'all negatives blocked');assert.ok(r.removed.every(q=>q.arrived),'deleted stele exposes negative condition');
 }finally{save('task1-local-routes',r);f.dispose();}
});
test('author-injected actual resident World gate-to-hall return, old hall-step peaks reported independently',async t=>{
 const {buildR52World}=await import('../lib/r52-world.mjs');const {createActualLibrary}=await import('../r158-cumulative-1600/library.mjs');const W=await buildR52World({loadAll:false,initialPosition:{x:277.2,z:451.2},createLibrary:createActualLibrary,zoneManagerOptions:{reuseInactive:true}}),f=fixture(),r={injected:true,rows:[]};try{for(const z of ['outer-west','west-six','garden'])W.zoneManager.loadZone(z);r.loaded=[...W.zoneManager.loaded.keys()];const built=buildYinghuaStelePavilion(f.kit,zone);W.scene.updateMatrixWorld(true);const envelope=new T.Box3().setFromObject(built.frame);envelope.min.y=.04;r.oldEnvelopeHits=[];W.scene.traverse(m=>{if(!m.isMesh||!m.geometry?.attributes.position)return;for(let q=m;q;q=q.parent)if(!q.visible)return;const g=m.geometry;g.computeBoundingBox();const matrices=[];if(m.isInstancedMesh){for(let i=0;i<m.count;i++){const local=new T.Matrix4();m.getMatrixAt(i,local);matrices.push(m.matrixWorld.clone().multiply(local));}}else matrices.push(m.matrixWorld);for(const mx of matrices){if(!g.boundingBox.clone().applyMatrix4(mx).intersectsBox(envelope))continue;const p=g.attributes.position,ix=g.index;let n=0;for(let i=0;i<(ix?.count??p.count);i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(i+j)??i+j).applyMatrix4(mx));const tri=new T.Triangle(...v);if(tri.getArea()>1e-12&&envelope.intersectsTriangle(tri))n++;}if(n)r.oldEnvelopeHits.push({name:m.name,triangles:n});}});assert.deepEqual(r.oldEnvelopeHits,[]);W.scene.add(built.frame);W.cm.addColliders(f.kit.colliders,'author-r163');W.cm.addWalkables(f.kit.walkables,'author-r163');for(const p of globalPlans)for(const fps of [10,60])for(const sprint of [false,true]){const startFeet=p.reverse?.9:0,ground=W.cm.getGroundHeight(...p.pts[0],startFeet,.6,.5);assert.ok(Math.abs(ground-startFeet)<1e-6,'native old ground confirms starting feet');assert.ok(clear(W.cm,...p.pts[0],startFeet));const q=run(t,W.cm,p,fps,sprint,startFeet);q.startGround={nativeGround:ground,requestedFeet:startFeet,source:p.reverse?'existing Yinghua hall platform support':'existing gate exterior ground'};r.rows.push(q);}r.summary=r.rows.map(summary);console.log(JSON.stringify({global:r.summary}));assert.ok(r.rows.every(q=>q.arrived),'full gate/hall returns arrive');for(const q of r.rows){assert.ok(clear(W.cm,q.end[0],q.end[1],q.end[2]));const local=q.frames.filter(f=>f.z>=464.5&&f.z<=473.5);assert.ok(local.every(f=>Math.abs(f.feet-f.ground)<=.300001));}}finally{save('task1-global-routes',r);f.dispose();W.dispose?.();}
});
