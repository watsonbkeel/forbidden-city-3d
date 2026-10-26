# R109 Stair Body Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Sole product writer, independent review remains separate.

**Goal:** Remove confirmed full-body platform overlap on two normal-ground stair routes.
**Architecture:** Two source-owned local dispatch markers; reuse existing full-body box/capsule sweep, add original rectangular-ramp foot support only to this kind. Preserve all outside behavior.
**Tech Stack:** JavaScript, Three.js, node:test, actual world/controller CPU fixtures.
**Spec:** ../specs/2026-10-26-r109-stair-body-contact.md

## Global Constraints
No new visible or collision geometry, no global .35/body/step changes, no fake roof/closed ramp solid. Existing two engineering ramps retain source values. Unknown shape rejected. Major cumulative gates deferred to R110.

## Review Focus
- Whole square reaches platform before center: highest real box wins over ramp.
- Source low beam blocks lift even if endpoint clear; thin post blocks translate.
- NPC blocks pose without erasing supporting floor; airborne never autosteps.
- Side exit/domain edges preserve gravity and no upward snap; held clone follows source generation.
- Existing Yangxin/Xiqing/Duixiu and unrelated geometry/metadata remain exact.

### Task 1: Source-bound marker and rectangular-ramp support
Files: new src/controls/StairInterfaces.js; src/scene/zones/ZoneBase.js; src/controls/FurnitureMotion.js; tests/r109-stair-contact.test.mjs.
- [x] Write pure RED for two IDs/invalid source, square corner maximum, maxTop, platform priority, unknown/taper rejection.
- [x] Implement registration from actual existing ramp/platform, atomic selection, finite-domain copy; original scopes unchanged.
- [x] Implement `stairRampContact(scope,x,z,maxTop,radius)` returning source witness or null; run pure tests and commit.

### Task 2: Continuous local movement and vertical support
Files: FurnitureMotion.js; tests/r109-stair-motion.test.mjs.
- [x] RED lift/head, translate/post, NPC/floor separation, airborne no-lift, downward ramp landing, new-call source invalidation.
- [x] Integrate higher ramp target into existing validated lift/translate path and same-XZ vertical minimum-hit; do not alter old kinds.
- [x] Run pure contracts plus original R96/R104 targeted tests, commit stable hash for independent reviewer.

### Task 3: Actual route and retention evidence
Files: scripts/r109-stairs/*, reports/r109-stairs/*, docs/current-state/r109/*.
- [x] Run same actual two normal-ground routes and rear protection at 10/30/60; preserve original RED and per-frame body evidence.
- [x] Verify actual domain inventory, boundary/held source, model/physical arrays excluding marker equal; independent review.
- [x] Measure paired local/outside CPU, retain all samples; document actual remaining scope/NOT_RUN and freeze. R110 owns final184/full suite/threebase/package.
