import test from 'node:test';import assert from 'node:assert/strict';
test('smooth union produces one closed connected body without internal component shells',async()=>{
 const m=await import('../../src/scene/palace/special/SmoothBuddhaBody.js').catch(()=>null);assert.ok(m?.createSmoothBuddhaBody,'continuous body generator missing');
 const g=m.createSmoothBuddhaBody([{center:[0,0,0],radii:[.3,.3,.3]},{center:[0,.35,0],radii:[.3,.3,.3]}],{step:.04});
 const edges=new Map(),adj=new Map(),a=g.index.array;for(let i=0;i<a.length;i+=3)for(const [x,y]of[[a[i],a[i+1]],[a[i+1],a[i+2]],[a[i+2],a[i]]]){let k=x<y?`${x}:${y}`:`${y}:${x}`;edges.set(k,(edges.get(k)||0)+1);if(!adj.has(x))adj.set(x,new Set());if(!adj.has(y))adj.set(y,new Set());adj.get(x).add(y);adj.get(y).add(x);}
 assert.ok([...edges.values()].every(n=>n===2),'surface must be watertight');const seen=new Set(),todo=[a[0]];while(todo.length){const x=todo.pop();if(seen.has(x))continue;seen.add(x);for(const y of adj.get(x))todo.push(y);}assert.equal(seen.size,adj.size,'body must be connected');assert.ok([...g.attributes.position.array].every(Number.isFinite));g.dispose();
});
test('central sample uses a single fused main body and retains named small details',async()=>{
 const {createCentralBuddhaVolumeStudy}=await import('../../src/scene/palace/special/CentralBuddhaVolumeStudy.js');const r=createCentralBuddhaVolumeStudy({columns:129,rows:193,imageWidth:1024,imageHeight:1536,alpha:new Uint8Array(129*193).fill(255)});
 assert.equal(r.meta.continuousBodySurface,true);assert.equal(r.meta.bodyField.unionParts.length,13);assert.ok(!r.meta.bodyField.unionParts.includes('nose'));r.dispose();
});
test('actual thirteen-part body is closed, including near-zero field intersections',async()=>{
 const {createCentralBuddhaVolumeStudy}=await import('../../src/scene/palace/special/CentralBuddhaVolumeStudy.js');const {createSmoothBuddhaBody}=await import('../../src/scene/palace/special/SmoothBuddhaBody.js');const r=createCentralBuddhaVolumeStudy({columns:129,rows:193,imageWidth:1024,imageHeight:1536,alpha:new Uint8Array(129*193).fill(255)});const g=createSmoothBuddhaBody(r.meta.parts.filter(p=>r.meta.bodyField.unionParts.includes(p.name))),edges=new Map(),a=g.index.array;
 for(let i=0;i<a.length;i+=3)for(const [x,y]of[[a[i],a[i+1]],[a[i+1],a[i+2]],[a[i+2],a[i]]]){const key=x<y?`${x}:${y}`:`${y}:${x}`;edges.set(key,(edges.get(key)||0)+1);}assert.ok([...edges.values()].every(n=>n===2),`open edges ${[...edges.values()].filter(n=>n===1).length}`);g.dispose();r.dispose();
});
