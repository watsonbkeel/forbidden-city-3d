# Fanhua retained stair contact plan

Goal: repair the last currently failing strict NingShou entry, retaining the visible five fitted treads and all shared physics guards.
Base: remote 2e80fcbe7321f93fde594d3695c3cd7b2eeb565b, local same-tree 83cdb2c9.

1. Freeze exact three source files and red-test real Fanhua + Jingfu + registered stair domain. Preserve current source and rollback.
2. Add five source-bound ordinary contacts matching existing visible stone treads, no mesh/material/walkable/region changes. Validate every exact source before atomic array append. Adjust only the two ground approach points to positions outside the player footprint. Keep remaining three points and all other profiles.
3. Compare source meshes, physics and all profiles; exercise absent contacts, old points, blocked entrance, source drift, repeated calls, immutable hosts, cache release/re-register. Run real controller routes, adjacent Jingfu entry/exit, high falls, normal jumps and Teleport.go with recording ZoneManager.
4. Freeze real 2e80 production NingShou and compare every old object/contact/walkable/roof/map/region. Only Fanhua landing may change. Retain all cumulative routes including shared-stair high exits.
5. Independent read-only review, bounded cumulative regression, honest result/limits, clean R164 Pages-base build and HTTP checks, new branch upload and complete readback. Never main/Pages deployment.

Evidence: process-only two-hall and actual NingShou hypothesis has strict landing (-340,0,504.35), 24 controller routes and missing-contact rejection. This is not yet shipped implementation evidence.
Risks: existing furniture ownership must remain exact; no triangle/overhead shape introduced. No arbitrary smoothing of tiny geometry errors. Five treads are previous game fit, not a historical tread-count assertion. Full World/GPU/browser/mobile/Node20 untested.

Execution evidence: original strict-null red, source-bound implementation,29light cases and actual NingShou cumulative production passed. Independent code/production passed; two broader historical snapshot failures reproduce on exact2e80 and remain disclosed. Clean build and remote publication are still pending at this pre-commit record.
