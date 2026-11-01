# 午门隔离接触试架独立轻审

2026-10-31 17:05 UTC。分轮核 `contact-freeze-1655.json` 与 `contact-freeze-1701.json`，各实际 **7 路径**：3 mjs、1 来源 JSON、3 test。此前“8文件”为口误，不是漏文件。原生产592项的实际集合及逐文件字节均等于48a，没有World、CPU或共享控制器修改。

## 决定

**固定几何试架可用于诊断，但实际控制器门已经出现 P1，不能接受路线。** 1655轮独立20/20；1701轮针对Float32问题补强后独立22/22（profile8 + primitive10 + contact4，exit0、无跳过/取消）。作者随后真实16组合只得到9绿7红；7项上坡raw身体碰撞，9绿也只断言身体/到达而未锁全部脚面安全。允许诊断从未等于完整马道、北亭入口、台基或南墙接受。

两块 `CONTACT_TEST_BLOCK_NOT_CERTIFIED_PAVILION_ENTRY` 是真实接触试块，不是建筑证据。`routeAcceptance=false/runtimeInstalled=false` 必须保留。两侧分带和0/3.3/10/11.9/12.3高程仍是明确工程试验；此前来源同尺/同层及末颈身份 P1 未关闭。

## 独立几何复核

另直接读取固定14件实际 Float32 mesh，而非仅看walkable字段：

- 14件全部具有正体积、非退化三角、每无向边恰出现两次；position/normal/UV数值有限。
- 544个普通 body collider 都包含在各自作者楔体 footprint 内；竖向保守亏空最大不超过0.1m。它们不是精确三角体。
- 12条接缝各以实际顶面三角求交5点，量化两侧实际顶面高度差均小于1e−10m。源码边界相等之外，Float32显示面也没有本轮可见间隙。
- 本固定试架最大XYZ表示误差约2.52e−6m，顶面平面残差约1.32e−6m；不称误差为零。
- 删除east neck的原单测只证明中点地面查询失去高位支承；尚不是删除实体后整段真实控制器必然失败的证明，下一诊断须补实际负控。

上述额外数值检查单列于 `geometry-audit.json`，不加进原20项分母。早一版只比作者边端Float32值的检查另存 `geometry-audit-authored-endpoints.json`，终版才是实际三角求交。

## P2 反例及1701修复复验

1655版本 `ramp-solid.mjs` 验证 JavaScript Number 有限，但未验证转换后的Float32可表示性/几何不塌缩，独立反例：

1. x=[100000000,100000001]、其余普通参数，会被接受，却在Float32压扁6个三角，最大位置误差1m。
2. z≈1e40的有限区间也被接受，输出36个非有限position分量、全部12三角无有效面积，报告误差Infinity。

这两个参数不在固定rig范围，因此当时未阻止仅该rig诊断。作者随后保RED补Float32端点有限/次序检查，以及转换后真实三角检查和失败dispose。1701轮我独跑22/22，原两反例均被明确拒绝；tiny-face资源清理测试也过。固定14件及12缝的额外几何指标逐项等于先前轮。**此P2按1701修订关闭**，不掩盖此前反例或控制器新红。独审未修改仓库源码。

## 代理与后续诊断边界

当前真实支承是连续可见坡面与同一作者height函数的ramp provider，不是台阶数量或精确逐三角碰撞。普通body查询保留脚面以上0.35m clearance，再加内部切片亏空，因此不能用 `checkCollision=false` 宣称全脚至头部无可见几何侵入。应把这种游戏碰撞政策与建筑实体分开表述。

下一仅rig诊断应使用真实构造/销毁的FirstPerson、未经修改的raw CollisionManager：两侧、双向、10/60Hz走跑，过全部转角和12条接口；记录逐帧脚高、原始支承来源、意外离地/坠落与碰撞。删除一块landing/neck、断开共享边、关闭短颈后，对应支承/路线必须失败，不能只看终点到达（角色可能坠落后又抵达）。不加rescue/隐形floor、不改时钟或共享半径。

接触rig当前在本地坐标生成，不能把局部测试改名为已验world−379.566。未来放到真实台/亭/墙时还需对mesh、collider、walkable应用同一声明变换一次；profile正确space标签只防误读，不代替实例转换验证。

本rig采用独立硬编码分带作实验，而未从完整已审几何fit contract生成整个建筑。诊断成功也不能跳过真实接收台体、亭围护/门口、南墙、扶栏/台缘、五门和非目标保全门禁。不得把试块留下冒充已解决的最终入口。

## 真实控制器新红及独立离线定位

作者 `contact-controller/probe-1701` 共16组合、9过7红、0跳过/取消，全部到达。7红上坡共382个raw身体碰撞帧。独立读取原完整frames，用同样真实CM和同位置再次查询，382/382复现；仅将**诊断查询**脚高替为该XZ的作者坡面高度后，382/382清除。`frame-audit.json` 明确是离线反事实定位，不是移动控制器、修复或通过重跑。

首红owner均outward段。源码FirstPerson先接受追踪地面移动，再以exp(-14dt)平滑脚高；本短陡试段中，滞后的feet与上坡邻接普通盒组合触发raw碰撞。不能通过降低盒顶、改时钟/平滑或删断言掩盖。现下坡还记录脚面误差最高约2.1524m与多帧无provider；其归因及安全界限未完成，原9绿没有断言它们。下一轮须让这些安全条件成为显式门，而非只验到达。

现StairInterfaces路径严格锁白名单owner且只接受z轴源ramp，不能给本rig冒用其他宫殿ID或直接套x段。若需要新局部provider，须另审真实owner/可见面/height函数与转换认证、限定区域外旧行为，并由父确认共享接入范围；本报告不批准修改共享Collision/FirstPerson，也不认证拟议适配。

## 证据

`independent-wumen-contact-rig-1658/`：`light-20.tap/.exit`、`light-22-1704.tap/.exit`、只读检查脚本`inspect.mjs`、`geometry-audit-1655.json`、更新后`geometry-audit.json`与各log/exit、`final-input-check.json`。1655开始检查7项等原SHA；结束检查检测到primitive/test两项已改（原JSON保留false），并据作者新1701冻结重新验证7项全等，未混写两轮身份；源592项逐字48a。没有生产接受、发布、整项完成或GPU通过结论。
