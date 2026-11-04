# Pre-existing legacy snapshot failures, reproduced on the exact base

The broader all-R164 non-production run exercised611 cases:609passed,2failed. Three later new jump/ledger cases passed separately, giving614 distinct bounded cases:612passed,2pre-existing failures. One actualNingShou production test passed separately. Do not report all615 as passed.

The two failures are in tests/r164-ningshou-side-steps/component.test.mjs:

1. “actual NingShou gate gets exactly two five-tread approaches and all original gate objects stay intact”: old b6c geometry snapshot predates the explicitly implemented NingShou front hall pier recession. Both have58meshes/2246triangles but target geometry hash differs.
2. “one narrow production hook, other generic five-bay gates remain unchanged”: old b6c snapshot of Yangxing Gate predates its ceiling. Current60meshes/2260triangles versus old58/2246.

Reproduce without the current Fanhua runtime changes: node --test tests/r164-fanhua-stair-contact/old-side-steps.probe.mjs . This redirects only the legacy fixture's current ZoneBase to the fully frozen2e80 source with its frozen Remaining/Fanhua dependency. It reruns the original seven assertions unchanged:5pass, the same2fail. This is an intentionally red diagnostic, not a newly passing test.

The actual2e80 source files for both later helpers and ZoneBase are unchanged in this candidate. The candidate's whole production NingShou visual/physics/map/roof snapshots are identical to2e80 after verifying/removing only the five new Fanhua contacts and normalizing its exact two approach-point changes. All current cumulative routes, including those two gates, pass. No original assertion is removed or loosened here; these obsolete historical comparison boundaries remain a test-maintenance item, not evidence that the new Fanhua patch altered a gate.
