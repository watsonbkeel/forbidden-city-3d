# R50 evidence index

This is a gated development candidate, not accepted first-version completion. Validated source commit: `c560681c9731ffeb119b50530dc1120aa16ad33d`. Later documentation/evidence commits do not change its production modules, data, scripts, tests, package manifest or lockfile.

## Start here

- `../../docs/agent-tasks/REPORTS/P3-C.md`: delivery status, scope, limitations, rollback and next steps.
- `acceptance-matrix.md`: C-A01 through C-A16, with CPU-only and unverified boundaries.
- `coverage-summary.json`: automatically counted 38 required actors / 7 templates, per-ID scene and disabled-rollout reasons.
- `world-bindings.md`: every actor's actual architecture, surface, seat and path mapping, public contracts, independent real-ray checks and known constraints.
- `independent-review.md`: independently reproduced defects and fixes, remaining P2 findings, actual production-System lifecycle execution.
- `c1-samples/README.md` and `c1-samples/c1-delivery-manifest.json`: real-geometry image provenance, rejected samples, final candidates and hashes. No browser/GPU screenshots are claimed.
- `c1-samples/history-reference/hairstyle-evidence-card.md`: the unresolved specific hairstyle image requirement.

## Exact candidate validation

- `p3c-clean-final.tap.gz`: 77/77 new tests after a fresh exact-lockfile installation; 9 test files.
- `candidate-standard-commands.json`: exact build, zones, anchors and 12-file R49 command arguments, timestamps, environment and exit codes.
- `candidate-build.txt`, `candidate-zones.txt`, `candidate-anchors.txt`, `candidate-r49-focused.txt`: raw outputs. Build/zones pass; anchor failure remains baseline; R49 focused 183/183.
- `qa-dependency-verification.json`, `qa-dependency-clean-install.txt`, `qa-dependency-lock.txt`: official-registry exact canvas 0.1.100 QA dev dependency, unchanged old versions/scripts/production dependencies, clean npm ci and native PNG probe.
- `candidate-full-command.json`, `candidate-full.tap.gz`, `candidate-regression-comparison.json`: exact 337-file legacy inventory comparison to the same baseline inventory. Never equate repeated old failure identities with passing tests.
- `compare-regression.py`: stdlib comparator, including normalized diagnostic changes, supports either raw or .gz TAP files. It refuses missing terminal footers.
- `baseline-independent-final-input.json` and `baseline-independent-final-input-verification.json`: exact source/test hashes of the independent c560681 review.

## CPU-only performance and geometry

- `cpu-submission-benchmark-final.json` and `cpu-submission-summary.json`: final 36-run submission microbenchmark with p50/p95 and source hashes. Simulated 30/60s tight-loop intervals are not wall-clock display sampling.
- `baseline-independent-final-integration-results.json`: separately authored production System/Manager/Renderer/ZoneManager audit, 20 real load/unload and 20 off/on cycles, actual 38-instance high / stable 32-instance low coverage, support/route checks, and cold/rebind timing spikes.
- `baseline-independent-final-audit.mjs`: independent audit source.
- `cold-optimization-candidate.patch`, `cold-optimization-candidate.mjs`, `cold-optimization-candidate-results.json`: explicitly UNAPPLIED future optimization experiment. These do not modify the shipped source or pass its cold-frame budget.

## Baseline and earlier evidence

- `baseline-full-sequential-command.json` / `baseline-full-sequential.tap.gz`: primary single-run baseline, 337 files, 5277 tests, 5119 pass, 158 fail, exit1.
- `baseline-current-state-command.json` / `baseline-current-state.log.gz`: separate package command, 85 files, 1068 tests, 952 pass, 116 fail. It is not the 337-file suite.
- Earlier `baseline-full.tap.gz` and killed-file retry preserve the initial interrupted parallel execution. The sequential primary run supersedes it; combined partial runs are not misrepresented as a single footer.
- Other `baseline-independent-*`, `*-red.txt`, `*-green.txt` and initial CPU benchmark records are historical diagnosis/fix evidence, not substitute results for the final candidate.

## Compression and reproduction

Raw TAP/log streams, including whitespace-bearing failing-test .txt outputs, are retained locally and committed as deterministic gzip copies to keep the independent version compact. `compressed-log-manifest.json` records each raw SHA256/size and its gzip SHA256/size. A report's `.tap`, `.log`, or listed `.txt` citation maps to the same path plus `.gz`; inspect with `gzip -dc path.gz` or decompress before replaying tools expecting the original name.

Regenerable mesh JSON caches and obsolete uncompressed animation data are excluded. All delivered PNG/GIF outputs remain actual-geometry evidence; production assets do not require those cache files. Source exporters and render commands are listed in the C1 README. QA uses the exact locked Node canvas dependency, plus Python NumPy 2.3.5 and Pillow 12.3.0; Python QA packages are not production dependencies.

The original local R49 baseline is 92cf31ec1779d0d6266a2caa6ad1708c379d1500. Its verified remote R49 counterpart is 03d1f5b446823fbf924df5c239bfdf8c8b69312b, tree 0e353f23782bc44a3a0288e68838b5e967bb37a4. A remote-only clone may use that tree-equivalent remote baseline. No main merge, Pages deployment, building mutation or browser-restriction bypass is part of this candidate.
