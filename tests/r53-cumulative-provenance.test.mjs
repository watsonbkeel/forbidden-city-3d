import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const sha=b=>createHash('sha256').update(b).digest('hex'),read=p=>fs.readFileSync(p);
const original='fac791cf956d852e32cc9594ce537b22bca82308';
const retained={"src/scene/palace/special/SourceGuidedNameboardMounts.js": "b1da50adbc66309d78afbcf03e9351b5858e9b18ecf4d2c93ddce019c0c99df2", "src/scene/palace/special/SideGateProfiles.js": "11e346096666822682d3efc9f92da0c96c8fb9e8322ccac2d7234a62ba9acea4", "src/scene/palace/special/ChuxiuHall.js": "10c5d3d875e530e2913d12668b3f4a2f8a7c85da716b52f34f1ab9ee4adfe343", "src/utils/Collision.js": "6e6916d8a7124352ee8dec68bebd6721ef645cbfe9154117e7ad09e224a7ff78", "src/ui/Teleport.js": "6795612a26ee9ed7817900a0aad9a5088eef17454060f7d032c06d07ea8083a8"};
test('R53 freezes188 world sources:184 inherited byte-for-byte, two residential hooks and two source-bounded local modules',()=>{
 const m=JSON.parse(read('data/characters/world-source-freeze.json')),old=JSON.parse(read(m.provenance.previousManifestPath));assert.equal(m.schemaVersion,6);assert.equal(m.files.length,188);assert.equal(old.files.length,186);assert.equal(sha(read(m.provenance.previousManifestPath)),m.provenance.previousManifestSha256);
 assert.equal(sha(read(m.provenance.previousManifestPath)),'ce08cb90f3d49d9faf69538211d4f9bc1b60916f03347195bb9565132cad6607');
 const before=new Map(old.files.map(f=>[f.path,f.sha256])),changed=[];for(const f of m.files){assert.equal(sha(read(f.path)),f.sha256,f.path);if(before.get(f.path)!==f.sha256)changed.push(f.path);}
 assert.deepEqual(changed.sort(),["src/scene/palace/special/RemainingResidentialHalls.js", "src/scene/palace/special/ShoukangEastWarmRoom.js", "src/scene/palace/special/ShoukangHall.js", "src/scene/palace/special/YangxinWestWarmRooms.js"]);
 for(const p of ['src/scene/palace/special/SourceGuidedNameboardMounts.js','src/scene/palace/special/SideGateProfiles.js','src/scene/palace/special/ChuxiuHall.js','src/utils/Collision.js','src/ui/Teleport.js'])assert.equal(sha(read(p)),retained[p],p+' retains cumulative R49B/R49D/R49E/R51; no Jingyun experiment');
});
