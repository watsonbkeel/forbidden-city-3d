# R154 Shunzhen central north glazed frame plan

> Single writer executes with superpowers:executing-plans; independent agents are read-only.

**Goal:** Source-backed complete CENTRAL NORTH glazed face composition: paired long clipped-corner red panels, green/yellow outlines and connecting horizontal lintel. Not new gate topology or whole-gate acceptance.
**Architecture:** Exact existing central two red piers plus overdoor NORTH triangle faces are replaced by non-overlapping planar colored regions on their original plane. Preserve side/back/top faces, dimensions, six door leaves, all physics, wall gap and route contracts. No outward extrusion, supports, fake ledges, shared controller or generic builder change.
**Tech:** Existing Three.js / CourtKit, private geometry and two glaze materials; no runtime external photos or dependency.
**Spec:** MASTER FC-36C011ABEA; https://www.dpm.org.cn/explore/building/236543.html; old own photo https://img.dpm.org.cn/Uploads/Picture/dc/8401.jpg; official vp3703 autumn sph1943321033436155904, https://tile-pano.dpm.org.cn/api/panos/1943321033436155904/tour.xml.

## Evidence and constraints
- Safe local parent bc8b65aafb6e16e18d6f4093d9e50157d15dae41; preserve R153 and every earlier delivered branch, WIP and six dirty reports. No main/Pages or raw-log upload.
- Official 640-level b-face first tile is512×512 (NOT full cube), personally inspected by implementer and source reviewer. Local /tmp/shunzhen-b.jpg hash88e9f91ce0af81a794ecc5b3f9eb08e99561a93b16c404c1acfb51b0a5bab98b,42804bytes. Shows central north face entirely and only partial side gates; sun glare limits fine lintel detail. Capture date unknown.
- Existing R90 anchors/three portal arrangement are known engineering fits, not survey. Central north plane worldZ520.05, central clearX[-2,3], piers[-3.4,-2] and[3,4.4], interface20.6. Do not move north wall/Shenwu to align camera.
- Both pale wall-foot courses and independent lamp pedestals are visible, but their exact profiles remain unmeasured. Entire white-foot profile/lamp group deferred; do not substitute lamp pedestals for wall piers. No copy of central details onto partial side gates; no background roof/finial transfer.
- Broad colors and clipped long red fields are supported; precise ornamental cells, carving, gold inscriptions and undisclosed hidden face design are not. This is fitted face-color geometry, not full sculpted glazed components.
- Alternatives: extra box trim would add unsupported contact/high ledges; stacked decals would retain coplanar faces; selected source north-face replacement has no positive-area overlap and identical volume/contact envelope. No transparent material, z-offset or polygonOffset workaround.

## Tasks and gates
1. Baseline: R90 topology, 24 north route combinations10/30/60Hz walk/sprint, map reload and near-jamb backward checks. Already run11/11 on safe R153 with old generated reports redirected outside repo.
2. RED actual triangles/rays: canonical central north piers must have clipped red core, green/yellow continuous outline and lintel; south and side gates unchanged. Add helperShunzhenNorthFrame.js and one builder hook. Validate exact sourcegeometry attributes/UV/groups, canonical frame, unique geometry, the central two target pier proxies (all original physical arrays separately checked unchanged) and central overdoor dimensions before any mutation.
3. Transaction stage new faces and rest-shell geometries; only original north faces removed. Roll back original source references/order/metadata/material registration on injected late failure; old source resources disposed only after successful commit; repeatedcall no-op.
4. Verify original non-front attributes, bounds, originalphysics/maps/door/leaves; finite oriented actual faces, broad front/side/back rays, no duplicate positive-area faces, final merged source colors/cost. Source guard mutations fail before allocation. CPU actual before/after and independent review, not GPU claim.
5. Final R90 targeted/whole-world matrix parent and candidate; exact-parent current-state suite serial comparison; threebase write:false compile identity; concise README/RESULT then bounded local checkpoint R154. Raw reports remain external.

## Review focus
- North +Z vs local gate rot naming; existing plaque faces north.
- Entire central U-shaped frame, not two disconnected decorations or image copied to side gates.
- Existing central green projecting band and plaque remain unmodified; do not duplicate their exact faces.
- Remove only target north triangle surfaces; no extra solid wall/door-hole filling.
- Frozen original profile requires replacement metadata object, not mutation; source resource rollback must remain exact.

## Execution rulings
- Independent review found no blocking issue and corrected a wording overclaim: input guards bind two target pier proxies; full physical-array hash proves preservation of all other colliders, not six individual guards.
- Author fault injection found a read-only target geometry could throw during commit and again during rollback, leaving the staged group attached. A concise actual children-count RED reproduced it; require writable source geometry before staging. First deeply nested assertion diagnostic terminated without detail; reran with concise reference/count assertions to expose the actual failure.

- First full safe-parent suite had a process-level termination in qinan-exterior-stair-safety: 48 tests did not expand (1284/1065/219 instead of1331/1113/218). It overlapped the author's oversized deep-object failure diagnostic; resource cause is plausible, not proven. Preserve that run, use bounded reference/count diagnostics, and rerun the entire safe-parent suite serially without concurrent probes before comparison/commit.

- Final closure: complete serial parent rerun1331/1113/218 and candidate1331/1113/218 have zero ordered name/status differences. Final bounded assertions18/18; final R90 11/11 and its24+21 raw result rows exactly match safe parent. No missing tests counted as passes.
