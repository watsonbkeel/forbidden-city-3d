# R3 automatic Yude Hall route diagnostic

## Cause and bounded fix

- Published V1 (`e9d91cd`) reproduces the inherited 60 fps walking failure in the actual `FirstPersonControls` and collision world: `[223.4626, -244.1365, 0.45]`, targeting `[246, -243.8]`.
- The runner accepts a waypoint within 0.8 m, so the old gate exit turns before the nominal point. The exact nominal line clears the rear columns; the early turn hits one. The negative regression retains both facts and the original blocked controller replay.
- `gateGeom` incorrectly treated every `style: 'hall'` gate as 4 m deep and ignored explicit `gateKind` when style was absent. It now mirrors the production wall/three-bay/five-bay selection without width-based topology inference. Wuying's five-bay platform half-depth is 5.8 m, giving an inner point at z = -242.
- The corrected inner point exposes a second problem: one L corner falls inside Huanzhang Hall; the other crosses Wuying Hall. The new fallback proposes at most four side-line candidates per nearby hall, from its platform/step bounds plus the existing 3 m clearance. It validates every leg with actual collision and selects a short valid candidate. No grid search, named-building exception, geometry, physical movement, tolerance, budget, or known-issue exclusion was added.
- The selected x = 242 corridor comes from Huanzhang Hall's west platform edge (245) minus that clearance. Failed candidate notes no longer leak into the accepted route explanation.

## Exact browser-verification route

```json
{"name":"[outer-west] 武英门→浴德堂→返回","pts":[[220.8,-261.6],[220.8,-242],[242,-242],[242,-183.8],[246,-183.8],[246,-180.3],[246,-183.8],[242,-183.8],[242,-242],[220.8,-242],[220.8,-261.6]]}
```

Reproduce with `node tests/stepwalk-auto.cjs 60,10 0,1 浴德堂` after the browser worker is available. `DUMP=1` prints the generated route without opening a browser.

## Verification of the isolated fix

- Red/green tests: explicit gate depth, physical platform extents at all four cardinal gate rotations, retained old obstruction, translated/renamed/90-degree-rotated corridor, and real-controller round trips at 60/10 fps with both sprint modes.
- `node --test tests/current-state/*.test.mjs tests/*.test.mjs tests/*.test.cjs`: 61/61 pass, no skips.
- `node tests/stepwalk-auto.cjs --check`: 39/39 pass.
- Independent browserless controller replay: 156/156 waypoint-arrival combinations pass. This uses the full static collision world; it does not replace browser streaming/interior coverage.
- `node tests/p1r-unit.cjs`: pass. `node tests/zone-lint.cjs`: 0 errors, 23 warnings. `git diff --check`: pass.
- Existing anchor check remains red: Shenwu Gate is 11 m from its old anchor (5 m tolerance); Qian Dong Wu Suo has a pre-existing gate/group kind mismatch reported as an intentionally skipped comparison, not a second failure. No layout or anchor files were changed.
- Correct gate depths also move endpoints on nine other routes: Ningshou Gate → Huangji Hall; Yangxing Gate → Yangxing Hall/Leshou Hall; Wenhua Gate → Wenhua Hall/Zhujing Hall; Wuying Gate → Wuying Hall/Jingsi Hall; Cining Gate → Cining Palace/Dafo Hall. All are included in the 39-route precheck and independent 156-case replay.

## V3 raised-side-gate integration

The shared V3 implementation now consumes `SideGateProfiles.js` / `sideGateGeometry(item)` with explicit `gateProfile`, platform dimensions, local portal centers, front/rear ramps, and `toWorld`. Local -Z is front; +Z is rear. `gateGeom.front` and `.rear` retain the separate complete ramp-toe extents; `.half` remains their conservative maximum for existing symmetric callers. `gateLeg` chooses the correct front/rear extent for its inward direction.

Twelve additional automatic round trips cover all three actual portal centers of each of the four profile gates. Each route preserves, without short-leg simplification, the front outside point (2 m beyond the toe), front toe, front top, rear top, rear toe, rear outside point (2 m beyond the toe), and the return path. There are now 51 automatic routes, retaining all 39 original hall/cross routes. Ordinary and legacy five-bay gates retain the topology-driven path; no profile is inferred from width or name.

Gate-center clearance probes explicitly use the physical `platformY`, including the two approved `zone-lint.cjs` callers. Generic point/walk helpers retain their original ground-level default. Negative tests prove a ground-level start inside the 2.62 m platform stays blocked; positive tests verify the raised center is clear, both toes/outside points begin at ground, and center-origin probes descend to ground.

V3 checks after the final ramp-body guards: 23/23 focused route tests, 51/51 Node prechecks, an independent 204/204 real-controller replay (all 51 routes × 60/10 fps × walking/sprint, including the existing fell-under criterion), and zone lint (0 errors, 23 warnings) pass. Hall-approach fixtures additionally exercise both inward directions for all four profiles. Browser streaming and loaded-interior coverage remain pending the parent-run full V3 browser gate.

## Fixed side-route full-ramp coverage

The existing 33 fixed routes already passed 132/132 controller combinations after the new gates were built. There was no reproduced rail blockage. However, the four routes starting through Xiehe/Xihe Gate turned at the legacy gate-center ±20 m point, which is still on the new physical slope (3.75 m/3.55 m before the respective front ramp toes).

Only those four gate transits now include actual rear outside/toe/top and front top/toe/outside points, with a 2 m ground-level departure margin. These profile-derived points retain their exact precision; the original route starts, all remaining tail points, and final destinations are unchanged. DUMP-JSON comparison confirms the other 29 routes are byte-for-byte identical. The revised fixed routes again pass 132/132 real-controller combinations, including the existing fell-under criterion. The regression asserts full-ramp waypoint coverage and ground-level departure, not an invented old collision failure.

Final shared-tree Node verification after profile guards: 140/140 tests pass with no skips; P1-R unit checks also pass. The two retained Xihe-route starting points remain on their original roughly 0.069 m-high surface; only the newly added ramp entry/departure points are asserted to be exactly at ground.
