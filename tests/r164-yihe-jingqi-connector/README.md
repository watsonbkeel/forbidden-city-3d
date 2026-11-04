# 颐和轩—景祺阁穿廊检查

基线9e68601aa473bb58459dc6936047c068b5c8d160。生产改动仅一个独立helper与ZoneBase一次挂接。

官文236516/236480支持三间穿廊与中央东西门；官方《紫禁城》2025年第1期108页平面及《“迷楼”—符望阁》19页下图支持后口、低瓦顶与窗面。详见docs/current-state/r164-yihe-jingqi-connector/SOURCE-MANIFEST.json。

- 小组件：node --test tests/r164-yihe-jingqi-connector/{component,controller,lifecycle,identity,missing,teleport,ledger}.test.mjs
- 真宁寿：node --max-old-space-size=2048 --test tests/r164-yihe-jingqi-connector/production-zone.test.mjs
- 不运行World或浏览器。测试使用实际两栋建筑/ZoneBase、CollisionManager、FirstPerson、Teleport；DOM/时间与视角是夹具。脚本在转弯前减速，不等于任意持续冲刺。

只移除唯一旧闭门面/接触；旧门楣保持几何，只加准确overhead。非目标网格/物理与地图/房间/屋顶冻结摘要对9e686，旧门楣摘要先去新增overhead标记，另有精确边界/真实跳跃负控。两旧目标及原地面高度严格认证不变。

初稿0.8m地面曾让景祺阁旧0m落点拒绝；已改中段0m、南端实体九级阶下接颐和轩1m台基，北端原阶保持。此地坪/阶是合理游戏拟合，不称历史形制。缺失挂接、屋顶反向绕序及末端lintel clone泄露都记录过红测，修后各有覆盖。

后口最高头4.109m是4.11m实体木门楣截停余量，不是自由跳跃净空；其他点按各自真实顶部检查。未验GPU色彩/手机/浏览器/完整World/Node20或真实Mac温度。

独审新增源漂移四负控（手动矩阵、共享几何、顶点/索引变异）先红后绿。景祺既有前门跳跃可短暂穿入原门楣，新旧逐帧对照相同，详见RESULT，不称该旧问题已修。
