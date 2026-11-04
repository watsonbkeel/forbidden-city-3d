# 敛禧门有界验证

冻结基线521b9d902fba545055b52a5c7c20e153454918c1。运行源码仅LianxiGate.js及ZoneBase3处集成，数据不变。

- `node --test tests/r164-lianxi-three-gates/component.test.mjs tests/r164-lianxi-three-gates/dispatch.test.mjs tests/r164-lianxi-three-gates/controller.test.mjs tests/r164-lianxi-three-gates/wall-retention.test.mjs tests/r164-lianxi-three-gates/atlas-retention.test.mjs tests/r164-lianxi-three-gates/identity-ledger.test.mjs`
- 单独串行：`node --test tests/r164-lianxi-three-gates/production-zone.test.mjs`，约0.8GB，不并发大区或构建。

baseline.capture仅能在521且src/data干净时记录，不在常规测试自动更新。baseline-routes.capture从已哈希固定的521源加载，不取可漂移旧目录。核心快照排除明确原门与整个相邻墙，另wall-retention检查完整远端墙及保泰门，不能省略。

来源、拟合、资源代价、正常路径和实际未验边界见docs/current-state/r164-lianxi-three-gates/RESULT.md。严格区分原始非目标网格快照与共享牌匾atlas重排后UV，atlas-retention检查其余8门文字语义。生产单区不是完整World或GPU验收。
