import crypto from 'node:crypto';
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function taiheWorldPhysics(W){
 const rows=W.cm.colliders.map(({mesh,...c})=>({min:c.box.min.toArray(),max:c.box.max.toArray(),tag:c.tag,triangleSupport:c.triangleSupport?{id:c.triangleSupport.id,offset:c.triangleSupport.offset.toArray(),templateHash:hash(c.triangleSupport.template)}:null,overhead:c.overhead??null,xiqingRoofSurface:c.xiqingRoofSurface??null,duixiuTerrain:c.duixiuTerrain??false,furnitureMotionScope:c.furnitureMotionScope??null}));
 return {rows,walkables:W.cm.walkables,rivers:W.cm.rivers};
}
export function compareTaiheWorldPhysics(actual,baseline){
 const target=actual.rows.filter(c=>c.triangleSupport?.id.startsWith('taihe-terrace-instrument:'));
 const others=actual.rows.filter(c=>!target.includes(c)).map(hash).sort();
 return {targetCount:target.length,total:actual.rows.length,retainedCount:others.length,retainedExact:JSON.stringify(others)===JSON.stringify(baseline.retained),walkablesExact:JSON.stringify(actual.walkables)===JSON.stringify(baseline.walkables),riversExact:JSON.stringify(actual.rivers)===JSON.stringify(baseline.rivers)};
}
