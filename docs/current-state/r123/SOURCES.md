# R123 来源边界

仅链接/哈希入仓库，官方原图/PDF留本地研究，不作为运行贴图或再分发包。

| 来源 | 证据 | 能支持 / 不能支持 |
|---|---|---|
| [詹文珺《储秀宫区域原状陈列发展沿革考》](https://www.dpm.org.cn/Uploads/File/2024/07/22/u669dcd8dc5647.pdf) | PDF SHA256 `3841f7aba88a83da8ab582e417e1e6dd3f113709f460adb8402918a37f7afe30`；第4页/印刷258图1已亲看 | 整院相对拓扑；无比例尺，不像素换米，窄房带未标明确耳房门 |
| [东后配官方正面](https://file-pano.dpm.org.cn/panorama/2025/07/10/eef795f1-e0a9-49a0-a195-d365fa89c8fa.jpg) | group63，600×338；SHA256 `235d5510c450d1178398ec1fa199c6dc9625bdb801dcc715458563e6c689a8aa` | 凤光室/向西/三间/中央门两侧窗由配套官文交叉；小图不支持逐格精确纹样 |
| [西后配官方正面](https://file-pano.dpm.org.cn/panorama/2025/07/10/de37bf1d-96b8-426d-82a5-f1aa1bc17732.jpg) | group60，600×338；SHA256 `fc046741dbb943141078e3904f962697784c5dc590942c79dce49649a2db6f1e` | 猗兰室/馆异名同位置、向东；牌面小字不强读，未知不造铭文 |
| [储秀宫建筑页](https://www.dpm.org.cn/explore/building/236486.html) / [丽景轩建筑页](https://www.dpm.org.cn/explore/building/236554.html) | 官方文字补建筑关系 | 不给本模型精确米制坐标或虚拟可达历史认证 |

配套公开API `https://api-pano.dpm.org.cn/panorama/api/panorama/vpGroupDetail` POST group63/viewpoint3087、group60/viewpoint3080，响应SHA分别 `9029eda0d9f031199fb9993cc125ff06ed9ee953c1d3eacab80fdd544b74b26b`、`a29acc661962ce9f96b2b5ab72d364e5a46dea7dc989782638189769a704d8c7`。身份取正文，不依图片文件名猜朝向。

完整原位来源ledger：`r123-r126-source-preflight/REPORT.md`、`source-ledger.json`、`VERIFICATION.json`（48项文件校验）。独立预审 `r123-independent-review/SOURCE-FRAME-PREFLIGHT.md`。无尺拓扑与照片都不支撑擅动整个北界，故丽景/体和/外墙保留。
