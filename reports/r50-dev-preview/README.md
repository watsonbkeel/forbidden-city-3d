# R50 local DEV experimental preview successor

Base: frozen joint candidate 9b5bc89, remote 1786a3a0af6618bcbc8c52294450b100130d67b9. Only the development review path changes. The production rollout constant remains false; no model, image, world-source, collider, navigation, dependency or Pages change.

## How to use

On a local checkout with its locked dependencies installed, run `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`, then open http://127.0.0.1:5173/ . Wait for initialization, open the existing settings, and explicitly click **人物实验预览**. Default is off. The existing launcher continues to say “preview 未验收” when settings is closed, including compact map mode. This is not a formal approval and does not certify performance, scene visuals or historical specificity.

Use the existing map to visit 太和殿、储秀宫、翊坤宫、永寿宫. Day/night rules remain active: use the existing time-preview panel for daytime review if required. Zone/support readiness still applies; allow several seconds and inspect pending/error counters rather than assuming all people instantly appear. No route or camera coordinates are forced.

Click the experimental button again, or turn the ordinary 宫廷人物 switch off, to close and revoke preview. Turning the ordinary switch back on cannot silently restore preview. Refresh starts off again. There is no localStorage/cookie/URL preference. `npm run preview` serves a production build and intentionally has no experimental button. A GitHub production link is therefore not a substitute for this local DEV review route.

## Implementation and boundaries

The existing System/Manager/renderer/RAF are reused. A private session preview state is distinct from formal contentApproved; snapshot shows preview-unverified while formal approval remains false. Validation errors, missing support, day/night scheduling, background handling and cancellation are not bypassed. Production compilation makes both preview-enabling methods return false, removes the UI and DEV hook, and removes preview-unverified strings. UI state synchronization does not rewrite DOM on unchanged frames. A runtime failure turns preview off.

## Validation

- Final combined specialized/control suite: **152/152**, including 9 compiled System/session tests, 13 DEV/PROD UI tests, and all15 original skyline tests. See targeted-fixed-final.tap.
- Actual Vite DEV UI transform and actual production compilation are executed in the tests. Final whole app build exit0; production-build-proof.json records asset hashes and absence of DEV markers/native canvas. Existing chunk-size warning remains.
- Extra current-state command, not all repository tests: candidate initially1027/907pass/120fail; frozen baseline1023/906pass/117fail. The new four animate-method SyntaxErrors were fixed in main, without altering original skyline assertions, and pass in the final152. Baseline additionally aborted the historical-lamps entry before its5 tests registered; exact cause unknown. Both versions independently pass5/5 serially. The116 common historical failures remain failures, not green. Raw commands/logs and current-state-comparison.json preserve all distinctions; there was no final all-current-state rerun.
- One old integration regex expected a one-expression arrow handler; its original red is retained. The assertion now checks the same setEnabled call plus the required preview-off synchronization. No geometry oracle changed.
- Browser layout/GPU validation remains unavailable. One default Playwright attempt failed before startup because its expected headless executable was missing; no browser page was reached, no escalation or forbidden path was used, and no retry occurred. This must not be presented as a screenshot or real-browser pass.

## Report transport

Only large raw report logs are gzip-compressed. `report-archives.json` records compressed/original sizes and SHA256; `node scripts/p3c-verify-preview-report-archives.mjs` validates restoration. No fixture, expected value or source is compressed or regenerated. Original raw failures remain exactly recoverable. Existing frozen candidates are not edited.

GPU/device/frame A/B, actual browser review and the historical boundaries from the joint candidate remain open. This successor supplies a usable explicit review path; it does not convert those pending gates into approvals.
