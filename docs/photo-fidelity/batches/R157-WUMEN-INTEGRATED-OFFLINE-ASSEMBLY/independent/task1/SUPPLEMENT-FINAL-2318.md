# 补审终态：午门装配 Task1，2317 冻结

## 结论

**此前3项数值 P1 已在纯合同层关闭，随后补齐8个非柱 reference 清单，并澄清闭亭探针的单向阻挡规则。本 Task1 可作为父明确批准后的离线实体 TDD 输入；不等于实体、接缝、物理、FP、World 或生产通过。**

本补审承接原 `REVIEW-2304.md`（SHA `6c590c14a1cb9b5f1e22f0dcbd39d607da9bd21178894a19d3a655a0ffaae9e9`）；不覆盖原冻结/红/绿和当时未放行结论。当前门内未见未关闭 P0/P1；跨到后续实体阶段的必要门仍全部保留。

## 输入及实际结果

HEAD仍 `5610acf44554d3b2a83cd89f33df8782810cd6d4`。最终 `freeze/source/qa-2317.json`：3输入/600源/4426 QA 全部逐 SHA 匹配。600 源保持 HEAD 原字节；QA集合与2304相同，仅本轮3新增路径合法更新，既有4423项逐字未变。旧黄金、runtime入口未改。

最终 SHA：
- assembly-contract.json：`24cba162d28a8bbca9aa5308594ef937e00a51eef1b5099f43285b8022e21ca5`
- assembly-contract.mjs：`96b58fd6a7bb4628a0cc0e3dfd4e5b4ad150c30b91bdf7368af7fea6053b7d43`
- assembly-contract.test.mjs：`ffb9ff3c340f30a843edff20fc246c66155f2800097d41e52b973a9787afd11d`

独立运行分轮保留：2314版15/15，2316版16/16，最终2317版 **17/17，exit0，TAP约248ms**。本轮没有运行实体捕获、CPU、FP 或 World。

作者终态 `final-22.tap/resource/exit` 已只读核实：**新17 + 原 upper-contract5 =22/22**，无skip/cancel，TAP358.287ms、resource elapsed0.416641s。不是22个新测试；没有把原65项或完整回归偷算为本轮重跑。

真实 RED 分开记录：
- 2312的14项中10绿4红：#11缺expectedOwner；#12缺roofMapping引发TypeError；#13南亭初始body侵翼是真数值断言；#14neck假高是真数值断言。不得把四个都叫几何计算红，也不是加载错误。
- 2315 marker清单缺失，15/16红→补清单。
- 2317执行规则缺失，16/17红→明确通行/阻挡不同规则。

读取闭包的实现自2304只改固定JSON SHA一行，认证逻辑未弱化。2304私人复制树的源漂移/增/缺/软链实拒证据仍绑定其当时SHA，不冒称在最终SHA再次执行；最终正例读核全部600源及10个固定依赖。

## 关闭项

### 1. 真实解析 neck 起步，而非把斜面当12.3平台

两侧路线现在都明确三个 waypoint：
1. neck 中点（东X=-62.44221854304636，西X=62.475331125827815），按各自原始 slope 函数计算 Y=`12.100000000000001`；
2. 对应 receiver reference window 中心，Y=12.3；
3. 向内0.4m的真实拟U平台点，X=±60.61837748344371，Y=12.3。

`receiverWindowIsNotPhysicalSeam:true`，末点权限不是新造receiver盒。独立核解析域与半径.5完整 waypoint 足迹：坡点在自身rect内，平点在U域且不进入任何recess；保持 authored analytic / actual faces 两阶段区分。当前测试不是全路径扫掠，也没有证明真实已量化平台、栏、柱或provider可支持这些点。

### 2. 南亭从真正外侧起步并锁预期owner

两南亭起点Z改为 -94.25894039735098 / -94.39139072847682，不再处于邻翼外0.2m的侵入状态。独立按六闭实体旋转后矩形复算，四亭probe起点的半径.5保守body净距均约0.9m；两坡起步对六闭体净距>2.2m。这里的六实体不包含所有柱、栏、梁、旧主楼，是明确有限检查。

