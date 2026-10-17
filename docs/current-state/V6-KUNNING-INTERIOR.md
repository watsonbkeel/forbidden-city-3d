# V6 Kunning: optional furniture and compatibility contract

Implementation receipt, 2026-10-15 UTC. Branch-only work from published V5 `ea35d55ebcdb98b271109b80f38b3acb8da052f7`; this is not a publication or whole-palace acceptance claim. See `V6-KUNNING-ARCHITECTURE.md` for permanent B topology. Browser lifecycle, fixed-camera comparison and unchanged aggregate/performance gates belong to the final integrated acceptance report.

## Ownership and bounded fit

B permanently owns the floor/support, walls, windows, all partitions, door leaves/jambs/threshold, porches/end passages and architectural collisions. S contains removable display fabric, carpet, screen, canopy bed, ritual kang/shrine/spirit curtain and retained stove/hood geometry only. S has no doors, backing panels, windows, structural partitions or WALK proxies. It neither hides nor removes B.

`assets-src/interiors/kunning.py` reads `data/architecture/kunning.json` directly. It uses explicit placement-region rectangles; it contains no independently authored bay-width division, structural depth plane or wall position. The registry derives frame, expected profile contract, placement regions and protected volumes from the shared JS adapter. No independently editable Kunning frame remains in the S manifest.

The bounded arrangement uses outer bays 1–2 for the warm room, 3–6 for the ritual unit and 7 for storage. It leaves both outer end passages free. The former center-route kang cut-outs are gone. Only the actual south entrance interrupts the south kang; the north enclosure remains closed. The bed, red drapes, 21 ceiling 囍 motifs, two-sided display screen, shrine, golden spirit cloth and stove hood remain recognizable. The retained interior display screen is not a reconstruction of the removed historical exterior screen.

The bed remains about 4.2 m wide inside its permissive placement region instead of stretching to fill the room. Screen faces are oriented north/south to fit its approved shallow region. No speculative storage furniture was added. B's warm/storage partitions remain closed for this bounded model; display cameras inside those areas are inspection views, not a claim of virtual navigation or present visitor admission.

All fit metres are provisional. In particular, the retained two tall stoves were moved to the north of the actual door's bay, but their depiction remains unresolved. S08 documents three low pots; this delivery does not claim the retained two-tall-stove form is historically accurate and does not expand into full refurnishing.

## Frozen production bytes

- Asset: `public/models/interiors/kunning-v6-ca7d98404e70.glb`
- SHA-256: `ca7d98404e708d8398e8be893568aea0b12bdc350f9500052afcaeacb3965e8c`
- Encoded GLB bytes: **289,184**
- Renderable-mesh indexed triangle count: **4,656**, including **288 collinear zero-area glyph triangles** (12 per fixed 囍 instance). Thus **4,368** have nonzero area; 4,656 is not a claim of 4,656 nondegenerate faces. Separately, **96** hidden proxy triangles. The indexed count remains the conservative renderer/budget metric.
- Decoded GLB geometry buffer bytes: **252,704**
- Images/textures and decoded texture bytes: **0 / 0**
- Local ceilings retained unchanged: **400,000 renderable triangles / 8 MiB textures**. The encoded GLB size is not compared with the texture budget.
- Generator SHA-256: `9a640d5c04436303f3c59cb9bb84e54fa2d070df9453f816e59d2cfccc0189fe`
- Profile: `kunning-entrance-enclosure`, revision `r3-v6-2`
- Profile SHA-256: `efe07947c03aa223af891a5179b6ea2b550600a09a1cb650edf7b17083c3f807`

Two independent Blender 4.3.2 exports of the final source/profile/font produced the exact asset hash above. Kunning explicitly triangulates fixed/ear-clipped faces and canonicalizes triangle ordering; this addresses BMesh's otherwise nondeterministic ordering of identical triangles. Vertices, winding, materials and visible geometry are preserved. The five other generators/exported assets do not opt into this behavior.

The shipped asset was imported into Blender and exported again. The roundtrip also has the exact asset hash above, 4,752 indexed triangles including the zero-area glyph entries, and all eight proxy names. Actual Three.js GLTFLoader import exposes the direct custom properties on the root `KUNNING_CONTRACT` node. The contract includes profile id/revision/hash and `ownership: furniture-only`. Extra provenance includes generator/font hashes, pre-merge furniture inventory and normalized glyph metrics. Glyph object names are **not** expected to survive material merging; acceptance uses actual pixels, geometry inventory and the surviving contract node rather than looking for `xi_ceiling` as a runtime object.

The old V5 `kunning.glb` remains byte-unchanged as a stale-asset regression fixture; the registry never requests it. The new filename is content-keyed. Missing metadata in that old GLB causes rejection, not fallback installation.

## Installation and lifecycle protection

Before adding any S scene state, lights or collisions, the loader checks the exact contract; unique allowlisted furniture proxies; region containment; absence of WALK proxies; actual rendered triangle containment/clearance; renderable-triangle budget; and separately measured texture budget. Missing, stale, wrong-profile, wrong-ownership, malformed or forbidden content fails safely while B stays present.

