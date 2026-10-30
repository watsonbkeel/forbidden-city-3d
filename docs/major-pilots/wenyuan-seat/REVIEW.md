# Independent review and fixes
Readonly reviewer /root/resume_yonghe_front/review_yonghe separately inspected1538 and1537, identified existing R143 frame and constrained scope to low seat. No reviewer edits.

Important1: original side-backing contraction left0.001 gap to raised bars. Reproduced with actual Box3 intersection test (review-backing-red.log), changed backing inset .036→.034 to create0.001 overlap, all per-part/F32 bounds remain unchanged.
Important2: initial ownership check only isMesh attributes/index missed Points/Line/morph/interleaved aliases. Reproduced all4 cases (review-borrowing-red.log); replaced with all-object geometryResources ownership traversal including morph/interleaved/backing buffer aliases. All4 reject without mutation after fix.

Final independent verdict and aggregate outcomes recorded below after reviewer/run completion. No raster/GPU acceptance claimed.

Final independent review: no remaining Important issues. Reviewer re-read all-object resource ownership guard and independently reran complete28-test focused suite, all passed. Subsequently added a receipt test for96 actual parent/candidate World trajectories; no production changes since review approval. Actual upper route destinations remain withheld; matching traces include inherited non-arrivals/illegal starts rather than claiming route acceptance.

## Resumed final validation — 2026-10-29 UTC

- Focused final suite: 29/29 passed (the original 28 reviewed tests plus the World receipt test).
- Actual World/controller retention: 96/96 parent/candidate trajectories equal. Both runs contain 21 arrivals and 24 illegal starts; this preserves existing behavior and is NOT successful route acceptance.
- Outer/Wenyuan regression: candidate and exact safe parent each 768 tests, 732 passed, 36 failed. Failure names and locations match exactly.
- Repository current-state: candidate and exact safe parent each 1331 tests, 1113 passed, 218 failed. Failure names and locations match exactly. The aggregate is NOT green; pre-existing source/golden/route failures remain open.
- Three-base in-memory Vite compile and exact HTML/entry/build-info identity checks passed for `/`, `/forbidden-city-3d/`, `/gugong/`. This used the dirty candidate atop safe parent 7898b74f, as recorded in compile-memory.json; no deployable output or browser verification was produced.
- Production-source hashes still match the reviewed candidate. Unrelated WIP hashes and all six pre-existing dirty shared reports remain unchanged by this resumed validation. No reset, push, deployment or main modification.
- Evidence: focused-final.log, resumed-validation.log, world-{parent,candidate}.json, aggregate-comparison.json, compile-memory.json in reports/major-pilots/wenyuan-seat.
- GPU/raster matched-view acceptance and real continuous three-storey user routes remain VERIFY_PENDING. Upper automatic destinations remain WITHHELD_PENDING_REAL_CONTROLLER_ACCEPTANCE. No whole-hall or region acceptance is claimed.
