# R97 Task3 拒绝实验：不纳入生产

实验基于R96外脚源 `94e8e33b6cae148d71cce5f7b068bdbb3b75f7a7351d99059f15d38733dc6c80`（现生产已精确恢复）。每sign/build的exact-z行Map使实际扫描300→100，唯一kind/sign/z仍100、最大重复5→1；6项全部几何/碰撞/profile/source-only开关/平移对照通过。

但真实完整Garden build/register/first-index五个交替配对，build delta为−208.09/−1.13/+75.31/+5.75/−68.74ms，中位−1.13ms；冷热与GC噪声远大于中位。不能据此确认用户加载受益，故按已批准范围拒绝该运行改动。R97不宣称解决历史Garden约+182ms总重建回退。

`garden-paired.json`保留全部样本。`rejected-row-cache.patch`、`rejected-*-*.source.mjs`为源归档而非当前可执行测试（原相对导入位置见源与原计划）；要复验应在隔离R96树应用patch并放回 tests/r97-performance/duixiu-row-cache.test.mjs、fixtures/r96-duixiu-outer-rock.mjs、scripts/r97-performance/garden-paired.mjs。唯一实验完整源同时保存在工作区r97-rejected-row-cache，未删除。最终生产OuterRock逐blob等于R96，不拿此实验成本作为已交付优化成绩。
