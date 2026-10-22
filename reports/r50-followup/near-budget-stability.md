# R50 stable near-LOD submission quota

## Scope and cause

The previous `selectCharacterBudget` implementation limited visible populations to 64 (desktop/high) or 32 (low), but did not limit complex LOD0 submissions. The reproducer submitted 38 LOD0 actors from the real 38-role registry, and 64 LOD0 actors from a test-only 96-role population.

Only `CharacterLOD.js`, `CharacterManager.js`, the new `p3c-near-budget.test.mjs`, and this report are part of this fix. The required registry, rollout gate, geometry factory, renderer, pool, system, buildings, `main.js`, configuration and older tests are unchanged by this fix. No new production actors are added or enabled.

## Selection policy

- Keep the existing visible-population selection and court/core priorities. Desktop/high submits at most two LOD0 actors; low submits none. Additional near candidates render at LOD1 rather than disappearing.
- Within the same priority, each prior submitted LOD0 ID receives a one-metre distance discount. A challenger must be strictly more than one metre closer to displace that incumbent. At the exact threshold, the incumbent wins. First allocation uses distance then ID; higher priority always precedes distance.
- The ranking is one transitive sort key, so results are independent of input iteration order. It does not use frame randomness, cooldown timers, or animation-phase resets.
- `CharacterManager` remembers only actual prior-frame LOD0 submissions. Frustum/distance/visibility/support exits and low quality release the slots. Revision changes, disable, approval gating and disposal clear the relevant history. Hidden frames preserve the pause; resumption rechecks current eligibility.
- Geometry-distance `state.lod` remains separate from the submitted budget LOD. Existing 12m/40m hysteresis, bindings, readiness fade and animation continuity are unchanged by a quota switch. A genuinely new support still restarts readiness as before.

## Cost and tradeoff

One bounded extra sort of at most 64 selected candidates, one small ID set (at most two entries), and shallow copies for demoted submissions are added per update. The extra sort has O(n log n) cost, with n <= 64. The one-metre hysteresis deliberately allows a same-priority incumbent to remain detailed when a challenger is up to one metre closer. This avoids fine camera/actor movement repeatedly changing detail ownership, while larger distance advantages and priority/eligibility changes still take effect immediately. Visible-population ordering remains the original ordering.

This is not a fade between geometry resolutions: a warranted LOD switch still changes geometry, but does not restart the actor's readiness or binding lifecycle. Frozen candidate06-06 sample assets are not modified by this fix. Runtime views containing more than two geometrically near actors now intentionally show the excess at LOD1; that is a runtime appearance policy change, not evidence of a new approved visual sample.

## Verification

Before implementation, all 13 new tests failed for the missing cap/stability behavior; the real Manager/Renderer cases reported 38 and 64 near actors rather than two. After implementation, all 13 pass.

Real `CharacterManager -> CharacterRenderer -> CharacterResourcePool` instance geometry checks establish:

| Logical actors | Quality | Visible | Actual LOD0 instances | Actual LOD1 instances |
| --- | --- | --- | --- | --- |
| 38 required | high | 38 | 2 | 36 |
| 96 (58 test-only extras) | high | 64 | 2 | 62 |
| 38 / 96 | low | 32 | 0 | 32 |

The emperor remains LOD0 in the clustered high-tier cases; every required actor remains selected in high. Low retains the original 19 court roles, including six officials per side. The pure selector leaves frozen inputs, the registry and caller history unchanged.

The new tests also cover deterministic ties, repeated 0.1m jitter, exact 1m and >1m thresholds, priority preemption, genuine LOD switches, missing support, ready-to-ready revisions, frustum exits/re-entry, disable/enable, approval gates, hidden/resumed frames, quality transitions, 12m/40m hysteresis and readiness/binding continuity.

Light regression command:

```sh
node --test tests/p3c-near-budget.test.mjs tests/p3c-runtime.test.mjs tests/p3c-readiness-fade.test.mjs tests/p3c-data.test.mjs tests/p3c-renderer.test.mjs tests/p3c-system.test.mjs tests/p3c-female-runtime.test.mjs
```

Result: **67 tests passed, 0 failed**. The data regression also checked the frozen architecture source manifest. No full-world build, browser visual run, WebGL draw, GPU timing, FPS claim or whole-project performance benchmark is included. Aggregate triangle/draw-call budget evidence is supplied by the separate render-budget test/report, not inferred from multiplying 64 high-detail samples.
