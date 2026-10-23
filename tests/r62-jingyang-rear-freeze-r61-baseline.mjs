// Capture the unchanged R61 baseline method and actual target geometry.
import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';import {library} from './lib/inner-palace-fixture.mjs';import {hallSignature} from './lib/r40-hall-signature.mjs';
const commit='6b396800b6a03582aebf513fcef4966e9f5d0db3',file='src/scene/zones/ZoneBase.js',sha=s=>createHash('sha256').update(s).digest('hex'),source=execFileSync('git',['show',`${commit}:${file}`],{encoding:'utf8'}),methodSource=ZoneBase.prototype.buildHallBaseline.toString();
if(!source.includes(methodSource))throw Error('Current baseline method bytes must exist verbatim in frozen R61 source');
const zone=JSON.parse(execFileSync('git',['show',`${commit}:data/zones/east-six.json`],{encoding:'utf8'})),item=zone.items[38],b=new ZoneBase(library(),zone);b.buildHallBaseline(item);const signature=hallSignature(b.kit);
const result={commit,sourcePath:file,sourceBytes:Buffer.byteLength(source),sourceSha256:sha(source),methodBytes:Buffer.byteLength(methodSource),methodSha256:sha(methodSource),methodSource,item,actualHallSignature:signature};fs.writeFileSync('tests/fixtures/r62-jingyang-rear/r61-baseline.json',JSON.stringify(result,null,2)+'\n');b.kit.dispose(b.kit.root);console.log(result.sourceSha256,result.methodSha256);
