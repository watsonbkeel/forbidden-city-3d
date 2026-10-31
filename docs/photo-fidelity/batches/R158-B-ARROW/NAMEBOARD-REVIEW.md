# 独立补项：移除无证中轴“箭亭”通用竖牌

## 为什么可以改，为什么不添牌

- 本次目标仍是已选定的官方照片建筑状态，不是声称知道今天现场情况。
- 1425×1068 原南图中，中心梁枋下方与上部门面完整可见，未见模型中的中轴竖式“箭亭”牌；右侧柱上另有“武备馆”馆牌。其上传路径为 2020/04/20，摄影日期未注明。
- 2023-05-09 14:27 发布的官方视频 `02:24` 是另一张无遮挡南立面照；同一中心部位亦未见该牌。摄影日期仍未知，发布日期不能当摄影日。
- CPU 真实旧模型牌的位置为局部 `[0,6.95,-9.1]`、文字面 1.32×2.2，金边中心 `[0,6.95,-9.04]`、1.44×2.32×0.1；它是通用 `hall → plaque()` 产物，而不是独立来源重建。因此仅去除该无证牌，**不猜右柱“武备馆”馆牌的坐标/尺寸，不捏造任何替代牌**。

## 独立可回滚变更

`ArrowSouthNameboard.js` 仅精确匹配箭亭身份和上述 pre-atlas plaque record，去除 2 mesh / 14 triangles / 1 atlas queue record。不会调整门棂、双肩、屋顶、门头、通行、地图或地点名称。无新增几何、材质、贴图；成功时只处置两件移除几何，kit gold 材质留到正常生命周期末尾。

所有前置检查先做；错误身份、缺对象、变换变化、已生成 atlas 或重复调用拒绝且不改现场。mutation-phase 实际部分 detach、实际 atlas splice 之后故障的两个测试均恢复原 parent/child 顺序/atlas 原数组及 marker，失败路径没有 dispose。单独提交是持久回滚点，可只 revert 此补项而不撤销门棂。

两个修正共同作用时，局部 264→262 meshes / 6476→6462 triangles；地图“箭亭”名称、87 colliders、3 walkables、1 room 原样。CPU 图和源字节绑定在 `NAMEBOARD-CPU-PROOF.json`，私有图片在 `../r158-arrow-evidence/nameboard-cpu/`。已实际看过同镜头 south-wide 前/后；该观察仍是 CPU 诊断，未代替浏览器验收。

## 验证

新增 7 项 nameboard tests，其中两种实际中途故障恢复、资源所有权、无孤儿 atlas、同名非目标牌留存、真实 merged 前/后射线验证。与门棂和旧双肩联合 **36/36**。真实浏览器沿用已确认的 socket EPERM 阻塞，`visualAcceptance=VERIFY_PENDING`、`wholeObjectAccepted=false`。

```sh
node --test tests/r158-arrow-south-nameboard.test.mjs \
 tests/r158-arrow-south-door-lattice.test.mjs \
 tests/r59-arrow-baseline-fixture.test.mjs tests/r59-arrow-south-knees.test.mjs \
 tests/r59-arrow-knees-world-consumer.test.mjs
R158_CPU_DIFFERENCE=nameboard node scripts/photo-fidelity/batches/r158-arrow/export-local-cpu.mjs /tmp/r158-arrow-nameboard-cpu
```

## 精确生产接入

本工作树不改共享 `EnclosedPavilions.js`。主写手可在门棂 hook 后、atlas/finish 前插入：

```js
import {removeArrowUnsupportedCentralNameboard} from './ArrowSouthNameboard.js';
if(key==='arrow')removeArrowUnsupportedCentralNameboard(kit,f,item);
```

已有世界 `W` 只读验收，不另建世界：

```js
const {assertArrowCentralNameboardRemovedInWorld} = await import('./tests/lib/r158-arrow-nameboard-world-check.mjs');
assertArrowCentralNameboardRemovedInWorld(W);
```

该消费者以 9 条射线检查原中轴牌真实体积，并同时验证斜棂、深暗衬层、旧双肩与既有通行。它对仍带旧牌的真实 merged before 会失败，不依赖“已移除”元数据。

整项主要剩余：高红门头/透雕横披分区、精确门扇与菱花、稍间/北面、台阶中央栏、院前设施、屋面细节与现状室内陈设。右柱馆牌待定位，不能因为本补项通过而称箭亭整体完成。

独审后 fg/bg 退休清理异常补正见 `NAMEBOARD-RETIRED-CLEANUP.md`：两件均尝试、明确 committed=true 聚合语义，联合54/54，mutation 回滚仍保留。
