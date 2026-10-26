# R99 independent geometry / physical-path review

Candidate: `699af72801219da28ce1ded4367084aa518ce988`, baseline final R96 `f025c09c5fd0b5060b8b22f658349b90fa116d37` (R97/R98 runtime restored to this baseline).

## Current conclusion

**Scoped geometry and physical-path gate passes**, with inherited Jingfu platform/body overlap explicitly retained below. The fixed-camera CPU above/side/ground pairs have now also been independently inspected; the local visual gate passes. This is an engineering placement fit, not historical survey validation or a whole-world collision-clean claim.

Only Fanhua's immutable profile and matching zone JSON Z change from 513.3 to 511.05; no controller, footprint, neighboring hall, north wall, corner tower or mountain edit. North rear clearance 0.34 is **not** a new walkable corridor. The unimplemented Fori–Fanhua upper connecting stone stair remains unimplemented, not silently deleted or claimed complete.

## Independent actual geometry

`geometry.mjs` builds actual ZoneBase NingShou objects and Enclosure corner-tower geometry from each tree. It clips actual Fanhua triangles to the two solid corner-base boxes using the pre-existing independent polygon-clipping oracle, not product collision predicates. Bounding separation is also checked against the complete upper tower envelope.

- 27,846 Fanhua triangles; baseline has positive open-interior clipping witnesses (30 saved, not asserted to be the full number) and nine positive-volume collider pairs.
- Candidate: zero corner collider pairs, no clipping witnesses. The entire actual Fanhua mesh envelope is separated from the corner tower by **0.34000038206579575** along world Z; thus not merely selected-point clearance.
- 1,509 Fanhua mesh local attribute/index hashes unchanged. Their world matrices and colliders translate only by −2.25 Z; maximum construction-addition rounding discrepancy **1.1368683772161603e−13**, explicitly not bitwise world-translation equality. Walkable metadata/X/Y unchanged and Z translates with the same machine-rounding bound.
- All 43 other NingShou construction objects retain exact mesh attribute hashes, world matrices, colliders and walkables.
- Fori remains separated in X by 0.550000381m. Jingfu full mesh/stair envelope is separated in Z by 1.705000008m. No new collider pair with any NingShou object.
- The inherited Fanhua/east enclosing-wall broadphase mesh envelope overlap persists; it is not mislabeled as a newly introduced solid penetration. Both the original wall and Fanhua local geometry are retained, and actual collider pairs remain zero.

Evidence: `geometry-r96.json`, `geometry-699af728.json`, `geometry-comparison.json`. Comparison script: `compare-geometry.mjs`.

## Actual full-world controller trajectories

`routes.mjs` builds the real complete collision world and uses unmodified FirstPersonControls with deterministic clock/DOM fixture only. Actual feet are `controls.feetY`; body half-width **0.5**, height **1.7**. No forced upper pose, jump-rescue, radius reduction, adjusted step limit or hidden collider removal.

Five trajectories at each 10 / 30 / 60 Hz, **15 total, 2,082 candidate frames**, include one second of post-input inertia/settling:
1. Ground → Fanhua central doorway → original ground approach.
2. Front ground approach to legally blocked east wall, then ordinary movement back (does not demand passing through the wall).
3. Actual `Teleport.landingFor('梵华楼')` safe ground result → doorway → retreat.
4. Jingfu original rear approach/stairs → doorway → same ground approach.
5. Fori original front approach → doorway → same ground approach.

All arrive/return, all finish grounded. Fanhua/Fori trajectories show no positive full-body/static-box intersection; candidate Fanhua boxes produce **zero hits across every recorded pose**. Independent full-NingShou box overlap replay runs on every recorded pose, not merely capped debug examples.

### Important inherited limitation, not suppressed

Jingfu's old platform transition has real `feetY` body intersection with its original 0..0.8 platform box during existing smoothed step following. Baseline and candidate overlap records are **exactly equal**, not just equal counts:
- 10 Hz: 4 frames, maximum 0.098m.
- 30 Hz: 12 frames, maximum 0.233502981m.
- 60 Hz: 24 frames, maximum 0.253089213m.

The original legacy controller uses a support-adjusted horizontal base while smoothing visible/physical feet. R99 does not fix this inherited behavior. It must not be described as a full-body-zero-penetration route pass. No new or deepened intersection is introduced by this placement change.

Jingfu 10/60 Hz poses are bytewise-equal numeric sequences to R96. At 30 Hz the last 22 inertia frames after the route has already returned to ground differ: moved Fanhua's real nearby column legally limits northward coast, leaving final Z about 0.02116m shorter. It does not block the required waypoint, penetrate or trap the player. All inherited overlap records still match exactly.

Evidence: `routes-{r96,699af728}-fullframes.json`, `routes-comparison.json`; earlier debug runs are retained, their capped violation lists are not used as the final count.

## Source binding / verification boundaries

- RemainingNingshouHalls.js: `eecd6ae69e767ca713967d075953cc50504155faad8b1fdcd61de08c1ba5b19a`
- ningshou.json: `2c29e1a809e19d28e9ef62d0d78b92afc786508212ab02c5d898138d044902a6`
- Hashes read again after runs, unchanged.
- This reviewer does not approve all historical detail, upstairs accessibility, GPU/mobile rendering, character behavior unrelated to the moved hall, performance, package builds or remote publishing. Cumulative/source-anchor and build checks belong to the separate reviewer/writer.

## Final visual check (2026-10-26 08:44 UTC)

Personally inspected all three before/after pairs under `reports/r99-interface/visual`: above, side, ground. Parsed the corresponding exported cameras and verified exact same camera parameters per pair. Side/ground before shows hall columns/eave meeting or disappearing into the red corner-base face; after shows the hall moved behind/clear of the unchanged corner edge, with a narrow separation at its foot. The unchanged tower can still occlude parts of the hall in perspective; the numeric full-mesh separation, not image occlusion alone, proves no solid overlap. No claim that the 0.34m gap is walkable.

These are local actual geometry CPU z-buffer diagnostics of the corner and three halls, with base/vertex colors only; enclosure walls, full ground, textures, production light/shadows and GPU are omitted. They confirm the targeted placement change, not historical accuracy or overall artistic quality. `visual-reviewed.json` binds all six PNG hashes and identical camera checks.

**Final local review: permit this unchanged two-source candidate to proceed through the separate cumulative/build/upload gates. No further local matrix or artistic iteration is needed.**
