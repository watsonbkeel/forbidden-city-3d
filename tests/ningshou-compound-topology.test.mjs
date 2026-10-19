import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildWorld, walkStraight } from './lib/world.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/zones/ningshou.json',import.meta.url)));
const wall=name=>data.items.find(v=>v.kind==='wall'&&v.name===name);
test('front/rear courts use an open connected compound instead of two malformed closed rectangles',()=>{
 assert.equal(data.items.filter(v=>v.kind==='courtWalls').length,0);
 for(const n of ['皇极门横墙','宁寿门院南界','皇极殿宁寿宫院东界','皇极殿宁寿宫院西界','皇极殿东隔墙','皇极殿西隔墙','宁寿宫东后界','宁寿宫西后界'])assert.ok(wall(n),n);
 assert.equal(wall('宁寿门院南界').from[1],data.items.find(v=>v.name==='宁寿门').z);
 assert.equal(wall('宁寿门院南界').gaps[0].gate,'宁寿门');
 for(const n of ['皇极殿东隔墙','皇极殿西隔墙'])assert.equal(wall(n).gaps.length,1,'side passage remains open');
 assert.equal(data.items.find(v=>v.name==='皇极殿').backDoor,true,'official rear-door connection');
});
test('actual compound builds, preserves both lateral passages and the street behind Ningshou',async()=>{
 const W=await buildWorld();
 for(const name of ['皇极殿东隔墙','皇极殿西隔墙']){
  const w=wall(name);assert.ok(w,name);const x=w.gaps[0].at,z=w.from[1];
  for(const sign of [-1,1]){const r=walkStraight(W,[x,z-sign*5],[x,z+sign*5]);assert.ok(r.reached>=r.total-.1,`${name}: ${JSON.stringify(r)}`);}
 }
 const street=walkStraight(W,[-350,336.5],[-240,336.5]);assert.ok(street.reached>=street.total-.1,JSON.stringify(street));
 const hall=W.halls.find(v=>v.item.name==='皇极殿'),g=hall.g;
 assert.equal(g.backDoor,true);
 const from=g.toW(g.doorX,g.d/2-1),to=g.toW(g.doorX,g.PD/2+g.run+1);
 const route=walkStraight(W,from,to,{feet0:g.ph});assert.ok(route.reached>=route.total-.1,`rear-door axis: ${JSON.stringify(route)}`);
});
