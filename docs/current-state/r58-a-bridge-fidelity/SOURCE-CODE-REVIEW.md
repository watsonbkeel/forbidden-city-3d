# R58-A bridge source/code review and bounded side-finial delta

Base: `755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da` (R57). This is a static evidence/handoff report, **not a progress queue**. The integration owner's canonical `docs/photo-fidelity/QUEUE.json` remains the sole progress authority. No source photograph/PDF is included in this checkout or public assets.

## Useful result

Only an evidenced, deliberately small silhouette correction is implemented: the four side bridges of the existing five inner Jinshui bridges gain collar/pointed-bulb finials on their **88 existing square shafts**. These are model fits, not surveyed ornament, not the documented twenty-four incised grooves. The central imperial bridge, riverbank heads, all post positions/counts, decks, water, colliders, walkables and characters are unchanged. No bridge is added.

The 2010 journal and actually viewed official Wumen photograph support a torch-like side-post head and distinguish it from the central bridge's dragon/phoenix heads. They do not support pretending this smooth fit reproduces the carving. Exact radial profile, .22 m height and .125 m maximum radius are bounded model-fit dimensions. The radius remains inside each retained .26 m square shaft.

## Four master rows and actual bindings

| Master row | Actual retained code object | Source-supported difference / disposition |
|---|---|---|
| FC-D156902D78, 内金水桥五座 | `InnerJinshui.js`, profile `inner-jinshui:first-entry`, bridges `inner-jinshui:bridge-1` through `-5` | Existing arched decks, open vaults and five routes are retained. Baseline square shafts end flat. Only IDs 1, 2, 4, 5 get bounded side-finial silhouettes; ID 3 remains untouched. |
| FC-B9097C61D8, 武英门前三座石桥 | `SouthWaterSystem.js`, IDs `wuying-1`, `wuying-2`, `wuying-3` | Three separate bridges already exist. Official study fig. 5/6 shows river balustrade/gate proximity, not sufficiently detailed source-calibrated geometry of all three. No additional bridge and no generic redesign. |
| FC-74F8C30390, 半壁桥 | `SouthWaterSystem.js`, ID `xiehe-banbi`, `railSides: [-1]` | One-sided railing is already represented. No unsupported change of railing, arch or coordinates. |
| FC-17AFD38428, 三座门外三座石桥 | No verified binding | Remains unresolved. `donghua-inner` is one existing different crossing, not a substitute; do not rename it, clone it twice, or claim it resolves this row. |

The five inner children `INSTANCE-A-INNER-JINSHUI-BRIDGE-1..5` bind one-to-one to the five IDs above. On initial inspection the three canonical Wuying children's `instanceKey` values were `wuying-bridge-1..3`, whereas actual profile/support IDs are `wuying-1..3`. The integration owner was notified and owns the canonical correction and actual-binding assertions. This worker did not edit QUEUE or maintain another state file.

### Important differences still unresolved

- The 2010 journal describes the central bridge as longest/widest with graded side bridges. Current baseline uses five 6.1 m × 21 m bridges. No dimensions are altered without per-bridge calibrated evidence.
- The 2020 article, printed p. 35, describes seven railing panels across each bridge, central banks with three panels plus descending rails, four side bridges' banks with two panels plus descending rails, and different inter-bridge panel intervals. The baseline uses eleven shafts per rail row and does not establish these historical panel identities. The retained 88 decorated shafts are **implementation bindings, not a claimed historical total**.
- Central dragon/phoenix carving, detailed incised side-head grooves, riverbank heads, panel reliefs, and Wuying/Banbi calibrated shape remain outside this patch.
- Official Donghuamen text describes a single bridge crossing the inside river and places Sanzuomen north of it. That supports rejecting the forced `donghua-inner` → three-bridge identity, not assigning new coordinates to the unresolved group.

## Source evidence actually inspected

Byte hashes and URLs are in `SOURCES.json`. Photographs and rendered PDF pages were viewed as pixels, not only text snippets. Original and rendered research bytes remain private local research; this report has no embedded source photographs.

1. Official inner Jinshui entry photograph, 400×315: useful five-bridge context, inadequate for fine carving.
2. Official Wumen overview, 800×600: side/river railing square shafts, collars and pointed rounded heads are visible. Source photo date is unknown; upload-path dates are not photography dates.
3. 故宫博物院院刊 2010 年第 4 期, printed p. 24, one-page PDF: differentiated central/side post-head types and twenty-four incised grooves in text; no precise groove geometry is reconstructed.
4. 王子林《紫禁城中轴东移探析》, 故宫学刊 2015, PDF physical page 6 / printed p. 372: Wuying gate/river balustrade fig. 5 and bridgehead/stairs fig. 6 actually inspected. This does not identify all three bridge shapes precisely.
5. 李燮平《明代的紫禁城 外朝规划体现的等级与礼仪制度》, 紫禁城 2020 年第 10 期, physical page 14 / printed p. 35: five-bridge overview and panel/order discussion. Layout differences recorded above are deliberately not silently repaired.

