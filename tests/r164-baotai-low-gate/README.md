# 保泰门低墙琉璃门主体有界检查

基线 e999537f2224acb5ae557f4067965415cb61cc2a。`frozen/ZoneBase.e999.js` 是该真实 Git 对象，不借当前源码冒充旧版；其余运行依赖本轮未变，`source.test` 直接核原始对象。

- `node --test --test-concurrency=1 tests/r164-baotai-low-gate/{red,component,lifecycle,teleport,controller,atlas-retention,high,source,ledger}.test.mjs`
- `BAOTAI_EVIDENCE_DIR=<已有证据目录> node --test tests/r164-baotai-low-gate/production-zone.test.mjs`
- `bash tests/r164-baotai-low-gate/run-bounded.sh` 为有界累计，实际B/S与奉先邻区串行；不跑完整World。

先红测旧代码缺专用保泰绑定，再实现。48轴向/斜向走跑双向路线逐帧等原版，32实体/墙阻挡；移除真实门垛11接触可让相应阻挡负控失败，12跳跃低于4.4m门楣。8高起点从9m自然下落后连续向东退出，没有中途重设位置；中轴落墙帽、外檐侧自然落地，不说全都停在屋顶。单区另外保护既有26排、敛禧纵路、共梯与旧用户修复路线。

真实单区固定全部非目标原始几何/材质/阴影/矩阵/碰撞/走面/地图/房间/区域/结构摘要及旧屋顶；仅扣精确本门构建时新增的对象集合。保泰地图矩形和所有落点完整字段保持，19专用目标仍17成功、萃赏/梵华2旧null。新门不放松公共认证。

遗留共享匾额图集去掉未核的通用保泰文字，其他4门的text→真实UV区域绘字绑定保持；不是字体字形或GPU视觉验收。私有几何/材质先登记后填充，异常本体及晚期接触失败清理/重试、借用贴图0误释放、合批后可见首击均验。

来源和边界见 `docs/current-state/r164-baotai-low-gate/SOURCE-MANIFEST.json`：保泰身份/东向/横街东端/低墙琉璃门有官方依据。现有单洞/尺寸沿用游戏，普通石脚/颜色/檐型/背面/全开门姿是合理拟合；未取得完整实景，不照搬履顺须弥座或编造匾额/纹饰。CPU示意只是形体核查，不是GPU或真实照片复原。
