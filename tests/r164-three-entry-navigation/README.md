# Three existing ground-entry navigation repairs

Base: d84a1639476ee52f5a0fdb6a46c27f6b1886bd37. Only 阅是楼、佛日楼、倦勤斋 front approach data changes. `ThreeHallSouthApproaches.js` runs before profile freezing in both factories. Runtime geometry, shared collision/Teleport, map identities, upper destinations and other16 profiles are unchanged.

- Read-only actual-zone screen: six old strict failures, identical to aba. 阅是/佛日 first point declared0 on registered .08m slope; 倦勤 second point declared0 on .472222m slope. These are meaningful rejection errors despite small first-height difference, not cosmetic precision work.
- Initial four-hall attempt also included 梵华; its single-building tests passed, but real NingShou failed because existing `jingfu-rear-stair` furniture region overrides the front half of its ramp with0 height. It was removed entirely from this patch. The old route remains identical. 遂初/萃赏 remain pending too.
- Each corrected approach starts1m before its real registered ramp, samples its five sections, and reaches the unchanged portal. Slope samples follow existing collision support, not the slightly stair-stepped visible top of each stone tread. No slope/step geometry or physics was changed.

Run from repo root, serially:

```
node --test --test-concurrency=1 tests/r164-three-entry-navigation/{profile,teleport,go,controller,source-ledger}.test.mjs
FOUR_ENTRY_EVIDENCE_DIR=<writable evidence directory> node --test tests/r164-three-entry-navigation/production-zone.test.mjs
bash tests/r164-three-entry-navigation/run-bounded.sh
```

The legacy environment-variable name records the initial four-hall investigation only; final tests/code include three. 72 actual-controller entry/return routes =3 halls×3 rates(10/60/144)×walk/run×forward/backward×directions. The driver turns/brakes, not arbitrary held-sprint/manual GPU input. `go` uses actual FirstPerson and Teleport with a recording ZoneManager; the separate real-zone test proves scene integration. Do not combine that into a claim of browser UI or actual full-manager travel.

Frozen ZoneBase and Remaining sources are byte-checked against actual d84 Git objects. BeforeZone imports the old Remaining module, rather than candidate geometry with old labels. Full-zone geometry/material/physics/map hashes retain all objects. Architecture comparison first asserts exactly the three frozen new point lists and only then restores old lists for historical equality; unrelated drift still fails.

Historical tests are retained. Qingshou/Xunyan and shared-stair comparisons strip/assert exactly this later route delta before applying their original old assertions. No widened tolerances or dropped source guard. Initial per-building comparison red was a fixture chain omission: direct `buildRemainingHall` lacked production `applySourceGuidedNameboardMount`; the exact old chain was added, without normalizing any geometry.

No World/browser/GPU/mobile/Node20 verification, no deployment or main change. This is a navigation repair, not acceptance of any complete building or historic visitor route.
