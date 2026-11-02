# R159 宝蕴楼室外踏步与门廊可达累计

父为完整回读的首批R159 `2cba83db`（本地203a1350），本轮运行 `c198a1d9`。四狮/坤宁七兽、原R158累计及正式R159玩家版本标识均保留；不改main/旧分支/Pages，不把本局部当49项验收完成。

## 实际修复
原6个可见阶深.32m，仅有覆盖整阶的1.2m满高collider且没有可行走顶，真实go后的两条外阶路线均卡住。仅本室外阶改为6个.52m深的真实可见踏体及匹配box，保每级.2m高；加6阶顶和原平台顶共7个真实box面、rescue:false。末端保持world−213.27，和原平台重叠.13；新趾−216.39，距既有横路z−217为.61m，半径.5后余.11。尺寸是游戏拟合，不是官图测绘。

私有7面身份、原mesh顶点/pose和owner存活校验、连续grounded及完整脚印/限速，再用原raw连续体扫；只在原有地0的限定连续交接，不首次捕获跳跃/高落、侧出/平台下或伪造面。B只有前缀dispatch与owner保留，inclusive `function toeRect(r)`至EOF和原Collision/FirstPerson逐字同。没有虚坡、全局吸地、旧证书改造或室内开放。

正常ZoneBase在四狮后恰一次finalizer；4狮owner、7新原顶硬锁。原建筑`enter:false`/CLOSED_UNMODELED、门/地图/房间不改，玩家仅到室外门廊后返回，不称进入宝蕴内部。

## 真实验证
- 普通整outer-west构建先0面≠7真实RED；正常接线后21定向/旧B/原四狮与普通整区检查+正常World1=22/22，0skip。
- 最终正常actual Teleport.go→同一controls沿原8路点上外阶/门廊再返回，10Hz走/60Hz跑2/452全到，阶区z≥−217.6脚差峰0。旧门前横线2/133完整数组同作者。rows/cross/stairPeak/loaded/summary/entranceOwners全部结果逐对象同作者。累计显式使用main的reuseInactive:true，不注入生产源码/不手动finalizer；JSON加载适配只补import属性。
- 单殿四组合273帧峰.049319，薄Box/动态体、跳跃/高落/侧出/缺重改复制负控；实际stationary jump/4m高落各100帧启禁认证轨迹同。旧B9/9，原四狮2项及正常门前133帧也保留。
- 673模块clean `/gugong/` 构建，verifyBuildSource绑定R159-3e087f29c362/source f1e4268a…5be7及clean c198a1d9，HTML/JS/metadata一致。无GPU/手机/真实Mac热功耗/全宫验收，无新ZIP/部署。

## 失败与范围不能省略
原.32阶的支承补齐方案仍卡；.52未认证时能通但下阶峰.888真红；完整脚印遇Float32细缝的原红也保留，最后只焊接这6新阶可见/碰撞的共同Float32边界而非放宽全局容差。作者跳跃fixture首次缺exitPointerLock的QA红保留。

全程**仍有远处既有.4472778m落差**（10Hz亦有.352），发生z约−235.6的原.45→0地面交接，距本阶约19m；初始go位置/原路线没有改，因此不称全程≤.3。坤宁门原.875/46帧、文渊.391及文华.444/9帧也留账。

作者world为末端QA注入；本批另存normal副本，去生产注入、改base/output及teleport helper的3个绝对导入为累计相对路径，所有原运动/断言保留，并增加4狮/7顶硬锁及main缓存选项。轻测副本仅重定向本地输出。作者原件未覆；复跑上批normal四狮脚本时默认路径确定性重写了**自己的上批**raw，已核与原pin长度/SHA完全一致并复制到本批，不冒称新路径首次生成。

/tmp原件非持久远端内容；自制两CPU仅几何平色，非完整纹理/GPU。SHA及脚本绑定见EVIDENCE。可回滚上一R159分支dev/r159-baoyun-kunning-203a1350-20261102及2cba83db；本批是原49项范围中的局部通行修复，未清零任何旧待核项。
