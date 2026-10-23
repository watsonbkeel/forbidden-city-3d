# R61 report-only reversible transport

Seven QA reports are stored as ordered binary parts of at most 120,000 bytes.
`ARCHIVES.json` records each original path, source commit, original Git blob,
byte SHA-256, container SHA-256 and every ordered part hash. The original bytes
remain in local frozen commit `75107a0e3478f315df564659ccb9a8debdbafca1` and are
independently restorable from the published parts, without access to that commit.

Verify all containers without creating files:

    node scripts/r61-restore-evidence-archives.mjs

Restore into a separate output directory:

    node scripts/r61-restore-evidence-archives.mjs /absolute/new/restore-directory

The script rejects missing, reordered or corrupt parts and refuses to replace
different existing evidence. `readR61Evidence(originalPath)` returns the exact
original bytes for automated consumers. No expected data, test fixture, assertion,
production geometry or source photo is compressed by this packaging step.
All seven recovered files were compared byte-for-byte with their frozen Git
blobs, and 52 transport tests pass. See the restore-check JSON in `r61-d-stage`.

PNG evidence remains directly viewable, including historical candidates.
Duplicate Git blobs can be uploaded once and reused by multiple paths. No
unobserved connector size limit is assumed for these images. The 176,191-byte
frozen gallery test fixture remains untouched. Derived research release JSON
remains plain for current readers; the canonical queue retains its own existing
single-authority typed gzip-parts format.
