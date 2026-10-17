# Taihe interior visitor guide: CPU-only candidate

Prepared 2026-10-16. Based on frozen display-integration commit `475f169c1966ae37e586a11f3688819e796eff66`, tree `8ac3cf78417c2282821f6a361f789b2ea2296dd6`. This is a local text/data candidate, not a runtime-accepted release. The public Pages version remains V13. The unresolved V16 crash and all later rendering/interaction/performance acceptance gates remain open.

## Bounded change

The existing Taihe map information card gains one optional `interiorGuide`: a compact “殿内看点” list of six titled short explanations and one overall approximation/source notice. It uses the existing scrollable nonmodal panel and plain `textContent`. There are no added 3D hotspots, coordinates, dialogs, fetches, event handlers, travel actions, runtime dependencies, styles, fonts or museum media. Eight quick controls, movement, selection, input ownership and separate explicit travel are retained.

The six subjects are the throne/screen/footstool, “建极绥猷” plaque, caisson/pearl group, six gold columns, four pairs of displays, and ceremonial use. Existing CPU asset inventory supports the presence of the five physical subject groups; ceremonial use describes Taihe as a whole. CPU presence does not prove appearance, recognizability or precise historical placement. No renderer has been used for this addition.

All thirteen other cards and all old fields of Taihe remain byte-reconstructible to the frozen catalog. The original 21 source records are retained exactly. Eight necessary official sources are added as `official-cached-source`; existing Taihe and Qianqing URLs are reused without duplicate records. Per-guide source IDs are validated and included once by `sourcesFor`. The new cache enum describes the evidence actually reviewed; it does not claim a fresh web retrieval.

The optional guide is bounded to one–six entries, ID/title/text limits of 80 characters and a 400-character notice. Runtime validation rejects unknown fields, blank/HTML/overlong text, duplicate IDs and source references, unresolved references, unsafe protocols, nonofficial hosts, credentials, ports, queries and fragments. Schema validation mirrors bounded plain text and structure; cross-reference and ID uniqueness rules remain runtime checks. Existing date regexes were tested and found correct: no date-pattern or tolerance change was made.

## Reviewed copy and evidence limits

The input copy was reviewed separately on 2026-10-16, SHA-256 `73625eaf21ac337feb1bb5323b13544725b84a6157cd5862a253c9fe29032c41`. Its source-review text has SHA-256 `e2c576681108a67b46f310940491738fe70475f05d62c55baacf8f42ac8e80b7`. All ten saved source files were rehashed before integration. The sole revised entry is the plaque: the owner requested explicit attribution to the 2002 historical record, retaining the reviewed editorial preference “原匾下落未明” rather than “失踪”. The resulting 62-character text says “故宫2002年记录称…并于同年9月18日归位”. The cached page confirms both its publication date (2002-09-19, in metadata and the visible date) and the separate 2002-09-18 return event. The original evidence copy is unchanged.

- The 1964-09 throne repair date belongs to the throne, not the screen or the entire hall. Seven screen leaves are a count from the official photograph; no exact screen dimensions are claimed.
- The original plaque was not found. The official restoration record describes copies of the plaque/couplets based on a 1900 photograph and returned on 2002-09-18. It does not establish that the same replica is displayed today. “乾隆御笔” applies to the original inscription, not the later copy. No speculative translation, photographer identity or maker is added.
- Caisson position and the square–octagonal–round sequence come from the specialist article. One large/six small spheres are a photograph count. Sphere composition, weight, legends, exact aperture dimensions and suspension accuracy are unverified.
- Six refers to the group beside the throne, not every column in the hall. The shallow powder-raised/gilded decoration and two gold tones are source-backed; exact diameters are omitted because official sources use differing figures.
- The four pairs are not a complete inventory. Elephant vases, slender crane necks/legs and the incense-pavilion family are supported. An incense cylinder is not relabeled as a tripod burner. Modern positions, supports, dimensions and the exact correspondence of historical incense objects to modern displays remain uncertain. The 1992 repair study published in 1995 is not a current measurement.
- Ceremonies and the Ming-period Qianqing residential example retain their period limits. The entry does not assert daily court sessions or that all emperors always lived in Qianqing.

