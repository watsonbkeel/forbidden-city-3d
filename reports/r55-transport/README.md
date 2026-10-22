# R55 lossless report storage

Fifteen large report-only records are stored in ordered binary parts of at most 120,000 bytes. Raw JSON is gzip compressed; existing gzip containers retain their original bytes unchanged. All original reports and all nine Kunning view containers are retained losslessly. No evidence is omitted, truncated, regenerated as a replacement, or reclassified. Previous frozen commits remain rollback points.

`ARCHIVES.json` is the authoritative final index. It records frozen local commit `36e35ede63e86667ee224a7109a01f87fed98275`, each original path/byte count/SHA-256/Git blob SHA-1, encoding, complete container hash and ordered part hashes. `FROZEN-BYTE-VERIFICATION.json` and `restore-verification.json` record exact recovery checks against the original Git blobs. The local freeze commit need not equal the cumulative remote upload commit.

Check without writing:

    node scripts/r55-restore-report-archives.mjs

Restore all exact original relative paths into a fresh directory:

    node scripts/r55-restore-report-archives.mjs /tmp/r55-restored

Every part, order, concatenation and original is verified before any output. Missing, corrupt or reordered evidence, invalid paths, conflicting output ancestry, differing existing files and symlinked destinations fail closed. Use a dedicated quiescent destination; this preflight is not a transaction against concurrent external modifications or disk failures.

All test fixtures, runtime assets, source images, PNG previews, compact summaries and necessary consumer inputs remain direct. In particular, `docs/validation/r55-zhonghe-display/neutral/geometry-and-navigation.json`, both Kunning GLBs and all `tests/fixtures/` files are unchanged. The 427,780-byte new GLB is a normal production asset, not a report archive. The 120,000-byte limit applies only to transport parts, not directly retained assets or key PNGs.

`REPRODUCTION-CHECK.json` separately records that the nine Kunning view containers were regenerated in a fresh directory and compared exactly. This additional check does not replace or remove any original. The exporter now requires a fresh output directory so frozen evidence cannot be overwritten accidentally:

    node tools/r55-kunning-evidence.mjs /absolute/fresh/output

`PROPOSED-ARCHIVES.json` is the retained earlier preparation inventory, not the final index. Its pending labels are historical; use `ARCHIVES.json` and the unified R55 README for the completed state. Synthetic transport tests do not rebuild a world. A future world rerun writes new evidence and does not alter these frozen archives.
