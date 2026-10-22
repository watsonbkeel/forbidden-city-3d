# R52 release identity and safe local packaging

Scope: deterministic release/build/source identity, a small settings disclosure, and guarded local packaging. This branch does not alter world geometry, character counts/behavior, game time, credentials, main branch, or deployment. The frozen R51 production package and release/r51 support files remain unchanged.

## Implementation

- release.json is the release source; Vite generates one metadata object shared by loading HTML, compiled JS and dist/build-info.json.
- Build ID depends on release, deterministic runtime-input content fingerprint and base, not the commit hash or wall clock. The manifest separately retains build-time commit and dirty state as provenance.
- Fingerprint includes index.html, main.js, style.css, src/, data/, public/, package manifests, Vite config, release.json and the metadata generator. Outputs, tests, reports and git metadata are excluded. Untracked runtime inputs are included.
- Settings show the build identifier immediately; copy/check controls are inside a compact disclosure. Diagnostics allowlist build fields, validated HTML build ID/match status and dynamic character registered/ready (= loaded)/visible/pending/errors counts. They omit page URLs, query/hash, world position, error strings and arbitrary snapshot fields.
- Mixed HTML/JS identities produce a persistent visible warning. No diagnostics are sent anywhere; copy uses the clipboard only on click, with a selectable fallback on denial.
- Version checks occur only on click against same-origin, same-base build-info.json, using no-store, omitted credentials, no referrer, redirect rejection and an 8-second abort. No background polling. Network or metadata errors leave the tour unchanged and can be retried.
- A differing server build exposes an explicit refresh button with a position-reset notice. There is no automatic reload, cache deletion, storage deletion or service-worker manipulation.
- The generic production packager verifies current source fingerprint, release, base, matching HTML identity, and an existing local compiled JS entry containing the same build ID/fingerprint before creating output. It preserves actual built provenance instead of labelling old dist with current HEAD. Existing output paths are rejected to retain rollback packages. The old R51 command delegates to this guarded path.

## Verification

Final focused command:

    node --test tests/r52-*.test.mjs tests/settings-menu.test.mjs tests/settings-inputs.test.mjs tests/r51-character-ui.test.mjs tests/r51-production-visibility.test.mjs

Result: 55 tests passed, 0 failed.

This includes real Vite production compilation at both / and /forbidden-city-3d/, shared HTML/JS/JSON identity checks, production removal of fallback/dev-only identifiers, same-base asset checks, and local HTTP verification of Cache-Control: no-cache. It also includes actual SettingsMenu input/lifecycle tests and the existing complete main/characters CPU integration seam. Those CPU/DOM checks are not browser/GPU visual acceptance or mobile performance certification.

Red-before-green coverage includes missing metadata generation/UI, stale-source packaging, the legacy packager bypass, compact disclosure/focus fallback, HTML/JS mismatch, and mixed old/missing compiled artifacts. Compiled-output tests caught and prevented an initial Vite define timing issue; the CPU main test caught and prevented a configFile:false fallback regression. Both are fixed and green in the final focused command.

The repository's configured broad command, npm run test:current-state, remains red on the frozen starting commit. The untouched fac791 baseline produced 1013 tests: 895 pass / 118 fail. The candidate comparison before the final review additions produced 1027 tests: 911 pass / 116 fail, with no newly named failures; two previously failing module loads ran further. Most failures are inherited historical source-retention/hash contracts. All failure names and exact counts are in current-state-comparison.json. This is not a claim that the whole repository passes. The broad suite was not repeated after the final isolated review additions; the complete affected focused set above was repeated.

Vite continues to emit the inherited large-chunk warning; no unrelated code-splitting was introduced.

## Integration and commands

Cherry-pick the supplied commit into the single R52 integration branch. main.js adds only a lazy statusSnapshot getter; SettingsMenu adds only the isolated panel import, option, mount and disposal.

Root/local production:

    npm run build
    npm run package:production -- /absolute/new/package-directory

The packager accepts only / because the included local server serves root. To verify a prospective subpath build separately:

    npm run build -- --base /forbidden-city-3d/ --outDir /absolute/new/subpath-dist

Do not package that subpath output as a root local package, and do not deploy it from this task. Rebuild root dist after integrating any runtime changes. Final source/build identity is generated from the integrated R52 inputs, not this isolated branch's pre-integration metadata.
