# R163 five missing place cards

Base: remote `2110597f8f8e56713bb9b9a42da73cbd04cb691f`, the identical complete tree
`79586834cc33fc24ae70b2f2e53a81e68ee718f1` to local `6c27952d260ac1bb78a5d8f7826f6a0dbec6e0c4`.

The only runtime change appends five records and one source to
`data/places/zh-CN.json`. The original 159 cards, all their aliases, all existing
sources and catalog metadata are unchanged. There are now 164 cards and 130
sources. Map names, scene bindings and five independent teleport keys remain
unchanged. No geometry, collision, navigation, UI logic, dependencies, workflow
or deployment settings change.

## Source-bounded facts

Reviewed on 2026-11-04 Beijing time using indexed Palace Museum pages. Direct
requests to the Chengqian/Lijing pages timed out; indexed full primary-page text
was available. These are historical source checks, not same-day access checks.

- [天一门](https://www.dpm.org.cn/explore/building/236541.html): the south gate of
  the Qinan courtyard in the Imperial Garden.
- [承乾宫](https://www.dpm.org.cn/explore/building/236438.html): its rear courtyard
  has east and west three-bay wings, central doors and yellow-glazed hard-gable
  roofs. The existing keys remain 承乾宫后东配殿 / 承乾宫后西配殿. The fuller locator
  names 承乾宫后殿东配殿 / 承乾宫后殿西配殿 are searchable canonical names, consistent
  with the retained official panorama extract in `docs/current-state/r125/SOURCE-EXTRACT.json`.
  They are not asserted to be independent historical plaque names. Front-court
  names 贞顺斋 / 明德堂 and whole-palace residents are not assigned to these wings.
- [丽景轩](https://www.dpm.org.cn/explore/building/236554.html): three-bay wings
  named 凤光室 and 猗兰馆 enclose the rear courtyard. The east/west association and
  the 室/馆 variation are also retained in `docs/current-state/r123/SOURCES.md`.
  Existing key 猗兰室 is preserved; 猗兰馆 is searchable and appears in the detail
  as the source's name. No separate second building is invented.

All five cards deliberately leave functions, people and timeline empty. Each
has the existing model-navigation disclaimer and unverified site-access notice.

## Verification

```sh
node --test --test-concurrency=1 tests/r163-five-place-cards/cards.test.mjs tests/r158-place-display/*.test.mjs tests/r163-public-place-names/display.test.mjs tests/map-compact.test.mjs tests/map-gestures.test.mjs tests/map-inputs.test.mjs tests/map-place-directory.test.mjs tests/map-place-selection.test.mjs tests/place-catalog-all-zones.test.mjs tests/place-catalog.test.mjs tests/place-catalog-complete.test.mjs
```

150/150 bounded checks pass. The first 16 regressions failed against the base,
then passed after the data addition. Five cases construct the real individual
buildings with the real texture library and test map binding, sourced details
and exact travel callbacks. Ten keyboard/touch fixture cases exercise current
and canonical-name search, detail selection and return state. The final two
checks retain all old cards and verify an exact inverse rejects changed facts.

Existing inventory-count assertions intentionally increase from 159 to 164;
source count from 129 to 130. The R6 retention helper first removes only this
exact hash-checked addition and restores the complete original catalog bytes.
Its historical fixtures and hashes are not weakened. The old
`tests/place-catalog-four-cards.test.mjs` still fails during import at
`exact reviewed added cards` (`abb71289...` versus `9cf114db...`), exactly as on
the base. This is not an all-suite pass. The former 天一门 catalog-completeness
failure now passes, including all seven zone datasets.

No full World run, browser/GPU rendering or physical mobile acceptance is
claimed. Browser startup remains unavailable under the existing sandbox
restriction and was not retried. Travel callbacks are checked; whole-world
landing safety is not revalidated. Wider pre-existing geometry/frozen-baseline
limitations from the base remain. No new deployment is performed.

Before accepting browser presentation, search each of the five existing names,
then 猗兰馆 and the two full rear-wing locator names; open each detail and verify
its source link and independent travel destination. Keep `2110597f` and
`06369276` unchanged as rollback candidates. Merging main later would trigger
the existing Pages workflow; this delivery does not merge or deploy.

## Documentation-only successor: real Teleport parsing

The subsequent release-note candidate retains the exact d5 runtime bytes and
adds `teleport.test.mjs`. Run the command above with
`tests/r163-five-place-cards/*.test.mjs` instead of only `cards.test.mjs` to include
all six additional checks: five real component/production-target cases and one
all-five uniqueness case. Combined bounded result: 156/156.

The production Teleport constructor and `landingFor` are not mocked. Existing
zone targets, canonical-name rejection and distinct approach coordinates are
checked. `resolveLanding`, `isSafe` and `go` are deliberately not invoked; this
is not full-World collision/landing safety or actual travel acceptance. No
runtime change or fresh build is made by that documentation/test-only step.
The preserved build remains R163-ff9834c19984, actually built from local
`d2f65984528179154fef0022cf9692e03bcf12f0` (the same complete tree as remote d5),
not from the later documentation commit.
