# Bounded Taihe furniture detail candidate

Original geometry, reconstructed from the worker's retained source text after the executor workspace replacement, then re-tested against the restored a502f-content profile on 2026-10-17. These files are not claimed to have survived the replacement.

## Interface and scope

`geometry.build_candidate(profile, quality='detail')` returns `vertices`, `triangles`, `materials`, `normals`, `parts`, and `metadata`. Coordinates are hall-local X / Y-up / Z; the south-facing front points towards -Z. The function does not mutate the profile or write an asset. Normals are flat per triangle. Material tags are only `gold` and `darkGold`; the existing append utility can reuse the current batches and neutral gold UV cell.

Retire the 17 frozen `throne_back*` source objects with the separately verified exact retirement mask before appending. Do not retire by spatial bounds. Existing seat, arms, base, blue waist backing, footstool, screen substrates, older screen details, registration, lighting and material factors remain unchanged. The builder does not implement or modify fallback.

## What changed

- A 0.58 m estimated central solid back replaces the wide chair-back slab. Paired open diamond-section curved rails and narrow uprights leave true side openings. The crest stays at the published total height, local Y 3.995 m.
- Seven screen leaves receive three face registers, nested shallow frames, original cloud/dragon-category ridges and small closed shoulder curls. Retained screen centers, dimensions, Z and per-leaf heights remain fixed. The existing solid center caps are still present; this is not a fully pierced screen-crown reconstruction.
- Original paired curling gold openwork with a central faceted pearl is placed immediately in front of the unchanged blue-backed 0.16 m waist. The visible backing remains exposed through the pattern.
- Selective corner refinement and broader screen body ribbons consume the final detail allocation. No cylinders, high-poly tubes, photographs, scanned surfaces, fonts or copied/traced motifs are included.

## Evidence and uncertainty

Official installed-display photograph: https://img.dpm.org.cn/Uploads/Picture/dc/1606%5B1024%5D.jpg

Taihe object dossier: https://www.dpm.org.cn/Uploads/pdf/5063/T00012_00.pdf

The profile's throne total height, seat and lower-support/footstool sizes derive from the published dossier. Its seat width is not a surveyed arm-to-arm outer width. All ornamental dimensions, positions within the retained envelopes, relief depths, motif paths and simplifications are authoring estimates. No exact dragon count, per-leaf carving pose, rear carving or calibrated blue color is claimed. Existing current-layout registration remains provisional.

## Geometry-only checks

Run: `python assets-src/interiors/taihe_furniture/test_geometry.py`

Ten tests cover the finite indexed format, budget, exact existing material tags, normalized/winding-consistent normals, front-facing relief triangles, closed-component two-sided edge pairing and positive signed volumes, narrow back and open surround, seven separate leaf envelopes, main-relief clearance inside the inner frame, waist band/front bounds, deterministic output, unchanged input, explicit fallback rejection and bounded corner softening.

Re-tested detail cost: 2,980 added triangles, 2,175 indexed vertices. With the independently reported 296 retired faces, arithmetic total is 14,582 - 296 + 2,980 = 17,266; the parent must verify the actual integrated asset and existing eight-batch limit. No runtime/performance acceptance is implied by this arithmetic.

CPU orthographic diagnostics are created separately by `palace-r3-taihe-throne-candidate/geometry/preview_cpu.py` using the real frozen GLB plus exact retirement and the candidate. Its illustrative colors/shading are not runtime material edits and do not replace ordinary eye-level browser review.

The oblique CPU painter image has triangle depth-order artifacts and is explicitly excluded from acceptance. Front and waist diagnostics are the relevant previews; the parent owns actual runtime review.
