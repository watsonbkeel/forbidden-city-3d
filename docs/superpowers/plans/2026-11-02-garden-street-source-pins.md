# Garden Street Source Front Pins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Source-positive four front door pins on each of four already existing R162 gates, without changing native navigation or duplicating gates.

**Architecture:** A narrow identity-guarded decoration helper targets the four retained default CourtKit wall gates. One normal ZoneBase hook later calls it for all gate items; unrelated gates are no-op. No changes to shared kit/data/landscape/physics.

**Tech Stack:** Existing Three.js/CourtKit, Node24 node:test, actual texture library and CPU fallback evidence.

**Spec:** `docs/superpowers/specs/2026-11-02-garden-street-source-pins-design.md`.

## Global Constraints
- Original397 ten-version scope; R162/G29 remains incomplete, all whole-object acceptance NOT_ASSERTED.
- Main user-merge only; no deployment; preserve rollback and all cumulative work.
- Formal frontend names only; source/engineering/uncertainty metadata stays internal.
- Changkang cardinal photo face UNKNOWN; no north assertion or back-face copying. Qiongyuan local+Z follows explicit own-photo context inference.
- Existing geometry/material/physics/maps/rooms/plaques exact; no official photo redistribution; no generic copy of unseen furniture/details.

## Review Focus
- Similar named or nearby gates must not receive the helper accidentally.
- Local+Z versus −Z must be explicit per object, not inherited from a presumed compass convention.
- Duplicate/frozen/tampered/transformed hosts must not partly mutate the kit.
- New polygons must survive normal finish and dispose without touching shared resources.
- Tiny new ornament envelopes must not overlap the retained nameboard or alter door routes.

### Task1: independently testable source helper
**Files:** create `src/scene/palace/special/GardenStreetGatePins.js`, `tests/r162-garden-street-pins/{component.test.mjs,fixture.mjs}`; optional source-only docs and CPU tooling in matching R162 directory.
**Interface:** `applyGardenStreetGatePins(kit,frame,{zoneId,itemIndex,item})` returns false for unrelated tuples, otherwise adds exactly4 source-front pins and one internally qualified architecture record. Exact source tuples and numerical values are frozen in `/tmp/garden-front-pins-2042/task-1-brief.md` for the implementation dispatch.
- [ ] First write actual-library tests for missing API/4-pin absence; run and preserve the expected red.
- [ ] Implement minimal closed polygon geometry, own-source metadata, exact tuple/host/duplicate guards, normal resources; no production hook yet.
- [ ] Assert each4-pin record/side, finite closed geometry/UV/normals, complete original streams unchanged, no plaque overlap, atomic failures, normal finish/disposal/shared-resource protection.
- [ ] Run focused tests and diff-check, commit only owned files, write author report/raw logs in isolated `/tmp/garden-front-pins-2042` paths.
- [ ] Independent review source pixels/spec and code-quality evidence before any hook.

### Task2: normal integration and cumulative delivery
**Files:** narrow new import+call in `src/scene/zones/ZoneBase.js`; normal QA in new cumulative directory; evidence README/verification/review/pins.
**Interface:** call helper immediately after retained generic gate creation, passing exact current zone ID/index/item and actual just-created frame. No author injection in final QA.
- [ ] Freeze current actual-world native old gate routes/physics before the hook; preserve any pre-existing blocked probe as diagnostic, not successful access.
- [ ] Observe normal missing-unique-record red, then sole hook, normal4 records and4pins each; prove native physics/old complete route reports equal baseline and unrelated geometry remains exact.
- [ ] Independent final normal code/source/guard review and CPU actual geometry views; rerun applicable focused/neighbor gates, clean build with runtime identity and local HTTP/hash.
- [ ] Pin scope/provenance/unknowns and original397 remaining work. New non-main development branch only, preserve old remote as parent, fully read back current tree and changed-file bytes, check exact remote CI state without inventing success.

Continuous execution follows the user's existing explicit authorization; no repeated design preference gate. Controller ledger/brief/review packages live in `/tmp/garden-front-pins-2042`, with base `edc2de78` recorded. R163/H43 remains lookahead until this executable R162 pass is complete or a real blocker is recorded.
