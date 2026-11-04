# Chongjing call-local triangle scratch

Public comparison base: d4c40891e8082038d949b69aa94651a5a1478fee (tree 6f16aca60ac3e037aa77d8ec4d4344016a149b11). The frozen filename retains the historical local 97af label; its bytes are verified against the public d4c4 object, so that local object is not required. Cumulative Xiefang is retained on both sides of zone equivalence; the source guard removes only its exact three ZoneBase lines before public-base equality. Only runtime change is the exact hash-pinned ChongjingHall.js, which reuses mesh-local Triangle/Vector3 scratch in its two private conversion loops. Source indices, triangle order, matrix transforms, Float32 rounding, 1e-12 area threshold, vertex/normal/UV payloads and collision construction are retained. No geometry cache, changed collision registration, async load, queue/caching policy or lower detail is introduced.

Run allocation, exact payload, isolated repeated-build, injected-fault and source-guard tests:

    node --test --test-concurrency=1 tests/r165-chongjing-allocation/{allocation,equivalence,lifecycle,source}.test.mjs

Actual production west-six equality and existing real-controller routes, serially:

    node --expose-gc --test --test-concurrency=1 tests/r165-chongjing-allocation/production-zone.test.mjs

Optional CHONGJING_ALLOCATION_EVIDENCE_DIR points to an existing output directory. Checks compare full merged visual/physical/metadata/roof payloads, collision queries, routes and repeated collider registration. This is not full World, GPU, browser or mobile testing.

Reproduce component sampling without simultaneous heavy work:

    node tests/r165-chongjing-allocation/benchmark.mjs

CHONGJING_ALLOCATION_BENCH_OUTPUT optionally writes JSON. Two warmup pairs, then twelve alternating AB/BA pairs. Standard median averages the two central values for even sample counts. Timing excludes material-library setup, snapshot comparisons and disposal. Passing --expose-gc deliberately forces GC before every timed build and is a separate measurement regime. The tests assert identical outputs every sample, but host noise and runtime optimization remain limitations. Do not use component timings as claims about whole-zone pauses, FPS, memory peaks, Mac temperature or crash resolution.

Red evidence: old source used 39,763 separate Triangle objects for 39,763 getArea calls and 35,979 per-vertex rounding-map arrays. The new test failed before the source edit. New source keeps 39,763 area calls, uses 16,454 Triangle objects across the entire builder, and zero rounding-map arrays. Other builder work (especially canopy clipping and triangle support construction) still allocates.

The frozen old source is checked against its exact Git object. Historical guards normalize only the exact new source SHA back to exact frozen bytes; omitted optimization or arbitrary added/removed bytes are rejected. The new test also checks all other existing runtime/data bytes against the base. No arbitrary module exemption.

User's Chuxiu exception has not been reproduced. Failure summary and original console error/build identity are still needed to locate its root cause. This allocation reduction must not be described as a crash fix.

Optional whole-zone CPU sample (run serially in a quiet window):

    node --max-old-space-size=640 --expose-gc tests/r165-chongjing-allocation/benchmark-zone.mjs

CHONGJING_ZONE_BENCH_OUTPUT optionally writes JSON. This uses two warmup pairs and eight alternating AB/BA pairs, validating full zone geometry/physical/metadata snapshots every time. It excludes library creation, snapshot hashing and disposal. Explicit pre-sample GC and a shared cloud CPU are not a real device loading test.

Historical independent local samples: component median 115.227 → 91.934 ms; west-six median 785.10 → 782.76 ms (about 0.3%). These are inherited samples, not a fresh cumulative benchmark or reliable whole-zone improvement.
