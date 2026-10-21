import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import * as THREE from 'three';
import { PLAYER } from '../src/config/constants.js';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { CollisionManager } from '../src/utils/Collision.js';
import { replayTerrace } from './lib/terrace-walk.mjs';
import * as api from '../src/scene/palace/special/RemainingOuterHalls.js';
const data=JSON.parse(readFileSync(new URL('../data/zones/outer-west.json',import.meta.url)));
class PreviewOuterZone extends ZoneBase {
  constructor(){super(library(),data);}
  buildHall(item){const p=api.resolveRemainingProfile(data.id,item);if(p?.mode==='replace')return api.buildRemainingHall(this.kit,item,p);const b=super.buildHall(item);return p?.mode==='augment'&&b.f.userData.remainingOuter?.id!==p.id?api.augmentRemainingHall(this.kit,item,b,p):b;}
}
const names=['宝相楼','吉云楼','慈荫楼','慈宁宫','大佛堂','寿安宫'];
for(const name of names)test(`R48 ${name} explicit primary entry follows actual whole-zone ground, ramp, door and inside`,()=>{
  const zone=new PreviewOuterZone(),built=zone.build(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);
  try {
    const p=api.resolveRemainingProfile(data.id,data.items.find(i=>i.name===name)),nav=p.navigation;
    assert.ok(nav.id);assert.ok(nav.approachPoints.length>=5);assert.ok(Math.abs(Math.hypot(nav.outwardNormal.x,nav.outwardNormal.z)-1)<1e-9);
    for(let i=1;i<nav.approachPoints.length;i++){
      const a=nav.approachPoints[i-1],b=nav.approachPoints[i],n=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.05));
      for(let j=0;j<=n;j++){
        const t=j/n,pt=new THREE.Vector3(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z+(b.z-a.z)*t),ground=cm.getGroundHeight(pt.x,pt.z,pt.y);
        assert.ok(Math.abs(ground-pt.y)<.065,`${name} segment ${i} t=${t} expected feet ${pt.y} actual ground ${ground} at ${pt.x},${pt.z}`);
        const head=pt.clone();head.y=ground+PLAYER.HEIGHT;
        if(process.env.R48_DEBUG_NAVIGATION&&cm.checkCollision(head))console.log(name,'colliding',pt,cm.queryBox(cm.playerBox).filter(c=>cm.playerBox.intersectsBox(c.box)).map(c=>({min:c.box.min,max:c.box.max})));
        assert.equal(cm.checkCollision(head),false,`${name} segment ${i} t=${t} body collision at ${pt.x},${pt.y},${pt.z}`);
      }
    }
    if(process.env.R48_WRITE_OUTER_NAVIGATION){const records=names.map(n=>api.resolveRemainingProfile(data.id,data.items.find(i=>i.name===n))).map(p=>({id:p.id,key:p.key,name:p.name,...p.navigation,feetConvention:`y is feet height; head height is y + PLAYER.HEIGHT (${PLAYER.HEIGHT})`,player:{height:PLAYER.HEIGHT,stepUp:PLAYER.STEP_UP,radius:.5,radiusSource:'Collision.js private DEFAULT_PLAYER_RADIUS; actual checkCollision called without radius override'},validation:'Whole outer-west built collisions and walkables, radius .5, samples <= .05'}));writeFileSync(new URL('../docs/current-state/r48-remaining/outer-primary-navigation.json',import.meta.url),JSON.stringify(records,null,2)+'\n');}
  }finally{zone.dispose();}
});

test('R48 Jiyun north approach real controller walks and sprints both directions at 10/60 Hz with lateral offsets',t=>{
 const zone=new PreviewOuterZone(),built=zone.build(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);
 try{const nav=api.resolveRemainingProfile(data.id,data.items.find(i=>i.name==='吉云楼')).navigation;for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])for(const offset of[-.08,0,.08]){
  const leg=nav.approachPoints.map(p=>[p.x,p.z]);for(let i=2;i<4;i++)leg[i][0]+=offset;const points=[...leg,...leg.slice(0,-1).reverse()];const r=replayTerrace(t,{THREE,cm},points,{fps,sprint,backward,recordFrames:true});
  assert.equal(r.arrived,true,JSON.stringify({fps,sprint,backward,offset,stuck:r.stuckAt,end:r.end}));assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=.59);assert.ok(r.end[2]<.03);for(const f of r.frames)assert.ok(f.feet<.65,'no jump or neighboring upper support');
 }}finally{zone.dispose();}
});

for(const name of names)test(`R48 ${name} actual primary approach round trip uses real controller in all 8 modes`,t=>{const zone=new PreviewOuterZone(),built=zone.build(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);try{const nav=api.resolveRemainingProfile(data.id,data.items.find(i=>i.name===name)).navigation,a=nav.approachPoints.map(q=>[q.x,q.z]);for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){const r=replayTerrace(t,{THREE,cm},[...a,...a.slice(0,-1).reverse()],{fps,sprint,backward});assert.equal(r.arrived,true,JSON.stringify({name,fps,sprint,backward,stuck:r.stuckAt,end:r.end}));assert.equal(r.startFeet,0);}}finally{zone.dispose();}});
