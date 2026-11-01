# 午门城台与掖门 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the proven missing two lateral portals as part of the whole Wumen closure, keeping the concave base, folded ascents, five entrances, solid masonry and real navigation mutually consistent.

**Architecture:** One own-object lower-base builder replaces only the old base block in `PalaceBuilder.buildWumen`; three original central portals and their append-only attachments stay explicit. The two lateral portals get independent identities and source-grounded bent routes, never two invented north/south straight tunnels. The main tower and wings/pavilions are separate isolated-branch contributions, integrated only after their source/tests review.

**Tech Stack:** Existing Three.js meshes, PalaceBuilder colliders/walkables, piecewise overheads, Node tests and real FirstPerson controller; no dependency changes.

**Spec:** Original `MASTER-PROMPT.md` FC-AD4377DF51; `STATUS.json` unchanged whole-object scope; independent `audit-wumen-completion-20261031/HANDOFF.md` and source packets. The preceding saved development checkpoint is `36908b2c` (middle-right gate), not a new formal release.

## Global Constraints
- No main/deploy; original six dirty reports and unrelated work remain untouched.
- Only this writer integrates. Other branches own main tower and wings/pavilions, not lower-base construction.
- North official image visibly has five portals; south front has three visible central portals. Lower side mouths face each other and turn north in the official historical text. Exact tunnel dimensions/current fittings are not surveyed.
- Upper 2021 exhibition plan must not be used as a lower-tunnel plan. Unknown interior finish/hidden joints remain unknown.
- Source dimensions may be explicitly conditional engineering fits, but topology cannot be invented to make tests pass.
- Keep the existing global anchor, main platform outer envelope and ascent interfaces until contrary own-source evidence is independently reviewed.
- CPU output is not browser/GPU acceptance; partial source/physics tests are not whole-object acceptance.

## Review Focus
- North-only five-mouth count must not create five visible south-front holes: actual mesh rays plus side-entry topology tests.
- A visible hole cannot remain blocked by old whole-box base collision: body routes and solid negatives share actual split masonry.
- Corner turns and arched heads must stop high-speed/10Hz body penetration without broad empty-space blockage.
- Base cuts must preserve the upper platform and folded-ascent support, wall terminations, central three routes and non-target geometry.
- Lifecycle/merged geometry must preserve real openings and shared borrowed materials; no test-only runtime branches.

### Task 1: Reproduce and fix source contract
**Files:** `tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs`; new own lower-base source/profile module after source choice.
**Interfaces:** Actual `captureGate()` mesh group is local before finish; builder colliders are world-space. The source contract exposes five north mouths, three south-front mouths and two mutually facing side mouths with independent IDs.
- [x] Reproduce current three-only collision sections at local z=-12.8/0/18.1, y=1.5 on saved36908 parent.
- [x] Add actual north-lip mesh ray test; verified intended red3!=5. Initial mistaken fixture world translation logged separately and corrected, not counted as valid red.
- [ ] Finish bounded own lower-source review; document topology, source mouth ratios and conditional placement. Preserve contrary/ambiguous evidence rather than borrowing upper plans.
- [ ] Add south-front three-mouth, two side-mouth orientation/identity and original-central-route retention tests before production edits.

### Task 2: Build coherent lower base
**Files:** Create `src/scene/palace/special/WumenLowerBase.js` and own profile; modify only PalaceBuilder lower-base block before `buildWumenAscent`; extend lower-base tests.
**Interfaces:** `buildWumenLowerBase(builder, group, data)` validates exact own dimensions/identity before allocation, builds real split masonry and colliders, returns the retained central opening records for existing attachments. Lateral identities and route points are exposed as explicit source-fit metadata, not hidden generic exceptions.
- [ ] Implement reviewed side-route topology by subtracting bounded route volumes from the actual existing base; do not add black decals or collision-only holes.
- [ ] Register matching arched head/lining body collision and real floor support only where visible masonry/ground exists.
- [ ] Check open/closed policy separately from architectural holes; preserve unknown modern access status honestly.
- [ ] Verify all source-contract tests, portal solid/air probes, top-support and unchanged ascent/non-target fingerprints.

