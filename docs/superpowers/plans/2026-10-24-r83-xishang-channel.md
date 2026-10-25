# R83 Xishang continuous channel implementation plan

> Execute inline as the single authorized implementation owner. Fresh independent review before upload.

Goal: replace only the five-segment angular watercourse with a continuous photo-informed shallow stone channel, while preserving the whole pavilion and existing physical routes.

Architecture: a separate XishangChannel module creates one sampled continuous curve, variable-width offset outline, a genuine cutout in the stone field, closed bottom and sidewalls, and water from that identical outline. RemainingNingshouHalls calls it only for Xishang. No global physics, navigation, footprint or historical inventory changes.

Facts: official page 236514 describes 27 metres; two actually viewed official photographs show flowing bends and a central return. Existing fitted stone field is about 6.384 by 2.144 metres. Neither photographs nor retained model provide surveyed dimensions. Do not add invented loops to reach 27m; report computed model length and residual. Stone top .70, channel bottom .64; narrow shallow depression is not a new water-exclusion region. Existing navigation stays untouched.

Review focus: offset self-intersection at tight returns; flipped or open wall faces; stone occluding the water; entrance obstruction/player-radius/fall-trap regressions; preservation of other pavilion components.

1. Save R82 inventory and named geometry/navigation signatures. Write red tests for a continuous variable-width channel with honest metrics, actual top-ray opening and closed stone solids.
2. Implement bounded curve/profile in src/scene/palace/special/XishangChannel.js and replace only old channel generation. Compute actual length, minimum turn radius and bank separation; reject self-intersecting outlines. Run tests and commit.
3. Add actual radius-.5 entrance round-trip/drop checks and unchanged architectural/physics signatures; restore full checkout after audited disk headroom is available. Run exact successor, affected consumer regressions, full world nav/flight and four night stages serially. Preserve raw 152 failure baseline and explain any newly superseded old structure contract.
4. Update release/README truthfully; one root and subpath build, one cumulative backup, hashes and fresh independent review. No GPU appearance claim without an actual permitted renderer. No GitHub/main/Pages writes by this owner.
