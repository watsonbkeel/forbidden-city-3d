# 蹈和门单洞主体一期

基线 72f50a05b012fc36ba08ffc3193ae73f71d6c6ad。官文确认宁寿宫西墙的琉璃门身份；摄影师 tsihua 具名原作预览及可读门名提供正面形制参考，非官方照片且不作为项目图片/纹理。来源见本轮 SOURCE-MANIFEST.json。

现有坐标、朝西、3.6m净口、6.4m墙口与地图名/范围保留。只替换通用门体为三段石脚、红黄框门垛、两道绿横枋和低檐门罩。前后净通道保留，两个全开门叶在洞外。颜色、尺度、石座分段、完整顶型、隐藏背面和开门姿态属于拟合；原满文/书法、精雕、门钉和现时管理状态未复原，不称整门验收。

## 可复跑入口
- `node --test --test-concurrency=1 tests/r164-daohe-single-gate/{component,controller,lifecycle,atlas-retention,source-boundary,teleport}.test.mjs`
- `DAOHE_EVIDENCE_DIR=<existing-output-directory> node --test tests/r164-daohe-single-gate/production-zone.test.mjs`
- `node tests/r164-daohe-single-gate/preview.mjs <output.png>`：隔离门体CPU平涂投影，不是浏览器、材质贴图、照明或GPU验收。

轻量包括：精确身份/朝向、原铺地顶点法线UV与地图、来源漂移拒绝、原始及实际合批首击、闭合实体接触、分配到一半的故障清理和显式重试、6块其它门匾文字到UV格的绑定（不是字形实测）。48条轴向/斜向走跑在新旧实际控制器逐帧相等，32阻挡负例及12跳跃通过；移除13条真实门垛接触可使阻挡控制失败，未删除产品碰撞。

生产入口构建真实宁寿单区，冻结72f所有非目标网格/材质/碰撞/行走面/地图/区域/屋顶摘要。原西墙全体在非目标保护内；继承贞顺门/井北/倦勤斋、南北26排、敛禧保泰、宁寿侧阶、颐和景祺连接、庆寿高甬道及其他累计路线，不运行完整World。

公开 Teleport.resolveLanding 使用真实区域碰撞与地图，原落点(-224.1,0,304.3)、fallback=false保持；不将resolveLanding与局部控制器说成完整UI传送go验收。

## 红绿与限制
专用身份初次红测命中旧通用模型没有objectId，再绿。旧源边界/匾额历史测试初次因新增两行/移除蹈和通用匾失败，只按唯一增量归一化并保持其余旧断言；分支切换使旧docs稀疏缺失，已从72f原git对象恢复，非产品修复。

不涉及main/部署、JSON区位、公共物理/渲染。未验World、浏览器/GPU/手机、Node20CI或Mac温度；原景祺门楣跳跃穿头界限未改。资料和代码绑定均不是397项完成率。
