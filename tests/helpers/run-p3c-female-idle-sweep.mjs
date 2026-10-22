/** Run from repo root: node tests/helpers/run-p3c-female-idle-sweep.mjs <fresh-output.json>
 * Uses the frozen candidate06-07 mesh source and never overwrites evidence.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createFemaleIdleAudit} from './p3c-female-idle-sweep.mjs';
import {createCharacterGeometry as frozen07} from '../../reports/r50-followup/female-reference/candidate06-07/CharacterKit-source.js';
const out=process.argv[2];if(!out)throw Error('A fresh output path is required');
if(fs.existsSync(out))throw Error('Preserve existing evidence: '+out);
const cases=[],N=1256,period=200*Math.PI;
for(const id of ['consort-daily','maid-daily'])for(const seat of ['standard','kang-low','raised-footstool','throne-front-perch']){
 const audit=createFemaleIdleAudit(id,seat,frozen07),records=[];
 for(let n=0;n<=N;n++)records.push(audit.measure({time:period*n/N,phase:0,amplitude:.7}));
 const worst=Object.fromEntries(['handMin','palmMin','stackMin','rootMargin','sleeveMin','forearmMin','sleeveChange','forearmChange'].map(k=>[k,records.reduce((x,y)=>x[k]<y[k]?x:y)]));
 cases.push({id,seat,counts:audit.counts,kernelMaxError:audit.kernelMaxError,staticRoi:audit.staticRoi,worst,records});audit.dispose();
 console.log(id,seat,'minimum hand clearance',worst.handMin.handMin,'minimum sleeve-root enclosure',worst.rootMargin.rootMargin);
}
const snapshot=new URL('../../reports/r50-followup/female-reference/candidate06-07/CharacterKit-source.js',import.meta.url);
fs.writeFileSync(out,JSON.stringify({sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(snapshot)).digest('hex'),method:'Actual cached indexed geometry; vertical triangle barycentric sampling accelerated by cells; canonical CPU deformation equivalence checked. 1257 uniform temporal samples over inclusive 0..200π seconds, phase0 amplitude.7. This finite sampling is NOT continuous-time collision proof. Non-zero existing cloth overlaps are reported separately, not hidden or relabelled as skin penetration.',periodSeconds:period,samplesPerCase:N+1,timeStepSeconds:period/N,cases},null,2),{flag:'wx'});