### Task 3: Whole-object integration and terminal evidence
**Files:** Own lower-base route/drop scripts; `WUMEN-WHOLE-REGRESSION.json` and STATUS after results; coordinate tower/wings commits by exact diff, never whole-file overwrite.
- [ ] Actual10/60Hz walk/sprint through five source routes, corner brushing, jump/head contact and outside-base negatives; existing three-mouth and both ascent routes retained.
- [ ] Source-conditioned before/after CPU views and cost/lifecycle evidence; real browser required separately.
- [ ] Integrate reviewed isolated main-tower and wing/pavilion branches against36908, resolving shared PalaceBuilder blocks without discarding any branch work.
- [ ] Run focused, complete current-state and three-base build; compare all historical failures explicitly, freeze hashes and obtain independent Astra whole review.
- [ ] Save an exact rollback-safe checkpoint and list actual remaining defects, source unknowns and runtime pending separately. Do not increment whole accepted from subcomponent tests.

## Source-driven design correction before implementation

Independent lower-source reports now confirm mutually facing side mouths and northward turns (official published historical text), and locate north outer mouths at conditional |X|≈48 with retained wall width120. South/north photo fits do **not** support the old9m centre mouth or side axes±17.5: centre width≈5–6; side axes≈±15 south/±13 north. The≈15% scale mismatch is retained, not hidden by invented diagonal tunnels. Thus “retain original three portals” above means retain their identities and straight topology, **not freeze source-disproved dimensions/routes**. Old tests/routes at±17.5 require explicit historical scope, not silent acceptance under new geometry.

### Proposed first conditional family (requires independent review and actual projection)
- Unchanged platform x±60,z[-13.3,18.6],height12; wing inner edges±40.6 and south-62.4; world0,-419.6; existing top/ascent interfaces.
- Central straight channels x=-14.5,0,14.5; width4.7,5.4,4.7; provisional crown5.8,6.3,5.8. These reconcile gross own-source ranges, not measured dimensions. Check both source views rather than claiming exact agreement.
- Outer northern mouths x±48,width3.8,crown5.4. Side mouths at inner wing x±40.6, centre z=-16.5,width alongZ3.8; this places the near end1.3m from the main south wall corner. z is an explicit engineering retreat hypothesis, not derived from the historical painting.
- Two minimal L-shaped connected voids: sideways inner edge→x±48 atz-16.5, then north to18.6. Rectangular engineering elbow/flat interior soffit is only a conservative traversable volume; unknown actual bend curvature, vault transitions and interior finishes are not reconstructed or accepted.
- The five north heads use real closed arched masonry/lining and matching exact triangle bodies; the two side mouths remain rectangular flat-headed as the official painting indicates, never a rotated north arch. No broad AABB fills a curved opening. Ordinary walls use actual full rendered height, not inherited3m-high body-only stubs.
- Keep existing three south protective canopies but adapt width/axis/head to the corrected mouths through an own source-bound contract. Do not invoke unchanged old hardcoded9/5 portal functions against new dimensions.
- Lower module builds all lower masonry/door solids and returns source-bound data; PalaceBuilder replaces only its base block and old north-overhead/canopy calls. Existing upper/wing/ascent bodies remain outside this module.

Alternatives rejected: five straight north/south tunnels contradict official side-mouth topology; preserve9m/±17.5 only to keep tests green contradicts both source readings; move whole wings/upper tower to force one photograph would expand scope without sufficient evidence. Exact hidden-tunnel replication is blocked by source, but the explicit conditional topology candidate can be tested without inventing historic detail.


## Integrated candidate checkpoint, 2026-10-31 01:08 UTC

