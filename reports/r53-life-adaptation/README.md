# R53 shared-system proof adaptation

Small test/helper-only follow-up to candidate commit `0bc12fc8a9bc269b266da596aae41a6b2d20665c`. No production, fragment, Kit, architecture, old tests or frozen `reports/r53-life-candidates` evidence bytes changed. That directory and its artifact manifest remain evidence of the original candidate commit; helper hashes in its manifest are historical hashes, not hashes of these revised helpers.

## Integration API

Call `proveR53LifeCandidates(W, {externalSystem: system, externalObserver: observer, worldState: 'integrated-r53', out: 'reports/<new-integrated-proof-folder>', geometryOut: '/tmp/<new-integrated-geometry-folder>'})`.

- The supplied real CharacterSystem, its perspective camera and observer are reused. Scene, collision manager, ZoneManager, renderer root, manager/world registries and all77 actor-state records must match W and the composed registry.
- Each actual render invocation is checked against that observer's captured submissions. A stale/foreign observer cannot pass using unrelated ready/submitted actors.
- Caller-owned System and observer are never disposed, including error exits. Temporary observer wrapping is removed; original preparation budget is restored. The proof still intentionally advances time, moves the camera, tests Off/On and unload/reloads both affected zones.
- Without `externalSystem`, the helper creates and disposes its own System. Without `externalObserver`, it creates and disposes only its own observer. Supplying an observer without a System is rejected.
- `worldState` is required. A `frozen-r52` declaration additionally requires all202 source fingerprints to match the retained frozen proof. Integrated worlds cannot receive that label merely by using the old standalone runner.
- Omitted output paths are unique per invocation under `reports/r53-life-revalidation` and `/tmp/r53-life-revalidation-geometry`. Both output parameters are checked against both frozen roots, including resolved symlink ancestry. Explicit destinations are caller-selected and should be new.
- 71-candidate and 77-integrated registries are accepted only with the exact first71 canonical hash. Composing an already integrated77 registry is idempotent, and conflicting candidate records still fail. Original coverage assertions remain.

For final CPU renders use `python tests/lib/r53-life-raster.py <export.json.gz> <output.png> --world-label 'actual integrated-R53 scene'`. Omitting that option preserves the original frozen-R52 caption. The chosen label is also written to raster metadata. These are CPU geometry diagnostics, not browser/GPU images.

## Verification

`focused-tests.log`: 21 passed, 0 failed, including original targeted R52 coverage, original support contracts, strict71/77/idempotent composition, ownership/error exits, wrong world/records/observer rejection, protected paths, source-label protection and default/explicit raster caption tests.

The new tests initially failed before the helper existed and on an unguarded altered frozen71 record. Review then found a cross-swapped output-root loophole; its negative test failed before the guard was expanded to protect both roots for both parameters. Both red outputs are retained compressed here.

No full-world construction, route playback, aggregate, browser or GPU run was performed for this follow-up. The empty CPU-caption fixture is intentionally rejected for zero character pixels and is only a lightweight parser/metadata test. The owner must run final integrated-R53 evidence using the shared real world/System.
