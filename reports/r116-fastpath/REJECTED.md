# Rejected equal-quality Float32 merge experiment

Candidate: f1adf2f74f6e0eaffd1efccd325481cf19df6f34, preserved in archive/r116-float32-rejected-f1ad. Product runtime restored exactly to R115-fix c09a66c8.

Forty fresh v4 processes: five A/A pairs and five A/B pairs for each quality. Low ready median 6600.614338 → 6303.208183 ms (5/5 faster); high 6636.828127 → 6395.526960 ms (4/5 faster, one +82.290602 ms). Both quality maxima reduced and all ten paired OS startup RSS high-water samples decreased. However the prespecified acceptance gate is NOT MET: low A/A noise reached 880.510415 ms, high Garden first pair regressed 90.405 ms beyond its A/A 26.690 ms. Benefits remain uncertain; no adoption, no discarded samples or post-hoc threshold change.

Initial synchronous snapshots had one unknown nine-dragon image and three pending painted atlases. Separate mature asset runs map real local public image paths through the actual LoadingManager and await all 47 actual decoded images; all three paint states ready, nine-dragon 4096×380, unknown pixels zero. Both quality complete snapshots then match exactly. This closes CPU image equivalence, NOT GPU/browser/mobile proof and does not supersede original performance samples.

The rejected-fixture files are archival snapshots, NOT active tests or runnable paths. Their original runnable imports and full exact source remain at the candidate Git commit. Original REDs and corrected accessor/own-key GREENs are retained. External raw directories r116-startup-profile/{aa-low-v4,aa-high-v4,ab-low-f1ad-v4,ab-high-f1ad-v4}, r116-mature-equivalence and r116-merge-independent are retained for final evidence packaging. No new R116 release claimed.
