# R48 batch 2 integration checkpoint

This is an intermediate local checkpoint, not a release or complete-building acceptance.

- 49 of the 70 identities currently have separate exterior/interior classifications; 42 have at least one actual geometry change. This is not a count of accepted or completely restored buildings.
- NingShou's 13 profiles, actual runtime teleport approaches, new multi-level geometry and whole-zone movement checks: 73/73 passing.
- All 63 current automatic routes replay at 10/60 Hz, walking and sprinting. The selected route/baseline run passed 7/7.
- All 122 zone-hall signatures are checked against R47: authorized changed halls differ, other halls retain exact geometry/navigation. The prior 19 identity records are unchanged. These two retention checks pass.
- The first bridge landing regression, where feet crossed a retained garden-bed stone edge, was fixed using visible local landing surfaces and narrowly matched supports. The original failing case was retained; independent fixed-slice review passed.
- BiLuo's former south approach intersected the neighboring CuiShang platform/wall. Its source-compatible eastern fitted entrance now has a corresponding physical railing opening, three visible steps and a verified ground approach. The southern bridge remains unreconstructed.

## Open issues before acceptance

- At the original batch checkpoint, residential rear-veranda helpers retained full-length side walls because UV conversion removed geometry parameter metadata. Five added physical regressions reproduced the defect. The follow-up uses actual vertex bounds, removes old walls before installing inset walls, and moves the rear threshold. The revised residential and integrated-zone checks pass 66/66. YangXin facade work is still separate and pending.
- Outer-region rotated-hall primary teleport consumers still require explicit profile approach integration and whole-zone checks.
- CiNing currently retains the earlier inferred throne and asset. An approved, separately reviewed modern official panorama target will replace only its throne equipment and disable only its inferred GLB binding. The asset will remain available for rollback; sculptures are not being fabricated.
- YangXin's three structural bays / apparent nine facade divisions and asymmetric front projections remain under implementation; the current central caisson-type correction does not complete its exterior.
- Full aggregate regression, final source freeze, and browser/native-phone visual acceptance have not been completed. CPU geometry checks and software renders are not GPU acceptance.
