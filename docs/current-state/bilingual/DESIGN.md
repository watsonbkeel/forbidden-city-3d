# Bilingual tour and attraction information

Status: implementation in progress; no release acceptance claimed.

## Frozen input and scope

The proposed input is the complete tree `5361deb617fa973bda3f723d5aad5f74b00decd9`, the tree of public candidate `e1287435158ee5aa98e0a1a370cae97021a5c385`. The public candidate passed cumulative CI run 42166224387 and is the accepted input baseline for this feature. Its predecessor is `2544bab117846a7fd16175a0279e97190d28f549`. The feature is developed in an isolated branch without changing the frozen input or main.

There are 164 original cards and 130 cited sources. All 164 cards already contain summaries; 136 contain functions, 99 timelines, 59 people, and one interior guide. Missing optional fields are not automatically research gaps. The 398 source-register objects are not a count of completed attraction cards. The current supplemental candidate adds 122 cards (28 existing-map identities and 94 directory-only identities), for 286 cards plus four separate bridge facilities. Runtime map correspondence remains a separate acceptance item.

## Intent

Offer an obvious Chinese/English control, remember the preference where permitted, and provide faithful local English attraction information. Complete missing attraction descriptions where identities and official evidence can support them. Preserve all model state and current navigation while switching language.

## Approach

Use a small local locale service, translation dictionaries, and stable-ID display overlays. Do not translate canonical internal binding strings or use network translation. A framework replacement or a locale-specific scene rebuild would be larger, more risky, and would violate state-preservation requirements.

Original Chinese card data stays byte-identical where possible. English content is keyed by original card ID and field path. Content validation requires matching source IDs, field structure, dates, status, relation identifiers and immutable scene/teleport metadata. Every visible translated name is a display field, never a navigation key. Translation provenance distinguishes verified official English names from project translations. Existing source review dates are preserved, not recast as a new review of 130 pages.

New attraction cards use a separate supplemental catalog and explicit binding registry. Existing map items can gain text only after the exact source/structure identity and projection are checked. Model-only named attractions can appear in the directory without fabricating geometry or teleport targets. Components, aliases, uncertain identities and grouped facilities are classified explicitly rather than becoming duplicate attractions. Four bridge groups keep their existing IDs and map-only behavior.

## Locale and UI lifecycle

- Supported locales: `zh-CN` and `en`; default remains Chinese. Invalid or inaccessible persisted values safely use Chinese.
- One observable locale store with guarded storage access; no credentials, network translation or new service integration.
- A visible `中文 / English` selector, also reachable from settings. Native keyboard operation, correct labels and adequate touch targets.
- The locale change updates document language, UI text, map canvas labels, directory buttons, active card, source labels, feedback, loading/welcome, current location, help, time/flight controls and diagnostics.
- Do not reconstruct the app, World, ZoneManager, controls, characters, interactions, routes, collision data or current place.
- Preserve query, selected ID, map pan/zoom, panel visibility, scroll and focus where the node still exists. Re-rendered travel buttons retain the original destination and stale-event guards.
- Search always indexes Chinese, English, sourced aliases and curated pinyin. The UI language does not remove search terms.
- Physical historical plaques remain Chinese. UI supplies English names/readings.
- Missing English is a validation failure for shipped scope, with an explicit unavailable state for unknown runtime content, not silent Chinese fallback presented as English.

## Evidence and content boundaries

Use the existing official citations for faithful translations. New historical statements need official Palace Museum evidence; no invented dates, persons, measurements, room functions or current access. Empty people/interior/history sections are preserved when inapplicable or unsupported, with clear evidence limitations. The original nine uncertain/historical cards retain their exact uncertainty status. English is labelled project translation except individually verified official names.

Known gaps requiring exact reconciliation include dynamic Neige halls/stores, later public-name adapters, Jiangxue Hall, Chizao Hall, Zhenfei Well, Baohua Hall, Danyuan Hall, Hengshou Studio and the garden pavilions. This list is a starting sample, not a final denominator. The implementation includes a machine-readable reconciliation of existing map/model identities and cards, showing exclusions and unresolved records.

## Verification

Write failing tests before feature code. Test locale validation, storage failures, subscription disposal, switching without app/scene reconstruction; all original card IDs and translated field coverage; source and invariant metadata equality; blank/placeholder/Chinese-as-English rejection; bilingual/pinyin search; active card updates; original travel keys and rejected stale callbacks; selected identity, query, movement state, view/focus/scroll preservation; bridge grouping; unknown content; narrow layout, keyboard and ARIA behavior.

Keep historical source/data guards and old test bytes. Existing r31 tests retain obsolete 159-card assumptions; this discrepancy must be reported and handled by the existing historical test route, not erased by changing old assertions or hashes. Add new tests for current 164-card and supplemental scope. Coordinate heavyweight fixtures, build and browser execution windows. No publication or acceptance claim before exact candidate checks.

## Resources and deliverables

Use an independent Git store/index with read-only object alternates and sparse materialization. Full tree size is about 1.69 GB and must not be copied. Core src/data/top-level files are about 9.5 MB; public assets about 38.3 MB. Tests and reference documents are materialized only as needed. Existing dependencies can be referenced read-only. Evidence is recorded separately from the runtime deliverable.

Deliver new local source changes, translations and provenance, scope/reconciliation report, focused test evidence, historical regression results and remaining verification limits. No remote upload, branch publication, deployment, main update or account change is part of this implementation task.
