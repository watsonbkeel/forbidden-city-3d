# R109 两个正常地面阶口完整身体合同

批准范围为正常主游线通行。此实现只修实际已复现的承乾正殿南中央阶口、景福后侧阶口；不改全园 STEP_CLEARANCE、身体 .5 方足/1.7 高、步高、其他宫殿或造型。基底 R108 4cd064b7，运行等 R107。

## 根因和来源
实际 10/30/60 往返均能到达，却分别产生承乾 3/11/23、景福 4/12/24 帧平台正交叠。旧 CM 以中心 ramp 高度及 feet+.35 判体，FP 再平滑真实 feet，两个独立机制共同让完整身体先进入台基。直接同步 valid.y 不足。
两个原登记矩形 z-ramp 是既有工程支持，不是新增隐形板；承乾登记顶 z373.75 与实体前 z373.8 有 .05m 继承差，不称逐阶 mesh 精确。两域实际没有 triangle/overhead/roof/taper。

## 最小接口
- `StairInterfaces.js` 只对 east-six 承乾正殿、ningshou 景福宫匹配原 ramp 和现有平台普通盒，在盒上登记 `kind=stair-interface`、两个稳定 ID；所有选择先验证再写。无新 collider/walkable。
- 域 X 取实际平台全宽加两侧 .8m，Z 仅取真实 ramp 前后 .8m 短带工程交接余量（窄 ramp 域横向出域再松键会触发旧支持掉脚，RED 已保留）；完整方足沿段是否相交沿用已验二维 dispatch。来源与 ramp 数据绑实际平台 owner，卸载/缓存/held clone 同世代。
- 原矩形 ramp 的方足交集最高高度为支持 witness，和真实普通盒顶取最高；maxTop 不能截斜面造低假支持，blockedPose 不删除物理 floor。
- 局部复用 R96/R104 静态普通盒+动态 capsule 完整身体扫掠，站立上行每个子段升→移→落分别检验；原地低梁、薄柱、NPC均实挡。非 airborne 才可 step；任何 floor 支持不等于 poseClear。
- 原登记 ramp 仅作为既有单向工程脚底支持（不是封闭斜坡体/真实 roof）；同 XZ 重力下降先碰到最高支持才落稳，上跳不伪落地。空中横向上坡不能从面上方跨到面下方：按足印边事件分段解析单向 feet 穿面，不把原工程面变成头顶/侧壁或封闭实体。侧边离开继续真实 gravity，不瞬间向上 rescue。
- Yangxin/Xiqing/Duixiu 原算法行为、域外逐输入保持；不把新 ramp 套进其他域，也不泛化 tapered/triangle。

## 必要门
原两条正常往返 10/30/60 完整 body 平台无正交叠；后殿及原保护路线保留。低梁 lift、薄柱 translate、动态 NPC、airborne 不抬脚、ramp 末端平台优先、侧边/domain ±.5 crossing、源更新/卸载/held clone。真实画面 geometry/index/normal/material/map/rooms 原样，metadata 仅新增 dispatch。局部及域外实际 CPU 成本记录；GPU/实机未验不报通过。16:35 争取功能冻结，若需全局 solver/未知曲面立即报告，不扩大。
