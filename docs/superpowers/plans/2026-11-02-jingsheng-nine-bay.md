# Jingsheng nine-bay exterior implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing H43 FC-922969BB62 敬胜斋 as a source-bound nine-bay exterior with real low stair and porch approach.

**Architecture:** One exact-host standalone builder stages geometry, private materials and real per-mesh collision, then appends. One ZoneBase production hook before merging; no new interior destination.

**Tech Stack:** Existing JavaScript, Three.js, CourtKit, normal World and FirstPersonControls fixtures.

**Spec:** Parent 2026-11-02 22:45 UTC authorized implementing nine visible bays and necessary steps after b4a7dbf9, dimensions/location fit, retain real passage and old entities, local eave inset≤0.3m, necessary tests and fresh independent review, no upload until Yinghua remote identity established. The source/fit decisions below are the reachable task spec.

## Global Constraints

- Base b4a7dbf9, independent branch feat/r163-jingsheng-2245. No main/remote/Pages changes.
- Official lemma242221: nine bays, east-five faces 延春阁; own completed-facade photo s5e9d407b2a9fe.jpg. Original references stay private /tmp.
- Fitted body x205.8..243.4,z508.5..516.5; east-five central doorway/stair x216. Roof west edge≤243.95, a0.25m inset from preflight fit, clears old wall cap inner edge244.14999.
- All old geometry/collision/walkables/maps/rooms/regions/actors/routes retained. No global physics edits.
- No invented current admission, whole-H acceptance, furniture, fine text/paint/carving, modern lamps, inner theatre, upstairs, or corridor connections.

## Design and Approaches

Parent chose source-bound standalone exterior rather than generic centred hall (would centre its door on all nine bays) or wholesale restoration (would invent interiors/connections). Closed nine-bay shell, east-five middle door and four adjacent sill-window bays, red front columns, shallow accessible porch, gray roof and yellow eave-edge coarse fit, low stone base and central stair with paired rail. Door remains closed as own photo; no interior room/map. Hidden faces, roof profile, repeats, dimensions and heights are engineering fit.

## Review Focus

- False-host/repeat calls reject without host mutation.
- Normal merge/registration preserves every prior stream outside the previously empty new envelope.
- Door/stair align with east-five centre, not whole nine-bay centre.
- Steps have real geometry and exact non-rescue tops; no invisible ramp/proxy.
- Gate/延春 approaches and porch return remain physically valid; closed door/wall/post negative controls fail movement.

### Task 1: Source-bound nine-bay exterior and normal integration

**Files:** create `src/scene/palace/special/JingshengZhai.js`, `tests/r163-jingsheng.test.mjs`, `tests/r163-jingsheng-normal.test.mjs`; modify only `src/scene/zones/ZoneBase.js` production hook; evidence in `reports/r163-jingsheng/` and batch README.

**Interfaces:** consumes CourtKit and exact original outer-west gate/court/延春 tuples; produces `buildJingshengZhai(kit,zoneJson)` returning false outside outer-west, otherwise `{frame,meta}` once, and frozen `JINGSHENG_FIT`.

- [x] Write failing component/normal-hook tests, run RED.
- [x] Implement staged shell/front/roof/stair/rail, all own collision and exact tops, hook pre-merge; run GREEN.
- [x] Normal retained-stream/real routes/solid negative controls and own CPU previews.
- [x] Affected old checks, production build, diff-check; record actual limits.
- [ ] Commit local deliverable; parent dispatches fresh independent review, fix blockers with RED/GREEN.

## Ledger

- Pre-flight: single task, no cross-task shared-interface conflicts. Current base existing targeted Yanchun3/3 green; full historical suite deliberately not run due known sparse historical assets/docs.
- Ruling: no extra design question; parent explicitly chose this source-positive standalone approach and authorized reasonable metric fit.
- Ruling: preflight start z469.8 grazes the unchanged Yanchun east vessel's low stone-base edge (native contact atx209.8..210.7, feet≈.04), not the new site. Final safe approach start moves only0.3m south to469.5; no old geometry/physics changed.
- Ruling: sprint down six true .1m steps naturally leaves the surface at≈12m/s; retained controller yields feet-ground peak .42034m versus walk .17039m. Keep the fitted stair and real gravity; test bounded arrival/native clearance and disclose this instead of inventing an invisible ramp or changing global descent.
- Debug evidence: first native negative column start z509.4 overlapped the actual .48m stone foot by .04m (world maxZ508.9400), not the column's narrower shaft. Start z509.5 is on the same supported porch with positive clearance; negative checks column plus its real foot.

- Ruling: shift preliminary nine-bay body only .24445m toward east (to x205.55556..243.15556) so the east-five central bay, leaves and stair align exactly with retained Yanchun x216; total37.6m width retained, roof clearance unchanged. Metric fit, not survey.
- Evidence: final target+normal4/4; retained Yanchun5/5 and Yinghua26/26; broad zone-lint parent b4a7 archive and candidate both exit2 at identical Fengxian contract, no attempt to fix unrelated source.

- Task1 implementation complete, final affected35/35; final production build exit0; parent/candidate zone-lint same inherited exit2. Independent parent-dispatched review is pending. Raw failed diagnostics preserved byte-for-byte in .tap.gz, not silently edited for whitespace.
