// Bounded local report; never builds or reconstructs the full world.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {mock} from 'node:test';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library,hash,serial} from './lib/inner-palace-fixture.mjs';
import {buildR61JingyangRearBaseline} from './lib/r62-jingyang-rear-baseline.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {buildJingyangRearFacade} from '../src/scene/palace/special/JingyangRearFacade.js';
import {assertJingyangRearFacadeInWorld,replayJingyangRearFacadeInWorld,JINGYANG_REAR_ROUTE} from './lib/r62-jingyang-rear-world-check.mjs';
const zone=JSON.parse(fs.readFileSync('data/zones/east-six.json')),item=zone.items[38];
const make=after=>{const b=new ZoneBase(library(),zone),result=after?buildJingyangRearFacade(b.kit,item,zone.id):buildR61JingyangRearBaseline(b,item);b.kit.root.updateMatrixWorld(true);return{b,...result};};
const before=make(false),after=make(true);
const meshRows=f=>{const rows=[];f.traverse(m=>{if(m.isMesh)rows.push({material:m.material?.name,position:m.position.toArray(),rotation:m.rotation.toArray(),geometry:m.geometry.type,parameters:m.geometry.parameters??null,triangles:(m.geometry.index?.count??m.geometry.attributes.position.count)/3});});return rows;};
const snapshot=o=>{const meshes=meshRows(o.f);return{meshCount:meshes.length,triangles:meshes.reduce((n,m)=>n+m.triangles,0),columns:meshes.filter(m=>m.geometry==='CylinderGeometry'&&m.material==='wood_column'),centralDoorLeaves:meshes.filter(m=>m.material==='lattice_doors'&&Math.abs(m.rotation[1])>1),colliders:o.b.kit.colliders.map(serial),walkables:o.b.kit.walkables,rooms:o.b.kit.rooms,map:o.b.kit.mapItems};};
const a=snapshot(before),b=snapshot(after),diff=(left,right)=>left.filter(x=>!right.some(y=>hash(x)===hash(y))),report={objectId:'FC-8B02DC003C',baseCommit:'6b396800b6a03582aebf513fcef4966e9f5d0db3',sourceSha256:createHash('sha256').update(fs.readFileSync('src/scene/palace/special/JingyangRearFacade.js')).digest('hex'),before:a,after:b,colliderDelta:{removed:diff(a.colliders,b.colliders),added:diff(b.colliders,a.colliders)},roomUnchanged:hash(a.rooms)===hash(b.rooms),walkablesUnchanged:hash(a.walkables)===hash(b.walkables),mapUnchanged:hash(a.map)===hash(b.map),route:JINGYANG_REAR_ROUTE,scope:'LOCAL_REAL_BUILD_AND_MERGE_ONLY_NOT_FULL_WORLD_OR_BROWSER_ACCEPTANCE',routeRuns:[]};
const cm=new CollisionManager();cm.rivers=[];cm.addColliders(after.b.kit.colliders);cm.addWalkables(after.b.kit.walkables);const scene=after.b.kit.finish(),W={scene,cm};report.mergedAssertions=assertJingyangRearFacadeInWorld(W);
for(const fps of[10,60]){const r=replayJingyangRearFacadeInWorld({mock},W,{fps});report.routeRuns.push({...r,frames:r.frames.length});}
fs.mkdirSync('reports/r62-jingyang-rear/optimized',{recursive:true});fs.writeFileSync('reports/r62-jingyang-rear/optimized/local-contract.json',JSON.stringify(report,null,2)+'\n');before.b.kit.dispose(before.f);after.b.kit.dispose(scene);
console.log(JSON.stringify({beforeMeshes:a.meshCount,afterMeshes:b.meshCount,beforeTriangles:a.triangles,afterTriangles:b.triangles,beforeColliders:a.colliders.length,afterColliders:b.colliders.length,removedColliders:report.colliderDelta.removed.length,addedColliders:report.colliderDelta.added.length,routeRuns:report.routeRuns.map(r=>({fps:r.fps,arrived:r.arrived,frames:r.frames,maxFeet:r.maxFeet}))},null,2));
