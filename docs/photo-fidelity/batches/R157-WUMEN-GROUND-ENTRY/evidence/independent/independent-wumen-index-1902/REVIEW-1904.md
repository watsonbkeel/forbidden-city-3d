# 认证临时索引优化：1900有限独立审查

**结论：1900限定版本可作为未安装局部候选继续开发。** 1854阶段发现的“认证结束时执行foreign getter导致集合变更仍被接受”P1已通过 own-data-only owner key限制关闭；不把旧117项绿误称已覆盖该洞。无需也未运行World。

## 冻结与源码范围

工作树基准3b2d95ae，`auth-index-1859/selected-freeze-1900.json`34路径与`source-freeze-1900.json`598源逐SHA全同。相对3b2唯一源差异是 `WumenJointAscentContact.js`；Motion、Collision、Handoff、FirstPerson及几何均未改。新增/修订QA为owner-index；旧1854三项测试和旧Contact已保留。

新索引每次register/validate都临时创建Map，读取当前所有collider行，保存原数组、每行和mesh键引用；无跨调用缓存。原target行唯一性、完整bounds、plain record字段、tag/行身份及mesh/材质/变形等校验没有删除。结束时再核数组身份、长度、顺序及owner key，不以缓存结果跳过下一次live认证。

新增限制是：**凡进入此opt-in authority索引的物理行，其mesh键都必须是own data descriptor**。accessor及继承键拒绝，读取时不调用普通foreign getter。默认未注册Collision不采用此限制；不宣称此前所有可执行getter输入仍有相同接受行为。

## 真实发现和修复

1854原索引3/3及独立15/15虽绿，本审额外构造：最后一条foreign row的mesh getter在closing pass第二次读取时追加目标body duplicate。注册和复验当次都成功（545→546行），下一次才拒绝。精确旧Contact反跑也有相同问题，故是**既有同call一致性洞**，不是证明优化引入了新回归。

1900为该输入在建立索引时即拒绝，没有执行getter。独立原探针两路径结果均为：accepted=false、getter调用0、545行保持、duplicate仅1；注册失败不发布新binding。对应作者4绿1红→5/5原日志保留。额外测试覆盖晚期owner认证中改先前key、换collection、重排以及跨call的重复/移除/改指向。

本保证针对这里的普通物理数据记录与明确测试的变更；透明Proxy计数测试只统计访问次数，并不是对恶意Proxy trap、任意JS重入或所有全局原型篡改的安全沙箱证明。

## 验证分母

- 本审最终独跑 **owner-index5 + owner-registration12 = 17/17**，exit0，593.991672ms。
- 作者最终 **local119/119、stop16/16、旧六文件55/55** 的原TAP/exit已逐项读取。55标题多重集与1854轮一致；不和独立17重复相加。
- 新stop原16例/5658帧**整个JSON逐字等1841**，SHA `c2cf0952dc0d0c6c2d7a01256aa4575211b33d73de877c6f543e346f3df6bd38`；不仅摘要相等。因而已审的控制输入、脚高/支承、真实速度及最后停止记录在此次正常输入下保持。
- 1854的117/16/55真终态也保留，但它不是最终1900冻结；新119是明确多出两项后的分母，不回写原日志。
- 本轮没有重跑World、原full1313/完整batch/三base或GPU。

## 同工作量计时如何表述

原`benchmark.mjs`的before/after分别使用精确3b2 Contact与当前Contact；独立核源SHA、old文件=Git原件及after SHA。两边都构造真实CM、14个rig owner、544目标普通盒加30000个无关普通盒，共30544。前后物理记录摘要四方一致，认证返回同一各自binding且无记录修改。

最终1900观察值：

| 项目 | 3b2旧Contact | 1900 Contact |
|---|---:|---:|
| 注册 | 144.93ms | 20.53ms |
| 5次validate中位数 | 152.19ms | 14.33ms |
| validate范围 | 150.82–165.56ms | 9.84–15.98ms |
| 进程最大RSS | 139712KiB | 162772KiB |

这支持“同一合成局部工作量的认证耗时下降”，不是统计充分的通用倍速承诺。RSS反而上升，不能称内存优化。benchmark不生成World、不含全真实地形/动态行，不证明真实帧率、World内存上限或全部运行环境性能。线性键读取测试的确定性上界与计时观测应分别报告。

## P0–P2和未闭合范围

- P0：本轮未发现。
- 本轮P1末次foreign getter窗口，在own-data-only限定中已关闭；旧缺陷/精确旧源复现均保留。
- P1仍然是实际World/全旧回归及建筑入口/释放等既有门槛；119/16/55不代替它们。
- P2保留：合成benchmark样本少及RSS增长；新增authority输入限制应在未来真实World注册前核各真实记录兼容性；不可把恶意Proxy边界夸成已证明。

独立证据：`independent-wumen-index-1856/`保首探针与旧Contact反跑；`independent-wumen-index-1902/`保最终17TAP、同探针拒绝和输入/日志/benchmark复算。后继地面witness改变认证或source时须新冻结，不能继承1900字节结论。

阶段边界：此报告绑定1900的Contact与34/598冻结。随后Task1增加Ground常量及Task2共同surface提取属于新source阶段；本报告不把1900的598集合或通过结论挪作后继字节身份。
