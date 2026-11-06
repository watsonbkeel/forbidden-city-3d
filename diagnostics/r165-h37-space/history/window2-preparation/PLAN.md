# H37 infrastructure repair, explicit diagnostic window 2

Parent explicitly authorized this new one-time window after the first run failed before any job. This is not an automatic retry under window 1.

## Preserve and isolate

- Keep original directory, FREEZE 1dbb1a34, commit 0c7c9ae9 and failed run 42167988472 unchanged.
- Use a new isolated sparse checkout with the same public product base 2544. Copy only the reviewed diagnostic additions for a minimal repair.
- Continue the same branch and workflow path. The new commit has sole parent 0c7c9ae9 so publication is a normal fast-forward with expected old SHA. No main/deployment/product change.

## Minimal repair and strict window identity

- Remove the illegal job.env runner.temp expression. Set EVIDENCE_DIR from RUNNER_TEMP in the first shell step via GITHUB_ENV.
- Require exact workflow ID 408971663, run_number 2 and attempt 1. Require exactly the historical failed run 42167988472 and the current run in that workflow's complete run listing.
- Independently verify the prior run's exact head, status failure, attempt 1 and zero jobs. Preserve that evidence in the new package and admission output.
- Bind canonical authorization to window 2, exact new commit/tree/freeze, prior failure and a fresh one-use release preimage. Keep receipt-first/readback, release-last sequencing and all wall/monotonic/API deadlines.
- Preflight permits sole diagnostic parent 0c7c9ae9 while still requiring every public product/test/lock/asset byte from 2544 and the exact added diagnostic-only delta.
- Preserve all 45 original assertions, 184+89 completion identities, 158 complete raw-frame obligations and unchanged 768 MiB / 256 MiB / 180-second contract.

## Verification and publication

1. Add red pure tests for wrong ordinal/workflow/prior run, prior jobs, current-run mismatch and preflight receipt mismatch. Implement only the identity repair.
2. Reproduce the original GitHub expression error in an offline semantic checker; verify the corrected workflow and all embedded shell/Python/JavaScript syntax without importing a fixture.
3. Run all inherited pure/static tests and native input preparation. Independently review the new admission and whole repair delta, then freeze.
4. Verify exact remote old branch SHA, original failure, no second run and unreleased preimages. Upload/read back only required changed objects; preserve all original evidence.
5. Update the dedicated branch once, with expected old SHA. Verify the actual new numeric run, publish exact canonical receipt then release, and track terminal artifacts. Any failure closes this explicit window with no automatic third run.
