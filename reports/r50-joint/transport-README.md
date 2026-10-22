# Candidate 07 exact binary transport

This successor changes report storage only. It does not change production meshes, animation, fixtures, automated-test inputs, old oracle assertions, PNG pixels, or the frozen source commit. It is not the earlier fixture transport format.

Frozen source: `6570c6451dcffdcc6ddc4dedbccf4866f8588422` (candidate 07 content originally committed as `96099a`). Original complete GIFs and sampled gzip remain available in that commit and the original female-reference tree. The successor stores their original bytes in 66 raw binary pieces, each at most 120,000 bytes. No base64, lossy conversion, GIF retiming, gzip recompression, or decoded-data edits occur. The complete redundant originals are absent from this successor tree.

## Verify or restore

From the repository root:

```sh
node scripts/p3c-verify-motion-transport.mjs
node scripts/p3c-verify-motion-transport.mjs --compare-source-commit
node scripts/p3c-verify-motion-transport.mjs --compare-source-commit --restore-dir /tmp/r50-motion-restored-new
node --test tests/p3c-motion-transport.test.mjs
```

The restore destination must not exist; its parent must exist. Restore writes the original repository-relative paths underneath that new directory. The default only reads and verifies. Every file is fully verified before any restore directory is created. Missing, reordered, corrupt, oversized, unsafe-path, duplicate-output, and symlinked pieces fail closed. `--compare-source-commit` additionally obtains each original blob from the frozen Git commit and checks actual `Buffer.equals`, not merely matching declared hashes. This option requires that source commit in local Git history; ordinary verification and restoration need no Git history.

`transport-motion/index.json` records source commit, source path, original length, SHA-256, Git blob SHA-1, and ordered piece index, offset, length, and SHA-256. `transport-verification.json` records the source comparison result. `transport-tests.tap` is the fresh isolated transport-test result, not a production or world benchmark.

## Preserved visual evidence and historical wording

The two candidate 07 contact sheets remain directly viewable at their original paths. The three user-confirmed candidate 06 PNGs remain unchanged. Original candidate 07 GIF captions were rendered before the user's later approval; historical text such as “approval remains pending” describes that earlier evidence-generation time, not a new rejection or withdrawal of the later approval. Captions and pixels are intentionally not rewritten.

The historical `motion-review.json`, render manifests, and implementation review remain unchanged records of the original complete export. Where they name a file omitted from this successor, use this transport overlay or recover the original from the frozen Git source, rather than assuming those historical records describe this new storage layout.

## Additional report-only deduplication

`transport-pruning-audit.json` records any removed redundant candidate 07 single frames, the candidate 07 regenerative model dump, and the duplicate historical latest-budget copy, with original hashes and source paths. No frozen candidate 05 image or `world-seat-models.json` is removed: that cached file is the actual furniture source used by the renderer. Candidate 04 and 06 model dumps are retained to avoid expanding this change's scope.

A byte-exact original report file can always be recovered into a separately chosen new file with `git show 6570c6451dcffdcc6ddc4dedbccf4866f8588422:<sourcePath>`. Never redirect that command onto an existing evidence file. Removed single-frame pixels are also available as exact panels of the retained contact sheets; re-encoding a crop is not claimed to reproduce the historical PNG container bytes.

For semantic model-dump regeneration, use an isolated checkout of the frozen source commit with the existing dependencies and retained cached furniture input, then run `P3C_FEMALE_OUT=<new-directory> node scripts/p3c-render-female-reference-export.mjs` (omit `--animation` when only the static dump is needed). The frozen exporter and source hashes are recorded in the original export manifest. Regeneration depends on the original software environment; use the Git blob to recover the exact historical gzip bytes. No world build or rendering was run for this packaging operation.