四条probe逐一锁目标亭ID，其他owner不得充成功。**起点安全仍须实际实体阶段全对象再验。**

### 3. 横连参数映射唯一，旧grid和派生delta已固定

两侧分别锁 exact-knot piecewise-linear 的 absX/Z 对，保各页独立端点；独立检查两侧knot严格单调且值恰由新post坐标和原米制offset派生。各84条（2层×6X×7Z）旧grid样本完整、唯一，无重复或漏点；每点旧参数Y保留、X/Z新映射、UV新X/3和Z/3、normal由实际Float32面重算。

声明保原6×7 grid、原top/bottom/side index顺序，不额外插mapping knot。未采样处以实际三角插值为准，不能把连续映射的knot当实际采样边/真实承托；实际构造和法向/UV/正面积尚未执行。梁跨度延长.45/.38、截面/高程固定。原工程3.5:4:3.5分配仍不是图上约1:2:1的逐柱测绘；此来源边界未改变。

### 4. 8个未知接口明确是reference，不是8根柱

新增8条唯一ID，每亭2条，位置由各页冻结bounds与wing-facing端派生；minX/maxX与原U反向关系独立核过，不把图页横向顺序误当世界X正向。每条明确：`isColumn:false`、`collider:false`、`walkable:false`、`identityAccepted:false`、`physicalShaftCount:null`，Y12.3只是工程标记datum。旧南排1px来源/拟合说明未改。

这关闭的是标记生成权限不明确，不是接口柱身份或数量的历史问题。104可辨轴/8未知区域/24工程横连柱仍分账，不能产生8个新增实体柱。

### 5. 闭亭阻挡与通行执行规则分开

补审发现并已关闭：原global双向/抵达阈值会让闭亭probe反向从实体内部起步，或要求抵达不该进入的内部点。最终：
- 4闭亭 `EXPECTED_BLOCK`，reverse=false、arrival=false，distance/time=null；end仅为内部方向参考，不是到达点/反向起点。必须指定owner首次接触且不得进入，其他owner不能替代。
- 3通行路线才双向、≤.12m终点、实际零速/运动速及timestamp跨度≥1秒。

这是驱动实现前的权限合同，尚无任何该驱动结果。

## 保留的后续门与实施边界

本次三轮后继的变化只涉及 links、routes/routePolicy、interfaceMarkers 及对应测试/SHA pin；逐角色、28角色Y/UV、坐标、452/16 live基线、主楼保全与资源所有权没有改写。原报告已证部分继续成立。

下一阶段如经父批准，可构造**一个完整隔离诊断候选**并TDD，不把各小件另算完成楼：A借用不变、B owned ledger；保主楼与五洞/门叶/装饰；完整104轴/8非柱标记/闭围护/28角色/屋面/两横连/U承台在同组；实际共享边/完整属性/生命周期、全对象身体/柱脚及指定邻接相交仍须验。

特别保留：
- authored waypoint矩形不是actual Float32连续支承证明；完整半径.5扫掠、栏、安全代理、全柱、速度/脚高及真实停稳必须在真实CM/FP中再验。
- 两北亭整盒、14横连registered行与HallKit局部描述仍不同；新南亭/翼/单柱物理是显式新增，不能以局部描述冒充旧live行。
- 不复用14-owner rig身份、不把receiver窗造支承、不把fan当floor、不为穿过闭亭开假门。
- 3m历史截高、34正微缺/20阈值、330边舍入、历史缺对象10红/38未执行与世界锚点迁移均未关闭。
- 真实TextureLibrary/finish、World、完整回归/build/GPU、生产安装全部未知；当前只读工具和数值测试不能授权它们。

本目录新增原件：`current-15-2314.*`、`current-16-2316.*`、`current-17-2317.*`、`supplement-2314-audit.json`、`supplement-2316-audit.json`、`supplement-final-2317-audit.json`。终态轻测已结束，释放窗口；不要求为本报告重跑World或新增自引用索引。
