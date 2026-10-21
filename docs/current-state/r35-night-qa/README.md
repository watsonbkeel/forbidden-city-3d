# R35 night/interior QA: retain the R34 light policy

Baseline: `2cd8189db462e34a2ffc5573a435db8a0a77cccb` (final integrated R34).
This branch changes **no production source, geometry, collisions, materials, textures or light parameters**. It adds an exact review fixture, CPU validation and a reproducible policy audit. There is no rendered-night acceptance or claim that the user-visible brightness has been calibrated.

## Decision and user-visible boundary

The user asked for a brighter, less gloomy night with lights that are visibly on. R34 already increased the neutral/warm hemisphere and warm directional fill substantially. Its linear incident diffuse proxy is 3.28–3.63 times R33 across the six axial surface normals; that is arithmetic before material response, shadows, IBL and tone mapping, **not a measured screen-brightness ratio**. Increasing it again without an image could flatten relief, wash out paving and clip gilding. R35 therefore retains R34 unchanged.

Two different effects must not be conflated:

- Axis and interior readability comes primarily from broad hemisphere/fill illumination. This can illuminate paving, facades and undersides without representing identifiable mounted fixtures. It does not establish that the entire axis visibly contains lit lamps.
- Exactly four pre-existing garden stone-lantern housings have warm visible faces. These faces are unlit `MeshBasicMaterial` cues, not point lights; they do not create light spill or shadows. They are virtual-tour interpretation, not a claim that the museum illuminates these fixtures. The separate optional Qing festival sky-lamp demonstration remains off by default and is not used to make the ordinary night QA pass.

Whether this achieves the user's perceived brightness and visible-light intent remains a **rendered review item**, particularly on the main axis. No new historic fixtures or invented permanent lamps were added to make a numeric check pass.

## Exact policy at the reproducible times

All dates are Beijing UTC+8 on 2026-10-20. The renderer is ACES filmic with exposure **0.70** at every time. The legacy `lighting.exposure` field is not assigned to the renderer.

| Parameter | 12:00 day | 17:30 twilight | 22:00 night |
| --- | ---: | ---: | ---: |
| Solar elevation (degrees) | 40.0284618505922 | -1.007969810066244 | -50.26989957082779 |
| Daylight interpolation | 1 | 0.11179541934500405 | 0 |
| Sun intensity | 1.3677763035467048 | 0 | 0 |
| Hemisphere intensity | 0.5 | 0.8552818322619984 | 0.9 |
| Warm/cool directional fill | 0.25 | 0.47205114516374896 | 0.5 |
| Sky-only IBL intensity parameter | 0.6 | 0.3335386258035012 | 0.3 |
| Existing garden face opacity | 0, hidden | 0.888204580654996 | 1 |
| Environment light objects | 3 | 3 | 3 |
| Sun shadow enabled | yes | no | no |

The day endpoint keeps the original warm-white sky hemisphere, neutral ground bounce and cool fill. Full-night authored swatches are sky hemisphere `#d1d7e0`, ground bounce `#aca18a`, warm fill `#ffce91`; returned color arrays are linear RGB. All exact arrays and the source SHA-256 values are in [CPU-AUDIT.json](CPU-AUDIT.json).

The optional S interiors retain their existing point lights. Taihe uses intensities 2 and 1, distance 30; Qianqing uses 2 and 0.8, distance 26. They are not a new night-only boost and are not evidence of real fixtures. B/S comparisons are needed because the optional loaded lights and material response differ.

## Reproducible view harness

The machine-readable source is [tests/fixtures/r35-lighting-qa.json](../../../tests/fixtures/r35-lighting-qa.json). It defines 11 standing views, 17 view/tier combinations, three fixed times and two qualities. A full controlled matrix is 102 captures per revision, not 102 completed captures.

