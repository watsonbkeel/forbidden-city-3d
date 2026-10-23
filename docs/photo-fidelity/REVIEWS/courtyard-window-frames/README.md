# R58-A: Xihe and Xiehe courtyard end-window composition

Status: **PARTIAL / VERIFY_PENDING**. This bounded source change is not browser,
GPU, texture, historical reconstruction or present-2026 visual acceptance.

## Evidence and limited claim

Both original official photographs were opened and visually inspected on
2026-10-22. The two source photos independently show one upper horizontal
transom and six lower framed leaves at each courtyard end window, with short
solid top/bottom fields and diagonal middle lattice. The two gates are NOT
inferred from one another.

- Xihe: R58A-SIDE-IMG-01, [official image](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4bf591346.jpg), [building page](https://www.dpm.org.cn/explore/building/236567.html).
  SHA-256: 523551c73a7ecc618572013e02d6a628e285433b7ebd46a95765e1ceafcf588b.
- Xiehe: R58A-SIDE-IMG-09, [official image](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4981afba5.jpg), [building page](https://www.dpm.org.cn/explore/building/236540.html).
  SHA-256: 6c74f73106179c649744fd18501194db40bb77ff149bafb0b648aed5c4a95746.

The capture dates are unstated. The URL's 2020 date is not a verified photography
date. Original images, crops and downloaded page bytes are not included in Git,
public assets or release packages.

Only composition/count is source-supported. All numeric leaf/transom ratios,
field heights, diagonal angles, grid densities, wood sections and depth are
UNKNOWN engineering PHOTO_FIT. Xihe and Xiehe retain separate fit values. No
measured joinery or complete reverse-elevation claim is made.

## Scope and retained state

Exactly four windows change: both end bays of each gate at local +Z. Xihe's
rotation maps this to the east courtyard, and Xiehe's to the west courtyard.
Their local -Z outward windows are unchanged; the asymmetrical source ramps
agree with this identification. No unseen reverse detail is inferred.

Only 72 generic orthogonal bars (18 per target window) are replaced. The exact
original opaque backing, outer frame, sill, header, opening envelope and closed
window collider remain. There is no hidden duplicate old lattice. The helper
adds no collider, walkable, room, map item, support or material. All other gate
meshes, triangle indices, attributes, materials, transforms and physics are
byte-exact against 88c71e26fd528e47f7cd5e4740c13773b6e1fc6a; this includes the
previous Xihe corbels and Xiehe knees. Jingyun and Longzong are byte-identical.

Diagonal strips are actual closed convex prisms, clipped across their full
width to the exact leaf/transom opening. Their end vertices contact the frame
bounds. No redundant subdivisions, zero-area triangles, extended column cuts
or replacement collision gaps are used. Existing shadow backing is retained,
not replaced with a fake transmissive window.

## Budget

Density was deliberately coarsened from the first trial: total added triangles
fell from 8,880 to **6,120** (31.1% reduction). Density remains an explicitly
unknown fit, not a source fact. The coarse diagonal pattern and six-leaf
composition remain readable in the source-scale CPU views.

- Xihe component: 6,634 → 9,690 triangles, delta +3,056; +1,528 per window.
- Xiehe component: 6,528 → 9,592 triangles, delta +3,064; +1,532 per window.
- Full per-window framing/backing/lattice total: Xihe 178 → 1,706; Xiehe
  174 → 1,706. The unchanged sill and header are outside these window totals.
- Actual merged draw delta: **0** for either component (12 → 12).
- Material delta: **0**. All new members reuse wood_column.

Per-window old/new totals, retained outer-frame/backing totals and the exact
physical hashes are recorded in reports/r58-courtyard-windows/proof.json. These
are bounded component deltas, not an authorization to raise any global budget.

## Verification and reproducibility

New suite: node --test tests/r58-courtyard-window-frames.test.mjs

15 passing tests cover:
- two courtyard windows per gate, six actual leaves and one actual transom;
- all retained mesh attributes/indices/materials/transforms/physics and overall bounds;
- independent profiles and no changes to outward windows or either other gate;
- clipped closed-prism topology, normals, positive volume and exact frame contacts;
- actual post-merge cavity counts, diagonal/backing rays, top/bottom solid fields;
- four exact original closed-window colliders and no fake walk-through;
- real first-person three-portal round trips at 10 and 60 fps;
- owned geometry disposal and unchanged actual merged material/draw buckets;
- rejection of the original orthogonal-grid baseline by the new merged consumer.

The initial red test is preserved as tdd-red.txt. Bounded legacy selection passes
30 existing side-profile checks, 2 Xihe corbel visibility/clearance checks and 2
Xiehe knee merge/controller/ownership checks. Exact old stage-wide triangle and
mesh snapshot tests were NOT presented as passing: those snapshots include the
intentionally replaced grids and require stage-specific reconciliation. No full
world, build, browser, dependency install, main, Pages or upload was run here.

Pure existing-W consumer:

    import {assertCourtyardWindowsInWorld} from './tests/lib/r58-courtyard-window-world-check.mjs';
    const result = assertCourtyardWindowsInWorld(W);

It uses the supplied real merged scene/CollisionManager only, indexes original
bounded triangles without creating replacement geometry, and returns four
windows, four exact original colliders and 18 route-head rays. Optional
{profiles:['xihe']} or {profiles:['xiehe']} supports actual component fixtures.
The owner must run the default against the single cumulative merged world.

CPU source/after export (bounded components only):

    node scripts/r58-courtyard-windows/export-diagnostic.mjs

The reusable exportCourtyardWindowViews(W, out, stage) function in
tests/lib/r58-courtyard-window-cpu.mjs consumes an existing scene, with no world
build. The 12 PNGs and their triangle inputs cover identical before/after
source-scale, near and oblique cameras for both gates. They are **CPU flat-palette
geometry diagnostics**, not browser screenshots. Actual image pixels were
inspected; materials/textures/lighting and broader fidelity remain unaccepted.

Unresolved: exact measured dimensions/joinery/lattice spacing, complete current
reverse elevations, present condition, proper texture fidelity, browser/GPU
acceptance, and owner-run cumulative merged-world verification.
