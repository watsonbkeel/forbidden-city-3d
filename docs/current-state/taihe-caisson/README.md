# Taihe caisson central dragon candidate

Status: in development. No pixel acceptance or deployment claim.

## Observable gap and scope

The retained model has square, octagonal and round recessed tiers plus a central
pearl and six satellites, but no central coiled dragon. The Palace Museum's
building description explicitly describes the coiled dragon with lowered head
and pearl. This increment adds a self-authored approximate silhouette only.

- Official description: https://www.dpm.org.cn/explore/building/236465.html
- Official visual reference: https://img.dpm.org.cn/Uploads/Picture/dc/1602%5B1024%5D.jpg
- Museum architectural article: https://www.dpm.org.cn/Uploads/pdf/1944/T00008_00.pdf , printed page 8

Museum images are reference evidence; no image pixels are embedded in the app.
The dragon proportions, carving simplification and orientation are estimates.
The existing nominal 6 m opening interpretation and local registration are also
provisional, not newly surveyed dimensions. Dais/screen registration remains an
open issue: historical plan topology does not establish present-day placement.

## Bounded changes

Append only gold/dark-gold dragon geometry to existing S/fallback batches.
Preserve old geometry/accessor prefixes, all seven pearls, opening, anchors,
columns, dais, screen, navigation, materials, lights and global exposure.
Keep eight batches, S <= 18,000 triangles and fallback <= 1,600 triangles.
Do not reset the original whole-scene performance baseline.

## Acceptance

1. Deterministic source/build identity, finite nondegenerate outward geometry,
   no self-intersections or intersection with retained tier/pearl geometry
   except the intended central pearl support contact.
2. Decode the actual GLB and merged fallback, prove retained bytes, neutral
   non-column UV/color ownership, all budgets and loader/disposal behavior.
3. Ordinary same-view near-dais and upward comparison, one renderer, no
   fabricated vantage or second caisson. Assess actual recognition and light.
4. Build/resource and necessary regression checks before any release decision.

Existing publication and the separately pending entry-touch upload are not
changed by this local candidate.

## Shape revision after ordinary-view review

The first 1,250-triangle addition was actually viewed from the south approach
and did not read clearly as a dragon. This isolated revision has a broader
downward face, paired dark eye recesses, short muzzle, branching horns/cheek
curls and an uneven coil. The repeated dark triangular coil ridges were removed.
The face orientation is a photo-informed design estimate, not surveyed compass
registration. Detail now adds 1,522 triangles (total 13,650/18,000); fallback
remains 38 added triangles (total 1,596/1,600), with eight batches.

Old candidate and pre-caisson GLBs are retained. The original 16 approximate
radial ribs and faceted surrounding tiers remain known visual limitations.
Actual ordinary-view review of this revised shape is still required.
