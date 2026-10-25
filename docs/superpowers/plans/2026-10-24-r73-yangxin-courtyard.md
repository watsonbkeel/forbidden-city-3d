# R73 Yangxin Courtyard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a source-supported, playable independent 养心门 without fabricating unknown courtyard enclosure joins.
**Architecture:** A parameterized permanent B-layer component invoked by a west-six opt-in property; use existing CourtKit ownership and collision machinery. Retain old item indexes and all R72 runtime input bytes except explicit successor delta.
**Tech Stack:** JavaScript, Three.js, Node test runner, Vite.
**Spec:** docs/superpowers/specs/2026-10-24-r73-yangxin-courtyard-design.md

## Global Constraints
No main/Pages change; no deletion; no survey claims; no whole-palace rescale; no R72 evidence overwrite; no added NPC or generic furnishings.

## Review Focus
- Portal head must not block walking or produce invisible low collision.
- Threshold must support feet from both directions.
- Independent wooden screen must not seal courtyard access.
- Zone disposal/reload must not leak map items or collisions.
- Unlisted runtime mutations must fail successor inventory verification.

### Task 1: Dedicated courtyard entrance
Files: data/architecture/yangxin-court-entrance.json; src/scene/palace/special/YangxinCourtEntrance.js; src/scene/zones/ZoneBase.js; data/zones/west-six.json; tests/r73-yangxin-entrance.test.mjs.
Interface: buildYangxinCourtEntrance(kit, zoneJson) returns frame, validates zone/profile; profile exported as YANGXIN_ENTRANCE.
- [x] Test missing runtime binding, distinct 遵义门 identity and retained old items; observe red.
- [x] Test real component portal/body collision, roof hierarchy, screen independence and map binding.
- [x] Implement bounded photo-fit geometry and integration.
- [x] Run isolated and west-six route tests and lifecycle disposal checks.
- [x] Commit tested component.

### Task 2: Cumulative preservation and evidence
Files: scripts/r73-source-inventory.mjs; tests/r73-source-inventory.test.mjs; reports/r73-yangxin-courtyard/*; release.json.
- [x] Write negative successor inventory tests for mutation/deletion/unlisted addition; observe red.
- [x] Record exact allowlisted R72→R73 runtime delta and reject all unknown mutations.
- [x] Run R72 focused and four-world regressions, current-state baseline comparison, zones/anchors/build.
- [x] Record pass/fail/not-run honestly, commit final candidate; report to parent for review before upload.
