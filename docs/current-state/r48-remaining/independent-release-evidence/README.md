# R48 independent release-evidence review

Status: final V2 terminal evidence reviewed at freeze `5383d404bc702a148500e5c99df9da0f9eac61d2`. No newly unclassified production blocker was found within the inspected CPU, source, lifecycle and route evidence. This is not an all-green certificate, complete-restoration claim, GPU/mobile acceptance, or publication receipt.

## Frozen subjects and method

- Original R47 aggregate: `3ff61557efb6006b510e7d4c0077debac2b3182a`; R47 documentation/supplement commit: `d37cf4de2a87f6deffff4e57e20c22f7a2dd779c`. Their difference is three evidence files, not product source.
- Complete R48 V1: `6e3faadab2b8c57ec8f6d73f949b2a1e794303ea`, isolated clone `r48-final-consolidated-validation`, logs `/tmp/r48-final-consolidated-v1`.
- V2: `5383d404bc702a148500e5c99df9da0f9eac61d2`, isolated clone `r48-final-consolidated-validation-v2`, logs `/tmp/r48-final-consolidated-v2`. Relative to V1, only `r48-integrated-profiles.test.mjs` and `r48-yongshou-column-clearance.test.mjs` change. No production source or original fixture changes.
- This reviewer did not run another aggregate, change the owner's repository, weaken original assertions, update historical snapshots, push, or deploy. Read original TAP, actual source/test code, immutable captured baselines and intermediate evidence; ran two tightly bounded supplements outside the repository.
- Every V1 and final V2 top-level failure has an individual record in the corresponding `failure-classification-v1.json.gz` or `failure-classification-v2.json.gz`. The underlying file guards are preserved separately in `file-guard-contexts.json.gz` and `file-guard-contexts-v2.json.gz`. For repeated failure names, compare actual assertion diagnostics, not names alone. For file-level failures, also inspect the preceding uncaught assertion: the generic `test failed` YAML is insufficient.

## Terminal final V2 result

| Check | Result |
|---|---|
| Direct-current, 325 files | 5,271 tests, 5,144 pass, 127 fail |
| Historical/mixed, 132 files | 1,185 tests, 927 pass, 258 fail |
| Build, zone schema, zone geometry | Exit 0 each |
| Anchor check | Exit 1; complete output byte-identical to actual R47 |
| Tracked source before/after | Byte-identical; stable exit 0 |
| Process completion | Terminal receipt at 2026-10-21T17:42:57Z |

Preserved V1 terminated at 2026-10-21T17:14:54Z with direct 5,271/5,142/129 and the same historical 1,185/927/258; its other exit results match V2.

Build retains a large-chunk warning. Schema retains 9 warnings; geometry retains 20 warnings with zero errors. The anchor result retains Shenwu's 11 m deviation against 5 m tolerance, not a newly resolved placement.

No V1 or V2 aggregate test was cancelled, skipped or marked TODO. Historical has 55 file-level failures, each signal null, not a SIGKILL. They are assertion aborts and do not execute their unregistered later tests. The separately preserved earlier interrupted aggregate and isolated 26/26 retry remain different events; the signal cause is not established.

## Failure classification, not waivers

V1 direct-current versus R47's 45 failures:

- 28 have the same core actual diagnostic.
- 17 retain the same failed name but have changed actual hashes, the first failing identity, or an earlier guard. Do not call these unchanged inherited failures.
- 82 are new old-contract failures caused by declared geometry, identity/status, material-ownership, route or safety changes. Their current replacements/negative scopes are cited individually; an old masked suffix is never silently marked passed.
- One real test-fixture defect refound the plaque-only Hengshou source item by name and obtained undefined. V2 preserves the resolver's exact item/profile pair.
- One test contract's inverse knew about opened-leaf proxies but omitted the separately declared later north-outward Yongshou/Xianfu rear-leaf poses. V2 verifies exact proxy and pose identities before reversing only those poses against the unchanged old full hashes.

Final V2 direct is exactly the first three classes above: 28 same-diagnostic inherited, 17 changed-diagnostic old-name, and 82 new declared-change contracts. The two repaired test bodies actually execute and pass; they are not counted merely because a name vanished.

