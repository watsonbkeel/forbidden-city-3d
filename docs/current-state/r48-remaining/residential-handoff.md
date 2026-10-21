# R48 东西六宫剩余 12 身份交接

## 实际结果，不是全套复原验收

- 12 个精确 catalog ID 全部有处置记录，不按殿名模糊匹配，不触及前轮 19 个身份。
- 外观：11 个 actual-change，1 个 reviewed-retained（延禧）。
- 内饰：9 个 actual-change，2 个 reviewed-retained，1 个 evidence-blocked。
- actual-change 只表示本轮确有改变，不表示完整内饰、完整历史时期库存或现状测绘恢复。
- 延禧本轮无几何改动。养心在中央藻井类型之外，已实际移除旧11格前立面、重建三结构间/似九分格及明间/西次间连排卷棚抱厦；主顶、GLB 和原家具保持不变。后门、工字连接及西暖阁细分并未完整重建。

## 接口与隔离

文件 `src/scene/palace/special/RemainingResidentialHalls.js` 导出：

- `resolveRemainingProfile(zoneId, item)`：精确 zone、name、x、z；不匹配返回 null。
- `buildRemainingHall(kit, item, profile)`：10 个 replace profile；返回普通 hall 结果。
- `augmentRemainingHall(kit, item, built, profile)`：养心和延禧。须先调用原 builder；延禧须仍是 `buildYanxiRuin`，不是 `kit.hall`。
- augments 拒绝重复安装、别的 frame、错 profile 和改动的 retained envelope。

不得把 replace profile 接在已有専用 builder 后重复盖壳。集成由 owner 完成，worker 未修改 ZoneBase、数据 JSON、GLB、共享原语或任何既有 tracked 文件。

当前冻结模块 SHA-256：`616edcc6c15ae7026b2d7164e4f9bf1f3d95dcca165c8f840f41f85cbe605070`（13:26 UTC 冻结，owner 已复制核对）。旧版 hashes 仅保留在下方修复历史中。

## 逐项内容与来源

| 身份 | 本轮实质内容 | 限制 |
|---|---|---|
| 承乾宫 | 五间保留，前次梢间槛墙菱花窗，双凤类型原创天花，德成柔顺字体匾 | 原家具未核，仍保留 |
| 景阳宫 | 三间庑殿保留，玻璃槛窗，双鹤类型原创天花，柔嘉肃敬字体匾 | 未移用后殿御书房家具 |
| 永寿宫 | 前后中门与菱花槛窗，令仪淑德字体匾 | 家具仍为未核占位；开门所需退让不是测绘位置 |
| 永寿宫后殿 | 自动七间改五间硬山、无斗栱 | 室内原家具 reviewed-retained；不算一套内饰更新 |
| 翊坤宫后殿 / 体和殿 | 五间硬山、后廊；中穿堂、东西各两间相连；西间两椅夹方桌 | 关系依据西间照片，木色/尺寸为拟合；没有把侧殿图当正殿宴桌 |
| 太极殿 | 前后廊、步步锦槛窗；清末民初五蝠寿类型天花；两类不同罩框；2.2m后廊访问拟合与两处可见侧阶 | **两罩的东西配置没有被来源确认。现在只是可逆模型分配，不是史实方位。后廊深度/侧阶是非原状访问拟合。** |
| 太极殿后殿 / 体元殿 | 五间硬山；前三道宽洞花罩框类型，西梢间有门隔断；北接三间卷棚戏台 | 首三罩开口6.4m、西门2.4m都是观览拟合；不复制密集木雕或戏台器物 |
| 长春宫后殿 / 怡情书史 | 自动七间改五间硬山，怡情书史字体牌 | 原家具保留未核；不从长春主殿移入床炕 |
| 咸福宫 | 三间庑殿保留；前槛窗、后中门与实墙；棋盘天花 | 现存家具未核 |
| 重华宫 | CATALOG_NAME_FIT 同名中院正殿五间硬山、三间抱厦；东葫芦罩类型/西隔扇 | **当前坐标与三进院复合地理位置未校核。不是全重华宫复原，也不是崇敬殿乐善堂。** 原座台收窄至3.7m防碰隔断，非实测 |
| 养心殿 | 中央顶口 + 素色八角层圈；旧11格实际移除，三结构间/九前立面分段、8主柱6方次柱及窗门；明间/西次间非对称连排卷棚抱厦、实际接檐和承托、前平台台阶 | 官方总宽36m、深12m，但三/九均分及柱轴外退0.35m都是拟合；主顶与GLB不变。后门、工字连接、西暖阁各室未完整重建，无龙纹或吊灯伪复刻 |
| 延禧宫 | 复核既有 R32 石铁五亭遗迹，原几何不动 | 外观 reviewed-retained；当前内墙瓷砖分布无可靠证据，interior evidence-blocked，不补想象瓷砖 |

