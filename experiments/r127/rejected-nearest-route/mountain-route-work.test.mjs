import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildDuixiuMountain} from '../../src/scene/garden/DuixiuMountain.js';
// Production change caught: reintroducing the second/third nearest-route scan
// per cell exceeds the measured-operation bound without relying on wall time.
test('mountain samples the nearest route at most once per grid cell',()=>{
 const old=Math.hypot;let calls=0;Math.hypot=(...v)=>{calls++;return old(...v)};
 let r;try{r=buildDuixiuMountain({center:new T.Vector3(0,0,0)})}finally{Math.hypot=old}
 const segments=r.profile.routes.reduce((n,q)=>n+q.points.length-1,0);
 // Grid has <8,000 cells; keep a small allowance for route construction.
 assert.ok(calls<=8000*segments+1000,`${calls} distance calculations for ${r.profile.solidCellCount} solid cells (${segments} route segments)`);
 r.geometries.forEach(g=>g.dispose());
});
