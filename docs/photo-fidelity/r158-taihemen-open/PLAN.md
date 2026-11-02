# User bug: Taihemen central stone gameplay access and dragon UV
Base c376ef094e0377ecee183a31252d3eadb95c54a2 equals remote aac4e3a tree c68e58c4a9ffbbb311bac20168d994e00e8ea1b7.
User screenshot image(20261102-000350).png explicitly requests only central head/toe black barriers removed; current real-world barrier presence does not constrain game access. Keep white stone side guards, old stair owners and global physics.
Root cause: yulu material is ClampToEdge, yet this slab incorrectly receives metre-scaled applyBoxUV through {box:2}; other Taihe slabs use native full-image UV. Restore this slab's0..1 UV, reuse unchanged existing dragon albedo/normal, no new image or claim of carved historical geometry.
1. RED exact two fences gone, eight surviving triangle owners identical, all other collisions/walkables unchanged; complete top UV0..1 and shared material unchanged.
2. Change only TaihemenObservedApproach profile and TaihemenObservedSolids builder; existing black barrier descriptors become explicit game removal, no real admission claim.
3. Actual production World central south up/down10/60Hz walk/run, old outer approaches retained, side guard negatives; assert gap<=.3 or stop diagnose before any physics expansion.
4. Load original texture pixels for diagnostic UV before/after rendering, retain exact texture hashes; no GPU claim. Independent Astra then unique integrator, no sharedhook/main/branches edit.

Approved addition after true native-path RED: one exact-stone-bound full-body contact envelope and local Taihemen contact tracking, with unchanged global physics and all eight stone/side collision owners. A half-metre head transition plus 0.1mm numerical clearance avoids triangle sweep corner/Float32 penetration. Local material clone depth bias resolves coincident visible surfaces without changing stone geometry. See README for tested bounds and lifecycle limits.
