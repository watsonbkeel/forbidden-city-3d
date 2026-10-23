# R62-E: withhold unsupported furniture in 24 existing unnamed hall shells

## Scope and evidence boundary

Base: `6b396800b6a03582aebf513fcef4966e9f5d0db3` (R61). Only `EastUnknownAnnexInventory.js`, tests, fixtures and this report directory are added. Shared builders, `ZoneBase`, zone data and `CourtKit` are unchanged.

Exact `east-six/items` indices: 3, 4, 5, 10, 11, 12, 17, 18, 19, 24, 25, 26, 31, 32, 33, 38, 39, 40, 44, 45, 46, 47, 48, 54. These are retained unnamed declarations, not proof that the fitted shell is a historically identified room. No physical building, room, furniture, actor or collider is added.

The supplied thirteen-section master requirements say unobserved areas remain unknown (line 137), forbid a generic throne as an independent reconstruction substitute (143), require support for furniture category/count/location/orientation (157), and prohibit filling an unphotographed room with another palace's arrangement (173). This change removes unsupported generated contents, not historic or current inventory. No official photographs or private image cache files enter the repository.

## Exact delta

- 12 legacy `hall` presets: 8 box primitives and 8 dedicated colliders per hall, 2 dependent cover points per hall.
- 12 legacy `room` presets: 6 box primitives and 6 dedicated colliders per hall, 1 dependent cover point per hall.
- Total: 168 meshes, 168 dedicated colliders and 36 dependent cover points withheld.
- All other actual mesh positions/attributes/materials, structural collisions, walkables, maps, regions, original room kind/bounds/floor/doors/spawns remain unchanged within each old/new comparison.
- Evidence: inventory `UNKNOWN`; `knownEmpty:false`; `accepted:false`; preset use `UNVERIFIED`; room bounds `NOT_VALIDATED`. Empty rendered furniture is not a known-empty room or historical empty-state claim.
- Existing structure IDs are preserved. Only originally ID-less shells receive a technical `east-six/unnamed-annex-N` ID so `kit.finish()` retains their evidence record. This is not a new architectural/historical identity.

`local-diff.json` records all 24 actual constructors. `r61-baseline.json` preserves the pre-change collisions, supports, rooms, maps, metadata and geometry hashes. The baseline navigation hash of every target agrees with the owner's prior `unnamed-controls.json` report. Frozen declarations live in `tests/fixtures/r62-east-annex-declarations.json`.

## Mechanism and transaction boundary

1. Require the exact original declaration plus a virtual explicit policy; no missing-policy default, area match, real-name mapping or bounding-box sweep.
2. Use the actual `furnishRoom` only against an isolated recorder, at most eight temporary box geometries. No second hall/world is built, no runtime kit method is mutated, and runtime materials are read-only.
3. Match the entire original primitive geometry type/name/userData, parameters, attributes/index including counts/typed arrays, groups/draw range, pose, ordinary mesh and rendering/shadow behavior. Check canonical owned material properties and identities.
4. Require unique geometry, BufferAttribute, typed-array and underlying-buffer references within the actual kit scene; require each exact collider once; reject a collider borrowed as support. Verify the complete original room, including its prior cover and spawn values.
5. Prepare evidence first, validate writable metadata and spliceable arrays, reject custom primitive lifecycle hooks, then remove. Dispose exclusively owned removed geometry after the scene, collider and evidence updates. Shared materials are never disposed.

Call only after the existing hall/facade builders finish and before `kit.finish()` or any rendering. A custom listener/render mutation or unexpected data drift is rejected, not silently cleaned up. No full-hall mesh-count guard prevents independent facade/window additions.

## Owner integration contract

Import `validateEastUnknownAnnexInventoryPolicy` and `applyEastUnknownAnnexInventory` from the new helper.

For the exact 24 indices create a context whose item is a shallow copy of the unchanged declaration with:

`furnishingPolicy: { mode: 'unknown-inventory', target: 'east-six/items/N', scope: 'r62-east-24-unnamed-annex-furnish-room-only' }`

Validate it before construction; pass the original item, not that policy, into existing builders. After the dedicated builder/window/nameboard work, call `applyEastUnknownAnnexInventory(kit, context, built)`. Include early returns for Jingyang rear (38) and Fengxian rear (54). Do not overlap the separate five-throne helper.

