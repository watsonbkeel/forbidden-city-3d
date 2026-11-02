# R158 中所首进东配殿单体累计

运行 `aa98a0d5f91248497e705bbe476e27c128d0cab3`；父本地bf50/完整回读远端fe037。精确采用独审a82d73d6一新模块，ZoneBase在MiddleWell后恰一次import/call，无其他运行差异。全部data树与22保护文件不变，井亭、南窗、导航、节能、地图净名及此前用户修复保留。用户24B release保持；05:10只读核main仍87ca，未修改main/branches。

## 最小可见开发与证据边界

[故宫总页236452](https://www.dpm.org.cn/explore/building/236452.html)支持每进东西配殿各三间；[官刊2020年第10期p142](https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf)支持前后配殿不出掖头硬山。作者、集成与独审均亲看既有142原页；历史图不是现代测绘。仅EXPAND-04中所首进东侧一座，世界负X为东，正式短名为南三所中所东配殿；不复制三所各进、不新增原41完成ID。

中心(-300,36)、8.4×3.6m、绿红灰色、向院内+X的闭合素立面及其门窗分节/高度为工程拟合，无本体正面官照，不宣称现存身份/尺寸定位闭合。32mesh/32真实三角owner共672面，无新walkable/room/map，无传送或进入室内承诺。平台齐地；仅三间/硬山大轮廓，不做精纹、陈设。闭体、三角owner、石材6m UV及资源释放已验，两CPU亲看，属于平色几何非真实贴图/GPU。原九殿与井亭均保，不为后罩历史文字造新现状建筑。

## 先验与累计实证

预留盒X[-302.4,-297.6] Z[31.2,40.8] Y(.05,5.8)，真实旧实体0交叠、861身体/水格清。原5路（前殿门轴/前庭横路/中殿环路/邻侧/观井）先验1895帧均可走；新体后这5路完整数组不变，未以静态空地代替运行验证。

本累计8组件+1正常World=9/9，0失败/skip。NORMAL_INSTALLED=1，作者QA注入分支不执行，正常唯一hook与唯一record成立；原井亭41owner。另用独立对照硬锁retainedHallCount===9、wellOwnerSHA与作者相同，oldRoutes/routes/negative/summary全数组逐对象等作者。原5/1895＋新外绕2/283，共7接受路线2178帧峰0；2闭墙负例拒绝单列。没有改旧路线或全局控制器/碰撞，没有新增空气坡/支承。

初次组件命令因sparse未物化新tests直接报找不到文件，未运行任何测试；精确sparse-add已提交的QA路径后才得到上述终态，原错误日志保留，未改源码或断言。正常World是loadAll:false、outer-east+global，非全宫/动态串流/飞行覆盖。原文渊.391和文华.444短时冲刺诊断不在本组路线范围，不被洗绿。

## 构建、原件和回滚

665模块clean R158 `/gugong/`，独立verifyBuildSource通过：`R158-2d950f3e7504`，source`d6cfb407ed88a7cc8e8a517ea00d7df1b83561c25c9c3e19c6bc4b60559b7326`；产物仅`/tmp/r158-middle-east-wing-build-0513`。无新ZIP/Pages部署、GPU/实机FPS/温度/功耗声明。

VERIFICATION绑定2源/3QA/22保护、data树和正常比较；EVIDENCE登记7本地原件与2前驱原件SHA/长度。所有raw/官图本地且/tmp非持久，不上传；仅短摘要、测试和2自制CPU图进入净树。普通World复验须NORMAL_INSTALLED=1及独立WING_EVIDENCE路径，不覆盖作者原件。唯一远端父fe037，不上传中间祖先，可回滚旧井/窗累计。
