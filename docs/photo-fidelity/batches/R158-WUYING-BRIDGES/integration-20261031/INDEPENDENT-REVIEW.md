# 武英累计候选独立只读审结 — 2026-10-31 08:45 UTC

结论：未发现剩余 P0/P1/P2 集成阻塞，可保存有限开发检查点；不是全套全绿、GPU/手机或整桥验收，也不是远端可恢复性收据。

范围：`r158-arrow-integrate`，基准 `55cafc255caa4d361a5d8ce3b2d6081a49a1ba3c`，运行源码 `842fe747b5f14bf4aceee280af21f412baebae4b`，最终 QA 冻结 `qa-freeze-0838.json`。独审未修改生产，未构建重 World，未上传。

## 已独立核验
- 仅四个生产路径相对55变化，逐字等于已审56574；终态586源码与4231 QA文件逐项摘要符合冻结清单。
- 流式独立重算107,040,009字节实际物理快照（SHA256 `65b09621d01b916539ca2c463213864e0b4f32da8d04c6978ce9af2edf8684da`）：126新目标逐ID/整行摘要等于独立56574 builder记录；其余30,750 collider多重集、全部1,365 supports及river等于真55。映回旧126后全体多重集也精确等于55。QA视图只返回新数组，不写W.cm；原7种物理负控存在并在实际World日志中通过。
- Controller有限9上下文确从真55字节生成当前源；原current-state/V9文件未改。独跑finite/transport共5/5。旧V9 expected独立从冻结registry及原增量重建为27,742字节，父55与56574均不等；未称旧债已修复。
- 原5个World路由脚本逐字等于56574。现有原始结果独算：中央18及近栏36均到达；身压18、落体54、crown42均无hit；42 crown中27到deck、18到bank，15预期不入deck。未重跑World。
- 亲看完整World三幅CPU图并核9输入/输出摘要；它们不提供GPU、运行时材质/光照或整桥照片验收。
- 原完整current-state三分片1313/1103/210，无skip/cancel，执行标题与通过/失败状态Counter精确等于55；主115文件列表不变。此为标题/状态相等，不声称失败根因全等。
- 三base均实际564模块/exit0；独立verifyBuildSource及HTML、入口JS/CSS、metadata摘要通过，fingerprint `d6f9e5d535d943c7a3ac712019c97ffd37f366c58871bce07080437e96d9d0b9`。runtime/build输入clean842，整体QA树未提交；0819构建不冒称0838重跑。

## 首轮8红与真实fixture修复
首75文件batch 481/473/8完整保留。8红均由原测试Object.create跳过构造，缺失真实初始化的_wuyingRecovery；不是通过改生产optional chaining掩盖。

修订仅1个原测试文件＋2个新QA文件。父/当前双方均调用真实constructor和dispose；只提供DOM环境，没有no-op recovery/物理hook。原所有assert行逐字保留，20条件及每帧7字段deepEqual、Xiehe真实实体三角断言不变。独跑21原例＋2新增绑定/删除接口负控全部通过，真实listener释放也被断言。

完整76文件复跑 `batch-0838.tap` 独算483/483/0、无skip/cancel，exit0。相对首481没有消失标题，仅新增2个fixture回归，8原红全部转绿。相对55 batch为55新增/2标题迁移；原唯一旧失败属于被显式迁移的integration-parent契约，不宣称旧430断言原字节全保。旧10断言完整historical文件SHA与真55原文件相同，并由冻结全929闭包重放；新26832精确三角数另有严格断言。

## 保留边界
- 210项历史全套失败仍在。
- 当前small-descent仍有原git-show4d614历史对象前提；本地通过不等于无旧历史远端clone可跑。46块只证明指定55 gzip身份，不能豁免此前493/Wenhua等必需fixture。
- 所有原SIGKILL/OOM/KeyError/launcher127与首batch红保留。独审额外原始Buffer断言探针exit137未计pass，说明在 `/tmp/r158-wuying-review-oldguard-probe-0823.json`。
- 保留55回滚，不增加accepted计数；后续远端clone、GPU/真实浏览器/手机和整桥验收仍需各自证据。
