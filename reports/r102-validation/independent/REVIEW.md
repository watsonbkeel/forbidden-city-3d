# R102 交泰已有织物表面 — 独立局部门通过

绑定运行提交 **c661b942ff3a17ee086838471105945f9e9b4362**，基线 R101 `1d42feef`。只读产品、独立脚本在本目录；没有替 writer 修改源码。

## 判定
允许进入累计/构建/开发候选门。改善限已有黄色罩布浅纹和低台毯边饰/内场，照片启发的工程化简化，不是文物织样复刻、实测尺寸或当前陈列证明。没有新增宝玺、陈设、文字或龙纹。

## 实际独立证据
- 两官方原图亲看、完整 SHA 核对见 REVIEW-NOTES.md；未把原图复制进发布目录。
- `snapshot.mjs` 从 R101 与候选实际 builder 独立取样：**221 mesh**。允许的 **27 目标**只有材质/UV变化；**194其他mesh**逐属性、index、矩阵、材质、阴影标志精确。所有位置/法线/index/变换及全部 collider/walkable 精确相等。结果 `comparison-final.json`。
- src/data 差异仅 `JiaotaiDisplaySetting.js` 与新 `JiaotaiTextileSurfaces.js`；无人物/地图/物理源码修改。局部快照不是全园动态运行证明；精确物理输入支持复用原路径门，不重跑大矩阵。
- `resources.mjs` **5次新builder→真实mergeByMaterial→dispose两次**：每次两专用图的身份被merge实际保留；每texture只收到1次dispose；每build新texture实例，像素确定性相等。未发生全局GPU对象缓存。2个512² RGBA为2MiB原始像素，mip约2.67MiB估算，不是实机显存测量。
- 实际材质白色乘色、SRGB、flipY=false、Linear/LinearMipmapLinear、generateMipmaps已核。导出RGBA逐字节等生产image.data；PNG解码逐字节等该数组翻Y（355/227种RGBA颜色），见 `resources.json`、`png-byte-proof.json`。
- 三对camera结构精确相等。亲看正面前后、近布/斜视及修后近布：原均匀黄块增加有尺度浅色曲纹，地毯出现多道边饰和蓝色内场，限定表面改善清楚。仍是规则程序纹样，不称真实织纹题材/密度复原。

## 确切缺陷与复验
首稿 `c02bb93` 的逐vertex主法线投影让11个已有圆柱尖每个4三角UV面积为0，合计 **44/710个非退化实体三角**。独立RED保留 `uv-c02bb93-red.json/log`。writer仅保留CylinderGeometry旧UV，未改geometry/normal/physics；最终独立重跑 **710三角，0 UV塌缩** (`uv-c661b94-green.json`)。主布面和两材质生成未改；最终全部属性/资源验证重新运行，不把首稿结果冒充修后通过。

## 限制与成本
- @napi-rs/canvas实际未安装；最终使用同一生产RGBA→DataTexture，不宣称真实Canvas执行成功。
- CPU实际采map+UV，非GPU/PBR/浏览器/手机/mipmap实机测试。远景CPU双线性无mip有点状alias；真实GPU远纹效果未验。没有把无GPU风险写成已消除。
- writer局部构建5对报告中位8.181→22.010ms（约+13.829ms），未由本审独立计时复测，不称零成本或提速；本审无正式性能并发。
- 顶部圆柱尖沿用原UV，因此细节尺度并非全部严格0.64m；受限于小尖现有几何，优先保无塌缩而非虚称统一精确织尺度。
- 全园累计/三base/发布包由其他门负责，本报告不代替它们。

## 冻结源码SHA256
- JiaotaiDisplaySetting.js: `2538af5647a88c8ad88ab0daff2510c29f5fd53f41560c9abbe3794fb41aa696`
- JiaotaiTextileSurfaces.js: `bdcfacb83c6b16754faa80336f04bf1cbf8f784dc251b8c082d572f50cae81e9`
