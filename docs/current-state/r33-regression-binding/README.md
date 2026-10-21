# R33 exact historical and current-state bindings

Date: 2026-10-20. Implementation checkpoint: `21472ee195555bd6438a94634c93fe183d24f977`.
Final source candidate: `c5a1cc2f27a652f4a1233e0a308858cbb9c9965d`, adding the reviewed Chuxiu frontage closure; the resident scene is unchanged by this streamed-zone correction.
Independent R32 baseline: `1fb85925f7ab6358661df9a1ac564ad70013d7f7` (the parent verified its tree against remote `ce8915ab`).

The regression binding changes edit tests, new test fixtures, and validation documentation. The separately committed Chuxiu closure fixes four facade gaps. Original pre-R33 frozen fixtures remain unchanged. No upload, main-branch merge, Pages deployment, or browser state change is represented by this receipt.

## Scope and exact boundaries

- Source registry: 13 modified files, 37 unique exact reverse hunks, 4 added text/source/provenance files, and 2 independently hash-bound GLBs. All 135 prior frozen fixtures retain their original hashes.
- Product inventory: four explicit new runtime paths. Existing R32 inventory continues to mean its original 18 paths. No directory-level exemption or binary substitution was added.
- Scene registry: independent before/after executions of the full permanent resident `PalaceBuilder` capture. Its 35 exact field/splice changes include one positional collider splice of 57 old entries to 75 new entries. Every complete input, ordered part, and restored baseline is hash-bound; runtime sidecars also bind JSON-omitted values.
- Historical module execution: stored independent R32 source bytes for 11 changed source/config files plus 169 retained source hashes. Older R32 screen/frieze/crest source overrides remain independently bound by their unchanged original fixtures. Historical builders now execute those dependencies instead of accidentally importing live R33 dependencies.
- Unknown hashes, partial reversals, extra/omitted/reordered rows, same-count geometry changes, altered material/budget/navigation values, non-index array fields, omitted values, and negative-zero mutations fail closed.
- Current R33 acceptance remains raw. Historical tests explicitly project only exact registered R33 identities to their original epoch; the old tests do not establish acceptance of new behavior.

Registry SHA256 values:

- `r33-source-delta.json`: `31f70c59c0841453ff0987c1b7fbd0f71ae696ca8f3d249b68f01981dde18158`
- `r33-scene-delta.json`: `0bf0b4c638f63f997b787b53aace34f827abe6ed0687e9f226832d98f3de73e9`

## Failure classification

The earlier premature shared-tree run reported 939 passes and 55 failures. Eighteen were the Kunning test document stub lacking `createElementNS`; the other failures were frozen source/scene/inventory identities receiving later product bytes. The test-only image stub now provides only event-listener methods. It does not simulate a successful texture load or browser rendering.

The complete checkpoint run additionally exposed a mixed-epoch Qianqing optional-asset expectation: the test expected R32's 6,512 triangles and 4 visible meshes while loading R33's intentional 5,408 triangles and 2 visible meshes. That old expectation is preserved exactly in an explicitly historical R32 asset test using the retained GLB and independently executed R32 builder/contract. The raw R33 lifecycle test continues to check the new asset and all 27 proxies. No product defect was found in those mixed-epoch assertion failures. Independent geometry review separately found and fixed four open strips in the recessed Chuxiu frontage (commit `c5a1cc2`); dedicated bidirectional ray and collision regressions cover the closure and the preserved entry.

The remaining Taihe R13 fingerprint mismatch was also a historical dependency leak: the frozen older builder imported the live R33 plaque profile through unchanged modules. Its two Taihe entry points now execute independently hash-bound R32 dependencies. Original expected geometry hashes remain unchanged.

## Raw resident capture and flight evidence

R32 to R33:

- Triangles: 209,827 to 210,859, a net addition of 1,032
- Geometry bytes: 20,375,372 to 20,474,444, a net addition of 99,072
- Meshes: 178 to 178; graph nodes: 207 to 207
- Materials: 93 to 93; textures: 25 to 25
- Colliders: 2,827 to 2,845; walkables: 230 to 230
- Only the 三台 and 后三宫 scene-group identities change. All other resident scene-group records remain byte-identical. The complete material records and walking surfaces remain byte-identical.

All 331,250 actual `FlightEnvelope` roof-height cells and water cells are byte-identical between independently executed R32 and raw R33 static resident scenes. The 2 m grid, clearance, bounds, and maximum height remain unchanged. Maximum height: 42.14738519287109.

- Height array SHA256: `2763af62eed70536591a69d5b521d5d19c9c1d4f6659075a9bbf3006c9a8fdeb`
- Water array SHA256: `2038aea262d71f8137b8b93f55870cb8e1e3bf854ab6b79fb72905d6b7c0e0af`

This capture covers the permanent resident scene, including both LOD levels. It does not claim full-world budgets, streamed Chuxiu-zone geometry, optional GLB costs, texture-download success, screenshot agreement, or visual approval. Those product-specific boundaries remain in the raw R33 tests and the parent evidence.

## Validation receipts

- New raw R33 source/asset/inventory/mutation checks: 25/25 passed
- Current-state source-only checks: 286/286 passed
- Focused R25–R30 historical inventory/provenance assertions: 7/7 passed
- Kunning route checks after the narrow fixture repair: 18/18 passed
- R31/R32 historical scene checks: 27/27 passed
- New raw R33 scene and mutation checks: 6/6 passed
- Static FlightEnvelope equality check: 1/1 passed
- Qianqing material checks after the explicit historical-asset correction: 5/5 passed
- Independent regeneration reproduced the new scene registry byte-for-byte
- `git diff --check` passed; tracked product files equal reviewed candidate `c5a1cc2`

Final complete current-state run: `node --test --test-concurrency=2 tests/current-state/*.test.mjs` passed 1,170/1,170, zero failures/skips, exit 0, 259.6 seconds. This is the complete package-script file set with bounded concurrency. Final raw R33 JavaScript checks passed 38/38, R33 Python regeneration/mutation checks passed 4/4, and the production build passed. Broader historical tooling limitations remain separately disclosed in FINAL-VALIDATION.

## Reproduction

Normal tests do not require Git history. The fixture and strict helper contain all required historical evidence.

Optional evidence regeneration requires both named Git commits. Extract the baseline source, data, package, and test capture helpers into a separate temporary directory, provide its existing `three` dependency, and independently capture baseline and current trees with:

`node tests/lib/r33-capture-scene.mjs <absolute checkout root> <capture-output.json>`

Then generate into a separate output path and compare before replacing anything:

`node tests/lib/generate-r33-scene-registry.mjs <baseline-capture.json> <candidate-capture.json> <registry-output.json>`

The generator reads exact named Git blobs. It does not modify product files or select an implicit HEAD baseline.

## Final integration status

See [FINAL-VALIDATION](../r33-spatial-fit/FINAL-VALIDATION.md) for the authoritative current run, supported R33 asset regeneration, pre-existing historical tooling failures, and unverified browser/GPU/mobile limits. Interim logs above are retained provenance, not the final release claim.
