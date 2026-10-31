# 午门离线屋面生成计划独立预审

**技术预审支持按最终 2137 版进入 Task1 纯数值 TDD；不据此批准 Task2 实体、Task3 装饰、Task4 完整证据，更不批准生产接线。** 初稿两处 Task1 P1 已在 2136/2137 设计修订中闭合。每阶段须保真实 RED/GREEN、冻结输入并单独审查；本轮仅阅读计划与原源码、做纯算术，没有生成 Three 实体、运行测试、World、FP、CPU 或构建。

原计划 2130 SHA `ef7d1bb310bd529e2ccf2a20100372302bfbb0a8ce7a8907760eefbef7d9e0fa` 保留；2136 SHA `2aeb1a7154853dbb2d22e32fc5eded26f2180c5b3b6f58720d1bb4d675207d06`；最终审查对象 **IMPLEMENTATION-PLAN-ROOF-OFFLINE-2137.md** SHA **`86efcdb6eb942a691e17534bd8e822d8dd6dc4031e4655a1f64b2c3ae3b98b8c`**。本轮未修改这些文件。

## 为什么这个隔离方向可行

六实例为四亭各 lower/upper 两层、两翼各 single 一层，共十层，不是六座完整建筑。已锁 2112 数值配方分开了柱轴、实体墙皮、facade、梁外沿/roof footprint 与檐口；主楼 roof 及 52 主楼柱仍非目标。

对旧 ring 的角点先作各轴奇对称、单调分段线性映射，再在该实际边上插值，比逐点映射旧边更明确：后者会把中途穿过轴 knot 的普通边点再折出未声明的折线。wing X 的旧 ridgeHalf=13.2 与新显式 ridgeHalf、footprint/eave 已固定；四亭非正方形的独立 X/Z 尺寸必须分别验证。采用同一个旧 tw 对应新的 bearing ring，可在不直接套新尺寸归一化 tw 的条件下保住指定基础 Y 锚点。

这是一种**保旧工程剖面高度的水平拟合**，不是来源已经证明的新屋面历史剖面。保原 H/eave/fan 数字不能证明每个实际顶点 Y 都不变；lift 的影响带和重新生成管的切向截面已明确另列 delta，不能只比较最高点。

## 初稿问题及闭合

### P1 原 soffit 采样误称

原 RoofBuilder.hipSurface 的 soffit 段数是 `rs=max(2,round(nT*(1-tw)*1.5))`，不是 nT。独立按锁定配方复算：

- lower：nT=4、tw=.5，原 rs=3；
- upper：nT=6、tw=.7830802603036876，原 rs=2；
- wing：nT=6、tw=.8064516129032259，原 rs=2。

2130 的 `original ... i/nT` 会把原 3/2/2 段改成 4/6/6，却称原采样。2136/2137 已改为真实 rs 表达式。tile 则是原 i/nT 与精确 tw 的有序并集；lower 的 tw 原已在表内，upper/wing 新增一行。不能用 epsilon 合并不同 authored knots。算术记录见本目录 `sampling-audit.json`。

### P1 UV 数学定义不充分

2130 未规定 aspect 的作用、U 原点和 lift 前后口径，且“64 区间加 tw”若仍用 t*64 会错误索引非均匀表。最终版已采取更窄策略：

- 不新增原 roof tile/rafters 不消费的 aspect 参数。
- U = 未 lift 的已映射 XZ 与 eave 单位切线点积 / 当前材质 tileSize；方向固定为 corners[k]→corners[k+1]，原点为 section-local 0。不是随每条边起点重新归零。
- V = `(S(1)-S(t))/tileSize`，S 是 mapped no-lift face-centre rho/Y 的弧表；样本为 i/64 与 tw 的精确并集，按真实相邻 t 线性插值。lower 表仍 65 点，upper/wing 各 66 点。
- 这只是无 lift 基础中心剖面的近似弧长，不是含起翘实际曲面的等距/测地 UV，也不承诺旧 UV 字节保留。
- fascia 独立纵参 a。其实际顶 +.03、底 −1.5th；选择保旧 `V=a*1.5th/tileSize`，明确额外 .03 不计入 V，故不能把 fascia 也叫完全米制。

这些定义已足以作为 Task1 独立 oracle，而不是实施时临时挑选任何能过绿的 UV。

