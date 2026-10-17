# Taihe indoor enamel cranes: bounded silhouette candidate

This candidate preserves the preceding ceiling, caisson, throne and open screen-crown work. It refines only the two indoor enamel crane furnishings: rounded long-oval bodies, slender gently bowed necks, compact heads, low oval crowns and close folded wings. Geometry is original simplified modelling, not a traced museum scan or exact feather carving.

## Evidence

- Huo Haijun, museum conservation study (1995; examination in October 1992): [museum entry](https://www.dpm.org.cn/enamels/talk/203378.html), [page 40](https://www.dpm.org.cn/Uploads/pdf/1527/T00040_00.pdf), [page 41, Fig. 1](https://www.dpm.org.cn/Uploads/pdf/1527/T00041_00.pdf).
- [2014 museum maintenance account](https://www.dpm.org.cn/classify_detail/180964.html) explicitly identifies the pair of indoor enamel cranes.
- [Museum guide hosted in May 2025](https://young.dpm.org.cn/uploads/1/file/public/202505/20250516181259_97digy9q27.pdf), PDF page 6, shows the installed pair. Photo capture date is unknown, and the picture cannot calibrate exact colour fields or dimensions.

The conservation account describes copper-bodied enamel with gilding, white and green feather decoration, and a dark-red low oval crown. It records a sound-producing mechanism that can move the lower beak. These are indoor enamel furnishings, not the outdoor bronze cranes. This candidate does not animate the historical mechanism.

## Dimensions and uncertainty

The previously implemented reported height of 1.68 m excluding the wooden support, 0.45 m legs and 0.17 m lower beak are retained. The source has no modern survey tolerance. Current positions (X ±2.80 m, Y 2.06 m, Z 10.20 m), wooden support height (0.10 m), overall authoring envelope, body proportions and exact colour fields remain estimates. Green wing fields are a retained simplification, not independently verified pigment boundaries.

All other furnishings and building geometry, lighting/material factors, navigation, collision and floors stay unchanged. No museum imagery is embedded in the application. Research images remain evidence only.

## Implementation and acceptance

Only the five named crane components are replaced. Exact source-owned index retirement preserves every prior attribute byte and all unrelated index order. New smooth normals are local to individual curved components; hard caps and seams are not globally welded. The existing translated teal batch is retained, with new positions converted into its fixed local frame.

Retirement is 374 triangles for the pair. The replacement target is 544 triangles, net +170: 17,770 → 17,940 triangles in the same eight batches. The original 18,000 ceiling is unchanged. Coarse fallback remains 1,596 triangles in eight batches.

Source and CPU validation precede one ordinary native-input eye-level image check. Final image, partial route outcome and any environment limitations are reported with the delivered package. This document does not itself assert that visual, full-route, mobile or performance acceptance passed.
