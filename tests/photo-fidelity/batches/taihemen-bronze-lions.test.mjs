import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';
import {library} from '../../lib/inner-palace-fixture.mjs';
const url=new URL('../../../src/scene/palace/TaihemenBronzeLions.js',import.meta.url);
for(const side of ['east','west'])test(`${side} lion's ball/cub and raised paw face the central axis in actual world geometry`,async()=>{
 const {TAIHEMEN_BRONZE_LIONS:profiles,buildTaihemenBronzeLions:build}=await import(url),b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();g.name='太和门';b.addObject(g);
 try{build(b,g);g.updateMatrixWorld(true);const p=profiles.find(p=>p.side===side),lion=g.getObjectByName(p.id),inward=-Math.sign(p.x),parts=[],paws=[];
  lion.traverse(m=>{const role=m.userData.lionPart;if(role?.startsWith(side==='east'?'ball':'cub-'))parts.push(m);if(role==='paw')paws.push(m);});
  assert.ok(parts.length>=3);for(const m of parts)assert.ok((m.getWorldPosition(new T.Vector3()).x-p.x)*inward>.2,`${side} ${m.userData.lionPart} points away from axis`);
  const raised=paws.sort((a,b)=>b.position.y-a.position.y)[0];assert.ok((raised.getWorldPosition(new T.Vector3()).x-p.x)*inward>0,`${side} raised paw must be above the inward motif`);
 }finally{b.dispose();}
});
test('Taihemen has an independently source-identified pair, not a generic mirrored ornament',async()=>{
 assert.ok(fs.existsSync(url),'missing Taihemen paired bronze-lion implementation');
 const {TAIHEMEN_BRONZE_LIONS:profiles,buildTaihemenBronzeLions:build}=await import(url);
 const b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();g.name='太和门';b.addObject(g);
 try{const pair=build(b,g);assert.equal(pair.length,2);assert.equal(profiles.length,2);
  for(const side of ['east','west']){const p=profiles.find(p=>p.side===side),lion=g.getObjectByName(p.id);assert.ok(lion);assert.equal(lion.userData.structure.accepted,false);assert.equal(p.side==='east'?p.x<0:p.x>0,true);assert.ok(p.z<-240&&p.z>-247);
   const roles=[];lion.traverse(m=>{if(m.isMesh)roles.push(m.userData.lionPart);});
   for(const role of ['stone-plinth','bronze-pedestal','haunch','chest','mane','muzzle','paw','bell'])assert.ok(roles.includes(role),`${side}: missing ${role}`);
   assert.equal(roles.includes('ball'),side==='east');assert.equal(roles.includes('cub-head'),side==='west');
   const bounds=new T.Box3().setFromObject(lion),size=bounds.getSize(new T.Vector3());assert.ok(size.y>3.5&&size.y<4.7);assert.ok(size.x<3.1&&size.z<3.7);
   const records=b.colliders.filter(c=>c.structureId===p.id);assert.ok(records.length>=3);assert.ok(records.every(c=>c.min.x>p.x-1.7&&c.max.x<p.x+1.7&&c.min.z>p.z-1.9&&c.max.z<p.z+1.9));
  }
  assert.equal(b.walkables.length,0,'statues must not create invisible route floors');
  assert.ok(b.colliders.every(c=>c.max.x< -17||c.min.x>17),'leave the broad south central/stair route clear');
 }finally{b.dispose();}
});
test('lions reject wrong hosts and duplicate installs before mutating the host',async()=>{
 const {buildTaihemenBronzeLions:build}=await import(url),b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();g.name='太和门';b.addObject(g);
 try{assert.throws(()=>build(b,new T.Group()),/Taihemen/);assert.equal(b.colliders.length,0);build(b,g);const n=b.colliders.length;assert.throws(()=>build(b,g),/already installed/);assert.equal(b.colliders.length,n);assert.equal(g.children.length,2);}finally{b.dispose();}
});
test('late lion collision failure rolls both sculptures and owned resources back without altering retained fixtures',async()=>{
 const {buildTaihemenBronzeLions:build}=await import(url),b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();g.name='太和门';g.userData.retained=true;b.addObject(g);
 const original=b.col.bind(b);let calls=0;b.col=(...args)=>{if(++calls===6)throw Error('injected late lion collision');return original(...args);};
 try{assert.throws(()=>build(b,g),/injected late lion/);assert.equal(g.children.length,0);assert.equal(b.colliders.length,0);assert.equal(b.ownedMaterials.length,0);assert.equal(b._own.size,0);assert.deepEqual(g.userData,{retained:true});}finally{b.dispose();}
});
