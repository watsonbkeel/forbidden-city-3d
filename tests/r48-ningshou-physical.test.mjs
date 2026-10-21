import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from 'three';
import {createHash} from 'node:crypto';
import {PLAYER} from '../src/config/constants.js';
const moduleSHA256=createHash('sha256').update(readFileSync(new URL('../src/scene/palace/special/RemainingNingshouHalls.js',import.meta.url))).digest('hex');
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {resolveRemainingProfile,buildRemainingHall,augmentRemainingHall} from '../src/scene/palace/special/RemainingNingshouHalls.js';
const scope=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/ningshou-scope.json',import.meta.url)));
const report=[];
const roofRoles=new Set(['roof-surface','roof-hip-skirt','roof-curved-gable','roof-tile-rib','glazed-eave-edge','plum-roof-edge','blue-white-finial','white-finial-band','jingqi-waist-eave']);
function triangles(mesh){const p=mesh.geometry.attributes.position,idx=mesh.geometry.index,out=[];for(let i=0;i<(idx?.count??p.count);i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i):i).applyMatrix4(mesh.matrixWorld),b=new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+1):i+1).applyMatrix4(mesh.matrixWorld),c=new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+2):i+2).applyMatrix4(mesh.matrixWorld),n=b.clone().sub(a).cross(c.clone().sub(a));if(n.lengthSq()>1e-16)out.push({a,b,c,n:n.normalize(),center:a.clone().add(b).add(c).multiplyScalar(1/3)});}return out;}
function contactCount(roofs,body){const boxes=body.map(m=>({mesh:m,b:new THREE.Box3().setFromObject(m).expandByScalar(.001)}));let count=0;for(const m of roofs){const bbox=new THREE.Box3().setFromObject(m),possible=boxes.filter(x=>x.b.intersectsBox(bbox)),ts=triangles(m);for(const q of possible)if(ts.some(t=>q.b.intersectsTriangle(new THREE.Triangle(t.a,t.b,t.c))))count++;}return count;}
function make(row){const item=structuredClone(row.baselineItem),p=resolveRemainingProfile('ningshou',item);if(!p)return null;const kit=new CourtKit(library(),'ningshou'),built=p.mode==='augment'?augmentRemainingHall(kit,item,kit.hall(item),p):buildRemainingHall(kit,item,p);kit.buildPlaqueAtlas();built.f.updateMatrixWorld(true);const meshes=[];built.f.traverse(m=>{if(m.isMesh)meshes.push(m);});return{kit,...built,p,meshes};}
for(const row of scope){const p=resolveRemainingProfile('ningshou',row.baselineItem);if(!p){report.push({id:row.id,name:row.name,status:'not-yet-implemented',checks:[]});continue;}
 test(`R48 physical ${row.name}: FrontSide roof faces, closed custom shells and real bearing`,()=>{
  const{kit,f,p,meshes}=make(row),roofs=meshes.filter(m=>roofRoles.has(m.userData.role)||m.name.startsWith('roof_')),body=meshes.filter(m=>!roofRoles.has(m.userData.role)&&!m.name.startsWith('roof_'));
  try{
   for(const m of meshes)if(m.material.name.startsWith('r48_ningshou_'))assert.equal(m.material.side,THREE.FrontSide,`${row.name}/${m.userData.role} must not hide missing reverse faces with DoubleSide`);
   const custom=meshes.filter(m=>m.userData.facePolicy==='FRONTSIDE_CLOSED_TOP_SOFFIT_AND_EDGES'),ends=meshes.filter(m=>m.userData.role==='roof-curved-gable');let upRays=0,downRays=0,closedEdges=0;
   for(const m of [...custom,...ends]){
    const ts=triangles(m),edges=new Map(),key=v=>v.toArray().map(x=>Math.round(x*1e5)).join(',');
    for(const t of ts)for(const[a,b]of[[t.a,t.b],[t.b,t.c],[t.c,t.a]]){const x=key(a),y=key(b),k=x<y?x+'|'+y:y+'|'+x;edges.set(k,(edges.get(k)??0)+1);}
    for(const[k,n]of edges){assert.equal(n,2,`${row.name}/${m.userData.role} open or nonmanifold edge ${k}`);closedEdges++;}
    const tops=ts.filter(t=>t.n.y>.2),bottoms=ts.filter(t=>t.n.y<-.2);
    if(custom.includes(m)){assert.ok(tops.length&&bottoms.length,`${m.name} needs actual upper and lower triangles`);}
    for(const ts0 of[tops,bottoms])for(let i=0;i<ts0.length;i+=Math.max(1,Math.floor(ts0.length/17))){const t=ts0[i],ray=new THREE.Raycaster(t.center.clone().addScaledVector(t.n,.03),t.n.clone().negate(),0,.061),hits=ray.intersectObject(m);assert.ok(hits.length,`${row.name}/${m.userData.role} FrontSide normal ray missing`);if(t.n.y>0)downRays++;else upRays++;}
   }
   // Retained ordinary RoofBuilder roofs use their genuine downward-facing
   // rafters/soffits instead of making the tile material double-sided.
   const ordinary=meshes.filter(m=>m.name.startsWith('roof_')&&m.material.name==='rafters');let ordinarySoffitRays=0;
   for(const m of ordinary){const ts=triangles(m).filter(t=>t.n.y<-.2);assert.ok(ts.length,`${row.name} retained ordinary roof has no downward soffit`);for(let i=0;i<ts.length;i+=Math.max(1,Math.floor(ts.length/17))){const t=ts[i],hits=new THREE.Raycaster(t.center.clone().addScaledVector(t.n,.02),t.n.clone().negate(),0,.041).intersectObject(m);assert.ok(hits.length);ordinarySoffitRays++;}}
   let ordinaryTopRays=0;for(const m of roofs.filter(m=>!custom.includes(m)&&m.userData.role==='roof-surface'))for(const t of triangles(m).filter(t=>t.n.y>.2).filter((_,i)=>i%11===0)){assert.ok(new THREE.Raycaster(t.center.clone().addScaledVector(t.n,.02),t.n.clone().negate(),0,.041).intersectObject(m).length);ordinaryTopRays++;}
   const contacts=contactCount(roofs,body);assert.ok(contacts>0,`${row.name} roof/body actual triangle contact absent`);
   const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);let approachRays=0;
   for(const q of p.portals.flatMap(q=>q.approachPoints)){const h=cm.getGroundHeight(q.x,q.z,q.feetY,PLAYER.STEP_UP);assert.ok(Math.abs(h-q.feetY)<.03);assert.equal(cm.checkCollision(new THREE.Vector3(q.x,q.feetY+PLAYER.HEIGHT,q.z)),false);if(q.feetY>.01){assert.ok(new THREE.Raycaster(new THREE.Vector3(q.x,q.feetY+.2,q.z),new THREE.Vector3(0,-1,0),0,.4).intersectObject(f,true).some(h=>Math.abs(h.point.y-q.feetY)<.18),`${row.name} step support ray ${JSON.stringify(q)}`);approachRays++;}}
   report.push({id:p.id,name:p.name,moduleSHA256,productionPlayer:{height:PLAYER.HEIGHT,stepUp:PLAYER.STEP_UP,radius:'CollisionManager production default 0.5; checkCollision called without override'},status:'software-physical-checks-pass-not-gpu-acceptance',actualBounds:new THREE.Box3().setFromObject(f).toJSON?.()??{min:new THREE.Box3().setFromObject(f).min.toArray(),max:new THREE.Box3().setFromObject(f).max.toArray()},checks:[{kind:'normal-and-FrontSide-rays',test:'R48 physical '+p.name,result:'pass',topRays:downRays,undersideRays:upRays,ordinarySoffitRays,ordinaryTopRays},{kind:'closed-end-and-soffit-shell',test:'R48 physical '+p.name,result:custom.length||ends.length?'pass':'not-applicable-retained-ordinary-roof-and-real-soffit',customShells:custom.length,endBoards:ends.length,closedEdges},{kind:'roof-bearing-contact',test:'R48 physical '+p.name,result:'pass',actualTriangleToBodyBoxContacts:contacts,toleranceMetres:.001},{kind:'step-render-support',test:'R48 physical '+p.name,result:'pass',approachRays},{kind:'all-mode-controller-routes',test:'tests/r48-ningshou-regressions.test.mjs plus whole-world portal reviewer',result:'separate-suite-required-not-inferred-from-this-test'},{kind:'roof-junction-and-overlap',test:'custom manifold-edge and independent roof-contact/corner coverage tests',result:'partial-geometric-check-not-full-museum-survey',note:'Separate closed shell pieces may overlap at fitted seams; detailed historical joinery is not claimed.'}],regressionFixes:p.key==='biluo'?['20/30-gon support replaces analytic circle','Five physical short bearers connect upper to lower roof shells','All real Cylinder top-cap indices ray-fitted to actual soffit, fixing 17–18 mm upper-cap penetration; full down/up FrontSide regression in roof-contact suite']:['xunyan','qingshou'].includes(p.key)?['Plain fitted purlin/frame closes independently observed whole-roof detachment']:['jingfu','xishang'].includes(p.key)?['Closed hip corner panels replace missing projected roof coverage']:[]});
  }finally{kit.dispose(f);}
 });
}
test.after(()=>{if(process.env.R48_WRITE_PHYSICAL_REPORTS==='1')writeFileSync(new URL('../docs/current-state/r48-remaining/ningshou-physical-checks.json',import.meta.url),JSON.stringify(report,null,2)+'\n');});
