# Zhonghe slender stands implementation plan

> Inline execution, no extra agents. Parent-selected small candidate with independent Astra before integration.

**Goal:** Replace only the two inherited giant Zhonghe tripods with source-bounded slender stands.
**Architecture:** New ZhongheDisplayStands module plus local dedicated ZhongheDisplaySetting call replacement; no shared builder/controller edit.
**Tech Stack:** Existing Three.js and exact TriangleSupport.
**Spec:** ../specs/2026-11-01-zhonghe-stands-design.md

## Constraints and review focus
- Base5b83065f detached worktree; no remote/main/shared edits or new dependencies.
- Every dimension and three-leg topology are a reversible fit, not measured evidence.
- No carving/invented equipment; no broad air box or rescue surface.
- Unrelated geometry and collider/support data must remain exact.

## One bounded deliverable
- [x] Capture baseline non-target and run existing Zhonghe real route suite.
- [x] Red API/source/fit/empty-gap tests; implement dedicated builder.
- [x] Replace only two tripod calls and corresponding obsolete retention metadata.
- [x] Verify same non-target hash, exact per-solid collider, merge/disposal, original route suite.
- [x] Same-camera CPU evidence and source/limitations report; freeze candidate for parent Astra.

Independent Astra and final integrated full-world/build/release gates remain parent-owned and pending.
