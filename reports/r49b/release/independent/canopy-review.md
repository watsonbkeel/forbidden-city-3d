# R49B independent canopy / main-roof joint review

Status at 2026-10-22 04:20 UTC: **CPU GEOMETRY ACCEPTED within this two-canopy scope after the boundary fix**. The initial blocker below was corrected and independently rechecked. No production code was modified by this reviewer. GPU/browser and R50 character visual acceptance remain unperformed.

## Scope and source boundary

Reviewed only the Yonghe and Chonghua local canopy-height/nameboard candidate, followed by the parent-approved local roof-surface joining candidate. Main halls, column x/z, floors, steps, courtyard spacing and all other buildings remain out of scope. Geometry is actual production unmerged triangles and real atlas/albedo, with independent CPU sections and conservative double-sided rays. No GPU/browser acceptance is claimed or attempted.

Inspected actual pixels of the Palace Museum official images:
- Yonghe exterior: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d39e4779a2.jpg
- Yonghe underside: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d39e47b346.jpg
- Chonghua exterior: https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff075737310.jpg
- Chonghua nameboard / ceiling: https://img.dpm.org.cn/Uploads/Picture/2020/07/06/s5f0293fb25b6d.jpg

Photos establish the open front porch, high nameboards behind the nearer beam, rounded Yonghe canopy and decorative relation to head/transom. They do not survey dimensions or reveal the concealed joint. Chonghua's ornamental tails can overlap the upper transom visually; that transom is not the clear door-leaf opening head. Do not turn a “nothing below transom” inequality into a historical measurement.

## Height-only candidate: two real defects

1. **Chonghua gap**. At its old rear clipping plane z=-4.44, canopy tile is y=6.84766 while main roof tile is y=6.46145, a 0.38621 m open vertical gap. The flat underside y=6.45 intersects the main roof at z=-4.45990, but this is not closure of the upper roof. The old label claiming 10 mm wall bearing no longer describes the geometry after raising the canopy.
2. **Yonghe untrimmed rear intrusion**. Canopy tile intersects the main roof tile at z=-6.48020/y=7.97449, then continues down through main head beam. At x=6 the tile crosses beam top at z=-5.78528/y=7.32 and beam back at z=-5.775/y=7.30806. The underside and curved rafters penetrate too. This is more than a deliberate hidden roof-over-roof overlap.

See `surface-and-sections.json`, `yonghe-section-x0.01.png`, `chonghua-section-x0.01.png` and x=6 / x=8.5 companion sections. These are the height-only snapshot, kept separate from later snapshots.

## Minimum local join solution, independently simulated

Retain all non-canopy triangles exactly. Use the actual main upper roof triangle envelope as a clip target. Keep auxiliary roof pieces above that envelope with at most a 10 mm vertical embed into the existing solid roof. Preserve attribute interpolation and surface winding. Clip each auxiliary surface independently, not all components at one vertical z plane.

- Yonghe: preserve the original forward curve and its 1.25 m rise. Tile / underside / rafters meet the main surface at different locations. With 10 mm embed, center tile ends near z=-6.471371. No part should continue into the main beam / room.
- Chonghua: rebuild the existing auxiliary roof with its unchanged original parameters before applying the new envelope clip. The old z=-4.44 crop must be removed; merely shortening the existing crop cannot close its 0.386 m gap. Exact tile crossings before embed: x=.01 or 3 => z=-4.044579/y=6.689078; x=6 => -4.042538; x=6.8 => -4.064288; x=7.8 => -4.584642. A uniform z cut is therefore wrong at the shoulders. The flat underside naturally terminates earlier, near -4.45990.

The scratch-only virtual solution preserves every non-canopy triangle byte-for-byte and has zero main beam/column crossings in sections x=.01/3/6/8.5. It introduces no new roof type, moves no hall and deletes no main beam. Source and outputs: `virtual-joint.py`, `virtual-joint-checks.json`, `*-virtual-joint-section-*`, `virtual-joint-*` directories. These are design-validation outputs, NOT production acceptance.

## First production surface-clip implementation: blocking defect

