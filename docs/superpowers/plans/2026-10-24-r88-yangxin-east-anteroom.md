# R88 Yangxin east anteroom implementation plan

> **For agentic workers:** Use superpowers:executing-plans. Single implementation owner; independent asset/transaction review before final validation.

**Goal:** Replace the old hypothetical east throne/high dais/entry curtain with an explicitly photo-fitted east anteroom while retaining all unrelated S geometry and gameplay.

**Architecture:** Frozen R87 GLB is the retention input. Match old author-source east components to decoded triangles, replace only the bijectively owned triangles, append separately named author-generated furniture and matching collision nodes. Validate the Yangxin layer before install; rollback every partial side effect.

**Tech stack:** Existing Blender 4.3.2, glTF exporter, bundled Draco decoder, Three.js, Node tests. No new packages.

**Spec:** Parent-approved R88 scope, source card in docs/current-state/r88-yangxin-east-anteroom/DESIGN.md.

## Constraints
- No whole-material deletion, coarse spatial clipping, whole-hall re-export, unknown fonts, new NPC, or historical inventory claim.
- Preserve all non-target triangle vertex attributes/materials/node transforms. Re-encoding may differ; semantic equality must be proved.
- Preserve main/west room, original partition doors, actors108/beds28/privacy screens5 and emperor route.
- Exact source image identity, display date, URL date and inferred room identity remain separate.
- No main/Pages/upload/delete. One production backup. Real GPU/mobile remains unknown.

## Review focus
1. Material batch contains central gold furniture: require exact old-component ownership and non-target attribute digest.
2. Draco quantization or triangulation ambiguity: fail closed, no tolerance-driven broad deletion.
3. Failure after collider/light/scene registration: inject each failure, prove no tag/scene/resource leak.
4. Fixture decoder may silently rebuild normals: use full actual GLB decoder and prove attributes unchanged.
5. Furniture may obstruct old partition doorway or NPC: actual radius .5 controller routes10/60Hz and full night checks.

## Tasks
- [ ] 1. Red tests: old ghost east collider and missing stable node contract; baseline full-attribute GLB reader and author component report; fail if matching ambiguous; commit ownership proof.
- [ ] 2. Red tests for new named furniture/collider alignment; author-source local generation; append only new east layer; prove retention and budget; commit candidate.
- [ ] 3. Red partial-install and cancellation tests; Yangxin validation and transactional rollback with existing B unchanged; commit.
- [ ] 4. Run actual routes/night/lifecycle/shared loader regressions; compare raw current-state failure labels; independent review fixes; freeze identity and one fresh production package.
