# R151 Wuying central south stair balustrades

**Goal:** Complete the source-supported pair of raised descending stone balustrades beside the R149 central south stair, not rebuild its incline or treads.
**Architecture:** One canonical post-stair hook, explicit guarded original group/side stones and existing upper horizontal-rail endpoints. Keep old geometry/walkables; stage new closed rail/panel/post meshes before registration. Exact source contact for slopes, ordinary source-matched box posts; only a bounded stair-side contact domain if needed, using existing solver and independently verified live original stair/platform support. No broad AABB above a sloped rail.
**Source:** MASTER FC-77E2C07341, official building236500, photograph https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefdd3c1950.jpg (personally viewed, captured date unknown). Central descending pair is clear. Other two flights are partly hidden behind foreground bridges; do not assume identical detailed inventory.

**Fit:** Retain width5.68, run1.28, rise0.8, low side-stone centre x±3.04 and z edge-9.75/toe-11.03. Build only on these two axes, retaining clear stair width and current four upper rail runs. Section dimensions/post count are explicitly model fits; no carved figures/dragons or complete stone inventory claim.
**Constraints:** Parent18fd203; independent branch; protect R147–R150 branches, all WIPs, original dirty reports; no test-log uploads. R151 is next development checkpoint, not already delivered. Do not change main/Pages, river, bridge, other five flights or normal entry width.

## Alternatives and chosen method
- Image-only / decorative rails without contact: rejected, creates walk-through stone.
- Tall axis-aligned boxes around sloped rails: rejected, blocks clear space above the descending slope.
- Closed source geometry with bounded exact contacts and preserved support binding: selected using existing project machinery, not a new global controller.

## Verification sequence
- [x] Red actual ray/side-crossing checks show absent raised rails; guard exact central R149 and retained two low side stones.
- [x] Generate complete paired post/panel/toprail assembly, same stone material and original footprint; stage/rollback guards, no mutation of prior meshes or walkables.
- [x] Check both stair lanes/central incline up-down, near-rail travel, bridge→stair routes, lateral blocking, no phantom tall blocker above the low rail, genuine high-drop and exits at10/60Hz, real texture merge and local/domain-outside behavior.
- [x] Prove non-target source geometry and all original physics unchanged except explicit new rail ownership; finite/closed geometry and cost; inspect actual CPU assembly; independent review.
- [x] Full safe-parent/candidate current-state suite serial, targeted old-test failures explained rather than hidden, three-base in-memory compile. Keep raw evidence outside repo.
- [x] README R150 local mapping and R151 next-checkpoint status; local checkpoint only after results and remaining GPU/full-gate limits recorded.

Execution notes: RESULT records the extra live-footprint performance red/green, non-contact R149 landing correction, and the independently found eye/feet caller mismatch plus explicit-height fix. The final current-state comparison preserves all 218 historical failures; checklist completion is not whole-gate/GPU acceptance.
