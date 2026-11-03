# Taihe Front Porch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align three small stairs and provide a real continuous column-behind porch.
**Architecture:** A local profile derives stair centers and screen depth from the existing Taihe grid. PalaceBuilder uses it only for Taihe front elements; stair owner data follows the two moved ramps.
**Tech Stack:** Three.js, Node test runner.
**Spec:** docs/superpowers/specs/2026-11-03-taihe-front-porch-design.md

## Global Constraints
- Preserve columns, closed screens, original central openings, roof, floors, other buildings and collision policy.
- No upload or deployment. Coordinates are model fits, not current survey.

## Review Focus
- Screen geometry and solids must move together.
- Keep the separate front eave beam.
- Only small stairs move; large terrace stairs do not.
- Real walk/run ascent and descent at 10/60 Hz must remain supported.
- Screen bays remain physically blocked from the porch.

### Task 1: Recess screen and align stairs
- [x] Write tests for real three-hall stair/porch routes, geometry and owners.
- [x] Run and observe failures on parent code.
- [x] Add local profile, route front screen and threshold through it, pass new small-stair centers and update only the two owner records.
- [x] Run new tests, relevant contact/entry regressions and build.
- [x] Report exact evidence and limitations; provide local patch without upload.

## Result

35/35 focused checks, build and diff checks pass. Independent review found no blocking defect. Additional requested fourteen-piece door/screen retention is in the permanent suite. See docs/current-state/r163-taihe-front-porch.md for evidence and unverified limits.
