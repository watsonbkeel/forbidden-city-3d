# R48 外围剩余证据核查

核查日期：2026-10-21。仅研究，不修改生产几何、家具、GLB 绑定或 registry。

## 使用边界

- 区分近现代实景、历史照片、工程图、展陈设计图。网站上传日期不等于摄影日期。
- 建筑页的文华主殿、武英主殿参数不得转抄给配殿；词条末尾“配殿”释义所说隆恩门配殿更不属于本次对象。
- 不由对称、名称、用途推定柱网、家具或房间隔断。下文的“可见”只指该照片覆盖部分，不等于全楼调查完成。
- `/tmp/r48-outer-evidence` 保留原始网页、图片、PDF、原图块和研究用拼接图。拼接图仅按官方图块行列拼合，没有补画、去树或透视校正，不能作尺寸测量。

## 1. 集义殿、本仁殿：新增近现代外观直接图证

### 官方来源与定位

- 官方展览入口：[何以中国](https://ggzl.dpm.org.cn/app/api/app/exhibitShare/152)。2022 年展览，不能据此指定每张照片的拍摄日。
- 官方实景：[全景入口](https://ggzlquanjing.dpm.org.cn/scene/wPIRwsKstn5bVoDoqCG426Sfykpnc2hK/20220207_hyzg/tour.html?exhibit_id=152)。
- 公开未加密场景文件：[tour.xml](https://ggzlquanjing.dpm.org.cn/scene/wPIRwsKstn5bVoDoqCG426Sfykpnc2hK/20220207_hyzg/tour.xml)。`scene_1` 标题“外景”，`scene_2` 标题“进入展厅”。
- `scene_1` 在文华主殿南面轴线庭院，正向可见文华主殿匾与入口，反向可见文华门；`scene_2` 在文华主殿门槛。左视面为西配殿集义殿的东立面，右视面为东配殿本仁殿的西立面。名称与东、西关系由[文华殿建筑页](https://www.dpm.org.cn/explore/building/236531.html)核对，不是以一侧反推另一侧。
- 近现代彩色实景，具体摄影日期未知。路径中的 `20220207` 不是摄影日期证明。

### 可直接复核的图块与文件

- 集义例：[scene_1 左视原图块](https://ggzlquanjing.dpm.org.cn/scene/wPIRwsKstn5bVoDoqCG426Sfykpnc2hK/20220207_hyzg/panos/1.tiles/l/l1/01/l1_l_01_01.jpg)。
- 高分辨率图块模板由 XML 明示：`panos/1.tiles/%s/l%l/%0v/l%l_%s_%0v_%0h.jpg`，第二层边长 1664，图块边长 512，行列编号有两位补零。
- 集义：`heyi-scene1-l-l2-assembled.jpg`、`heyi-scene2-l-l2-assembled.jpg`。
- 本仁：`heyi-scene1-r-l2-assembled.jpg`、`heyi-scene2-r-l2-assembled.jpg`。
- 每一张合成所用原始 URL 在 `heyi-scene1-tiles-manifest.json`、`heyi-scene2-tiles-manifest.json` 中，原块在相应 `*-l2-tiles/` 目录。

### 集义殿可支持的外观事实

1. 朝庭院的东立面，正中为落地槅扇门，左右各有两组带槛墙的格扇窗，可辨五组间架。并非将主殿“五间”文本转抄过来。
2. 红色木构门窗，菱花格心；中央门的裙板可见。部分单组看似四扇，但树木、铜灯等遮挡，不能将整立面每扇总数标为已经完全核清。
3. 正中有石踏步；石台基贯通立面。窗下有浅色槛墙，台基外侧可见灰色砌筑层次。
4. 黄瓦长屋面、正脊和双坡形态可见；檐口连续，局部蓝绿彩画檐部可见。两端山墙/挑出关系不完整，单凭这组图不正式判定悬山或硬山，更不能推出屋架尺寸。
5. 此组为外观证据，不证明室内 1916 年的梁架、采光窗、隔断或展具保留至今。

### 本仁殿可支持的外观事实

1. 朝庭院的西立面有中央落地门、石阶，两侧为红色菱花格槛窗与浅色槛墙，灰石台基。
2. 黄瓦长正脊双坡屋面与檐部可见，但树冠遮蔽较集义更重。不能用集义已读清的开间/扇数补本仁被遮部分。
3. `scene_2` 右视图补出了本仁北段屋面和檐端。画面近处的大扇菱花门、梁枋属于文华主殿，严禁误绑成本仁构件。
4. 未得到可定位的近现代本仁室内实景。

### 全景不覆盖的范围

[官方导览图](https://ggzlquanjing.dpm.org.cn/scene/wPIRwsKstn5bVoDoqCG426Sfykpnc2hK/20220207_hyzg/maps/map1.png)只表现文华主殿、穿廊、主敬殿的工字形展线。不能将该全景中普通“文华殿”标签的室内场景套进本仁或集义。浏览器显示 WebGL 不支持，但公开 XML 与图块可正常读取；不是访问权限被拒。

## 2. 集义殿：约 1916 年室内照片

- 官方[丹宸永固展品列表](https://ggzl.dpm.org.cn/app/api/app/exhibitionListPc/112)，展品 ID `8600`，标题“历史影像：文华殿西配殿展厅”。官方年代标为“约民国五年（约1916年）”，收藏单位故宫博物院。
- [官方原图](https://ggzl-img.dpm.org.cn/ggbwg8//app/gugong/2020/0911/EvtH7cdhIhqVzvCWeACt768cEsswmRb3KRen2PNP.jpg)。本地 `jiyi-west-hall-c1916.jpg`。网页原始记录另存 `danchen-source-records.json`。
- 可见长向连续开放空间、外露彩画横梁/梁架和斜向椽条；照片覆盖区域没有平顶天花遮蔽。长侧墙上部有成组矩形采光窗，远端可见竖向格窗。
- 当时的书画沿墙悬挂或立放，成排斜面陈列台沿厅长向设置，另有绳栏和说明牌。这是民国博物馆展陈，不是清代宫廷原状，也不是现代陈设。
- 镜头具体朝向、完整柱数、全楼开间与进深、窗扇总数不明。黑白照片不能确定彩画颜色。不得用其清空现代家具或认定现代室内格局已经完成。

## 3. 本仁殿：保留原匾额近景证据

- [故宫官方刊物 PDF](https://www.dpm.org.cn/Uploads/File/pdf/e5/4b/d7/e54bd768807a80999b3c22af915df13b.pdf)，印刷页 23，图 6 明确标注本仁殿匾额。
- 近现代彩色局部照片，摄影日期未知。蓝地金色竖列汉字，红色雕饰宽框，匾旁可见蓝绿檐枋及椽端。
- 本地 `benren-plaques.pdf`、`benren-plaques.png`。只能支持匾与附近檐下构件；不支持全屋面、柱网或门窗总数，也不能移植给集义。

## 4. 凝道殿、焕章殿：近现代外观与改造史

### 鸟瞰照片

- 吕成龙、韩倩、董彦卿《策展人带你看展览：故宫“陶瓷馆”改陈的“新”与“变”》，《紫禁城》2020 年第 12 期，页 28 起：[官方 PDF](https://www.dpm.org.cn/Uploads/File/2020/12/29/u5feadc156cca2.pdf)。页 28 为武英殿区全景鸟瞰，现代彩色，拍摄日期未知。
- 从西南向东北取景，近侧西配殿为焕章，远侧东配殿为凝道。位置由[武英殿建筑页](https://www.dpm.org.cn/explore/building/236500.html)核对。
- 焕章可见西后墙高处小方/矩形窗、灰色墙基与南山墙局部；凝道可见朝西正面红色格扇和中央台阶。两者黄瓦双坡长屋面与长正脊可见。
- 本地 `pottery-aerial-000.png` 为原图提取，`pottery-layout.pdf` 为整篇。不能从远景数清全柱网与所有门窗；恒寿受主殿遮挡，不能据此补其完整屋顶。

### 前廊曾改造，不能混用年代

- 春花《清代紫禁城武英殿建筑群建筑名匾额变迁》，《紫禁城》2015 年第 12 期，总 251 期，页 140–147：[官方 PDF](https://www.dpm.org.cn/Uploads/File/2019/05/07/u5cd15cc873e91.pdf)。
- 页 145 明确两配殿原有明廊，1914 年装修外推，改为暗廊；凝道坐东朝西，焕章坐西朝东。原图 `plaques-6.jpg`。
- 所以晚清图上“前落金廊”不能不加年代标签直接恢复成今天敞廊。

## 5. 焕章殿：新增 1902 年工程做法清单

- 同一[丹宸永固列表](https://ggzl.dpm.org.cn/app/api/app/exhibitionListPc/112)，展品 ID `8515`，《呈武英殿各殿宇房间工程做法清单》。官方标注光绪二十八年（1902），中国第一历史档案馆藏，说明其记录该次重修工程内容。
- [官方长卷原图](https://ggzl-img.dpm.org.cn/ggbwg8//app/gugong/2020/0910/KqoZjV4lUsaYgkbmnjIkG8IPvwJJG496Ozeuyuir.jpg)，本地 `wuying-1902-specification.jpg`。西配殿段在研究裁图 `wuying-1902-specification-segment-5.png`。
- 西配殿段可清晰读出：一座五间；明间面阔一丈六尺；次进间各面阔一丈五尺；进深二丈五尺；前落金廊深六尺五寸；柱高一丈二尺，径一尺二寸。
- 屋架文字为五檩、前落金、挑山；前后檐一斗二升麻叶斗科；横望板、方圆椽；内里安木顶棚。此处“挑山”是档案原词，不是借主殿歇山类推。
- 装修段记明间夹门/平棂支窗及随棋盘门、次梢间平棂支窗四槽与横披、前廊隔板、后檐木榻子等。文书计数“槽”不是现代照片逐扇数，不能混成每间四扇。
- 全部是 1902 年工程规定，不等于现代实测或现存状态。没有核定尺制，不折算米数；不要依据文字比例硬缩放整个院落。

## 6. 凝道、焕章：新增晚清地盘图

- 同列表展品 ID `8420`，《武英殿各座殿宇房间墙垣月台丹陛等工地盘式样图》，中国第一历史档案馆藏。官网据工程内容考定为 1902 年重修图，原图本身未署年代。
- [图面原图](https://ggzl-img.dpm.org.cn/ggbwg8//app/gugong/2020/0911/XzGYVc80KfXz3j48eFgWihKpzWvE0Z8mcJFeyYGK.jpg)，[题签/封面](https://ggzl-img.dpm.org.cn/ggbwg8//app/gugong/2020/0911/i0IIAgfCZY4FAFjyUqaGRcDWUDWPvhihtjJTCaDF.jpg)。本地 `wuying-1902-plan-b.jpg` 与 `-a.jpg`。
- 东配殿黄签可读“一座五间”，图形亦分五段；前缘狭廊与朝庭院中央台阶可见。西配殿图形也为五段，前缘窄廊与中央台阶。黄签为粘修/拆修/揭瓦项目，红签为补建，不能将红黄当建筑实色。
- 另有展品 ID `8512`《武英殿补建正殿后照殿西配殿提调房等地盘尺寸准底图》，官方只定清代：[原图](https://ggzl-img.dpm.org.cn/ggbwg8//app/gugong/2020/0911/dLFXi1ghkx2wfcsnB5BswMoKVAdB0JdYh4GvPRW9.jpg)。西配殿标“一座五间”。
- 两图可辅助核对晚清五间、前廊、中央台阶的空间关系；没有据此认定现代柱网完全未变。第二图部分尺寸字小、读数不够稳，且不能先假定其与 1902 清单同一次修缮，故不转抄模糊数字。
- 东北配房虽在图上，但其旧名与今天恒寿斋的逐栋对应尚未完全核清，不将“提调房”等标题直接替换成恒寿斋。

## 7. 恒寿斋：保留明确定位的构造局部

- 李燮平《从乾隆朝养心殿的改造看明清紫禁城硬山建筑的变化》，《故宫博物院院刊》2020 年第 10 期，总 222 期，页 133–148：[官方 PDF](https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf)，[官方介绍页](https://www.dpm.org.cn/building/talk/254632.html)。
- 页 137 图 13 图题明确“武英殿恒寿斋檩头下燕尾枋”。注意是“檩头”，不是“檐头”。
- 现代彩色局部，拍摄日期未知。正文指出该枋抵博缝板，与正身垫板不是一根通长木材，以榫卯关系相接；图见出挑檩头、红色底面与蓝绿彩绘构件。
- 文件 `hengshou.pdf`、`hengshou-p137.png`。单看图 13 不支持整座形制；进一步核得 pp136–137 的连续正文明确将恒寿列入不出墀头的素山硬山类型，详见第 12 节。仍无开间尺寸、进深尺寸、门窗数量或室内分隔实测；文章对构件年代的讨论不等于本楼确切营建年。
- 2015 年匾额论文页 145 说明 1907 年将敬思殿东北配殿命名恒寿斋，可与现代位置互证；尚不能单凭这一点把 1902 全图上某栋小房的全部参数无条件移植为恒寿现状。

## 8. 保留的缺口与排除项

- 集义、本仁：现在有分别定位的近现代正立面，不再只有名称/用途；近现代室内仍未核实。1916 集义照片保留为历史结构参考，不替代现代内饰交付。
- 凝道、焕章：现已补到分别绑定东、西配殿的 2021 陶瓷馆全景（第 9 节），不再只有鸟瞰与历史图。全景照片仍非 2026 现场清点。1914 改廊史、晚清工程与现代展厅不得混成同一年代。
- 恒寿：第 12 节新增历史三间图样、2007 具名平面、2020 硬山类型正文，可支持有限的体量／入口／端部修正，但现代完整立面、全屋架、门窗与内饰仍未核得，不能标作全楼实测完成。
- 新查两张“文华殿鸟瞰”刊物图均从东南取景，主殿/文华门与树冠遮挡配殿：`wenhua-aerial-a.pdf`（印刷页 47）、许静《清代皇子教育对经筵的影响》，《紫禁城》2019 年第 8 期页 81，`wenhua-aerial-b.pdf`。没有用遮挡部分补集义结构。
- 未将 2021 陶瓷馆无房间标识的室内展柜照片套到任一配殿。现代陶瓷展中的“洞房”“家宴”是借坤宁宫/乾清宫元素再创作的展陈，不是凝道或焕章的清代本体室内。


## 9. 凝道、焕章：新增分别定位的现代陶瓷馆室内全景

### 来源、年代和可追溯绑定

- [故宫青少网站官方展览数据](https://young.dpm.org.cn/node/256)，记录 `id:988` 直接将“陶瓷馆”链接至本全景，展览地点武英殿。该页面当前含“暂闭”文字，但未提供该状态生效日期，不能用于判断 2026 当日开放。
- [全景入口](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/tour.html?exhibit_id=140)。2021 改陈开馆时期资源，具体摄影日期未知；`20210517` 目录不当作摄影日。
- [公开 tour.xml](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/tour.xml) 与 [公开 layer.xml](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/xml/layer.xml)。没有解密、登录或读隐藏接口。
- XML `area_3` 明称“西配殿”，载入 `scene_w02`，场景 `w02,w03,w04,w05,w10,w09,w08,w07,w06,w11,w12,w13` 依次标“西配殿展厅01–12”，统一 `map_area(3)`。官方建筑页和 2020 刊物确认西配殿是焕章殿。
- XML `area_4` 明称“东配殿”，载入 `scene_w15`，场景 `w15,w16,w17,w18,w19,w20,w21,w22,w23,w24,w25,w01` 依次标“东配殿展厅01–12”，统一 `map_area(4)`。东配殿为凝道殿。
- [西配殿 map3](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/maps/map3.png)、[东配殿 map4](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/maps/map4.png) 是各自的展陈导航示意，不是古建测绘图。两图有中央院门、长向展柜/通行区及两端大型展陈区，不能用灰块推断古建承重墙。
- `w07` 为西配殿第 08 景，对应场景零基索引/导览点 `139`；`w22` 为东配殿第 08 景，对应点 `151`；`w18` 为东配殿第 04 景，点 `147`。[公开 panoaction.xml](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/xml/panoaction.xml) 的 `activatespot3/4` 明确用当前 scene.index 选择 spot，因此绑定可复核，不把“武英殿展厅”的普通总标签当配殿定位。

### 焕章殿：直接可见的古建与现代设备

- `w07-u` 完整上向面：蓝绿底、金色/浅色纹饰的较大梁枋和其间的细椽可见；椽条绿色，椽间红/赭色，形成密集线列。可见部分为外露梁架，不是完整平顶天花。个别小圆白点仅按可见附属物记录，不擅定为烟感或灯具。
- `w07-b` 面向院门：红圆柱在门口内侧可见；门扇上部为大玻璃分格、下部红色雕/压线裙板。侧面门窗内有深灰卷帘，下面为现代柱片式暖气片。窗格在帘后受遮挡，不可据此恢复隐藏的全部棂格。
- `w07-f` 背墙方向为连续透明玻璃展柜，暗红底座/上框，灰白织物质感背板和两级台座，前沿独立斜放小标签。古建后墙被柜背挡住，不证明原高窗消失，也不能把展柜背板当永久建筑墙。
- `w13-f`（西配殿第 12 景）可定位到一端的“宫廷宴饮”现代展陈：黄缎覆盖餐桌上成行瓷碗，红色围合展陈板和红色低平顶内嵌小射灯；背景为乾清宫图像。左侧上方仍见更高的古建梁架。该红顶是展陈包围体的一部分，不是整栋焕章的古建天花；桌子是现代展示装置，不是焕章清代家具位置证据。
- 另一端的红色展陈区在预览中可见，但没有因“洞房”主题而恢复焕章清代寝室。照片中的主题说明及 2020 改陈文章都只能解释现代策展。

### 凝道殿：另行取证，不镜像套用焕章

- `w22-u` 完整上向面：直接可见独立于焕章的蓝绿彩画梁枋、红绿椽列，与下方红色长展柜顶边分离。可见中央通行部分没有满铺平顶天花；不能据此断言所有边角/展陈包围体均无顶板。
- `w22-b` 面向西院门：红圆柱、红玻璃门上扇/下裙板、灰卷帘与下方暖气片，灰色方砖/石板状铺地可见。遮帘后门窗棂格与准确材料没有完全核实。
- `w18-u`（第 04 景，靠门窗侧通道）补出一段明亮可辨的梁架节点：较大横梁、圆形檩类构件、短承托构件和密集椽列；现代卷帘上沿/珠链在画面边缘，另侧下方有独立红色展陈顶。可以支持立体层次，不能从球面透视量出断面或全柱网。
- `w18-f` 同位置朝端部展陈：红色围合墙板、红低平顶与点状轨道射灯、透明玻璃罩，三层台阶状灰白展台承托多件器物，后方皇帝画像与现代说明板可见。确认这是现代展陈，不是凝道历史寝宫或宝座间。
- `w22-f/r` 为中央长玻璃柜与长向通道，柜后墙被遮，不能判断所有后墙高窗或旧隔断。

### 原图链接、本地证据及限制

- [焕章 w07 上向第一块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w07.tiles/u/l1/01/l1_u_01_01.jpg)。
- [凝道 w22 上向第一块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w22.tiles/u/l1/01/l1_u_01_01.jpg)。
- [凝道 w18 上向第一块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w18.tiles/u/l1/01/l1_u_01_01.jpg)。
- 场景全预览：[焕章 w07](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w07.tiles/preview.jpg)、[凝道 w22](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w22.tiles/preview.jpg)、[焕章 w13](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w13.tiles/preview.jpg)。预览由左、前、右、后、上、下六方拼带组成。
- 完整 1024×1024 面保存在 `pottery-w07-{u,f,r,b}-l1-assembled.jpg`、`pottery-w22-{u,f,r,b}-l1-assembled.jpg`、`pottery-w18-{u,f,b}-l1-assembled.jpg`、`pottery-w13-f-l1-assembled.jpg`。每面四块，原块在 `pottery-face-tiles/`，原 URL 和每块成功状态在 `pottery-faces-manifest.json`。本批连同第 10 节共 56/56 块完整。
- 预览联系表 `pottery-west-preview-contact.jpg`、`pottery-east-preview-contact.jpg` 只供定位。少数预览收到 HTTP 503，联系表留灰而非补图；不影响上述完整面。`pottery-previews-manifest.json` 记录成功与失败。
- 可以支持“古建外露梁架 + 低于其下的现代展示包围体 + 中央院门及沿长向通路”的分层建模。不能将两端红色展陈区视为清代暖阁，也不能以现代馆图清空历史模型并宣称恢复清代原状。全柱数、精确梁径、隔墙厚度、全部后墙开窗与 2026 展陈变化仍未知。

## 10. 附：武英主殿、敬思殿分别核得的上向面

- 同一 2021 官方全景。`scene_d111` 标“武英殿展厅14”；`scene_60` 标“武英殿展厅81”，场景索引为 `83`，layer 中 `spot83` 位于主展线 map1 的 x=49.8%、y=13.6%，即工字形上方后殿中轴大瓶柜前，与 R37 敬思定位相符。`d111` 索引 `16` 对应 x=79.5%、y=76.4%，在下方前殿。导览图是位置互证，不当尺寸图，不凭“武英殿展厅”总标题判定后殿。
- [d111 上向第一块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/d111.tiles/u/l1/01/l1_u_01_01.jpg)、[60 上向第一块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/60.tiles/u/l1/01/l1_u_01_01.jpg)。
- 各自完整 768×768 面 `pottery-d111-u-l1-assembled.jpg`、`pottery-60-u-l1-assembled.jpg` 均由各自四个原图块拼合，无互相借图。
- 两处分别直接可见绿色方格天花，格心圆形金色纹饰，细格条交点花形/结状装饰，蓝绿金大梁框围。彩画有明暗、磨损差异，不能用统一纯金菱格取代。
- 下方亮白大矩形属于独立展柜顶灯，边框暗红、配一排小射灯；照片中有多个玻璃反射斜边。不能把亮矩形或镜面反射铺成全厅天花。
- 这两殿的方格天花不能套给上面直接见裸露椽列的凝道、焕章。两类真实可见结构不同。


## 11. 附：主敬 a075 上向与正向面

- 沿用 R39 已定位的文华后殿 `a075`。资源为 `20260911-dz` 第一期包，不是未核实的第三期或 10 月第二期陈列。具体摄影日期未知。
- [公开场景 XML](https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/tour.xml)，`scene_a075` 指向 `panos/a075.tiles/`；XML 标题仅 a075，不能靠这一标题独立认建筑名称。
- [上向原图块](https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/panos/a075.tiles/u/l1/01/l1_u_01_01.jpg)、[正向原图块](https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/panos/a075.tiles/f/l1/01/l1_f_01_01.jpg)。
- 完整 `zhuijing-a075-u-l1-assembled.jpg`、`zhuijing-a075-f-l1-assembled.jpg`，每面 768×768，各四块；八个原块均保留，URL 清单 `zhuijing-a075-tiles-manifest.json`。
- 上向面曝光很暗，能辨方格天花、格心圆形纹饰和较大主梁；下方另有深色细轨道/灯架及短白光段。不能由暗部读定全厅配色、所有纹饰和梁断面，也不能把现代灯轨当古建细梁。
- 正向面有落地红圆柱和柱础、紫褐色连续柜背、透明罩、细上缘照明、近水平长承托；柜上方另悬浅色窄长竖向吊签与细线。吊签不是古建匾额，不能当梁枋上固定额枋；本次不转抄小字。
- 两个上向图块首次返回 503，第二次同公开链接成功；layer.xml 返回 404，因该版改用 3D model 配置，不据此宣称有不存在的平面导航图。未改用 VR 面或解密数据。

## 12. 恒寿斋：三间平面与素山硬山的新增证据链

### A. 2007 年刊载的具名平面，不是样本统计推出来的柱网

- “故宫古建筑木构件树种配置模式研究”课题组：《故宫武英殿建筑群木构件树种及其配置研究》，《故宫博物院院刊》2007 年第 4 期，总 132 期，pp6–27。[官方介绍页](https://www.dpm.org.cn/building/talk/224461.html)。研究于 2004–2005 年开展、2006 年结题；出版年不等于平面测绘年。
- [p8 原页 PDF](https://img.dpm.org.cn/Uploads/pdf/5077/T00008_00.pdf)：图 1“武英殿区平面图”有北向箭头，东北角一座独立东西向矩形直接标“恒寿斋”，南边中央画出踏步。北侧长边清楚有四个柱位符号，形成三段；南侧相应节点较模糊，不据此报现代全柱总数。此图不是南北纵长的“凝道殿北值房”。
- 同页正文明确把恒寿斋写作关帝殿，并把东配北值房另列为东库房。p6 内容提要也把恒寿斋与东、西配殿北值房分别列举。因此官方 2021 陶瓷馆“窑址标本展”的东配北值房不能移名为恒寿。
- 正文在 pp7–8 将焕章／凝道的东、西括注对调，属于文内不一致；图中左右标签及其他官方建筑页相互一致。不得借此错误反转两配殿。恒寿的具名东北平面及关帝殿别称不受这个方位括注错误替代。
- [p20 原页 PDF](https://img.dpm.org.cn/Uploads/pdf/5077/T00020_00.pdf) 表 11 是恒寿不同木构件的树种**采样**统计。柱 6、梁 4、檩 6、枋 3 合计 19 是采样数量，绝不是现存构件总数或柱网坐标。材料检测仅能证明采到的柱／梁／檩／枋及树种，不能把全部梁统一做某种木材。
- 本地：`wuying-wood-pages/00.pdf` 至 `21.pdf` 及逐页文本；`wuying-wood-p008.png`、`wuying-wood-p020.png`、`hengshou-2007-plan-detail.png`。局部图只是原图裁切放大，没有矢量重绘。该简化区域平面未画室隔，不证明实际没有隔墙。

### B. 1902 年历史修缮图，借别称与位置双重绑定三间

- 官方“丹宸永固”展品 `8420`《武英殿各座殿宇房间墙垣月台丹陛等工地盘式样图》，中国第一历史档案馆藏。图本身未署年，官方说明根据工程内容与档案判为光绪二十八年（1902）修缮图，不要省略“官方考定”这一年代来源。[官方展品数据](https://ggzl.dpm.org.cn/app/api/app/exhibitionListPc/112)。
- [原幅图](https://ggzl-img.dpm.org.cn/ggbwg8//app/gugong/2020/0911/XzGYVc80KfXz3j48eFgWihKpzWvE0Z8mcJFeyYGK.jpg)：东北角最北的小横向矩形，黄签右列明确“關帝廟一座三間”，图上也画为三段。与 A 的同位置及关帝殿别称交叉绑定，可作为恒寿的**历史三间体量**依据。
- 本地原图 `wuying-1902-plan-b.jpg`、正确局部 `hengshou-candidate-1902-northeast-crop.png`。早先的 `wuying-1902-ne-wing-crop.png` 截取的是其南方纵长北值房，**不是恒寿**，不能套其尺寸、屋顶或门窗。
- 另一件官方展品 `8512`《武英殿补建正殿后照殿西配殿提调房等地盘尺寸准底图》，只标清代（1644–1911），[原图](https://ggzl-img.dpm.org.cn/ggbwg8//app/gugong/2020/0911/dLFXi1ghkx2wfcsnB5BswMoKVAdB0JdYh4GvPRW9.jpg) 同位置也标关帝庙三间；本地 `hengshou-candidate-qing-measured-crop.png`。该小房处未读到尺寸，不补填全图其他房屋的尺寸。
- 已逐段目视展品 `8515` 的长幅重建清单（`wuying-1902-specification-segment-0.png` 至 `6.png`），读到正殿、后殿、西配殿、浴德堂及值房等，没有找到可绑定关帝庙／恒寿的单独条目。因此不套焕章“五檩前落金挑山”或邻值房“四檩卷棚”给恒寿。

### C. 2020 年正文补足屋顶类型，而不是从局部照片猜全顶

- 李燮平论文来源、页码见第 7 节。PDF 第 4、5 页是纸页 136、137；完整渲染分别为 `hengshou-p136.png`、`hengshou-p137.png`。另外第 1 页 `hengshou-p133.png` 保留类型定义上下文。
- p136 原文短句：“在紫禁城现存不出墀头的素山、硬山建筑中”。p137 承接介绍另一种檩端加燕尾枋的形式，并明确以恒寿斋及图 13 为例。原文关键：“另一种素山、硬山建筑的做法是与博缝板衔接的檩端下另加燕尾枋”。这为恒寿的**素山硬山、不出墀头类型**提供正文支持，图 13 则证明其局部彩绘节点。
- p133 对此类早期硬山的解释是：山墙止于檐柱／廊柱的柱中位置，柱外侧可露出，檐口用博缝板；不能偷换成后世向檐柱外筑墙腿、添墀头的普通清式硬山。也不能把“端部不是通长悬挑悬山”误做为前后檐全部无挑出。
- 图 13 真实拍摄日和具体哪一山端未注明。可按直接可见的红底、蓝绿彩画、出檩与局部燕尾枋关系处理该构造类型；仍不能确定完整屋架、全部柱数、屋面颜色、正脊／吻兽、所有门窗、另一个山端是否有历次差异。

### D. 本次检索的真实缺口

- 已查官方 2021 陶瓷馆全部场景标题／导航地图，未找到恒寿自身展厅或具名外观；东配北值房另有身份，不能占用。2020 p28 鸟瞰及现代院内视角的遮挡处未作为恒寿全貌。
- 已查《武英殿大修竣工》12 页、《透过菱花窗看时尚：谈武英殿绘画馆的室内设计方案》6 页、2004 年鉴相关修缮页以及 2024 木结构树种综述。获得其他殿明确图片或材料背景，但未找到恒寿完整立面／室内。40/40 新 PDF 原页下载记录保存在 `wuying-papers-manifest.json`；未发生访问许可拒绝。
- 结论：历史三间 + 2007 具名南中踏步平面 + 2020 素山硬山类型可用；“当前整楼门窗／屋架／室内布局”仍因直接证据缺失而 blocked。没有把近现代出版日期冒充照片拍摄日期，没有以新资料宣布现代房间格局已经完成。

## 13. 武英主殿西山墙外白石栏：2021 全景近图独立支持中段

- 沿用第 9 节的官方 2021 陶瓷馆全景。`scene_w02` 官方标题为“西配殿展厅01”，右面 `r` 回看主殿西山墙；红实墙、高位小窗和灰色高台共同定位该段，不是远处南月台。真实拍摄日未知，目录 `20210517` 不当作摄影日。
- 完整面 `railing-w02-r-l2-assembled.jpg` 为 1792×1792，16 个原块完整拼合。中段目视裁切 `railing-west-gable-middle-detail.png` 仅放大原像素。可直接看见与西山墙平行的连续白石平栏板／柱列，位于灰色高台外沿，与红墙之间留出台面。
- [中段原块 A](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w02.tiles/r/l2/02/l2_r_02_02.jpg)、[中段及西南转角原块 B](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w02.tiles/r/l2/02/l2_r_02_03.jpg)。
- 当前可以仅实现西山墙外**可见中段，两端退开**。本图不能确定北端完整终止与连廊接法，不造全圈，不把远月台栏挪到旧窄前台基。
- 仅作防误建约束：`scene_01/l`、`scene_02/l`、`scene_w02/r` 各自看见南月台西侧下行阶口和端柱／斜栏；必须留口。西阶口两边的平栏经折角接平台，不是无限直线。`scene_01/b` 又见南月台中央甬路贯通，南边栏在路旁转向南，不允许横栏封路。东阶另由 `scene_w15/f` 直接证明，不从对称推定。
- 月台西阶、南甬路及回折不在当前中段实施范围。树遮挡踏步和部分下口，不能给精确步数、柱距、绝对长度。完整约束和原图 URL 清单另存 `railing-check.md`；`railing-faces-manifest.json` 52/52 l1 原块、`railing-faces-l2-manifest.json` 64/64 l2 原块。

## 14. 补充：焕章具名现代正立面照片／立面图

- [官方《武英殿大修竣工》页面](https://www.dpm.org.cn/building/talk/224402.html)，刊物扫描页 28–39。页 39 中部照片明确配“焕章殿”，下方明确标“焕章殿正立面图”。[p39 原页 PDF](https://img.dpm.org.cn/Uploads/pdf/4882/T00039_00.pdf)。
- 本地 `wuying-repair-p039.png`、`wuying-repair-pages/11.pdf`。照片可核长向黄色屋面、正面五间分组与檐下装修；立面图可辅核整面关系，不根据缩印页反算实测尺度。刊物属修缮完成报道，原摄影日期／图纸测绘日期未给，不写成 2026 现状。
- 同页上方“武英殿台基”的白栏照片没有单独给完整方位；只作石栏样式补充，不替代第 13 节的可追溯西山墙定位。

## 15. 两配殿另一端的现代展陈：分别定位，不镜像／不复原历史寝宫

### 定位方法与导航端位

- 仍为第 9 节官方 2021 陶瓷馆资源，真实拍摄日期未知。新下载 36/36 原块，9 个完整 1024×1024 方位面；`pottery-other-end-manifest.json` 保存每块原 URL、行列与成功状态，原块目录 `pottery-other-end-tiles/`。
- `tour.xml` 中场景顺序是零基 `scene.index`；`panoaction.xml` 的 `activatespot3/4` 用该索引对应 `layer.xml` 的 spot。下列百分比只是导航图 UI 坐标，不是建筑测量。
- 焕章：`scene_w04`“西配殿展厅03”→ map3 `spot134`=(57.8%,67.3%)；`scene_w05`“西配殿展厅04”→ `spot135`=(73.8%,81.6%)。在图的**下端**，与已有宴饮端 `scene_w13`→`spot143`=(74.8%,19.3%) 的图上端相对。中央院门在 map3 右侧中段，端区旁靠门窗一侧保留通路。
- 凝道：`scene_w25`“东配殿展厅11”→ map4 `spot154`=(41.5%,32.3%)；`scene_w01`“东配殿展厅12”→ `spot155`=(26.0%,19.3%)。在图的**上端**，与已有三层灰台端 `scene_w18`→`spot147`=(24.6%,79.9%) 的图下端相对。中央院门在 map4 左侧中段，端区旁同样有靠窗侧通路。
- 地图本身没有北针；本节直接报告图上／图下，未凭地图图案对称创造地理朝向。院门相对侧由各自图和现场回望面共同确认。图上的大灰块是展陈导航占位，不能一律当古建实墙或房间。

### 焕章图下端：红布桌台和婚庆背景画面

- `pottery-w04-f-l1-assembled.jpg`：玻璃后有低于大梁的暗红平顶和红色围板，顶内小点灯；近处为红布覆盖的长方桌台，台上有不同大小器物。最里面是带弧线轮廓边饰的平面布景，画出床榻、条幅等，不是可证明实体三维床榻的图像。
- `pottery-w05-f-l1-assembled.jpg`：同一区从侧向看到另一红布桌台、双喜字与对联形式的墙面图案；前述床榻画面在左侧，右侧为现代说明板。玻璃边／接缝可见，红低顶有连续灯带及点状灯。这是婚庆主题现代展陈，不是焕章本来的洞房。
- `pottery-w04-u-l1-assembled.jpg`：古建蓝绿金大梁、较细中部纵向构件、绿椽红／橙板与低红展陈顶同时可见，二者高度层次分开。不能把低顶扩展覆盖整个屋内。
- `pottery-w05-r-l1-assembled.jpg`：一侧红柱和柱础、灰卷帘、其下暖气片，另一侧玻璃展陈，二者间有窄灰色铺地通道；朝中央看能见长柜与远端黄色宴饮区。足以支持中央门—长向通道—端部柜体的连贯关系，不给精确宽度。
- [w04 正向第一原块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w04.tiles/f/l1/01/l1_f_01_01.jpg)、[w05 正向第一原块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w05.tiles/f/l1/01/l1_f_01_01.jpg)、[w04 上向第一原块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w04.tiles/u/l1/01/l1_u_01_01.jpg)、[w05 通道第一原块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w05.tiles/r/l1/01/l1_r_01_01.jpg)。

### 凝道图上端：深木长案、屏风与玻璃包围

- `pottery-w25-f-l1-assembled.jpg`：玻璃后的低红平顶／红围板内部，有青绿花鸟纹多扇屏风，屏前有深色木坐榻／几及软垫，侧墙有立式人物肖像图和现代说明板；前侧另见青绿色大瓷缸及深色托架。这里不是另一端的三层灰色阶台。
- `pottery-w01-f-l1-assembled.jpg`：靠窗侧向端柜内拍摄，近处为一张深色长案，案上器物；后侧为屏风与坐榻，红围板上的肖像是平面图像，右侧为现代双联说明板。低顶有细灯槽／点灯；不要把整个红展陈背板当原建筑墙，也不要把现代展陈复原为凝道清代原位家具。
- `pottery-w25-u-l1-assembled.jpg`、`pottery-w01-u-l1-assembled.jpg` 独立显示该端古建蓝绿金花梁、绿椽红板仍在更高处，低红展陈顶位于下方，玻璃有反射。存在多个梁断面／连接层次，不能用玻璃里的反射再增加重复梁。
- `pottery-w25-l-l1-assembled.jpg` 显示端区玻璃外侧通路、红圆柱、灰卷帘与白色柱片式暖气片。玻璃后的屏风一角与现场柱位同框，可以区分可通行的建筑窗侧和不可进入的端部展陈体。
- [w25 正向第一原块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w25.tiles/f/l1/01/l1_f_01_01.jpg)、[w01 正向第一原块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w01.tiles/f/l1/01/l1_f_01_01.jpg)、[w25 上向第一原块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w25.tiles/u/l1/01/l1_u_01_01.jpg)、[w01 上向第一原块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w01.tiles/u/l1/01/l1_u_01_01.jpg)、[w25 窗侧通道第一原块](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w25.tiles/l/l1/01/l1_l_01_01.jpg)。

### 实施边界

- 两殿各有自身两端照片与中央长柜证据，四个端体内部不同，不可两殿镜像同配，更不可把婚庆平面布景当实体床。
- 可支持低红顶、玻璃围合、端部展示台／家具类别及中央通路的相对拓扑。并不授权从照片清点出全屋古代家具，亦不提供精确开间宽度、全柱网、柜体进深、当前器物陈列数或 2026 是否改陈。
