# R49B independent global release-scope review

Verdict: no new blocking implementation defect found in the bounded CPU review. Release is still conditional on final frozen full-regression failure attribution and final build. This is not all-building photographic or GPU acceptance.

## Fresh independent evidence

- Local R49 baseline: 92cf31ec1779d0d6266a2caa6ad1708c379d1500. Remote R49 SHA was supplied by the owner, not reverified here.
- Final targeted command `node --test tests/r49b-*.test.mjs`: 44 passed, 0 failed/cancelled/skipped, exit 0. Includes the late Yangxin source profile. Output: `r49b-global-independent-review/targeted-final.tap`.
- Built 145 named zone `hall`/`gate` records, compared candidate and baseline: 77 hall + 68 gate records, 136 registered panel/backing pairs. All exact pairs remain valid; no count changed. Two dedicated city gates and static/custom plaques are outside this registered subset.
- After excluding only the exact registered plaque objects and the two already approved canopy subtrees, all non-plaque mesh transforms, materials, indices and vertex-attribute hashes match R49. Walkables and rooms match everywhere. Only the already approved Chonghua column collider height changes its collider hash. No hall/roof/facade mutation was found elsewhere.
- 87 zone mounting changes = 29 source-specific objects + 58 generic gates. Adding Taihe Gate and Kunning Palace gives 31 specific mount changes. All 58 generic gates retain y and panel size: only depth moved.
- Five horizontal forms, including Xianruo absent from the four-name glyph regression, each passed two fresh mixed horizontal/vertical small-scene lifecycle checks. Actual merged coordinates/UVs exactly match their source panels, each plane retains six triangle vertices, horizontal and vertical materials remain separate by UUID, right-to-left glyph calls stay on one y line. All owned resources are disposed exactly once, including 20 new atlas textures. These small scenes add one synthetic vertical companion panel, and are not full-zone reload or GPU tests.
- Taihe Gate and Kunning Palace explicitly fit to 0.76514043898 and 0.79429691563 of original dimensions. Huangji and Cining retain scale 1. The helper refuses a scale below 0.7 and publishes retained/fitted dimensions with model-fit status. No silent/progressive resize was found.
- Yangxin retains face 1.32 × 2.2 and z=-6.6; y moves 6.847 → 7.304. No other Yangxin mesh or navigation geometry changed.
- `git diff --check`: exit 0.

## Count/claim boundary

157 means audit ledger records: 77 named zone halls + 74 named gate/site records + 6 additional static-axis halls. It does NOT mean 157 physical plaques or 157 photo-verified passes. The gate ledger itself includes 2 demolished sites, 72 modeled gate entities and 71 physical gate plaques. Jingfu has two registered plaques; several halls have none in CourtKit or use dedicated objects. The frozen source helper has 25 profiles; the finished-mesh multiview reports have 29 objects.

Do not turn source profiles, local CPU rays, no-intersection inequalities or the complete ledger into historic dimension verification. The 58 generic gate corrections certify removal of known backing/structural-box overlap only, not historical mounting height or facing. Natural lower-roof, nearer-beam and column occlusion remains valid. Far-courtyard rays use local-building context, not complete-city walking geometry.

## Required before release

1. Finish the final frozen root/current-state runs and classify every failure against the frozen R49 baseline. Complete a build after the late Yangxin change. Earlier `build-current.log` alone predates the freeze. Resource-terminated or initial fixture-incompatible runs are not passed evidence.
2. Use an explicit publication manifest. Include all three new source modules imported by production. Do not accidentally stage node_modules, __pycache__, unrelated files or reviewer scratch. Keep rollback, main and R50 untouched.
3. Label this a scoped correction with unresolved items, not complete real-scene verification.

## Residuals to retain explicitly

- Kunning Gate orientation is a distinct unresolved item: official north-facing evidence vs model default south, as identified in the gate source audit. The generic depth-only correction does not address it.
- Five specialized side gates with insufficient or incorrect header bands, Fengxian roof-tier mismatch, Yangxing door/window-top versus canopy, Wenyuan high upper window, and Juanqin/Ningshou/Leshou/Fanhua high inner transom relationships remain open. The five profile residual flags are present; evidence-missing plaques must remain separately identifiable.
- Historical carved frames, complete scripts and calligraphy remain simplified. Source photos do not provide measured dimensions or concealed join details.
- Minor stale comments describe “three” double-eave plaques and retained size despite the expanded explicit fitting list. Canopy cap wording must not be interpreted as a proof of every individual mesh being manifold. These comments do not change the actual verified behavior.

## Evidence and limitations

Full machine-readable result and hashes of the 11 changed/new production files: `r49b-global-independent-review.json`. Reproducible scratch evidence: `r49b-global-independent-review/inventory-and-scope.json`, `atlas-lifecycle.json`, and scripts.

The prior two-canopy independent review was read rather than duplicated. Its 70,389 repaired-surface probes, sections, cap concealment and navigation analysis remain the detailed canopy evidence. This review did not rerun GPU/browser, attempt denied browser work, test R50, or verify remote publication. Official-photo source audits were used for their stated coverage and residuals, not relabelled as new pixel inspection.

Two initial oversized reviewer runs ended with exit 137; they are not accepted evidence. The subsequent memory-bounded sequential inventory comparison and ten small atlas scenarios finished successfully. Production code, project tests and source evidence were not edited by this reviewer.
