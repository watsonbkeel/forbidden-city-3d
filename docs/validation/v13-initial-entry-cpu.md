# V13 initial-entry position candidate: CPU evidence only

Status: isolated candidate, not browser-accepted, built, pushed, or deployed.

## Scope and identity

- Base: `c07465b2f3c28194d21838aa80a42bc6d667f608` (local V10 documentation baseline).
- Branch: `experiment/r3-v13-full-wumen-entry`.
- Exactly one candidate: `INITIAL_VIEW_POSITION = { x: 0, y: 1.7, z: -494 }`.
- Move the initial eye 24 m south from the legacy `(0, 1.7, -470)` benchmark anchor. The new point is 74.4 m south of the existing Wumen model anchor `z=-419.6`.
- Production change: one small configuration module and four exact `main.js` hunks: import the separate position, use it when initializing zone streaming and controls, and set the camera position when creating the camera. The existing control `lookAt(0, LAYOUT.WUMEN_Z)` remains byte-exact.
- No FOV, pitch, scale, geometry, ground, bounds, collision, movement physics, materials, lighting, sky, rendering, public debug controls, dependencies, or framework changes.
- `LAYOUT.START_POSITION` remains `(0, 1.7, -470)`. `src/config/constants.js`, `tests/perf.cjs`, `tests/shot.cjs`, and every historical fixture remain byte-exact. No snapshot was regenerated.

Source identities (SHA-256):

- Candidate `main.js`: `7522d4fc19bc38f712aad2e3fa9523c8cb88c4b41e1c79a9e9a786235bd7dd5a`.
- Candidate `src/config/initialView.js`: `5d6f394e4fed0886aed2a8b96f8a8bbc1027748e23ed3ff8548139bfce686aeb`.
- Original/restored V10 `main.js`: `906a9ee7c4446c92c7ee0d4d0fe920b162edf83814b8ff8d80ef16a0a1726932`.
- Unchanged `src/config/constants.js`: `464eabc753a393b325c17de3a7ee1e49dc746d9fdf95ef8f7e1ed5a5c1efe439`.
- Unchanged `tests/perf.cjs`: `0921cc93e20109e1a220bcbd9b05adc6f41a30b91c25233f999f1ddbd9770bd7`.

## Visual rationale, bounded by the evidence

The supplied [Palace Museum south-facing Wumen photograph](https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0aaffe2cc85.jpg) shows the complete central roof framed by both wings. The two closest southern pavilions extend beyond the image edges. The inspected image has SHA-256 `3435e4fde7a7f4a9e05e27ec35e1a806130ff4109c568b1b1c7973dd429fb67f` and dimensions 800 × 533. Its upload path does not establish the camera's surveyed location or capture date.

This candidate is a chosen game viewpoint on existing ground. It is not a surveyed photographer position, photo calibration, or evidence that the model's retained heights/proportions are accurate.

CPU projection used the actual built central Wumen roof, placed at its actual world anchor, with unchanged 70° vertical FOV, 1.7 m eye height, horizontal north orientation, and a 16:9 aspect ratio. It projected all 38,892 roof vertices, without renderer or browser:

| Viewpoint | Maximum roof NDC y | Maximum absolute NDC x | Central roof clipped? |
| --- | ---: | ---: | --- |
| Legacy z=-470 | 1.1583622771 | 0.8401218244 | Yes |
| Candidate z=-494 | 0.7803053225 | 0.4876370450 | No |

NDC ±1 is the frame edge. The candidate leaves about 79 px above the highest projected roof vertex at 1280 × 720. This proves geometric frame containment only, not rendered visual quality or absence of UI occlusion. CPU inspection also found more of each wing inside the frame; the nearest southern pavilions still extend past the sides. The candidate does not claim to fit the entire Wumen ensemble into every viewport.

With the same vertical FOV, narrow portrait screens can still crop the central roof horizontally. No alternate portrait position or FOV adjustment is included.

## Ground and movement verification

- Existing collision boundary is still `x=[-400,400], z=[-500,560]`.
- The initial body with radius 0.5 m has 5.5 m clearance from the south boundary; moving farther south eventually encounters the existing boundary.
- Real full-world collision/support lookup gives logical ground height 0, no river overlap, no body collision, and no head-box overlap at the candidate.
- Downward raycast hits the existing decorative stone road at y=0.01 and the existing ground-brick mesh at y=0. Neither ground mesh was changed or added.
- Real `getValidPosition` traversal reaches the complete 54 m northward approach to `(0,-440)` at ground height 0. Additional samples check the route every 0.25 m.
- Real `FirstPersonControls` also completes this approach at 10 and 60 Hz, walking and sprinting. Its unbobbed eye stays at 1.7 m and its logical feet/ground stay at 0, with no collision or airborne state.
- CPU execution of the exact production camera/control initialization statements verifies the shared position, unchanged FOV 70, near/far planes 0.1/2500, and horizontal north-facing final orientation. Zone initialization consumes the same coordinates before control initialization.

## Benchmark and source guard preservation

The six original performance point/yaw tuples are read from the unchanged production harness's `loadPoints` function, without starting its browser:

1. 午门前: `(0,-470)`, yaw 0
2. 太和殿前: `(0,-74)`, yaw 0
3. 乾清门: `(0,195.3)`, yaw 0
4. 东六宫中: `(-120.8,382.6)`, yaw 0
5. 宁寿宫: `(-293.2,164.1)`, yaw 0
6. 御花园: `(0,433.7)`, yaw 0

The new test-only restoration helper reverses only four complete, exact `main.js` replacements, each required exactly once, before the existing historical V7/V9 comparisons. A separate guard requires the restored file to equal the exact original V10 hash. Mutation tests reject omitted/deleted/duplicated replacements and unrelated changes to FOV, far plane, orientation, sky initialization, renderer quality, and whitespace. Historical fixture hashes and contents are not refreshed.

## Verification results

Performed on 2026-10-15 using Node v24.19.0:

- Before edits: `node --test --test-concurrency=2 tests/*.test.mjs tests/current-state/*.test.mjs`: 963/963 passed.
- Red phase: the new behavioral checks reproduced the missing separate viewpoint, inconsistent initialization, and clipped roof before production edits. The original benchmark tuple/hash check passed.
- Focused candidate and inherited source guards: 69/69 passed.
- Full candidate CPU suite, same command: 993/993 passed, zero skipped.
- `node --check main.js` and `node --check src/config/initialView.js`: passed.
- `npm run test:zones`: 0 errors, 23 warnings. The baseline has the same warning count.
- `npm run test:anchors`: fails on the inherited 神武门 anchor discrepancy, 11 m against a 5 m tolerance (113 comparisons, one outlier). The direct anchor-check output is byte-identical on untouched c074 and this candidate. This unrelated anchor/geometry issue is not changed or hidden.
- `git diff --check`: passed.

No Vite build, local server, browser, screenshot, GPU/SwiftShader session, or new performance measurement was run. Passing CPU checks does not constitute browser acceptance.

## Integration and subsequent acceptance

Integrate only if the owner selects this single candidate. Reversing this candidate commit restores the prior initial viewpoint and test wrappers; the benchmark anchor already remains unchanged.

After integration, allocate the ordinary first-entry A/B separately. Compare fresh loads and normal entry clicks at identical viewport/quality settings, with position as the sole visual variable. Inspect the complete central roof, both visible wings, welcome/help overlays, ground continuity, and the first walk forward. Include a narrow portrait review with the horizontal-framing limitation disclosed. Keep the six existing performance viewpoints exact and report any later measurements separately. The rejected sky study is not part of this candidate.
