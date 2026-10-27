# R115-fix — urgent material startup correction

## Defect and correction
The production TextureLibrary rejects unknown material names. R114's Chengqian courtyard gate requested `wood_red` and `roof_ridge`, neither present in the official registry. R115 therefore throws while prebuilding east-six; earlier permissive CPU material fixtures and Vite compilation did not detect this runtime error. The frozen R115 remains unchanged and its failed partial startup is not a performance baseline.

The only runtime correction replaces the gate's header/jamb material with existing `wood_column` and ridge material with existing `roof_tile`, matching the established painted-wood/yellow-roof palette. No global aliases, geometry positions, actor data, collision, navigation, timing or quality budget change. Metre-scaled UVs now use each valid material's declared tile size rather than the invalid key's fallback scale.

Real local images are decoded through native Canvas2D and the unchanged production TextureLibrary/Three TextureLoader. Both high and low build all seven zones. This is CPU functional validation, not browser/GPU rendering, network loading or mobile performance. The final high/low CPU startup passes Palace, Enclosure, Garden, all seven zones, 1197 night-light sites (one inherited unplaced site), player controls, flight envelope, InteriorLoader, 108-character registry, historical lamps and FlightTour construction, then disposal. Character animation/first submitted instance and full browser/UI interaction are not part of this smoke. Root production compilation is recorded separately below.

## Rollback and release
This checkpoint is a startup correction, not a performance improvement. Do not advertise R115 as safe to deploy without this correction. The user-owned main/Pages are unchanged. Root coordinates an independently reviewed hotfix branch and exact remote readback; no remote identity is claimed here.

## Exact acceptance and limits
- Product RED: frozen R115 actual-library startup throws `未知贴图 wood_red`; a strict formal-library test reproduces both quality failures. `roof_ridge` is also absent from the registry. No global alias introduced.
- Final formal-library tests: 2/2 (seven zones each, all 22 color + 21 normal images decoded).
- Existing R114 scoped protections: 10/10 unchanged tests, covering geometry/source/flight/Environment/entry contracts.
- Final CPU startup raw: `reports/r115-fix/fix-v4-{low,high}.json`, bound to `0423e124` and full source hashes. No performance claim: one functional sample per quality; the broken R115 partial run is not a timing baseline.
- Intermediate v2/v3 startup driver failures were missing `document.head`/`dataset` in the CPU DOM fixture, not product changes; both negative logs retained.
- GPU, browser shader compilation/rendering, actual network loading, mobile and Node20 remain NOT_RUN. Existing R115 full-suite 1114/176 and its 13 classified changed-model contracts are not rewritten or claimed all-green; no unrelated full rerun for this hotfix.
- All previous R115 scope limitations remain, including partial palace completion, rejected R111 rock candidate, Chengqian south dead-end area loss and inherited low-threshold overlap.
- Merge recommendation: apply this startup correction instead of serving the known failing unpatched R115. User-owned main and deployment remain user actions; root handles the exact development-branch readback. If emergency rollback is needed before merging this fix, restore the previous validated R105 deployment rather than presenting unpatched R115 as safe.

## Build verification
Root production build passed (`VITE_BASE=/ npm run build -- --outDir /workspace/scratch/02a8023d1a85/r115-fix-build-root`, exit 0, 4.69 seconds), with the existing >500kB chunk warning retained. `reports/r115-fix/root-build-readback.json` records the exact release/build/source fingerprint verified against the final build inputs; the logged source is `39c22781`. This compiles the full application but does not replace GPU execution. No performance optimization or new loading architecture is included.
