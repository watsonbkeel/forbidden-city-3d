# QA-only frozen source snapshots

These are exact original source bytes, not an alternative production implementation, a replacement Git history, or a claim that the original commits exist in a remote clone.

Three complete `src/` + `data/` snapshots retain original identities:
- wings: `929e346745b7295ad1aae0caa581e8cdf22723ff` (561 files)
- NE enclosure: `4d614c22a8318027e51e149e435a3198f78ca4e5` (567 files)
- main tower: `ebd5d0494bc2eedcd8983dcb7669d4c7e8f121d2` (565 files)

Four further identity manifests retain only `src/scene/PalaceBuilder.js`, used by the existing historical tests: `0027a133f5e4c79cc5865061decb24d1901cec4b`, `d874222f0bb587e308e53e04e75b931996a1f1e5`, `d70a4a027fd5624b2becdbebb287d2f9868a6c21`, and `0ab13818d5885814c4fede04b0fffc460d93f983`.

## Integrity and selection

Each manifest is pinned by SHA256 in `tests/lib/r157-frozen-source-pins.mjs`. It includes the original raw commit object and original tree objects (base64), allowing the reader to rederive the original commit/tree identities and bind each path to its exact original Git blob SHA. Each source entry also records SHA256 and byte length. Source blobs are deduplicated plain UTF-8 `.txt` files named by original Git blob SHA; no raw test logs or generated test output are included.

When the original commit is present, the reader uses `git show` and verifies its returned bytes against the same original blob/SHA256/length. Only an explicit `git cat-file --batch-check` missing-object result selects the verified snapshot. A present commit with missing/corrupt contents, a Git error, unknown identity/path, altered manifest, missing/corrupt blob or symlink fails closed. It never substitutes working-tree source. Cached reads retain the pre-existing loader's frozen-per-process behavior.

The original three-commit loader allowlist, historical runner, test assertions, live negative controls and runtime production files are unchanged. Only historical source acquisition is adapted. This is intentionally limited to these Wumen QA dependencies; it does not make every historical repository test portable.

## Reproduction

From a source repository containing the seven original objects, generate into a separate empty staging directory:

```
python scripts/qa/generate-r157-frozen-sources.py --repo /path/to/original/repo --output /tmp/r157-source-staging
```

Review staged manifests, pins and blobs against these files before replacing anything. The generator cannot write into its source repository. A remote clone does not need to regenerate the snapshots or import original Git history.

Run the dedicated reader integrity tests:

```
node --test tests/photo-fidelity/batches/r157-portable-frozen-source.test.mjs
```

Also run the nine existing Wumen inherited/live equivalence test files listed in the integration handoff; the reader tests alone do not establish their geometry contracts.

## Acceptance limits

This change affects QA source loading only. It does not resolve the integrated candidate's 223 current-state failures (five additional historical contract failures), establish whole-object completion, authorize release, or provide GPU/browser acceptance. Original candidate full-suite evidence remains 1313 tests / 1090 pass / 223 fail. No new full current-state run is claimed by this portability experiment.
