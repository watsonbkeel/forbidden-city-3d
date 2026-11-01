# R157 午门五项实用组装 — 集成候选

基线：`2cb15fdece44c98aa60fa35e17668c6b1f0b0951`。本分支只新增专属模块、测试和记录，不修改 main、共享入口、控制器或其他组数据。共享接线见零上下文 `INTEGRATION.patch`（基线验证后用 `git apply --unidiff-zero`；集成人持有的共享文件已变时按函数位置人工应用），需与全部专属模块同时集成；不是可单独发布的墙扣口。

## 实际改动
- 四亭约19m外柱轴（旧11m），两侧13跨长翼、两横连及其屋顶/柱/闭体一起装配；整U台南伸、双折返马道同步。主楼、牌匾和五门图元保留。
- 北五口随真实北台边统一南移4.1m，旧整floor不继承。187真实板块＋12真实坡提供199有限支承；不注册试验receiver或远程provider。
- 中转工程高度10→8m，实际可见坡体/支承同步，避免新短跑陡坡使相机脚低0.409m；未改控制器或0.3m标准。不是测绘标高。
- 两段实际南城墙仅扣与坡体相同footprint的重叠，扣口由地面至坡面的闭合砌体填实。邻坡剩余墙保全高实体，远墙/阙门/全城anchor不动。
- 仅替本次buildWumen新增物理数组后缀，保前缀及主楼原有限碰撞。材料借用真实library；只释放不再被新组使用的旧geometry。

## 已实证
`node --test tests/photo-fidelity/batches/wumen-practical-{assembly,routes,wall-junction}.test.mjs`：**7/7**（初版）；真实材质兼容修订后含新增smoke共 **8/8**。

`NATIVE-ROUTES.json`：实际默认CollisionManager/FirstPerson，午门＋真实Enclosure，在10/60Hz、走/跑、双向下覆盖五门、两马道、北台，共**64/64到达**。1173碰撞体、199支承。最大可见脚下滞后**0.286564m**，最低脚面不低于地面。跑速测试沿用既有driver：距转点/终点2m会减速，不能称全速直角转弯。

西马道步行下行10/60Hz各有1个逻辑体接触帧，均到达；不声称零交叠。不追不挡通行的≤0.3m误差。六上层闭体有碰撞负例；五口/主楼保留、prefix隔离、材料/geometry生命周期、错源守卫及墙扣口填实体有独立断言。

整组南/北/俯视/马道CPU透视诊断已亲看，完整网格可见；它们是诊断色板，不是实际贴图或浏览器截图。原主楼与横连0.175m缝按用户准则保留，不再做微缝三角研究。

## 尚待集成验证
- 共享hook未在本分支生效；`RawWumenBuilder`测试子类只绕过最终组装以验证安装器，正常PalaceBuilder走真实finalizer。
- 合并到统一开发分支后的完整World、生产构建、实际GPU/贴图和用户设备体验尚未证明；不以组件绿代替。
- 新高屋顶沿用旧版“高屋面可见、不作新通行楼层”的范围；未认证登顶/未知内饰或现有馆展开放方式。
- 不能宣称37/37验收或95%测绘精度；五项为工程实用候选，原精细复原账不被改写。

## 回滚
同步撤去PalaceBuilder/Enclosure两处接线，回到父提交旧组装；新模块未被入口使用即无效果。切勿只保留墙扣口或仅保留放大亭翼。

## 01:59 UTC 独审阻断修复
Astra发现并证实：生产TextureLibrary将材质命名为`*_material`，初版Upper依赖fixture裸名，真实入口会抛错且UV会错误回落1m。已把library材质匹配改为实际对象身份，box UV只用显式texture key；RoofBuilder自有ridge/gold沿用其真实专属名。

新增`wumen-practical-real-library.test.mjs`先红后绿；它将交付的精确hook应用到私有临时overlay，使用普通PalaceBuilder.buildGate→finalize→finish合批与实际Enclosure（非捕获fixture覆写），证明1143门碰撞、199支承和两个墙接点存在。使用真实TextureLibrary material/cache/name/tileSize/ownership API，纹理像素为r48 inert占位，**不是真实贴图或GPU画面验证**。8/8目标测试和64/64路线复跑通过；生产统一分支的World仍待集成人。

西下行两个逻辑接触只有summary计数，没有保存逐帧owner/深度；不推断接触深度≤0.3m。0.286564m仅表示相机脚下滞后。01:49 CPU图是修订前诊断色板，晚近改变含墙cell分割/邻坡全高proxy及真实材质身份修复，不能称最终源码精确绑定画面。
