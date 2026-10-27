# R118 验证冻结账（限定结果）

最终运行代码冻结点：2026-10-27 03:26 UTC，测试时 HEAD `8955d49d`，dirty R118 candidate。最终构建输入 fingerprint `a20989ae9a74d6d2deb686bf1e76b6fc8d33b8f599918b66d8e5816cabd90333`；独审 src/data aggregate `ed4cef463…`（输入集合不同，不混作一个哈希）；各门 before/after 另有 JSON。前一轮 `f9710b3b…` / `3190b8ac…` 是最后builder接口兼容修之前的保留记录。

## 已跑的定向结果

| raw | 终态 | 适用范围 |
|---|---:|---|
| recovery-tests.tap | 9 PASS / 2 FAIL | 恢复时的侧顶沿变异漏洞、旧 nightSeat handler；历史 RED |
| integration-first.tap | 4 PASS | 第一版真正去返/两个 slot/streamed，不替代最终版本门 |
| second-integration.tap | INTERRUPTED | 全签名保护导致长测过慢，主动中止并弃用该实现 |
| source-local-green.tap | **3 PASS / 1 FAIL** | 名字不是结论：静态证据误含 silhouette，正常加载隐藏它后误停 |
| stream-debug.log | 定位证据 | 已确认失败是静态 silhouette，而非放宽了真正源删除 |
| source-index.tap | 3 PASS | 同等 unload/rebuild case 已重跑关闭；当前同数 owner/attribute 替换、公开新增障碍、祖先隐藏、手动调时 |
| route-stream-green.tap | 2 PASS | 10/30/60 去返 + streamed；随后生命周期新增补测另列 |
| rendered-streaming-red.tap | FAIL | 实际 RoomNightLights 显隐误当建筑源变更，已限定排除非建筑灯具 |
| rendered-streaming-green.tap | FAIL | 夹具中的玩家确实堵住入口；改为断言等待，并验证移开后继续，不绕过玩家 |
| rendered-streaming-final.tap | 1 PASS | 灯光/玩家堵路/两实际模型和body/40m/cache/evict |
| rendered-lod-red.tap → rendered-lod-green.tap | FAIL → 1 PASS | 真正 Three.LOD.update 的合法 level 可见性切换，不放宽 geometry identity |
| rendered-occlusion-red.tap → rendered-occlusion-green.tap | FAIL → 1 PASS | 真实 OcclusionByWall 官方离屏隐藏 + 缓存重入 |
| sleep-generation-red.tap、bed-generation-red.tap → generation-final.tap | 2 RED → 2 PASS | 等值属性替换生成新source identity；睡眠source随重建刷新；完整render/lifecycle复测 |
| low-surface-transitions.tap | 4 PASS | 原生成低台：10/30/60 松键、横移、空中进区、离域；缺/同数改 terrace 源不复用 |

`reports/r118-nightlife/` 保留以上 raw。旧日志文件名中的 green 不构成通过结论。

## 独立接触轨迹

独立只读脚本与 provenance 位于工作区 `../r118-independent-review/`：原乾清 south-forward 三 FPS、补充原低台往返三 FPS、承乾原 west-wing 门往返三 FPS，九条均实际成品 12-triangle oracle 零正交叠；六条往返完成且 grounded。原 3/10/20、4/16/32 旧报告和更严格 Float32 原始计数保持原记录，不改写历史。

这不自动证明全园/其它家具/任意屋面。完整两人 actual oracle 已在 10/30/60 Hz 通过 **新增范围**：1438/4310/8616 帧完整去返；皇帝新增段与后妃全程 capsuleEndpoint=0、完整实际 LOD0 strict triangle cross=0。每帧记录所有accepted子步并用独立三角/胶囊 oracle；CPU/GPU同形变的实际LOD0顶点用于渲染体检查，仍非GPU截图。

旧太和共同前333点有继承几何交叠；exact HEAD8955 archive 同输入前10帧数值逐值一致、同实际B fallback（未加载可选S GLB）严格交叉反证保留。新增段起点 index333 的3个保守 lift-sweep候选单列，不伪称旧全路线零穿。

## 最终必要门

- [x] 最终源绑定 R118 全部测试。
- [x] R96 movement；R109/R112/R113/R114 接触保护门。
- [x] R96 characters、R106/R107 资源/质量/缓存保护门。
- [x] 旧 R78/R96 被替代合同精确分诊；不修改历史 expected 冒绿。
- [x] 构建、zones/anchors/current-state、标准 gate 可运行范围和阻断原因。
- [x] 最终路线原始过程、成本和 source fingerprint 前后相同。

GPU / physical mobile / historical total acceptance：**NOT_RUN / NOT_RUN / PARTIAL**。

## 新接触通道 RED → GREEN 与最终成本

