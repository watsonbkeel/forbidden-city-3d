# R374 四轴线门原源 QA 适配（未冻结/上传/hosted全区复验）

Parent R373 `71f49495168f735ecae4f8b909f25cab7c531dd3`，tree `3851ac31c9744527407fbc8b9445e26cd0339b2a`。1075产品文件不变；四门分别为原axis-courts编号2左翼、3右翼、12中左、14中右。不是新三佛交付，不预减R373实际剩5错误/28警告。

## 证明范围
- 原buildGate完整hook后捕获全部colliders/walkables、frame/userData和所有可见节点/几何/material指纹；登记时保存原CM对象身份，使用调用者完整CM，未过滤邻居。
- 中左原kit.finish会补牌匾material/atlas UV。保留原plaque对象和preUV，以当前完整kit的真实文本序列按原21列、96×256格、2048宽、POT高公式逐项校验float32 UV和真实材质/贴图尺寸，再核其余原可见几何。不以局部atlas UV固定值误拒全区，不笼统忽略UV。
- 原center→local±8m直扫、原seed±4.7、0.5m格、radius16和禁退signedlocal<4原样保留。seed由原CM及绑定ramp精确公式交叉确认：左1.5、右/中左1.695、中右南2.4591133/北2.2026667。这些是源码模型值，非实测。
- 原控制器10/30/60Hz跨真实完整坡道地面→门→另一侧地面→返程。左右翼额外两条路径取原源码portalCenters（左±2.85、右±2.52），中左/右取中央走廊±0.6，合36条正路径。每条12 waypoint crossings，移动/settle每帧camera xyz/feet/groundY finite且feet>=0，回到真实Environment地面。
- 左右翼local±0.6路线碰真实门柱域，保留为拒绝负例；不能称门间任意横移自由通行。中右保留现代门槛board，原生feet可略高于floor2.6，不强压到常数。
- 局部fixture的翼门真实完整墙6/7及同墙另两门均原build；中门墙13/15。不是全世界，不能代替hosted全区。

## 负例和未验
原item/源几何/可见mesh/登记collider/support替换、真实地面删除、外来墙和原动态人物阻挡、原feet0实体基座、旧中右BFS阻塞、原plaqueUV破坏均须拒绝。真实前置门改变atlas顺序仍须通过合法原公式。

尚不是逐帧所有渲染三角形零穿透证明；真实GPU、手机、完整路线未验。三佛网络取消和美术验收未关闭。只允许开发分支交付，main仍由用户自行合并。

本地受控合同44/44通过（24.1秒；timeout60秒、Node heap384MiB，不是RSS硬上限）。hosted全区仍未运行。
