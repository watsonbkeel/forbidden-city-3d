# R66-H independent bounded final code review

Review time: 2026-10-23 17:25 UTC. Baseline: `aa5793395a16fbd870ce758174a5f9438f3bc423`.

## Verdict

No confirmed new production-code defect found within the requested bounded scope. This is a local source/geometry/physics/ownership review, not whole-world, WebGL, source-photograph, historical-fidelity, or release acceptance. Actual-world integration remains the implementation owner's open gate.

## Findings

### Resolved P3: Final release description claimed the withdrawn rail fit

- `data/characters/world-source-freeze.json:4` describes “facade, rail and gate fits”. The actual final `YanchunSouthPhotoFit.js` installs only the front plaque and explicitly records that the turned-rail candidate was withdrawn.
- `docs/photo-fidelity/H-REVIEW/LEDGER.md:10-16` ends at the historical batch-01 record of 25 spindles and 27 proxies, without a later withdrawal record. The historical record need not be deleted, but it needs an explicit superseding final entry.
- Verified resolved at 17:24 UTC: the current freeze purpose now states joinery/plaque/lattice/gate fits and restored original rail; a superseding 17:24 ledger entry records the withdrawal, exact R65 restoration, retained baseline jump/roof-skirt residual and current verification status. The original batch evidence is appropriately preserved.

## Open integration evidence, not a diagnosed production regression

At review time, `reports/r66-h-stage/world-B-03.tap` records a failure on the first Yinghua world-route segment: start `(277.2,450)`, target `(277.2,452)`, maximum speed `0`, no movement. The locally isolated gate route succeeds. This proves the current integration gate is not yet green; it does not identify the cause or prove that new gate geometry is defective. Parent diagnosed the original spawn as inside the unchanged adjacent court wall at x256.02..297.78, z449.5..450.5. That is a test-route defect, not a new production regression. I did not run or alter any full-world task.

### P2 verification blocker: replacement west-to-center route crosses the actual open gate leaf

`tests/lib/r66-h/world-check.mjs:43` was subsequently changed to approach `(254.7,452) → (277.2,452)`. Independent isolated-gate inspection proves this horizontal segment intersects the new west open leaf, not just an oversized unrelated proxy:

- Actual leaf bounds: x275.664999999..275.765000001, z451.94..453.44, y0.100000001..4.400000095.
- Actual triangle ray from `(254.7,1.7,452)` along +X hits `(275.664999999,1.7,452)` after 20.964999999 m.
- Existing CollisionManager returns collision for radius-0.5 centers x275.5,275.715,276 at z452/headY1.7; x275 and276.3 are clear.

This is a QA waypoint error, not a requested production-code change. Parent was notified immediately before another full-world run. Route the real body around the solid leaf. Based on the diagnosed neighboring wall and observed leaf bounds, z451.2 is a candidate horizontal approach to test: center must be >451.0 to clear the wall and <451.44 to clear the leaf tip. Actual two-zone replay is still required; no pass is inferred from this interval calculation.

## Scope and evidence checked

- All tracked production changes against R65 plus the three untracked modules `HUnknownInventory.js`, `YinghuaSouthLattice.js`, and `YinghuaGate.js` were read.
- The only shared CourtKit change is one import and one exact Yinghua-profile dispatch. No changes were found in shared Collision, FirstPerson controls, CharacterSystem/character implementation, HallKit, Environment/day-night implementation, main entry point, dependencies, or workflows. The actor/path data are unchanged; the character-data diff is the versioned world-source manifest only.
- All 262 entries of the current world-source freeze match file bytes. The archived R65 world-source manifest is byte-identical to the baseline commit.
- Chonghua: six closed extruded knee meshes, exact retained host guard, real beam/post intersection, no added collision or support, one locally owned shared material.
- Yanchun: registered plaque face and backing move together. Original entire balcony/rails, floors, and all non-withheld old render/physics data match the frozen R65 fixture.
- Inventory: exactly four Chonghua throne pieces plus eight Yanchun generic furniture pieces and their one/eight owned colliders are withheld. Geometry/material/collider guards run before scene or collider mutation. Removed private geometries are disposed; shared materials are not disposed. UNKNOWN and not-known-empty metadata reaches the retained room records without asserting empty historical rooms.
- Yinghua hall: sixteen south-window lattice replacements only. Existing solid leaf/collision ownership is retained; new lattice uses its existing owned wood material. All non-grid Yinghua bytes/physics and all Xianruo bytes/physics retain the captured baseline.
- Yinghua gate: existing exact named anchor and 6.4-by-2.8 map envelope, one true extruded arch, matching piecewise-linear overhead collision, unchanged-sized yellow roof and threshold, a real 0.1-m non-rescue threshold support, and two open arched leaves. No second gate identity or three-portal shanmen is invented.

## Independently executed bounded checks

34 tests passed, zero failures:

1. `node --test --test-reporter=tap tests/r66-h-final-retention.test.mjs tests/r66-h-yinghua-windows.test.mjs tests/r66-h-unknown-inventory.test.mjs` — 13/13.
2. `node --test --test-reporter=tap tests/r66-h-chonghua-knees.test.mjs tests/r66-h-yanchun-front.test.mjs tests/r66-h-yinghua-gate.test.mjs` — 21/21.

These checks include negative/atomic inventory guards, complete frozen R65 retention for the two modified halls, actual knee/host triangle contact, isolated actual arch triangles versus overhead physics, walk/sprint/forward/backward return paths, 5/10/60-Hz full-body jump/diagonal/entry-edge/drop probes, and collision unload cleanup. I did not modify production or test files, run build/render/full-world tasks, access or redistribute source photographs, upload files, or change Git branches, main, or Pages.

## Integrator resolution after this independent review
The legal west approach is now z451.2, between the unchanged court wall and the actual open leaf. No collider, door or wall was removed to make a route pass. The actual two-zone24route/18jump check passes, followed by all four full-world stages; see WORLD-SUMMARY.json and affected-zone-routes.json. The reviewer's earlier integration observations remain above as dated evidence. No new production code was changed after this review.
