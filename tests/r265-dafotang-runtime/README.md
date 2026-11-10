# R265 Dafotang runtime validation

This is a no-deploy validation candidate for the frozen R265 shrine component. It does not change production files or the R262 release label. The workflow is restricted to the dedicated development branch and the exact reviewed parent/tree and change list.

The original P portable chain runs from an exact P archive, since its immutable preflight pins two files strengthened in V. V's revised compatibility test and both cabinet integrations run separately. P's 78 tests and three auxiliary checks are reported separately from V's 52 + 6 + 6 cases. The archived P runner is not a whole-V 80-case runner.

The guarded host phase runs a same-stage R264 comparison child and then a current child, sequentially inside one unchanged 4 GiB / 720 s / 32 MiB sampled-process-tree supervision envelope. It uses the real TextureLibrary material cache but **inert 64×64 preloaded textures** and a fixed local plaque PNG hash/decode/event facade. This is CPU integration evidence, not real browser texture appearance, GPU execution or a kernel memory guarantee. No host pass is claimed before CI runs it.

Only after host cleanup may the ordinary guarded production build run. The final guarded phase performs one ordinary public entry, recording native input and eight named screenshots. Each scene capture observes public focus, visibility, body pointer lock, closed-map state and, inside the hall, location through the screenshot; the map-detail frame is the explicit exception. The fixed A/D and look samples are proposed, not proven good views. A technical capture pass requires separate actual-pixel review and has `releaseAccepted:false`. No page is deployed by this workflow.

Before visual acceptance inspect all eight PNGs for: three broad central outlines; six plain model-fit returns; no cut-corner or hanging-board illusion; real oblique depth and underside; no gaps or spills at columns; readable surroundings and clear center/both side crowns; plausible sampled shadows and aliasing. The beam must occupy enough pixels to judge. Compare lateral parallax, not merely yaw or differing hashes. Failed framing is a blocker, not permission to change cameras or make required images optional.

Local miniature controls only (serial, no host, build, browser, install or application startup):

- `timeout 30s node --max-old-space-size=128 --max-semi-space-size=8 --test --test-concurrency=1 tests/r265-dafotang-runtime/host-contract.test.mjs`
- `timeout 30s node --max-old-space-size=128 --max-semi-space-size=8 --test --test-concurrency=1 tests/r265-dafotang-runtime/visual.test.mjs`
- `(ulimit -v 131072; timeout 30s python3 .github/scripts/test_r265_dafotang_runtime_bound.py -v)`

CI retains the combined host log, compact baseline/current receipts, guard/exit rechecks, build identity and artifact inventory, browser observations, all capture attempts and PNGs, including failures. Successful technical capture preserves a dist artifact for inspection but does not publish it.
