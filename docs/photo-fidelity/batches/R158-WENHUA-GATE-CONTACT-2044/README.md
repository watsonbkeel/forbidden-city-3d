# 文华门：既有南石阶下降接触（有限候选）

基线：本地 `97420d8d9742bccea11d1a77869e9b9aab67cf96`，精确树等远端 `0d996ea0100f346539baba86fbe03475ec24d8f0`。不是文华殿南坡任务。

## 改动与边界

仅对现有文华门南侧 Xiqing 精确三角 owner 登记私有来源凭据，从实际几何抽取 41 个水平矩形和 4 条踏步通道。完整脚印、当前存活宿主/源 owner、原地表高度、速度/下降量与普通实体扫掠共同限定；既有地面 0 高程的短 toe 交接是工程约束，不新增 walkable、坡或隐形支承。北坡未授权。BPrincipal 仅增加 import 和入口分派，原运动函数后缀不变；Collision、FirstPerson 和旧认证表不改。

离散踏步需要先按原支承高度水平扫体，再在新位置向实际踏面垂直扫体；直接斜线会切进原台阶立面。两段都使用既有真实碰撞，不忽略本门 owner。跳跃、高落、侧出、缺失/重复/移动/复制 owner、宿主移动或隐藏、端点间薄障碍和动态人物均拒绝贴地。未新增可见几何，未扩大现实开放声明。

## 实际验证

- 同一个普通 `ZoneBase` + 原生控制器、三门路径 × 10/60 Hz × 行/跑：原 12/12 到达，4860 帧，脚地峰差 **0.433030309 m**；修后 12/12、4860 帧，峰 **0.042916667 m**，全部不超过 0.3 m。每帧 X/Z/时间/waypoint 与原记录精确相同。
- 12/12 接触专项通过，包含上述正/负例。端点间薄障碍测试先确认两个端点均不碰撞，再验证移动中扫掠拒绝；移除障碍后同正例恢复。
- 精确基线两源 loader 与当前正常 `buildGate` 捕获：222 个 mesh 的属性/索引/矩阵/主要材质参数、30 个完整 collider（含真实三角）、1 个既有支承、rooms/maps 的 SHA 全同。不是 GPU 材质截图验证。
- 单独导入 BPrincipal 成功，无初始化循环。
- 原始首次缺功能红、首轮斜扫导致的阳性红、宿主移动/隐藏两项真红均本地保留，没有以负例通过替代阳性。

本组是正常 ZoneBase + 原生控制器，测试 `cm.rivers=[]`，**不是完整 World、水域或全城验收**。不做 GPU/手机声明；应用构建暂待累计，不借用旧构建身份。

## 可复跑小命令

```sh
node --test tests/r158-wenhua-gate-contact/contact.test.mjs
EVIDENCE_OUT=/tmp/wenhua-gate-routes.json node --test tests/r158-wenhua-gate-contact/routes.test.mjs
node --import ./tests/r158-wenhua-gate-contact/baseline-loader.mjs tests/r158-wenhua-gate-contact/capture.mjs
node tests/r158-wenhua-gate-contact/capture.mjs
node --input-type=module -e "await import('./src/scene/palace/BPrincipalStairContact.js')"
```

基线 loader 要求本地可读精确 97420 Git 对象；未来仅净树 API 备份不能保证该本地对象存在。原日志/帧/原图仅本地保存，远端仅源码、测试、摘要和 SHA；哈希不是远端原件可用的保证。没有新试玩包、没有修改 main/branches/Pages。
