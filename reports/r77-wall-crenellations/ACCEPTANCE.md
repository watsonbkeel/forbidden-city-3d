# R77 acceptance boundaries
Runtime fingerprint: 7e23d6afee67d8c6719cee83fa351929043429c7591a9124c7f4f32e87184e6c.
Runtime implementation commit: fa877e5a92d1006bf76d97aa17dc1389af0e30c2; subsequent evidence-only commits do not alter runtime.

## Exact scope
886 supported outward crenels;22 Wumen interface slots deliberately omitted. All other geometry bytes, wall/gate locations,24,450 colliders,1,288 walkables,281 rooms and223 map records unchanged. No new wall-top walkability. Official source images actually viewed; detailed historic dimensions/materials not established. See LEDGER.md.

## Completed checks
- Final four serial night worlds B/Yangxin/Kunning/Huangji:4/4 pass, all matching final fingerprint;108 actors,28 unique beds,21:00/06:00 transitions,emperor blocking/resume/day-return and reload/light budgets retained.
- final-cumulative-retention.tap:124/124 pass after runtime freeze, covering R72 routines/traps, R73–R76 routes/lights, map and helicopter input/lifecycle.
- final-lightweight.tap:23 pass, includes exact entity delta, four orientations/support, Wumen clearance and old cap/top-notch tests, strict successor rejection tests.
- final-nav-gates.tap:100 total,99 pass,1 inherited failure. Actual fullworld navigation identity passes;98 existing Wumen/Shenwu gate-controller cases pass. Old shenwu-exit-wayfinding test stops at frozen R32 ZoneBase source guard; independently reproduced on frozen R76 in baseline-shenwu-wayfinding.tap.
- current-state.tap:1,290 total,1,139 pass,151 identical legacy failure labels. No new or removed labels versus R76; failure-comparison.json lists all.
- zones.log: same2 errors/20 warnings. anchors.log:same114 comparisons, retained Shenwu11m and乾东五所 kind mismatch. Exact diagnostic rows compared to R76.
- build.log:Vite production build passes;existing large-chunk warning retained.
- package.json:single cumulative backup,134 files,41,658,923 bytes, all file hashes/sizes verified. No deployment. BuildId R77-1138448bd8a9, sourceDirty=false.

## Raw failures retained
red.tap shows original unsupported/wrong-facing rows; red-wumen-overlap.tap catches new Wumen landing interference; red-wumen-return-clearance.tap catches insufficient four-slot-only exclusion. Initial fixture JSON parse error was mixed diagnostic stdout and is fixed by isolating JSON, no product workaround. Initial night Yangxin/Kunning runs detected runtime edits during review through fingerprint guards and are invalid for final acceptance; those logs remain. Final night records must all match fingerprint above.

## Unverified
No real GPU screenshot, mobile hardware performance, all-palace visual traversal or measured historical restoration claim. Phase5 remains partial: north-boundary joint fit, moat and fine wall-top material/details are explicitly unresolved. No main/Pages change; parent owns remote publication after review.
