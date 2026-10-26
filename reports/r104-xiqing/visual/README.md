# R104 同机位局部 CPU 图

六张 PNG 均从两版本实际锡庆门与相邻墙 mesh 导出后，经本仓库 render-cpu.py 的透视 z-buffer 生成。before 为已交付 R103，after 为运行候选 fb770350afbcba005fc2b7ee0ba1d092721e6b1c；front/oblique/rear 三相机前后完全相同。只采材质/顶点色，无纹理、牌匾字 atlas、阴影、地形/其他邻物或人物，不是浏览器/GPU/手机截图。

官方原照不在发布树；图中米制尺寸和齐平色块是工程拟合，非测绘或复杂琉璃纹样复刻。实际合成墙有三个独立洞及间墙，不能只凭图片证明完整身体安全；另见实际世界路线独审。

导出：`node scripts/r104-xiqing/export-visual.mjs <sourceRoot> before|after`。
渲染：`python scripts/r104-xiqing/render-cpu.py reports/r104-xiqing/visual/front-after.json.gz reports/r104-xiqing/visual/front-after.png`。

新增 rear 对照只为确认门叶实际移至垛后、没有埋入；背部造型/真实历史开门方式仍未知，图片不是后立面测绘复原。屋面普通玩家支撑仍是独立未关闭门，不以这组图作安全通过。

后续 d96913eb 只新增/纠正屋面物理 source 的生产合批 Float32 派生；独立全 roof 原 geometry attributes 与 matrix 相对 fb77035 bytehash 不变，因此复用这组既有实际几何像素，不谎称另一次 GPU 或新视图验收。屋面数值/接触通过另见 source 与压力矩阵，不由图代替。
