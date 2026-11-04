# 阅是楼侧墙最小色材拟合

Goal: improve the clearly visible pale masonry at the two ends of the south-facing YueShi building, using its own official photo. The only selected object is R164/I original item8 FC-78E6A34C2D. This is a partial surface fit, not whole-building acceptance.

Baseline: remote9a3e055fe2e98c21ef1dc4255e9ea35e797dedbd, preserving the new Zhenfei well and all earlier fixes. Work only on a new isolated successor; do not alter main or deploy.

Source: https://img.dpm.org.cn/Uploads/Picture/dc/1565.jpg (actually viewed, SHA2568f0b11863adfd6fa516df50fc905d9b77dd348a39cb9b4cfa5f39e557293d566), official page236461 identifies a south-facing two-storey five-bay hall. The photo supports pale end-wall appearance, not exact colorimetry or unseen surface condition.

Approaches: large geometry/courtyard additions have unnecessary circulation and identity risk. A fresh exterior overlay could introduce duplicate surfaces. Selected approach: clone the existing brick material once and recolor only four exact original gable-enclosure meshes. All vertices, wall extents, collisions, thresholds, windows/doors, roofs, stairs and maps remain unchanged. Uniform continuation onto the unpictured faces is explicitly a material fit, not source verification. No true-color survey, newly opened interior or full-building claim.

- [x] Freeze actual NingShou unmerged geometry/material and merged physics/labels/roof before the source hook, including Zhenfei.
- [x] Red tests for four exact target walls, source identity, private material/no shared recolor, atomic rejection, immutable geometry/physics, source hook and disposal.
- [x] Implement fitYueshiPaleSidewalls(c) in one component and one exact buildYueshi call; no generic material or geometry edits.
- [x] Check actual component and production NingShou snapshot, original door/stair routes and wall negatives, cumulative Zhenfei48/20routes, fault controls.
- [x] Bounded cumulative regressions, clean Pages-base build/HTTP identities and independent read-only review.
- [ ] Only then upload a new development branch and fully re-read changed files. Preserve9a3/main and all old branches.

Review focus: only the intended original walls change; another hall sharing brick never changes; stale/damaged/repeated hosts reject before mutation; disposal cannot invalidate shared material; normal walking and the cumulative new well remain unaffected. GPU/browser/mobile and complete World remain outside this bounded verification.
