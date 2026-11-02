# 地图名称只显示原地名：去掉显示层后加后缀

Base `bf6705edcd704a3af32ff3b6cba6cb635b529955` (integrator-confirmed remote 5a086 equivalent).

Only production change: **one drawSideItems drawLabel argument in src/ui/Minimap.js**, replacing the generated `（旧址）` / `（外观）` text conditional with `it.name`. No regexp, truncation, rename or identity rebinding. Meaningful original parentheses such as `普通地名（东）` remain intact. This also applies to 钦安殿's existing exterior-view label; geometry, action and information do not change.

Normal ZoneBase/PublicPlaceNames already supplies clean new-shell map names; this patch closes a later renderer suffix that bypassed that projection. The display changes 储秀门（旧址）→储秀门, 长春门（旧址）→长春门, 延禧宫（外观）→延禧宫. `targetName`, `mode`, placeId and all historic marker / exterior navigation fields stay unchanged. Existing names/regions/rooms/structure metadata remain untouched.

Historic marker **does not imply an originally disabled navigation target**: current Teleport still includes original historical-gate names. Preserve that availability, estimated location and zero-physical-gate marker; do not invent a prohibition. Details continue explaining demolished historical buildings. 延禧宫 remains exterior-only ground viewpoint (x=-148.2,z=312.45), not an invented interior route. Teleport, PlaceInfoPanel, PublicPlaceNames, HistoricalGateSites, YanxiRuin, FlightState and catalogue bytes are asserted equal to base.

Flight's `午门外虚拟停靠点` is a functional/safety description in a landing selector; it is not changed by this task. HUD model-fidelity explanation lines and historical catalogue paragraphs are separate explanations, not silently deleted or treated as leaked structure names.

## TDD / actual verification

- New labels test constructs the actual two historical gate map markers using ZoneBase.buildGate (no gate mesh/body) and the actual 延禧宫 map item using ZoneBase.buildHall. Minimap.drawSideItems→drawLabel→paintLabel execute on a real @napi-rs/canvas context. fillText capture also forwards to native drawing, not a mocked drawLabel.
- Before source edit: **3 name assertions fail**, showing `[储秀门（旧址）,长春门（旧址）,延禧宫（外观）]`; preservation assertion passes (1 green/3 red).
- After source edit: new **4/4**, prior `tests/r158-place-display/names.test.mjs` **3/3**; combined **7 passed, 0 failed, 0 skipped**.
- Existing `west-six-current-passages.test.mjs` selected only `old-site map labels`: **1 passed, 0 failed**. Node24 reports 1 executed test and skipped=0; unmatched tests did not execute and are NOT counted as passed. No World was built; selected body tests map-marker footprint/target behaviour only. Top-level imports read test fixture metadata but do not call buildWorld.
- First selected-marker attempt failed at import due sparse checkout missing `tests/fixtures/r39-model-fidelity-inverse.json`; restored exact tracked fixtures then reran green. Original error log retained, not counted as feature RED.

Commands:
```
node --test tests/r158-map-label/labels.test.mjs
node --test tests/r158-map-label/labels.test.mjs tests/r158-place-display/names.test.mjs
node --test --test-name-pattern='old-site map labels' tests/west-six-current-passages.test.mjs
```

Three old QA contracts explicitly expected the removed suffix: historical marker text, qinan exterior map text, and R49 old mode-based fixed two-line font-size denominator. Update only these expectations: the last now counts actual painted text lines. Preserve every original interaction/size/visibility assertion. The full qinan and R49 world-based suites were **not run** in this limited UI-only author task. No build, full World, GPU/mobile/browser acceptance claim.

Local raw logs `/tmp/r158-map-label-0340` are hash-pinned in summary, not shipped. Sole integrator will combine this candidate with a non-map update; do not publish this map change alone.
