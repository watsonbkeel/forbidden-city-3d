# Dafotang wooden pagodas: R256 WIP

This is an additive historical-scene model fit, not a formal release candidate or reconstruction of the current museum display. The production hall entry calls `buildDafotangWoodPagodas` once, after Weituo and before photo registration. Existing triad, guardians, photo registry, UNKNOWN inventory, rooms and walkable surfaces are retained.

## Evidence and omissions

Wang Jiapeng, *慈宁宫大佛堂调查记* (2015), printed p.304, fig.16 and accompanying text: two zitan carved-wood nine-storey towers, approximately over five metres tall, square bases, octagonal pavilion-style bodies with niches on each face, symmetrically before the guardians. The text says they were added after Qianlong 23. They do not inherit the Yuan-inspired three-Buddha design. Fig.16 identifies the photographed tower as now in Luoyang Museum.

Source: https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf

Nine actual tiers and eight shallow recessed bays per tier are modeled. Height 5.2 m, centres (±2.83,0.9,2.4), all tier widths, depths, positioning, dark wood colours, simplified base, top and unseen rear are MODEL_FIT, not measurements. The textual count of 120 carved images is not distributed per face or tier. Those images, ornamental relief and detailed railings are unmodeled; omission does not mean the historical niches were empty. No source photographs are embedded as textures.

## Limited checks completed

The portable component test passed 6/6 cases: actual nine-tier/eight-sided geometry and square bases; finite outward closed triangles and extents; independent geometry and actual triangle collision owners; component-only material merging; synthetic-host rejection, duplicate refusal and atomic rollback; partial construction cleanup; static unique entry order. Both towers total 228 meshes and 4336 triangles. Combined hall-local bounds are [-3.53,0.9,1.7] to [3.53,6.1,3.1].

From repository root, with installed dependencies and a Node version supporting the flags:

```sh
node --max-old-space-size=128 --max-semi-space-size=8 --test --test-isolation=none --test-concurrency=1 tests/current-state/dafotang-wood-pagodas.test.mjs
```

Three separately generated CPU triangle diagnostics were inspected against fig.16: front/side 120×240 and top 80×80. They show the complete tiered outline, recessed fronts and square/octagonal structure. The fitted base is much simpler than the layered source plinth; the top is a plain tapered substitute, not the photographed finial. Identical regular tiers, sparse framing and quantized dark colours omit the source's rich carving, varied contours and fine details. These are low-resolution authoring diagnostics, not GPU screenshots or historical visual acceptance.

## Still unverified

The earlier R255 real single-hall run stopped at the 192 MiB sampled RSS threshold. That limitation remains unresolved; R256 did not rerun the real hall, World, full test suite, browser/GPU or production build. Synthetic installer fixtures are not evidence of real-host runtime success. Component-only merge is not whole-court batching, and its rendered vertices were not compared individually before and after merging. Full-host collisions, actual scene lighting and visual integration still need validation before promotion. The existing formal release boundary is unchanged.
