# Fanhua floor-edge scroll band implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Sole product writer; independent source/visual/code review.

**Goal:** Replace only the plain front first-floor beam band of FC-D40CEF5893 with a source-visible green/gold paired-scroll surface approximation.
**Architecture:** One guarded Fanhua-only decoration module, called after the existing two-level frame. Retain the existing beam, floor, six voids, rails, contacts and openings. Keep the decoration within the existing beam vertical extent; the original front band depth/location remains. An original Canvas pattern is a surface approximation, not claimed relief geometry or a photographic texture.
**Tech Stack:** existing Three.js/CourtKit/Canvas, Node test runner and existing CPU rasterizer.
**Spec:** ../MASTER-PROMPT.md; official https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efeecf846027.jpg (personally viewed 2026-10-28; URL date is not capture date).

## Global constraints
- No invented version number; frozen R146/main untouched. Follow-up branch only.
- No performance project. No official photo distributed as texture.
- Width/count/depth/color are model fits, not measured or exact carving. Back/side patterns not inferred.
- Entire building remains incomplete; GPU/mobile and in-browser same-view acceptance remain pending.

## Review focus
- Wrong upper eave/rear band selected: exact local beam identity and coordinates checked before mutation.
- Shared material contamination: privately owned front material/map; other bands unchanged.
- Lost structural support or opening: retained beam/old colliders, floor and rooms byte-equivalent.
- Blank/stretched/reversed pattern: actual Canvas nonblank pixels, finite front UVs, source/candidate same-view CPU comparison.
- Unload leaks: material/map disposal once over repeated build/unload.

## Task 1: Source-backed front surface
Files: new src/scene/palace/special/FanhuaFloorFascia.js; hook RemainingNingshouHalls.js; tests/followup-fanhua/details.test.mjs; scripts/followup-fanhua/export-details.mjs.
- [x] Write real-builder failing test requiring only front floor-band metadata, source ID and visible ornament map; run it red before implementation.
- [x] Implement guarded `fitFanhuaFloorFascia(c)`; source-backed paired curls/green field as original Canvas strokes, fitted band inside retained beam height. Do not allocate collider or alter global material.
- [x] Compare frozen R146 baseline all non-target meshes/contacts/walkables/rooms, actual pixel output, source guard rejection and three unload cycles.
- [x] Capture identical baseline/candidate local model views with real textures using existing CPU renderer; independent visual review, recording limits and actual source hash.
- [x] Run relevant R139/full-world route plus standard current-state command, recording baseline failures and any changed failures; do not alter old assertions to pass.
- [x] Update remaining-item ledger/README honestly, commit only approved source/tests/evidence on follow-up branch. Send fixed SHA/evidence for review before requesting serial upload.
