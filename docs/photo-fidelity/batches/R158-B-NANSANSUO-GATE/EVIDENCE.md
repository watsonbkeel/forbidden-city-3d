# Verification evidence — bounded candidate only

## Terminal results

- `node --test tests/r158-nansansuo-common-gate*.test.mjs tests/r59-nansansuo-inventory.test.mjs tests/r59-nansansuo-inventory-controller.test.mjs tests/r59-nansansuo-inventory-world-consumer.test.mjs`: **97 / 97 pass**, 0 failed / skipped / cancelled. 37 new cases and 60 existing inventory cases; ordinary production controllers and collision, not toy movement.
- New: 10 structural/ownership/rollback tests; 8 actual FirstPerson two-sided round trips (10/60 Hz, walk/sprint, W/S); 10 high-drop then walk-away cases; 8 low-ramp side exits to real ground; 1 ordinary full outer-east build with an in-memory exact gate dispatch, original wall cut, all room/declaration registrations and non-target triangles retained. No shared source hook was installed for this test.
- Initial missing-module RED, late-commit resource RED and low-hip overlap RED were observed before their implementations/fixes. Final tests reran after the last runtime change.
- `node --check src/scene/palace/special/NansansuoCommonGate.js` and `git apply --check docs/photo-fidelity/batches/R158-B-NANSANSUO-GATE/PROPOSED-SHARED-HOOK.patch`: exit 0. Shared ZoneBase and outer-east declarations have no diff.
- Ramp top ray samples coincide with actual rendered slope; both closed wedge solids are real meshes. Ordinary inscribed body deficit is <=0.02084m, explicitly disclosed. Existing low-step clearance is unchanged; side exits are not mistaken for historical rails.

## Runtime/resource scope

One module; original gate replaced only when the single integrator installs the exact `buildGate` dispatch. 3 private materials, no new texture or shared-material mutation. Whole generated roof and all upper gate solids use actual Float64 world-space triangles. No upper full-envelope AABB fills the portal. Candidate stage and late commit failure restore children/arrays and dispose staged geometry/materials. No new room, plaque, furniture, beast census or hidden rear ornament.

## Private evidence

Private root: `/workspace/scratch/02a8023d1a85/r158-nansansuo-gate-evidence-1627/`. Official source images/PDF are in sibling `r158-nansansuo-readonly-1618/`. Raw logs/reports and official pixels are not staged in this candidate; no statement here independently authorizes a later archive.

| Private artifact | SHA256 |
|---|---|
| `red.log` | `c235504643bc7ee66fcf4a0da49225d710284673c1cec7602b05f542ba0ada3e` |
| `red-late-commit.log` | `a877fc570da31f39c99e2924228ed06660dc5c68b6f9a33b48cabd9853c76bbb` |
| `red-low-hip.log` | `2ab34fd5e46b1a037db13c52e88323da725aa1973e999b56895ca57b76c169f3` |
| `all-final.log` | `dffa87a189d305cad6cdf6f69fcd6546eb464bf1b8ea37f42a2a21aaa523b305` |
| `controller.json` | `a2a1e9e9cdb0cceccbe8b4380bcbd9bf3afb498a2bcd16c3ebd07168d1c0b29b` |
| `cpu-final/proof.json` | `fd048af15cef5e93dcd070d557d48522f33bb8a2955ab6b38ddca4cb41720fee` |

No full-site World/build/browser/PBR/GPU acceptance claim. The single integrator must install the audited patch and smoke the ordinary entry on the cumulative source.
