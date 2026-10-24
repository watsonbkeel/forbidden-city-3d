# R72 cumulative night-life and local safety

Base: frozen R71 645748e39494bf5c5305699b052ae87df32224f0. Single local implementation owner, no main/Pages changes. User's five requested changes form one cumulative delivery, not five competing versions.

## Design decisions
- Local architectural collision/support fixes only. No global step height or GLB navigation changes. Taihe's visual dais is 2.06m, whereas prior proxy was 4m. Garden rockery used only 3m core collision under an 8m summit. Keep collision solid and support at visible surfaces; footprint support reaches the player's half-width to prevent edge descent into the same solid.
- One authoritative Beijing time from Environment's day cycle, including preview. Night is [21:00,24:00) union [00:00,06:00). Gameplay schedule, bed placements and imperial transfer are explicitly interpretive, not historical claims.
- Retain 108 stable character IDs and current 24 original routes. Dedicated routine state owns reversible destination changes, checked travel, and occupied destination waiting. No hidden nighttime actors or instantaneous cross-wall motion.
- Each of 28 adult female actors receives one bed; include all twelve six-palace compounds and preserve five actors' other palace areas. Minimum 30 beds. Sleep remains normally clothed; body, bounds, visual pose agree.
- Interior light pool is bounded and independent of optional S interiors, supports enterable B fallback rooms too. Day remains unchanged. Trees are extended only from official Wenhua/Wuying photo references, with fitted placement labels.

## Checkpoints
1. Trap reproductions using real FirstPersonControls and CollisionManager at 10/60 fps; local fixes; four-direction exits and stairs, existing NPC collision regression, full world/seat compatibility review.
2. Bed configuration, sleep geometry/body and clock boundary tests. Route/runtime lifecycle integration, emperor destination seat and guards/eunuchs movement. Verify count, collision, cancellation, unload/reload and player obstruction.
3. Room light selection/budget and explicit runtime hooks; photo-source trees and swept route exclusion checks. Build both bases and run scoped integration, retain known legacy failures.
4. Independent review and cumulative freeze: artifacts, hashes, exact tests, source/CPU versus GPU/mobile/full-route gaps. No success claim without fresh evidence.
