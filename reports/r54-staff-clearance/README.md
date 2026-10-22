# R54 staff clearance helper evidence

Base: `2e2a82b` (independent QA worktree). No production, actor, Kit,
architecture, release, main, upload or Pages changes.

## Contract

`evaluateR54StaffClearance({ registry, adapter: system.world,
resolvedBindings: [...system.manager.states.values()] })` consumes the same
already-built production world's **85 ready bindings**. Resolve them first using
the existing production flow. Re-resolve after zone unload/reload or other world
changes, then call the helper again. The helper does not build a world, call any
adapter method, step time, mutate inputs, or produce geometry/sample dumps.

It validates the fixed 77 retained IDs plus eight explicit R54 IDs; exact actor
and cached binding identity; matching adapter registry; optional manager revision;
cached resolved-path object identity, status, ID, specification, coordinate aliases
and generation; and ready surface support position/reference consistency. Other support
references are also checked. Missing, pending, duplicate, unexpected, demoted or mismatched records
produce `pass: false`, `status: 'invalid-bindings'`, errors, and no partial minimum.

Exactly **644 distinct pairs** are checked: 8 × 77 retained/new pairs plus 28
new/new pairs. Every segment of every involved resolved patrol polyline is checked
against every segment of its partner. Standing/seated bindings are point segments.
Full paths are conservatively retained for formation followers. Old77-only pairs
are excluded from this new rule. The threshold is fixed at **1.2 m horizontal
centerline separation**, independent of height, schedules, clocks, phases, priority,
LOD or same-time samples. This is not body-shell, obstacle, support or avoidance QA.

The analytical solver finds line intersections or the minimum of all four
endpoint-to-opposite-segment projections, including degenerate stationary points.
It uses ordinary IEEE-754 arithmetic, does not round distances or relax the
threshold, and rejects non-finite/out-of-range coordinates. Results are JSON-safe
summaries: global minimum with witnesses, minimum per new role, violation minima,
and pair/segment counts. No multi-megabyte trajectory samples are emitted.

## Verification performed

- RED: the initial unimplemented helper failed all eight initial focused tests.
- GREEN: `node --test tests/r54-staff-clearance.test.mjs tests/r54-release-coverage.test.mjs`
  passed 17/17 tests (13 clearance and 4 retained production-coverage tests).
- `node --check tests/lib/r54-staff-clearance.mjs` and `git diff --check` passed.
- Geometry cases include crossing, endpoint proximity, parallel/collinear routes,
  stationary degeneracy, all-segment interior minima, new/new and new/old pairs,
  fixed threshold, old-only exclusion, invalid identity/status/metadata, changed
  revision/cache/generation, malformed numerical data, compact serialization and
  input immutability.
- The unit fixture uses **one four-vertex synthetic floor**, real
  `CharacterWorldAdapter` resolution, no architecture or renderer. Actual
  `PatrolController` sampling independently demonstrates two crossing routes that
  stay more than 3.5 m apart on the same clock with an offset phase but correctly
  fail the swept-path check at 0 m. It also independently confirms an interior
  segment-to-stationary minimum. These unit worlds are not production evidence.

An independent read-only adversarial review identified two helper false-pass gaps:
coherently substituted shortened path objects and surface centers detached from
their original support. Both were reproduced by new RED tests, fixed with cached
path identity and support readiness/position checks, and included in the final
GREEN run. Neither finding concerned a production actor/route change.

## Preliminary coordinate triage, not production acceptance

Registry-only transforms of all85 roles gave 644 pair comparisons and no apparent
sub-1.2 m pair involving a new role. Nearest: retained `yongshou-consort-01` route
corner versus new `yongshou-eunuch-01`, **1.8027756377 m**. Next are the same consort
versus new `yongshou-maid-02` at 3 m and the two new Chengqian roles at 3.5 m.
This preliminary pass used nominal seat pelvis positions, not resolved bindings.

**Not run here:** a production full-world build/proof, reload production proof,
GPU/Chromium/browser, architecture/support/contact/render acceptance, or the
unbounded repository suite (there is no `npm test` script). The integration owner
must run the helper on its actual85 ready production bindings and after reload.
No production acceptance is claimed by this unit-test report.

## Follow-on generation freshness hardening

A direct integration review identified that checking only the numeric adapter
counter did not detect zone reloads or interior changes before the next manager
update. Three real-adapter negative cases reproduced false passes (RED): replacing
a loaded zone's group while retaining the counter/cache/state, deleting the loaded
zone, and changing interior token/state/group.

The helper now reconstructs the complete production generation string using only
existing `objectIds.get`, current loaded-zone/scene identity, and the interior
id/state/token/group list. It never calls `getGeneration` (which can register IDs)
or `getRevision` (which can invalidate caches). Unknown new groups and missing
loaded zones fail closed. Every actor's cached revision prefix must match this
current full generation plus its current physical epoch; path generation requires
full equality, not a numeric-counter prefix. This covers stationary roles too,
including when the caller omits the optional saved manager revision.

Final targeted run: **22/22 pass** (18 clearance tests plus 4 R54 retained-coverage
tests). Added cases also prove rejection when a replacement group already has a
production-assigned object ID, recovery only after the caller actually re-resolves
all85 bindings, and pure evaluation with all mutating adapter methods guarded to
throw if accessed. The helper leaves nextId, bindings, cache entries and adapter
query statistics unchanged. Only tiny one-floor unit scenes were used.
