# R49 独立牌匾复核：挂位、全场可见性及证据边界

审查日期：2026-10-22 UTC。R48 比较基线 `fddf94c998ea93031763550601b898ed18d2d55b`。审查者没有修改产品实现；本文件及配套 JSON 记录共享工作树中负责人修复后的独立验证。不涵盖另行统计的 74 座门。

## 结论

用户截图中主敬殿/敬思殿“上两字不见”的直接原因是牌身穿过连接廊天花，不是前殿距离太近。R49 不挪建筑、不加大前后殿间距、不抬天花，只调整专属小牌与支承。其它四处排除了牌面埋入上层门头、中柱、新墙及抱厦梁底的问题。正常檐柱遮挡必须保留，不能把所有相机角度 100% 可见作为文物模型目标。

## 统计分母，不能混淆名称与实体

初始全量扫描对象为全部 7 个 zone JSON 的 **77 个有名称的 kind=hall 项**，不是全部楼宇、全部入口或历史匾额清单。此前只计同名牌得到 66 处，会漏掉异名牌。

按每个 hall 构建出的全部 `kit.plaques` 统计，初始有 **69 个 hall、70 块登记牌**。景福宫同时有“景福宫”和“五福五代堂”两块。另有三处建筑条目与题字不同：翊坤宫后殿→体和殿，太极殿后殿→体元殿，长春宫后殿→怡情书史。这些不是漏匾。

初始没有通用登记牌的精确 8 项：

| zone / JSON 名称 | 审查分类与本轮边界 |
|---|---|
| axis-courts / 体仁阁 | 自身斜照不足以确认挂位，未验不补；不得镜像弘义照片当证据 |
| axis-courts / 弘义阁 | 官网正面照明确有一层中央竖匾，另由专项补齐 |
| east-six / 延禧宫 | 实现是灵沼轩未完遗址；“延禧宫遗址”是便于说明的称呼，不是另一个 hall；不挂通用宫殿名匾 |
| outer-west / 宝相楼 | 历史及研究年代实物有横匾证据，但无清晰整体挂位，本轮 hold |
| outer-west / 吉云楼 | 官网整面/近照明确二层前檐满汉横匾，交专项实施 |
| outer-west / 慈荫楼 | 历史及研究年代实物有横匾证据，但无清晰整体挂位，本轮 hold |
| outer-west / 宝蕴楼 | 不是完全无板：R48 已有浅石题额板与绿框，只缺字；交专项，不叠蓝金通用匾 |
| garden / 钦安殿 | 官网照片证明漏匾，归专项验证 |

以上 70 是**缺匾专项实施前的登记基数**，不能在新增后继续称为最终数量，也不能把宝蕴专用石题字面自动计成 `kit.plaques`。本审查不为凑 77/77 而造匾。初始记录保存在 `reports/r49/hall-nameboard-ray-scan.json`，对应原始 `/tmp/r49-occlusion-scan.json`。

## 冻结生产版本的最终分母复核

生产版本 **84500a79e30b31c918acc7e2ed53b12e57c9bc96** 已另作实际逐殿构造核验，不靠预计数。77个命名hall逐项调用真实 ZoneBase 与 TextureLibrary，并执行生产finish。结果为：

- **71块 kit.plaques 登记牌，覆盖70个hall**。较初始增加弘义阁的“弘義閣”；这只是同名的简繁字形差别，不是另一个历史名称。
- **3个专用命名面**不进入kit.plaques：钦安殿“欽安殿”、吉云楼“吉雲樓”、宝蕴楼“寶蘊樓”。分别以 qinan-name-plaque、jiyun-upper-front-name-plaque、baoyun-sourced-stone-name-inscription 语义标记识别；finish后各自字面材质仍在，非只统计未投入场景的声明。
- 合计 **74个命名面，覆盖73/77个hall**。景福宫仍占两面，所以面数与hall数不同。这里统计的是模型文字面，不代表74块历史实物匾均已核实或书法、满文已复刻。
- 最终余项恰为 **体仁阁、延禧宫（灵沼轩遗址）、宝相楼、慈荫楼**。前者未验，遗址不应套宫殿名匾，后二者挂位证据不足本轮hold。

专用字面在finish后的实际材质名为 gate_plaque_face_gate-name、jiyun_plaque_han_semantic_face、baoyun_stone_name_inscription。弘义使用通常登记链，因此不能将其误归custom后仍报70块通用牌。此前8项表是初始缺项追踪，不是最终剩余项。