The notice states that these are saved official materials, not a current display survey, and that model dimensions, placements, motifs and object details are approximate/simplified and awaiting visual comparison. The original visitor-access notice remains: model travel does not confer real-world admission; readers must consult the museum's current notices. No claim of present public interior entry, dais access or throne access is made.

## Source register

Only public links are exposed in the card; the photographs and PDFs are not embedded, bundled or relicensed. Review date is not publication date. Seven new records keep `publishedAt: null` because exact publication dates were not independently established here. The new plaque-restoration record uses the cached page’s explicit publication date, 2002-09-19; this is distinct from the 2002-09-18 restoration event. Historical event and issue dates below describe the source's content, not a fresh visit.

### 太和殿

- Official source: https://www.dpm.org.cn/explore/building/236465.html
- Evidence: 六根柱、沥粉贴金及两色金箔；宝象、甪端、仙鹤、香亭四对；藻井雕龙；明清典礼用途
- Date limit: 页面正文记述明清历史与公布时的建筑陈设；本轮没有验证页面发布日期或2026现场状态
- Cached-file SHA-256: `568237a523568e7c689504fa3f1f4367e26903411ae224c574f03af9b6fc8131`

### 太和殿宝座档案

- Official source: https://www.dpm.org.cn/Uploads/pdf/5063/T00012_00.pdf
- Evidence: 宝座明代嘉靖年间断代；公开尺寸与独立脚踏；1959年重新发现；1964年9月修复完成
- Date limit: 藏品档案中的断代、尺寸与修复史，不是2026实测；本轮未确认该档案出版年月
- Cached-file SHA-256: `30e1e316154b2a18796aa1f44ba024dbb29cb671457cecd74354dd890b398c51`

### 太和殿宝座（官方照片）

- Official source: https://img.dpm.org.cn/Uploads/Picture/dc/1606%5B1024%5D.jpg
- Evidence: 七扇屏风是照片目视计数；宝座与脚踏关系；象背瓶及不同高低支架
- Date limit: 官方公开照片，拍摄日期未披露；不能视作2026当天陈列调查
- Cached-file SHA-256: `62470d916a5cd32ede38328bac5c92221c7434b6db857bd6f01e3bb10b6acf48`

### 故宫太和殿匾联复原归位

- Official source: https://www.dpm.org.cn/show/226011.html
- Evidence: 原匾联为乾隆御笔、原物未找到、据1900年旧照复制；2002年9月18日归位；复制匾及联尺寸
- Date limit: 明确记录2002年复原归位事件；不证明2026年仍为同一件，也未核验此后更换/维修情况
- Cached-file SHA-256: `2066f49b027eb80f91d3cae77cdf2ef76face65655b91568a65d5187579380f3`

### 傅连兴：太和殿的藻井（封面照片说明）

- Official source: https://img.dpm.org.cn/Uploads/pdf/1944/T00008_00.pdf
- Evidence: 位置为宝座前上方；方、八角、圆三层；近六米井口、近一点八米通高；雕龙与金饰
- Date limit: 旧刊公布的近似尺寸；文章刊期、所测时间、井口几何定义均未在本轮确认
- Cached-file SHA-256: `c08dcfb16100db3b0300a3ec23f7b2f909628a7f35235a034688f991a0ae6796`

### 太和殿藻井（官方照片）

- Official source: https://img.dpm.org.cn/Uploads/Picture/dc/1602%5B1024%5D.jpg
- Evidence: 一大六小球组为照片目视计数；周围格状天花有龙纹
- Date limit: 拍摄日期未披露；照片不能证明球体成分、重量、光学属性或2026状态
- Cached-file SHA-256: `88ca85628c22ed081bd2730f2ccc41fd6a2265643069ab5cbd4b1037019ac073`

### 紫禁城御用掐丝珐琅一瞥

