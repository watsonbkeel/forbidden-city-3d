# R102 Implementation Plan

> REQUIRED SUB-SKILL: superpowers:executing-plans; sole writer, independent reviewer.

Goal: 两项已有表面真实纹理化，几何/物理/陈设锁定。
Spec: docs/superpowers/specs/2026-10-26-r102-jiaotai-textiles-design.md

## Task 1: 原表面/资源RED与两专用纹理
Files: new JiaotaiTextileSurfaces.js; JiaotaiDisplaySetting.js; tests/r102-jiaotai-textiles.test.mjs + tests/lib/fixture + small compressed baseline.
- [x] 保存真实基线全属性/碰撞/支撑/其他殿。
- [x] 真实RGBA下旧无map RED；geometry/whitelist/resource生命周期合同。
- [x] 两512纹理、可复现独立图案与局部UV，材料dispose统一所有权，无其他形体改动。
- [x] GREEN保留、map采样、repeat/flipY/material绑定及反复清理。

## Task 2: 真材质像素与限定独审
Files: scripts/r102-jiaotai/export-visual.mjs, render-textured.py; reports/r102-jiaotai.
- [x] 实际生产map图片/UV/矩阵导出，CPU透视采样同灯前后正/斜，非GPU声明。
- [x] 自看图案密度/拉伸/重复，稳定hash交独立来源/属性/资源/像素审查。
- [x] 原R54真实入口/台周路径，地图/108逻辑/中和输入精确。

## Task 3: 累计交付
- [x] 文档注明简化拟合/非文物织样，保留R97/98等欠项。
- [x] 166固定夹具、184/1290差分、三fresh base/139包、3build.log已通过并纳Git；首次预检错误/中止另保留。
- [ ] 最终独审、唯一上传者，fresh main与累计远端父链核对，不改main。

环境核实：package声明的@napi-rs/canvas未实际安装/cache不可用，保留初始化错误；不新增依赖，改为纯Uint8Array RGBA生产生成器。Node/浏览器同函数，PNG只编码同map.image.data字节，CPU采样该数据而不是另写仿图。
