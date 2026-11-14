# Central head details implementation plan

Goal: bounded engineering-fit back hair and continuous ear relief for existing isolated central study; not historical reconstruction.
Architecture: reusable StudyHeadDetails geometry helper; unchanged face/body and default OFF. Brown back-only cap plus <=128 low convex curls. Ear deformation stays in existing thin ellipsoid envelope and retains root overlap.
Tech: existing Three.js, no new dependencies/assets/services.
Constraints: original generated front texture/UV and legal-alpha partition unchanged; no main/Pages;6GiB/720s hosted guard unchanged.
Review focus: front/ear exclusions, closed topology, true root contact, bounded resource count, texture/detail loss.
- [ ] RED tests for missing helper, full-vertex back-only restriction, bounds/closed parts and ear shallow recess.
- [ ] Implement helper; integrate geometry/material ownership and batch into <=6 groups. No new default imports.
- [ ] Run all previous controls plus new tests and independent real geometry review.
- [ ] Freeze new identity, upload dev only, full file readback, one hosted five-view run.
- [ ] Independent art review and Library images, canonical ledger update; no acceptance inferred from CI.
