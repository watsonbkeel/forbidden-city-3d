import {writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';import {component,probe} from './lib/r58-zuoyi-visible-fixture.mjs';
// Pin the old helper, so rerunning cannot relabel the corrected implementation.
const source=execFileSync('git',['show','62d489a:src/scene/palace/special/ZuoyiDoorFront.js'],{encoding:'utf8'}).replace("from 'three'",`from '${import.meta.resolve('three')}'`);
const {applyZuoyiDoorFront:apply}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const c=await component({apply}),report={scope:'ACTUAL_FULL_GATE_MERGE_WITH_WALLS_PLATFORM_REAL_LOCAL_ASSETS_CPU_RAYS_NOT_BROWSER',assumptionUnderTest:'Both corrected faces were local -Z and full UV-height graphic',observations:probe(c,{fitted:false})};
writeFileSync('reports/r58-zuoyi-visible/old-hidden-face-and-floor.json',JSON.stringify(report,null,2)+'\n');console.log(report.observations.map(o=>({normal:o.normal,eye:o.eye,legal:o.legal,centerHit:o.centerHit,rows:o.rows.map(r=>({y:r.target[1],visible:r.visible,material:r.material}))})));c.dispose();
