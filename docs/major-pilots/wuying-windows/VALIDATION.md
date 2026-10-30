# Final validation — 2026-10-30
Exact parent: `f89260c551b8a234b55c7d3653fd5cc6ea1b1358`.

- Wuying focused: **35 / 35 pass** (actual pipeline composition, strict rejection/resource aliases, source and merged Float32 bounds, opaque backing, all non-target source meshes and physical/navigation data, allocation failure/disposal, real pixels and overlapping-loop topology).
- Negative checks: actual parent composition fails with 0 rather than 4 groups; initial tangent motif fails authored-loop overlap regression. Corrected final suite passes.
- Prior Wenhua/Wenyuan focused: **62 / 62 pass**.
- Real World/controller: **96 / 96 exact-parent traces equal**. 11 arrivals and 64 illegal-start presets are retained parent results, not accepted new routes.
- Outer/south/Wuying regression: **880 tests; 819 pass / 61 fail** on BOTH parent and candidate. Failure names and locations match exactly.
- Current-state regression: **1,331 tests; 1,113 pass / 218 fail** on BOTH parent and candidate. Failure names and locations match exactly. This is baseline equivalence, not an all-green aggregate.
- In-memory Vite production compile: `/`, `/forbidden-city-3d/`, `/gugong/` all pass with exact HTML/entry/build-info identities. No bundles written or public assets copied; not an HTTP/browser/GPU or deployable-package check.
- Independent source/code review approved after correcting honeycomb to genuine overlapping curved loops.
- Pre-existing dirty reports and Chizao/Weiyu/Yikun/.superpowers WIPs hash-verified unchanged. No reset, push, main edit or deployment.

Reproduce with `node --test tests/major-pilots/wuying-windows/*.test.mjs`, `bash scripts/major-pilots/wuying-windows/final-validation.sh`, then `python scripts/major-pilots/wuying-windows/compare-results.py`. The final-validation script intentionally records nonzero aggregate exits instead of calling inherited failures green. Exact logs/comparisons are under `reports/major-pilots/wuying-windows/`.
