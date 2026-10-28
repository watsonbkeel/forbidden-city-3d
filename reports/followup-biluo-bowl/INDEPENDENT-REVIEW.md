# 碧螺亭钵腹表面有限独审

- 固定产品：a8a5576b137dcfe73f59f2614014e268e9fa2839；原对象 FC-47EC73915D，同一对象追加局部，不增加整对象完成数。
- 亲看官方自身 1442[1024].jpg（本地 biluo-2.jpg）、同镜 baseline/candidate bowl.png、candidate finial.png。可辨蓝地黄垂瓣及浅边是有效局部视觉增量，但原图钵腹更圆润、凸纹肩部复杂，现保留圆台且细长心形瓣仅概形。只接受“表面概形部分拟合”，不称原物精复刻、测绘、浮雕或完整宝顶。
- 独立运行 node --test --test-concurrency=1 tests/followup-biluo-bowl/*.test.mjs，7/7 PASS，7624.682 ms。日志 biluo-bowl-a8a5576-independent.tap。包括真 Canvas 像素与接缝、侧面组/原蓝顶底、旧卵形图像像素保持、实际有序 Cylinder buffers/groups 变更拒绝、三次释放，以及完整静态世界原东侧路径 10/60 Hz 走跑往返。
- 只读三源增量：新增 BiluoBowlSurface.js、RemainingNingshouHalls hook/范围元数据、BiluoFinialSurface 剩余项文本。无物理/控制器变更。原 position/normal/UV/index/groups/matrix 逐项保持，独立 material[side,original,original] 不污染颈部共享蓝材质。
- 18 瓣数量为模型拟合，不是照片点数。背面为原创延拓未独立验证；原凸纹、突出瓣冠、钵腹真实弧面及颈足精饰仍未完成。CPU 图不是 GPU/手机/远距 mipmap 验收，未称整个亭、山桥或全宫通过。
- 有限门与图审可放行进入写手标准/资源/构建；不替代这些后续门，也不消除旧测试失败。

## 必要合批修复后重新审查（08:07 UTC）

初 a8a5576b 虽未合批有限 7 门通过，但写手真实成熟资源门检出多材质 mesh 被 MergeUtils 排除，丢失 96 面且无新纹理；故初版不可发布，保留 invalid-multimaterial-before-fix 红证。上述每 mesh 的 index/groups 不变描述仅适用于失败初版，不能用于最终版。此也证明局部门不能替代实际生产合批/资源验证。

最终候选 693eb148869be1e4c249a40862910d53fdf25ed9 独立 8/8 PASS（7336.060 ms），日志 biluo-bowl-693eb148-independent.tap。只读增量将原 Cylinder 的侧面/顶底 index 分区为 2 个单材质 mesh，不改 MergeUtils。原完整 96 面有序属性集合重新合回精确相同；48 侧面真实经过 CourtKit.finish 后，世界 F32 顶点和 UV 与预期逐项相同并进入唯一专属 Canvas 材质 batch，整体三角计数不变。两几何各自一次释放，caps 原共享蓝色保持、旧卵形像素保持、物理保持。最终措辞为“原实际表面集合保持，渲染 mesh/index/groups 为合批分区改变”，不可宣所有 mesh buffer/index/groups 均不变。重新亲看最终 bowl.png，视觉限定意见不变。

此 8 门结果仅放行后续完整标准/资源/构建；初失败保留，最终资源门仍须单独结束。
