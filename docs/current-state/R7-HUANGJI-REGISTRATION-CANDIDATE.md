# R7 Huangji registration candidate — not yet visually accepted

Baseline: R6 source cb9d353adc7514639926b6fac766e771675160e5. Public R6 remains unchanged.

## Confirmed cause
R6 introduced `backDoor:true` for Huangji. CourtKit moves its B throne from local z10.55 to9.75 under that flag. The original S asset and registration still use10.55. The old asset's rear gap of roughly0.95m is a **model computation**, not an architectural measurement.

The correction translates all13 nonfloor GLB roots by the same computed−0.8m, including all5 colliders and1 non-rescue walkable. The two floor roots, mesh/accessor/material JSON, original compressed BIN and scene anchor are retained exactly. New content-addressed asset: huangji-aligned-0a79ec49e8cd.glb. The original huangji.glb and Blender generator are retained; reproduce the correction with `node assets-src/interiors/align_huangji_backdoor.mjs`. Registration coordinates now use the current B formula.

## Evidence and boundaries
- https://www.dpm.org.cn/explore/building/236476.html (live fetched2026-10-18) supports rear doors in the middle and adjacent bays leading to Ningshou, and four gilded dragon columns. It does not give rear clearances.
- Lin Shu, *皇极殿考略*, 故宫学刊2011 p114 (PDF p14), https://img.dpm.org.cn/Uploads/File/2019/12/15/u5df60ccd5aae1.pdf independently states three rear-door bays. Page image reviewed. No measured furniture/rear-wall clearance obtained.
- Existing generic model still has fifteen generated bays rather than the official nine, and one central rear opening rather than three. That larger profile correction requires its own registered geometry evidence; it is not claimed fixed here.
- This is layer consistency, not an evidence-based relocation of real palace furnishings or a statement about current public access. No walls/doorways/global anchors moved or colliders removed.

## Checks
Two focused assertions failed on the unchangedR6 source. After repair,4/4 focused tests pass, including exact asset change scope, second-shift/source-change rejection, all5COL/1WALK retained, existing exterior circuit and a CPU rear-door loop around the four real S column proxies. CPU routes use the actual CollisionManager with0.5m player radius. Ordinary visual/native passage and final integration are still pending. No browser or publication performed for this candidate.

## Seven card source follow-up
Research completed separately. No identity status is upgraded: Nanxun remains unresolved; Taiji remains inferred; Chang Kang chronology remains partial; three Nansansuo model-to-physical identities remain partial. New direct official joint-exhibition and journal evidence supports better descriptions and removal of Xiefangdian as the unique name of the model middle rear hall. Product card changes have not yet been made.
