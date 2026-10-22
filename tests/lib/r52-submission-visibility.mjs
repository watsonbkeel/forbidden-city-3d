import assert from 'node:assert/strict';
// Target guard acceptance needs fully visible pixels. An unrelated submitted
// actor may legitimately be fading after a schedule transition; use its whole
// opaque geometry as a conservative occluder without calling it fully visible.
export function assertSubmittedVisibility(value,{requireFullVisibility=true}={}){
 assert.ok(Number.isFinite(value)&&value>0&&value<=1,'submitted visibility must be in (0,1]');
 if(requireFullVisibility)assert.equal(value,1,'accepted target guard must be fully visible');
 return value;
}
