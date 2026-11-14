# Continuous side robe diagnostic plan

Approved scope: code + existing art; continuous chest/robe/lap, two knee peaks, separately controlled neck/ear, thin-rim bowl. No product activation/main change. All dimensions are engineering fits.

Replace torso/abdomen/single-lap fields, not add covering gold geometry. A side-only bounded mesher reuses the established tetrahedron/edge identity algorithm and guards; shared mesher stays byte-identical. Profile is height -> half-width/front/back with shape-preserving monotone cubic interpolation. Keep distinct hand poses and original lotus. Compare actual clay and art against frozen parent under fixed light; include small elevated bowl views to expose real cavity.

1. RED/GREEN profile input validation, shape-preserving interpolation, finite/capped field; audit side mesher topology/budget.
2. Replace only named core fields, preserve hands and lotus; validate connected closed mesh, section widths, seat contact and UV/source exclusion.
3. Bowl continuous outer and inner arc with thin rim and solid base; closed mesh, real cavity, safe outer source-only UV. No hand/painted opening on exterior.
4. Independent geometric review, fixed-view hosted capture with existing 6GiB/720s guard; independent art review. Failed silhouettes remain failed even with CI success. Store same-ledger evidence and rollback.
