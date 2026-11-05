import assert from'node:assert/strict';import*as T from'three';import{CollisionManager}from'../../src/utils/Collision.js';import{replayKunning}from'../lib/kunning-walk.mjs';import{withBoundedQaMocks}from'../lib/bounded-qa-clock.mjs';import{hash}from'../r164-three-entry-navigation/snapshot.mjs';
export function manager(kit){const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);return cm}
export const oldPaths=[[[65,248.9],[74,248.9],[109,248.9],[109,253],[109,257],[108.6,265]],[[109,253],[104.6,253],[104.6,257],[109,257]],[[109,253],[113.4,253],[113.4,257],[109,257]],[[90,257],[90,269],[90,257]],[[139,257],[139,269],[139,257]]];
export function runOld(t,kit){const cm=manager(kit),out=[];for(const[p,points]of oldPaths.entries())for(const fps of[10,60])for(const sprint of[false,true])for(const reverse of[false,true]){const path=reverse?[...points].reverse():points,r=withBoundedQaMocks(t,m=>replayKunning(m,{THREE:T,cm},path,{startFeet:0,fps,sprint,recordFrames:true}));assert.ok(r.arrived,JSON.stringify({p,fps,sprint,reverse,stuck:r.stuckAt,end:r.end}));out.push({p,fps,sprint,reverse,frames:r.frames.length,frameHash:hash(r.frames),end:r.end})}return out}

// Use the caller's complete collider/walkable arrays, never a local subset.
export function runNew(t, kit, fit) {
  const cm = manager(kit), routes = [], closedDoors = [], stoneSupports = [];
  assert.equal(fit.length, 2);
  for (const p of fit) {
    const world = (x, z) => new T.Vector3(x, 0, z)
      .applyAxisAngle(new T.Vector3(0, 1, 0), p.rotation).add(new T.Vector3(p.x, 0, p.z));
    const points = [[0, -5.1], [0, -3.75], [0, -3.25], [0, -2], [-6, -2], [6, -2], [0, -2], [0, -5.1]]
      .map(q => { const v = world(...q); return [v.x, v.z]; });
    for (const fps of [10, 60]) for (const mode of ['walk', 'sprint', 'backward']) {
      const q = withBoundedQaMocks(t, m => replayKunning(m, {THREE: T, cm}, points,
        {startFeet: 0, fps, sprint: mode === 'sprint', backward: mode === 'backward', recordFrames: true}));
      assert.ok(q.arrived, JSON.stringify({key: p.key, fps, mode, stuck: q.stuckAt, end: q.end}));
      assert.ok(q.maxFeet <= .25001 && q.minFeet >= -1e-6);
      assert.ok(q.frames.some(v => v.feet > .249));
      assert.ok(Math.abs(q.end[2]) < 1e-6);
      routes.push({key: p.key, fps, mode, frames: q.frames.length, frameHash: hash(q.frames), end: q.end,
        maxFeet: q.maxFeet, minFeet: q.minFeet});
    }
    const a = world(0, -5.1), b = world(0, 0);
    const stop = withBoundedQaMocks(t, m => replayKunning(m, {THREE: T, cm},
      [[a.x, a.z], [b.x, b.z]], {startFeet: 0, fps: 60}));
    assert.equal(stop.arrived, false, p.key + ' actual closed leaves block entry');
    closedDoors.push({key: p.key, arrived: stop.arrived, end: stop.end, stuckAt: stop.stuckAt});
    for (const [z, expected] of [[-3.75, .125], [-3.25, .25], [-2, .25]]) {
      const v = world(0, z), height = cm.getGroundHeight(v.x, v.z, expected, .05, .05);
      assert.ok(Math.abs(height - expected) < 1e-6, p.key + ' actual tread/veranda support');
      stoneSupports.push({key: p.key, x: v.x, z: v.z, expected, height});
    }
  }
  return {routes, closedDoors, stoneSupports};
}
