# R63-F: withhold unverified generic furnishing in 13 existing west annex declarations

Baseline: `f87342d7e1506713df4a6877943eb377e8299593` (frozen R62). This is a bounded inventory-uncertainty correction, not reconstructed interiors or F-section acceptance.

## Result and scope

Exactly `west-six/items/3,9,10,16,17,25,26,32,33,41,42,48,49` are eligible. Item 3 originally calls generic `furnishRoom` as `hall`, creating 8 mesh primitives, 8 dedicated colliders and 2 cover points. Each other item calls it as `room`, creating 6 primitives, 6 colliders and 1 cover point. Total withholding: **80 meshes, 80 own colliders, 14 cover points**. The cushion and gold table trim have their own colliders and are included, not silently left as ghost collision.

The independent source/runtime audit confirms that all 13 source declarations are unnamed and their associated AUX records have no source evidence or named-entity binding. This describes missing available project inventory evidence, not proof that no external sources exist. Candidate mappings to named side halls are not promoted. None is called a verified historical room or an empty historical interior.

Excluded: all named source-backed front/rear interior builders, including 丽景轩 /24, 同道堂 /47, 永寿前殿 /7 and rear /8, 太极殿 /30, 体和殿 /15, 体元殿 /31, 储秀宫 /23, 翊坤宫 /14, 长春宫 /39, 怡情书史 /40, 咸福宫 /46 and 养心殿. No furniture from these is removed. No shared builder, default, zone data, canonical manifest, actor registry or existing E helper is edited.

## Production implementation

`src/scene/palace/special/WestUnknownAnnexInventory.js` is deliberately a scoped copy of the independently validated E helper, not a global refactor.

- Exact frozen declaration equality and explicit virtual policy are required. Missing policy is a byte-preserving no-op; wrong zone/index/target/scope/declaration fails closed.
- The helper replays only the tiny original furnishing preset into an isolated recorder with read-only material references, not a second hall or world.
- It validates every original primitive's complete geometry attributes/index/groups/draw range, local pose, rendering state, source-free metadata, material identity and rendering properties.
- Removal requires unique direct-frame ownership, exclusive geometries and every vertex/index backing resource. Borrowed geometry or buffer resources fail closed.
- Every exact world collider must exist uniquely and may not also be a floor support. The sole matching navigation room must preserve original global ID, kind, unnamed status, bounds, floor, doors, cover and spawns before the transaction.
- Every write target and lifecycle hook is validated before mutation. Custom removed/disposal callbacks, readonly records/arrays, duplicate frames, corrupted registries or changed evidence cannot produce partial deletion.
- Only validated primitives and their exact colliders/cover are removed. No bounding-box sweep or material-name cleanup is used. Unrelated overlapping geometry, architecture, windows, roof, floor, all retained colliders, walkables, maps, room IDs, bounds, doors and spawns remain exact.
- Removed exclusive geometries are disposed once. Shared materials remain owned by the original kit and are disposed only by its ordinary lifecycle.

Result metadata explicitly states `inventoryStatus: UNKNOWN`, `knownEmpty: false`, `accepted: false`, `presetUseStatus: UNVERIFIED`, and `roomBoundsStatus: NOT_VALIDATED`. The frame ID and `inventoryBinding` are the exact declaration target, e.g. `west-six/items/3`, not an invented hall identity. Old navigation kinds remain but are expressly not accepted as room usage evidence.

## Required integration hook (owned by integration parent)

Import `validateWestUnknownAnnexInventoryPolicy` and `applyWestUnknownAnnexInventory` in ZoneBase. In `buildHall`, use only zone `west-six` and exact indices `[3,9,10,16,17,25,26,32,33,41,42,48,49]` to make this temporary context:

```js
{
  zoneId: this.zoneJson.id,
  itemIndex,
  item: {
    ...item,
    furnishingPolicy: {
      mode: 'unknown-inventory',
      target: `west-six/items/${itemIndex}`,
      scope: 'r63-west-13-unnamed-annex-furnish-room-only',
    },
  },
}
```

