# Exact QA gzip transport blocks

These 25 small base64 files are a lossless transport representation of the existing `world-physics-5d8c713e.json.gz` QA baseline, not new or simplified physics data. The original gzip is preferred when present and valid. If absent, `tests/lib/r157-taihemen-world-fixture.mjs` reconstructs its exact original bytes in memory after manifest/order/chunk/complete-identity verification. A damaged existing original never silently falls back.

The manifest is SHA256-pinned in reviewed helper code. It is not a private-key digital signature. Both compressed and uncompressed SHA256, original Git blob SHA1, lengths, chunk indices and chunk text/decoded digests are enforced. `.gitattributes` preserves the exact encoded bytes on all checkout newline settings.

Original Git blob: `6df149f5e70be9127779e4fde8efbe376857761b`.
Compressed SHA256: `65ccdfee6839b9173bd5c3458f8e141474f33b52d5adfe150d68cd732c8ea18a`.
Uncompressed SHA256: `dbda1e6e18635d7a80425b25e46337280a716f393c70b0b88dfaa9141f2904b4`.

Regenerate into a separate empty staging directory with `python3 scripts/qa/generate-chunked-gzip.py --input /path/to/world-physics-5d8c713e.json.gz --output /tmp/new-chunks`, compare generated identities, and review any change. Never reformat/reorder chunks or silently update pins to satisfy a failing test.

A remote projection may omit the original large gzip only after its backup contract explicitly accepts this verified representation and all chunks/helpers are included. It must disclose that the physical gzip blob is absent although its logical original bytes remain reconstructible. This alone does not prove a remote upload succeeded, or make the overall scene/release accepted.
