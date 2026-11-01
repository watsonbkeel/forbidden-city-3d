# CPU transport supplement — original backup contract retained unchanged

## Reviewed transport successor to a32 (physical representation replacement)
The development projection physically omits exactly the eight original CPU `.json.gz` files enumerated in CPU-TRANSPORT-PINS.json, replacing each with `.chunks/` text blocks and a pinned manifest. Original local Git objects/files are preserved, not deleted. These are exact logical gzip archives, NOT eight physical original files or a complete historical evidence mirror. All other new evidence remains physically exact; inherited omissions remain explicit in the backup receipt. The original ARCHIVE-RECEIPT and EVIDENCE-SHA256 stay unchanged and describe original bytes, which must be validated via reconstruction for these eight entries.

Run `node docs/photo-fidelity/batches/R157-WUMEN-VISIBLE-PLATFORM/cpu-transport.mjs` for verification. To export originals, use the same command plus `--restore /absolute/new/outside-directory`; directory must not exist and files are create-only. Then render the recovered original gzip normally. Guard command: `node --test docs/photo-fidelity/batches/R157-WUMEN-VISIBLE-PLATFORM/cpu-transport.test.mjs`.

The existing reviewed generic reader/generator are unchanged. Original regular files take priority and damaged originals fail rather than falling back. Only ENOENT uses chunks; pin/order/per-block/compressed/plain/Git-object hashes must all pass. Manifest pinning is integrity checking, not a cryptographic signature. Regeneration uses `python3 scripts/qa/generate-chunked-gzip.py --input ORIGINAL.gz --output NEW_EMPTY_STAGING_DIRECTORY`, then copies the result to `ORIGINAL.gz.chunks`; never overwrite originals.

No production, seven offline implementation/test files, prior QA assertion, fixture golden, microgap bound, or acceptance claim changes in this transport successor. Original600/4406 manifests remain applicable.
