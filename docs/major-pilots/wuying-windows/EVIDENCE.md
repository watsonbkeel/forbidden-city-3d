# 武英殿本殿南四樘窗 — source-bound local checkpoint

## Identity and observations
- Entity FC-786C150547 / MASTER429; main hall, not 武英门, rear hall or 文华殿.
- Official building context: https://www.dpm.org.cn/explore/building/236500.html
- Official panorama: https://pano.dpm.org.cn/#/panorama?regionId=70&secondAreaId=147&vpId=3542&sphPicId=1943424062764208128
- Personally inspected retained public panorama front, front-detail, right and left-edge tiles; the front 武英殿 plaque binds the identity. Metadata cache identifies viewpoint 3542. Photography date is not supplied.
- Four flank window ensembles, each four leaves (16 total), curved overlapping red lattice, grey-green/dark backing, narrow red sill over a grey masonry-color lower field. The central doors show a different composition including decorative lower skirts: do not propagate those skirts into the windows.
- Private inspection cache: `source-recon-20261029/wuying-{front,front-detail,r,l2}.jpg` and matching tile metadata, outside this repository. No source photo pixels are packaged or copied into the procedural texture.

## Implementation boundary
`WuyingSouthWindows.js` replaces precisely four registered opaque source slabs, using complete 4-leaf frame/lattice/backing/masonry ensembles inside each existing slab envelope. One original 256 × 768 canvas texture is shared by 16 fields. It is a source-guided overlapping curved-loop interpretation, not copied Wenhua texture, exact carving, measured dimensions or a reconstructed opening. Narrow red rails and masonry tone are retained-envelope visual fits. Continuous opaque backing remains behind the front treatment.

The existing central two folded access leaves stay unchanged; the six-leaf closed source composition remains unresolved. All other meshes, collider/walkable/room/region/map data, slab extents, floor and navigation remain unchanged. No shared material mutation, new dependency, source-image asset, main edit, push or deployment.

## Independent review and correction
Independent reviewer personally inspected source and generated pixels. The initial WIP motif was a bowed honeycomb without sufficient overlap. Increasing loop radius from 0.5 to 0.62 of pitch creates actual crossing/overlapping loops. An intercepted-canvas path test fails the original tangent motif and passes the corrected overlap; raster crossing and opaque color tests supplement it. Reviewer re-rendered the actual corrected texture, reran 35 focused tests and approved with no remaining blocking code findings.

## Acceptance limits
This is a bounded local source/code checkpoint, not whole-hall acceptance. Browser/GPU matched views, precise carved joints, source-camera color calibration, survey measurements, central-door correction and whole-hall visual acceptance remain pending. World trace comparisons establish unchanged behavior only, including inherited invalid starts/non-arrivals; they do not certify those routes.

Verification harness note: the initial copied trace coordinate substitution introduced a syntax typo, caught immediately by Node before any world execution. The trace script was corrected, both modes rerun successfully, and the final candidate rerun after the lattice correction; all 96 rows match exactly. Initial orchestration log retains this error for transparency; final world comparison supersedes its initial two exit codes.
