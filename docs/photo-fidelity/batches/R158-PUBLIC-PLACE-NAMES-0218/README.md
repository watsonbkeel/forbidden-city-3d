# R158 public place names

User screenshot `image(20261102-021702).png` shows research/engineering notes overflowing map labels. Exact baseline: 458cea434b60fa5e9b3a31fa84c2d90ba1ab4c36 (verified remote 411c7bfd).

## Change

A closed list of 19 exact aliases covers 17 current map records, including both pre-interior and two-level Luanjia strings. Normal ZoneBase returns shallow public map copies with place-only names. Minimap and Teleport consume these same records. No generic parentheses stripping, identity reassignment, renamed historic offices, changes to model geometry, collision, supports, regions or rooms. The two unnamed-by-type storehouses retain distinct labels; neither is newly claimed to be the red-book or records store.

Original builder map records and architecture metadata retain all research notes, unresolved identity/roof/location flags and source evidence. Published research ledgers/README remain unchanged. A clean label is not a new historical verification claim.

## Verification

`node --test --test-concurrency=1 tests/r158-place-display/*.test.mjs`

Final 4/4. Normal production ZoneBase build, actual texture-library API and CPU canvas atlas; no substitute builder/finalizer. All 17 changed current names are unique; all unrelated map fields exact; collider/walkable/room/region array entries retain the exact original references. Merged Hanben survival and Zhisheng roof-conflict metadata remain unresolved. Unknown names, including meaningful parentheses, pass unchanged.

History retained locally: missing-module RED; initial normal-test missing document; a test-edit syntax error; actual 15/17 RED exposed two-level appended label notes and resulted in two additional exact aliases; fixture assumptions about array index and post-merge metadata corrected without changing production. Final assertions are not relaxed. `map-capture.json` is the 15/17 RED-stage capture (still containing the two long interior labels), not a final capture; final 17-record assertions are evidenced by `final.log`.

Raw logs/capture are LOCAL_ONLY in `/tmp/r158-place-display-0218`, non-persistent and not uploaded. PINS lists hashes, not remote availability. No GPU/mobile/full World or application build is claimed here; one cumulative build follows with the other current fixes. This candidate is not separately published.
