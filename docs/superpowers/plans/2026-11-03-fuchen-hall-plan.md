# 抚辰殿可辨主体 Implementation Plan

> **For agentic workers:** 按父指定，使用superpowers:executing-plans在本会话原生执行，不派代理。

**Goal:** 交付可辨、可绕行的抚辰殿蓝瓦前后廊主体。
**Architecture:** 新FuchenHall私有组件＋ZoneBase单hook，真实石顶/三角碰撞。旧结构/物理不改。
**Tech Stack:** Three.js/CourtKit/原生FirstPersonControls。
**Spec:** docs/superpowers/specs/2026-11-03-fuchen-hall-design.md

**Global Constraints:** 保x196旧路线，不复制建福宫黄瓦/门式/匾，不上传/main/派代理；单进程验证。
**Review Focus:** 前后廊人高净空；屋顶两面封口/柱支撑；旧x196北路/门；失败释放；严守非室内与拟合边界。

**Files/interfaces:** 新src/scene/palace/special/FuchenHall.js导出buildFuchenHall(kit,zone)→{frame,meta}|false；src/scene/zones/ZoneBase.js调用一次；tests/r163-fuchen.test.mjs、tests/r163-fuchen/验证组件/局部/旧流；scripts/r163-fuchen/render.mjs与reports/r163-fuchen留CPU/构建/边界。

执行环境：r163-fuchen-hall-1133，基于aa978fe6，父已直接批准紧凑方案。采用现有Three/CourtKit真实几何和原生控制器测试。独立开发，不派代理/上传/main。

- [x] 已完成：官文、官方俯视核查；实际正常World基线与候选/旧路预检，无旧实体相交；保留原始日志及不可见边界。
- [x] 添加红测：三间蓝瓦绿边厚卷棚歇山、前后廊、闭合门窗、真实石台/前后阶、每可见mesh实际owner、原host守卫与失败释放；单hook保护旧hook。
- [x] 最小产品：私有FuchenHall新组件＋ZoneBase一调用；不改旧实体。屋面/厚山花/隐面闭合、两向真实廊及低阶，细格仅拟合。颜色、尺寸、前后门姿与隐面均标界。
- [x] 局部原生30/60fps步行/跑步：前阶前廊、两侧、后阶后廊、南北回路；闭门/侧墙负控。组件通过即提交产品快照供独审。
- [x] 单进程最终CPU图，正常眼位/廊下/俯视，检查真实可辨主体与旧门侧路。
- [x] 串行一次正常World：严格旧aa978流、旧远屋顶+实际新顶、无旧实体交叠；新路线、建福门z414/x196至静怡真阶及原Yude/Xiangyun重要旧路线。
- [x] 新目录干净/gugong/构建、源码身份核对、137文件HTTP；无损日志归档、证据/局限清单、最终冻结。失败保留/先诊断，不盲重试。GPU/全区/全历史/现实开放/内饰/整项不验。

执行记录：aa978只读预检19.2秒通过；四项缺失实现RED；三间蓝/绿卷棚和前后廊组件4/4、局部原生20路线/8负例通过。无产品外变更；独审由父安排。

最终记录：3f3706补两块真实厚上山花，y5.4正反4射线RED→GREEN；组件/局部6/6，受影响22/22，正常World84路线/24负例与严格aa978保留通过67.4秒；6CPU正确源/hash、干净/gugong/137HTTP通过。原设置/产品失败及历史图独立保留。不上传/main。
