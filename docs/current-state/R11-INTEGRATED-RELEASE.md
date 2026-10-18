# R11 - Taihe square-brick floor surface preview

The existing Taihe floor no longer uses the deeply relieved, staggered outdoor stone-slab texture. A self-authored dark square-brick material and narrow flush joints follow the Palace Museum's2018 west-side interior photograph, published in《紫禁城》2023 issue1, printed p147. Direct source and limitations: [official article](https://www.dpm.org.cn/explode/others/259044.html); see r11-floor/SCOPE.md.

Only the existing Taihe floor material/UVs change. Approximately0.70m brick spacing, joint appearance, color and roughness0.32 are visual trial parameters, not a current floor survey or calibrated conservation data. No museum photograph is redistributed as a runtime texture. The candidate lacks photographed object reflections and retains a bluish-gray distant surface under the unchanged lighting/fog. The whole hall remains visibly stylized, with unresolved plaque/couplet and ceiling registration.

One512x512 RGBA texture adds an estimated1,398,100 GPU bytes including full mips. Whole-scene sampling adds one draw call at Wumen and Taihe viewpoints; other four viewpoints have unchanged calls. All six triangle counts are exact R10 values. No geometry, floor height, collision, walkable, default camera or light changes. Taihe core remains17,924 triangles under its existing18,000 limit.

## Verification

-2199 CPU tests pass:2189 ESM tests in40.038s plus10 CommonJS helper tests in0.478s, two explicit invocations. No skipped/cancelled tests. Earlier focused fixture failure remains recorded: a baseline snapshot aliased arrays later cleared by dispose; the snapshot was corrected to clone before dispose, without a product workaround.
- Subpath production build passes. Frozen120-file production manifest is verified. Product commit2ee6cfdbeb2a853b6140a353ec40fc387c456f2e; later changes are tests/docs only.
- Actual baseline/candidate entrance and floor screenshots share the exact camera,FOV70,1180x757 viewport and lighting. Near square joints are visible and wrong outdoor relief is removed. A first texture trial had seams too faint; only joint texels were revised. The second run completed52.78s,cleanup0.31s,zero recorded application/HTTP errors.
- Original six points x60 frames pass the unchanged calls/triangles structural budget. One cold headed Chromium154,1280x720,high,DPR1,SwiftShader,479.84s active,0.50s cleanup; process group and port verified closed; zero HTTP/application errors. Software-renderer average0.91-1.39 FPS,P5 0.47-0.76, with six original-baseline smoothness warnings. R10 historical averages0.96-1.44; these are nonconcurrent samples and do not demonstrate actual-device smoothness.
- Geometry/navigation and fixed/generated route source are retained exactly; the existing R10 controlled132 fixed+236 generated route results are retained evidence, not a newly executed R11 matrix. No new physical mobile test. R10 native rear lateral exit remains unverified; native front entry and gold-side movement were demonstrated previously.

## Availability

This is an isolated source/playable candidate. R10's attempted Pages update was denied by the tool and remains paused for the parent's explicit user confirmation. R11 has not attempted any Pages write and must not be substituted into that denied R10 operation. Existing online R9 rollback109faf3d9e0e352d15a2ab66ca8a1f8f2c09f43b is preserved; main is untouched. Virtual walking does not imply current museum admission permission.
