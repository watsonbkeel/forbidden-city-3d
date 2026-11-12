// HISTORICAL_HOST_VIEW only. This pure exact inverse does not load or run the
// current host. Actual new-component behavior has separate direct-import tests.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const PATH='src/scene/palace/special/RemainingOuterHalls.js';
const CURRENT='af87d0c921cc84f28c4570f13d37e718f8880eba198b426787cd439f506f5f6f';
const PRIOR='900a43f0a1caa2d7b76d8101df49795cbf38423acf0e8b5addd01ce5d467defc';
const hash=s=>createHash('sha256').update(s).digest('hex');
export function priorUpperCentralBandHostSource(source,relativePath=PATH){
 assert.equal(relativePath,PATH,'R266 one exact host path');assert.equal(typeof source,'string');assert.equal(hash(source),CURRENT,'R266 exact current host bytes');
 for(const part of["import {buildDafotangUpperCentralBand} from './DafotangUpperCentralBand.js';\n","  if(p.key==='dafotang')buildDafotangUpperCentralBand(c);\n"]){assert.equal(source.split(part).length,2,'R266 exact once-only additive fragment');source=source.replace(part,'');}
 assert.equal(hash(source),PRIOR,'R266 exact historical host restored');return source;
}
