# P1-R 渲染性能报告

### 进度
- R-0 profile（glm-5.3，10-12 10:23，agent 18 分钟后 429 限流退出，由总控代为入库）：tests/p1r-profile.cjs、tests/p1r-exp-batched.cjs（BatchedMesh 实验脚本，未跑出结果）、tests/p1r-data/profile-r0-taihe.json。

## R-0 结论（太和殿前，整帧 746 calls / 1.97M tris）
| 部分 | calls | tris | 占比 |
|---|---|---|---|
| 主 pass | 238 | 0.64M | 32% |
| 阴影 pass | 126 | 0.35M | 17% |
| 后期（SSAO 法线全场景重绘 + 全屏 quad） | 382 | 0.99M | 51% |

- **后期 pass 占整帧一半**：SSAO 为取法线把整个场景又画了一遍。这是第一优先级——SSAO 只画近处（如 80 m 内）或改用深度重建法线，可直接砍掉约 1/2 calls。
- 主 pass 238 里，各顶层 group 的 mesh 数 ≈ 材质数（每组 13–37 个材质），合批空间在"跨 group 同材质合并"。御花园 37 / 三台 29 / 后三宫 28 / axis-courts 20 居前。
- 阴影 pass 126 = 主 pass 的 53%，目标 ≤ 40%。
