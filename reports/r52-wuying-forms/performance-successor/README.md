# R52 A sampling-only performance successor

Predecessor: `f8dd0ea3d9aea97537c86ed64e74644ca4e2cc22`. The predecessor and every existing report/image/hash remain unchanged. This is a separate local commit for the single R52 integrator, not a fragment release.

## Why and what changed

The combined A+B hall exceeded the unchanged R36 150,000-triangle budget. This successor changes only redundant sampling in A's four newly refined objects. Every numeric fitted profile knot, relative radius/height, relief placement, handle control point, lid/finial profile and foot/body junction remains identical. All 43 actual mesh parts remain. No front, back, double-sided, inner-mouth, bottom, lid or cap surface was deleted. There is no camera-dependent omission and no changed geometry/material outside these four forms.

Sampling changes:

- Main body/lid circumferential segments: 40 → 20.
- Tiny crown relief: sphere grids 10×8 → 8×6; shoulder relief 10×6 → 8×4.
- d112 lobe grid: 9×6 → 6×4; collar tube/ring segments 6×40 → 4×20.
- 59 curved handle sampling: 24 → 12; three foot circumferences 24 → 12.
- 61 finial circumference: 32 → 16.

Largest primary-body chord error from 20 circumferential segments is below 3 mm for these fitted object sizes. This is a small geometric approximation, not a claim that tessellation or shading is bit-identical.

## Measured cost

| Object | Prior triangles | Successor triangles | Saved | Mesh parts |
|---|---:|---:|---:|---:|
| d111 | 3,880 | 2,032 | 1,848 | 15 unchanged |
| d112 | 5,968 | 2,728 | 3,240 | 19 unchanged |
| 59 | 4,664 | 2,344 | 2,320 | 6 unchanged |
| 61 | 3,136 | 1,568 | 1,568 | 3 unchanged |
| Total A objects | 17,648 | 8,672 | 8,976 | 43 unchanged |

Original pre-A four-object count is 2,688. Therefore the successor A net increment versus frozen R51 is **5,984**, down from 14,960.

The actual scoped R36 Wuying front/rear/connector fixture measures **138,450** triangles, versus predecessor A-only 147,426. The original R36 test passes with its unchanged strict `<150000` threshold. This worktree does not contain B; the integrator must measure the combined result. Using its reported pre-optimization B increment of 11,068 gives an arithmetic combined forecast of 149,518 before B savings, not a measured combined pass.

## Tests and actual visual evidence

- Budget-first regression: predecessor fails the new <=9,000 A allocation at 17,648 (`budget-red.tap`). No old threshold was raised.
- Final successor tests: 9/9 (`budget-green.tap`). Includes exact reviewed fit/part equality, all old preservation checks, three feet's real support-plane and belly-overlap rays, and d112 physical inner-mouth wall/floor rays.
- Existing R37 preserved d102/60 tests: 5/5 (`r37-preserved.tap`).
- Existing R36 Wuying hall budget test: 1/1 (`r36-hall-budget.tap`).
- All twelve unaffected complete case fingerprints and all original collision arrays remain equal.
- `high-detail-geometry-views.png` / `optimized-geometry-views.png`: actual production geometry, front / oblique / rear for all four objects.
- `mouth-and-foot-comparison.png`: paired close views of d111 and d112 inner mouths, 59's wide mouth/floor and 59 foot/body joins. Both versions keep the real surfaces and contact geometry.
- `silhouette-overlay.png` / `silhouette-comparison.json`: masks projected from actual triangles, not differences between shaded colors. Across all twelve 510-px/m views, silhouette IoU is **0.995809–0.998606**, with a maximum contour distance of **1.414214 pixels**.

All four image sheets were visually inspected after generation. Slight circumferential faceting is visible in the enlarged inspection views; distinct forms, mouth contours, openings, handles, relief placement and feet remain consistent with the reviewed predecessor. These are **CPU** projections under review lighting, not WebGL/browser/GPU evidence. No full-world/build job was run; the single integrator owns the combined checks.

## Reproduce

    node --test tests/r52-wuying-next-forms.test.mjs
    node --test --test-name-pattern='wuying: dated exhibit identity' tests/r36-south-courts.test.mjs
    node --test --test-name-pattern='d102|scene60|the two selected cases|each neutral label' tests/r37-wuying-representative-details.test.mjs
    node reports/r52-wuying-forms/performance-successor/hall-budget.mjs
    node reports/r52-wuying-forms/performance-successor/capture-geometry.mjs optimized
    python reports/r52-wuying-forms/performance-successor/render-geometry.py
    python reports/r52-wuying-forms/performance-successor/render-details.py
    python reports/r52-wuying-forms/performance-successor/compare-silhouettes.py

Do not regenerate `high-detail-*` with the successor: those files are frozen predecessor evidence. Rollback only this successor commit to restore the reviewed high-detail A, or also revert predecessor A to restore R51.
