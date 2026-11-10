// Comparison-only source substitution. Candidate always uses ordinary imports.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const hash=x=>createHash('sha256').update(x).digest('hex');
const hostURL=new URL('../../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url);
const oldURL=new URL('../r265-dafotang-frieze/fixtures/r264-layout.js.txt',import.meta.url);
const currentURL=new URL('../../src/scene/palace/special/DafotangHistoricLayout.js',import.meta.url);
const supportURL=new URL('../../src/utils/TriangleSupport.js',import.meta.url);
const HOST='900a43f0a1caa2d7b76d8101df49795cbf38423acf0e8b5addd01ce5d467defc';
const OLD='b4a8363eaa7f74fa11638aeeef5f660dcb45bb1268117a75d633035209c2cfeb';
const CURRENT='e83fac03379d5288bbf47bffcb1c696dfd84ff016f5f8a1ea43d8a34d252ea1d';
const SUPPORT='7fd649dc22e354351c0457236da04339b5008cd7125f175129a5f96c6b1e1c1a';
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
function replaceOnce(code,before,after){assert.equal(code.split(before).length,2,'exact import occurs once');return code.replace(before,after);}
export function rewritePinnedSources(host,old){
 assert.equal(hash(host),HOST,'exact current host required');assert.equal(hash(old),OLD,'exact R264 source required');
 assert.equal(hash(fs.readFileSync(currentURL)),CURRENT,'exact current product required');
 assert.equal(hash(fs.readFileSync(supportURL)),SUPPORT,'exact support dependency required');
 old=replaceOnce(old,"import * as T from 'three';",`import * as T from ${JSON.stringify(import.meta.resolve('three'))};`);
 old=replaceOnce(old,"import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';",`import {createTriangleTemplate,triangleInstance} from ${JSON.stringify(supportURL.href)};`);
 const oldImports=[...old.matchAll(/^import .* from ['"]([^'"]+)['"];$/gm)];
 assert.equal(oldImports.length,2);assert.ok(oldImports.every(m=>m[1].startsWith('file:')));
 const oldData=data(old);
 const imports=[...host.matchAll(/^import .* from ['"]([^'"]+)['"];$/gm)];
 assert.equal(imports.length,33,'fixed host import count');
 let layoutCount=0;
 host=host.replace(/^import (.*) from ['"]([^'"]+)['"];$/gm,(line,binding,spec)=>{
  if(spec==='./DafotangHistoricLayout.js'){layoutCount++;return `import ${binding} from ${JSON.stringify(oldData)};`;}
  const url=spec==='three'?import.meta.resolve('three'):new URL(spec,hostURL).href;
  assert.ok(url.startsWith('file:'),'fixed local dependency');return `import ${binding} from ${JSON.stringify(url)};`;
 });
 assert.equal(layoutCount,1,'one historical import only');return data(host);
}
export function makeBaselineHostSource(){return rewritePinnedSources(fs.readFileSync(hostURL,'utf8'),fs.readFileSync(oldURL,'utf8'));}
export async function loadBaselineHost(){return import(makeBaselineHostSource());}
