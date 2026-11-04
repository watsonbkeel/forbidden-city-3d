# 萃赏楼现有台明入口支承

基线 f638d92721f857312d77a70ea1169b7afda1802c；frozen三文件直接对Git原对象验证。初始red.test真实strict landing为null，release两个新断言原R163失败，随后分别转绿。

运行：
- node --test --test-concurrency=1 tests/r164-cuishang-entry-support/{red,component,teleport,go,controller,high,jump,lifecycle,source,history,ledger,release}.test.mjs
- CUISHANG_EVIDENCE_DIR=<existing directory> node --test tests/r164-cuishang-entry-support/production-zone.test.mjs
- bash tests/r164-cuishang-entry-support/run-bounded.sh

一次原全区捕获来自真实f638 Builder，不是候选模拟旧坐标。生产区全部网格/属性/材质/阴影与全屋顶摘要保留；仅对经过完整边界断言的1条新接触和精确5点导航/1条范围文案做历史归一化。所有其他物理/地图/房间/区域/架构继续完整比较。

路线：候选72条（48条前后门贯通、24条外侧绕行），覆盖10/60/144Hz、走/跑、两后门、正反/倒走；冻结旧版独立同72条也到达。这里是脚本控制视角并在转弯前减速的真实FirstPerson，不等于任意持续冲刺或真机输入全验。24个2/10m高起点自然下落后连续向南退出，不声称所有高处/方向都通。旧窄廊部分横穿受既有物体阻挡，未称整廊横通。

Teleport.go使用真实控制器和真实Teleport，但ZoneManager仅记录ensure/update；另一正式测试构建真实宁寿单区。未运行完整World、浏览器、GPU、手机、Node20或测Mac温度。

构建身份测试包含R164单源、设置诊断、旧R163服务端no-store检查及手动刷新；保留旧11项构建/混缓存/中断检查。构建与上传另见最终交付证据。
