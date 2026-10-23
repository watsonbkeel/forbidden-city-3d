# Scope and commands

See `docs/photo-fidelity/REVIEWS/axis-minor-gates/ZUOYI-VISIBLE-PASSAGE-CORRECTION.md` for limitations and superseded assumptions.

- `node --test tests/r58-zuoyi-visible-front.test.mjs`: 6/6 pass.
- `node --test tests/r58-zuoyi-door-front.test.mjs tests/current-state/r35-texture-scale.test.mjs`: 17 pass / 2 obsolete-assumption failures, intentionally preserved as `legacy-recheck.tap`.
- `node --test --test-name-pattern='ground fallback|configure applies|all procedural|failed file|exactly nine pixel|binding is|real finish|shared albedo|wrong declaration|derivatives have|material-only|unloaded 64px|actual load failure|local loader|world QA' tests/r58-zuoyi-door-front.test.mjs tests/current-state/r35-texture-scale.test.mjs`: 17 applicable regressions pass.
- `node tests/r58-zuoyi-visible-baseline.mjs`: actual old helper pinned to 62d489a; full merged component/UV ray failure evidence.
- `node tests/r58-zuoyi-visible-diagnostic.mjs`: old/new complete-gate CPU textured front/oblique and passage views plus actual triangle/UV ray records. Uses existing Python/Numpy/Pillow, no new dependency. Temporary raster input lives under /tmp.

No original report, photo, HD/SD source asset, shared entrance, whole-world test, browser or build is modified/run. Images contain only project-runtime pixels. Whole-world dispatch/visibility remains owner-run pending integration.

New failure-log trailing whitespace is normalized; assertion output and counts are unchanged. Original frozen 13/19 logs are not normalized or edited.
