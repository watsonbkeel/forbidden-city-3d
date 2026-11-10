// Source/data only. Not scene, role, route, browser or release acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {assertH17Dictionary} from './dictionary-contract.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(p,'utf8');
const canonical=x=>JSON.stringify(x&&typeof x==='object'?(Array.isArray(x)?x.map(canonicalValue):Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonicalValue(x[k])]))):x);
const canonicalValue=x=>x&&typeof x==='object'?(Array.isArray(x)?x.map(canonicalValue):Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonicalValue(x[k])]))):x;
const BASE={"src/scene/zones/ZoneBase.js": "9d18f5b3548ba09f670ea0e1aaf009d4f3edcf9d90a862ec152ab41ef6038da0", "data/i18n/ui-en.json": "e1e9876d901cca8d02e3432db0f6357579c30acb2cfb37d480e71bad2d8d7daa", "data/places/supplemental.json": "27504d6048d40d97b31a54c42f481150fdf49d763318b6e570a62428656daf82", "tests/r175-cuiyun-hall/card.test.mjs": "9f3be659cb3bdab85045e288e803b19d170875170df79cc6a9537e874dbcfdb7"}, PINS={"src/scene/palace/kit.js": "92fa007e818ec4949a104af53fcba868ca17888a886dffacf784525a55e946fd", "src/scene/palace/special/XiananContactSources.js": "61a98d35ccc41ab038dd52384f93129032ca9bae0b6f1ffc55a91974e054a6a1", "src/scene/zones/ZoneManager.js": "c90f60a7770436381a953becc3c29ab3bce3e7c98e79c67c11c97c76d4515b19", "src/controls/FirstPerson.js": "8c0662a198e212e3e9fe4e6e4a012f08bbfc45896088d1c38c6fdf801a604020", "src/utils/Collision.js": "2efa520333bec48ff3d9b644b374f82cbadcc07f2259d347479a1dc2d18a78c2", "src/scene/Environment.js": "b7a0e7531cf2d9c1009b4e0fbc65f3e5d19ed6da555c28ed6e2dd052e0cd0419", "src/utils/GeometryUV.js": "6c6f55acd7e96d8dd8169baa62e0fdee7f92b27deb30532de022b18858884e30", "src/utils/TriangleSupport.js": "7fd649dc22e354351c0457236da04339b5008cd7125f175129a5f96c6b1e1c1a", "src/utils/MergeUtils.js": "c05e4cb0447433b83c7d14c0c5996e96a5b080fa474f667a87c93d6f3f1011c6", "src/scene/Enclosure.js": "bc04b06d5d4999340bfd66c4d6423a504a7e0b5819c42acd4c5472e69fc2713a", "data/zones/index.js": "67d5cd080aa88f15e003c1413c23ce76315cb67de6d7b3bf7bad2ff156057e49"};
test('H17 builder has only the reviewed rollback delta; paired bounds/Chenghuang stay fixed',()=>{
 for(const [p,h]of Object.entries({"src/scene/palace/special/HuiyaoLou.js": "6675e15cbd735c2cdb9ae41028ab13a09b281b3188946ecb5d77428b894da7f2", "data/zones/outer-west.json": "54e33d582715c1f97e9c9d187a279067e6dbbc9093f3b26c86e9632aeae1e704", "src/scene/palace/special/ChenghuangGlazedEntry.js": "e132981fa2791754e9fdb74fcc37520e2bf37d87c00ed073f94a5723e8a9b756"})){assert.ok(fs.existsSync(p),'H17 target file required: '+p);assert.equal(sha(read(p)),h,p);}
 const builder=read('src/scene/palace/special/HuiyaoLou.js'),reviewed=" catch(e){\n  // Unrelated source frames must stay mounted: their removed events revoke ownership.\n  for(const child of stagedChildren)if(child.parent===kit.root)kit.root.remove(child);\n  if(prior.old.parent!==kit.root)kit.root.add(prior.old);\n  const wallIndex=kit.root.children.indexOf(prior.old);\n  kit.root.children.splice(wallIndex,1);\n  kit.root.children.splice(oldChildren.indexOf(prior.old),0,prior.old);\n  for(const[k,a]of Object.entries(oldStreams))kit[k].splice(0,kit[k].length,...a);\n  s.root.add(...stagedChildren);s.dispose(s.root);throw e;\n }",prior=" catch(e){kit.root.remove(...[...kit.root.children]);kit.root.add(...oldChildren);for(const[k,a]of Object.entries(oldStreams))kit[k].splice(0,kit[k].length,...a);s.root.add(...stagedChildren);s.dispose(s.root);throw e;}";
 assert.equal(builder.split(reviewed).length,2,'one reviewed rollback replacement only');assert.equal(sha(builder.replace(reviewed,prior)),"e09c45a665d488a4385dc5c475d0255411e77640af3711b8d1a216605dba48f2",'inverse is exact frozen R180/R223 builder');
 const z=JSON.parse(read('data/zones/outer-west.json'));assert.equal(z.bounds.z1,529.9);assert.equal(z.items.length,58);
});
test('H17 has one import and post-hook153 call; inverse restores complete current ZoneBase',()=>{
 // Only the three reviewed R242 insertions are inverted; frozen H17 BASE stays.
 const r242=["import {validateTaijiSouthGateSource,applyTaijiSouthGateGlaze} from '../palace/special/TaijiSouthGateGlaze.js';\n", "    validateTaijiSouthGateSource(this.zoneJson,item);\n", "    applyTaijiSouthGateGlaze(this.kit,this.kit.root.children.at(-1),this.zoneJson,item);\n"];
 const anchors=[r242[0]+"import {buildHuiyaoLou} from '../palace/special/HuiyaoLou.js';\n",'  buildGate(item) {\n'+r242[1],'    const width = this.kit.gate(params);\n'+r242[2]];
 function inverse242(text){
  for(let i=0;i<r242.length;i++){assert.equal(text.split(r242[i]).length,2,'unique R242 insertion');assert.equal(text.split(anchors[i]).length,2,'exact R242 insertion position');}
  const result=r242.reduce((x,part)=>x.replace(part,''),text);
  assert.equal(sha(result),'d4a8f7007a30650fdc1621c3744afa927722ba72cd2598a2d284ab2f9de6eda5','complete immediate-parent ZoneBase');return result;
 }
 const current=read('src/scene/zones/ZoneBase.js');
 for(const part of r242){assert.throws(()=>inverse242(current.replace(part,'')));assert.throws(()=>inverse242(current.replace(part,part+part)));assert.throws(()=>inverse242(current.replace(part,part.replace('Taiji','TaijiChanged'))));}
 assert.throws(()=>inverse242(current.replace(r242[1],'').replace(r242[2],r242[2]+r242[1])),'moved preflight');
 assert.throws(()=>inverse242(current+'\n'),'any retained-byte change');
 const s=inverse242(current),imp="import {buildHuiyaoLou} from '../palace/special/HuiyaoLou.js';\n",call='    buildHuiyaoLou(this.kit,this.zoneJson);\n';
 assert.equal(s.split(imp).length,2,'one H17 import required');assert.equal(s.split(call).length,2,'one H17 call required');
 assert.ok(s.includes("    yield {phase:'hook',index:153};\n"+call+'    buildCuiyunRearHall(this.kit,this.zoneJson);'));
 assert.equal(sha(s.replace(imp,'').replace(call,'')),BASE['src/scene/zones/ZoneBase.js']);
});
test('H17 appends the exact information-only card while preserving every byte of 132 prior records',()=>{
 const s=read('data/places/supplemental.json'),d=JSON.parse(s);assert.equal(d.records.length,133,'one appended H17 card required');
 const q=d.records.at(-1);assert.equal(sha(canonical(q)),"7dcfab5275d24c07cffe0012fd816930988299dee0f50aabd9d9a7d4209c18f7");assert.equal(q.id,'supp-fc-9cb03d7316');assert.equal(q.sourceObjectId,'FC-9CB03D7316');assert.equal(q.mapBinding,null);assert.equal(q.travel,'none');
 assert.equal(new Set(d.records.map(x=>x.id)).size,133);assert.equal(d.records.filter(x=>x.sourceObjectId===q.sourceObjectId).length,1);
 assert.equal(d.records.filter(x=>x.classification==='supplemental-directory-only').length,105);assert.equal(d.records.filter(x=>x.classification!=='supplemental-directory-only').length,28);
 assert.equal(d.originalCardCount,164);assert.equal(d.supplementalMapCardCount,28);assert.equal(d.supplementalDirectoryCardCount,105);assert.equal(d.candidateCardDenominator,297);
 const marker=',\n    {\n      "id": "supp-fc-9cb03d7316"';assert.equal(s.split(marker).length,2);
 const inverse=(s.slice(0,s.indexOf(marker))+'\n  ]\n}\n').replace('"supplementalDirectoryCardCount": 105','"supplementalDirectoryCardCount": 104').replace('"candidateCardDenominator": 297','"candidateCardDenominator": 296');
 assert.equal(sha(inverse),BASE['data/places/supplemental.json']);
});
test('H17 English name is the sole delta from reviewed B, preserving R231 dates and E45 translation',()=>{
 assertH17Dictionary(read('data/i18n/ui-en.json'),BASE['data/i18n/ui-en.json']);
});
test('old H5 card contract changes only its current denominator and directory expectations',()=>{
 const s=read('tests/r175-cuiyun-hall/card.test.mjs');assert.ok(s.includes('raw.candidateCardDenominator,297'));assert.ok(s.includes('directory.length,105'));
 assert.equal(sha(s.replace('raw.candidateCardDenominator,297','raw.candidateCardDenominator,296').replace('directory.length,105','directory.length,104')),BASE['tests/r175-cuiyun-hall/card.test.mjs']);
});
test('current Xianan finish/dispose/control chain and eight-zone index retain exact bytes after the FACE export inverse',()=>{
 for(const [p,h]of Object.entries(PINS)){
  let source=read(p);
  if(p==='src/scene/palace/kit.js'){
   const current="export { FACE } from './FaceDirections.js';",prior="export const FACE = { south: 0, north: Math.PI, east: Math.PI / 2, west: -Math.PI / 2 }; // 本场景东 = -X";
   assert.equal(source.split(current).length,2,'exactly one reviewed FACE re-export');
   source=source.replace(current,prior);
  }
  assert.equal(sha(source),h,p);
 }
});
