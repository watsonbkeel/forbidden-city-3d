# 万春亭续做

## 当前工作
工作目录`ningshou-entry-safe-8311`；分支`feat/wanchun-interior-safe-20261030`；安全父`ee0f31e1583ebe16dfc743f37cca0ecd6be42327`（生产源为e819）。远端裁剪候选20e3e3e未改，main/Pages未改。只显式提交本目录文档、Wanchun模块/挂钩和本次测试/脚本，不提交任何原始reports。

已实现四向内围护60个原模型朝内面的材料/UV分区；几何总面并集和物理全量不变。定向10/10及原真实全园四向路线14/14通过。源图见SOURCES.md，完整新旧CPU四向图仅私存`../wanchun-20261030-evidence/`，不是浏览器验收。最终结果见RESULT.md：完整父/候选各1331项1113过218失败，失败序列一致；三基址编译、整园源面/物理/树逐哈希保留及最终CPU指纹一致均已核。源码checkpoint与外置回执映射见`../wanchun-20261030-evidence/CHECKPOINT.json`。

## 已完成检查及复现命令
- 父本当前套：`WANCHUN_RUN=parent NODE_OPTIONS='--import ./scripts/major-pilots/wanchun/parent-retained-source.mjs --import ./scripts/major-pilots/wanchun/preserve-shared-reports.mjs' node --test --test-reporter=tap --test-concurrency=1 tests/current-state/*.test.mjs`
- 候选当前套：`WANCHUN_RUN=candidate node --import ./scripts/major-pilots/wanchun/preserve-shared-reports.mjs --test --test-reporter=tap --test-concurrency=1 tests/current-state/*.test.mjs`
- 两者串行；原始stdout在上述外置证据目录`current-state-{parent,candidate}-actual.tap`。没有通过删失败项、重写旧夹具或扩大容差达绿。
- 已运行`node scripts/major-pilots/wanchun/whole-garden-contract.mjs`、`node scripts/major-pilots/wanchun/compile-memory.mjs`，最终CPU候选固定相机重导出并与三编译同指纹；本地checkpoint只含源码、测试、复用脚本和简要文档。

## 已发现与修正
- `applyBoxUV`原Box为非索引几何，初实现误设必有index；已按真实源面顺序分区。
- 正式GardenBuilder先在临时`garden_static`上构建，再合批；最初根验证错误只认builder.group。显式传入既有构建root并严格验证，增加真实合批metadata测试。
- 独审发现areaId误指109（千秋），现更正108；第二次clone抛错的早期分配泄漏以注入红测复现并修正；drawRange/morph异常也红→绿。
- 一次父本临时导出因已提交reports含大冻结包填满磁盘，0项测试**不计结果**。本轮新建的不完整临时副本已移除，旧WIP/源码/原始证据未清理。后续不复制大目录；清理须遵守用户低于500MB且仅R88以前可恢复旧副本/图片的限制，不自行扩大。

## 下一项明确动作及完整剩余范围
同一万春亭的深藻井仍未实现。先将源码`central-lower-tiles/underside`、四组`hipped-annex-tiles/underside`向心舌片、`core-ceiling`、`upper-clerestory-drum`与1280实图作穿插剖面；外8角、内12采光窗、20径向板已核，但不是实测尺寸。独立后续射线发现四抱厦坡舌也伸入拟定井腔，不能只裁central屋面；须逐组求真实三角交集。现模型上盖底在r=0/1/1.85/2.05约为y=7.98/7.154/6.50/6.383，仅是现模型空间上界，不是真实尺寸。需要限定中央及抱厦隐藏源面与外鼓/内井关系，不能删平顶后套假洞，也不能照内12窗擅改外鼓16窗。待这项结构方案闭合才做新几何与真实源面安全门，不靠平移亭、邻树或修改通行半径消除冲突。
四抱厦完整天花、外门层完整独立证据、真实细棂/精雕/彩画、台基/栏杆/屋面细节及实机/GPU均未完成。千秋亭保持独立对象，不从万春复制。全量范围继续`docs/photo-fidelity/MASTER-PROMPT.md`（既有397必需对象与7展开组分母不变）；本次不提升对象内外accepted。

## 其他WIP
原六份脏报告、`.superpowers/`、chizao/weiyu/yikun-screen文档/脚本/报告及全部其他分支均保留。未整合古华dcf520fb、绛雪轩或三友轩未验候选；不要对当前工作区reset/clean。
