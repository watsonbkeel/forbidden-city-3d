# R158 内阁大库第二体实际入口导航累计

运行 `474d73e704809271b09609a4c00b7115e257d3f4`；父本地881c214b / 已回读远端81f3123d。仅2生产源及4QA精确等独审3c02154e，无新hook，保最新东耳导航、近域加载、地图纯地名及节能模式。无建筑或门窗碰撞改动。

## 问题与修复

父真实go沿建筑中心x=-273，240帧被原bay4/5两块窗下砌体挡；经既有北横路和实际开门x=-262.5阳性309帧可通。仅第二体本模块共享4个既有数值常量，派生i7真门入口；map只加structure/entryProfile，中心/尺寸/两库名称与库别待核信息保持。Teleport只加精确本体分支和驻留检查，复用原显式逐步地面/碰撞/LOS，无放行豁免或通用深宽改动。

驻留检查仅OE已加载、唯一精确map/profile/frame、111原owner ID/数量、i7门楣bbox/12三角，不声称每次全量重新验证owner几何或历史库别。已审组件215mesh/111owner9420三角全流逐字父同；0新支承/房间。第一库闭合外观与东耳入口分支不变。

## 正常累计证据

第二库19专项+东耳16+地图名3=38组件；正常World1，共39/39，无skip。正常ZoneBase/no注入、loadAll:false、main reuseInactive:true，实际go落(-262.5,-351.12)朝门(-262.5,-359.12)，heading=[0,0,-1]，approachVerified=true/fallback=false。同controls直接30Hz入库返回182帧全到/脚差0；原中心120帧拒绝并精确命中bay4/5砌体，另一北侧闭门90帧拒绝并命中bay2左右闭叶，不把邻楼当拒绝证据。

与作者同落点、朝向、固定路径/到达结果和182/120/90帧数；manager真实时钟，只设controls.prevTime，细微坐标不要求字节相同，不冒称完整轨迹字节等同。实际加载axis-courts/outer-east/ningshou；不是全宫验证。作者首轮QA误复制184.25而非262.5造成测试假红，原日志/脚本/raw保留；仅一常量纠正后完整有限World通过，生产源前后同，不算产品回归或删断言。

662模块clean R158 `/gugong/`构建/verifyBuildSource通过：`R158-ad8b8a4b7fcd`，source`6227da92c71d43330e1f889c2f8f6137a902dbfe16266b53474a74609f5361d7`，outDir `/tmp/r158-second-store-build-0425`。没有GPU/手机/Mac温度耗电/FPS实测、全仓回归、新ZIP或部署。原文渊.391/文华.444冲刺诊断保留。

## 交接边界

VERIFICATION绑定2源/4QA/17保护，EVIDENCE登记6本地终态和2前驱原件长度/SHA。作者命令可直接运行累计，但EVIDENCE_DIR须新路径，不覆盖历史原红；raw仅/tmp非持久、不上传。正式地图名不加拟合注记，内部资料仍保第二库具体身份、门窗排列/尺寸/位置、现实开放状态未核。用户24B release及main/branches均保持，旧开发分支可回滚。
