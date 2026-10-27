# R120 PRE_PERF — 独立图源／成品评审

2026-10-27 04:43 UTC；只读产品、未并发构建 world。**三组艺术成品可冻结作性能前基线；此结论不是性能收益、GPU／手机或乾清整殿复原验收。**

## 绑定与证据

- PRE_PERF commit `cb77e454db5b4b494caa1198a827210bb7077b8d`；runtime `8938de15545ac0fd46b7dfbde5a2d8c30e650ed130ecfbbb5cb8f7783cabfdcb`。
- 图证真实生成于 `f1165a9b167baef8b8cc7a557460fe965475cd635262fe60480db8852382af4c`，不是上述新 hash 重渲染。独立脚本在内存中仅把当前 `release.json` 还原为 R119 字节，所得全 runtime 指纹精确复现 f116；其余源均相同。核验前后当前指纹均 8938，runtime 无 dirty。
- 基线图证 R119 `7743ab31…`／`6f9a617a…`。前后 screen/frieze/ceiling 三 paint 均 ready，46 个 ImageLoader 请求、0 错；非 fallback。
- 亲看官方 1523 全景与 2568 轴上近照、actual-ready `front/west/east/ceiling/axis/rail` 六机位同视角前后。官方图是私人对照输入，不复制进本评审交付包。
- 可重跑 `export-diff.py <writer-tree> <result.json>`。本次 `export-diff.json` 含 source before/after、全部所读图／导出／日志 SHA；`export-diff.log` 是原输出。未来性能源变化后不可把旧 raw 冒充新源结果。

## 三组判断

**A：原屏／五龙带／牌的联动比例拟合。** 五扇画屏、透雕冠、龙椅、前案及五龙纹原来已有，不计新增。官方近图支持牌宽／带宽约 .75–.78、带高宽约 .19–.21，旧模型约 .53／.119。新 .75／.19 使 ready 比例改善，轴近图可见屏冠—带、带—牌、牌—原顶框的正间隔。6×1.14／4.5×1.30 与 .04／.07／.05m 间隔仅工程拟合，非测绘；不能称精确历史复原。CPU 汉字缺字为字体能力限制，不据此判产品牌文错误。

**B：原四栏平面内的下框与开放金线。** 图支持多层开放栏而非旧单横杆；新曲线为示意，不是精确雕纹摹本。近图保三个踏步净口与开放栏洞。读取代码确认四个限定 owner 从最终合并 Float32 near 面取值，以外框作 broad-phase、实际三角作窄相；未把洞封成盒，也未新开全局 solver。旧栏柱／横杆及全部旧物理保留；near/far 显隐不撤销常驻接触。

**C：原连续无藻井格顶浅口。** 23×12、原盘纹、原高度／.12 厚域及 far 已有。本轮 276 格各 8 面的浅框口增强深度，非新增顶／藻井。真实下向法线已有 RED→GREEN；未增图集／材质／批次。

未知背面、雕纹精确细节、照片日期、器物身份、测绘尺寸、侧窗注册和暖阁仍局部 unknown；未据此补柱、窗、新家具。R112 分母不能变为全殿完成。

## 独立输出差分与通路范围

离线真实成品顶点 multiset：21,384 → 25,576，净 +4,192 面；仅 A 的旧 24 面被新 24 面替换，B +1,984、C +2,208。各改动 world bounds 见 raw；没有其他旧导出面消失。15 张选中 map 的 metadata／解压 RGBA 独立 SHA 全相同，16,126,976 logical RGBA bytes 不变；此 CPU 环境的缺字体像素不能替代浏览器牌字证明。

已读 writer raw：R120/R106 16/16、R120 单独 13/13、R118 27/27；三 flight／门口／侧后绕 .5m 正常身体，10/30/60 Hz 正反向共 6 路＋小洞探针，7/7。实际新栏三角检查为每帧 endpoint、不是独立连续 swept 全世界 oracle；小洞是拓扑探针，不声称成人可穿它。故这里不宣称整路线／全世界所有渲染体零穿插。

writer 精确保留报告与旧 fixture 的数值相等：106 旧中央部件、排除恰好四新 ID 后的所有旧 collider／walkable、六陈设全部 near/far、far 格顶、3 paint 文件。R112/R119 24/25 的唯一失败是旧 R119 全 physics hash 与四新 owner 的预期冲突；旧 expected 未改。不是全套全绿。

## 成本与性能分界

成品 resident：+4,192 三角、+402,432 geometry ArrayBuffer bytes，0 mesh／material／texture 增量；+4 owner／0 walkable。另有 2,656 source faces／191,232 bytes 顶点数值 payload；不与 typed geometry 合并冒充完整 heap，JS 法线／盒／索引／克隆额外未知。

3 对 fresh art 测量（保所有样本、不能称优化）：high build median 305.393 → 325.200ms；low 301.832 → 357.572ms。此处的成本上升是美术增量，之后只能对 PRE_PERF 完整同质成品谈优化。进入前全 ready 不变，不接受提前 play／首次访问等准备／降低档位／减少人数作为收益。后续 candidate 必须有源绑定的相等性与 fresh 配对测量；GPU/PBR/手机未验。