## Implementation and ownership

`src/scene/palace/special/InnerJinshuiSideFinials.js` reads the existing profile and creates one owned instanced mesh. It is a separate PalaceBuilder object at `profile.origin`, not a child of the already translated river group. Each matrix consumes an existing bridge's X/Z, rail offset and sampled deck height. A geometry-dispose listener forwards the owner's normal teardown to `InstancedMesh.dispose()` exactly once; library-owned marble is retained.

`HOOKUP.patch` contains only the import and one `addObject` call for the integration owner. No shared production file is modified here. Patch application was checked against the frozen baseline; the owner must reconcile any nearby shared changes.

Collision/character impact: **zero new registered colliders or walkables, zero movement/controller changes**. Normal walking uses the exact old bridge supports and rails. Caps extend .22 m above old shaft/collider tops and are decorative, not newly solid collision geometry; this patch does not certify flying-camera contact with finials. They do not narrow the original route.

## Budget and same-camera local diagnostic

Final geometry: 8 radial segments × 8 profile intervals × 2 triangles = **128 submitted triangles per head**, 88 instances = **11,264 triangles per applicable render pass**, not 128 total. Geometry attribute/index buffers total **3,360 bytes**; instance matrix buffer **5,632 bytes**; one mesh/draw per material/pass. Shadows or extra render passes can multiply submission. A shared bounding volume can submit far-bridge instances together. None of this proves low GPU cost or real-device frame rate.

The initial 32-segment experiment was 512/head, 45,056 submitted triangles, 12,576 geometry bytes plus the same matrix buffer. Preserved `after-cpu-pre-reduction.png`, compressed actual-vertex diagnostic and budget file document that experiment. The final revision cuts submitted triangles by 75%, preserves every radial side and silhouette layer, and does not change cap/world placements.

`reports/r58-a-bridge-fidelity/before-cpu.png` and `after-cpu.png` use the same perspective camera and actual bounded meshes. Both were viewed. Small collars and pointed rounded heads remain readable after reduction; no source photo is composited. The 32→8 comparison changes 1,784/518,400 CPU-image pixels (0.344%), **not a WebGL perceptual-quality or performance score**. Both images explicitly label fit/unverified parts and lack of game/WebGL acceptance. Proxy colors, software lighting and z-buffer are only local diagnostic aids.

## Verification and handoff

- Original bridge/water regression: **41/41** before changes.
- Added focused tests: **10/10**, including exact retained-post ray contact; four pure-W, no-sprint crossings at 10/60 Hz in both directions across all five bridges; translation/profile isolation; 128/head budget; malformed-profile rejection; real PalaceBuilder resource teardown.
- Existing-world read-only consumer: `assertInnerJinshuiFinialsInWorld(W)` from `tests/lib/r58-bridge-finial-world-check.mjs`. Pass an already built, matrix-updated `W.scene` + `W.cm`. It never constructs/repairs the world, moves actors, updates matrices or adds support. Checks all 88 unique live instance bindings, independent post-top height, actual shaft/cap ray intersections, visibility and 15 actual deck/support samples. Missing, duplicate, hidden, displaced, record-synchronized floating/duplicate geometry and hidden original river are rejected.
- Combined focused suite: **51/51**, no skipped tests. See `test-final.txt` for fresh terminal output.
- Independent read-only review reproduced and verified fixes for instance GPU-buffer lifecycle and weak self-referential W assertions; final review found no unresolved P1/P2 issue within this bounded delta. No full-world rebuild, browser, WebGL, deploy or full project suite was performed by this worker.

Reproduce from repo root:

```sh
node --test tests/current-state/inner-jinshui-side-finials.test.mjs tests/inner-jinshui.test.mjs tests/r36-south-water.test.mjs tests/r36-south-independent-water-integration.test.mjs
node scripts/r58-bridge/export-finial-diagnostic.mjs
python scripts/r58-bridge/raster-finial-diagnostic.py reports/r58-a-bridge-fidelity/before.json.gz reports/r58-a-bridge-fidelity/before-cpu.png
python scripts/r58-bridge/raster-finial-diagnostic.py reports/r58-a-bridge-fidelity/after.json.gz reports/r58-a-bridge-fidelity/after-cpu.png
```

The integration owner still owns PalaceBuilder hookup, W integration, canonical updates, full-world regression and all browser/WebGL/current-state visual acceptance. This static report grants no row or child PASS.
