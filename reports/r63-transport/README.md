# R63 report-only reversible transport

Five complete final world reports are stored as ordered binary parts of at most120,000 bytes. ARCHIVES.json records each original path, original byte SHA-256, frozen Git blob, ordered part hashes and whole-container SHA-256. The exact original bytes remain in local rollback commit381c03809ab7fae847acf5c4280bb30d02279dcf; published parts restore independently of that local commit.

Verify without writing files:

    node scripts/r63-restore-evidence-archives.mjs

Restore into a separate directory:

    node scripts/r63-restore-evidence-archives.mjs /absolute/new/restore-directory

The reader rejects missing, reordered or corrupt parts and refuses to overwrite differing existing evidence. readR63Evidence(originalPath) supplies original bytes to consumers. The stage summary accepts either direct or archived originals and was rerun successfully after conversion. All five restored files matched the frozen Git blobs byte-for-byte:2,302,531 bytes in22 parts. The unchanged typed transport reader/preparer passed52 positive and negative tests. No test fixture, expected data, assertion, production input or official photograph was converted.

All28 actual-geometry CPU PNG remain directly viewable. Twenty regenerable camera triangle buffers are omitted only from this successor, with their original hashes, local rollback source and regeneration commands in OMITTED-REGENERABLE-DUMPS.json. Their independent geometric signatures, contact/physics proofs and rendered PNG remain. Reproduction is a geometry operation, not a promise of identical gzip header bytes. These buffers were never automatic test inputs. No prior published evidence was removed or rewritten.

Five successful intermediate progress snapshots are similarly omitted, with originals and complete-final-report paths in OMITTED-SUCCESS-INTERMEDIATES.json. Every failed attempt and full final report remains available. No lossy image/video substitution occurs.

PNG use ordinary Git blobs; no unobserved connector size limit is assumed. Derived research snapshots stay plain for current readers; only the canonical queue retains its existing validated single-authority gzip-parts format. Source photographs/PDFs stay private and are not redistributed in code or the production ZIP. This changes evidence storage, not any validation or fidelity status.
