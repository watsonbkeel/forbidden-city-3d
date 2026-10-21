# R48 intermediate regression evidence

This is a checkpoint report, not the final release or a claim that all tests pass.
The full run used frozen `e4e14f0`; subsequent repairs and additions require a new
full run against the final candidate.

- Direct-current: 2,955 tests, 2,859 passed, 96 failed.
- Historical/mixed: 1,192 tests, 961 passed, 231 failed.
- Build, zone schema and zone geometry passed. The inherited anchor check remained
  non-green, with output byte-identical to R47. Before/after source manifests matched.
- Relative to R47 there were 45 newly failing unique direct test names; the 96
  failures include repeated subtest names. No prior failing name disappeared.
  Historical/mixed added one old complete-three-terrace geometry contract failure.

## Real regressions found and repaired

1. The fitted front buildings of Hanqing and Yanshou changed their actual map
   rectangle centers. The old catalog matcher consequently failed the real
   159-place binding check. The repair binds only these two exact source identities
   to their pure, shared profile footprint, rejects millimeter drift and duplicate
   names, and retains their original catalog/source anchors.
2. Changing Yongshou rear hall from seven model bays to five enlarged the shared
   automatic post radius. Continuous inherited Chuxiu-excursion routes then struck
   a rear post, although short straight probes passed. Twelve post radii and their
   conservative collider envelopes now retain the previous fitted diameter;
   axes, height, roof and all other geometry/navigation remain unchanged. The
   original R34 B/S files pass all 98 tests at repaired `5a702f1`.
3. Independent physical checks found three further defects in the subsequent
   outer-building additions: Yanchun lacked the two side three-bay divisions,
   Yude had uncovered square-room corners outside its round dome, and Wenyuan
   retained an old single-level ceiling cutting through the newly supported stair
   and mezzanine route. These were repaired with actual side posts/segments,
   a closed square-to-round bearing shell, and precise removal of the conflicting
   old ceiling. The final replacement module is SHA-256
   `fcb22fe64d01bbcadb39912842c4830af0f21574d0add38094a0efa11ff4a60d`.

At integrated checkpoint `3134115`, outer tests plus map/scope checks passed
152/152, the supplemental multilevel physical tests passed 10/10, and the original
63 automatic-route replays passed in all four frame-rate/sprint combinations
plus their baseline check (5/5). These are scoped results, not a new aggregate.

## Superseded contracts and still-required coverage

- NingShou's old generic center-door journeys now point at a source-backed window,
  rather than the actual east-secondary entrance. The old tests are retained as
  failures. A new 16-mode whole-world test traverses the actual entrance both by
  the current generated approach and by the retained palace-gate/side-portal
  journey, with the real aligned Huangji collision proxies installed.
- Existing facade tests can stop at old window/leaf, single-stair, or one-room
  assumptions before their later movement checks. Those skipped tails are not
  counted as passed; current physical tests and independent tail review must be
  identified separately.
- The old fixed 30-plaque assertion stopped before its resource-disposal tail.
  Missing model-name registrations are being corrected and audited individually,
  rather than forcing a historical count. A supplemental current test verifies
  every registered plaque has two rendered atlas triangles and executes all four
  reload/disposal cycles, including borrowed-material preservation. It does not
  establish that a model-name sign is a historically verified plaque.
- Cining's former optional throne-layer binding is intentionally inactive for the
  selected, location-verified modern official panorama interpretation. Its asset
  remains unchanged for rollback; empty fitted exhibition bases do not represent
  the unmodeled sculptures or a complete exhibition.
- Frozen geometry/source identities and old exact inventory lists remain failures
  where the authorized building changes supersede them. The real-R47 complete
  three-terrace inverse independently restores the exact baseline after reversing
  only the Zhonghe and Baohe edits; it does not rewrite the old historical chain.

No WebGL, GPU performance, or native-phone visual acceptance is implied.
