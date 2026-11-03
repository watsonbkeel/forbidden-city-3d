# 建福宫正殿 Implementation Plan

> **For agentic workers:** 原生executing-plans，不派代理。

**Goal:** 交付三间×三间黄瓦绿边正殿可辨主体/实际前后廊。
**Architecture:** 新JianfuMainHall.js导出buildJianfuMainHall(kit,zone)→{frame,meta}|false；ZoneBase一hook；私有材质及真实碰撞。保旧2c7。
**Tech Stack:** Three.js/CourtKit/FirstPersonControls。
**Spec:** docs/superpowers/specs/2026-11-03-jianfu-main-design.md。
**Global Constraints:** 不用敬胜斋图、不做未知室内/连廊/外匾；不上传/main/派代理；重型串行。
**Review Focus:** 深屋面高端封口；前后廊/斗拱真实支撑；前槛窗后砖墙差别；抚辰及x196旧路；失败原子释放。

- [x] 官文/官方群景及正常2c7占用基线预检，无新hook。
- [x] tests/r163-jianfu-main.test.mjs：缺失builder/hook RED；三间×三间/四色门8叶/两侧前窗后砖/真实前后廊、7顶、每mesh owner/厚顶高射线、host失败与释放。
- [x] 新src/scene/palace/special/JianfuMainHall.js与ZoneBase单hook；只新增自有实体，既存源不改。
- [x] tests/r163-jianfu-main/局部原生20路线/8负例；提交产品快照。
- [x] scripts/r163-jianfu-main/render.mjs：实际outer-west目标guard、玩家前/侧及前后廊、俯视/轴线环境，图片/源码hash。
- [x] normal.test.mjs：严格旧2c7流、精确远屋顶+实际新顶、无旧交叠、原x196/抚辰/静怡真阶及浴德/香云旧路线，高封口/CPU正常眼位；单次串行World。
- [x] 干净/gugong/独立目录构建、137HTTP、日志无损归档/未验边界、冻结候审，不上传。

最终记录：fb1db07f源组件/局部5/5、受影响26/26；6CPU正确源/hash、一次World104路线/32负例及严格2c7保留73.9秒通过；干净/gugong/构建/137HTTP通过，无新增失败/重试。内景/未知侧廊/完整立面和现实开放未验，独审由父统筹。不上传/main。
