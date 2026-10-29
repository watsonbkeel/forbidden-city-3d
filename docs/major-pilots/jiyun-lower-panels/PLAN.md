# 吉云前栏下部板排 Implementation Plan
> 单一写手顺序实施；只读独立review；小文件，不复制构建。
Goal: 补齐照片清晰可见的整排低位彩绘板，保留上段空气与通路。
Architecture: JiyunLowerPanels.js局部组装，46个显式source ID扩展XiqingRoofSurface白名单；既有域及所有权不改。Spec: DESIGN.md。
- [x] 写46板/原物件与导航不变红测并运行。
- [x] 实作真实板体/薄框/简化成对卷线，严格绑定原棍与横杆；生成46实际最终Float32 source owner，默认启用。
- [x] 逐板源面双向覆盖、各部件与板接合、原上段空气保留、几何/材质生命周期、注册拒绝重复。
- [x] 完整World 10/60Hz高落/走跑跳/内外退出和权威阈值，所有旧+新源三角全身体Oracle；站/坐动态NPC及清除后落稳。
- [x] 串行专项、既有栏杆及共享物理回归，CPU成本/未验视觉记录；独立审查后本地commit，只显式stage本项。
Review focus: 低板封错上部、仅渲染未碰撞、表面source遗漏、脚部容差侵入、旧对象/门通路破坏，各自以上述静态/World/retention测试覆盖。高运行成本与旧失败必须保留。
