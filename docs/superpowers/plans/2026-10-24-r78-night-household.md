# R78 Night Household Implementation Plan
> Execute with superpowers:executing-plans; single implementation owner.
Goal: fulfill three priority sleep/lighting requirements cumulatively from R77.
Architecture: explicit civil-time lighting policy, rank-specific fitted bed data, sleeping-only head geometry option.
Tech Stack: existing Three.js/JavaScript/Node/Vite.
Spec: ../specs/2026-10-24-r78-night-household-design.md
## Global constraints
No deletion or external writes. Preserve108 actors,28 occupied beds,12 palaces,old routes except necessary bed approaches.200MB free floor.
## Review focus
Stationary21:00 boundary,nearby awake-light spill,awake geometry identity,bed/wall intersections,night routes and wake reversal.
## Tasks
- [ ] Red/green time boundary and emissive/point-pool tests; main passes shared civil time.
- [ ] Red/green sleeping eyes across3LODs; awake byte identity and work-budget tests.
- [ ] Audit actual rooms,fit private consort large beds and compact maid cluster; update routes and test fullworld contacts/clearances.
- [ ] Full routines/night worlds,emperor/patrol,map/flight/trap retention,known-failure comparison,build,onebackup and independent review.
