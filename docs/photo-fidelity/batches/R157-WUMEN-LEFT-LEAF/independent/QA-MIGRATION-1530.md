# 左近叶 592 历史闭包、有限比较及 World 草案独立复审

时间：2026-10-31 15:30 UTC；审查者 `/root/review_chunked_qa`。

## 有限结论

**历史闭包及有限比较迁移可接受；1529 补强后的 World 草案可进入授权独占实跑。当前不把草案／组件测试称作 World 已通过。**

独立串行轻测 **14/14，exit 0，10.22 秒**：比较 4、历史复制闭包 4、实际 592 guard 6。作者最终 11 文件 **50/50** 原 TAP 另已只读核对，不冒充独立复跑。未运行 World、CPU exporter 或修改仓库生产／QA。

## 1. 身份与原黄金

仓库 `r157-restored-411214`，HEAD `eec6847e8783ad28cb95371f50eba7bbb98078c2` 加左近叶 WIP。

- `migration-freeze-1526.json` 八路径在独立 14 项复验前后精确匹配。
- `world-freeze-1529.json` 为后续 World 补强单列新身份；原 buffer-only 草案另存，没有回写成补强后证据。
- 独立将 **1054 个既有 tracked fixture／历史 runner 文件**逐字对照 HEAD，零变更；旧黄金未刷新。
- 旧 591 guard 全文保存为 `.eec.historical.mjs`，与 HEAD 原件逐字相等，SHA `cdf7c24a515267cfea3fd9e7410deecf980268b2d008446aef6cf05a3139a572`。
- 旧 591 runner SHA `bf512d41ddaf2b364e55785c17f01f2c1b52b25da259a99fb6676e46032ca1b4`，原字节保留。

独立明细：`input-golden-identities.json`。本轮两生产源仍是组件报告绑定的 1456 字节，不因迁移改生产。

## 2. 592→591 是实际独立复制，不是伪造当前源集合

新 runner 先验证固定 pin bundle、当前 592 与前驱 591 两份 manifest 的 SHA，再核实际 `src/data` 文件集合、每个字节 SHA，拒绝额外、缺失与符号链接文件。592 相对 591 只允许新增 Left 模块、LowerBase 明确替换；其余 590 源完全相等。

随后在仓库外唯一临时目录建立实际 591 源树：

1. 真实复制 src/data/tests；源、QA 均不是硬链接。
2. 不复制新 Left 模块或当前 LowerBase，再写入 hash 锁定的 eec LowerBase 原件。
3. 独立核复制树完整 591 路径和全部 SHA；node_modules 是唯一依赖目录链接。
4. 复制必要旧 590 manifest、package；不复制 Git 历史，不利用全局 fs facade 伪造源读取。
5. 旧 591 runner 在这个真实 591 树中运行；它再按原有四源 override 合同进入原 width 历史基线。原 assert 文件、黄金及旧 loader 逻辑不变。
6. 外层子进程清 `NODE_TEST_CONTEXT`／`NODE_OPTIONS`，严格检查正常 exit、无 signal、真实子 TAP 分母；回调结束或抛错均删除临时树并复核真实 592 源。

独立测试实际验证了原／镜像源与 QA inode 不同；改镜像 PalaceBuilder、LowerBase 不影响真实文件，抛错后清理成立。新的 592 六负控先通过真实正向检查再注入只读 fs 故障，不靠合法 592 差异让负控“空过”。旧 591 六负控确实在有效 591 树里运行，另有原五条 width 子断言正向通过。

此闭包仅证明允许的四个历史合同及原 guard 可用完整 frozen fixtures 重放；**不声称全项目旧 Git 对象齐全或整个浅克隆 batch 可复现**。既有缺史 P1 不因此关闭。

## 3. 比较层及 isMesh 首红

新 `leftPriorComparison` 先在实际对象上 `verifyLeftStudFace`，认证唯一 64 帽组、所有位点／metadata／原型标准材质／实际矩阵／geometry 后，才 clone hierarchy 并删除该唯一追加末尾 owner。

比较对象无碰撞查询接口；它重新定位唯一上层 tower 并把比较用 tower collider 元数据重绑原合同引用。raw scene、原 tower、collider/support 数组及逐项对象、帽组及逐帽对象引用均保留；`assertUnchanged` 再核原 827 记录摘要及实际 64 帽认证。共享物理项若被后继 consumer 修改，会被真正检出。

作者首迁移 **43/42/1** 的唯一失败是既有 `not-a-real-mesh` 负控：Three clone 会把实例 `isMesh=false` 恢复成新 Mesh 默认值。如果先 clone 再认证 portal，就会洗掉 raw 故障。这是实质 QA 漏检，不是生产回归，也没有删改旧负控。

