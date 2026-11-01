# Limited backup contract

Exact parent a32c65150b1080077ad6f92848b3e32983332525, unchanged600 src/data;4412 QA paths. Carry all6 new files, including tests/fixtures/wumen-joint-layout/upper-predecessor-a32-v2.json.gz (323488B;gzip b582e5625227fbd5983e8dcca8800734e280451e3494a2da4fc83a3b5643b329;raw fdcb51be87aa0a8f237f3cfd4d239f78cb49d11c7ec6a239f0b33639e95cf31c). Source and QA logical closure is limited to this explicit stage, not the old complete batch.

Materialize src,data,tests,scripts and package-lock/package metadata; retain prior shared QA chunks/frozen readers. For inherited controller checks also materialize public/textures/hd/manifest.json (previous backup sparse omission caused setup RED; fixed only by exact original file).

Verify SOURCE-FINAL and QA-FINAL exact path sets and every SHA before tests; verify archive index and raw/gzip receipts. Source manifest is not automatically checked by the replay test. Run Node --max-old-space-size=384 --test --test-reporter=tap --test-concurrency=1 with the three files in REPRODUCTION.md. Report actual Node version and original failures. No World/full/build/GPU is required or claimed by this limited backup.

10 missing refs remain:66fd5710,3dcafeb6,f88dc035,98cfd572,fde9a95b,064ecb27,e14c61911844e7aa6ce7c0251e64fd0ad61e67f4,d2592770,6ffd4ebc,9e17ef00;38 old titles remain unexecuted P1. This package does not repair those refs, certify a complete history-free batch, or add an accepted whole object. Preserve rollback; no main/Pages.
