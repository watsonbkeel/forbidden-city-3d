# Development backup contract

No main/Pages operation; retain rollback493. Wait for the final integration commit and pin that exact commit, never an uncommitted/live branch view.

Required runtime: all584 source/data files and the unchanged runtime/build assets. Required QA: all existing portable fixtures plus all five original non-gzip files and the exact logical gzip in `tests/fixtures/r158-wenhua-gate-integration/`, the two new retention helpers, new production tests, unchanged original22 isolated tests and five adapted cumulative consumers. Do not omit the logical full-world baseline because of its size.

`world-493-before.json.gz` uncompressedSHA256:
`d23fc4371477397c49378352fdb66194f8368ce5e33e616b8c8020588fccd8f5`.
The two vendored493 control sources have individual hashes in controls-493.json. New live tests require no old493 Git object; only historical recapture of the baseline intentionally requires that exact source revision.

Keep CUMULATIVE-RESULT, source/QA manifests, LOG-PROVENANCE, full/batch comparisons (including the initial red batch), original compressed terminal logs and independent review. CPU images/mesh exports are diagnostic attachments, not runtime. If a backup projection omits any attachments, list exact omitted paths/hashes and call it an evidence-attachment projection, not a complete mirror or GPU/release acceptance.

A real clean-clone check must exercise the new exact493-control differential, actual production2/2, actual HD/SD old-region retention and the new World consumer. Coordinate its heavy World exclusively with the integration writer. Count real child JSON/TAP execution; exit0 with empty output is not evidence. Preserve all old rollback fixtures and Git history; do not regenerate goldens from the candidate.

## Reviewed lossless transport option

The authoritative local `world-493-before.json.gz` remains unchanged. A remote projection may physically omit it only with all 24 `.chunks/` blocks, manifest/.gitattributes/README, `r158-wenhua-world-fixture.mjs`, unchanged verified generic reader, adapted three callers and rejection tests. The other five original fixture files remain physically mandatory. Record the raw-file omission and exact representationReplacement; do not claim six original physical files or an unchanged QA physical tree.

Original Git blob `55e6b97d1fcec6b03242491bb9da42b647e8de8e`; compressed bytes 1,172,255 / SHA256 `dbca3c3fd71b922551749e09f2bf1a2162e22e8db53924163ad5dab2a8bfb78c`; uncompressed bytes 2,653,233 / SHA256 `d23fc4371477397c49378352fdb66194f8368ce5e33e616b8c8020588fccd8f5`; manifest SHA256 `21064669e6902e3790933bc352a73b87320755021115099151a2136931471847`. Original valid bytes take priority; corrupt original, missing/reordered/tampered blocks fail closed. No new goldens, weakened assertions or removed negative controls.
