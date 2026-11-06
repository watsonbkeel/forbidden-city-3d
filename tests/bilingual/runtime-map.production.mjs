// Heavy CPU production-map check. Run each allowed zone in a separate serial
// process; never include in the lightweight *.test.mjs set.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import '../lib/inner-palace-fixture.mjs';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {TourPlaceCatalog} from '../../src/ui/TourPlaceCatalog.js';
const zoneId=process.env.BILINGUAL_MAP_ZONE,allowed=['garden','outer-east','outer-west','west-six'];
assert.ok(allowed.includes(zoneId),'Set one approved BILINGUAL_MAP_ZONE for this heavy process');
const catalog=new TourPlaceCatalog(),expected=catalog.supplementalPlaces.filter(p=>p.supplementalText.mapBinding&&p.supplementalText.zoneId===zoneId);
assert.ok(expected.length>0);
test(`actual ${zoneId} production builder binds each supplemental map identity without generating destinations`,()=>{
 const zone=JSON.parse(fs.readFileSync(new URL(`../../data/zones/${zoneId}.json`,import.meta.url))),{library,dispose}=createActualLibrary(),builder=new ZoneBase(library,zone);
 try{
  const data=builder.build(),items=data.mapItems,rows=[];
  for(const place of expected){const row=place.supplementalText,binding=row.mapBinding,candidates=items.filter(item=>Object.entries(binding).every(([k,v])=>item[k]===v));assert.equal(candidates.length,1,`${row.id}: exact real map projection must be unique`);const actual=candidates[0];assert.equal(catalog.forMapItem(actual,items)?.id,row.id,`${row.id}: catalog binding`);
   for(const key of ['x','z','w','d']){const changed={...actual,[key]:actual[key]+.01};assert.notEqual(catalog.forMapItem(changed,[...items.filter(i=>i!==actual),changed])?.id,row.id,`${row.id}: ${key} negative control`);}
   assert.equal(catalog.forMapItem(actual,[...items,{...actual}]),null,`${row.id}: ambiguous projection rejected`);
   rows.push({id:row.id,sourceObjectId:row.sourceObjectId,parentObjectId:row.parentObjectId,structureId:row.structureId,bindingMode:row.bindingMode??'runtime-metadata-and-projection',expected:binding,actual,verification:'actual-ZoneBase-output'});
  }
  const snapshot=JSON.stringify(items);for(const p of catalog.supplementalPlaces.filter(p=>p.modelExperience.navigationMode==='information-only')){assert.equal(p.modelExperience.teleportTargetName,null);assert.equal(p.supplementalText.travel,'none');assert.equal(p.supplementalText.mapBinding,null);}assert.equal(JSON.stringify(items),snapshot,'catalog lookup cannot mutate production map inputs');
  const report={zoneId,scope:'Production ZoneBase CPU map output with inert texture pixels; not World, GPU, route, physical survey or live visitor-access acceptance',expectedIds:expected.map(p=>p.id),mapItems:items.length,matched:rows.length,rows,maxRSSKiB:process.resourceUsage().maxRSS};
  if(process.env.BILINGUAL_MAP_EVIDENCE_DIR){const dir=process.env.BILINGUAL_MAP_EVIDENCE_DIR;fs.mkdirSync(dir,{recursive:true});const dest=path.join(dir,`${zoneId}.json`);assert.equal(fs.existsSync(dest),false,'Do not overwrite map evidence');fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
  console.log(JSON.stringify({zoneId,matched:rows.length,expectedIds:report.expectedIds,maxRSSKiB:report.maxRSSKiB}));
 }finally{builder.releaseConstructionReferences();builder.dispose();dispose();global.gc?.();}
});
