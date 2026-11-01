# R157 bridge group E — concentrated handoff, not whole-batch acceptance

Base: `2cb15fdece44c98aa60fa35e17668c6b1f0b0951`. Worktree `r157-bridges-e-0132`, branch `feat/r157-bridges-e-20261101`. Root assigned these four original IDs only; visual resemblance and usable passage take priority, harmless <0.3m differences need not be chased. No main/Pages/remote write, adjacent gallery, river line, anchor, global solver or generic builder change.

## Four original rows (no duplicate objects / no invented completion)

| Original ID / object | This group's actual work | State and remaining work |
|---|---|---|
| FC-D156902D78 内金水桥 | Five existing anchors retained. Official Xu Yilin 1982 text and own official overview support the imperial middle bridge being widest/longest/highest. Existing shared 6.1×21/.9m middle copy changed to width8.1×length23/crest1.05m **engineering fit**, not measurement. Optional retained bank-sampling width6.1 keeps all prior bank vertices/water polygon exact. Actual rail openings/support/water permissions follow the wider profile. Four other bridge profiles remain exact. | Visible hierarchy and wide-lane passage implemented/tested; full object remains PARTIAL. Central dragon-head/relief, three other side-bridge head variants, post/panel sequence and unviewed underside are not accepted. Existing bridge-2 torch caps remain active, not newly implemented. No four-side physics expansion. |
| FC-B9097C61D8 武英门前三座石桥 | Retained all three existing source-bound bridge/rail/contact implementations. Reopened and personally viewed own official front image. Reran actual production World42 crown/drop/recovery/bank-exit/outward-refusal scenarios on E sources; no new geometry warranted. | Existing visible rail forms and tested passage retained; PARTIAL, not absent/zero implementation. Complete side/underside coverage, exact angles/counts/carving and GPU/user-device acceptance remain unverified. |
| FC-74F8C30390 半壁桥 | Existing wrong binding identified, not silently repaired: `xiehe-banbi=(-140,-266),axis:x,length16,width5`, while own historical source says NS bridge with east rail next to west gallery. Candidate gallery[27] east platform edge≈-105.97, culvert(-106.47,-278); ≈26m detachment cannot be a harmless tolerance. | **Needs source-bound interface relocation/rebuild, not implemented.** D confirms no new reliable position source and does not move gallery anchors/river. Normal public tile reads403 stopped; prior plan describes vp2839/3761 cubes but their source pixels are not present here. Do not rotate in place, copy west culvert to east, erase grass strip, raise gallery arbitrarily, or leave duplicate bridges. |
| FC-17AFD38428 三座门外三座石桥 | Official bridge article + official 《故宫南三所考》 segmented pages1–4 confirm three stone bridges before Three Gates northeast of Wenhua, then Nansansuo. Official current Nansansuo own images/map inspected; none uniquely binds all three current bridge instances. Current production has only single `donghua-inner`, which is NOT this group. | **BLOCKED_SOURCE for current identities/anchors; three target instances not implemented.** Do not clone Wuying3, equate the three Nansansuo halls with bridge axes, or rename Donghua's single bridge. Next: contemporary shared topological image/plan proving bridge–Three-Gates–banks, then one coordinated water/ground/support change. |

`BRIDGES-E-SOURCES.json` records exact URL/byte/hash of reopened public evidence. Source images/PDFs remain outside repository, are not game assets, and are not distributed by this commit. Historical source relations are not survey dimensions or automatic current-geometry acceptance. Outdoor bridges have no enclosed building interior/roof; exposed vault mouths/undersides remain required exterior work.

## Verification actually run

Evidence directory outside repository: `../r157-bridges-e-evidence/`. Raw logs/frames retained there; not uploaded as release reports. `BRIDGES-E-VERIFICATION.json` is a concise command/result receipt, not a substitute for those logs.

