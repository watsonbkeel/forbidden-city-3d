# R40 validation and retained failures

## Frozen aggregate

Production and aggregate-test commit: `cbf219842184f3daa4186a7ce58a0b909608c978`. Baseline: R39 remote `b88ec3e09ed0e4e308c065ad0cb389c350650d23` (tree-equivalent local `b619ae6`). Source/data/public/test/package input manifests were byte-identical before and after execution. Only release documentation and the supplementary verification script were added afterward.

- Direct/current: 174 test files, 1971 tests, 1944 passed, 27 failed. R39: 169 files, 1936 tests, 1922 passed, 14 failed.
- Historical/mixed: 132 files, 1192 tests, 965 passed, 227 failed, unchanged counts and failure names from R39.
- All 35 new R40 checks pass. No test is skipped, cancelled or marked todo.
- Build, zone schema lint and zone geometry lint pass.
- Anchor checker does not pass: the retained Shenwumen 11 m discrepancy and Qiandongwusuo gate/group type mismatch remain. These were already present before R40.

This is a partial development candidate, not an all-green release. Tests do not constitute GPU/WebGL rendering or native-phone acceptance.

All14 inherited direct failure diagnostics match R39 after checkout-path and duration normalization. Historical failure names also match, but15 substantive diagnostic strings differ: eight inventory failures add only the new EastResidentialFacades.js source, and seven raw-byte guards report updated hashes for reviewed east-six.json, kit.js or ZoneBase.js. Other differences are timing or temporary-path suffixes. No new runtime/import error was found; these remaining guards still fail and do not validate masked tails.

## Thirteen added direct failures

Three R39 retention assertions deliberately compare the newly changed Jingren, Zhongcui and Yonghe halls with unchanged R38 geometry. The replacement R40 baseline independently captures all122 hall records and requires the119 non-target records to remain identical, including actual mesh attributes/transforms/materials and navigation records. Likewise86 non-target named-building registry records remain unchanged.

Ten R32 facade assertions still assume the old generic configuration: Jingren's sole front stair flight/two door leaves, Yonghe's single platform and generic lattice windows, and Zhongcui's former window plane/lattice. One old Zhongcui shortcut probe now starts inside a relocated visible panel. These assertions remain failed, not waived or counted as passing. They can stop before later support/shortcut checks, which is why separate current-geometry tests are required.

## Supplementary recovery of masked checks

Run from the repository root:

`node --test --test-reporter=tap docs/current-state/r40-facades/verification/masked-tail.test.mjs`

This independently reviewed script passes10/10 and is NOT included in the1971 aggregate count. It is preserved under documentation to keep the frozen aggregate inventory reproducible. Only its import base was made portable from the temporary independent-review version.

It executes Jingren/Yonghe center60Hz and left/right10Hz front-stair round trips, including sprint/backward movement, exact owned support sequences, real ascent/descent, ground start/end, finite frames and absence of rescue. It checks target panel widths/actual collider boxes/registered doors and every Zhongcui closed-window, column, side-wall and rear-wall probe from a proven clear start, requiring actual movement before rejection. Initial independent fixture setup failed to register gate width; that harness-only issue was corrected before these results, without changing production.

Supplementary TAP SHA256: `bbeb473c712a79816a12596a82239ba0fb3ca801879359bd34c8068e3d5b1714`.

## New focused coverage and defects caught

The35 R40 tests cover strict per-building opt-in dispatch,119 non-target hall signatures,86 registry signatures, fitted facade/canopy geometry, public caveats, repeated10/60Hz full-zone routes, resource disposal, actual merged finite geometry, flight coverage, stair/cap continuity and material-merge triangle/bounds retention. All seven complete zone builds are checked for finite local/world transforms and vertex attributes both before and after material merging, before constructing flight envelopes.

Development tests found and corrected an insufficient initial Zhongcui passage fit, omitted explicit zero mesh positions causing nonfinite canopy geometry, and a6cm coplanar platform-cap overlap. The final candidate includes these fixes; initial failures are not represented as passes. The2m final veranda inset remains a game-clearance fit, not a measured historic dimension.

## Log identity and scope limits

Direct/current TAP SHA256: `c346ed4fff24bfe07bc4b8e9f43ffe8a3c5b7add989c20f30c0cd81c48865384`.

Historical/mixed TAP SHA256: `c1208e7007ba267bf2bf82a36d7a7ba070231760a8ce7498eb3c2e6747e260dc`.

Machine-readable counts and exact failure-name differences are in `REGRESSION-CLASSIFICATION.json`. R39's historical source-identity failures and masked mutation/multi-path coverage remain unresolved, as documented in its validation record. Matching failure names must not be interpreted as successful execution of those later assertions. Official reference photographs were inspected; the generated scene was not visually accepted on real GPU or phone hardware.
