# R62 report-only reversible transport

Five complete final world reports are stored as ordered binary parts of at most120,000 bytes. ARCHIVES.json identifies every original path, source commit, Git blob, byte SHA-256, whole-container SHA-256 and ordered part hash. The exact original bytes remain in local rollback commit898a0c79e8128b104e76be26ab486fd3d4de8ec4 and can be restored from published parts independently of that commit.

Verify without creating files:

    node scripts/r62-restore-evidence-archives.mjs

Restore to a separate directory:

    node scripts/r62-restore-evidence-archives.mjs /absolute/new/restore-directory

The reader rejects missing, reordered or corrupt parts and refuses to overwrite differing existing evidence. readR62Evidence(originalPath) supplies original bytes to consumers. The stage summary script supports either direct or restored bytes. Five recovered files were compared byte-for-byte with frozen Git blobs:2,229,143 bytes in22 parts. All52 transport negative/positive tests pass. No automatic test input, expected data, assertion, production file or official source image was converted.

PNG evidence remains directly viewable and identical candidate blobs can be reused across paths. No unobserved connector size limit is assumed. The frozen129,530-byte actual-surface fixture and170,747-byte annex baseline test input stay unchanged. Derived research snapshots/release JSON stay plain for existing readers; only the canonical queue uses its existing verified single-authority gzip-parts storage.

Five successful intermediate progress snapshots are omitted only from this new transport successor, with paths/hashes/local rollback documented in OMITTED-SUCCESS-INTERMEDIATES.json. Their complete final reports, all failure evidence and every earlier published rollback remain. Candidate model evidence is retained; no lossy image/video substitution occurs.
