import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import './lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from './lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {PLAYER} from '../src/config/constants.js';

// Actual candidate geometry and collision proxies. No R49 source substitution.
// This local bound supplements, rather than replaces, full-world route replay.
for(const [zone,name,groupName,columnName,retainedFloorNames]of[
 ['east-six','永和宫','yonghe-open-canopy','yonghe-canopy-column',['yonghe-canopy-platform','yonghe-canopy-platform-cap']],
 ['west-six','重华宫','r48-chonghua-three-bay-baoxia','r48-chonghua-baoxia-column',['r48-chonghua-baoxia-plinth','r48-chonghua-baoxia-floor']],
])test(`${name}: actual raised canopy clears standing/jump envelope and retains column blocking`,()=>{
 const data=JSON.parse(readFileSync(new URL(`../data/zones/${zone}.json`,import.meta.url))),item=data.items.find(i=>i.name===name),lib=realTextureLibrary(),b=new ZoneBase(lib,data);
 try{
  b.buildHall(item);b.kit.root.updateMatrixWorld(true);
  const g=b.kit.root.getObjectByName(groupName),p=b.kit.plaques.find(p=>p.text===name);
  assert.ok(g&&p?.frame,'actual named canopy and registered full nameboard');
  const columns=g.children.filter(m=>m.name===columnName);assert.equal(columns.length,4);
  const apex=PLAYER.JUMP_VELOCITY**2/(2*PLAYER.GRAVITY),bodyTop=item.ph+PLAYER.HEIGHT+apex;
  let overhead=0;g.traverse(m=>{if(!m.isMesh||m.name===columnName||retainedFloorNames.includes(m.name))return;const box=new T.Box3().setFromObject(m);assert.ok(box.min.y>bodyTop+.1,`${m.name} bottom ${box.min.y} above full standing/jump head ${bodyTop}`);overhead++;});assert.ok(overhead>5);
  assert.ok(new T.Box3().setFromObject(p.frame).min.y>bodyTop,'whole frame outside local jump envelope');
  const cm=new CollisionManager();cm.addColliders(b.kit.colliders,'actual-candidate');cm.addWalkables(b.kit.walkables,'actual-candidate');
  const localColumns=columns.map(c=>c.position);const edge=localColumns.reduce((s,c)=>s+c.z,0)/columns.length;
  for(const dy of [0,apex/2,apex]){
   for(const dx of [-.6,0,.6])for(const dz of [.6,1.2,1.8]){
    const eye=g.parent.localToWorld(new T.Vector3(dx,item.ph+PLAYER.HEIGHT+dy,edge+dz));
    assert.equal(cm.checkCollision(eye,.5),false,'central canopy approach remains passable at actual standing/jump height');
   }
   for(const c of columns){const eye=c.getWorldPosition(new T.Vector3());eye.y=item.ph+PLAYER.HEIGHT+dy;assert.equal(cm.checkCollision(eye,.5),true,'real canopy column remains blocking; not removed for visibility');}
  }
  for(const c of columns){const box=new T.Box3().setFromObject(c);assert.ok(Math.abs(box.min.y-item.ph)<1e-5,'column feet remain on retained platform');}
 }finally{b.kit.dispose(b.kit.root);lib.dispose();}
});
