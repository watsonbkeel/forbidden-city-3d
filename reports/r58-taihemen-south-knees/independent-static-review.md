# Independent static review

A separate reviewer inspected the bounded working patch, own Taihemen source photos and saved CPU evidence without executing any test, build, export, render or world.

- P2: pure W consumer used derived matrixWorld before refreshing it. Freshly built W may not yet have rendered. Fixed by `root.updateWorldMatrix(true, true)` before raycasting, without changing local transforms/geometry/registrations. Added a deliberately stale-matrix input test.
- P3: the stricter knee guard could reject H=5 after the enclosure had already changed its parent/colliders. Fixed by moving the same helper call before parent.add and all external metadata/collider writes. The helper itself validates before allocating. Added caller-level atomicity regression.

No other concrete defect was identified. Reviewer found the fourteen shallow halves consistent with the limited own-source silhouette scope; no copied Xihe geometry, new collider/support, private source pixels or false browser acceptance. Material/geometry disposal follows the existing merge/builder lifecycle. Source thickness, reverse decoration and capture dates remain uncertain.

This review did not independently rerun saved passing reports and does not establish browser visual acceptance.

Final static re-review confirmed both fixes and identified no new defect. After the memory hold ended, all 18 new focused and 20 existing Taihemen tests passed, and a fresh component export plus six camera/material/triangle-multiset comparisons confirmed unchanged saved CPU geometry.
