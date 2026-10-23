# R58 lossless evidence transport

This is a storage representation change, not a claim that the repository still contains the originals at their former paths. No geometry, world, oracle, screenshot, image, or acceptance result was regenerated. Lossless restoration reproduces the exact original file bytes, including each PNG container and the original bytes of already-compressed JSON reports.

## Frozen inputs and boundaries

The initial source freeze is `2e62013d97d2f5ccf2fe6515a7b62909af5830c0`, compared with the R57 baseline `755dd9a`. Every archive entry independently records its full `sourceCommit`, original path, byte count, SHA-256 and Git blob, container byte count/SHA-256, and ordered part index/path/byte count/SHA-256. The source freeze remains in Git history. Later, newly committed evidence can be added without rebinding an earlier entry's commit.

`PREPARED-PATHS.json` is the explicit reviewed selection, not a broad recursive archive command. The current 66 report entries total 20,311,390 original bytes. Raw JSON uses gzip; existing `.json.gz` uses identity encoding. The 189 binary parts total 17,909,396 bytes, each at most 120,000 bytes. The compact index is 64,726 bytes. There is no duplicate complete container or raw report copy in the current archive representation. All 21 formerly archived CPU image/texture PNGs have been restored directly and compared with their frozen Git blobs, alongside the 87 smaller changed PNGs that were always directly viewable. `DIRECT-CPU-IMAGES.json` retains the source commit, original byte count, SHA-256 and Git blob of each restored PNG.

The previous complete 87-entry transport remains rollbackable at commit `860df362dc60e916e2af351b096601a344ae07a4`. The follow-up only removed the 21 image entries and their 174 exclusively owned parts after exact restoration; its PNG bytes are unchanged from the original source freeze. Current PNG storage is the original direct Git blob, not transport parts, in order to reduce connector object count. No connector numeric object-size limit is asserted.

Only explicitly reviewed R58 report/current-state/validation/evidence paths and review reports are currently selected for archives. CPU PNGs remain direct original Git blobs. Production code, public assets, fixtures, package scripts, queue storage, canonical register/crosswalk/source data, release snapshots, official imagery, PDFs and reference caches are excluded. `EXCLUSIONS.json` lists the 20 oversized changed paths deliberately left alone and the exact direct consumers of the two large oracle fixtures. The historical A37 audit is not silently reclassified as R58 evidence.

Image provenance was checked in the neighboring capture/diagnostic records and their writers. Wumen northeast columns, north portals and south canopies are actual component CPU captures. Zhaode panels are CPU geometry diagnostics. Zuoyi images are existing project texture/mesh UV diagnostics, and their source record explicitly excludes official photographs. No image is recompressed, reencoded, resized or replaced with a preview. These remain CPU evidence, not browser acceptance.

## Verify, read and restore

Run `node scripts/r58-restore-evidence-archives.mjs` to verify every archive without writing. Supply a fresh output directory, for example `node scripts/r58-restore-evidence-archives.mjs /tmp/r58-restored`, to restore exact originals beneath their recorded relative paths.

The `readR58Evidence(originalPath, options)` export returns a verified Buffer for one archived path. `restoreR58Evidence(options)` verifies all entries and optionally restores them. Options accept `root`, `index`, and a Buffer-returning `read(partPath)` callback for isolated tests. Read never falls back to a mutable raw file or regenerates missing evidence. The default index is `reports/r58-transport/ARCHIVES.json`.

Validation rejects unsupported schema/kinds/encodings, invalid source commits, missing or corrupt parts, wrong order, duplicate paths, oversized parts, traversal, protected paths, mismatched full containers, and any raw byte count/SHA/Git-blob mismatch. The default filesystem reader and output writer reject symlinked files or ancestors, including dangling links. Restore verifies all inputs and all destination conflicts before writing any file; identical existing output is left untouched and differing evidence is never overwritten. This is a local filesystem tool, not a defense against a concurrent hostile process mutating directory entries during a write.

## Extend only after a new source freeze

First inspect the proposed report paths and their raw-path consumers. Keep CPU PNG originals directly at their original paths; do not add them to the current report archive selection. Commit the exact report outputs before packaging. Pass the full new commit plus an explicit JSON array of `{ "path": "reports/r58-.../file.json.gz", "kind": "report" }` selections to:

`node scripts/r58-prepare-evidence-archives.mjs --source-commit FULL_COMMIT --paths /tmp/reviewed-r58-paths.json`

This is a read-only plan. Add `--apply` only after reviewing it. The preparer reads frozen Git objects, verifies each tree blob and current worktree original, requires each selected path to have changed since the specified base commit, checks all previous archives, and refuses small files, dirty originals, source symlinks, existing part collisions and oversize indexes. It writes verified parts and an atomic replacement index before removing the matching worktree originals. An interrupted final removal can leave a duplicate original, never the only copy missing. No complete packed container is written alongside its parts.

Existing entries retain their own source commits when appending distinct paths. Selecting an already archived path is rejected rather than silently replacing a version. If later work updates the same report path, retain that new raw file and handle version naming/freeze deliberately before archiving. If the compact index would exceed 120,000 bytes, preparation stops before writing; review manifest partitioning rather than relaxing the ceiling. The report-only index has approximately 55 KB of headroom. Do not copy a later global commit onto old entries.

## Consumer audit and verification

Tracked JavaScript/Python/shell tests and scripts were searched by selected full path, basename and containing report directories. Matches for selected large reports were output writers (including batch world report writers, Baohe exact-delta output, gallery component/controller output and hall-beast MANIFEST output), not frozen-input consumers. The generic CPU raster scripts accept an explicitly supplied JSON/gzip input path; restore the archived input before using those tools. No existing assertion or test input expectation was changed. The two actual raw world-contract fixture readers are explicitly excluded.

All 87 restored files were independently compared byte-for-byte with `git show <entry.sourceCommit>:<entry.path>` and their `git rev-parse <entry.sourceCommit>:<entry.path>` blob IDs; every comparison passed. After the direct-PNG follow-up, all 21 direct images were compared again with their original Git blobs, all 66 report archives were reverified, and the tree was checked for duplicate archived originals and missing or orphan part files. `frozen-blob-verification.json` records those verified identities, not new acceptance evidence.

Verification command: `node --test tests/r5{2,4,5,6,7}-report-transport.test.mjs tests/r58-evidence-transport.test.mjs tests/r58-evidence-preparation.test.mjs`. Result: 189 passing tests, zero failures. The two new R58 files cover 66 cases, including actual temporary Git source-blob equivalence, multi-freeze extension, corrupt pre-existing archives, path traversal, missing/corrupt/reordered parts, schema/hash/count mismatches, symlinks, overwrite refusal, dry-run behavior and index-size rejection. The restore and preparation additions were first tested red for missing APIs, then green. Full scene/world/build/geometry suites were intentionally not run: this handoff forbids regenerating that evidence.


Direct-PNG follow-up verification: `node --test tests/r58-evidence-transport.test.mjs tests/r58-evidence-preparation.test.mjs tests/r58-direct-cpu-evidence.test.mjs` passed 69 tests with zero failures, including the applicable missing/order/corruption/schema/path traversal/symlink/overwrite negative cases. `direct-png-tests.txt` records this run. The preceding 189-test transport regression is retained as historical verification and was not redundantly rerun.

## Fifth-world append

The final set now contains 67 report entries in 197 parts. The final fifth-world original was frozen at c523713b4a40a541d088f97a10e4507d3f657bfb and restored byte-for-byte; prior entry provenance is unchanged. See FINAL-SUMMARY.json for exact byte totals. All CPU PNGs stay at their original paths.
