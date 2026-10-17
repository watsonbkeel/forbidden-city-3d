# Taihe caisson shell: bounded source-informed replacement

## Evidence and limits

The Palace Museum's [Taihe building description](https://www.dpm.org.cn/explore/building/236465.html) and [interior reference photograph](https://img.dpm.org.cn/Uploads/Picture/dc/1602%5B1024%5D.jpg) are research references. The photograph was visually inspected alongside the current upward gameplay screenshot. Its useful architectural cues are nested square/octagonal framing, diagonal divisions around the centre, recessed triangular fields and concentric mouldings. The existing broad uninterrupted ramps and sixteen slender radial sticks do not communicate those cues well.

This is self-authored simplified geometry, not photo tracing, a surveyed reconstruction or a claim to reproduce the original figurative carving. No museum image is included in runtime assets. All ledge widths, fascia heights, inset ratios, recess depths and intermediate elevations below are visual authoring estimates. The existing provisional interpretation of the nominal 6 m span is unchanged.

## Replacement ownership and interface

`build_shell(c, quality='detail'|'fallback')` returns indexed vertices and triangles, per-triangle normals and material keys, semantic parts and metadata. It does not mutate the profile, import Blender, create a scene, change a material, or edit the independently authored dragon. Existing `geometry.material_batches(mesh)` can encode its return value.

- Detail replaces precisely the three old tier surfaces (192 triangles) plus sixteen approximate ribs (128 triangles). The replacement is 472 triangles, a net increase of 152; its ceiling is 512.
- Fallback replaces precisely its three old tiers (48 triangles) with 48 triangles, keeping the existing 1,596/1,600 total allocation available to the integrating owner.
- Existing outer square rim, separate upper cap, dragon, pearl group, anchor, other hall geometry, navigation and lighting stay owned by their original components.
- Only the existing `gold` and `darkGold` material keys are used. This creates no new material batch.

This is a replacement annulus, never an overlay. The top opening is intentionally uncapped in this module because the original cap is retained separately.

## Geometry

Detail has stepped square ledges, four recessed triangular corner panels and four recessed trapezoidal side panels, an octagonal ledge and fascia, and two inner concentric stepped mouldings. Panel borders and reveals share indexed edges; there are no coincident appliqué faces or unsupported sticks. Homothetic inset polygons and a 0.06 m authored upward recess make each panel floor and reveal genuinely planar. The inset ratios are 0.87 and 0.82, both authoring choices.

The circular inner bands use sixteen sectors for economy and connect explicitly triangulated transitions to the exact retained thirty-two-sector top boundary. Nonparallel transition edges are handled as deliberate triangle facets, not warped quads given cosmetically averaged normals. Concave projected quadrilaterals use an interior diagonal. Intended planar quads are asserted planar during construction.

Fallback keeps a simplified diagonal frame inside its square opening and an eight-sided inner recess. It deliberately omits the detail panel relief. Its four contour transitions use 12 + 8 + 12 + 16 = 48 triangles.

Both qualities are continuous open annuli. Shared edges have opposite traversal; their only boundaries are the retained square opening and retained top circle. Detail preserves every old 32-point boundary position; fallback preserves its old 8-point boundaries. The authoring envelope remains X = ±2.84 m, Z = 9.51 ± 2.84 m, Y = 9.59375 to 11.24375 m. Intermediate surfaces need not coincide with the removed ramps, but remain inside the unchanged opening footprint and vertical envelope.

Face winding and flat geometric normals point down into the room or inward into the cavity for vertical fascias. No DoubleSide setting, negative scale, normal smoothing or shading-only repair is required.

## Verification and visual inspection

Focused command: `python assets-src/interiors/taihe_caisson/test_shell.py -v`.

Eight focused tests passed after the implementation. Tests cover deterministic counts and output, profile immutability, finite unique vertices, nonzero area, no duplicate triangles, normal direction, exact open boundaries, consistent shared edges, planar intended panels/reveals, no nonadjacent 3D surface intersections, and no positive-area projected overlap even for vertex-adjacent faces. Total projected area also equals the square opening minus the retained top polygon. Actual triangle-to-triangle distance is checked separately against the current dragon at each quality.

At this checkpoint the minimum shell-to-dragon clearances are 0.1488267319 m detail and 0.2893127902 m fallback, with zero intersections. These are measured distances between the two authored meshes, not dimensions measured from the historical building. Integration should rerun the focused tests if the dragon changes.

A CPU-rasterized four-view diagnostic was generated and actually opened for inspection: straight-below detail shell, below-front detail with current dragon, straight-below fallback, and oblique side silhouette with current dragon. It uses backface culling and geometric flat normals. The nested diagonal panel boundaries and concentric mouldings remain distinct in both below views; the oblique view shows real stepped relief and a separated dragon. The isolated diagnostic omits the separately retained rim, cap and pearls. Its research output is `palace-r3-taihe-caisson-shell-diagnostics/shell-below-front-cpu.png` beside the project workspace.

The owner remains responsible for the full project suite, GLB/fallback integration, decoded-geometry checks, ordinary-camera browser acceptance and publication. This module's CPU result does not claim those checks were run.
