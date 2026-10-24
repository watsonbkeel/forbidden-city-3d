# R80 Three-side outer moat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render the existing modeled north/east/west moat belt without inventing a southern bridge or changing gameplay navigation.
**Architecture:** A pure profile derives three non-overlapping strips and one U-shaped contour from the unchanged Layout moat. Environment owns water, bed and six bank faces, and cuts its ground with the same contour. Minimap distinguishes rendered sides from the pending south strip; flight retains its conservative four-side mask.
**Tech Stack:** Existing Three.js, Node tests, Vite; no new dependency.
**Spec:** Parent-approved bounded phase5 continuation, autonomous engineering fit; actual official visit maps viewed before implementation.

## Global constraints
- Keep Layout, physics, wall, gate, NPC, flight mask, initial spawn and southern ground unchanged. Water y=-0.5 is inherited model fit, not a survey.
- No south water, guessed bridge, end-wall cap, global rescale, north wall shift, main/Pages write or deletion.
- Own generated geometries/materials, borrow library stone; avoid merged diagonal bounds. Keep 200MiB disk headroom and one backup maximum.
- Keep R79 discovery and main-preservation changes cumulative.

## Review focus
- Ground holes must not triangulate across the U courtyard or south spawn.
- North corners must meet without overlapping water or bank closures.
- Flight water rejection must remain conservative even where southern rendering is pending.
- Disposal/reinitialization must release owned resources once and preserve borrowed textures/materials.
- Map labels must disclose model fitting and pending southern strip, not imply full restoration.

### Task 1: Shared contour and owned rendering
- [x] Write failing profile/geometry tests for exact coordinates, non-overlap, south absence, normals, banks and ownership.
- [x] Implement `outerMoatProfile(item)`, `outerMoatGroundPath(item)` and `buildOuterMoat(library,item)` in `src/scene/palace/special/OuterMoat.js`.
- [x] Integrate same profile into Environment ground holes and generated object ownership, retaining all existing river cuts.
- [x] Run geometry ray tests at all three waters, both corners, dry courtyard and spawn; commit.

### Task 2: Truthful map and retention
- [x] Test visible map disclosure and distinct pending south styling.
- [x] Use profile strips for map water rendering and show pending south separately. Do not change map bounds, controls or landing mask.
- [ ] Strict successor guard, full nav identity, flight water/landing checks, initial spawn and retained ascent routes, night/lifecycle and map-input regressions.
- [ ] Fresh independent review; preserve old failure comparison, build/one backup, update only current README history; freeze exact evidence.
