# 午门离线屋面＋trim 组合、边界诊断与 CPU 独审

## 有限结论

**最终 2232 冻结可接受为离线组合/导出/诊断证据。** 独立最终 7/7、0 skip/cancel、exit 0；原“交叉函数恒 false 仍 5/5”P1 检测洞已关闭。六幅 CPU 已亲看，原始完整导出、配对相机和最后源绑定经复核。

**这不是密封、支承、亭翼接口或实际建筑验收。** 40 条 hip 的末环确在各自瓦面之外：proposal 末环中心距约 0.372–0.548 m；每一纵向 strip 存在某处相交，不能推出整段或端部连续贴合。图中亭翼看似接续/重叠，也未被本次同层 hip↔tile 检测证明为合格建筑接缝。

## 冻结与执行身份

- 工作树 `r157-wumen-joint-layout-1622`，HEAD `db00683a0ca825062faa6ed92f62c981e3a38dc9`。
- `roof-combined-2224/freeze-final-2232.json` 的 13 路径逐 SHA 相符。
- combined helper：`c29070f03aa8fab1dafbd77d4ac82592cbe69c14c8891d5ef061ecd5868485c1`。
- combined test：`fb2fa23fd2d4b273c634b205ecec89a1a49e4143d75615d5f1e4ef5beaff2aa1`。
- CPU exporter：`5ef0de4b30bcb11c61f0a88c62352695e484d430ad2ff4d9a42a79af67282bdf`；renderer：`1fcad67c979f31a4e7af4e721c4846b28d10e750846ddd751e14032321438df3`。
- 600 源完整集合/字节等原冻结；QA 4423，旧 4418 全部未变，仅新增 5 个离线脚本/测试。
- 我方原 5/5 与最终 7/7 分别复跑；恒 false 错实现从原 **5/5 假绿**变为最终 **5/7 数学红**（已知交叉和实际稳定交叉两项）。没有通过加载失败冒充负控。
- 仅只读复算作者 8 文件 **65/65、exit 0**，完整 status/title Counter 为原 58 保留、+7/−0。不是我方独跑 65，不与独立 7 重复相加。
- 未运行 World、FP、构建或重渲染；独立工作仅轻测、现存导出读取、图片检查与末环几何复算。

机器记录位于本报告同目录：`final-freeze-output-audit-2234.json`、`cpu-2228-output-audit.json`、`selected65-counter-audit.json`、原 TAP/exit、`pairs-final-2233/`、`end-ring-audit.mjs/json`。

## 完整组合与资源

两模式均为十层的已审 surface 和 trim 直接组合，保持各自未安装 parent frame，诊断根为 identity；**172 mesh / 10288 实际三角 = 120+52 / 7160+3128**。独立对照直接调用组件工厂并单独枚举实际 v/n/color/side，逐完整行哈希核对；不是只比三角总数，也不是照片金样。

collector 覆盖 single-material primitive 的所有实际 groups，遵守 drawRange、mesh/祖先 visibility、有效 material visibility；不以裁切或遮挡删减 CPU 输入列表。删面、隐藏一组、移动 parent、反转面会改变完整导出 fingerprint。组件本身的数学/完整网格/native primitive/pose 冻结合同仍各自保留。

组合器自建五色 diagnostic palette；组件只借用这些材料。组合器只退休自身 palette 和所持子产物，正常重复 dispose 为一次；第二工厂在 hip/0 add 处真实失败时，第一组 12 个 surface geometry、失败 trim 的 1 个 geometry 及 5 个 palette material 均被退休。没有新增外部借用材质的销毁权，也不代表 GPU 生命周期实测。

## P1：交叉统计的检测洞及有限修订

原测试只检查 rings/strips 个数、distance 有限、移位能改变距离；我方将实际 `intersects` 函数恒置 false 后，原两个文件仍 **5/5**。因此原绿不能独立背书相交计数。

最终只增加窄诊断 primitive export 与 QA，没有改几何或原交叉 kernel：

1. 已知横穿、明确分离、共面歧义，使用独立 segment-plane/barycentric 算法对照；共面返回 false **不等于已证明分离**。
2. 对实际 AABB 候选对，独立算法的稳定内部交叉/明确分离与 kernel 硬比；近边界、近零分母和非有限状态单列未决。
3. 按所有实际三角逐对重新汇总原 kernel 结果，验证 strip 的计数归属。这一步是**独立聚合记账**，不伪称第二套独立交叉算法。

第一次要求两浮点算法全部计数精确相等时出现真实 5/6 红（末 strip 的 5 vs 6），原日志保留；没有移动几何或放宽接触阈值来消红。