修复为三个复合入口（portal prior、width verify、width prior）**先认证 raw portal**，运行比较后再次认证；返回 portal consumer 的 `assertUnchanged` 也检查 raw portal。新增后继消费者将 raw portal `isMesh=false` 的测试实际拒绝；独立 comparison 4/4 包含这一路径。故不能只引用首 3/3 比较绿来描述最终契约。

有限迁移差异清晰：

- 四个历史 wrapper 仅改显式 runner import；旧 5+2+2+1 条历史断言未改，右叶其他 live 测试不冻结。
- width／portal 的合同比较仅换显式复合入口；实际 World manager 和路线不换为视图。
- 原 side-portal 保全 test 在删除旧两饰面前先经认证 left 比较，原保全断言仍在。
- 旧 591 guard 的顶层 **6 条→1 个严格子 6 条 wrapper**，是明确的统计迁移，不可称顶层标题／分母未变；不能再把子 6 重复加到顶层总数。
- 两个既有 CPU exporter 仍逐行验证全部真实顶点／法线／颜色／side，仅总数随已认证 8448 帽面由 49536→57984；其中一个标题数字也显式更新，不称原 test 字节全保。

## 4. 独立实测与首红保留

独立目录 `independent-wumen-left-migration-1527/`：

```sh
node --test --test-concurrency=1 --test-reporter=tap \
 tests/photo-fidelity/batches/wumen-left-leaf-comparison.test.mjs \
 tests/photo-fidelity/batches/wumen-left-leaf-history.test.mjs \
 tests/photo-fidelity/batches/wumen-left-leaf-history-guard.test.mjs
```

`light14.tap/.exit`：14/14、exit 0、10219.66ms。其历史子 5／子 6 是 wrapper 内部证据，不另重复计入 14。

`author-migration-receipts.json` 逐字绑定作者原日志：

- 首 592 guard 路径尾斜杠探针错误：6/3/3，后修测试匹配为 6/6；不把首轮当正确 guard 已验。
- 首迁移 43/42/1：原 not-a-real-mesh 负控实际红。
- 最终 11 文件 50/50、无 skip/cancel；SHA `d5e7852e8aa5419aea656825aa90ed1f36658aad4f997147602e52123e2f7467`。

## 5. World 草案：原盲区与 1529 补强

原 1526 新测试保留实际 `buildR52World`，没有调用 installer 注入 World；原五门 × 双向 × 走跑 × 10/60Hz = 40 条 raw 控制器路线，以及原物理 hash 链均合理。但单独 target verify 只比 position buffer，会漏实际 merged mesh/root 位移、emissive、drawRange 等。原 width World 的完整 geometry/render 签名虽可组合承接，不能把原新测试单独称“全部有效几何／材质认证”。已向作者指出，原草案另存。

1529 新 helper 与两项组件测试（作者先 2 红后 2 绿）补为：

- 先真实认证 64 帽组件，再调用实际 `PalaceBuilder.finish` 取得 canonical 目标签名。
- 实际目标为唯一真 Mesh、直接 child、无嵌套、有效可见祖先及自更新／实际矩阵一致。
- `meshFingerprint` 覆盖实际 world 矩阵、全部 attribute 与 index 哈希；`renderStateHash` 覆盖标准材质序列化、flags、groups、drawRange。
- 保留原 position buffer 对照、唯一 architecture ID 与 64/8/absent 字段、40 raw 路线及每帧身体／脚高、完整非突变物理指纹。
- 10 类实变异覆盖 mesh/root 位移、emissive、drawRange、normal/UV、隐藏、isMesh、嵌套及 root 隐藏。

静态审核同意进入真实 World 独占运行。新 helper SHA `e408d67417cc705a369def2bf78d47eb560bcc241f5c14c0d1d8ceb92a6a2f68`；新 World SHA `f619e87e70231cef8b5a4847e03e3b8d2cf3a1f4c724b5678dfdedfdb5d5ce92`。本次只读检查作者两项轻测及源码，没有把它们算成独立追加通过。

这里的 oracle 是**当前已严格认证组件的实际 canonical finish**，不是外部照片黄金。World architecture 目前独验唯一 ID 与上述几个字段，不声称整条序列全部字段金样对比。图像来源、64可见／8未知、拟合尺寸、15mm无新增物理及未验 GPU 的原边界不变。

## 风险与范围

- **P0：未发现。**
- **P1：本次迁移范围未发现未解决阻断；真实 World 与后续累计门禁仍待终态，不提前批准整版。** 原缺史门禁继续保留。
- **P2：** 历史复制树依赖当前锁定安装环境，不能据此宣称整项目远端完整恢复；复制测试执行与当前 live 检查必须分栏计数；World 组件 oracle 及部分 architecture 字段口径应准确。

本报告仅审查当前 QA 迁移／World 设计，不变更完成项计数，不批准 main 合并、GPU 或发布。
