# Experimental finial contact blocker: do not integrate additive caps

Parent visual-helper commit: `a2fa231681849e9d540dc532604deaef466c3476`. Its geometry-only / zero-collider evidence is preserved unchanged. The helper was not integrated into the current game scene. This document is a static diagnostic, not a canonical progress queue.

## Actual controller reproduction

Local original bridge fixture plus the experimental caps, actual `FirstPersonControls`, original jump/gravity/player parameters, ordinary W input, original river guard, no changed actor position after initial spawn and no artificial per-frame movement attenuation:

- Bridge `inner-jinshui:bridge-2`, side −1, post index 0, at x=−15.94, z=−320.3.
- W is held 0.3 seconds while jumping from the existing deck 1.5 m inside the rail. The controller then settles for four seconds.
- At 10 Hz: stable feet 1.445 m, actual ray-hit cap surface 1.552215 m, penetration **0.107215 m**.
- At 60 Hz: stable feet 1.445 m, actual ray-hit cap surface 1.552050 m, penetration **0.107050 m**.
- A second real-controller path first jumps onto the original rail 0.5 m along Z from the cap, settles, then walks onto the cap. It reproduces **0.106867 / 0.106877 m** penetration at 10/60 Hz.
- The original rail support is 1.445 m here, not the post's 1.3325 m: its sampled slope envelope is higher than this actual shaft top. This old overestimate must not be mistaken for new correct contact.
- A bridge-middle lateral-jump attempt is blocked by the existing river guard; it is not evidence that the middle cap is reachable. The successful end-post reproduction above keeps that guard enabled.

`contact-red.txt` preserves the two failed no-penetration assertions. `zero-contact-jump-10hz.json` and `zero-contact-jump-60hz.json` preserve those exact traces. The six later diagnostic tests intentionally assert that the bug/counterexamples reproduce. **Their passing result is not a green contact fix.**

## Rejected local proxy candidates

1. One full bounding box per cap can catch descending feet at apex height, but the existing `supportHeight` expands its effective region by a square r=0.3 footprint. At cap-relative (0.4, 0.4), the nearest footprint point is radius 0.1414 m, outside the cap's entire 0.125 m radius, yet the AABB falsely holds the controller at the apex.
2. A non-rescue flat walkable confined to the cap AABB avoids rescue from ordinary deck height, but at radius 0.124 m its apex-height plane floats more than 0.17 m above the actual low collar triangles. This is not faithful contact.
3. Cap height 0.22 m is below existing body collision clearance 0.35 m. A solid bounding box alone does not fix walking from the original rail top into the cap; a top above feet+0.05 is also excluded from `supportHeight`.

No such proxy, support patch, controller change, shared Collision/Kit edit, source reshaping or main-world hookup is made in this followup. Existing APIs provide rectangular boxes and X-only/Z-only ramps; the rotated cap faces generally vary in both coordinates. No exact curved-support claim is made.

## Disposition

Keep the additive visual helper unhooked. The integration owner agreed not to enable it in the first internal batch. The next independent prototype may replace the top of each existing fitted shaft instead of increasing its total height, only after checking source proportions, upper-rail overlap and the inherited sloped-collider envelope. That prototype is a separate decision, not a claimed fix here.

Run the bounded blocker verification:

```sh
node --test tests/current-state/inner-jinshui-finial-contact-blocker.test.mjs
```

It does not build the world, launch a browser or certify gameplay/WebGL acceptance.
