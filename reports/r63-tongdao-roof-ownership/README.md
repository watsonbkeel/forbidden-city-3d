# Tongdao roof disposal ownership preflight

Successor to a14d1ff66d968ed66286051718ac2f184ce21737. Original roof reports, CPU images, frozen tests and the integration hookup are unchanged.

## Verified gap

The predecessor accepted another kit child using an original roof-tile geometry and then disposed that still-borrowed geometry. The old uniqueness check covered only geometry references inside the roof group.

## Minimal fix

Seventeen production lines add a preflight before replacement construction, adoption, detachment, metadata changes or disposal. Every geometry scheduled for retirement must be owned exclusively by its source mesh throughout the attached kit root. The check includes geometry identity, vertex/index/morph attributes, interleaved data, typed arrays and backing ArrayBuffer identity. Hidden, nested and non-mesh geometry consumers are included. A distinct clone with independent payload remains valid.

This is fail-closed validation only. It neither repairs nor removes the borrowing object. It does not change valid roof geometry, materials, metadata, rooms, collisions, walkables, facade or actors. The retained bearing band is not retired; it is nevertheless scanned as a potential borrower of a retired payload. Unknown references outside the attached kit root are outside this observable scope.

## Targeted evidence

- red.txt: eight borrowing regressions fail before the fix; independent-copy control passes.
- green.txt: all nine tests pass after the fix. Rejections preserve exact geometry/material fingerprints, physics, child arrays, metadata and owned materials, with zero original geometry disposal events.
- Negative variants cover same geometry, same attribute, same typed array, a new view on the same ArrayBuffer, interleaved payload, index payload, morph payload, and a hidden nested LineSegments consumer.
- The successful output exactly matches the frozen predecessor signature c20c4e54f6a662a8f561d0b7380112201cf2186452acb1d12a1ebc00cfcdb9b1 (six roof meshes).
- bounded-regression.txt: five existing local geometry/retention/identity cases pass.

No full suite, build, final-merge/world consumer, browser or rendering run was performed for this successor. The original red aggregate logs are retained unchanged and are not acceptance evidence.

Run only:

node --test tests/current-state/r63-tongdao-roof-ownership.test.mjs

node --test --test-name-pattern='actual Tongdao builder|all lower meshes|all submitted replacement|off-target index|changed identity' tests/current-state/r63-tongdao-roof.test.mjs
