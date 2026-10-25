# R79 discovery and documentation candidate

## Result and scope

Cumulative successor of R78 local `90baed334a6f13a70362282bf3333b6c2ce0e986`, with the 20 disjoint main additions reconciled from `8681116188288aed2db6eeb59cad5dd01cc0fe23`. The original common-R72 bytes were compared for each imported path before importing main bytes. Seventeen non-GEO paths remain exact main blobs; README and both llms summaries are the three authorized documentation replacements. No merge or write into main, deployment, external submission, credential change or deletion occurred.

The candidate provides a visible bilingual game introduction and links, readable HTML about/contribution pages independent of WebGL, truthful project metadata, canonical URLs, sitemap, optional llms summary, CITATION.cff, contribution guidance and reviewed cumulative release history. It does not guarantee indexing, ranking or AI citations. No ineffective subpath robots file or domain-root policy change was introduced.

README is the sole author's final reviewed draft, SHA256 `6b889df2b71db6d574e23b666c6bc715027a5c1a87ede7a1d0016b96c33a5eb6`. Historical R62 metrics are labeled historical and not remeasured. The announced canonical production address is not evidence that this candidate is publicly deployed. GitHub's citation button requires the file on the default branch.

## Exact source and build identity

Runtime SHA256: `74fc0d9ba9f14a81c3ad76f2afe7c83ed3a46c4d332a0b6e700ff730b24c23e6`.

Both builds came from committed source `3b8fd8400b0dff91f414307b220b497af9fffab0`, with runtime inputs clean. Root build ID `R79-4662ada520e7`; subpath build ID `R79-35a6d8f3a83d`. `build-verification.json` confirms HTML, JavaScript and build-info identity against current input bytes. Later report/test commits do not change these runtime inputs.

The strict successor allows exactly 12 runtime/build paths, rejecting unregistered changes, deletion and unknown old bytes. No world geometry, navigation, collision, NPC routine, eyes, lighting, map, flight or main.js implementation changed. Main's VITE_BASE handling, Pages workflow, COS scripts/dependencies and neutral SettingsMenu entry are retained byte-exact. The new introduction is inside the existing dismissible welcome overlay; anchors use the already retained link-input exclusion, and no new game overlay is added after entry.

## Executed verification

- 103 focused discovery, source-inventory, development/production preview UI, input, settings, map, release identity, household lighting, clock and sleeping-eye checks passed (`regression.tap`).
- The actual packaged launcher starts as R79 and serves readable HTML/plain-text/XML discovery content (`package-launcher.tap`), after correcting a retained R77 launcher label.
- Two actual local HTTP production tests passed: root and `/gugong/` HTML pages, linked local CSS/JavaScript assets, metadata files, build identity and real 404 behavior (`production-http.tap`). They are not GPU/browser rendering acceptance.
- Both Vite production builds succeeded. The pre-existing large-chunk warning remains; no performance claim is made.
- Full unchanged current-state suite: 1,290 tests, 1,139 passed, 151 failed. All failure labels exactly match R78, with no new or removed failures (`failure-comparison.json`, raw `current-state.log`). This is not an all-green suite.
- Independent review checked main blob preservation, README identity, CFF YAML, static links and input/settings contracts. Final artifact identity is separately checked by reviewer.

## Preserved old failures and successor explanation

The unchanged main `p3c-preview-ui.test.mjs` cannot resolve Vite's root-relative ReleaseIdentityPanel import from its data-URL harness. Its raw failure is preserved in `main-ui-baseline.tap`. The new successor harness rebases that one verified dependency to an absolute local module URL, without editing main's test or product module. Once loaded, one stale assertion expected guards-only night text; the actual unchanged main module uses all-day character wording. The first successor failure is preserved, and the successor explicitly asserts the current all-day text. All 40 preview/settings tests then pass (`ui-successor.tap`).

The unchanged loading-welcome legacy suite still fails its R15 main.js byte guard (`legacy-welcome.tap`). main.js and the test/retention helper are unchanged from R78. No historical fixture was rewritten to hide this failure.

## Delivery and remaining limits

One cumulative root production backup: 141 files, 49,130,617 bytes; manifest SHA256 `6cf58170b18e911bb0d1389779004b588ad0ae22cd2f6b8046c00300dd81845a`. The manifest records every file and exact built source. The root package and separately checked subpath build must not be confused. Existing generated output is retained, not deleted; the manifest includes retained build artifacts.

No browser screenshot is claimed. The preceding renderer launch restriction has not been bypassed or blindly retried. Welcome layout, keyboard rendering, GPU/mobile appearance, physical-device performance and live production routing remain unverified. The source websites and historical photos remain subject to their own rights; MIT applies as already stated by the repository, not as a new license for external materials.

Free disk after one backup was approximately 469 MiB. No local files were deleted. Future batches should await the parent's separately authorized cleanup audit rather than allocate another full worktree blindly.
