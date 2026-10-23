# Preserved N2 north-head jumping defect, before bounded collision repair

Historical status at discovery: **OPEN / original red evidence**, 2026-10-22. The subsequent bounded repair passes local integration tests, documented in OVERHEAD-REPAIR.md; original red logs and JSON remain unchanged. The earlier 36/36 standing/traversal tests did not establish full-height collision matching. No arch geometry, centers, widths or crown datums were changed in response to this failure.

The real FirstPerson controller was driven through `jump()` and normal `update()` at 10 and 60 Hz. Central passage x=±3.999 leaves 1 mm between the actual radius-0.5 body footprint and inherited sidewall. Moving tests cross both ways; stationary tests jump at local z=18. The conservative human envelope is 1.7 m high; actual engine body boxes are separately taken directly from `CollisionManager.playerBox`, including its STEP_CLEARANCE bottom and eye−0.05 top. This distinction is retained in the evidence.

- 10 Hz: maximum feet 1.5, head 3.2; no new-head contacts.
- 60 Hz: maximum feet 1.791666667, head 3.491666667; actual body-top maximum 3.441666667.
- Continuous ballistic upper bound from current PLAYER values: head 3.551428571. This is a calculated bound, not a measured runtime frame.
- At body edge x=4.499, the actual 32-segment inner profile has y=3.220355468. Maximum body penetration is about 0.221311199 m; full-height envelope penetration is 0.271311199 m.
- Moving 60 Hz: 18 actual-body-contact frames (19 full-height-envelope frames). From north, first body contact at local z=19.051074349, feet=1.713333333, bodyTop=3.363333333. Last at z=17.642328548, bodyTop=3.221666667. The first longitudinal overlap is about 0.048925651 m; the center may still be outside because the body has ±0.5 m depth.
- Stationary 60 Hz at z=18: 22 actual-body-contact frames (24 envelope frames).
- In all these frames inherited CollisionManager proxies report zero collisions. Their old body wall height is 3 m, below the new central spring at 3.2.

Original evidence retained unchanged:
- `jump-red-original.txt` and `jump-original.json`: initial 8 tests, 4 failures, full-height envelope.
- `jump-body-boundary-red-original.txt` and `jump-body-boundary-original.json`: expanded 16 tests, 8 failures, separately recorded actual body and envelope.
- `tests/wumen-north-portal-jump.test.mjs` was the failing regression at discovery. It now runs the expanded repaired matrix; this does not rewrite any original failure output or establish browser acceptance.

Root cause: no new curved-head collision shape was registered; additionally FirstPerson applies vertical integration after horizontal checks and has no upward ceiling stop. Only adding horizontal proxies cannot fix a stationary jump under the new shoulder.

Integration-owner-approved repair boundary: retain exactly the same mesh shape; register three new north-head-only piecewise-linear overhead shapes, and apply narrow shape collision plus a bounded upward feet limit through the owner-controlled shared collision/controller integration. Untagged legacy collider behavior must remain unchanged. No global high-wall retrofit, disabled jumping, broadened tunnel vault claim or geometry raising is authorized by this finding.
