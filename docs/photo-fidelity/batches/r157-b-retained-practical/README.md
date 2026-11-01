# B 组 11 项：主要入口与三台实梯接触收束

基线 `e64098e80ba563d15af78f410df2b6f1298e6f26`。本目录覆盖上轮 6 个保留项的主要路线，并保全上轮太和门/保和墙廊结果。**通过仅指所列真实 World 控制器与 CPU 组件范围；不是全部房间、浏览器 GPU、用户设备或用户验收。** 小于 0.3 m 且不挡路即停止追精度。

## 实测结论

- 修正两处测试输入后，基线 28/28 均能到达；但真实三殿阶梯下降脚地差约 1.99–2.03 m，两阁约 1.267 m，持续约 0.77–0.88 秒，属于明显视觉硬伤。`corrected-route-world.*` 原红及全部帧保留。
- 本批仅追踪 **43 条既有真实坡面 + 14 块既有台面**。不添加或改形网格、碰撞体、可走地面，不动重力、全局台阶阈值或建筑布局。精确绑定现有登记参数；宝座台、封闭侧接坡、两阁上层均不获授权。原始库存 SHA 和逐参数清单可核。
- 候选 **28/28、14,139 帧**通过，峰 **0.0836666667 m**；7 处身体/头部探针、两墙实挡负例通过。真实 NPC、薄障碍、跳跃、高落、侧离、超速位移、登记移除/重复/篡改均不借接触修复穿越。
- 相关组件 **42/42**；原 B **24/24、16,730 帧**与累计 **244/244、96,478 帧**通过，两个原帧 NDJSON 分别与 e640 集成结果**逐字节完全相同**。244 既有峰 0.4472778 m 是中左门原台沿，不宣称这 244 条全部低于 0.3 m，也不借此扩修别组。
- 无新增外观网格：原两狮朝中轴、保和西台/墙及联庑主要形制保全。本批未做新 GPU/纹理评判，不量化宣称“外观 95%”。

## 11 项完整记录

| ID | 对象 | 当前实用范围结论 | 待验/限制 |
|---|---|---|---|
| FC-B3B12CF397 | 太和门 | **通过（既有修复保全）**：两南梯→厅→北梯往返，10/60 Hz 走跑 8 条；含于原 24，帧未变 | 当前 CPU 两狮审图沿用上轮；GPU/用户待验 |
| FC-A478209231 | 太和殿 | **候选通过**：南侧三层台阶→本殿台基→殿内宝座前合法观看点往返 4 条 | 不穿宝座/御座；全部殿内路径与实机待验 |
| FC-5FAA15AE5C | 中和殿 | **候选通过**：东腰部三层阶→自身台基→四门合法环线→返回地面 4 条 | 不把完整房间细节当已验；GPU/用户待验 |
| FC-58A3300503 | 保和殿 | **候选通过**：北侧三层阶→本殿北梯→侧廊→西暖阁真实门口往返 4 条 | 只测真实侧门绕行，不直撞后柱/隔断；实机待验 |
| FC-8C6502DA44 | 体仁阁 | **候选通过**：自身前左阶→下层主要门口往返 4 条；主体未变 | 上层无已核实可玩阶路，不宣称上下层全通 |
| FC-A43B1DAB0B | 弘义阁 | **候选通过**：自身前右阶→下层主要门口往返 4 条；非强制镜像 | 上层/后房/实机待验；不追细雕或旧三角面阈值 |
| FC-35BF29ABCB | 三台 | **候选通过**：南、腰、北三层实际上下阶，包含于三殿 12 条；既有保和西台组件保全 | 与三殿共享路线，不重复计数；非任意边缘跳落全验 |
| FC-1ABC6622CB | 太和殿两侧阶梯封火墙 | **通过（新当前验证）**：两实际门洞各 4 条往返，两侧实墙阻挡、门洞净空通过 | 原完整墙对主体保全；实机待验 |
| FC-526ABE19BB | 保和殿两侧阶梯封火墙 | **通过（既有修复保全）**：东西门各 4 条往返，原 24 帧未变，西墙/接台组件通过 | CPU 图沿用未变源码；实机待验 |
| FC-0D3F161564 | 保和殿东联庑 | **通过（可玩前廊保全）**：主要前廊 4 条往返，原 24 帧未变 | 后房关闭；非逐房实测；GPU/用户待验 |
| FC-86FF7FC2AB | 保和殿西联庑 | **通过（可玩前廊保全）**：主要前廊 4 条往返，原 24 帧未变 | 独立近图/逐券实测缺项仍明示，工程近似不冒充测绘 |