- 1280×720, DPR 1; production FOV 70°, near 0.1, far 2500. Keep the exposure at 0.70, not the unused day-cycle field.
- Wumen entry; Taihe approach, doorway, central floor and side/caisson; Qianqing veranda, central floor and end passage; the garden lamps; Chuxiu court and interior.
- Each position is verified against the actual CPU collision world at normal eye height in B and loaded Taihe/Qianqing S states. This establishes support/body clearance only, not visibility or successful manual walking to the point.
- The current Qianqing end-passage center is x=20.5, derived from its rounded R34 frontage fit. Do not reuse the earlier equal-bay x=20.4444444 value. Both were clear, but only 20.5 is the current lane center.
- 17:30 is a genuine October transition sample. The initially proposed 18:30 time was already full night, so it cannot test twilight continuity.

For an authorized developer-render route, load the current candidate with all required zones resident before capture, stop camera movement without changing scene contents, apply each explicit preview date, ensure the named B/S state is settled, place the camera and look at the fixture target, update the environment/shadow state, then capture both qualities. A B test must actually unload the optional S layer and suppress automatic reloading during capture; an S test must verify load success and finish the existing fade before capture. Record source hash, build identity, time, tier, quality, exposure and renderer errors with each image. These controlled states are not ordinary-browser or streaming-performance acceptance.

The render worker owns the broader manual acceptance matrix and access-blocker receipt; this branch owns only the lighting fixture and CPU contracts. No Chromium flags, sandbox changes or alternate network route were used here to bypass the known renderer/access limitation.

## Parameter tradeoffs if later images show a real remaining issue

No option below was applied. First identify the dark surface and compare the same camera, tier, time and quality.

| Potential lever | What it would change | Why not change it blindly |
| --- | --- | --- |
| Hemisphere intensity/ground color | All surfaces, including downward eaves and ceilings | Another global gain can flatten relief and wash out paving; this is already the main R34 increase. |
| Existing directional fill | Direction-dependent facades and upward-facing surfaces | It does not equally affect every wall or ceiling, and does not supply visible lamp sources. |
| Sky-only IBL scale | Environment response, especially reflective surfaces | Raising it can shift metal/gold appearance without solving diffuse-detail readability; it is not an interior lighting map. |
| Renderer exposure | The entire composited tone-mapped scene | Risks brighter sky/fog and lost highlight separation; cannot preserve exact day behavior unless independently scoped and tested. |
| Existing S point lights | Local optional interior response | B/S can diverge and localized highlights can clip. Needs matched loaded/unloaded images and no invented fixture claim. |
| Bloom | Perceived halo in high quality | Low quality has no bloom. A lamp must remain recognizable there; bloom is not proof of scene illumination. |
| New fixtures, textures or geometry | Apparent light sources and art direction | Out of this task's scope and unsupported without separate source evidence. |

## Verification and limits

Commands:

```sh
node tools/r35-lighting-audit.mjs > /tmp/r35-lighting-policy.json
node --test --test-concurrency=1 tests/r35-lighting-qa.test.mjs tests/current-state/r34-night-lighting.test.mjs tests/current-state/r15-environment-response.test.mjs tests/current-state/r15-beijing-day-cycle.test.mjs tests/current-state/r15-clock-ui.test.mjs tests/current-state/r15-historical-lamps.test.mjs tests/r34-environment-ownership.test.mjs
```

Final focused run: **40/40 passed**, including the five new manifest/source/time/floor/CPU-audit tests and 35 inherited lighting/ownership checks. The production build passed (205 modules, existing >500 kB chunk warning only). The missing-manifest and missing-audit checks were observed failing before their additions, and the source-derived passage assertion caught a stale coordinate before correction. The inherited focused lighting suite also passes. Exact final counts and full-current-state result are recorded in the task handoff after the final run.

The CPU audit deliberately fails if an unregistered day-cycle source is substituted, rather than claiming a known R33 comparison for unknown code. Its archived JSON is bound to the listed hashes; rerun after integration instead of treating this isolated-branch receipt as final R35 proof.

**Not run / not accepted:** rendered lighting or lamp perception, black-crush/highlight clipping, real GPU/FPS, actual mobile appearance, and ordinary manual walking. Supported cloud-browser access was checked by the render owner and could not provide WebGL; no visual checkmark is earned by the CPU tests.
