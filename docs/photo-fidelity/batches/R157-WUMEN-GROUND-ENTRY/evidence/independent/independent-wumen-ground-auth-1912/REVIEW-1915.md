# Task2 whole-ground认证及共用surface提取：有限独立审查

**结论：1908冻结的Task2认证前置有限通过，可进入另立冻结的Task3小步TDD。** 这不是地面入口路线通过；Motion尚未消费ground patch，生产World也未注册。未发现本轮新的P0或要求阻断该限定阶段的P1。

## 冻结身份

基准HEAD `3b2d95ae544d41d348a536a41a4f89026d62e24b`。`ground-entry-1904/task2/selected-freeze-1908.json` **38路径**逐SHA匹配；`source-freeze-1908.json` **600源**文件集合及每个SHA均完整匹配。

相对1900的598源，仅Contact变化；新增Ground和OrdinarySurface两模块。原Motion、Collision、Handoff、FirstPerson、14件rig及test-ground几何均保持原字节。Task3草案测试在38之外、尚未执行，不计此轮。

- Contact SHA：`4e3463cc6581691641551ca77208fd2e8711330dd0ff76e09f9c5d3545f0caa9`
- Ground SHA：`47ecf2ad0a26b3769504f3843cc72f59a5b0359d45eecbf694a678d7dc5662f9`
- OrdinarySurface SHA：`ef37d06720c73fc54beee1a79c26371d0d4ad924bab5fb5ad5413afea2bcd4b1`

本审未修改源/QA，未跑World/CPU/构建。独立产物：`independent-wumen-ground-auth-1912/`。

## 共用提取没有放宽旧ramp合同

独立文本比较确认：`materialRecord`、`permittedMaterial`、`plainRecord`、`ordinaryExecution`四函数逐字等提取前；普通Mesh/祖先/材质判断仅把错误标识`p.id`替为helper参数`name`，其余判断逐字一致。原ramp的geometry、walkable、body认证整个块逐字一致。

因此ground新增indexed Box路径没有使旧ramp允许index、不同drawRange或新的instance/shader通道。原ancestor引用、parent成员关系、geometry/material身份、材质状态、live row/tag及owner代际仍在各调用者保留。common helper本身只返回状态记录，不创建WeakMap登记或运动权限。

作者首轮提取漏掉`p.id`造成17/17 ReferenceError红，修为name后的17/17绿均保留；不拿加载/作用域错误充当物理负控。

## Whole-ground认证与权限隔离

- 正向源是独立构造的canonical BoxGeometry(220,.25,80)，整体下移.125；不是从传入live地面反录黄金。
- 对整个真实地面验证indexed attributes/数据类型/count/itemSize/normalized/gpuType/usage、上传回调、index、groups、drawRange、bbox及允许的canonical sphere；当前原factory的sphere=null也明确允许，不能说已有sphere实体身份锁定。
- 使用同一严格普通Mesh/祖先/可见性/材质模板，拒instance、shader、morph及普通几何通道漂移。地面材质与rig材质在正式负控中独立，避免改变地面时借旧rig断言假通过。
- 验证源collider/flat支承与实际geometry top一致，live body必须唯一、完整普通row；live flat box必须唯一、rescue=false且无隐藏额外语义字段。登记后复验原mesh/parent/geometry/material、source collider/walkable和live row/tag身份。
- 临时body index仍为每次新建的own-data-only索引，结束成员检查保留；没有新增跨调用缓存。
- `options`只允许明确`groundOwner`，假/空owner或未知键拒绝。无此option不会得到groundSourceID/groundPatchIDs；有option也仅发布两条固定、冻结的patch ID，而不是任意caller范围或整ground覆盖矩形。
- standalone ground validator返回普通验证记录，不独立写入私有binding；真正授权只能由Contact完成全套认证后发布。

独立正向快照确认认证前后CM普通体/支承的数值内容及逐row引用均不变；没有为两个patch添加代理或walkable。实验fixture仍是14件rig加真实ground，共15mesh、545collider、15walkable，不是原rig零物理增量。

## 测试及真实负控

本审独跑 **ground24 + owner12 + index5 = 41/41**，exit0，931.447459ms。

另8个独立ground定向探针均拒绝：normal数据改变、index.count=0、ground roughness改变、已登记祖先隐藏、从已登记parent脱离、body tag漂移、support tag漂移、source collider换成同bounds的clone。它们使用独立ground material，不靠旧ramp材料误捕获。

作者证据已读并复算分母：
- 初始共用材质版2/24绿、22红，原件保留；修为独立材质后真正ground-only **0/24→24/24**。
- local **145/145**，相对1900的119标题多重集精确新增26（ground-witness2 + ground-auth24）、移除0；不与独立41重复相加。
- 旧17项提取修正、owner-index getter/membership及之前的负控没有被删除或换成弱断言。

## Task2尚未做什么

独立查询真实north approach中心：无ground opt-in与有ground opt-in两种注册下，当前 `tryWumenJointGroundStep` 均返回 **OUTSIDE**。这正符合Task2只验证来源/登记metadata、未接Motion的边界；不能把groundPatchIDs存在称为已经从地面进入坡道。

后继Task3必须另测：固定opt-in域不得因删ground而缩为OUTSIDE/旧0，只有这两个qualified patch进入图，whole ground不能补高处缺neck/receiver。当前Task2的删除源会在直接live认证时拒绝，但**尚未证明每个地面位置的实际运动查询必然触发该认证**。

后继实际ground-entry16及停稳、缺ground/错owner/删neck真实路线、920 A/B和旧55回归均须在新冻结下执行。这里没有报告ground路线、World、真实门楼入口、full/batch/build或GPU通过。

## 分级与边界

- P0：未发现。
- 本轮认证前置无未闭合阻断项；P1仍在未实现的实际域/路线/来源失效接线及原建筑/World门槛。
- P2：材料name/userData等不参与所审外观模板，属于原既定边界，不宣称每个Three属性都被锁死；普通数据记录契约也不是恶意Proxy/任意JS回调的安全沙箱。
- 1908是独立阶段；后续共同source继续变化后，不可沿用600/38字节通过或把Task3/4结果倒写成Task2已验。
