# Taihe dais front candidate, 2026-10-18

## Evidence and bounded change

The museum's interior photograph (https://img.dpm.org.cn/Uploads/Picture/dc/14498.jpg) and its reproduced enlargement are the same scene, not two independent date records. Museum journal text describes three front approaches to the dais and two lateral approaches (https://www.dpm.org.cn/Uploads/pdf/5063/T00022_00.pdf). The four tall incense stands carrying tripod censers are explicitly described separately from the four already-modelled pairs (https://www.dpm.org.cn/Uploads/pdf/1602/T00089_00.pdf and https://www.dpm.org.cn/Uploads/pdf/1554/T00037_00.pdf).

This candidate replaces the single wide front staircase with three front flights, thin separating rails and a separately identified display cover, and adds four open-legged stands and simplified tripod censers. Existing dais footprint, height, seven-step count, throne, screen, column stations, beam frame, lighting, textures and global exposure are retained. Flight widths, stand dimensions and registration are authoring estimates. The cover is not asserted to be stone, historically permanent or a verified 2026 display. Censer material and decorative motifs are not verified. The two lateral approaches still need registration evidence.

## Budget and retention

Fine core: 17,932 triangles, eight batches; the existing permanent beams add 60, totaling 17,992 under the unchanged 18,000 ceiling. Coarse core: exactly 1,600 triangles and eight batches. Hidden S column end-cap faces are removed; all shaft walls, normals, relief and registration are unchanged. The coarse-only shafts reduce from twelve to eight facets; their end caps are hidden by the existing base/ceiling. No new texture or material is introduced.

The retirement mask removes 744 exact faces from the pinned pre-dais asset and appends 736. All nonretired ordered indices and all old vertex attribute bytes remain exact. Historical regression fixtures are preserved through an explicitly pinned finite migration; unscoped mutations still fail. Independent CPU checks verify 3 closed staircase solids at both LODs, positive volumes, no degenerate triangles, real controller round trips, actual cover support, 39 permanent collision boxes and 22 walkables, with missing/wrong/tagged/duplicate negative cases. The GLB remains visual-only.

## Actual images and limits

Two fixed views were captured from both variants, with identical positions, orientation, 70-degree FOV, floor and 1180 x 757 viewport. These are controlled visual comparisons, not evidence that a user walked the complete route. New flights and four tall stands are visible. Red steps remain dark and the urns/rails are coarse; the whole interior remains stylized. Plaque/couplet vertical registration and material/light hierarchy remain open.

Baseline capture finished cleanly in 48.36 seconds. Candidate captured the same two views and an additional native-forward image but reached the predeclared 150-second active limit. Its owned browser and port were cleaned in 0.53 seconds; no page or HTTP error was recorded. The capped run is not a full native-route or performance pass. Renderer was software SwiftShader. The between-frame renderer counters reported zero and are not used as performance evidence.

The subsequent frozen 51b54d4 package completed 132/132 fixed and 236/236 generated controlled routes, and all six original performance points at 60 frames each. Calls/triangles satisfy the unchanged +10% structural limits; SwiftShader frame-rate warnings remain. A separate native-input check walked up and back down the right front approach without penetration. This does not validate all three approaches with native input, physical mobile devices, or perfect visual fidelity. See R7-INTEGRATED-RELEASE.md for the consolidated result and retained limitations.
