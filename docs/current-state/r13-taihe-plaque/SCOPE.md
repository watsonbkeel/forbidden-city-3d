# R13 Taihe plaque inner-field and surround candidate

## Direct evidence and limited inference

The Palace Museum's2002-09-19 restoration report explicitly gives the reconstructed plaque as2.8×6.8m, installed on2002-09-18: https://www.dpm.org.cn/show/226011.html . Its current official public hotspot close-up is recorded in SOURCE.json. The photograph has a broad profiled brown-gold surround, two narrow red bands and small lower gold ornaments. Its capture date is unknown. URL upload date is not a capture date. No photograph is embedded or redistributed in runtime assets.

In the1920×1280 image, approximate outer bounds185..1800×225..910 and gold field284..1700×329..808 suggest a field around88% of overall width and71% of height. Perspective/crop prevent a survey interpretation. The model's existing6.62×2.62m field occupied97%×94% of the published outer frame. This candidate uses an estimated6×2m field, retaining the6.8×2.8m outer frame, original hanging height/Z, lettering atlas, camera defaults, lights, exposure, all columns and all navigation.

## Implementation and budget

The fine detail uses two actual shallow profile rings, a brown-gold outer bevel and a red inner band, within the existing dark-gold/lacquer batches. This is a simplified surround: the second red band, exact multi-molding profile, carved supports and imperial seal are not represented as exact restorations. Two original planar backing-front triangles, fully covered by the continuous rings and existing lettering plane, are retired; all back/side faces remain. All original attribute bytes except the four glyph vertices' X/Y coordinates remain exact; all other indices preserve their original order. Atlas pixels, glyph UVs and couplets are unchanged.

The raw approved GLB remains byte-identical17924 triangles. A guarded post-decode installation adds16 and retires2, so the actual loaded core has17938 triangles and eight batches. Its unchanged60 permanent central-beam triangles bring the original combined allowance to17998, still below18000. The early six-ring48-triangle CPU draft was rejected before browser testing after checking this combined allowance; the limit was not increased. Coarse fallback remains1600 triangles/eight batches: its existing simple backing box uses the existing brown-gold material and the same6×2m lettering field. No extra fallback geometry, material, atlas or texture is introduced.

The installation validates the real decoded plaque quad, atlas corners, normals, local transform, backing faces, attribute layouts and exclusive geometry ownership before changing any buffer. It runs before scene attachment/GPU upload and before hiding the fallback. Invalid or repeated installation fails closed. Actual loader statistics count the amended geometry. All other palace geometry/collision is unchanged. R12 candidate and R9 online version remain separately preserved.

## Status

Focused runtime/fallback/retention and lifecycle checks passed80/80. After preserving earlier historical-fixture failures, the final MJS suite passed2265/2265 and the separate CJS suite passed10/10. Build succeeds. Actual old/current fixed-view images confirm the intended relative field/surround change; see VALIDATION.md for the slight OS viewport difference and failed first baseline attempt. R13 performance, full routes and physical-mobile acceptance are not claimed. Pages is unchanged. This is a relative-proportion correction inside the published outer plaque, not a surveyed hanging registration or a claim that the whole interior is now reproduced accurately.
