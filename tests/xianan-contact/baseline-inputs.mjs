import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
// Fixed independent evidence pin. Never regenerate from candidate source.
const manifestSha256='b364a2d28de451178004f8608e805914cdf4f600d9fecb30e315a8e7c1f80a7a';
const commit='5d30c8366c8430f27cb9664b2b64f30e64e87cca',tree='0f75720e7b5e36235105e691fda8e51930c7fa8f';
const allowedChanges=new Set(['src/scene/zones/ZoneBase.js','src/scene/palace/kit.js','src/scene/Environment.js','src/utils/Collision.js','src/controls/FirstPerson.js']);
const base=new URL('../../',import.meta.url),manifestURL=new URL('./baseline-inputs.json',import.meta.url);
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
export function verifyInputs(){
 const bytes=fs.readFileSync(manifestURL);
 if(sha(bytes)!==manifestSha256)throw Object.assign(new Error('Fixed Xianan baseline manifest pin mismatch'),{code:'XIANAN_BASELINE_PIN_MISMATCH'});
 const manifest=JSON.parse(bytes);assert.equal(manifest.commit,commit);assert.equal(manifest.tree,tree);
 return Object.fromEntries(Object.entries(manifest.files).map(([name,baseline])=>{
  const candidate=sha(fs.readFileSync(new URL(name,base)));
  if(!allowedChanges.has(name))assert.equal(candidate,baseline,'Unchanged baseline input '+name);
  return [name,{candidate,baseline}];
 }));
}
