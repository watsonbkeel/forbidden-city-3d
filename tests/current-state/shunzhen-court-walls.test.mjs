import assert from 'node:assert/strict';
import {after,before,test} from 'node:test';
import * as T from 'three';
import {createCanvas} from '@napi-rs/canvas';
import garden from '../../data/zones/garden.json' with {type:'json'};
import {PLAYER} from '../../src/config/constants.js';
import {GardenBuilder} from '../../src/scene/GardenBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {triangleFootContact} from '../../src/utils/TriangleSupport.js';
import {installCpuDocument} from '../lib/finished-world-lifecycle.mjs';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';

const v=(x,y,z)=>new T.Vector3(x,y,z), id='shunzhen-low-court-walls';
const gateIds=['chengguang-source-fit','yanhe-source-fit','jifu-source-fit','garden/shunzhen-gates'];
let dom,lib,zone,data,landscape,scene,cm,raw,gates,oldNorthWall,record;
before(()=>{
  dom=installCpuDocument(createCanvas);lib=createActualLibrary();
  scene=new T.Scene();landscape=new GardenBuilder(scene,lib.library).build(PALACE_LAYOUT.find(p=>p.type==='garden'));
  zone=new ZoneBase(lib.library,garden);
  const finish=zone.kit.finish.bind(zone.kit);
  zone.kit.finish=()=>{
    const root=zone.kit.root;root.updateMatrixWorld(true);
    const bounds=m=>new T.Box3().setFromObject(m);
    const snapshot=frame=>frame?.children.flatMap(m=>{
      const rows=[];m.traverse(n=>{if(n.isMesh)rows.push({name:n.name,material:n.material,box:bounds(n),normals:n.geometry.attributes.normal});});return rows;
    });
    gates=new Map(gateIds.map(key=>{
      const frame=root.children.find(f=>f.userData.structure?.id===key);
      assert.ok(frame,'live retained owner '+key);
      return [key,{meshes:snapshot(frame),structure:frame.userData.structure,position:frame.position.clone()}];
    }));
    raw=root.children.filter(f=>f.userData.shunzhenCourtWall).map(f=>({
      id:f.userData.shunzhenCourtWall,meshes:snapshot(f),box:bounds(f),
    }));
    oldNorthWall=zone.kit.colliders.filter(box=>box.max.y===3&&box.min.z>=517.7&&box.max.z<=518.9&&
      box.max.x-box.min.x>20&&box.min.y===0);
    return finish();
  };
  data=zone.build();scene.add(data.group);scene.updateMatrixWorld(true);
  cm=new CollisionManager();cm.addColliders(data.colliders,'garden');cm.addWalkables(data.walkables,'garden');
  cm.addColliders(landscape.getColliders(),'garden-static');cm.addWalkables(landscape.getWalkables(),'garden-static');
  record=data.group.userData.architecture.find(r=>r.id===id);
});
after(()=>{try{cm?.clear();zone?.dispose();landscape?.dispose();lib?.dispose();}finally{dom?.restore();}});

const ground=(x,z)=>cm.getGroundHeight(x,z,0,PLAYER.STEP_UP,.5);
const hit=(x,z)=>cm.checkCollision(v(x,PLAYER.HEIGHT,z),.5);
const maxOverlap=(a,b)=>a.clone().intersect(b).getSize(new T.Vector3());
const cap=m=>m.material.name==='shunzhen-court-ochre-glazed-cap';
const trim=m=>m.material.name==='shunzhen-court-green-eave-trim';
const pieces=()=>raw.filter(row=>row.id===id+'-east-front'||row.id===id+'-west-front'||
  row.id===id+'-east-return'||row.id===id+'-west-return');
const part=(row,name)=>row.meshes.find(m=>m.name.endsWith('/'+name));
const solid=row=>part(row,'red-masonry').box.clone().union(part(row,'stone-foot').box);

