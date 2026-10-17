import {restoreHistoricalInventory} from './lib/taihe-shell-geometry-retention.mjs';
import {restorePreColumnMaterialSource} from './lib/taihe-column-material-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {baseline, candidate, historicalCaissonCandidate, config, centres, profile, position, radial, near, columnIndex, isShaft, geometry, triangleNormal, read} from './lib/taihe-column-fixture.mjs';
import {splitS, restoreCore} from './lib/taihe-display-fixture.mjs';
// Strict shell restoration reinserts only the pinned 320 retired faces; every
// other original V17 triangle/attribute must survive unchanged.
const retainedV17 = splitS();
const shafts = candidate.triangles.filter(isShaft);
const relief = candidate.triangles.filter(t => columnIndex(t) >= 0 && !isShaft(t));

test('six shaft meshes preserve exact oriented positions, radius, registration and endpoints', () => {
  assert.equal(shafts.length, 744);
  assert.deepEqual(geometry(shafts, false), geometry(baseline.triangles.filter(isShaft), false));
  assert.deepEqual(candidate.inventory.filter(o => /^gold_column(?:\.\d+)?$/.test(o.name)), baseline.inventory.filter(o => /^gold_column(?:\.\d+)?$/.test(o.name)));
  for (let i=0;i<6;i++) assert.equal(shafts.filter(t=>columnIndex(t)===i).length,124);
});

test('only shaft sides have radial smooth normals; caps remain hard and axial', () => {
  let sides=0,caps=0;
  const shared=new Map();
  for (const t of shafts) {
    const ys=t.vertices.map(v=>position(v)[1]), side=Math.max(...ys)-Math.min(...ys)>9, c=centres[columnIndex(t)];
    side?sides++:caps++;
    for (const v of t.vertices) {
      const p=position(v), n=v.NORMAL;
      if (side) {
        assert.ok(Math.abs(n[1])<1e-6, 'side normals do not lean into caps');
        const dot=(n[0]*(p[0]-c[0])+n[2]*(p[2]-c[1]))/radial(p,c);
        assert.ok(dot>0.999999,`radial smooth side normal: ${dot}`);
        const key=p.join(','); if(shared.has(key))assert.deepEqual(n,shared.get(key)); else shared.set(key,n);
      } else {assert.ok(Math.abs(n[0])+Math.abs(n[2])<1.1e-4);assert.ok(near(n[1],near(p[1],.2)?-1:1));}
    }
  }
  assert.equal(sides,384);assert.equal(caps,360);
  // The frozen exporter already emits a 1e-4 axial-normal rounding component
  // on a few hard-cap triangles. Preserve those exact attributes rather than
  // silently changing cap normals to satisfy an idealized tolerance.
  const cap=t=>isShaft(t)&&Math.max(...t.vertices.map(v=>position(v)[1]))-Math.min(...t.vertices.map(v=>position(v)[1]))<1;
  assert.deepEqual(geometry(candidate.triangles.filter(cap)),geometry(baseline.triangles.filter(cap)));
});

test('all old dark full-turn tubes are removed and replaced only by shallow gold surface relief', () => {
  assert.equal(candidate.inventory.filter(o=>o.name.startsWith('column_approx_shallow_cloud')).length,0);
  assert.ok(candidate.inventory.some(o=>o.name.startsWith('column_authored_relief')));
  assert.ok(relief.length>0&&relief.length<=3456);
  assert.ok(relief.every(t=>t.material==='taihe_gold'));
  for (let i=0;i<6;i++) assert.ok(relief.filter(t=>columnIndex(t)===i).length<=576);
  const old=new Set(geometry(baseline.triangles.filter(t=>t.material==='taihe_dark_gold'&&columnIndex(t)>=0),false));
  assert.ok(relief.every(t=>!old.has(geometry([t],false)[0])));
});