Reviewed `CanopyRoofSurfaceJoint.js` and copied the first corrected production export into the now-renamed `boundary-bug-yonghe` / `boundary-bug-chonghua` snapshots. Main non-canopy non-plaque triangles compare exactly unchanged against the earlier snapshot. Full nameboard volume tests pass 2/2; Chonghua face is now .945 x 1.35 at z=-4.66, while Yonghe remains 1.05 x 1.5. These passes do not supersede roof QA.

Independent 7,821 downward x/z ray samples per auxiliary geometry role compared the actual result to a separate piecewise main-roof-envelope implementation:
- Yonghe tile and underside each have 22 unexpected missing samples. Example x=-5/z=-7.809 or -7.78: actual has no tile or underside, expected y=7.83383/7.75383 (at -7.809), well forward of the intended rear joint.
- Chonghua tile has 583 unexpected missing samples and underside has 3,017. Center x=0/z=-6 and -5 returns neither intended tile nor flat underside; these points are far ahead of the seam. Example expected x=0/z=-6 is y=7.25865 plus y=6.45.
- Curved rafters, bargeboards, ridge, sidewall and fascia sample comparisons otherwise match the independent envelope.
- `chonghua-high-side-final.png` visibly shows an accidental sky-lit roof hole near the ridge.

Root cause: `split()` assigns on-boundary vertices only to `yes`. A triangle with signed distances [negative, negative, zero] produces `no.length===2` and is discarded although its full area belongs outside. Every projection partition needs its boundary vertices in BOTH output polygons. The one-sided ownership loses entire strips during successive roof-triangle partitions.

Minimum fix recommendation: append a vertex to yes when da>=-EPS and independently to no when da<=EPS; keep strict opposite-sign edge intersections in both; filter degenerates only after the split. Add area-conservation tests for [-,-,0], [+,-,0], [-,0,0], all on plane, fully either side and touching edges. Then rerun actual surface coverage probes, not only plaque bounds.

See `boundary-bug-independent-checks.json`, `final-check.py`, and `final-plaque-volume.tap` for this superseded failed iteration. The current `final-*` snapshots and `final-independent-checks.json` are the repaired iteration.

## Caps: inspected separately, not the source of missing panels

First production caps are entirely within the existing main roof at sampled vertices, mid-edges and centers:
- Yonghe 33 cap triangles, 231 samples; depth below top 0.009995..0.010005 m; minimum height above main underside 0.133873 m; zero bad samples.
- Chonghua 30 cap triangles, 210 samples; depth below top 0.009995..0.010005 m; minimum height above main underside 0.135930 m; zero bad samples.

Because cap construction uses a convex hull of cuts from multiple separate components, it is a concealed covering within the roof volume, not a proof of manifold/watertight closure for each individual rafter/mesh. It does not presently show an exposed slab or ceiling, but do not label it a surveyed historic detail or a manifold guarantee.

## Navigation, silhouette and sightline boundary

- Both walkable arrays and registered rooms are exactly unchanged versus `r49-reported-regressions`.
- Yonghe has 26 colliders, all unchanged.
- Chonghua has 54 colliders; only the four existing canopy column maximum y changes 5.142 -> 6.45. Their feet and x/z footprints are unchanged.
- Existing controller eye height is 1.7 m. With ph=.75 and JUMP_VELOCITY=7.2 / GRAVITY=14, maximum ordinary jump eye height is 4.30143 m, still below the old 5.142 column tops. Thus the added collider portions do not change standing / ordinary-jump ground traversal at these floors. This is not an exhaustive arbitrary teleport/fly test.
- No R50 character/avatar system is present in this tree, so R50 body/head visuals were NOT tested.
- Yonghe curved roof peak is 8.1668 m; main roof tile reaches 13.57 m. Chonghua auxiliary ridge is about 7.7824 m; main ridge reaches 10.2127 m and remains spatially separate. Local curve/roof topology remains a model fit, not a roof subtype attested from these photographs.
- Raising canopy and plaque necessarily changes upward sightlines and the outer silhouette. Do not describe the change as “only the nameboard changed.” Conservative 9-point plaque rays from selected courtyard/steps/under-canopy/oblique viewpoints are in `sightline-checks.json`; some columns naturally block oblique views. They are not an all-view visibility promise, and that initial table predates the final Chonghua size fit.

