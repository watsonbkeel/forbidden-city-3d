# Qianqing screen material sample (R32 follow-through)

This is an original AI-assisted illustration, not a photograph, measured paint
scheme, conservation record, artifact facsimile, or evidence for dimensions.
It replaces the earlier repeated mathematical scrolls on five screen faces.

## Evidence and limits
- Official overview: https://img.dpm.org.cn/Uploads/Picture/dc/1523%5B1024%5D.jpg
- Official upper detail: https://img.dpm.org.cn/Uploads/Picture/dc/2568%5B1024%5D.jpg
- Building context: https://www.dpm.org.cn/explore/building/236472.html
- The photographs support five articulated gilded screen divisions, warm brown
  recesses and pale rose vertical inset areas. They also show a light front-table
  cover, a dark top cover and two hanging dark bands. The published image date
  and current temporary arrangement are unknown.
- The generated dragon anatomy, number and placement, cloud forms, relief
  shading and surface wear are invented approximations. The inset is blank:
  no guessed inscription is supplied. Repetition of this one material across
  five panels does not reproduce the individual artifacts' carving.
- Original photography is a reference only and is not shipped as game texture.
- The front-table folds and cream RGB values are visual trial parameters,
  implemented in the existing canvas. They do not establish textile type,
  conservation color or measured fabric folds.
- The screen outlines, structural anchors, plaque/frieze geometry, illumination,
  table envelope, navigation exclusion and far/near budgets are unchanged.
  The red frieze's old abstract ornament remains a known limitation.

## Production
Built-in image generation was used once, with the exact PROMPT.txt and the
official overview as a reference. generated-original-r32.png is preserved.
An engineering resize/WebP encoding produces a 512×1228 resource; runtime
drawImage fits it into only the left 192×256 pixels of existing atlas cell 0.
The right 64×256 pixels retain a separate copy of the previous chair design,
at reduced horizontal resolution; it is not a pixel-identical old rendering.
The five screen front UVs use the left region; the chair uses the right region.
Every other atlas cell and the two response maps are untouched by image loading.
No extra GPU texture, material, mesh or triangles are added.

Source PNG SHA256: 0836d3fe251185512d19c3617abec2ed158ce5b036ab9f8f448012ac3095f737
WebP SHA256: 2fc0c55dc88a0190e3a38fdf84888e6eb2603bfbec1f853010685c2be0e676a4
WebP bytes: 197212

Failure retains the independently scaled deterministic fallback. Disposal
prevents any late load callback from repainting or reviving the atlas.
Near and far geometry share the same material and loading result.
