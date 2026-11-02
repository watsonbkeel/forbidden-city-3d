# R158 治牲所：有标记的暂定外壳，不是实景验收

原对象 `FC-905A51A8BC`。基线 `9f67ee103e7f689004daa1be5d0edbc4e8c77d84`（远端 899b 同树）。唯一新增运行源 `src/scene/palace/special/ZhishengShell.js`；独立树不修改 ZoneBase，由唯一集成人在独审后正常接线。

## 官方已知与未知
- 官文支持景行门之南、坐南朝北、五间、进深三间、黄琉璃顶。
- **屋顶大形冲突未解决**：故宫建筑正文及黄燕虹 2001 年文章写硬山；同页释义/独立词条写歇山。正文与文章同作者同源，不算两份独立票。
- 2019 官刊记录治牲所梁架烟熏、室内已无灶，证明当时实体，不等于 2026 年现状照片。
- 现未找到可独立识别完整治牲所屋顶/立面的本体照片。大庖井背景屋顶、主殿、后夹道简易房灶图都不作为本体替代。
- 父明确授权按**正文硬山暂定**做有标识外壳。因此本候选不是确认硬山正确，也不是复原现代窗门。

## 最小工程拟合
中心 `(-236.5,-245)`，主体 21×10m，檐 4.3m、脊约 7m；全是工程拟合、无测绘声称。五开间用六条柱线表达；三进深间仅作为官文元数据，不杜撰内部梁架。硬山端墙/黄瓦两坡、无吻兽和彩画。侧面和北部非入口区域的实墙是**未知立面的简化占位壳**，不是证实没有窗。

仅北中央开放为游戏入口；南墙保实，不能充当院南正门或南北贯通门。无门扇、窗格、仪式灶、室内陈设、院墙或后三房；神厨仍不建。地图标签：`治牲所（暂定硬山；词条歇山冲突未验；游戏入口）`；不声称现实开放。

全部实体在原预留 X[-248,-225], Z[-253,-237] 内。实际 bounds 见 SUMMARY。实际北缘 -239.1928 距景行南缘 -228.1147 约 11.08m；南缘 -250.8072 距旧路 z=-257 约 6.19m。不挪河、路、主殿、景行，不封院。平齐地面石板顶 y=0，有实体底；23 组可见网格精确三角碰撞、0 新 walkable，无全局接触或控制器改动。

## 验证（范围有限）
- 真 RED：4 条组件因缺 `buildZhishengShell` 失败，之后 4/4 通过；包括原子注册/重复/变换守卫、顶点逐项碰撞归属和未知状态标记。
- 当前完整 World 创建中先核旧 outer-east 与全 World 实体：预留区 y(.05,12) 与旧碰撞 AABB **0 交叠**；1m 网格、身体半径 .5m 的水域查询 **408/408 允许**。
- **7/7 往返到达，2/2 实墙拒绝，3939 帧脚地差峰 0m**。四条 10/60fps×走/跑北门进入返回并穿既有景行往返；三条原东华东西路、桥西侧接近路、文华东外夹道往返。南墙/北侧非门区域拒绝。原 root 子对象及各数组前缀逐项身份保留；主殿/景行 map ID 唯一。
- World 通过 QA-only before-finish 添加候选；**未冒充生产 ZoneBase 正常 hook**。2 张 CPU 来自真实 15,616 三角形，已亲看，明确暂定屋顶；仅平色诊断，不是 GPU/现代实景立面验收。
- 本独立候选没有运行全历史套件或 Vite 构建；仓库没有统一 `npm test` 命令。需集成人正常 hook 后累计必要回归与构建，不用未接线构建冒充覆盖。

命令（独立树根）：
```
node --test tests/r158-zhisheng/component.test.mjs
EVIDENCE_OUT=docs/photo-fidelity/r158-zhisheng/world.json node --test tests/r158-zhisheng/world.test.mjs
node tests/r158-zhisheng/export-cpu.mjs docs/photo-fidelity/r158-zhisheng/cpu
python tests/r158-zhisheng/render-cpu.py docs/photo-fidelity/r158-zhisheng/cpu/front.json.gz docs/photo-fidelity/r158-zhisheng/cpu/front.png
python tests/r158-zhisheng/render-cpu.py docs/photo-fidelity/r158-zhisheng/cpu/oblique.json.gz docs/photo-fidelity/r158-zhisheng/cpu/oblique.png
```

## 保全与集成
`LOCAL-RAW-SHA.json` 的 6 个原始日志/逐帧 JSON/几何 gz 只在本地，不提交上传。`SOURCES.json` 指向原有官源缓存和 SHA，无复制大图。仅提交源码、测试、命令/摘要/hash、自制小 CPU 图。集成使用 `buildZhishengShell` 正常 pre-finish hook，不复制任何测试 monkey patch；保持文字冲突标识。候选通过不等于整组传心院、治牲所现状大形或 GPU 完成。
