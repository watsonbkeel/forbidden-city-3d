# R16 bounded candidate acceptance - 2026-10-18

R16 continues the frozen R15 day/night and helicopter build. It changes only the three shared-terrace levels north of Baohe Hall, plus the matching route descriptor and regression fixtures. The hall's separate top plinth is still unchanged. Main and public Pages are unchanged.

## Evidence and visible change

The official panorama photograph cited in CHECKPOINT.md shows three grouped approaches per level: outer stairways and narrow stairways on both sides of central carved stones. The lowest stone is substantially longer than the upper stones. The candidate separates these stairways and rails, blocks ordinary walking over the carvings, and retains persistent physical support independent of detail LOD.

The published exposed stone size is 16.57 x 3.07 m, distinguished in Yang Naiji's article, printed p15, from the larger original block. It is not a modern measured survey. Stair widths/counts, offsets, upper stones and inherited level heights remain provisional. The reused carving texture is simplified, not an accurate copy of this particular nine-dragon relief. Current public access is unverified.

Two actual same-camera, same-viewport, same-noon-preview pairs show the changed grouping and long lowest stone. These are controlled architectural comparisons, not walk-through proof. An initial unsuitable camera inside Qianqing Gate/behind its screen was rejected and retained.

## Checks completed

- CPU: 2401 tests covered. The full run passed2384;17 failed because one old unmerged fixture did not implement the real finish() metadata contract. That fixture alone was corrected and all17 passed. Product code was not changed to obtain those passes. Includes51 focused new checks, real controller up/down on all four strips,60/10fps, walk/sprint, forward/backward, missing-ramp negatives, stone/wall blocking and LOD invariance.
- Browser deterministic routes:33 fixed +59 automatic routes at60/10fps and walk/sprint,368/368 passed in61.57s. Only the Baohe north descent descriptor changes, following the actual inner stairs instead of the non-walkable carved stone. Original endpoints, route count, drivers and pass rules remain. One host favicon404 is disclosed; no application error.
- Native keyboard: outer stairs ascended ground-to8m in the first ordinary attempt. Its descent did not finish within240s and remains a partial attempt. A separate missing-path continuation completed outer8m-to-ground and an uninterrupted inner ground-to8m-to-ground roundtrip. Starting poses were explicitly controlled; all subsequent walking used trusted native W/S/Shift input, with the map open. This is not a continuous walk from Wumen. Opposite handed strips have CPU coverage, not separate native runs. Final continuation212.71s, cleanup0.38s, no application/resource errors. A30s CUA wrapper timed out; actual recorded native key release and movement completed, and that tool failure is retained.
- Original six cameras x60 frames at1280x720,high,DPR1: all calls/triangles within the unchanged10% original-baseline ceiling.480.12s sampling,0.50s cleanup, no application/resource errors. Six FPS-P5 warnings remain on SwiftShader; historical baseline is nonconcurrent. No real-phone or smoothness claim.
- All owned browser processes and local ports were closed. The unrelated managed browser was left untouched.

## Cost and limits

All resident static-palace geometry, including BOTH LODs:186186 to188128 triangles(+1942),155 to157 meshes,18115124 to18301556 geometry bytes(+186432). No geometry was moved outside the accounting. Only the three-terrace group changes.

Whole-frame measurements (calls / triangles / FPS average / P5):
- Wumen:174 /983755 /0.99 /0.91
- Taihe:158 /961007 /0.98 /0.67
- Qianqing Gate:144 /1059181 /0.90 /0.82
- East Six Palaces:128 /833733 /1.11 /0.99
- Ningshou:107 /659055 /1.41 /0.97
- Garden:131 /868965 /1.01 /0.86

Structural budgets do not imply acceptable device frame rate. The old original baseline remains fixed. Noon preview differs from the original baseline's fixed sun, as already disclosed in R15.

R15's full automatic helicopter circuit and real five-minute unoccupied return are now separately observed on the original frozen bytes. See R15-ENDURANCE-SUPPLEMENT.md. No public deployment is included in this source candidate.
