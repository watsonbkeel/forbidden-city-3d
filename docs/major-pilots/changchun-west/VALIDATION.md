# 长春宫西次间有界组合验收

## 实做范围与证据
安全生产父本 `8311edf8114c8201adb6b0689a7d7de28be17489`；独立分支 `feat/changchun-west-safe-20261029`。对应原文FC-7AFDED67D3 / MASTER-PROMPT第582行。官方[长春宫236436](https://www.dpm.org.cn/explore/building/236436.html)及亲阅[西次间照片1456](https://img.dpm.org.cn/Uploads/Picture/dc/1456%5B1024%5D.jpg)：完成帘架上格/蓝灰金边垂帘—西北炕罩前格与一侧板面—后窗关系的**有界简化拟合**，不是全宫或整套室内库存复原。相机方向无caption，后部映射到现有北炕属文字+图像推断；精雕、书画、织物、未定位灯具/高陈设、隐藏背面未验，不虚构。

保留原西炕、8件炕罩柱梁、帘架2柱1梁；仅移除1件旧西侧素帘。新增127个实际闭盒网格，配合12件原源，注册139个精确最终Float32实体盒。无覆盖空洞的隐形封面；4个私有材质，不改共享材质/合并器。固定owned domain仅在原室内，唯一既有.6m地面见证；不加新地面/房间/楼梯/环境面。共享改动仅该kind的验证/分派与重复、降级守卫，不改通用步进/垂直算法。

## 实际执行结果（全部串行）
| 证据 | 终态 |
|---|---|
| `specialized-final.tap` | **91/91**，17.03s，0skip/cancel |
| `shared-final.tap` | **161/161**，330.82s，0skip/cancel |
| `legacy-32.tap` | **32/32**，33.79s，0skip/cancel |
| `r54-changchun-final.tap`，完整3个长春文件 | **17项，16通过/1失败**，1.999s；不是全R54项目全绿 |
| `compile-memory.json/.log` | `/`、`/forbidden-city-3d/`、`/gugong/`三base各493模块编译成功，HTML/JS/build-info身份相同；write:false，未输出bundle/复制public |
| 源码语法与限定diff whitespace检查 | 通过 |

共享完整命令：`node --import ./scripts/major-pilots/changchun-west/preserve-shared-reports.mjs --test --test-concurrency=1 --test-reporter=tap`，参数为r100-xishang-movement、r100-xishang-stone-rails，r104-roof-surface、roof-prefix-equivalence、roof-integration、xiqing-motion，r65-pedestrian-controls，r91-terrain-vertical，以及major-pilots/xishang、jingqi、changyin、jiyun-rail、jiyun-lower-panels全部test。旧32为r48-outer-navigation、outer-stairs、outer-neighbors。长春旧组为r54-changchun-east-layers、east-materials、world-consumer。

### 唯一保留的R54失败
旧R53 snapshot要求整个旧西侧也完全不变，与本轮获准替换西帘/新增西组冲突；没有修改golden、删断言或暗换输入。`r54-parent-snapshot-diagnostic.json`证实实际8311父版完全等于该旧capture；candidate中原westKang、centralFiveScreen、eastKang的旧fingerprint仍相等，仅partitions不等。独立整殿/整西六宫允许名单对照证明除此西帘/新组之外旧源及物理导航全部精确保留。东R54最终world consumer的3项全部通过，原4材质/1764三角保持。

首次旧组另缺稀疏工作树的64KB受跟踪证据，原失败保留；只取回HEAD原文件，完整三文件重新执行得到上述17项，不拿单个consumer重跑冒充整组。

## 通路与边界（不扩大结论）
- 全西六宫实际构建与8311父版逐源hash/旧collider/全部walkable、room、region、map精确对照：非目标、床和隐私隔断未变。
- 真实完整World中扩至x[151.25,164.25],z[372.25,386.75]、全高[-100,100]源域扫描无不支持的foreign triangle/overhead/surface或异域scope；仅1个owned anchor。
- 实际完整World **48组**10/60Hz走/跑/跳、双向观览/两床南侧接近路径，逐帧独立最终F32新源零正深穿透。床测试包含真实buildNightBeds；**不是入床、躺床或NPC整夜路线验收**。
- 西域边界是真正双向通过；北/东/南保持原墙挡停，.3/.5运动与父版结果一致，**不是四边均可穿越**。
- 12条从真实旧炕1.1m支撑开始的重复跳跃路线检查实际起跳、全程最高脚高/支撑和最终状态，对新源及原可见墙严格零正深穿透；这些路线最高支撑不超过1.14m真实底边。**不声称全局不可攀或任意飞行落点安全**。
- 实际站/坐NPC阻止下落但不变成落地/跳跃重置；anchor重复/篡改/降级/移除重载、唯一地面消失/重复、资源释放均验证。

### 真实行为差异与测试反例
旧观览终点z381.7在10Hz冲刺松键惯性中会继续到原炕前；新strict域允许踏上实际.5m炕顶，feet1.1，而8311父版停.6。原失败、父版诊断、现有真实炕接触单列保留；常规地面观览终点380.5留足刹停距离，不冒称旧轨迹完全相同。

初次高跳测试误把合法1.14m底边支撑算失败，按实际源查明后明确记录4cm支撑，未修改生产算法。第一次原子断言深比较Three对象导致SIGKILL，换成有界引用/长度断言后复现真正75vs74破坏并修；不把harness修复冒称渲染修复。

首次共享161为153pass/8fail，均为旧测试写固定报告路径的ENOENT。仅将8个旧区域输出及4个R104输出重定位到本任务reports后，从头整组161重跑通过；原完整失败日志保留。

## 规模与未验
`metrics.json`真实整殿比较：raw meshes127→253，triangles4086→5598，bytes216764→322604；合并meshes22→26、triangles4086→5598、bytes392256→537408；colliders69→208，walkables2不变、rooms3不变。空间查询/碰撞CPU成本增加，不等于已做帧率/显存验收。GPU视觉、GPU/移动端性能、整个世界性能基准均未测。

编译源码fingerprint `d63ba6e4d5dda78bfc9c2bfe37a3bc95db039b2df048b2308de456d91578d69c`。构建报告是提交前工作树身份，不是可上传包或HTTP验收。未重跑全current-state、全项目test:zones或全R54；旧zone-lint与既有未闭区域问题不被本轮覆盖。

独立只读三轮复核见REVIEW.md；先前原子性/完整盒拓扑/F32 oracle问题均有红→绿证据。旧工作树14份脏报告SHA全部保持（preserved-old-dirty.json）；花园WIP33714086、宁寿门预检cd341a2c、九龙壁预检7558825f保留在分离分支，未混入生产父本。可整提交回退至8311edf8；未推送/部署/改main，磁盘约1563MiB，任务增量小于10MiB。