- 独审第一完整10Hz有真实新木槛/台沿/地坪交叠，记录原位保留；不是以最终到达洗掉。
- `actual-surfaces-red.tap`、`yulu-side-red.tap`、`consort-support-red.tap` 为真实定向RED；`consort-support-green.tap` 2 PASS，含所有实际支撑点和当前raw顶点变异停步。
- `actual-surfaces-first.tap` 与文件名 `actual-surfaces-green.tap` 是历史 FAIL：断言初期取了下层top而不是实际更高完成层；`actual-surfaces-second.tap` 当时2 PASS，后来纳入 `.62` 最终室内完成面。
- `actual-surfaces-route{,2,3}.tap` 是历史 FAIL：分别暴露旧工程floor严格来源不匹配、局部编辑误选远段、真实箱体切角。`actual-surfaces-route4.tap` 通过完整10/30/60往返。
- `final-r118-first.tap/json` 是末轮首跑 **26 PASS / 1 FAIL**；新增bad-reload夹具误改已dispose旧group，不是产品放过坏新源。改为实际新Builder在load发布前变异；`invalid-reload-final.tap` 1 PASS，断言首次load与后继validate持续error。运行码未改。
- 完整8616帧两routine成本 raw：`final-route-cost.json/log`，source before=after `f9710b3b…`。新段P50 `.099ms`、P95 `1.619ms`、最大`8.462ms`；cold最大`14.145ms`、构造`397ms`。root接受为R118显式新增功能成本预算，**不是性能优化/无额外开销/整帧指标**。
- 数值导航粗估122656B，面快照实际34606 scalars（Float64等价276848B），796 cells/5737行引用/30大面引用；不含JS容器与对象开销，不声称heap/峰值内存。

## 旧全门差分与最后兼容收口

`final-current.tap/json` 完整112文件：1289 tests，1100 PASS / 189 FAIL，未修改历史expected。对54个失败文件，用相同串行node driver、HEAD8955精确字节、相同缺assets-src环境进行一次有界基线：675 tests，487 PASS / 188 FAIL。两个分母不同，**不作总数直接对比**；按文件/行/断言名，188个失败逐项双红，仅1个新增builder接口TypeError。

该唯一新增为 `r31-qianqing-material` 的 `col()/walkBox()` 几何builder旧接口：修为有实际colliders Array时保持原push/精确scope，未暴露Array的原接口走col()同F32六边界。旧断言不改，定向1 PASS＋低台物理5 PASS。独审另证明真实Array分支产物byte/numeric完全一致。新运行输入fingerprint `a20989ae9a74d6d2deb686bf1e76b6fc8d33b8f599918b66d8e5816cabd90333`；旧完整oracle/成本不是新hash，独审已按根授权重跑最终三频，末轮现有保护门随后重跑。

标准gate先前build PASS，zones 3 errors/20 warnings使其停止；另跑anchors 114条、1个神武门11m偏差＋1个kind未比较。二者与fresh HEAD错误文本逐项一致，详见 `standard-gate-baseline-comparison.json`，不称全gate绿。smoke未到页面：`/usr/bin/chromium` 被环境 `socket() failed: Operation not permitted` 中止SIGABRT；GPU/mobile仍NOT_RUN。

全current门会写两个旧R58原始报告：本次新生成内容另存 `current-state-side-effects/`，历史原文件恢复HEAD精确字节，不污染旧记录。`interrupted-final-r118-exclusive-cpu.*` 是为让出根批准独审CPU窗口而主动退出130的部分日志，不当PASS。

最终同三频独审已在最后兼容修后 fresh 重跑（不是仅引用等价推论）：新aggregate `ed4cef463…` 前后相同、changed=[]，10/30/60帧数仍1438/4310/8616，限定新段/后妃body与LOD0模型检查均0。精简结果和逐文件来源见 `reports/r118-nightlife/independent-review/`；未改善旧共同前缀穿插。

## 最终终态（最后源码 a20989ae…）

| 门 | 终态 | raw / 说明 |
|---|---|---|
| R118 作息/床位/完整接触/streaming | **27/27 PASS** | `final-r118.tap/json`，source before=after |
| R96 movement + R109/R112/R113/R114 | **90/90 PASS** | `final-motion.tap/json`，含实际B/S kang各10/30/60；首缺输出目录红已保留 |
| R96 characters + R106/R107资源/质量/cache | **41/41 PASS** | `final-resources.tap/json` |
| current-state历史112文件 | **1100 PASS / 189 FAIL的首完整记录** | fresh HEAD失败项逐名差分188双红＋1新API回归；该1项旧断言修后定向PASS，不伪称重新跑了全部112 |
| R78/R96旧床/中和作息合同 | **4 FAIL，SUPERSEDED_BY_USER_R118** | `final-legacy.tap/json`，保原expected；由本轮新合同门接替 |
| 独立实际路线/床位 oracle | **10/30/60限定PASS** | 最后源码ed4cef463…前后相同；新段/后妃0 endpoint/0 strict renderCross，旧前缀明确不清零 |
| Vite生产build + identity readback | **PASS** | `final-build-v2.log`；`R118-257ab63f2b45`，base `/forbidden-city-3d/`，`verifyBuildSource`读取dist匹配 |
| 标准gate | **FAIL（继承zones3错/20警告）** | `final-standard-gate-v2.log`；未跳过失败来冒全绿 |
| anchors单跑 | **FAIL（继承1偏差/1kind未比）** | 与fresh HEAD逐文相同 |
| smoke / GPU / physical mobile | **环境BLOCKED / NOT_RUN / NOT_RUN** | 浏览器未到页面；socket权限SIGABRT，后续浏览器门不声称通过 |

最后完整8616帧成本已在 **a20989ae** 重新实测，不沿用较小旧值：新段P50 `.097707ms`、P95 `1.983807ms`、最大`10.413642ms`；cold最大`13.697371ms`，构造`451.873727ms`。root接受为R118显式功能成本，不是性能优化，不重跑挑较小结果。703/106数值导航与1331实际面/276848标量bytes不变；整帧/GPU/mobile及JS heap未测。旧f971 profile保留为 `pre-compat-route-cost.json`，不能冒作最终数据。
