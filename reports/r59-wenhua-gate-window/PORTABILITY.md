# Portable exact-baseline fixture correction

The original baeba7 test fixture used `git show` to load a local-only baseline commit. A repository created through Git tree APIs need not contain that historical object, so the test was not portable.

The exact 3,116 original bytes now live in tests/fixtures/r59-wenhua-gate-window/SouthCourtGates.baseline.js.txt. The fixture reads those bytes, checks a pinned SHA-256 before parsing, and resolves its original imports exactly as before. There is no runtime historical Git lookup.

Provenance retained without requiring these objects to exist:
- Original commit: 2b983ae82e50e23fd55bbe0845942a0a3855f8dd
- Original Git blob: b19faa415f99ec3b41923782ef253ecad914b4cc
- Original source: src/scene/palace/special/SouthCourtGates.js
- SHA-256: 10bc98e9b77ab2ab16b8bac8a2bc5881b01761d023e0c3b56a52e4ef5f185f5a

Verification: the unchanged original eight focused tests passed with a deliberately failing `git` executable prepended to PATH. The executable was never invoked. See portability-focused.tap. The snapshot is byte-equal to the original Git blob.

Audit of this task's newly added JS/MJS files found no remaining `git show` runtime dependency. The standalone CPU exporter still uses `git rev-parse HEAD` only to identify its current capture checkout; it does not need any historical object. That exporter was not rerun or changed in this correction.

No production code, assertions, generated image, geometry evidence or original capture hash was changed. Earlier evidence/proof.json retains the fixture-file hash that was actually used for that earlier capture; this loader-only correction is recorded separately rather than rewriting the historical evidence.