test('every relief face is finite, outward, nondegenerate, within inherited radius and attached above its polygon facet', () => {
  assert.ok(relief.length);
  const sector=2*Math.PI/32, apothem=.5*Math.cos(Math.PI/32);
  for (const t of relief) {
    const c=centres[columnIndex(t)], points=t.vertices.map(position), n=triangleNormal(t);
    assert.ok(points.flat().every(Number.isFinite));assert.ok(t.vertices.flatMap(v=>v.NORMAL).every(Number.isFinite));
    assert.ok(Math.hypot(...n)>2e-10,'nondegenerate');
    for(const v of t.vertices)assert.ok(v.NORMAL.reduce((sum,q,k)=>sum+q*n[k],0)/Math.hypot(...n)>.9999,'float32 exported normal follows outward relief face');
    const centroid=points[0].map((_,k)=>points.reduce((sum,p)=>sum+p[k],0)/3);
    assert.ok(n[0]*(centroid[0]-c[0])+n[2]*(centroid[2]-c[1])>0,'outward face');
    for(let a=0;a<=4;a++)for(let b=0;b<=4-a;b++) {
      const w=[a/4,b/4,1-(a+b)/4],p=[0,1,2].map(k=>points.reduce((s,q,j)=>s+w[j]*q[k],0));
      assert.ok(p[1]>.2&&p[1]<profile.columns.height);assert.ok(radial(p,c)<=.52);
      const angle=Math.atan2(p[2]-c[1],p[0]-c[0]), facet=(Math.floor(angle/sector)+.5)*sector;
      const distance=(p[0]-c[0])*Math.cos(facet)+(p[2]-c[1])*Math.sin(facet)-apothem;
      assert.ok(distance>=.00045,`surface penetration or insufficient offset: ${distance}`);
      assert.ok(distance<=.009,`relief floating/depth envelope: ${distance}`);
    }
  }
});

test('historical caisson view retains exact non-column V16 geometry and current material definitions', () => {
  assert.deepEqual(geometry(retainedV17.original.filter(t=>columnIndex(t)<0)),geometry(baseline.triangles.filter(t=>columnIndex(t)<0)));
  assert.deepEqual(candidate.gltf.materials,baseline.gltf.materials);
  assert.deepEqual(restoreHistoricalInventory(historicalCaissonCandidate).filter(o=>!o.name.startsWith('display_')&&!o.name.startsWith('caisson_dragon_')&&!/^gold_column(?:\.\d+)?$/.test(o.name)&&!o.name.startsWith('column_authored_relief')),baseline.inventory.filter(o=>!/^gold_column(?:\.\d+)?$/.test(o.name)&&!o.name.startsWith('column_approx_shallow_cloud')));
});

test('retained column candidate stays within reclaimed triangle budget and bounded display additions and eight batches; only scoped gold UVs are added with no embedded images', () => {
  assert.ok(retainedV17.original.length<=8978);assert.equal(retainedV17.original.length,8330);assert.equal(retainedV17.display.length,3798);assert.equal(candidate.triangles.length,config.asset.renderableTriangles);
  assert.equal(candidate.gltf.meshes.length,8);assert.equal(candidate.gltf.materials.length,8);
  assert.equal(candidate.gltf.images?.length??0,0);assert.equal(candidate.gltf.textures?.length??0,0);
  for(const m of candidate.gltf.meshes)for(const p of m.primitives)if(candidate.gltf.materials[p.material].name==='taihe_gold')assert.deepEqual(Object.keys(p.attributes).sort(),['NORMAL','POSITION','TEXCOORD_0']);
  const hash=b=>createHash('sha256').update(b).digest('hex');
  assert.equal(hash(read('assets-src/interiors/_common.py')),'b57efc80a2a9ca78fdfbe44330b78bba40302fdd627acd0a800c56328dc111fa');
});

