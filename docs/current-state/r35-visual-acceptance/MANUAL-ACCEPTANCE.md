# R35 manual visual and actual-input matrix

Status at 2026-10-20 13:15 UTC: every candidate-image and native-input row below is **NOT_RUN** because the available supported browser cannot create WebGL. Do not replace `NOT_RUN` with `PASS` using source inspection, CPU rays, unit tests or older screenshots.

## Capture setup

Use `tests/fixtures/r35-lighting-qa.json` exactly. The fixture owns all view names, positions, targets, times and quality/tier combinations. For each required image record source commit, build/asset hashes, renderer/device, viewport/DPR/FOV, camera and target, actual preview time, quality, loaded zones, interior tier, console errors and original image hash.

Capture noon, twilight and night, high and low quality. Keep festival lamps disabled unless the row explicitly tests that optional feature. Compare B and S interiors where the fixture requires both; wait for the real selected tier to load. Preserve an ordinary UI screenshot in addition to a clean scene view when practical. A clean-scene diagnostic camera proves the image at that camera, not that a person can walk there.

## Image gate

| ID | Subject / fixture view | Required visible evidence | Reject or mark blocked when | Result |
|---|---|---|---|---|
| V01 | 午门 initial view | Whole available facade, readable entrance and foreground; sky/ground differentiation at all three times | Blank scene, corrupted shaders, missing assets, silhouette-only path at night, or exposure mismatch between A/B | NOT_RUN |
| V02 | 太和殿 approach | Paving, steps, balustrades, red structure and eave undersides remain distinct | Washed-out paving/gold, black entrance, or unresolved aggressive normal-map relief | NOT_RUN |
| V03 | 太和殿 doorway, B and S | Plaque, beam/ceiling layers, display and floor can be identified from the entrance | A supposedly clear target is hidden by new geometry; missing/incorrect S asset; clipping/flicker | NOT_RUN |
| V04 | 太和殿 center, B and S | Whole display translation reads coherently with floor/steps and retained columns | Isolated floating/misaligned display component, closed approach, or B/S side-rail opacity mismatch | NOT_RUN |
| V05 | 太和殿 side/caisson, B and S | Throne, screen, gold columns and caisson remain separate layers | New occlusion, clipping through roof/ceiling, missing display, or lighting loses the separations | NOT_RUN |
| V06 | 乾清宫 entry and center, B and S | Shared frontage grid and center three bays read coherently; warm-room boundaries remain explicit | Inconsistent door/column spacing, visible gaps in intended closed boundaries, erroneous private-room openings | NOT_RUN |
| V07 | 乾清宫 end passage, B and S | Five-metre modeled passage, front/rear connection and floor support are visible | Boundary crosses the passage; dark/absent floor hides route; optional asset changes passage ownership | NOT_RUN |
| V08 | 储秀宫 courtyard | Main hall, side halls and returning corridor read as one connected composition | Roof intersection, visible corner hole, z-fighting, floating column/floor, or a hidden step makes route ambiguous | NOT_RUN |
| V09 | 储秀宫 interior | Room partitions, central passage and retained domestic-hall arrangement remain legible | New throne/display invented, blocked door, partition gaps or missing floor | NOT_RUN |
| V10 | 御花园 lantern view | Existing four lamp housings have matched warm faces at night and no visible glow at noon | Floating glow, light visible through unrelated structure, missing housing or daylight-emissive faces | NOT_RUN |
| V11 | Matched route material close views | Original colors remain stable; slab/wall relief is restrained; wood response differs without plastic shine | Arbitrary recolor, stretched/repeated texture artifacts, harsh faux grooves, sheen obscuring grain, or UV change | NOT_RUN |
| V12 | High/low quality parity | Same architecture, route visibility, displayed time and selected interior state in both quality modes | Geometry disappears, black materials, wrong time/exposure, stale render size or scene failure | NOT_RUN |

For V08, supplement the fixed courtyard view with four eye-level corner views while walking the actual corridor. For V11, supplement fixed views with paving at shallow angle, a red wall under daylight, and columns under eaves. Record those added cameras rather than presenting uncontrolled A/B crops as calibrated evidence.

Night acceptance means navigable surfaces and architectural layers are readable while the scene still appears darker and cooler in sky than noon. This is a virtual-tour readability criterion, not a measurement of museum lighting or moonlight. Stronger numerical light values alone cannot pass it.

## Native input gate, separate from fixed cameras

| ID | Action | Pass evidence | Result |
|---|---|---|---|
| I01 | Start and walk from the actual initial position | Loading completes, scene responds to native held input, pointer-lock/unlock lifecycle is visibly correct | NOT_RUN |
| I02 | Map search → place card → close/return | Search and card controls usable; no accidental teleport; returning retains intended position and orientation | NOT_RUN |
| I03 | Walk → settings → resume | Input stops when interrupted; no stuck key; correct focus/pointer state and quality after return | NOT_RUN |
| I04 | Manual/automatic flight → land → walk → board again | Actual controls, mode labels and positions agree; no unrecoverable freeze, fall or unexpected flight transition | NOT_RUN |
| I05 | Main axis plus all five bridge passages | Continuous native input in both directions; visible support/steps; no reset or teleport to hide a blockage | NOT_RUN |
| I06 | 月华门 → 翊坤 side passage → 体和殿 → 储秀回廊 → return | Continuous support and playable corner clearance; all four corridor corners and two north height transitions checked | NOT_RUN |
| I07 | 太和 and 乾清 B/S load, leave, re-enter | Optional assets load and unload without stale geometry, gaps, duplicated collisions or a lost return route | NOT_RUN |
| I08 | Physical-phone touch and rotation | Recorded actual device/browser; simultaneous move/look, controls and orientation work without clipping/overlap | NOT_RUN |

Desktop emulation may provide additional layout evidence but cannot pass I08. A deterministic CPU FirstPersonControls replay may pass a route regression but cannot pass any native-input row.

## Runtime evidence and decision

Record new console/page/resource errors, memory and frame metrics only if a permitted diagnostic interface exposes them. Separate CPU software rendering from real GPU, device-model claims, and phone evidence. Re-run existing numeric budgets with their original thresholds; do not tune those thresholds to a new candidate.

A result is accepted only when the reviewer has inspected the candidate images and actual input evidence, every required row has an explicit outcome, and remaining limitations are reported. If required rows remain blocked, release notes must say so. Do not label the version visually accepted or real-device smooth based on the passing CPU suite.
