# F49 Construction-Reference Retention Implementation Plan

**Goal:** Let the released F49 construction branch be collected while its kit survives, without changing idempotence or scene output.

**Architecture:** Nested WeakMaps retain the committed-state marker at kit scope and the unchanged frozen record only at original mesh scope. Existing full checks remain after identity lookup. Missing committed identity is rejected.

**Tech Stack:** Existing JavaScript, Three.js 0.162, Node test runner; GC testing only uses Node's `--expose-gc` and WeakRef.

**Spec:** `docs/superpowers/specs/2026-11-06-tishun-reference-retention-design.md`

## Global Constraints

- Base commit `2544bab117846a7fd16175a0279e97190d28f549`; no old checkout/index/config/ref writes.
- One runtime file only; no source geometry, visual, route, feature, shared material or disposal policy changes.
- No new production browser API; no historical hash refresh; inventory stays 373/397.
- No upload, CI trigger, main modification or release. Full-zone/build resource windows must be coordinated.

## Review Focus

- Live kit after construction release must not retain the detached original frame.
- A same-value replacement mesh must not be mistaken for the committed original.
- A slot swap must still fail; restoring it must return the original record.
- An exception from old geometry disposal must never cause repeated disposal on retry.
- Source guards must admit only the precise new delta while rejecting arbitrary edited bytes.

## Task 1: Private cache ownership correction

**Files:** runtime `src/scene/palace/special/TishunSouthBeam.js`; new bounded tests under `tests/r165-tishun-reference-retention/`; exact adapter in that directory and `tests/r165-tishun-south-beam/source-boundary.mjs` plus `tests/r165-dailou-waiting-house/source-boundary.mjs`.

**Interface:** `buildTishunSouthBeam(kit, zone)` still returns false for unrelated zones or the original frozen record for the validated original target. No caller changes.

- [x] Record protected checkout HEAD/tree/index/config/refs and clean exact baseline in a fresh independent git directory with read-only object alternates.
- [x] Run existing component, idempotence and lifecycle tests before editing.
- [x] Add real finish/release GC comparison and identity replacement/slot negatives; run against unchanged source and preserve expected RED result.
- [x] Change private committed-state value to an inner mesh-keyed WeakMap. Missing identity must throw; keep all existing validation and disposal ordering.
- [x] Add frozen previous source and exact new source delta adapter without overwriting old pins. Exercise accepted old/new and rejected tampered bytes.
- [x] Run new tests, all existing F49 bounded modules, relevant source-boundary chain, and bounded cache/lifecycle regression. Request a window for full-zone/build instead of launching them silently.
- [x] Freeze patch, file hashes, actual command exits and any unrun checks. Recheck protected baseline state. Return for independent review, not publication.

## Verification boundary

The 20-module focused bounded command passed 56/56. The inherited 427-module suite, five heavy modules, formal full-zone and build checks remain unrun in this candidate; the candidate remains frozen for independent review before a bounded resource window is allocated. No publication claim is made.
