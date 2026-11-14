# Isolated R379 map diagnostic
Only new QA files. Production R379 source is separately checked out and verified at exact commit/tree and 995 source hashes. No product change, merge, deploy, credential mutation, or bug acceptance.

One fixed Node entry exports actual mapItems from eight canonical ZoneBase builds sequentially, then captures native Chromium Canvas at 390px. Both phases and descendants share the existing unchanged RSS observer/recheck under one 6 GiB/720 s supervisor. No per-zone or browser reset. Chromium/dependencies/font inventory are hosted setup, not product export or capture.

Current diagnostic branch must be one commit directly atop R379 with exactly manifest-listed additions. Actions checkout requires workspace-relative paths: the second checkout is moved unchanged to the prescribed /tmp path before admission. Failure artifacts include setup logs, guard stdout, partial zone receipts and browser observations. Setup failures remain failures, never implicit permission to run outside guard.

Nine UI states are observational only. Not collision/name-click/close-reopen/physical mobile/double-touch acceptance. Source builders use real material/tile APIs with inert texture pixels, no full WebGL World. No screenshot success implies BUG-002 fixed.

Prepared only. Parent reviews and freezes before upload. No hosted or heavy local execution has occurred in preparation.

## Preserved failure and bounded transport correction
Prior one-shot [CI 43593801037](https://github.com/watsonbkeel/forbidden-city-3d/actions/runs/43593801037) remains FAILED. Axis courts produced 35 real items; east-six legitimately exposes own `name: undefined` on anonymous halls, rejected by the original JSON-only QA validator. This is not an OOM or upload failure.

New branch `dev/minimap-codec-r379`, still directly atop exact R379, changes QA transport only. Versioned tagged-tree encoding preserves own undefined versus absence, sparse-array holes, null and negative zero. Worker performs JSON roundtrip deep equality before release; receipts and combined data carry `mapItemsEncoded`; browser decodes through the same frozen codec before constructing untouched production Minimap. No invented names, dropped optional fields or tag collisions. Unsupported accessors/symbols/functions/nonplain objects/cycles/nonfinite values remain rejected. Codec imposes depth 64, 500000 nodes and 100000 entries/array length. Shared references are value-copied, not graph-identity transport; production UI receives only plain map metadata.

## Fixed legitimate empty zone
Second [CI 43594542227](https://github.com/watsonbkeel/forbidden-city-3d/actions/runs/43594542227) remains FAILED: actual eight-zone construction produced 35/42/38/32/36/36/35/0 items, but the transport contract incorrectly required every zone to be nonempty. Exact R379 `data/zones/yuqing-south-entry.json` has `items: []`. New branch `dev/minimap-empty-zone-r379` admits zero only for this fixed zone, still requires its real build, cleanup receipt, exact identity and count. Other seven zones remain nonempty-required. No zone skipped and no resource or product change.
