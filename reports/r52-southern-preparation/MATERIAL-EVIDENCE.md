# 文华 / 主敬：材质差异证据卡与固定机位计划

基线：R51 `fac791cf956d852e32cc9594ce537b22bca82308`。本卡仅复核既有公开来源记录和当前代码，不更改材质、shader、灯光或曝光。不是照片测色、物理材料测量或新一轮图像对照验收。

## 来源与可判断内容

1. [故宫文华殿建筑介绍](https://www.dpm.org.cn/explore/building/236531.html)：文华与主敬是相连但独立的前后殿，后殿进深较浅；不支持将二者所有内部细节复制为同一套。2026-10-22 官方搜索结果再次确认此条；直接正文请求超时。
2. [故宫“典则：唐宋书画展”新闻](https://www.dpm.org.cn/classify_detail/379521.html)，发布 2026-08-31。官方搜索结果确认开幕时间与地点。它不是逐物件当前摆位调查。
3. [第一期全景 a035 正向](https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/panos/a035.tiles/f/l1/01/l1_f_01_01.jpg) 与 [a057 正向](https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/panos/a057.tiles/f/l1/01/l1_f_01_01.jpg)：既有 R36/R39 目视记录分别支持浅色格栅屏风、木质框格/圆形通道，与穿廊高玻璃柜、浅色斜承托、低挡边。结构和相对材质类别可分，照片不测得 roughness、法线强度或准确色值。
4. [主敬自身 a075 上向](https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/panos/a075.tiles/u/l1/01/l1_u_01_01.jpg) 与 [正向](https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/panos/a075.tiles/f/l1/01/l1_f_01_01.jpg)：既有 R48 独立目视记录支持方格顶/圆轮廓、大梁、细现代轨道和浅色吊签。暗部曝光不支持精确彩画配色；这些现代设备不能材质化成古建木梁或发光装饰。

第 3、4 项采用项目中已有的目视证据链，本次未重新取得原图像素。a075 原图当前读取不可用，未尝试改路绕过访问限制。包路径 `20260911` 不是拍摄日期；拍摄日期仍未知。参考为第一期设备空间，不宣称 2026 年 10 月第二期每件作品与位置已核定。原照片不随项目重新分发。

既有证据入口：`docs/current-state/r36-south/INTERIOR-SOURCES.md`、`docs/current-state/r39-interiors/SOURCES.md`、`docs/current-state/r48-remaining/independent-final-six/source-images-reviewed.json`、`data/architecture/building-fidelity.json`。

## 当前实现与下一次应比较的差异

- 建筑铺地、墙面、木柱：共享 TextureLibrary 中 `stone_slab`、`wall_red`、`wood_column`。当前 R35 响应分别为 roughness 0.85 / 0.92 / 0.65，法线比例 0.5 / 0.8 / 0.6；实际对象可有已有局部覆盖。它们是拟合，不是故宫材料测量。新一轮先记录实际对象，不全局调参。
- 文华现代展具：SouthGalleryDisplays 的框、衬板、浅色承托、玻璃分材质。玻璃当前 opacity 0.13、roughness 0.18、depthWrite false；这些仅是代码基线。应在同机位检查柜内是否可辨、透明面排序、斜承托与背板层次，不能因单张暗照片把玻璃变成实体墙。
- 主敬顶棚：保留的共享彩画底面上加自身照片支持的格框、圆轮廓和梁；现代轨道/吊签另用 dark / paper 材质。新增轨道本身不加运行时灯与发光 shader。底面彩画完整图案未复刻，不把通用纹理说成实景彩画。
- 主敬中轴圆形对象是展示体，文华前殿圆洞是通道。材质调整必须保留这种空间差异和已有身体代理，不通过减透明度或删除碰撞来“修通路”。

## 固定机位、固定曝光的待执行对照

机位均为模型坐标拟合，先经候选世界身体/支撑检查；未经检查不得称安全相机。

- 文华南立面：eye `[-186.4, 1.7, -221]`，target `[-186.4, 5, -199]`。比较院落铺地、台基、红墙/木柱、瓦面。
- 文华前殿侧通道：eye `[-175.4, 2.9, -199]`，target `[-186.4, 2.8, -199]`。比较展框、玻璃、衬板和浅色承托。
- 主敬侧通道：eye `[-184.1, 2.9, -167.5]`，target `[-186.4, 6.5, -166]`。比较原顶面、独立格框/梁与现代细轨道，避免以自动曝光抹平差异。

每个机位固定 16:9、FOV 60、相同画质/阴影档、相同纹理清晰度、ACESFilmicToneMapping、基线曝光 0.7；比较前后版本时保持全部设置相同。分别记录北京时间 2026-10-22 12:00、18:00、21:00 的昼、暮、夜状态，不把时刻标签直接当作实测光照。

先导出每对象材质与纹理 UUID/数量、三角数、透明标记和 owned/dispose 统计，再执行真实 WebGL 同机位成对截图。浏览器 GPU 帧时、真实触控、真实手机和透明排序像素结果仍未验收；CPU 配置测试不替代。
