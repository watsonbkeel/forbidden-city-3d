import fs from 'node:fs';
import * as THREE from '/workspace/scratch/02a8023d1a85/r50-female-reference/node_modules/three/build/three.module.js';
import {createCharacterGeometry as build,CHARACTER_TEMPLATES} from '/workspace/scratch/02a8023d1a85/r50-female-reference/src/scene/characters/CharacterKit.js';
const eq=(c,i,hex)=>{const t=new THREE.Color(hex);return Math.abs(c.getX(i)-t.r)<t.r*.05&&Math.abs(c.getY(i)-t.g)<t.g*.05&&Math.abs(c.getZ(i)-t.b)<t.b*.05;};
const stats=a=>({min:Math.min(...a),max:Math.max(...a)});
const cases=[];
for(const id of ['consort-daily','maid-daily']){
 const g=build(id),p=g.attributes.position,c=g.attributes.color,part=g.attributes.characterPart;
 const skin=[],hair=[],shoulders=[],sleeves=[];
 for(let i=0;i<p.count;i++){const xyz=[p.getX(i),p.getY(i),p.getZ(i)];if(part.getX(i)===1&&xyz[1]>1.451){if(eq(c,i,0xdbb294))skin.push(xyz);if(eq(c,i,0x201c1b))hair.push(xyz);}if(xyz[1]>=1.29&&xyz[1]<=1.37&&[0,2,3].includes(part.getX(i)))shoulders.push(xyz[0]);if([2,3].includes(part.getX(i))&&eq(c,i,CHARACTER_TEMPLATES[id].robe))sleeves.push(xyz[0]);}
 // Hair color is read from authored HAIR constant via darkest head region if unavailable.
 if(!hair.length)for(let i=0;i<p.count;i++)if(part.getX(i)===1&&p.getY(i)>1.49&&c.getX(i)<.025&&c.getY(i)<.025&&c.getZ(i)<.025)hair.push([p.getX(i),p.getY(i),p.getZ(i)]);
 const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),mesh=new THREE.Mesh(g,material);mesh.updateMatrixWorld();
 const crownRays=[1.650,1.675,1.700,1.705].map(y=>{const hits=new THREE.Raycaster(new THREE.Vector3(.2,y,-.008),new THREE.Vector3(-1,0,0)).intersectObject(mesh);return {y,rightmostSurfaceX:hits[0]?.point.x};});
 cases.push({id,standingSkullTop:Math.max(...skin.map(p=>p[1])),standingHairTop:Math.max(...hair.map(p=>p[1])),hairWidth:stats(hair.map(p=>p[0])).max-stats(hair.map(p=>p[0])).min,shoulderBandY:[1.29,1.37],shoulderBandWidth:stats(shoulders).max-stats(shoulders).min,fullSleeveWidth:stats(sleeves).max-stats(sleeves).min,crownRays});g.dispose();material.dispose();
}
const g=build('consort-daily','seated',0,{seatVariant:'kang-low'}),p=g.attributes.position,c=g.attributes.color,part=g.attributes.characterPart,indices=[];
for(let i=0;i<g.index.count;i+=3){const ids=[0,1,2].map(k=>g.index.getX(i+k));if(ids.every(j=>[0,6].includes(part.getX(j))&&eq(c,j,CHARACTER_TEMPLATES['consort-daily'].robe)))indices.push(...ids);}
const cloth=new THREE.BufferGeometry();cloth.setAttribute('position',p);cloth.setIndex(indices);const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),mesh=new THREE.Mesh(cloth,material);mesh.updateMatrixWorld();
const samples=[];
for(let i=0;i<p.count;i++)if([2,3].includes(part.getX(i))&&eq(c,i,0xdbb294)&&p.getZ(i)>.295&&p.getY(i)<.76){const origin=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i));const hits=new THREE.Raycaster(origin,new THREE.Vector3(0,-1,0),0,.4).intersectObject(mesh);if(hits.length)samples.push({handVertex:i,handPart:part.getX(i),point:origin.toArray(),surfaceY:hits[0].point.y,verticalGap:hits[0].distance});}
const result={kitSourceSha256:'16bb5ead7c3c1aa74e1b4327c37875c521dd23835f7d4f493725d455fd9b1929',units:'metres',method:'Read-only original-scale L0 geometry. Crown rays use actual triangles; shoulder bands are full cloth extents. Seated rays descend from actual skin hand/forearm vertices over the robe, excluding arm/sleeve triangles. This is a vertical clearance measurement, not physical hand support validation.',cases,seatedLapClearance:{sampleCount:samples.length,verticalGap:stats(samples.map(s=>s.verticalGap)),closest:samples.reduce((a,b)=>a.verticalGap<b.verticalGap?a:b),farthest:samples.reduce((a,b)=>a.verticalGap>b.verticalGap?a:b),status:'Hands overlap but remain above the actual lap shell. Do not claim hands rest on knees/lap.'}};
fs.writeFileSync('/workspace/scratch/02a8023d1a85/r50-female-reference/reports/r50-followup/female-reference/validation/candidate06-readonly-measurements.json',JSON.stringify(result,null,2),{flag:'wx'});console.log(JSON.stringify(result,null,2));
