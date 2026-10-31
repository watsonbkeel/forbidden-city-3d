# Portable historical QA checkpoint

Base: `c9b25a712e286877f2abbc88f4522add3fc0caea`. Applied patch SHA256: `6ec77888e729548c4b620dd567f943512f41ea645b2902652b54a17ed198f41e`.

Only QA source acquisition changes; production src/data unchanged. The original Git source is preferred; only an explicitly missing commit enables cryptographically pinned original snapshots. No live-source fallback. Seven original commit identities, three full src/data closures and four exact parent builders are covered, not arbitrary historical scripts. Four historical files now have source-acquisition imports/substitutions; their assertions and negative controls are unchanged. Earlier byte-identical historical-file statements describe the pre-portability checkpoint, not these transport-edited files.

Verification: actual integrated Git mode 66/66; isolated no-original-history clean QA clone 66/66; final complete batch plus triangle suites 204/204. The clone has one synthetic commit, no alternates, all seven original commits absent, and all 571 production source/data files exactly equal. It is a selected QA closure clone, not full repository or remote recovery. Existing shared dependencies were reused; no fresh dependency installation is claimed.

Independent static integration review found all 601 patch paths byte-identical to the reviewed patch, no unexpected production changes and no P1/P2. Source identity/tampering and six inherited Git routing environment safeguards are retained.

Frozen original source blobs intentionally preserve original trailing whitespace (313 lines). Do not normalize these fixtures: original SHA identity is part of the contract. Non-snapshot diffs pass whitespace checks.

The full current-state suite was not rerun for this QA-only change. Its unchanged-production evidence remains 1313 total / 1090 pass / 223 fail; no all-green claim. Whole Wumen remains unaccepted, including shared pavilion/wing scale P1 and source/GPU gaps. No main or Pages change; no remote recovery claim until backup independently verifies it.
