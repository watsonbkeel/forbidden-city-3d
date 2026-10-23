# R58-A local east Taihe firewall handoff

## Result and release boundary

One source-bound **east-side** Taihe connector is implemented in dedicated helpers. It is not wired into production in this independent worktree: the integrator owns the shared hook. It adds **15 meshes / 6 exact solid boxes / 0 walkables** in the bounded real fragment. The doorway is a true rendered and collision opening. No west mirror, seven-wall array, hallway rewrite, character change, platform movement, rail removal, or stair change is included.

- FC-1ABC6622CB: **VERIFY_PENDING**, east local implementation only. Browser matched-view acceptance, west-side review, exact survey dimensions and small finish details remain open.
- FC-0D3F161564: **BLOCKED_SOURCE**, **not installed**. No reusable arch has been counted as a scene modification.
- This is an internal A37 milestone inside R58, not a separate release/upload. No main, Pages, dependencies, permissions or publication changes.

## Source-to-model binding

Official source: [Sun et al., Palace Museum 2020 PDF](https://www.dpm.org.cn/Uploads/File/2020/10/23/u5f9255173a228.pdf), PDF pages 5 and 6, printed pages 54–55. The PDF/text and both page images were actually inspected privately. The source images are **not included** here or in any public directory.

1. Page 5 bottom-right shows stepped red masonry and yellow coping, not a sloping timber gallery.
2. Page 6 lower wide photograph explicitly says **太和殿三台（自东向西）**. It independently identifies the east connector and its upper-wall doorway. Its relationship to the hall, terrace edges and middle gate agrees with the transverse east connection, not an invented mirrored pair.
3. Page 6 plan supports the transverse link toward 中左门 near Taihe's southern portion. Existing model control points fit that relation. The model uses its existing z=-12.2 rather than shifting halls/platforms.
4. The [2013 Museum notice](https://www.dpm.org.cn/announce_detail/177844.html) distinguishes 太和殿两侧墙门 from 中左门/中右门. The new small door does not replace or close the existing 中左门 route. Current visitor access is UNKNOWN; gameplay retains an open route.
5. Page 5 bottom-left shows a red wall, gray lower masonry and a gray-surrounded arched passage **within** the Baohe east connecting range. Its exact wall station cannot be uniquely tied to candidate item31. One bounded official-source follow-up found no unique station. A same-side view showing the arch plus identifiable corridor column centers, hall/platform corner or both ends is still required.

### Visible/known versus fitted/unknown

| Item | Source/retained control | Fitted value or limitation |
|---|---|---|
| East identity, stepped masonry, upper doorway | East-to-west photograph, p55 | Supported topology, not a survey |
| Existing east transverse wall | axis-courts item13, 中左门 | Retain endpoint (-65.5,-12.2) and h=7 exactly |
| Three terrace levels | Existing actual terrace lh=8/3, setback=5.4666667 | No height or stair changes |
| Three x intervals | Existing edges -65, -59.5333333, -54.0666667 and hall exterior -31.95 | Connected to those retained model controls |
| Wall tops | Inherited terminal h=7 plus terrace increments | 7, 9.6666667, 12.3333333 m; **not surveyed heights** |
| Door station | About halfway along source-visible upper span | x=-43.0083333, descriptive uncertainty **±2.4 m**, not a statistical CI |
| Door opening | Photographic proportion plus preserved physical route | 2.8 m wide × 3.0 m high, descriptive envelopes ±0.8 / ±0.6 m; **not measured dimensions** |
| Wall thickness | Bounded local material fit | 1.4 m; no metric survey evidence |
| Outer <0.5 m join | Existing row endpoint meets outer terrace edge | Retains existing wall, cap/detail still provisional |
| West side and Baohe wall counts/stations | Not independently bound | No activation, no mirror or inferred seven-wall array |

## Actual geometry and three rail junctions

`baseline-summary.json` records the exact frozen real fragment (base 755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da). Its 1,177 meshes have bounds/triangle digest `74373988d8df7dadf19164381953d4782c234dcb5da4eeadb7f96949fe4e4d83`. Existing corridor31 contains **12 real solid room partitions**. Inserting an arch over one would duplicate/obstruct existing geometry; none is changed.

`mesh-review.json` records all three actual intersecting balustrade meshes. In the unmerged 三台 parent they are children 2, 48, 94; their original collider indices are 1, 249, 497. Those indices are diagnostic identifiers for this frozen fragment, not production lookup keys.

| Rail center X | Existing rendered top Y | New wall top Y | Wall interior overlap |
|---|---:|---:|---|
| -64.8 | 3.7666667 | 7 | Entire clipped rail volume enclosed |
| -59.3333333 | 6.4333333 | 9.6666667 | Entire clipped rail volume enclosed |
| -53.8666667 | 9.1 | 12.3333333 | Entire clipped rail volume enclosed |

The horizontal crossing lies inside the masonry, not above its coping or beside a misplaced wall. The surviving external rails meet the two wall faces. CPU close-up inspection and exact bounds found no exposed conflicting rail segment. **No rail/collider cutting proposal is necessary**; retain all existing primitives. Do not regenerate long rail intervals, which would be an unrelated change.

## Validation

- `targeted-tests.txt`: **26/26** new bounded tests pass.
- `retained-stairs-tests.txt`: **17/17** existing scoped terrace-side-stair tests pass. Final combined fresh rerun: `final-scoped-tests.txt`, **43/43**, exit 0. No fullworld/broad suite launched.
- New real FirstPersonControls tests use an exact mocked clock at **10 and 60 Hz**, both approach directions, W/S movement and actual sprint/braking, crossing the door and returning. Door route feet remain exactly 8 m. No per-frame position or height overrides.
- The same already-built W also runs retained waist-stair ascent/descent on east/west at 10/60 Hz, starts at real ground 0 and returns to 0. The waypoint turnaround samples the upper contact at 7.992–8 m; actual CollisionManager direct probes reach the exact 8 m deck. No flight or walkable was changed.
- Real rendered-triangle body sweep rejects a visible-only obstruction in the doorway. Adjacent jambs block real CollisionManager passage.
- Installation proof checks preserved architecture metadata, six actual collider boxes and 36 actual visible front/back ray hits. Missing/invisible/material-hidden walls, collider-only/visible-only remnants, malformed inputs and duplicate installs fail. This works after the actual production material merge removes named subgroups.
- Every pre-existing collider/walkable and child identity is unchanged. Closed wall geometry is finite, outward and manifold. New metadata stays VERIFY_PENDING.
- `configured-route-exclusion.json`: unchanged **108 actors / 28 path actors** have no intersection with a conservative 2 m horizontal envelope around this added wall. Nearest configured actor is taihe-attendant-east-02, 30.85956 m away. This is read-only configured-footprint exclusion, **not** live all-actor support/render/lifecycle acceptance. Actual final resolved bindings can be checked by the same-W API below.
- Independent read-only review found four initial API/guard issues and one hidden-material negative case. All were fixed with reproduced failing tests and fresh green tests; logs retained. Final targeted reviewer re-check reported no remaining blocker in this scope. No unreported browser success is inferred.

## CPU images, not browser acceptance

`cpu/before-*.png` and `cpu/after-*.png` are identical-camera perspective CPU z-buffer diagnostics of actual local mesh geometry. They use nominal material/vertex colors, not production textures, GPU lighting, shadows, postprocessing or a running browser. The east-oblique pair, doorway pair and three-rail-junction pair were actually viewed. Do **not** mark photo fidelity ACCEPTED from these images.

No browser attempt was made here. Parent reports cloud CDP cannot reach the executor localhost and no actual browser screenshot is available. Browser visual acceptance is **VERIFY_PENDING**. Prior denied browser paths were not read or retried.

## Exact shared-hook proposal (integrator only)

Do not change axis-courts item13 or general corridor/wall builders. In `PalaceBuilder.js`, import the two helpers and the existing axis-courts JSON, then add this bounded block **after the current 三台 terraceOrnaments call, before finish(g)**:

```js
if (name === '三台') {
  const hallIndex = halls.findIndex(h => h.name === '太和殿');
  const candidates = axisCourts.items.filter(i =>
    i.kind === 'wall' && i.from?.[0] < 0 &&
    i.gaps?.some(gap => gap.gate === '中左门'));
  if (hallIndex < 0 || candidates.length !== 1)
    throw new Error('Ambiguous Taihe east firewall binding');
  const profile = createTaiheEastFirewallProfile({
    hall: halls[hallIndex], rect: rects[hallIndex],
    layers, lh, setback, linkWall: candidates[0],
  });
  buildTaiheEastFirewall(this, g, profile);
}
```

Import paths from PalaceBuilder:
- `./palace/special/AxisFirewallProfiles.js`
- `./palace/special/AxisFirewalls.js`
- existing JSON `../../data/zones/axis-courts.json` with the repository's JSON import syntax.

`finish(g)` already preserves `userData.structure` in merged `userData.architecture`. No kit/ZoneBase dispatch, new zone item, additional panel overlay, rail surgery or new property on CharacterSystem is needed. Rollback removes only the hook/imports; all retained geometry stays byte-for-byte source-identical.

## Same-W QA API

```js
import {evaluateTaiheEastFirewall, runTaiheFirewallControllerRoute}
  from './tests/lib/r58-axis-firewall-qa.mjs';
const result = evaluateTaiheEastFirewall(W, {
  profile,
  resolvedBindings: [...system.manager.states.values()],
  expectedActorIds: system.manager.registry.actors.map(a => a.id),
});
```

Use the actual registry object available in the integration harness; `expectedActorIds` must be the full intended identity set. Missing, empty, duplicate, unready or wrong expected bindings fail when actor acceptance is requested. Without bindings the helper reports `PENDING_BINDINGS` and only the bounded local result, never all-actor acceptance. It consumes the existing scene and CollisionManager and constructs no world/zone/system. Body sweeps inspect actual supplied-scene triangles; exact colliders establish added wall solids. `runTaiheFirewallControllerRoute` takes existing `{camera, controls, collisionManager}` and a deterministic `tick` callback if the harness uses one; it does move those controls, so use a validation session, not the user's active camera.

Regenerate the bounded evidence from repository root:

```sh
node --test tests/r58-axis-firewalls.test.mjs
node --test tests/current-state/terrace-side-stairs.test.mjs
node tests/r58-axis-firewalls/baseline.mjs /tmp/r58-firewall-baseline.json
node tests/r58-axis-firewalls/check-configured-routes.mjs /tmp/r58-configured-route-check.json
node tests/r58-axis-firewalls/export-diagnostics.mjs /tmp/r58-axis-firewall-raster
for p in /tmp/r58-axis-firewall-raster/*.json.gz; do
  python tests/r58-axis-firewalls/render-diagnostic.py "$p" "${p%.json.gz}.png"
done
```

## QA fixture successor: compatible with the installed production hook

The original builder tests deliberately need the frozen **pre-hook** scene. `axisFirewallBaseline()` now recognizes an already-installed dedicated east firewall and applies an **explicit, audited QA-only inverse** before those unchanged tests add the wall exactly once. This is not a production rollback and must never be used by the actual integration/world consumer. `evaluateTaiheEastFirewall(W, ...)` and the actual controller consumer are unchanged and perform no inverse.

The fixture requires the unique unmerged wall group, exact reviewed metadata, all 15 meshes' full geometry fingerprint, six uniquely matched collider boxes and three privately owned cap materials. Before removing anything, it computes the predicted scene without only that exact group/removal set and requires all frozen checks to pass:

- Original bounds/triangle fingerprint remains `74373988d8df7dadf19164381953d4782c234dcb5da4eeadb7f96949fe4e4d83`.
- Full world transforms, all geometry attributes, indices, geometry groups and draw ranges: `50fce1db91b0443e82a3fa775fc64c1b97507858ea55aa6d276fb185251d06fc`.
- Ordered collider fingerprint: `bf3a7c5625825970d89c6b3486f4f1b508dccb63582bec0ee3fc26e670104809`.
- Ordered walkable fingerprint: `32b15efb70507cb286185e43dc85e056a271d0e916560b9e6611547017ef0b09`.
- Frozen counts: 1,177 meshes, 1,532 colliders, 77 walkables and 36 builder-owned materials.

These additional hashes were captured from the original unmodified production builders at frozen 755dd9a, using the existing bounded baseline's nominal materials. They are constants, never regenerated to accommodate an integration difference. An unrelated vertex change, even if overall bounds remain unchanged, fails. Missing/duplicate colliders, changed wall geometry, extra wall children, ghost colliders without a wall, and an ordinary live-world object without the explicit QA fixture marker fail before inverse mutation. The production duplicate-install check stays enabled.

The returned `inverseDelta` contains before/after fingerprints and the exact removed collider/material indices; `fullGeometryHash` and the existing `geometryHash` are both verified. `fixture-inverse-audit.json` demonstrates the exact valid inverse. `fixture-inverse-red.txt` preserves the initial failing tests; `fixture-inverse-tests.txt` is the fresh combined successor plus unchanged original local suite: **36/36**, exit 0 (10 new + 26 retained). Independent targeted review found no concrete blocker and freshly reran the 10 new tests. Run:

```sh
node --test tests/r58-axis-firewalls-baseline.test.mjs tests/r58-axis-firewalls.test.mjs
```
