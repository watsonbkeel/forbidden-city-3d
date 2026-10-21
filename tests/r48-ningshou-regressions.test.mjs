import {createHash} from 'node:crypto';
import {visibleTriangleIndex,assertVisibleBody} from './r48-ningshou-visible-body.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import * as THREE from 'three';
import {resolve,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import { library, hallSurfaces } from './lib/inner-palace-fixture.mjs';
import { replayTerrace, traceTerraceGround } from './lib/terrace-walk.mjs';
const root=process.env.R48_INTEGRATION_ROOT?pathToFileURL(resolve(process.env.R48_INTEGRATION_ROOT)+sep):new URL('../',import.meta.url);
const source=readFileSync(new URL('../src/scene/palace/special/RemainingNingshouHalls.js',import.meta.url),'utf8');
const hook=registerHooks({load(url,context,next){if(url.endsWith('/RemainingNingshouHalls.js'))return{format:'module',source,shortCircuit:true};return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
const {ZoneBase}=await import(new URL('src/scene/zones/ZoneBase.js',root));
const {REMAINING_NINGSHOU_PROFILES:profiles}=await import(new URL('src/scene/palace/special/RemainingNingshouHalls.js',root));
const {buildWorld}=await import(new URL('tests/lib/world.mjs',root));
const W=await buildWorld();hook.deregister();
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const pfor=k=>profiles.find(p=>p.key===k);
const nz=read('data/zones/ningshou.json');
const rawBuilder=new ZoneBase(library(),nz);rawBuilder.kit.finish=()=>rawBuilder.kit.root;
const raw=rawBuilder.build();raw.group.updateMatrixWorld(true);
const mergedBuilder=new ZoneBase(library(),nz),merged=mergedBuilder.build();merged.group.updateMatrixWorld(true);
const find=(root,role)=>{const a=[];root.traverse(m=>{if(m.isMesh&&m.userData.role===role)a.push(m)});return a;};
const frame=key=>raw.group.children.find(g=>g.userData.structure?.id===pfor(key).id);
const down=new THREE.Vector3(0,-1,0);
function visibleAt(root,x,z,y,tolerance=.18){
 const hits=new THREE.Raycaster(new THREE.Vector3(x,y+.2,z),down,0,.41).intersectObject(root,true);
 return hits.find(h=>Math.abs(h.point.y-y)<=tolerance);
}
function assertGroundFrames(result,root,maxDelta=.18){
 let raised=0;
 for(const fr of result.frames){if(fr.ground<=.01)continue;raised++;const h=visibleAt(root,fr.x,fr.z,fr.ground,maxDelta);assert.ok(h,`invisible support ${JSON.stringify(fr)}`);}
 assert.ok(raised>0);return raised;
}
const report={moduleSHA256:createHash('sha256').update(source).digest('hex'),regressionOrigin:'independent frozen 19a590c review',routes:[],support:[]};
const round=a=>[...a,...a.slice(0,-1).reverse()];
const biluo=pfor('biluo'),jingqi=pfor('jingqi'),ning=pfor('ningshou');
const baseGate=[[-294,212.5],[-294,231.5],[-293.2,269],[-323,269],[-323,304.7]];
const ningRoute=round([...baseGate,[-301.4714285714,304.7],...ning.portals[0].approachPoints.map(p=>[p.x,p.z]),[-301.4714285714,316],[-301.4714285714,320],...ning.portals[1].approachPoints.slice().reverse().map(p=>[p.x,p.z])]);
const biluoRoute=round([[-265,465.1],...biluo.portals[0].approachPoints.map(p=>[p.x,p.z]),[biluo.x,biluo.z]]);
const stair=frame('jingqi').userData.structure.stair,jingqiBody=visibleTriangleIndex(frame('jingqi'));
const jingqiRoute=round([...jingqi.portals[0].approachPoints.map(p=>[p.x,p.z]),...stair.route.map(([x,z])=>[jingqi.x+x,jingqi.z+z])]);
for(const [name,points,expectedMax] of [['宁寿门绕皇极殿偏东门穿宁寿宫',ningRoute,1],['碧螺亭东阶避萃赏楼',biluoRoute,.5],['景祺阁楼梯上楼退行',jingqiRoute,jingqi.upperFloorY]])for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])test(`independent all-world ${name} fps=${fps} sprint=${sprint} backward=${backward}`,t=>{
 const trace=traceTerraceGround(W.cm,{flights:[]});
 try{const result=replayTerrace(t,W,points,{fps,sprint,backward,recordFrames:true});
 if(!result.arrived&&process.env.R48_WRITE_REGRESSION_REPORTS==='1'){writeFileSync(new URL('../docs/current-state/r48-remaining/ningshou-jingqi-failure-frames.json',import.meta.url),JSON.stringify(result,null,2));}assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.equal(result.startFeet,0);assert.equal(result.end[2],0);assert.ok(result.maxFeet>=expectedMax-.02);
 assert.equal(trace.samples.some(s=>s.source==='rescue'||s.source==='unverified'),false);
 const bodyStats={};let bodyTriangleChecks=0;if(name==='景祺阁楼梯上楼退行')for(const fr of result.frames)bodyTriangleChecks+=assertVisibleBody(W.cm,jingqiBody,fr,bodyStats);
 const sampled=assertGroundFrames(result,raw.group);assertGroundFrames(result,merged.group);
 report.routes.push({name,fps,sprint,backward,bodyTriangleChecks,...bodyStats,frames:result.frames.length,raisedSamples:sampled,maxFeet:result.maxFeet,endFeet:result.end[2]});
 }finally{trace.restore();}
});
test('independent Jingqi entire stair opening ray and 1.8 m head volume are actually clear',()=>{
 const f=frame('jingqi'),s=f.userData.structure.stair,hole=f.userData.structure.floorVoids[0],slabs=find(f,'upper-floor-slab');let n=0;
 for(let x=hole.x0+.05;x<hole.x1;x+=.1)for(let z=hole.z0+.05;z<hole.z1;z+=.1){const hits=new THREE.Raycaster(new THREE.Vector3(jingqi.x+x,jingqi.upperFloorY+.3,jingqi.z+z),down,0,.6).intersectObjects(slabs,true);assert.equal(hits.length,0,`covered opening ${x},${z}`);n++;}
 // Trace an upward ray from the height of every visible tread, not claimed ramp height.
 for(let i=0;i<30;i++){const z=s.zBottom-(i+.5)*(s.zBottom-s.zTop)/30,y=s.y0+(i+1)*(s.y1-s.y0)/30;for(const dx of[-.45,0,.45]){const x=jingqi.x+s.x+dx,zz=jingqi.z+z;assert.ok(visibleAt(f,x,zz,y,.002));const h=new THREE.Raycaster(new THREE.Vector3(x,y+.04,zz),new THREE.Vector3(0,1,0),0,1.85).intersectObject(f,true);assert.equal(h.length,0,`rendered head obstruction tread ${i}, dx ${dx}: ${h[0]?.object.name}`);}}
 report.support.push({name:'Jingqi opening',rays:n,treadHeadRays:90});
});
test('independent Biluo all registered box supports have an exact visible upward surface',()=>{
 const f=frame('biluo'),walks=raw.walkables.filter(w=>w.type==='box'&&w.box.min.x>biluo.x-4&&w.box.max.x<biluo.x+4&&w.box.min.z>biluo.z-4&&w.box.max.z<biluo.z+4);let n=0;const misses=[];
 for(const w of walks)for(const tx of [.02,.5,.98])for(const tz of [.02,.5,.98]){const x=THREE.MathUtils.lerp(w.box.min.x,w.box.max.x,tx),z=THREE.MathUtils.lerp(w.box.min.z,w.box.max.z,tz);n++;if(!visibleAt(f,x,z,w.box.max.y,.005))misses.push({x,z,y:w.box.max.y,box:{min:w.box.min.toArray(),max:w.box.max.toArray()}});}
 report.support.push({name:'Biluo full support mesh',rays:n,misses});assert.equal(misses.length,0,JSON.stringify(misses.slice(0,6)));
});
test.after(()=>{if(process.env.R48_WRITE_REGRESSION_REPORTS==='1')writeFileSync(new URL('../docs/current-state/r48-remaining/ningshou-regression-review-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');rawBuilder.dispose();mergedBuilder.dispose();});
