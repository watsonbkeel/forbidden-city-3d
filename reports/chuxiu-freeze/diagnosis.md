# Chuxiu courtyard freeze investigation

Base: `ec50ea01` (R163). No upload, Pages change, or main modification.

## Outcome

The complete reported failure, a frozen 3D view with a responsive map that cannot move to another place, was **not reproduced**. Do not label that report fixed.

A separate, repeatable NPC contact defect was reproduced and minimally repaired. The NPC yielding/late-activation checks treated the player as a circle even inside the actual Chuxiu furniture collision domain, where walking uses a square player footprint. A moving maid could enter the square-only edge. That overlap incorrectly rejected sideways escape until the player moved directly away. It was not an all-direction lock: three of eight tested directions remained usable before the fix, and map travel still worked.

## Minimal candidate change

- `CharacterInteraction.js` annotates the live player state with the footprint selected by the same real furniture-domain query as the walking controller. Patrol and daily-routine callers share the getter. A missing player (flight) remains missing, and ordinary domains remain circular.
- `CharacterBody.js` uses capsule-to-square distance only for that explicitly selected square footprint. Existing circular contact behavior is untouched.
- No movement speeds, collision geometry, NPC routes, map destinations, renderer, scheduler, or architecture were altered.

The new real-west-six regression fails on the original source at frame 41 because the maid enters the square footprint. With the candidate it stays outside. Negative controls cover ordinary circular semantics, clear square corners, vertical separation, late activation, reactivation after leaving, and null flight state. A second run with both production files restored to the exact original source fails; the candidate is then restored and retested.

## Actual tested scope

`west-world.mjs` builds the unchanged production west-six zone, real material identity/manifest dimensions, production Environment ground, collision manager, and zone manager. `cpu-probe.mjs` runs real FirstPersonControls, CharacterSystem, render-batch preparation, Teleport, and Minimap travel-button pointerdown/up/click callbacks. It checks courtyard and gallery movement, four Chuxiu NPC bindings, day/night transitions, NPC contacts, map departure/return, and unload/reload of this one zone.

The corrected pre-fix fixture ran 8,268 and 5,548 frames (13,816 total), without uncaught exceptions or nonfinite player state. Twelve actual map-button trips succeeded. All three gallery perimeter circuits completed. Some interior route segments were intentionally blocked by the live NPC bodies; the direction probes distinguish these from a freeze.

The final candidate run and exact counts are in `verification.json` and `cpu-fixed-streaming-final.json`. Its maid-contact overlap is absent, the formerly rejected diagonal retreat moves again, and map travel succeeds. Retention requests are recorded separately from actual cache admission; do not claim a cache hit when the real budget rejects the large zone.

## Other map/freeze conditions checked

- `main.js` only calls normal map teleport when `flight.allowWalkingTeleport()` permits it. While aboard, that method intentionally rejects walking teleport with the “land and exit first” status. There is no evidence the user was aboard.
- `Teleport.go()` may return null when its destination safety check has no valid landing. All tested Chuxiu/Changchun/Yongshou/Yikun destinations resolved, including after NPC contact and zone reload.
- The map's real selection/travel lifecycle tests passed, including stale controls, ambiguous destinations, drag cancellation, and touch release behavior.
- `TourFrameScheduler` schedules its next RAF **after** `onFrame`. An uncaught exception prevents that scheduling and leaves `running=true` with `pending=null`. The diagnostic test injects an exception to prove this mechanism. It is **not** evidence that such an exception caused the user's Chuxiu failure, and the scheduler was not changed.

This mechanism can explain a DOM map that still reacts while the last rendered image never updates: an actual camera teleport would not be rendered after the loop stops. Determining whether this happened needs the user's real browser exception/context-loss state, which is not available here.

## Evidence and limits

- `npc-negative-control.log`: exact original source fails the three new regressions.
- `final-regression.log`: selected character, contact, clock, visibility, and map regression results.
- `build.log`: Vite build completes, with the existing large-chunk warning.
- `project-test-command.log`: the package's `test:current-state` command reports **zero tests**, because this pinned checkout does not contain that untracked test folder. This is not full-suite acceptance.
- `scheduler-diagnostic.test.mjs` and its log: explicitly injected frame exception only.
- Browser Chromium startup was blocked by sandbox local-socket permission. Its approved escalation attempt failed during sandbox initialization; no browser was launched. No further escalation was attempted.
- A full-world CPU build was killed by resource limits. The successful tests use the genuine west-six zone plus global ground, not a full-world/neighbor-streaming/GPU/mobile reproduction. The fixture does not reproduce native browser event targeting, WebGL context loss, shadows, or hardware memory pressure.

## Commands

- `node --max-old-space-size=650 --test tests/chuxiu-freeze/npc-square-contact.test.mjs`
- `REPORT_NAME=cpu-fixed-streaming-final node --max-old-space-size=650 tests/chuxiu-freeze/cpu-probe.mjs`
- `node --test tests/chuxiu-freeze/scheduler-diagnostic.test.mjs`
- `npm run build`

Useful next evidence from the actual failure: device/browser, whether NPCs/clock continue moving, whether the map's “going to” status appears, and the first browser exception or WebGL context-loss event. These distinguish input/modal state, rejected landing, and a stopped render loop without guessing.
