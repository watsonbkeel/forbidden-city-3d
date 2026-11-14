// Execute only inside the externally reviewed original 6GiB / 720s guard.
import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import os from 'node:os';import {validate,raw,obj,verifySegment,verifySegmentFaces,verifyObj} from './format.mjs';
const root='/tmp/central-baseline-source',out=process.env.EVIDENCE_DIR;
const pins=JSON.parse(await fs.readFile(new URL('./baseline-pins.json',import.meta.url),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');let study,lotus,hair;const errors=[];let result;
if(!out||!path.isAbsolute(out))throw Error('absolute EVIDENCE_DIR required');await fs.mkdir(out,{recursive:true});
const files={};let totalBytes=0;
async function save(name,bytes){const b=typeof bytes==='string'?Buffer.from(bytes):bytes;if(totalBytes+b.length>128*1024*1024)throw Error('output byte budget');totalBytes+=b.length;await fs.writeFile(path.join(out,name),b,{flag:'wx'});const back=await fs.readFile(path.join(out,name));if(!back.equals(b))throw Error('readback '+name);files[name]={bytes:b.length,sha256:sha(back)};}
try{
 // Outer admission independently verifies clean Git/tree/lockfile. No short-lived git under RSS guard.
 if(process.env.GITHUB_SHA!==pins.head)throw Error('fixed GITHUB_SHA mismatch');
 const head=(await fs.readFile(path.join(root,'.git/HEAD'),'utf8')).trim();if(head!==pins.head)throw Error('detached HEAD mismatch');
 for(const [name,hash]of Object.entries(pins.files))if(sha(await fs.readFile(path.join(root,name)))!==hash)throw Error('input hash '+name);
 const src=path.join(root,'src/scene/palace/special');const mod=n=>import(pathToFileURL(path.join(src,n)).href);
 const {createCentralBuddhaVolumeStudy}=await mod('CentralBuddhaVolumeStudy.js');
 const {createEightTierLotus}=await mod('EightTierLotus.js');const {preparePetalUV}=await mod('OriginalLotusPetalUV.js');const {createStudyHair}=await mod('StudyHeadDetails.js');
 const grid=JSON.parse(await fs.readFile(path.join(root,'public/textures/dafotang-original/shakyamuni-refined-alpha-grid-v2.json'),'utf8'));
 if(grid.columns!==129||grid.rows!==193||grid.imageWidth!==1024||grid.imageHeight!==1536||grid.sourceSHA256!==pins.files['public/textures/dafotang-original/shakyamuni-refined-v2.png'])throw Error('source grid identity');
 if(!Array.isArray(grid.alpha)||grid.alpha.length!==129*193||grid.alpha.some(x=>!Number.isInteger(x)||x<0||x>255))throw Error('alpha values');
 study=createCentralBuddhaVolumeStudy({...grid,alpha:new Uint8Array(grid.alpha)},{texture:null});
 lotus=createEightTierLotus();lotus.scale(1,.81/lotus.boundingBox.max.y,1);lotus.attributes.uv.array.set(preparePetalUV(lotus,'shakyamuni'));lotus.deleteAttribute('lotusTier');hair=createStudyHair();
 const g=study.mesh.geometry,parts=study.meta.parts.filter(p=>p.name.includes('finger')||p.name.includes('ear')||p.name==='nose');
 if(parts.map(p=>p.name).join(',')!=='right-ear,left-ear,nose,right-finger-0,right-finger-1,right-finger-2,right-finger-3')throw Error('part order');
 const bodyCount=g.attributes.position.count-parts.reduce((n,p)=>n+p.vertices,0)-lotus.attributes.position.count-hair.attributes.position.count;
 const ranges=[{name:'body-with-fused-palms-locked',start:0,count:bodyCount}];let offset=bodyCount;
 for(const p of parts){ranges.push({name:p.name,start:offset,count:p.vertices});offset+=p.vertices;}
 ranges.push({name:'original-lotus',start:offset,count:lotus.attributes.position.count});offset+=lotus.attributes.position.count;ranges.push({name:'hair-reference',start:offset,count:hair.attributes.position.count});
 const counts=validate(g,ranges);verifySegment(g,lotus,ranges.at(-2));verifySegment(g,hair,ranges.at(-1));verifySegmentFaces(g,lotus,ranges.at(-2));verifySegmentFaces(g,hair,ranges.at(-1));
 // Verify material partition independently of reordered final indices.
 for(const group of g.groups)for(let i=group.start;i<group.start+group.count;i++){const v=g.index.array[i],r=ranges.find(r=>v>=r.start&&v<r.start+r.count);const allowed=r.name==='original-lotus'?[2,3,4]:r.name==='hair-reference'?[5,6]:[0,1];if(!allowed.includes(group.materialIndex))throw Error('material segment mismatch');}
 const attributes={};for(const [name,a]of Object.entries(g.attributes)){await save(name+'.bin',raw(a.array));attributes[name]={dtype:a.array.constructor.name,itemSize:a.itemSize,normalized:a.normalized,count:a.count,usage:a.usage};}
 await save('index.bin',raw(g.index.array));await save('meta.json',JSON.stringify(study.meta,null,2)+'\n');await save('groups.json',JSON.stringify(g.groups,null,2)+'\n');
 const objRoundtrip={};for(const r of ranges){await save(r.name+'.obj',obj(g,r));objRoundtrip[r.name]=verifyObj(await fs.readFile(path.join(out,r.name+'.obj'),'utf8'),g,r);}
 await save('obj-roundtrip.json',JSON.stringify(objRoundtrip,null,2)+'\n');
 await save('source-vertex-map.json',JSON.stringify(ranges.map(r=>({...r,objVertexOneBasedToSource:'sourceIndex=start+objIndex-1',lockedReference:true})),null,2)+'\n');
 const manifest={schema:1,identity:pins,counts,attributes,index:{dtype:g.index.array.constructor.name,count:g.index.count},byteOrder:os.endianness(),ranges,files,scope:'CLAY_REFERENCE_NOT_ART_ACCEPTANCE',transform:{forward:'(x,-z,y)',inverse:'(x,z,-y)',units:'metres',weld:false,scale:1},limitations:['Fused palms cannot be split from body by semantic vertex range','OBJ is visual derivative, binary arrays are authoritative','No custom shader/colour restoration or historical side/back claim']};
 await save('manifest.json',JSON.stringify(manifest,null,2)+'\n');result={counts,manifestSha256:files['manifest.json'].sha256,files:Object.keys(files).length};
}catch(e){errors.push(e.stack??String(e));}
finally{for(const x of [study,lotus,hair])try{x?.dispose();}catch(e){errors.push('cleanup: '+e.stack);}}
await fs.writeFile(path.join(out,'receipt.json'),JSON.stringify({complete:errors.length===0&&!!result,cleanup:!errors.some(x=>x.startsWith('cleanup:')),result,errors},null,2)+'\n');if(errors.length)throw Error(errors.join('\n'));
