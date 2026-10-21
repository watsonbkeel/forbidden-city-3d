# R39 validation and known limits

## Scope of the evidence

Automated CPU geometry, resource, navigation, data and UI checks only. No actual WebGL/GPU rendering session or native-phone acceptance was available. Official photographs were inspected as reference evidence; this is not visual verification of the generated scene.

## First frozen run, before historical fixture recovery

Production commit: `c5f6993`. The complete input snapshot remained unchanged during the run.

- Direct/current inventory: 166 files, 1925 tests, 1911 passed, 14 failed.
- Historical/mixed inventory: 132 files, 1092 tests, 837 passed, 255 failed.
- R38 comparison: direct 1856/1846/10; historical 1192/975/217.
- Build and both zone schema/geometry lints passed. The anchor checker retained the same existing Shenwumen 11 m difference and incompatible Qiandongwusuo gate/group comparison; it did not pass.

All ten same-name direct failures retained their baseline diagnostics. Four additional old direct assertions concern Changchun/Yikun: the first registered room is no longer the whole hall, and a former clear facade-probe start is now occupied by an actual visible partition post. Earlier column/window mesh correspondence and real entry routes pass, but this did not automatically validate assertions after the early exits.

Historical discovery fell by 100 because 25 card tests and 77 guide tests were replaced by two file-level aborts. The cause was a test fixture's full-card hash after the reviewed Fengxian disclaimer, not a production module import error. Additional mutation tests were masked by exact old UI-source guards. These first-run failures were not counted as successful asset or guide tests.

## Bounded recovery, without production changes

Test commit: `160c1ac`.

- The catalog fixture reverses only the exact reviewed Fengxian disclaimer before existing historical restoration. Original whole-card/source hashes remain in place. Negative cases reject unknown wording, identity/navigation changes, unrelated card changes and metadata changes. Current card tests separately require the new disclosure.
- A pinned test-only inverse recognizes only complete reviewed `ModelFidelity.js` and `PlaceInfoPanel.js` bytes and restores independently checked R38 bytes. Unknown or mutated inputs remain unchanged for old strict guards to reject. Frozen historical registries were not edited. Current UI tests still exercise live R39 modules and disclosure text.
- Independent current-model facade checks locate the real central entrance across all navigation zones, test all front columns/windows from clear starts, and walk against both side and rear walls. They require actual motion before blockage and prove the old occupied probe position corresponds to visible timber.
- All 11 new focused adapter/facade checks passed. The recovered 102 historical card/guide checks executed: 100 passed and the two existing main.js/Minimap source-retention failures remained. Combined: 113 tests, 111 passed, 2 baseline failures.

## Final aggregate

The recovered historical aggregate executes all 1192 baseline test names: 965 passed, 227 failed, none missing. The ten additional failures are old raw-source identity assertions for intentionally changed files, not runtime module/import failures. Eight per-file cases stop before old mutation/idempotence loops; one west-six restoration stops before perimeter/dimension/append-byte checks. These are retained failed/masked checks, not successful fail-closed coverage.

Among the 217 same-name baseline failures, 22 diagnostic strings differ: six only normalize workspace/temp paths; eight are changed source-inventory lists; four retain the same ZoneBase identity assertion with a new SHA; four multi-file chains now stop earlier on changed catalog/west-six inputs. Those four additionally mask later path checks and are not baseline-equivalent coverage.

Final direct/current aggregate: 169 files, 1936 tests, 1922 passed, 14 failed. All 80 added R39 checks pass; the remaining fourteen consist of the ten baseline failures and four explicitly documented legacy domestic-topology assertions. The input snapshot is unchanged across the final run. Build and both zone lints pass again; the same anchor failures remain.

`REGRESSION-CLASSIFICATION.json` records exact added failure names, diagnostic categories and complete TAP log SHA-256 digests. Neither the original nor adapted aggregate is fully green. This is a partial development candidate with explicit failed/masked historical replay limits, not complete museum-model acceptance.

## Preserved boundaries

R38 trees and Taihemen stair flanks, dedicated Taihe/Qianqing/Chuxiu interiors, 159 place identities, seven existing identity uncertainties, maps and helicopter controls are regression targets. Six rear halls intentionally change their bay-column collision layout; new domestic partitions intentionally add matching visible/collision solids. Unaffected roof variants and nine other main halls have exact geometry/navigation retention checks. No claim is made that all 89 named buildings have been updated or accepted.
