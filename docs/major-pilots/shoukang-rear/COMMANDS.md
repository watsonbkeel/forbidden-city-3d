# Reproduction (run from repository root)

Raw output destinations are outside the tracked tree. No broad report upload or build copy.

```sh
node --test tests/major-pilots/shoukang-rear.test.mjs
node --test scripts/major-pilots/shoukang-rear/world-routes.test.mjs
node --test scripts/major-pilots/shoukang-rear/roof-exit.test.mjs
node --test scripts/major-pilots/shoukang-rear/body-press.test.mjs
node scripts/major-pilots/shoukang-rear/cpu-assembly.mjs
node scripts/major-pilots/shoukang-rear/compile-memory.mjs
node --import ./scripts/major-pilots/shoukang-rear/preserve-shared-reports.mjs --test --test-concurrency=1 --test-reporter=spec tests/current-state/*.test.mjs
```

Parent source hook reads exact local frozen R155 `809537d21a02d1d22132900cc9b671b23a2d8221` ZoneBase, not remote trimmed identity. The new files are unreachable in that parent; do not load candidate-specific assertions expecting new meshes under parent hook. Existing parent full baseline is `../jingren-gate-20261030-evidence/full-candidate.txt`, 1331/1113/218 on that frozen runtime; preserve raw failures. First R156 invocation accidentally selected `tests/*.test.mjs` rather than `tests/current-state/*.test.mjs`; stopped, saved as `nonstandard-root-tests-incomplete.txt`, not a standard comparison or success.

World route old parent and early candidate ran gallery z254.9. Final script uses actual new clearance centre254.99, therefore original old-lane evidence and final-lane evidence must not be described as byte-identical. Full actor radius .5m is unchanged.

Run expensive full-world suites serially. CPU image is real geometry flat shading; compile uses `write:false` and excludes public asset copying, not a deployable or GPU/HTTP result.
