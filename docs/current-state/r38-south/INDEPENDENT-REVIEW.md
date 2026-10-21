# R38 independent geometry, navigation and resource review

2026-10-21 05:44 UTC. Production reviewed at `fb9fe43` with docs-only successor `bd1fb50`. The independent reviewer edited only three new `tests/r38-independent-*` files, plus this external review. No production code, existing tests, shared helpers, branch publication, main or Pages changes were made by this reviewer.

## Result and boundary

Final focused independent run: **32/32 passed**, zero skipped/cancelled, exit 0, 6.145 seconds. The command was `node --test --test-concurrency=1 tests/r38-independent-*.test.mjs`. All 853 source/data/test file hashes in the final manifest checked unchanged after execution. These 32 tests are included, not additive, when the parent runs the aggregate suite.

This establishes actual Three.js geometry, material merging, collision, real FirstPersonControls and CPU resource-event behavior with simulated DOM/canvas boundaries. It does **not** establish WebGL appearance, GPU allocation/draw calls/FPS, native pointer-lock play, physical mobile operation, current museum admission or survey accuracy. No native-render acceptance was attempted by this reviewer; that availability investigation belongs to the parent.

The clean R36/R37 focused baseline at exact `de4b5567b390d18ff9c781fee7b52edbedc1ae48` passed **138/138**, exit 0, 43.195 seconds. Its source/data/test manifest remained unchanged. Existing R37 aggregate failures (10 direct-current and 217 historical/mixed) remain historical facts; this focused green result is not a claim the whole repository is green. The final aggregate classifications belong to the parent release report.

## Source versus fit

The reviewer read R37 README, final validation, independent review and the R38 source reports. Actual pixels were inspected for the official Taihemen front photo, Wenhua inner-approach photo, and both Wuying tree-side photos. Those images support distinct Taihemen flanking stairs around a broad central imperial stone and a small selected subset of trees in Wenhua/Wuying side courts. They do not support blanket planting in the central ceremonial courts.

Four Wenhua and two Wuying placements are explicitly a **partial representation, not a census**. Positions, diameters, heights, lean, canopy radii/colours and octagonal pit footprint dimensions are reversible model fits. Species and image capture dates remain unknown. Resource path dates are not capture dates. Wuying photographs visibly show low branching and needle clusters: the simple raised crown masses and cylinder trunks are a bounded silhouette approximation, not reconstructed botanical geometry. The source-visible curb height is not reproduced by the ground-level pit cues. These limitations must remain visible in delivery notes.

## Six-tree independent checks: 16 tests

- Full actual outer-east/outer-west zones are built and merged. Trunk rays at 0.2, 1.0, 1.7 and 2.5 m meet the rendered bark and lie inside actual transformed trunk AABBs. Whole trunk bounds exactly match collision solids; all trunk bases meet ground. Crown rays confirm the final merged foliage exists, and every crown stays above 3 m pedestrian height.
- No generic random scatter or new central-court registration exists. Exact R37 navigation digests remain unchanged after removing only four/two appended trunk boxes: all former colliders, walkables, rooms, map items and regions are retained. All existing room spawn footprints are free of the new trunk boxes.
- Real FlightEnvelope samples use final canopy triangles, not the trunk-only walking proxies. Downward helicopter movement stops above the actual crown, ground landing is refused under every sampled crown, and all declared landing disks remain clear of tree geometry. No canopy walkable or rescue support is added.
- Ground-start loops around every tree run through actual FirstPersonControls at 10/60 Hz and walk/sprint. One initial placement only; all sampled feet/support stay at ground and no rescue is used.
- Three full-zone rebuilds prove deterministic measured budgets, shared material use, fresh private materials, exact-once premerge and final geometry release, exact-once owned material release, and survival of borrowed TextureLibrary materials/textures. No instancing buffers or per-part mesh explosion remain: four additional merged materials/meshes in east and five in west including soil. Existing stone material is borrowed for pit outlines.

## Taihemen independent checks: 16 tests

