# Baohe north approaches: paused implementation checkpoint

Saved 2026-10-18 15:02 UTC on `feat/r14-baohe-north-approaches-20261018`,
based on R13 final local commit `47c3fe83d9fab9a76024c623b86928038d9c279f`.
This is unfinished source, not a release candidate or accepted reconstruction.

## Implemented, not yet validated

- Three grouped north approaches per terrace tier: outer stair flights and
  narrower stair flights flanking the central carved stones.
- Lowest stone face uses the published exposed size 16.57 × 3.07 m. This is
  not the larger historical raw block size. Existing terrace levels remain.
- Dedicated stone colliders; stair walking surfaces remain separate.
- Fine/solid distant staircase LOD, with persistent stone/rails/collision.
  All resident geometry and full-scene costs still need measurement.
- A source inspection found and corrected the stone face rotation sign so
  its intended surface descends toward positive/north Z. No runtime check
  has yet established the actual result.

## Evidence and limitations

Museum article: https://www.dpm.org.cn/building/talk/223480.html

Yang Naiji, “保和殿后大石雕”, printed page 15:
https://img.dpm.org.cn/Uploads/File/pdf/ab/1a/71/ab1a7121f7d5e0fed2e5bcba4827ec7f.pdf
The text distinguishes the exposed dimensions from the historical block.

Official panorama hotspot “保和殿后大石雕”, image reviewed:
https://file-pano.dpm.org.cn/hotspotImage/2026/05/08/7774c04c18414fdc8cd57ef3259f6c8a.jpg
The URL date is not proof of the photograph's capture date. It supports the
grouped approach topology and relative long lowest stone, not exact step
counts, flight widths, offsets, terrace levels or current public access.

Stair widths, offsets, counts and inherited terrace levels are provisional.
No global anchors, lights, default camera, interior assets or public data
were changed. Current public access to these stairways is unverified.

## Verification state and resumption

Only the preceding syntax checks ran. No R14 CPU suite, production build,
same-view image, ordinary walking or performance acceptance has run.
Parent requested this checkpoint before a pending feature-priority decision;
no additional test or new day/night/helicopter implementation was started.

On resumption: focused geometry/LOD/collision tests, actual full-scene cost,
same-view visual comparison and necessary ordinary stair traversal. The
previous R12 structural gate has little triangle headroom at Taihe; it is
not evidence that this WIP meets the existing budget. Preserve all previous
release and runtime acceptance limits.
