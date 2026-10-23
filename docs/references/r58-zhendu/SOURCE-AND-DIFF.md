# FC-9252CFFDAB 贞度门: bounded R58-A source and model difference

Baseline: 755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da. Parent: 太和门 (FC-B3B12CF397); independent entity west of Taihe Gate, not an alias or mirror of 昭德门. Current model anchor (64.4,-214.2) is retained, not newly surveyed. Existing axis item 10 calls generic gateHall: 12.4×6.4 outer column envelope, 0.45 platform, no dedicated source profile. This observation is static code, not a browser observation.

## Actually observed before implementation, 2026-10-22 UTC

1. [故宫博物院 direct 贞度门 photograph](https://taociguan.dpm.org.cn/images/zjcphoto/2023-12-05/9f53a288418e4364b1c3b3b5e98321ec.jpg). Actual 1080×1920 pixels viewed. Source label says 202306; exact photograph date unknown. URL upload path 2023-12-05 is not a photography date. Cropped, oblique detail likely from the southern court, camera pose not verified. Lower centre/right shows a tall dark brick retaining face bounded by pale dressed stone, pale platform rail and left sloping rail. Red columns, blue/green/gold painted beams, red studded leaves and yellow roof are visible. Top/left building limits, full plan, rear, wing contacts, complete roof/ridge and interior are not shown.
2. [Wang Puzi, 太和门的被毁和重修, 1983, printed p18](https://img.dpm.org.cn/Uploads/pdf/2198/T00018_00.pdf). Downloaded and visually inspected the one-page PDF. It explicitly groups both gates for three core bays, one core depth bay, surrounding veranda, nine-purlin single-eave xieshan, 62.9 chi overall width including lateral verandas, 41.4 chi depth including front veranda, 40.45 chi plinth-to-ridge and 50.5 chi ground-to-ridge. At the article's 0.32 m/chi conversion: 20.128×13.248 m, ridge above platform 12.944 m, historic platform rise 3.216 m. The old design diagram is described as not strictly proportional. These are shared historical document values explicitly applicable to both named gates, not dimensions copied from Zhaode's fitted model and not present-day survey.
3. [Taihe Gate official parent page](https://www.dpm.org.cn/explore/building/236439.html), read: Zhendu is the western flanking gate; 1888 fire and following-year rebuilding connects the three gates. Parent page establishes relationship, not detail acceptance.

Official images remain external research references. No image or PDF is included in public, runtime textures or the release ZIP. Local cache paths are not portable deliverables; URLs above are the source identity.

## Independent fit and uncertainty, set before code

Historical envelope and rise use the documentary values above, with their historic datum caveat. No source tells exact current bay split, column height/radius, platform edges, ramp projection or rear face. Fit ranges below are conservative engineering/observation ranges, not statistical confidence intervals or centimetre-level survey.

- PHOTO_FIT: visible column height above deck / historical platform rise around 1.7–2.1, choose 1.8657 (column 6.0 m, range 5.47–6.75 m). Rail height / platform rise about .26–.38, choose .3265 (1.05 m, range .84–1.22 m). Column diameter relative to column height around .075–.115, choose .0967 (.58 m, range .45–.69 m). The oblique crop and partly hidden bases limit these comparisons.
- ENGINEERING_ASSUMPTION, not photo measurement: core bays [4.95,5.85,4.95] m with lateral veranda remainder and inset core side walls; narrow front/rear lateral-bay access remains conservatively closed pending source; central clear opening 4.65 m [4.1,5.2]; front/rear veranda 2.5/2.3 m; platform 24.0×19.6 m (width range 22.5–26.5, depth range 17.5–23.0); front/rear ramp runs 17.8/16.8 m (ranges 14–21 / 13–22). These bound a reversible safe shell, not an inferred surveyed asymmetry. Ramp travel width 9.0 m [7.5,10.5], cheek width .9 m [.6,1.3]. All need plan/current-view corroboration.
- Retain inherited west/east wing centerline -3.1 local Z. Close contacts at platform edges ±12.0, with no invented climbable lateral connector. Full wing orientation/door layout is unresolved. Rear axis outlet is an engineering continuity assumption preserving gameplay, not observed museum access.
- No independent furniture evidence: do not add throne/furniture. Gate interior includes beam/portal geometry but full ceiling, rear leaf arrangement and interior finish remain BLOCKED_SOURCE.

## Difference → change → verification

1. Tall brick/stone retaining body → generic 0.45 m decorated plinth → dedicated 3.216 m document-based masonry platform with visible pale edge bands → actual closed mesh underside/retaining faces, body collision, deck/support ray correspondence. Browser visual comparison pending.
2. Shared source three-core-bay + veranda envelope → small generic gate with four column lines → dedicated independently partitioned three-core-bay plus lateral veranda columns; one real portal → counts, aperture rays, side panel body collisions.
3. Visible sloping stone approach and rail → no raised approach → independently parameterized solid wedges, matching non-rescue ramp supports, pale low-detail rails → real FirstPersonControls crossing both directions, own-support trace and negative support mutation.
4. Layered painted framing/column/door detail → generic low gate framing → two-level painted south framing, red column bodies, single two-leaf central door; simplified white rail cap silhouettes → material/geometry presence, no north decoration claim.
5. Enlarged platform near inherited wings → corridor ends formerly at local ±6.8 → contact contract at ±12.0 only, split guardrails and solid end caps → parent hookup and collision QA; no false side passage.

## States and evidence gaps

Exterior implementation may reach VERIFY_PENDING, never ACCEPTED in this task. Rear/complete plan/roof details, current ground datum, full wing interfaces and interior are BLOCKED_SOURCE. Source seen is not scene seen. Browser before/after, camera/FOV/lighting correspondence and photo/model triptych remain VERIFY_PENDING. CPU renders are diagnostic only. Parent owns canonical queue/status records.
