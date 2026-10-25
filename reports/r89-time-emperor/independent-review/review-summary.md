# R89 independent review — 2026-10-25

Scope: read-only source review of R89 relative to R88, fresh CPU/DOM tests. No source files edited by reviewer.

## Result
No blocking defect found in the reviewed R89 emperor route, Qianqing floor alignment, repeated input handoff, or water broadphase changes.

Fresh executions from `r89-time-emperor-fixes`:
- `node --test ../r89-independent-review/ui-extensions.test.mjs`: 24 passed, 0 failed (236 ms).
- `node --test ../r89-independent-review/world-extensions.test.mjs`: 1 passed, 0 failed (38.9 s).
- `node --test tests/r89-water-broadphase.test.mjs`: 2 passed, 0 failed (638 ms).

Logs: `ui-extensions-recovered.tap`, `world-extensions-recovered.tap`, `water-broadphase-recovered.tap`. Detailed movement metrics: `world-extensions.json`.

## Coverage
- Explicit Apply/Enter, invalid numeric values, boundary clock values, draft retention and no implicit application on blur/close.
- Three repeated close/Resume/Escape cycles with and without map, real controller movement after stale range/number focus, mobile joystick cleanup, flight keys and delayed pointer-lock focus handoff.
- Actual loaded world and GLTF Qianqing interior, B/S layers at 60 Hz and 10 Hz, night/day round trips, midnight and 06:00 boundaries, invalid/large dt, partial-route time changes, unload/reload standing and seated.
- Full registry remains 108 actors; movement budget at most 1.2 m per capped frame, static substep at most 0.15 m; old side-approach rail still rejects travel. Player occupancy blocks final seating and subsequent standing transfer.
- Travel approximately 32.0–32.1 seconds outbound and 32.1–32.2 seconds return in these controlled CPU scenarios.
- Conservative water AABB rejection leaves original narrow phase untouched for overlap/touching; fixed-R88 differential boundary and randomized checks pass. Production profile consumers inspected do not mutate cached polygon points.

## Limits
Not full project validation, browser/GPU, real phone or user-device acceptance. Source implementation owner must still run final aggregate/build gates after all changes. Whole-route per-frame vertical extrema are about 0.76 m at 10 Hz on stairs; this is not a Qianqing entrance-drop assertion or proof of visual smoothness. Existing discrete occupancy-checked sit/stand pose root changes are not mislabeled as continuous running.

## Wording correction
`SouthWaterSystem` represents southern Inner Jinshui plus west/east precinct branches, not the outer south moat. Prefer “南部复杂水域碰撞” in performance notes. CPU timing is not device FPS.
