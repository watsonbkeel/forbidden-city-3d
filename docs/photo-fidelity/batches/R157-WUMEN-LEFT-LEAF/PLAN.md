# Wumen left near-leaf visible caps implementation plan

> Implementer: use executing-plans with TDD; independent Astra review is coordinated by parent.

**Goal:** Add only 64 independently readable cap sites to the east near leaf; eight hidden sites remain unknown.
**Architecture:** One source-bounded helper, one LowerBase production call, no physics changes or refactor of the existing right leaf / paired exterior finishes.
**Tech Stack:** Three.js / node:test / current full World and CPU diagnostics.
**Spec:** DESIGN.md, approved parent 2026-10-31 14:43 UTC; independent left-only source registration.

## Global constraints
- Rollback eec6847e / verified remote f8f20486; never edit backup tree/main.
- Target east-yemen/hinge−1/local−Z only.64 visible; c8 rows1–7 and9 UNKNOWN; no confirmed missing sites. Preserve r8c8 and r9c1. No mirrored west mask, opposite leaf, handles or locking hardware.
- u.07..93 / v.03..955 / radius.0275×leafWidth /15mm projection are engineering fit, not metric photo registration. Preserve actual1.78×5.2leaf and dynamics.
- Old full/batch reds and missing-history P1 remain explicit. No golden replacement or source-history fabrication.

## Review focus
- Correct actual leaf/face and column order, including arbitrary hinge angles.
- Effective geometry/material/ancestral matrices and no unverified nested content.
- Raw physical arrays and prior right caps/exterior faces/non-target record preservation.
- Duplicate/frozen/invalid host and partial-add failure lifecycle without side effects.
- Comparison-only closure strips only authenticated new caps, never raw World queries or a whole leaf.

## Task1 — actual entity
Create src/scene/palace/special/WumenLeftLeafStuds.js; modify LowerBase import/call only. Add tests/lib/wumen-left-leaf-fixture.mjs and tests/photo-fidelity/batches/wumen-left-leaf-studs.test.mjs.
- [ ] Freeze both eec poses and source before production modification.
- [ ] Actual-entry missing-owner/64-site RED; retain log.
- [ ] Implement minimal source-specific decoration and prove GREEN.
- [ ] Add adversarial geometry/mask/contact/material/matrix, lifecycle and old-record/physics tests; each defect RED→GREEN.

## Task2 — cumulative validation and safe delivery
- [ ] Actual complete-face same-camera CPU A/B; preserve any failed first render identities.
- [ ] Preserve old-contract actual reds; retain all original gold and add only strictly bounded source/comparison successor if necessary.
- [ ] True no-installer World plus raw controller / physical retention and full/batch/three-base gates, serialized heavy slot.
- [ ] Independent terminal review, source/QA freeze, original failure evidence, safe dev commit and tested remote readback; whole-object increment0.
