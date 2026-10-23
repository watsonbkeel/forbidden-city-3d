# R62 E: five unsupported generic throne inventories

Base: `e2d448e`. Scope: `east-six/items/2,9,16,30,37` only. This change withholds unsupported generic placeholder geometry; it does not reconstruct a current display and does not establish historical empty halls.

## Delivered

- `src/scene/palace/special/EastUnknownThroneInventory.js` exports `validateEastUnknownThroneInventoryPolicy(context)` and `applyEastUnknownThroneInventory(kit, context, built)`.
- Exact original declaration, target, detached pre-merge frame, structure id, legacy room registration, four distinct role/part meshes, exclusive geometry ownership, actual vertex/normal/UV/index payload, legacy material and a single exact world collider must all validate before any source mutation.
- No broad bounding-box deletion. A collider is selected only by exact `Box3.equals` after full target validation. Missing, duplicate, drifted and transplanted inputs fail closed. Duplicate untagged same-shape pieces and geometry borrowed elsewhere in the kit also reject.
- Exactly 20 meshes (240 triangles) and five colliders are removed. Each removed geometry is disposed once; no borrowed material is disposed by the helper.
- All other geometry/materials, collider order/references, support surfaces, room navigation coordinates, doors, spawn points, map entries and regions remain unchanged.
- Original structure ids survive. `kit.finish().userData.architecture` includes `inventoryStatus: UNKNOWN`, `accepted: false`, `knownEmpty: false`, `roomUseStatus: UNVERIFIED` and `roomBoundaryStatus: UNVERIFIED`.
- Legacy `room.kind: throne` is retained only for navigation/actor compatibility. `candidateRoomUse: throne` and `legacyNavigationKindPreserved: true` explicitly prevent treating it as verified room function. This is not a historical empty-room assertion.

## Owner hookup: virtual policy, no data change

The owner selected explicit five-target virtual policy injection inside `ZoneBase.buildHall`, so existing data and strict facade builders can remain untouched.

1. Determine the original item index from `this.zoneJson.items.indexOf(item)`.
2. Only for `east-six` indices `[2, 9, 16, 30, 37]`, create a virtual item by adding:

```js
furnishingPolicy: {
  mode: 'unknown-inventory',
  target: `east-six/items/${itemIndex}`,
  scope: 'r62-east-five-generic-thrones-only',
}
```

3. Validate `{ zoneId: this.zoneJson.id, itemIndex, item: virtualItem }` BEFORE invoking the original builder. Strict full-item equality remains required; do not relax it or pass this virtual item through the existing Nansansuo guard / facade builders / `kit.hall`.
4. Let the original item travel through the original replacement/baseline/augmentation/nameboard path unchanged.
5. On every final return path, invoke `applyEastUnknownThroneInventory(this.kit, context, built)` once, after all original assembly and before `kit.finish()`. It returns the same `built` object.
6. A missing policy makes the helper a strict no-op. A present wrong policy throws. Do not catch and silently ignore a rejected present policy.

The test fixture directly invokes the real existing five bounded builders. It intentionally bypasses the owner's final `ZoneBase` hookup so baseline geometry remains available even after policy injection is integrated.

## Exact deletion envelope

Every row removes only platform, seat, back and screen meshes tagged `retained-throne-component`. All coordinates below are existing model-world coordinates, not surveyed historical coordinates.

| Item | Hall | Removed collider min | Removed collider max | Meshes before → after |
|---|---|---|---|---|
| 2 | 景仁宫 | -95.9, 0.6, 333.25 | -90.9, 3.6, 335.75 | 94 → 90 |
| 9 | 承乾宫 | -96.1, 0.6, 385.25 | -91.1, 3.6, 387.75 | 98 → 94 |
| 16 | 钟粹宫 | -95.9, 0.6, 437 | -90.9, 3.6, 439.5 | 169 → 165 |
| 30 | 永和宫 | -151.5, 0.6, 381.3 | -146.5, 3.6, 383.8 | 437 → 433 |
| 37 | 景阳宫 | -152, 0.6, 435.59999999999997 | -147, 3.6, 438.09999999999997 | 72 → 68 |

`local-geometry-hashes.json` records complete old/new mesh-set hashes, every retained mesh hash, each removed mesh hash and exact world extent, collider-set hashes, exact removed collider, unchanged support and room-navigation hashes. Counts above are this worktree's `e2d448e` baseline; later independent facade corrections may legitimately alter retained counts, not the four-piece deletion scope.

## Verification

Command:

```sh
node --test tests/r62-east-unknown-thrones.test.mjs tests/r62-east-unknown-throne-controller.test.mjs tests/r62-east-unknown-throne-world-consumer.test.mjs tests/r62-east-unknown-throne-nontarget.test.mjs
```

Result: 113 passed, 0 failed. See `all-local-tests.tap`.

- 42 exact-scope, metadata, resource-lifecycle, no-op and atomic rejection tests.
- 40 old/new actual controller round trips: 10/60 Hz × walk/sprint × W/S × five halls. Every old/new trace is identical; no rescue, identical 0.6 m floor access. Five additional former-seat collision/support checks. See `controller.json`.
- 24 unnamed halls independently built, with exact no-op snapshots and rejected transplanted policies; plus roster count check. No full zone/world was constructed. See `unnamed-controls.json`.
- One existing-W consumer test verifies raw and merged local five-hall scenes and negatives for ghost geometry with changed material, ghost collider, missing floor, missing room and false known-empty metadata.
- Red-first logs include missing helper, untagged duplicate and material/root guards. Intermediate failing implementation logs are not presented as final results.

## Existing-W assertion for owner integration

```js
import { assertEastUnknownThroneInventoryInWorld }
  from './tests/lib/r62-east-unknown-throne-world-check.mjs';
const report = assertEastUnknownThroneInventoryInWorld(W);
```

It consumes an already-built `W.scene`, `W.cm` and `W.rooms` and never constructs a world or changes architecture, colliders, actors, or material bindings. It verifies original structure records, candidate-room evidence and original navigation, absence of all 240 former-chair triangles regardless of material, absence of five exact colliders, and positive retained floor triangles/platform collision/support. It supports raw and merged production-style material provenance through the existing geometry-key helper. Quantization is 0.001 m for Float32 geometry comparison, not source measurement precision.

The consumer is intentionally not a complete facade or actor acceptance test. The owner must run full-world fresh character bind, including 景阳宫's existing front-hall attendant, and the normal integration/browser checks. No character data, building coordinates, room navigation bounds, other 24 unnamed rooms, shared builder, data file, main branch, upload or deployment was modified here. No `test:zones`, full-world build or browser was run.

## Explicit supersession, no historical-test rewriting

The five generic furniture retention expectations are now obsolete where they conflict with this narrowly scoped UNKNOWN-inventory policy. Existing R39 complete-hall frozen geometry/navigation assumptions and R40 retained-seat metadata / GAME_ACCESS seat-placement expectations remain unchanged, as do their fixtures. Their furniture-scope mismatches after the owner's hookup must be reported as explicitly superseded expectations, not silently patched or relabeled as green. Shared structural, floor, entry, map and navigation invariants remain required and are independently checked here.