来源页：

- 承乾：https://www.dpm.org.cn/explore/building/236438.html
- 景阳：https://www.dpm.org.cn/explore/building/236511.html
- 永寿：https://www.dpm.org.cn/explore/building/236450.html
- 体和：https://www.dpm.org.cn/explore/building/236529.html
- 太极：https://www.dpm.org.cn/explore/building/236475.html
- 体元：https://www.dpm.org.cn/explore/building/236544.html
- 长春：https://www.dpm.org.cn/explore/building/236436.html
- 咸福：https://www.dpm.org.cn/explore/building/236507.html
- 重华：https://www.dpm.org.cn/explore/building/236506.html
- 养心：https://www.dpm.org.cn/explore/building/236442.html
- 延禧：https://www.dpm.org.cn/explore/building/236535.html
- 西六后殿硬山论文，印刷第135页：https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf

## 图像身份使用边界

- 体和西间 `https://img.dpm.org.cn/Uploads/Picture/dc/8040.jpg`：只用两椅夹方桌关系，不把器物形制虚构出来。
- 体元内景 `8041.jpg` / `8042.jpg`：宽中央洞、雕花侧部小矩形开口；新模型只有素色框架关系。
- 体元后戏台 `https://img.dpm.org.cn/Uploads/Picture/dc/3968.jpg`：三间开放戏台/卷棚类别；所有长度和接檐高度为拟合。
- 重华外景 `https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff075737310.jpg`：抱厦体量参考。图库带“乐善堂”匾的内景属崇敬殿，不用于同名中院正殿。
- 养心 `https://img.dpm.org.cn/Uploads/image/2026/04/30/yxd-BZJjHldgP313.jpg`：有“中正仁和”匾的明间，顶部八角龙藻井清楚可见。URL 路径时间不是拍摄日期，拍摄日期未知。
- 太极现有5张官网图仅外观/匾额，不能补两罩方向证据；不按文字句序推断东西。

所有窗棂、彩画、罩雕、题字均为程序化或原创类别示意。没有引入馆方图片贴图或声称临摹真迹。研究缓存 `residential-references/` 不应复制进产品或计入交付资产。

## 验证与遗留

1. `node --test tests/r48-residential-*.test.mjs`：8个文件，共138/138通过。文件分别覆盖首批25、domestic24、completion11、旧墙回归5、养心前立面9、副顶承托13、主顶实物16、后廊实际控制器35项。
2. 后廊侧口以 `checkCollision` 生产默认半径0.5m完整扫描，不使用0.25m测试体。生产 `PLAYER` 没有 `RADIUS`；默认值位于 Collision 模块内部。高度、step-up导入生产常量，路线用真实 FirstPersonControls。
3. 太极和体和四侧口分别做10/60Hz、走/跑、正向/倒退，既有单殿也有真实WestSix整区构建，均无 rescue；保留家具不穿新后墙。可见太极两组侧阶与真实旋转ramp相符。廊深与台阶明确是访问拟合。
4. 养心现 GLB 用仓库自带 Draco JS完整解码；新增物体对实际三角面作交叠检查，整区邻屋/围墙同样检查。既有GLB SHA `e29192ab78f14811cbbbb94f8736d984f3c8bfece197e54cb81e023cb7c8fde3`未变。主顶全部顶点、法线、UV及transform fingerprint前后一致。
5. 养心卷棚实际按主屋面三角面求交裁切，200个接缝插值采样验证；非直桥式的窄接缝盖条高出25mm。下表面、双山面和前缘封闭使用正确FrontSide法线；柱梁顶到实际屋底射线验证接触，不用bbox替代承托。
6. 体元戏台新卷棚和重华前抱厦逐项核上/下面、侧端闭合、承托、真实接缝及踏步。详见逐ID `residential-physical-checks.json`，含N/A或baseline-retained理由、对应测试名及红→绿修复历史。
7. worker `npm run build`通过；worker ZoneBase仍未共享接线，构建通过不是集成验收。owner独立整区联测进行中。
8. 曾运行 `npm run test:current-state`：982通过/93失败，主要旧R15–R35冻结字节与路线链。worker既有tracked文件diff为空，没有改旧guard；不报告全库绿灯。
9. Chromium视觉测试未执行：沙箱拒绝浏览器socket，一次获准提升尝试在启动前遇运行环境只读错误。本包没有WebGL或原生手机视觉验收。CPU图像仅为真实三角网格的平面色z-buffer诊断，不是纹理、灯光或浏览器验收。
10. 仍需最终集成接檐视觉、真实纹理/字体、原生手机路线和独立审查；CPU通过不等同这些验收。不得把actual-change翻译成完整历史复原。

