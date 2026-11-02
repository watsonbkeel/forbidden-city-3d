# 本仁殿、集义殿入口实体中间踏步（有限候选）

基线：0e02ef91（远端 0c22cee4）。本批只新增专属模块，正常 ZoneBase 尾接尚待累计；不改原殿门窗、平台、控制器、接触算法或数据。

## 图据与工程边界
故宫文华殿本体庭院照：https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b70481d5f.jpg （对象页 https://www.dpm.org.cn/explore/building/236531.html）。照片支持两配殿石质入口类别，不证明本候选尺寸、台阶数量或现状开放状态。每门新增宽 3.6 m、深 2.2 m、高 0.25 m 实体石踏，衔接原 0.5 m 平台；全部尺寸是交互工程拟合，非测绘。原中央游戏通路不改。

## 实际必要验证
- 3/3 专项：原 mesh 属性/材质/姿态、碰撞与支承引用保留；新增 2 个真实 Box 实体及 2 个同范围顶面；失效/重复/冻结守卫。
- 普通 World 加一次作者 before-finish 接入，loadAll:false，outer-east 与当时全局实体。远起点 8 往返（两门×10/60 Hz×走跑），780 帧，基线峰 0.497277778 m → 候选 0.247277778 m；全部 XZ/time 和输入路线精确相同。最终实体真实包络对原碰撞零相交。该结果不是已安装生产 hook 或全分区通关。
- 最初 0.8 m 深实体方案虽然到达 8/8，峰仍 0.402 m，硬门失败；原件保留。首预扫描误按 pad .8 的拟合包络，不能冒充最终包络；最终以实际几何 Box 的旧实体扫描为准（原 hall 默认 pad 1.0）。基线退出 0 是观察，不是假称红测。
- 4 张同镜位真实几何 CPU：15196→15220 三角；旧 90 collider/2 support SHA 相同，新增后 92/4。平色图不是纹理、GPU、手机或全城验收。尚未累计应用构建。

## 命令与发布
`node --test tests/r158-wenhua-companion-steps/component.test.mjs`

`BASELINE_ONLY=1 EVIDENCE_OUT=/tmp/baseline.json.gz node --test tests/r158-wenhua-companion-steps/world.test.mjs`

`EVIDENCE_OUT=/tmp/candidate.json.gz node --test tests/r158-wenhua-companion-steps/world.test.mjs`

累计时在 ZoneBase 的 kit.finish 之前调用 finishWenhuaCompanionSteps(this.kit,this.zoneJson) 恰一次；正常验证须去除作者 prototype 注入，不能双调用。仅上传源码、测试、本简述、哈希和自制 PNG。原始帧/日志/几何及官方图只本地保全，远端哈希不代表可下载原件。旧试玩包不含本批。
