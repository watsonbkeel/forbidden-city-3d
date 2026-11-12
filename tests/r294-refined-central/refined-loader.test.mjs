import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import * as T from 'three';
import {loadOriginalBuddhaArtwork} from '../../src/scene/palace/special/DafotangOriginalArtworkLoader.js';
const baseURL='https://example.test/project/';
test('explicit refined central chooses corrected original PNG and genuine eight code tiers, not the painted seven-tier base',async()=>{
 const fetched=[],textures=[];
 const output=await loadOriginalBuddhaArtwork('shakyamuni',{centralRevision:'refined-eight-tier-v2',baseURL,fetchFn:async url=>{
  fetched.push(url);assert.ok(url.includes('shakyamuni-refined-'),'must not fetch original V1 for explicit refined mode');
  return new Response(fs.readFileSync(new URL('../../public/'+new URL(url).pathname.replace('/project/',''),import.meta.url)));
 },decodeTexture:async()=>{const t=new T.Texture({width:1024,height:1536});textures.push(t);return t;}});
 try{assert.equal(output.meta.lotusPetalTiers,8);assert.equal(output.meta.centralRevision,'refined-eight-tier-v2');assert.equal(output.meta.defaultProductReplacement,false);assert.equal(output.meta.historicalPhoto,false);assert.ok(output.mesh.isMesh);assert.equal(output.meta.sourceUpperLastRow,124);assert.equal(output.meta.oldPaintedPedestalUsed,false);assert.equal(output.meta.originalAsset.pngSHA256,'b6e856029b1cc55d3222c866fe8448eddd91db5c6a9eeca7a1b97773ac077b5d');assert.equal(fetched.length,2);}finally{output.dispose();}
});
test('unsupported central revision rejects before fetching',async()=>{let n=0;await assert.rejects(loadOriginalBuddhaArtwork('shakyamuni',{centralRevision:'unapproved-version',baseURL,fetchFn:async()=>{n++;throw Error('must not fetch');}}),/revision/i);assert.equal(n,0);});
test('cut image omits every old pedestal vertex and genuine lotus core joins the remaining robe without an air gap',async()=>{
 const {createRefinedCentralRelief}=await import('../../src/scene/palace/special/RefinedCentralBuddha.js');
 const grid=JSON.parse(fs.readFileSync(new URL('../../public/textures/dafotang-original/shakyamuni-refined-alpha-grid-v2.json',import.meta.url)));const alpha=Uint8Array.from(grid.alpha),before=alpha.slice();
 const output=createRefinedCentralRelief({...grid,alpha});
 try{
  assert.deepEqual(alpha,before);const g=output.mesh.geometry,p=g.attributes.position,uv=g.attributes.uv,ix=g.index;
  const groups=g.groups;assert.equal(groups.length,6);let cursor=0;for(const [i,group]of groups.entries()){assert.equal(group.start,cursor);assert.equal(group.materialIndex,i);cursor+=group.count;}assert.equal(cursor,ix.count);
  let upperMin=Infinity,coreMax=-Infinity;for(let i=0;i<groups[3].start;i++){const vertex=ix.getX(i);upperMin=Math.min(upperMin,p.getY(vertex));assert.ok(uv.getY(vertex)>=1-124/192-1e-7,'no UVs from painted seat');}
  for(let i=groups[3].start;i<groups[3].start+groups[3].count;i++)coreMax=Math.max(coreMax,p.getY(ix.getX(i)));
  assert.ok(coreMax>=upperMin,'solid lotus core must meet the retained upper body: '+JSON.stringify({coreMax,upperMin}));
  assert.deepEqual(output.meta.lotusTierVertexRanges.map(t=>t.id),[1,2,3,4,5,6,7,8]);
  for(const tier of output.meta.lotusTierVertexRanges){assert.equal(tier.petals.length,20);for(const petal of tier.petals){let low=Infinity,high=-Infinity;for(let i=petal.vertexStart;i<petal.vertexStart+petal.vertexCount;i++){low=Math.min(low,p.getY(i));high=Math.max(high,p.getY(i));}assert.ok(Math.abs(low-tier.baseY)<1e-6);assert.ok(Math.abs(high-tier.tipY)<1e-6);}}
  const b=g.boundingBox;assert.ok(b.min.x>=-.66&&b.max.x<=.66&&b.min.z>=-.56&&b.max.z<=.56&&b.min.y===0&&b.max.y<=2.25);assert.ok(ix.count/3<45000);
 }finally{output.dispose();}
});
test('new central factory rejects malformed grid and unsupported height without texture ownership transfer',async()=>{
 const {createRefinedCentralRelief}=await import('../../src/scene/palace/special/RefinedCentralBuddha.js');const texture=new T.Texture();let n=0;texture.addEventListener('dispose',()=>n++);
 assert.throws(()=>createRefinedCentralRelief({}, {texture,ownsTexture:true}),/bounded/);assert.equal(n,0);texture.dispose();
});
