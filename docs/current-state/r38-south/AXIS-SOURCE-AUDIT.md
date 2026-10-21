# R38 central-axis source-versus-code audit

2026-10-21 05:37 UTC. Read-only audit of `/workspace/scratch/02a8023d1a85/r38-integrated`. No production or test edits, no browser/GPU run, no publication. Findings sent early to root and implementation owner.

## Recommended bounded correction: Taihemen south approaches

**High-confidence topology discrepancy, not a measured-dimension correction.** The existing Taihemen south approach is a single continuous stair with a narrow central decorative yulu strip and a full-width walking ramp. The official frontal photographs show two distinct flights flanking a broad central imperial stone, with white stone balustrades separating the flights from the stone and bounding the outer edges.

### Exact visual sources, inspected pixels

- Official Taihemen building page: https://www.dpm.org.cn/explore/building/236439.html . Existing fetched HTML `/workspace/shared/r36-taihemen.html` directly references all four photographs below. A fresh web open timed out; cached official HTML and direct official image downloads succeeded.
- Near frontal: https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c931a533.jpg . Local `/workspace/shared/r38-axis-evidence/taihemen-official-a.jpg`, 1425 × 780.
- Wide frontal: https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c2a4da38.jpg . Local same basename in `r38-axis-evidence`, 1425 × 950. Confirms both central flanking flights and shows additional lateral access near platform ends. This correction is limited to central southern approaches; it does not claim those lateral approaches are now reconstructed.
- Oblique lion/stair detail: https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c9308131.jpg and https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c9310fb3.jpg . Local same basenames, each 1000 × 1777. White stone sloped rail, vertical posts, stair tread faces, and raised stone platform face are visible.

Dates in resource paths are not verified capture dates. These photos are research evidence, not distributable runtime textures. Existing catalog reports construction closure beginning 2026-08-03; historical photo topology and game traversability do not prove current public access or October 2026 appearance.

### Exact current code path and inherited envelope

- `src/scene/PalaceBuilder.js:70`: REAL Taihemen has nine bays, double-eaved xieshan roof, baseH 3.44, margin 1, apron 1.
- `:1028–1029`: `buildGate` routes Taihemen into generic `buildComplex`.
- `:438–470`: single-layer terrace, height 3.44; run = height × 1.6 = 5.504; stair width = min(12, 48.06 / 9 × 2.2) = **11.748**, not 12. My first brief message called this the generic 12 m stair; 12 is the cap, not the actual result.
- South platform edge is -214.2 - 20.54 / 2 - 1 = **-225.47**, toe **-230.974**. These are inherited model coordinates, not newly surveyed stair endpoints. Terrace half-width 25.03.
- `:391–413`: absent a special profile, south and north each receive one generic stair and a central railing opening.
- `:288–327`: `buildStair` constructs full-width treads; if width ≥ 9, overlays yulu at 22% width (here 2.58456). It registers a full ramp from -width/2 + 0.45 to width/2 - 0.45. This is why merely widening the decorative slab would leave false hidden walk support and not fix topology.
- `src/config/constants.js:50–55` and `src/scene/Layout.js` hold retained Taihemen body dimensions and anchor. Actual Layout center is x=0; the separate anchors.json x=1.6 record must not silently move the runtime gate during this correction.

### Expected local change

Use a **Taihemen-only south opt-in profile/builder**. Retain total southern approach envelope, platform rise, toe/head Z, hall body, roof, and the complete northern approach. Within the retained envelope: independent left/right closed stairs, a solid separate central imperial stone, and matching white stone rail/cheek boundaries. Register only flank walking ramps; central stone should not have generic hidden support. Any central no-walking policy is a model protective choice, not a claim about museum admission.

The photographs support a central stone substantially wider than the old 22% overlay. The apparent stone width is roughly 1.5–2 times one clear flight in the near frontal photo, but perspective, rail occlusion and uncertain body/terrace registration make this only a qualitative fitting guide. Do not label a fitted percentage, rail thickness, step count or endpoint as a source-measured dimension. Do not copy Taihedian's ±10.5 centers or 5 m flights. The retained 11.748 envelope itself is an engineering bound, not photographic validation.

### Verification impact

- `tests/stepwalk.cjs:93` currently drives Wumen → Taihemen in a straight x=0 line. Keep route identity and endpoints but derive a detour through an actual flank ramp and return to center behind its head. Preserve the old direct-center approach as negative evidence, not a passing shortcut.
- Other straight center legacy probes include `tests/_handoff-p0c/stepwalk-real.cjs:10`, `tests/walk.cjs` and `tests/regression.cjs`; distinguish historic fixtures from active acceptance and do not bulk regenerate goldens.
- Exercise both flank stair ascent/descent, ground-to-platform contacts, full gate crossing and return via retained north route, at 10/60 Hz walk/sprint. Require selected physical support and platform height, not arrival alone or box rescue. Check stone blocks direct center approach; remove a ramp in a negative mutation to expose hidden support.
- Check rail/cheek collision tracks visible geometry, no seam gap at stair head, no invisible high wall, and no overlap with doorway columns or tree bounds.
- Check unmodified north geometry, hall/roof, Wumen, Taihedian and shared RoofBuilder/default fingerprints. Keep scoped historical migration explicit if needed.
- Independent tree/navigation auditor is coordinating controller checks. Real same-view WebGL/native-input verification remains unavailable; CPU topology/controller results must not be called visual acceptance.

## Wumen: do not reopen previously bounded fixes without new evidence

Inspected official north-oblique photograph https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0ad0346e8b3.jpg (local `/workspace/shared/r38-axis-evidence/wumen-north-oblique.jpg`, 800 × 600), existing folded-ascent evidence, vertical-profile implementation, and current `buildWumen`/Enclosure code.

Existing `WumenAscentProfile.js`/`WumenAscent.js` already isolate three-leg ascents. `Enclosure.js:82–136`, `WumenWallCapFit.js` and `WumenLandingWallTop.js` already carry local wall-cap trimming and the hidden red wall top removal below the landing. The documented former y=10 coplanar seam at |x|=91.7–97.9 is already fixed; do not reissue it as a newly found R38 problem. Existing profile and historical sections explicitly distinguish fitted levels from measured dimensions.

The single oblique view does not establish a new small wall-join or roof-proportion correction beyond these existing fits. **No additional Wumen edit recommended in this audit.** This is not a claim that every feature is correct: other visible gate-body details and portals are outside this bounded wall-join/stair/roof task and would require separate local treatment and passage protections.

## Taihedian: preserve separated approaches and unresolved outline

Inspected official frontal source https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e9926e6ea567.jpg (local `/workspace/shared/r38-axis-evidence/taihedian-front.jpg`, 1425 × 606) against `src/scene/palace/TaiheFrontApproaches.js`, `PalaceBuilder.js:391–395,486,532`, and `docs/current-state/R7-TAIHE-SOUTH-APPROACHES.md`.

The existing southern terrace already has two independent flanking stairs plus a solid central stone and no imperial walk ramp; the hall plinth has its separate three flights. Do not duplicate the Taihemen finding here. The documented moon-platform projection/shoulder registration remains unresolved, and the inherited terrace dimensions are not validated by this frontal picture. Roof silhouette rescaling from an uncalibrated frontal image would be an unsupported numerical change. **No additional Taihedian stair/roof/outline edit recommended now.**

## Overall conclusion

One source-supported local central-axis correction is ready for implementation: Taihemen south split approaches. No evidentiary basis was established for new global roof proportions, Wumen wall reshaping, or Taihedian terrace relocation. Existing 1-unit=1-m convention must not be presented as full site 1:1 verification.
