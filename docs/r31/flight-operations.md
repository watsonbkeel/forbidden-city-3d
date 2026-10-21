# R31 helicopter interaction component (2026-10-19)

Baseline R30 c6db98815389c9ba5c72922fa2fd9d46ccec1514; independent feature branch. Integrated final evidence is recorded in docs/validation/r31-integrated-tour/RESULTS.md.

## Reproduction
An ordinary cloud Chromium page, normal initial position, native approach/H/F and native Escape recorded actual pointer lock release with no settings pause. The aircraft continued from approximately 23 m to 100 m and toward the Three Halls. The bounded 300-second session ended at 09:21:13 UTC and owned browser group and port were cleaned. No application/resource errors. This establishes the existing Esc lifecycle defect, not a performance result.

## Change
- Native pointer-lock loss or Escape opens a foreground, clickable aircraft panel. Only this operations panel (or existing settings/blur) pauses flight. Opening M alone still permits flight.
- Explicit return click requests mouse capture; flight stays paused until actual acquisition. Three-second missing/error response leaves a retry control and no movement. Late lock rechecks map/settings ownership.
- Manual and automatic airborne-to-grounded, stopped transition opens the panel and releases the cursor. The separate safe-ground and pedestrian exit collision checks remain. Airborne exit is disabled with an explanation.
- Clears walking/flight/touch state; autorepeated held keys cannot resurrect motion. H remains. Ground contact speed is a previous-frame measurement, so an explicitly frozen grounded aircraft is stopped even if Esc arrived on its last descent frame.
- Three camera modes, model/collision geometry, flight limits, route and landing coordinates are unchanged.

## Verification status
Focused red tests reproduced missing pause, missing landing panel, button activation, stale input, late lock and focus races before corresponding changes. 57 focused CPU checks pass, including real FlightState and actual parked collision exit tests. At this implementation checkpoint, native validation was pending; the completed ordinary result is recorded below. DOM fixtures do not establish real device behavior. No public deployment in this component checkpoint.

The first broad current-state invocation reported 973 checks, 968 pass, 5 fail. Three reports include stale exact-source retention hashes for the intentionally changed main/FlightTour; two older geometry/route fixtures need baseline reconciliation (Jiaotai shell/route). These are retained as failures and are not folded into the focused pass count. They must be reconciled for the integrated release; no claim of a green complete suite.

## Ordinary candidate result
Frozen runtime 5c2b20f ran 09:30:56–09:39:13 UTC (497.08 s active, .12 s cleanup), one ordinary application renderer, native input. Manual takeoff/landing, visible exit click, walking, reboarding, automatic raise to 100 m then full descent, second exit click and walking all observed. Escape pause held position in both map-closed and map-open states; map alone allowed 27–100 m automatic movement. All three views were used. Five actual screenshots reviewed; no page/resource error; owned browser group exited and port closed. This is partial desktop interaction acceptance in cloud software rendering, not device/performance/full sightseeing-route acceptance.

## Inherited test-fixture reconciliation
A read-only run of the two suspect test files on frozen R30 reproduced both failures (21/23 pass): the terrace fixture removed the hall required by newer decorators, and an old x=6.5 Jiaotai route intersected the visible west-bay clock added in R27. The fixture now builds the actual registered rear halls with the established canvas stubs; the route uses R27's existing central-door bypass, with an added negative check retaining the clock obstruction. Product geometry and collision were not changed. Those 23 checks now pass. Exact R31 byte-delta restoration preserves earlier source fingerprints, including rejection of unrelated edits; 33 affected retention/geometry checks pass.
