# 独立终审：午门完整离线亭翼装配 Task2

## 决定及范围

**2354 冻结的 Task2 完整可见离线候选，有限审查通过。** 初版4项 P1 已修并独立复验；这允许继续父已批准的后继诊断门，不批准生产安装。

本结果是 default-open、white/tile1 实际 PalaceBuilder fixture 中的一组完整可见装配，不是 fan-only 检查点，也不是历史完整建筑验收。跨实例相交/新180柱脚承托/实际碰撞与支承迁移/台面FP/新城锚点/真实TextureLibrary与finish/GPU均未通过，不能把其中任意一项借旧188脚或工程rig结果关闭。

仓库 `r157-wumen-joint-layout-1622`，HEAD仍 `5610acf44554d3b2a83cd89f33df8782810cd6d4`。最终 `assembly-task2-2323/freeze/source/qa-2354.json` 的14输入/600源/4428QA逐SHA全符。600源逐Git HEAD无变化；相对2347只有2个新增离线文件合法变化，其余12输入未动，原黄金未刷新：

- upper-assembly.mjs：`f7ca6f2e3afec8d2398f9aaf1aaa2fd23aaa8f8e8f8ae195ac73827aacfcdd93`
- upper-assembly.test.mjs：`082981a7b7ff2e00f7b6824efd556aa197c5e8c8ac8f2473be0b77158a305e86`

## 独立实测和原日志

- 2347原版独立 **19/19**，exit0；两个单点SHA锁定错误（隐藏首closedBody、将首接口标记X+3m）当时各完整 **19/19漏检**，原TAP和loader保留。
- 2354后继独立 **23/23**，exit0，TAP19.782s。没有独立重新运行作者整组40。
- 相同两个错误在最终SHA下各选新对应测试，均 **1项真实断言红**：closed-body/visible和marker精确XYZ；无loader/import失败，不混入正例分母。
- 同一私人真实捕获探针先证首onResource抛错时，B565资源中564漏回收；修后重跑 **565/565恰1次、0漏、0重复**。先前探针在记录后主动清理遗漏对象，不把清理后的状态倒写为原实现通过。
- 同一探针逐梁对照原源：12新梁shadow原false/false；最终全部true/true，与原12梁一致。
- 作者 `final-40` 原TAP/exit/resource已读核：**Task1 17 + Task2 23 =40/40**，无skip/cancel，约19.86s；不是40个新实体测试。8个最终SHA负控各选1项实红，原6个2347负控另存，未与正例相加。

所有本轮命令均为组件/数值测试或只读捕获；无World、FP、CPU、生产写入。14冻结末次核对无漂移，轻测窗口已释放。

## 四项问题如何关闭

### P1-1：横连梁实际阴影回退

原 WumenTransverseLinks 的两纵梁+四横梁/侧，实际castShadow/receiveShadow都true。新builder的通用box未传copy时落默认false，原200对象屋面shadow测试没有覆盖这12梁。

修订只将新owned-box的初始shadow设true/true，之后仍按提供的原copy覆盖。独立实捕和新逐梁测试都确认恢复；不擅自把原HallKit本来false的beam/facade改成true。

### P1-2：资源登记期间首次观察回调抛错导致已捕获B遗漏

原代码在collectSource逐项注册时立即通知onResource；首回调抛出使后续B对象从未进入清理账。修后先将B场景、builder owned材料与library cache全体登记，再通知回调。独立探针在真实PalaceBuilder finish阶段、回调之前捕获完整B资源集并逐对象监听，确认上述565全部恰1次。

这不是以“回调已宣布的对象”缩小分母，也不是统计所有构造临时geometry的dispose次数。作者最早一个此类宽泛计数弱探针曾假绿，已在ADDENDUM中披露，真正0/2产品RED另存。

正常成功dispose重复调用及body0/roof0两失败注入的原测试仍通过：A不由candidate销毁，B-owned最终恰1次，retainedB构建期间不销毁，借用B原材料与原GatePlaques纹理事件顺序守住。**不扩称任意JS getter/callback/listener或B内部构造任意异常均已有恢复证明**；本轮验证的是当前真实源、声明失败点及确定的首回调异常。内存分配失败/恶意JS安全沙箱不在承诺内。

### P1-3：六闭体/普通围护/梁原QA未核真实子实体状态

原parent-frame测试不足以发现child hidden。新有限oracle直接按不可变合同、原A材料/执行参数构造独立native Box+UV，核每个闭body、普通南北facade和上梁、12横连梁：完整position/normal/UV数组与index、groups/drawRange、morph状态、局部/有效矩阵、父引用、scale/可见/阴影/layers/render flags/普通Mesh通道，以及精确成员闭包。材料序列化比较仅去生成uuid，未只比名字。

实际隐藏、位移、截drawRange、isMesh伪装、emissive变异均拒。新源体自身未因该补强改变尺寸；实际产品变化只有前述阴影修正。该oracle是可信fixture的有限状态合同，不宣称任意shader/JS执行环境安全。

### P1-4：8非柱reference原QA只核数量/类型

新增逐一核Task1唯一ID、原reference元数据、父对象、精确XYZ、单位pose、有效矩阵与可见链、LineSegments非Mesh身份、cross位置buffer/indices/drawRange及独立LineBasicMaterial。X+3m、隐藏、拉高scale和Mesh伪装均拒。