test('Shunzhen small court has four low rendered wall arms and attached, genuinely glazed two-slope caps',()=>{
  assert.equal(raw.length,4,'four wall arms are absent or not uniquely constructed by the live Garden');
  assert.equal(pieces().length,4);
  assert.equal(new Set(raw.map(row=>row.id)).size,4);
  assert.equal(record.dimensionStatus,'ENGINEERING_FIT_NOT_SURVEY');
  assert.equal(record.siteAccessVerified,false);
  assert.equal(record.sources.length,5);
  const merged=data.group.children.filter(m=>m.isMesh&&cap(m));
  assert.equal(merged.length,1,'the real merged Garden must submit the caps');
  assert.ok(merged[0].geometry.attributes.position.count>100);
  for(const row of raw){
    assert.ok(row.box.min.y>=-1e-5&&row.box.min.y<=1e-5&&row.box.max.y>=2.4&&row.box.max.y<=3.2,row.id);
    const body=part(row,'red-masonry'),stone=part(row,'stone-foot');
    assert.equal(body.material.name,'wall_red_material');
    assert.equal(stone.material.name,'stone_slab_material');
    assert.ok(stone.box.min.y===0&&stone.box.max.y>.15&&Math.abs(stone.box.max.y-body.box.min.y)<1e-6);
    const glaze=row.meshes.find(cap),eave=row.meshes.find(trim);
    assert.ok(glaze&&eave,row.id+' roof and green edging');
    assert.ok(glaze.material.map&&glaze.material.color.r>glaze.material.color.g&&glaze.material.color.g>glaze.material.color.b);
    assert.ok(eave.material.color.g>eave.material.color.r&&eave.material.color.g>eave.material.color.b);
    assert.ok(Math.abs(glaze.box.min.y-eave.box.max.y)<1e-6&&Math.abs(eave.box.min.y-body.box.max.y)<1e-6);
    const n=glaze.normals,across=row.id.endsWith('-front')?i=>n.getZ(i):i=>n.getX(i);
    const sloped=Array.from({length:n.count},(_,i)=>i).filter(i=>n.getY(i)>.5&&n.getY(i)<.99);
    assert.ok(sloped.some(i=>across(i)>.25)&&sloped.some(i=>across(i)<-.25),row.id+' both roof pitches exist');
  }
  // Actual merged roof rays: the center ridge is higher than each side.
  for(const x of [-7,8]){
    const height=z=>new T.Raycaster(v(x,5,z),v(0,-1,0),0,5).intersectObject(merged[0])[0]?.point.y;
    const ridge=height(513.48),edgeA=height(513.24),edgeB=height(513.72);
    assert.ok(ridge>edgeA+.15&&ridge>edgeB+.15,'real roof slopes across '+x);
  }
});

test('Low wall masonry closes every physical joint without spilling into an existing Shunzhen portal',()=>{
  const retain=(key,suffix)=>gates.get(key).meshes.filter(m=>m.name.endsWith('/'+suffix)).map(m=>m.box);
  const owners=data.colliders.filter(m=>m.shunzhenCourtWall?.startsWith(id+'-'));
  assert.equal(owners.length,4,'four missing real wall collider bodies');
  assert.equal(oldNorthWall.length,2,'existing north wall hosts stay separate');
  for(const sign of [-1,1]){
    const side=sign<0?'east':'west',gate=sign<0?'yanhe-source-fit':'jifu-source-fit';
    const front=pieces().find(r=>r.id.endsWith(side+'-front'));
    const back=pieces().find(r=>r.id.endsWith(side+'-return'));
    const seam=(row,old)=>assert.ok(old.some(box=>{
      const overlap=maxOverlap(solid(row),box);
      return overlap.x>1e-3&&overlap.z>1e-3&&overlap.y>1.6;
    }),row.id+' joins actual solid neighboring jamb or north wall');
    seam(front,retain('chengguang-source-fit','short-side-pier'));
    seam(front,retain(gate,'jamb'));
    seam(back,retain(gate,'short-side-pier'));
    seam(back,oldNorthWall);
    for(const row of [front,back]){
      const owner=owners.find(o=>o.shunzhenCourtWall===row.id);
      assert.ok(owner?.triangleSupport?.id===row.id&&owner.min.distanceTo(row.box.min)<1e-5&&owner.max.distanceTo(row.box.max)<1e-5,row.id+' triangle owner matches rendered shell');
      const mid=solid(row).getCenter(new T.Vector3());
      assert.equal(hit(mid.x,mid.z),true,row.id+' blocks a standing body');
      assert.equal(ground(mid.x,mid.z),0,row.id+' must not be an invisible floor');
    }
  }
  for(const x of [-6.6,.5,7.6])for(const z of [516.1,517.3,518.3,520.3])
    assert.equal(hit(x,z),false,`unchanged north portal ${x},${z}`);
  assert.equal(data.mapItems.filter(i=>i.name==='顺贞门').length,1);
  for(const x of [-7,8]){
    const top=cm.supportContact(x,513.48,4,.25);
    assert.ok(top?.instanceId?.startsWith(id+'-')&&Math.abs(top.height-2.62)<1e-5,'roof contact comes from the visible tiled ridge');
    const shape=owners.find(o=>o.shunzhenCourtWall===top.instanceId).triangleSupport;
    const slope=triangleFootContact(shape,x,513.72,.05,4);
    assert.ok(slope?.instanceId===top.instanceId&&slope.height<top.height-.14&&slope.height>2.3,'real angle in the collider, not a buried flat support');
    // A tiny foot probe reaches the eave; the standing body would still
    // overlap the higher ridge and must not be placed at that lower height.
    assert.equal(cm.supportContact(x,513.72,4,.05),null);
    assert.ok(Math.abs(cm.supportContact(x,513.72,4,.5)?.height-2.62)<1e-5);
    assert.equal(cm.supportContact(x,513.48,2.4,.25),null,'does not stand inside the opaque cap');
  }
  assert.equal(data.rooms.some(r=>r.name?.includes('顺贞门')),false);
});

