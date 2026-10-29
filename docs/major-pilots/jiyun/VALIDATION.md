# 慈宁宫花园吉云楼闭窗叶区域验证

基线52a6c02c18d1b1faa6503c400d916990588bbc58；官方236483及正面图s6670e8aa8f637.jpg实际查看。48是继承模型扇数；远端/栏杆遮挡处仅同立面重复关系拟合，非48扇分别核实。0/±60度为参数化近似，不是测量或纹样名称。上方独立横披、彩画、栏杆雕绘未在此步复原；不称整立面/整馆完成。

## 结果
- 两层48闭窗、384旧纸面/粗格装饰替换为2064内嵌件，后半背板沿用原不透明拓扑，实际材质未知。
- 原闭叶保守AABB保持；完整装配最终Float32包络相同，所有部件接背板、金线位于框前，不添隐形面或可站立面。
- 两层8个开放门叶、栏杆、地板、入口台阶、屋顶、供台/龛框与全部导航未改；无楼梯、无新增自动上层导航目的地。
- 合并mesh13→12，三角12712→32872，colliders211、walkables3均不变。照片拟合参考只缓存/tmp约860KiB，不生产打包。

## 串行验证
`node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/jiyun/*.test.mjs`：最终9/9，specialized-final.tap。
- 实际旋转东向后的Float32合并包络/顶点、部件接背板/金线深度。
- 其他几何逐属性保留，慈荫/宝相共享函数开关隔离。
- 完整World在原真实下层/上层支持面开始，中央前后通路10/60Hz走跑16路次；不把上层起点当已验证楼梯可达。
- 局部CollisionManager两个楼层窗前走跑跳16组新旧逐帧严格等价，实际起跳与不能穿窗另断言。
- 2112个拟合源mesh（48背板+2064部件）全部面非退化、源merge后各释放一次、最终几何释放一次。

相关选取：`--test-name-pattern='吉云|jiyun|Jiyun'`运行r48-outer-lifecycle、outer-navigation、runtime-outer-entries、review-outer-bearing-chain四文件，15/16。唯一生命周期断言失败在父52a6c02原源码hook同样15/16复现（parent-related.tap）。诊断新旧均是原jiyun-upper-front-name-plaque `noMerge:true` 在merge时仍保留，最终dispose时释放一次；旧测试无条件要求所有源在merge时释放，与此既有契约冲突。未修改该旧测试、牌匾或黄金数据。脚本parent-hook.mjs/diagnose-retained-plaque.mjs与诊断JSON可复现，不能称全套全绿。

独立轻量6/6，代码未见阻断；完整World与局部轨迹覆盖已分述。实机前后同视角、GPU性能未验，visualStatus=VERIFY_PENDING_BROWSER_BEFORE_AFTER，acceptedWholeObject=false。未跑全current-state/全major，未构建、推送、部署或改main；原工作区脏资料保留。
独立复审亦复现唯一保留牌匾noMerge诊断，确认15/16边界；其最终卸载释放一次已在retained-plaque-diagnostic.json记录。
