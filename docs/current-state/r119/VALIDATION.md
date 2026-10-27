# R119 验证台账

## 固定协议 / 来源

R118 base `3d40ed95af8009b2bff6620cc3a5ed5236c5fa15`。实际图库预载 22 色图/21 文件法线后构建；后续程序法线加入会令完整世界 `normals` 总数变为23，不是文件解码数矛盾。高细节/HD 与低细节/SD 的完整全区预建、普通 streaming (`loadAll=false`) 分别在 fresh process 验证。无未声明假材质宽松替代，无新增纹理 key、依赖或首次进区等待。

## TDD / 有效边界

- 初次 `tdd-red.tap`：5项1PASS/4FAIL；缺实际内檐mesh、口沿/笼圈、单一owned atlas（两档），保持合同已绿。上屏四边另见 `tdd-screen-red.tap`。
- 初稿把“正向可见”错误映射为南门 perimeter；独审指出后撤销这个无来源坐标，只保留西侧和既有中央承框，不能将原错误断言记为通过。
- `first-green-attempt.tap`：5PASS/1FAIL，仅镜坐标断言把继承的 JS 表达式 `6.2-.03+.02` 四舍五入写成6.19；实际几何未改，断言改为精确原表达式。
- 实际栱臂连接 RED → 加入短支点；整墙 UV 比例 RED → 局部 horizontal repeat。保留 `bracket-join-red.tap`、`frame-uv-red.tap`。
- `target-uv-green.tap`：15/15。最终 `final-r119.tap` 为19/19（16项R119含新增far字节保护＋3项R106），包含真库高低创建/释放、四门钟漏后绕去返10/30/60、来源限定实际几何、物理/织物/钟漏/开口/门 exact。`final-r118.tap` 27/27。两门 `final-gates.json` before=after=6f9a617a…；并非宣称全部历史测试已绿。

## 旧测试，不改 expected 掩盖结果

完全相同9个旧 Jiaotai/R106 文件：fresh R118 28项21PASS/7FAIL；R119 28项19PASS/9FAIL。失败名差分见 `reports/r119-jiaotai/existing-differential.json`。

新增两项是本轮意图替代的历史冻结语义：
1. `R102 geometric body, physical registration and all non-target surfaces stay exact` 冻结整个旧殿 mesh 数221，本轮66个内檐原件+4个屏边→291，物理和R102织物本身另有R118 exact保护；不能把旧整殿不变断言冒称通过。
2. `both actual resident clock/clepsydra and caisson LOD meshes retain their frozen R53 signatures` 冻结旧 near 藻井，本轮限定near480tri新增；钟漏所有LOD与far藻井另有exact保护。

另7项在相同R118已经失败（旧源码/几何冻结或历史fixture来源锁）。完整112 current-state已终态：1289项1101PASS/188FAIL，266.791秒。文件集合与R118记录全门相同；对R118 f971记录189个失败名，新失败0，消失1（R118最终兼容补丁已修的optional private lip测试）。见current-state-differential.json；不是188项已通过。旧门重写的两份R58报告保存在current-state-side-effects，并恢复原HEAD字节。

## 成品/图像与成本

独审从真实导出三角独立差分：12,439→13,759（+1330/-10，净+1320）；新内檐792tri minY7.1700001，新口沿/笼圈480tri minY8.428，屏field/rim +58/-10均留原上field包络（F32边界差<0.5微米）。原其余三角位置保留；不把整个旧场景所有穿入清零当本轮结论。

资源统计包含 hidden far LOD：后三宫 resident62→63mesh，67,264→68,584tri，6,263,972→6,390,692 B geometry buffer，49→50材质。新 room atlas 原生Canvas逻辑像素524,288 B，单份材质/纹理、引用1；理论完整RGBA mip699,052 B。原 central atlas仍1024×512=2,097,152 B、理论mip2,796,204 B，静态屏+near+far共3引用但只有1份纹理。两者逻辑像素合计2,621,440 B，理论mip3,495,256 B，不含JS heap/驱动分配/其他纹理。

`cost-before-uv/`（保留历史）：首批3对fresh进程，high构建中位360.512→373.322ms，low356.608→324.369ms，离散明显且顺序有噪声；**不据低档负差值称提速**。最终 `cost/` 对同R118 fresh进程重做3对/档：high旧[329.709,299.457,287.008]ms，新[329.121,316.426,316.149]ms，中位+16.969ms；low旧[290.081,296.310,288.372]ms，新[295.431,306.510,288.864]ms，中位+5.351ms。数量很小且方差明显，只报告新增功能成本，不推论整帧/帧率或显著提速；所有样本、源文件SHA、完整resident指标保留。

## 最终源绑定 / 构建

运行时指纹 `6f9a617a6f297c5dce35e68bd7cbabe4b203d1ae4af086a43dc62ea86a714786`，release=R119。
- `startup-high-hd.json` / `startup-low-sd.json`：各fresh完整全预建/普通streaming，19个实际请求材质key均在真图库；文件色图22/法线21，1份新room atlas。before/after指纹相同。process memory是整个诊断进程，不能冒称R119新增heap。
- `visual-final/export-before-high.json`：从exact R118 commit重新构建，before=after=a20989ae…；after-high/low均before=after=6f9a617a…，固定三相机，实际图集/几何，图像非GPU。
- `build.log`：Vite成功4.74s，`R119-40255b98ed46`，base `/forbidden-city-3d/`，HTML/JS/build-info读回一致。保留大chunk/npm环境警告。此包在提交前生成，sourceCommit为继承R118、sourceDirty=true，**不伪称干净commit包**。最终freeze commit后另作clean build及源精确读回，外部交付manifest绑定准确commit/tree。
- `zones.log`仍3错误，错误行与R118记录完全相同；`anchors.log`114比较仍1神武门11m超差/1kind未比较，与R118相同。不称全standard gate通过。

GPU/WebGL/PBR、真实手机、生产帧率未执行，不升级为PASS。R118旧太和prefix接触/skin问题等限制继承；R119没有扩大“全程零穿”结论。


## 独立复核

`reports/r119-jiaotai/independent-review/REVIEW.md` 已封口：官方像素和before/after亲看；独立读取实际导出tri/atlas/camera作差分；最终六张high图与已亲看版本byte-exact，另亲看low正面；当前6f9指纹及build读回核验。没有剩余本轮来源/新增布局blocker。独审未重新跑世界或GPU，不将writer控制器门包装成独立重跑。其报告保留提交前dirty身份；随后clean冻结build身份通过外部交付manifest提供。
