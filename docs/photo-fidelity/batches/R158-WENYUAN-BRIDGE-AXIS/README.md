# 文渊阁：桥正对门，不再正对柱

基线：本地 `c376ef094e0377ecee183a31252d3eadb95c54a2`（远端 aac4，tree `c68e58c4a9ffbbb311bac20168d994e00e8ea1b7`）。用户截图 `image(20261102-000351).png` 指出桥过来还须横拐才能入门；旧绕柱四路通过不解决这个问题。

## 修复与依据

- [故宫官方正面图](https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b6eae1fbb.jpg) 可辨桥、台阶、明间同轴；[官方文字](https://www.dpm.org.cn/explore/building/236513.html) 证六间、前廊与池上一桥。不把等分柱网或具体坐标说成实物测绘。
- 现等分六间模型的屋体原点 `x=-186.5` 是真柱，现门/台阶在 `x=-189.875`。为保完整柱网、前廊、屋体、内层和楼梯，将**完整石桥及岸口**平移 `-3.375m` 对准现门。这是用户批准的游戏适配，不是官照尺寸复原或现实开放许可。
- 桥原 3.4m 宽、13.2m 长、32段真实拱面、34个栏实体 owner、6360栏三角和232栏 mesh 全保；水面多边形不动。水过桥判定、真实桥面/栏、原专用栏顶向内恢复守卫同轴同步。
- 南岸还有文华北墙 `z=-156` 的原8m开口。本次把该唯一开口同移；两端仍是可见实体墙，原宽8m/高7m不变。左墙端 `-190.5→-193.875`，右墙端 `-182.5→-185.875`。漏移此口会让新桥靠到真墙，已通过真实失败定位后修正。
- 自动接近路径也同轴，删除横拐点。未移动/删除任何文渊柱、门、栏、短阶、室内家具、六面西梯证书；未改 Collision、FirstPerson、ZoneBase 或共享接触算法。**不需要新 hook**，5个 source/data 文件自然进入现有路径。

## 已验与明确未过

- 组件 **15/15**：桥/门/墙口同轴，旧桥位水面不可暗渡；两墙端可见/实体负控；保留11项栏几何、UV/资源、真实圆顶边界与精确 owner 认证检查。原绝对桥坐标仅在该保留测试副本改为当前桥相对坐标。
- 正常 `ZoneBase`、`loadAll:false`、outer-east 加全局场景的真实控制器：**8/8 同轴往返，1678帧**（10/60Hz ×走/跑×前进/倒退），整个身体中心 x 固定在新桥轴；**4/4 原南岸接近往返，998帧**。无 prototype 注入。原南岸慢行卡墙路线没有改点，由真实墙口同步移后变绿。
- 柱、闭廊栏、闭窗仍阻挡。非目标区域 collider、其它桥参数、水面多边形 SHA 与原始世界全同。外东路全 collider 在**仅反向还原两处已批准墙段端点**后，完整 SHA 与父同；实际未还原 SHA 也单独记录，不谎称两墙没改。
- **严格脚差≤0.3m未通过**：60Hz快跑/倒退跑下行原0.6m短踏面后，自然下落峰值 **0.3912739559m**，但完整往返到达。旧短阶未改。父明确接受此项披露，不为不阻路误差扩到池边台阶或共享物理。原严格红日志与最终 `strictFeet03.pass:false` 保留，功能终态绿色不表示此严格门槛通过。
- 原柱轴8路全失败的 RED、南岸开口不齐 RED 和一次 ramp 注册后不保留 structureId 的 QA错误、一次脚本路径错误重复原运行、一次墙 fixture 未给非目标文华门宽的 QA错误均保留，不能算通过。
- 4张自制 CPU 图亲看：`before/after-wide` 固定同机位，`bridge` 各站在当时的真实桥轴同高度/纵深；后者有意随桥侧移，不宣称同一个世界机位。平色几何图，不是浏览器/GPU或纹理验收。最初挡在前殿屋檐/南岸墙内的诊断机位原图保留但不作终态图。
- 未做全应用 build、全分区或全仓测试；唯一集成人负责累计构建。无需改原屋体或再注入候选。

## 最小复跑

```sh
node --test --test-concurrency=1 tests/r158-wenyuan-bridge-axis/{alignment,retained-rails}.test.mjs
BASELINE_REPORT=/tmp/r158-wenyuan-axis-evidence-0006/world-red.json.gz \
EVIDENCE_OUT=/tmp/wenyuan-axis-integrated.json.gz \
node --test tests/r158-wenyuan-bridge-axis/world.test.mjs
```

原始证据仅本地 `/tmp/r158-wenyuan-axis-evidence-0006`，PINS包含终态/失败文件的bytes/SHA及旧依赖。官网原图本地复用 `r158-wenyuan-veranda-evidence-1530/exterior.jpg`；用户截图不纳仓库。最终日志 `component-release.tap`、`world-final.tap`、`world-final.json.gz`、`cpu-release.log`。除这一次桥口对齐，未顺带修饰建筑。
