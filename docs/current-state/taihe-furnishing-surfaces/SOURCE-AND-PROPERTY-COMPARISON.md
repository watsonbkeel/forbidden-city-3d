# Taihe screen / dais surface candidate

## Outcome and evidence boundary

This candidate improves the large screen-front fields and the dais's vertical
faces with original illustrative red/gold ornament. It does not claim a measured
or exact reconstruction of historic carving. Color choices, motif shape, spacing
and UV scale are authored estimates. The original screen crowns and raised
simplified relief remain intact over the new field.

Inspected research images:

- Museum installed throne/screen view: https://img.dpm.org.cn/Uploads/Picture/dc/1606%5B1024%5D.jpg
- Museum wide installed view: https://img.dpm.org.cn/Uploads/Picture/dc/14498.jpg
- Local ordinary pre-change eye-level capture of the enamel-crane candidate.

The close installed view supports red framing around densely decorated gold
screen fields and ornamented vertical platform moldings. The wide view supplies
overall context, not exact pixels, calibrated colors, carving depths or dimensions.
The pre-change ordinary capture shows comparatively flat brown screen fields and
solid-color platform surfaces. Museum images remain research-only; no photograph
pixels, traced pattern or font file are distributed.

The previously rejected environment-intensity 1 → 0.35 trial is not repeated.
No global light, exposure, environment intensity, column or caisson response is
changed. Actual combined ordinary-image acceptance remains pending parent QA.

## Bounded selection and unchanged geometry

The frozen baseline is `taihe-enamel-cranes-052bec6dbe4b.glb`, SHA-256
`052bec6dbe4bf5246ac61d646b490ad52fd17d3572e8ed41dca501e20d42290f`.

Exactly 40 existing triangles are rebound to the existing glyph material:

- 14 triangles: the front face of each of the seven source replacement screen
  panel slabs, exact source component triangle ordinals 0 and 2
- 12 triangles: the front, left and right vertical faces of the named original
  `dais_lower` and `dais_upper` source objects
- 14 triangles: the front faces of the seven named original `dais_step` objects

The selection is made in the original semantic sources, then matched one-to-one
to frozen float32 position bytes and oriented winding. Neither material alone nor
a guessed bounding box selects triangles. Bounds are used only to parametrize
UVs after ownership is proven. The source derivation checks that each target has
one source owner and one exact frozen-asset match. Maximum coordinate error is 0.

The complete position/normal/winding/frame triangle multiset is unchanged.
Every original attribute byte remains as an exact prefix or whole unchanged
buffer. All non-selected indices retain their original order. Selected indices
are removed from lacquer/dark-gold batches and their exact corner attributes are
appended to the existing glyph batch. Keeping unused old entries avoids rewriting
unrelated indices and gives an auditable rollback path.

Screen envelope, seven-leaf hierarchy, crowns, relief, furniture, crane geometry,
anchors, caisson, columns, permanent navigation, walking/top surfaces, collision,
lights and exposure are unchanged. All original artifacts remain available.

## Material and atlas comparison

Previously the selected screen fronts used uniform `taihe_dark_gold`, and selected
dais faces used uniform `taihe_lacquer`. Only those faces now use the already
existing `taihe_glyph_atlas` material: roughness 0.8, metalness 0, with deterministic
red/gold illustrative scroll and rosette fields. This is a painted/gilt color
interpretation, not new physical relief. Every unselected material factor and
response remains byte-exact, including all unrelated gold.

Only previously unused pixels of the existing 1024 × 1024 lettering canvas are
painted. The sampled screen tile is (176, 400, 256, 608); the dais tile is
(448, 400, 560, 160), each with a six-pixel bleed. All commands stay inside
x ≥ 160, y ≥ 384. The original plaque/couplet commands and UVs are unchanged.
No new texture object, GPU texture allocation, material or draw batch is created.
The existing fallback-owned atlas is borrowed by S detail through its established
weak-map sharing/disposal contract. Repeated install/dispose does not dispose the
fallback texture; its owner disposes it once.

## Exact property comparison

| Property | Before | After |
| --- | ---: | ---: |
| Renderable core triangles | 17,940 | 17,940 |
| Original triangle ceiling | 18,000 | 18,000 |
| Visible material batches | 8 | 8 |
| Glyph-batch triangles | 6 | 46 |
| Runtime texture bytes, including ceiling | 8,388,608 | 8,388,608 |
| Embedded image / texture bytes | 0 | 0 |
| Attribute buffer bytes | 1,699,648 | 1,703,488 |
| Index buffer bytes | 107,640 | 107,640 |
| Total attribute + index bytes | 1,807,288 | 1,811,128 |
| Additional attribute bytes | — | 3,840 |
| Allowed added-buffer ceiling | — | 16,384 |
| Encoded GLB bytes | 1,877,748 | 1,882,012 |
| Fallback triangles / batches | 1,596 / 8 | 1,596 / 8 |

Candidate: `taihe-furnishing-surfaces-a4a0b82f9f76.glb`, SHA-256
`a4a0b82f9f767422db824b9c0f9039fc3da2234f18b3d584d295ad52020ec529`.
`SOURCE-MANIFEST.json` records exact source, mask, artwork, buffer and asset hashes.
The runtime binds the new source/mask/artwork identity against the registry.

## Reproduction and validation

- Derive source ownership with CPU Blender:
  `blender -b -t 1 -P assets-src/interiors/taihe_furnishing_surface/derive_faces.py`
- Rebuild the candidate, without Blender:
  `python assets-src/interiors/build_taihe_furnishing_surface.py <output-directory>`
- Focused Node tests:
  `node --test tests/taihe-furnishing-surface*.test.mjs`
- CPU rebinding test:
  `PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s tests -p test_taihe_furnishing_surface.py`

RED was observed for missing artwork and missing atlas paint, the absent rebinding
builder, and absent runtime identity rejection. Those checks then passed after
implementation. Independent tests decode both assets and compare the entire
position/normal/frame triangle multiset, original attribute prefixes, non-selected
index order, all moved UVs, resource counts and reproducible output bytes.

Historical source fixtures are not rewritten. One finite new source-delta adapter
removes only the exact new import/call/identity insertion before existing older
guards. The crane migration tests now use a separately preserved byte-exact
historical registry. Lettering tests keep checks on the original six retained
lettering faces; the 40 rebound faces have their own independent integration gate.

No browser was run for this component. No front/oblique ordinary-image, performance,
mobile or complete-route acceptance is claimed here. The parent owns the combined
release validation and publication decision.
