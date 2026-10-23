# R61-D first local batch, not whole D acceptance

The full D32 / 440 feature checks and five declaration audits remain required.
A-C residuals stay open. The predecessor is frozen R60 f069226.

## 乾清门 FC-CA87A141EC: two south window groups

Reference: [official building page](https://www.dpm.org.cn/explore/building/236473.html)
and source 1/3 in SOURCES-VIEWED.json, actually viewed. Capture dates unknown;
2020-11-17 is the URL date, not a claimed photograph date.

Observed: each south end bay has a broad/tall middle frame and two lower/narrower
side frames. Existing actual model: an equal-height full-window lattice and a
central mullion. Change: the south outer surface of just these two windows.
Preserve old opaque backing, coarse lattice pitch, all north/inner faces, rear
windows, sill, shell, roof, screen walls, plaque, three rear doors and access.
New frame fractions .22/.50/.22 with gaps, side height .90 are photo fits, not
survey measurements. Small joint profiles and precise lattice count are unresolved.

Actual before/after local CPU images:
- reports/r61-d-stage/before/qianqing-gate-south-window.png
- reports/r61-d-stage/south-windows-03/qianqing-gate-south-window.png
Camera and source SHA metadata sit beside each image; view is not whole-world or
browser proof. The renderer now resolves actual multi-material groups and solid
batch vertex colors. It omits WebGL PBR, normal-map shading and shadows.

Validation: five actual-geometry checks passed. Raycasts hit the new frame tops;
every triangle outside the two south outer window bands preserves attributes and
position; all navigation and retained metadata are exact R60. Rear and inward
faces explicitly retain old geometry. No new material, texture or draw group.
Gate total: 14400 -> 14568 triangles, +168. A first denser proposal added840 and
failed the new bounded-cost check; retained prototype commit7d1e95e. A subsequent
infill was caught extending beyond the old window band, and narrowed rather than
weakening the retention assertion. Both failure logs and candidate02 source remain.
The final five checks do not supersede unrelated historical test expectations.

## Next actual source/model difference

The official rear-plaque close-up visibly has square painted coffers. The current
CPU diagnostic shows exposed repeated narrow roof strips instead. This is a known
source-supported difference, not BLOCKED_SOURCE for the visible area. A localized
ceiling plan must first account for the retained plaque top and roof underside;
the close-up cannot establish the count/extent of the entire gate ceiling.
The already correct rear-eave doors, 5x3 regular-grid fit, imperial stone/stairs and
folded walls are not reimplemented or counted as new work.

Next other object: independently inspect 坤宁门 official front/label photos and
its actual generic hall-gate footprint/orientation. Do not duplicate existing halls
for unbound room labels. No D object is newly ACCEPTED at this checkpoint.
