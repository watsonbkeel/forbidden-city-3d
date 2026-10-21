# R48 lossless evidence transfer packaging

This is a transport-only successor to frozen commit `248bc93ea96161a40f40df68738f21bd53437caa`, tree `6d1eba7ff44cb7a34588874006afc9d9c98bd80b`. Large GitHub tool requests stalled before publication. No product, tests, fixtures, assertions, or validation result changed.

Ten evidence objects (one report JSON and nine gzip archives) are stored as 53 ordered base64 text parts. Each part is at most 133337 bytes. Decode each part independently, then concatenate the decoded bytes. **Do not concatenate base64 text before decoding**, because each part has its own padding. `split-index.json` records every original path, byte count, SHA-256 and Git blob SHA, and every part's byte count and SHA-256.

From the repository root, verify without writing:

    python docs/current-state/r48-remaining/transfer-packaging/restore.py

Restore all ten original paths to an independent directory:

    python docs/current-state/r48-remaining/transfer-packaging/restore.py --output-root /tmp/r48-restored-evidence

For original archive-index or historical receipt reproduction, restore into the checkout explicitly with `--output-root .`. This creates the ten original evidence paths as untracked reconstructed files; it does not alter the tracked split parts. Existing different bytes are never overwritten. The original archive indexes, original publication manifest receipt and historical validation references continue to describe the **reconstructed original objects**, not their transport parts. First reconstruct, then apply those original checks. Gzip archives themselves are preserved byte-for-byte, so both compressed hashes and decompressed evidence hashes remain valid.

The JSON report is only an optional test output, not a default test input. None of the nine selected gzip archives is a test input. All directly consumed fixtures, all other large already-transferred JSON, and all source/data/public/test files remain at their original paths and bytes. Prior full serial results remain 5144/5271 direct and 927/1185 historical, with 127 and 258 disclosed failures respectively. This packaging does not turn failures into passes, rerun validation, or confer GPU acceptance.

The old commit remains available locally as a rollback and byte-comparison reference. The publication manifest generated for this successor is the authoritative **physical Git tree** transfer list; the older receipts remain immutable evidence of their stated snapshots.
