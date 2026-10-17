# Taihe ceiling medallion candidate

Base: `6394abdf4712148df6f3652dd354acf026b8917b`. This increment changes only the artwork on the four permanent Taihe ceiling planes. It is an original illustrative approximation, not a conservation facsimile or a measured reconstruction.

## Evidence

- Palace Museum Taihe page: https://www.dpm.org.cn/explore/building/236465.html
- Museum's caisson photograph linked by that page: https://img.dpm.org.cn/Uploads/Picture/dc/1602%5B1024%5D.jpg
- Interior ensemble photograph: https://img.dpm.org.cn/Uploads/Picture/dc/14498.jpg

The caisson photo visibly supports dark green/blue-green square coffers, gold circular dragon/scroll medallions, small red accents in the corner scroll clusters and layered green-and-gold square framing. The old center-and-eight-dots icon does not convey those motif categories. The new tile is self-authored Canvas2D artwork informed by those broad features. No museum bitmap, tracing, external font, generated image or third-party ornament is shipped.

The photo's capture date is undisclosed. Exact full-ceiling panel counts, orientation, motif variants, spacing, paint colors and relief dimensions are unverified. Existing 1.6 m modeled repeat cadence is retained as an approximation. Shallow frame layers are suggested with restrained color bands; the planes remain flat. Caisson carving, dais/screen registration and the still-simplified dragon are unaffected and remain limited.

## Scope and costs

- Four existing plane position, normal, index and UV arrays are unchanged, including the caisson opening.
- Original generic ceiling canvas/material remains byte-identical for every other hall.
- One cached Taihe-only 512×512 sRGB CanvasTexture, repeat wrapping, ordinary mipmaps. RGBA8 complete mip storage is 1,398,100 bytes (about 1.33 MiB); browser/driver overhead is additional.
- One additional ceiling material identity, at most one extra ceiling draw in the merged three-hall group. The existing 8 Taihe core batches and 14,582 detail / 1,596 fallback triangles are unchanged.
- No shader hooks, normal/bump maps, global exposure, lighting, camera, collision, navigation, roof, caisson opening, anchor or portal changes.
- The separate material is deliberate: a zero-draw-call shared atlas would require shader/UV selection changes in all ceilings. This small scoped draw-call cost avoids that broader risk. No existing budget is reset.

## Acceptance

CPU checks cover exact geometry/UV retention, finite source substitution, actual merge impact, unchanged other-hall material, per-builder cache and texture disposal, deterministic bounded drawing and fixed texture storage. Ordinary same-route eye/upward images must still be reviewed before any visual acceptance. This increment does not clear existing full-route, mobile, long-run or software-renderer performance limitations.
