# R67-I official-photo read-only audit

Audit date: 2026-10-24 UTC. This is an internal source audit, not a completion claim.

## Result

31 original official photographs were downloaded to this private temporary cache and their actual pixels inspected. The 29 master-list records remain distinct. Existing product source was read, not modified. No original photograph was copied into the repository or redistributed. Museum pages do not establish 2026 display inventories; upload paths are not photography dates.

## Five bounded implementation candidates

1. Ning Shou Palace south facade: independent three-panel transom row and red timber.
   - Official page: https://www.dpm.org.cn/explore/building/236471.html
   - Pixel reference: https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efef763d2b82.jpg
   - Local: private cache: ningshougong-2020-a.jpg
   - Seen: each visible ordinary bay has three separate short upper transom panels, a separating horizontal member, tall straight lower mullions, red painted frames, and grey low masonry. The opening is off-centre, east secondary bay; do not move it to the centre.
   - Current source: RemainingNingshouHalls.js buildNingshou invokes generic facade(pattern='straight'); panel creates one tall wood-framed field with crossbars, not three separately framed upper panels. Its default sill-wall is red, rather than the visible grey masonry.
   - Bound: only south-facing NingShou window fields and their own panel materials; preserve p.portals, 7 bays, rear doors, outer envelope, collisions, and interior inventories. Geometry heights are photo-proportional fits, not measured data. Do not pretend to replicate the dragon carving or infer rear ornament from this front photo.

2. Jing Qi Pavilion: distinguish upper lattice windows from lower glass windows.
   - Official page: https://www.dpm.org.cn/explore/building/236480.html
   - Pixel references: https://img.dpm.org.cn/Uploads/Picture/dc/4750[1024].jpg and https://img.dpm.org.cn/Uploads/Picture/dc/8275[1024].jpg
   - Local: jingqi-front.jpg and jingqi-bridge.jpg in this cache.
   - Seen: upper facade has dense geometric lattice and a continuous balcony. The second image shows restored red posts/green decorated balcony fascia, unlike the greyer surface of the first image.
   - Page distinction: lower windows are glass; upper windows use step-pattern lattice. This supports a categorical upper-versus-lower difference.
   - Current source: buildJingqi calls twoLevelFrame(pattern='glass'), which applies the same pattern to both facades. A separate upper pattern option would localize the correction without altering openings or floors.
   - Bound: upper front window fields only; leave lower glass, stair/bridge assumptions, and geometry intact. Do not repaint the whole structure grey based on the older-looking photo. Exact lattice motifs and dates remain unresolved. The photographed interior corner is empty but does not prove the entire building currently lacks furniture.

3. Yue Shi Lou: continuous green rolled-roof side verge.
   - Official page: https://www.dpm.org.cn/explore/building/236461.html
   - Pixel reference: https://img.dpm.org.cn/Uploads/Picture/dc/1565.jpg
   - Local: private cache: yueshi.jpg
   - Seen: yellow field tiles have conspicuous green borders along the curved gable silhouette and down the hip transitions, not only two horizontal eave stripes. Side walls are pale and the facade red; one roof covers two floors.
   - Current source: buildYueshi correctly requests rolledRoof(tile='yellow',trim='green'), but rolledRoof emits only front/rear glazed-eave-edge boxes. Its curved side end has no green edge.
   - Bound: YueShi-specific green verge mesh follows existing barrel/hip seam, without a straight ridge or a second roof. Keep source-fit dimensions and collision/navigation unchanged. Do not globally apply to every rolled roof without its own photographic evidence. No claim of exact ceramic tile counts.

4. Chang Yin Ge: red exterior balcony railings, not generic brown timber.
   - Official page: https://www.dpm.org.cn/explore/building/236437.html
   - Pixel references: https://img.dpm.org.cn/Uploads/Picture/dc/2604[1024].jpg and https://img.dpm.org.cn/Uploads/Picture/dc/1492[1024].jpg
   - Local: changyin-front.jpg and changyin-level1.jpg.
   - Seen: exterior rails on the open lower stage and upper balconies are red; main posts are green. Independent front and lower-stage reverse views corroborate the lower red railings.
   - Current source: buildChangyin already recolours posts green. The changyin-ground-perimeter-rail and changyin-upper-stage-rail use rail's default wood material.
   - Bound: only those two exterior role families may be recoloured red. Preserve well guards, internal rails, rear stairs and all geometry/colliders. Do not replicate the red chairs/tables in the photo as a verified present display; these are scene-specific movable furnishings.

