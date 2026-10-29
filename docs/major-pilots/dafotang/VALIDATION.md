# 大佛堂闭叶增量验证

基础版本：ee61e3f4c25f30afececff3cb368cf7a175c5b3f。官方建筑236533、400×279外景8035；无精细纹样/材料实测声明。

专项串行 `node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/dafotang/*.test.mjs`：7/7，见 `reports/major-pilots/dafotang/specialized-final.tap`。
- 24闭叶：最终Float32装配包络等于旧叶，所有组件在旧包络内并接背板；每个预测合并顶点存在于最终合并输出。
- 四个开叶与全部旧colliders/walkables/rooms/regions/mapItems严格相同；84个其他网格逐属性相同。
- 全World真实控制器：中央进/出、两侧暖阁过门，10/60Hz、走/跑共16路次。
- 闭叶方向：10/60Hz、走/跑/跳8组局部CollisionManager新旧逐帧轨迹严格一致，另证实际起跳高于初始0.2m、最终不穿闭叶。此为回归等价，不是所有既有代理精确性证明。
- 慈宁宫、寿安宫共享构造函数开关隔离通过。

几何成本：合并前304→1504 mesh，合并后17→18 mesh；5116→19516三角。1392个新增小部件、192个旧外凸粗装饰移除。colliders72、walkables2不变。无构建/资产复制/新纹理/新增碰撞面。

独立审查：照片仅支持红褐密格及下板关系；24闭叶/4开叶为继承模型状态；背板为继承不透明拓扑；保守AABB不等于精确凹格表面。未查看候选渲染、未测试GPU性能，`acceptedWholeObject:false`。这不是大佛堂整体验收。

并发资源事件：初次全major并行期间 jingqi/contact、juanqin/routes、ningshou/contact、yanqu/contact收到SIGKILL；同时启动的专项motion也收到SIGKILL。原始日志保留；专项最终串行7/7通过。不得将并发被杀误述成断言通过或产品回归。

全major初次并行结束：279 pass、4个测试文件因SIGKILL未完成（不是断言失败），原始 `major-regression.tap`。jingqi/contact、juanqin/routes、ningshou/contact串行重跑6/6通过，见 `major-retry-serial.tap`。运行期间额外改写的既有 `reports/major-pilots/linxi/whole-zone.json` 保留在工作区，不纳入本次提交；原有脏报告亦不改回、不纳入。
最后yanqu/contact串行1/1通过（`yanqu-retry-serial.tap`），四个被杀文件均已独立串行恢复通过。未重跑1331项累积current-state，未声称全套新基线。输出总量约0.2MiB，明显低于10MiB预算。
