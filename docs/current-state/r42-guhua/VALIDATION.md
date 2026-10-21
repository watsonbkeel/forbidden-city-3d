# R42 validation and retained failures

Frozen tested commit: `b1e8fe533ce7584da6907856dd6322c13b36ebe5`. Baseline R41 remote: `863339fed9f0238f6df42ccf85cbbbd4cec592af`, tree-equivalent local `3608eccaa1d1f1e3da4b0a37153fd343a47ed4b2`. Aggregate started 2026-10-21 08:17:07 UTC. Before/after source, data, public, tests and package manifests are byte-identical; final additions are documentation only.

## Results

- Direct/current:181 files,2006 tests,1974 pass,32 fail. R41:1990/1960/30.
- Historical/mixed:132 files,1192 tests,962 pass,230 fail. R41:1192/963/229.
- All16 new R42 tests pass. Focused R42 plus whole-zone finite-geometry checks:23/23.
- No skipped, cancelled or todo tests. All baseline names remain present.
- Build, zone schema and geometry lint pass. Anchor output is byte-identical to R41: existing Shenwumen11m discrepancy and Qiandongwusuo gate/group mismatch remain; anchor checker does not pass.
- Existing R40 supplementary route script rerun:10/10, outside the2006 aggregate count.

## Direct failures and masked checks

Two added failures are old R41 non-target snapshots encountering the deliberately changed Guhua hall and its ledger record. The hall test exits before80 later non-target hall checks and final count/inventory; the ledger test exits before71 later unchanged records and final count/validation. One inherited R40 hall snapshot now stops at Guhua before reaching its previous Chuxiu failure, masking81 later hall checks. The other29 common failure diagnostic blocks are identical after checkout-path and timing normalization.

New R42 tests enumerate all122 hall identities and prove121 non-target geometry/material/navigation signatures exactly match an independent R41 capture. They also compare all88 non-target ledger records and final inventory/count, with explicit target status validation. These execute the current non-target scope rather than treating the failed old snapshots as passes. Guhua itself has independent actual roof/platform retention, collision/support, open-route, merged geometry/flight and resource-disposal checks.

## Historical limits

The sole added failure is `data/zones/ningshou.json: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed`. The intentional single-building opt-in changes those bytes. The old reversal, idempotence and malformed-byte mutation tail is not executed and is not claimed validated. No source-restoration waiver or inverse adapter was added.

223 common historical diagnostics are unchanged. Six changed blocks trace to the new ZoneBase dispatch hash, Guhua source inventory addition and propagated failure output; one temporary-directory difference is incidental. Previously documented R39–R41 historical masked checks remain unresolved. Passing current malformed-profile, topology and resource tests does not replace all historical byte-reversal contracts.

## Evidence limits

Actual controller routes run at10/60Hz through front/rear and side apertures and around the gallery, including backward movement and sprint requests. Whole Ningshou merged material bounds/counts, finite flight coverage and twice-repeated exact-once disposal pass. The strict profile rejects roof/storey and other unreviewed overrides before geometry exists. The retained roof remains approximate; the model is not a complete measured reconstruction or a statement of visitor access.

No real GPU/WebGL generated-scene visual acceptance or native-phone acceptance was performed. Official reference photographs were inspected, not the generated scene.

## Log identities

- Direct TAP SHA256: `608a162790992932d32afa49311279af8a74a9a6c675de4c21824a2c943cdc9e`.
- Historical TAP SHA256: `af95abb436e36bf3030a2c5b629049c2b44a8f9aa704f5cd985c3c4e7a0772fe`.
- Supplementary10-check TAP SHA256: `fbf6d2ff34fbd7e7c792539fb8852d94b320592551f7bd89d31175672238c56c`.

Exact diagnostics are preserved in REGRESSION-CLASSIFICATION.json. This is a partial development release with retained failures, not an all-green or89-building-complete release.
