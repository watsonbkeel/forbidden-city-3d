# Taihe throne and screen: bounded detail candidate

2026-10-17. A source-informed visual approximation, with runtime image review pending.

## Visible work

- Replaces only the seventeen old wide `throne_back*` pieces with a narrower central backed panel and open curved surround. The 0.58 m central width is an authoring estimate.
- Adds nested registers, original simplified cloud/dragon-themed shallow relief and small shoulder curls to the seven retained screen leaves.
- Adds paired gold scroll/openwork over the existing recessed blue waist. The backing remains solid; openings reveal blue rather than passing through the whole seat.
- Preserves the seat, original arm pieces, lower support, separate footstool, screen substrates, hall coordinates, collision/floor data, lighting and all material factors.

The ornament is sparse and stylized. It does not reproduce the artifact's documented thirteen dragons, dense carving, fine anatomy or conservation surface. The old solid screen apexes remain. Rear carving and the unchanged coarse fallback are incomplete. The footstool has not received this pass's ornament.

## Evidence and uncertainty

The museum's current Taihe building page captions its installed-display photograph as the Taihe throne. It supports seven stepped screen leaves, framed carved fields, the narrow central chair back and an open curved surround. The photograph's capture date is unknown.

- Building page: https://www.dpm.org.cn/explore/building/236465.html
- Installed furniture image: https://img.dpm.org.cn/Uploads/Picture/dc/1606%5B1024%5D.jpg
- Taihe throne dossier, printed p.12: https://www.dpm.org.cn/Uploads/pdf/5063/T00012_00.pdf
- Museum explainer: https://young.dpm.org.cn/info/305
- Base-detail contextual image, printed p.9: https://www.dpm.org.cn/Uploads/pdf/5063/T00009_00.pdf

The existing published artifact dimensions are retained: total throne height 1.725 m; seat 1.585 × 0.79 m and height 0.49 m; lower support 1.62 × 0.995 × 0.21 m; footstool 0.705 × 0.42 × 0.30 m. Seat width is not a surveyed outer arm-to-arm width. Existing screen dimensions (4.2 × 3.8 m envelope), equal leaf widths, installed positions, ornament depths/paths and color values remain modeling estimates. Historical-plan registration uncertainty remains unresolved. No museum photograph is embedded, traced or used as a runtime texture. The geometric motifs are original approximations.

## Ownership and costs

Pinned pre-furniture GLB: `9067bcce8b91f719a5e39ca1cfc2a1d1c5c013d5fcd4488dc92ee920ada7015d`.
The source-derived immutable mask retires 296 faces across 17 chair-back objects: gold 240, dark-gold 24, lacquer 32. Every old vertex/normal/UV byte is retained, including 726 newly unused vertices. All other index bytes keep their original order.

The detail increment adds 2,980 faces, so the core changes from 14,582 to 17,266 triangles, below its unchanged 18,000 ceiling. Eight core material batches remain; no texture, global shader or material-factor change. New gold UVs use the neutral cell and receive exact neutral color gains. The existing ceiling's separate additional batch is unchanged. S gold color-buffer storage becomes 413,160 bytes. B remains 1,596 triangles and eight batches. This is structural budgeting, not an FPS/performance acceptance claim.

## Recovery provenance

The execution filesystem was replaced during work. The last delivered a502f source was restored from its Library code/public archives, totaling 630 files. After restoring the one executable bit, its tree is exactly `da7121c83ea32ab1362fd8c821bf60f17c3b942e`, matching a502f00d1823d7ac6dba795868df63d5b0263840. Local recovery commit `3ff77b15e0143b11c9bf77d9613cb26b05070943` has the same tree, without the lost local commit history. Furniture source was recovered from retained text and re-tested. The retirement mask and retired GLB reproduced their prior hashes exactly.

## Acceptance boundary

CPU geometry and byte-preservation tests cover the actual new asset. Historical caisson/display tests still examine the explicitly pinned older asset, while current core/loader/column-response tests load the new registry asset. Ordinary runtime pixels, long routes, mobile and performance must be accounted separately. No main or Pages changes are part of this candidate.
