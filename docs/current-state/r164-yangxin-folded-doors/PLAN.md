# Yangxin fitted open double board doors

Goal: give the two existing main-room doorways visible paired red board leaves without closing either path. The official exhibition entry8664 and Palace PDF8ccad4e5728d0f62855c8e72e7ef45cf support double board doors in red partitions. The exact modern open posture, hinges, dimensions and carving are not established.

Design: four plain opaque red leaf boxes folded back onto the main-room side of existing partitions, local x±5.84, z±2.275, size0.08×3.3×1.45m. Fully open posture is an explicit gameplay fit, not measured reconstruction. The original3m doorway,6 wall/head meshes, GLB, furniture, all previous geometry and physics stay unchanged. Four matching ordinary collision proxies prevent false pass-through of visible leaves; no new walkable tops, door animation, lettering, carving or invented hinges.

- [x] Red test: real GLB/current partitions must gain four visible leaves and matching contacts, not mutate any original objects. Source/mutability and injected late failure tests.
- [x] Green: one bounded helper plus one loader call. Stage all resources; reject invalid source before mutation; preserve canvas-unavailable original path.
- [x] Freeze4409 Loader; actual west-six B/S comparison, unchanged old objects/roof/physics, route and head sweeps, negative controls, unloading and retry.
- [ ] Necessary cumulative component, Fengxian cached Teleport and lint checks; independent review; Node24 exact Pages-base clean build.
- [ ] Upload unique successor only after checks and fully read back. Keep4409/main. No World/browser/GPU, no completion-rate claim.

Review focus: readonly metadata/root children, mutated wall/proxy source, partial geometry allocation, canceled/failed loader disposal, doorway-edge traversal/head contact. Each is covered by component/lifecycle or actual B/S tests.
