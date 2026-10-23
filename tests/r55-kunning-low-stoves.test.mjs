import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {ROOT,config,OLD_MODEL,hash,actualKunningRoot,contract,inventory,triangles,rawGLB} from './lib/r55-kunning-asset.mjs';
const root=await actualKunningRoot(),old=await actualKunningRoot(OLD_MODEL),rows=triangles(root),prior=triangles(old);
test('R55 replaces two tall S stoves with one continuous low countertop and three covered inset mouths',()=>{
 const items=inventory(root);assert.equal(items.filter(o=>o.name==='r55_stove_base').length,1,'one continuous low base, not shortened old pairs');
 assert.equal(items.filter(o=>/^r55_stove_lid_\d$/.test(o.name)).length,3);assert.equal(items.filter(o=>/^r55_stove_ring_\d$/.test(o.name)).length,3);
 assert.equal(items.some(o=>/^stove_(body|rim|pot|lid|mouth)/.test(o.name)),false);
 const changed=rows.filter(r=>r.target&&r.name!=='COL_stove');assert.ok(changed.length>100);assert.ok(changed.flatMap(r=>r.world).every(p=>p[1]<=.430001));
 const p=root.getObjectByName('COL_stove'),b=new THREE.Box3().setFromObject(p);assert.ok(Math.abs(b.max.y-.43)<1e-6);assert.ok(Math.abs(b.max.x-b.min.x-4)<1e-6);assert.ok(Math.abs(b.max.z-b.min.z-2.3)<1e-6);
});
test('all non-stove R54 triangles, vertex attributes, winding, material identity and transforms remain exact',()=>{
 assert.deepEqual(rows.filter(r=>!r.target).map(r=>r.key).sort(),prior.filter(r=>!r.target).map(r=>r.key).sort());
 assert.deepEqual(inventory(root).filter(r=>!/^stove_|^r55_stove_|^COL_stove$/.test(r.name)),inventory(old).filter(r=>!/^stove_|^r55_stove_|^COL_stove$/.test(r.name)));
 const {gltf}=rawGLB(),oldGLTF=rawGLB(OLD_MODEL).gltf,names=new Set(rows.filter(r=>!r.target).map(r=>r.material));
 for(const name of names){assert.deepEqual(gltf.materials.find(m=>m.name===name),oldGLTF.materials.find(m=>m.name===name),name);}
 assert.deepEqual(contract(root).glyphMetrics,contract(old).glyphMetrics);
});
test('low stovetop has actual visible .43m support across slab and all three flush lids',()=>{
 const objects=[];root.traverse(o=>{if(o.isMesh&&!o.name.startsWith('COL_'))objects.push(o);});
 const ray=new THREE.Raycaster(),items=inventory(root),points=[[-7.05,4.725],[-3.25,4.725],[-5.15,6.8],...items.filter(i=>/^r55_stove_lid_\d$/.test(i.name)).map(i=>[(i.min[0]+i.max[0])/2,(i.min[2]+i.max[2])/2])];
 for(const [x,z]of points){ray.set(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObjects(objects).find(h=>h.point.y<1);assert.ok(h,`visible top at ${x},${z}`);assert.ok(Math.abs(h.point.y-.43)<1e-6,JSON.stringify(h?.point));}
});
test('source and fit metadata keep documented measurements distinct from source width versus fitted plan and unverified pot order',()=>{
 const m=config.refinement;assert.equal(m?.id,'r55-kunning-low-stoves');assert.equal(m.dimensionStatus,'SOURCE_HEIGHT_WITH_REVERSIBLE_PLAN_FIT_NOT_SURVEYED');
 assert.equal(m.sourceMeasurements.aboveGroundHeightMm,430);assert.deepEqual(m.sourceMeasurements.potDiametersMm,[1050,1360,1160]);assert.equal(m.sourceMeasurements.reportedTotalWidthMm,2160);
 assert.match(m.sourceMeasurements.widthAmbiguity,/2160.*3570/);assert.equal(m.sourceMeasurements.summaryTablePrintedPage,508);assert.equal(m.sourceMeasurements.summaryTableWidthMm,2160);assert.equal(m.sourceMeasurements.summaryTableLengthDescription,'通面阔');assert.equal(m.modelFit.eastWestPotOrderVerified,false);assert.equal(m.captureDate,null);assert.equal(m.status,'BOUNDED_GROUND_STOVE_PARTIAL_NOT_FULL_RESTORATION');
 assert.equal(m.rollbackModel,OLD_MODEL);assert.equal(contract(root).sourceSHA256,hash(fs.readFileSync(new URL('assets-src/interiors/kunning.py',ROOT))));
});
test('actual encoded asset statistics and triangle quality stay within bounded delta',()=>{
 const {bytes,gltf,bin}=rawGLB();assert.equal(hash(bytes),config.asset.sha256);assert.equal(bytes.length,config.asset.encodedBytes);assert.equal(hash(bin),config.asset.geometryBinSHA256);
 assert.equal(rows.filter(r=>!r.name.startsWith('COL_')).length,config.asset.renderableTriangles);assert.equal(rows.filter(r=>r.name.startsWith('COL_')).length,96);assert.ok(rows.length-prior.length<=4000);
 assert.equal(gltf.images?.length??0,0);assert.equal(gltf.textures?.length??0,0);assert.equal(gltf.extensionsUsed?.includes('KHR_lights_punctual')??false,false);
 for(const row of rows.filter(r=>r.target)){assert.ok(row.world.flat().every(Number.isFinite));const p=row.world.map(v=>new THREE.Vector3(...v));const normal=new THREE.Vector3().subVectors(p[1],p[0]).cross(new THREE.Vector3().subVectors(p[2],p[0]));assert.ok(normal.length()>1e-9,'nonzero triangle '+row.name);if(row.vertices[0].normal)assert.ok(normal.dot(new THREE.Vector3(...row.vertices[0].normal))>0,'consistent winding '+row.name);}
});

test('new stove has no volumetric overlap with preserved S furniture, especially the north kang',()=>{
 const box=new THREE.Box3().setFromObject(root.getObjectByName('COL_stove')).expandByScalar(-.00001);
 for(const row of rows.filter(r=>!r.target&&!r.name.startsWith('COL_'))){const t=new THREE.Triangle(...row.world.map(v=>new THREE.Vector3(...v)));assert.equal(box.intersectsTriangle(t),false,'new stove overlaps retained '+row.name);}
});

test('flat covers have real recessed iron seats, not unsupported floating disks',()=>{
 const items=inventory(root);for(let i=0;i<3;i++){const lid=items.find(o=>o.name===`r55_stove_lid_${i}`),seat=items.find(o=>o.name===`r55_stove_lid_seat_${i}`);assert.ok(seat);assert.ok(Math.abs(lid.min[1]-seat.max[1])<1e-6);assert.ok(seat.min[0]<lid.min[0]&&seat.max[0]>lid.max[0]);}
});

test('slab holes and iron outer rings share every corner contour without deep seams',()=>{
 const objects=[];root.traverse(o=>{if(o.isMesh&&!o.name.startsWith('COL_'))objects.push(o);});const items=inventory(root),ray=new THREE.Raycaster();
 for(let i=0;i<3;i++){const lid=items.find(o=>o.name===`r55_stove_lid_${i}`),top=items.find(o=>o.name===`r55_stove_top_${i}`),cx=(lid.min[0]+lid.max[0])/2,cz=(lid.min[2]+lid.max[2])/2,R=[.525,.680,.580][i]+.018;
  for(const x of[top.min[0],top.max[0]])for(const z of[top.min[2],top.max[2]]){const angle=(Math.atan2(z-cz,x-cx)+Math.PI*2)%(Math.PI*2),step=Math.PI*2/40,oldPolygonR=R*Math.cos(step/2)/Math.cos(angle%step-step/2),r=(R+oldPolygonR)/2;ray.set(new THREE.Vector3(cx+r*Math.cos(angle),1,cz+r*Math.sin(angle)),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(objects)[0];assert.ok(hit&&Math.abs(hit.point.y-.43)<1e-6,`pot ${i} corner seam must be flush, not drop to .35m`);}
 }
});
