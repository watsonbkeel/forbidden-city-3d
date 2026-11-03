# Jianfu garden Jiyun Lou implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. Steps use checkbox syntax.

**Goal:** Add original H23 FC-0565E86C7A 吉云楼（建福宫花园）, a photo-bound three-bay two-storey exterior with a real stair/porch.

**Architecture:** One staged exact-host CourtKit builder and one pre-merge ZoneBase hook. Preserve all old streams, routes, maps, rooms, shared physics, main and remote state.

**Tech Stack:** Existing Three.js/CourtKit, CPU normal World, FirstPersonControls and test library.

**Spec:** Parent authorization 2026-11-02 23:12:38 UTC: smallest three-bay two-storey shell + real stair/porch from own official photos; location/dimensions FIT, no unsupported interior stairs, isolate at ef275546, preserve routes, tests and independent review before freezing, no upload.

## Global Constraints and chosen approach
- Base ef275546. Own photos s5e9d410fed04c.jpg and s5e9d412337533.jpg personally viewed; official gallery236524 and total plan2648 support identity and relative placement east of敬胜斋. Cining同名 is a different entity.
- Chosen: fitted standalone exterior. Rejected: reuse Cining entity (wrong identity), full court/indoor reconstruction (unsupported).
- Fit center (197,512), body10×7.2m, ground porch .6m, upper visible floor4.6m, roof around8.2–10.5m; bound x190.5..203.5,z505..519,y≤12.5. Metric fit, not survey. Exact roof/hidden sides/details remain unverified.
- Closed ground central leaves/side windows, red visible columns, upper front balcony/light turned rail, yellow roof/green edge coarse fit. No invented lettering, furniture, connecting corridors, upstairs route/map/room.
- Real steps/platform tops non-rescue. No ramp, airborne/roof support or shared control change. Heights below .3m and passage not affected need no fine measurement loop.

## Review Focus
- Exact mutable untransformed host and duplicates reject atomically; failure disposes staged resources only.
- New material/resource ownership survives normal merge and disposal; no shared material mutation.
- Normal old geometry/instance/physics/maps/rooms/records and selected material fields and silhouette prefix retain exact bytes.
- New stair/porch entry actually reaches .6m via true geometry; closed door/wall/column negative controls block.
- Existing gate, Yanchun and Jingsheng bypasses remain clear; no old visible triangles or owners in complete fitted new envelope.

### Task 1: Builder, sole production hook and bounded proofs
**Files:** create src/scene/palace/special/JianfuJiyunLou.js; tests/r163-jianfu-jiyun*.mjs and tests/r163-jianfu-jiyun/; hook src/scene/zones/ZoneBase.js; reports/r163-jianfu-jiyun/.
**Interface:** buildJianfuJiyunLou(kit,zoneJson) returns false outside outer-west or once-only {frame,meta}; frozen JIANFU_JIYUN_FIT.
- [x] Capture current normal baseline/silhouette, write RED assertions for missing named structure and component builder.
- [x] Implement only the chosen exterior and real local ownership; GREEN.
- [x] Normal preserved-stream/silhouette/new-envelope/native routes and negative gates; CPU front/oblique previews.
- [x] Run affected tests, build, general project checks with real inherited limits, diff-check; local commit.
- [x] Independent review, necessary RED→GREEN fixes, freeze without upload.

## Ledger
- Pre-flight: one task, no shared interfaces across tasks. Bound preflight on ef275546: zero old owners/visible triangles in x190.5..203.5,y.04..12.5,z505..519. Ground approaches native-clear at zero.
- Continuous execution authorized; no repeated design question. Worktree feat/r163-jianfu-jiyun-2314.

- Ruling: roof default wing-tip outline exceeded candidate x-bounds by5.4mm; reducing local overhang .75→.73m keeps the whole bound clear without altering old geometry. Not a measured correction.
- Ruling: no upper roof/stair precision engineering; upper balcony has no normal route/destination, flight envelope keeps aircraft above actual roofs and exits only to safe y0 ground.
- Ruling: old tests with prehook/pre-Jingsheng phase assumptions remain red and unchanged; this task pins actual ef275546 cumulative streams.

- Final important cleanup fix: review reproduced late RoofBuilder shared lookup orphaning private ridge/gold and box tileSize orphaning unattached geometry. Dedicated RED tests reproduced both; resolve tile before geometry and resolve six roof materials/four tile sizes/two aspects before roof allocations, with local cached adapter only. No shared RoofBuilder/control changes.
- Final evidence correction: reviewer found material proof covered selected fields, not all texture/depth state. Narrowed claims instead of widening unrelated baseline machinery.

- Final: two Important resource-failure paths fixed in b9ab7e6e; reviewer independently reran component5/5 and normal1/1. No outstanding/deferred findings. Complete affected component18/18.
- Final build: clean b9ab7e6e runtime, root R163-385d62a6bfc4 / ac0f58df92437839c74dea2841c24c91cc1fbd96a675e8140aaf4e849b48a8ac;137 local HTTP/hash checks. Main/remote/Pages untouched.
