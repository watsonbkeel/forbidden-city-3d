# R163 final independent whole-branch review

Reviewed base `6da6e238` through runtime `71a3afd355279a069c3e7ec5f2069c1533fa0866`, design, complete diff package, Task1 review, normal QA source and retained evidence. Read-only product review; only this requested review artifact written. No frozen evidence overwritten, no remote operations, no subagents, no rerun of the already preserved same-code 40 tests.

## Decisions
- **Spec compliance: PASS for the authorized original397/H43 local partial, with inherited Minor M1 naming exception.** Real central stele and both physical side bypasses are present; no whole-object acceptance.
- **Code / QA quality: PASS for this bounded normal integration.** No Critical or Important blocker found. The silhouette compatibility change is evidence-backed preservation, not a blanket exclusion or laundering of the frozen failing test.

## Findings
### Critical: none
### Important: none
### Minor M1 — unused staged default materials remain unprefixed
`src/scene/palace/special/YinghuaStelePavilion.js:34,70` allocates/transfers a CourtKit's four unused private defaults (`kit.js:50-59`), as independently established in Task1. Visible materials are correctly private and prefixed (`:37,44`); the stricter literal all-new-allocations prefix claim is not met. Retain the exception and do not claim it resolved. No shared-resource or visible merge pollution was found.
### Minor M2 — dense QA/source formatting
Builder `:16,67`, cumulative `flow.mjs:5`, `neighbor-four-pins.test.mjs:7-9` and normal World `:54-64` are difficult to maintain/debug as large single lines. Nonblocking; no functional churn required for this delivery.

## Spec and integration evidence
- Actual `git diff 6da6e238 HEAD -- src data` contains only the new builder and ZoneBase's unique import/call; release changes only R162 to R163. No old landscape/data/physics/SilhouetteBuilder source change. `git diff --check` clean. The sole normal call is `ZoneBase.js:350` immediately before finish, not test injection.
- Builder `:8-16,31-34` preserves exact gate/hall tuples and rejects ordinary duplicate/frozen/transformed/tampered hosts before staging; `:41-54` builds one central stone/seat, open square fit frame, low platform, open N/S rails and convergent roof. `:56-64` owns actual mesh triangles and exact visible platform box/top with rescue:false, rather than a no-collision stele or air barrier. Metadata `:67` uses formal name, explicit fit/unknown and no whole-object/admission claim.
- Normal `world.test.mjs:25-41,53-64` uses the sole production hook: 38 real owners, one support, four merged visible meshes / 970 triangles; no old visible resident/instanced triangle hit in the final envelope above .04m; no new rooms/maps. Native stele/base owner deletion is an explicit sensitivity control, not a production alteration.
- Independently parsed raw `world.json.gz`: local 16/16 arrivals; full gate/hall 24/24 across 10/30/60 Hz walk/run and both sides/directions; four negatives all blocked. Removing exactly two stele/base owners arrives. Local maximum feet-ground = 0.11727777643667332m. Legacy full-route peaks = 0.46599999999999997..0.8494444444444446m, intentionally NOT a full-route <=.3m result. Tests check all local frames and the new subsection of global routes, with native starting ground; they do not claim every old-step global frame meets the local bound.

## Silhouette change — independently checked, acceptable
- Parsed `geometry-before.json` and `geometry-after.json`: both 789 old mesh entries, exactly one unequal entry at index354 named `outer-west-silhouette`; all other 788 entries fully equal.
- Independently decoded both raw silhouette archives: all 42,390 old position scalars and 69,840 old indices are exactly equal as prefixes. Expanded new index tail has 2,358 scalars (786 indices / 262 triangles) and independently computed Float32 SHA256 `22ab918146b0f6d9e716f20292ee7c18a57ee4d7dc6697841fce585b17ac1a8b`, matching the pinned new roof stream.
- `world.test.mjs:45-51` additionally derives expected expanded vertices directly from the actual sole-hook visible roof/finial meshes, and deep-compares the whole suffix. `silhouette.mjs:8-12` constrains exact lengths, both old prefix hashes and exact suffix hash. Thus `flow.mjs:5` truncating only this proxy for the old hash is paired with affirmative complete-extension verification, not skipping the proxy. Other attributes/material/matrix remain hashed. The proxy is invisible in this resident normal run; full streaming is not claimed tested.
- Independently compared raw normal stream to frozen prehook baseline: exact equality, including 16,602 old colliders / 1,293 old tops, maps, rooms, regions, records, geometry and instances. Unchanged SilhouetteBuilder's normal roof recognition accounts for the new derived tail without changing old roofs or their physics.
- Original strict R162 test failure remains in `target-neighbors.tap` (fail1, named four-pin normal World signature test); initial aggregate failure also retained. Separate explicit compatibility test verifies the suffix before old-flow equality and preserves complete 12 old route reports, including four inherited invalid-start diagnostics. It is correctly not presented as the original frozen test passing.

## Build, visual and coverage boundaries
- Read final bounded log: tests40/pass40/fail0/skip0; distinct from retained frozen failure. Composition is target8 + normalWorld1 + retained components29 + explicit compatibleWorld1 + QinanWorld1.
- Build receipt pins clean runtime71a3, R163-6f19642a5059, source fingerprint1599b86d99762798af2f9da3e7ba7b3f7810345915c4652dbd9195655bf5aa40. Read HTTP/hash receipt and independently counted137 entries, all200. This review did not rerun HTTP/build or certify remote deployment.
- Personally viewed both normal CPU front/oblique images: central single dark stele/base, open red frame, low interrupted rails and coarse yellow convergent roof are visible. These support the stated coarse geometry fit only, not phototexture, GPU, mobile, exact historical column count or detailed fidelity. Task1's documented official-photo/plan inspection retained; no new historical claim added here.
- Packaging under `R163-YINGHUA-STELE-CUMULATIVE-2133` was still untracked/in progress during review. Controller must finish portable evidence/manifest and verify resulting documentation-only commit; runtime review remains pinned to71a3. This is an administrative completion condition, not a runtime code blocker. No authorization to modify main, prior remote branches or Pages is inferred.
