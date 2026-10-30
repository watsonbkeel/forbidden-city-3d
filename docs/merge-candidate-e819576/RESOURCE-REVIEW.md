# Resource ownership review
Independent reviewer yikun_review,2026-10-30.

Legacy r35-resource-ownership.test.mjs expects exactly one kit_plaques mesh and30 records. Exact exported main-equivalent e3efba2b,3987742 parent and frozen e819576 all instead produce the same two distinct atlases and31 records. Horizontal atlas covers古华轩/遂初堂/畅音阁/阅是楼; its module is byte-identical across all3 versions, predates this cumulative window work. Vertical and horizontal materials and textures are separately owned. Test fails at plaques count, not the nine-dragon photo face.

Dynamic complete Ningshou zone4 rebuild cycles on each version, each disposed twice: both distinct atlas materials/textures and photo material/texture dispose exactly once per generation; all shared textures/materials dispose zero times. New Yikun complete west-six4-cycle check:6 private materials/1 texture each dispose exactly once per generation. Texture ownership is explicit material-dispose listener, not ownedTextures. New target focused lifecycle/failure cleanup/surface recheck30/30 passes.

This evidence distinguishes the two real atlas identities; it is not a blind change of1 to2 and does not weaken original tests. Reports atlas-{main,parent,candidate}.json/yikun-resource.json and reusable scripts preserve findings. Legacy test remains failing as recorded; GPU/native-memory and long-run browser leakage were not measured.