Both actual peer constructors were tested: Jingyang rear keeps five bays and `jingyang-rear-facade`; Fengxian rear keeps nine bays and `east-six/fengxian-rear`. Their exact unmodified architecture and navigation remain. The helper updates obsolete `EXISTING_GENERIC...` interior labels to accurate unknown-inventory/withheld status. R61 and R62 bay variants retain the same original source declarations.

## Verification

Final focused run: **282 passed, 0 failed, 0 skipped** (`final-focused.tap`).

- Every target uses the actual production constructor.
- 192 real-controller old/new original-entrance runs: all 24 × 10/60 Hz × W/S × walk/sprint. Exact traces match, starts at feet 0, no rescue/fabricated support (`controller.json`).
- Real peer R62 38/54 facade constructors: 19 checks, including before/after facade preservation, 16 real-controller routes, and mixed 24-hall consumer, raw and merged.
- Negative coverage includes wrong/missing declaration/identity/policy, duplicate/missing/damaged geometry/attributes/counts, material changes, borrowed resources, room/cover/spawn changes, duplicate/stale collider, frozen destinations, lifecycle exceptions, and SkinnedMesh substitution. Failures preserve the existing scene and registrations.
- Positive controls permit independent facade geometry/COL additions and multiple actual halls sharing one kit/global room IDs.
- Existing-W consumer verifies all 24 separately: 2,016 generic triangles and 168 colliders absent, 48 floor triangles retained, floor supports retained, exact room evidence/kind/doors/spawns and cleared cover. Ghost geometry is detected even with another material. Ghost COL/missing floor/wrong evidence are rejected. Both pre-merge and merged meshes are checked.
- Registry-only evidence: 108 actors, 21 in east-six, zero east-six seats. Six east-six anchors resolve to source items 50/9/16/2/30/37, none of these 24; surface/path/actor references agree. This does not substitute for instantiated full-world character checks (`registry-evidence.json`).

Consumer API: `assertEastUnknownAnnexInventoryInWorld(W)` from `tests/lib/r62-east-unknown-annex-world-check.mjs`. It accepts an already-built `W.scene`, `W.cm`, `W.rooms`; it never builds a scene, repairs collisions or rebinds actors. Geometry maps are function-local and only aggregate counts/status are returned, allowing the caller to release them between QA groups.

Run focused checks after owner integration:

`node --test --test-reporter=tap tests/r62-east-unknown-annex*.test.mjs`

On the standalone R61 worktree the two new facade modules are not present. The recorded run supplied `R62_JINGYANG_ROOT` and `R62_FENGXIAN_ROOT` pointing at their actual peer worktrees; after integration the test loads those modules locally. Missing modules are explicitly skipped rather than imitated.

## Preserved red evidence and limits

Log lines have trailing whitespace normalized; test names, results and diagnostic content are preserved. The red-first logs cover missing implementation/consumer, merged evidence loss, render state, atomicity/counts, lifecycle hooks and identity guards. Independent read-only review found these concrete issues, they received regression cases, and the final scoped re-review passed (`review.md`).

An additional **50 old bounded local tests had 47 passes and 3 pre-existing R48 Chonghua failures** (`related-local-regression.tap`):

1. `R48 Chonghua fitted baoxia roof does not extend inside its retained main hall`: roof enters main hall to -3.85558154582975.
2. `R48 Chonghua every clipped auxiliary-roof edge vertex contacts a real retained wall or beam`: expected .01–.101 contact distance fails.
3. `R48 Chonghua fitted auxiliary roof has outward roof/underside faces and closed raised gables`: missing expected closed gable wall.

These tests execute the unchanged R61 `RemainingResidentialHalls`/`CourtKit` code; this new opt-in helper is not imported or called on those paths. The failing source/test files have no diff from R61. They are recorded rather than relabeled green or repaired outside this scope.

No whole-world/current-state suite, production build, browser/native visual review, upload, merge or Pages publication was run by this worker. Owner integration and the actual 108-character full-world acceptance remain pending. This is bounded unsupported-furniture removal, not interior or complete E-zone acceptance.
