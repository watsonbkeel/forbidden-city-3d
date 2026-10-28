# 碧螺亭宝顶表面候选独立评审

2026-10-28 06:49 UTC，固定 `34d1eeebd698212e07e994490de1bcd34c4a6d3b`。

亲看官方自身1442高清 `biluo-2.jpg`、最新真实生产CPU候选 front/finial/back 与基线finial。原纯色卵形顶现在有连续不规则浅色冰裂网络及五瓣梅花，地面整亭视角仍可辨图案族。允许『表面概形局部拟合』，不称雕刻复刻；照片实际起伏、较细密纹线、下方花瓣/碗腹/颈部细纹仍未做。背面仅原创延拓，未独立证实。CPU图片不证明GPU/手机效果。

代码只有卵形顶的新独立Canvas材质及明确hook，纹样不贴官方原图。确认实际Sphere有序 position/normal/uv/index 与变换、身份、旧蓝材质绑定守卫；所有原几何/矩阵、非目标材质和物理保持。原色下层不受新材质污染。新图纹样全周数量是模型参数不是现场计数。

独立执行 `node --test --test-concurrency=1 --test-reporter=tap tests/followup-biluo/*.test.mjs`：**6/6 PASS**，6.450秒。包括真实Canvas确定性/拼缝像素、实际几何保持、四类buffer改动拒绝、三次释放和完整静态世界既有东侧通道10/60Hz×走跑往返。日志 `biluo-34d1-independent.tap`。不是全山石/桥接/全宫路线验收。

冻结对照fixture已独立逐字节核等 `460d9177:src/scene/palace/special/RemainingNingshouHalls.js`，SHA256 `5c7e7d0b7de19ff07736d667d871b388d4f0dea7146b7c561537226328d4d8ce`。

旧R68纯色标记断言仍失败应保留，不把实际新增纹样后不再满足PLAIN解释成全绿；新精确网格/物理对照证明仅预期材质变化。完整标准/整区成熟资源/构建/上传仍待唯一写手汇总，本局部评审不提前称其通过。可继续后续必要冻结门，非整亭或原文397+7完成。
