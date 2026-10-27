# Independent local immutable-polygon bounds reuse experiment

Predeclared after rejecting Float32 merge, 2026-10-27 01:03 UTC. Baseline runtime R115-fix; product source restored at6ddd6613. Only CanopyRoofSurfaceJoint.js may change. Root authorized a15-minute usefulness gate, not another whole architecture.

Actual complete startup diagnostic: two fits,742706 bounds checks but9226 unique polygons,600 main patches; repeated coordinate arrays/bounds comprise98.76% of evaluations. Instrumented fit sum271.969ms, not a predicted saving or timing acceptance sample.

Reuse only identical polygon object in one synchronous fit call using a local WeakMap. Compute identical Math.min/max over identical point values; no changed planes/split/epsilon/interpolation/order/triangles/caps/materials/physics. Split and blend construct new arrays/points, never mutate an existing polygon or point. Do not return/store cache or retain scene references beyond invocation.

Gates: RED repeated work counter; cap/attributes byte exact against frozen original source; changed-source new call and immutable input tests; actual finished high/low world/physics/mature47-image exact; current canopy passage/protection. Five fresh alternating pairs per quality, retain every local fit/whole-ready sample. Both fits local sum median at least20% lower and p95/max not worse; whole startup may not regress beyond already recorded same-quality A/A envelope, but is NOT claimed faster unless independently distinguishable. Actual retained resources exact; report OS RSS highwater separately from boundary heap samples. No GPU/mobile claims. Reject if local gain or safety gate fails. Prior fastpath rejection remains unchanged.
