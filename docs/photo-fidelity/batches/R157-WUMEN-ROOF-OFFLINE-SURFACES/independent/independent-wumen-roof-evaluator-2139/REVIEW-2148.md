# 午门离线屋面 Task1 纯数值独审（最终 2145 冻结）

## 结论

**有限通过：只认可纯数值 evaluator 及其当前回归合同。没有发现本轮仍阻断这一阶段的 P0/P1。** 原 6 项、后继 9 项曾实际漏检错误公式；最终独立 11/11 通过，六个既定错误实现均由真实数学断言拒绝。该结论不批准真实屋面实体、默认 RoofBuilder 修改、建筑安装或生产发布。

本轮仅运行纯数值 Node 小测；没有 Three 实体、World、FP、CPU 渲染、构建或网络操作。源码 600 路径的集合及逐字内容独立核对等于 HEAD；前阶段 6 个合同/基线输入逐 SHA 保持。

## 身份及独立执行

- 工作树：`r157-wumen-joint-layout-1622`，HEAD `b9863902bd7370b84d1b3ec2582976c0d119c896`。
- 最终输入：外置 `upper-reassembly-2034/roof-task1-2137/freeze-2145.json` 的 4 路径，全部重算匹配。
- evaluator SHA256：`6e9e135d2bfd848885ec4ff05a29f46c6bb071927fa3d80ff2902f934d98b17a`。
- test SHA256：`a1f6f3c21158423805172f398014ac33a6e03a84f1889aa0fecb89bdfbffe646`。
- 计划 2137 SHA256：`86efcdb6eb942a691e17534bd8e822d8dd6dc4031e4655a1f64b2c3ae3b98b8c`；原 2130/2136 不覆盖。
- 独立当前执行：`current-11-2147.tap`，**11/11，0 skip/cancel，exit 0**，135.985026 ms。
- 原始输出及每轮 exit 保存在本报告同目录。`final-freeze-audit-2147.json` 绑定最终输入、计划、600 源集合/内容和本轮 7 份 TAP 摘要/哈希。

## 实际发现及修订闭合

### P1：测试期望曾与被测实现同源，错误数值能全绿——最终闭合

初始 6 项虽然通过，但部分 point/UV 的 expected 由同一个 evaluator 的 `ring/baseY` 推出。我用 SHA 锁定的私有 loader 分别改变：

1. 非锚点剖面系数为 0（仍保留已存锚点）；
2. proposal 的外檐 knot 偷换回旧外檐。

两者在原 6 项均 **6/6 全绿**，不能把原绿称为独立数值证明。独立直接公式检查同时表明原实现的所查 20 组端点及非锚点数值正确；这是已实证的回归检测缺口，不是伪报当前公式本身已错。

2143 新增 canonical recipe 独立 Y/ring oracle，并让 UV 期望使用独立 ring/Y。其 9 项能拒上述两变异，但我继续在已经声明的合同内检查 lift 与 soffit：`O=0`、`D×2`、进度指数 `1.6→2`、soffit 中间 t 偏移四变异均仍 **9/9 全绿**。这些原输出均保留。

2145 仅加强测试，helper 不再变化：新增完整 lift XYZ 独立 oracle，以及原 rs 公式导出的精确 soffit 参数序列。独立最终结果如下，都是 assertion 数学红，不是导入/loader 错误：

| 变异 | 最终通过/总数 | 实际失败合同 |
|---|---:|---|
| 非锚点 profile 系数归零 | 8/11 | UV、独立 ring/Y、独立 lift XYZ |
| proposal 外檐回退旧 knot | 9/11 | UV、独立 ring/Y |
| 水平 lift O 归零 | 10/11 | 独立 lift XYZ |
| 影响距离 D 加倍 | 10/11 | 独立 lift XYZ |
| lift 进度指数改为 2 | 10/11 | 独立 lift XYZ |
| soffit 中间 t 偏移 | 10/11 | 精确 soffit lattice |

loader 仅在当前 helper SHA 精确匹配时进行单项修改；不写源文件。早期 Node 24 重复 loader 调用导致的 SHA/加载错误日志另存，**不计作有效负控**；随后 loader 对同一精确变异幂等后才得到上述数学结果。

### P2：权限标志及可表示性边界——最终闭合

- 初版未提供 `routeAccepted`（不是显式 false）；现三个授权字段 `accepted/runtimeInstalled/routeAccepted` 全 false。
- 初版正有限极小 tileSize（`Number.MIN_VALUE`）可返回无限 UV；现结果层 `finiteUV` 真实拒绝，UV/fasciaUV 负控通过。并未把所有正有限输入都冒称一定可表示。

## 当前合同覆盖与准确口径

- 六个固定实例、十层，测试覆盖 predecessor/proposal 两种模式。旧参数重采样不等于旧 mesh 字节或旧三角列表原样。
- lower/upper/wing 的旧 ring 角点先按分段单调 knot 映射，再沿当前面线性参数 s 插值。这里 s 不是余弦角参数；未来生成器若使用 cos，必须仅转换一次。
- 固定 bearing `tw` 保留精确 footprint 数值；tile 参数插入该值，soffit 按原 `rs=max(2,round(nT*(1-tw)*1.5))`，lower 3 段、upper/wing 2 段；本轮只证明数组/公式，不证明真实 BufferGeometry 中存在对应三角行。
- 独立 lift oracle 覆盖两种模式、全部面、两端分支、三种外伸进度和三种离角距离（含影响区外）。XYZ 期望来自 canonical ring/recipe，不从 q.point 反录。
- U 保 section 局部原点、无 lift 切线投影；V 为 mapped no-lift 中心剖面弧表的剩余长度，64 基础区间加 tw 后按非均匀 t 区间插值，**不是含 lift 曲面的测地长度**。fascia V 明确保留旧 `1.5×thickness` 约定，不宣称含顶端额外 0.03 的全米制高度。
- 固定输入域、未知实例/模式、非有限参数、非法 lift 配置和输出数组外部修改不污染后续调用均有测试；不把此 API 称为任意恶意 JavaScript 对象的沙箱认证器。

## 下一阶段必须独立验收

本轮不关闭以下门槛，也不允许用 11 项数值绿代替：

1. 实际 Float32 tile/soffit/fascia 的全部属性/index/groups、非零面积、有限/有效法线与 UV；tw 必须成为真实共同采样行，并按实际三角边交点检查。
2. 无 lift 基础截面/命名 Y 锚点与角部 lift、固定半径管截面实际 Y 的分账；pavilion/wing parentY、Ry 与未安装 XZ 必须各自绑定，不能只比最高点。
3. 退化 apex/ridge 面的明确删除清单，不能删除任意小面掩盖闭合缺口；资源释放及材料所有权。
4. 前驱完整记录/旧源不变、实际新几何完整 delta、独立 trim；TextureLibrary 真材质、GPU、真实上层承托、围护/柱脚、台面 FP、World、全套/构建另审。

历史源图尺寸/接口与路线 P1 不因本轮纯数值合同而解决；工程拟合仍是工程拟合。
