# 皇极殿南立面：最终渲染源面精度补闭环

在下一地区只读核查时，发现此前南立面碰撞使用合并前的世界双精度顶点，而最终渲染经 MergeUtils 写回 root-relative Float32。新增实际 `kit.finish()` 逐面核查在父版本 `7f1bbda18ff29478e68f0e6d8928dc6d9d7fc76d` 明确失败：首个 `huangji-south-front-0-535` 三角未出现在最终渲染面集合。

修复仅限 `HuangjiSouthFront.js` 的碰撞注册：root-relative→Float32→root-world。不改视觉网格、材质、共同合并器或碰撞算法，也不扩大皇极殿原有 root 变换契约。每个闭合构件仍独立 owner，不把断开的花格组合误当一个实体。

## 验证

- 1,248 个 owner × 12 面全部逐面匹配最终合并渲染。
- 与父版本完整合并渲染属性/材质哈希、原非新增碰撞、walkables、rooms/regions、GLB/fallback 等保留契约一致。
- 接触 oracle 改查实际烘焙后的面，并取消原脚底 +1mm 裁剪；48 组走/跑/跳完整身体接触及门洞往返通过。
- 皇极专项 **11/11**；串行全 major-pilots **279/279**。独立只读几何/源面复核 **6/6**，无剩余修复阻断。
- 源指纹 `a970b6e01adb76ebbeca67209a233574ce20a3992cd71e511960f3ff99739956`。

本次是小文件精度修复，无新资产、构建、截图、部署或 main 修改；未重跑全量 current-state，不能把父版本 1,331 项结果冒充本次重跑。下一新地区仍未建模。
