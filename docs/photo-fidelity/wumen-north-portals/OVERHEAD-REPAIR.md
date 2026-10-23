# Bounded north-head collision repair and same-W diagnostics

FC-AD4377DF51, 2026-10-22. This repairs the observed N2 jump defect without changing any arch vertex, center, opening width, crown datum, deeper tunnel, ascent, roof or route. It is local CPU/controller evidence, not browser acceptance or whole-world acceptance.

## Production boundary

The worker owns `WumenNorthPortal.js`, `OverheadShape.js` and these focused tests/docs. The integration owner alone edits `PalaceBuilder.js`, `Collision.js` and `FirstPerson.js`. `OVERHEAD-HOOKUP-PROPOSAL.patch` is the exact narrow registration patch. Three added Box3 objects are broad phase only, each limited to the existing northern 1.2 m band. The immutable `overhead` record contains type `piecewise-linear-x`, actual inner-arc points in world coordinates, minZ/maxZ, topY and a stable sourceId.

`cloneOverheadShape` rejects nonfinite or non-increasing points, wrong types, invalid box extents and mismatched x/z/y bounds, then deep-clones and freezes the record. Footprint queries interpolate clipped linear-segment endpoints and include every internal vertex; they return the minimum inner height across the full overlapping footprint, not its center or the box's lowest corner. Outside XZ overlap returns Infinity. Ninety-six ray samples match the actual mesh underside.

The owner-controlled integration adds exact narrow phase only for these marked shapes. New shapes use the full feet-to-eye envelope. Legacy unmarked boxes retain their existing STEP_CLEARANCE and eye-minus-0.05 policy. Thus the new branch protects the additional 0.05 m camera clearance; this is explicitly not conflated with the smaller original engine-body penetration. The owner’s upward feet limiter handles stationary jumps and has a 1 mm contact margin, no downward attraction and no changes on descent or absent shapes. Overheads are explicitly excluded from supportHeight, so they do not create a new walkable top at 12 m.

## Local integrated evidence

The actual owner `Collision.js`, `FirstPerson.js` and `PalaceBuilder.js` were copied read-only into an isolated verification directory with these modules/tests. No fake physics callback and no whole-world constructor was used. `integration-binding.json` records those exact source/test hashes. Shared source files are not committed by this worker.

- `shared-integration-green-final.txt`: 153/153 focused tests. This includes 80 real-controller jump routes, 38 N2 tests, 20 N3 tests, five shape utility tests, six bounded-registration/support tests and four reusable-helper tests.
- Jump matrix: 5/10/60/120 Hz × both directions × both central near-edge positions (x=±3.999) × stationary, moving, inward diagonal, outward diagonal and outside-band modes. All actual triangle/body contacts, full-height contacts and proxy contacts are zero; jumps remain enabled and land. The 5 Hz input exercises the real dt=0.1 cap rather than inventing a substep controller.
- At the exact stationary edge, the repaired 60/120 Hz maximum full head is 3.219355468 m, below the unchanged actual edge profile 3.220355468 m. Outside the head band, normal jump peaks remain: 60 Hz 3.491666667 m and 120 Hz 3.521527778 m.
- Low-rate outward diagonal north approaches can aim outside the aperture and slide along the original solid pier. The test checks zero penetration and full-body non-entry there, not an impossible guarantee that aiming outside must cross. The initial overly strong route assertion remains visible in `jump-outward-route-interim.txt` (four failures), not hidden as a production geometry failure.
- supportHeight is compared against the exact legacy collider/walkable set at six maxTop values including 12. The original walkable at 12.3 remains, with real 10/60 Hz upper-level walking. No new 12 m support is introduced.
- Default head bob is not disabled. At 60 Hz a real 0.25 s ground approach precedes straight/diagonal jumps in both directions. Residual bob magnitude reaches 0.036923 m. Actual camera-point clearance, measured against existing head triangles by vertical ray, is at least 2.035999 m across these four paths; zero camera penetration. Logical full-body checks remain separate. This is not a claim that the entire body has a two-metre gap: its outer edge has only the 1 mm limiter margin.

Original discovery reds are unchanged: `jump-red-original.txt`, `jump-original.json`, `jump-body-boundary-red-original.txt` and `jump-body-boundary-original.json`. Later staged reds include missing-shape integration, added-support regression and the missing reusable helper. Earlier green/interim logs remain historical snapshots, not the final bound run.

## Reuse with the owner's existing world

`tests/lib/wumen-north-jump.mjs` exports `captureWumenNorthHeadTriangles(W)` and `replayWumenNorthJump(t,W,options)`. Neither constructs a world, scene, collision manager, registration or renderer. Capture reads already-updated matrixWorld values and selects existing visible red/brick masonry triangles in the three head bands; it handles ordinary or batched geometry. It returns a reusable triangle array. The replay creates only its test camera/control, uses W.cm unchanged, drives real jump/update with a Node test clock, and restores DOM/clock listeners on completion. Normal CollisionManager query scratch boxes may change; scene/registrations do not.

```js
import {
  captureWumenNorthHeadTriangles, replayWumenNorthJump,
} from './tests/lib/wumen-north-jump.mjs';
// W is already built and its world matrices are current. t is node:test context.
const triangles = captureWumenNorthHeadTriangles(W);
const rows = ['stationary', 'walk', 'diagonal'].map(mode =>
  replayWumenNorthJump(t, W, {
    fps: 60, direction: -1, x: 3.999, mode, triangles,
    warmupSeconds: mode === 'stationary' ? 0 : 0.25,
  }));
if (!rows.every(row => row.pass)) throw new Error(JSON.stringify(rows));
```

Run suites only after the owner has applied the shared repair:

```sh
node --test tests/overhead-shape.test.mjs tests/wumen-north-overheads.test.mjs \
  tests/wumen-north-portals.test.mjs tests/wumen-north-portal-jump.test.mjs \
  tests/wumen-north-jump-helper.test.mjs tests/wumen-south-portal-canopies.test.mjs
```

The pure same-W N2 QA additionally requires exactly three validated, source-matching overhead profiles, real shoulder collisions, an open high central aperture, and clear probes beyond the bounded band. Its negative controls reject absent labels, drifted curves and treating the entire broad-phase box as solid. The fixture explicitly stages those three additions rather than silently recategorizing them as inherited physics.

No source photos, uploads, production ZIP, browser workarounds, full-world run, account or permission changes are included. Independent final review and integrated-world/browser acceptance remain with the integration owner.
