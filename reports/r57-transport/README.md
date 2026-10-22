# R57 lossless report transport

Only three new report outputs are archived. No fixture, runtime input or previous release evidence is removed. The original local freeze is d25a06dc9fced8c470740be749c23c74d15dee21. ARCHIVES.json pins every original byte count/SHA256/Git blob, container and ordered binary part. Two original gzip reports use identity encoding, not another gzip layer; one raw JSON uses gzip. Thirteen parts total1387220 bytes versus1783028 original bytes.

`node scripts/r57-restore-report-archives.mjs` verifies without writing. Supply a fresh output directory to restore all originals. Destination traversal, symlinks, wrong order, missing/corrupt parts, incompatible existing evidence and decompression mismatch fail closed. `node --test tests/r57-report-transport.test.mjs` covers39 cases. Actual restoration was additionally compared byte-for-byte with `git show d25a06d:<original path>` for all three files; restored-files.json records those identities.

The first failed observer report and the final passing report are distinct evidence; neither is substituted for the other. Intermediate reproducible scene export dumps remain outside the repository. PNG views and their source/export hashes remain directly accessible.
