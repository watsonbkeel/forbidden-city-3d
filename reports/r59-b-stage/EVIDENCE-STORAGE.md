# R59 report storage

Only the three explicitly listed report files are losslessly archived. No fixture,
runtime input, PNG, source photograph or PDF is archived by this operation. The
source commits remain locally frozen. The upload may flatten history: do not assume
those local commits are separately present on the remote. The published parts and
index themselves recover the exact original SHA-256 and Git blob without Git.

Verify without writing:

    node scripts/r59-restore-evidence-archives.mjs

Restore into a separate folder:

    node scripts/r59-restore-evidence-archives.mjs /absolute/new/directory

Read API: readR59Evidence(relativePath) returns the exact original bytes. Gzip report
containers remain gzip, not a newly generated report. Original proof objects,
assertions and field values have not been regenerated or truncated. Index:
reports/r59-transport/ARCHIVES.json. Corruption, missing/reordered parts, unexpected
format and unsafe output paths fail closed. Tests are in transport-tests.tap.

Research audit JSON/MD/CSV snapshots have their own documented restore.py beside
STORAGE.json, preserving all original six artifact hashes. The selected QUEUE.json
index points to one authoritative atomic generation; old generations are rollback
objects, not competing progress records. Large derived source/crosswalk/release
JSON remain ordinary JSON for the existing readers. CPU PNGs remain directly
viewable, byte-for-byte, with no assumed transport size failure.
