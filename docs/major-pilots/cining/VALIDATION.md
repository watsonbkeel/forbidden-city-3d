# 慈宁宫闭合门窗叶区域验证

基线f0c52da31acdf47ce822da7a1db758f83b611f6f。官方236504页与1425×705正面图实际查看，参考放大仅辅助观察、不增加图像精度；缓存约1.1MiB在/tmp，不生产打包。摄影日期未知。正文双交四椀菱花保留为sourcePatternName；实现仅±45菱形骨架，四椀花瓣未精确复原。门下拟合成对内卷与起伏框，不认定具体纹样名称、雕法、木种或贴金工艺。可见门画像明确未重建。

## 实作
16闭门+8闭窗分型，原192外凸纸面/粗格替换为3536内嵌部件。16门下有成对曲线及裙板框，8窗只有窄下板；中央4开叶与净开口完全保持。背衬继承不透明拓扑，颜色照片拟合、真实材质未知。每件接背板，最终Float32整装包络等于旧叶，原保守AABB保持，不是新凹格逐面精确代理。没有新增physics/隐形面。

其他网格/材质、完整g（现代展台/展柜和绕行、旧overlay禁用策略、屋顶台基等）深比较保持；大佛堂/寿安共享函数开关隔离。合并mesh21→22，三角6360→46488；collider76/walkable2保持。3560拟合源mesh（24背板+3536新部件）非退化、merge/最终卸载生命周期平衡。

## 串行验证
专项 `node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/cining/*.test.mjs` 最终10/10（specialized-final.tap）：
- 分型、原物理/导航、Float32合并包络、所有部件接背板、金线前于框。
- 48曲线run连续，起伏外框闭合，卷曲线仅门叶；每段中心线端点落在相邻交叠条内。
- 完整World中央进/出、两条现代展陈绕行路径，10/60Hz走跑共16路次。此是通行证明，不是全场逐三角穿透审计。
- 局部CollisionManager闭门/端窗方向走跑跳16组与原版逐帧严格相等；另断言实际起跳、未穿闭叶。
- 新增面非退化与生命周期；所有非目标几何及兄弟楼保持。

到点红测：10Hz跑步会在目标两侧离散采样，最小点距0.5034964662044409m，原点距<0.45m的测试误报；父f0c52da原源码同路径精确复现（parent-waypoint-red.tap、parent-waypoint-check.mjs）。最终测试保留原点距判定，另接受真实位置越过目标垂面且横偏<0.15m，并限最大单步位移/越程不超过PLAYER.SPRINT_SPEED/fps+1e-6。未修改生产控制器、碰撞容差或运动模型，不能将测试到点阈值当物理安全间隙。

相关旧测试按名称慈宁/Cining/cining选取modern-binding、outer-lifecycle、outer-navigation、runtime-outer-entries、review-outer-bearing-chain：14/15。唯一失败是旧qianqing注册哈希，父f0c52da同样复现；名称与actual/expected哈希机器比对一致（known-failure-comparison.json），旧黄金数据与断言未改。现代慈宁禁用GLB的runtime-loader测试通过；本次overlay策略原样保留。

独立轻量8/8；测试到点修正经复审确认合理，并补单步/越程限制。未做实机同视角、GPU性能、全current-state或全major；仍VERIFY_PENDING_BROWSER_BEFORE_AFTER、acceptedWholeObject=false，不是整殿或整个正立面验收。原脏报告不纳入；无构建、推送、部署或main修改。
