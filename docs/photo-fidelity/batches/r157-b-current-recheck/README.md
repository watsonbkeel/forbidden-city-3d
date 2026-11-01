# B 组当前 11 项复核与太和门楼梯接触修复

固定基线：`678b90493fc637a1bbc05347c48d6c6d43989a50`；它与 `323aa691` 体验包的运行源码相同。原始结果和新候选分开保存，详见 `EVIDENCE.json`。以下“通过”只针对列明的 CPU 几何/可玩接口，不是用户或浏览器 GPU 验收。

## 关键结论

- 原基线 20/20 定向组件通过，24/24 路线均能往返；但太和门 8 条路线脚面追地不合格，北梯奔跑下行悬空峰值 **2.28424 m**，南梯下降峰值约 1.05 m，北梯上行滞后约 0.47 m。原 `current-world.tap` 保持红，完整帧不删除。
- 根因是既有真实坡面与通用重力/上行平滑的速度差，不是铜狮、保和新增物体阻路。FirstPerson 和太和门原坡形均未在本轮 B 改动。
- 候选仅为太和门现有 3 坡、2 台面登记有限接触追踪；不增加/加宽/抬高可走地面，不改重力、场景网格或全局移动策略。真实脚域连续、速度有界、实际身体扫掠均通过时才生效。跳跃、高落、侧向离开、所有权移除/篡改、薄障碍和真实注册 NPC 均保留原限制。
- 候选真实 World **24/24，16,730 帧**通过，脚地差峰值 **0.24437 m**，按用户新规则停止精修。保和 16 条结果与原基线逐条完全相同，脚地差全为 0；3 个阻挡负例、5 个身体/头部探针通过。
- 33/33 相关组件通过（新接触 9、原午门下降 4、B 现有定向 20）。没有宣称整个历史套件转绿；既有缺史/旧合同失败不伪造、不趁机修。

## 11 项不漏账

| 原 ID | 对象 | 当前范围结论 | 待验/限制 |
|---|---|---|---|
| FC-B3B12CF397 | 太和门 | **基线缺陷；修复候选通过**：两侧南阶→厅→北阶完整往返，10/60 Hz 走跑 8 条；两狮当前近图检查完成 | 必须集成共享 hook 后才算安装；整门 GPU/用户待验 |
| FC-A478209231 | 太和殿 | **待验（保留既有主体）**：专属殿体/外形及原组件证据保全，本次未重建 | 当前整殿全部路线/实机未重测，不冒充新增验收 |
| FC-5FAA15AE5C | 中和殿 | **待验（保留既有主体）**：独立方殿/四廊保全 | 当前整殿/实机未重测 |
| FC-58A3300503 | 保和殿 | **待验（保留既有殿体）**：相邻西台/墙接口已通过；不是把墙门测试当殿内全部通行 | 殿内全部路线/实机待验 |
| FC-8C6502DA44 | 体仁阁 | **待验（保留既有主体）**：独立两层与既有前廊组件证据保全 | 本次未重测全阁路线/实机 |
| FC-A43B1DAB0B | 弘义阁 | **待验（保留既有主体）**：自身窗扇/两层形制保全，不强镜像 | 本次未重测全阁路线；旧三角面阈值不当新缺陷 |
| FC-35BF29ABCB | 三台 | **通过（本轮西台关键范围）**：保和西侧三层可见台与真实支撑、旧内栏移除、新外栏保留 | 不是三台所有阶梯重新全验；GPU/用户待验 |
| FC-1ABC6622CB | 太和殿两侧阶梯封火墙 | **待验（保留完整既有墙对）**：原 13/13 墙对组件证据保全 | 当前两墙全部 World 路线/实机未重新测 |
| FC-526ABE19BB | 保和殿两侧阶梯封火墙 | **通过（主要门口/接墙）**：东西门 8 条实际往返、两侧墙实挡、净空通过 | 西墙原局部 CPU 图仍匹配未变源码；实机待验 |
| FC-0D3F161564 | 保和殿东联庑 | **通过（可玩前廊）**：x−102.37，z0↔115 的 4 条实际往返；灰石券口/覆盖廊主要形制 | 后房关闭；非现状房间详测；实机待验 |
| FC-86FF7FC2AB | 保和殿西联庑 | **通过（可玩前廊）**：x106.6，z0↔115 的 4 条实际往返 | 西翼逐券实测/独立近图未齐，工程近似明示；实机待验 |

现有 30 项 ZIP 仍是旧运行版本，**不包含此接触修复**。表中的“候选通过”不能替代安装/发布确认，也不能将 6 个保留项说成新完成了整体验收。

## 唯一集成交付

1. 接收本提交的新模块与两份测试/本目录。
2. 由集成负责人将 `SHARED-HOOKS.patch` 应用到 `src/scene/PalaceBuilder.js` 与 `src/utils/Collision.js`。仅 2 文件、6 加行/2 替换行；不要动 main。
3. 这两处共享源码在工作者提交中保持原样，不能只取新模块而遗漏 hook。
4. 集成后串行运行下面命令，记录实际集成 SHA。再由集成者 build/更新体验包与状态；本工作者未发布或重打包。

```sh
node --max-old-space-size=768 --test --test-concurrency=1 \
  tests/photo-fidelity/batches/taihemen-stair-contact.test.mjs \
  tests/photo-fidelity/batches/wumen-practical-descent.test.mjs \
  tests/photo-fidelity/batches/taihemen-bronze-lions.test.mjs \
  tests/photo-fidelity/batches/baohe-west-practical.test.mjs \
  tests/photo-fidelity/batches/baohe-linked-galleries.test.mjs \
  tests/photo-fidelity/batches/halls-practical-integration.test.mjs \
  tests/photo-fidelity/batches/baohe-adjoining-wall-height.test.mjs
EVIDENCE_OUT=/tmp/b-integrated-world.json \
  node --expose-gc --max-old-space-size=1024 --test --test-concurrency=1 \
  tests/photo-fidelity/batches/halls-practical-current-entry-world.test.mjs
```

两狮新 CPU 近图在外部证据目录 `lions-current/`，已目视确认球/幼狮位于内侧。保和西墙门与联庑旧 CPU 图重新查看；相关 4 个模块与原 B 交付逐字相同。所有这些是 CPU 几何诊断，不是纹理、运行灯光、GPU 或用户设备截图。没有主张“外观 95%”已被量化验证。
