# H32 west sidehall bounded integration design

## Intent and scope
Add a limited exterior for H43 ordinal 32, Zhongzheng west sidehall (FC-77D6708679), without changing retained paths, buildings, main or Pages. Remote base c12e478093fa9be067e9d31e7266c6f4b4dda8df has tree 5510763c2704f06017944dd7c5e7a1e8c52dcb82; local same-tree base is 2bab346c968901acc779ace4cbbb3e030e78ca8f.

## Approaches and choice
1. Reuse only the previously reviewed c46dd811 component and its single production hook. This preserves independent identity and avoids rewriting already checked geometry. Selected for this bounded integration.
2. Rebuild the compound or merge the old branch. Rejected: unnecessarily expands layout scope or loses the latest cumulative fixes.
3. Wait for full World/GPU acceptance. Keep c12 as the safer fallback, but independently validate the small integration now. The final release decision remains separate.

## Product design
Only add src/scene/palace/special/ZhongzhengWestHall.js and its import/call in ZoneBase.js. Preserve the former component bytes where possible: centre (240.8,397.5), east-facing, declared reserve x235.2..246.4/z391..404, a closed unknown interior, real .45m platform and two short real steps. Keep x248 and z406 bypasses and Xiangyun's four approaches. No new teleport/map item, room, furniture, plaque, invisible ramp, physics or old-wall change.

## Evidence and limits
The official 2021 journal PDF, file page 7 / printed page 20, establishes the reconstructed west-side identity, broad single-storey yellow-roof/red-wall form and court relationship. The official 2012 completion announcement establishes reconstruction, not surviving Qing fabric. Exact roof class, bay/leaf counts, near facade, dimensions, hidden faces and interior remain unverified fits. Public presentation must use the formal name, never an engineering suffix.

## Acceptance and rollback
Pin the c12 base and exact source delta. Run missing-component/hook red tests, component safety checks, 76 local positive routes/20 negatives, actual bounded production-zone old-object protection and negative controls, affected regressions, clean Pages-base build and source identity/HTTP verification. Obtain independent review before upload; fully read back the new branch. Preserve prior branches. No full World retry, browser-permission workaround, GPU/mobile/temperature claim or deployment. The narrow 1.36m ledge is usable in CPU routes, not generous clearance. Keep two historical SIGKILL failures explicit, never count them as passed.