Registration has Kunning-only rollback: an exception after partial collision installation removes the tagged collisions, partial group, lights and fade state. Existing token checks discard late arrivals after unload/dispose. The five other interior configs and compatibility behavior remain unchanged. `_common.export_glb` gained only optional `export_extras=False`; Kunning explicitly opts in.

Eight collision proxies and nearest protected-volume clearances (local metres, from authored proxy bounds):

| Proxy | Placement region | Closest protected volume | Separation |
|---|---|---|---:|
| COL_bed | warmBed | north porch | 1.250 |
| COL_screen | warmScreen | south porch | 2.400 |
| COL_kang_s_e | ritualSouthEastKang | true doorway | 0.489 |
| COL_kang_s_w | ritualSouthWestKang | true doorway | 0.561 |
| COL_kang_n | ritualNorthKang | north porch | 1.100 |
| COL_kang_w | ritualWestKang | north porch | 2.950 |
| COL_shrine | shrine | north porch | 1.575 |
| COL_stove | northStove | north porch | 1.150 |

These are distances from already defined protected-volume boundaries, not player-radius allowances or new architectural dimensions. Every individual authored furniture mesh also passed pre-merge region/clearance checks. Actual imported rendered triangles are checked again by the loader, so a visual backing panel cannot bypass collision-only validation.

## Verification and evidence boundary

Red tests against V5 observed missing metadata accepted/installed and a non-versioned asset/source with its own architectural grid. The final focused asset/loader suite has **20 passing tests**. It covers actual GLTFLoader extras, missing and mismatched contract fields, furniture proxy inventory, forbidden structural proxies, actual forbidden visible geometry, fade/unload/reload, partial-registration rollback, cancelled load, disposal, exact bytes/metrics, font-normalized artwork, and frozen five-other-asset hashes.

The recorded `node --test tests/*.test.mjs tests/current-state/*.test.mjs` run passed **403 MJS tests**. A separate `node --test tests/*.test.cjs` run passed **10 CJS tests**, giving **413 passing Node tests** across the two runs; the MJS log does not include those CJS tests. Vite production build passed, with its pre-existing >500 kB chunk-size advisory. This does not substitute for the unchanged browser gate and original six performance cameras.

`tests/kunning-interior-browser.cjs` is an additional real-browser lifecycle harness. It first stops the app animation and disposes its streaming interior loader, then creates exactly one test loader. It uses the live collision engine for all three profile routes, forwards/reverse, walking/sprinting, 60/10 fps; verifies unchanged B collision/support data and actual closed-center enclosure triangles; captures supplemental paired B/S views; and checks B-only, fade, loaded, unloaded, reloaded, missing, stale V5, wrong profile, actual-parse cancellation, recovery reload and disposal. Execution and resulting browser acceptance are recorded by the dedicated integrated QA, not inferred from this script's existence. Original fixed-camera comparisons remain separate.

F1 final-byte Blender renders were visually inspected for ceiling, bed, screen and stoves. Bed/screen glyphs are upright and distinct 囍, with no tofu or font substitution; ceiling artwork reads upright facing north and fits its grid. A full underside view naturally includes canopy/screen occlusion. The stove view confirms the retained two-tall-stove form and hood, with the accuracy debt above. These isolated furniture renders prove artwork fit, not final B/S overlap acceptance.

Private build evidence is retained outside runtime packaging: export logs, exact byte/triangle/proxy receipt, repeated-export hash, Blender roundtrip bytes, pre-merge inventory, four inspected rendered views, targeted/all-Node logs and production build log. No research photograph/PDF or font binary was added to public assets.

## F2 contract-only refresh and diagnostic boundary

F2 binds the owner's permanent-B enclosure/lintel-height correction. Furniture regions, navigation, model envelope and all S generation code stayed unchanged. The pre-refresh compatibility test correctly rejected the F1 contract. F2 differs from archived F1 `c20088c41f9d5895409aad825d938959b4a6db431ebcd0c97c2e29568a09e521` only in GLB extras `profileRevision` and `profileHash`. Full parsed glTF JSON outside those two fields is equal; the complete BIN chunk is byte-identical, SHA-256 `6cbddfcde39d76976dbf6a9f74ab34364518b6886fcfbeb0499c5d24cf7b94a9`. All vertices, normals, triangle indices, proxies, materials, transforms and glyph artwork therefore remain unchanged. Duplicate F2 exports and the F2 Blender import/export roundtrip are byte-identical to the historical F2 hash `2dd721d28ba239e2d8a15e3435f6caade3f0d2fa2562709577e419e544cf5e4a`. The unused, unpublished F1 candidate GLB was removed from current runtime assets and retained in offline evidence. Existing F1 isolated furniture renders remain geometry evidence; they are not represented as a new F2 integrated-render pass.

