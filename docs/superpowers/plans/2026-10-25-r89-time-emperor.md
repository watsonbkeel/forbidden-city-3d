# R89 Time Controls and Emperor Routine Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. One implementation owner; parent coordinates one independent review before freeze/upload.

**Goal:** Direct hour/minute time entry, reliable return to movement, and continuous player-sprint-speed emperor travel with correct Qianqing B/S entry and throne approach.

**Architecture:** Preserve the existing clock and controller ownership. Add explicit validated time application and release stale field focus at tour return. Consume emperor polyline distance across short collision-tested substeps using PLAYER.SPRINT_SPEED. Anchor Qianqing S to its permanent floor and adjust only its final approach to clear real S rail posts.

**Tech Stack:** Existing Three.js, Node 24 tests/DOM fixture, Vite; no dependency changes.

**Spec:** Parent-approved R89 scope and docs/current-state/r89-time-emperor/DESIGN.md.

## Global Constraints
- Preserve frozen R88 and shared Git/dependencies; isolated R89 branch. No main, Pages, account or credential changes. Parent alone uploads after review.
- No global collision disabling, radius shrinking, position reset, map teleport, or pretending CPU tests are GPU/mobile evidence.
- Preserve 108 NPCs, 28 occupied beds, night lighting and closed eyes. Preserve inherited raw-suite failures with exact comparison.
- One final clean production backup and focused proof index; README and changelog record actual results.

## Review Focus
1. Focused time fields after Escape/settings/reopen must not silently swallow future movement keys.
2. Pointer lock rejection or delayed unlock must keep an explicit click-to-resume path; no automatic non-gesture relock.
3. Sprint must consume small authored waypoints without frame-dependent slowdown or low-FPS collision tunnelling.
4. Actual Qianqing S floor and rail proxies must be tested, not just B/Yangxin/Kunning/Huangji.
5. Time reversals, blocked seat/return and interior load/unload during walking must preserve state and continuity.

## Tasks
- [x] 1. Write and run failing real-DOM/controller tests for numeric hour/minute application (00–23, 00–59, blank/out-of-range/decimal rejection, Enter, live restore, slider), focus isolation and button/Esc/reopen return. Implement bounded UI/focus fixes and re-run existing settings/map/flight regressions. Commit.
- [x] 2. Write and run failing actual-world tests for PLAYER.SPRINT_SPEED, multi-waypoint budget, low-FPS sweeps, Qianqing actual S floor and throne arrival. Fix the verified local causes, test B/S both directions, player blockage/resume, 21/06 reversals and S load/unload. Commit.
- [x] 3. Run four retained full-world night variants, full raw current-state suite, relevant shared-loader and focused checks; record inherited versus new failure labels. Independent review, address important findings, update release identity/README/changelog/evidence, build root and /gugong/, make one clean backup, verify clean frozen commit and report to parent.