5. Fan Hua Lou: front upper balcony lower panels and broad decorated fascia.
   - Official page: https://www.dpm.org.cn/explore/building/236572.html
   - Pixel reference: https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efeecf846027.jpg
   - Local: private cache: fanhua-front.jpg
   - Seen: the upper-front guard has a low red-framed rectangular-panel row, pale/green shaped balusters, a red top rail, and below it a broad green-and-gold continuous fascia. It is not a generic brown pair of bars with thin evenly spaced sticks.
   - Current source: buildFanhua uses generic perimeterRail, which emits two wood bars and 0.07-wide straight vertical sticks; upperFloor supplies a thin slab but no broad front fascia.
   - Bound: front upper balcony only, fitted simplified guard silhouette and restrained observed palette, retaining clear widths and existing collision line. Do not reproduce unmeasured fine floral patterns or apply the design to unseen rear faces. Actual moulding measurements and repetitive ornament counts remain unknown.

## Coverage boundaries and object identity

- Exterior image inspection covers 20 named standalone exterior subjects, plus the historic JingQi stage image. The combined South/North Thirteen Rows parent is supported only through its separately identified child pictures, not by an extra building.
- Six names have no securely attributed body photograph in the master source set: 敛禧门、履顺门、蹈和门、保泰门、养性门、贞顺门. Keep them explicitly awaiting photo/location verification; names do not authorize new geometry.
- 庆寿堂 is a four-courtyard group. 寻沿书屋 is its first court's hall. The official second court's hall is also called 庆寿堂. Existing five-bay item is only a candidate for the second court and cannot pass the group; do not duplicate or forcibly bind it until the court order/coordinates are reconciled. The two official images do not unambiguously locate that candidate.
- 景祺阁戏台 belongs inside 景祺阁, not a freestanding building. Its only separate photo (52052.jpg) is black-and-white with strong illusionistic painted architecture. Do not infer current colours, or turn painted columns/corridors into walkable rooms. Its concave stage description is historical architectural evidence, not current furnishing inventory.
- 养性殿的东暖阁、长春书屋、墨云室、香雪堂 and 景福宫的五福五代堂 are spaces/names within their parents, not additional buildings. No reviewed photo verifies their full current contents.
- 乐寿堂 exterior does not prove the current jade-mountain placement or all internal galleries. 颐和轩 exterior does not establish the entire rear link to 景祺阁. 景福宫's single front-corridor view does not establish the whole roof or interior.
- 皇极殿 interior source is one frontal view; it verifies the visible screen/throne/gilded-column relationship but not all ceilings, side rooms or back doors.
- 佛日楼 exterior reveals the moon gate, stone-facing and upper gallery; it does not establish the two floors' statues or exact external stairs. The image is heavily occluded.
- 南十三排 and 北十三排 are separate row groups. The pictures show grey brick/grey-tile ancillary structures, not red-yellow palatial halls. Neither group name is an automatic count of 13 exact current instances.
- 珍妃井 and 九龙壁 are outdoor objects with no closed interior. The well picture supports its barrel-shaped stone curb with visible central opening, not an invented underground route.
- 皇极门、锡庆门 are wall-gate ensembles, not halls with furnished interior rooms. 宁寿门 is a five-bay gate hall with three frontal stair approaches. The reviewed static images alone do not establish rear decoration.

## Additional cautions

景福宫 front corridor has pale warm ochre columns and light bases, unlike generic red columns. This is a useful later photographic lead, but it is deliberately not one of the five priority changes: the small, undated photo and illumination limit precise material claims. The page confirms lotus-carved bases; current plain-cylinder bases remain simplified, not verified replicas.

The web reader timed out for 236480, 236539 and 236564. Direct read-only HTTPS downloads of the exact same official pages succeeded; HTML is cached here. All image downloads succeeded. No denied operation was bypassed. Product visuals/runtime screenshots were not rendered by this audit; code-dispatch mismatches above still require final rendered before/after review by the implementer.
