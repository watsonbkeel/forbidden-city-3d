# 午门上层：离线数值合同与真实前驱记录（有限检查点）

**不是新的亭翼实体，也不是整午门验收。生产600文件零变化；新6个文件均为离线QA/脚本/fixture。** 父21:08批准本阶段两项；此前设计稿中的“待批准”是历史阶段。整体R157完成增量0。

## 本轮实际结果
- 纯数值合同5/5；前驱签名6/6；与原lower19合跑 **30/30**，3个文件，0skip/cancel，5.296秒，峰值RSS338472KiB。独立5/5与6/6另有原TAP，覆盖重叠，不相加冒充更多唯一测试。
- 全部600 src/data与a32/49b源清单一致；完整4412 tests/scripts = 父4406原字节 + 本轮6个新文件。
- 实际前驱 captureGate 使用真实PalaceBuilder，但替换finish保留未合批对象，简化材质tile/aspect=1；892节点、188旧柱、452碰撞记录、16支承。v2 raw9,887,383B/gzip323,488B。这是本轮新捕获，不是找回丢失旧档，也不是未来新实体反录。
- 签名保全部列明字段，包括属性/index原byte SHA、材质及texture参数、节点/祖先矩阵与flags、实际物理记录。不是任意JS对象安全/无损认证；函数、恶意getter、shader回调、纹理像素不在该承诺内。会刷新矩阵缓存，不替换或释放geometry/material/物理行。
- `-0`、非有限值与undefined显式编码，形似token的原对象escape；不以epsilon/删字段过绿。基线wrapper的helperSHA是捕获时身份；当前helper仅decoder两pins更新，独审已精确重建。

## 关键原红不能混淆
`task1/red*.tap`为缺module的1文件加载红，不是5断言红。Task2 `green-attempt1`实际3/4（Canvas UUID），`persisted-red`为缺decoder export的1文件加载红；名字误导的`green-final`实际 **4/5红**（JSON -0）；`encoding-red`0/1，后1/1；`final-11`才11/11。首2115基线仍保留，2118-v2另捕。外置生成cwd错误、缺/usr/bin/time导致Node未启动也单列原件，不计产品测试。
历史早轮并非每份RED均保存了完整代码快照；只能按原log/已存身份说明，不声称任一旧RED可由最终字节复现。

## 数值边界
源16内侧圆符号已重新逐图独读；旧NE crop未恢复，+600为新的整页视觉注册，不是精确恢复。112→104是角色替换，不是仅删8：24旧接口/翼端角色移除提案、88原柱位移、16新增内侧；52主楼完整非目标、24横连位置仍待专门合同。8接口区域的柱数/身份仍未知。
NE平面/.3375m间隔均工程offset，不是净通道。屋面recipe/knots为数值提案；实际采样接触、角部lift/脊管派生Y、apex退化拓扑、normal/UV未生成验证。不能默认扩大RoofBuilder尺寸或scale合并屋面。

## 未关闭
新实体、完整上层/台面FP、实际TextureLibrary与finish/merge、World、完整全套/batch、3base/GPU/发布本轮均未验。旧10缺历史ref、38标题未执行P1以及既有full213/batch10红仍继承，不用本轮30绿覆盖。后继consumer必须显式源绑定；持久replay测试本身不重新校600源。

正式独审见independent目录REVIEW-2114与REVIEW-2123；此前设计报告按各自冻结轮保存。ARCHIVE-RECEIPT逐项绑定原件/无损gzip；私有PDF/源PNG未入包。远端复验PENDING。
