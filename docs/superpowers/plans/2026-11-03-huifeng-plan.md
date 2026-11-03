# 惠风亭 Implementation Plan

> **For agentic workers:** 原生executing-plans，不派代理。

**Goal:** 可辨双重紫/蓝攒尖、白石台栏的单层敞亭，可原生通行。
**Architecture:** 新HuifengPavilion.js导出buildHuifengPavilion(kit,zone)→{frame,meta}|false；ZoneBase单hook；私有材质/真实顶与碰撞。保ea7。
**Tech Stack:** Three.js/CourtKit/FirstPersonControls。
**Spec:** docs/superpowers/specs/2026-11-03-huifeng-design.md。
**Global Constraints:** 不做封闭殿/二层/未知赏石/木座，不移旧墙，不上传/main/派代理；串行重型。
**Review Focus:** 敞亭中央通视；双檐支撑/厚面；南北口与石栏真实碰撞；静怡z474.2与建福后阶/x196保留；所有构件与失败原子释放。

- [x] 官文/具名近景/群景、ea7只读基线预检，候选均无旧交叠。
- [x] tests/r163-huifeng.test.mjs先RED；三间方网/单层敞亭/双檐紫蓝/白座栏、7实顶/6阶、柱梁支撑/开放视线/每mesh owner与失败守卫。
- [x] src/scene/palace/special/HuifengPavilion.js与ZoneBase单hook，所有新构件实际碰撞；无旧源变化。
- [x] 局部原生30/60fps步行/跑步20路线/栏杆负例，提交产品快照。
- [x] scripts/r163-huifeng/render.mjs实际目标guard，CPU视点/双檐/平台/轴线；核source/images hash。
- [x] normal.test.mjs严格旧ea7流、远屋顶精确添加、无旧交叠、与建福/静怡/抚辰等旧路线、真实正常眼位与通视。
- [x] 干净/gugong/独立包、137HTTP、无损日志/已验未验边界、冻结候审。

最终：06e83326主体5/5与受影响30/30；原石基/短踏面/物理保留，功能通行优先，局部/World12脚缘帧完整同一并留账。首World52.9秒进程退出未确认核杀因；QA恢复原网格与2GB堆/GC阶段落盘，一次受控World124路线/40负例90.9秒通过；6CPU和干净/gugong/137HTTP通过。不以零接触修改产品，不上传/main。
