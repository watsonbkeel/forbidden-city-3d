# 午门冲刺下降 — 有界候选

基线 `6c8cce3`（统一树已含同版）；不覆盖原 `31d4e211` 开发包或原红证据。源图不支持为解决重力滞后外移外折点9.5m，因此**几何、台面、12真实坡及支承形状完全不变**。

仅既有12坡显式登记中的 **east/west × entry/outward 共4段**，在玩家非airborne、非上升竖直速度、前帧连续真实支承/脚高贴近、单帧真实运动距离有界、完整足迹路径覆盖且普通全XYZ连续扫体通过时，沿**真实既有坡面**下降。neck/return原生下降保留。没有receiver、新floor、重力改变或放大物理权限。

新模块 `WumenPracticalDescent.js`；Platform只标记现有坡walkable。`INTEGRATION.patch`是零上下文补丁（`git apply --unidiff-zero`），仅Collision登记保留显式owner＋已有resolveFurnitureVertical入口先尝试午门局部解；累计Collision需人工按函数位置合并，保D水界改动。FirstPerson与lastFurnitureStepFeet语义未改。

## 原因及证据
- 真红：默认下坡按重力，短坡冲刺出现东1.280500m、西1.180441m腾空。初版上行ground−feet≤0.287没有检验反方向；不抹旧红。
- 实际native `supportHeight`会报告脚幅上游体切片高于坡心，不能把两者细小差异当丢失支承；本资格仍要求前帧脚和原生逻辑地面各距真实坡心≤0.3m，后续raw sweep独立有效。
- 修后64/64路线全到达；**全部下行 feet−ground 最大0.287667m**，下行超过0.3m连续时长0。上行ground−feet仍0.286564m。
- **不隐瞒既有剩余项**：西上行60Hz局部feet−ground原来0.317070/0.385313m，修后相同；不是新退化，也没有为此改形扩大本次范围。不能说所有方向所有帧≤0.3m。
- `BEFORE.json`和`AFTER.json`保留64组合与两种符号、超限时长。完整前后raw帧在独立 `r157-wumen-descent-evidence-0226/component-before.ndjson` / `component-candidate3.ndjson`，原统一World原帧不覆盖。

## 最终组件验证
`node --test tests/photo-fidelity/batches/wumen-practical-{assembly,wall-junction,routes,descent,real-library}.test.mjs`：**12/12**，3.3秒。

负控覆盖：跳跃/airborne高落不吸附；高于真实面2m的非airborne异常姿态不吸附；删一真实登记立即撤销；真实跨entry边缘继续原生重力到地；端点清净但路径中薄普通障碍拒绝下降。

真实TextureLibrary API smoke把交付的两Collision hook应用私有临时overlay，普通PalaceBuilder/finish与Enclosure及Collision实际实例在场，12owner登记和真实resolveFurnitureVertical入口通过。纹理像素仍为inert，不称GPU。

尚待：集成人累计Collision合并后，真实World A64及D水界/高落回归。范围外/删登记/跳跃直接回到原控制器；原包继续可回滚。

## 累计接入终态 02:40 UTC
精准两hook已合入累计Collision，D河廊授权保留。17组件全过；同一生产World244/244、96478帧全到达，8个午门下行组合最大脚高差0.2876667m、>0.3帧为0。已在统一World加入真实全帧≤0.3断言并同命令重跑通过，前后原NDJSON逐字相同；完整帧分块/原日志见INTEGRATED-EVIDENCE。旧31d/ZIP保留，不覆盖。构建与新包随后按新源码身份生成，GPU仍未验。

## 修复后可启动包
三base正式构建/身份核验全部exit0，clean源2b7b47c8。`r157-practical-A-B-D-E-descent-2b7b47c8.zip`：25,515,163 B，SHA256 `cf427de7979e5c5869ff4aa812f0641caed97a1e6543e01710905f325009908f`。146条目/145manifest逐SHA及CRC通过，真实本地服务器5路径HTTP200后已停；不是浏览器/GPU验证。启动仍完整解压后`node start.mjs`。旧21b/31d关联包全部保留，源构建身份不改成后继文档提交。
