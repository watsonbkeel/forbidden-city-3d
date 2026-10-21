# R36 helicopter interaction hotfix: independent audit

Scope: the urgent walking/aircraft input handoff, on the separate hotfix worktree based on `be5b668b2cddf6ba20fa6027da593d09683f6823`. No south-scene geometry, collision, map coordinate, landing, flight-physics, or old fixture changes are part of this independent test file.

## Reproduced defect, not inferred symptoms

The first independent baseline run used actual `FirstPersonControls`, Three `PointerLockControls`, `FlightTour`, and the current app mode/welcome callbacks. Six tests produced three passes and three failures. The H-key dismount path did not request pointer-lock restoration after native Escape, and the flight panel remained visible while walking far away, including the leave/reapproach cycle. Button dismount, map ownership, and mobile touch restoration already passed the baseline. These results do not claim that every reported input path was broken.

The baseline log is retained locally as `helicopter-baseline-real-controls.tap` in the audit run directory. The implementation had requested walking pointer lock only in the button wrapper, not in the common `exit()` handoff.

## Current direct tests

Run:

```sh
node --test tests/r36-helicopter-independent-lifecycle.test.mjs
```

The eight bounded scenarios cover:

1. Distant walking hides aircraft controls; entering/leaving/re-entering proximity shows only the non-modal boarding prompt, without requesting/releasing pointer lock or stealing focus.
2. H-key dismount after native unlock restores actual mouse quaternion rotation, actual walking-update displacement, walking head-bob/ground state, and releases flight keys, touch inputs and modal state.
3. Button dismount follows the same state and input handoff. In both cases the actual main Escape listener is reached only after returning to walking.
4. Leaving, approaching again, and clicking the near-aircraft button can board a second time. Unlocked desktop boarding waits for actual lock success before resuming flight.
5. Dismount with the map open preserves unlocked pointer ownership and walking `freeMove`.
6. Mobile dismount restores the actual touch-look listener and actual joystick activation/release without desktop pointer-lock requests.
7. Native asynchronous lock rejection does not undo dismount. The visible explicit walking retry can regain actual mouse look.
8. A delayed flight-resume lock, followed by the separate walking restoration lock, cannot recapture the pointer after the walking map has opened or reopen the aircraft panel.

The app class is loaded from current `main.js`; only its renderer/bootstrap auto-start suffix is suppressed. Its current mode-change method, welcome listeners, and Escape callback body are executed. The real `SettingsTourSession`, controls, flight state and collision manager execute. The modal presentation and native browser boundary are represented by the DOM fixture. A synthetic lock success is permitted only after a recorded native lock request. Three's actual pointer-lock event ordering and mouse listener execute; no fake `isLocked` assignment substitutes for them.

This is CPU/DOM event-chain evidence, not native-browser pointer-lock permission, WebGL, GPU memory, FPS, mobile browser layout, or visual acceptance evidence.

## Review boundary

The production diff is limited to extracting the existing app mode callback, returning the native pointer-lock result from the walking control wrapper, and the flight UI/input handoff. Native promise rejections have bounded attempt ownership; map/settings retain their ownership on delayed lock. Nearby prompt visibility alone does not enter flight or pause walking. New listeners/UI are removed by `FlightTour.dispose()`.

A final review caught a temporary walking-handoff marker that stayed enabled after successful restoration, causing later ordinary walking unlocks to inherit a stale dismount prompt. This was corrected before freeze: only an outstanding flight unlock may hand off the marker, one delayed unlock consumes it, and a completed restoration does not own future ordinary walking unlocks. Both independent desktop dismount scenarios now move away, unlock again, require no dismount-specific UI, and verify the original main Escape/settings path. No remaining blocking defect was found in this bounded review.

## Final independent seal

Production checkpoint: `e367fe0e7340bb401c6a10d1b37a4af26b1f4db6`, based on the south-scene freeze above. At 2026-10-21 03:36 UTC, the existing eight independent tests passed 8/8, with zero skips/cancellations, in 289 ms. The three production file hashes were identical before and after the run. Final local log: `helicopter-final-e367fe0-independent.tap`.

- `main.js`: `e49ed10d73b5ab8a3dc9361ab4b824c41582e73b60818ba2cbedf65cb1b9193e`
- `src/controls/FirstPerson.js`: `57b219b05f6df0a0770ad0291beaf24dbeffbbcddd2a6fb0315cba8e179acd17`
- `src/scene/flight/FlightTour.js`: `7836d8b2f1e4953b560babc95c70785ecef3523c50c2caaa07a7ced53ddde2d1`

This seal is not a replacement for the final integrated current-function and historical-compatibility groups. Historical exact-source identity failures must remain separately reported, not converted into successful current geometry or UI checks.
