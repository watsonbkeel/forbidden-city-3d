# R120 same-quality study: NO ACCEPTED PERFORMANCE CHANGE

Complete art baseline: `cb77e454`, runtime `8938de15545ac0fd46b7dfbde5a2d8c30e650ed130ecfbbb5cb8f7783cabfdcb`.

Five categories have actual source/evidence rows in `candidate-ledger.json`. The only newly justified runtime experiment was the R118 numeric-source proof hotspot made more expensive by R120's real rail surfaces. No quality/actor/light/frequency/startup readiness reduction was attempted. R97/R116/R117 rejected experiments were not revived.

Both experiments have real strong hot-loop savings and exact full-route digests, but **neither meets its frozen whole counter gate**:

| Candidate | 5-pair new-route total median benefit | Primary noise limit | Counter failure | Decision |
|---|---:|---:|---|---|
| NR1 |3076.538 ms per full7466-new-segment-frame roundtrip|1073.936 ms|construction pair2 +45.389 ms >25.020 ms A/A|REJECT_COUNTER|
| NR1b |2973.451 ms same scope|1073.936 ms|prefixP95 pair3 +.07262>.028352ms; worldReady pair1 +374.958>210.689ms; end-route ArrayBuffers pair2 +75,370,196>74,169,801B|REJECT_COUNTER|

All raw samples, orders, failed units, candidate files and independent reviews are retained. The refinement actually reduced explicit compile array-expression executions85,120→13,336 in a four-rail microdiagnostic, but that does not replace full-world acceptance. No samples were removed and no thresholds loosened. No third candidate/retry.

Only the two performance input files were restored/removed from production; the complete R120 art remains. New experimental helper and tests are preserved under `nr1b-rejected-source/` (tests originally lived in `tests/r120-performance/`; rerun only in an isolated reconstructed candidate, not as accepted production expectations). `restored-runtime.json` proves exact PRE_PERF fingerprint.

High candidate pairs are NOT_RUN because the low gate rejected both candidates before that stage. Baseline high/low complete actual startup/entry/TTL diagnostics remain valid findings, not candidate acceptance. Original diagnostic `readyCpuMs` precedes image maturity and is **setup only**; corrected future driver has `allReadyCpuMs` after all paint assertions. Routine `memory.ready` is a historical key for **end-route** samples, not startup-ready memory. Unknown native texture representations stay unknown; no heap/VRAM zero inference.

R120 ships no performance optimization from this study. Its art/route additions have explicit costs. This is a completed bounded negative investigation, not a claim of acceleration or elimination of old startup/Garden/return costs.
