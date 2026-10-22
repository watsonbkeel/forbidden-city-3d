import test from 'node:test';
import assert from 'node:assert/strict';
import { createCharacterGeometry, CHARACTER_TEMPLATES, CHARACTER_POSES } from '../src/scene/characters/CharacterKit.js';
import { CharacterResourcePool } from '../src/scene/characters/CharacterResourcePool.js';
import { deformCharacterVertex, CHARACTER_DEFORM_GLSL } from '../src/scene/characters/CharacterAnimation.js';

test('all seven identity templates provide valid merged geometry for three poses and three LODs', () => {
  assert.equal(Object.keys(CHARACTER_TEMPLATES).length, 7);
  assert.deepEqual(CHARACTER_POSES, ['standing', 'seated', 'kneeling']);
  for (const id of Object.keys(CHARACTER_TEMPLATES)) for (const pose of CHARACTER_POSES) {
    let previous=Infinity;
    for(let lod=0;lod<3;lod++) {
      const g=createCharacterGeometry(id,pose,lod);
      assert.equal(g.isBufferGeometry,true); assert.equal(g.groups.length,0);
      for(const name of ['position','normal','color','characterPart','characterPivot','characterWeight','characterTorsoWeight']) {
        assert.ok(g.getAttribute(name),`${id}/${pose}/${lod} ${name}`);
        assert.equal(g.getAttribute(name).count,g.getAttribute('position').count);
        assert.ok([...g.getAttribute(name).array].every(Number.isFinite));
      }
      const triangles=(g.index?.count ?? g.getAttribute('position').count)/3;
      assert.ok(triangles<previous,`${id}/${pose} LOD reduction`); previous=triangles;
      assert.ok(g.boundingBox.min.y>=-0.001); assert.ok(g.boundingBox.max.y<2.0);
      assert.equal(g.userData.templateId,id); assert.equal(g.userData.pose,pose);
      assert.ok(g.userData.groundContacts.length>=2);
      if(pose==='standing') assert.equal(g.userData.bodyHeightMeters,1.7);
      if(pose==='seated') assert.deepEqual(g.userData.seatPelvis,[0,0.57,-0.04]);
      assert.ok(g.userData.frontBackDecoration,true);
      g.dispose();
    }
  }
});
test('unknown inputs fail rather than generate a default identity or pose',()=>{
  assert.throws(()=>createCharacterGeometry('unknown'),/Unknown/);
  assert.throws(()=>createCharacterGeometry('guard-duty','wrong'),/Unknown/);
  assert.throws(()=>createCharacterGeometry('guard-duty','standing',7),/LOD/);
});
test('resource pool shares resources, retains referenced assets and disposes idempotently',()=>{
 const pool=new CharacterResourcePool(); const a=pool.acquire('guard-duty','standing',0); const b=pool.acquire('guard-duty','standing',0);
 assert.equal(a.geometry,b.geometry); assert.equal(a.key,b.key); assert.equal(pool.stats().references,2);
 let disposed=0; a.geometry.addEventListener('dispose',()=>disposed++);
 pool.release(a.key); assert.equal(pool.stats().references,1); assert.equal(disposed,0);
 pool.release(b.key); assert.equal(pool.stats().references,0); assert.equal(disposed,0);
 pool.dispose(); pool.dispose(); assert.equal(disposed,1); assert.equal(pool.stats().geometries,0);
 assert.throws(()=>pool.acquire('guard-duty','standing',0),/disposed/);
});
test('CPU animation is deterministic, preserves zero-weight seams and moves normals with parts',()=>{
 const p=[0.08,1.56,.12],n=[0,0,1],a={part:1,pivot:[0,1.43,0],weight:1,torsoWeight:1};
 const state={time:2,phase:0.3,amplitude:1,walkSpeed:0,pose:'standing'};
 const r=deformCharacterVertex(p,n,a,state),r2=deformCharacterVertex(p,n,a,state);
 assert.deepEqual(r,r2); assert.notDeepEqual(r.position,p); assert.notDeepEqual(r.normal,n);
 assert.ok(Math.abs(Math.hypot(...r.normal)-1)<1e-5);
 const still=deformCharacterVertex(p,n,a,{...state,amplitude:0}); assert.deepEqual(still.position,p);
 assert.ok(CHARACTER_DEFORM_GLSL.includes('characterDeform'));
});
test('garment side normals point outward for front-face culling',()=>{
 const g=createCharacterGeometry('guard-duty','standing',0),p=g.attributes.position,n=g.attributes.normal;
 // First garment ring is generated at the +Z front; its surface normal must face outward.
 assert.ok(n.getZ(28)>0,`front garment normal was ${n.getZ(28)}`);
});
test('distant LODs obey explicit geometric per-template budgets',()=>{
 for(const id of Object.keys(CHARACTER_TEMPLATES))for(const pose of CHARACTER_POSES){
  assert.ok(createCharacterGeometry(id,pose,1).userData.triangles<=1500,`${id}/${pose} L1`);
  assert.ok(createCharacterGeometry(id,pose,2).userData.triangles<=600,`${id}/${pose} L2`);
 }
});
test('seat variants preserve adult torso and expose truthful support contacts',()=>{
 const standard=createCharacterGeometry('emperor-ceremonial','seated',0);
 const raised=createCharacterGeometry('emperor-ceremonial','seated',0,{seatVariant:'raised-footstool'});
 const kang=createCharacterGeometry('consort-daily','seated',0,{seatVariant:'kang-low'});
 assert.deepEqual(raised.userData.seatPelvis,standard.userData.seatPelvis);
 assert.deepEqual(raised.userData.seatContact,standard.userData.seatContact);
 assert.equal(raised.boundingBox.max.y,standard.boundingBox.max.y);
 assert.deepEqual(raised.userData.groundContacts,[[-.12,.30,.815],[.12,.30,.815]]);
 assert.deepEqual(kang.userData.groundContacts,[[-.12,.04,.535],[.12,.04,.535]]);
 assert.equal(raised.userData.seatVariant,'raised-footstool');
 assert.throws(()=>createCharacterGeometry('guard-duty','seated',0,{seatVariant:'stretch-anything'}),/seat variant/);
 const pool=new CharacterResourcePool();const a=pool.acquire('emperor-ceremonial','seated',0);const b=pool.acquire('emperor-ceremonial','seated',0,{seatVariant:'raised-footstool'});
 assert.notEqual(a.key,b.key);assert.notEqual(a.geometry,b.geometry);assert.equal(pool.stats().entries,2);pool.dispose();
});
test('walking stance feet stay on ground and fixed in world while the root advances',()=>{
 const attributes={part:4,pivot:[-.105,.79,0],weight:1,torsoWeight:0},normal=[0,1,0],position=[-.105,0,.03];
 const a=deformCharacterVertex(position,normal,attributes,{time:.10,phase:0,amplitude:1,walkSpeed:.75,pose:'standing'});
 const b=deformCharacterVertex(position,normal,attributes,{time:.20,phase:0,amplitude:1,walkSpeed:.75,pose:'standing'});
 assert.ok(Math.abs(a.position[1])<1e-9);assert.ok(Math.abs(b.position[1])<1e-9);
 assert.ok(Math.abs((a.position[2]+.75*.10)-(b.position[2]+.75*.20))<1e-9);
 for(let i=0;i<100;i++){const r=deformCharacterVertex(position,normal,attributes,{time:i/100,phase:0,amplitude:1,walkSpeed:.75,pose:'standing'});assert.ok(r.position[1]>=-1e-8);assert.ok(r.position[1]<=.066);}
});
test('production ambient amplitude does not scale away physical gait support',async()=>{
 const {characterEnvironmentMotion}=await import('../src/scene/characters/CharacterBehavior.js');
 const actor={id:'production-patrol',templateId:'guard-duty',behavior:{seed:0,basePose:'standing'}};
 const a={part:4,pivot:[-.105,.79,0],weight:1,torsoWeight:0};
 const positions=[.05,.35].map(time=>{const motion=characterEnvironmentMotion(actor,time,.75);const r=deformCharacterVertex([-.105,0,.03],[0,1,0],a,motion);return r.position[2]+time*.75;});
 assert.ok(Math.abs(positions[0]-positions[1])<1e-8,`stance slip ${positions[1]-positions[0]}`);
 const noAmbient=deformCharacterVertex([-.105,0,.03],[0,1,0],a,{time:.1,phase:0,amplitude:0,walkSpeed:.75,poseIndex:0});
 assert.notEqual(noAmbient.position[2],.03);
});
test('seated garment has actual seat-contact surface, not only a metadata anchor',()=>{
 for(const seatVariant of ['standard','raised-footstool','kang-low']){
 const g=createCharacterGeometry('emperor-ceremonial','seated',0,{seatVariant}),p=g.attributes.position;
 let contactVertices=0;for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i)-.49)<1e-5&&Math.abs(p.getX(i))<.2&&Math.abs(p.getZ(i)+.04)<.19)contactVertices++;
 assert.ok(contactVertices>=12,`${seatVariant} actual contact vertices ${contactVertices}`);
 }
});
test('throne-front-perch bends over real footstool while clearing the throne front',()=>{
 const g=createCharacterGeometry('emperor-ceremonial','seated',0,{seatVariant:'throne-front-perch'}),standard=createCharacterGeometry('emperor-ceremonial','seated',0);
 assert.deepEqual(g.userData.groundContacts,[[-.12,.30,.58],[.12,.30,.58]]);
 assert.deepEqual(g.userData.seatContact,standard.userData.seatContact);
 assert.equal(g.boundingBox.max.y,standard.boundingBox.max.y);
 const p=g.attributes.position,part=g.attributes.characterPart;
 let bottom=0;for(let i=0;i<p.count;i++){
  if(part.getX(i)===4||part.getX(i)===5){assert.ok(p.getZ(i)>.37&&p.getZ(i)<.79,`shoe outside actual stool ${p.getZ(i)}`);if(Math.abs(p.getY(i)-.3)<.001)bottom++;}
  if(part.getX(i)===6&&p.getY(i)<.49)assert.ok(p.getZ(i)>.145,`robe behind throne seat front ${p.getZ(i)}`);
 }
 assert.ok(bottom>=16);
});
test('declared animation bounds cover transformed vertices across poses and gait phases',()=>{
 for(const pose of CHARACTER_POSES){
  const g=createCharacterGeometry('guard-duty',pose,0),at=g.attributes,b=g.boundingBox;
  assert.ok(g.userData.boundsPaddingMeters>=.20,'padding must cover full .15 m stance excursion plus upper-body motion');
  for(const time of [0,.07,.19,.35,.48,.63,.79,1.1,2.9])for(const amplitude of [0,.7,1])for(let i=0;i<at.position.count;i+=7){
   const v=k=>[at[k].getX(i),at[k].getY(i),at[k].getZ(i)];
   const r=deformCharacterVertex(v('position'),v('normal'),{part:at.characterPart.getX(i),pivot:v('characterPivot'),weight:at.characterWeight.getX(i),torsoWeight:at.characterTorsoWeight.getX(i)},{time,phase:.37,amplitude,walkSpeed:pose==='standing'?.75:0,pose});
   for(let axis=0;axis<3;axis++)assert.ok(r.position[axis]>=b.min.getComponent(axis)-g.userData.boundsPaddingMeters&&r.position[axis]<=b.max.getComponent(axis)+g.userData.boundsPaddingMeters,`${pose}/${time}/${i} axis ${axis} outside`);
  }
 }
});
test('CPU cloth center seam matches GLSL sign(0) instead of choosing a side',()=>{
 const p=[0,.10,.008],n=[0,-1,0];
 const r=deformCharacterVertex(p,n,{part:6,pivot:[0,.89,0],weight:1,torsoWeight:0},{time:.1,phase:.35,amplitude:1,walkSpeed:.75,pose:'standing'});
 for(let k=0;k<3;k++){assert.ok(Math.abs(r.position[k]-p[k])<1e-12);assert.ok(Math.abs(r.normal[k]-n[k])<1e-12);}
});
test('kang garment triangle edges remain outside the actual front face below seat top',()=>{
 for(const lod of [0,1,2]){const g=createCharacterGeometry('consort-daily','seated',lod,{seatVariant:'kang-low'}),p=g.attributes.position,part=g.attributes.characterPart,ids=g.index.array,cut=.489;
 let crossings=0;
 for(let j=0;j<ids.length;j+=3){if(part.getX(ids[j])!==6)continue;
  for(let k=0;k<3;k++){const a=ids[j+k],b=ids[j+(k+1)%3],ay=p.getY(a),by=p.getY(b);if((ay-cut)*(by-cut)>=0)continue;
   const t=(cut-ay)/(by-ay),z=p.getZ(a)+(p.getZ(b)-p.getZ(a))*t;crossings++;assert.ok(z>=.16,`cloth passes inside kang front z=${z} at y=${cut}`);
  }
 }
 assert.ok(crossings>20);}
});
