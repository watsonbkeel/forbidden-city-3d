# Xianan identity and ground component checks

This candidate is not a movement fix or a release. Historical failed geometry/native checks remain evidence elsewhere; these tests do not replace them.

The ordinary component fixture needs one checkout and its already installed dependencies. It reads baseline-inputs.json, pinned independently in baseline-inputs.mjs to exact commit 5d30c8366c8430f27cb9664b2b64f30e64e87cca and tree 0f75720e7b5e36235105e691fda8e51930c7fa8f. Eleven protected files must match; five explicitly listed hook/controller files may change, with candidate and original baseline hashes both reported. Do not regenerate the baseline from candidate files.

Diagnostics use XIANAN_EVIDENCE_DIR when set; otherwise repo/.tmp/xianan-contact. Directories are created only for a write. Use a fresh evidence directory for a new verification attempt to avoid replacing historical reports.

The independent non-target-flow test additionally requires Git with the formal --no-lazy-fetch option and local Git history containing that exact baseline commit/tree and every transitively requested source/data blob. A shallow/exported checkout missing those objects cannot run that comparison. Every frozen Git read uses --no-lazy-fetch. Unsupported Git or missing local objects fails explicitly, without an unflagged retry, candidate-source fallback, or download. A synthetic promisor regression uses only a network-free local logging helper to detect forbidden fetch attempts. Its prior three-gate result is not rerun by the portability tests.

portability.test.mjs stages only the explicit hashed closure in portability-inputs.json, not whole tests/data/src or node_modules. The bounded runner supplies XIANAN_PORTABILITY_TEMP_ROOT inside a metered work directory. Node subprocesses share the process group, use 256MiB old space/16MiB semi space and small time/output limits. Staged inputs and all diagnostics count against the same8MiB ceiling, including a conservative1MiB reserve for input mutations/restoration. Temporary copies, not original checkout files, are mutated and then removed.
