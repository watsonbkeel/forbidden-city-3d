# R63 F integrated local dispatch QA

## Verified scope

- Frozen baseline: f87342d7e1506713df4a6877943eb377e8299593.
- Both original ZoneBase and RemainingResidentialHalls source modules are independently SHA-checked compressed fixtures. Their relative imports are URL-resolved only; 101 other transitive local static imports and the west-six declaration remain byte-identical to frozen R62.
- Current side imports the actual production ZoneBase directly. There is no hook rehearsal, source replacement, helper-only candidate assembly, ZoneBase.build(), or full-world construction.
- All 35 west hall/gate dispatches are compared one at a time, releasing each kit before the next state. All 19 non-target outputs are exact, including geometry, materials, node metadata, colliders, support, rooms, map registrations, and gate state.
- Exactly 13 unnamed annex targets withhold 80 original generic furniture meshes, their 80 dedicated colliders, and 14 cover markers. Retained shell geometry, support, room bounds/doors/spawns and UNKNOWN status are checked.
- Tongdao and Lijing windows have zero collider/support delta. Tongdao roof and windows coexist in one current dispatch with unchanged physics. Qinzheng adds exactly 5 colliders and 1 support. Net local delta: -75 colliders and +1 support.
- One merged actual-production group containing the 16 target halls passes assertR63FInWorld at B using a real CollisionManager and real room registrations. The pure consumer checks roof surfaces, both window sets, annex retained/absent triangles, and footstool/floor/collider/support contacts.
- Frozen R62 is a negative control: it has no Qinzheng footstool and fails the new Tongdao roof and window consumers.

## Actual local triangle budgets

The 35 local hall/gate dispatches total 81675 triangles before and 96191 after. These are geometry counts, not GPU draw-time measurements.

- Qinzheng/Yangxin item 2: 11,804 → 11,864, ceiling 11,864.
- Lijing item 24: 1,646 → 9,726, ceiling 9,726.
- Combined Tongdao item 47: 1,646 → 8,982, ceiling 8,982.
- Annex removal: exactly 12 triangles per removed box. Every other dispatch is unchanged.

## CPU combined preview

The same southwest camera shows the entire Tongdao roof and all four new south windows in one scene. Captures use the unchanged existing CPU raster and actual HD albedo/UV/plaque atlas. Both images are visibly labeled CPU, not GPU/browser acceptance. No image generation or official-source photograph copying was used.

- combined-preview/tongdao-southwest-roof-and-windows-before.png
- combined-preview/tongdao-southwest-roof-and-windows-after.png
- combined-preview/proof.json records camera, pixels, geometry, current source hashes, physics and retained-mesh hashes, and both consumers.

CPU limitations: no WebGL normal mapping, PBR, shadows or tone mapping. Not whole-world, browser, historical, full-building or F55 acceptance. Evidence/source conflicts and unknowns remain unchanged.

## Reproduce

- node --test tests/r63-f-integrated-dispatch.test.mjs
- node scripts/r63-f-stage/export-combined.mjs
- For later guard-only updates: node scripts/r63-f-stage/export-combined.mjs --verify-existing. This rerenders both states and requires identical PNG bytes instead of silently replacing evidence; source hashes are then refreshed.

Post-guard verification: all four integrated tests passed again after integrated roof 5ad035a and windows b492ae6. The earlier log is retained as integrated-pre-guard-test.log. The CPU exporter was run with --verify-geometry-only: actual before/after geometry/material payload bytes and retained PNG bytes match the original captures; updated current-hook hashes and upper-grille consumers are recorded under postGuardVerification in combined-preview/proof.json. No PNG was rerasterized or replaced.

Only the new targeted test was run for this task. No aggregate, full-world, build, publish, or git commit was run.
