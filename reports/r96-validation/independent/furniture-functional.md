# R96 家具子模块独立审查

限定基线 R95 `14d8997e64ce6fdb3bd5223b3dda805f1852ca12`；修复候选 `33e7865a74e9ecd3858938f972cb33dd12824c46`。精确机制文件 SHA256 见 fixed-source.sha256。仅家具功能阶段门，不代表随后人物 40m 流式、皇帝路线或最终发布通过。

## 判定
已测家具局部功能可继续集成，无当前已知新增静态穿入阻断。必须保留旧域外缺陷和有限覆盖，不宣称全园移动无缺陷。产品源码未由审查者修改。

## 独立发现与修复
原 a74da0c 候选在真实地面接近→跳上东炕/几→东向退出，B/S 两例 10Hz 发生约 0.052194m 正深度实体穿入。多 substep 中首个 step 合法升脚至 2.189999990463257，后续 plain 子步清空脚高回传，FP 保留旧 1.94。证据 actual-eight-way.json、east-step-diagnostic.json，未覆盖。
33e7865 修后原同一 48 条 B/S×10/30/60Hz×8 方向路径逐帧完整 square 半宽 .5、feet→feet+1.7 AABB 独立正体积 oracle：0 穿入，0 舍入不确定。ordinary exit 2秒+停1秒，另 jump-rescue 2秒+停1秒，并非15秒；合法实体挡路不要求强行穿过。各南退路径正常落至真实地面 .6。

## 补充覆盖
- boundary-airborne：48 条 B/S×10/30/60Hz×四边双向，高空20m人工起态（非声称自然步行到达），实际控制器跨域并下降。无新增穿入/向上 snap。6条北向离域后在局部 z≈5.34 旧盒中穿入，与真实 R95 同轨迹的前三失败帧记录、最终 feet 完全相同；新域北界仅1.541，未要求为该旧域外高空问题扩大范围。R95另外12条向域内落下的失败在候选消失。原始全部记录保留，不将48条说成绝对全绿。
- boundary-grounded：同四边双向48候选起态中30条真实足印支撑且全身清空可站，普通步行+停步无正穿入/向上snap；18条起态被原真实墙/家具阻挡而明确跳过，不伪造安全起态。
- controller-obstacles：实际 FP、CM，10/30/60Hz：低梁跳起全身不穿梁；下降碰NPC仍 airborne、非support；NPC移除后落真实floor。3/3通过。
- B/S全部实际mesh世界矩阵、属性、索引、collider几何、walkable序列，独立重跑与R95 JSON cmp字节相等；均SHA256 d5932bac9c22a1953b2ad130b734056d01f0865f4b2345874cedef617879cbfa。
- 较早独立 primitive：20000 static sweep/500 contact；6000 dynamic sweep、5000 overlap escape；scope diagonal RED→GREEN，held clone 生命周期及108源index共享。详见上层 primitive/dynamic/scope 证据，不以这些代替实际FP接入回归。
- 真实 Environment ground 三角裁剪覆盖局部域及额外完整足印，2501射线；见 design/ground-witness.json。ground=0必须显式元数据，不是任意空CM补floor。

## 限制
本阶段不是CPU性能门；未测浏览器/GPU/手机。接口样本不是所有家具边缘穷举。人物流式与皇帝行为另审；后续更改 FurnitureMotion/Collision/FirstPerson 或域owner须重新绑定证据。原R95域外下落漏洞未因本补丁新增，也未被本补丁修复。
