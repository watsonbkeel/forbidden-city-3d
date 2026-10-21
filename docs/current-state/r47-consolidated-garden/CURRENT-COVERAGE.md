# 当前建筑覆盖进度

本文件描述 R47 的局部更新范围，发布状态以对应开发分支与验证记录为准。这里统计89个有名建筑身份，不是159个地点条目，也不把一次资料阅读算作完成建模。

- 首轮资料核对覆盖89个身份：78项取得部分建筑专属事实；另11项仍只有身份/用途或复合院落位置条件，不能称为完整建筑图纸验证。
- R39–R47实际局部几何变化涉及19个有名身份，另有4座未单独命名的东六宫后殿。没有把这说成19座完整复原。
- 其余70个有名身份在本轮尚无新几何改动。其中包含原本已有专用模型的建筑，并不等于70座全部仍是通用壳体。
- 尚未对任何建筑作“完整复原验收”。尺寸拟合、未知陈设、照片年代、旧陈列与现状分别标注；没有真实GPU场景或原生手机视觉验收。

## 已产生实际变化的19个身份

1. 文华殿（wenhua）：屏风横枋、走廊卷轴斜托板等有照片依据的局部陈列支撑。[官方建筑资料](https://www.dpm.org.cn/explore/building/236531.html)
2. 奉先殿（place-east-six-d8aef2e8a9）：撤去不合宗庙用途的通用朝会宝座，明确祭祀陈设待重建，而非历史空置。[官方资料](https://www.dpm.org.cn/explore/building/236430.html)
3. 储秀宫后殿，丽景轩对应模型（place-west-six-64bc5aa115）：五间柱网、平齐硬山端部；室内仍有未核实部分。[储秀宫及后殿资料](https://www.dpm.org.cn/explore/building/236486.html)
4. 咸福宫后殿，同道堂对应模型（place-west-six-856e48412c）：五间柱网、平齐硬山端部；室内尚未完成。[官方资料](https://www.dpm.org.cn/explore/building/236507.html)
5. 长春宫（place-west-six-7afded67d3）：帘罩分界、北侧炕轮廓、照片拟合的低木座和屏风。[官方资料](https://www.dpm.org.cn/explore/building/236436.html)
6. 翊坤宫（place-west-six-374b36682d）：中央落地罩与外间隔断边界，通用座形仍有待核实。[官方资料](https://www.dpm.org.cn/explore/building/236517.html)
7. 景仁宫（place-east-six-6af6dcfc02）：后中央门、后檐玻璃关系与拟合台阶；座位移动仅为模型通行。[官方资料](https://www.dpm.org.cn/explore/building/236509.html)
8. 钟粹宫（place-east-six-479353af2c）：前廊、内退围护与槛窗层次。[官方资料](https://www.dpm.org.cn/explore/building/236484.html)
9. 永和宫（place-east-six-d2b7eec1f3）：敞三间抱厦、曲椽屋面与主室素格天花。[官方资料](https://www.dpm.org.cn/explore/building/236518.html)
10. 储秀宫（place-west-six-b0a68a4270）：按1971复原陈列的1982文字描述补三处西侧炕体量，不当作2026完整清单。[官方研究](https://www.dpm.org.cn/Uploads/File/2024/07/22/u669dcd8dc5647.pdf)
11. 古华轩（place-ningshou-a1ea21a7c3）：通透三间与围廊、落地罩和座栏；旧近似屋顶保留。[官方资料](https://www.dpm.org.cn/explore/building/236431.html)
12. 颐和轩（place-ningshou-d653a5843e）：七间主体、五间前部与三间后部、随安室西向入口及相通空间；屋顶和西侧细分仍待完善。[官方资料](https://www.dpm.org.cn/explore/building/236516.html)
13. 寿康宫（place-outer-west-83d425c911）：五间比例、前廊、暖阁边界、多组门、复原陈列照片支持的座屏体量。[官方资料](https://www.dpm.org.cn/explore/building/236448.html)
14. 箭亭（place-outer-east-af36d75128）：有围护主体、周围廊与南五北三门组，未增造武备展陈。[官方资料](https://www.dpm.org.cn/explore/building/236578.html)
15. 临溪亭（place-outer-west-00b009500f）：四向门窗围护、南北阶梯、东西临水护栏和平素天花。[官方资料](https://www.dpm.org.cn/explore/building/236537.html)
16. 英华殿（place-outer-west-c7765a0d84）：五间庑殿与中央四叶门、侧间槛窗；七龛摆位仍待核实。[官方资料](https://www.dpm.org.cn/explore/building/236568.html)
17. 咸若馆（place-outer-west-6cc7b2a27f）：五间主体、南三间封闭抱厦与有年代界限的三面素阶梯柜。[官方陈列资料](https://www.dpm.org.cn/show/225718.html)

18. 万春亭（garden-procedural-万春亭）：较窄四抱厦、十二柱、内外两重门与圆形上檐；保留台基近似，构件尺寸与门姿态为拟合。[官方成对资料](https://www.dpm.org.cn/explore/building/236521.html)
19. 千秋亭（garden-procedural-千秋亭）：同类建筑拓扑，附保留原树的北阶西侧通行阶翼；不代表实测阶宽或现场开放许可。[官方平面研究](https://www.dpm.org.cn/Uploads/File/2020/04/08/u5e8d77d699010.pdf)

另行统计的4座后殿是景仁、承乾、钟粹、永和对应东侧后殿：仅五间/硬山端部等局部变化，不将承乾主殿也计作已更新。资料/引用修正的含清斋、太和殿、中和殿、宝蕴楼也未被重复算作本轮几何变化。

## 后续优先顺序与工作量估计

以下是每批资料已足够后的实施与检查量估计，不是全部故宫完成日期。新发现矛盾、通行问题或需要补图时会延长。

1. 万春亭、千秋亭：本合并候选已局部实现20折角围护、较窄四抱厦、内外两重门、12支点与圆上檐。准确台基、栏杆、斗栱彩画和细部仍待后续照片约束，约1.5–2.5小时起，不能把本批当作完整验收。[故宫公开平面，189页](https://www.dpm.org.cn/Uploads/File/2020/04/08/u5e8d77d699010.pdf)
2. 浮碧亭、澄瑞亭：三间桥亭及南向敞抱厦，需连同台基、池沿、桥面和碰撞重新协调，预计2–4小时。澄瑞已撤除的围板/祭坛不恢复为现状。[浮碧](https://www.dpm.org.cn/explore/building/236498.html)、[澄瑞](https://www.dpm.org.cn/explore/building/236443.html)
3. 御景亭：先处理四柱、四向围护的外观，预计1–2小时；山路上行、落脚、下行及室内准入另作完整方案，约3–5小时，不能靠悬空传送伪造可达。[官方资料](https://www.dpm.org.cn/explore/building/236490.html)
4. 其余东西六宫区别化：承乾、景阳、永寿、太极、咸福等，分批核对隔断、门窗、天花与时期，预计每个有可靠依据的小组3–6小时；资料未列家具不等于家具不存在。
5. 宁寿区及佛楼的真实多层：乐寿堂、景祺阁、梵华楼、符望阁、宝相楼、吉云楼等，需要真实层板、楼梯、竖向空洞和导航方案，预计每种复杂类型4–8小时以上，不能拿屋檐层数冒充楼层。
6. 南三所及身份/位置缺口：现模型只有每院两排，官方为三进，先解决有名对象与院落位置绑定，再更新布局；在获得可靠对应图之前不承诺建模时长。

当前优先推进有证据的实际房屋区别，而不是用同一套家具填满所有建筑。地图地点、既有路线、树木及交互保持独立检查，必要变动将明确记录。
