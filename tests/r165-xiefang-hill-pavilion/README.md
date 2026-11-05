# 撷芳亭有限岩台与山顶方亭检查

冻结d4c40891e8082038d949b69aa94651a5a1478fee真实ZoneBase。旧src/data/main.js/release.json字节全保留，只新组件和import/hook141/call三行增量。所有位置、尺寸与通路均为有限游戏拟合，wholeObjectAccepted=false，surveyed=false，currentAdmissionVerified=false。

- 轻量：node --test --test-concurrency=1 tests/r165-xiefang-hill-pavilion/{red,component,fidelity,roof-silhouette,corner-exit,controller,edge,high,jump,lifecycle,negative,neighbor-retention,source,ledger}.test.mjs
- 串行真实宁寿：XIEFANG_EVIDENCE_DIR=/existing/output node --test tests/r165-xiefang-hill-pavilion/production-zone.test.mjs
- 重建旧区基线：node tests/r165-xiefang-hill-pavilion/baseline.capture.mjs（读取已冻结旧ZoneBase，不含新组件；不要用候选基线替代旧基线）
- CPU形体预览：node tests/r165-xiefang-hill-pavilion/preview.mjs /output/xiefang-cpu.png
- 有界累计：依照docs/current-state/r165-xiefang-hill-pavilion/BOUNDED-TEST-FILES.json，以node --test --test-concurrency=1逐个文件串行执行。保留两个宁寿侧阶快照与r72床位共3旧红。

原生控制器验证60走跑/双向/帧率路线和8岩体阻挡、48中线及±.18m转角偏移、24普通跳跃、18空间高起点×4帧率=72高落后连续退出、36地面邻接。48矩阵中部分中线样本与60路线重复，不能简单相加成独特路线数。高落前5秒只核静落末状态，然后连续行走逐帧核身体不相交/到地，无位置重设，不覆盖所有初始落帧或任意方向。

负控明确属于本12级低台：完整接台删除令原60Hz上阶路线失败；接台外缘缩窄1m令原10Hz外偏转角不能抵达；只移除西侧5件栏座接触后，其内缘路线才可通过。不得误写为已重现耸秀5cm缝或坠地症状。

旧抑斋、矩亭、露台和耸秀的原始路径不改，双/多组件与完整宁寿再验；旧20落点、raw、屋顶与数据对旧基线精确保护。新物不是传送目的地。真实宁寿不等于World、浏览器、GPU或手机验收；CPU预览不含贴图/光照/阴影，不能充当照片或历史复原验收。

最终上翘檐高落：(-269.1,360.1)/10Hz由14m自然落到北檐，原横穿上翘角路线受阻保留负控；同一真实落点先向檐外走，再地面西绕，连续无重设退出。高落72组合仍使用原18空间起点，未改旧抑斋等路径。此为退出路线验证，不是几何/公共物理修复，不声称所有方向可通。初始5秒自然下降未逐帧扫身体，只检查静落末状态；其后连续退出每帧扫身体并最终落地。

本地干净运行时构建与HTTP身份（先提交本轮代码，不改R164元数据）：
VITE_BASE=/forbidden-city-3d/ npm run build
VITE_BASE=/forbidden-city-3d/ node tests/r165-xiefang-hill-pavilion/http-identity.mjs /output/http-identity.json
HTTP检查只核localhost的HTML/build-info/JS状态及一致身份，不执行浏览器/GPU，也不发布到Pages。
