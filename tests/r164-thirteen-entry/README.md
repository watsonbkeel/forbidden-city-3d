# 南十三排垂花门入口

基线98f70ee2。运行仅新增ThirteenSouthEntry.js和ZoneBase一行import/一处调用；南北十三排原源码不变。组件属于南十三排FC-2D04E0B566的局部，不新增第30项。

故宫官网236528与8282官图已亲看。灰顶、红门/垂柱、彩绘横枋和石阶有图像依据；位置(-361.85,143.6)、尺度、灰曲顶/蓝绿金色块、背面石阶/全开姿态属拟合。未复原精细雕花、内部/现时办公陈设、完整院墙或实际开放。

- 轻量：`node --test --test-concurrency=1 tests/r164-thirteen-entry/{component,controller,identity,missing,lifecycle,ledger}.test.mjs`
- 真区串行：`THIRTEEN_ENTRY_EVIDENCE_DIR=<existing-directory> node --test tests/r164-thirteen-entry/production-zone.test.mjs`
- `preview.mjs <output.png>`仅CPU平面投影，不是WebGL/光照验收。

98f真实单区旧28159网格/610516三角、7467碰撞/249面、19628屋顶三角及地图/房间等有冻结摘要。只剥离唯一入口marker；不得重新生成基线掩盖回退。旧North源边界只新增对本轮唯一import/调用的剥离，原断言保留。

入口32正向/12阻挡、8敛禧→入口→首排连接、12正常跳跃检查，原26排/敛禧三门/保泰及累计通路保留。真实FirstPerson控制器，脚本调视角并在拐弯前减速；不等于任意持续冲刺或真机输入全验。门楣触顶最高头约3.359m，现有overhead机制在约3.36m实体底下截停并回到.36m台面，不称0.001m为自由净空。移除侧墙与石脚的两碰撞会穿过；移除门楣overhead会穿过其底面，证明负控有效。

红绿：最初组件侧墙/宽台基挡旧x=-358接路，缩回靠路墙和平台后仍暴露10Hz终点越步的接触；最终整体向城墙侧偏0.25m，保留原路线/旧断言。现在只保留一侧短墙，另一侧开放，不称完整南墙闭合。跳跃夹具最初先设坐标后接cm会回落0，已按实际加载顺序先接cm再setPosition站到真实台面。

新几何先登记再写属性，故障注入覆盖position/UV/roof-normal和晚期接触，宿主不变/所有私有资源释放/显式重试；真实finish→release→dispose和重复dispose无双释放。借用石材不释放。新增77网格3780三角/21接触/5可见顶面/6私材，无纹理文件/地图/房间/传送变化。

不跑完整World或受限浏览器，GPU/手机/Node20与Mac温度未验。原缓存unknown-texture-size/32MiB不足问题不在本轮宣称解决。
