# Independent bounded code review

Four issues were reproduced with focused in-memory probes, fixed and rechecked:

1. Positive geometry consumer ignored drawRange/material visibility. The final consumer rejects zero submitted triangles and invisible materials.
2. Negative prop-shape proof depended on material name. The final consumer rejects a restored baseline prop even if its material is renamed.
3. Public furnish/registerRoom accepted unvalidated fourth/option arguments. Final consumption requires a policy bound privately to a frame created by the validated target corridor path. False, null, empty and valid-looking unbound objects reject.
4. ZoneBase hall dispatch dropped explicit policy. It now rejects a misplaced policy before generating geometry.

The independent re-review also confirmed an untouched fixture and restored fixture each pass the existing-W consumer with52 actual room registrations. Frozen baseline source fixtures were independently checked byte-for-byte against1549a70. No production output regression found for the eight targets. This review did not run any full suite, build or full-world execution.
