# Own-source freeze

## Positive evidence

- [故宫博物院：南三所](https://www.dpm.org.cn/explore/building/236452.html): common gate three bays wide, one bay deep, green glazed xieshan, central opening; 礓磋慢道 inside and outside. This source supplies the type, not measured dimensions.
- [王宪明《撷芳殿三题》p.40](https://img.dpm.org.cn/Uploads/pdf/1953/T00040_00.pdf): upper photograph expressly captioned **南三所宫门**. It supports the coarse common-gate silhouette and central portal, not literal color/pattern/leaf census. SHA256 `51fd6c0734dca087d1241acf02f74420d3a8a8ab4606b6625a9717f32214969f`. Lower photograph is **中所后殿** and is not gate evidence. Publication/photography date not inferred from the URL.
- [Official aerial](https://img.dpm.org.cn/Uploads/Picture/dc/4647%5B1024%5D.jpg), SHA256 `aca389dae76c3927951c2cf7462021e14a13609c5a09210c7e7fdba0afd0ae7d`: context for common-gate vs three individual courtyard gates. Contains old temporary structures; they are not modeled.
- [Official visitor map](https://img.dpm.org.cn/static/themes/image/xf/map3.jpg), SHA256 `e3c8a08d63b4f254657b668022cab24eb5eedfce421052f1a73f291163864796`: common-gate circulation and separate courtyard gates. Tourism diagram, not a surveyed plan or license to relocate six halls.

All four were viewed locally. Original official pixels/PDF are retained privately, not included in this candidate repository package.

## Bounded fit and uncertainty

- Original gate at `outer-east/items/10`, FC-B0B56A63EE; original south court wall at item 11. Center (-285,20), nominal w=12 and returned wall cut 14.8 m are inherited. The former generic gate treated 12 m as one large opening; the new model treats 12 m as a fitted total three-bay body while retaining the cut.
- Width/depth, column height, three-meter ramps, 0.5 m platform, portal size, eave curvature and plain red/green/wood hues are reversible engineering estimates, NOT surveyed values or normalized exact-photo measurements.
- Central single opening is sourced; a two-leaf plain virtually open pose is a circulation choice, not a photographed pose. Studs, original plaque, carved decoration, rear face details, exact roof-ornament census and hidden joinery are unverified and omitted. Closed flanking masses are a deliberately undetailed inaccessible shell, not an interior reconstruction.
- The six existing hall declarations, their uncertain identities, the three glazed courtyard gates, third hall row, back罩房 and well pavilion are outside this change. No third-row/removed building is invented.
- Existing 0.35 m ordinary low-step clearance is unchanged. Visible ramp top and explicit ramp support coincide. Strictly inscribed 0.125 m collision cells stay inside the solid ramp; maximum vertical deficit 0.02084 m. No broad full-ramp AABB or shared physics extension. Upper architecture and complete generated roof use actual source triangles with Float64 world vertices.

This is a source-supported practical gate fit, not whole-object or 12-ID acceptance.
