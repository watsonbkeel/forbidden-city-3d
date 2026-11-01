# E3 bridge discoverability — bounded UI-only handoff

Root approved2026-11-01 04:11UTC,30-minute box. Base `5be900075db7d63977f8efd9e090ffd5176807d1`. Isolated `r157-bridge-map-e3-0412` / `feat/r157-bridge-map-e3-20261101`. Only three UI production files changed; no scene/physics/controls/data/main/style/teleport target change, no C, World or scene CPU run.

## What is now discoverable
- The map draws the existing **15 actual bridge footprints** from the same InnerJinshui/SouthWater profiles used by geometry/physics, plus the actual half-bridge visible cover. Taper/axis/anchors come from profiles, not a second hand-copied map.
- A separate “桥梁设施（4组）” section exposes the four original E group names/IDs: inner5, Wuying3, half1, Three-Gates3. The159 historical catalog cards and8 quick travel controls remain unchanged. No new37-count entities or fake hall/gate bindings.
- The existing search also filters these four facility buttons. Selecting a facility focuses only the map viewport and opens a brief; the player is not moved. Bridge footprints can open the same typed facility when its label is decluttered. Different overlapping identities remain ambiguous/no-op.
- Briefs provide source-bounded location/use descriptions, outdoor/no-interior distinction, engineering-fit/not-surveyed limits and official source links. Three-Gates explicitly says this round does not create its gate building and does not rename Nansansuo gate.
- Minimap admits exact facility ID+name from actual existing group data; the panel independently checks the controlled registry. Both layers refuse facility travel even with a permissive generic resolver. Unknown/wrong/prototype IDs retain the original unknown-place fallback; source links are not borrowed by display name.

## Source files / integration
- `src/ui/Minimap.js`: read-only profile projection, bridge silhouettes, typed footprint/label selection, independent searchable facility section, map-view focus only.
- `src/ui/ModelFidelity.js`: frozen exact-ID/name bridge brief/source registry. Original building fidelity lookup is unchanged.
- `src/ui/PlaceInfoPanel.js`: optional validated facility brief; known159 cards and unknown fallback preserved, no facility travel button.

No PlaceCatalog schema change or source data migration. Keep the new bridge section in both normal/detail and compact lifecycle lists. It is deliberately a sibling of #place-list: historical building-button count remains159 while four facilities are separately identifiable. Do not merge these into fake historical cards or add a teleport merely to make selection convenient.

## Actual checks, not GPU claims
New7 tests and selected existing lightweight UI/catalog/input suites pass126/126; the retained159-information-button contract separately passes1/1. Original focused RED6:1pass/5fail is retained. FirstGREEN4/6 exposed only a new URL-regex omission of www, corrected in the test without changing official URLs. A separate inherited-property registry RED caught constructor being admitted; production fixed with string+Object.hasOwn, then GREEN.

The broader134 selection has132pass/2fail. Exact5be UI-source hook reproduces the same2 failures: existing garden天一门 binding and an old frozen Taihe-guide dataSHA mismatch. Neither data nor golden was modified, and this is not a whole-suite-green claim. All raw logs and compile manifests remain outside repo in `../r157-bridge-map-e3-evidence/`; `VERIFICATION.json` is a concise command/result receipt.

Fresh independent Astra static review found no Critical/Important. Deferred minors: this separate section uses basic native presentation instead of the old directory theme; real touch/key activation, layout and GPU/user-device visual acceptance remain unverified. Automated tests use simulated clicks under desktop/mobile viewport fixtures and no-op canvas commands, not browser rendering. Native button semantics and existing map lifecycle are reused, not a new input controller.

### Exact lightweight commands (no World)
```sh
node --max-old-space-size=512 --test --test-concurrency=1 tests/r157-bridge-map-e3/discoverability.test.mjs
node --max-old-space-size=512 --test --test-concurrency=1 tests/r157-bridge-map-e3/discoverability.test.mjs tests/map-place-directory.test.mjs tests/map-place-selection.test.mjs tests/map-compact.test.mjs tests/map-gestures.test.mjs tests/map-inputs.test.mjs tests/map-location-css.test.mjs tests/place-catalog.test.mjs
node --max-old-space-size=512 --test --test-name-pattern='159 information buttons' tests/map-four-place-cards.test.mjs
EVIDENCE_OUT=/tmp/e3-build.json node --max-old-space-size=1024 scripts/r157-bridges-e/compile-memory.mjs
```
The name-pattern command intentionally runs only the one lightweight test; other tests in that file construct World and were NOT run. Compile is write:false/publicDir:false, not a deployable bundle or HTTP check. Integrator owns one final package; no independent remote/main/Pages write or user-acceptance counter change.

Final three-base memory compiles each597modules/exit0; see VERIFICATION.json. Runtime source bytes still match those build fingerprints at freeze. No production package was emitted. Completed within the30-minute box; branch/worktree retained for sole integrator.