仍只是8个未决区域的非柱图形标记；shaftCount=null、无碰撞/支承，绝不升级成8根已证实体。

## 整组证据及适用限制

### 104轴/旧B/主楼与五口

实际组包含：保留主楼本体/屋面/牌匾，6个重新登记的闭亭翼体，104周边柱、24横连工程柱、两横连屋面和梁、8非柱reference，10层surface/trim、28附属侧/底面角色，完整U平台187cells+12坡及保留五口、69/64帽、侧面外额等。原B目标根全部detached，未在新root叠加旧屋面。

104柱原position/normal/UV字节、index、半径、高度/竖直位置模板、quaternion和scale保留，仅按明确新轴平移。原188路径与新180算术不相等，8未知接口不得补造。24横连柱仍是工程模型，不是图源逐柱测绘。

主楼三个子树的记录字段、材料/属性及有效world矩阵与A对应子树精确相等；新assembly root身份/metadata是明确变化，不冒称旧全门祖先metadata全部原字节。旧B registered452/16数组保持原字段，**只是旧source证据，不能装成新对象的CM物理**。

整平台子树逐完整记录比对既有可见平台builder，不是仅拿slab替代；本阶段只default-open整体捕获。闭门整体候选、五洞实际raw通行仍要后续单列，不能从此default-open结果推出。

### 别名与生命周期

A/B两次capture并非独立性的证明：原source metadata确共享，已有真实红。修订仅对B共享plain metadata定向复制，保原描述值及原前驱签名；shared PALACE_LAYOUT data明确只读共用。graph审核覆盖对象、geometry/attributes/backing buffers、材料/纹理、metadata和物理数组/行；函数、原型、listener内部不遍历，是明确边界。

A始终caller-owned；B独立owned ledger负责，retired旧目标虽脱根仍登记直至最终回收。新factory自有资源用对应handles，材料借自B但由B/library ledger最终持有；原材质dispose联动纹理不重复销毁。

### 28角色与实际Float32共边

28为10 bracket侧面、10 downward fan、4 upperwood侧面、4 caihua侧面，绝不是28个承重体或地板。全部position/index与合同独立grid、fixture UV有针对性对照，非零三角/winding、有限单位normal与执行帧检查通过。

10层fan边40个不同点，与soffit真实tw行在Float32转换及实际worldMatrix后集合精确相等，无epsilon抹缝。该证明只涉及这两种可见边，不证明与梁/柱脚的承重、体积封闭或跨实例屋面接缝。

sourceSurface/trim原52/120组成仍是已审的非退化输出；原200 surface/48 pole退化删账未改。材料借实际B RoofBuilder的ridge/finial等，不是诊断新palette；仍是white/tile1 fixture，未验证实际贴图像素、TextureLibrary/finish或GPU。

### NE与横连

NE三不等组完整原Y/depth/material/几何buffer、2/3/2粗分及未知精细上部边界保留；X/faceZ按已审提案，有实际源物件比较。没有替其他三亭伪造NE细节，也未开历史未知入口。

两横连84顶点全Float32/原index拓扑及旧参数Y对照成立，UV按新metric参数重算；新梁几何和实际状态后继完整核。保原6×7 grid不代表所有连续mapping knot成为采样边，也不能由屋面颜色/遮挡判隐藏接头正确。

## 后续仍是硬门，不可由本次绿色代替

1. 4亭翼及main/link/pavilion跨实例逐实际面相交/分离/未决报告，不裁旧面、不藏交缝。
2. 新180柱脚与实际U/坡面承托；原34正微缺、20阈值及330边舍入记录保留，旧188脚结果不可移植。
3. owner-aware真实新增/替换碰撞与支承；HallKit局部描述不假扮112旧live柱行；旧north wholeboxes、links scopes、rails/坡/旧floor整体迁移。
4. 实际台面FP、完整足迹与body/脚高、速度、目标owner阻挡和真实1秒停稳；不能复用旧rig receiver块证明。
5. 生产安装、-419.6→新主楼锚点的联合墙/马道/阙门关系、完整回归与历史缺对象10红/38未执行、构建/远端及GPU仍未验。

当前门有限通过不增加整项完成数，不批准把离线候选hook到生产。报告与独立原TAP/loader/JSON均留在 `independent-wumen-upper-assembly-2348/`；原初审c69ba421…69724及2347两个漏检绿继续保留。

## 作者最新累计终态（报告出具前追加，只读复算）

作者 `focused-105-2357` 已终态 **105/105，10文件，exit0，30.351s / RSS424364KiB**。独立重新解析全部顶层状态/标题多重集，恰等 `focused-65-2234` 原65 + 本轮 `final-40` 的17+23，无旧标题丢失、无多算，原日志SHA和完整Counter在 `focused-105-counter-audit.json`。独立23不再次相加。

这包含既有屋面CPU collector的测试文件，不等于新完整装配CPU图渲染或GPU。本人没有重跑作者105；既有65的范围、fixture/CPU旧边界仍沿原定义。该累计绿色也不关闭本报告列出的跨实例/承托/物理/FP后门。
