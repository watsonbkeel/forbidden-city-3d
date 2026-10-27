# R114 independent scoped functional / source-geometry gate

2026-10-26 19:58 UTC. Runtime **52aa349cc3c6617e74541ef011ada4ebc5fd98d8**. Read-only product review; only reviewer scratch files were written. **Scoped functional/physics PASS, pending writer final night/shared/build/cost and updated visual evidence. Not whole Chengqian Palace completion.**

## Final runtime evidence

All four final executed groups capture identical before/after full **414 src/data SHA256 hashes**, full HEAD, command, exit status, script/raw hashes. They were run sequentially, not during formal cost measurement.

- `routes-52aa-1956`: 3 ordinary front court → actual central stair → narrow north passage → west court gate → rear hall → same return, plus 3 original west-wing door → original central spawn → return, at 10/30/60 Hz.
- `fast-back-52aa-1956`: the same two complete routes × sprint/backward × 10/30/60, 12/12 reached. Existing physical driver brakes within 2 m of turns; this is not unbraked full-speed corner ramming.
- Source geometry is extracted from the actual finished merged east-six scene: new terrace/gate **128 triangles**, plus moved west wing and retained main-front corner column, **1498 selected finished triangles** in total (original `kit_floor_flat` decorative plane excluded, explicitly not a physics source). New roof's 8 triangles and all new boxes match actual finished Float32 geometry. Every frame of the 9 full front/rear journeys has **0 selected finished-triangle penetration** and **0 ordinary-box positive overlap**. West-wing door paths have no new physical-source penetration; the exact retained low wood threshold exception below is kept visible.
- `jump-teleport-52aa-1955`: genuine ground walking into gate → jump against header → land and return, three frame rates; and genuine ground walking onto the retained main-platform edge → jump against the actual roof underside → settle and walk back to ground, three frame rates. All six approach/return paths complete, 128 new finished triangles have zero positive penetration. Header limits feet to about .750000048; roof underside to 1.349999952; all finish grounded at 0. No forced roof-top or feet=8 pose was used for this functional evidence.
- The same final run executes actual `Teleport.go('承乾宫西侧院间门')`: its unsafe default Z371.62 is not used; normal resolver selects **(-76, 0, 373.87)**, fallback distance 5.75 m, east-six, collision false and zero new-finished-face intersection. Original Chengqian landing remains **(-93.6, 0, 366.55)**.
- `lifecycle-52aa-1956`: real R52 Environment and ZoneManager, held navigation, all 3 exact scopes unique; ground removal/re-add, geometry replacement, drawRange/visibility/manual-matrix rejection, wrong-kind/ID atomic rejection, translated marker outside fixed ground patch rejection; 3 same-entry cache round trips then eviction/fresh build. East-six counts remain **1242 colliders / 53 walkables**. All **62 first-generation finished geometry objects** dispose exactly once; none dispose during cache retake.

## Explicit geometry tradeoff and retained limitations

Only west front wing /12 moves south 3.5 m to Z367.1; east /11 stays Z370.6. This is an approved reversible engineering fit, not a surveyed museum dimension. Actual west-wing visible south envelope is Z360.94000015, against original south-wall inner face 360.7: no solid overlap, but the previously walkable southern dead-end strip shrinks **3.74 m → .24 m**. This is a real accessible-area loss, not “zero circulation loss.” Its only original door faces the central courtyard, not this strip.

Actual final world inventory has no map-item center, region center, room door, room spawn or named target center in the declared loss band X[-82.4,-72.6], Z[360.7,364.44]. The west-wing door and both original spawns are at Z367.1, with original UNKNOWN inventory metadata retained. Actor task/day bindings and final 21/06 behavior remain the writer's separately recorded gate.

North solid-box clearance is 1.16 m; the retained main corner column's visible mesh protrudes .017 m farther south, making the actual visible minimum **about 1.143 m**. Full-size player paths use a legal centerline near Z373.65; bodies were never shrunk. Final selected finished geometry, not nominal corridor width, provides the clearance proof.

Original low wood doorway threshold (`wood_column`, local position [0,.56,-3.52], top about .67) has no full-body owner. It is byte-identical in geometry/index/local TRS/material to R113. `old-threshold-no-worsening-1948` rechecks the saved same-layout 0ad and b69 physical poses against this exact finished threshold: every XZ position and intersection-frame index is identical, **4/16/32** frames for ordinary 10/30/60; maximum vertical overlap **.219999999 → .209999991**, not deeper or longer. Final ordinary replay reproduces that inherited result; sprint reports 2/7/13 and backward 4/16/32, explicitly separated from new physical surfaces. This is not a claim of all doorway render surfaces being collision-correct. Original floor/decorative slab approximations outside new source ownership also remain disclosed.

## Failures preserved, not counted as passes

- 7c front-wing/main-hall walls genuinely overlap, and outer wall gap is only .2 m; actual central-stair → Z373.5 lateral route was blocked. Single-wing fit is the approved fix, not a broad solver exemption.
- 0ad opens the route but the old .45 low platform lacks body ownership, so descending feet cut visible brick at its north edge. Exact existing brick/cap source boxes close that defect; no render platform was invented.
- efb's new cap blocks the original inward door before center support activates. The unique bounded entry source domain closes this real regression.
- b69 legitimate gate jumping fell through Environment 0 to roughly feet -53 because the vertical zero-plane crossing accepted only the old source label. 52aa adds the **already validated new witness source** to the same original TOI branch; final full-world jump and return proof closes it. No body, gravity, SAT or controller mathematics was changed.
- `routes-7c8b-1923` used a nonexistent test API and produced no route result (test harness exception). Initial straight-through-main-wall and overly deep shoulder waypoints are not product navigation proofs. Initial roof approach at X-78.8 failed the tight test-driver target at 10/30; final legal X-78.6 approach is separately retained and passes all three frame rates.
- Environment manual world-matrix and fixed-patch permission REDs are preserved alongside GREENs. Degenerate/hidden/drawRange/ancestor-transform source rejection was already fixed before the first reviewer 8-case execution and must not be relabeled independent RED.

## Pending / not claimed

Writer final true hrtime 10-process cost, final three-bed 21/06 run, shared regression, root build and source-bound updated courtyard/gate images remain separate gates. The images timestamped 19:20–21 precede the west-wing move and cannot stand for final geometry. No GPU, phone, actual texture/PBR/shadow or Node20 execution claim. Missing rear annexes/ear rooms/well pavilion/unknown room inventories and full E1–E8 / I1–I6 denominator remain open; R111 rejected rock work remains unfinished.
