# H32 West Sidehall C12 Integration Plan

Implementation checklist. Unchecked final delivery steps remain pending until evidence exists.

**Goal:** Add the bounded H32 exterior without regressing the cumulative c12 candidate.
**Architecture:** Reuse one independently identified sidehall component and one normal ZoneBase hook. Tests and evidence remain isolated from production. Old geometry and data stay unchanged.
**Tech Stack:** Existing JavaScript modules, Three r162, node:test, Vite.
**Spec:** docs/superpowers/specs/2026-11-03-west-sidehall-c12-design.md

## Global Constraints
No main/Pages/deployment changes. No complete World or browser attempts. Do not merge the old branch. All facade dimensions/details remain fitted where not sourced. Preserve c12 and all old evidence. Only component and ZoneBase may change production bytes.

## Review Focus
- Duplicate/wrong host or failures must not partially publish geometry or leak private resources.
- Existing east-side identity and all original object/collider/room/map/region records must remain intact.
- Normal south/north bypasses and Xiangyun's four approaches must remain traversable.
- New roof/wall visible geometry must retain physical ownership and enter normal production merge/LOD paths.
- Final build must identify its actual source and correct Pages base; no false full-World/GPU success.

### Task 1: Isolated bounded integration
**Files:** Add src/scene/palace/special/ZhongzhengWestHall.js; modify src/scene/zones/ZoneBase.js; add tests/r163-west-sidehall-c12/ and test documentation.
**Interfaces:** buildZhongzhengWestHall(kit,zone) returns false for a foreign zone or {frame,meta}; adds only its staged children, colliders, real walkables and owned materials.
- [x] Pin c12 tree, existing branch, available space and rollback; record current same-tree local base.
- [x] Add component/hook red tests and capture the immutable current production-zone baseline before the new module; preserve expected missing-feature red results.
- [x] Copy only the c46 component and add one import/call before kit.finish(); do not alter its geometry or global runtime behavior.
- [x] Run component/host/lifecycle checks, local 76-route/20-negative probe and bounded actual production-zone retention/roof checks; test old-owner and old-mesh mutation sensitivity.
- [x] Run affected regression groups and inspect CPU evidence with explicit source identity; retain any failure and its diagnosis.
- [x] Obtain independent review; address verified blockers with red/green tests.
- [ ] Commit, run clean base=/forbidden-city-3d/ build and HTTP/source verification, then verify complete remote refs before creating one new successor branch.
- [ ] Read back every changed blob/tree/commit/ref and compare with c12/main; report exact checks and remaining limits. Do not merge or deploy.
