# R163 public place-name correction

Base: remote `06369276c3a3b91f5c27e12b23a54e0e032f4d92`, identical complete tree
`d20ab1513b7d98b280806db980bf559dda25af98` to local `74c22ffa9f0970d68126207fbcf49c7d1b44f043`.

The public label is **内阁大库**, as named by the [Palace Museum](https://www.dpm.org.cn/explore/building/236579.html).
This change does not assign the fitted second building to 红本库 or 实录库.
The original separate map/teleport key, entry profile, source records and
`identityUnresolved` metadata remain unchanged. Both buildings can display the
aggregate name without overwriting either travel target. No geometry, collision,
layout data, dependency, workflow or deployment setting changes are included.

The display correction covers canvas labels (before measuring/decluttering),
detail titles, travel accessibility labels, selection announcements, resume text
and teleport status. It is an exact alias, not a rule that truncates arbitrary
parentheses or invents names for unknown buildings.

## Verification

Node 24, serial checks, no browser or full-World acceptance claim:

```sh
node --test --test-concurrency=1 tests/r158-place-display/*.test.mjs tests/r163-public-place-names/display.test.mjs
node --test --test-concurrency=1 tests/map-compact.test.mjs tests/map-gestures.test.mjs tests/map-inputs.test.mjs tests/map-place-directory.test.mjs tests/map-place-selection.test.mjs tests/place-catalog-all-zones.test.mjs tests/place-catalog.test.mjs
```

- 11/11 name checks pass, including the real outer-east zone construction and
  its unchanged geometry/provenance, seven UI cases, and the existing alias tests.
- 115/115 bounded UI checks pass both before and after the correction.
- The six initial behavior regressions failed on the old display text before the
  production change. The added static-name inventory also passes. It covers all
  current static layout/zone/catalog names plus the real outer-east dynamic list,
  not every name in an unavailable user screenshot.
- UI canvas/DOM and touch fixtures test application behavior, not browser layout,
  GPU rendering or a physical mobile device. Teleport status testing stubs landing
  availability; the production second-store entry resolver separately retains
  the exact `(-262.5, -351.12)` approach and `(-262.5, -359.12)` doorway.

An exploratory old UI selection was **122/134**, not a full pass. Ten old seven-zone
cases stop at `Fengxian existing dimensions/platform mismatch`: their material
fixture names the band `sumeru_band`, whereas the unchanged guard requires the real
TextureLibrary name `sumeru_band_material`. All relevant scene/data/fixture files
are byte-identical to the base. Those World cases were not rerun. Two other
failures reproduce with the original UI: the garden 天一门 catalog binding and the
old R6 added-card hash assertion. No assertions, fixtures or tolerances were
relaxed to hide these failures. The whole historical suite was not run.

## Release and rollback boundary

Use a fresh empty output directory for a build with
`VITE_BASE=/forbidden-city-3d/ npm run build -- --outDir <new-directory>`.
Verify its own `build-info.json` and HTTP resources; do not reuse the previous
candidate's build identity. Keep remote `06369276` as the rollback branch.
This correction is delivered on a new development branch only. No main merge or
deployment is performed. The existing workflow deploys Pages on a later main push.

Before accepting browser visuals, open the map, zoom to both 内阁大库 footprints,
open each detail and use its own travel button. Check the title, screen-reader
label, return/resume text and teleport status contain no “第二体”, and that the
two travel destinations remain distinct. GPU/mobile and the unresolved wider
World/old-regression limits remain unverified by this correction.
