# R38 southern planting evidence and axis handoff

Research checked 2026-10-21 05:36 UTC. Research only; no production writes. Photographs downloaded for visual research, not for redistribution or use as project textures. All local evidence is in `/workspace/shared/r38-tree-evidence/`. Sources are Palace Museum official sites, not third-party travel photographs.

## Priority outcome

1. Keep the paved central Wumen–Taihemen–Taihedian courts unplanted. Trees seen over distant walls do not establish trunks inside the central court.
2. A bounded partial representation is justified at the **Wenhua inner approach: four clearly visible representative trunks**, and **Wuying inner front court: two representative pine-like trees, one each side**. These are selected visible subsets, NOT a current census, a claim that these courts contain only six trees, or six surveyed tree locations.
3. Do not use uniform random planting. Do not call these broadleaf trees: the selected Wuying photographs visibly show needle clusters and branching; Wenhua has irregular tiered conifer-like crowns. Exact species is not verified. Botanical names, trunk diameters, heights, crown radii and all model coordinates remain unknown or fitted.
4. Taihemen's single generic stair opening is a genuine code/source topology discrepancy; the separate axis auditor owns its implementation recommendation. Do not perturb the already source-profiled Wumen roof or Taihedian approach merely to produce another change.

## Evidence classes and date discipline

- P: features actually visually inspected in official photographs.
- T: official written statement.
- F: implementation fit, including ALL proposed tree coordinates, geometric heights and canopy sizes.
- H: explicitly old photograph, historical illustration, or historical account; not current survey evidence.
- The June 2023 and August 2025 URL paths below are resource dates, **not confirmed photography dates**. Panorama metadata lists productionTime and digitizeTime as null for the supporting images. A new 2026 resource URL does not establish a 2026 scene capture.
- These source pages do not establish present-day October 2026 exact tree inventory or seasonal foliage. Retain foliage state as an illustrative source-conditioned visualization, not live state.
- Model coordinate convention is +X west, +Z north. In a north-facing frontal view from the south, viewer-left is west (+X), viewer-right east (-X).

## P01 Wenhua inner approach: four visible anchors

Official source entry: https://intl.dpm.org.cn/explore/build_maps.html (link list saved in `/workspace/shared/r36-official-map-links.json`).
Image: https://intl.dpm.org.cn/Uploads/Picture/2023/06/26/s64993cd77858c.jpg
Local: `Wenhua_dian_3.jpg`, 1920 × 1080. Duplicate image is also published as a Wenhua hotspot in the official panorama, recorded in `supplement-photos.json`.
View: facing north toward the plaque 文华殿; central raised stone/paved approach connects the foreground to the front platform and central entrance. Bronze censers flank the front doorway.

Four selected large trunk anchors in this specific image:
- W1: viewer-left foreground trunk, roughly pixel x210 at y835; farther laterally from the raised approach.
- W2: viewer-left trunk nearer the hall, roughly x500 at y803, just outside the approach's retaining edge.
- E2: viewer-right trunk nearer the hall, roughly x1490 at y803, outside the opposite retaining edge.
- E1: viewer-right foreground trunk, roughly x1810 at y814; farther laterally from the raised approach.

These pixel locations identify source features only; **do not convert them directly to metres**. Annotation `wenhua-visible-trunks-annotated.jpg` identifies the same features. Both lower court sides contain additional partly obscured vegetation; four is a useful representative subset, not inventory. The front pair has different silhouettes, sizes and lateral offsets from the nearer-hall pair. No exact left/right botanical equivalence is established.

Implementation topology: all four roots below the raised approach level, in the side-court planting ground, south of the hall front platform and outside axial walking surfaces. Keep the central approach and front entry unblocked. Preserve sight to central plaque/door between crowns; crowns can occlude outer facade bays as shown. Do not plant roots on the raised platform or tuck trunks through retaining masonry. Green ground patches exist, but their full boundaries are not established by this single perspective.

Photo corroboration from inside Wenhua gate, with the axial approach and the same side plantings visible: `wenhua-official-5-2.jpg`, source URL in `supplement-photos.json`. It shows that the planting is inside the gate/front-hall courtyard rather than in the main Taihe court. It does not fix the exact number of trunks in the whole court.

## P02 Wuying front court: one representative tree each side

Front image: https://intl.dpm.org.cn/Uploads/Picture/2023/06/26/s6498f00141aaa.jpg
Local: `Wuying_dian_0.jpg`.
This frontal view confirms trees flanking the white-balustraded approach but hides most trunk bases. Use the following labelled official panorama hotspot photos for placement rather than guessing from canopy blobs:

- `wuying-official-0-0.jpg`, labelled 武英殿:
  https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/XuiQmR6v5NZ07S0fKNbgazv5bc2h3xWT50Nipxp1.jpg
  Oblique front view clearly exposes the west-side tree's branching trunk and stone-edged soil pit beside the front-hall platform/approach junction. Root is on the lower paved court, not on the white terrace. Crown is broad and irregular, with needle-like clusters and strong lateral branches; trunk has multiple rising limbs.
- `wuying-official-2-0.jpg`, labelled 武英殿西配殿:
  https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/8P33mNUJPmop8WwUCklWP4Gbhj063F4DaeN9PvdY.jpg
  View toward west side hall: large tree/pit in foreground right, side hall and benches behind, with paved space between pit and hall. This corroborates the west lower court location, not a tree rooted in the side hall.
- `wuying-official-3-0.jpg`, labelled 武英殿东配殿:
  https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/UhHMUrCB9642hzXeiwTSjcgVX9uxAiI3bCFqioGy.jpg
  View toward east side hall: a second large tree trunk/pit at foreground left, side hall entrance and lower court visible beyond. Needle clusters are unambiguous at full resolution.

