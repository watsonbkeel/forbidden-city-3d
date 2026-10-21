# R45 final validation

Tested commit `2f381e4733c6e93d3abc7e9b05f40c4230b8d152`, tree `806a71690bd213ba1bbadcbfc35db1ab922d621e`. Second frozen aggregate started 2026-10-21 09:30:30 UTC; before/after source manifests are identical. Later changes are documentation only.

- Current direct: 191 files, **2069 tests / 2029 pass / 40 fail**, versus R44 2041/2004/37. All 28 new R45 checks pass. Exactly three added failures are old R38 outer-east navigation and R44 hall/ledger snapshots, not silently waived.
- Historical/mixed: 132 files, **1192 / 962 / 230**, same failed-name set as R44. Source hashes, approved route count/name edits and inventories differ; frozen byte-reversal/mutation and downstream historical checks remain masked, not claimed passed.
- Four previous passing route names say 63 instead of 61. Their actual full traversal bodies execute at 10/60 Hz with and without sprint. Baseline route geometry traversal also passes. All prior 61 full route objects match an independently regenerated R44 fixture.
- Focused integration: 35/35, including nine independent enclosure checks and seven whole-zone finite/flight checks. Build, zone schema and zone geometry checks exit 0.
- Anchors still exits 1; output is byte-identical to R44's inherited Shenwu deviation. This is not an all-green release.
- R40 standalone masked-route checks: 10/10. Original R44 standalone checks: 1/4, retaining three stale assumptions after these two changes.
- New durable standalone `verification/masked-tail.test.mjs`: 6/6, outside aggregate counts. Checks both actual tree/source/spawn tails, exact old-input navigation causality, all118 unaffected R42 halls and all81 unaffected R42 ledger records with final key/schema checks. Assertions were independently reviewed; only imports/root paths changed when persisted.

## Rejected first candidate and actual route repair

Initial candidate `8f8efcd` produced 2067/2022/45. Updating only stale route counts in an external review harness exposed a real Arrow wall-crossing failure in all five traversal checks. Publication was held. The corrected Arrow-only planner exits through the real south gate and approaches on the exterior south lane; no wall or collider was weakened and no route was removed. The final full rerun above supersedes, but does not erase, that failed evidence.

Initial direct TAP SHA256: `75107fccbeeb8591c2436041de69f6c2e724fc5b45463a5e6c4feef2912b6d95`.
Initial actual-route failure TAP SHA256: `8b5fafe25ce404b9e066cc278185c2f40d298c054f42092052c36d405d965953`.
Final log hashes, exact new failure names, renamed passing route names and recovery scope are in `REGRESSION-CLASSIFICATION.json`.

## Acceptance limits

15 of 89 named building identities now have partial geometry changes across R39–R45, plus four unnamed eastern rear halls. This is not 15 completed restorations or 89 updated models. All89 have a first-pass source review, including11 identity/position gaps. Roof approximations, fitted dimensions, source dates and unknown furnishings/access remain explicit. No generated-scene GPU/WebGL or native-phone visual acceptance was performed. Main, Pages and credentials are outside this local change.
