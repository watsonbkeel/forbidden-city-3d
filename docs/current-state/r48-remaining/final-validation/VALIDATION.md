> Transport packaging addendum: some large evidence objects are stored as lossless parts. See [reconstruction instructions](../transfer-packaging/README.md). Restore the exact original paths before checking the unchanged archive indexes or historical receipts below. Validation results are unchanged.

# R48 consolidated validation

## Scope and result boundary

The tested product covers the remaining 70 named identities with per-side treatment records, not 70 complete reconstructions. There are 63 identities with an actual geometry change on at least one side. Exterior statuses are 57 partial changes / 13 reviewed-retained; interior statuses are 50 partial changes / 8 reviewed-retained / 12 evidence-blocked. See [the 70 identity/source records](../current-70-status.json) and [coverage limits](../CURRENT-COVERAGE.md).

No browser/WebGL/native-phone visual acceptance, live texture-pixel validation, full current museum inventory, or unrestricted free-roam guarantee is asserted. Actual TextureLibrary CPU construction is distinguished from simplified material fixtures. Source facts, dated-photo interpretations and access/construction fits remain separate.

## Frozen validation inputs

- R47 comparison commit: d37cf4de2a87f6deffff4e57e20c22f7a2dd779c, tree 505b037a6516e11aea6c78b46fad4c0570cae09a (same published R47 tree). The original R47 aggregate actually tested 3ff61557efb6006b510e7d4c0077debac2b3182a; d37cf4de adds only three evidence files, with no product difference.
- Initial complete candidate: 6e3faadab2b8c57ec8f6d73f949b2a1e794303ea.
- Final tested revision: 5383d404bc702a148500e5c99df9da0f9eac61d2.
- Final product bytes in src/data/public are identical to bd94eabf599f2ccd467da5234cef6e62d2e71b61. The second revision changes only two test files, not product geometry, navigation or old baseline fixtures.
- Explicit direct-current inventory: all 201 R47 files plus 124 R48 files, 325 total. Historical-or-mixed inventory: the same 132 R47 files. No missing or duplicate file entries.
- Every test process is serialized with --test-concurrency=1. Both runs report zero skipped, cancelled or todo tests. Node/npm and dependency receipts accompany each run.

## Final same-revision result

Final v2 completed at 2026-10-21T17:42:57Z:

- Direct-current: **5,271 tests; 5,144 passed; 127 failed**.
- Historical-or-mixed: **1,185 tests; 927 passed; 258 failed**.
- Build, zone schema and zone geometry checks: exit 0.
- Anchor check: exit 1; its complete log is byte-identical to the actual R47 anchor-check log, not newly described as passed.
- The entire tracked-input SHA256 inventory is identical before and after the run (stable.exit = 0).
- Build retains the existing large-bundle warning. Successful packaging is not GPU performance or CI acceptance.

Against R47, direct-current has 82 additional failed names and no removed failed names. Historical-or-mixed has 31 additional failed names, 3 removed failed names and 8 missing registrations. The removed three belong to that unregistered R15 file, not successful tests. These counts describe contracts, not 82 or 31 independent product defects.

The independent classification distinguishes actual changed diagnostics from unchanged failures, including pre-file uncaught guards. See [independent release evidence](../independent-release-evidence/README.md). Original aggregate failures remain visible and are not converted to success by supplemental checks.

## Initial candidate and corrections

Candidate v1 direct-current: 5,271 tests / 5,142 passed / 129 failed. Historical-or-mixed: 1,185 / 927 / 258. The original failed TAP is retained unchanged.

Two test-contract issues were corrected without changing production or frozen baseline fixtures:

1. The early integrated-profile test rediscovered a source item by name, although Hengshou's exact existing identity is plaque-only. It now retains the resolver's original item/profile pair and asserts that the item is the original zone object. The five zone integration cases then execute successfully.
2. The earlier Yongshou-radius retention inverse removed exact added leaf proxies but omitted the subsequently declared north-open rear-leaf poses in Yongshou and Xianfu. It now validates the exact four declared visible leaves, their cache material, angle and position outside the retained north wall, reverses only those poses, and compares against the unchanged original full-geometry/navigation fixture. Two inverse/column tests plus sixteen actual-material through-hall replays passed.

These corrections do not retrospectively change v1 into a successful run.

## Remaining failures are not silently waived

The aggregate is not all green. Original R47 failures, changed diagnostics with old names, newly superseded source/geometry/route contracts, file-registration failures and masked tails are classified separately in the independent release evidence. A failed old route is not called a source snapshot simply because its name is old. In particular, the old Wuying z=-205.5 transverse route now collides with the real opened-leaf proxies; the current route moves behind the leaves before turning, and is tested separately with actual materials, whole-world collision and visible-triangle body checks.

The old R15 top-level source guard prevents eight test registrations and replaces them with one file-level failure. The three missing old failures are not counted as new passes. A bounded original-source input supplement executes all eight original bodies and retains the three old R13 identity failures.

The old whole-Ningshou merge assertion expects every input geometry to be disposed during merging. Four isolated Huangji fallback objects now intentionally survive in the actual returned group until teardown. The independent bounded supplement proves only those four survive, executes the original flight/record/disposal tails, and does not rewrite the old failing assertion.

Twenty-four older asset/source-chain tests are blocked by the changed YanxiStorehouses source identity. A hash-bound original-source input supplement executes all twenty-four original assertions and mutation guards, without changing current files. Passing that supplement is not a claim that current Yanxi source has the old identity.

## Reproduction and archives

Each gzip file preserves the exact original byte stream, including failed diagnostics and whitespace. archive-index.json records compressed and original byte counts and SHA256 hashes. Decompression is lossless, for example: gzip -dc final-v2/direct-current.tap.gz > /tmp/r48-direct-current.tap.

The explicit file lists, runner, comparison helper, derived comparison names/hashes, full original R47 TAP and both complete candidate runs are retained. Packaging-only documentation additions must be separately compared against the tested src/data/public/tests/package inputs before publication.

The derived comparison summaries omit repeated full diagnostic strings because those exact strings remain in the archived TAP. Running the included comparator on decompressed TAP regenerates them; no failed frames or original diagnostic bytes were discarded.
