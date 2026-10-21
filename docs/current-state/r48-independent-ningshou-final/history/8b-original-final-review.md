> HISTORICAL RESULT, STUB MATERIAL LIBRARY ONLY. The architecture/world checks below used the stub material library. A later audit found production TextureLibrary material-name incompatibilities in seven identities; the later a32cf01 repair is covered by docs/current-state/r48-remaining/independent-real-materials/REVIEW.md. The original results below are preserved, not retrospectively upgraded into a production-library or browser pass. See ../REVIEW.md for the portable package boundary.

# R48 NingShou final-six independent review

Review snapshot: 2026-10-21 14:52 UTC, bounded review closed on joint commit 8b974ee129298d80488a11e7fdbff21e231fbfc3. Product input was independently cloned and detached at e0d19a575e0840fd8a52a5b45a02561e48610c1d. No product file in that frozen clone was edited. Test scripts and evidence are under review-output only.

## Scope and result

The six new identities were identified from the actual commit diff and ledger, not inferred from a total count:

- place-ningshou-b607aa467b — 皇极殿 (Huangji)
- place-ningshou-e32471b7c3 — 养性殿 (Yangxing)
- place-ningshou-c715f850da — 乐寿堂 (Leshou)
- place-ningshou-722e40e471 — 符望阁 (Fuwang)
- place-ningshou-f4d12b27e6 — 倦勤斋 (Juanqin)
- place-ningshou-82e7771bd4 — 畅音阁 (Changyin)

The previously reviewed thirteen are not claimed as newly reviewed here. Their unchanged visible geometry and affected navigation are only regression-checked where a shared collider helper changes.

The frozen e0 input does NOT pass complete interior body clearance. Two new programmatic-geometry failures were independently reproduced from normal ground entrances. A separate third failure in the real Huangji GLB was independently reproduced on actual R47 and classified as inherited, not an R48 atomic-switch regression.

The two new failures have a narrowly verified fix candidate in a separate clone, with RemainingNingshouHalls.js SHA-256 7fcbbea748bff126a0d1a7cebbd4d19512b22a8a1c751d8b1aac8a8d5e4e2cdb. This does not waive the inherited Huangji layer issue, further product changes, or GPU/native-device acceptance.

## Reproduced failures

### New R48: Changyin rear stair underside/body penetration

Normal entrance, production FirstPersonControls, default collision radius, 1.7 m head height, real world collisions, feet 1.2. The route reaches local (0, 0), (0, 4.1), (-5.4, 4.1), and exits normally. The production collision system allows passage through actual fitted stair stringer triangles; some side guards also intersect the full eye-height body.

At 10 Hz, one actual frame is world x=-334.10822106797843, z=361.16356612599446. The body box is [-334.60822106797843,1.55,360.66356612599446]..[-333.60822106797843,2.9,361.66356612599446], with four actual stringer triangles intersecting it. The 10/60 Hz round trips produce 17/126 mesh-hit records respectively.

Evidence: independent-headroom.test.mjs, headroom.log, headroom-results.json. These files preserve the failing frozen input. Only steady platform-height frames are checked here, so approach-step support is not mistaken for an obstacle.

### New R48: Leshou tapered column outside its proxy

The rendered cylinder has a bottom radius of 1.03r but its original collider uses r. The normal entrance route (0,-4) -> (0,0) -> (6.975,0) -> (6.975,3.85), followed by exit, is permitted while the rendered column clips the body. Both 10/60 Hz complete the full round trip; 3/15 mesh-hit records occur. An example is world x=-286.42469595910205, z=438.9659044528275, feet=.9. This is a millimetre-scale consistency defect, not a 22 cm envelope discrepancy.

Evidence: same independent-headroom test and result files. The static 0.4 m grid independently finds three affected Leshou points.

### Inherited R47: real Huangji golden-column sculpture outside COL_0..3

The actual Draco-decoded unchanged GLB is installed through InteriorLoader. Normal central entrance -> local (0,-5) -> (2.95,3) -> (2.95,6.3) -> return is permitted, but intersects actual merged_gold_lacquer triangles. At 10/60 Hz, the round trip produces 3/17 mesh-hit records. Example world x=-290.24728610694143, z=293.8577039803716, feet=1.5, intersects 80 real gold triangles.

An independent clone at R47 d37cf4de2a87f6deffff4e57e20c22f7a2dd779c, using its original CourtKit and InteriorLoader plus the same real asset, reproduces the same coordinates and triangle counts. This was already normally reachable before R48. It is not caused by hiding the four kit fallbacks or the new facade.

Worker geometry diagnosis, consistent with the independent body tests, gives one column's actual body-height section as x=3.257..4.519 and z=5.964..6.993, while COL_1 is x=3.480..4.320 and z=5.980..6.820. A localized conservative column envelope is appropriate; a box around the whole merged gold mesh would be incorrect.

