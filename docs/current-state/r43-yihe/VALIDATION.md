# R43 validation and retained failures

Frozen candidate `0e15bb6427784cdffc905bf3c03391bba83c6364`, tree `81659592ef07d43f1dcf12d5f7eaeff15b0449a4`. R42 remote baseline `143d500d15740942226eed7c44e1ecfa9862e2eb`, tree-equivalent local `ed78e1237e9d7b2a081256bc9f55f011cf29f938`. Aggregate started2026-10-21 08:36:39UTC. Source/data/public/test/package before/after manifests are byte-identical. Final changes after this run are documentation only.

## Results

- Direct/current:184 files,2022 tests,1988 pass,34 fail. R42:2006/1974/32.
- Historical/mixed:132 files,1192 tests,962 pass,230 fail, same counts as R42.
- All16 new R43 checks pass. Focused suite including7 whole-zone finite checks:23/23.
- Existing R40 supplementary route script:10/10, outside2022 aggregate count.
- No skipped, cancelled or todo tests. Every baseline name recovered.
- Build, zone schema and zone geometry lint pass. Anchor output byte-identical to R42: retained Shenwumen11m discrepancy and Qiandongwusuo gate/group mismatch; not a passing checker.

## Direct snapshots and exact tail recovery

Two added failures are the old R42 non-target hall and ledger snapshots encountering deliberately changed Yihe. The hall test masks82 later halls and final count/inventory; the ledger test masks73 later records and final count/validation. Three inherited failures move earlier from Guhua to Yihe: R40 hall tail83 instead of81, R41 hall tail82 instead of80, and R41 ledger tail73 instead of71. The other29 common diagnostic blocks match after path/timing normalization.

R43 independently captures the R42 baseline, enumerates all122 current hall identities and compares all121 non-target geometry/material/navigation signatures, including Guhua and all later identities. All88 non-target ledger records, target status and final inventory/validation execute successfully. These recover the current non-target scope; failed historical snapshots remain failed, not silently accepted.

## Historical byte contracts

All230 historical failure names are unchanged;224 normalized diagnostics are identical. Six changed blocks are only the current Ningshou JSON hash, four current ZoneBase source hashes across R32–R35, and the R35 inventory adding YiheHall.js. Their first failure locations do not move earlier. No new source inverse or bypass was introduced.

Old source reversal, blob/length, idempotence and mutation-rejection checks beyond these failures, plus post-inventory fixture tails, remain unexecuted. Earlier R39–R42 masked limits still apply. Current malformed-profile tests do not replace those historical byte-restoration contracts. Same failure counts do not imply an all-green or fully equivalent historical replay.

## Actual geometry and movement

- Exact frozen-R42 signatures retain6 roof meshes,2 platform meshes,8 front-stair meshes and all walkable surfaces.
- Independent checks cover stepped end enclosures, all3 open front canopy bays, open southern rear-projection join and closed deferred northern connector.
- West-facing vestibule doorway and both communicating necks are tested across capsule-width bands, while the north window and short frame returns remain physically blocked.
- Actual full-zone controls repeat central stair, veranda and Suian turn-in/return routes at10/60Hz with W/S movement and sprint requests, without rescue. Teleport resolves clear ground approach.
- Whole-zone finite raw/merged geometry and flight construction pass. All4 Yihe material triangle counts and world bounds survive real merging; one source metadata record survives. Removed shell geometry is disposed without disposing live retained geometry or borrowed materials.
- No GPU/WebGL generated-scene visual or native-phone acceptance. Official reference images were inspected, not the rendered model. Roof joints, western subdivisions, rear external connector and complete inventory remain explicitly incomplete.

## Log identities

Direct TAP SHA256: `10bd2f5085b1dcf956ab8a1fc3e70df1b1bc04a739f0365d05d62f23f11e9487`.

Historical TAP SHA256: `114f69bf1c997a61f10e667cf55b71b6714cb13af9c3cfec6f4ac058ed0a46f7`.

Supplementary10-check TAP SHA256: `7ef71f43d5347f9545f15ec79af9c69f2b8d85bd5cb7fdbf0092bb32bc692753`.

Exact independent diagnostic comparison is preserved in REGRESSION-CLASSIFICATION.json. Approved only as a bounded partial development release with retained failures, not complete restoration or all89-building acceptance.
