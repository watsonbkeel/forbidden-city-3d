# E2 practical bridge-group candidate

Root approved source-bound engineering candidates2026-11-01 02:46UTC; not surveyed absolute coordinates or a <=0.3m source-error claim. Goal: actually visible, traversable objects in the reliable topology; harmless sub0.3m finishing differences need not be chased. No canonical acceptance/counter promotion.

## Source and identity
Official map `https://img.dpm.org.cn/static/themes/image/xf/map3.jpg` (1536x2638, SHA256 e3c8a08d63b4f254657b668022cab24eb5eedfce421052f1a73f291163864796) enlarged southeast(1000,1580)-(1480,2120) clearly separates three parallel NS bridges before three tiled wall-gates from the single east-west Donghua bridge farther southeast. Official `architectural_art/246281.html`, `lemmas/243907.html`, and Nansansuo research confirm identities/topology. The2024 Three-Gates wallpaper264740 is flowers/wall only and supplies NO bridge geometry. Map scales/positions are illustrative; exact carving/counts/angles remain unknown.

The same map enlarged near Xiehe shows NS half-bridge east of the north gallery over the east-flowing channel, before its north turn. Official1982 `T00005_00.pdf` states one east rail and west gallery relation. Prior own2839/3761 plan records a real west grass band/high foundation, not a bridge deck at gallery floor2.4. Source pixels for that prior full-cube pass remain absent; no tile403 retry.

## Approaches
- Retain wrong axis/detached half bridge and omit three bridges: safe but cannot deliver the known topology.
- Move river/gallery to invented bridge coordinates or clone Wuying's distinct ornament: rejected; unrelated changes/false identity.
- **Approved practical candidate:** fit source-bound objects to the existing correct channel/culvert interfaces, with explicit unsurveyed coordinates and actual deck/cover support. Keep all existing banks/polygons/other bridges unchanged.

## Candidate / implementation calls
- Three independent IDs `three-gates-west/middle/east`, x=-255/-267/-279,z=-149, axisZ,width4.5,length14,crest.25m. These fit the existing east-west channel between Wenhua and Donghua, not the three Nansansuo hall axes. Use plain existing stone arch/simple railing forms, not Wuying cap/panel shapes or Duanhong lions. Current Three-Gates building itself is not present and is not silently equated to Nansansuo's+20 gate.
- Replace only old `xiehe-banbi` instance: axisZ, x=-112.97,z=-278,width5,length16,crest.35, east-only railSides[-1]. West edge=-110.47 coincides with existing Xiehe culvert east end; east edge=-115.47. The culvert and all river anchors stay unchanged.
- The west grass/covered strip extends x[-110.47,-107.37],z[-286,-270]. Its middle z[-282.55,-273.45] is an actual thin grass cap at y.16..18 on the existing physical roof; north/south bank segments are real low grass solids from unchanged dry ground0 to.18. Each exact rendered box gives collider and rescue:false walkable. These bank landings prevent a whole-footprint water guard sealing the cap edge; they are visible, not phantom support. A narrow owned union of stone deck and visible cap governs water permission, including the open west join; outside water stays forbidden. Never add a hidden plane, general water exemption, full-gallery floor or arbitrary bridge-underfloor rescue.

## Files and tests
`SouthWaterSystem.js`: own entry replacement/three entries, local optional half-bridge cover consumption, no broad solver. New focused `BanbiCoveredCrossing.js`: only exact existing half/culvert identity, cap geometry/box/union allowance; rejects mismatched target/invalid parameters. No shared Collision/ZoneBase/PalaceBuilder change.

Before code, tests fail on missing three instances/wrong half axis and absent real cover passage. Tests compare baseline bank/water/main-five/other-bridge profiles exactly; verify actual mesh rays/underpass, stone/cap registered support, real east rail and open west interface, non-water exemption perimeter, real-controller10/60Hz walk/sprint NS crossings and lateral cover joins. One actual production full World batch verifies both new groups, retained Donghua/Wenyuan and high gallery preservation. Build3bases and CPU/source comparison; browser remains separately blocked/unverified. Raw pixels/logs stay outside repo. Root/Astra/integrator review before acceptance.

Independent Astra review correction: the initial proposal reused historical gallery depth4.2/edge-105.97. Actual cumulative D north gallery is depth7 withpad.5, east foundation edge-107.37. Cover now derives that edge from the unchanged SideGateGalleryProfiles consumer; do not bury1.4m grass inside the high foundation or pretend low travel to-107 is possible. Low route endpoint-108.1 stays outside the real wall; -107 remains explicitly blocked.
