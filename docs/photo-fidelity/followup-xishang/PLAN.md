# Xishang front open transom implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL superpowers:executing-plans. Single product writer, independent read-only review.

**Goal:** Add the own-photo-supported real open rectangular/re-entrant timber transom beneath the three existing main-front bays of FC-FADD286B97.
**Architecture:** One guarded helper called after the main frame. Closed rectangular box bars use original wood material and matching real box colliders; actual holes remain open. Original posts/beams/roofs/channel/stone rails/floors unchanged.
**Tech Stack:** existing Three.js/CourtKit/CollisionManager, Node tests and same-view CPU rasterizer.
**Spec:** ../MASTER-PROMPT.md; official own photos2671[1024].jpg and s58ffed5fbf403.jpg, personally viewed 2026-10-28.

## Global constraints
- Main local-front −Z transforms to world east/−X with p.rot=π/2. No unverified world orientation label.
- Retained mainW8.184/mainD4.69, column rowZ−2.345, beam bottom4.64, floor.5. Fit only below beam with physical connection and sufficient human jump head clearance.
- No glass/plane pretending open lattice, no patterned photo texture, no invented rear/side expansion.
- Grid counts/dimensions fitted; complete pavilion, precise original joinery and historical inventory not accepted.
- Same follow-up branch, no new R number, frozenR146/main untouched, performance专项 deferred.

## Review focus
- Wrong orientation/bay: actual parent transform, unique original profile/post/beam identity guards.
- Floating frame or roof penetration: new outer bars must touch retained column/beam; actual triangles below roof and visible in same-view render.
- Invisible walls across holes: each physical box matches its real rendered bar, no whole-panel collider.
- New collision/head bump: whole-world old central and channel-side route10/60Hz walk/run/jump; do not alter old controller body/oracles.
- Leaks/rebuild duplication: guard duplicates and verify all added geometry unloads once without disposal of shared materials before normal kit unload.

## Task 1: Bounded three-bay open frame
Files: new `src/scene/palace/special/XishangFrontTransom.js`, hook RemainingNingshouHalls.js; tests/followup-xishang and capture/readiness scripts.
- [ ] Pin preceding Biluo source fixture; write actual-builder test requiring 3 source-front panels and no whole-object acceptance, run red.
- [ ] Implement `buildXishangFrontTransom(c,{mainW,mainD})`; actual box frame/re-entrant bars inside existing 3 bay widths, top overlaps old beam slightly, lower edge near4.15 fitted not measured. Register each solid only.
- [ ] Verify original non-target mesh/physics exact, every added box rendered/collider equality underπ/2 transform, all real holes open, connected bars and strict foreign/duplicate guards.
- [ ] Run true full-static-world old front/near-channel routes and normal jump trajectories; preserve prior failures and do not expand hidden supports.
- [ ] Capture baseline/candidate same camera plus source image observation; independent shape and fixed-code review.
- [ ] Complete bounded resources, standard baseline comparison, build/HTTP check and honest evidence/README, then freeze specific SHA for serial uploader.
