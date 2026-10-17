# 弘义阁 / Hongyi Pavilion — V4 measured profile

## Evidence and scope

- [Palace Museum building entry (S13)](https://www.dpm.org.cn/explore/building/236491.html), reviewed 2026-10-14; [its own front photograph](https://img.dpm.org.cn/Uploads/Picture/dc/1980%5B1024%5D.jpg). The photograph's capture date is unknown.
- 杨新成,《故宫弘义阁、体仁阁研究》,《故宫学刊》2006, [official PDF (H01)](https://www.dpm.org.cn/Uploads/File/2019/11/14/u5dcd2fd72ceee.pdf): Hongyi Figs.1,3,5,7,9,11, printed pp.170,172,174,176,178,180; PDF pages49,51,53,55,57,59. Dimensions are column centerlines in millimetres, converted to metres.
- This increment replaces the inherited 39.2×12 m generic double-eave hall with a source-era, two-storey pavilion. It does not establish 2026 current condition or museum access permission. Museum photographs/PDF pages are research references only and are not runtime assets.

## Independent geometry

| Object | Hongyi constraint | Status |
|---|---|---|
| Lower principal grid | 43.680×16.704 m; width intervals4.320 / 4.768×3 / 6.432 / 4.768×3 / 4.320; depth4.320 / 8.064 / 4.320 | Dimensioned, Fig.1 |
| Upper front enclosed shell | Nine intervals2.200 / 4.760 / 4.760 / 4.860 / 6.260 / 4.860 / 4.760 / 4.760 / 2.200, total39.420 | Dimensioned, Fig.5 |
| Upper rear enclosed shell | 39.520 m, derived from rear outer-support42.336 minus2×1.408 | Derived, Fig.5 |
| Upper front/rear depth lines | −6.220 / +6.208; exterior support lines−7.628 / +7.616 | Derived, Fig.5 |
| Upper front openings | Central seven intervals35.020 m;28 leaves; two additional closed end intervals | Derived dimensions / evidenced topology |
| Gallery posts | 24 square supports: ten front, ten rear, two intermediate per end | Evidenced topology |
| Waist outer support spans | Rear41.600; depth14.496 | Dimensioned, Fig.3 |

The upper shell is not lowerWidth×7/9. Front and rear chains are retained separately. Plan u runs page-left to page-right; localX=−u and localZ points rearward. The inherited anchor stays x102.1,z−110.4, facing east, with no georegistration claim.

The Hongyi front outer-square-post width is separately unknown. Geometry provisionally adds1.408 m to each end of the front principal chain, producing42.236 m; this is not promoted to a surveyed width. The waist front printed total40.573 conflicts with the chain sum41.587. Its implementation adopts the coherent rear41.600 provisionally and preserves the conflict. Individual waist-post positions are proportionally mapped, not individually surveyed.

## Datums and evaluated surfaces

Front court is chosen as worldY0; lower interior floor is therefore+3.800. Survey references are relative to that interior floor:

- Central terrace spot−0.100 → world3.700; the separate−0.190/−0.240 side spots remain in metadata. A flat terrace at3.700 is an explicit simplification.
- Lower eave+6.285 → world10.085; actual upper wood floor+9.640 → world13.440.
- Upper eave+13.580 → world17.380; main ridge-cap crest+20.110 → world23.910.
- Rear ground−3.770 → world0.030 is retained as a measured datum; this bounded change does not remap global courtyard terrain.

Tests inspect physical floor surfaces, lower eave midpoint and generated upper eave vertices and a vertical ray onto the central ridge-cap crest. Eave marks are not column tops. RoofBuilder base/height are calibrated independently. Fig.11 places+20.110 on the continuous main ridge-cap crest, above the tile meeting surface and below source chiwen. The model's tile peak is lowered by the generator's3.324×ridgeRadius cap rise so the actual central crest, not that tile peak, matches23.910. The shared low-detail roof omits chiwen; ornament-height fidelity remains unresolved. The museum's23.8 m overview has unspecified endpoints and is not used to force the model bounding box.

The upper floor, nine-interval enclosure, four-sided square-brick gallery, stone coping, wooden rail, glazed hanging fascia, principal continuations, waist short columns and bearing beams are separate systems. Lower end/side/rear walls remain solid; the rear is not a copy of front windows. The lower eave has its own supported bracket ring and annular roof. Gallery paving uses the existing shared square-brick floor resource; detailed brick/wood colors and patterns are simplified.

## Terrace and playability

H01 pp.138–139 jointly describe both terraces as approximately63.3×27.5 m, about3.7 m above the front square and0.9 m above adjacent verandas. This model explicitly adopts that shared narrative rectangle, with provisional rear offset and boundary corners, rather than claiming two independently measured footprints.

- Toward Taihe square: two real32-tread front flights flank an approximately2.3 m imperial carved strip. Flight widths2.6 m and run10.24 m are provisional. Both flights independently reach the single lower central doorway; the carved strip has physical sloped collision and no playable ramp.
- South steps and north ridged incline are about4.9 m wide by shared narrative. Short provisional runs descend to guarded2.8 m landings. These are usable to the guards; onward veranda/corridor elevation connectivity is deferred. The guards are game-safety geometry, not verified2026 visitor barriers.
- No invented public upper staircase, upper teleport or rear doorway. Elevated walk surfaces cannot rescue ground-level visitors upstairs. Explicit enter:true opens only the lower double door and registers one lower room.
- Only the adjacent western wall segment physically replaced by the closed pavilion shell is cut:43.180 m, not the63.3 m terrace width. Only the two touching corridor endpoints are shortened toz−142.850/−77.950; their elevations stay unchanged. Tests assert exact helper/JSON agreement and blocked ground/terrace-height rear approaches.

## Interfaces and limits

`pavilionGeometry(item)` in `PavilionProfiles.js` returns measured/derived grids, independent elevations, provisional outlines, exact room bounds, both front-flight local/world point paths and side-landing extents. `buildSurveyedPavilion` consumes this record. Batched `userData.architecture` preserves it. Shared library materials/textures are never disposed by the pavilion; kit-owned resources are released normally.

Roof outlines, deck outside edges, gallery outward slope, structural joint thicknesses, column/railing detail, terrace offsets, side-connector placement and carved decoration remain provisional. Exterior rail0.800 m above coping and hanging fascia0.765 m use Hongyi's own Fig.7; these dimensions are not copied as measurements to Tiren. Current rear photographic acceptance remains UNKNOWN.

Focused verification: `node --test tests/current-state/surveyed-pavilions.test.mjs tests/current-state/tiren.test.mjs`. Component CPU front/rear/oblique/gallery/above/side/section views inspect actual triangles only. Final textured-browser, same-camera and original performance-budget acceptance is a separate V4 release gate.

The waist load path includes two explicitly provisional bearing tiers: transverse timber ties bear on the actual lower perimeter beams, principal continuations support longitudinal beams, and transverse/cantilever beams carry all24 short posts. Per-post contact rays and beam/column intersection tests guard against floating members. The short-post base is adopted as upperFloor−2.2 m and is deliberately separate from the measured stair-landing annotation. Neither tier's joint height, section or individual member position is claimed as surveyed.
