import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const sha=x=>createHash('sha256').update(x).digest('hex'),hash=x=>sha(JSON.stringify(x));
const baseline='1fb85925f7ab6358661df9a1ac564ad70013d7f7',candidate='21472ee195555bd6438a94634c93fe183d24f977';
// Offline evidence regeneration only; runtime tests never require Git objects.
// Usage: node tests/lib/generate-r33-scene-registry.mjs <before.json> <after.json> <output.json>
if(process.argv.length!==5)throw new Error('Expected independent baseline capture, candidate capture, and output path');
const before=JSON.parse(fs.readFileSync(process.argv[2])),after=JSON.parse(fs.readFileSync(process.argv[3]));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function changes(a,b,path=[],out=[]){
 if(same(a,b))return out;
 if(Array.isArray(a)&&Array.isArray(b)&&a.length!==b.length){
  let prefix=0,suffix=0;while(prefix<Math.min(a.length,b.length)&&same(a[prefix],b[prefix]))prefix++;
  while(suffix<Math.min(a.length,b.length)-prefix&&same(a.at(-suffix-1),b.at(-suffix-1)))suffix++;
  out.push({kind:'splice',path,beforeIndex:prefix,afterIndex:prefix,before:a.slice(prefix,a.length-suffix),after:b.slice(prefix,b.length-suffix)});return out;
 }
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){
  for(const key of [...new Set([...Object.keys(a),...Object.keys(b)])]){
   if(!Object.hasOwn(a,key)||!Object.hasOwn(b,key))out.push({kind:'field',path:[...path,key],beforeAbsent:!Object.hasOwn(a,key),afterAbsent:!Object.hasOwn(b,key),...(Object.hasOwn(a,key)?{before:a[key]}:{}),...(Object.hasOwn(b,key)?{after:b[key]}:{})});
   else changes(a[key],b[key],[...path,key],out);
  }return out;
 }
 out.push({kind:'field',path,before:a,after:b});return out;
}
function runtime(data,prefix){return data.runtimeValues.filter(r=>prefix.every((k,i)=>k===r.path[i])).map(r=>({...r,path:r.path.slice(prefix.length)}));}
function delta(a,b,prefix){return{beforeSHA256:hash(a),afterSHA256:hash(b),runtimeValues:{before:runtime(before,prefix),after:runtime(after,prefix)},changes:changes(a,b)};}
const git=(...args)=>execFileSync('git',args,{maxBuffer:30*1024*1024});
const changed=git('diff','--name-only','--diff-filter=M',baseline,candidate,'--','src','data').toString().trim().split('\n');
const baselineSources=Object.fromEntries(changed.map(path=>{const bytes=git('show',baseline+':'+path);return[path,{sha256:sha(bytes),bytes:bytes.length,utf8:bytes.toString()}]}));
const paths=git('ls-tree','-r','--name-only',baseline,'--','src','data').toString().trim().split('\n').filter(p=>/\.(js|json)$/.test(p));
const retainedSources=Object.fromEntries(paths.filter(p=>!changed.includes(p)).map(p=>[p,sha(git('show',baseline+':'+p))]));
const costs=c=>({triangles:Object.values(c.rows).reduce((n,r)=>n+r.triangles,0),meshes:c.meshes.length,graphNodes:c.graph.length,geometryBytes:c.geometryBytes,uniqueMaterials:c.uniqueMaterials,uniqueTextures:c.uniqueTextures,colliders:c.navigation.colliders.length,walkables:c.navigation.walkables.length});
const fixture={schema:1,baseline,candidate,scope:'Permanent resident PalaceBuilder scene; streamed zones and optional GLBs are independently tested by raw R33 product acceptance.',baselineSources,retainedSources,capture:delta(before.capture,after.capture,[]),parts:Object.fromEntries(['rows','meshes','graph','materials'].map(k=>[k,delta(before.capture[k],after.capture[k],[k])])),navigation:delta(before.capture.navigation,after.capture.navigation,['navigation']),sceneRows:Object.fromEntries(Object.keys(before.capture.rows).filter(k=>!same(before.capture.rows[k],after.capture.rows[k])).map(k=>[k,delta(before.capture.rows[k],after.capture.rows[k],['rows',k])])),costs:{before:costs(before.capture),after:costs(after.capture)}};
const raw=JSON.stringify(fixture,null,2)+'\n';fs.writeFileSync(process.argv[4],raw);console.log(JSON.stringify({sha256:sha(raw),bytes:Buffer.byteLength(raw),captureChanges:fixture.capture.changes.length,sourceCount:changed.length,retainedCount:paths.length-changed.length,costs:fixture.costs}));
