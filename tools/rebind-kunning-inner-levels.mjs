/** Reproducible metadata-only GLB rebind for the lowered shared rear terrace.
 * Run --check (default) to verify, --write to produce the content-keyed asset.
 * Does not regenerate or mutate any decoded geometry/material/proxy byte. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root));
const baseline='public/models/interiors/kunning-v6-ca7d98404e70.glb',old=read(baseline);
assert.equal(sha(old),'ca7d98404e708d8398e8be893568aea0b12bdc350f9500052afcaeacb3965e8c');
const p=JSON.parse(read('data/architecture/kunning.json'));
assert.equal(p.revision,'r12-inner-levels-1');assert.equal(p.frameExpectation.floorY,2.16);
assert.equal(p.profileHash,'1bb852b57c93427ac87a15f7052014d233459575d4ee9608055903cd4c334192');
const len=old.readUInt32LE(12),g=JSON.parse(old.subarray(20,20+len));
const node=g.nodes.find(n=>n.name==='KUNNING_CONTRACT');
node.extras.profileRevision=p.revision;node.extras.profileHash=p.profileHash;
const json=Buffer.from(JSON.stringify(g)),body=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
const hdr=Buffer.from(old.subarray(0,20));hdr.writeUInt32LE(body.length,12);
const bytes=Buffer.concat([hdr,body,old.subarray(20+len)]);bytes.writeUInt32LE(bytes.length,8);
assert.equal(sha(bytes),'0c83b4364eef7febe30f976158c8a015bab49dcc3f40989f510c98e8edd6a9e4');
assert.ok(bytes.subarray(20+body.length).equals(old.subarray(20+len)),'BIN chunk/header unchanged');
const target='public/models/interiors/kunning-v6-'+sha(bytes).slice(0,12)+'.glb';
if(process.argv.includes('--write'))fs.writeFileSync(new URL(target,root),bytes);
else assert.ok(read(target).equals(bytes));
const cfg=JSON.parse(read('data/interiors/kunning.json'));
assert.equal(cfg.model,'/'+target.slice(7));assert.equal(cfg.asset.sha256,sha(bytes));assert.equal(cfg.asset.encodedBytes,bytes.length);
console.log(JSON.stringify({status:'pass',bytes:bytes.length,sha256:sha(bytes),binAndGeometry:'unchanged'}));