- Actual full PALACE_LAYOUT plus actual axis-courts zone and unmodified CollisionManager walkables are tested. No rescue:false projection, collider removal, elevated spawn or controller substitution is used.
- Both flanks ascend, cross behind the existing facade column row, traverse north and return at 10/60 Hz, walk/sprint. One starting placement; no rescue; sampled stair support aligns with actual merged marble treads to within one tread rise. Additional center-courtyard starts physically detour to a flank rather than climbing the carved stone.
- Direct center ascent is blocked at both rates, remains near ground and does not invoke rescue. Downward rays see the actual raised imperial stone. Upward rays from below hit closed stair and imperial-body undersides. Visible sloped balustrade surfaces accompany the lateral collision barriers; all selected new collision boxes have finite ordered bounds.
- Retained southern courtyard and inside-column platform side points remain clear. This is not a claim that the additional lateral staircases visible in the wide source photo have been reconstructed.
- Exact R37 identity remains for **7,656 north-half Taihemen world-space triangles** and northern navigation. All **seven other complete PalaceBuilder roots** retain geometry/material-name/transform hashes: Wumen, Qianqingmen, Shenwumen, three-hall terrace/halls, inner-palace terrace/halls, central Jinshui and southern water/bridge system. This is a negative-dispatch guard against the local shared-builder flag affecting other gates/terraces.
- Reviewed `stepwalk.cjs` change only replaces the former straight Wumen-to-Taihemen line with actual flank contacts; endpoint and route identity remain. Its contact capture omits hall creation only to derive a profile, whereas these independent route tests include the actual hall and entire axis world. Original straight center traversal is intentionally invalid after the source-backed stone correction.

## Test development findings, not production defects

Initial independent tests had test-side issues: mixing lightweight-library texture baselines with real TextureLibrary counts, relying on source mesh names after a real merge, assuming marble rather than the existing balustrade material, and crossing the retained facade-column row too near the platform edge. These were corrected in the new tests only. The final route crosses 2.5 m behind the south edge, physically avoiding unchanged columns. No old assertion was weakened and no production fix was requested by this reviewer. Initial logs remain preserved separately rather than relabelled passing.

## Measured retained resource cost

Measured with the same lightweight material library on original R37 and final R38; complete roots, hidden retained meshes included. Bytes are CPU typed geometry-buffer bytes, not GPU memory.

| Scope | R37 meshes → R38 | Triangles R37 → R38 | Geometry bytes R37 → R38 | Materials R37 → R38 |
|---|---:|---:|---:|---:|
| Taihemen | 17 → 17 | 15,580 → 15,756 | 1,495,368 → 1,512,264 | 17 → 17 |
| Entire PalaceBuilder | 185 → 185 | 303,523 → 303,699 | 29,291,784 → 29,308,680 | 97 → 97 |
| Outer east | 30 → 34 | 36,732 → 40,412 | 3,526,272 → 3,879,552 | 30 → 34 |
| Outer west | 56 → 61 | 113,282 → 115,218 | 10,875,072 → 11,060,928 | 56 → 61 |
| Palace + both zones, shared resources deduplicated | 271 → 280 | 453,537 → 459,329 | 43,693,128 → 44,249,160 | 156 → 165 |

Combined increment: **9 meshes, 5,792 triangles, 556,032 geometry bytes and 9 materials**. Combined texture count remains 33 and instance-buffer bytes remain zero. Wenhua increment is 3,680 triangles/353,280 bytes; Wuying including pit cues is 1,936 triangles/185,856 bytes; Taihemen is 176 triangles/16,896 bytes with no additional merged mesh/material. No measured GPU performance conclusion follows.

## Exact evidence identities

Raw logs and budget JSON remain local; the hashes identify evidence without claiming logs were published.

- Baseline 138-test log SHA-256: `29ab8796178d715c712b35a7ef7d510c083f93bf09f2c8696d2b559043d36968`.
- Baseline source/data/test manifest SHA-256: `58f2f36ff6066719d383af94e4089d31cb23cc1a57339d224fb8be8b22e7f1a8`.
- Final 32-test log SHA-256: `08c9472b0a96f65a928738a27b333372ed3c13ed53214e33d339b94d57d87cf3`.
- Final 853-file source/data/test manifest SHA-256: `7af8358e484777f5cfcea701ffc3826935664f72e0aa6b28a030018ef22b7572`.
- Budget JSON SHA-256: `3e2885fc5b0616a8e651ecb32024139c99089bdaa72b62da5751daf7d341e326`.
- `tests/r38-independent-palace-baseline.json`: `7a92f0fb48449654278f98f9615cdefc408e781353490e07b038b6b31c9d588a`.
- `tests/r38-independent-taihemen-integration.test.mjs`: `1c782333aba0ce692fc25ebe549ec78287ed74b030d5345dd9aff6b42eafcad4`.
- `tests/r38-independent-tree-integration.test.mjs`: `64f8f528a90ff26f59fd06f15d629d5343bd3f471e710c72b258d970e924ae11`.
- TaihemenSouthApproach source: `1c46fd7c055f64cc3e2cedf5d651c1adbd3bb14ee337d9cf6240812845b9ad03`.
- SouthCourtTrees source: `a7f252952a2eb5d3aa83251e6828544d8cf73c81450e279ebfc008bd8f67f4e3`.
