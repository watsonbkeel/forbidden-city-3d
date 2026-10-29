# Independent review record — bounded Tihe west

Read-only peer: `review_huangji`, 2026-10-29. Sole writer remained `resume_huangji_front`. Peer did not run tests or edit files; execution evidence below is writer-run, not attributed to peer.

## Findings and dispositions
1. Low vase-band geometry initially floated outside the vase. Actual source ray red test reproduced the gap. Radius now interpolates the lathe profile; six bands ×36 interior sample directions intersect the vase surface. Torus equator/seam ray-oracle numerical failures are separately retained; final ray samples use +1 mm height, not exact shared edges.
2. Area-only AABB proof could accept repeated half-faces. Closed-box proof now rejects repeated triangles and requires each undirected edge exactly twice, plus the original six-face area/corner requirements.
3. Physical closure was wider than the new visual group. Docs and metadata limitations now describe existing **whole-hall** window/partition/column/ceiling source completion, not just west-room furniture. Exact safe-parent 123-mesh contract binds geometry, index/position interpretation, groups, draw ranges, matrices, material identity and relevant draw flags.
4. Original 25-source replacement now rejects invisible sources/materials, changed groups/index semantics, duplicate material owners, and colliders carrying foreign metadata. Root/ancestor visibility and exact old world matrices are checked. Source contract is model identity, not surveyed geometry.
5. World-space Float32 equivalence is bounded by the retained identity root. Final merge test checks actual box/curve/column/ceiling triangles, full new-material triangle multiset, and bidirectional source.mesh/source.triangle mapping for all three surfaces.
6. Atomic late-source failure preserves original resources. A separately reproduced `kit.mesh` construction exception initially leaked the passed geometry; cleanup now disposes that geometry once while leaving old groups/materials/colliders intact.
7. Retained ceiling is two-sided body blocking but downward-wound and cannot supply foot support. Actual World descending contact remains airborne without jump reset. This is explicitly not a one-way ceiling or a new upstairs floor.

Peer's final read-only disposition: no new definite blocker found on the normal source path; limited acceptance after the final specialized gate. No GPU, universal performance, all-trajectories or complete-palace endorsement. A later writer-found manual old-matrix override received a red→green guard test before the final frozen RC run.

## Known non-green legacy evidence
Full residential group: actual safe-parent replay 185/195, candidate pre-RC 184/195. Ten failures reproduce with the parent. The only added failure demands removed old Tihe table/chair group names; no original legacy assertions/goldens were changed. `residential-parent-delta.json` enumerates all names. Final RC result must be recorded separately, not inferred from this comparison.

## Cost and acceptance boundary
Actual real-material isolated hall: final meshes17→23; triangles3054→5300; collider75→209; floor walkable1 and navigation rooms3 unchanged. Both cost sides exclude the later full-zone R130 registration equally. Photo curves retain1984 source faces, with72 genuine zero-area pole faces omitted by the established exact-surface implementation. Exact high-contact replay is expensive; browser/GPU and universal smoothness remain unverified. No shared movement algorithm was changed.

Final frozen RC read after completion: specialized36/36, full shared161/161, legacy32/32, residential184/195 with identical known failure names, three-base495-module compilation passed. Code/docs/scripts/tests staged diff whitespace check is clean. Raw preserved TAP failure diagnostics retain Node's original whitespace; they were not normalized to make an all-files whitespace check appear clean. Staged runtime fingerprint rechecked against compiled identity and matches exactly.
