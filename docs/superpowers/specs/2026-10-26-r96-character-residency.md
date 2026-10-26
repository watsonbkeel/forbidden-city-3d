# R96 人物驻留与皇帝短路线：实现合同

## 已批准范围
地面40m显示、约60m预备、约70m退出闲置显示实例；皇帝21:00太和出发到中和，06:00原路返回太和。人物为程序化共享几何，不是每人下载GLB。R95优先队列/actualSubmitted安全仍保留，不改数量；仅中和皇帝必要专用seatVariant允许真实接触适配，其他107人造型不变。

## 模块B：逻辑绑定与模型驻留分离
- 保留108个稳定逻辑ID、所有远处位置/巡逻组/日夜时钟；不降低远处update频率（dt截断使1Hz错误丢时间）。
- 目前prepareFor把每人绑定与LOD2几何生成耦合。改为逻辑绑定只需解析contact metrics；将CharacterKit现有seatPelvis/seatContact/groundContacts公式抽成纯函数，geometry.userData使用同函数。全模板/座位/LOD逐值对照，不用假测量/新坐姿。
- 模型兴趣只按实际最新routine/interaction sample的XZ位置，不按路径起点。地面进入显示≤40m，已显示保留到45m（工程滞后）；进入预备≤60m，已驻留保留到70m。
- 主线程现有预算队列准备当前正确pose/seat粗LOD2，细节仍需求触发；远处逻辑绑定不产生角色几何。旧资源请求若没有任何当前resident使用者可取消，多个角色共享同resource key时保留；不取消逻辑绑定/作息。
- renderer每帧只向actualSubmitted填真正绘制且资源就绪的角色。隐藏但仍在70m内的既有batch count=0，可暂留其GPU克隆；所有引用离驻留域或不再使用当前pose/seat/femalePose/resource key后dispose该batch并release共享资源；70m内的旧姿态也不得一直pin。池中仍被引用资源绝不dispose；闲置CPU资源继续现有有限63项缓存，非无限缓存。
- UI区别registered / 逻辑定位ready / 模型resident / visible / bindingPending / modelPending，远人保留逻辑不等于模型未卸载。

## 飞行、传送、恢复
- ground与flight显式模式由main已有flight.occupied传入，不用相机高度猜。飞行以飞机真实XZ（不是偏移跟随相机）为中心，显示进入120m/退出140m、预备180m/驻留退出220m的工程窗口，同时保留原视锥/像素LOD预算；不会因100m巡航高度把地面全裁掉。24m/s下预备相对显示多60m，约2.5s移动窗口，但不保证实机完成秒数。
- 地图传送/下机：下一现有update根据新相机/模式立即重建兴趣；新兴趣内资源优先，旧纯模型请求失效取消，逻辑绑定不清空。无需同步建几何/等待全部108。
- 原4m未真正绘制不提交隐形身体、玩家占位时不突然实体化的Interaction合同不改。远处动态逻辑安全继续原路径/避让，不随render距离冻结。

## 模块C：皇帝
- 保留21:00/06:00时刻、既有速度与连续步行机制；截取已验证路线可复用前段，再接中和实际椅座。
- 新中和座位需从真实displaySetting椅座/脚面核接触、背板椅臂净空，绑定明确seatVariant。当前座垫/平台高差约.715m，旧最大臀脚差.59m；必要时新增中和皇帝专用variant，验证真实臀脚/衣摆接触，不加虚拟地板或无源踏板。禁止旧乾清nightSeat残留或到时瞬移。
- 路程缩短减少累计移动检查/路线数据，不宣称每帧同比提速或减少由玩家驱动的zone加载。

## RED/独立审核门
1. 冷远处逻辑继续但无模型生成；当前pose身份/座位metrics精确。
2. 40/45与60/70往返，快速地图往返、100m高飞24m/s、下机占位、昼夜/低高档/开关/hidden恢复。
3. 所有共享key多用户离开/保留/回收、取消半成品、dispose一次，无异步旧结果复活。
4. 实际instance.count、近4m动态体、角色位姿/时钟差分；不能以loaded108证明画面有人。
5. 皇帝完整双向路线、终点seat臀脚接触与玩家挡路保持；旧乾清测试保留作迁移证据，不改expected抹红。
6. 正式CPU冷/热配对与资源数，GPU/手机未能跑仍NOT_RUN。

### 资源集合修订（独立审阅）
每帧从当前actual sample生成resourceKey→users集合（含template、pose、seatVariant、femalePose、LOD），不以ID已入场作为永久ready。resident粗LOD2每帧查池缺失即补队列；仅当前期望细节与其同身份粗fallback可保留旧batch，旧昼夜/seat/画质LOD不pin。取消限无用户的render:key，不调用全局cancelPending。共享key一个用户离开不能取消其他用户；逻辑绑定不受模型离场影响。

### 首显顺序纠正（冻结前成本发现）
初版驻留减少模型却增加近处首显等待：绑定优先级使用距离平方，预热却使用米，且固定负优先级细化抢占近处首次定位；纯metadata绑定完成后的Promise需等待当前advance返回，队列可能先启动另一个不可抢占长任务。确定性RED和真实队列事件均确认。

修正：预热统一平方距离，细化排在近处绑定窗口后；仅成功ready的近metadata任务完成后让出当前advance，Promise发布粗模后允许一次urgent接棒。原oldest公平债不清零，下一普通选择偿还；独立连续24近metadata/24粗模证明旧远任务最多第7次选择获执行。pending/error不让帧、取消清接棒标志；不打断generator、不增加预算、不触发微任务计算循环。原同进程五轮与新的独立进程冷样本都保留，后者并非证明前者差异必由JIT造成。
