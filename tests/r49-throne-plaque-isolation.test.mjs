import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import './lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from './lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CourtKit} from '../src/scene/palace/kit.js';

test('Taiji retained throne relocation never moves its same-material exterior plaque frame',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
 const item=d.items.find(i=>i.name==='太极殿'),lib=realTextureLibrary(),b=new ZoneBase(lib,d);
 try {b.buildHall(item);const p=b.kit.plaques.find(p=>p.text==='太极殿');assert.ok(p);
 const frames=p.mesh.parent.children.filter(m=>m.isMesh&&m.material===b.kit.gold&&Math.abs((m.geometry.parameters?.width??0)-(p.mesh.geometry.parameters.width+.12))<1e-8);
 assert.equal(frames.length,1);assert.ok(Math.abs(frames[0].position.z-p.mesh.position.z-.06)<1e-8,'plaque backing remains 6 cm behind its text, never translated with throne');
 assert.equal(frames[0].position.y,p.mesh.position.y);
 const moved=p.mesh.parent.children.filter(m=>m.userData.placementStatus==='RETAINED_PLACEHOLDER_MOVED_FOR_RECESSED_REAR_WALL_CLEARANCE');
 assert.equal(moved.length,4);assert.ok(moved.every(m=>m.userData.role==='retained-throne-component'));
 }finally{b.kit.dispose(b.kit.root);lib.dispose();}
});

test('Generic throne components have explicit identities, distinct from gold plaque backing',()=>{
 const lib=realTextureLibrary(),kit=new CourtKit(lib,'semantic-check');
 try{const {f}=kit.hall({x:0,z:0,w:27,d:14,ph:.6,colH:6.72,bays:5,throne:true,enter:true,name:'测试殿'});
 const parts=f.children.filter(m=>m.userData.role==='retained-throne-component');assert.equal(parts.length,4);assert.equal(new Set(parts.map(m=>m.userData.thronePart)).size,4);
 assert.ok(kit.plaques.every(p=>p.mesh.userData.role!=='retained-throne-component'));
 }finally{kit.dispose(kit.root);lib.dispose();}
});

test('Nameboard mount uses its registered backing identity, not a shared material or dimensions',async()=>{
 const {fitRegisteredNameboard}=await import('../src/scene/palace/special/FittedNameboardMount.js');
 const lib=realTextureLibrary(),kit=new CourtKit(lib,'semantic-mount');
 try{const {f}=kit.hall({x:0,z:0,w:27,d:14,ph:.6,colH:6.72,bays:5,throne:true,enter:true,name:'测试殿'});
 const p=kit.plaques[0],sentinel=p.frame.clone();f.add(sentinel);const old=sentinel.position.clone(),scale=sentinel.scale.clone();
 fitRegisteredNameboard(kit,f,'测试殿',{z:-8,y:4,width:1.05,height:1.5});
 assert.ok(sentinel.position.equals(old)&&sentinel.scale.equals(scale),'same-material same-size decoration remains untouched');
 assert.equal(p.frame.position.z,p.mesh.position.z+.06);assert.equal(p.mesh.position.y,4);
 assert.ok(Math.abs(p.frame.geometry.parameters.height*p.frame.scale.y-1.62)<1e-8);
 }finally{kit.dispose(kit.root);lib.dispose();}
});
