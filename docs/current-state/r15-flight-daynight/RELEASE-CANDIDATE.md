# R15: Beijing daylight and helicopter sightseeing preview

This is a playable feature candidate based on R13. It does not include the separate R14 Baohe work in progress. Existing palace geometry and place introductions are retained. It is not an aviation simulator or a claim of completed architectural reconstruction.

## Controls

- Start outside Wumen, walk left toward the white/red helicopter, and press **H** (or the boarding button).
- **F** starts the sightseeing circuit. Any direction, turn or altitude input immediately takes manual control.
- **WASD / arrows** translate, **Q/E** turn, **Space/C** rise/descend, **T** hovers, **V** changes pilot/follow/overhead view. Mouse look is available while the pointer is locked; Escape releases it for panels.
- Choose a virtual stopping point, then **L** flies there and lands. **H** exits only after a safe landing and stop. Walking and interior streaming resume.
- **M** opens the map. Walking and flight remain available with it open. Walking teleport is disabled aboard the aircraft.
- Mobile layout has held direction/turn/rise/descend buttons and touch look. Its panels yield to the expanded map; close the map to use time/route controls again.
- The clock defaults to actual Beijing time and computes date-dependent sun direction. Expand it to preview a time and restore live time.
- Optional historical sky lamps are off by default. They depict a simplified seasonal Qianqing Palace arrangement documented by the Museum in 2019, not current permanent night lighting.

The default cruise is approximately 100 m above the model courtyard datum, not a terrain-following height above each roof. Manual height is limited to180 m. Roofs, walls, trees and water use conservative clearance. Roof landings and flying underneath eaves are not supported. The home and two additional stops are virtual model locations, not legal real-world landing sites. A parked unmanned aircraft returns home after five minutes, delayed if the player is occupying the home clearance. It never recycles while occupied.

## Verified evidence and limits

- Combined Node suite: **2352/2352 passed**,46.37seconds on b030921; final subsequent changes are documentation only. Current behavior tests and separately retained historical fixture tests are both included in this total; historical fixture passes are not current-renderer acceptance.

- Native desktop Chromium: walk up, board, automatic climb to100 m, manual takeover, translation/yaw/height, all three views, map-open flight, automatic return landing, manual rise/descent, dismount and map-open walking. A later native check confirmed clock slider→12:01 daylight, restoration to live night, and manual ascent after fixing panel clicks that incorrectly requested pointer lock.
- Desktop Android-UA layout at390×667 and844×390: held mouse pointer on flight buttons rose10.8 m and landed; dismount restored walking and interiors. With the map open, explicitly synthetic touch moved12.87 m over ten seconds. This is **not physical-phone or trusted multitouch validation**.
- Original33 fixed and59 automatic walking routes, each at60/10fps and walk/sprint: **368/368 passed** on973e6ff. Original route order, callbacks, collision requirements and strict permanent Taihe navigation checks were retained. These are controlled controller simulations, not368 native walkthroughs. The only server error was the test host's optional `/favicon.ico`404; application assets loaded.
- Original six-camera×60-frame performance method on a1a3579 at1280×720/high/DPR1, explicit Beijing noon and lamps disabled: calls and triangles stayed within the original+10% ceilings. All six FPS-P5 checks warned. SwiftShader averaged0.88–1.33fps; historical baseline was nonconcurrent and had a fixed sun. **No smoothness promise for real devices.** Optional lamps, full flying panorama and every night condition were not performance-certified.
- Later changes from the performance sample are confined to UI layout, body UI state, event boundaries and tests/docs. Scene geometry, shaders, lights, envelope and state simulation are unchanged. From the368-route sample, only the tour-panel event boundary and a focused test changed. These are explicit evidence carry-forwards, not claims of rerunning every gate on the final bundle.
- Entire automatic circuit and five minutes of real-time unattended recycling have CPU coverage, but were not completed as an ordinary browser endurance test. Real mobile hardware, touch simultaneity, audio behavior on mobile and device-specific performance remain unverified.
- Solar direction uses NOAA's approximate annual equations. Night fill, colors and lamp intensity are illustrative, not surveyed photometry or live weather. Simplified sky-lamp carvings/attendants and the unregistered upper longevity-lamp pair remain limitations.

Failed/partial attempts were retained: one oversized observation payload, a mobile descent correctly blocked over water, and the original desktop panel propagation defect. No failed attempt is relabeled as passing.

## Run

Unzip the playable package, run `python3 -m http.server 8000` in its folder, and open `http://localhost:8000/`. Windows may use `py -m http.server 8000`. Do not open index.html directly. Source: `npm ci`, then `npm run dev`; portable subpath build: `npm run build -- --base ./`.

Publication is separate from this candidate. Main and the existing public Pages release are unchanged.
