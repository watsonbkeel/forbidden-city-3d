# R124 validation ledger — terminal evidence / external clean build tail pending

## Source / target / resource gates
- Initial feature test genuinely RED5/retentionPASS1; a separate first harness attempt had a JSON `undefined` map-name mismatch, corrected before implementation, raw retained.
- First implementation6/6PASS, actual+3156tri/+6materials/no newtexture. Initial visual review rejected disconnected nested rings; not accepted just because role/budget tests passed.
- Two connector/field tests RED2 with existing6PASS; corrected same-domain geometry and guards/owned material gate total11/11PASS (`green-ownership.tap`).
- Complete1223-collider JSON numeric payload (not only bounds/keys),101walkables,53rooms and38mapitems exactly match independently re-read frozen R123. This includes finite IDs/ramp/source vertices/normals. Runtime identity references still owned by each fresh scene, not cross-world pointer equality.
- SharedRestSlots actual northwest bed remains ready, slots `[106.19,1.0499999523162842,434.4]`/`[105.09,1.0499999523162842,434.4]`.
- New glass has transparent=true,opacity=.28,depthWrite=false,DoubleSide; no embedded map. Six new owned materials dispose once each. GPU transparency/PBR/reflection not tested by CPU raster.

## Actual-ready visual / geometry
- R123 baseline3cf; corrected art98dbe; release-only R124 metadata then0773. Seven exact cameras retained,43 actual local image requests ready with no unknown TextureLibrary keys/error.
- Independent saved-triangle comparison:27158full rows retained,1524removed/5520added = net3996. Changed rows each inside one approved old target convex envelope;15texture descriptors/decoded pixelSHA unchanged. No scene/frame/roof/platform/corridor/door aperture expansion.
- Reviewer accepted simplified source-backed facade composition, not dense carving, exact historic ornament, complete hanging brackets or painted fascia restoration. Four interior partitions/five-screen group reviewed but unchanged and remain partial.

## Ordinary controller routes (final0773)
- Scope: original.5m halfwidth square/1.7m height, real controller/physical waypoint driver; finished scene triangles inX[74,116],Z[398,455],Y[0,3]. Endpoint and observed accepted controller substeps; not arbitrary continuous whole-world swept proof.
- Initial5 outside-court/approach routes FAILED. Replayed same driver/input against frozen R123: every pose/airborne/feet value exact. Main outer approach stops421.709, old courtyard approaches85.291/104.309; oldturntarget423.50 stalls423.459. These failures stay recorded, not fixed or called pass.
- Separate **27 door-face cases** (main porch→main entry and each gallery→front-wing entry,10/30/60Hz × forward/back/right) all completed return. They isolate the changed enclosure, **not** proof that the failed outside approaches now work.
-18 shorter side-turn cases at423.45: only6 at30Hz complete,12 at10/60Hz incomplete; allposes and hits exact R123. Do not characterize all short turns as safe/open.
-27door+18shortturn cases: the initial first-hit observer found no first hit on a newly added face; this historical observer was insufficient because old floor hits can mask a later new face; the independent all-added-face replay below is now terminal. Existing floor/threshold hits remain (main1/1/0 per frequency; east-wing26/79/156 andwest-wing26/79/154 per frequency). Full route records retained in `routes/front-local-3freq.json` and old-source counterpart.
- Original long Tihe→corridor→main side→both rear doors→Lijing→opposite-side return9cases all complete at3frequencies×3directions. Inherited endpoint counts160/474/941 (eachdirection), initial first-hit new-face counter0 (historical insufficient counter; final all-added replay below is terminal). This is not “all body zero penetration”.
- `routes/same-driver-comparison.json` binds old3cf/new0773; unchanged Collision/FirstPerson and full contact payload support the inheritance classification. No expected assertions or global physics were changed.

## Execution status
The functional, source, cost and cumulative gates below have now reached terminal results. Only the clean final-commit build/package/HTTP identity tail is external; filenames alone never established completion.

### Final correction: all-added-face replay
The first-hit counter was insufficient and is not used as the final new-contact proof. `scripts/r124/replay-added-faces.mjs` independently extracts all5098 newly added geometric faces from actual old/new exports and checks only those faces for each saved pose, independent of any old hit.59records,20939endpoint samples and23968accepted substeps: **0new-face endpoint and0new-face accepted-substep intersections**. The explicit old-floor-first/new-wall-later fixture demonstrates the initial blind spot (oldobserverfalse; fulladdedobservertrue). Raw output/inputs SHA bind0773; it does not repair the inherited failed approaches or prove arbitrary swept motion.

### Final retained actors
Independent0773 fresh10/30/60Hz:1430/4284/8566frames, both actors complete outbound/sleep/return. Every full routineJSON (poses and original witnesses) byte-equals frozen R1233cf. Sourcebefore/after0773. Taihe inherited prefix and index333three prior sweep candidates at each frequency remain; no all-scene zero-penetration claim.

## Necessary cumulative gates, final0773
- R124target/guard/ownership11/11PASS; retainedR1239/9PASS; resource/detail/residency41/41PASS.
- Motion90tests89PASS/1FAIL: unchanged R113 oldfrontwingZ422 assertion conflicts with already accepted R123Z417; R96writer parent directory prepared, no repeated ENOENT.
- R119/R12029tests28PASS/1FAIL: unchanged broadR118source-hash lock already fails inR123.
- Standard current-state112files1289tests:1076PASS/213FAIL. Failure-name multiset exactlyR123, added0/removed0, no expected/oldhelper changes. Original213failures are not called green.
- Sourcefingerprint before/after0773; all raw and old-source counterexamples retained.
- Clean-source startup low/high completed with realSD/HD material keys and allpaint maturity, no errors. Build/package/HTTP exact identity is deliberately external after final commit to avoid self-referential source commits. Status: PENDING_EXTERNAL_CLEAN_FROZEN_TAIL, not a claim of current build completion.
