# R56 lossless evidence transport

Only ten new large report `.json.gz` files are stored as ordered binary parts of at most120000 bytes. Existing gzip bytes are not recompressed or altered. This is a report-container storage change, not unchanged on-disk storage. All runtime assets, test inputs, small reports and PNGs remain direct. No R55 file is deleted or changed by this archive step.

ARCHIVES.json records the original frozen local commit, original Git blob/SHA256/size, whole container hash, and ordered per-part hashes. `node scripts/r56-restore-report-archives.mjs` checks without writing. `node scripts/r56-restore-report-archives.mjs /absolute/new/directory` restores the original paths under that directory. Small evidence remains in the repository. Restore rejects missing, reordered, corrupt or oversized parts and unsafe paths, and never overwrites different existing evidence. A39-case negative/roundtrip suite is recorded in ../r56-unified/transport-tests.tap.

frozen-original-verification.json independently compares all restored bytes directly to the original frozen local Git blobs. It does not require the published remote history to contain that local provenance commit. The complete original bytes are recoverable from the published parts without Git history.

The earlier v1 successful world report was produced on a6bef25 before the low geometric-band refinement; its accompanying staff-proof version is preserved in local rollback ab6cda5. The final source is3891d37, final `one-world-validation.json.gz`, and the directly retained final staff-proof.json.gz. Do not substitute earlier evidence for final acceptance.
