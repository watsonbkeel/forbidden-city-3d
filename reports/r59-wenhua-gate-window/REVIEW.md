# R59-B Wenhua Gate: bounded coarse south-window fit

Status: VERIFY_PENDING. Building remains PARTIAL. This is not full window repair and not browser acceptance.

## Implemented and preserved
Only photo-screen-right / local negative-X end bay's south skin changed. The baseline's two full red south-facing triangles were replaced by three disjoint red margins, one recessed pale stone body with cap and edge returns, four real red perimeter members and an opaque recessed closure. No photographic or generic grille texture is used. Fine red grille members visibly exist in the source but are not modeled; exact count/pattern and leaf arrangement remain unresolved.

The ten triangles of the original other five faces retain exact position/normal/UV/material contents. All other original meshes, opposite end wall, four internal partitions, outer side walls, six open door leaves, roof, plaque, stairs, map and physics are unchanged. All nine new solids lie within the original wall box/collider. No room, door, navigable opening, new collision registration or operational closure was introduced.

Local gate budgets: 2,702 → 2,808 triangles (+106), 96 → 105 premerge meshes, 14 → 17 merged material draws (+3). Three ordinary private solid materials are CourtKit-owned; no textures or runtime lights added.

Registrations unchanged: 27 colliders, seven walkables, zero rooms, one map item, zero regions.

## Source and preservation evidence
Source and control points: SOURCE-DIFF.md. Immutable baseline: 2b983ae82e50e23fd55bbe0845942a0a3855f8dd. The fixture loads the SHA-checked exact original SouthCourtGates.js bytes saved in tests/fixtures/r59-wenhua-gate-window/SouthCourtGates.baseline.js.txt, so a future integrated hook cannot contaminate the before case. It does not require the original Git object to exist. Original commit/blob provenance is retained in that fixture directory’s provenance.json.

- Non-target mesh/transform/material/attribute SHA-256, before = after: 632e2fb2177ef46377604a68d0a793eeb0c06e8a018c261ef6b4735e2111e3af
- Original target five-face SHA-256, before = after: a294901034ebbdc552ae136b482c0b4bd7f4ad73ed0c74b4f74a9c21b800b36d
- Physics/map/room registration SHA-256, before = after: e2a997cf1f0e5dbc7f0eb91cd0cc1dc7bbcafeec397e78f50bd0311e9c9acab0

The official image stays outside this worktree. Only its URL and SHA-256 are recorded. No official photo is included in source, public, reports, CPU diagnostic images or any package.

## Actual validation
- Initial red: four focused tests failed for the absent dedicated helper before production implementation. red.tap records that failure; it is NOT itself visual-difference proof.
- Separate actual old-model red: red-existing-model.txt records the two full baseline south triangles, red material hit at the stone region and the expected failing stone-material assertion, exit 1. This directly establishes the existing-model mismatch.
- Final focused tests: node --test tests/r59-wenhua-gate-window.test.mjs tests/r49b-south-gate-planes.test.mjs, 8/8 passed. Tests include source difference, same-side selection, resource ownership, actual merged rays, exact preserved hashes, closure/portal collision behavior, wrong-identity/modified/shared-source no-op and idempotence.
- node --check src/scene/palace/special/WenhuaGateSouthWindows.js passed.
- git diff --check passed.
- Actual bounded CPU exporter: node scripts/r59-wenhua-gate-window/export-cpu.mjs. No complete world construction.
- Raster command for each evidence/*.json.gz: python scripts/r58-court-facade/raster-diagnostic.py INPUT OUTPUT.png.
- Whole front, close and interior-oblique before/after pairs were actually rendered and visually inspected. Same camera is asserted for each pair. Initial exterior-oblique camera was blocked by the unchanged outer wall; it was replaced by an in-bay diagnostic camera, not by removing a wall. Captured images and source bindings are in evidence/proof.json and evidence/image-hashes.json.

The CPU renderer uses a declared flat palette and simple fixed Lambert lighting, not production browser shaders, textures, shadows or tone mapping. No source-camera match or photogrammetry is claimed. Full suite, full-world construction, build and browser acceptance are intentionally left to central integration per scope; no browser bypass or denied escalation was attempted.

## Exact integration hook (not applied in this branch)
In src/scene/palace/special/SouthCourtGates.js add:

    import { applyWenhuaGateSouthWindows } from './WenhuaGateSouthWindows.js';

At the existing terminal sequence replace:

    f.userData.structure=g;return{f,g,width:g.w};

with:

    f.userData.structure=g;applyWenhuaGateSouthWindows(kit,f);return{f,g,width:g.w};

This call is after all source geometry/plaque/map creation and after the exact structure identity is assigned. The helper rejects Wuying and unmarked or changed instances before allocation. Do not call it before assigning structure.

Read-only central-world QA consumer:

    import { assertWenhuaGateSouthWindowInWorld } from './tests/lib/r59-wenhua-gate-window-world-check.mjs';
    assertWenhuaGateSouthWindowInWorld(W);

W must already contain the actual built and matrix-updated scene and cm. This helper only reads rays, metadata and existing collision state; it does not build another world or add objects. The three original portals remain physically and visually open. The window remains collision-closed.

## Remaining scope
1. Browser before/after, actual material-lighting and runtime acceptance pending.
2. Fine red grille is visibly present in the photograph but unresolved and unimplemented. No claim of complete window reconstruction.
3. Photo-left bay, north face, unseen details, leaf counts, historical joinery, carving and exact infill material remain unaccepted.
4. Wenhua gate whole-building exterior/interior, R39/R48 main/rear display work, old 108 characters and 24 paths are not changed by this branch.
5. No main, remote, GitHub Pages or permission changes made. Parent owns integration and any publication.
