# R41 validation and known limits

Aggregate candidate: `d07f49de05c998041dec27312288fd3e072f0f64`. Baseline R40 remote: `bacf6a84d34a4d8dbf6b8949f187bdb458fd2d0d`, tree-equivalent local `cd1c843`. Before/after source/data/public/test/package manifests are identical. Final release changes after the run are documentation only.

## Counts

- Direct/current:178 files,1990 tests,1960 passed,30 failed. R40 baseline:1971/1944/27.
- Historical/mixed:132 files,1192 tests,963 passed,229 failed. R40 baseline:1192/965/227. All baseline test names are present.
- All19 newly added R41 tests pass. Focused new plus existing Chuxiu checks:30/30.
- No skipped, cancelled or todo tests.
- Build, zone schema lint and zone geometry lint pass.
- Anchor checker retains the existing Shenwumen11m discrepancy and Qiandongwusuo gate/group mismatch; it does not pass.

All27 inherited direct failure diagnostic blocks match R40 after checkout-path and duration normalization.

## Three added direct failures

The R39 Chuxiu unchanged-hall snapshot and R40 non-target hall/registry snapshots no longer apply unchanged to this deliberately updated building and evidence record. They remain failed, not waived. The Chuxiu geometry assertion masks its later navigation hash; the R40 hall loop masks16 later halls and final inventory/count; the R40 ledger loop masks77 later records and final count. These early exits must not imply those checks executed.

Current R41 tests recover that scope by enumerating all122 hall records, requiring121 non-target signatures to remain exact against an independently captured R40 baseline. Removing ONLY the three new meshes and their corresponding colliders restores the complete prior Chuxiu geometry/material/navigation signature. All87 unchanged building-registry records also retain exact canonical hashes; Chuxiu implementation and NingShou evidence-only notes are separately asserted.

## Two added historical failures and seven earlier stops

Both new failures are frozen R33 byte-binding checks for the intentionally changed ChuxiuHall source. One stops before old blob/length/identity-return and malformed-byte probes; the product-inventory check stops before its remaining source/binary/config guards. They are failed and partially masked checks, not successful negative-test coverage. No broad source inverse or acceptance bypass was added.

Seven inherited inventory failures (R25, R26, R26 frieze, R27, R28, R29, R30) now stop earlier when constructing the expected list through the same Chuxiu hash guard, rather than reaching the prior inventory equality assertion. Their later expected-list/duplicate/actual-inventory/extra-missing-duplicate probes remain masked. This is not baseline-equivalent historical coverage.219 other common historical diagnostic blocks normalize identically; one further difference is only a randomized temporary directory in the existing ENOENT failure.

Current runtime malformed/transplanted Chuxiu profile tests, geometry tests, public-state checks and resource tests do execute successfully; these do not replace every old byte-restoration contract.

## Actual geometry and movement evidence

- Three additional boxes,36 triangles/108 nonindexed attribute vertices. Independent post-merge comparison preserves every retained R40 position, normal and UV attribute.
- All visible kang faces correspond to collision, with adjacent-floor clearance. Existing low-collider support resolves to the actual visible top; no new floor/storey is registered and game support is not museum permission.
- Full west-zone real-controller routes repeat all four apertures and three viewing points at10/60Hz. Independent near-edge lanes use forward/backward movement and sprint requests without rescue.
- Existing Chuxiu flight-envelope invariance, shell/column/roof/platform retention, finite-geometry budget, invalid-profile rejection and exact-once resource disposal checks pass. Three independent repeated merge/disposal runs add no new private material ownership.
- The preserved R40 supplementary masked-tail script was rerun against R41:10/10. It is outside the1990 aggregate count. Run: `node --test --test-reporter=tap docs/current-state/r40-facades/verification/masked-tail.test.mjs`.

## Log identity

Direct/current TAP SHA256: `4c6ca6a33242591e4bc0f1e8f4ad2fa60811b5fac87ae19f33edb80d447c74b5`.

Historical/mixed TAP SHA256: `54b2e895717f2c57a148dfd72590ec93736765bf61a06f2608f6f038f587e1e4`.

Supplementary10-check TAP SHA256: `63054ed219e5ca6b1b2975ace127c2554181f17fa0880119abd24e0f3c5ca824`.

Exact failure-name deltas and earlier-mask classification are preserved in REGRESSION-CLASSIFICATION.json. This remains a partial development release with retained failures. No real GPU/WebGL scene rendering or native-phone acceptance was performed. Reference PDF pages were inspected, but the western kang geometry is text-supported, not matched-photo or measured reconstruction.
