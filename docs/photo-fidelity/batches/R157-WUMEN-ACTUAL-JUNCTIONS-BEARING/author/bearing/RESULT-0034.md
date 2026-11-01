# Task 4 geometric subgate — actual shaft bearing diagnostic

This uses the complete uninstalled Task 2 assembly, not the previous retained188-column scene. Membership is exactly **52 retained main +104 perimeter +24 transverse-link shafts =180**, all unique actual meshes. Eight unresolved interface references are not columns. All187 slab top patches are recovered from their actual two drawn upward triangles (indexed or nonindexed; this candidate is nonindexed); no authored bbox is substituted for a missing top face.

Final author tests: **8/8**, exit0. Missing-module startup red is a single file failure, not eight executed assertions. Stub round is2/5; the first one-ULP slit probe is a real assertion red. The initial partition used a floating midpoint that could round onto a covered boundary; the correction tests full partition-cell endpoint containment and retains that positive slit without tolerance. Later finite/convex input guards have their own red. The full actual component test also moves a shaft200m, removes visibility of a slab and checks actual source/registered-row identities remain unchanged by ordinary auditing.

The final actual capture completed in1.010s, maxRSS298756KiB,384MBheap. Excluding only resource timing fields, final0034 data are deeply identical to original0033 data. Old source600 and prior QA4430 are unchanged; two new offline files produce4432. No runtime source or visible building geometry is edited.

## Actual result, not a pass of the support gate

- **16** actual shaft footprints have a strictly positive computed horizontal uncovered area:8 main,4 wing perimeter,4 transverse-link.
- **6** exceed the historical1e−8㎡ reporting threshold. This is a display threshold, not an acceptance tolerance.
- Maximum uncovered area is **4.5571049968953795e−8㎡**.
- All **2340** centre/actual-bottom-ring-vertex rays hit an actual slab. This deliberately does not override the full-footprint gaps.
- Maximum absolute actual vertical residual is **9.894371011398562e−8m**; vertical residual and horizontal coverage are separate ledgers.

Every positive gap polygon and partition cell is retained. An independent exact-binary-rational audit has reproduced the16/6 counts and maximum, with maximal numerical area error about1.62e−22㎡. This shows the positive gaps are actual transformed-mesh seams, not cancellation noise. The old188 audit34/20 and330 shared-edge ledger remain historical evidence of a different column inventory; they are neither overwritten nor mechanically carried as the new expected counts.

No floor, provider tolerance, body lowering, invisible support, interpolation or coordinate snapping is added. This diagnostic does not establish complete bearing, load capacity, structural joinery, usable terrace routes or a collision installation. The genuine Task3 large joins/penetrations/unresolved records are unchanged. Any shared-boundary geometric repair must be an explicit later visible-geometry/collider/support decision; nominal support rows must not quietly cover the uncovered real footprint.