test('decoded relief consists of separated short branched patches without duplicate or overlapping facet faces', () => {
  assert.ok(relief.length);
  const area = p => Math.abs(p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[1]-a[1]*b[0];},0))/2;
  function intersection(subject, clip) {
    let p=subject;
    for(let i=0;i<clip.length;i++) {
      const a=clip[i],b=clip[(i+1)%clip.length],cross=v=>(b[0]-a[0])*(v[1]-a[1])-(b[1]-a[1])*(v[0]-a[0]),out=[];
      for(let j=0;j<p.length;j++) {
        const v=p[j],w=p[(j+1)%p.length],dv=cross(v),dw=cross(w);
        if(dv>=0)out.push(v);
        if((dv>=0)!==(dw>=0)){const t=dv/(dv-dw);out.push([v[0]+t*(w[0]-v[0]),v[1]+t*(w[1]-v[1])]);}
      }
      p=out;if(p.length<3)return 0;
    }
    return area(p);
  }
  for(let ci=0;ci<6;ci++) {
    const c=centres[ci], triangles=relief.filter(t=>columnIndex(t)===ci), graph=new Map(), byFacet=new Map(), unique=new Set();
    for(const t of triangles) {
      const points=t.vertices.map(position),keys=points.map(p=>p.join(','));
      const key=keys.slice().sort().join(';');assert.ok(!unique.has(key),'no duplicate triangle');unique.add(key);
      for(let i=0;i<3;i++){if(!graph.has(keys[i]))graph.set(keys[i],new Set());graph.get(keys[i]).add(keys[(i+1)%3]);graph.get(keys[i]).add(keys[(i+2)%3]);}
      const p=points[0].map((_,k)=>points.reduce((s,q)=>s+q[k],0)/3),sector=Math.floor(Math.atan2(p[2]-c[1],p[0]-c[0])/(Math.PI/16)),a=(sector+.5)*Math.PI/16;
      const q=points.map(p=>[-(p[0]-c[0])*Math.sin(a)+(p[2]-c[1])*Math.cos(a),p[1]]);
      if(q.reduce((s,v,i)=>{const w=q[(i+1)%3];return s+v[0]*w[1]-v[1]*w[0];},0)<0)q.reverse();
      if(!byFacet.has(sector))byFacet.set(sector,[]);byFacet.get(sector).push(q);
    }
    const seen=new Set();let components=0;
    for(const key of graph.keys())if(!seen.has(key)) {
      const queue=[key],component=[];seen.add(key);
      while(queue.length){const k=queue.pop();component.push(k.split(',').map(Number));for(const next of graph.get(k))if(!seen.has(next)){seen.add(next);queue.push(next);}}
      components++;
      const angles=component.map(p=>Math.atan2(p[2]-c[1],p[0]-c[0]));
      const average=Math.atan2(angles.reduce((s,a)=>s+Math.sin(a),0),angles.reduce((s,a)=>s+Math.cos(a),0));
      const unwrapped=angles.map(a=>Math.atan2(Math.sin(a-average),Math.cos(a-average)));
      assert.ok(Math.max(...unwrapped)-Math.min(...unwrapped)<1.1,'short patch, no full-turn wrap');
      assert.ok(Math.max(...component.map(p=>p[1]))-Math.min(...component.map(p=>p[1]))<1.5);
    }
    assert.equal(components,6,'six disconnected gold-on-gold motif patches per shaft');
    for(const rows of byFacet.values())for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++)assert.ok(intersection(rows[i],rows[j])<1e-9,'no positive-area projected overlap on a shaft facet');
  }
});

// Freeze exact runtime and shared authoring bytes as well as decoded geometry.
test('fallback, registration, shared generators, atomic replacement, atlas ownership and permanent navigation sources are frozen', () => {
  const protectedFiles=JSON.parse(read('tests/fixtures/taihe-v17-protected.json'));
  for(const [path,expected] of Object.entries(protectedFiles.sha256))assert.equal(createHash('sha256').update(path==='src/scene/palace/special/TaiheCore.js'?restoreCore(read(path)):restorePreColumnMaterialSource(path,read(path))).digest('hex'),expected,path);
});
