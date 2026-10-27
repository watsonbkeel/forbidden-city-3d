# Historical paired-build timing erratum — R123/R124 and first R125 run

2026-10-27. This correction is carried forward in R125 and must remain prominent in R126. Frozen R123/R124 trees and all original raw remain unchanged.

## Affected evidence

The R123 `scripts/r123/ready-zone.mjs` eagerly imports the current tree's ZoneBase/TextureLibrary/detail modules. Its `sourceRoot !== root` branch then dynamically imports the baseline tree's modules. R124's paired cost reused this helper. Thus the current candidate has one runtime graph already loaded; the baseline loads a second graph inside the `readyScene` call.

- The wrapper's **allReady** timer begins before `readyScene`: it directly includes extra baseline dynamic imports, unlike candidate eager imports that occurred before timing. Those paired R123/R124 build/allReady deltas must **not** be used as reliable cost-increase/decrease conclusions.
- The narrower **buildMs** timer begins later, around `builder.build()`, so imports are not directly included. However, the baseline process retains two module graphs and diagnostic frame capture allocates during the build; initialization/GC/JIT state and instrumentation are not symmetric. Its causal paired interpretation is also withdrawn, not converted into an opposite claim.
- This does **not** invalidate actual geometry/resource counts, actual source bindings, functional routes, texture identity, or exact byte comparisons. Standalone full startup observations and routine CPU samples are different drivers; this specific defect does not by itself invalidate them. Those samples already have their own non-paired/not-whole-frame limitations.
- This specific helper asymmetry has not been identified in R119/R120. No blanket claim that all historical performance measurements are valid or invalid is made.

## R125 correction

The first R125 paired pass inherited this asymmetry; all 12 raw files remain in `reports/r125-chengqian/cost/initial-asymmetric-import/` and its log is retained. The exact pre-correction R125 driver bytes were **not** separately saved; no reconstructed source hash is offered as original evidence. The historical R123 helper is still available from its frozen Git tree.

Only the diagnostic driver changed. Product runtime remained `8755dbbd…` throughout both paired passes. The corrected helper dynamically imports **only the selected target runtime** for both sides, before library setup inside the same allReady boundary. `capture:false` excludes diagnostic per-hall/physical snapshots from cost samples. Each corrected raw records both driver SHA256 values and import boundary. Exactly one corrected pass, the original three alternating fresh-process pairs per quality, was run; no cherry-picked reruns or performance optimization followed.

See [cost](COST.md) for all corrected deltas. R125 is a feature-cost report, not an accepted optimization. GPU/mobile/whole-frame performance remains unverified.
