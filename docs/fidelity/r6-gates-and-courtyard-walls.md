# Gate/wall integrity, 18 October 2026

This is a source-supported topology and collision correction, with provisional numerical registration. It is not a surveyed or complete reconstruction. Base tree 5edbfe051fc9efd162ec9bdeecffeef65425a8cb is shared by the accepted local c060426c and owner-merged main 0b28e5ee. Building anchor coordinates are retained.

## Implemented changes and basis

- 保泰门 faces east and 履顺门 west. The perimeter through 保泰门 and 敛禧门 is straight. Source: 王子林,《乾隆太上皇宫宁寿宫营建考》,《故宫学刊》2011, printed p.125/PDF p.4, quoting《钦定日下旧闻考》卷十八. https://img.dpm.org.cn/Uploads/File/2019/12/15/u5df60cf540978.pdf#page=4 . The separate earlier-palace diagram on that page is not used as the current plan.
- The old two nested-bounds court records emitted no geometry. They are replaced by an explicit shared compound: 皇极门 crosswall, 宁寿门 south boundary, longitudinal sides, side passages at 皇极殿 and returns to 宁寿宫. 皇极殿 has a rear connection. Official sources: https://www.dpm.org.cn/show/225714.html ; https://www.dpm.org.cn/explore/building/236471.html ; 张中义《皇极殿·宁寿宫》, 1981, printed p.70, https://www.dpm.org.cn/Uploads/pdf/1609/T00070_00.pdf . Walls simplify the documented side wings; side-wing buildings and decorated垂花门 are not reconstructed here. No independent tall wall is placed between the two halls.
- 东华门/西华门: three tunnels, rectangular outward openings and vaulted tunnel interiors, five-by-three-bay veranda and two-eaved hipped roof. https://www.dpm.org.cn/explore/building/236502.html and https://www.dpm.org.cn/explore/building/236501.html . Official photos inspected: https://img.dpm.org.cn/Uploads/Picture/dc/3912%5B1024%5D.jpg and https://img.dpm.org.cn/Uploads/Picture/dc/8238%5B1024%5D.jpg . Photo dates unknown. City-facing portal mouths are conservatively represented as rectangular too; their exact façade treatment was not independently verified. Fixed-open leaves are a virtual circulation choice, not a statement of current visitor access.
- Invalid court bounds/openings now fail before emitting a partial/empty enclosure. This is a data-contract correction, not historical evidence.

## Numeric choices, not measurements

The east Ningshou perimeter moves from model x=-360 to x=-354 to meet retained gate anchors x=-354/-353.8. This is a shared straight-wall fit, not a georegistered survey. Published compound dimensions 406×115m and wall height8m (王文涛,2015,printedp.356/PDFp.4, https://www.dpm.org.cn/Uploads/File/2020/03/27/u5e7db6f5d6c90.pdf#page=4 ) are not used to assert the accuracy of our perimeter centerlines or legacy7m height.

New internal boundary x=-328/-258 retains the old intended courtyard band. 南界 z=224 meets the existing 宁寿门; side crosswalls z=287.7 and north returns z=319.1 meet retained hall faces. Inner wall height6.5m, openings3.2m/2.8m, and their positions are provisional fits. The named 凝祺/昌泽/垂花门 references identify the intended circulation, not newly surveyed gate positions.

City-gate platform width30m/height9m and portal width5.5m/height6.5m preserve legacy scale. Depth14→15m closes the model west enclosure contact (0.1m overlap). The 24×9m tower,6m columns,1m vault rise,10-segment vault approximation and 1×1.3m inter-eave plaque are model choices. Plaque uses system-font traditional Han labels, not a traced original inscription; frame simplified. No global roof/light/exposure change. No ascent or publicly accessible tower interior is implied.

## Explicit remaining gaps

- 蹈和门 z304.3 and 保泰门 z336.5 retain inconsistent model registration against the documented rear crossstreet. A clear rear street is preserved, but exact endpoint alignment is not claimed.
- 皇极门 still has an inherited five-bay gate-hall shape; the museum describes three glazed wall gates (https://www.dpm.org.cn/explore/building/236451.html). This larger geometry correction remains open.
- 宁寿门 retains simplified façade/roof proportions; detailed rear doors, end bays, splayed screens and shared stone platform remain incomplete.
- Some of the other74named gates are still generic forms. Inventory and collision integrity do not certify their historical accuracy.
- Source photos are reference evidence only and are not bundled into application assets. No generated image is used as historical evidence.

## Regression boundaries

The restored rear connection changes one automatically generated route from 蹈和门→宁寿宫 to 宁寿门→皇极殿 rear→宁寿宫. A finite before/after descriptor is retained separately; old fixtures and hashes are not rewritten. Current route is checked with actual collision geometry and a route around the throne, never through furniture. The new six city portals require bidirectional controller checks and solid-pier rejection. Native visuals/passage, full regression and final release status are reported separately; this document alone is not acceptance.
