# CPU diagnostic freeze

Source: exact local old/new single-gate builders, production albedo and UVs, **after normal material merging**. The tested module SHA below is authoritative; the proof’s sourceCommit is the unmodified parent 856 because the module was then an uncommitted isolated candidate. Runtime did not change after this render.

Four before/after views were generated. Final after south, north, ramp and three-quarter views were personally inspected: three-bay single portal, green hip-gable silhouette, no unsupported nameboard/pattern, physical ramps; initial side-joint penetration was corrected before this final set. Smooth/plain green is a coarse glazed-roof cue, not recovered tile detail, pigment or PBR.

| state | triangles | merged meshes / materials | colliders | walkables | geometry SHA256 |
|---|---:|---:|---:|---:|---|
| before | 1098 | 10 / 10 | 2 | 0 | `76c82e20a13ae202729845eaeca516d0d4558c4c11606b23b6df046b5a31f847` |
| after | 1600 | 5 / 5 | 67 | 3 | `faf98625567784081506982c2f2183d1820b48fffdce8e7e28e43e1b79bcc344` |

## Runtime source hashes

- `src/scene/palace/special/NansansuoCommonGate.js`: `6ea725bbfc431f514d4049d39bcfaec89cad71c1e23671115aa34f1e59c36e2a`
- `src/scene/palace/kit.js`: `c85a88ceb2cb45d8defb0c6a6ffd6929e1a1611276ea0bb1df88bf35508d8ac5`
- `src/scene/RoofBuilder.js`: `be8822caed0b1f2cef3071153548c3a1e77cac81f8130222b366e10bcfe33165`
- `data/zones/outer-east.json`: `5327bf3dbaff2b102c62363d70fbbad3e39eaa08e966040cb26acd33e3398b7e`

## Final after-view hashes

- `south-wide-after.png`: `95042b5ff94f3a27ab4a08240a1e34226d251177504a45383b5a8ca140fb62e8`
- `north-wide-after.png`: `ba8a6e4a5927ea1c6eabdef0fa1fbcee680bd3595b1df7a91d265a687ada7a27`
- `south-ramp-after.png`: `79b0d9ef21f0e44c04d2b1fbf77ed718fa80290f3e46796f129016423d66224c`
- `three-quarter-after.png`: `c56fc6551e6662af3c8bb7be39e6c7e237684566c8e66bb04f9c373f8b76f4f1`

Private final files: `/workspace/scratch/02a8023d1a85/r158-nansansuo-gate-evidence-1627/cpu-final/`. These are CPU diagnostics, not browser screenshots, GPU/shadow/PBR checks, surveyed dimensions, or whole-object acceptance. No official reference pixels are republished.
