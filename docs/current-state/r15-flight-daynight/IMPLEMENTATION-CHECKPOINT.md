# R15 day/night and free-flight integration checkpoint

2026-10-18 15:26 UTC. Based on accepted-source R13 local
47c3fe83d9fab9a76024c623b86928038d9c279f. R14 Baohe WIP remains
isolated on its own branch/commit e5ff446fc7d52ccc89ef8302b5264a8a7262bdc8.
No public or main update is part of this checkpoint.

Implemented: deterministic Beijing/date solar state; continuous sky/fog/main,
ambient and sky-only bounded IBL response; explicit local time preview; generic
1816-triangle helicopter; auto sightseeing and immediate manual takeover;
manual translation/yaw/height/takeoff/ground landing; pilot/follow/overhead;
vehicle map marker and five-minute unoccupied return; parked body collisions,
prospective safe dismount checks; interior suspension through existing unload.

Rotor and tail clearance uses the actual exterior triangles of every static
building and prebuilt zone, trees and roof meshes. Conservative 2m cell XZ
triangle rectangles retain their highest Y, including unloaded zones. This
forbids flying under eaves or through gaps, even if a small aircraft could fit.
CPU observed 913314 triangles,331250 cells,1656250 bytes,~137ms grid build.
This is a virtual navigation envelope, not surveyed aviation/landing approval.
All offered pads are level empty areas in the current model; full landing set
and autopilot have passed actual-world CPU traversal. No rooftop landing.

Initial CPU review corrected: follow-camera boundary Infinity, overhead exit
up-vector ordering, map teleport callback return, flight-map walking state
restoration, native Space on buttons, and dismount positions overlapping
prospective rotated parked AABBs. Targeted tests include seven exit headings.

Only focused checks and an initial integrated build have passed so far.
Native browser experience, night readability, maps/mobile layout, full necessary
regressions and current-build performance remain pending. Old fixed-sun tests
need explicit preservation/adaptation for the newly authorized changing sun;
their historical baseline must not be overwritten. Two premature concurrent
worker suite results are retained as nonfinal findings, not accepted regression.

Festival lamps are still research-only. Official 2019 imagery supports two
upper-terrace longevity lamps and two much wider courtyard sky lamps. Their
historical seasonal nature requires a separate explicit demonstration label;
exact scene registration and visual/collision implementation are pending.

Hard candidate target: 2026-10-18 23:10 UTC. No claim of real-device mobile
acceptance. Previously denied public publishing remains paused pending its
specific user decision; local development continues independently.

## 16:15 UTC integration update

Day/night preview and optional lower-courtyard historical sky lamps are now
implemented. Two simplified 13.9m sky lamps, five merged material batches and
two unshadowed point lights are OFF by default. Official 2019 reconstruction
supports the seasonal arrangement, not a current permanent installation. The
upper longevity-lamp pair remains omitted because registration is not closed.
Night readability and the nonoverlapping clock/flight tool stack were checked
in ordinary native Chromium; fixed matching night/noon lamp images were also
reviewed as controlled visual evidence. Lamp carving/attendants remain simplified.

Focused current-source behavior tests cover actual Three r162 sky-only IBL
baking, light updates, lifetime ownership, controls and UI. Historical fixed-sun
regressions use a separately hash-pinned R13 source fixture; those passes do NOT
claim current changing-sun coverage. Source-retention adapters lock current
SHA256, reverse only unique approved hunks, and require exact historical SHA256.

The combined Node suite recorded 2337/2338 passing; the one stale onResume
shape assertion was replaced by execution of the real callback with occupied
and walking states. The resulting focused settings+R15 group passed 84/84.
An independent review found an automatic-landing completion-label ordering
bug; the label now reads committed ground state, with a regression test.

One ordinary flight run stopped on an observation-payload 400, not a flight
exception: the helper repeated the cumulative key log inside each sample.
The preserved continuation moves that log to the top-level once and retains
the same payload cap and failure semantics. Full final performance, mobile
layout and final candidate acceptance remain open at this checkpoint.

## 16:50 UTC candidate closure

The full CPU suite passed2351/2351 before the last tour-panel event-boundary
fix; that fix has9/9 focused tests, including real FirstPersonControls pointer
lock and preserved native defaults. Final combined suite:2352/2352 passed in46.37 seconds on b030921; subsequent changes are documentation only.
Original368 controlled walking combinations passed with strict preloading.
Original6×60 geometry/call budgets passed; six software-renderer FPS warnings
remain. See RELEASE-CANDIDATE.md for exact evidence lineage and limitations.
Native desktop and mobile-layout continuations now cover the actual changed
controls. The clock click propagation defect was corrected at the shared
panel boundary, without changing the legacy movement engine. Native noon
preview, return to live night and flight ascent were then confirmed.
No physical-phone or complete automatic-circuit endurance claim is made.
