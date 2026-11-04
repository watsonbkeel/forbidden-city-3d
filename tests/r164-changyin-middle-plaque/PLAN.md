# Changyin middle-eave title: minimal design and plan

Official building236437 identifies the middle-eave title 导和怡泰; photo2604 shows a horizontal dark field/gold-letter board there. Current code only retains the upper 畅音阁 label. Add one independent source-bound middle board using normalized traditional 導和怡泰, right-to-left. Plain rectangular gold rim and system font are explicit fits, not original calligraphy/carving. Lower 壶天宣豫 and side couplets remain unbuilt.

Source host is the exact current Changyin at(-336.6,365.5), rotationPI,3stages, middleeave10.8. Fitted local centre(0,10.2,-6.96), face3.0×0.8m, frame3.12×0.92×0.12m. Upper edge overlaps the existing10.575–10.825 bearing vertically; front stays before it. No old geometry, atlas UVs, physics, movement, rooms or maps change. Separate private512×128 canvas prevents changing shared atlas slots. No collision or support is added for this decorative high non-visitable board, consistent with existing nameboards.

1. Capture actual ae73 NingShou old raw geometry/physics/roof before product edits; freeze source.
2. Red real-component test for missing title; source/mutability/duplicate/failure cleanup and actual front-facing/occlusion checks.
3. Stage independent materials/texture/geometries, one ZoneBase hook before finish. All guards before allocations, all allocations before synchronous commit.
4. Real production singlezone keeps old snapshots and cumulative routes; inspect image text/UV orientation and glyphs. No World/browser/GPU.
5. Independent review, necessary bounded regression and cleanPages-base build; only then upload unique successor and fullreadback. ae73/main remain.
