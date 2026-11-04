# 履顺门主体有限拟合

基线 bec6648db9702ff60332943a205bb2c818bc7277。运行只新增 LushunGate 与 ZoneBase 一次精确挂接，保留数据、通用门体/物理与整条西墙。

官源为[故宫官网《乾隆太上皇宫宁寿宫营建考》](https://www.dpm.org.cn/Uploads/File/2019/12/15/u5df60cf540978.pdf)，印刷125页确认西向；128页历史营建描述支持青白石须弥座、琉璃花枋/垂柱/斗科及黄色琉璃瓦。该页两张照片是畅音阁、佛日楼，不是履顺门。来源不能证明当前完整立面。

本轮为五层浅石轮廓、朴素门垛/横枋和支承层、黄瓦低檐及全开游戏门的有限拟合。层数/尺寸、黄瓦之外的颜色、无雕花构件、屋顶轮廓/隐藏背面及开门姿态均未测绘。未复原原匾/满文/精雕或逐朵斗栱；存疑图库不作为形制依据，也不导入照片/衍生纹理。正式地图名保留。

## 可重复检查
- node --test --test-concurrency=1 tests/r164-lushun-single-gate/{identity,component,controller,lifecycle,atlas-retention,source-boundary,teleport}.test.mjs
- LUSHUN_EVIDENCE_DIR=/existing/evidence/dir node --test tests/r164-lushun-single-gate/production-zone.test.mjs

冻结 ZoneBase.bec.js 与真实基线逐字节相同，不以当下源码充当旧版本。baseline.json 是本轮前先构建冻结版本的非目标实际宁寿摘要，排除仅履顺门，不排整墙或邻门。

真实控制器48条走跑/斜行与旧门逐帧一致；32阻挡和12正常跳跃。移除15条真实侧垛接触使阻挡负控到达，证明非空断言。真实 Teleport.resolveLanding 的全部落点字段等旧：(-224,0,255)，walk=5且无fallback；不是完整go/UI验收。

实际宁寿串行检查新门及累积南北26排、敛禧保泰、蹈和/锡庆外侧16连接、贞顺井北/倦勤连接、庆寿/寻沿及颐和景祺等。几何/碰撞/屋顶旧物摘要不依赖只看名字。

资源失败涵盖已填充首几何、末接触变换及第三私材赋值，失败本体必须释放，宿主不变且可重试；合批前后实体首击、闭合无退化面、真实借用纹理不释放也受检。未做完整World、浏览器/GPU、手机/Mac温度或Node20验收。

## 红绿记录
最初身份用例在原通用门上以objectId缺失失败。集成时严格源守卫又暴露新代码误沿用蹈和的x=-233.5，而旧履顺实际为-233.4；已按原数据修正新守卫、期望和高墙背带位置，未挪原门/墙，也未放宽认证。原红日志保留在本轮外部证据目录。
