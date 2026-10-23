# R58-A fourth internal batch

This is a cumulative functional checkpoint, not a complete A37 release or browser acceptance.

## Three bounded implemented differences

- Taihemen: 14 inward half-knees in seven existing south open bays, from its own source photos. All 40 column positions, roof, inner leaves, north side and navigation remain unchanged. Add 1,008 triangles and one merged material mesh. Full four-depth framing and fine decoration remain unresolved.
- Hongyi Pavilion: six lower groups become twelve independently framed leaves. Existing noncentral bar positions are retained. Add 1,068 triangles, with no added draw/material. Rear/upper windows and lattice motif are not thereby photographically accepted.
- Xiehe Gate: six courtyard-side knees use its own visible contour, not copied Xihe detail. Add 432 triangles. Outward-side coverage and fine carving remain pending. Navigation is unchanged.

The owner inspected the independent source images and actual component CPU views. These are simplified diagnostic renderings, not browser screenshots or proof of final material quality. The Zhonghe near interior post pair was separately investigated; existence is source-supported but plan/beam registration is still BLOCKED_SOURCE. No speculative posts or beams were added.

## Cumulative world proof

Validated source commit: `c9a82aaa8316954e80a03aa934cd8e745065322e`.
The 216-file source manifest is archived at `data/characters/world-source-freeze-r58-a-batch4.json`. Before/after source hashes match exactly. One actual merged world contains 25,019 colliders and 1,125 supports, equal to the preceding batch.

The three new world consumers inspect submitted merged geometry, retained openings and actual support/collision. Forty additional real-controller route cases cover five approach/portal routes at 10/60 Hz, walk/sprint and W/S. Twelve actual controller jump cases check all six Xiehe knees at both frame rates. All pass. The 36 owner focused tests pass separately; route cases are not miscounted as separate full-product tests.

All prior batch1–3 checks remain in the same world, including 64 gallery entrance cases. All 108 logical identities are freshly bound and individually inspected in B and after actual Yangxin, Kunning and Huangji S loading. The 401 view records do not mean 401 people or 108 simultaneously displayed people. Twenty-four paths complete two cycles; six zone unload/reload generations, cold entry, controls and high64/low32/near2 caps remain verified. No character data, Kit, route or capacity change is part of this batch.

Command:

    node --expose-gc --max-old-space-size=1024 --test --test-reporter=tap --test-concurrency=1 tests/r58-a-batch4-world.test.mjs

Exit 0, wall 248.36 seconds, child peak RSS 1,658,308 KiB (about 1.58 GiB). Controlled collection is QA-only and preserves all assertions; it is not a browser/game memory or frame-performance result. Full memory checkpoints are retained in the final gzip report. The regenerable intermediate progress dump is not duplicated here.

## Evidence and limits

`one-world-validation.json.gz` is the reversible complete report; `SUMMARY.json` records hashes and resources. `staff-proof.json.gz` retains the actual-role proof with original raw-byte SHA in its adjacent manifest. No original historical count/hash failures or earlier resource-interrupted runs were erased or relabeled as passes. No production build, package, upload or deployment was made at this checkpoint. Browser same-camera comparisons, GPU timing, phone checks and whole-building/A37 acceptance remain open.
