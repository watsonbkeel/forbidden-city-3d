# R11 Taihe interior square-brick surface candidate

## Direct evidence

- Palace Museum building page identifies the interior as gold-brick pavement (ceramic paving, not gold metal): https://www.dpm.org.cn/explore/building/236465.html .
- Men Xinning, *Costs, supervision and use of gold bricks during Qianlong*, Forbidden City, 2023 issue1, printed p147: https://www.dpm.org.cn/explode/others/259044.html ; official PDF https://img.dpm.org.cn/Uploads/File/2023/02/09/u63e491eaebc75.pdf . The actual PDF page2 was rendered and inspected. The caption dates Yu Ningchuan's west-side Taihe panorama to2018. Its dark square paving, fine joints and glossy response differ visibly from the application's rough, staggered, irregular rectangular outdoor slabs. The panorama is fish-eye, not a metric survey.
- The caption describes two-chi-two-cun bricks. A separate official2020 archival construction table describes historical two-chi bricks; it is not a current per-brick survey. Current exact edge dimensions and joint widths are not established. The candidate uses approximately0.70m as an explicitly estimated visual spacing, compatible with the caption's nominal scale, not a surveyed dimension. Do not average incompatible historical/current specifications or claim a measured count.
- Museum2014 maintenance report confirms the specialized brick floor and oil-treated cleaning: https://www.dpm.org.cn/classify_detail/180964.html . It does not calibrate RGB/PBR values or prove2026 surface condition.

## Limited implementation

Only Taihe's existing floor plane receives a dedicated self-authored4x4 square-brick texture and UV period2.80m. Original per-tile subdued variation and narrow flush joints replace the generic outdoor slab color/normal maps. No museum image or generated photograph becomes a runtime asset. Color, seam appearance and roughness0.32 are trial parameters; no photographic conservation-color claim.

One512×512 RGBA texture,1,398,100 estimated GPU bytes including full mip chain, cached/disposed once. Existing floor mesh, position, normals, index, receive-shadow setting, collision, walkables, lights and camera stay unchanged. No additional geometry. Splitting the previously shared floor material may add a draw batch; whole-scene count must be observed, not hidden behind the18k core limit. No mirror/reflection pass is introduced; the candidate cannot reproduce all reflected objects in the2018 photograph.

## Verification plan and boundary

Focused CPU tests check texture determinism, tight straight joint layout, color-space/mip settings, single ownership/disposal, exact other geometry/navigation and unchanged Baohe/Qianqing halls. Fixed baseline/candidate entrance and downward floor views use identical ordinary application cameras, one renderer sequentially, no native-route claim. Retention fixtures and required release checks follow only after actual pixels show useful improvement.

R10 remains frozen; no R11 files enter its publication candidate. The rejected R10 Pages update is not retried by this work.