数据合并仅取 `residential-ledger-patch.json`；每条均含interior/exterior分别的status和changes。逐ID时期、来源与限制见 `residential-summary.json`。

## helper 与可重跑命令

必须复制全部8个 `tests/r48-residential-*.test.mjs`，不要只复制新增文件，因为旧completion/domestic/enclosure已有更严格回归。

- `tests/r48-residential-glb-envelope.mjs`：读取现有 `public/models/interiors/yangxin.glb` 和 `public/draco/draco_decoder.js`，用Node VM运行仓库自带解码器，不下载依赖。
- `tests/r48-residential-physical-report.mjs`：逐ID实际测量报告生成器，重跑后写本模块hash、真实射线测量、后廊clear span、测试名与修复历史。它不替代node:test断言。
- 已有fixture和产品依赖：`tests/lib/inner-palace-fixture.mjs`、`tests/lib/terrace-walk.mjs`、`src/config/constants.js`、`src/controls/FirstPerson.js`、`src/utils/Collision.js`、`src/scene/palace/kit.js`、WestSix/EastSix区域以及 `YanxiRuin.js`；均未修改。
- `residential-scope.json`为owner给的12身份fixture；本包未修改。
- 可选CPU绘图helper：`r48-residential-cpu-preview.mjs` / `.py`，使用已装numpy/Pillow。只输出无纹理CPU诊断，不作为浏览器成功凭据。
- 浏览器测试入口 `r48-residential-visual.html` / `.mjs`仅留作可用环境后复核，当前无成功记录，不需作为发布依赖。

```sh
node --test tests/r48-residential-*.test.mjs
node tests/r48-residential-glb-envelope.mjs
node tests/r48-residential-physical-report.mjs
npm run build
# 可选：只看程序化几何，不加载GLB、真实纹理或WebGL
node tests/r48-residential-cpu-preview.mjs 养心殿 /tmp/r48-yangxin-cpu.json
python tests/r48-residential-cpu-preview.py /tmp/r48-yangxin-cpu.json /tmp/r48-yangxin-cpu.png
```

### 养心外观新增来源链

- 建筑页 `https://www.dpm.org.cn/explore/building/236442.html`：前殿面阔三间、通面阔36m，进深三间、通进深12m；黄琉璃歇山；明间、西次间接卷棚抱厦；前檐每间各加方柱两根，外观似九间。等分尺寸、后檐主柱对应及0.35m外退不来自测绘，均另列拟合。
- 杨红、李广华《养心殿正殿外檐窗罩海墁彩画年代考证及其工艺特征》，故宫博物院院刊2022年第1期，印刷第73页/PDF第2页：`https://img.dpm.org.cn/Uploads/File/2022/01/14/u61e0e7fdd6c3f.pdf`。平面与文字共同确认三间及明间/西次间抱厦关系。并未把东暖阁后窗罩转作前抱厦。
- 官方原状陈列页 `https://www.dpm.org.cn/show/225716.html` 的外观照片 `https://img.dpm.org.cn/Uploads/Picture/2017/01/06/s586f3eba40de4.jpg`：目视核对连排抱厦与主体关系；URL路径不是拍摄日期证据。
- 官方匾联展说明 `https://www.dpm.org.cn/Uploads/wenhua/E44/E44c.html`：独立旁证卷棚抱厦与加柱后似九间，不由照片自行推断间数。
- 明间藻井照片见上节，明间顶部类型被确认，但不复制龙纹、贴金工艺和吊灯。

