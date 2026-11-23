# 故宫原清单：397 个独立记录

以 items/FC-*.json 作为此版可独立维护的核查表。manifest 按主台账的原编号排序。逐条连接三个不同来源：原始主台账的稳定 ID 与编号、固定提交的 MASTER-PROMPT 原文行、保存的 mapping-397.csv。后者是 2026-11-18 的映射候选表，不是建筑测绘或整项验收。source-mapping-397.csv 是原表逐字副本，不要把后续维护反写到原表。

- scopeOrigin 和 sourceLinks 分别定位原需求和身份/外观/室内参考资料。空链接数组表示该源格未给网址，不是该对象没有室内。图源没有在本轮重新浏览。
- modelCandidates 的工程坐标来自真实布局声明或分区 JSON；单位米，+Z 北、−X 东。范围不是建筑中心，nameMatch 为 false 表示旧指针现在指向异名或无名声明；即使为 true 也不是独立物理身份认证。
- referenceAnchor 是参考锚点字典的原记录，不是运行时测量。sourceMentions 为源文件的稳定 ID 字面命中（可能只是注释），directoryCandidates 为同名/正名信息卡。诸项不得相加计算“已建成”。
- confirmedPhysicalEntityId、confirmedWorldCoordinates 为 null 即尚无足够验证；三个 acceptance 字段各自独立，unverified 不等于未实施。当前只记录声明与来源，没有改动运行时场景。
- 实际维护请只改相应条目，保留稳定 ID，必要时附证据说明及固定版本；更换模型快照后须复核引用。没有取得一套历史的 397 个独立原文件；这里是从既有证据整理出的新维护结构。
