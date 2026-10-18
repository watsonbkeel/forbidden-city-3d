# Taihe south approaches: staged topology correction

2026-10-18. Local candidate after ae1d2b2; not yet a release acceptance.

## Observable change

The south face of each of the three common terraces now has two independent
stair flights, a separate solid central imperial stone, and four intervening
wall/railing sections. The old single 12 m flight with a narrow decorative strip
has gone. The imperial stone has no gameplay ramp; this protective choice is not
an assertion about present visitor access rules. The hall's own shallow south
plinth now has three separate stair groups. North stairs, six waist flights,
hall location/floor, columns and all other buildings are retained.

The main fixed walking route keeps its identity and endpoints, but approaches
via the western (+X) stairs rather than crossing the carved stone. All physical
toe/head contacts are derived from the actual builder and retained at full
precision. The old direct line remains negative evidence, not a passing route.

## Evidence and unresolved registration

- Museum front photo: https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e9926e6ea567.jpg
- Museum oblique photo: https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e99275d2689f.jpg
- Yu Zhuoyun, *The Three Great Halls*, 1960, plan figure 1:
  https://img.dpm.org.cn/Uploads/File/pdf/c7/92/ed/c792eddcdca8356377637b90520bce08.pdf
- Museum building description: https://www.dpm.org.cn/explore/building/236465.html

Topology is supported by the photos/plan; **±10.5 m centers, 5 m side widths,
6 m central stone, tread counts and individual tier heights are provisional**.
The old tier geometry and its 1.2 m landings remain, not newly measured values.
Photo upload dates are not verified capture dates. No research photo is a new
runtime texture or distributed asset.

The historical plan suggests a forward-projecting moon platform and shoulder
returns absent in the old rectangle. Rough registration relative to Taihe puts
the south edge about 20 m away from the inherited z=-54 assumption. The old
source gave only an outer envelope, not its position relative to the hall.
This candidate deliberately leaves that unresolved; it is not a complete
restoration of the exterior outline. Modern control points are needed before
moving/rebuilding the terrace footprint.

The hall's front plinth side stairs share the provisional lateral alignment;
modern close views do not yet establish their exact center/width equality with
the lower flights. Their low cheek collision caps now match the visible low
stone rather than creating a 5 cm-high excess obstacle. The side-stair routes
cross the existing veranda behind those cheeks and in front of the retained
columns; no column is moved to make a test pass.

## Verification so far

- 38 dedicated CPU checks pass, including 16 real-controller outer round trips
  (both sides, 60/10 fps, walk/sprint, forward/backward), all three actual ramps,
  central plinth ramp, and 8 side-plinth-to-central-doorway round trips.
- All positive acceptance disables box rescue and traces actual selected ramp
  primitives; height and actual support are required in addition to arrival.
- Six missing-ramp mutations fail the height/support acceptance even where the
  XY-only driver can still reach a point underneath the model.
- Central stone/inter-stair walls block direct ground crossing; closed stair
  meshes have nondegenerate manifold faces and reused existing materials.
- 438 affected existing interior, waist-stair, source-retention and route tests
  passed before the final side-plinth cheek cap correction; no affected global
  source hashes or historic route fixtures were refreshed to conceal changes.
- Final integrated CPU suite: 2105/2105 passed in 45.77 seconds, including the
  final cheek cap and valid-start negative-test hardening.
- Relative-base production build passed. Two controlled front/oblique photo
  comparisons used equal camera transforms/FOV; native window sizes differed
  by 8×4 px, so the comparison is qualitative.
- An ordinary native Shift+W ascent and Shift+S descent, 55 seconds each, went
  from ground up the western flights and side plinth to feetY=9.9375, then back
  to ground. 140 passive samples; no synthetic movement after the ground start.
  This does not cover the eastern native route or the central doorway turn.
- Both bounded browser runs recorded zero application/HTTP errors and verified
  cleanup. A screenshot requested after DONE cleanup failed because the owned
  window had exited; scalar return evidence remains. No retry was made.
- The foreground imperial road remains in both builds and in the oblique image,
  but disappears in the candidate front image. Source/texture identity checks
  have not yet explained this frame/view-dependent discrepancy.
- New controlled route/performance and mobile acceptance remain separate gates.
  CPU replay is not native input or real-device performance evidence.

## Other palace stair queue

Review one building at a time using front/side photos plus a plan when available:
1. Taihe moon-platform outline/shoulders and north plinth; unresolved registration.
2. Zhonghe four-sided shallow stairs and landings; existing special four-sided
   topology stays, pending closer proportion/material comparison.
3. Baohe south plinth and northern large carved stone/side stair relationship;
   do not reuse the new Taihe widths or assume an identical outline.
4. Qianqing Gate's three stair groups (official source supports the count), then
   Qianqing/Jiaotai/Kunning own plinths and their different doorway approaches.
5. East/west side courts by actual gate/hall identity; generic remaining steps
   are a review queue, not declared real reconstructions.
