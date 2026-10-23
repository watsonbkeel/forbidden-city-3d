# R59-B Arrow merged-world consumer follow-up

Only QA, exact baseline fixtures and reproducibility scripts change here. The
production addition and the already-issued CPU images/proof remain byte-identical.

## Parent's one central world

Import `assertArrowSouthKneesInWorld` from
`tests/lib/r59-arrow-knees-world-check.mjs`, then call
`const arrowKnees = assertArrowSouthKneesInWorld(W)` on the parent's **existing**
finished `W`. Persist that returned result with the central report if desired.
The consumer never builds or loads a world, allocates scene geometry, registers
physics, depends on discarded mesh roles, or starts a browser. It refreshes
world matrices and queries real existing geometry and the collision manager.

The material-aware consumer reads actual rendered triangles from the retained
`arrow_south_knee_gray_fit` merged bucket (including optional solid-material
source ranges), checks 88 total triangles, two closed outward 44-triangle halves,
finite/nondegenerate triangles and precise world bounds:

- x: -157.23 to -152.17; z: 69.86 to 70.14; y: 7.91 to 8.53, tolerance 0.00005.
- Actual root front/back rays must lie inside actual red-column skins.
- Actual top and front/back rays must establish the 8.53 top and depth overlap
  with the retained red beam at y=8.52. A mere tagged bounding box cannot pass.
- Sixteen central doorway, under-knee and side-gallery samples require existing
  supported ground at y=0.9, real visible floor, no player collision and no
  head-route obstruction. Added knees remain outside the conservative jump-head
  envelope, y=4.95142857. These are current local probes, not an invented global
  before/after physics proof; frozen exact component registration retention and
  original controller replays remain the separate delta evidence.

`tests/r59-arrow-knees-world-consumer.test.mjs` builds **one local hall only** and
uses real `kit.finish()`. A positive case and negative removals of the actual new
bucket / actual red hosts, bucket displacement and a route blocker prove that the
consumer queries merged geometry and navigation rather than trusting metadata.
4/4 pass after an observed 0/4 missing-consumer red run. No central world was run.

## Historical-object-independent reproduction

Original exporter used runtime `git show`; integration script used historical
`git ls-tree`. Both now read exact checked-in fixtures through
`tests/lib/r59-arrow-baseline.mjs`:

- `EnclosedPavilions.baseline.js.txt` SHA256:
  `5381da26d16d981cd113e03e0f8cbaa245fee61e2ab24cdedc698377d320bd6a`.
- `legacy-production.json` SHA256:
  `8a2ead08236151bfd576b2fbf25963075a68cc641574049c0ded4f718d3b471d`.

The latter records 430 exact legacy paths, Git blob IDs for provenance, and
SHA256 bytes for runtime comparisons. The exporter no longer needs even
`git rev-parse`; optional `R59_CAPTURE_HEAD` is explicitly caller-supplied metadata,
not evidence replacing the actual source hashes. The source fixture reproduces
the original 310-mesh/5332-triangle snapshot in a targeted test. No official image
was copied or redistributed. `R59_INTEGRATION_REPORT` can direct the integration
script's report elsewhere to preserve the earlier report.

Browser status remains **VERIFY_PENDING**, with no Chromium/bwrap retry and no
denied-path access. CPU evidence is not browser acceptance.
