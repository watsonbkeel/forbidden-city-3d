# R157 实用整对象集中集成（A/B/D/E）

按用户“24小时37项、可见主体与通行优先，≤0.3m且不挡路不追修”的新标准集中交付。**不等于37/37用户验收，不是测绘或GPU通过。**

## 当前分层
- A 午门5原始条目：整组可见台/亭翼/横连/马道及南墙接口同步接入，主楼和五口保留。真实材质API命名错误已修。
- B 11条目：大殿/阁/太和阶梯墙原有主体保留，补保和西台/西墙、东西联庑前廊券门和太和门双铜狮；两狮高爪/球/幼狮朝中轴已修，碰撞未改变。
- D 10条目：中右门有21b0独立启动包；协熙和门四廊地坪/前廊/门台夹道/北廊河门空气墙已修，中左后左右现有主体保留并走通。
- E 2条目可见主体/通行证据：内金水中桥等级修正、五桥路线及武英三桥原有完整体系保全。半壁桥与三门外三桥仍有定位/实现缺口，不伪称已新做完。
- C 7条目未集成；其提交操作被工具拒绝，保冻结候选，等待明确处置，不绕过。

因此本次是**28条主体集成与游戏通行记录，2条E缺口，7条C待集成**，不是把旧严格源验收0/37篡改成37。canonical只对30个原始ID新增practicalDelivery20261101层；删该层可精确还原旧对象，旧accepted、scopeReview、sourceEvidence和所有其它对象不动。R58-A派生同步，aggregate不被拆成新增建筑。

## 实际验证
- 集中组件最终 **65/65**，包含真实TextureLibrary API及正常最终组装、各真实生产dispatcher、D低水/删支承拒绝、桥与中右门现态。
- **同一完整生产World 244/244路线到达，96,478帧**：D124、午门64、保和两墙门/两联庑16、内金水28、中右12。未注入安装器、替换rescue或更改控制器。测试仅输入方向/走跑/时间；不称精准停步或NPC/浏览器。
- 集成后的原武英World **42场景、6991帧、0违规**，含预期外向/沿水拒绝，不把所有场景叫“到达”。
- 第一合并World在1GB QA堆限制OOM；流式版152条后仍OOM。定位为已有Node mock调用历史restore后保留。复用现有bounded-qa-clock逐完成路线释放；最终仍1GB，33.60秒/RSS1,635,392KiB。原152条帧逐字等最终前152条，没有换物理/缩场景/弱化断言。
- A两西马道瞬时接触的原限制保留，不报零穿透；D中左旧.45m台沿自然下降不误称持续漂浮。所有早期真实红/环境失败保留。
- 午门上坡最大脚低于坡面约0.2866m，不等于双向全程高差≤0.3m：本轮实际冲刺下坡 feet−ground 最大东1.2805m/西1.18044m，>0.3m最长连续约0.583s；记录显示原控制器加速下落、最终落地并到达。按本轮标准不判通路阻断，但属于可见短暂腾空限制，不报贴地无误差。
- 三base `/`、`/forbidden-city-3d/`、`/gugong/` 正式构建及源码身份核验均 exit0，绑定 clean 源 `fbf06fcc`。根路径可启动 ZIP 21,283,555 B，143 entries/142 manifest文件逐SHA及CRC全过，真实本地服务器5路径HTTP200后正常终止；详见 `BUILD-DELIVERY.json`。这是服务器检查，不是浏览器/GPU执行。
- 下载包：`r157-practical-A-B-D-E-fbf06fcc.zip`；SHA256 `6c660e5b6dec4d46cfdf17250a8aad74738e147b3a49801c12a55157aee44e89`。完整解压后运行 `node start.mjs`，无须npm安装；旧21b0包保留。此后提交仅归档收据，不回写构建源码身份。

## 证据与复验
`evidence/world-frame-chunks/MANIFEST.json`按既有分块方式保完整15,152,024B原NDJSON。依清单顺序拼binary gzparts再gunzip，核raw SHA；本次已完整解码逐字验证。原OOM轮152条可由最终NDJSON前152行精确恢复，MEMORY-RECEIPT锁旧原SHA。测试原件不是新黄金。

```
EVIDENCE_OUT=/tmp/r157-integrated-world.json node --expose-gc --max-old-space-size=1024 --test --test-concurrency=1 tests/r157-integrated-practical-world.test.mjs
EVIDENCE_OUT=/tmp/r157-wuying.json node --max-old-space-size=1024 --test --test-concurrency=1 scripts/photo-fidelity/batches/r158-wuying-bridges/world-crown-recovery.test.mjs
```

图形限制：CPU图只说明实际几何/基色，不是贴图/光影GPU图；A早轮图不是最终材质/墙proxy绑定截图。实际浏览器环境不可达/Chromium socket权限失败已保留，未绕过。用户设备与地图点选落点仍需确认。精细装饰/历史隐藏室内/准确开叶角与测量未补造。

## 回滚
本次只在开发分支。运行几何可整体回到已交付21b0（中右门支持文件/可启动包仍在），或退回2cb累计基线。午门PalaceBuilder与Enclosure两个hook必须成对回滚，不可仅撤一个；B的真实台面/西墙/外墙端点和D高廊/河许可也成组回滚。main与Pages未在此步改动。

## 后继：午门下坡已有限修复
上文1.28m短暂腾空是保留的31d旧轮，不是最新包结果。`R157-WUMEN-DESCENT/HANDOFF.md`记录不改几何、仅4真实坡下降策略：累计17组件及244完整World硬断言通过，8下降组合最高0.287667m、>0.3帧为0。最新可启动包为`r157-practical-A-B-D-E-descent-2b7b47c8.zip`，三base构建/145manifest/HTTP均通过，准确SHA见该后继回执；本目录原BUILD-DELIVERY保旧轮不覆盖。原西上行3帧短超限仍披露，不称全部动作零误差。
