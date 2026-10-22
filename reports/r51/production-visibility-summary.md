# R51 production character visibility: independent CPU integration (before LOD2 sole fix)

## Result

The frozen R50-style default failed the new real-entry test with zero rendered character instances (`enabled=true`, `canRunContent=false`). The R51 candidate passes without calling development preview or injecting approval.

Fresh full-world evidence:

- Complete real `main.js` constructor, `init`, `createUI`, `animate`, and `dispose` run after a production Vite compile. Only automatic bootstrap is removed and the class exported; no main method body is rewritten.
- Real CharacterSystem, CharacterManager, CharacterWorldAdapter, CharacterResourcePool, CharacterKit, and CharacterRenderer run. Real THREE.InstancedMesh objects are attached to the scene constructed by real main.
- The scene comes from the existing production `buildCharacterWorld` fixture: all-zone collision data, actual static architecture, and loaded west-six rendered geometry. It contains 23,253 colliders and 1,075 walkables. All 38 character bindings become ready at their actual unchanged registry placements.
- Original opening camera `[0, 1.7, -494]`: 6 submitted instances after preparation, including both Wumen guards. The exported near field contains 2 guards, with 64 character pixels remaining after CPU scene occlusion at 960×540.
- Taihe near camera `[-12, 1.7, -90]`: 10 submitted instances, including 2 LOD0 actors. The exported view contains 8 character instances, with 14,829 character pixels after CPU scene occlusion.
- Real Settings initial on-state matches System; the actual UI button turns instances off to zero and ordinary on restores them. At night, nonzero guard instances remain while daytime schedules fade out.
- `contentEnabled=true`, `contentApproved=false`, `rollout=candidate-visible`, and `acceptance.complete=false` remain separate.

## Images and foot-contact caveat

`production-visibility-spawn-cpu.png` and `production-visibility-taihe-cpu.png` are CPU geometry diagnostics, not browser/GPU screenshots. Architecture is intentionally untextured/white in this diagnostic; production textures and materials have not been deleted. Runtime lighting, contact shadows, postprocessing, texture appearance, and shader dithering are not reproduced. The images were not subsequently retouched.

The close official's apparent floating was checked against the actual exported deformed instance vertices and actual architectural triangles, rather than anchor heights. Full results are in `production-visibility-foot-contact.json`:

- Two LOD0 officials, one LOD1 official, and two LOD1 guards: each sole's sampled gap is within ±4.2×10⁻¹⁷ m, below the declared 10⁻⁵ m numerical-contact tolerance. These five instances are geometrically grounded. Missing contact shadows can make the nearest figure look detached in this CPU image.
- Two opening-view LOD2 guards: +0.0240000002 m visible-sole gap.
- LOD2 emperor: +0.0240005255 m visible-sole gap above the actual footstool.
- Two LOD2 ritual attendants: −0.005999733 m against the actual higher `三台_taihe_square_brick_floor` triangles, approximately 6 mm overlap rather than floating.

The LOD2 shoe implementation omits the 0–24 mm sole geometry. This is a measured remaining simplification, not an all-LOD contact pass. No model, shadow, placement, or PNG was altered to hide it. Every foot has 6, 7, or 13 bottom-vertex rays recorded with the actual source mesh and triangle index. All captured character streams contain their full index count, so clipped-away feet cannot masquerade as a complete measurement.

## Explicit test boundaries

The GPU renderer shell, audio, unrelated UI, flight shell, and world-constructor handoff are dependency seams listed in each JSON report. The world is freshly constructed by existing production builders before being attached to main's own scene. This verifies the real compiled character entry chain; it is not a full browser initialization or GPU frame test. The near camera is an inspection relocation through the controls position method, not a certified collision-walk route. The CPU view exporter caps architectural distance at 135 m and uses the unchanged camera projection.

No browser retries, sandbox workarounds, remote uploads, deployment, main-branch operations, or production source edits were performed by this QA task.

## Final-source inheritance

The fresh world ran before two small status/error-bookkeeping changes. `production-visibility-final-inheritance.json` proves the boundary by exactly reversing only those source changes and obtaining the byte-identical previous Vite production bundle SHA-256. Current source separately passes the cheap compiled complete-main test. Character geometry, world adapter, registry/placements, and main wiring are unchanged. The active R49E freeze manifest has SHA-256 `1f30a6f35154dcdc270ec9244dc94d3ea575d858bac6b9a54af4653dd3ddf8d8`; all 185 recorded source hashes were independently checked with zero mismatches.

## Reproduction

Current lightweight complete-entry check:

    node --test tests/r51-production-visibility.test.mjs

Recorded full-world evidence provenance:

    node --test tests/r51-production-visibility-provenance.test.mjs

One fresh complete-world run, when coordinated with other heavy checks:

    R51_VISIBILITY_FULL_WORLD=1 node --max-old-space-size=7000 --test tests/r51-production-visibility.test.mjs

The full run writes geometry working caches to `/tmp/r51-production-visibility-geometry` by default; set `R51_VISIBILITY_GEOMETRY_DIR` to choose another cache directory. The original full-world JSON records the original capture paths; caches have since been relocated to that temporary directory, not included as release artifacts. Recreate CPU images using `tests/lib/r51-production-raster.py CACHE/production-visibility-spawn-geometry.json.gz OUTPUT.png` and the equivalent Taihe filename. Recreate the contact audit with `node tests/r51-production-visibility-feet.mjs` after generating caches.

The frozen red sources are preserved in `production-visibility-red-sources.tar.gz`. Extract to a temporary directory and pass it as `R51_VISIBILITY_BASE_DIR`; the current entry test should fail specifically at the zero-instance assertion. The archive only substitutes main, System, Manager, and Settings, not world geometry.

## Final R51 after-LOD2 successor

The unsuffixed files above are before-fix evidence, preserved without replacing either PNG. Use `production-visibility-green-fullworld-after-lod2.json`, `production-visibility-final-inheritance-after-lod2.json` and the two `*-cpu-after-lod2.png` images for the delivered candidate. The final complete-main/full-world run passed with current source hashes; direct full/cheap compiled bundle equality is verified.

The final actual deformed-foot audit is `production-visibility-foot-contact-after-lod2.json.gz`: ten instances, eight with both feet within 1e-5 m of actual triangles, zero positive-gap instances, two 30 mm penetrations into the pre-existing visible brick surface `三台_taihe_square_brick_floor` above its logical floor. The earlier description “carpet” was a provisional misidentification, corrected by the recorded mesh name and triangle vertices. No architectural surface or placement was changed. The nearest two LOD0 figures are at numerical zero; no artificial contact shadow was added.

Both foot JSONs are losslessly archived, with original byte hashes and restoration in `../r51-unified/report-transport.json`. Raw JSON duplicates and regenerable geometry dumps are excluded from the release tree. Production textures remain intact; these white-model CPU diagnostics do not reproduce game texture/light/shadow output.
