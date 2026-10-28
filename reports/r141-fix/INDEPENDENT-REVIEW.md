# R141-fix 固定产品独立评审

产品 SHA: 0ccbafe9e7402fee17658b04767b381b1767b975；父 R141 a485abe324bfc70405838671efaa981b9fe3a9d8。
工作树：r141-imperial-visibility-fix。仅只读代码/独立运行目标，未改产品。

## 代码核对
- 五个产品源变更限定 SharedRestNavigation、SharedRestSurfaces、InteriorLoader、TaiheReplacementOwnership、提取原 SceneSourceProof；没有改通用碰撞算法、人物40m距离、质量名单或渲染队列预算。
- 合法 Taihe S 安装通过既有实际 GLB 契约后，绑定同场景精确八 fallback；运行时 WeakMap 记录，不用可伪造 userData 授权。
- replacement几何position/normal/index对象、形状、版本、ordered原始标量，材质、父链/变换/可见性/draw range仍受校验；每次validate复用一次合法性结论，非跨帧缓存。
- 只有八个已登记旧fallback合法隐藏获豁免，其他旧来源证明保留；隐藏但替换记录无效时即使两角色远离太和也失败。
- 新S实际三角重新提取路线支持，实际帝座/鞋 binding须ready且位置等旧seed；不是仍以被隐藏B面充当S可见支持。
- cold S先加载再创建人物：不把已登记S树误记成永久静态源，保留准确B源恢复；unload/revoke/失败清理恢复B面；dispose清引用。
- 安装异常 rollback 的 h.group 在新增注册前已经赋值，故后续抛错不会遗留scene新组。

## 验证边界
独立3目标运行中，结果另见 fixed-0ccbafe-independent.tap。
正式3门涵盖真实S/B生命周期、原地顶点/法线/index变更、非法隐藏/detach/透明/移动拒绝、cold/repeated安装、夜去晨返10/30/60Hz、储秀双睡姿实际renderer提交及40m/cache重建。
另一个诊断agent负责白天太和/储秀实际提交及同屏真实三角遮挡射线，未在本报告冒认已通过。
CPU提交/射线不等同真实GPU/手机验收。全标准、构建、固定远端树回读尚需写手/上传负责人完成后才能报告交付。

## 独立目标终态（04:52 UTC）
完整固定3目标命令实跑 exit0，3 PASS / 0 FAIL / 0 skipped / 0 cancelled，80590ms。
60Hz真实S夜去/晨返各4277帧，路面22条S支持三角记录；10/30Hz亦通过。
原始完整TAP fixed-0ccbafe-independent.tap。不并发重全套，无产品写入。

## 最终产品替换：11ee1ca7c1b575286a7e7d36fbe140277e103fd3
0ccbafe 后只改严格全量原始字节比较（Uint32词+尾Uint8，不是hash），另补正式日间/字节边界测试。
对齐array用word+精确尾字节；非四字节对齐array全用Uint8；只比较实际byteOffset/byteLength，不越入共享buffer的其他对象。仍核array/attribute身份、version、count、itemSize；-0变化也拒绝，较旧数值相等更严格。奇数Uint16索引尾、offset2、subarray窗、撤销和跨scene都有实测。
最终6目标独立实跑：6 PASS / 0 FAIL / 0 skipped / 0 cancelled，79544ms，原始 fixed-11ee1ca-independent.tap。
四个日间场景=帝/妃×高低质量：真实seated提交、实例count=1、visibility=1；同屏完整建筑与实际实例的12射线均先碰人物。低质量首次提交分别89帧与99帧；高质量紧随低质量复用缓存，所以不能称高质量冷加载0帧。CPU射线未执行GPU顶点shader，不替代WebGL/手机体验。
源核验仍有真实CPU成本，已记录S-live与B-restored对比，不能宣旧1ms目标达成；并未把此热修当全宫性能专项。
最终代码审无新增阻断。放行范围为该固定代码+上述CPU目标；标准归因/构建/远端完整回读由对应负责人完成，不在此冒认。
