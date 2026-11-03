# Yanchun South Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace only the retained south upper rail's 25 square balusters with pale turned profiles and recolor its two horizontal rails, following the official finished-state south photograph.

**Architecture:** Mutate the exact existing 27 south meshes after construction; recolor only the two existing same-position side endpoint boxes to prevent dark corner overlap (explicitly approved). retain their transforms, roles, old envelope, collider arrays and all navigation. Use a closed lathe profile within the original 0.07 × 0.92 × 0.07 baluster box. Keep photo-observed appearance separate from the retained fitted count and dimensions.

**Tech Stack:** Three.js, Node test runner.

**Spec:** Parent's explicit R163 task handoff: south-front visual only, no roof-skirt support or global physics, no remote writes/deploy/main change.

## Global Constraints
- Source: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d41b19d7f7.jpg ; photo SHA-256 fda0c35ed50b0d23f5b4151702faec1089f74fff3c9e999d170579d159e162f9.
- Preserve old positions, heights, envelopes, collisions, rooms, routes, side/rear rails and every unrelated mesh. The only side-row exception is the two same-position south endpoint boxes: material only, square geometry retained.
- 25 balusters is the retained model repeat count, not a surveyed or photograph-counted assertion. Paint/turned silhouette visible; substrate, carving and exact profile unverified.

## Review Focus
- Exact identity and complete expected 27-member host; reject wrong/partial/repeated application before mutation.
- South-only scope plus approved corner-material exception: all other 834 meshes geometry/material bytes unchanged.
- Closed, nondegenerate turned geometry with original height and a contained local box.
- Collider/walkable/room/map/region arrays byte-identical.
- Ground-entry route and current-state failures distinguished from stale baseline failures.

### Task 1: Retained-envelope visual replacement
**Files:** Modify `src/scene/palace/special/YanchunSouthPhotoFit.js` and its single call site in `RemainingOuterHalls.js`; add `tests/r163-yanchun-south-rail.test.mjs`, baseline fixture and evidence report.
- [x] Write source/shape/retention/fail-closed tests; run and retain expected RED result.
- [x] Apply pale material and closed lathe geometry to the exact 27 south members; recolor two approved overlapping side endpoint boxes only; keep proxies intact.
- [x] Run GREEN tests, archived plaque test, relevant ground-entry test, full current-state command and build; record invalid sparse-baseline failures by name rather than rewrite historical locks. Added normal ZoneManager merged-world collision/navigation check, 1/1 pass.
- [x] Produce same-camera before/after diagnostic views from real triangles, inspect pixels and obtain independent review.
- [x] Commit candidate on feature branch; report SHA and integration instructions, without push/deploy/main changes.