Final gate recorded at the failed iteration (resolved below): rerun actual exports after the splitter fix; no unintended holes in roof tiles or underside; no main roof/wall/beam change; no canopy tail through the beam; cap hidden; nameboard volume still clear; unchanged walks/rooms; multi-angle CPU inspection; acknowledge GPU and R50 limitations.


## Verified closure after boundary fix (04:17:15/16 UTC exports)

The owner fixed splitter boundary membership and added deterministic ownership for wholly coplanar polygons. Independent post-fix checks now pass:
- 7,821 x/z surface probes per role across 9 roles, 70,389 total, with ZERO differences from the independent clipping model and ZERO unexpected holes. This includes all roof tile, underside, curved rafters, bargeboards, ridge, fascia and gable-wall roles selected for the local canopies.
- Main non-canopy non-plaque geometry remains byte-for-byte unchanged; four actual production sections at x=.01/3/6/8.5 per hall have zero main beam / column crossings.
- Hidden cap samples: Yonghe 39 triangles / 273 samples, Chonghua 40 triangles / 280 samples, all 10 mm beneath main tile and at least .133873 / .135930 m above the main underside. Caps do not create a visible new ceiling.
- Four polygon-boundary area tests and both whole-plaque volume tests: 6/6 pass (`final-joint-and-plaque.tap`).
- Existing walkables, rooms, and allowed collider changes still satisfy the navigation checks above.
- Final Chonghua nameboard four viewpoint sets each yield 9/9 unobstructed sample rays. Yonghe three center viewpoint sets yield 9/9; its oblique viewpoint is blocked by an unchanged canopy column. This is a sampled conservative geometric check, not a demand for universal visibility.
- Actual fixed high-side CPU images show the intended joined roof surfaces without the accidental sky-lit hole. The Yonghe forward rounded profile remains intact; Chonghua rear edge now meets the main slope rather than floating above it. Main roof ridge and all hall/courtyard positions remain unchanged.

Final production evidence: `final-independent-checks.json`, `final-section-intersections.json`, `*-fixed-section-*`, `chonghua-high-side-fixed.png`, `yonghe-high-side-fixed.png`, and the courtyard/underside images.

### CPU renderer near-plane caveat

The existing `tests/r49b-plaque-cpu-render.py` discards a whole triangle if any corner is behind the near plane. Very wide hall beams / walls can therefore disappear from oblique close-ups, producing false sky areas unrelated to actual geometry. A scratch-only renderer copy (`render-near-clipped.py`) correctly clips each triangle against the near plane while interpolating UV before rasterization. Prefer the `*-under-fixed-nearclipped.png` images for close-up inspection. This does not turn CPU output into GPU acceptance and does not alter production geometry.

The near-plane-corrected underside images have now been inspected pixel-by-pixel. The former apparent large sky gaps are absent; main head beams, header wall, and enclosed-room ceiling are present. No newly dangling rear canopy tail or exposed cap is visible. The selected oblique Chonghua view correctly includes foreground-column obstruction rather than deleting that column. The final verdict is unchanged: this bounded two-canopy geometry candidate is credible as a reversible model fit, not as a surveyed reconstruction.


## Metadata addendum (2026-10-22 04:32 UTC)

All final perspective-image camera / target / vertical-FOV and orthographic-section plotting ranges are recorded exactly in `final-camera-metadata.json`. Coordinates are building-local, not world coordinates; match these values for baseline/current pairs. All perspective PNGs are 1200 x 900 with world up [0,1,0].

The previously described near-plane limitation remains a historical diagnosis of the old offline renderer only. The owner has now integrated the scratch near-plane polygon clip into `tests/r49b-plaque-cpu-render.py`, confirmed by direct source inspection. New final/baseline images generated by that tool no longer have that limitation. This change affects an offline review tool, not production code/rendering. Previously saved non-nearclipped image files were not silently relabeled or regenerated by this reviewer.

The accepted hashes are specifically the 04:17:16.350641879 UTC Yonghe export and 04:17:15.798634855 UTC Chonghua export. Current reports and retained review snapshots were SHA-256 compared again and are byte-identical. The subsequent helper selector now accepts both roof_*_roof_tile_material and fixture-only roof_*_roof_tile names. The reviewed production meshes use the former names, so this compatibility extension selects the same production roof and does not change the reviewed production geometry. This is a static equivalence check; no new heavy CPU export/run was performed for the metadata addendum.
