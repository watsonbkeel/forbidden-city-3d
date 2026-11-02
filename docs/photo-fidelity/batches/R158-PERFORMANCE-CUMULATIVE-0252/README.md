# R158 cumulative energy-saving mode

Verified parent: remote `d5f751cefbef6e050e4a4ef2b3af5c3552c44b72`, local `c185c01d88aafc1b2f5d95cc02463f3e76e96708`. Independently reviewed author `5c543edd82b4502d9080d4324ec38173e778af08` was applied exactly; cumulative clean runtime `171b190b20ae3bca91b44fca4aa5d78e039afe84`. Read-only main comparison immediately before integration remained identical to user main87ca28d0. Main/branches/Pages are not modified.

## Visible behavior

Settings → **运行模式** now offers **节能 · 30 FPS** (default) and **流畅 · 跟随屏幕**. The choice is stored only in independent `fc3d-performance-mode-v1`; invalid/unavailable storage falls back safely and does not overwrite existing quality/sound/people/map choices. Low quality retains DPR<=1. Eco caps the original selected quality's DPR at1.5; smooth restores the original quality cap and refresh cadence. Renderer, composer and FXAA use the same resize path.

The main update/render loop has one scheduler. Eco skips whole update/render frames, not only the final draw; deadline remainder prevents refresh-rate rounding errors. Hidden pages cancel that main RAF and cannot resurrect a canceled callback. Resuming starts with zero simulation delta, clears stale input while retaining player position, airborne state, flight route/occupancy and map movement mode; it does not force pointer lock. Parked aircraft idle time excludes hidden duration, avoiding an immediate relocation on return. Loading-progress RAF and independent module tasks are not claimed to be globally canceled.

## Cumulative verification

**91/91, zero skips**: all87 reviewed performance/related tests plus4 public-name checks. Exact four production files equal the author; six newQA files equal the author. All eight immediately preceding user-fix production paths remain byte-for-byte intact, plus the original player/collision/flight/NPC engines and 24-byte user release.

- Fake60/120/144Hz RAF input verifies approximately30 complete updates/renders per second in eco, normal refresh cadence in smooth, 100 visibility cycles/one pendingRAF, delayed callback invalidation, lifecycle cleanup and bounded visible delta.
- Actual main class methods with test platform/renderer dependencies validate the production integration; actual SettingsMenu/DOM fixture verifies discoverability, click/ARIA/persistence and old settings. This is not a real browser GPU timing test.
- Real30Hz FirstPerson/Collision components pass walking/running, map movement, jumping/landing, thin-wall rejection and input reset. Real two-level south-wing walk/run produces **434+233=667 frames, peak foot/ground gap0**, same report bytes and full-frame SHA values as the reviewed author.
- Real FlightTour/FlightState with virtualRAF verifies takeoff, hidden retention, safe resume, landing and exit. No full-city World or Mac temperature/power/fan measurement is claimed.

One clean **661-module R158 /gugong/** build and `verifyBuildSource` pass: buildId `R158-10b01ca8333c`, source `37b8875e4860abfd4cc071723a4e77d357ac3c10387d6be1d11d7921a3a0e210`, temporary output `/tmp/r158-performance-build-0251`. Existing large-chunk warning remains. This supplies a lower work-budget option, not a measured cooling guarantee or promise that every device reaches30fps.

The prior map-label cleanup, Wenhua white-panel removal, Wenyuan plaque/bridge alignment and Zhujing north-stair correction are preserved. Their previously accepted .444m/.15s Wenhua sprint and .391m Wenyuan short-step diagnostics remain disclosed; this version does not reclassify them as strict<=.3 passes. No new playableZIP, deployment, GPU/mobile acceptance or blanket41-item completion.

Evidence originals are LOCAL_ONLY under `/tmp/r158-performance-cumulative-0251` and author `/tmp/r158-performance-0240`, temporary/non-persistent. Uploaded summaries/SHA values do not make raw files remotely available. No author raw logs are included in this Git tree.
