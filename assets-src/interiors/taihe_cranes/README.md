# Bounded original enamel-crane geometry

This is an S-only replacement of five components of the two Taihe indoor
enamel cranes. It imports the unchanged approved triangle kernel; it does not
edit the approved display generator, integration tools, runtime, fallback,
materials, lighting, placements, or any other furnishing.

## API and normal ownership

`crane_replacement.build_crane_replacement()` returns a fresh `CraneMesh`,
compatible with the approved `Mesh` fields. Calling `.data()` returns independent
JSON-serializable arrays:

- `vertices`: local Y-up XYZ metres, front is -Z
- `triangles`: three zero-based vertex indices per face
- `components`, `materials`: triangle-aligned semantic names and existing keys
- `two_sided_pairs`: empty; no reverse-sheet workaround
- `corner_normals`: triangle-aligned arrays of three unit XYZ normals
- `normal_domains`: triangle-aligned, audit-only smoothing-domain names

The mesh contains only the replacement faces. The caller must retire exactly
the old selected faces, preserve all retained attributes, translate one copy
to each existing anchor, and expand the explicit corner normals in the
exported geometry. Do not run batch-global smoothing, weld unrelated geometry,
recalculate these normals, or create new material objects. The selected body,
neck, head, wings and crown own their own normals. Body/head end caps, the
hidden belly landing and inner/outer folded-wing rims have separate hard
domains. The neck has two open rings that are fully embedded in body/head.

## Exact allocation

| Selected component | Existing key | Triangles per crane |
| --- | --- | ---: |
| white_enamel_body | pearl | 116 |
| white_rising_neck | pearl | 72 |
| white_small_head | pearl | 60 |
| green_folded_wing | teal | 16 |
| red_crown | red | 8 |
| Total | three existing keys | 272 |

The pair adds 544 triangles in place of 374, a net increase of 170. On the
specified 17,770-triangle baseline this projects to 17,940, below both the
17,970 bounded ceiling and the original 18,000 cap. Decoded integrated counts,
the eight-batch ceiling, and retained-attribute identity are the integrator's
separate responsibility.

The dark wood stand, wave/rock, gilded legs/toes and lower beak are not emitted
or altered. The test assembly preserves the existing translations
`[-2.80, 2.06, 10.20]` and `[2.80, 2.06, 10.20]`, local 0.60 × 1.78 × 0.82 m
envelope, 0.10 m wood-stand height, crown top at 1.78 m, exact 0.45 m leg
centrelines and 0.17 m lower beak. The narrow hidden landing retains actual
upper leg-ring contacts at y=0.79, rather than moving the legs or suspending
the body above them.

## Evidence and interpretation

The actual raster of Huo Haijun's 1995 study, printed p.41 Fig.1, was inspected
before the geometry was authored. Its caption identifies the Taihe interior
enamel crane. Its outline supports a long rounded oval body, slender mostly
straight neck with a modest bow, small head, low oval crown and rear-tapering
folded wing. Fig.2 instead shows the opened mechanism and was not treated as
the normal exterior.

- [Museum article entry](https://www.dpm.org.cn/enamels/talk/203378.html)
- [Printed p.40, description and dimensions](https://www.dpm.org.cn/Uploads/pdf/1527/T00040_00.pdf)
- [Printed p.41, Fig.1](https://www.dpm.org.cn/Uploads/pdf/1527/T00041_00.pdf)
- [Printed p.42, attribution](https://www.dpm.org.cn/Uploads/pdf/1527/T00042_00.pdf)
- [Official guide, installed wide view on PDF page 6](https://young.dpm.org.cn/uploads/1/file/public/202505/20250516181259_97digy9q27.pdf)

The 1.68 m excluding wood stand, 0.45 m legs and 0.17 m lower beak are the
1992 conservation measurements published in 1995, not a modern survey. All
other proportions and placement remain authored estimates. The guide image
is too small to resolve accurate color-field boundaries, and its hosting
date is not a verified capture date.

Materials remain inherited approximations. In particular, solid teal wing
lobes are an explicitly authored simplification, not evidence of entirely
green historical wings. No feather carving, exact ornament or calibrated
color claim is added. Museum imagery is not traced, embedded, redistributed,
used as a texture, or included in the production assets.

## Verification and limits

Run from the repository root:

    PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s assets-src/interiors/taihe_cranes/tests -v
    PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s tests -v

The eleven focused tests cover deterministic fresh output, exact component/material
and budget contracts, preserved source/retained geometry, anchors/envelope,
leg/beak/neck/wing/crown contacts, topology, outward winding, finite unit
corner normals, and hard normal seams. Every outward wing triangle is sampled
at 91 barycentric locations against the actual body surface (728 samples for
the pair of local wing panels).

An intermediate candidate passed the first nine structural tests but showed
disconnected teal patches in a CPU projection: parts of its wing outer faces
were hidden inside the torso. A separate failing visibility test was added
before the correction. Wing sections are now fitted to the original body
mesh with a restrained offset; component-local inner/outer rim normals remain
separate. A subsequent review found a conspicuous flat body-front disc; its
single existing end ring was reduced to a 16 × 24 mm cap and extended forward
by 35 mm within the unchanged assembly envelope. The other body rings and
all neck vertices remain unchanged, and all nine neck-root vertices are
still fully embedded. A failing cap-size regression was added before that
correction, and no triangles were added. That geometric visibility test is finite sampling, not a global
triangle-intersection proof. CPU diagnostic colors and lighting are arbitrary
and are not an in-game visual or material-accuracy acceptance. Browser views,
decoded GLB tests, navigation and release gates remain separate checks.
