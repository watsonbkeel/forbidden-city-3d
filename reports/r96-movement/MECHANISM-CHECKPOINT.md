# R96 家具局部机制检查点（非最终发布通过）
基底R95 local14d8997e，当前仅养心局部身体模块。
- 原真实B/S×10/30/60南退6项RED→GREEN：无下降新穿入，普通回原0.6m地面，不靠救援跳跃。
- 当前纯盒/动态square/组合contact/step/vertical/生命周期/实际scope共52项通过；R95首显及实际提交身份10项通过。
- 实际B+S所有mesh transform/position/normal/uv等全部属性、index、collider几何/标签、walkable序列与R95逐字节JSON相等。合并快照SHA256 d5932bac9c22a1953b2ad130b734056d01f0865f4b2345874cedef617879cbfa；复跑 scripts/r96-movement/geometry-snapshot.mjs <ROOT>，不将大快照加入发布。
- B原有实体只增加scope dispatch元数据，0.8m为工程接口缓冲。明确Environment groundY=0见证；synthetic空space不自动造地面。实际地面/水孔覆盖独检待完成。
- 垂直响应先于旧upward snap；真实square半宽0.5m/身高1.7m；普通盒严格全身TOI；NPC不是支撑/跳跃重置，允许每part有符号分离单调的既有动态重叠退让。
- 未完成：其他方向/边界/连续物理独立矩阵、域外等价、CPU成本、全累计回归、三base与包。不得只据六项宣布全部解决。
- 用户新增人物40m/预热约60m/回收约70m及皇帝太和↔中和为后续独立R96模块；此检查点不含其修改。
