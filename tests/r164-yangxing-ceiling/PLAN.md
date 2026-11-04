# R164 Yangxing gate central-front ceiling

Base: 675b95d03532dd9aa5473a95a8f5fe491e2a0287. Sole inline implementation, independent reviewer coordinated by parent.

Goal: add the visible flat painted ceiling missing above the existing central front passage. Official source: Palace Museum PDF https://www.dpm.org.cn/Uploads/File/2019/12/15/u5df60cf540978.pdf , PDF 6 / printed 127 / figure 3 (养性门). The photograph supports a blue/green square-grid flat ceiling with gold circular motifs, not a surveyed reconstruction or a sunken caisson.

Design: one thin fitted backing and one downward-facing private canvas panel within the existing central front beam/pier envelope, x ±1.81, z -3.465 to -0.65, bottom about 6.45m. Preserve original plaque at z=-0.43, all existing geometry/materials/physics and all three inherited passages. 6×5 grid, colors, plain circles, exact height/size and placement are explicit fits. No dragon painting, new writing, furniture, doors or upper access. Full-gate identity/fidelity remains partial.

Alternatives: replacing all five bays would guess unsupported geometry and disturb paths; repainting shared caihua material would affect unrelated objects. A private additive central panel is the bounded choice. No other runtime refactor.

Review focus: wrong/similar gate must no-op or reject; readonly owners must reject before submission; allocation failures must release only private staged resources; the panel must be first visible from below and clear the old plaque; old routes and normal jumping must remain identical and not intersect the new ceiling.

- [x] Freeze exact base ZoneBase, capture real NingShou raw objects/data/roof before hook.
- [x] Red component tests for missing panel, source binding, private pixels/downward face, source immutability, repeat/readonly/failed canvas and late allocation cleanup/retry.
- [x] Add YangxingFrontCeiling.js and one ZoneBase gate hook; run component green.
- [x] Actual bounded NingShou before/after summaries, real controller routes with blocking negative controls and normal jumps; retain all prior NingShou checks. Yangxin B/S and Fengxian neighbor/cache regression.
- [ ] Identity ledger and source-boundary tests, update truthful README/results. Run bounded regression, independent review, clean Pages-base build/HTTP resources.
- [ ] Create unique dev branch remote commit and verify every uploaded file, full tree, parent, refs/compare/checks; main and old branches unchanged.

Ruling: no entire World/browser or Node20 run; explicitly prohibited/unavailable. Keep test failures in evidence, not silently count historical stage-specific snapshots green. Do not spend time on harmless sub-0.3m geometry variation.

Execution record: 193 required checks and independent 27 passed. Historical unrelated-gate comparison now excludes only the new uniquely identified 2-mesh ceiling; all prior-object assertions retained. Release build/remote readback are performed against the clean committed tree and recorded externally to avoid self-referential commit identity.
