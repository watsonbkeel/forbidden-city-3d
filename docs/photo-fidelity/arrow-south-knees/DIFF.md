# R59-B · FC-AF36D75128 箭亭南面中央雀替

Status before implementation: DIFFED. Baseline: `2b983ae82e50e23fd55bbe0845942a0a3855f8dd`.

## Own-source observation and bounded change

I opened the official building page and actually viewed the 1425 × 1068 official photograph on 2026-10-22. The central south opening is between the two red columns near image x ≈ 591 and 770. At their heads, broad pale gray shoulders run inward under the beam, with a narrowing curved underside. Approximate examination windows are x=588–643/y=756–783 and x=719–774/y=756–784. These windows locate the feature, not surveyed outline coordinates. Trees obscure other parts; no unseen side or rear copy is authorized by this view.

- Reference: two visible inward shoulder/knee halves at the central south opening → baseline: twenty red columns and four plain red frame beams, but no separate knee geometry → add exactly two closed, shallow solids to those existing columns at local x=±2.75, z=−8.8 → verify silhouette, symmetry, attachment triangles, nondegeneracy, watertightness and exact retained geometry/navigation hashes.
- Reference resolves a gray/light painted surface, not exact paint reflectance or carving → baseline has no such surface → use one private matte gray material, no photograph, ornament texture or invented carving → check shared material immutability and owned material disposal.
- Reference cannot establish depth, measured dimensions, joinery, capture date or current interior inventory → retain those limits explicitly; no columns, beam geometry, roof, stairs, enclosure, nameboard, museum label or interior object is replaced.

The proposed fit uses the retained 5.5 m column-axis bay as its datum: 1.32 m inward projection beyond the root (0.24 bay), 0.62 m drop (0.113 bay), and 0.28 m depth. Plausible visual-fit ranges are 1.1–1.6 m, 0.45–0.75 m and 0.15–0.35 m respectively; the last is an engineering assumption, not a measurement from the frontal photograph. The root starts 0.22 m inward of the column axis. The top overlaps the existing beam underside by 0.03 m to close the attachment. The closed root overlaps the existing tapered twelve-sided column by a small amount; this is robust model assembly, not reconstructed joinery. No fine scallop or painted motif is asserted.

Lowest new edge is planned at y=7.91 m, 7.01 m above the retained 0.9 m platform. No ground-level legal jump can reach it. No new walkable, room, collider, navigation route or player-code change is required; actual controller passage and jumping must still be checked.

## Source and earlier work

- Parent page: https://www.dpm.org.cn/explore/building/236578.html
- Original: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4c87b554a.jpg
- SHA256: `e7f98442e7236e082d9713e9572d3576c3148314c07cdbd1135304c5309c6225`
- Photograph capture date: unknown. URL path date: 2020/04/20, not a capture date. Viewing date is not evidence of present-day condition.
- The reference stays in the research cache. It is not copied into the repository, public assets or a release ZIP. Only links/hash and our model-derived diagnostics are deliverables.
- Actual call chain: `ZoneBase.buildHall` → `buildEnclosedPavilion` → retained `kit.hall` shell → R45 columns/enclosure/beam registrations. R48 changed old-shell removal to actual cached material identity. Both existing fixes remain.
- R45 enclosure notes and tests were read. Twenty perimeter columns, five south/three north door groups, open middle N/S access, side galleries, roof/platform/stair/support signatures remain unchanged.
- R49B `reports/r49b/release/audit-sources/outer.json` independently records that the existing 箭亭 model sign is not an attested historic nameboard and the photographed right-column 武备馆 sign is a separate exhibition label. Neither is altered or duplicated here.
- R27 is the unrelated Jiaotai landmark implementation; its module, source-retention fixtures and actual current files remain byte-identical. No R27 shape is borrowed.

## Verification boundary and integration

Only new production file: `src/scene/palace/special/ArrowSouthKnees.js`. The owner will add its import and one arrow-only call immediately after `arrow-frame-beam` creation in `EnclosedPavilions.js`. This branch does not edit that shared file.

The helper in `tests/lib/r59-arrow-knees-qa.mjs` consumes an already-built local kit/frame or an existing world's kit/frame. It never creates a world, requests a browser or reruns the entire suite. Tests construct one local hall only.

Browser before/after evidence remains VERIFY_PENDING: the inherited Chromium socket EPERM and denied bwrap escalation are not retried or bypassed. CPU geometry/material diagnostics are expressly not browser, GPU or visual ACCEPTED evidence. Whole-building exterior/interior acceptance remains open.
