# R86 Zhonghe near-column pair Implementation Plan

> For agentic workers: execute task-by-task with test-driven checks and independent review.

Goal: add only the independently visible near pair of red columns and one shallow top beam from official1569.jpg to the existing Zhonghe interior.
Architecture: new ZhongheInteriorColumns helper, explicitly called only by the Zhonghe branch in SquareHalls. Existing twelve enclosure columns, twenty veranda columns, four doors, roof, ceiling and R55 display remain byte-identical. No mirrored hidden rows, global pillar change, furniture edits or navigation relaxation.
Tech stack: existing Three.js procedural geometry, existing Box3 collision and actual FirstPersonControls tests.
Spec: parent approved phase2 bounded photo-fit; official https://img.dpm.org.cn/Uploads/Picture/dc/1569.jpg, SHA25622ef4565e4c0623818aed244cda77aa3fd704d110de5b4496eef4067595d67fe. Actual pixels viewed. The image establishes two independent near red columns and a shallow joining beam, not measured coordinates, hidden framing or calligraphy.

## Constraints and choices
Use two x±2.85,z69.1 centers, floor8.6, radius.30, height6.6 and stone-base halfwidth.345. These are reversible PHOTO_FIT_NOT_SURVEYED parameters. Preserve existing 19×19 interior and all original object bytes. Keep source-backed partial pair, rather than inventing a complete structural grid or changing whole hall scale. Approximate photograph camera/focal calibration is diagnostic only. Keep full-height visible/physical solids, no low collider allowing jumps through shafts; beam collision bounds match its actual bottom/top. Existing player radius.5 unchanged. Actual outer bypass x±3.8 has only.105m nominal margin and requires controller verification, not occupancy samples.

## Review focus
1. Exact original shell and Jiaotai retention, no additional hidden rows.
2. All shaft/base/beam collision envelopes match visible bounds; jumping cannot enter them.
3. Actual10/60Hz forward/backward/diagonal sprint around both columns, four-door routes and low platform remain traversable.
4. Beam's roof/ceiling relationship, approximate projected occlusion of retained chair/screen, no false measured-image claim.
5. Merging, own-resource disposal, full-world NPC/night and flight behavior with bounded new obstacles.

## Tasks
- [ ] Capture immutable R85 component/world/source baselines and source image provenance.
- [ ] Write failing component tests for exactly two columns, one beam, exact original retained geometry and five matching colliders.
- [ ] Implement isolated helper and exact Zhonghe-only call; run component red/green and commit.
- [ ] Run real existing four-door controller plus targeted near-column/jump/beam and resource tests; fix within local scope if needed.
- [ ] Restore complete checkout before strict inventory/full validation; exact R85 successor, navigation delta, four night worlds, raw failure comparison and root/subpath builds.
- [ ] One cumulative backup, precise README/status/evidence, fresh independent review before parent upload. Do not modify main/Pages or bypass pending R82 upload.

GPU/mobile/model screenshot acceptance remains unavailable unless a permitted renderer actually succeeds. CPU geometry/photographic projection are not screenshots or visual acceptance. Keep all raw historical failures.

## Source-camera limitation
The planning diagnostic has no recovered camera pose. A limited pinhole consistency test uses f197px/worldz62.85 and a freely offset principal point. With a diagnostic eye1.0m and principal pointv210.48 it reproduces approximate near-pair bottom242/top34 and widths180/108/265px, while a normal1.7m player eye is separately recorded. This free crop/tilt ambiguity cannot establish full photographic registration, ceiling alignment or visual acceptance. Only the visible pair and one shallow joining member are modeled; no rear grid is inferred.

## Necessary integration revision after real night failure
The inherited emperor route passes through the photo-fit left column. Parent explicitly approved a minimal real detour after the exact failure was diagnosed, not disabled collision or changed physical radius. Only original indices354..367 are replaced by a densely spaced continuous bypass viax−3.8 betweenz67.5 and70.65. Original two endpoints, complete prefix/suffix, schedule, identity, destination, speed and every other NPC route remain exact. The original blocked point and failed night run stay in evidence. New local sweeps and full night/day manager completion are separate requirements.

One initial failed-candidate production backup is retained, explicitly not accepted. Parent authorized a separately labelled final backup so the regression evidence is not overwritten. No deployment or extra cleanup by implementer.
