# Independent final production integration review — 2026-10-31 06:35 UTC

## Decision
**No new P0/P1 integration blocker found. The confirmed rollback P1 is closed for the tested fault scope. Conditional approval to save this limited development checkpoint, not whole-object, current-site, GPU, or publication acceptance.**

Reviewed worktree: `r158-arrow-integrate`, branch `feat/r157-taihemen-facilities-c-cumulative-20261031`, `dd9e8086b2eddec66a162d7269c58ab8456cabbd` + WIP. This is a source-byte review, not a clean-commit claim.

- Final source manifest: `source-final-0610.json`, 582/582 exact; SHA256 `68faf6aa977ace8639e0000e5490fdbc23477db2d2621fa45308445fa35eea9d`.
- Full runtime build fingerprint independently recomputed: `7e2d217f064815ef8f85213c4a9b0579ad888bcc84b71377e7075b05f93c232a`.
- No production/test/doc files changed by this reviewer. Scratch files only under this review directory. No child agents; all four World files executed serially after integrator handed over the heavy-task slot.

## Fresh independent execution
1. Production dispatch, promotion and rollback tests: **10/10, 0 skipped/cancelled** (`rollback-promotion.txt`). Checks actual production six bindings, 77 source-tagged colliders/3 supports, exact successful-path merged/raw geometry/material/metadata/physics, and mutation negatives.
2. Four real cumulative World files: **8/8, 0 skipped/cancelled**, 51.7 seconds (`four-worlds.txt`). Actual uninjected production World has 30,873 colliders/1,371 supports. All 30,796 non-C colliders retained as duplicate-preserving multiset, all 1,368 non-C supports in order and water exact. C eight side × rate × speed round trips all start/end at feet 0, no rescue; central ordinary entry blocked. Existing instruments' 16 routes, four drops and narrow apertures still pass.
3. Independent multi-exception red/green probe (`rollback-multi.mjs`, `rollback-multi.json`):
   - Identical probe on original author transaction: first `g0` dispose exception masks original build error; colliders/supports stay 2 instead of 1, owned/cache 4 instead of 1, fixture productionBinding and parent metadata remain uncommitted. Only one cleanup callback attempted.
   - Final transaction: all three geometry and three material callbacks attempted despite all six throwing. Every callback observes restored colliders/supports/ownership/cache/profile/metadata and only the retained child. AggregateError has original error object as `cause` and first `errors` item; all six cleanup error objects retained. Existing retained geometry/material not included in cleanup.
   - Fresh permanent third test also covers a real late production-approach construction failure plus throwing geometry disposal. This is a deliberate failure-path algorithm repair, not falsely described as mechanical promotion.

## Evidence/source integrity independently recomputed
`verify-evidence.py` / `evidence-verification.json` read the original gzip/TAP/spec bytes without rewriting repository evidence.

- Manifest exactly enumerates all tracked + untracked `src`/`data` files. Only production transaction differs from source-live-0556. Rechecked after independent executions.
- Four historical author module files are byte-identical to reviewed `96853ce94df61709c1c4fe0f00f49ffb50bf1ade`; promotion provenance SHA256 matches all author and production bytes. Frozen one-file PalaceBuilder host is exactly Git `5d8c713e`, SHA `cbd9617a4ad474f611253dfc02503ce85711f3cb6ce370bfc24983f80eae3fab`. It is not a full historical dependency closure.
- **Full current-state result = 1313 / 1103 / 210.** Primary 1191 / 981 / 210 includes one incomplete Qinan file-wrapper; replace that one wrapper with all original 48 passing Qinan cases, then append original 75 Zhaode cases (74 / 1). Exact executed-title and failure-title Counters equal the complete pre-C baseline; raw-part and baseline SHA values match. No skipped/cancelled tests. This is complete explicit partitioned replay, not a monolithic green suite and not proof every inherited failure has the same cause.
- **Cumulative batch = 404 / 403 / 1.** Primary 395 / 392 / 3 has three file wrappers replaced by Arrow 1/1, Wenyuan 1/1, Wuying 10/9/1. All inherited 320 titles retained with the documented one scope rename; 84 additions, not 84 project completions. Exact failure Counter unchanged. Remaining failed title is `All existing bridge-deck supports and non-Wuying physical owners survive exactly` in the Wuying test file.
- Qinan, Zhaode, Wenyuan and Wuying original replay test bytes independently equal Git baseline. Wuying preload changes error formatting only through exact `isDeepStrictEqual`; opt-in and its hash documented; old red remains red. No new golden or weakened equality predicate observed.
- **Three build bases /gugong/, /forbidden-city-3d/, /: 560 modules each, exit 0** from original logs/launcher, with actual output build-info matching receipt and independently recalculated full current runtime fingerprint. SourceCommit is dd9 + dirty; not a postcommit build. No additional build rerun was needed or claimed.
- Evidence SHA index: all 99 entries and every included decompressed-log SHA match at review time. CPU nine PNG hashes match final record and earlier image hashes. Three build log hashes and build identities recorded in independent verification JSON.

## Successful-path scope and visual review
Production changes consist of four promoted modules plus PalaceBuilder import and target/single-rectangle/front-datum guard. Source owners identify the exact new C products, not a coordinate-box exemption. Instrument cumulative comparison removes exact 68 old/77 new C collider occurrences and 2 old/3 new supports; its separate old instrument fixture is unchanged. True non-target drift and missing support negative controls remain.

All nine final CPU images personally inspected. Narrow central stone plus both stepped shoulders, further-south toe, photographed head/toe barriers, four censers, west stone box, east pavilion and original ground are present. These are complete PalaceBuilder-scene CPU base-color images, **not complete World/GPU screenshots**, photograph-registered cameras, texture/lighting/shadow proof or pixel acceptance. Successful-path promotion equality preserves earlier source fitting; no new source-measurement claim is justified.

## Severity / remaining boundaries
- **P0:** none found in reviewed change.
- **P1:** disposal-listener rollback leak closed by independent red→green and real late-failure test. Earlier gap intrusion and wrong central compound remain closed through the reviewed successful-path equality and live consumers.
- **P2 / known fidelity debt remains:** four censers are repeated class form, not four independently identified replicas; carving, back/fine details, measured dimensions, two missing lions, upper frame/wing occlusion and 門/门 mismatch remain. Pavilion/box are partial forms, not complete artworks. These are not silently accepted by integration.
- **Unresolved acceptance gates:** post-2026 construction/current access and actual present-site form unknown; GPU/browser/source-camera acceptance absent; no whole gate/interior acceptance, no canonical requirement accepted. 210 full-suite inherited reds and one batch inherited red remain, with prior incomplete rounds explicitly retained.

Approval attaches only to the exact source manifest/runtime fingerprint above and the limited development checkpoint scope. A later source edit needs relevant revalidation; commit/rebackup must preserve required baseline gzip fixtures and raw evidence. No main merge, deploy, remote-backup, whole-item completion or current-site acceptance is implied by this review.
