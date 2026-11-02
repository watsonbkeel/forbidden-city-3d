# 文华门中央白石框误封：最小修复

基线 `458cea434b60fa5e9b3a31fa84c2d90ba1ab4c36`（411 运行源同 ebe）。用户截图 `image(20261102-022057).png` 的两道横板不是材质错觉：`WenhuaGateApproaches.js` 的 `south-terminal-panel` 同时生成可见几何和真实三角碰撞，中央被封而旧 QA 只绕两侧。

## 唯一产品变化
删除局部 z=-11.75/-9.51、x±1.25 的两道横板生成，并修正旧“绕终端板”说明。保留 6 石柱、4 纵向栏板、6 梯侧石、全部南北踏面与中央石坡、楼身、门叶和原锚柱认证；不移动任何结构，不加隐形支承、不改 Collision/FirstPerson/共享接触算法。正常既有接线已调用此模块，无新 hook。

实际接近构件 84→82；全门 4178→4154 三角。南侧原 owner 源面 696→672，北侧仍288；总计3个 approach owner 不变，**不是删除整个复合 owner**。原位置/顶点/法线/UV 原始属性字节及全部非目标碰撞/支承保全；只精确删24个横板面。构件顺序生成的北侧标签编号会前移2，不能称所有标签逐字不变。

这是用户报告驱动的游戏入口纠错，不宣称现实御路开放或官照测绘复原；其余既有尺寸仍是拟合。

## 实际证据，分账而非“全部通过”
原件仅 `/tmp/r158-wenhua-central-evidence-0222`，仓库保留摘要/SHA/自制图。
- 组件初始 RED：实际2横板≠预期0。真实正常 World 基线中央4条全堵在下横板前；原12条门路全到。
- 修后正常 World `loadAll:false`、outer-east＋全局静态、真实 FirstPerson、无 prototype 注入：新中央4条（10/60Hz×走跑，每条往返）全部到达，共1620帧且x恒=-186.3；原12条/4860帧与本次基线完整 deepEqual。2次横冲纵栏均拒绝，2份旧跳跃汇总（峰/空中计数/落地）完全同，**跳跃未记录逐帧**。
- **严格脚差0.3诊断未通过：**60Hz冲刺下坡峰0.44417641998547114m，超过0.3共9帧=0.15秒；速度连续12m/s，无停顿或穿透。峰中心在toe=-257.11外0.462m，0.5m脚掌仍覆盖坡约0.038m；峰后0.1167秒原重力落地。该差从坡内开始，不称纯坡外。10Hz走/跑峰.018/.132，60Hz走.077。父明确接受该短时跑步诊断，不扩物理。原 World 进程因严格断言 **exit1** 保留，文件名 `world-green.*` 只是当时预期，非成功声明。
- 既有局部认证12/12：跳跃、高落、侧出、缺/重/移 owner、假来源、薄障碍、移动/隐藏根、动态人物仍拒绝非法接触。
- 原属性快照的 JSON 把-0变0，首轮组件13绿/1比较红原样保留。最后父源虚拟加载重新捕获 raw attribute bytes SHA，2实际组件＋1完整原raw功能契约 **3/3**。并保留旧“必须2横板”的原断言实跑红，不改旧金样。
- 第一轮 World 用普通 CPU 库触文渊既有严格材质守卫，在路线前停止；换既有 `createActualLibrary`＋原 manifest 后才得到以上实际World。另一次轻测误在父目录启动只报找不到测试、未运行；两个原错误均保留。
- 4张同机位前后 CPU 已亲看：框消失、石坡贯通、侧栏柱保留。平色实际几何诊断，非GPU/纹理/第一人称动态验收。

## 最小复验命令
```sh
E=/tmp/r158-wenhua-central-evidence-0222
BASELINE_SNAPSHOT=$E/binary-parent-snapshot.json \
  node --test tests/r158-wenhua-central-open/component.test.mjs
CURRENT_REPORT=$E/world-green.json.gz BASELINE_REPORT=$E/world-baseline.json.gz \
  node --test tests/r158-wenhua-central-open/saved-report.test.mjs
# 唯一集成者正常累计World；明确启用已授权有限诊断边界，不删除原严格红。
ACCEPT_DOCUMENTED_RUNOFF=1 BASELINE_REPORT=$E/world-baseline.json.gz \
  EVIDENCE_OUT=/tmp/wenhua-central-integrated.json.gz \
  node --test tests/r158-wenhua-central-open/world.test.mjs
```
`ACCEPT_DOCUMENTED_RUNOFF` 仍硬锁全部到达/旧12逐帧/跳跃/护栏/无穿透；仅60Hz跑允许已观察峰≤.444177、超.3帧≤9，其余三档仍≤.3。不设置时保原严格.3断言。该最终可选模式作者没有重跑World；累计终态/整应用构建由唯一集成人关闭。未运行全历史套件，未自行上传或发布。
