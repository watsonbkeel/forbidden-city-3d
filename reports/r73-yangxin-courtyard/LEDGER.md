# R73 execution ledger
Plan: docs/superpowers/plans/2026-10-24-r73-yangxin-courtyard.md
Baseline current-state: 1139 pass / 151 fail / 1290 total, before runtime edits.
Ruling: no complete cross-court wall: unknown endpoints cannot justify closed geometry; local gate and lower side screens only. Cost: courtyard remains visibly partial.
Ruling: final fitted central body is 8m, side screens4.1m each, total16.2m, inherited11m anchor is a legacy rough map footprint not a survey; image ratios and readable 3.2m opening take precedence. Cost: dimensions remain provisional.
Ruling: rear wood screen has its own open central aperture visible in photo, not solid blocker. Offset3.6m is reversible unknown-depth fit.
Ruling: initial route test forced feet0=0 when starting on retained raised hall approach; failed immediately in reverse at existing platform. Removed forced start height to use real CollisionManager.getGroundHeight, not a production physics change. Original failed log preserved.
Task1 component red→green and six focused tests passed including actual merged lifecycle. No external source photos copied into repository.
Task2 inventory negative tests red→green. Frozen R72 inventory unchanged; successor allowlist records every runtime change.
Final metadata ruling: merged CourtKit output retains only structure metadata, so the gate carries the same source/fit profile through structure.id, tested after actual merge. No geometry change from this fix.
A final night-B run correctly failed its source fingerprint guard while the metadata fix was being applied. That log is retained as final-night-B.tap; it is not successful evidence.
Concurrent final heavy tests produced process-level failures without a failed product assertion in frozen-night-B.tap and frozen-r72-focused.tap. Cause not proven; all heavy suites are rerun serially without runtime edits. Earlier logs are preserved, not relabeled passes.
Final current-state frozen bytes: 1139 pass /151 fail, all151 failure labels identical to baseline (failure-comparison.json). This is not a clean full suite.
Zone check retains exactly the baseline two errors (Wuying gate north exit; Wuying hall front start collision) and20 warnings. Anchors retain Shenwu11m discrepancy and Qian-dong-five group kind mismatch. These older issues are not repaired or hidden by this courtyard batch.
Final serial reruns: targeted R72 retention37/37pass and all4 full worlds pass at frozen5feb8751 fingerprint; no runtime edits during serial runs. Independent parent reviewer found no blockers after image inspection and targeted tests. Clean cumulative package134files hashes verified.
