# 文渊真实入口单踏步——工程适配

基线 `be5393cb62b24d726896403a4a27ad37ca92a3f9`。现有通用 hall 对 .5m 台明不建阶，原退出台沿脚地峰 .501007m；不是本批前廊回退。自身故宫南面照片确有入口石阶，但不据此认证游戏偏置开放湾、尺寸或现实入内许可。

先试算2–3m坡的占用，发现偏置入口z≤−144为池水/岸栏，已放弃，不硬塞、不放水界。最终仅在原干岸添加 **1块宽4m、深.6m、高.25m实心石踏**，中心(-189.875,-142.7)，上下两级接原.5m台。可见Box与真实collider完全一致，支持采用同一实际顶面；未新增隐形坡/吸地、未改Collision/FirstPerson/任何共享接触规则。台基、旧栏、门柱、原上楼梯及非目标图元/碰撞/支承逐项保留。

验证：缺踏步断言真实RED后，3组件通过；正常完整World原4条10/60Hz走跑往返全部到达，仍955帧，脚地峰 **.501007→.251007m**，不追≤.3微差。实际注册占用只命中新踏自身，旧中柱/薄栏负例及旧厚代理净空保持，池水两点仍拒绝。未调整路线/速度/步长/阈值。另最初只读占用脚本末尾误用collider.intersectsBox造成TypeError（CM项实际为.box），非产品红，最终World用真实.box完成占用断言。

4自制同镜位CPU图显示原台沿与新踏步，**平色、非纹理/GPU**；官图不上传。原3组件及World/CPU日志与数据仅本地保全，摘要和SHA见VERIFICATION.json；远端不能凭SHA重验原始帧。整应用构建留待与其他获审候选合批，未冒称本候选已clean构建、全城或手机验收。

```sh
node --test tests/r158-wenyuan-step/component.test.mjs
EVIDENCE_OUT=/tmp/wenyuan-step.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-wenyuan-step/world.test.mjs
node scripts/r158-wenyuan-step/cpu.mjs /tmp/wenyuan-step-cpu
```

用户branches/main不动；原be5393可回滚。本候选仅专属新模块及ZoneBase紧邻文渊前廊的一处调用。
