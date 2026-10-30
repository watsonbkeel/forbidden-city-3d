# R150 候选：乾清门成对屏墙分段、前面与基座（整门未验）

安全源码父 `dd13d7b20f959b34a8367adf070bc1e52d463f8f`，独立分支 `feat/qianqing-screen-segmentation-20261030`。R147/R148/R149远端映射见README；未混入弘义或断虹条件WIP，未更新交付分支、main或Pages。以下只描述本次范围，不冒称原文全部完成。

## 实证与拟合
- 官文 https://www.dpm.org.cn/explore/building/236473.html 记两侧八字琉璃影壁8 m高、9.7 m长、中心及四角琉璃花；未给测量边界。
- 已亲看该页两官图：`s5fb36b5c38de7.jpg`、`s5fb36b5c3db52.jpg`（完整URL见PLAN）。连接短墙低、外主墙高；主墙前面切角粉红壁心及绿釉角区、分层基座可见。照片未注明拍摄日期，不据URL年份冒称摄影年代。
- 仅把已有四段区分为两短墙与两主墙，不称原来没有墙。保留3.1+6.6 m、30°、0.8 m墙厚与全部平面锚点；这些旧拟合尚非测绘。短墙帽高6.4 m（主墙8 m的0.8）是照片拟合，不是官文直接尺寸。
- 两侧真实南前面分别取局部+Z/-Z；只有主墙前面添加切角分区、边框、抽象角花及分层基座，短墙保持矩形，背面不套未见纹饰。抽象中花/角花不等于精细琉璃浮雕复制。外端窄装饰面究竟墙厚端面还是折返尚未消歧，不猜增返墙。

## 实现及物理
- 从QianqingGate原内联块拆出专用生成器；四帽、四墙实体高度同步，不留短墙上方8 m隐形墙。所有非屏墙网格属性/材质、原walkables及其他collider逐项保持。
- 旧分段AABB仍阻挡实体墙，结束在实际墙身；帽面使用最终合批Float32变换阶段的真实源三角，局部世界平移后注册。逐面与最终渲染三角精确对应；不加平顶隐形支撑。
- 首次普通triangleSupport能接高落却卡檐缘，4条10/60 Hz退出红测保留。改接**已有**限定屋面算法：只注册4个帽面ID、2个精确原墙体owner和两侧局部域；feet<5.5的地面路线不启用，未改通用碰撞/移动算法。伪ID、扩域、owner平移、额外ground/floor均拒绝。
- 新基座最初虽在旧1 m视觉底基范围，旋转端角仍超原碰撞并集约3.3 cm；逐顶点红测后新增层最大厚度收至0.8 m，原1 m底基不改，不扩大通路阻挡。修正后全部新增带层顶点落在实际原阻挡并集内。
- 短墙中部上方还存在旧门楼屋檐，未纳入本次帽面接触；相关落帽测试只证明局部帽面，不证明人物此前穿过的旧门楼屋面正确。原底基、装饰、全门屋顶与完整飞行接触不在本次整体验收内。

## 验证与明确保留的失败
- 最终专项27/27：实际高度、两面射线、非目标保全、侧通路/折角空地、真实12 m起高后四帽落脚和南/北退出（10/60 Hz）、无短墙高位虚挡、Float32源映射、域拒绝、基座碰撞并集；独审复跑27/27。
- 高落夹具曾因setPosition自动贴地而失真；已显式设置feetY与相机并断言起高。R149六项8 m高落也据此修正复验，22/22通过，生产阶陛不变。旧错误结论已在其RESULT更正。
- 最终合批整门：14,786→15,198 triangles（+412），属性1,655,616→1,714,944 B（+59,328），mesh/draw数不变。源网格属性增量24,576 B不能当最终GPU属性口径。未增加纹理资源。
- 三base `/`、`/forbidden-city-3d/`、`/gugong/` Vite内存编译及HTML/JS/build-info身份一致；不写构建包、不复制public，不等于HTTP/浏览器部署验收。
- 实际几何CPU深度缓冲图已由实现与独审亲看；仅平光几何诊断，不是实机GPU、材质全保真或官图同机位验收。
- 最终完整 current-state 串行父/候选均 **1331 / 1113通过 / 218失败**，全部有序测试名及状态逐项一致，0差异；218条失败名留在仓库外 `full-comparison-final.json`。父模块和历史读取型fixture均使用同一安全父源码字节。早先并行试跑1252项/220失败含两个整文件提前退出，仅属失败的中间记录，不用于补算最终数字。
- 历史联合专项标准运行：父74/68通过/6失败；候选70/66通过/4失败，其中1项是旧窗文件SIGKILL，不能当74项完整结果。独立定位后，生成和严格深比较均正常，候选nav JSON234,675 B、旧R60为22,532 B；Node `assert.deepEqual`失败路径本身能单独复现SIGKILL，不能确称已证OOM。
- 仓库外诊断只把同一JSON操作数的严格深比较结果报告为布尔，避免携带巨大失败操作数；旧窗5项得1过4失败，与父的4个失败名相同。它是诊断，不替代原标准文件或将失败改绿。旧仓库测试未修改。四名为：`all colliders, supports, three rear doors, stairs and connector remain exact frozen R60`；`all triangles outside two south outer-face window bands retain every attribute and position`；`rear windows and south inner faces do not inherit unobserved front tripartite form`；`no additional production texture or draw material, bounded nondegenerate geometry`。
- 另外两个既存阶陛失败：`gate front collision is retained; sixteen stone boxes plus eight registered rear connector bounds change`、`marble gains116 triangles; only three rear-connector material groups additionally change position`。本次新增旧快照失败：`all original triangles/attributes including final south windows retain exact window03 bytes`（旧藻井测试对全门的冻结比较，包含本次确实改变的屏墙）。不篡改旧快照；新专项独立证明非屏墙全部网格/属性和非目标物理保全。
- 最后合跑屏墙27项＋更正后的武英22项：**49/49通过**（10.48 s）。运行源指纹 `810663ed4f6d7e651662865545f0e449fa36f9801155a01e7536252434fedd97`。本检查点不是“所有历史测试均通过”声明。

原始红/绿输出、父/候选套测、CPU图片和编译身份留在仓库外 `../qianqing-screens-20261030-evidence/`，不进入上传提交。GPU、手机、浏览器同机位、精细琉璃/端面定位及整门仍未验。