新 28 + 原 24 为 **52 条 B 组主要路线案例**，不是 52 个独立对象。所有候选必须安装共享 hook 后才生效。当前范围已无未闭的 >0.3 m 阶梯接触缺陷；并不据此承诺所有视角/路径无缺陷。

## 原记录与测试纠错

外部目录：`/workspace/scratch/02a8023d1a85/b-retained-evidence-0341`，22 个证据文件 SHA/大小均登记在 `EVIDENCE.json`。

- `current-world.*` 首次 20/28：中和拼接路线重复同点导致零长段；保和误写 z125 而实际殿中心 z123.2，撞了真实隔断。这 8 次失败**不能当模型堵门证据**。原始文件不覆盖。
- `corrected-route-world.*`：仅修上述输入，未改场景；28 均到达但追地红。由此授权真实坡接触修复。
- `contact-components-1.tap` 与 `contact-10hz-diagnostic.tap` 保留首候选上行滞后红。10 Hz 奔跑一帧最多 1.2 m，真实坡升高可能超过原单次 0.6 m 查询范围；最终只按这些精确坡的有限帧升高查询真实地面，随后仍核实际路径与身体扫掠，不改全局 step。
- `candidate-world.*`、`contact-components-final.tap`、`retained-24.*`、`retained-244.*` 是终态结果。旧历史缺史/旧合同不伪造，也未运行无关大套件。

## 唯一集成交付

1. 接收本提交：接触模块、真实源面清单、B 专属 `SurveyedPavilion.js` 的 3 行登记、测试及本目录。
2. 集成者应用本目录 `SHARED-HOOKS.patch`，**仅** `PalaceBuilder.js` 与 `Collision.js` 两个共享文件（7 行新增、1 行删除，含一行替换）。工作者提交未修改这两个共享源码；不要漏装，也不要重用上轮旧 patch。
3. `EVIDENCE.json.candidateAppliedSourceSha256` 是此次实测时的已装钩子源 SHA；应用后核对。保留现有太和门/午门/D 钩子，不动 main/C。
4. 集成者统一接 A+B 后串行必要累计验证、build、打唯一体验包；工作者不再另建包/发布。以下为本批实际跑过的测试入口，非要求重复所有旧大套件。

```sh
node --max-old-space-size=768 --test --test-concurrency=1 \
  tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs \
  tests/photo-fidelity/batches/taihemen-stair-contact.test.mjs \
  tests/photo-fidelity/batches/wumen-practical-descent.test.mjs \
  tests/photo-fidelity/batches/taihemen-bronze-lions.test.mjs \
  tests/photo-fidelity/batches/baohe-west-practical.test.mjs \
  tests/photo-fidelity/batches/baohe-linked-galleries.test.mjs \
  tests/photo-fidelity/batches/halls-practical-integration.test.mjs \
  tests/photo-fidelity/batches/baohe-adjoining-wall-height.test.mjs
EVIDENCE_OUT=/tmp/b-retained-world.json \
  node --expose-gc --max-old-space-size=1024 --test --test-concurrency=1 \
  tests/photo-fidelity/batches/halls-retained-main-entry-world.test.mjs
# Same command shape, separate sequential runs, for prior 24 and cumulative 244:
# tests/photo-fidelity/batches/halls-practical-current-entry-world.test.mjs
# tests/r157-integrated-practical-world.test.mjs
```