V1 and V2 historical/mixed versus R47's 230 failures:

- 227 old names remain: 167 are the same actual failure, including one identical missing-GLB error with only a randomized temporary directory; 60 have changed actual diagnostics.
- The 60 include 14 changed uncaught guards hidden behind otherwise identical file-level `test failed` YAML. The remaining 40 old file guards have matching underlying message/code/actual/expected/operator.
- 31 newly failing names consist of 24 R32 source/asset-chain guards stopped at the YanxiStorehouses material-identity change; one new R15 pre-registration abort; one old complete-three-terrace snapshot; three PlaceCatalog old-text inverses; one InteriorLoader old-source guard; and one old fixture that expected an arbitrary single box mislabeled Huangji to install successfully.
- Eight former R15 tests did not register. Three were formerly failing and five passing, replaced by one file failure, explaining 1,192 → 1,185 tests. The three disappeared failure names are not fixes. Existing exact-old-loader-input-only supplement registers all eight: five pass and the three original main/Environment/Minimap hashes fail. It is not current-loader acceptance.

Particularly important: the nine old R36 Wuying movement cases passed at actual R47 and now fail. They are not inherited failures. Their early Z=-205.5 sideways turn crossed the real opened leaf before it had a thin proxy. Current shared movement turns after the leaf at -205.15; the old route remains red. The two additional south-courts child-metadata failures are a separate old-structure premise.

## Independently recovered blocked tails

### R42 whole-zone merge ownership

The old test expects every source geometry to dispose at material merge. Four isolated Huangji fallback meshes now intentionally survive in the actual returned group, each with independently owned material, for atomic GLB loading/unloading.

`supplements/r42-bounded-merge-tail.mjs` preserves the original stats and subsequent assertions, but strictly accounts for only those four actual mesh objects. On V2 it passes one test containing two full cycles. Each cycle has 17,150 source geometries: 17,146 dispose exactly once at merge; the four exact returned fallback geometries stay live until teardown. Original Guhua flight coverage, architecture record, all watched final disposal counts and registration clearing then run successfully. No broad `noMerge` exemption is used. Original R42 source bytes are hash-bound and unchanged.

This preserves R42's lightweight-library boundary. Separate aggregate tests explicitly use production TextureLibrary plus the real unchanged Huangji GLB; the supplement is not misrepresented as that production-material test.

### Twenty-four R32 asset/source assertions

`supplements/run-yanxi-masked-tail.mjs` runs exactly the 24 original newly blocked names across five original test files. A separate-process read hook substitutes only the exact YanxiStorehouses source path with actual R47 bytes, SHA-256 `959d62c7ec3ee6f165f7b83798098684783aa99e9c198539690a431daab208dc`. It binds current input `037ac719a101bc92f8b8b2945a8c589735fb7288868ef49676cdd05f0c0e73e6`, all five original test hashes, and delegates every other file read to the unchanged reader.

All 24 assertions and original mutation guards pass, no skips. Current production source and test files remain on disk untouched. Full tracked-file SHA manifest after the supplements matches V2's freeze manifest exactly. This establishes only the declared old-input historical suffix. The original 24 current-source aggregate failures remain failures; current Yanxi material behavior is verified by separate real-library checks.

## Current scope and compatibility boundaries

