# H37 single actual probe failure, preserved without retry

- Approved exact frozen run: `python r165-h37-space-probe-1455/run-space.py --execute-once`; process terminal exit 1.
- A passed actual old geometry/registered-space and ground checks. Only the 68 old before-state route variants completed. B failed on the very first private entity, before checking its intersections with old triangles or running any with-proxy routes. C did not run. No product files changed.
- Exact assertion: `B: entire closed entity real geometry outside reserve H37-proxy/high-wall-pier-0`, main line 55.
- Source-derived cause: local BoxGeometry y half-extent 3.65 is stored in Float32 as 3.6500000953674316; world translation is 3.65. The reconstructed bottom is -9.536743172944284e-8, outside the strict y>=0 reserve. The receipt did not serialize row.box; this reconstruction follows the frozen input, Three BoxGeometry Float32 attribute construction, and collectFaces transformation. It is not a new actual-scene measurement.
- This failure does not prove that the fitted group cannot fit. Nor does A plus old routes establish a passing candidate: new geometry, new collisions/routes, and all seven C visibility targets remain unaccepted.
- Cleanup succeeded: 1025 private resources and 32 library resources handled, one module texture protected, no cleanup errors; old registrations/snapshot restored. Input/source/both protected indices unchanged. All known processes exited and reader closed; no uncertain outcome.
- Duration 7.732 s, sampled Node tree peak 352828 KiB, below 358400 KiB. No signal or monitor termination. This was an assertion failure, not a resource termination.

## Proposed next step, not applied or executed

Have independent review consider representing each closed proxy box with an exact unit cube (Float32 endpoints +/-0.5), mesh scale equal to the existing requested dimensions, and the same requested world center. This moves dimension precision from Float32 vertex endpoints into the double-precision transform. Keep every candidate coordinate and hard containment/contact assertion unchanged; verify final real faces, exact y=0 contact, all 30 boxes, and true out-of-reserve negatives in pure synthetic tests first. Do not add tolerance, enlarge the reserve, raise wall feet, or relax old-geometry/route checks. Any new actual run requires a fresh explicit window and immutable receipts.

`FAILURE-ANALYSIS.json` contains exact static calculations and hashes of the original run receipts. The original frozen scripts, authorization, marker, logs and result remain untouched.