These labelled images are referenced by `/workspace/shared/r36-evidence/pano-wuying-detail.json`, obtained through the official public panorama, linked from the official map. Metadata does not give capture dates. The repeated images must not be counted as additional trees.

Implementation: represent **two selected trees**, one on each side of the axial white-balustraded approach, near its meeting with the front-hall platform but in lower court ground. Use independent fitted offsets and crowns, not a mirrored random forest. Include only a restrained soil-pit/edging representation if necessary to avoid roots emerging from intact paving; exact pit polygon, radius and pavement cut-out require fitted treatment. Do not add a whole grass strip here merely because Wenhua has green strips. Preserve the side-hall entrances and route around pits. Do not claim this pair exhausts Wuying's planting.

## P03 Central axis exclusion evidence

Official map photos inspected:
- Taihedian forecourt: https://intl.dpm.org.cn/Uploads/Picture/2023/06/27/s649a9b7679243.jpg (`Taihe_dian_8.jpg`). Open paved court, axial approach, three-tier terrace; no planted trees in the visible court.
- Taihemen square: https://intl.dpm.org.cn/Uploads/Picture/2023/06/27/s649aa31a5cd02.jpg (`Taihe_men_13.jpg`). Five bridge/river and gate court foreground is paved and unplanted. A tree visible **behind** the western enclosure cannot be moved in front of it.
- Wumen south concave forecourt: https://intl.dpm.org.cn/Uploads/Picture/2023/06/27/s649aa9c78ad13.jpg (`Wu_men_15.jpg`). Paved space and tall red gate platforms, not an ornamental tree court.

These are view-bounded absence checks; they do not claim no trees anywhere in the southern palace. Their practical consequence is strong: no procedural trees along the central ceremonial path, on bridges, river, ramps, stairs, terraces, or within these visible paved courts.

## T/P04 Deferred planting: real, but not a license for arbitrary additions

### Eighteen scholar trees / 十八槐
Official 2016 opening notice places the ancient locust group **north of Duanhong Bridge**, east of Wuying: https://www.dpm.org.cn/announce_detail/225334.html . Its historical descriptive maximum heights/circumference are not per-tree measurements.
Official youth page https://young.dpm.org.cn/info/998 (downloaded `ancient-trees.html`) distinguishes the surviving old group described as 16½ from eighteen interplanted newer Chinese scholar trees in the 1950s–60s. No exact article date was established. Thus “十八槐” is a place/historical group name, not a reliable current instruction to render exactly eighteen trees. The page illustration/photo crop `ancient-huai.jpg` shows grass, red wall/gray masonry and an old trunk with regrowth, but cannot establish the entire layout. Defer this group unless implementing its actual bridge-north boundary, distinct tree classes and path clearance.

### Wenhua gate-front flowering trees
Official 2023 spring guide describes crabapple blossoms before Wenhua gate: https://young.dpm.org.cn/statics/images/v4/mapdownload/2023spring/map.pdf . `Wenhua_men_4.jpg` gives the external gate-front view, with trees at outer left/right planting margins and clear stairs/axis. A 2021 magazine photograph explicitly captioned Wenhua-front crabapple is saved as `wenhua-spring.pdf` / `wenhua-spring.png`: https://www.dpm.org.cn/Uploads/File/2021/07/02/u60de8eff831ed.pdf . The blossoms frame a gate frontage; trunk roots and total count are outside frame. Do not identify the four inner-court conifer-like anchors as crabapples, or copy spring flowers into an October live-state claim.

### Willow at Wuying
Official wallpaper https://www.dpm.org.cn/light/369756.html is titled 202504-武英殿-春季-柳树@山花. Its image visibly includes drooping willow sprays and a roof/gable, but not a trunk/ground location. Local `wuying-willow.jpg`. This is evidence willow occurs in the area, not permission to turn the two clearly needle-foliaged front-court trees into willows or place willow trunks by every stretch of river.

## Axis handoff, not duplicated implementation scope

Actual current code: `PalaceBuilder.buildGate` dispatches Taihemen through generic `buildComplex`; the generic terrace computes one centered stair/rail opening at each north/south end. Official frontal photo https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c931a533.jpg (`taihemen-source-0.jpg`) shows separated stone/stair approaches and a central carved imperial panel. Official page: https://www.dpm.org.cn/explore/building/236439.html . Independent axis auditor has the same image at `/workspace/shared/r38-axis-evidence/taihemen-official-a.jpg` and owns topology details. Keep copied source photos separate from model render evidence: this research has not visually compared a running R38 GPU-rendered scene.

Existing Wumen profile, south ascent and Taihedian separated south approaches already embody earlier source work. No new roof or wall dimension correction is justified from these tree photographs alone. All unmeasured new stair widths/offsets must remain F.

## Acceptance constraints for tree implementation

- Explicit metadata: partial visible subset, unknown census/current inventory, exact species unknown; source URL; capture date unknown; fitted coordinates/size.
- Four Wenhua + two Wuying selected representative anchors; root-location bounds local to real lower side courts, not blanket whole-zone planting.
- Check no root collider intersects approach/retaining walls, hall platforms, stairs, doors or side-hall paths. Crown may overhang the view as in photos, but no player-height foliage wall.
- Keep central-court exclusion and existing museum route tests. No moving tree logic into unrelated palace zones.
- Reuse efficient geometry cautiously: source silhouettes are irregular, branching, needle/conifer-like. A round broadleaf ball or perfectly stacked cone is not an observed botanical fact.
- A future full census/season system is outside this focused delivery. Historical black-and-white Wenhua images (`wenhua-official-4-*`) are explicitly labelled old photos in the API and must not silently drive current planting geometry.
