# Preserved R64 world failures

1. final-01/B-current stopped after constructing the actual world, before validation, because tests/lib/world.mjs sent the new tianyi profile into the generic side-gate QA adapter. Dedicated actual-platform/stair adaptation is QA-only; 2 local contract tests preserve strict identity and existing generic/Kunning behavior.
2. final-02/B-current reached the new route body audit. A newly written assertion incorrectly used the inherited smoothed camera feet as the walking physics datum. A small local replay reproduces four 60Hz contact frames against low stair risers only. FirstPerson uses max(feetY,groundY) for walking collision and smooths camera feet later. The corrected test preserves full collision checking at that physical datum, adds actual triangle checking of the smoothed body against arch/leaves, and requires exact authored low-stair witnesses for camera-only contacts. The production controller, stair geometry and collision sources did not change.

A read-only review also caught the old global overhead inventory expectation before the retained phase: it is now precisely three old Wumen curves plus one Tianyi curve. The full assertion census preserves all old route collectors and records only two world counts and this one inventory expectation as replaced.

The local diagnostic probe prints observations but is not counted as acceptance. Completed third-attempt stages, not these failures or partial progress files, are the only full-world pass evidence. CPU QA RAM and timing are not game/GPU performance measurements.
