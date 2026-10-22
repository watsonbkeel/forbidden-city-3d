# R54 lossless report transport

Large report-only JSON, annotated overview PNG and reproducible diagnostic capture containers are stored as ordered binary parts of at most120,000 bytes. JSON is gzip-compressed; existing gzip and PNG bytes are concatenated unchanged. No test fixture or essential geometry-consumer input is compressed or changed. The directly viewable character/contact PNGs and source/reference images remain available; the key contact sheet is191,935 bytes, intentionally preserved directly rather than degraded.

Run `node scripts/r54-restore-report-archives.mjs` to verify without writing. Add an output directory to reconstruct every original relative report path there, for example `node scripts/r54-restore-report-archives.mjs /tmp/r54-restored`. All inputs are verified before any output, and different existing files are never overwritten. Missing, reversed or damaged parts fail closed.

`ARCHIVES.json` records the frozen local source commit, ordered part hashes, complete container hash, exact original byte count/SHA-256 and original Git blob SHA-1. The automated local freeze check compared every original byte against that commit's blob before removing duplicate working copies. Restoration checks both SHA-256 and Git blob identity. `FROZEN-BYTE-VERIFICATION.json` records that comparison. Original report/QA red states are not regenerated, truncated or reclassified. The previous source commit remains retained locally; a remote tree may use a different cumulative parent/commit identity.

To rerun the unified world test, the runner generates a fresh raw report at its original path. That does not modify the frozen archives and should not be mistaken for archived historical evidence.
