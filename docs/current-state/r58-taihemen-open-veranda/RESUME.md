# Resume bounded Taihemen work

Branch: `r58-taihemen-open-veranda`, based on `755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da`. Delivery consists only of new helpers, scoped tests and evidence. Shared builder remains untouched; the parent integrates `HOOKUP.patch` and canonical A37 status.

Last checks: `node --test tests/r58-taihemen-*.test.mjs`, 20/20 passed; actual same-camera gate-only CPU exports/raster diagnostics generated and inspected. `evidence/geometry-summary.json` binds helper/current-builder hashes, the exact in-memory candidate source and unchanged north/roof/plaque/support hashes. Original sources remain external to the production tree.

Next exact action: integrate the three hook hunks, then call `assertTaihemenInWorld(W)` from `tests/lib/r58-taihemen-world-check.mjs` on the parent's already-built unified W. Run the owner's end-to-end suite once there and obtain actual browser source-matched views when the permitted browser can reach the app. Do not treat the local geometry preview as that runtime check.

Unfinished source work: obtain a current Taihemen plan/section to resolve the museum's four depth bays, fourth interval / occupied column rows, end compartments and door line/count. Retained 40 columns / three intervals remain explicitly BLOCKED_SOURCE. Interior ceiling/frame and north are retained/unverified. Do not close Taihemen or A37 from this partial change. Continue other evidence-ready A37 tasks while these specific gaps remain.

No deployment, package, full world rebuild, main change, credentials or permissions are part of this worker's scope.
