# R53 养心殿西暖阁：有限基础形制与材质 partial

2026-10-22。后继于冻结白模 `03dcb64842974642e3fe46bd5ebfba89dc68e9b7`，不改来源尺寸、source-to-model 变换、门位或合法绕行。只做照片可辨的基本体量、木/漆/布色区分，不是完整实景精修、精确测绘或清代原样复原。

## 本段可见变化及来源界限

- 勤政亲贤：北炕三块简化木面板与木沿、红炕毡、浅色圆肩靠背与圆枕、两张有桌面/腿/牙条的低几、空白挂板的基本框边。形制关系来自[宫博现陈列照片](https://img.dpm.org.cn/Uploads/image/2026/04/30/2-stivNCrFc313.jpg)。照片中的细雕、织物纹样、外侧高几/陈设没有补造。
- 三希堂：南窗炕、蓝炕毡、朝西黄色座背/圆枕、带腿和简单侧板的阅读几、东墙空白板框、简化南窗内框。关系来自[宫博照片](https://img.dpm.org.cn/Uploads/image/2026/04/30/1-cPnefIMuK313.jpg)。阅读几侧板没有复刻未经核实的浮雕，壁上瓷器/花卉没有制造。
- 两张照片 URL 日期为 2026-04-30，拍摄日期未知。论文 2023 记录、p129 数字复原与照片仍是不同证据层。[2023 官方论文](https://img.dpm.org.cn/Uploads/File/2023/07/19/u64b75fda11a18.pdf) 的 p123、125、127、129 已实读；测源、差额、变换和未解残差见[白模历史记录](README.md)。当前勤政亲贤匾为 1960 年代集雍正字复原，不称雍正原物。
- 所有匾联仍为空白基底，不假造文字。色值是未校准的基础近似，无纹理贴图，不声称复刻真实材质。后佛堂、梅坞仍未建，不以空房或默认家具填充。

[勤政亲贤基础形制图](visuals/qinzheng-basic-forms.png)、[三希堂基础形制图](visuals/sanxitang-basic-forms.png)、[更新注释平面](visuals/annotated-plan-basic-forms.png) 均来自实际网格 CPU 投影，已实际查看。它们沿用白模相同镜位和视场，但不是校准照片匹配；保留 B/S 几何为灰色，原前窗的纹理不在此诊断中显示。没有浏览器、WebGL、GPU 或帧率验收结论。

## 几何、碰撞、支承增量

机器可读清单为 [basic-forms-delta.json](basic-forms-delta.json)。本组件共 109 个合并前网格、109 个对应保守 AABB、2,876 个三角形、10 个自有材质、10 个可见平顶支承。相对冻结白模增加 80 网格/碰撞、2,528 三角形、6 材质和 5 顶面支承。生产合并按材质执行，不把 109 个合并前网格误称为最终 draw calls。

弧形座背/圆枕使用真实有限几何及包围它们的保守 AABB，不声称盒体与曲面实体完全等体积。所有注册支承均是实际可见的矩形平顶，`rescue:false`；没有为靠背/圆枕造隐形承重平面。

局部新增总范围 x=6.32..17.50、z=-6.14..0.831263、y=0.62..4.12。与白模相比只向南扩展了三希堂窗内框；z=-6.14..-5.54 是衔接保留前窗的可逆兼容尺寸，不是照片测量深度。旧 x=6 门洞无新增重复墙，外壳、屋顶、原 GLB 和 InteriorLoader 均未修改。

B 档永久由分区持有。实际 S GLB 的 10 个碰撞代理加载/卸载三轮、加载取消后重入、分区卸载/重建均已执行，新增结构与材质不会随 S 卸载消失；分区卸载时对应碰撞/支承移除，自有材质释放一次。原 GLB 哈希不变：`e29192ab78f14811cbbbb94f8736d984f3c8bfece197e54cb81e023cb7c8fde3`。

## 整合方复用已建世界

导入 `tests/r53-yangxin/world-audit.mjs`：

- `auditYangxinWorld(W, {layer:'B'})` 消费已有 `W.scene`、`W.cm`、`W.rooms`，不再构建世界或改变加载状态。要求当前无 `interior:yangxin` 代理，检查 4 房间、10 永久材质、真实碰撞和可见三角面的 1 m 宽身体通路。
- 已在该 W 用实际 InteriorLoader 加载养心后，`auditYangxinWorld(W, {layer:'S'})` 要求确有 10 个对应代理、可见的 interior:yangxin 场景组及原 GLB 的 11 个网格 / 8,720 三角形，运行同一检查。实际 S 不在场会抛错，不能把 B 成功当 S 证据。
- 返回 `ok` / `blocked`、实际代理数、采样数、候选三角形数量和 `physicalReplayRoute`。整合脚本应断言 `ok`，再把路线交给它已有的实控回放。
- `yangxinWorldRoute()` 单独返回全球坐标往返路径，包含主殿南侧外部起点和入口。可传 `{roundTrip:false,includeApproach:false}` 只取西暖阁局部路径；折返不会重复终点。实控回放沿用转角 2 m 内制动的测试驾驶器，启用 sprint 不等于全速硬转。

主殿中央地图落点仍未变。旧横穿西暖阁的直线若撞到真实隔断，应改走门口，不准穿墙、缩人、抬空或借救援。新 4 房间站立点仍只是导航候选，不是已放入人物；本地没有宣称通过全世界 77 人验收。

## 已执行的小范围验收

`node --test --test-reporter=tap tests/r53-yangxin-*.test.mjs tests/r48-residential-completion.test.mjs tests/r48-residential-yangxin-facade.test.mjs`

48/48 通过，见 `reports/r53-yangxin/basic-forms-regression.tap`。包括 10/60 Hz 步行/启用冲刺的 B/S 实控往返、真实 Draco GLB 的 11 个可见网格/8,720 三角形及 10 代理、地板承托之外无 GLB 穿插、全程 0.5 m 半径身体与可见三角面净空、支承光线/无救援、分区生命周期、可复用 audit 的 B 与实际 S 使用测试。

`NODE_OPTIONS=--max-old-space-size=2048 npm run build` 成功，见 `reports/r53-yangxin/basic-forms-build.txt`。独立复核另对全部新构件与保留 B 网格执行内缩 1 mm 排除接缝后的三角面检查，穿插为 0；南窗框对 S 的接触只在两侧竖框底部与地板。

未再重复构建全世界或全库；历史全库非全绿的边界仍见冻结白模记录，最终 77 人与两处宫室由统一整合方只跑一次集中验收。没有发布或修改 main。