Validate this before dispatch. Build the original `item` normally, then apply the helper to the resulting `built` record in the local finish path before `kit.finish()`. Do not add the virtual policy to source JSON or pass it into the shared generic hall builder. Other East policies and defaults remain unchanged.

## Independent evidence and tests

- `tests/fixtures/r63-west-annex-independent-audit.json`: frozen independent actual production furnish-boundary capture, including original primitive dimensions/materials, dedicated world collisions, original room registrations, source gaps and retained-shell hashes. No reference photographs are included.
- `r63-west-unknown-annex-provenance.test.mjs`: calls actual `ZoneBase.buildHall`, instruments the real `kit.furnish` boundary, and independently matches all 13 generic outputs and retained-shell hashes. It remains valid after the parent hook removes the captured objects.
- `r63-west-unknown-annex.test.mjs`: all 13 exact before/after geometry and registration comparisons, 64 mutation/readonly/lifecycle rejection cases, preserved overlapping details, global room-ID behavior, no-op policy behavior and resource disposal.
- `r63-west-unknown-annex-controller.test.mjs`: **104** actual controller round-trip entry/exit scenarios, all 13 halls × 10/60 Hz × W/S × walk/sprint. Before/after frame traces are identical, begin at ground, reach original 0.45 m floors and use no rescue/unverified ground support.
- `r63-west-unknown-annex-registry.test.mjs`: read-only proof that all 27 west-zone actors, 12 paths, surfaces and the named Chuxiu seat bind outside these 13 anonymous declarations. All 108 actors remain in original data. This is not live whole-world character validation.

## Existing-world consumer

Use `assertWestUnknownAnnexInventoryInWorld(W)` from `tests/lib/r63-west-unknown-annex-world-check.mjs` against the **already built** world. It never constructs a hall/world, creates actors, repairs collisions or rebinds characters. It checks:

- 13 unique exact declaration metadata and navigation bindings;
- absent 80 unsupported meshes' triangles and all 80 own collider shapes;
- all **17,272 retained architecture triangles**, including 26 floor triangles;
- all **175 retained structural colliders** and 13 floor supports;
- exact retained room fields, unknown evidence and 14 removed cover entries.

For owner controller validation, use the pure `westUnknownAnnexEntryPoints(room)` export: the exact same three-point round trip tested at all 104 local modes, 3 m outside → 2.2 m inside → 3 m outside along the retained door-to-center normal. This automatically handles both rotated side-hall orientations.

The immutable gzip contract is committed, SHA256-checked on reading and deeply frozen. SHA256: `e3aaf5d00785ca7580a2a77a3d866e899e53f3af3dbd1fda3073b5673a812d37`. The explicit generator is test-only and not imported by the consumer. Raw and material-merged local 13-hall scenes both pass. Mutating ghost geometry/COL, hiding floor geometry, deleting rooms or changing known-empty evidence fails. A readonly-registration/resource test confirms that diagnostics do not alter the supplied world.

## Executed verification

- `node --test tests/r63-west-unknown-annex*.test.mjs`: **204 passed, 0 failed, 0 skipped**.
- `node --test tests/r62-east-unknown-annex*.test.mjs tests/r62-east-unknown-throne*.test.mjs`: **395 passed, 0 failed, 0 skipped**, retaining E behavior. Any regenerated preexisting report files were restored and are not in this change.
- `npm run build`: passed, with the existing Vite large-chunk advisory. This independent branch intentionally does not own the ZoneBase integration hook, so the parent must rerun its integrated build.
- Deliberate red tests for missing helper and missing existing-world consumer were captured before implementation. Extra mutation coverage exposed only a test-cleanup disposal callback issue, corrected before the final green run.

No full-world build, browser rendering/visual acceptance, texture fidelity claim or 108-character instantiation was executed here, as required by scope. Parent owns the integration hook, actual full-world consumer call, consolidated runtime/character checks, browser evidence and canonical release status. A passing bounded change does not mark any of the F55 interiors or entire F section complete.
