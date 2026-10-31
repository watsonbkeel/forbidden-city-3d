# Reproduction scope

Observed environment: Node v24.22.1; dependencies installed from the committed package-lock. Run at the repository root. Serialize World/test/build jobs; original peak RSS and every command are in evidence/*.resource.json. No GPU result is claimed.

## Final bounded gate (55 top-level tests)

```sh
node --expose-gc --max-old-space-size=1024 --test --test-reporter=tap --test-concurrency=1 \
  tests/photo-fidelity/batches/wumen-main-width*.test.mjs \
  tests/photo-fidelity/batches/wumen-main-grid.test.mjs \
  tests/photo-fidelity/batches/wumen-main-integration-equivalence.test.mjs \
  tests/photo-fidelity/batches/wumen-main-object-state.test.mjs \
  tests/photo-fidelity/batches/wumen-right-leaf-studs.test.mjs
```

This includes one real cumulative World,42 new width top-level tests,9 retained live right-leaf tests and4 historical wrappers. Wrappers verify actual child TAP5+2+2+1; those10 are not extra live top-level passes.

## Exact predecessor proof / meaningful south-strip negative

```sh
node --import ./tests/lib/wumen-main-width-baseline-loader.mjs --test --test-reporter=tap \
  tests/fixtures/r157-wumen-main-width/baseline-proof.mjs
node --import ./tests/lib/wumen-main-width-baseline-loader.mjs --test --test-reporter=tap \
  tests/photo-fidelity/batches/wumen-main-width-south-strip.test.mjs
```

First command expects2/2. Second intentionally expects0/8: the old grid blocks before3.05m. The normal candidate's eight southern horizontal traces stop3.4076–3.6240m, before the independently predicted3.63275m contact boundary, with840 safe frames/feet12.3m. These are component raw-controller tests, not eight new World cases. The .26m approach window covers the existing <=.25m horizontal substep plus.01m numerical allowance; it does not permit penetration. The literal original `<3m` full-suite assertion remains untouched/red.

## Full and batch evidence

The archived three *-command-1219.json files reproduce the original117-file current-state commands; full-restored-ab-comparison-1247.json contains both complete fresh1313-record Counters. These are fresh recovered-environment baseline/candidate runs, not recovered old TAP.

The92-file batch-command-1220.json is **not fully portable**: ten direct historical refs are absent, yielding524 emitted records,514 passes/10 failures and38 unexecuted predecessor titles. Do not replace those original refs or delete assertions to claim green. `GIT_NO_LAZY_FETCH=1` is appropriate for a later diagnostic that must explicitly prohibit promisor fallback, but its use must be recorded separately from the already archived original command.

Three builds used `VITE_BASE=/gugong/`, `/forbidden-city-3d/`, `/`, each568 modules. Build metadata truthfully binds411214 plus the three frozen production modifications and fingerprint9e5929eda9b12b24c243c26060e0dae9114b864777133187d0d2a74292057ae1. Current source/entry validation is separate from a clean-commit build identity.

## Evidence limits

Private original PDFs/PNGs are not repository assets; register-recreated.py/JSON identify the re-downloaded exact sources and recreated measurements. Retained old CPU1151 images are rejected incomplete-face diagnostics. Only the actual re-exported all-faces1200 set has49152 triangles per view; neither set is GPU, source-photograph alignment or whole-object acceptance. Raw historical dependency failure and P1 coverage gap remain open after this checkpoint.
