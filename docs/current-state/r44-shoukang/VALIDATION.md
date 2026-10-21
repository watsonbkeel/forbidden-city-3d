# R44 validation and retained failures

Frozen candidate `ce182eec02a564fbc96e7d9f7b725b8d65175384`, tree `a1c3f611255267ce5f199b5a86a89b6ee6ae7d18`. R43 remote baseline `c2e05795e55552d097b184323aabdc31095da9ef`, tree-equivalent local `732bc3ea4869f2b8e7dfb753c99d85f74f94563f`. Aggregate started2026-10-21 08:58:08UTC. Source/data/public/test/package before/after manifests are byte-identical. Final changes after this run are documentation only.

## Results

- Direct/current:187 files,2041 tests,2004 pass,37 fail. R43:2022/1988/34.
- Historical/mixed:132 files,1192 tests,962 pass,230 fail, same counts as R43.
- All19 new R44 checks pass. Focused suite including7 whole-zone finite checks:26/26.
- Existing R40 supplementary route script:10/10, outside2041 aggregate count.
- No skipped, cancelled or todo tests. Baseline test-name comparison is independently checked.
- Build, zone schema and zone geometry lint pass. Anchor output byte-identical to R43: retained Shenwumen11m discrepancy and Qiandongwusuo gate/group mismatch; not a passing checker.

## Direct snapshots

Three added failures are the old R38 outer-west baseline navigation digest and old R43 non-target hall/ledger snapshots encountering deliberately changed Shoukang and metadata. All34 inherited diagnostics are unchanged. The R38 failure blocks its later tree/source/spawn checks; supplemental tests execute them against current geometry and separately replace only Shoukang input with the captured R43 item to reproduce the exact pre-tree navigation digest. This baseline-only substitution is not used in production. The two R43 snapshots stop at the first changed record/hall. Supplemental checks execute all83 unaffected R42 records with full89 schema, and all120 unaffected R42 halls with the full122 identity set, excluding Yihe and the declared R44 changes. R44 current checks enumerate all122 halls, compare121 non-target geometry/material/navigation signatures, and compare84 unaffected ledger records plus exact inverse checks for four approved metadata-only corrections. One building has actual geometry changes; those four corrections are not four additional completed buildings.

## Historical byte contracts

All230 historical failure names are unchanged. Independently compared225 normalized diagnostics are identical. Four changed blocks only carry the current ZoneBase source hash; one inventory diagnostic adds ShoukangHall.js. No added or removed failure names, no missing baseline tests and no earlier historical failure shift identified. No new historical source inverse or bypass was introduced.

Old source reversal, blob/length, idempotence and mutation-rejection checks beyond these failures, plus post-inventory fixture tails, remain unexecuted. Earlier R39–R43 masked limits still apply. Current malformed-profile tests do not replace those historical byte-restoration contracts. Same failure counts do not imply an all-green or fully equivalent historical replay.

## Actual geometry and movement

- Exact frozen-R43 roof/platform/south-stair signatures and all original walkable supports remain. New rear stairs are explicitly fitted additions.
- The five-bay ratio, all three four-leaf southern doors, rear central four-leaf door and actual window versus door capsule passability are checked. Warm rooms are on outer bays, with east at negativeX; their aperture location and frame shape remain fits.
- Actual full-zone controls repeat southern central/secondary doors, veranda, both warm rooms, throne/screen side circulation, rear crossing and rear stairs at10/60Hz with W/S and sprint requests, without rescue. Teleport resolves clear ground approach.
- Published throne and screen standalone object envelopes are checked separately from platform, cushion and footstool. Screen thickness0.32m means overall thickness, not base thickness. Three-panel relation is sourced; exact panel ratios and ornament are not reproduced.
- First route tests hit visible rear folded leaves. Keeping those leaves and measured object envelopes, fitted seat/screen positions were adjusted toZ4.1/5.0 and the rear crossing toZ6.3. This is a navigation fit, not recovered historical coordinates.
- A zero-length diagonal corner clipping artifact was caught in a pre-freeze geometry assertion and corrected by omitting degenerate bars. Finite raw/merged geometry, positive box dimensions and flight construction pass.
- Whole-zone material triangle counts/bounds and source metadata survive real merging. Resource disposal releases custom geometry without disposing retained live geometry or borrowed materials.
- No GPU/WebGL generated-scene visual or native-phone acceptance. Official reference images were inspected, not the rendered model. Exact warm-room joinery, complete ritual/display inventory, roof fidelity and actual current visitor permissions remain unresolved.

## Log identities

Direct TAP SHA256: `e331a2b604e12509d64251b1333076495e277c0498d3bc6dd7874d44e1aeb50d`.

Historical TAP SHA256: `86ad21072a7dd71a9c816fb9cfe03b2de2a2ca384eebf78192279b4fac3c7d90`.

Supplementary10-check TAP SHA256: `a4ff915596758084045ddb235a6c1552e5840d6d8be1909928c033c97f2bfdd5`.

Bounded partial development release only, not complete restoration or all89-building acceptance. Independent review found no unexplained new behavioral failure. The durable four-check script under verification reruns these masked current scopes outside the2041-test aggregate. Its standalone TAP SHA256 is `aa9f9231ebc54c373a10fa2f1003bea5b353aafa96f304bfe620d3637fce08ac`. The R43 input fixture is a captured single item, not a permissive source-restoration adapter. See REGRESSION-CLASSIFICATION.json for exact failing names.
