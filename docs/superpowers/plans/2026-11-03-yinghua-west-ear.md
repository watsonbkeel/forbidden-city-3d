# Yinghua West Ear Hall Implementation Plan

> **For agentic workers:** Use inline execution. No further agents are authorized for this task. Steps use checkbox syntax.

**Goal:** Add an identifiable H43 west ear hall with real closed-shell collision and front access.
**Architecture:** A dedicated staged builder hooks only outer-west. A narrow exact-tuple courtyard hook offsets only the conflicting original west-wall interval z473..490.5 to x306.5, with two full-height closed return walls; all other original courtyard walls use the existing builder.
**Tech Stack:** Three.js, CourtKit, Node test runner, existing FirstPersonControls/CollisionManager and Playwright/WebGL previews.
**Spec:** docs/superpowers/specs/2026-11-03-yinghua-west-ear-design.md

## Global Constraints
- Isolated from f4ec6882; no main change, upload, push or child agents.
- H43 FC-BA2BB4F70D only. No main Yinghua hall or previous repair edits.
- Approximately 10.2m width, fitted hidden details; no new interior, map labels or room permissions.

## Review Focus
- Real western side is +X and lower roof must not intersect the retained large main roof.
- Cut court wall must close against the hall without a walk-through boundary slit.
- South approach must not be obstructed by wall returns or roof AABBs.
- Staged failures must leave the original host untouched and release allocations.
- Late merge, streaming and old gate/main-hall routes must remain functional.

### Task 1: Exterior and local wall integration
- [x] Add failing tests for exact host, topology, mesh owners, real steps and atomic failure.
- [x] Run RED before adding builder.
- [x] Add the staged hall builder and exact local wall hook.
- [x] Run GREEN and normal-world real-controller routes, owner/mesh boundary probes, source/build checks.
- [x] Capture south/oblique/overhead previews and check wall treatment.
- [x] Record limitations and commit for parent cherry-pick only.

## Execution record
Native implementation only, per assigned scope. Three-bay compact body and local wall bulge were chosen after the 6.3m cramped option and the initial 6m wall cut failed visual comparison. Staged roof inputs are pre-resolved so early shared roof material failures cannot leak private materials. Final 9/9 scoped suite, build and four source-hashed CPU previews passed; repository npm test script is absent. Parent performs integration/review. No upload, push, main change or publication.
