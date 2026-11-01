# R158 箭亭南次间门棂局部修正

**Goal:** 只修正自身官图可见两侧南次间槅心的方向/色类，不重做已有南明间双膝托或把局部计为整项完成。
**Architecture:** 独立 `ArrowSouthDoorLattice.js` 消费精确箭亭 host；验证后替换两南次间 8 片既有闭合门叶上的 64 个黄色正交网格，添加8片不透明深暗表面衬层。保持全部门板、门位/门数、碰撞与房间、北面和稍间不变。低模斜棂是方向提示，不声称复刻菱花纹样、镂空、测绘尺寸或真实单间门扇数。
**Tech:** Three.js, Node actual geometry tests. No shared ZoneBase/data/other pavilion edits.
**Spec:** MASTER-PROMPT §§1–12；Git B-REVIEW required-feature matrix，基线 3e9d5c92。主写手已确认按本体图推进局部、登记完整剩余范围。

## Scope and alternatives
- 选择独立局部替换：可以核对真实旧节点与守护非目标；主写手统一接入。
- 不改共享 grid()：会无证影响北面、稍间和临溪亭。
- 不重建所有门扇：树遮、门叶精确计数、背面及访客通行状态尚未知。
- source south photo SHA256 e7f98442e7236e082d9713e9572d3576c3148314c07cdbd1135304c5309c6225；摄影日期未知。

## Steps
- [x] 核 MASTER/B-REVIEW、官图实际像素与旧专用实现，14 项旧专项基线通过。
- [x] 先写缺失模块行为测试，确认 RED。
- [x] 实现精确身份/host preflight、私有材质、有限闭合斜棂及目标替换。
- [x] 测几何/非目标/导航/错误拒绝/merge生命周期；尝试真实浏览器，不用 CPU 冒充。
- [x] 完整对象逐特征留痕，交主写手 hook 与旧 snapshot 冲突说明。
