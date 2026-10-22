import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {compileProductionMain} from './lib/r51-production-main.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');

await test('fresh-world compiled evidence matches final source or exact bookkeeping-only predecessor',async()=>{
 const suffix=process.env.R51_VISIBILITY_REPORT_SUFFIX??(fs.existsSync('reports/r51/production-visibility-green-fullworld-after-lod2.json')?'-after-lod2':'');
 const full=JSON.parse(fs.readFileSync(`reports/r51/production-visibility-green-fullworld${suffix}.json`));
 const final=JSON.parse(fs.readFileSync(`reports/r51/production-visibility-green${suffix}.json`));
 for(const [file,expected]of Object.entries(final.entry.sources))assert.equal(hash(fs.readFileSync(file)),expected,'final cheap compiled entry must be current: '+file);
 let system=fs.readFileSync('src/scene/characters/CharacterSystem.js','utf8');
 system=system.replace('this.lastError=null;this.lastFailure=null;this.lastDaylight=1','this.lastError=null;this.lastDaylight=1')
  .replace('        this.lastError=null; // Successful explicit retry clears only the active error.\n','')
  .replace('this.lastError=this.lastFailure=String(error)','this.lastError=String(error)')
  .replace('lastError:this.lastError,lastFailure:this.lastFailure,','lastError:this.lastError,')
  .replace('...this.manager.stats,rollout:this.manager.rollout,','...this.manager.stats,');
 let manager=fs.readFileSync('src/scene/characters/CharacterManager.js','utf8');
 const expression="this.contentEnabled?'candidate-visible':(import.meta.env?.DEV === true && this.#developmentPreviewActive)?'preview-unverified':'content-unavailable'";
 manager=manager.replace('  get rollout() { return '+expression+'; }\n','').replace('rollout:this.rollout,','rollout:'+expression+',');
 const alreadyFresh=full.entry.sources['src/scene/characters/CharacterSystem.js']===final.entry.sources['src/scene/characters/CharacterSystem.js']&&full.entry.sources['src/scene/characters/CharacterManager.js']===final.entry.sources['src/scene/characters/CharacterManager.js'];
 const overrides=alreadyFresh?{}:{'src/scene/characters/CharacterSystem.js':system,'src/scene/characters/CharacterManager.js':manager};
 for(const [file,source]of Object.entries(overrides))assert.equal(hash(source),full.entry.sources[file],'exact inverse of limited final status/error changes: '+file);
 const reconstructed=await compileProductionMain({sourceOverrides:overrides});
 assert.equal(reconstructed.evidence.productionBundleSha256,full.entry.productionBundleSha256,'all compiled character geometry, world adapter, registry and main bytes are unchanged outside the two enumerated bookkeeping deltas');
 const report={createdAt:new Date().toISOString(),result:'pass',fullWorldIsFinalSource:alreadyFresh,fullWorldBundleSha256:full.entry.productionBundleSha256,reconstructedBundleSha256:reconstructed.evidence.productionBundleSha256,finalBundleSha256:final.entry.productionBundleSha256,scope:alreadyFresh?'Fresh full-world and final cheap main-entry tests use the byte-identical production bundle; no geometry-source inheritance is needed.':'Full-world physical and CPU raster evidence is retained. Final source is independently production-compiled and runs real main startup, actual Renderer, Settings off/on, and night guards. Exact inverse source reconstruction recovers the byte-identical prior production bundle, proving no other compiled module changed.',allowedDeltas:alreadyFresh?[]:['CharacterSystem retains lastFailure and clears active lastError after a successful enabled update.','CharacterManager extracts the unchanged rollout expression into a read-only getter; CharacterSystem.statusSnapshot includes it.'],unchanged:['main construction and frame path','CharacterRenderer/CharacterKit geometry and animation','CharacterWorldAdapter binding','character placements, registry and world configuration'],boundaries:'CPU integration only. No full-frame WebGL, device performance, pixel-perfect texture, lighting, or historical acceptance.'};
 fs.writeFileSync(`reports/r51/production-visibility-final-inheritance${suffix}.json`,JSON.stringify(report,null,2)+'\n');
});
