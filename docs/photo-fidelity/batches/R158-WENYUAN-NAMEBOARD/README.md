# 文渊阁牌匾桥门轴线修正（截图问题）

基线 458cea434b60fa5e9b3a31fa84c2d90ba1ab4c36（最新回读版本）。用户截图 image(20261102-022253).png 已亲看：桥与明间通口已对齐，牌匾仍在楼中心柱轴。

## 最小改动

唯一运行文件 `SourceGuidedNameboardMounts.js` 中仅文渊阁专属 `fit.x` 从 0 改 -3.375。楼中心为 -186.5，牌面与其注册自有背板现在均为实际门/桥轴 -189.875。不是移动整楼或将楼中心误称门中心。

`WenyuanPavilion` 初始挂位还会被最终 source-guided mount 覆盖；因此未改这个无效前序位置，也未改 generic helper。原 y=8.79、z=-8.88、前下倾 -60°、牌面尺寸、UV、字形与材质保留。3.375m 是现有模型入口工程适配，不是历史测绘或新的官方牌匾位置认定；原照片方向依据和未知挂件声明不变。

kit.plaque 创建的牌面及金色背板均是可见 mesh，不创建 collider。全楼非牌 mesh 的所有属性/index/世界矩阵/材质名颜色及全部 collider（含三角）、walkables、rooms、maps 前后 SHA 精确比较。保留原楼柱/门/桥/水/碰撞与支承，不新加隐形坡。

## 验证边界

新组件命令：
```
BEFORE_CAPTURE=/tmp/r158-wenyuan-nameboard-0224/before.json.gz.capture.json node --test tests/r158-wenyuan-nameboard/component.test.mjs
```
父版本 source-guided 模块用精确 Git SHA loader 读取，非事后手调 before。首组件 fixture 错把 raw Box 当包装对象产生 TypeError；修复 QA 后得到实际轴线真 RED（-186.5 != -189.875），两份记录均保留。

原 r49d/r49e 历史测试硬锁局部 x=0，属于被本轮明确修订的旧挂位合同；未删改这些旧测试，也不冒称旧全库全绿。新对照硬锁除 x 外的全部牌面/背板形态与位姿。

可视证据使用实际牌匾生产 Canvas atlas、实际 UV/三角和同相机 CPU 透视绘制；其余材质为平色，不是全材质/GPU/手机验收。本轮不全站 build、不上传，累计负责人后续统一构建/回读。

原始日志、capture、CPU几何/atlas和World帧仅 `/tmp/r158-wenyuan-nameboard-0224` 本地临时存放，不入 Git、非持久。Git 仅源码/QA/摘要/pins/自制 PNG。不得从远端摘要声称可读原始帧。

## 最终终态
- 专属组件 2/2；725 非牌 mesh 完整属性/矩阵/材质摘要以及全 collider/walkable/room/map 摘要与精确父版本一致。牌面/背板原几何属性、quaternion 和 scale 完全一致；仅 X 同步 -3.375。
- 原正常 World 脚本 `tests/r158-wenyuan-bridge-axis/world.test.mjs` 未修改、未插入 hook/fallback；8/8 真直行、1678 帧，三项原柱/栏/背板拒绝仍有效。所有 8 条完整 rows 与 0031 已审累计原件逐字相同；没有重复跑完整场景大套件。
- 继承短踏步快跑峰 **0.39127395593100833m / strictFeet03=false**，不是新增阻路或本轮修正范围，不称全帧 ≤0.3；桥门轴线不转弯、原水域仍在。
- CPU 两图同相机亲看，实际牌面/背板位于实际入口中线上。运行环境生产 Canvas atlas 无可用中文回退字形，CPU 图为蓝金牌面而无可辨汉字；本轮没有改原字体，不将这两张图当文字字形验收。非牌材质为平色。
- 首两次轻组件（每次约0.4秒）与其它作者一次失败World构造存在短暂交叉，已告集成人；不据本次计时声称性能改善。最终CPU及World串行窗口均得到明确分配并已释放。

累计仅摘本提交，无新共享 hook。需要时运行上列组件并复用原 World 命令：
```
EVIDENCE_OUT=/tmp/wenyuan-nameboard-integrated.json.gz node --test tests/r158-wenyuan-bridge-axis/world.test.mjs
```
全应用构建由唯一集成人执行；本作者不上传或变更 main/branches/Pages。
