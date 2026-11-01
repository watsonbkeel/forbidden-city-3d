> **独审修正仍隔离：7acc自测绿遗漏两P1。当前已补炉缝窄立面、中央肩级/独立趾与亭封板，52专项通过，待Astra复审，不准接生产。所选既有影像形制，2026施工后现状/开放未知。先读FACILITIES-C-P1-REVIEW。**

# 太和门续做

- 独立工位 `/workspace/scratch/02a8023d1a85/r157-taihemen-scope`；基准c9b25a71。精确提交用git log。`6665a502`格顶候选不可单独交付，必须连同`af10afde`撤回；`8dd27236`为自身新资料。
- 当前实际生产：Layout重檐歇山元数据 + 本门自身近景支持的前匾框轮廓。原安全挂位/朝向/深度/Canvas纹理保留，所有非匾框几何和物理保留。完整20特征仍0验收。
- **已知上翅遮挡**：地面 `[0,1.7,-270]` 3字区、两侧、下托/金内线可见，但两上翅被既有上层椽遮挡。`assertTaihemenNameboardFrameInWorld(W)`返回7近面/3字区/12屋面probe + 地面5可见2遮挡，状态PARTIAL；不允许宣称完整匾框可见或照片匹配。
- 验证：`node --test tests/photo-fidelity/batches/taihemen-*.test.mjs tests/r58-taihemen-*.test.mjs`，含隔离候选的13诊断；生产不要求顶棚consumer。父统一W可额外调用新牌匾consumer，不能拿其PARTIAL返回作整项验收。
- 实际匾框前后CPU诊断：`node --expose-gc scripts/photo-fidelity/batches/r157-taihemen/capture-nameboard.mjs /tmp/r157-taihemen-nameboard-evidence`，再用同目录`render-nameboard.py`。真实生产三角形，不含字体纹理/GPU/光照。挂点不为可见性强行移动。
- 顶棚候选位于 `scripts/photo-fidelity/batches/r157-taihemen/hypothesis/`，生产src不引用。旧capture.mjs显式注入WITHDRAWN_HYPOTHESIS，不是生产图。
- 新来源已推进，不再重复旧“无自身平面”搜索：新版公开API group9/viewpoint2805返回9张1941图与现代自身构件；读 `NEW-OFFICIAL-RESEARCH.md` / `NEW-OFFICIAL-INDEX.json`。长ID保持字符串；不猜scene、不处理受保护全景tile token。
- 下一优先：逐实例绑定铜香炉四鼎、石亭、石盒、狮对（查整场现有道具去重、总平面定位和现照交叉），以及自身平剖注册4进深/近北门钉板门。1941历史图不自动代表现存原状。没有当下位置证据不等距复制、不造隐藏内部。
- 完整scope与源ID关系见OBJECT-REVIEW/SOURCES/SCOPE-ORIGIN。已知继承失败为R38根hash与旧route缺aspect，不改旧hash。浏览器CUA缺WebGL、本地Chromium socket已拒绝；未重试/提权。
- 不改main、不部署、不碰午门/太和殿或他项，父原WIP未动；独立工位的untracked node_modules是共享依赖symlink，不提交。

独审补充：原照片明确为“太和門”，保留的原模型Canvas为“太和门”，繁简用字也未匹配，不仅是书法差异。元数据分离 sourceText/modelText；不改原Canvas冒称源字一致。consumer另检查实际可见前脸4角position→UV方向/跨度，塌缩、左右镜像与上下倒置均有RED→GREEN负控。

## 新设施来源与A反证优先读

先读FACILITIES-RESEARCH与FACILITIES-A-SPEC。源已确认现存东亭1/西匮1/四炉位置关系；旧“数量未知”被2025院刊现存描述取代。A局部16/16，不是source pass；独立source-width-red命令对生产和A均应exit1（0.244vs约0.373）。原X±4.187八种路径安全保留，但不能缩所有设施去塞旧总宽。需下一整体注册方案/父决定，才继续4炉和亭/匮实体；生产仍无任何设施A导入。

## C独审修正，先复审不接生产

7acc旧30项/123组合遗漏两个P1，不要沿用旧facilities-c-summary（已标历史）。读FACILITIES-C-P1-REVIEW/RESULT/SPEC/CONTROLS与facilities-c-p1-summary。当前命令：`node --test tests/photo-fidelity/batches/taihemen-facilities-c-p1.test.mjs tests/photo-fidelity/batches/taihemen-facilities-c.test.mjs`，52项（30原+22回归），保留原RED、4结构RED及4消费者RED。

中央115复合组已拆52石+两肩/更南趾1049，实际渲染三角生成10物理owner，不用中央大盒/NAV ramp/假地板；所选现代正照头脚围栏粗拟合。炉缝可见立面2窄盒，亭正背4封板，仍待Astra。旧坏斜线原“必挡”依赖错误宽坡，修后安全通过而测0入体/无rescue，不造障碍。八种外道端点往返及真实邻域路线保留。

代码全在scripts隔离，src/地图0新增变化。新CPU13平色+3法线分色debug在/tmp/r157-taihemen-facilities-c-p1-evidence，原7acc目录不覆盖。原近景/9图在new-official，院刊/旧三视图和中央读图crop在stone-research。捕获命令应传新目录；默认旧目录仅历史命令，勿覆盖独审证据。纯C消费者不能用于未接入生产W。

下一由Astra复审原图/四炉身份、中央可见结构、三角实体接触/碰撞/真实通路，再交父决定。25级/围栏数高与细雕未知，四炉仅类型代理、两狮未建。2026-07-31官方公告Aug3起施工，施工后形制/开放未知，不能称现测。完整20项0ACCEPTED。
