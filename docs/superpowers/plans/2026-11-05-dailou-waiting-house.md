# D14 five-bay waiting-house implementation plan

> **For agentic workers:** Use superpowers:executing-plans, with test-first bounded checks and independent review before cumulative CI.

**Goal:** Add one identifiable five-bay north-facing closed waiting-house exterior and usable low front porch, without representing the entire eastern courtyard.

**Architecture:** One private DailouWaitingHouse helper appends a separate group and its own contacts at hook152. It locks the unique unchanged public372 wall6 segment and actual inner brick/red planes, publishes transactionally and preserves all unrelated objects and registrations. No shared geometry builder, physics, player or data changes.

**Tech Stack:** Three.js, existing texture library/box UV, Node test runner and exact public Git source normalization.

**Spec:** Official 景运门236497 and 五间房243903 entries; 言庑、赵仲华1983《乾清门广场上的值房小院》p22 (223497), 许以林1983 p14–15 (223495); 刘潞2020院刊2 p88. The1983 p22 photo and plan are the WEST military-secretariat house, not D14's own image. Only its explicit common text supports five bays, north-facing, front porch, low stone base, yellow tiles, no brackets and a free hanging-gable end/red bargeboard. Dimensions, current colors/openings/roof details and coordinates remain fits.

## Global constraints

- Public baseline fef5c0e1904c361e7492d744f06d82a8c137e1ea, complete tree01e6dcbf9f0877cf24bdf632faa098fbe60f4f0a; no local-only Git dependency.
- Convex reserve x[-105.98,-83], z[144,154], y[0,6.8] is NOT wholly occupiable: real wall brick0..1/red1..7 inner planes govern contact. Preserve that entire wall/cap and all old contacts.
- Low platform.25 and two.125/.25 treads; no roof pedestrian contact, unknown interior stays solid/closed, no rooms/maps/teleports or inferred visitor access.
- Separate D13, no full courtyard/well, no mirrored west image, no dougong/furniture/invented inscriptions. Whole-object/photo/survey/current-admission claims false.
- Preserve original414 bounded and4 heavy roots; new complete-axis verification adds a separate heavy root. Local checks are bounded subsets, never full World acceptance.

## Review focus

1. Float32 conversion must not create host gaps, ground drift or reserve escape: per-mesh double origin at actual wall plane, shared local z/y samples, explicit final-triangle checks and gap/intrusion/floating controls.
2. Missing/duplicate/changed wall/material/UV/source host must reject before publication, not select by material alone.
3. Every allocation enters a rollback ledger before operations that can throw; failed publish restores arrays/root and releases all private resources, never shared library maps/materials.
4. Native route support uses original update-before tracked0/null and footprint candidates, not a post-frame center-only oracle; new closed/step/barrier checks stay present.
5. Source/finish projection removes ONLY exact declared D14 geometry/contacts/claim and proves unrelated actual mesh/contact drift is retained.

### Task1: Baseline, component and geometry

Files: new tests/r165-dailou-waiting-house/{fixture.mjs,baseline-fef5.json,component.test.mjs,geometry.test.mjs,negative.test.mjs}; new src/scene/palace/special/DailouWaitingHouse.js.

- [x] Capture the real public wall/gate subset and immutable old mesh/contact/registration digest.
- [x] RED: private helper absent; then require sourceObjectId FC-418DFCE4F5, five intervals/six posts, north-facing closed facade, three actual stone supports and unchanged old snapshot.
- [x] Implement only the tested private helper. All final Float32 geometry must be closed/outward, finite UV with original tile density, on ground/real wall planes and inside reserve. Five shallow fitted closed window fields, red free-end bargeboard and coarse yellow tile courses remain inside the approved conservative roof/body envelope.
- [x] GREEN plus wrong/duplicate host, changed source/material/UV/transform, actual gap/penetration and malformed geometry controls.

### Task2: Lifecycle, routes, merge and full-axis contract

Files: lifecycle.test.mjs,route.test.mjs,projection.test.mjs,merge-flight.test.mjs,production-zone.test.mjs and their private test helpers.

- [x] RED then GREEN: allocation/UV/material/attach/publish failures restore old root/arrays/resources and retry succeeds; successful cleanup releases new private geometry/materials once and shared resources remain owned by the library.
- [x] Preserve all152 old subset entries; add12 new positive/4 closed negative and barrier pair; validate native starts/frames, physical three supports and missing-step negative. New routes and7 own first-hit eyes share one final candidate/CM.
- [x] Verify finish architecture exactly+1, source claim limits, exact new mesh/contact delta and preserved old bytes. CPU previews are diagnostic only, not PBR/WebGL/photo acceptance.
- [x] Complete axis before/after projection and all inherited neighbour/World checks remain for cumulative CI, never called locally complete.

### Task3: Source integration and freeze

Files: ZoneBase.js exact import/hook152; new source-boundary.{json,mjs},source.test.mjs; previous Tishun source normalizer and exact synchronous hook contract tests.

- [x] RED then GREEN for exact import/call/identity/order/inert hook152 and real negative mutations; original156 steps remain unchanged.
- [x] Exact byte-hash before/after normalization to public fef5; add its strictly declared delta to the existing chain, retaining old fixtures/hashes and unrelated runtime/data drift controls.
- [x] Serial bounded validation, independent review, immutable source/tests/tree/input fingerprint and full diff. No local full World/build or uploading. Cumulative CI keeps all prior roots and adds new bounded/heavy paths without repeated-count inflation.

## Verification status

The bounded source/component/route/merge gates are complete. The new complete-axis production test is authored and syntax-checked, but its actual run, independent source review and cumulative CI are still pending. Do not interpret checked implementation steps as full-axis/World/build acceptance. See the test README for the deliberately retained exclusions.
