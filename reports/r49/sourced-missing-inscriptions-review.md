# R49 弘义阁 / 宝蕴楼漏匾与漏字修正

## 范围与根因

本节记录同类巡查发现的两处漏匾 / 漏字。R49 不修改 main、账号权限、凭据或 Pages；开发分支的最终交付另列。

- 弘义阁：axis-courts 单条数据原为 plaque:false，专用楼阁构造只在 plaque:true 时调用通用匾生成，导致官方正立面照片中一层明间门上的蓝底竖匾缺失。现在仅该数据改为 true，并由弘义专属路径添加“弘義閣”。显式 plaque:false 仍可用于结构测试，体仁阁没有随之添加。
- 宝蕴楼：R48 有意仅保留山花浅石题额和绿框，不画文字。官方 2024 正立面可辨“寶蘊樓”三字。现在只在既有框内补竖排字面，不另加金框、蓝底、厚板或石刻凸雕。

## 实际查阅的来源

下载后实际查看了下面两张官网照片，没有用材质名推断实物。

- 弘义阁：[故宫官网正立面照片](https://img.dpm.org.cn/Uploads/Picture/dc/1980%5B1024%5D.jpg)。SHA-256：73a695882b0bfed222cb8893459a5218fccf1c2c26ee1d19e04228e2ff169205。蓝底竖牌在下层中央门上、下檐梁架前。只采用位置、竖向布局及建筑名称，不冒认低分辨率照片能支持完整书法或满文转写。
- 宝蕴楼：[故宫官网 2024 发布照片](https://img.dpm.org.cn/Uploads/image/2024/12/30/1-yrWtXOlSB260.jpg)。SHA-256：02e2e1cf8f4cc9ca0b9d735b0e7e93792376047ef29ee5d80c284f564b2ebe0e。可辨浅石面、绿框和“寶蘊樓”竖字。继承已有 2024-12-27 活动 / 12-30 发布来源标注，不声称 2026 实景现状。

## 变更文件

生产：

- data/zones/axis-courts.json：仅弘义记录 plaque:false → true。
- src/scene/palace/special/SurveyedPavilion.js：弘义专属构造调用和来源元信息；其它楼阁路径不变。
- src/scene/palace/special/RemainingOuterHalls.js：仅导入 helper 和 augmentBaoyunFacade 的补字 / 来源元信息。本文件其它函数不属于这两处补字修改。
- src/scene/palace/special/SourcedNameInscriptions.js：两个局部 helper。弘义复用生产牌匾图集；宝蕴单一无框字面位于原浅石面前 0.006 模型米、原绿框面后 0.014 模型米。字面尺寸、颜色、字体均属可回退模型拟合。

测试：

- tests/r49-sourced-missing-inscriptions.test.mjs
- tests/lib/r49-sourced-inscription-retention.mjs
- tests/fixtures/r49-sourced-inscription-baseline.json
- tests/r49-sourced-inscriptions-cpu-canvas.mjs
- tests/current-state/surveyed-pavilions.test.mjs：现有实际数据新增匾后，补 Canvas 边界和 buildPlaqueAtlas 生命周期后再检查材质。没有更改结构断言。

## 验证结果与边界

1. 新增回归先红后绿：两项缺件失败，两个保留测试通过；补修后 4/4 通过。见 sourced-inscriptions-red.txt 和 sourced-inscriptions-green.txt。
2. 使用生产 TextureLibrary 的 material/cache/ownership 实现和真实 CourtKit.finish 合并；按普通视高在三距离、三字行分别射线，均首交文字材质。宝蕴四条旧绿框亦首交可见。
3. 排除精确标记的两件弘义新匾 / 一件宝蕴字面后，弘义 1210 网格、宝蕴 1045 网格原 geometry attributes/index、world transforms、material names、shadow flags 的 SHA-256 完全一致；colliders、walkables、rooms、mapItems、regions 哈希也完全一致。没有移动建筑、柱网、门、碰撞或地图位置。
4. 新回归、全建筑匾框配对和两组 current-state 楼阁回归：125/125 通过。见 sourced-inscriptions-neighbor-tests.txt。完整版本的集中回归另见 final-validation，本节没有代替全套验收。
5. R48 冻结旧测试 tests/r48-review-baoyun-inscription.test.mjs 保持原样。它的“首交必须仍是空白石板”断言现在 1 失败，是新增字面后的意图差异。见 sourced-inscriptions-r48-intended-difference.txt。早期曾临时修改此断言并得到 126 通过；该改动已完整撤销，126 全绿不作为验收证据。
6. 可选真实 CPU Canvas 验证：@napi-rs/canvas 只装在 /tmp，不改项目依赖。N-API 缺少浏览器 CJK fallback，测试适配器把已安装 NotoSerifCJK-Regular.ttc 映射为 SimSun；这不是浏览器字体选择验证。两块实际位图都有三种不同字形，字面在 finish 后仍存在，两张自有纹理均释放一次。同一真实 Canvas 适配器内再次运行新回归：合并后文字/绿框射线和原几何/导航保留 4/4 通过。见 sourced-inscriptions-real-cpu-canvas.json / .txt 和两张 *-inscription-real-cpu-canvas.png。
7. 两张 PNG 是实际生产绘字调用经 CPU 字体适配后的原始纹理，不是 3D 场景截图；宝蕴原始白底纹理在生产材质中再乘原浅石色。没有真实 GPU 视觉验收，没有重试被拒绝的浏览器或沙箱路线。

## 可重复命令

node --test tests/r49-sourced-missing-inscriptions.test.mjs tests/r49-all-hall-plaque-pairs.test.mjs tests/current-state/surveyed-pavilions.test.mjs tests/current-state/pavilion-render-geometry.test.mjs

R49_CANVAS_MODULE=/tmp/r49-cpu-canvas/node_modules/@napi-rs/canvas node tests/r49-sourced-inscriptions-cpu-canvas.mjs

## 真实性说明

代码尺寸与位置属于照片位置约束下的模型拟合，不是实景测绘；文字用系统字体语义近似，不是原匾书法或石刻复刻。弘义未生成任何未经校对的满文。旧建筑内部、门姿、可达路线和历史证据等级没有升级。
