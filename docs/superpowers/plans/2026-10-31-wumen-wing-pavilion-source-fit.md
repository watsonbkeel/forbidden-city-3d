# Wumen wing/pavilion source-fit implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** Correct only the independently evidenced southern outer column rows of the existing southeast/southwest pavilions, and distinguish all existing wing/pavilion/link instances without inventing objects.

**Architecture:** One host-scoped module, called after existing transverse links. It replaces two middle columns in each targeted row with four source-registered middle columns while retaining the corners, shared buffers/materials, roof, enclosure, other faces and runtime physics. Metadata identifies the two wings and four pavilions; two existing transverse links remain cautiously associated with the historical clock/drum region, never identified as surviving instruments.

**Tech Stack:** Three.js, Node test runner, existing PalaceBuilder/merge.

**Spec:** R157 A37 MASTER-PROMPT lines350–353, audit-wumen-completion-20261031/HANDOFF.md, official 2021 plan printed152–153.

## Global constraints
- Existing d70a4a02 content and unrelated WIP preserved; no main/Pages writes.
- No principal tower, platform, openings, ramp, access or collision changes.
- Southern pavilion rows derive independently from each plan page, not mirror inference.
- Retain 11m outer width and 7.5m body height as model fits, not survey.
- No copied exhibition contents, bells/drums, speculative enclosure or roof changes.

## Review focus
- Host/instance mismatch must fail before mutation or allocation.
- Both corners, all non-target geometry and physics must remain exact.
- Repeated application must be a no-op without allocations.
- Actual merge must retain metadata and share resources; disposal once.
- Southern deck support/collision access remains the original closed model, not acceptance.

## Task 1: Scope-safe southern rows and instance ledger
**Files:** new `src/scene/palace/special/WumenWingPavilionInstances.js`, new `tests/photo-fidelity/batches/wumen-wing-pavilion-instances.test.mjs`, minimal PalaceBuilder import/hook, local evidence/report.
- [x] Write tests for six own-source columns in each south instance, exact retained geometry/physics, no-op/negative/lifecycle cases and merged records.
- [x] Run tests red against baseline (4 columns).
- [x] Implement guarded module and final Wumen-only hook.
- [x] Run targeted tests, existing north-enclosure/column suites, affected ascent/controller tests and production memory build.
- [x] Audit two wings, four pavilions, two link-region candidates separately; record evidence limits, measured cost and honest unresolved areas.
- [x] Commit isolated changes and return cherry-pick/conflict notes.

## Task 2: Northwest north row, separately approved continuation
Parent explicitly requested continuing the independently registered northwest north row after the first reviewed commit. Use printed153's own upper pavilion region, approximate full-render axes `[1599,1636,1697,1787,1848,1885]` at y1162; not copied from northeast/southwest.
**Files:** new `WumenNorthwestColumns.js`, new `wumen-nw-north-columns.test.mjs`, one import/hook after Task1, authored review addendum.
- [x] Behavioral red test: actual existing northwest row4, expected6.
- [x] Guard and replace only the two north middle meshes by four source-fit meshes, corners/south row/enclosure/roof/physics and Task1 unchanged.
- [x] Verify exact delta against `0ab13818`, no-op/negative/shared buffers/disposal/merge8records/deck contact/routes and 3-base compile.
- [x] Get independent review; commit separately.

## Task 3: Four independently documented OUTWARD side rows
Parent explicitly requested continuing the four own-evidence outward side rows after Task2. Add four intermediate exterior columns per pavilion; keep all existing corner meshes/proxies and all inward connections/faces unchanged. This is NOT a generic full20column perimeter.
**Files:** new `WumenOuterSideColumns.js`, new `wumen-outer-side-columns.test.mjs`, one import/final hook, bounded composition of this separately pinned delta in Tasks1–2 retention tests, review addendum.
- [x] Behavioral red: each actual outward row has2 corner columns, own plan has6.
- [x] Independently register NE/SE from printed152 and NW/SW from printed153, each own y axis; top/bottom register retained11m depth.
- [x] Preflight all4 then add only4 middle meshes per row sharing existing buffers/materials, with exact local proxies; no runtime physics/access change.
- [x] Verify against reviewed d874222f all existing objects exact, all4 old corner objects retained, geometry/deck/merge/ownership/negative/no-op tests, affected routes and3-base compile.
- [x] Independent review, authored limitations/cost/source registration and separate commit.
