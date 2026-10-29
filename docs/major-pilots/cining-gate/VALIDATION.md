# 慈宁门门厅闭环验收（CPU 已完成；GPU 未验）
父版本 `c37e72466a2570bf99e54d68fc416d4a30d44c9f`。官方文字/实际查看照片见 RECON；实现关系及明确拟合见 DESIGN。此处“门厅闭环”不是慈宁门所有历史附属物已经复原。

## 范围与保留
五湾公共前廊、三处后内柱开门、两梢后墙/各四前窗、梁枋简化彩面、三组前阶与断开石栏。原三通道中心/门洞至少4.06m净宽（新增前阶宽3.6m，并非全路线4.06m）、25.3m院墙切口、屋顶、18柱、台基/铺面、山墙/侧后梁及四面院墙保留。新增后内柱坐标/非均匀三进深、阶数和高度均为兼容模型拟合，不冒称测绘；门按通行开启，与主图闭门不同。程序纹样、中文识别牌非精雕/满蒙篆书复刻。

严格域 x207.8..236.6,z149.2..161.3，以真实最低中阶锚定；补充楼地面见证仅来自 live 原 floor/真实 Environment 地面；新真实阶/栏等实体亦可提供源面支持，八个曲面源身份固定。新增闭合盒源实际登记碰撞；旧台基形状不变，仅补其源实体碰撞。共享 sweep/SAT/tolerance 不变。相邻非目标全区渲染/完整碰撞元数据/nav等须与真实父版本相同。

## 已留证
- `shared-final.tap`: 完整共享组161/161，307.07s，无跳过/取消；不是单项重跑冒充整组。
- `retention-final.tap`: 审查建议强化院墙坐标/关联/唯一数量后3/3；当前全区非目标源码/材质/完整碰撞元数据/nav等对真实父版本一致。
- `specialized-final.tap`: 慈宁门24 + 寿安26 + 慈荫26，共76/76，67.19s；无跳过/取消。独立复核后又增强精确院墙坐标/唯一关联断言，重跑结果另见上述 retention-final。
- `legacy-navigation-stairs.tap`: 完整原导航与慈荫梯 29/29（25.71s）。
- `world-motion-first.tap`: 三门 10/60Hz 走跑/跳/双向、前廊跨湾/北廊横移、两原导航路线及全高度域调查 4/4；最终组重跑覆盖最新台基登记。
- `plinth-kinematic-final.tap` 8/8；`fall-dynamic-final.tap` 5/5；`handoff-color-final.tap` 6/6；`closed-source-final.tap` 1/1。独立三角接触、闭合流形、八曲面双向无缺面、实际合并材质/深度次序、NPC站坐/移开、.3/.5 generic及四边界ULP/10/60Hz交接均覆盖。
- `zone-schema.log`: 7区，0错误/9既有边界警告。完整 geometry lint **未通过**：候选 `zone-lint.log` 与仅恢复真实父慈宁数据的 `zone-lint-baseline.log` 均在 reachFrom 报 `Unsupported furniture-domain shape`，并有旧门净空警告/错误；未为此放松共享算法，不宣称全区lint通过。
- 初始反例全部保留：geometry/source白名单、generic阶穿入、prune保护、台基kinematic卡住、落体fixture起态、历史寿安输入范围。测试迁移原因见 DESIGN；不改golden、不删旧断言。

## 成本与未验
`metrics.json`、可重跑 `scripts/major-pilots/cining-gate/metrics.mjs`：实际父门+全部四墙 vs 当前同范围，合并 mesh 13→18、三角2746→4936、geometry属性/索引字节263616→443184；collider31→111，walkable1→7。raw mesh83→181，raw bytes181156→327556。CPU规模证据不等于帧率；GPU视觉、FPS/显存和浏览器端未验，未生成大bundle或图片。

影壁/后转角庑房接口、后高甬道、瑞兽/龙凤御路细雕/满蒙篆书未闭，未用假墙或隐藏面补齐。原可见铺面 .46/步面 .45 差异保留；旧屋顶/柱全部精确碰撞未验，新增源oracle不能冒充旧区域全验收。慈荫原东梢北地面出口自堵、其他旧报告失败继续保留。

回滚：只回退本独立提交可恢复父版本慈宁门；不重置工作树，不碰main/推送，14原脏报告保持。源码hash见metrics。

独立只读审查完成，无新增实质阻断；两处文档歧义（门洞净宽 vs 前阶宽、实体支持 vs 补充楼地面见证）已澄清。11生产/脚本语法检查及源代码diff检查通过。
