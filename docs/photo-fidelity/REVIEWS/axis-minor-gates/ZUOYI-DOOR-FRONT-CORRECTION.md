# 左翼门: front-face stud-row correction, bounded component

Target: FC-BC06FBAC15, `axis-courts/items/2`, at (-106.47, -53.1), facing east. Baseline commit: c9a82aa. This is one partial correction inside R58-A, not a separate release, whole-door reconstruction, or browser acceptance.

## Evidence and reproduced mismatch

The official named [202411 left-wing gate photograph](https://www.dpm.org.cn/light/368399.html) and [202509 door-gap photograph](https://www.dpm.org.cn/light/372706.html) were actually viewed privately. The first shows nine vertical rows; the latter confirms a paired door and hardware but not additional count or dimensions. Outer horizontal edges are cropped. Neither establishes the complete horizontal column count, gate body, reverse faces, exact hinge position, or metric hardware location. Official photographic pixels are not included in these code/assets/reports.

Actual project HD and SD albedo pixels both contain ten rows. Real TextureLibrary materials reach the two original HallKit BoxGeometry -Z skins with full [0,1] UVs, unit repeats and clamp wrapping. This reproduces the mismatch at the material/mesh boundary rather than trusting the generation prompt, which incorrectly asks for nine. See `reports/r58-zuoyi-door/baseline.json`.

## Bounded implementation

`ZuoyiDoorFront.js` has a strict declaration and existing-frame/leaf guard. It partitions the original leaf's twelve triangles into its original ten side/back triangles and two original front triangles, preserving every position, normal and UV. The front is a child mesh with zero relative transform. This survives the existing production `CourtKit.finish()` merger, unlike a material array which that merger would omit. No shared merger, HallKit, texture factory, gate geometry, portal position, opening pose, physics, or source image changes are included.

The new albedo and normal textures derive only from the project's existing generic door assets. The exact empty-hardware band y=136/1024 through 234/1024, containing the second stud row, is removed; the remaining content is continuously rescaled to full height. All horizontal content and x positions remain. The existing eight horizontal columns are inherited and explicitly unverified, not source-confirmed. Complete top/bottom bands and the complete existing lion-ring image remain. No new lion sculpture is invented.

The 1024/926 vertical scale is approximately 1.106. It shifts and elongates inherited ornament vertically by 10.6%; the removed-band join creates a slight albedo discontinuity. These are explicit residual approximations. This patch only corrects nine-row count. It does not certify the generic red/gold treatment, ornament, hardware position, leaf dimensions, row spacing, hidden faces or whole gate. The reviewed CPU image shows no cut-off or severe deformation, but is not browser/PBR/visual acceptance.

Both leaves share the derivative material. Derivatives live in the existing TextureLibrary color/normal/material maps, so normal cache ownership and disposal apply. A new THREE.Source is required: merely cloning a Texture shares Source, and assigning image would mutate the shared original. Tests specifically verify this hazard, unchanged original albedo/normal pixels, independent source objects, instance reuse and disposal exactly once.

## Integration-owner-only hook

No shared entrypoint is edited in this component commit. Add one import in `src/scene/zones/ZoneBase.js`:

```js
import {applyZuoyiDoorFront} from '../palace/special/ZuoyiDoorFront.js';
```

Immediately after `const width = this.kit.gate(params);` in `buildGate(item)`, add:

```js
applyZuoyiDoorFront(this.kit, this.kit.root.children.at(-1), {
  zoneId: this.zoneJson.id, itemIndex: this.zoneJson.items.indexOf(item), item,
});
```

The helper independently rejects any other zone, ordinal, identity, exact anchor, cardinal rotation, gate style or altered default profile; it validates both original leaves before allocating derivatives. It neither binds by name alone nor changes the JSON declaration. Actual-image correction requires the production TextureLibrary ownership maps and successful HD/SD source loads. A material-only CPU double, an unloaded/failed 64px albedo fallback, or a missing/mismatched normal map leaves both original doors unchanged. The frame and merged root retain NOT_CORRECTED / SOURCE_UNAVAILABLE, never a false nine-row claim.

After the owner adds the hook, run:

```sh
node --test tests/r58-zuoyi-door-dispatch.pending.mjs
```

Before wiring this test has five correct negative passes and one expected positive failure (zero front triangles, expected four). It is intentionally not recorded as end-to-end success. Once integrated, rename/enable the file as a normal test if desired.

## Verification scope

- `node --test tests/r58-zuoyi-door-front.test.mjs`: real HD/SD pixel rows, strict binding negatives, unchanged triangle/UV/pose/physics bytes, actual production merge persistence, original pixel hashes, ownership, independent Source, cache reuse and teardown.
- `node tests/r58-zuoyi-door-diagnostic.mjs`: before/after final merged triangles and runtime textures, sampled by their actual UVs; no concept render and no official-image texture.
- Full-real-library final merged geometry (ignoring only changed front material identity) has equal SHA256 before and after: fa41019a480e7252d33b845f74a42ecbe6fbc466796bb6a21bba446ebff2a123.
- `before-actual-merged-front.png` and `after-actual-merged-front.png` are CPU albedo/UV diagnostics without lighting, shadows, tone mapping, browser or user-interface acceptance.
- No full-world build, browser retry, dependencies, public upload, main/Pages or release identity changes were performed by this component worker. Cumulative-world and actual entrypoint verification remain integration-owner work.

## Loading-failure follow-up

The follow-up to frozen component commit 86fe511 adds source-availability guards and a reusable QA transport adapter. The true normal assets are lower resolution than albedo: HD normal 381×512, SD normal 190×256. The accepted albedos are HD 762×1024 and SD 381×512. Both dependencies must exist after a successful real production load/configure path. The missing-source guard does not change generic texture defaults.

`tests/lib/r58-zuoyi-real-texture-loader.mjs` invokes actual TextureLibrary.load(). Its only adaptations read the actual manifest and decode local image bytes in place of network transport. The production load method itself configures textures and sets loadedFromFile. No successful-load metadata is fabricated. Existing fetch/document globals are restored afterward. Full component tests use scope `all`, loading every manifest image, rather than inert substitutes.

For the CPU-only cumulative-world fixture, use:

```js
const {library: real, reads, boundary} = await loadLocalTextureLibrary({quality: 'hd', scope: 'door'});
const mixed = bindRealDoorTextures(cpuLibrary, real);
// Build with mixed. All non-door materials still come from cpuLibrary.
// Dispose normal world resources, then call real.dispose() exactly once.
```

This bridge is explicitly mixed evidence: only door_studded files are real loaded project assets, not the rest of the CPU world's materials, lighting or browser presentation. Its maps and owns() route derivative lifetime to the real library. The loader requires a usable Canvas document while subsequently constructing the scene; the full component fixture and existing R52 world fixture both provide one.

Follow-up verification: 19/19 targeted and TextureLibrary tests pass, including actual file-read failures for albedo and normal, 64px fallback, old CPU-only material fixtures, merged NOT_CORRECTED metadata, full-library load/configure state, and the real-door/CPU-other bridge. The production ZoneBase positive dispatch test remains deliberately pending wiring; no repeat application build or full-world build is claimed in this follow-up.

The earlier frozen diagnostic used real door images with inert other image dimensions. The full-real-library follow-up changes unrelated band UV aspect inputs to their actual images; its before/after geometry hashes still match exactly, and the displayed door-front pixels are unchanged. This is a fixture-evidence upgrade, not an additional production geometry edit.
