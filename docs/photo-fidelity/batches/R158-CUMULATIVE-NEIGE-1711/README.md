# R158 内阁大堂小院正常入口累计

基于已回读第二批 `0773bbba6e9361b3d8497260e1704eab55024d69`，运行冻结 `2195349fd8a329154fd120035a9c97b4ec75cdd6`。专属模块逐字等已审 e9911822（SHA80fe42…97d5a），仅新增该模块与 ZoneBase import/finish前调用；保留文渊踏步、南三所、第一批所有接线。没有改用户 branches/main/Pages。

新增南向三间大堂、前门和短墙小院；不是内阁11项整体还原。官图支持主要轮廓，民国平面/官方示意图只支持相对方位；中心(-161,-365)、尺寸、院后界和开叶均为可撤销工程拟合，堂地平接是交互取舍。满本堂现不存不造，其余历史附属及大库未实例化；无虚构陈设。候选图证及5自制平色CPU见 R158-NEIGE-COURT，不冒GPU/现状测绘或现实开放许可。

## 实测
- 11/11 专项（组件/原生全身路线/局部飞行落顶）；原候选保全与资源保护不放宽。
- 正常共享入口实际 CPU World：**移除测试 prototype 接线及 fallback**，ZoneBase恰一次实际注册内阁架构/地图与60 triangle owners；0新walkable。既有道路→前门→院→堂→原路返回8/8、11,318帧、脚地差峰0，完整rows逐字等独立候选。
- 本轮明确 **loadAll:false，只加载 outer-east**，不称动态跨区或全分区验收。旧南路8条诊断仍东华4绿+文华旧中心线4红，完整结果逐字等独立候选/基线端点；不能写16全绿。当前文华正常偏置中路/侧门另有已验路径，本轮不改旧中心线去假绿。
- `VITE_BASE=/gugong/ npm run build`：614模块、exit0、clean2195349f，source `a7c4ffc3399083b545a47a8f4b232dca1e75ce89ce08adad0a99de9bd1d0aec3`。保既有R146-fix显示标签和chunk警告，未冒称新GPU/手机验收。

```sh
node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-neige/component.test.mjs tests/r158-neige/routes.test.mjs tests/r158-neige/flight.test.mjs
BASELINE_REPORT=/path/to/local/baseline-world-all8.json EVIDENCE_OUT=/tmp/neige-integrated.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-cumulative-1711/world-neige.test.mjs
VITE_BASE=/gugong/ npm run build
```

原日志/逐帧JSON只本地保存于 `../r158-cumulative-evidence-1711/`，基线原件在 `../r158-neige-court-evidence-1630/`；SHA及摘要见VERIFICATION.json。远端不提供这些原帧，故带基线的对照命令需可访问本地原件，不宣称仅有哈希即可重验。未重跑全仓历史套件/全城路线，旧红保留；新试玩包尚未制作，0773和R157试玩包可回滚。
