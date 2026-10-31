# Offline roof section stages 1–2 (2026-10-31)

This is an uninstalled numeric/surface candidate, not a roof repair in the building. The repository runtime remains the exact 600 src/data files of b9863902. Four new offline scripts/tests exist; no installer, body, walkable, support, controller, layout or World changes exist.

## Actual evidence
- Task1 final 11/11, independently repeated. Earlier 6/6 and 9/9 did not reject specified wrong numerical implementations; they remain explicitly unaccepted regression-oracle stages. Independent canonical oracles now reject all six locked mutations (profile/eave/O/D/lift exponent/soffit sampling). The real implementation's only corrections were routeAccepted=false and rejecting overflowing UV results; no current profile-shape error was established.
- Task2 final 7/7, independently repeated. Ten layers (four pavilions × two, two wings × one), each mode 7,160 nonzero Float32 triangles. Lower640/upper760/wing780 per layer. Two hundred analytical t0 degenerate triangles removed per mode (lower0, upper40 each, wing20 each), and unreferenced vertices pruned. This is an explicit topology change, not original triangle-byte retention.
- First six surface tests missed an interior missing triangle and a shortened drawRange. Both old false-green mutation records survive. The added independent full-cell triangle multiset, exact deletion ledger and drawRange/groups contract now reject those two mutations. Merely validating surviving vertices is not complete surface validation.
- Actual bearing rows/edges are present in tile and soffit, with independent shifted-underside/deleted-triangle controls and a source-level missing-tw negative. fanY is a reference plane only; no enlarged actual fan/beam/bracket exists here.
- Named no-lift profile anchors retain the pinned recipe. Maximum separately measured double-precision lift Y difference from the old-parameter section is approximately 0.09614387 m. Independent Float32 conversion error maximum is approximately 1.8516e-6 m. Neither means every actual Y is unchanged, nor is the double ledger a Float32/world-vertex delta.
- Both modes use the same uninstalled reference XZ; predecessor mode is old-parameter resampling, not original building placement or original RoofBuilder mesh bytes. Wing: local base6.5 → Float32 → parentY12.3/Ryπ/2; pavilion Y already component-local, parentY0.
- UV retains centred no-lift tangent U and approximate no-lift profile arc V (64 intervals plus exact tw, nonuniform interpolation), not lifted geodesic distance. Fascia retains the old non-fully-metric V despite .03 top offset. Unit and non-unit actual UV tests run; no TextureLibrary/image/GPU acceptance.
- Shared borrowed materials are not disposed; owned geometries are disposed once, including allocation failure and throwing disposal listeners. The code is an offline trusted numerical builder, not a hostile-JavaScript sandbox.

## Still not implemented or verified
Trim (hips, lower surrounding ridge, wing ridge, pavilion finial), fan/beam/caihua/brackets, 104-column reassembly, transverse-link physical migration, NE enclosure, eight unresolved interfaces, actual upper/platform bearing and platform FP, architectural entrance/exit, World/full/batch/build/GPU and release. No new whole object is accepted. Inherited 10 missing-history refs/38 unexecuted titles and prior full213/batch10 reds are not resolved here.

## Save gate
Independent Task1 report a75ebdd850add159dd1ccc4caa979f300f55f7528c7295e5b155a41ec67a630f and Task2 report 9026fdb82aa8a85ab1f315a32c568797a0422df68b70f4ec2cd00f99e574315e support only these bounded stages. Combined selected 48-test rerun is awaiting a coordinated slot; do not claim it ran based on adding prior denominators. Remote backup is a separate pending step.