Evidence: independent-huangji-body-scan.mjs, huangji-body-scan.json, independent-huangji-headroom.test.mjs, huangji-headroom-results.json. Actual R47 counterpart: ../r48-review-ningshou-final-r47/review-output/independent-huangji-baseline.test.mjs and huangji-baseline.log.

## Narrow candidate verification for the first two defects

The separate candidate clone changes only RemainingNingshouHalls.js relative to e0. Cylindrical proxies use actual vertex bounds; sloping timbers use short transformed segments and the documented 5 cm downward head allowance rather than a solid whole-stair box.

- Independent 32 controller combinations pass: two buildings; original obstacle approach and legal detour; 10/60 Hz; walk/sprint; forward/backward; actual triangle checks at every platform-height frame.
- Changyin legal detour uses local (0,0) -> (-3.6,0) -> (-3.6,5.2) -> (-5.4,5.2), then exits. It avoids both stairs and the retained furniture. A guessed central rear path was not treated as a regression when it correctly met retained furniture.
- Changyin 0.4 m room grid: visible-body penetrations 24 -> 0; no new sampled empty-air collision points.
- Leshou grid: visible-body penetrations 3 -> 0. Conservative cylinder bounding-box corner contacts remain a distinct limitation; do not claim exact cylindrical collision.
- All 63 route definitions remain in the real-controller consumer, with all four FPS/sprint replays passing after the fix.

Candidate evidence is in ../r48-review-ningshou-final-candidate/review-output/, especially independent-candidate-headroom.test.mjs, candidate-headroom-results.json, candidate-body-scan.log, and candidate-auto63.log.

## Other verified coverage

### Actual floors, shafts, roof winding, and framing

Independent raw-mesh checks passed for six identities, with actual partial-floor and open-shaft rays rather than metadata-only assertions. The custom shells have 33 closed surfaces, 4,416 paired edges with opposite directed winding, and 438 sampled FrontSide normal rays. Separate ordinary RoofBuilder tile/soffit assemblies are not mislabeled as individually closed custom solids. The owner roof-bearing, closed-face, column-coverage, and physical stair-contact tests were also rerun in the independent frozen clone, but are identified as reruns rather than independent designs.

Leshou ground-to-roof top is 18.7 m; Changyin top is 20.71 m. This is only geometry matching the declared datum interpretation, not a survey certification. In particular Changyin's courtyard-zero datum remains an explicit model assumption.

Structural contact diagnostics retain actual triangle contacts for each upper floor. Yangxing's west upper slab has direct contact at only three rear subdivision posts; its other nearby partitions are separated by small gaps and no front/side bearer was found. This is a framing caveat under review, not a fabricated claim of historical structural adequacy.

Evidence: independent-geometry.test.mjs, geometry.json, independent-structural-probe.mjs, structural-contact.json.

### Actual Huangji load/unload atomicity

Nine independent real-asset scenarios pass: network error; invalid mesh inventory; a throw after two collider registrations; a throw after scene insertion; unload cancellation; suspension cancellation; stale old delivery after a newer load; four repeated load/suspend/resume cycles; four load/unload/reload cycles. All verify only the four isolated fallback meshes change visibility and other meshes' visibility, material identities, and geometry identities remain unchanged. Failure/cancellation returns collider and walkable arrays exactly to the baseline.

The asset's SHA-256 is 0a79ec49e8cd442d363fdc6bccf4074d9e214ef3b0f3b56eba618297c1e88cc6. Actual R47 -> e0 git comparison of all public/models/interiors and data/interiors is empty. No other interior binding or asset was silently swapped.

Evidence: independent-huangji-lifecycle.test.mjs, huangji-lifecycle.json, huangji-lifecycle.log.

### All 63 route consumers and actual R47 comparison

The route baseline was independently regenerated from the actual R47 checkout, not accepted solely from a checked-in fixture. Both versions have exactly the same 63 names; 52 entire route objects are identical and 11 differ. No failing route was deleted. The complete current consumer passes the 63 x four controller modes plus direct-collision precheck.

The two cross-zone Huangji exterior points preserve the original center-axis x=-293.2 and exterior-viewing purpose, but z changes from 269.0 to 268.2. That is a 0.8 m southward setback, not exact point preservation. Both are courtyard points. The NingShou segmented raised approach carries actual prior-segment feet; the both-side-portals blocked negative still fails planning.

Evidence: actual-r47-routes.json, actual-e0-routes.json, actual-route-comparison.json, auto63.log; rerun r48-auto-route-consumer-contract.test.mjs.

### Changyin inscription source and unknowns

