# 撷芳亭 source and fitting boundary

- Official description: https://www.dpm.org.cn/explore/building/236493.html
- Official image: https://img.dpm.org.cn/Uploads/Picture/dc/1983.jpg
- Image SHA256: 9d87339ee585aa1ef607a2effa80cdaa7baf93a025ddc675409eaf536c522669. Native267×400 pixels. Photography date is unknown. Implementer directly inspected actual pixels on2026-11-04 at22:22UTC.
- Local research handoff: r165-xiefang-research-2219/RECOMMENDATION.md and sources.json. These are research evidence, not acceptance.

Official236493 identifies a four-corner pointed pavilion on a rock hill in the first court southeast corner, south of Yizhai, green tiles with yellow eaves/ridges, hanging frieze and white-stone bench balustrades. Actual image additionally supports red posts and a visibly raised stone setting. Trees and low image resolution obscure much of the detail and back side.

Implementation fits: center(-267.3,357.3), platform top1.8m,4.2m square,3.6m post span,6.1m eave,2.65m roof half-width,12×.15m risers/.32m treads,1.4m side-flight width. These are GAME_FIT_NOT_SURVEY. Full-width2.7×1.7m landing is a safety connection, not evidence of the original winding path. Reserve x[-272.2,-263.8], z[352.5,361.5], y[.001,8.5] protects the old Yizhai z362.7 approach and x-260.5 bypass.

Only a limited closed faceted rock support, red-post square pavilion, simplified hanging frieze, green/yellow roof, white-stone bench rails and safe side steps are built. Full winding hill paths/caves, planting, detailed carving/paint, hidden interior and plaque text are not inferred. No new map item, room or teleport destination. wholeObjectAccepted=false, surveyed=false, currentAdmissionVerified=false. Browser, actual GPU and mobile are not verified.

Photo silhouette follow-up: the initially straight eave model was not accepted as the final silhouette. A local shared roof-height function adds0.32m at each corner with (|x·z|/R²)² weighting, leaving each edge midpoint unchanged and smoothly turning the outer diagonal upward. Green and yellow skins use that exact function; their closed thickness and triangle contacts remain real. The0.32m is a photograph-informed fit, not measured original curvature.
