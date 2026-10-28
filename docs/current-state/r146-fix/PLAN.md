# R146-fix：生产天空误入人物静态来源证明

## 已确认故障与范围
准确基线 R146 本地5bfc0fe、树94dd4f6e；用户main d21c2692与该树一致。真实生产包已由独立网页检查确认R146，不归咎于缓存。

旧CPU场景只构造Environment.setupGround，遗漏真实天空球与随相机移动的远景。完整Environment天空/远景加入后，它们的巨大包围盒与帝妃路线相交，被SharedRestNavigation当作静态建筑记录。真实Environment.update首帧改变其位置，导致静态证明失败，两人routineRenderable同时false。已有R141-fix只修S/B内景合法交接，未覆盖这个独立根因。

## 最小修复
仅Environment.setupSky/setupSkyline创建并登记的具体mesh身份可被识别为随视点非建筑视觉物，不参与人物建筑路线/支撑来源采集。不按名字、宽泛ShaderMaterial或整个Environment跳过；后插子mesh不继承资格；销毁撤销登记。地面、端门背景、建筑、人物S/B真实源校验保持。未改40米、21:00/06:00作息、床位、角色/控制器或shader。

## 验证顺序
1. 真实环境首帧误隐藏红证→修复后原回归转绿。
2. 精确身份、外场景、假标签/克隆、新增子mesh、detach/revoke边界，实际太和构件及地面变换仍拒绝。
3. 真实Environment→Interior自动加载/卸载→ZoneManager→Character顺序；双角色低/高提交、原建筑前CPU射线；Occlusion及BatchedBuilder临时隐藏恢复。
4. 10/30/60Hz夜去晨返、旧S源篡改拒绝、床位/缓存/40米状态、R146真实脚踏保留。
5. 独审、R146-fix三base构建与全HTTP/hash回读；不得修改/合并main或自行部署。

浏览器WebGL验证目前受工具环境阻断：本机Chromium socket权限失败，受控升级亦环境bwrap失败；云浏览器WebGLDisabled。CPU提交、射线和逻辑通过不能宣称真实用户像素或手机已验，交付须保留用户部署验收。
