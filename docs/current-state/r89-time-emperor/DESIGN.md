# R89 bounded design and diagnosis

The user requested separate hour/minute entry and reliable movement after time settings, explicitly correcting emperor travel to player RUNNING speed. Keep slider and restore-live controls. Apply numeric fields only via an explicit Apply button or Enter, with integer ranges 0–23 and 0–59; editing alone does not jump simulation time.

The approved implementation remains local until independent review. This is gameplay engineering, not a historical claim.

Verified frozen-R88 evidence:
- DailyRoutine hard-codes 0.65 m/s for the emperor; desktop sprint is PLAYER.SPRINT_SPEED = 12 m/s. One-waypoint-per-frame advancement additionally caps speed on dense route points.
- Actual Qianqing S loads at y=2.72 because generic floor lookup samples the permanent padded stairs at the hall centre; permanent floor/core is y=2.16. Actual S is misregistered by +0.56 m.
- With actual S loaded, the original emperor route stops at index 1061, position [1.6,3.0800000202655795,318.055], aiming for [1.6,2.86,318.4]. Existing four-world night variants omit Qianqing S.
- UI focus/control diagnosis and regression evidence are recorded with the tests; do not infer real-device acceptance from DOM mocks.

Actual S mutation proof with the floor correction retained: restoring only the old Qianqing approach still blocks at [1.6,2.86,318.05] against the S rail posts. The final approach stays in the central stair lane until z=319.15, then moves sideways behind the posts before approaching the chair. No structural collision is disabled, and no global radius is changed.

The travel loop consumes PLAYER.SPRINT_SPEED across multiple route vertices with <=0.15 m collision substeps and the controller's 0.1 s elapsed cap. Actual collision-valid wall sliding is retained at an existing Zhonghe corner; rejecting every partial slide incorrectly deadlocks that old path. Static walls and player capsules are still checked at every accepted substep.

The pre-existing occupancy-checked discrete seated/standing conversion is retained, including the Qianqing side approach. Continuous-travel assertions apply to standing-to-standing travel; they do not mislabel a seated-pose root change as running or hide it with a position reset.

The user subsequently requested intermittent R88-stutter optimization in R89. Measure actual CPU scenario tails before selecting a bounded fix; do not infer GPU/mobile improvement or reduce characters/collision.