- Official source: https://www.dpm.org.cn/Uploads/wenhua/E32/E32b.htm
- Evidence: 将香筒与熏炉分别列名，支持两者不可混认；金属胎珐琅陈设的概括
- Date limit: 页面未单列各物制造年代；对工艺的广义分类不替代器物专门研究
- Cached-file SHA-256: `851267cefc17755d2d93c33ebf652018c156b636e04cdfb0364f06a2ef287993`

### 霍海峻：太和殿珐琅仙鹤年代考析

- Official source: https://www.dpm.org.cn/Uploads/pdf/1527/T00040_00.pdf
- Evidence: 1992年10月修复记录；长颈细腿造型与颜色描述；通高1.68米不含木座、腿长45厘米、下喙17厘米
- Date limit: 《故宫博物院院刊》1995年第4期所刊1992年修复观察；不是2026现状测量
- Cached-file SHA-256: `70447319350cc7a402aabbffd941d4966a0efe9fc3569132e729c1c50a0fe497`

### 万秀锋：清代宫廷的“垂恩香”与“垂恩香筒”

- Official source: https://www.dpm.org.cn/Uploads/File/2019/02/22/u5c6fe8635c254.pdf
- Evidence: 室内香亭与香筒器形关联；三部分结构；历史档案中的太和殿两件垂恩香筒；不确定现代该对陈设与历史实物一一对应
- Date limit: 《故宫博物院院刊》2019年第2期；文内乾隆六年属于历史档案记载。图一未被确认是现今太和殿那一对
- Cached-file SHA-256: `8920ddf01515d5346c30a9b94cf5da76bd2f73393150678ae820b677ffa39d67`

### 乾清宫（官方建筑说明的缓存地图条目）

- Official source: https://www.dpm.org.cn/explore/building/236472.html
- Evidence: 乾清宫曾作为明代皇帝寝宫，支持用已记载的起居用途对照太和殿大典用途
- Date limit: 明代用途举例；本轮读取官方地图缓存内容，未重新请求建筑页。不能概括所有时期皇帝均住乾清宫
- Cached-file SHA-256: `f2dceb33f479f6b8b876664fbdaaf42e053eadd1c3bc752f7c65bc0522b667da`

## Verification and retained limitations

Targeted CPU tests cover the exact six texts, optional/absent rendering, the identical DOM tree for thirteen other cards, source union/deduplication, unsafe/unknown/duplicate/overlong inputs, all eight quick controls, held keyboard/joystick movement and explicit travel. Reversible source guards recover the entire original `PlaceCatalog`, `PlaceInfoPanel`, schema and catalog; unrelated input/CSS files remain frozen. Existing older source fixtures are not refreshed: their checks first reverse only this exact addition. An asset-inventory check confirms subject presence without rendering.

The guide schema CPU test requires Python 3 and the existing `jsonschema` package (verified with 4.26.0); it runs Draft 2020-12 validation without network access. This is a test-environment prerequisite, not a browser/runtime dependency, and no package was installed for this work.

The build command is `npm run build -- --base=/forbidden-city-3d/`. Detailed commands, results, manifests and receipt belong to a separate local audit packet so verification does not mutate a frozen source candidate. A final serialized full CPU sweep runs only after commit, with identical source/dependency manifests checked before and after. Focused results overlap the full sweep and must not be added to its count.

The inherited Shenwu anchor failure remains 11 m against the original 5 m tolerance. The seven-zone lint's 23 warnings remain. The large-bundle build advisory remains. Geometry, all GLBs, navigation, atlas and original performance-baseline files are unchanged. No browser, server, GPU, renderer, remote push, publication, upload, release ZIP or deployment is authorized by this work.

Later owner-authorized ordinary-browser review must inspect the long card at narrow/short viewports and zoom, native scrolling/focus, source links, no automatic travel, keyboard/physical touch, the original eight quick controls, graphics/crash behavior and performance. Neither DOM fixtures nor the build establishes any of those acceptance results.
