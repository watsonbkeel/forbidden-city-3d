# R158 传心殿：仅主殿候选

> 累计发布策略：本目录不上传原始测试帧/日志/研究官图，保原作者冻结副本；具体排除路径、长度与SHA见 `LOCAL_ONLY.json`。下文`world.json`、原页扫描等是本地作者原件的历史说明，不声称这些文件可在远端取得。累计正式hook与新构建另见集成摘要。

Base: d1c66bf9f977f354432ef20a2e783f1c33d5cfae (parent confirmed identical runtime tree to remote acc36).
This branch adds ONE dedicated main hall; it does not install a production hook. Unique integrator should import `buildChuanxinHall` from `src/scene/palace/special/ChuanxinHall.js` and call it once in ordinary `ZoneBase.build()` with `(this.kit,this.zoneJson)` before finish, alongside Neige. No JSON replacement or existing-object deletion required.

## Source vs fit
- Official building entry and 黄燕虹《传心殿琐谈》p20–21: south-facing five-bay / three-depth-bay yellow hard-gable main hall. The p20 own facade photo shows FOUR central full-height lattice leaves, sill windows and low stone entrance steps; photographed year is unknown.
- Sources and original page scans retained next to this file. `old-p22` is EAST GLAZED COURT GATE, not 景行门 and not implemented here.
- Position(-236.5,-198), width19.2m, depth10.4m, platform.45m, eave4.95m and ridge7.75m are ENGINEERING FITS, not official measured values. Lower and upper stone treads are .15/.30m high and each1m deep; these are visible solids and fitted for practical native walking.
- Exact geometry fits within audited X[-247,-226],Z[-206,-190]. Potential full courtyard reservation25×100m is NOT built, especially not the constrained north river-edge wall.
- Four leaves visibly folded for game access; no claim of current museum public admission. Linked circular lattice is a source-guided simplified rhythm, not ornament counting or art reproduction.
- Side/back closure is a plain fitted weather shell, NOT verified current rear windows/paint scheme. Roof end sculptures, paintings, inscriptions and furnishings remain unknown and are omitted.
- No invented south courtyard gate. No side gate, 景行门, 治牲所, 神厨,祝版房 or值房. Their conflicting evidence remains unresolved. No whole-courtyard acceptance.

## Physical ownership
Four axis-aligned visible solids (platform, its cap/floor, two treads) use exact same-mesh native Box colliders; floor and two tread TOPS only are registered as walkables, with no rescue flag. Walls, facade, columns, folded leaves and curved roof use exact final visible Float32 triangle owners. No invisible incline, platform-size broad triangle box through the doorway, global controller change or contact allowlist expansion.

The first exact-triangle stepped version exposed native full-foot triangle-sweep rejection before the foot-centre support region (retained `world-before-native-steps.*`). Native Box solids + actual tops, matching existing Wenyuan tread contract, removed that blocking but .5m treads produced .393m peak downward contact gap at60fps running (`world-short-treads.*`). The visible treads were deepened within the already-approved envelope; the final run must meet unchanged.3m criterion. Failure records are retained, not overwritten as successful evidence.

## Verification boundary
`POSITION-SCAN.json` is actual unchanged baseline World occupancy, not candidate passage. `world.json` is actual World with an explicit TEST-ONLY before-finish candidate injection, never an installed production-hook claim. `cpu/*.png` are two views of real candidate mesh triangles, diagnostic flat palette, NOT GPU/texture/mobile screenshots. Final integrated production hook/build remains the sole integrator's responsibility.

## Final targeted results (2026-11-01)
- `node --test tests/r158-chuanxin/component.test.mjs`:7/7, including exact visible-box top ownership, exact triangles, guarded/duplicate/frozen registration, gable roof end and infill checks, ordinary finish, real open doorway vs closed sill window.
- `EVIDENCE_OUT=... node --test tests/r158-chuanxin/world.test.mjs`:14/14 travelled routes (8 entrance round trips across10/60fps walk/run and forward/backward walking;6 protected external line traversals),3 real wall departures rejected,3748 routeframes, max feet-ground gap0.2703333214124076m. No threshold relaxation. No FirstPerson/Collision or contact-owner changes.
- `cpu/front.png`, `cpu/oblique.png` personally inspected:42,202 actual candidate triangles. Central four leaves fold inside; low3-rise entry and5-bay sill-window facade; curved hard-gable ends have real matching end walls. Front and side colors remain a restrained engineering palette, not colourimetric photo matching.
- Initial frozen-registry test expected0 owned materials, but native CourtKit already owns4 before the candidate. `component-fixture-count-mismatch.log` retains this test bug; fixed assertion compares exact before/after material identities, and final7/7 is `component.log`. No production relaxation.
- No whole historical regression/browser/GPU suite or candidate production bundle claim: this is an intentionally UNREGISTERED module pending unique-integrator hook. Native module execution is covered above; final integrated normal-World and source-bound Vite build must be performed after registration, not passed off from a build excluding the candidate.
