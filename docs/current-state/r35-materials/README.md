# R35 route material consistency

Base: `2cd8189db462e34a2ffc5573a435db8a0a77cccb` (R34).

## Deterministic fallback scale correction

`TextureLibrary.configure()` now enforces the library's existing `repeat = 1`
contract for color and normal textures. Geometry already maps one UV unit to
`tileSize` metres. The legacy ground fallback generator sets `repeat = 20`, so
the R34 fallback repeats a nominal 4 m texture every 0.2 m while a successfully
loaded ground texture repeats every 4 m. The library correction removes that
extra multiplier without changing the generator's contract for other callers.

This does not change successfully loaded texture pixels, their physical tile
sizes, wrapping, color space, geometry UVs, material ownership or caches. No
light, environment, route, collision, map, flight, UI or asset file is changed.

### Verification

- The new four-case `r35-texture-scale.test.mjs` failed on R34's actual 20×20
  repeat and passed after the correction.
- Tests cover actual procedural fallback creation, metre-scaled geometry UVs,
  all 22 texture specifications, both map kinds, cache/ownership, and the
  missing-file load path with an independently specified manifest tile size.
- Node canvas calls are stubbed; Three textures, the production texture
  generator, library, geometry and UV code execute normally. This is CPU
  contract evidence, not screenshot or GPU validation.
- Source identity guards need the R35 exact source registry. Old fixtures are
  intentionally unchanged.

The correction is isolated in its own commit so it can be retained independently
of any later estimated material-response changes.

## Conservative response candidate

The second commit changes defaults for four shared texture classes only:

| Shared texture | Normal scale, R34 → R35 | Default roughness, R34 → R35 |
| --- | --- | --- |
| Ground brick | 1 → 0.65 | 0.85, unchanged |
| Stone slab | 1 → 0.5 | 0.85, unchanged |
| Red plaster wall | 1 → 0.8 | 0.85 → 0.92 |
| Painted wood | 1 → 0.6 | 0.85 → 0.65 |

These are physically motivated rendering estimates, not measured historical
materials or screenshot-calibrated acceptance. The existing luminance-derived
paving normals are stronger than the wall/wood maps; reducing their weight
restrains artificial grain while retaining existing joints. Red plaster stays
matte; painted wood is distinguished from plaster without changing its red
albedo. Marble is deliberately untouched because its existing normal map is
already mild.

### Actual caller coverage

The CPU build uses the real TextureLibrary, resident palace, enclosure, garden,
ground, and all seven zone builders. It finds eight affected cached material
variants. Wall and wood callers in that construction use the shared defaults,
so the new roughness values apply. Existing ground roughness 0.88, axial road
roughness 0.75, and stone floor roughness 0.35 / 0.8 remain authoritative; those
variants receive the reduced normal scale only. The east/west city-gate stone
tint also remains exact.

Custom gold-brick floors, Qianqing surface/paint/art materials, lacquer/gold
materials owned by builders, marble, roof-tile/glazed roof materials, and
optional GLB materials are not retuned. Roof assemblies that borrow the shared
painted wood or red-wall material, including rake boards, upper wood bodies and
red gable panels, do receive the corresponding response defaults. This is not
an all-palace material replacement. Fallbacks without a normal map do not gain one.

`CALLER-COVERAGE.json` records actual requests, merged mesh references, triangle
counts, parameter overrides and resulting material values. Counts are not
buildings, draw calls, visibility or performance evidence. The eleven component
geometry/transform streams, navigation records and CPU resource budgets match
the exact R34 control (`INVARIANCE.json`). The comparison deliberately excludes
material response from geometry identity.

### Normal-map evidence

`NORMAL-MAP-DIAGNOSTICS.json` binds the unchanged HD/SD normal-map file hashes.
It decodes each base-level RGB pixel as `normal = RGB / 127.5 - 1` and computes
`degrees(atan2(length(normal.xy * normalScale), normal.z))`.

HD p90 tangent-space angular deviations:

- Ground: 20.146501° → 13.412523°.
- Stone: 27.428796° → 14.547072°.
- Red wall: 4.708413° → 3.769783°.
- Painted wood: 5.783556° → 3.477691°.
- Marble: 2.240751°, unchanged.

These are normal-map angular statistics, not real measured surface slopes or a
prediction of rendered pixel differences. Filtering/mipmaps and view/light
conditions are not represented. Both roughness choices remain estimates.

### Verification and reproduction

- Eleven new focused tests pass after observed failing pre-change runs.
- Tests cover HD/SD, all unchanged material classes, explicit roughness/tint/
  metalness/scalar/zero/vector normal overrides, absent normal maps, shared
  caches and exact single-owner disposal. The defaults introduce no additional
  material or texture objects.
- `npm run build` passes. The existing >500 kB chunk warning remains.
- Full current-state execution is being recorded separately; R35 source
  retention is integrated by the release owner. No old fixture is weakened.
- Browser rendering remains NOT_RUN: the available supported renderer cannot
  create a WebGL context. No screenshot, manual route, GPU or FPS acceptance is
  claimed. Matched paving, red-wall and eave-column views remain required for a
  future visual calibration decision.

Reproduce CPU coverage with:

```sh
node tools/r35-material-coverage.mjs . candidate.json
node tools/r35-material-coverage.mjs /path/to/exact-r34 baseline.json
python tools/r35-normal-map-diagnostics.py normals.json
node --test tests/current-state/r35-texture-scale.test.mjs tests/current-state/r35-material-response.test.mjs
```

Only `src/utils/TextureLibrary.js` changes in production. Reverting the second
commit returns all four response defaults while preserving the separately
committed fallback scale correction.
