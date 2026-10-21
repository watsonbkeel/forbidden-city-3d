# R33 Taihe nearer-beam hanging fit

## Result and boundary

The central plaque now mounts on the south face of the existing nearer central transverse beam. Its centre moves from local z = 5.05 to z = -5.8968 m. Its back face is z = -5.8168 m, exactly the existing beam's south face. The upper 0.50 m of the plaque lies against that beam's vertical face; the rest hangs below it.

This is a reversible, photo-informed ordinal-depth fit, not a surveyed restoration or a claim that the model's S2/S3 labels identify historic mounts. It resolves the old single-depth plaque/couplet projection without changing the exterior, ceiling, column grid or known hanging dimensions. It does not close the underlying metrology gap.

## Evidence actually inspected

- [Palace Museum Taihe description](https://www.dpm.org.cn/explore/building/236465.html), reopened 2026-10-20: six gilded columns, each 1.00 m in diameter, flank the throne; the caisson is above the throne.
- [Official interior photograph 14498](https://img.dpm.org.cn/Uploads/Picture/dc/14498.jpg), linked by that building page. The actual 400 × 267 pixels were inspected. The foreground gilded columns frame an elevated central plaque, while the narrow couplets recede toward the throne. The photograph does not supply camera calibration, finished-floor-referenced mounting heights or uniquely identified model column rows. Inspected file SHA-256: `105ed7ad201efaa8397d9720fb526ba10ad8cf083e67b346c253272c6ce42e12`.
- [2002 plaque/couplet return record](https://www.dpm.org.cn/show/226011.html), retained source evidence: plaque 6.8 × 2.8 m and each couplet 1 × 7.5 m. Those dimensions are unchanged.
- The prior R32 evidence gate established that the old vertical intervals overlap in projection, but their horizontal separation means they do not literally intersect as meshes. This change corrects the mounting-depth composition, not a claimed mesh collision.

## Three evidence levels

1. Published object facts: plaque and couplet dimensions, six nominal 1 m gold columns.
2. Photo-informed model fit: the plaque has its own nearer mounting plane; existing beam depth 0.46 m, plaque thickness 0.16 m, selected beam identity and all numerical mount offsets are inherited/model-fit quantities.
3. Still unverified: surveyed plaque/couplet mounts, exact historic column identities, finished ceiling datum, real camera position and a complete modern room section.

The previous V16 approval-card digest is retained for provenance. The profile explicitly states that this historical card does not certify the new R33 mount.

## Preserved scope

- Plaque bottom/top: 6.4/9.2 m; couplet bottom/top: 0.85/8.35 m
- Ceiling: 9.47375 m; caisson rim/top and location unchanged
- Every column, dais, throne, screen, caisson and furnishing position unchanged
- All collision and walking geometry unchanged by this Taihe fit
- No camera, light, exterior, roof, texture, material, triangle, vertex or batch additions

## Reproducible asset

Run `python assets-src/interiors/fit_taihe_hanging.py` from the repository root. The input is retained `taihe-dais-front-24481a47ba8d.glb`, SHA-256 `24481a47ba8d199679f03c63ca818ef9efec2dff53977e5037e556b128cb9e70`. The script never rebuilds the later sculpting/detail pipeline or alters that rollback asset.

It validates the exact input and frozen R32 profile, permits only this profile delta, identifies 24 backing vertices and 4 lettering vertices with exact source bounds and face membership, and modifies only those 28 Z float32 values. All other binary bytes remain unchanged. Inventory bounds, profile revision/hash, a new hanging-fit source identity and the selected manifest update together. The output is content-addressed; the selected output and hash are recorded in `ASSET-RECEIPT.json`.

Native B geometry already reads the shared profile. The fine S surround installer reads the same coordinates and still finds its exact backing/glyph faces. B remains 1,600 triangles in 8 batches. S remains 17,924 decoded triangles, then 17,938 after its existing frame installer; with the existing 60 central beam triangles it remains 17,998 under the retained 18,000 core-plus-beam cap. Existing separately budgeted coffer/ceiling geometry is not reclassified into that historical cap.

## Verification and remaining visual limit

- TDD: the first five new Node tests failed against R32 for the intended missing depth/identity/geometry changes, then passed after implementation.
- `node --test tests/r33-taihe-hanging-fit.test.mjs`: 9 passed. Checks actual decoded byte scope, profile/marker/manifest agreement, B/S hanging silhouette, beam support, roof clearance, fixed entrance/close/return rays, and actual loader load/unload/failure/cancellation/re-entry with stable navigation.
- `python -m unittest discover -s tests -p test_r33_taihe_hanging_fit.py -v`: 4 passed. Exact regeneration, immutable source, repeat-application rejection, unrelated-profile rejection and retained metadata.
- `npm run build`: passed, with the existing large-chunk warning.
- **Interim integration receipt, superseded by [final validation](../r33-spatial-fit/FINAL-VALIDATION.md):** `npm run test:current-state` on the concurrently integrated R33 tree: 939 passed, 55 failed. Failures include frozen source/product/scene identities and Kunning route fixtures missing `document.createElementNS` during Qianqing texture setup. The Taihe permanent-navigation checks passed. No full-suite pass is claimed. See `CPU-RESULTS.json`; the integrator owns finite historical retention and combined acceptance.

At eye height 1.7 m, the plaque-bottom/couplet-top angular separation is about 3.62° at z = -20, 4.76° at the south entrance z = -18.5, 7.54° at z = -16 and 13.49° at z = -13. These are model projections, not measured photographic angles. Actual ray tests also cover z = -10, -3 and 0; after crossing the front row, the plaque is correctly overhead/behind rather than remaining a front-facing billboard.

The photograph shows additional proportional relationships that this one-depth change does not reproduce. In particular, the photo plaque appears narrower than the receding couplet-centre span, whereas the inherited low ceiling, fixed hanging sizes and existing column span constrain the nearer-beam model plaque to project relatively wider. The clean vertical hierarchy is an improvement candidate; it is not evidence of full photographic agreement. Browser screenshots and whole-scene visual acceptance are deliberately left to the integrator. No new museum photograph is embedded or redistributed as a runtime asset.

### Entrance-side movement risk audit

`ENTRANCE-OCCLUSION.json` records 30 actual built-hall eye positions and nine plaque-face ray samples at each. At the south entrance z = -18.5, x = 0, ±2 and ±6.2 all have 9/9 unblocked samples. At z = -16 and x = ±6.2, an existing front red column blocks 3/9 samples. Outside the facade at z = -22 and x = ±6.2, existing columns and door/lattice geometry block the plaque. No tested ray is newly occluded by the ceiling or central beam.

There is a significant near-view framing tradeoff. With the unchanged 70° vertical FOV and a level north-facing camera, the plaque top is at NDC y = 0.86 at the entrance, 1.07 at z = -16, and 1.53 at z = -13. At z = -10, even its bottom is above the top of the frame (NDC y = 1.67). The player must look upward as they approach this nearer mount. This is camera-field cropping caused by genuine overhead geometry, not roof penetration or a new occluding slab. Visual review should explicitly check the first 3–6 m of entrance movement and both side approaches before accepting the fit. No automatic camera or navigation adjustment was added to conceal this tradeoff.
