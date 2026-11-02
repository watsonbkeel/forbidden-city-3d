# 文渊阁一层：照片可见成对扇形轮廓

Base `73360cc74f7cbbdcdd37302d448a67093d45a044`. Only one NEW production module: `src/scene/palace/special/WenyuanGroundFans.js`. No existing source, shared hook, data, generic builder or physics changes.

## Scope and source

Own official first-floor photograph: https://img.dpm.org.cn/Uploads/Picture/dc/1537[1024].jpg . Author and integrator viewed it. Local original `/tmp/r158-wenyuan-ground-1537.jpg` SHA256 `2e8b70ff7a95d25d73f75d11b54f307ee9ef1e23ed13e14b8f001155b0a78ad5` (150889 bytes). Two tall handled fan-shaped objects flank the seat/screen. Add only their large contour and coarse dark-green/yellow/pale/dark colour fields; no antique name/material/feather/wood/pattern attribution, no fine carving or paintings, no present-day survival/admission claim. Position, dimensions and colours are engineering fits. Original `CARVING_AND_FAN_ART_UNMODELED` remains unchanged: this candidate adds coarse silhouette, not exact artwork.

Centres local x=-3.375±.74, z=4.05; contour width .60, highest y=3.38. Entire new XZ geometry remains inside original seat-base footprint world x[-190.95,-188.8], z[-129.775,-128.525]. Stems begin y=.94 at original seat top. Ten meshes, five owned materials, two exact triangle owners, **zero supports/rooms/maps**. Original table, seat, screen and every old mesh/owner/support/meta preserved.

## Integration

Import `finishWenyuanGroundFans` in ZoneBase and call once immediately after `finishWenyuanUpperSeat(this.kit);`, before kit finish/registration. No fallback, no source replacement. Author World diagnostic uses only a clearly disclosed QA loader insertion of that exact call; ordinary product hook remains for sole integrator. The independent component builds the actual original Wenyuan via ZoneBase.buildHall, then applies the candidate.

## Verification and limits

- True missing-module RED before writing source.
- `component.test.mjs`: **2/2 green**. Compare old meshes/indices/attributes/materials/world matrices, full collider/support/room/map streams; source metadata unchanged. Every visible new triangle matches its exact Float32 world-space collision triangle. New bounds stay in old seat footprint; moved host/frozen arrays/duplicate reject.
- `control.test.mjs`: **1/1 green**. Actual single-hall CollisionManager + native FirstPerson, central entrance/table route 60Hz walk and 10Hz run; complete results/frames identical with versus without only the two new owners. This is a component control, not a complete World.
- Full World diagnostic: normal outer-east+global, actual TextureLibrary APIs with inert pixels, candidate QA pre-finish hook. Central (-189.875,-139) → (-189.875,-133) → return passes 60Hz walk and 10Hz run, peak feet-ground gap 0. These same central routes passed all three diagnostic attempts.
- **Each full diagnostic script exits 1**, because additionally attempted stair-foot cross routes meet existing obstacles. First z=-139 and second z=-139.4 cross attempt stop x≈-187.4996; original folded leaf box x[-186.970,-186.870], z[-141.55,-139.795] and nearby original posts prevent assumed free lateral route. Third short attempt starts (-173,-139.4) and remains there. All raw failures retained. No old geometry/collider moved, no claim that the west-stair ground approach passed. New fan owners lie around z=-128.75, outside every failed short-route envelope, and original flow conservation is independently asserted. Stop selecting alternative routes; do not repeat full stairs/bridge groups for this cosmetic addition.
- The historical diagnostic is deliberately named `world-diagnostic.historical.mjs`, not a passing regression. Final normal integration should check the central two routes only, plus build; not require the unrelated guessed cross routes.
- Two CPU images viewed, actual candidate and surrounding meshes; coarse materials/no textures/GPU. ROI excludes distant geometry outside x[-196,-183], y[0,4.8], z[-136,-124], not a whole-building render. CPU confirms both silhouettes and stems, not historic measurements.

Commands: `node --test tests/r158-wenyuan-fans/component.test.mjs tests/r158-wenyuan-fans/control.test.mjs` (run individually, logs retained). CPU: `node tests/r158-wenyuan-fans/export-cpu.mjs` then renderer over `/tmp/r158-wenyuan-fans-0321/{front,oblique}.json.gz`. All original images/frames/CPU geometry raw stay `/tmp`; only self-made PNG, source, QA and summary/hash uploaded.

Initial control-test setup created DOM before CourtKit and lacked canvas getContext; corrected fixture ordering, then green. This fixture error is not counted as feature RED. No author full build or GPU; no wider regression claim.