执行脚本 `/tmp/r49-spacing-review/final-name-surface-inventory.mjs`，原始逐殿清单 `/tmp/r49-spacing-review/final-name-surface-inventory.json`；汇总已写入配套JSON的 finalProductionInventory 字段。脚本最初因把钦安对象id误作材质名产生一次统计假阴性，纠正为真实材质名后重跑退出0；该中间值72不是产品遗漏，也不作为最终结果。

## 主敬/敬思：完整建筑组合及全场复测

原连接廊天花 y=6.58；主敬旧牌 y6.12–8.12，敬思旧牌 y5.8–7.8。真实材质与生产 `finish()` 后，上/中字符射线首命中连接廊天花；用户截图蓝金大片表面与此相符。既不是仅看后殿的 stub 通过，也不是把前殿自然远景遮挡误判成间距故障。

新牌均 1.05×1.5 模型米，顶6.40、底4.90；台面1.20，牌底离台面3.70；.09 木悬杆接天花。板顶净距.18、相对后殿前沿外移.8 均为可逆模型拟合，非测绘。

全部7区 + PalaceBuilder + Enclosure + GardenBuilder 同时存在，生产合并/finish 未替换；距牌1/3/6/10m，横偏0/±2m，三字符中心，**两处共72/72条先命中牌面**。完整前殿+穿廊+后殿专属测试2/2通过。较远25/45m前殿展屏等自然遮挡不要求消除。

证据：

- 主敬直接官方全景首块：https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/panos/a057.tiles/f/l1/01/l1_f_01_01.jpg 。已查看四块合成的正向及上向面，明确三字竖匾在穿廊横梁/天花下。目录日期不等于摄影日期；不能据此精确量取米制尺寸或纵向挂点。
- 敬思官方2021入口视图：https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/35.tiles/vr/pano_l.jpg 。已核穿廊、入口多个方向，未见模型同类三字竖匾；不能证明从未有匾，也不能支持其形制。现牌必须明确是未被实物证实的模型导览标识。

## 四处穿插修复与合法观察点

广扫使用真实 TextureLibrary 类/API/材质名，像素内容为惰性负载、CPU canvas 生成图集。每处1/2/4/8/12/20m，横偏0/±1/±3/±6m，三行采样；眼高是真实全场地面+1.7m，玩家半径.5m。广扫射线先只查单殿以定位构件，不能单独当作全场结果。

随后另建全7区与全部静态建筑、原样 finish，对4/8/12m、横偏0/±3m的无碰撞点进行全场复核：

| 建筑 | 旧问题 | 最小改动 | 全场结果及保留的遮挡 |
|---|---|---|---|
| 景祺阁 | 旧牌z492.22在上层门头前面z491.83之后 | 改用上层前沿，牌框整体z491.68 | 18/27；4/8m全可见，12m的9条真的被前方颐和轩挡 |
| 文渊阁 | 牌面z−142.05嵌入中柱前缘约5.7cm | 完整牌框前移.20m至−142.25，保留中柱 | 15/15；其它拟定点落在池/护栏内，已排除 |
| 养心殿 | 牌z271.20在新门头墙271.05–271.35厚度内 | 完整牌框前移.30m至270.90 | 21/27；余6条是8m、±3m处正常抱厦柱遮挡 |
| 重华宫 | 原1.647m高牌跨过抱厦椽底y5.142 | 1.05×1.5小牌置梁下，中心y3.907 | 27/27；不抬抱厦 |

真实 CollisionManager/getValidPosition 的地面短路径（步长.15、半径.5）也通过：景祺距牌8→4m，4/4m；文渊12→4m，7.95/8m（helper .05m到达容差）；养心和重华12→4m，各8/8m。文渊走中央桥，不站池内；养心随地面上至.6m台面。它们是可达近场观察区，不只是空中或禁入发射点。此项不声称从午门到各院完整路线或现实参观权限已验收。

完整世界复核快照610 meshes、1,587,224 triangles，含其它负责人的同步增量；不是最终发布预算。具体站点、目标点和阻挡材质在配套精简 JSON 中。

照片/结构证据边界：

- 景祺官网 https://www.dpm.org.cn/explore/building/236480.html ，已查看 https://img.dpm.org.cn/Uploads/Picture/dc/4750%5B1024%5D.jpg 。斜照支持楼层和外廊，但不核定现有通用名匾；维持模型标签身份。
- 文渊官网 https://www.dpm.org.cn/explore/building/236513.html 支持六间、绿柱、前廊、池；不自动证明等间柱网或精确挂点，不把内部“汇流澄鉴”误作外部同名牌。
- 养心官网 https://www.dpm.org.cn/explore/building/236442.html ，已查看 https://img.dpm.org.cn/Uploads/Picture/2017/01/06/s586f3eba40de4.jpg 。图像不足以量取牌尺寸；本次是排除模型穿插，不是测绘还原。
- 重华已查看 https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff075737310.jpg ，可见小蓝牌在抱厦梁下、门上，支持较小梁下构图；尺寸、书法、框形仍是近似。

