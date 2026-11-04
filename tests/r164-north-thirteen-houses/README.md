# North Thirteen main row-house shells, phase 1

Base0c5fa7aa50b3803922acd6f5c87f628d959c32df. North identity FC-2A2E866229 is distinct from shipped South FC-2D04E0B566; shared parent FC-ABA67505AC is only a grouping, never a third completed entity.

Official source https://www.dpm.org.cn/explore/building/236528.html and North photo https://img.dpm.org.cn/Uploads/Picture/dc/8286.jpg support thirteen gray hard-gable three-bay, one-depth front-gallery houses, twelve paired into six courts with west gates. Neither source measures this game layout. Existing game North strip and exact corner/wall builder were checked first. Fit centers350…506 at13m pitch, not a14m South mirror. The most northern geometry ends about510.1, while the existing northeast corner support begins516.2. Preserve an end turning area and return via BaoTai; do not invent a through-tower northern exit.

- `node --test --test-concurrency=1 tests/r164-north-thirteen-houses/{component,controller,identity,missing,lifecycle,ledger}.test.mjs`
- `NORTH_THIRTEEN_EVIDENCE_DIR=<existing directory> node --test tests/r164-north-thirteen-houses/production-zone.test.mjs`
- `node tests/r164-north-thirteen-houses/preview.mjs <output.png>` is only a flat-shaded CPU projection.

Exact0c5 ZoneBase is frozen and hashed; one import/call is the entire dispatch change. South helper stays byte-identical. The previous South source-boundary helper strips only this uniquely asserted pair so all older source assertions still run. Baseline capture ran before runtime changes on clean0c5; all old South and earlier geometry/physics/maps/rooms/regions/architecture/roofs are protected. New North markers alone are excluded.

128 arrivals,104 wall/window blockers,8 longitudinal routes,26 door jumps and8 BaoTai-to-end return/entry connections run with actual controllers, scripted headings/turn braking at10/60Hz. Actual Enclosure wall segment and all four corner builders are included without building World. Existing northeast corner blocks the attempted route; removing only its actual collider makes that route arrive. Removing one side-window's three contacts likewise changes refusal to arrival. End clearance is geometry-tested, not guessed from coordinate labels. South and all previous cumulative routes stay in the production test.

No northern annex rooms, unknown gate details, current office objects, new historic plaque text, map/teleport targets or current admission claims. North and parent are partial code bindings, not completed survey/whole objects. The South component's old notBuilt North field is its0c5/component-scope record; current aggregate ledger now explicitly includes both subjects.

Final allocation uses pre-registered BufferGeometry before attribute expansion, preserving the already reviewed South fix; partial UV-copy, material-copy and late-contact faults are atomic and retryable. No shared physics, renderer or South code changes. Preserve full World/browser/GPU/mobile/Node20/performance limitations.
