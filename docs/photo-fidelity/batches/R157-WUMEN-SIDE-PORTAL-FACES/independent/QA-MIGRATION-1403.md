# 午门两掖门薄饰面：有限旧合同迁移补充审查

**结论：1401 冻结下的有限 QA 迁移已独立轻测；可进入实际 World 验证。没有据此批准整版/发布。** 本报告补充而不替换 `COMPONENT-REVIEW-1356.md`；两生产 SHA 未变，新增 QA 收紧发生在其后。

## 独立终态
命令：`node --test --test-concurrency=1 --test-reporter=tap`，依次执行 side-portal-faces、side-portal-comparison、lower-five-portals、main-grid、main-integration-equivalence、main-object-state、right-leaf-studs、main-width 八个 test 文件。

`successor-focused-1401.tap`：**54/54，exit 0，36.109 s，0 skipped/cancelled**。
分母为新组件 10 + 比较层 6 + 原 lower 19 + 四个历史 wrapper 所在文件 13 + width 6；四 wrapper 内的历史子断言 5+2+2+1=10 不重复加总。未包含 CPU 黑盒或 World。

`focused-freeze-1401.json` 10 个输入路径在独测前后逐 SHA 相同；`successor-scope-1402.json` 记录源码与迁移审计。新 fixture SHA `726ca8fd160f1e9b4057842cec50f3a95aea93cce6f7d54df5c345d50641dc24`；比较 helper SHA `6d8f7d9a720d258319b651f49a98a2eb86e1b0a41cfab4401b07480b29ee625c`。

## 原断言 / 历史闭包
- 首轮原消费者实测 **20/12/8** 保留：4 个旧 590 路径闭包 wrapper、3 个旧 width 非目标/全门断言和旧 CPU 49,152 计数报红。不能删去该轮或叙述为原 20 项未曾失败。
- 我逐文件复算 7 个原 test 的差异：4 个 wrapper 只换显式 historical-runner import；width 组件与 width World 只换显式认证比较 helper import（组件有两个 import 点）；旧 CPU test 只将数量 49,152 改为当前 49,536。反向替换这些声明变化即逐字等于 db1 原文件，函数体/原路线与其余断言未改。
- 原 590 historical-runner、原 width contract / World 比较 helper、历史合同清单与原历史 test 文件均逐字未动。并非悄放松旧 guard 或刷新 golden。
- 新 runner 以硬编码 SHA `a17447008cccd56751578d76ac14e326fa6399447d54944b712d05d1f50be383` 锁 `source-current.json`；我核实际 src/data 集合恰 591、逐 SHA 匹配且无符号链接。对原 590 清单只允许三 width 前驱 + Lower 四个精确源码覆盖；Lower 前驱 SHA 与原 590 独立清单逐项相同。其余 586 源保持原字节，新 Faces 在该历史入口不加载。
- 原历史断言路径/字节允许列表、清除 NODE_TEST_CONTEXT、真实子进程 TAP 和精确 tests/pass/0fail/0skip/0cancel 均保留。这里认证的是明确构造的完整历史源码闭包，不是把旧测试当当前新模型通过。

## 比较对象范围与新负控
`portalPriorComparison` 先认证真实两 owner、32 叶 Mesh、完整源身份/不确定性 metadata、几何、有效材质、实际变换，再只在 clone 中移除这两个末尾追加组；重绑 clone tower，保留其 Box3 语义。比较 builder 仅含新浅数组 colliders/walkables，无碰撞/地面 query；实际 raw 场景、原数组与逐 row 身份不换。比较前后签名和引用均验证。

认证不应等同“删去任何带标记对象”。本轮因此补齐并保留真实 RED→GREEN：
- 新增 source/metadata/texture 漂移；
- group 或祖先 matrixWorldAutoUpdate=false 的真实 world 矩阵移位（子矩阵相对错误父矩阵不能自证正确）；
- panel 下嵌套陌生 Mesh，或原节点 isMesh=false（必须为恰 2 Group + 32 真正零子节点叶 Mesh）。

另测缺失/重复/陌生 owner、目标位置漂移均拒；非目标几何、物理和支承变化不会被删除，仍使原前驱签名失败；返回 view 后再改 raw 物理也由 assertUnchanged 拒绝。闭门捕获旧 tower 引用的 fixture 错误首轮已留，修正为从该闭门实际 group 寻找自己的 tower，不改生产或旧断言。

## 后续边界
- 新 World 文件静态为真正 `buildR52World()`，不注入安装器；五个门路 × 10/60 Hz × 走/跑 × 正/反向 = 40 个组合，控制器仍用 raw W.cm。
- 新 World 的局部饰面核验比完整材质/世界变换合同窄；同轮原 width World 的全门 meshFingerprint/renderStateHash 才提供完整合并场景的配套约束。两者应组合报告，不能把单个新消费者或当前组件 oracle 说成独立照片黄金。
- 本报告尚未计实际 World 终态、原全套、累计 batch、构建、远端重现或 GPU。前序缺史 batch P1 继续保留。生产仅新增薄饰面，不恢复真正平额截面或铭文；右末两分界弱和现 CPU 4 mm 缝亚像素边界仍适用。