for(const [sign,side,gate] of [[-1,'east','Yanhe'],[1,'west','Jifu']])
  test(`Standing player enters and returns via ${side} ${gate} gate without jumping or crouching`,t=>{
    const z=514.4;
    const signed=sign<0?-6.6:7.6;
    const points=[[sign*17,z],[sign*10,z],[signed,515.9],[signed,521.8],
      [signed,515.9],[sign*10,z],[sign*17,z]];
    for(const fps of [10,60]) {
      assert.equal(hit(...points[0]),false);
      const r=replayKunning(t,{THREE:T,cm},points,{fps,sprint:false,startFeet:0,recordFrames:true});
      assert.equal(r.arrived,true,JSON.stringify({fps,side,stuckAt:r.stuckAt,end:r.end}));
      assert.ok(r.frames.some(f=>f.z>520.8),side+' reaches the north exterior');
      assert.ok(r.frames.some(f=>Math.abs(f.x-sign*13.3)<.32&&Math.abs(f.z-z)<.35),side+' actually uses its gate');
      assert.ok(r.frames.every(f=>f.feet>=-1e-6&&f.feet<=.11),side+' walks floor and existing stone thresholds');
      assert.equal(r.driver.crossings.length,points.length-1);
      assert.ok(Math.abs(r.end[1]-z)<.65 && sign*r.end[0]>=16.99,JSON.stringify({fps,end:r.end}));
    }
  });

test('Existing open Chengguang axial gameplay stays distinct from museum closing and the low wall blocks new cut-throughs',t=>{
  assert.equal(gates.get('chengguang-source-fit').structure.officialClosedState,true);
  assert.equal(gates.get('chengguang-source-fit').structure.gameLeafState,'OPEN_GAMEPLAY_ADAPTATION');
  const play=pts=>replayKunning(t,{THREE:T,cm},pts,{fps:60,startFeet:0,recordFrames:true});
  const axial=play([[.5,509.3],[.5,515.2],[.5,521.8],[.5,509.3]]);
  assert.equal(axial.arrived,true,JSON.stringify({end:axial.end,stuckAt:axial.stuckAt}));
  for(const x of [-5,6]){
    const start=[x,510.7],end=[x,514.4];assert.equal(hit(...start),false);
    const cut=play([start,end]);
    assert.equal(cut.arrived,false,'solid courtyard wall must prevent cutting across '+x);
    // 513.48 wall-center, 0.18 masonry half-width, 0.5 full standing footprint.
    const face=513.48-.18-.5;
    assert.ok(hit(x,face+.02)&&!hit(x,face-.05),'real contact on the masonry face');
    assert.ok(cut.end[1]>face-.15&&cut.end[1]<=face+1e-5,JSON.stringify(cut.end));
    assert.equal(hit(x,cut.end[1]),false,'no AABB overfill in front of the diagonal-jog envelope');
  }
});

test('A partial Garden with Shunzhen but no side gates can still build the standalone Chengguang gate',async()=>{
  const {CourtKit}=await import('../../src/scene/palace/kit.js');
  const {buildShunzhenGate}=await import('../../src/scene/palace/special/ShunzhenGate.js');
  const {buildChengguangGate}=await import('../../src/scene/palace/special/ChengguangGate.js');
  const kit=new CourtKit(lib.library,'garden');
  try{
    buildShunzhenGate(kit,garden.items.find(item=>item.gateProfile==='shunzhen'));
    const result=buildChengguangGate(kit,'garden');
    assert.equal(result.meta.id,'chengguang-source-fit');
    assert.equal(kit.root.children.filter(child=>child.userData.shunzhenCourtWall).length,0);
  }finally{kit.dispose(kit.root);}
});