最终分类只在测试/诊断里使用：`1e−10` 是无量纲 segment t / barycentric 边界带；分母按 `64×EPS` 与自身尺度判数值退化。它不是世界米制缝隙容差，也不把未决变成支持/密封通过。全部歧义或原始 bool 分歧对保留 mode、layer、face、tube/tile ordinal、参数及双方原始结果。

我方最终逐对输出与作者 JSON 相同：

| 模式 | 稳定内部交叉对 | 稳定分离对 | 未决对 | 原 kernel 交叉对 | 两算法原始 bool 分歧 |
|---|---:|---:|---:|---:|---:|
| predecessor | 2548 | 25612 | 32 | 2580 | 0 |
| proposal | 2228 | 25576 | 32 | 2260 | 4 |

每模式 40 hip × 8 strips = 320；当前每 strip 至少一个 Tube 三角与 tile 存在 kernel 交点。**不能把 320/320 写成 320 段整体接触通过。** 32 个未决对继续未决，尤其 proposal 的 4 个原始 bool 分歧未被抹平。

## 末环真实几何：外伸，不是“已密封”

我方从实际 Float32 geometry 经实际 matrixWorld，按每环四个拓扑角点 j=0..3 取中心；排除 Tube 闭合重复 j=4，未用坐标 Set 猜去重。独立计算最后环到本层四 tile 面的最近距离。

Proposal 汇总（m）：

| 层 | 末环数 | 中心到同层 tile 距离 | 四角点最近距离最小值 | 四点包络球给出的分离下界约 |
|---|---:|---:|---:|---:|
| lower | 16 | 0.38169468 | 0.38090182 | 0.27909453 |
| upper | 16 | 0.37202104–0.37202152 | 0.37125828 | 0.27202053 |
| wing | 8 | 0.54835897–0.54836006 | 0.54723543 | 0.40095914 |

最后一列用实际四点到中心的最大半径 R，按 `distance(center,tile)−R` 给出环包络的几何下界；不是碰撞代理或路径净空合同。旧参数模式同样有近似外伸，故不能据此称新方案独有回归。

这些数据说明末端开放装饰环未贴到 tile；不与其前方 strip 的某些三角相交矛盾。现设计保留既有装饰 tip 外伸及 open Tube ends、侧面围脊的开放顶底，**不准通过补隐形面、接触容差或未知接口来掩盖**。是否为后继建筑需要调整的真实构造问题，仍需独立来源和组合审查。

exact-coordinate boundary multiplicity 只记录当前表示；没有 epsilon 焊接，也没有证明 watertight。跨实例亭↔翼、不同屋层、围脊/宝顶对瓦面等完整联合关系，不能从同层 hip↔tile 数据外推。

## CPU A/B 原件与视觉复核

- 原 `cpu-2228/` 六次渲染均 exit 0；Python 计时的实际 export exit 0。此前 `/usr/bin/time` 缺失 exit 127 是 Node 未启动，保留但不当导出失败/通过。
- 六 gzip 每份均含完整 **10288** 个 v/n/color/side 三角；同模式三视角三角列表一致。三对 camera JSON 精确相等。
- 初始 CPU 绑定初始 helper；最终 helper 仅增加诊断 export 后，`cpu-final-2231/PROOF.json` 单独绑定新源。六 gzip 与两个 boundary JSON 共八文件与旧轮逐字相同；六 PNG＋六 summary 明确复用，逐字核过，summary 的旧路径也保留。旧 PROOF 未回写。
- 最终 PROOF SHA256：`fc17c8178d6619dbf34f73449e4e05605bda5d24ca33c63b34d1551cd7900580`；其中全部 11 源摘要与当前文件吻合。

已亲看六图：overview 两模式均可见四亭两翼六组，但前驱参数图在参考位置下较疏，并不是旧建筑原位照片；proposal 亭、翼放大后在图上接近或交叠。NE 近图与 east-wing 近图都有邻组裁切，不能据每幅图称全体建筑可见。全部输入面存在与全部面同时在图上可见是两回事。

画面明确为固定诊断配色和 CPU 透视深度缓冲；没有主楼、柱墙、梁枋、台基、真实纹理、alpha 采样、GPU 或真实阴影。页脚说明正确，没有旧 lower/night-seat 标签。native trim/surface 的小接缝、交叉与真实建筑材料形制不可仅靠这些图验收。

## 剩余边界

本轮的“组合通过”仅指已审离线组件正确组合、完整导出与诚实诊断。约 0.427464 m 同 Tube 索引 Y 差仍按此前已审弧长重参数/Frenet 分账，不是屋顶增高，也没有升级为图证尺寸。

真实亭翼/横连重配、八个未知接口、主楼及实际柱脚/围护、台面接入与 FP、World/full/batch/build、继承缺史与旧红、GPU/发布全部保留。不得将当前 false 授权字段、数值未决或开放边界因 7/7、65/65、六图存在而升级。