The official Palace Museum page explicitly puts “畅音阁” under the upper eave: https://www.dpm.org.cn/explore/building/236437.html . The actual preserved model-name sign is at the upper level, faces north, lies below the real roof and touches the upper eave framing in the rerun. It is not called a verified historical calligraphy replica. The other two named inscriptions are not silently fabricated. Unmeasured heights, stair pitches, movable furniture inventories, and current visitor access remain fitted/unknown as stated in the ledger.

## Non-passes and limits

- The inherited COL_dais and old kit throne box are conservative three-metre keepout prisms above the low visible dais. Their retention is not evidence that the air above the dais is carved solid furniture. The old collider's footprint is retained and bounded by the existing GLB proxy, but exact sculpture collision is not claimed.
- The 0.4 m static grid is finite sampling, not exhaustive proof. Important failures were separately reproduced with actual continuous controller routes.
- Upper levels of these six have no newly registered visitor destinations. Architectural/view-only geometry does not establish real museum access or a surveyed staircase.
- The headless Chromium launch failed before page execution with sandbox socket() Operation not permitted and crashpad startup errors. No WebGL screenshot, native-device visual acceptance, or GPU performance result was obtained. CPU geometry/controller results are not presented as those tests.
- The original 224 focused tests reran green before the new independent tests exposed the body-clearance gaps. Those 224 greens are not substituted for independent acceptance.

## Follow-up closure, 2026-10-21 14:49 UTC

The original red evidence above remains unchanged. It describes frozen e0, not the repaired candidate. Subsequent verification used separate clones, never edits to the frozen product.

### Shared collision repair 57474d0228860ed12338fc5558b9b6fed76ca0e1

The independent clone is `../r48-review-ningshou-final-57474d`. Exact reviewed source SHA-256 values:

- RemainingNingshouHalls.js: `7fcbbea748bff126a0d1a7cebbd4d19512b22a8a1c751d8b1aac8a8d5e4e2cdb`.
- HuangjiColumnSafety.js: `b906bdf926385752eadf09d3ef0f2c386da19ee70b3b1e6e0a401a7fe2802869`.
- InteriorLoader.js: `2e5a890a99f0aee02405ef09607f9171de96ea07d3586dcb7d424bdbc66bc9d8`.

Actual unchanged Huangji GLB now gets 48 local 0.25m-high pillar envelopes, transformed once through the final loader frame and tagged with the existing interior ownership. The documented downward head allowance is 0.05 metres, not 0.05 centimetres. Original five COL meshes remain. No whole-gold-material or whole-room proxy was added.

- Independent full-room 0.4m static mesh/body scan: 7,686 samples; unblocked visible-body penetrations 12 -> 0.
- Independent 16 real-controller cases pass: original illegal approach must stop; without resetting feet or teleporting, turn back to local z=3, move to x=2.65, continue through z=6.3, and exit; plus a directly clear detour. Both 10/60Hz, walk/sprint, forward/backward. Every steady platform-height frame is checked against actual decoded visible triangles. This is not a forced demand that the former illegal path still succeed.
- Independent 9 real-asset atomicity/lifecycle cases pass again, including partial registrations, scene mutation failure, cancellation, stale delivery, and repeated unload/suspension. Baseline collider/walkable arrays restore exactly.
- Whole-room air-only collision samples change from 29 to 33. Four new points are local (2.95,5.5), (4.95,5.5), (4.95,10.3), (4.95,11.9). Their full body boxes are respectively about 10.12, 18.82, 14.33, 2.49cm from the nearest actual visible triangle. These are localized conservative pillar-envelope corners, not accurate carved-surface collision. Legal nearby circulation is preserved by the real controller tests. No claim of zero air collision is made.
- Independent rerun of all 63 current automatic routes in four FPS/sprint combinations passes. The direct collision precheck and all three R48 consumer contract checks also pass, including the deliberately blocked-portals negative. Existing generic legacy consumers retain their original high-spawn convention; the physical-profile consumer and separate normal-entrance tests are not conflated with that convention.
- `git diff e0d19a5..57474d -- data/interiors public/models/interiors` is empty. Other interior binding and asset files are unchanged.

Evidence in that clone's review-output: `independent-huangji-candidate.test.mjs`, `replay-obstacle-retreat.mjs`, `huangji-candidate-headroom-results.json`, `huangji-candidate-headroom.log`, `huangji-body-scan.json`, `huangji-new-air-distances.json`, `huangji-lifecycle.json`, `shared-auto63.log`, `shared-auto63-controller.log`.

### Yangxing fitted support module 996d89d6f4d947763b4befb8ee695ed18684ed5436167b2a7f2f960065148f79

