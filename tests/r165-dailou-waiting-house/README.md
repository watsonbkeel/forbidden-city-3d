# D14: east waiting-house, finite exterior

This increment adds one five-bay waiting-house exterior and a low usable front porch, south of the existing Jingyun Gate. It is not the whole eastern courtyard, the northern D13 duty court, or the separate memorial-receiving office. The source-object ID is FC-418DFCE4F5.

## Sources and limits

- Palace Museum, Jingyun Gate, author Su Yi: https://www.dpm.org.cn/explore/building/236497.html. The waiting house lies inside and south of Jingyun Gate; northern duty courts are separate.
- Palace Museum, Five-Bay House: https://www.dpm.org.cn/lemmas/243903.html.
- Yan Wu and Zhao Zhonghua, “The duty-house courtyards on Qianqing Gate Square,” Zijincheng, 1983 issue 4, printed page 22: https://www.dpm.org.cn/building/talk/223497.html. The east-court identity and the common five-bay, north-facing, one-depth, front-porch, low-stone-base, yellow-tile, bracket-free description support this limited scope. Its bottom photograph AND plan depict the WEST military-secretariat courtyard, not D14's own facade. They are not mirrored or used as direct D14 photograph acceptance.
- Xu Yilin, Qianqing Gate Square, same issue, pages 14–15: https://www.dpm.org.cn/building/talk/223495.html. Historical relative layout, not a metric/current survey.
- Liu Lu, Palace Museum Journal 2020 issue 2, printed page 88: https://img.dpm.org.cn/Uploads/File/2020/03/06/u5e61ec373d950.pdf. This distinguishes waiting from the memorial-receiving office.

Every coordinate/dimension, current closed window field, roof detail, tile course, ridge, equal post spacing, palette and hidden volume is fitted. No own clear current facade photograph, interior, entire courtyard, surveyed dimensions or visitor-admission verification is claimed. The closed-body volumes and five window fields do not create a room or imply indoor access. World/browser/WebGL/GPU/mobile and actual terrain acceptance remain unverified.

## Runtime delta

Public baseline: fef5c0e1904c361e7492d744f06d82a8c137e1ea, complete tree 01e6dcbf9f0877cf24bdf632faa098fbe60f4f0a. The only runtime changes are a private helper and exact hook 152. No existing builder, physics, player, wall, road, source JSON, old registration or material is changed.

The actual final addition has 38 closed meshes, 464 triangles, five privately owned materials borrowing the library's textures, 17 pedestrian contacts and three non-rescue stone supports. Roof/tile/ridge/bargeboard meshes have no pedestrian contacts. Finish merges the addition into five material buckets and adds exactly one limited architecture feature.

The reserve x[-105.98,-83], y[0,6.8], z[144,154] is not wholly occupiable. The unique original wall6 segment, its complete brick/red buffers, slots, transforms, material identities and contact are checked. Ground and wall attachment use final Float32 triangles and the actual old brick/red inner face planes, not an approximate static wall coordinate. The old cap and all other old meshes remain protected. Contact with the named host boundary is intentional; this is not a claim of zero render contacts with the host.

## Tests and acceptance boundaries

The bounded fixture builds the exact five original gates and three original wall calls only. Its immutable public baseline contains 1852 meshes and 47438 raw triangles, including 1636 original degenerate triangles that the spatial ray helper omits. Those are different count definitions, not a changed old fixture.

Component/geometry/negative/lifecycle/projection/merge tests cover complete old bytes and all registrations, final closed topology/outward normals/finite physical UV density, exact reserve/ground/host attachment, absence of roof supports, missing/duplicate/modified host rejection, every real attribute allocation failure, material/publication failures, release-error aggregation, retry and final exactly-once private disposal. The new-delta projection rejects changed target bytes and preserves real unrelated mesh/contact/metadata drift. It never refreshes a mixed historical hash.

The route fixture preserves all 152 old before/after variants, then 12 new positives, four closed negatives and an actual barrier/recovery pair. The original native controller is observed once without extra queries: tracked zero/null, update-before query arguments, default footprint radius, low supports and every moving/settling update are checked. Complete original frames and query ledgers are written before consumer assertions. The omitted-step negative is a static support-registry check, not a controller rerun. Seven separate own-surface first-hit gazes follow the new routes in the same scene/CM with every old occluder retained. This is spatial visibility, not simultaneous whole-facade/PBR/photo acceptance.

The additional production-zone test builds the entire real axis-courts before/after, compares exact projected geometry/records and all 152 local route variants, and reruns the new routes/gazes in the full-axis CM. It is a separate fifth heavy root for cumulative CI. It has not been run locally. The original four heavy roots, all 414 old bounded roots, the deferred original World/rear-middle/rear-right/scan contracts and every existing extra remain intact. Local subset routes are not those full World tests. CM ground0 fallback is not actual terrain proof.

Historical source fixtures and before/after hashes remain fixed. The source chain accepts only the exact byte-hashed two-file D14 profile before peeling the prior Tishun and older profiles. The synchronous contract retains all original 156 operations, adds the explicitly named hook 152, and includes 190 actual identity/order/adjacency mutation negatives. No broad special/data exclusion is used.
