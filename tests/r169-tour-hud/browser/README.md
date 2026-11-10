# R169 independent HUD browser check

Status at handoff: fixture compilation passed; **the real browser matrix has not run**. In the authoring environment Chromium exited before any page with `ProcessSingleton socket() failed: Operation not permitted (1)`. No UI screenshots or rectangles have yet been obtained. Do not mark this check passed from compilation or simulated DOM tests.

## Run once on the exact frozen candidate

From any working directory, use the path to these files in the checked-out repository. The scripts derive the repository and its npm dependencies from `import.meta.url`, not the shell's current directory. No source copying, product patching, or external website is needed.

Dependencies already locked by the repository:
- Playwright 1.64.0 and its matching Chromium.
- Vite 5.4.21; Three 0.162.0.
- Chinese glyphs: Noto Sans CJK SC/TC, provided on Ubuntu by `fonts-noto-cjk`.

On the authorized CI runner, prepare dependencies with `npm ci` and the official Playwright command `npx playwright install --with-deps chromium`. If needed, install the recognized Ubuntu font package `fonts-noto-cjk` through the CI runner's normal package setup. No installation was performed by the independent reviewer.

Run from the repository root:

```sh
for file in tests/r169-tour-hud/browser/*.mjs; do node --check "$file"; done
node tests/r169-tour-hud/browser/build-fixture.mjs
EXPECTED_COMMIT="$GITHUB_SHA" node tests/r169-tour-hud/browser/check-layout.mjs
```

Outside GitHub Actions, replace `$GITHUB_SHA` with the exact expected commit, or omit `EXPECTED_COMMIT` for local diagnosis. The script records the actual HEAD and fails before browser launch if it differs from a supplied expectation.

The check starts and closes its own Vite server on `127.0.0.1:4179`. Do not start `server.mjs` separately for this command. For manual inspection only, `node tests/r169-tour-hud/browser/server.mjs` exposes the same local fixture. Default Chromium comes from the installed Playwright package; `CHROMIUM_PATH=/path/to/an/already/installed/chromium` remains available. `chromiumSandbox:true` is explicit; there is no `--no-sandbox` fallback. A sandbox admission failure is a blocker, not a layout pass.

Artifacts to upload even on failure:
- `tests/r169-tour-hud/browser/evidence/results.json`: actual browser version, source commit/file hashes, assertions, errors, and rectangles with center hit-tests.
- `tests/r169-tour-hud/browser/evidence/*.png`: browser screenshots for reached states.
- `compiled-fixture/` is compilation output, not browser evidence. Generated paths are ignored by this directory's `.gitignore`.

Exit 0 means the actual run reached all planned assertions with none failing; exit 1 means an assertion failed; exit 2 means execution was blocked. Inspect `results.json`, not only the command's exit status. The harness had not yet been debugged end-to-end at handoff, so a harness error must be reported and corrected explicitly rather than weakening product assertions.

## Scope

This fixture imports the real product CSS and UI modules without substitutions: LanguageControl/TourHudLayout, HelpPanel, SettingsMenu, Minimap/PlaceInfoPanel, DayNightPanel, FirstPersonControls/VirtualJoystick, TourLocalization, and preference stores. Only the main app's wiring is reproduced. It creates a Three Camera and a real map 2D canvas, but no World, renderer, physics update, palace asset loading, or full tour. `--disable-gpu` is for this DOM test only and proves nothing about floor flicker or GPU rendering.

One Chromium, serial contexts:
- PC 1280×800, Chinese and English. Location → settings → help; language top-right above clock.
- Touch 390×844 with safe-area top 47/bottom 34, and touch 360×740. Actual controls are measured against joystick, jump, look-lock, and map preview.
- Touch 844×390 with safe-area left/right 44 and bottom 21.
- Tablet touch 810×1080 and 1180×820: map-preview center remains hit-testable and clear of the right dock; these cover the >768px/>600px cascade found in independent review.
- On 360px phone and 844×390 short landscape only: expand real help/clock disclosures, tap auto-scrolled Apply/restore/close, verify callback execution and summary focus return.
- Native language-select keyboard activation; launcher Enter/tap; modal Escape/focus return; explicit language/quality/performance persistence and reload.
- Actual map open, detail, travel callback with the original Chinese navigation key, compact twice, map close, and original-launcher identity. Normal/detail close and compact controls must pass center hit-tests.
- Help focus → map open/close → microtask → focus remains help; actual MutationRecords must show no detached help node. A focused map settings launcher must retain focus after returning to the HUD.
- 360 portrait → 740×360 → 1280×800 width → 360 portrait. This remains the same touch context, not a new PC device.

This does not establish physical iOS/Safari behavior, full main-app movement/flight integration, all font variants, or resolution of the older 390px map issue.

## Concrete source-review cases to retain

These were identified by source review, not by a completed browser run. The author has since added whole-dock map hiding and minimal-move/focus restoration; runtime acceptance remains pending:
- `src/ui/TourTools.js`, generated `#tour-tools-style`: only `body.map-open #tour-tools[data-map-preview=true]` hides the complete right dock. Desktop has no mobile map preview.
- `style.css`, bilingual-control section: `body.map-open #tour-language-control` hides only the label, retaining its space in the right dock.
- `style.css`, top-HUD rules: `body[data-tour-hud="top"] #tour-tools` is fixed top/right at z-index 9200, while the centered `#minimap` is z-index 1000 from `Minimap.init()`.
- `src/ui/Minimap.js`, `#minimap-close`: the real close button is in the map and is moved into its detail header.

The check measures `#minimap-close` and asserts its actual center is unobstructed in both normal map and detail states. Retain failures and screenshots; the product's single author decides the narrow fix. Do not change selectors or ignore failures merely to get a green result.

Tablet case: the default top-HUD rule `body[data-tour-hud="top"] #tour-tools` has greater specificity than the prior generated preview rule. Preview avoidance must also cover widths >768px and heights >600px, not only the phone media queries or short landscape rule. The new 810×1080 and 1180×820 assertions must stay enabled.
