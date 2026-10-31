# Wumen main-tower bounded width registration implementation plan

> Native single-writer implementation; independent Astra review. Baseline/rollback: 411214d091723b3a5078bbb9499321c2c5c3d354. No main, deployment or whole-object acceptance.

## Goal / architecture
Replace the acknowledged nine-equal-bay main-tower placeholder with an explicitly simplified 1.43 centre-to-side ratio within the retained 60.05 m envelope. All 52 columns and both nine-bay facade divisions consume one ten-axis array. Keep depth, Y, radii, doors, roof, base, world origin and supports unchanged. No temporary exhibition fixtures are reproduced.

## Source specification
- Official 2005 p124: https://img.dpm.org.cn/Uploads/pdf/4884/T00124_00.pdf ; SHA256 4704dfcc47c2829c50ccdc9a3567bfb50bf3fc23daddf356303843b9faf3bf2e.
- Official 2021 pp152–153: https://www.dpm.org.cn/Uploads/File/2021/11/23/u619c5a27422d3.pdf ; SHA256 5049aa0a175c2fe8da56f536a5846d29772f2fd424e6213236e964e2968d8a85.
- Independently read 2005 centre/8-side means: 1.44127/1.44153; 2021 centre/7 within-page-side means: 1.43001/1.43071. The page-seam interval is excluded. At least ±1–2 source pixels, scan deformation uncalibrated; the publications may share an underlying drawing.
- Eight equal side bays are an engineering simplification: end bays look slightly narrower. 1.43 is NOT a surveyed ratio. Official 60.05/25 describe overall width/depth, not expressly column-centre endpoints; correct the existing OFFICIAL_COLUMN_AXIS_TOTAL claim.
- Private source files were lost on environment replacement and re-downloaded with exact SHA equality. Reconstructed audit records must not be described as recovered original files.

## Task 1: actual profile/shell TDD
Files: WumenMainGrid.js, GateTowerProfiles.js, GateTowerMeasurements.js; new wumen-main-width.test.mjs.
- [x] Red: assert central/side ratio 1.43, ten symmetric axes within ±30.025, six depth axes, 52 columns all on common axes, no misleading surveyed-axis metadata.
- [x] Preserve the real pre-change shell and gate baseline before writing production code, bound to three baseline source hashes.
- [x] Minimal change: common width array, outer columns consume it; retained central five-metre door and all other parameters unchanged.
- [x] Green: verify actual mesh bounds and registered colliders, per-bay midpoint rays, finite geometry, metadata limitations; negative controls for equal-width fallback, unsynchronised outer columns, shifted/hidden geometry, wrong physical bounds.

## Task 2: retention and actual movement
- [x] Expected target set is 48 moving columns and 40 facade wall/veneer parts, but determine actual 88/98 collider delta from runtime rather than trusting this arithmetic.
- [x] Exact non-target shell fields/geometry plus all non-main gate objects, right-leaf caps, original support and lower-portal contracts; preserve existing ebd golden fixtures and historical replay, never re-record them from this candidate.
- [x] Preserve original controller routes; add near-column 10/60Hz contact/blocked probes and original/new-axis negative controls. Actual collision queries always use raw production manager.
- [x] Explicitly migrate only formerly equal-grid/whole-main live contracts, with historical assertions retained and target-limited successor comparisons.

## Task 3: cumulative gates / delivery
- [x] Same-camera actual CPU before/after with retained roof and columns; CPU is not GPU.
- [x] Execute serial cumulative World, original current-state baseline/candidate Counters, batch and three-base builds; preserve original red results. Execution is terminal, not all-green: batch retains P1 missing-history coverage and original full gains three bounded old-contract reds.
- [ ] Independent review of source accuracy, 88-target limit, negative controls, actual movement and final source/QA freeze. Save limited development checkpoint and only then arrange separate portable backup.

## Review focus
No independent equal-spaced outer loop; no moving doors/gables/floor/roof; no aliasing or omitting collider registrations; no source precision inflation; no hiding real new failures behind broad whole-main exclusions. Full timber frame, through-columns, exact doors/windows, macro origin/wing proportions and GPU remain unresolved.
