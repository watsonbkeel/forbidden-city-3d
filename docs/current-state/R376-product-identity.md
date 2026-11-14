# R376 current identity schema successor

R375 commit 7f741614f7c1e263098faa89b029adceec78e496 changed exactly three relief cleanup functions. Hosted run 43536650752 failed the historical R365 assertion that all 1075 product files were unchanged. Build and full-world QA did not execute; this failure does not establish a product regression. R374 hosted baseline remains 0 errors / 28 warnings.

This QA-only successor preserves every R375 byte, including the unchanged historical failing schema. A new contract checks actual candidate bytes, the exact old R374 and new R375 SHA256 pair for OriginalBuddhaRelief, RefinedCentralBuddha and RefinedSideBuddha, and the other 1072 unchanged product files. Six real triad assets still pass the original assertReady consumer; missing/wrong/source-retained confusion remains rejected. No generic product-change allowlist or bypass is added.

The workflow changes only the identity-schema invocation and release identity, retaining all bounded controls, ordinary build and complete zone QA. Local targeted results are not hosted acceptance. At preparation time, R376 hosted result is pending. Actual GPU, phone, full user routes and network ERR_ABORTED are not verified. R361 real browser capture retains its older R360 identity and is not run here. Fengxian owner admission remains separate, not fixed in this version. main is not modified.
