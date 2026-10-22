/** Reuse previously captured actual scene triangles when an entire world rebuild is not needed. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const out=process.env.P3C_FEMALE_OUT;if(!out)throw new Error('Explicit fresh candidate directory required');
const source='reports/r50-followup/female-samples/world-seat-models.json',bytes=fs.readFileSync(source),cache=JSON.parse(bytes),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [path,hash] of Object.entries(cache.hashes))if(!path.endsWith('/CharacterKit.js')&&sha(fs.readFileSync(path))!==hash)throw new Error(`Cached fixture source changed: ${path}`);
const current=JSON.parse(gunzipSync(fs.readFileSync(`${out}/models.json.gz`))),model=current.models.find(m=>m.id==='consort-daily'&&m.pose==='seated');
if(!model)throw new Error('No current seated consort mesh');
for(const m of cache.models){
 const old=m.metadata.kit,now=model.mesh.metadata;
 for(const k of ['bodyHeightMeters','seatVariant','seatPelvis','seatContact','groundContacts'])if(JSON.stringify(old[k])!==JSON.stringify(now[k]))throw new Error(`Binding invariant changed: ${k}`);
 m.mesh=model.mesh;m.metadata.kit=now;
}
cache.hashes['src/scene/characters/CharacterKit.js']=sha(fs.readFileSync('src/scene/characters/CharacterKit.js'));
cache.evidence='Actual current female CharacterKit mesh composed with hash-verified cached actual unchanged palace triangles. Original adapter binding retained; no fresh adapter placement or GPU validation is claimed.';
cache.cachedFixtureProvenance={path:source,sha256:sha(bytes),sourceHashesVerified:true,bindingReuse:'Original already-resolved binding. Scale, seat variant, pelvis, foot contacts and seat-contact metadata compared exactly; full-world fresh export was killed before producing a result.',fixturesSha256:sha(Buffer.from(JSON.stringify(cache.models.map(m=>m.fixtures))))};
fs.writeFileSync(`${out}/world-seat-models.json`,JSON.stringify(cache));
fs.writeFileSync(`${out}/world-seat-bindings.json`,JSON.stringify({evidence:cache.evidence,provenance:cache.cachedFixtureProvenance,hashes:cache.hashes,bindings:cache.models.map(m=>({actorId:m.id,binding:m.metadata.binding,kit:m.metadata.kit}))},null,2));
console.log('Composed new female mesh with verified cached actual palace triangles; original binding retained.');