Implementation and focused validation now exist; this is not whole-object acceptance.
- Five north/three south/two side real openings, source-bound identities, actual curved head bodies and conditional internal L routes implemented. Exact old central dimensions were deliberately corrected as above.
- Actual10/60Hz walk/sprint28cases; airborne head/drop34cases; full-world actor417supports/410segments/8solid negatives passed on integrated candidate before the material-only neck split. Collision hashes freeze the later state for final comparison.
- Main and wings integrated by exact reviewed commits, including strict explicit transverse-link endpoint binding, no overwritten branch hook.
- Historical component assertions are preserved verbatim under fullsrc/data frozen dependency closures. Live independent main/12 wing targets, NE enclosure and mutation negatives constrain the integrated runtime separately. Node child tests remove NODE_TEST_CONTEXT and reject empty TAP.
- Retained band atlas and north near-neck vertical brick lining repaired from actual CPU/source review; neck repair splits existing faces, not coplanar decals, and does not alter apertures/colliders. Hidden deeper finish is not inferred.
- Terminal full regression/build and global preservation are still running/pending; final JSON will separate these scopes.

**New own-source whole-object blocker:** official2021 upper plan on one continuous sheet and both external photographs contradict inherited pavilion depth and north/south spacing. This is now an actual visible/layout defect, not just an unperformed test. The existing retained lower envelope is therefore provisional pending joint main/wing/pavilion/platform/ascent registration. This upper plan may constrain upper layout but must never determine hidden lower tunnel geometry. No isolated pavilion move/roof raise is authorized by this finding.

## Interface correction after actual full regression, 01:24 UTC

The first frozen integration was **1313 tests /1088 passed /225 failed**, not green. Against36908 there were7 added failures;18 legacy leaf cases were no longer generated by their six-old-mesh selector, and are not passing cases. The original full-suite assertions/logs remain unchanged. Three source-corrected old lower-portal/leaf contracts and two old child-index ascent contracts are separate from actual runtime defects.

Two real integration defects were reproduced and corrected in the own lower module: the main-top triangle entered the existing transverse-link furniture solver (unsupported shape, real veranda throw), and its quantized top competed with the exact12.3 old floor. Three exactly axis-aligned slabs now have authored box-body registration plus their three actual, bounded, non-rescue top faces. **13 original supports remain,3 are added,16 total**; the same-height main top overlap is explicit max-height behavior, not a claim of unchanged support count. The geometry is unchanged, no empty volume is boxed, and no shared controller/FurnitureMotion code changed. Below-floor and actual southern-edge±.01 negatives pass.

The brick jamb split had14 UV phase resets; the independent private correction and actual production use one common object-height offset. Old failing and successful evidence remain separated. The own successor checks exercise all10 real leaves for open/closed and translated/world-anchor cases,40 owner/transform matches and80 outside-thickness negatives, replacing neither the old historical evidence nor the five actual controller routes.

Final focused scope: **195/195** (all batch tests, shared triangle probes,28 lower/ascent route cases,34 vertical cases, actual actor supports/segments/negatives), plus the unchanged original world-veranda suite3/3. Second full current-state run and three-base build use the separately frozen0123 hashes and have not yet been declared terminal here. The current physical metrics are452 colliders,20 curved/leaf triangle owners and16 supports; actual merged CPU geometry28 meshes/40044 triangles is not a GPU draw-call/performance result.

## Final verified development candidate, 01:36 UTC

Second full suite is terminal1313/1090passed/223failed, no cancelled; three-base builds549modules each pass. Exactly5 added legacy contracts remain against36908 (old ascent child27 twice, six-leaf selector, two old±17.5 axes); originalgolden and old assertions are untouched. Final batch195/195 now includes the live stable-owner ascent successor and independent main group-state fixture/negatives; controller suites are separate, not double-counted. Independent near-jamb56cases/24348frames are also preserved as a repository script with only import/output paths adapted, then rerun successfully. The final limited independent review permits a rollback-safe **development candidate only**, not a completed Wumen or deployment. Whole-count remains0; actual joint layout P1 and source/GPU gates remain explicit.
