# Taihe caisson: coherent shell and compact coil candidate

This is a source-informed structural preview. It is not a measured restoration or a claim of final visual acceptance.

## Visible intent

The previous model used three broad sloping bands and sixteen thin approximate radial ribs around an oversized head. This candidate replaces those specific shell faces with recessed corner/side panels, square-to-octagonal frames, and stepped circular mouldings. The central dragon has a narrower head and an inward, overlapping coil rather than a largely empty C-shaped ring.

The Palace Museum's current building page and its caisson photograph support an upward-recessed shell, a centrally coiled dragon with a downward-projecting head, and a pearl held below it:

- https://www.dpm.org.cn/explore/building/236465.html
- https://img.dpm.org.cn/Uploads/Picture/dc/1602%5B1024%5D.jpg

The photograph is a research reference only, not a shipped texture. The geometry is self-authored. The carving is deliberately simplified; the missing ornament, the head's likeness, and actual in-scene lighting still need visual review.

## Retained anchors and uncertainty

The caisson center, original opening boundary, outer rim, top cap, seven existing pearls, dais, screen, columns, walking/collision geometry, lighting, exposure, and material response remain unchanged. The nominal opening interpretation and the modern registration of the dais/screen are inherited estimates. Widths, recess depths, moulding sections, facial features and orientation are visual authoring estimates, not conservation measurements. Photo-space ratios are perspective-dependent.

The new skull/body width ratio is approximately 0.326. This is an authoring choice informed by the photograph, not a measured palace dimension. See the two rationale files under assets-src/interiors/taihe_caisson for the basis and limitations.

## Bounded replacement

- Detailed asset: 14,582 rendered triangles, eight batches (original budget: 18,000).
- Fallback: 1,596 rendered triangles, eight batches (original budget: 1,600).
- Exactly 320 original detail shell triangles retire: 192 gold and 128 dark-gold, tied to nineteen original named source parts.
- The detailed replacement shell adds 472 triangles; the central dragon has 2,302 triangles.
- Exactly 48 fallback shell triangles are replaced by 48 shell triangles; its existing 38-triangle central feature is unchanged.
- Unreferenced old detailed vertices are retained intentionally so every non-index attribute byte stays unchanged. They still count toward buffer memory; there is no memory-saving claim.
- Runtime gold gain buffers: 306,744 bytes detailed; 18,432 bytes fallback.

The retirement mask is content-addressed against the preserved original asset. Its application checks each original triangle's index triplet and float32 position bytes. Tests reconstruct the historical view only by reinserting those exact retired faces; this is not a general spatial exclusion. Separate tests cover the actual new geometry, winding, inventory, material ownership and counts.

## Acceptance boundary

Focused geometry/build tests are required before an ordinary, native-input near-dais and upward view. A useful image can establish a visible structural improvement, but cannot clear historical long-run browser failures, full routes, physical mobile devices or the original scene performance gates. Those limitations remain open. The public Pages version and unrelated pending upload remain separate from this local candidate.
