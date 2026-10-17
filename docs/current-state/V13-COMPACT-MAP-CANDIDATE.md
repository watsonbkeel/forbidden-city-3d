# V13 compact walking-map candidate

Status: isolated UI candidate on frozen runtime `9799e7efd281076c8325258ffb5ddaa2dced86c4`. CPU/DOM checks passed; native browser/layout acceptance, build and aggregate regression are still pending owner allocation. This document is not a V13 release acceptance or deployment record.

## User-visible change

- Opening with M or the existing mobile preview still shows the existing full map focused on the player.
- “收起到角落” keeps the map logically open, preserves current zoom/pan exactly, and leaves walking active. “展开地图” restores full presentation without reopening the map.
- Compact view retains pan, pinch and wheel zoom. Small-map taps cannot teleport; “展开后可传送” explains that full-map labels and quick-travel controls remain the travel interface.
- The original “结构研究预览” disclosure/settings entry stays available beside expand and close. Its DOM node, event handlers, settings pause and close behavior are unchanged.
- A readable eight-direction heading uses the existing camera direction (+Z north, +X west). Heading DOM text changes only when the compass sector changes.
- Compact width is 240px on desktop and 220px on touch. Touch landscape reserves the original 164px left/right control lanes. When insufficient canvas height remains, a compact control strip replaces the canvas, with expand/settings/close still present.
- Closing uses the existing lifecycle; the 118px closed mobile preview stays a separate state. The next opening starts full-size again.

## Scope and safeguards

Runtime changes are limited to `src/ui/Minimap.js` and `style.css`. No changes to `main.js`, MapTourSession, SettingsTourSession, SettingsMenu, FirstPersonControls, VirtualJoystick, physics, historical fixtures or source-delta baselines. Layout switches cancel only map captures and pending map-button taps. They do not call the open/close lifecycle or reset held movement.

Hidden full-map sections use both `hidden` and `inert`, restoring their prior state on expansion. If a hidden section owned focus, focus moves to the size toggle. Compact travel is blocked in the actual label-click path, not only by hiding travel controls.

## Verified here

Initial map input/gesture baseline: 48/48 passed. New collapse/heading tests were first observed failing because the new control/heading did not exist. A subsequent hidden-canvas recovery test first reproduced an incorrect 400px fallback width, then passed after measuring canvas width after visibility/layout changes.

Final focused command (135 tests, all passed):

```sh
node --test tests/map-compact.test.mjs tests/map-inputs.test.mjs tests/map-gestures.test.mjs tests/settings-menu.test.mjs tests/map-source-delta.test.mjs tests/gate-map-source-disclosure.test.mjs tests/current-state/qinan-exterior-navigation.test.mjs
```

The 16 added tests exercise held keyboard/joystick continuity and run timing, exact `{k,cx,cy}` preservation, close/reopen and preview distinction, hidden/inert/focus behavior, original settings pause/resume, compact-tap travel rejection, full-map travel, pan/pinch/wheel, pending-touch cancellation, compatibility clicks, short viewport fallback/recovery, and camera heading sectors without redundant writes. Existing source guards pass unchanged. `git diff --check` passes.

The DOM fixture declares geometry and does not emulate native CSS layout, hit testing, focus traversal, touch synthesis or rendering. Its viewport-budget tests are not screenshot or touch-device acceptance. Focused logs are in ignored `outputs/v13-compact-map/`.

## Required ordinary browser checks after allocation

Use the normal entry and visible controls, without debug teleport, hidden state injection, or changing the scene camera directly.

1. Desktop, at least 1280×720 and a short viewport: enter normally, hold W/ArrowUp, press M, use the visible collapse control, and repeat collapse/expand while holding movement. Confirm the same zoom/pan, uninterrupted walking, visible world, no unintended lock, and release stopping movement. Pan/zoom, then toggle presentation again. Check N/E/S/W heading against natural camera turns.
2. Keyboard accessibility: Tab through full and compact map controls, activate expand/close/settings with Enter/Space, and verify hidden quick-travel/zoom controls cannot receive focus. M closes compact mode once; reopen is full-size. Confirm denied pointer-lock close still leaves the normal resume UI usable.
3. Touch at 390×844 and 844×390: use the closed preview to open, hold joystick with one finger, use collapse/expand with another, and drag/pinch compact canvas with independent contacts. No unexpected teleport, lost joystick, stuck movement or duplicate activation. Confirm the left joystick and the landscape right look/jump lane remain uncovered and actually accept touches.
4. At each size inspect all three compact actions. Each must be at least 44×44 CSS pixels and completely reachable. Check safe-area emulation, especially landscape insets, and the readable hint/heading. Short 844×240 should show the explicit control strip, not clipped controls. Resize back and verify the restored canvas uses correct pointer coordinates.
5. Open the original disclosure from compact mode while moving. Settings must pause motion and jump, retain all disclosure content, and require fresh movement input after resume. Close the compact map and confirm the same settings launcher returns to its normal page location.
6. Full-map regression: label and quick-travel teleport remain functional; drag, canceled/lost capture, and multi-touch overlap never become teleport. Qin’an still uses its ground exterior viewpoint and existing limitations.

Before release, integrate onto accepted V12, rerun the focused command, then obtain owner allocation for the existing build/full regression and ordinary desktop/touch QA. Preserve known prior warnings and limits; this candidate does not establish new scene performance or geometry accuracy.
