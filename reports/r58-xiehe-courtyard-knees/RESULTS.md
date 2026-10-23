# Bounded result, 2026-10-22

Six Xiehe courtyard/local +Z scalloped knees implemented from Xiehe's own photograph. Only the new dedicated module and a two-line Xiehe-only hook change production. No outward knee or full-Xiehe acceptance is claimed.

## Verified

- `XIEHE_EVIDENCE_DIR=reports/r58-xiehe-courtyard-knees node --test tests/r58-xiehe-courtyard-knees.test.mjs`: exit 0, 4/4. Checks own-profile-only output, all retained geometry and navigation records exact, actual tapered-column attachment, beam contact without duplicate skins, finite/nondegenerate triangles, no coincident duplicate triangles, winding, individual geometry ownership and disposal, production-merged knee visibility and controller clearance.
- `node --test --test-name-pattern='xiehe:|fresh gates|sibling assemblies' tests/current-state/side-gate-render-geometry.test.mjs`: exit 0, 5/5. Covers real production materials, hidden-face reduction, cardinal rotations/open-closed leaves/plaque modes, sibling retention, merge/unload ownership, exact surviving merged streams and first surfaces. Only the expected Xiehe +432 triangles/+6 source meshes changed; no test expectation for another gate changed.
- 12 actual FirstPersonControls paths: three openings × 10/60 Hz × forward/backward sprint. All arrive via original ramps and settle on ordinary ground. Existing controller, CM and maps are not patched.
- 12 actual stationary jumps: six positions × 10/60 Hz. Maximum observed heads are 5.82 and 6.111667 m; minimum actual overhead triangle clearances are 1.986586 and 1.694920 m, respectively. All land at the original 2.62 m platform. The conservative global lowest knee is 7.61 m; theoretical free-jump head is 6.171429 m.
- 559 colliders, 3 walkables, 1 map item unchanged. Physical hash before and after: `798dd0b9ca578a6b5969826ddabc988a8ba0637959000daa004779698c3bfa6f`.
- Plaque-disabled production-merged component: 6096 → 6528 triangles, 12 → 12 material meshes. Six new source meshes, each 72 triangles; all previous geometry retained exactly. Every knee's minimum triangle area is approximately 0.0006 m².
- `node --check` on the new production module, pure consumer, CPU exporter and export entry; `git diff --check`: exit 0.
- Source SHA-256 values in `proof.json` match the final source files. Both before/after camera objects compare exactly. All four final CPU PNGs were actually viewed after export; they show the unchanged envelope and the local newly scalloped lower edges.

## Evidence and ownership

`proof.json`, `controller.json`, focused/render-retention logs, compressed actual-triangle inputs and four PNGs are in this directory. `SOURCE-FIT.md` records own sources, dates, dimensional fit limits, contact math and unresolved scope. Official photographs remain private and are not present here.

The images are actual production-merged SideGate COMPONENT views, not full-world screenshots. The close camera is grounded on the real retained ramp at local (3, 3.58197183, 11); the wide camera is grounded at local (0, 1.7, 38). The same coordinates/FOV are used before and after. CPU palette, not original textures, lights, shadows or browser rendering.

The parent may import `assertXieheCourtyardKneesInWorld(W)` and `replayXieheCourtyardJumps(t,W,{fps})` from `tests/lib/r58-xiehe-courtyard-world-check.mjs`. They consume its single already-built merged world, assume the canonical Xiehe position/rotation and require one Xiehe structure record. `exportXieheCourtyardViews(W,out,'after',{scope:'EXISTING_WORLD_NONINSTANCED_MESH_CROP'})` from the separate CPU helper is optional and likewise builds no world; its mesh-only extractor excludes instanced meshes and is not a complete-scene visual proof. This worker did not build a world, run a production build, use a browser or change a source-freeze/canonical queue/release.

Read-only independent code review found no critical or important defect. It checked contact math, outline/winding, ownership, retained-state proof and controller evidence, and viewed the own courtyard photograph plus diagnostics. Its explicit caveats (canonical consumer binding, optional exporter excludes instancing, no cumulative/browser acceptance) are retained here rather than converted to a global approval.

## Remaining

Final full-world merged binding/controller evidence belongs to the parent and has not been asserted here. Browser same-camera before/after is VERIFY_PENDING; no denied browser route was retried. Outward knees, end windows, whole roof framing, brackets, complete endpoints and gallery conflicts remain separate pending items. Neither Xiehe nor A's 37 entries is fully accepted by this patch.
