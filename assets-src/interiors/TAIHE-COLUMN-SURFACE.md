# Taihe column surface candidate

This is an AI-generated decorative interpretation with self-authored technical sampling for source/CPU review. It is not a measured reconstruction of any dragon motif, a facsimile, or a claim that the current museum interior has been reproduced. Runtime appearance, near-dais views, antialiasing and GPU performance remain to be reviewed in actual scene images.

## Evidence and rights

The Palace Museum's [Taihe Hall description](https://www.dpm.org.cn/explore/building/236465.html) describes six columns of 1.00 m diameter, raised painted/gilded cloud-and-dragon decoration (沥粉贴金云龙图案), and two shades of gold leaf used to distinguish the pattern. This supports shallow raised decoration and two-tone organization, not deep modeled carving or a particular inferred relief depth.

The official [throne photograph](https://img.dpm.org.cn/Uploads/Picture/dc/1606%5B1024%5D.jpg) was inspected for broad surface hierarchy. The official [caisson photograph](https://img.dpm.org.cn/Uploads/Picture/dc/1602%5B1024%5D.jpg) was inspected as context only; no caisson change is included. Capture dates are unknown. Cached reference evidence was inspected on 2026-10-16; image reuse permission is not established. No photograph pixels, panorama tiles, traced outlines, downloaded fonts, or external image files are included in the atlas or runtime assets.

The original generated PNG, exact prompt and generation provenance are retained under `taihe_column_art/`; the PNG is unchanged and never imported as a runtime image. The deterministic Node bake area-prefilters its artistic grayscale luminance, periodicizes a narrow edge band and emits a base64 byte module. No image-generation claim establishes physical depth. The implementation, bake and UV authoring helper are self-authored under the repository MIT license.

## Narrow scope

- All 12,128 S triangles and 1,558 B triangles, positions, normals, material factors, registrations and semantic bounds remain unchanged.
- The existing six sparse shallow relief patches per shaft remain. They are not accepted as authentic carving and may still read as scratches in scene images.
- New UVs apply to the six shaft sides and existing gold relief only. Gold caps, throne, caisson, display objects and every other gold triangle explicitly receive constant neutral UV `(0, 0)`.
- The permanent navigation, bases, lighting/environment, glyph atlas, ceiling opening, caisson anchor and eight material batches are unchanged.
- All six columns use the same authored cylindrical phase. This is a model convention, not surveyed arrangement.

## Texture contract

Two deterministic 256 × 512 RGBA8 DataTextures are generated once on first fallback-material construction from the embedded 224 × 480 intensity field. The only runtime unpack is synchronous base64-to-byte conversion; there is no PNG/JPEG decoder or image request. CPU pixel data is cached; no network request, asynchronous path or per-frame generation is introduced.

1. Color modulation is sRGB. Neutral is exact white `(255,255,255,255)`.
2. Packed data is NoColorSpace: R is artistic bump intensity, G is the roughness multiplier, B is unused. Neutral is `(0,255,0,255)`.

The packed texture is shared by `bumpMap` and `roughnessMap`. Bump scale is the r162 shader multiplier 0.0015, not a displacement or measured decorative thickness. The shader uses screen-UV forward differences and normalized position derivatives, so this number must not be interpreted as 1.5 mm of physical relief. It changes shading only, never silhouette, positions or collision. No tangent attribute, normal map or shader patch is needed. Constant neutral UV produces zero bump derivatives, while white color and unit roughness modulation preserve the original noncolumn factors.

UV U spans 1/16 to 15/16 across one circumference and V spans 1/32 to 31/32 from shaft bottom to top. The source field uses a 12-pixel symmetric cubic edge blend, with two identical texels at each boundary for a zero-gradient join. Explicit periodic angular gutters exist at every patterned mip. This enforces numeric continuity, but the stretched/paired edge detail remains visible in the offline art and is not accepted as compositionally seamless in scene. Coarse mips with width below 32 are entirely neutral to avoid cross-island contamination; distant column pattern therefore fades toward the original material. Texture wrapping stays clamp-to-edge. The Blender helper precompensates V for glTF export, and runtime DataTextures use flipY=false. The glyph atlas keeps its independent pre-existing convention.

The original gold factors are unchanged. An ordinary color map only preserves or darkens these factors; this candidate does not claim to restore brighter golden luminance. Metallic response and local contrast need actual-image review.

Fallback owns and disposes both textures once. Loaded S gold materials reuse those exact texture identities, with runtime-only ownership tracking. Unload, cancellation and rollback do not dispose fallback textures. Asset extras cannot forge the disposal exemption.

## Budgets and reproduction

- S: 12,128 triangles, 8 batches, unchanged
- B: 1,558 triangles, 8 batches, unchanged
- New texture mip chains: 1,398,104 bytes
- Existing 1024² RGBA glyph full mip chain: 5,592,404 bytes
- Combined core texture allocation: 6,990,508 bytes, below both 8 MB and 8 MiB
- Additional embedded GLB texture bytes: zero
- Embedded intensity module: 143,743 bytes raw / 98,726 bytes gzip
- Runtime atlas images downloaded or decoded: zero
- Original generated PNG: 3,091,067 bytes in authoring sources only, excluded from public/dist
- Cached CPU pixel arrays: 1,398,104 bytes
- Temporary float field: 430,080 bytes; temporary decoded binary string: 107,520 code units; embedded base64: 143,360 code units
- Measured Node v24.19.0 atlas generation: cold 43.1 ms, warm median 30.3 ms; byte-unpack-only warm median 0.35 ms. Browser startup, GPU frame cost and engine-specific allocation overhead are not measured

Rebuild the byte module with `node assets-src/interiors/taihe_column_art/bake.mjs [output-module.js]`. The existing installed Playwright-core PNG codec is used only by this offline Node tool; no new dependency or browser is required.

Generate the GLB with Blender using `blender -b -P assets-src/interiors/taihe.py -- /absolute/output.glb`. The selected asset name and SHA-256 are in `data/interiors/taihe.json`. That file also records the new UV helper and atlas-source SHA-256; the GLB contract records the helper SHA-256 alongside the original entry-point/profile hashes.

The old protected fixtures/hashes are not regenerated. Tests remove only the exact documented new source hunks and approved gold UV fields before applying inherited byte/geometry comparisons; independent tests then check those UV fields and texture pixels themselves, including negative probes and lifecycle cases. Browser/runtime acceptance remains pending.

## Offline export ordering caveat

The selected GLB bytes are content-addressed and frozen. Repeating the same Blender export produced identical glTF JSON and identical vertex/normal/UV buffers, but a different ordering of the same exact triangle-index triples in the opaque `taihe_pearl` batch (accessor/bufferView 21). This candidate makes no claim of bitwise deterministic Blender export. A strict comparison verifies that this is the only changed buffer, that its triangle-index multiset is identical without reversing winding, and that the pearl material is opaque. No canonicalizer or geometry rebaseline is introduced. The built distribution copies the selected GLB byte-for-byte. In-scene equivalence remains subject to the later visual gate.

## Local material-response trial after 665ce936

`TaiheColumnResponse.js` adds stock runtime Float32 RGB vertex colors to the existing gold mesh. The visual-trial pre-map linear target is (.65,.43,.10), divided by the actual S/B linear material factor; no sRGB/hex conversion is applied to the gain. Decorated shaft and retained relief vertices receive that constant gain. All caps, throne, caisson and display gold vertices receive exact (1,1,1). The existing material factors, Uint8 sRGB color atlas, glyph atlas, metalness, bump multiplier, geometry, UVs, GLB and global lights/exposure remain unchanged. This intentionally changes shaft base response rather than claiming a measured gold optical model.

Only the packed G response changes, from 1−.20h to .54+.28(1−h) on patterned texels and periodic gutters. Neutral samples remain G=1. The base-level effective roughness is approximately .292–.426 before geometry roughness. The neutral coarse mip tail still removes ornament, but the vertex gain remains: distant shafts retain the warmer base while roughness returns to .52. This differs intentionally from the first candidate returning entirely to its original distant shaft response.

The selected GLB remains byte-exact. Gains above one are runtime-only attributes, not exported glTF COLOR_0 data. Effective linear base components remain below (.65000003,.43000002,.10000001), including Float32 rounding and every mip. The existing S/B blue-factor mismatch is compensated on decorated vertices only; noncolumn factors are untouched. Mathematical neutral response is preserved; source/CPU tests cannot promise framebuffer bit identity after a shader-define change.

The S gold array is 18,146×3×4 = 217,752 bytes; B is 1,446×3×4 = 17,352 bytes. When both owned geometries remain resident, total added CPU arrays and GPU vertex payload are each 235,104 bytes. No additional texture, fetch, image decode, material, triangle or draw batch is introduced. Stock USE_COLOR adds one RGB vertex attribute/varying and fragment multiplication. Each geometry owns its buffer and disposes through the existing owner; repeated binding validates and reuses it without compounding gain. The installer rejects mixed neutral/decorated triangles, malformed UVs, foreign color buffers, changed owned buffers, and extra same-material aliases within the complete owned root before enabling vertexColors. No generic shader hook or global material scan is used.

A source-only lighting audit found that pinned Three 0.162.0 consumes material.envMapIntensity (default 1), not the assigned scene.environmentIntensity=.6. The existing exterior PMREM was captured before palace construction. Those global settings were not changed. This material trial therefore remains an authored appearance hypothesis; official photos support raised painted/gilded, two-tone cloud-dragon decoration but cannot calibrate these numeric values. The earlier ordinary trial timed out at screenshot 2 and did not establish runtime acceptance. New actual-image, mobile, route and performance gates remain separate.
