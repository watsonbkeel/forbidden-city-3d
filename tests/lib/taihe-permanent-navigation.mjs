import D from '../../data/architecture/taihe-dais-front.json' with {type:'json'};
// Test-only verification of Taihe's permanent (not GLB-owned) navigation.
// Expected boxes are derived independently from the frozen profile, not from
// the live builder's collider list, so an initially missing proxy cannot pass.
const values = box => [box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z];
const rampValues = o => [o.minX,o.maxX,o.minZ,o.maxZ,o.a0,o.a1,o.y0,o.y1];
const equal = (a, b) => a.length === b.length && a.every((v, i) => Number.isFinite(v) && Math.abs(v - b[i]) <= 1e-9);
const box = (x0, y0, z0, x1, y1, z1) => [Math.min(x0,x1), Math.min(y0,y1), Math.min(z0,z1), Math.max(x0,x1), Math.max(y0,y1), Math.max(z0,z1)];

export function captureTaihePermanentNavigation(cm, cfg, floorY, profile) {
  const f = profile.frame;
  if (!cm?.colliders || !cm?.walkables || !cfg?.frame || cfg.id !== 'taihe') throw Error('Taihe navigation input missing');
  if (!equal([cfg.frame.x, cfg.frame.z, cfg.frame.rot ?? 0, floorY], [f.x, f.z, f.rot, f.floorY])) throw Error('Taihe navigation registration differs from frozen profile');
  if (typeof cm.getGroundHeight !== 'function' || !equal([cm.getGroundHeight(f.x, f.z, 0, 999)], [f.floorY])) throw Error('Taihe actual floor support differs from frozen profile');
  if (Object.values(cfg.anchor ?? {}).some(v => v !== 0)) throw Error('Taihe navigation anchor is not zero');
  const {x: x0, z: z0} = f, y = floorY, d = profile.dais, c = profile.columns;
  const expectedCol = [], expectedWalk = [], radius = Math.max(c.clearanceRadius, c.baseRadius);
  for (const x of c.x) for (const z of c.goldZ) expectedCol.push(box(x0+x-radius,y,z0+z-radius,x0+x+radius,y+c.height,z0+z+radius));
  expectedCol.push(box(x0-d.width/2,y,z0+d.z0,x0+d.width/2,y+4,z0+d.z1));
  const toe=z0+d.z0-d.steps*d.stepRun;
  for(const x of D.railX)for(let k=0;k<d.steps;k++){
    const za=toe+k*d.stepRun;expectedCol.push(box(x0+x-D.railWidth/2,y+d.height*k/d.steps,za,x0+x+D.railWidth/2,y+d.height*(k+1)/d.steps+D.railHeight,za+d.stepRun));
  }
  const t=D.incenseTables;
  for(const x of t.x)expectedCol.push(box(x0+x-t.width*.53,y,z0+t.z-t.depth*.53,x0+x+t.width*.53,y+t.totalHeight,z0+t.z+t.depth*.53));
  for(const f of D.frontFlights)for(let k=0;k<d.steps;k++){
    const za=toe+k*d.stepRun;expectedWalk.push(box(x0+f.x-f.width/2,y,za,x0+f.x+f.width/2,y+d.height*(k+1)/d.steps,za+d.stepRun));
  }
  const expectedRamp=[x0-D.cover.width/2,x0+D.cover.width/2,toe,z0+d.z0-d.stepRun,toe,z0+d.z0-d.stepRun,y+d.height/d.steps+D.cover.offset,y+d.height+D.cover.offset];
  if(expectedCol.length!==39||expectedWalk.length!==21)throw Error('Unexpected frozen Taihe navigation cardinality');
  const pick = (all, expected, kind) => expected.map((bounds, i) => {
    const matches=all.filter(o => o.tag === undefined && o.box && (kind==='COL' || (o.type==='box' && o.rescue===false)) && equal(values(o.box),bounds));
    if (matches.length !== 1) throw Error(`Taihe permanent ${kind}[${i}] expected exactly once; found ${matches.length}`);
    return {object: matches[0], box: matches[0].box, bounds: values(matches[0].box)};
  });
  const ramps=cm.walkables.filter(o=>o.tag===undefined&&o.type==='ramp'&&o.axis==='z'&&equal(rampValues(o),expectedRamp));
  if(ramps.length!==1)throw Error('Taihe central cover support expected exactly once');
  return {colliders:pick(cm.colliders,expectedCol,'COL'),walkables:pick(cm.walkables,expectedWalk,'WALK').concat({object:ramps[0],box:null,bounds:rampValues(ramps[0])})};
}

export function assertTaihePermanentNavigationRetained(cm, before, cfg, floorY, profile) {
  const after=captureTaihePermanentNavigation(cm,cfg,floorY,profile);
  for (const key of ['colliders','walkables']) {
    if (!before?.[key] || before[key].length!==after[key].length) throw Error('Taihe navigation snapshot missing');
    after[key].forEach((row,i)=>{
      const old=before[key][i];
      if (row.object!==old.object || row.box!==old.box || !equal(row.bounds,old.bounds)) throw Error(`Taihe permanent ${key}[${i}] changed during preload`);
    });
  }
  return {permanentCol:after.colliders.length,permanentWalk:after.walkables.length,permanentRetained:true};
}
