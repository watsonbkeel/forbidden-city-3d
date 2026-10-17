# Wumen folded ascent: bounded structural preview

Base: accepted local combined Taihe preview `4ede9aaa`. The rejected indoor-light trial and partially viewed coffer LOD are not integrated.

## Visible change and source

Wumen alone replaces each single straight ramp with three flights: approach from north, turn outward, fold back onto the gate platform. The Palace Museum's 2021 exhibition plans show both sides (printed pp152–153):
https://www.dpm.org.cn/Uploads/File/2021/11/23/u619c5a27422d3.pdf

The historical article's 6.2 m width and 15.3/25.59/25.5 m horizontal lengths are documentary values; the new fit uses15.3/25.5/25.5 plus separate6.2 m landings. Heights0/3.3/10/12.3, endpoint coordinates, equal treads, masonry thickness and mirror registration are model estimates, not 2026 surveying. Existing global anchors, gate width, tower, plaques, doors, wings and Shenwumen are retained.

Two adjacent yellow south-wall caps genuinely intersect the new upper flight. Their inner ends are shortened by37.9 m; cap cross sections, distant UV paint registration, 76 triangles per cap, full solid walls, all crenels and wall colliders remain. This does not open a general city-wall walking route.

## Physics and budget

Old ascent:150 meshes,1,784 triangles,304 colliders,3 supports.
New ascent:182 meshes,2,160 triangles,268 colliders,13 supports. Net+376 triangles, no new materials/textures. Material merging remains unchanged. This is a structural count, not a new FPS or device-performance claim; original global/performance thresholds are not reset.

Six ramp supports and six physical landing supports connect to the retained platform. Ordinary routes begin at ground level with body radius0.5 and disable box rescue. Two narrow interface proxies represent the existing12 m platform masonry, preventing airborne clipping through the old height-limited wall proxies.

The visible ascent masonry parapets are1.1 m high. At only the return-south/terminal-south/outer-south/outer-end borders adjoining retained solid wall/cap, a1.5 m extra no-vault collision extent preserves the old ascent's gameplay safety convention. It is expressly virtual, not a claim of measured visible walls. The platform rails retain their existing safety proxies.

## Acceptance

Focused CPU tests cover geometry/UV/normals, both axis translations, exact wall-cap fit and unchanged surrounding enclosure, actual full-world controller routes for both sides at60/10Hz, walk/sprint and forward/backward, named support provenance, missing-flight negative controls, and finite airborne boundary probes. Sprint slows within2 m of corners; full-speed U-turns are not claimed.

Ordinary rendered imagery, full long native route, mobile and fresh6×60-frame GPU acceptance are tracked in the external release receipt. A passed Node controller test is not a phone or real browser route.

The first whole JavaScript run preserved16 failures from obsolete straight-ascent routes. Those two paths are now explicit negative controls (the removed straight ramp must not become a hidden bridge). Positive routes use all three new flights and retain the original north-terrace segments at local Z15.5 and central tower doorway. No arrival, collision, height or time thresholds were weakened, and the unchanged Shenwumen routes remain.

The second whole JavaScript run passed1902 checks; a subsequent focused98-check route run adds back the exact original north-terrace points. The compiled production bytes did not change between those runs. Historical golden fixtures remain unchanged; new strict guards bind only the5 production files and exact finite integration hunks.

Two short ordinary desktop checks rendered and served48/48 requests successfully each. The second visibly crossed the ground-level gate into the northern courtyard, but its final map overlay obscured the intended ascent view. Neither run establishes the full native ascent or a usable architectural comparison. These partial results and all images remain preserved. A separately labeled fixed-view component comparison may inspect the architecture without implying full-scene navigation or performance acceptance.

Current public access and exhibition one-way circulation are not inferred from the historical plans. This remains a virtual structural preview.
