> 本文保留046d5b60作者隔离候选记录。后续实际生产集成与分片回归见 [integration checkpoint](taihe-instruments-integration-20261031/README.md)；旧文“未接生产/复审待验”仅指当时作者阶段，不覆盖后续有限范围结果。整殿/GPU仍未验收。

# R157-A37 太和殿日晷 / 嘉量石制设施：隔离候选交接

## 结论 / 门禁

基线 `3e9d5c9216ae4fbbc5056b5820bf0acff36cfccc`；本提交只新增专用模块、测试与研究记录，**不改 PalaceBuilder、Collision、FirstPerson、TriangleSupport，不集成、不发布**。两物总计 29 个闭合实体、500 三角面、29 个逐实体三角碰撞 owner；独立合批 2 材质桶；0 新 walkable / 救援支承。原设施共 164 面、2 整盒，故为 +336 面、+27 个精细 owner，重用现有 marble / bronze。

状态为源图约束的低细节候选，不是测绘复原、整殿完成或浏览器验收。父任务安排独立 Astra 审查后才可接入。整殿审计另见工作区 `audit-r157-taihe-20261031/AUDIT.md`：已经存在的龙椅、金龙柱、藻井龙/球、外匾、后墙、三台、80 兽 / 8 骑者均不能再报未做。

## 自身来源、明确拟合与未知

- [故宫太和殿对象页](https://www.dpm.org.cn/explore/building/236465.html)；对象 `FC-A478209231`。
- [本体日晷1609](https://img.dpm.org.cn/Uploads/Picture/dc/1609%5B1024%5D.jpg)：倾斜圆盘/针、上托、横台、双柱通空、分层台座。图中每柱正面宽与中间净隙接近 1:1，初版 .25/.63 细柱/宽隙已通过红测否决；改为柱 .34 / 隙 .32m。当前 .32m 窄隙**不是供 1m 宽玩家通行的门洞**，但小探针确能穿过可见空隙。
- [本体嘉量2536](https://img.dpm.org.cn/Uploads/Picture/dc/2536.jpg)：厚石框开窗、石制亭罩、多级束腰座。初版几乎完全通空的四柱亭已通过红测否决；现在四侧 .61×.60m 窗孔，占墙场宽高约半，粗厚上下石带，低细节短脊四坡石罩。
- 保留原中心 x=-17/+17、z=zf+1，底 y；拟合进 1.6×1.6×3m 既有碰撞包络，避免扩大邻路占用。**此包络是工程约束，不是照片测量。** 原日晷盘的视觉包络比其旧碰撞盒宽，本候选不是保留原盘大小。
- 所有精确尺寸、日晷原方位/角度、刻度文字、石雕、复杂瓦饰/檐曲、摄影日期与现状年代未知。背面使用朴素兼容延续，未经历史照片确认。metadata 明示 `PHOTO_RELATIONSHIP_FIT_NOT_SURVEY` / `accepted:false`。
- **没有制造照片看不见的嘉量铜量器**；石框内部真实为空。不增未知护栏、家具、雕纹。照片只本地研究，不进入生产材质或上传素材。
- 本地误标 `taihe-wide.jpg` 已识别为太和门，未作本殿依据。龟鹤、铜鼎6→18的定位和其他殿外细节不在此候选范围。

## 最小生产 hook 建议（本提交未执行）

在 `src/scene/PalaceBuilder.js` 导入：

```js
import {buildTaiheTerraceInstruments} from './palace/special/TaiheTerraceInstruments.js';
```

在 `terraceOrnaments(g,r,y)` 保留已有铜鼎/龟鹤循环及其碰撞。仅把末尾 `// 日晷：东侧...` 到 `for (const x of [-17, 17]) this.col(...)` **整段替换**为：

```js
buildTaiheTerraceInstruments(this, g, {y, zf});
```

即删除旧日晷盘、2 个旧石墩、嘉量铜方盒共 **4 meshes**，以及最后 **2 个旧1.6×3m整盒**。不能叠加新模型再保留旧实体/整盒：那会堵住可见空洞。新的 Box3 仅作 broadphase，每个都有对应可见封闭实体的 `triangleSupport`；不添加 invisible full-volume solid。

测试 helper 暂时替换 prototype 方法后 `finally` 还原，实际调用原整个世界构建；不是生产 hook。集成后应将 helper 改为直接调用集成世界，或保留一份基线 fixture 比较，避免再次运行“删除旧4 meshes”的测试注入。不能把注入器放入应用。

## 新证据 / 可复跑命令

在隔离 worktree，Node24 + 仓库已有依赖：

```sh
node --import ./tests/r141-fix/json-hooks.mjs --test \
  tests/photo-fidelity/batches/taihe-terrace-instruments.test.mjs
node --import ./tests/r141-fix/json-hooks.mjs --test --test-reporter=tap \
  tests/photo-fidelity/batches/taihe-instruments-world.test.mjs
```

- 几何来源专项 **9/9**：源图比例红→绿、单体闭合流形/正体积/无退化面、空隙小探针与实体负控、正常身体不能挤进窄孔、原坐标/offset、重复调用拒绝、合批射线一致和每资源仅释放一次。
- 最终串行世界 **4/4，exit0**：精确删除4 meshes/2旧盒；其他 ornament 几何、所有非目标 collider 对象/次序/范围、walkables 不变。
- 真实 FirstPerson **16 条**外圈路线（2物×10/60Hz×走/跑×双方向）；**4 次**真正 airborne 高坠、落在三角证据/最终合批可见面并离开；正常1m宽身体4种逼近窄孔负控，逐帧身体包围盒不得穿石。
- 初次高坠试验误把 `setPosition` 当空气初态而失败；修正 fixture 为显式 airborne/velocity 后重跑，不改 controller 或加救援面。最后一次并行世界进程加载阶段非断言终止；未计通过，释放竞争负载后单文件串行最终4/4。
- 独立 Vite library bundle **exit0**（3 modules，7.50kB，gzip3.24kB，Three外置）证明候选自身可编译；**不是完整应用/三基址构建验收**。完整应用三基址、全量回归由最终集成统一执行。
- 自己启动的 `current-state` 全量在父任务要求后主动停止（exit130），不完整日志保留，历史失败没有改 golden；不能称全量通过。其临时生成的两份历史 report diff 已保存证据后恢复，未纳入提交。

证据目录：工作区 `audit-r157-taihe-20261031/`：

- `source-window-ratio-red.log`, `source-sundial-ratio-red.log`：两个照片比例负例。
- `unit-final.tap`, `world-final-serial.tap`, `world-final-serial.exit`：冻结候选的最终专项。
- `instruments-final-ratios.log`：不完整并行世界失败，保留。
- `isolated-current-state.log`：主动终止的全量，保留不计通过。
- `candidate-metrics.json`, `module-build.log`, `input-sha256.txt`。
- `cpu-final/`：2物×正/斜/后×before/candidate 共12张，全部候选6角亲看；来自实际源几何、固定同相机 CPU z-buffer，不是照片拼贴、浏览器GPU截图、材质光照/阴影或手机性能验收。背面只是诊断视角，不能充当历史背面证据。
- `cpu/`, `cpu-window/` 是前两轮被修正候选，留作取舍记录，**最终只能使用 cpu-final**。

导出实际几何：

```sh
node scripts/photo-fidelity/batches/r157-a37/taihe-instruments-export.mjs /private/evidence/path
```

研究私图和 CPU 文件不随该代码提交加入生产。全对象照片逐角、完整启动三基址、移动端性能、真实场景最终材质视觉、独立 Astra 审核仍为后继门禁。