F1 paired browser inspection identified a thin projected gold line on the warm-room partition in the north-stove view. Read-only geometric diagnosis found **zero of all 4,656 S renderable triangles intersecting that B partition**. A camera ray through the line also intersects `ceiling_grid_x.001`: at pixel (1400,152), the actual material-merged opaque B wall intersects the camera ray at 7.485075 m, whereas the gold strip is at 11.782454 m, about 4.30 m behind it. The strip is more than 3.36 m clear of the wall; drape trims also stop 0.353333 m short. This rules out physical trim protrusion and wall-surface z-fighting, but ray alignment alone does not prove that the hidden strip causes the visible line. The asset was not moved or cosmetically removed. QA found the line persists with post-processing and batching disabled, ruling those out. Subsequent gold-hidden and lights-disabled controls isolated the artifact to gold geometry. The F3 evidence below resolves this bounded rendering defect; the geometric ray result alone did not establish its cause.

## F3 bounded strip-topology repair

Browser isolation narrowed the gold artifact to the 12 triangles of source object `ceiling_grid_x.001`, merged into `merged_gold_lacquer`. The original 12 triangles produced 208 gold pixels in the diagnostic ROI; excluding them produced zero. A fresh 12-triangle `THREE.BoxGeometry` using exactly the same eight corners also produced zero. Glyph-only and glyph-excluded controls establish that the 288 zero-area glyph entries are unrelated. The issue persisted without post-processing, batching, lighting and with ordinary opaque Basic materials; no deeper GPU cause is asserted.

The generator now gives only that one strip the verified equivalent box topology. Four face diagonals change, replacing eight of the twelve triangle vertex sets. Its local bounds remain exactly `[-11.255833625793457, 7.040500164031982, -7]` to `[-11.210833549499512, 7.065499782562256, 7]`. No object is moved, hidden, removed or subdivided, and no runtime rendering workaround is added. There are still 12 strip triangles and 4,752 total indexed triangles. The F2 profile id/revision/hash remains unchanged.

Actual GLB regression tests and independent before/after review confirm all **4,740 non-target triangles** retain exact attribute/material/transform tuples. The target retains exact bounds, material and transforms, outward normals, six box-face areas, paired edge closure and signed volume `0.01574978637654567`. The test compares target positions and normals with the empirically winning translated `THREE.BoxGeometry`; it preserves the original UV values. The new BIN SHA-256 is `a9908f0d397fdcb43c62d65f49e4ee8f927bec4964434d4bc802ab3a42f1bfa5`, so F3 is explicitly **not** BIN-identical to F2. The prior whole-BIN equality assertion was replaced by these narrower geometric invariants. Archived F2 bytes and evidence are preserved.

The exact F3 GLB was then loaded through the normal InteriorLoader against frozen F2 B, using normal materials and the application's SSAO/Bloom/FXAA pipeline. QA inspected paired B/S captures at the original failing view and horizontal offsets of ±0.3 m: the line is absent in all three. A fourth, warm-room inspection view confirms the original strip remains visible. All eight B jamb/upper-enclosure closure rays passed, and no browser errors were recorded. This is a **three-view local defect verification plus one retained-strip view**, not the final complete browser/performance gate; that remains pending for the owner's frozen F3 integration.

Durable F3 receipts are in `palace-r3-v6-evidence/s-interior-f3/`: repeated exports and the Blender roundtrip match the production SHA exactly, with source/inventory, red and green tests, Node counts and build logs. Independent geometry review is `independent-review/f3-targeted-geometry-comparison.json`; exact-byte normal-pipeline images and metadata are `candidate-strip-f3/normal-pipeline/`. These evidence locations are outside runtime packaging.

## Sources and decorative-font credit

- S01, Palace Museum architectural entry: https://www.dpm.org.cn/explore/building/236487.html
- S02, Song Wen, 2017, ritual-space analysis, pp. 35–45: https://www.dpm.org.cn/Uploads/File/2018/05/31/u5b0fc690afcd6.pdf
- S03, Zhu Jiajin, 1960, historical display arrangement: https://www.dpm.org.cn/building/talk/223514.html
- S07, removed exterior screen/door distinction: https://www.dpm.org.cn/building/talk/225296.html
- S08, Wang Wentao, 2019, stove investigation, pp. 501–502: https://img.dpm.org.cn/Uploads/File/2020/11/13/u5fae21c07c127.pdf

Decorative 囍 mesh generated using Noto Sans CJK Regular 2.004. Font copyright © 2014–2021 Adobe; font licensed under SIL Open Font License 1.1. Font project: https://github.com/notofonts/noto-cjk. The font file is not included.

Actual locally used TTC SHA-256: `b76b0433203017ca80401b2ee0dd69350349871c4b19d504c34dbdd80541690a`. The generator requires those exact approved bytes and successful conversion; it cannot silently fall back to Bfont. Geometric bounds are normalized for each fixed decorative artwork size. The font is used only to create placed artwork, not a reusable glyph library. The OFL artwork guidance permits such output without imposing the font license on the GLB: https://openfontlicense.org/ofl-faq/ (sections 1.1–1.1.2). Upstream font license: https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/LICENSE. This credit describes the font's license and does not relicense the GLB or imply endorsement.