- Actual `current-70-status.json` recount: exactly 70 distinct identities; exterior 57 actual changes and 13 reviewed-retained; interior 50 actual changes, 8 reviewed-retained and 12 evidence-blocked. Exactly 63 unique identities have at least one physical change. Every row remains accepted=false. Status registration completion is not complete architecture reconstruction or final visual acceptance.
- All 89 ledger identities, 122 zone-hall keys, prior 19 partial identities, and four unnamed ancillary halls have distinct coverage. The old 19 are not counted as new R48 identities.
- Old-19 compatibility is not blanket byte identity on a previously broken real-material path: all prior stub outputs and prior records retain exact baselines; six named real-library adapters remove old shell pieces that failed to be removed because cached production material names had `_material` suffixes. Remaining old real outputs and both garden-pair outputs retain exact captured baselines. This is a bounded actual compatibility correction, not fresh historical reconstruction of those 19.
- All 159 place identities and seven acknowledged identity/history gaps remain covered by original runtime tests. The Hanqing/Yanshou fix binds only their exact actual fitted front-house footprints and rejects millimetre drift, duplicate names and old-center impersonation. The catalog data/anchors are not silently reauthored.
- Final automatic-route contract: all 63 R47 names retained, 48 complete objects exact, 15 explicitly changed. `50/13` is an earlier checkpoint, not the final state. Final fixed-route contract: all 33 names retained, 31 objects exact; two Wuying points and two Wenhua points change. The final-six layer alone preserves 61/63 automatic and 32/33 fixed objects relative to its immediate predecessor, a different comparison.
- Production-material evidence uses the actual TextureLibrary factory/cache/name/ownership/tile-size APIs and actual finish() returned groups, not a stub falsely labeled production. Offline inert texture pixels remain a deliberate limit. Actual merged output, triangle retention, old-stub immutable signatures, library ownership, whole-zone fallbacks and real GLB cancellation/unload cases have separate aggregate coverage. The earlier test that discarded finish()'s returned group is explicitly superseded as insufficient merged evidence.
- Earlier real defects were found and fixed, not retrospectively called stale assertions: residential continuous-route post-radius narrowing; actual front-house catalog binding; Yanchun side divisions; Yude ceiling corners; Wenyuan conflicting old ceiling and unsafe threshold; retained real-material shell cleanup; NingShou real-library replacement failures; named-plaque registration omissions; unsafe opened-leaf circulation and visible-pillar contact. Their old failed and rejected candidate evidence remains distinct from corrected results.

## What this does not establish

- No real-game WebGL/GPU, native-phone appearance, frame-rate or texture-artwork acceptance. CPU finite geometry, body-clearance and lifecycle checks do not substitute for these.
- No universal traversal of every point, full historical furnishing inventory, exact as-built measurement, or museum visitor permission. Upper floors do not imply unverified stairs, new upper teleports or access.
- This review inventories the per-side source receipts but does not claim to have independently re-researched every external source for all 70 identities.
- No full historical hash/inverse/mutation suite pass. Unrecovered old tails remain unexecuted and raw red outputs remain retained.
- No public deployment receipt. The audit made no GitHub writes and has not rechecked the live main/Pages refs. Final same-freeze CPU evidence is now present, but this review does not lift the existing publication hold or make the owner's bounded release decision; publication must verify exact remote tree/commit and preserve rollback, without changing or merging main.

## Final closure checks

`v1-v2-delta-review.json` records the direct comparison of completed runs:

- All 127 remaining direct failure core diagnostics match V1 after checkout-path normalization. The Hengshou case changes from failure to actual pass.
- The radius-inverse test is renamed to explicitly declare the north-open rear-pose inverse. The corresponding new body executes and passes. The removed old name alone is not treated as acceptance.
- All 258 historical cases retain the same status, name and core diagnostic; all 55 file-level preceding uncaught assertions retain message/code/actual/expected/operator, not just generic YAML. No new missing registrations or signals occur relative to V1.
- Only the two specified test files differ between V1 and V2. Production bytes, original historical fixtures and emitted production JS are unchanged. V2 before/after full tracked-source manifests are identical.
- Build, schema and geometry finish with exit 0. Anchor output is byte-identical to R47 and remains exit 1. Full terminal receipts, original TAP and hash manifests are retained in the adjacent `../final-validation/` archive.

The bounded final evidence review is complete. Original failures and unrecovered masked tails remain visible. Further visual/device validation and any authorized release decision remain separate gates.

## Using this evidence package

Read `index.json` for exact original and archived SHA-256 values. Diagnostic JSON and raw supplemental TAP use deterministic gzip with byte-exact decompression verification. Scripts and the required old-source input fixture remain uncompressed. Run supplements from the target repository root: `node --test /path/to/supplements/r42-bounded-merge-tail.mjs` and `node /path/to/supplements/run-yanxi-masked-tail.mjs`. The latter also accepts the repository root as its first argument. These are explicit optional diagnostic supplements, not part of default test discovery and not replacements for the red original tests.

