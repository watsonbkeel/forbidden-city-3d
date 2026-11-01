# R158 传心殿祝版房：三间暂定工程体量

底0e02ef9103400b5a03c0ca795ac150f83698044c（远端0c22对应净树）。原对象FC-73FC3BE9A7，仅新增ChuanxinZhubanShell.js；独立未接生产hook，唯一集成人负责正常接线。此候选只填有名称/间数依据的工程体量，**不确认现存实体、实际位置或建筑形制**，不称实景复原或现实开放。

## 证据与冲突
故宫建筑页236526及黄燕虹2001 p21仅支持“传心殿后、祝版房三间”；两者同作者同源，不当两独立票。阿乐示意图将后院曲尺房标为祝版房，修缮文献又有按神厨瓦件识别曲尺房的说法；故**不采用L形或东侧身份为事实**。屋顶、瓦色、朝向、门窗以及精确位置均未核，当前存在状态也不下定论。

和内阁祝版房必须分开：内阁官网236523正文指满本堂西的缮写处；该页下同名释义却指传心殿后贮放处，不应拿自动关联释义合并两处。官刊《清代的黄帝祭祀与文化认同》p287记录内阁缮写后送至传心殿祝版房，功能链支持不同地点。本文未据内阁房间形制套给传心祝版房。

父明确授权暂定三间矩形，不判原物形制。地图可见 `传心祝版房（三间暂定；身份位置未核）`；metadata记录 currentIdentity/location/roof/tileColor/orientation/modernFacade/currentExistence 未核，neigeSameName:false、lShapeAdopted:false、eastSideIdentityClaimed:false。神厨仍不建、不宣判已拆。

## 最小拟合边界
中心(-243,-182.5)，长9.6m、深5.6m，长向沿游戏南北轴，仅为腾让旧路的工程摆放；不会把该坐标反推成历史东侧身份。檐3.4m、脊约5.2m、素灰两坡硬山状顶、素闭墙全是未经图证的选择，不是事实。四条柱线表达三间，无窗格、门扇、吻兽、彩画、室内陈设或L形翼。闭壳不虚构可穿行房门，也不是现实实墙/关闭状态的证据。

所有外檐/柱脚/基础在X[-247,-239]Z[-188,-177]包络内。北与已建值房、南与主殿留空，中轴x=-236.5及三条原路保留，不挪旧建筑、不封院、不改河/地形。真实底板顶y=0、每个可见构件用同源三角碰撞，无新walkable/隐形支承/接触规则或全局物理修改。

## 验证边界
先做当前0e02实际World预留扫描：loadAll:false加载outer-east及当时全局实体（不是全分区），旧AABB交叠0；391个0.5m身体/水样本全部允许。之后3条组件因missing-builder真RED，再写产品；最终结果见SUMMARY和本地原件SHA。

World仅QA before-finish添加候选，验证原数组/子对象前缀身份保留、传心主殿/景行/值房ID仍唯一；不冒充正常生产hook。组件仅注册前置/变换/冻结/重复守卫，不声称晚发布回滚。2小CPU仅真实几何平色诊断，不证明照片相似、GPU或手机效果。未做全历史套件或Vite构建；待集成人正常hook/必要累计回归/构建。

## KB级低盘依赖和重现
作者树只检出package.json及新文件；测试只读借稳定0e02树 `../r158-wenhua-route-1821` 的src/data/tests/lib，1074依赖文件逐SHA在本地dependencies-local.json，测试前后核同。临时 `src/utils` 链接只供新模块引用既有TriangleSupport，冻结前撤掉并reapply稀疏；不提交链接/基线删除。完整集成树正常模块路径使用自己的src/utils。

作者专项测试是明确针对上述冻结基底的外置依赖QA脚本，重现需同路径精确基底（或显式调整测试依赖路径并重新记录身份），不能冒充可对任意新版运行的通用全项目套件。不可为了重现复制大仓。
```
node tests/r158-chuanxin-zhuban/scan.mjs
node --test tests/r158-chuanxin-zhuban/component.test.mjs
EVIDENCE_OUT=docs/photo-fidelity/r158-chuanxin-zhuban/world.json node --test tests/r158-chuanxin-zhuban/world.test.mjs
node tests/r158-chuanxin-zhuban/export-cpu.mjs docs/photo-fidelity/r158-chuanxin-zhuban/cpu
python tests/r158-chuanxin-zhuban/render-cpu.py docs/photo-fidelity/r158-chuanxin-zhuban/cpu/front.json.gz docs/photo-fidelity/r158-chuanxin-zhuban/cpu/front.png
python tests/r158-chuanxin-zhuban/render-cpu.py docs/photo-fidelity/r158-chuanxin-zhuban/cpu/oblique.json.gz docs/photo-fidelity/r158-chuanxin-zhuban/cpu/oblique.png
```
仅提交源码/测试/摘要/hash及2小CPU；原scan/world/log/CPU几何与依赖清单全留本地，不上传；原官源复用既存缓存，不下载大图。每阶段>=500MiB，不clone/新包/大构建。

## 作者专项终态
3/3组件通过；5/5绕行旧路到达，3003帧脚地差峰0m；2/2闭墙面直冲拒绝。两次体量周边绕行分别10fps步行/60fps跑步，另三条原东华东西路、桥侧接近路、文华外夹道往返。18精确三角碰撞组、46mesh、4068三角、0walkable。2CPU真实几何已亲看；首行长脚注缩短后仅重渲图，不改产品/路线/几何。1074依赖测试前后SHA完全一致；共享runtime后续变化不属于此次作者证据，可从本冻结commit的基底git对象复核原依赖。
