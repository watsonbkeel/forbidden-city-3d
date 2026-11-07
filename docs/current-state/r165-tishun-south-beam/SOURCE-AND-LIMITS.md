# Tishun Hall: fitted south-eave beam section

Baseline: public 8386b6f0bbbe78230966b35576e11cd06310bf15. This change replaces only one existing south-eave beam geometry in the original model's F49 carrier, west-six/items/3. The same mesh, child slot14, transform, original shared caihua_beam material and all other existing objects are retained. It is not a reconstruction of the hall, its roof or its interior.

## Object correspondence and sources

The original generator explicitly identifies the tuple x87.6/z290.9/w16.9/d8.7 as 体顺堂. The correspondence is traceable through public a4d8939334a38133b04444eb4e9a1e399bb568f2, docs/research/dimensions.md line279, and public eb3d458283a56aef69225df60bdfc419f06fd71e, tools/p0c-relocate.mjs, the named yangxinSide override and its application to item3. The current public baseline retains that exact tuple. This establishes the original model author's intended carrier, not a physical survey or confirmation of every existing detail.

The Palace Museum publication, printed pages450–451, distinguishes the south-eave beam categories and layered construction. It does not supply this model's section dimensions, recess depth or painted decoration. Figure26-3 depicts the eastern enclosure rooms and is not a photograph of this hall; it is not used as a facade reference. Figure26-2 is not copied from Yanxi Hall.

Source: https://img.dpm.org.cn/Uploads/File/2020/11/13/u5fae1f8852a4b.pdf

The named current plan and Figure11 in the 2023 Palace Museum paper are consistent context, not measured coordinates or a complete facade reference: https://img.dpm.org.cn/Uploads/File/2023/11/14/u655324ce75cbc.pdf

## Exact finite change

The original12-triangle box is replaced by one closed outward-wound44-triangle stepped solid, a32-triangle increase and no mesh/material increase. Its entire solid lies within the original convex beam box: approximately17.4m wide,0.6528m high and0.45m deep in model units. The lower0.16m and upper0.18m bands retain full depth; the middle band retreats to local z±0.14m. All these dimensions and the particular section remain fitted. Six original front columns continue to intersect the retained full-depth lower band.

Production UV uses the existing applyBandUV function and the actual library band width. The formal tests verify positions, normals, closed topology, density/direction and finite legal UV values independently from the earlier neutral diagnostic's placeholder UV. No texture pixels or painted pattern are photographically accepted.

One independent feature record, west-six/items/3/south-eave-beam, is attached to the target mesh. Final architecture retains every old record and gains exactly this one record. The R63 frame's UNKNOWN inventory, UNVERIFIED use, NOT_VALIDATED room bounds and all other fields remain unchanged. Original generator correspondence does not override those interior limits.

## Verification boundaries

Bounded production-component tests cover strict target/payload/material/ownership selection, real closed geometry and old-box containment, unchanged non-target resources and registrations,70 controller variants before/after, closed doors and support checks, formal UV/normals, material merge, flight bounds, idempotence and staged failure/retry/disposal. The old private geometry and its three buffers must be independently owned before successful replacement disposes it. Failure before publication restores the old references and frees only the staged geometry. A throwing external dispose listener after commit cannot make an already-disposed old resource safe to restore; the committed record remains and retry does not dispose the old geometry twice.

The separately inspected neutral CPU before/after images show a readable stepped edge. Product positions/normals are byte-equal to that diagnostic algorithm. The near eye view sees the projecting upper band's lower edge and depth change; it is not evidence that both views directly expose the entire recessed vertical face. These are geometry diagnostics, not WebGL appearance acceptance.

The public8386 source guard permits only the private helper and exact import/hook151/call. Earlier fixtures and mixed hashes remain fixed. Full west-six evidence uses a private read-only reconstruction of only this precise target and one feature record, composed with the existing exact F50 and F51/F52 projections; unrelated geometry/contact drift remains visible. All previous404 bounded and4 heavy modules are retained; the proposed manifest is414 bounded plus the same4 heavy files, with no repeated module counted twice. These are file counts, not completed CI cases. Full cumulative/actual-region/build/HTTP validation belongs to the new candidate CI and is not claimed by these bounded results. World, browser, GPU, mobile, complete visual fidelity, surveyed dimensions and current admission remain unverified.
