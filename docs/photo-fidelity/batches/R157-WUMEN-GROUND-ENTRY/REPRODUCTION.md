# Reproduction (repository root, Node24)

Serial only; preserve outputs in a NEW directory. `CONTACT_PROBE_RESULT` uses create-only writes, so never reuse a result filename.

```sh
mkdir /tmp/unique-wumen-ground-run
CONTACT_PROBE_RESULT=/tmp/unique-wumen-ground-run/positive.json node --max-old-space-size=768 --test --test-reporter=tap --test-concurrency=1 tests/photo-fidelity/batches/wumen-joint-layout/*.test.mjs > /tmp/unique-wumen-ground-run/local.tap 2>&1
# Frozen candidate:179/179, including16 actual ground routes and920-record A/B.
node --max-old-space-size=768 --test --test-reporter=tap --test-concurrency=1 tests/r157-small-descent-triangle.test.mjs tests/r87-triangle-support.test.mjs tests/r87-collision-dispatch.test.mjs tests/r65-character-bodies.test.mjs tests/r65-mutual-character-interaction.test.mjs tests/r81-water-collision.test.mjs
```

The archived `task4/legacy-55.resource.json` preserves the exact executed six-file command and resource result.

For each `MODE` in `missing-ground-body`, `wrong-ground-name`, `missing-neck`:
```sh
WUMEN_GROUND_ENTRY_NEGATIVE="$MODE" CONTACT_PROBE_RESULT="/tmp/unique-wumen-ground-run/$MODE.json" node --max-old-space-size=768 --test --test-reporter=tap --test-concurrency=1 '--test-name-pattern=east up 10Hz walk$' tests/photo-fidelity/batches/wumen-joint-layout/ground-entry-player.test.mjs
```
Expected exit1 with one actual failed selected test (no skipped records). First two fail source authentication in the real controller chain; neck removal fails the final arrived assertion. Do not convert expected red to a pass by modifying assertions. Read exact `.resource.json` records for executed commands/environment. Earlier RED command bindings marked POST_HOC are not contemporaneous resource measurements.

Full source/QA hashes and the exact archive index are separate from test execution. An inventory checksum is not proof every historical test can execute. Full World/build/GPU gates are unrun for this successor.