- New focused component tests: RED on unchanged2cb:1/8 pass,7 expected failures. First GREEN exposed a test-only raw-collider assertion error; retained log, replaced with actual `CollisionManager.checkCollision` against real rail/free deck. Final GREEN8/8; final combined rerun also confirms these8 pass.
- Actual full World, unchanged production `buildR52World`/controller/collision, no injected water/provider:28 roundtrips =10/60Hz × walk/sprint × three central lanes and four side bridge centres. All arrived;8575 recorded frames. Whole scene is built, but this is not NPC, browser or device acceptance.
- Existing actual full World Wuying suite:42 cases,6991 recorded frames,0 violations; intentionally refused outward/along-water cases are not mislabelled as arrived routes.
- Baseline legacy affected suite:27 total,26 pass,1 pre-existing exact-translation failure. Final affected + new suite:35 total,30 pass,5 failures. Four new legacy conflicts are fixed old equal-width/old narrow-rail assertions (`inner-jinshui` lines33/104/135 and `r36-south-water` line14), not failed crossing scenarios. Original tests are unchanged. One baseline failure at `inner-jinshui:110` is still red; explicit baseline/current diagnostic finds22 exact Box3 mismatches in both, max absolute delta **1.7763568394002505e-15m**. These are measured coordinate differences, not a claim that the original test passed.
- Same-camera CPU before/after actual merged component geometry:16,516→16,372 triangles. Four images generated and personally viewed (five-overview/principal). Main deck visibly wider/longer; no change to actual river polygon/four outer profiles. Bank-rail gap follows the wider centre (collider count352→348); it is not an invisible new floor. CPU base/vertex colors and simple shading only; no texture/official-camera match/GPU acceptance.
- Three supported bases `/`, `/forbidden-city-3d/`, `/gugong/`: actual Vite entry compiled in memory,578 modules each, exit0; HTML/JS/build-info identity checked. `write:false,publicDir:false`: **not a deployable bundle, no HTTP/Pages/assets completeness claim**. Retained release identifier `R146-fix`, not falsely renamed to R157.
- Full historical standard suite was not rerun for this isolated E branch; final cumulative integration must select/run affected and broad regressions. Latest source change after World runs only adds source/limitation strings/comments; numeric bridge sources are unchanged. Final component/build include those strings.

## Reproduction (serialized, arrange heavy slot)

```sh
node --max-old-space-size=768 --test --test-concurrency=1 tests/r157-bridges-e/principal-bridge.test.mjs
EVIDENCE_OUT=/tmp/e-world.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r157-bridges-e/principal-world.test.mjs
EVIDENCE_OUT=/tmp/e-wuying.json node --max-old-space-size=1024 --test --test-concurrency=1 scripts/photo-fidelity/batches/r158-wuying-bridges/world-crown-recovery.test.mjs
EVIDENCE_OUT=/tmp/e-build.json node --max-old-space-size=1024 scripts/r157-bridges-e/compile-memory.mjs
node scripts/r157-bridges-e/export-visual.mjs before /tmp/e-visual
node scripts/r157-bridges-e/export-visual.mjs after /tmp/e-visual
# render each VIEW-STAGE with existing scripts/r101-plaque/render-cpu.py
node scripts/r157-bridges-e/diagnose-translation.mjs before
node scripts/r157-bridges-e/diagnose-translation.mjs after
```

## Integration / review boundary

Production patch is only `river.js` central existing entry + `InnerJinshui.js` bounded optional crest/bank sampling consumption/source metadata. Shared D gallery patch must not absorb an invented half-bridge relocation. `BRIDGES-E-CANONICAL-FIELD-PATCH.json` proposes **per-ID, named-feature finding/nextAction updates**, never rewrites the compressed canonical queue. Keep `currentCycleAccepted=false`, facet statuses unchanged, and do not add an acceptance record or completed-object count. External independent/Astra whole-group review remains pending at freeze; this is an internal reviewable checkpoint, not acceptance.
