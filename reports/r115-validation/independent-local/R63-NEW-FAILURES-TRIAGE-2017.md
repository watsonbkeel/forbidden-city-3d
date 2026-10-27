# R115 original R63 compound-24 eight new failures: independent diagnosis

2026-10-26 20:17 UTC. **The eight original failures remain failures.** This is a causal triage, not rewritten expected values or a blanket historical-red exemption. Product runtime and original tests/raw were not modified.

## Actual failure and cause

The original R63 compound route passes the Chuxiu rear approach and the Lijing main south doorway, reaching (94.5, 448.7). Its next hard-coded destination is (97.5, 448.7), followed by a straight lateral sweep to (91.5, 448.7). That formerly open-hall sweep is incompatible with R113's new source-guided room partition and console:

- Real entry-side wall: approximately X[97.06,97.18], Z[447.20,452.54], Y[.45,4.10]. The real side entrance is farther south at Z[445.40,447.20].
- Real long console: approximately X[97.24,97.73], Z[447.55,449.65], Y[1.25,1.35], plus its legs.
- A full original player body centered at the requested (97.5,448.7), feet .45, positively intersects **11 actual finished merged room triangles**, in both ivory-wall and dark-wood materials. The waypoint is not a legal reachable standing pose, even if the first wall is bypassed.

This is an intentional layout change that removes the old free crossing, not a claim that the old route still works. The new room remains a reversible MODEL_FIT; its historical compass direction is not established by this diagnosis.

## Minimal independent reproduction and lawful path contrast

`r63-room-route-diagnostic-2016` uses the same current `compoundFixture(true)`, actual FirstPersonControls and original physical driver as the frozen original test. It replays the exact original point list at 10/60 Hz × W/S × walk/sprint. All eight stop at the same requested target, X about 96.490–96.559, feet .45. Their final positions and complete driver diagnostics match the original current-state error records **exactly**. They do not enter any of the 1548 new finished physical room triangles.

A separate eight-case diagnostic keeps the same court start/end and actual main-door arrival, then walks through the real southern side entrance at Z446.3, around the actual table, through both curved openings, back into the main hall including the old left-side point (91.5,448.7), and out to the same court. All **8/8 complete**, end at feet 0 and have **0 new finished-room triangle penetration frames**. No teleport, body shrink, invented floor, collision removal or forced furniture pose is used. These are functional deterministic-clock runs, not cost measurements.

Both groups are bound to documentation HEAD **3a6c86a332394463914db947ae7ed98b68b93375**, with **415 runtime input SHA256s identical before/after**, head unchanged and exit 0. This complements—not replaces—the previously accepted R113 18 full front-court/room loops and R114 unchanged-runtime binding. The narrow diagnostic is not a fresh all-world collision or GPU gate.

## Disposition for cumulative accounting

Classify these eight as **old empty-hall waypoint contract conflicts with the intended new real partition/console**, supported by exact reproduction and reachable legitimate replacement behavior. The new original-suite count must remain visible; the old suite is not 1290 green and the prior failure-name multiset is not unchanged. Any formal future successor test should keep these negative obstacles as explicit blocked-pose checks and independently exercise the real entrance, rather than deleting collision or loosening assertions to recover old green.

The five other new source-contract failures are the integration auditor's separate diagnosis; no result here covers them. Original raw and original assertion files remain untouched.
