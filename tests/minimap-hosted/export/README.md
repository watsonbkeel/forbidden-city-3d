# R379 sequential production map metadata exporter (PREPARED, NOT EXECUTED)

No product writes. ROOT is fixed /tmp/minimap-r379-exact, exact R379 HEAD. Each of the production eight canonical zones runs unchanged ZoneBase.build including actual finish, then clones returned publicMapItem records and disposes. The same records are appended by ZoneManager.init. This omits ZoneManager silhouettes, physics registration, static World, WebGL and textures decoding; it is NOT a full lifecycle or visual test. realTextureLibrary uses inert images with the original material APIs. No JSON-to-map approximation or skipped builder.

Files: export.mjs orchestrates eight serial Node children; worker.mjs builds one zone; contract.mjs validates order/completeness/plain finite metadata. Final map-items.json appears only after all workers succeed and cleanup completes. Partial zone receipts remain on failure; they are not a full-map result.

Gate.py is a prepared adapter using the existing pinned R327 supervisor, R262 bound-exit recheck and R267 owned-RSS observer. configure follows existing side_crossleg/R366 visual adapter: RSS6GiB,720s total, original2GiB heap, observation/cleanup unchanged. No per-zone budget reset. One exclusive export-attempt marker, no retries. Source and external harness hashes must be frozen in checkout-identity.json; exportHarnessPins must equal pins.json.harness. External sourcePins/retainedPins remain required. Existing original guards are not edited.

IMPORTANT execution admission gap: source restoration is currently an archive without .git. gate.py deliberately requires a clean exact R379 Git checkout, matching GITHUB_SHA/head/tree, frozen identity and pinned Node/npm. Do not run export.mjs directly to evade that check. Parent must provide the admitted checkout/identity and review gate/harness first. No heavy build, supervisor or browser was run in preparation. Metadata refusal may expose an unforeseen non-plain field; retain failure, review, do not silently coerce/drop it.

Small tests only:
node --test /tmp/minimap-zone-export/contract.test.mjs
PYTHONDONTWRITEBYTECODE=1 python3 /tmp/minimap-zone-export/gate_test.py

After admission only, from ROOT:
EVIDENCE_DIR=<fresh external folder> GITHUB_SHA=<exact R379> PYTHONDONTWRITEBYTECODE=1 python3 /tmp/minimap-zone-export/gate.py
RSS limits are sampled fail-closed process-tree limits, not a kernel reservation. Missing host/cgroup observation, child identity or RSS remains a refusal. The next stage should measure the real Minimap with production FLIGHT_BOUNDS and these complete mapItems, not default bounds/empty R169 fixture.
