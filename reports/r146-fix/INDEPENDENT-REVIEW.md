# R146-fix 独立有限复核

固定源码 9ce1d7a3e9046a92359f4363dabd21d3c24941c2，父 R146。产品差异仅 Environment、SharedRestNavigation、新 EnvironmentVisualOwnership 及 release=R146-fix；未修改已冻结R146/main，也不混入后续局部图案。

已只读核 fullworld 旧版红证：实际 Environment.update 后，天空被错误纳入 staticMeshes，合法相机跟随变换使 nav 由 ready 转 error: Verified static route geometry changed or detached；双人 routineRenderable=false，Manager 在40m residency/模型队列前跳过。旧测试世界只 setupGround，漏了生产天空/skyline。

修复采用真实创建后 WeakMap 身份登记，仅天空和远山视效不进入建筑静态证据；非按名字/材质类型宽泛豁免。地面、太和构件继续静态守卫，dispose撤销，新的子节点不继承登记。原有非建筑userData排除规则未改，本次负例仅证明新身份通道不接受伪标签，不宣全局任意标签安全性。

独立执行：
node --import ./tests/r141-fix/json-hooks.mjs --test --test-concurrency=1 tests/r146-fix/environment-ownership.test.mjs tests/r146-fix/production-environment.test.mjs
结果 2/2 PASS，7915.662703 ms，日志9ce1d7-independent.tap。含真实Environment相机更新、帝妃renderable、太和/地面变更负例以及fake/newchild/foreignscene/detach/revoke。

只读核写手 target.tap：9/9 PASS，107528.262645 ms。覆盖实际环境移动10/30/60Hz夜去晨返、生产顺序 environment→interiors→zone→characters 的日间四场实例/射线、旧S生命周期与脚踏等。此9项未由 reviewer 全部重跑，避免CPU争用。生产帧测试的batching begin/end只初两帧，未实际WebGL绘制；夜往返为routine状态与姿态/位置验证，不等于夜间GPU像素。

无代码阻断，可进入固定三base构建与HTTP/远端回读。实际GPU/手机不可见问题仍需实机回看，不提前称已在用户浏览器验证。不得放宽路线/身体/oracle或以改40m半径替代此次根因修复。
