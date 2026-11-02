# R158 文渊阁双西梯：限定真实支承接触

仅修既有双西梯跑步下降可见悬空；不新增几何、台阶、碰撞或支承，不改全局控制器。原楼层/木踏步尺寸仍为既有工程拟合，不构成测绘或新视觉复原。

- 只认证原 2 坡与 4 楼层/平台面；既有入口短阶不在授权表。实际专属 builder 私有 WeakSet 与活 owner 同时约束，完整脚印、速度、跳跃/高落、侧出、删重改/复制、隐藏/移动宿主均受守卫；真实薄障碍/动态人仍走原 sweep。
- B 的 toeRect 至 EOF 运动算法逐字不变；Collision/FirstPerson/raw sweep、旧各门认证表不变。
- 组件完整 1319 mesh 属性/矩阵/材质、594 完整碰撞、30 原支承及 rooms/maps 哈希相同，仅 6 授权 ID 新增。正常 World 另含既有入口短阶；不混入本次认证。

## 实际有限验证

128/128 相关专项终态通过。正常 World（loadAll:false，outer-east 与当时 global）同 4 条三层往返、10/60Hz 走/跑全部到达；峰从 1.4583373848m 降到 0.0721553213m，2117→2089 帧。输入 points 相同；两条步行 XZ/time 全同，但跑步 10Hz 111→108 帧、60Hz 664→639 帧，不能声称全轨迹不变。修导入环后又用最终源复跑同 4 条，完整结果与先前候选相同。

初测 baseline TAP 通过仅表示测量完成，并非 ≤.3m 通过。组件首轮 2 绿/4 真红保留；第一次 guard 把实际 place 身份误当 FC 身份、一次阳性 fixture 用 8m 查询误选楼层，均有原件。首次有限回归 118 绿/2 导入文件红揭示 FACE 冷启动环；改由无 Remaining 依赖的 WenyuanPavilion 保存实际 builder 私有证书后修复。另一次 R59 稀疏 fixture 缺失，恢复精确父 blob（未改断言）后原 8 项通过。

运行提交 eeb6e9fa 的 clean /gugong/ 构建 646 模块及 verifyBuildSource 通过。唯一新输出 /tmp/r158-wenyuan-stair-build-2211；没有覆盖旧 dist、打包、部署或改 main/branches。

## 证据及边界

VERIFICATION.json 绑定源码、测试、保护输入、完整本地原件 SHA/长度。原件只在独立 /tmp tmpfs，非持久，不上传原帧/原日志；远端仅摘要与哈希，不等于可从远端取得原件。具体命令见 COMMANDS.md。

未验证 GPU/手机/全城所有路线；本次不改变原自动导航目的地的 withheld 元数据，不据此声称全楼功能验收。保留先前各批历史失败与不确定身份，不用本项覆盖。
