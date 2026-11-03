import {createHash} from 'node:crypto';

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const inCentralFlight=(box,p)=>box.min.x>=-p.halfWidth-1e-8&&box.max.x<=p.halfWidth+1e-8
  &&box.min.z>=Math.min(p.edge,p.toe)-1e-8&&box.max.z<=Math.max(p.edge,p.toe)+1e-8;

// Only the six existing imperial-stone footprints may change collision policy.
// Store a fixed baseline digest for all remaining physics and every visible mesh.
export function centralStoneSnapshot(scene,b) {
  const flights=[
    {edge:51,toe:50.04,halfWidth:2.3},
    {edge:79,toe:79.96,halfWidth:2.3},
    {edge:b.baoheHallPlinth.zEdge,toe:b.baoheHallPlinth.zToe,halfWidth:b.baoheHallPlinth.stoneWidth/2},
    ...b.baoheNorthTiers.map(p=>({edge:p.zEdge,toe:p.zToe,halfWidth:p.evidence.stoneWidth/2})),
  ];
  const colliders=b.colliders.filter(c=>!flights.some(p=>inCentralFlight(c,p)));
  const walkables=b.walkables.filter(w=>!(w.type==='ramp'&&w.minX<0&&w.maxX>0
    &&flights.some(p=>Math.abs(w.a0-p.edge)<1e-8&&Math.abs(w.a1-p.toe)<1e-8)));
  const meshes=[];scene.updateMatrixWorld(true);
  scene.traverse(m=>{if(!m.isMesh)return;meshes.push({name:m.name,matrix:m.matrixWorld.toArray(),
    material:Array.isArray(m.material)?m.material.map(x=>x.name):m.material.name,
    attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),
    index:m.geometry.index?[...m.geometry.index.array]:null});});
  return {unchangedMeshes:{count:meshes.length,sha256:hash(meshes)},
    unchangedColliders:{count:colliders.length,sha256:hash(colliders)},
    unchangedWalkables:{count:walkables.length,sha256:hash(walkables)}};
}