## 正常遮挡不得误修

畅音阁全场21/27，4m的下/中行被高层木构挡；8/12m可读。咸若馆全场4/8/12m三偏移27/27，极近仰视有檐/椽挡字。两者未检出本轮四处那样的普遍埋匾证据，不因初扫8/9而删柱、抬檐或把高层牌降至眼高。景祺1m腰檐遮挡、12m颐和轩遮挡，以及养心斜视柱遮挡同理。

## 间距与照片拟合边界

官网文华/武英建筑描述支持工字相连及后殿较浅：
https://www.dpm.org.cn/explore/building/236531.html
https://www.dpm.org.cn/explore/building/236500.html

官方论文图 https://img.dpm.org.cn/Uploads/pdf/5077/T00008_00.pdf 第8页提供武英院平面关系。图像粗读前/后宽近1:1、后深约前深.70、墙间空距约前深.83；此为无完整尺寸链的图像比例观察，不是测绘。现模型武英后/前宽.881、深.714、墙间距/前深1.155；文华相应.844/.706/1.029。它们只能说明“再拉大间距来显匾”无证据支持，不能直接反推新的精确坐标。整体比例需单列布局研究，不夹带进牌匾修复。

## 缺匾专项来源移交与 hold

- 弘义：https://img.dpm.org.cn/Uploads/Picture/dc/1980%5B1024%5D.jpg ，清楚为一层中央蓝底竖匾。
- 宝蕴：https://img.dpm.org.cn/Uploads/image/2024/12/30/1-yrWtXOlSB260.jpg ，清楚为浅石面绿框的“寶蘊樓”竖题字，不应加通用金框。
- 吉云整面：https://img.dpm.org.cn/Uploads/Picture/2024/06/18/s6670e8aa8f637.jpg ，近照：https://img.dpm.org.cn/Uploads/Picture/dc/8001.jpg 。二层外廊檐柱额枋前中央横匾，右半汉字自右向左“吉雲樓”，左半满文。未核满文不伪造。
- 三楼历史/实物研究：https://www.dpm.org.cn/Uploads/File/2020/03/30/u5e81bda9e4579.pdf ，PDF8=印刷250明确前檐满汉横匾；PDF16=印刷258有宝相匾后和慈荫匾后彩画证据，但没有足以核定两楼整体挂位的清晰正面图。因此宝相、慈荫本轮hold，不拿吉云挂位复制成两楼已核实复原。论文1772与吉云官网1771纪年有差异，未消解。
- 体仁自身斜照：https://img.dpm.org.cn/Uploads/Picture/dc/1534%5B1024%5D.jpg ，本轮未核；不是认定无匾。
- 延禧遗址身份：https://www.dpm.org.cn/explore/building/236535.html 。院落名称、院门题额与未完水殿本体是不同对象。

## 复核入口与限制

可在项目根目录重跑负责人正式回归：

```
node --test tests/r49-rear-hall-nameboard-visibility.test.mjs
node --test tests/r49-related-nameboard-clearance.test.mjs
node tests/r49-scan-nameboard-occlusion.mjs /tmp/r49-scan-current.json
```

本次独立脚本与原始运行记录在 `/tmp/r49-spacing-review/`：

```
node /tmp/r49-spacing-review/full-world-after.mjs
node /tmp/r49-spacing-review/six-probe.mjs
node /tmp/r49-spacing-review/six-full-world-after.mjs
node /tmp/r49-spacing-review/four-paths.mjs
node /tmp/r49-spacing-review/final-name-surface-inventory.mjs
```

临时文件包括 full-world-before/after.json、six-before/after.json、six-full-world-after.json、four-paths.json，保留实际材质命中和站点。脚本硬编码本次源码路径；迁移环境需调整路径。没有把参考原图或巨量三角面日志纳入项目。

这是真实生产几何/材质合并的 CPU 验证，不是 GPU 或照片效果验收。浏览器沙箱失败后未规避，未宣称真实字体、光照、手机清晰度或全楼古建细节已验收。可见率的有效分母会因牌位前移、取样位置及碰撞改变，不能当作统一视角的百分比质量评分。
