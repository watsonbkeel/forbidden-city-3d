# Isolated three-Buddha close-up diagnostic
No product activation or changes. Uses exact copied factories and six existing refined-v2 assets, not production loaders. Therefore this does NOT diagnose or resolve ERR_ABORTED, validate the palace, real GPU, mobile, historical accuracy or artistic acceptance.

Hosted runner only, with unchanged repository lockfile dependencies already installed:
```
node --check tests/triad-closeup-r379/page.mjs
node --check tests/triad-closeup-r379/capture.mjs
node tests/triad-closeup-r379/capture.mjs
```
Run under existing external resource guard (6 GiB/720 seconds maximum). Never add no-sandbox or unsafe SwiftShader flags. If standard sandboxed Chromium cannot render, preserve failure, do not relax safety.

Fresh site/evidence directories required. Save entire evidence directory even on failure. Nine PNGs are 900×1000, same orthographic projection and fixed world lights, camera at 0/45/90 degrees, one figure at a time, no palace occlusion. Whole image SHA/byte identity verified before decode; full copied factory/vendor hashes captured. The camera rotates, not the model/light. Shading will therefore legitimately vary with angle. This is fitted relief, not a 360-degree historical scan.

Capture invokes preparation inside the guarded process, under the same budget. EVIDENCE_DIR must be external to checkout. CI=true, GITHUB_ACTIONS=true, RUNNER_ENVIRONMENT=github-hosted are required. The prepared site lives in EVIDENCE_DIR/closeup-site; checkout remains unchanged.
