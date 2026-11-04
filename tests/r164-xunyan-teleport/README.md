# 寻沿书屋入口导航修复

基线27b8f9dcfe5d362cadea100c402ac7f806e4e0a5。旧地面落点z416.8实际在现有0.2m石阶上，严格Teleport因此拒绝；新落点(-334.5,0,415.5)在五阶前真实地面。仅更正该建筑南向approachPoints，不改变原五阶、门体、物理、公共Teleport认证或其他建筑。

- 轻量：node --test --test-concurrency=1 tests/r164-xunyan-teleport/{profile,geometry,teleport,go,controller,history,ledger}.test.mjs
- 实际宁寿：node --test --test-concurrency=1 tests/r164-xunyan-teleport/production-zone.test.mjs
- 旧累计：node --test --test-concurrency=1 tests/r164-yihe-jingqi-connector/production-zone.test.mjs

fixture使用真实生产组件、CollisionManager、FirstPerson和Teleport；时间、DOM与转向为脚本夹具，转弯前减速，不等同任意持续冲刺或浏览器输入。24条前后穿行包含10/60/144Hz×走跑×正向/后退×往返方向，另12条左右阶道来回。旧路线必拒、缺阶/堵门/错误高度仍拒，无fallback。

历史connector累计摘要仅归一这一已断言的新导航列表，须唯一ID、所有五处别名列表精确匹配冻结新点；缺失/重复/漂移均拒，其他字段和后门变化仍使历史比较失败。全部几何/碰撞/材质/地图/房间摘要原断言保留。

原始红测为真实Teleport返回null；新生产夹具曾有静态JSON导入时序和433.15字面量对实际433.15000000000003的测试错误，修正夹具后复跑，不修改游戏浮点。最初JSON快照丢失负零，现用精确旧源码模块实例作全profile深比较，保留负零。完整World/浏览器/GPU/手机/Node20及Mac温度未验。