官方后殿硬山论文已下载、提取并目视核查印刷第135页，明确列永寿、启祥、翊坤、长春、储秀前后配殿与后殿为不出墀头硬山。仅用类别，不当长度测绘。

**交付不含原始馆方图片/PDF缓存。** `residential-references/`仅供证据检查，不复制进产品、不做纹理、不纳入发布包。证据链接保留在台账及本文。

## 12:50 UTC 后廊修复审计（后续小版本）

32093 中间版先前 56 项测试通过，但不代表无缺陷。随后用实际顶点及最终合并网格补测，新增 5 项全部失败：体和、太极各保留两面旧全深侧墙又增加两面短墙（4 面而非 2 面）；碰撞已缩短，最终可见射线仍命中幽灵长墙；体和后门槛也留在原后檐线上。原因是 `kit.box` 的 UV 展开将 BoxGeometry 变成 BufferGeometry，旧代码错误依赖不存在的 `geometry.parameters`。

修正为读取实际顶点包络，并一并检查重华占位座宽与养心旧平顶的判形路径。新 5 项测试包含最终 merge 后两侧后廊射线与 collider 一致性；61/61 通过。修复模块 SHA-256 为 `c3a6e5c0060f475f25508753323775c89a75f8df073efc6756fdd8bcdd61f069`，owner 已复制。首批 5 个 profile 不调用 rearInset，输出没有变化。不要把这项事后修正倒写成初版已通过相同验收。

## 13:26 UTC 实体承托与真实玩家修复审计

- 后廊：上个5项回归抓对了幽灵墙，但使用0.25m半径，对玩家通行给出错误乐观结果。独立审查用生产默认0.5m，四口全部无clear点：太极净隙0.76m、体和0.81m。改为2.2m访问拟合后四口均有至少0.40m的可操控中心线容差；太极旧宝座相应南移，不删除家具。随后发现太极0.6m侧台基仍挡地面来路，8模式全红，获批加入两处可见1.5m宽访问侧阶后，单殿/整区10/60Hz走跑正退全绿。旧小半径回归已改默认半径，不能说初版从无问题。
- 养心：初拟矩形前承梁离卷棚实际屋底约0.46m，实物射线红。改为随曲率承梁、深向梁、六个素色短撑，补独立朝下屋底和正确朝外山面；接缝盖条贴合谷线而非悬桥。实测接触、法线、GLB三角面、整区邻屋及200点接缝均绿。
- 体元：初拟北戏台梁顶离屋底约0.32m，副顶后缘伸入正殿顶下。按实际外后梁面裁切副顶，补随曲率承梁、深梁及素撑；两侧与前缘封闭。朝下FrontSide射线、真实接梁射线和北向穿堂路线通过。
- 重华：初拟完整小屋顶后坡深入主殿至local z=-2.014，实际顶点边界红。现裁切所有副顶三角形及属性至真实前墙/梁面，10mm接入；逐个切边顶点均有真实墙/梁接触射线，主顶不改。既有前檐承托实测接触，新前阶也有实物支持。
- 其余新硬山端面和11殿主顶均测实际FrontSide上下表面、合并前后可见性及檐下梁/原斗栱带承接。对原斗栱带的测量不等于历史榫卯复原。

冻结hash：module `616edcc6c15ae7026b2d7164e4f9bf1f3d95dcca165c8f840f41f85cbe605070`；ledger `791817d40169cdef857d4cc44a9b88e975ebf2cc19dfaf8446a4ed13d99038da`；summary `d03553d34d9959f26c6422d15059df44e55625d1c0fd5a27d423ba310f254dcb`；physical checks `af55d64363163ffe92d3f84454457e8052ad537a6b42745dab6aa91114a5df59`。
