# 寿安门入口组合验证
基线 `f442e454`，2026-10-29。仅本地开发分支；不推送、部署或修改 main。

## 来源与边界
- [故宫博物院寿安宫236505](https://www.dpm.org.cn/explore/building/236505.html)正文：三座随墙琉璃门，中央门内四扇木屏门照壁。
- 已查看官方[中央门照片4662](https://img.dpm.org.cn/Uploads/Picture/dc/4662%5B1024%5D.jpg)及[木屏门4674](https://img.dpm.org.cn/Uploads/Picture/dc/4674.jpg)。拍摄日期未知；模型采用前图中开状态，不宣称现今参观权限。图仅临时缓存，未作为新资源打包。
- 中门绿金釉面分区与木屏分格是简化拟合；不伪造满文、细雕、精确瓦兽。侧门无本体细图，仅正文三门拓扑的对称简单拟合；全部新尺寸、南墙4.4m高度、屋顶精确型制仍待实测/更多资料。保持3.6m中央净宽、原主宫及北/东/西墙位置。
- 完整南入口：三门、四段南墙、四叶屏门与前后真实台阶/台面。未把春禧殿等未定位后续区域冒充已完成。

## 真实来源与通行
每个新实体有显式source owner；盒包络等于最终Float32顶点，非盒严格面来自4顶、4墙帽、牌匾，原始每面进入实际合并渲染。无隐形坡道、补地面、rescue平面或共享碰撞容差调整。真实Environment绑定用于ground witness；移除/隐藏/变换/位置版本变更、双源绑定、解绑反例；唯一锚点/身份降级/重复source/tag卸载重载。

主运动测试：48组（10/60Hz×走/跑×跳/不跳×三路线×双向）通过三门、屏门中央及两边；16组屋顶/墙帽高落并退出到实际Environment地面。每帧完整身体AABB对最终源三角独立正侵入Oracle。另8组主宫入口往返保留原主殿0.75m脚高；不因此声称原主殿地板逐面一致。
站/坐动态人物阻挡下落而不伪落地、不能重置跳跃；变更姿态及移除后落在真实地面。generic kinematic三门/屏门双向、4边4角半径.3/.5及斜向、墙边切向滑移通过。边界初次红测在dynamic.tap，修复仅真实来源见证补一子步的交接范围，详DESIGN；不扩大dispatch。

## 证据保留
- geometry-red.tap：原通用门1口而非3口。
- front-wall-red.tap：完整南墙检查最初未生成4段；后曾测试把墙帽也计为墙体，筛选改为mesh实体。
- motion-extended.tap/highfall-diagnostic.tap：屏门南出测试终点仍在屋檐足迹内，feet4.24不应被断言0。真实包络屏门z365.1134..370.8866（还需身体半径），中央屋面同时伸至365.4371。改从北侧到372离檐，不改物理源/算法；motion-verified.tap全通过。
- dynamic.tap：kinematic跨域前端缺地面来源；dynamic-handoff.tap与boundary.tap验证局部修复。
- retention.tap：与固定f442e454 JSON比对，所有非目标outer-west输入、完整合并渲染几何哈希、包络/导航保持；其余三面墙逐顶点/索引不变。

## 测试与成本
专项 `node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/shouan-entry/*.test.mjs`；最终计数与共享结果见末尾补记。
`metrics.json`由scripts/major-pilots/shouan-entry/metrics.mjs生成，冻结10个源文件SHA256。比较完整入口+全部四面院墙（两侧均包含不变三墙）：raw mesh41→109，merged10→10，三角1758→51938（+50180），merged属性/索引字节168768→4986048。顶点色釉面拟合的细分增加CPU接触与GPU几何成本，合并mesh少不等于性能合格。未运行完整bundle、浏览器同视角对比、GPU/设备帧率；仍VERIFY_PENDING / acceptedWholeObject=false。

保留已知旧缺口：其他三面旧墙仍可见6.5m/普通碰撞代理3m；不因新南墙真实面通过而全宫验收。吉云原floor overlay.62/physics.6、旧失败与前两轮几何成本不改写。14份原脏报告未纳入本提交。磁盘约1780MiB，本轮文件远低于10MiB，无大型打包或资源复制。

### 独立审查与追加红测
独立审查识别retention初版只旧JSON+新构建器，故retention.tap初版不能独自作为父源码证据。现测试通过git show实际加载f442e454的ZoneBase（相对imports指向未改的kit/几何builders），并明确assert新旧class不相同；specialized-reviewed.tap18/18包含修正对照。原三墙及其他门也改用父构建器。审查已确认此阻断解除。
共享首次160/161：唯一失败是本新屏门错误使用真实库不存在的wood材质（测试stub此前允许）。materials-red.tap独立复现；生产改用现有wood_column，未替换真实材质库。随后materials.test到finish因CPU测试未配置document而失败（specialized-release.tap18/19），补导入既有CPU DOM测试设施；不改生产匾额/渲染逻辑。所有旧红测留档，最终重跑结果另记。

### 最终复跑记录
共享命令（全部串行子测试）：
```
node --test --test-concurrency=1 --test-reporter=tap tests/r100-xishang-movement.test.mjs tests/r100-xishang-stone-rails.test.mjs tests/r104-roof-surface.test.mjs tests/r104-roof-prefix-equivalence.test.mjs tests/r104-roof-integration.test.mjs tests/r104-xiqing-motion.test.mjs tests/r65-pedestrian-controls.test.mjs tests/r91-terrain-vertical.test.mjs tests/major-pilots/xishang/*.test.mjs tests/major-pilots/jingqi/*.test.mjs tests/major-pilots/changyin/*.test.mjs tests/major-pilots/jiyun-rail/*.test.mjs tests/major-pilots/jiyun-lower-panels/*.test.mjs
```
初批shared-regression.tap为160通过/1失败（235.6秒），保留原样。材质修正后单独执行`node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/xishang/world-exit.test.mjs`，production-world-rerun.tap为1/1（76.6秒，真实TextureLibrary全World及36个禊赏亭源面运动场）。不能把两批写成同一批161/161。中途单独主宫路线约11.7秒曾与初批共享运行部分重叠，后续最终专项已顺序重跑；这些日志时间不是单任务性能基准。
10个生产/fixture源文件node --check通过；无完整bundle构建，不以语法检查替代浏览器验收。

最终专项final.tap **19/19**（24.7秒，所有最终源码），包括真实材质+匾额图集、实际父构建器保留对照与完整World路线；独立审查材料1/1并复核World日志，当前无剩余代码/测试阻断。视觉与性能仍未验。

2026-10-29追加：在cbf33b9最终生产源码上，完整原共享命令再次串行运行，shared-final.tap **161/161**（300.4秒）；这是整组全量绿测，独立于前述160+单项重跑。无代码变化、未覆盖或删除原失败日志。

2026-10-29 慈荫真实合并复查发现既有缺口：MergeUtils.normalizeAttributes 删除 color；本寿安彩面材质 vertexColors=true，而 finish 后颜色属性为零。复现 `node tests/major-pilots/shouan-entry/color-loss.diagnostic.mjs`，结果保留在 ../ciyin/shouan-color-loss.json。此前几何源面覆盖与19/19、161/161不包含最终顶点色保留，不能证明屏门/墙面彩色纹样已交付；这项渲染缺口现明确未修复。慈荫局部按单色材质拆分，不把共享合并器改动混入其范围；既有原始测试结果保留，GPU视觉依然未验。
