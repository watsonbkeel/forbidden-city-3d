# R160 天穹宝殿主殿最小外壳

Base `8ca949a8a1125246cdedcf857884d58284bfcc79`；仅 `TianqiongFrontHall.js` 新源。没有改原数据、共享 ZoneBase、B/Collision/FirstPerson 或旧实体。原 E61 `FC-7CE51EACB4` 只补主殿外观，不宣称整院完成/现今开放/实测。

## 图证与拟合
官方词条 https://www.dpm.org.cn/explore/building/236542.html；王子林《天穹宝殿考》2015，https://www.dpm.org.cn/Uploads/File/2020/02/20/u5e4e51460a8aa.pdf ，PDF p4/印182 图1《天穹宝殿》。作者亲看：黄瓦、红柱、三组可见中部闭扇、低灰台/前石阶；正文南向五间歇山、东临东筒子路/西邻景阳。照片裁切两端，不能称五间都看见，更不能复制惇本两梢窗；这里两端纯闭面且 `endBayAppearanceVerified:false`。论文发表于2015不等于照片摄于2015，更不等于2026现况。

无 anchor。中心 (-194.5,435)、20×11 主体、等分开间、檐高/门扇分格、色彩/背侧/两端/台阶全工程拟合；三中闭组每组4扇为简化分格，不称数过现场门扇。没有香炉、神像、仙楼、两门、配殿、院墙或室内。独立三角 owner 对应各真实 mesh，135 三角 owner +4 石体 Box，4 真顶 `rescue:false`；无隐形坡、无新接触认证。可达低前台不等可进室内。

## 先验和必要验证
全部原件 `/tmp/r160-tianqiong-1043`，仅摘要/哈希与自制CPU入Git。
- 唯一先验 scan：完整盒 X[-208,-181] Z[420,449] Y[0,12]，3477 半米网格身体/水检查，109569 候选可见三角；旧 collider/support/visible/body/water 全0。正常加载 east-six/ningshou/garden/axis-courts+global，`loadAll:false`，不是全分区/GPU。
- 7 missing-builder 实红 → 7组件绿，含自身身份/两端未验、实际 UV、完整mesh-owner、真实Box/顶、注册前置守卫、资源各一次释放。不是late-publish回滚测试。
- local 1绿：10/60走跑4往返372帧全到，最大脚地差 .202000006；闭门前/背墙两真实负控都拒绝。
- World 1绿：同新增4完整数组等local；原4街3315帧及东侧带/乾东南带4路1304帧逐字等先验，均峰0。8旧路未移动。3455旧mesh/1986collider/103walkable及rooms/maps/regions原流完全不变。
- 2 CPU图亲看真实几何，平色诊断不是HD纹理/GPU/手机实拍。2796生产三角，导出2808含12测试地面三角。
- 未跑项目全套/作者build，未装生产hook；独审后累计负责。

## 累计接入与原件保护
唯一正常接线：ZoneBase 的 `this.kit.finish()` 前调用 `buildTianqiongFrontHall(this.kit,this.kit.root.name)`；模块自身仅east-six。不得将整个compound视作完成。

作者 world.test 的 loader 为候选注入并捕获before/after；正常累计需复制脚本到新路径、新raw输出，去掉生产注入，改base并改捕获为正常安装身份，**不要在正常hook后把现有含新体流冒称旧before**。比较本manifest旧流和8原路线、新4数组即可；不能直接复跑固定raw覆盖作者原件。component独立fixture可原样测试；routes脚本固定`/tmp`输出，同样先改副本输出。

## 命令
`node --test tests/r160-tianqiong/component.test.mjs`（7红→7绿）
`node --test tests/r160-tianqiong/routes.test.mjs`（1绿）
`node --test tests/r160-tianqiong/world.test.mjs`（1绿）
`node tests/r160-tianqiong/export-cpu.mjs /tmp/r160-tianqiong-1043`
`python tests/r160-tianqiong/render-cpu.py /tmp/r160-tianqiong-1043/{front,oblique}.json.gz docs/photo-fidelity/r160-tianqiong/{front,oblique}.png`（两次，各一文件）