This separate clone is `../r48-review-ningshou-final-996d89d`. It is a candidate module on the original frozen input, not an assertion that its final integration commit has already been reviewed.

The originally noted rear-only bearing appearance is addressed with seven plain fitted beams and two front-corner grounded square posts. Independent actual mesh-triangle/box contact probes verify the complete contact chain: floor/platform .9 -> both posts ending 4.07 -> beams spanning 4.07..4.32 -> slab underside4.32. The rear transverse beam touches all three existing rear posts. These nine new visible members are a fitted structural depiction, not certified engineering or a historical pillar-count claim.

- Independent 5,060-point room scan has zero unblocked visible-body penetrations and zero air-only collision points.
- Eleven focused rerun tests pass, including the eight 10/60Hz, walk/sprint, forward/backward normal-entrance, west-room and Moyun side-door routes. Existing far-west partition is preserved; the model did not invent a through route.
- Independent raw visible geometry hashing across all 19 NingShou buildings shows only Yangxing changes; other 18 geometry hashes are identical to frozen e0. Yangxing adds exactly two colliders, no walkables or new upper-floor visitor access.

Evidence: `yangxing-loft.log`, `body-scan.json`, `independent-yangxing-frame-probe.mjs`, `yangxing-frame-contact.json`, `render-comparison.json` in that clone's review-output.

### Explicit route endpoint decision

Owner confirmed the root-approved 269.0 -> 268.2 exterior-point setback is retained to clear the fitted new approach run. The correct claim is preserved center-axis exterior-viewing purpose, not unchanged exact coordinates. All63 names remain; 52 whole route objects are unchanged and all11 changed objects, including both cross-zone endpoints, remain explicit.

### Remaining acceptance limits

This bounded review now has independently verified fixes for its identified accessible body-clearance failures and the visible Yangxing contact caveat on the exact hashes above. It does not accept unspecified later changes. The original frozen failures remain executable with `node --test review-output/independent-headroom.test.mjs` (four failures) and `node --test review-output/independent-huangji-headroom.test.mjs` (two failures) from the e0 clone.

Conservative cylinder and carved-pillar corner envelopes, inherited COL_dais keepout, finite sampling, unverified museum access, fitted unknown dimensions, and the lack of successful WebGL/native-device/GPU-performance execution remain explicit. Changyin collider count increases 597 ->1285 due to short segments; no runtime frame-rate guarantee was established. No additional historical or visual-acceptance claims are inferred from test counts.


## Final same-tree closure: 8b974ee129298d80488a11e7fdbff21e231fbfc3

The parent requested only the pre-planned joint-diff check and closure, without expanding scope. The final independent clone is `../r48-review-ningshou-final-8b974ee`, detached on that exact commit with no tracked file edits.

Verified from the actual checked-out bytes: the NingShou module is exactly reviewed996d; InteriorLoader and HuangjiColumnSafety are exactly reviewed57474d. The only runtime-source change from57474d is the nine fitted Yangxing members. All19 raw mesh/collider/walkable signatures exactly match the separately reviewed996d candidate. Compared with original e0, only Yangxing's visible geometry changes; other18 are unchanged. All interior assets/bindings remain byte-identical even against actualR47.

Fresh final same-tree checks completed with zero failures:

- 36 joint functional cases: 16 actual Huangji normal-entrance stop/retreat/detour cases, nine independent actual-asset atomic lifecycle cases, and 11 Yangxing floor/frame/door-route checks.
- Eight route-consumer checks: all63 routes in four FPS/sprint modes, direct collider precheck, unchanged52/changed11 retention, real prior-segment foot-height propagation, and the blocked-both-side-portals negative.
- Six independent actual-geometry cases for the six identities, including custom-shell winding/closure and sampled genuine floor/void checks. This does not relabel ordinary layered RoofBuilder meshes as closed custom solids.
- Final raw-signature equality and the nine-member actual Yangxing contact chain independently rechecked.

Final artifacts: `final-joint-functional.log`, `final-joint-auto63.log`, `final-geometry.log`, `final-hash-comparison.json`, `render-hashes.json`, and `yangxing-frame-contact.json` in the final clone's review-output. The same report is copied there as `FINAL-REVIEW.md`.

Conclusion: the identified accessible collision defects and fitted Yangxing bearing caveat are closed within the bounded CPU geometry/controller/lifecycle scope on8b974ee. Original failure evidence is preserved. The root explicitly accepts the stated2.5–18.8cm localized conservative pillar-corner approximation; legal passage is tested, not assumed. This is not a full70-building, all-test-suite, browser-rendering, phone-performance, historic survey, or museum-access acceptance. Browser execution remains unperformed after the documented startup denial/failure; no substitute screenshot is claimed. No further product changes or release actions were performed by this reviewer.
