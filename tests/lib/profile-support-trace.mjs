/** Test-only ground provenance. Copies production eligibility and strict-max tie
 * rules, and cross-checks every answer against the actual CollisionManager.
 * Identity labels are bound to the actual registered primitives before mutation,
 * never inferred from an expected XY region or an expected height. */
const rampKeys = ['axis','minX','maxX','minZ','maxZ','a0','a1','y0','y1',
  'crossMin0','crossMax0','crossMin1','crossMax1'];

export function bindProfileSupports(cm, profile) {
  const identities = new Map();
  const descriptors = [profile.supports.platform, ...profile.supports.ramps];
  for (const expected of descriptors) {
    const matches = cm.walkables.filter(w => w.type === expected.type && (w.type === 'box'
      ? w.box.min.toArray().every((n,i) => n === expected.min[i]) && w.box.max.toArray().every((n,i) => n === expected.max[i])
      : rampKeys.every(key => w[key] === expected[key])));
    if (matches.length !== 1) throw new Error(`${expected.supportId}: expected one registered primitive, found ${matches.length}`);
    identities.set(matches[0], expected.supportId);
  }
  return identities;
}

function selectedSupport(cm, x, z, feet, stepUp) {
  let ground = 0, rescue = 0, selected = null, rescuedBy = null;
  const limit = feet + stepUp;
  for (const w of cm.walkables) {
    let top;
    if (w.type === 'box') {
      const b = w.box;
      if (x < b.min.x || x > b.max.x || z < b.min.z || z > b.max.z) continue;
      top = b.max.y;
      if (w.rescue && top > limit && x > b.min.x + .6 && x < b.max.x - .6 &&
          z > b.min.z + .6 && z < b.max.z - .6 && top > rescue) { rescue = top; rescuedBy = w; }
    } else {
      if (x < w.minX || x > w.maxX || z < w.minZ || z > w.maxZ) continue;
      const a = w.axis === 'x' ? x : z;
      const t = w.a1 === w.a0 ? 1 : Math.min(1, Math.max(0, (a - w.a0) / (w.a1 - w.a0)));
      if (w.crossMin0 !== undefined) {
        const cross = w.axis === 'x' ? z : x;
        const low = w.crossMin0 + (w.crossMin1 - w.crossMin0) * t;
        const high = w.crossMax0 + (w.crossMax1 - w.crossMax0) * t;
        if (cross < low - 1e-9 || cross > high + 1e-9) continue;
      }
      top = w.y0 + (w.y1 - w.y0) * t;
    }
    if (top > limit || top <= ground) continue;
    ground = top; selected = w;
  }
  return rescue > ground ? { height: rescue, selected: rescuedBy, rescue: true }
    : { height: ground, selected, rescue: false };
}

export function traceProfileSupports(cm, identities) {
  const originalGround = cm.getGroundHeight, originalMove = cm.getValidPosition;
  const samples = [];
  let substepDistance = 0;
  cm.getValidPosition = function(current, target, radius = .5, ...rest) {
    const distance = Math.hypot(target.x - current.x, target.z - current.z);
    const steps = Math.max(1, Math.ceil(distance / Math.max(radius * .5, .05)));
    substepDistance = distance / steps;
    try { return originalMove.call(this, current, target, radius, ...rest); }
    finally { substepDistance = 0; }
  };
  cm.getGroundHeight = function(x, z, feet = 0, stepUp = .6) {
    const height = originalGround.call(this, x, z, feet, stepUp);
    const selected = selectedSupport(this, x, z, feet, stepUp);
    const w = selected.selected;
    const source = Math.abs(height - selected.height) > 1e-9 ? 'unverified'
      : selected.rescue ? 'rescue' : !w ? 'ground' : identities.get(w) ?? `other-${w.type}`;
    samples.push({ x, z, feetIn: feet, height, source, substepDistance,
      supportIndex: w ? this.walkables.indexOf(w) : null, supportType: w?.type ?? 'ground' });
    return height;
  };
  return { samples, restore() { cm.getGroundHeight = originalGround; cm.getValidPosition = originalMove; } };
}

/** Shared acceptance report for Node and browser. XY arrival is not an input. */
export function profileSupportReport(samples, p, from = 'front') {
  const first=p.ramps.find(r=>r.side===from),other=p.ramps.find(r=>r.side!==from),deck=p.supports.platform.supportId;
  const required=['ground',first.supportId,deck,other.supportId,'ground',other.supportId,deck,first.supportId,'ground'];
  const allowed=new Set(required),failures=[];
  const sequence=samples.map(s=>s.source).filter((s,i,a)=>!i||s!==a[i-1]);
  let matched=0;for(const source of sequence)if(source===required[matched])matched++;
  if(!samples.length)failures.push('No real ground queries');
  if(sequence.length!==required.length||sequence.some((source,i)=>source!==required[i]))
    failures.push(`Incomplete or interrupted true-support round trip: ${sequence.join(' → ')}`);
  const unsafe=samples.filter(s=>!allowed.has(s.source));
  if(unsafe.length)failures.push('Rescue, unverified, other-box or other-ramp support cannot prove passage');
  const ascending=[],descending=[];
  for(const r of p.ramps){const own=samples.filter(s=>s.source===r.supportId);
    if(own.some(s=>s.height-s.feetIn>1e-5))ascending.push(r.supportId);else failures.push(`${r.supportId}: missing ascent`);
    if(own.some(s=>s.height-s.feetIn< -1e-5))descending.push(r.supportId);else failures.push(`${r.supportId}: missing descent`);
  }
  const steepest=Math.max(...p.ramps.map(r=>Math.abs((r.yTop-r.yToe)/(r.zTop-r.zToe))));
  const slopes=new Map(p.ramps.map(r=>[r.supportId,Math.abs((r.yTop-r.yToe)/(r.zTop-r.zToe))]));
  const excessive=samples.filter(s=>s.substepDistance>0&&s.height-s.feetIn>(slopes.get(s.source)??steepest)*s.substepDistance+1e-7);
  if(excessive.length)failures.push('Upward query increment exceeds profile slope × actual collision substep');
  return {valid:failures.length===0,failures,sequence,required,matched,ascending,descending,
    unsafe:unsafe.slice(0,8),excessive:excessive.slice(0,8),queryCount:samples.length,
    maxUpwardQuery:Math.max(0,...samples.map(s=>s.height-s.feetIn))};
}
