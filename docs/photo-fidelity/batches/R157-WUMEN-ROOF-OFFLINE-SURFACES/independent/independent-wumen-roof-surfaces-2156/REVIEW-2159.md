# 午门屋面 Task2 离线实际面独审

## 有限结论

**最终 2158 冻结可作为 Task2 的离线 tile/soffit/fascia 实体小阶段通过。** 独立最终 **7/7、exit 0、0 skip/cancel**。原 6 项确有完整面/实际绘制范围的 P1 检测盲区，已通过真实错误实现红→补断言→红的证据闭合；当前实现本身独立复算未发现漏面。

这不是完整屋顶、真实建筑承托或生产批准；**不批准 trim、实际亭翼安装、碰撞/支承、台面 FP、World、GPU 或发布**。本轮未运行这些任务。

## 输入及复验身份

- 工作树 `r157-wumen-joint-layout-1622`，HEAD `b9863902bd7370b84d1b3ec2582976c0d119c896`。
- 外置 `upper-reassembly-2034/roof-task2-2149/freeze-2158.json`，8 路径逐 SHA 相符。
- surface builder：`72dc4e1ad383a69b13fb63b3f8ff2a09ad0e0309c354fb2d242247128109b19d`。
- 最终 test：`9328d13228517b0c69de7851ce73687cca1cfe2586cd77f886a0095d9b504884`。
- evaluator 保持已审 `6e9e135d2bfd848885ec4ff05a29f46c6bb071927fa3d80ff2902f934d98b17a`；未改其数值合同、recipe 或源注册。
- 再次逐文件核 src/data：600 路径的完整集合及字节等 HEAD，未发生生产变动。
- 独立原 6 项通过（402.200445 ms）；最终 `current-7-2158.tap` 为 7/7（565.432815 ms）。这是先后两个版本的重叠测试，不合计为 13 个独立合同。
- `final-freeze-audit-2159.json` 保存输入及所有独立 TAP/exit/SHA；作者缺模块首红、cleanup 实红、去 tw 行实红另保原件。

## P1 实证与关闭

原 verifier 只检查剩下的顶点合法、三角正面积、normal/UV 和 tw 边，未独立锁定全部应有格网或实际 drawRange。我在不写源的 SHA 锁定 loader 中分别制造：

1. 每个 tile 删除一个非 tw 的内部三角，保留下来的顶点仍有使用；
2. 每个 mesh 的 drawRange 少画末尾一个三角。

二者在原六项均 **6/6 全绿**。这足以否定“原测试已证明完整面”，但不等于原 builder 实际有洞。

作者仅新增第 7 项：不读 `g.userData.section`，从固定 recipe 的 nT/nU、tw、原 rs 独立重建所有 cell 的两三角；按实际 Float32 点构造三角多重集，并核完整 index 多重性、只允许的 t0 删除账、drawRange `{start:0,count:Infinity}`、groups 空及单材质路径。

独立最终复跑：两原 mutant **各 6/7**，均第 7 项真实数学断言失败，无加载错误。因此该 P1 在本阶段已关闭；原六项假绿日志保留，未覆盖或重命名成通过。

## 实际几何核验

另有我方 `independent-grid-audit.mjs/json`：不消费生成器的参数 metadata 或 audit 作为期望；独立建立 ts/ss 格网、cell 三角、Float32 点及 t0 删除账，逐 mesh 比较实际 index 指向的三角多重集，并核完整 drawRange/groups。依赖的是已审且本轮未变的 Task1 evaluator，不是照片测绘金样。

结果两模式各自如下：

| 类型 | 实例层数 | 每层非零实际三角 | 每层 t0 删除 |
|---|---:|---:|---:|
| 亭 lower | 4 | 640 | 0 |
| 亭 upper | 4 | 760 | 40 |
| 翼 single | 2 | 780 | 20 |
| 合计 | 10 | **7160** | **200** |

每层 4 面 × tile/soffit/fascia = 12 mesh。200 是明确 analytic t0 apex/ridge 重合点导致的结构退化三角，不是随意丢小面；独立账逐条等实际账。余下三角实际 Float32 面积正，所有已保留顶点有 index 使用，没有遗留零 normal 顶点。

- 实际 pos/normal/UV 均有限；法线长度及每三角对应面方向/顶点法线正向关系有全层检查。实际 winding 采用 tile 朝上、soffit 朝下、fascia 朝外。
- tw 不只是 metadata/公式：每面 tile 与 soffit 的所有横向采样点都在实际 position 中，并由实际 index 连成各相邻边；删除 tw 行的作者 SHA 锁负控确实失败于 actual bearing vertex（只选 1 项，不能写成六项全红）。
- tile 在参考 fanY 上方 thickness，soffit 落参考 fanY，按实际 Float32 表示检查。**没有生成 fan、beam 或可承重实体，bearing 仅命名参考平面，不是建筑受力/脚底支承认证。**
- UV 与已审 section 的 unit/non-unit tileSize 逐实际属性核对；fascia `.03` 顶边和 `−1.5×thickness` 底边明确。仍是约定 UV，不是 TextureLibrary 实图像素或 GPU 采样验收。
- 单次 Float32 存储相对当前 double authored position 的独立最大分量误差约 `1.8516018514e−6 m`；不是“实际零误差”。

## Y 与坐标范围不得扩张

`audit.maxDoubleLiftYDeltaFromOldParameterSection` 是相同参数处的 **double lift Y 差**。作者完整账最大约 `0.09614386937 m`；基础 Y 锚点保持不等于全部顶点 Y 保持。这一字段不冒称实际 Float32 差、world 逐点差或旧原 mesh 的完整差分。

- 亭 section 的 Y 已在 component 口径，parentY=0。
- 翼先 localY 生成/存 Float32，再 parentY=12.3、Ry=π/2。
- group XZ 来自未安装 reference；predecessor/proposal 两种参数模式使用同一套该 reference frame。**predecessor 在此不是旧楼原位的完整重建，也不是旧 mesh 字节保留。**
- 属性基线/旧源虽未变，本阶段尚未交付整个新旧上层 mesh、材料、矩阵、围护/柱脚与物理的完整有限 delta。

## 生命周期及故障

builder 只拥有新 geometry，借用三类材料而不 dispose。正常与重复 dispose、分配中断、dispose listener 抛异常后继续尝试其余 geometry 都有实际测试；后者原 4/5 红保留，现聚合异常且不阻断后续退休尝试。不能把“已尝试全部 dispose listener”夸大为 GPU 已释放验收。

作者首 RED 是缺模块 file failure，不是六个已执行断言同时红。此次独立首静读误写 `roof-surfaces.mjs` 文件名导致只读命令 exit 2，随即按 freeze 的真实 `roof-section-surfaces.mjs` 读取；不是产品失败或测试结果。

## 后续边界

本产物明确为部分 tile/soffit/fascia，有声明开放边界，不是 watertight 整屋顶；无 ridge/hip 管、围脊 prism、finial 等 trim，亦无 fan、梁、collider、walkable。进入 trim 或下一 delta 阶段需单独任务许可、冻结和验收，不能将 7/7 自动传播为其通过。实际亭翼重配、未知接口/门口、真实台面路线、完整历史缺失及既有全套红均不由这次关闭。
