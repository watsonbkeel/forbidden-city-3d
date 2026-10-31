# Independent Arrow terminal evidence review

Reviewed immutable Arrow checkpoint: `055947f1b2f13cb26b809bf1098d48f0a978cb32`. The shared checkout subsequently moved to a different Taihe-instruments branch; this review does not cover that newer work. No test, build, World, source mutation or restoration was run during this terminal review; only original evidence, Git blobs and build artifacts were read.

## Conclusion

The recorded terminal results are verified. No new P0–P2 was found in the Arrow evidence or its previously reviewed production hook. This does NOT mean the full suite is green or that existing failure root causes are all identical.

- Current-state: 1313 tests / 1103 pass / 210 fail / 0 cancelled / 0 skipped. Independent Counter comparison against complete 0255 (1313 / 1090 / 223) finds exactly 0 added and 13 removed failing occurrences. The complete executed-test title multisets are identical (1313), not merely equal totals. Candidate TAP and spec failure Counters agree; no SIGKILL.
- The 13 removed failure titles exactly match the independent minimal13 recovery run's 13 passing titles. All 13 restored files (574070 bytes) match the independent manifest, actual materialized bytes and unchanged blobs in `9eb44a7661360ec61aefff378d1e2a788ced627c`, `3e9d5c92` and `055947f1`. No current-state tests or original golden fixtures changed across the Arrow sequence. These are input recovery effects, not architectural fixes.
- Batch: 278 / 277 / 1, against 241 / 240 / 1. Failure Counter adds/removes zero; the single inherited failure is `All existing bridge-deck supports and non-Wuying physical owners survive exactly`. The executed-title denominator differs: 65 added titles and 28 absent titles (net +37); one is a verified title-only rename from seven to pinned manifests; the other 27 are now covered by a separate 27/27 run of unchanged tests on an isolated 055947 source tree. All 953 regular isolated inputs (577 src/data) were compared to commit blobs. The run requires the original 4d614c22 history through GIT_DIR; the initial no-history failure is retained. Do not retroactively include these 27 in batch278. No nested historical TAP is added to the top-level count.
- The 577-entry src/data manifest exactly equals checkpoint inventory and every file hash matches. All prior independent hook review hashes still match the committed checkpoint; its 58/58 plus independent one-World results remain applicable to these bytes.
- All 20 committed evidence-manifest entries match their hashes. All three compressed logs decompress byte-for-byte to the original evidence (full spec, full TAP, batch).
- Three build logs show 555 transformed modules and successful completion. Actual `/`, `/forbidden-city-3d/`, `/gugong/` build metadata, HTML asset base, JS entry and embedded build ID/fingerprint agree. Independently reconstructed runtime fingerprint: `5cd5b00563b40cc513636bf51818b41524967055de0b465af92ff8529cd27f0b` across all three, 718 runtime inputs.

Build provenance caveat: the builds were made before the final source/documentation checkpoint. They correctly record `sourceCommit=5e66bedf80cf0d00ef29759ba937d1a3a882d55c` and `sourceDirty=true`; they are not clean builds bearing commit 055947f1. Their source bytes are independently matched by the fingerprint and 577-source audit above. No deployment/GPU/whole-object acceptance is claimed.

Detailed independently calculated results: `terminal-counter-audit.json`, `terminal-provenance-audit.json`, and `denominator-and-restoration-audit.json`, and `supplemental27-audit.json` in this directory.
