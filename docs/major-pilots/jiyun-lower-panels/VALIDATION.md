# 吉云楼上廊前栏下部彩绘板排验证

基线47b51d85d866d41dbb98d112c3368052c6d6d097。官方[236483](https://www.dpm.org.cn/explore/building/236483.html)重新打开，已查看[正面照片](https://img.dpm.org.cn/Uploads/Picture/2024/06/18/s6670e8aa8f637.jpg)及局部；照片可辨下部连续实心红边矩形板、蓝绿底与浅色卷线。摄影时间未知；文件路径日期不是摄影日期。46件/尺寸继承原47棍分段，非实测图上件数；成对卷线为简化拟合，不认定画谱、工艺或雕刻。没有复制官方照片贴图。

## 实作
46板×12源mesh：实际背板、色底、4红框、4浅边、2浅色曲线。低板接两侧原直棍及原下横栏；薄图案实体与底板/色底保持正体积相接，没有悬空贴花。所有新面不高于原上层地面+.34，原上方空气、180旧垂饰和47棍不变。每板单独exact surface owner，全部新mesh的最终Float32源面逐一登记；没有整栏隐藏面/包围盒填洞。原391 collider全部保留，新46后437；原walkable3、g、门窗/屋顶/内饰/台基、导航及无新增上楼目的地契约保持。

最初反射object scale被静态测试拒绝；最终在Shape坐标中构造镜像，使所有source保持正行列式、正封闭体积和一致合并朝向。每件闭流形、无退化；各owner面数与每mesh连续source索引全覆盖，并逐面匹配实际合并render。552源geometry、最终geometry及4材质卸载平衡。

## 真失败与修复
常规全World运动5/5通过后，独立审查提出此前门禁位置在板外，不足以证明新低板的3m交接。新增前缘薄带真实复现：10Hz、x273.68、近端panel1、feet=3−ULP、向上速度6.7，首帧feet=3.53发生正侵入（threshold-edge.tap）。没有调Oracle阈值或删该场。

最终只增吉云的上行预测分派：resolveFurnitureVertical按同一gravity/delta计算本帧向上终点，furnitureScope的第六可选参数只由吉云消费，且必须已有有限的显式权威PLAYER脚高。向下阈值仍3；不降低阈值来引入外侧高速落体跨地面风险，不改SAT/扫掠算法、不加平面。新板最低源面−PLAYER.HEIGHT>3，头撞停下后仍在strict域。undefined/NaN当前脚高、无预测、下行终点、Infinity及Xishang均不会被此参数误开。

108薄边缘场：10/60Hz × 三个x前缘位置 × 中间及近两端板 × 3±ULP/3 × 上下两种速度。起点先断言真实World清楚姿态，避免拿已卡进旧柱/楼板的位置当反例；每帧完整脚到头AABB对实际新面独立正侵入Oracle，最终落原.6平台。全部通过threshold-edge-fixed.tap。原下层内侧overlay .62与物理datum .6差异仍未修；原红测在上一提交保留，不能宣称整楼全部安全。

## 验证范围
最终新专项17/17（specialized-final.tap，79.6秒），命令`node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/jiyun-lower-panels/*.test.mjs`。该次运行后补独立的handoff-invariant.test.mjs，单独执行并记录，不冒充它已在17项内。
- 实际World高落、走/跑/跳、两侧退出与24原外侧阈值场；新专项Oracle同时覆盖180旧垂饰及46新板来源面。
- 原栏顶/楼板的站坐NPC：阻挡不伪落地/重置跳跃、姿态live变更、移除后真实落稳及退出。
- 所有高度扩展域邻居清点，无未知triangleSupport/overhead；不静默过滤/box化。
- 原几何/物理/导航保持；慈荫、宝相共享builder隔离；未知/重复/错位source owner拒绝，tag卸载重载。
- 独立静态8/8；独立复核108场和最终17项日志，跨阈值阻断已闭环。

旧jiyun-rail fixture显式关闭本次新板，只隔离47b51d85历史180垂饰单元；真实buildWorld仍默认启用板层，新专项检查全部源面。因此不是通过删生产碰撞或关闭实际World来让旧测变绿。

## 成本与未验
CPU计数metrics.json：raw mesh2554→3106，merged16→20；三角44212→76596，新增32384。这是真实源三角，带来额外接触查询成本；不能把合并mesh少等同GPU性能合格。常规运动集约70.5秒，加入边缘等最终17项约79.6秒，仅是测试运行时，不是设备帧率测量。没有完整bundle构建、GPU/浏览器同视角before/after验收，仍VERIFY_PENDING、acceptedWholeObject=false。4个生产源文件SHA256记录用于验证冻结源码。

保持原14份脏报告，不纳入；本步仅小源文件/测试/日志，无资源打包、推送、部署或main修改。后续优化必须保留108场真实反例，不能以删源面/缩身体换性能。

最终补充结果：`handoff-invariant.test.mjs` **1/1**（handoff-invariant.tap），与前述17项合计18项专项；没有把补测计入原17项日志。共享串行 **143/143**（shared-regressions.tap，236.2秒）：旧jiyun-rail全部16项，r100石栏/移动、r104屋面surface/prefix/integration/xiqing-motion、r65人物、r91垂直，以及xishang/jingqi/changyin专项全部。无取消/跳过；未重跑全current-state或全major-pilots，旧失败不能因此标为修复。

node --check、限定源/测试/docs/scripts的git diff --check通过；四个生产源SHA256验证在所有最终运行中未改变。独立复审认可上行预测最小变更及补充断言；最终条件均已有实际通过日志。没有声称浏览器视觉或GPU成本通过。
