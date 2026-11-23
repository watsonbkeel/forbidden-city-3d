# Offline R62 west-six compound replay

This fixture is for the 17 `R62 baseline:` cases in
`r63-west-rear-compound-routes.test.mjs`. It does not feed current gameplay or
current candidate tests. The old fixture used frozen R62 `ZoneBase.js` but
resolved its imports and data against the live tree; current west-six data has
58 items, and the old builder cannot dispatch `chuxiu-rear-wing`. That error
occurred during construction, before the routes were tested.

- Runtime and west-six source: delivered R62 commit
  `51d5ced1f0074b1a0eeacec2c36c6c4fd580245d`, tree
  `34cfbca05c3ccb162e1b99e2b1f949a56f224077`. `ZoneBase.js` matches the
  preexisting R62 source fixture byte-for-byte. R62 and delivered R63 have
  identical west-six data (56 items, Git blob `b53965ea6d2eabb7c287a560aa22cb9807d19759`).
- The only R63-sourced file is the replay-only
  `tests/lib/r63-west-rear-windows-world-check.mjs`, from delivered commit
  `6bd936cbbbd45ddee2fca90060a3530485908cd0`. The archived helper imports
  historical R62 movement, ray, material, and collision code. Neither replay
  method changes the colliders, routes, speeds, thresholds, or environment.
- The gzip member is a JSON property map of 120 untransformed source modules
  (including three JSON import members) plus west-six zone data. It contains no renderer output, assets, or generated
  routes. The adjacent manifest lists each original path and SHA-256 digest.
  The restore loader checks every digest and admits only the pinned local Three
  package and two original Node built-ins. This is an integrity check for a
  trusted repository fixture, not a sandbox for executing untrusted code. No
  tests access a network or require Git history.
- Independent replays in the downloaded commits reproduced all 17 exact R62 and
  all 34 original R63 route diagnostics from
  `reports/r63-west-rear-south-windows/compound-route-proof.json`. This was
  bounded west-six CPU testing, not browser or current public-entry acceptance.

To audit the archive against original Git objects, after obtaining the two
named commits, run this from the directory containing this manifest and pass
any checkout containing both commits. The optional Git fetch is for provenance
review only; it is not part of running the tests.

```sh
python3 - /path/to/repository <<'PY'
import gzip, hashlib, json, pathlib, subprocess, sys
manifest = json.loads(pathlib.Path('r62-compound-source-manifest.json').read_bytes())
compressed = pathlib.Path('r62-compound-source.json.gz').read_bytes()
sha = lambda b: hashlib.sha256(b).hexdigest()
assert sha(compressed) == manifest['archiveSHA256']
archive = json.loads(gzip.decompress(compressed))
assert archive.keys() == manifest['files'].keys()
for path, content in archive.items():
    commit = manifest['routeHelperCommit'] if path == manifest['routeHelperPath'] else manifest['runtimeCommit']
    original = subprocess.check_output(['git', '-C', sys.argv[1], 'show', f'{commit}:{path}'])
    assert original == content.encode() and sha(original) == manifest['files'][path], path
print(f'{len(archive)} files matched original Git bytes')
PY
```

## Delivered R63 overlay and live coverage

The R63 test label denotes the delivered `6bd936cbbbd45ddee2fca90060a3530485908cd0`
build, not the current development geometry. Its reachable source closure is
125 members: the same R62 archive with two replaced modules and four added
modules. The six exact new contents come from the R63 Git object; the compressed
40,459-byte overlay and per-file SHA-256 manifest are adjacent. It is restored
under a separate URL namespace. The full 125 reconstructed members match the
corresponding R63 Git bytes. Original test names, movement modes, coordinates
and assertions do not change.

Current coverage stays independently live. The approved R123 main/front-wing
shift (`ChuxiuRearCourtFrame.js`) moves the genuine Chuxiu north-wall collider
south by five model metres. The old `(94.5,439.7)` point is now in the court;
a distinct live witness approaches the current wall from the supported
hall interior, checks its actual visible material and registered box, and keeps
the original direction clear to Lijing. An exterior-to-interior test first hit
the valid platform edge, so it was not used as a claimed wall-contact witness. The other historical starting point `(110.5,440)` remains
occupied by the fitted rear wing. The public entry tests instead start at the
ordinary live map resolver (the pre-existing full-world fallback covers 10/60 Hz
walking), enter and return twice in each of the eight input/rate combinations.
Tongdao retains all eight prior live tests on its unchanged routes. The live
archive-independent supplement uses the ordinary merged west-six builder and
registered collisions, not a standalone hall or a substitute collider.