## 各阶段可实施边界

### Task1 现在可支持的纯数值范围

只创建 canonical ID/layer/mode 的 evaluator，不创建 Three 对象，不安装实例。测试十层的 predecessor/proposal 两种模式、ring、baseY、lift、精确 knots、采样表和 UV；拒绝错误 ID/layer/mode、face、t/s/a 非有限或越 [0,1]、非法 tileSize，并验证返回数组不能污染下次调用或 canonical 数据。`point` 的 s 应始终是线性边参数；cosine b→s 由明确采样步骤应用一次，避免二次加密。

必须保留 2112 合同/旧基线不变。`predecessor` 名义仅为旧参数的离线重采样重建；新增 tw、去退化和 V 表政策后，它不等于旧 RoofBuilder mesh 字节，旧完整 fixture 基线才是原记录。Task1 绿只说明数学函数和契约，不算十个实际 roof layer 已做完。

### Task2 另行审核实际 Float32 表面

在 Task1 冻结通过后才进入。对 tile/soffit/fascia 的实际属性和索引独立计算 area/normal/bounds/UV，不能信 generator 自报 audit。实际 bearing row 要在 tile/soffit 共同出现，按真实三角与参考平面交线检验，不只抽方便顶点。两面保垂直厚度，不要求重合。

**fanY 只是锁定的参考平面。** 本阶段没有扩建真实 fan/斗拱/梁，故符合该平面仅是未来承托的几何合同，不能称新实体已被旧小 footprint 的 fan/梁承托，也不能加一块隐形面使它通过。

顶点先按实际局部表达式生成再 Float32。亭 baseY 已是 component-local，parentY=0；翼先 local base6.5，之后 parentY=12.3、Ry=π/2。拟议 X/Z 只属未安装局部 frame，不叠加城市原点。舍入界应绑定这一真实运算顺序，列残差，不拿宽容差掩盖接缝。

结构性 apex/ridge 零面积三角须逐 face/cell/triangle 记入删除 ledger；其余 Float32 collapse 必须失败，不能一概小面积过滤。删除后也须处理未引用顶点，避免零 normal 冒称全体 unit normals。硬缝/平滑边、open boundaries/overlap 都要明列，非“全屋顶闭合”默认结论。借用材质不被 dispose，异常路径及重复 dispose 需要实证。

### Task3 另行审核 trim 及派生 Y

固定米制半径重新生成 hip tubes，不能缩放合并管网。最终计划已补完整的 lower trim 库存：4 hip + 1 围脊 prism；围脊 new innerHalf+hr、Y=[Y(0)-hr,Y(0)+1.8hr]、tile1 来自被锁原源码，不偷改 2112 金样。

upper finial 及 wing ridge box/cap 截面参数仍锁旧值；原 low detail 不新增走兽。实际管 Frenet 截面、CatmullRom 插值、端部延长和新影响带造成的 Y 变化必须完整列账，不能只用中心线/最高点。source 的 finial/pole 等结构退化如有，必须分别设计和负控，不外推 Task2 的删 apex 规则到所有 trim。

### Task4 不是自动总验收

仅在前面三门独审后对十层完整实际几何做 delta/audit、源 600 字节及完整旧 fixture/黄金保全。元数据造假、删 knot、翻 normal、UV/radius 缩放、父位姿和 high detail 泄漏须实际拒绝。CPU 需要另获资源窗口，必须全脸、同相机且标明离线范围。未知接口、104 轴装配、东北围护、横连、真实承台接头/FP、World/full/build/GPU 均不由这一阶段关闭。

## 最终分级结论

- **P0：** 本轮未见。
- **原 Task1 P1：** 采样归属和 UV 定义均已由 2136/2137 设计澄清；支持按父授权启动纯数值 TDD。
- **后继 P1：** 实际 Float32 三角 bearing、派生 Y、normal/UV、完整 trim/资源和真实建筑支承仍必须分门实证，当前没有通过结果。
- **P2：** 不扩大 predecessor/UV/参考平面/记录字段口径；特别不要把 numeric evaluator 或模型总数等同真实屋面/完整建筑验收。

这是计划预审，不是任何尚未执行测试的通过证明，也不改变本轮继承的历史缺对象门禁。
