# Taihe central beam trial, 2026-10-18

This is a limited structural candidate in response to the user's interior screenshot. It is not a complete measured reconstruction.

## Evidence and retained uncertainty

The Palace Museum's direct interior photographs show real painted beam side and underside faces between the central columns, with a layered ceiling. The previous model had only perimeter beams and four flat ceiling sheets.

- Museum building page: https://www.dpm.org.cn/explore/building/236465.html
- Throne/beam photo: https://img.dpm.org.cn/Uploads/Picture/dc/1606%5B1024%5D.jpg
- Caisson/ceiling photo: https://img.dpm.org.cn/Uploads/Picture/dc/1602%5B1024%5D.jpg
- Plaque restoration dimensions: https://www.dpm.org.cn/show/226011.html
- Published central bay/row intervals: https://img.dpm.org.cn/Uploads/pdf/5077/T00035_00.pdf

The photos were actually inspected. Their capture dates are unknown; portable carpets and barriers are not added from them. They remain research references, not runtime textures.

The official plaque is 6.8 × 2.8 m and the couplets 7.5 × 1 m. Those dimensions and the retained approximately 1 m gold-column diameter are not shrunk for screenshot readability. The current plaque/couplet mounting elevations and depth are still estimates and conflict with the apparent relationship in the official wide photo. No new measured ceiling height is inferred from that image.

## Bounded geometry change

Six beam prisms connect only the retained central column stations. Four transverse beams use z = -13.0646, -5.5868, 5.6019 and 13.0647; two longitudinal beams use x = ±4.233. These reuse the existing column registration, which itself is a source-informed inference. Beam width 0.46 m and underside 8.7 m above the hall floor are visual-trial values, not conservation measurements. The top remains at the original ceiling 9.47375 m.

The beams do not intersect the existing caisson opening or the plaque box. All floor, columns, furnishings, plaque/couplet dimensions, lights, exposure, textures, navigation and roof geometry remain unchanged. There is no claim that the generic outer column grid is measured or that the full ceiling rib network has been restored.

## Budgets and acceptance

Each beam retains five visible faces; the upper face against the opaque ceiling is omitted. Six beams add 60 triangles, using the existing painted-beam material and existing merged hall batch. The loaded 17,940-triangle furnishing asset plus this increment is 18,000; the allowance is not raised. The original full-scene 874,189 × 1.1 triangle ceiling remains the release gate, and the fallback mesh keeps its own original 1,600 limit. No draw-call allowance is increased.

Focused CPU checks validate geometry, source-delta boundaries, caisson/plaque separation, unchanged collision/walkable hash and shared material batching. Actual visual comparison and integrated browser/performance checks remain pending at this checkpoint. The six prisms add meaningful thickness but do not complete coffer relief, bracket sets or sculptural detail.
