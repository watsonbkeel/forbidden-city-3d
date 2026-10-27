# R120 累计大版本候选

**不是全宫完工、全部测试通过或自动部署建议。** 本分支保留 main/Pages 原状，正式远端地址由根交付统一提供。

## 实际累计范围
- 继承 R115-fix 的真实图库启动热修；R116 两候选被拒、R117 未有可采纳收益，不用版本号填充成果。
- R118：北京时间21:00皇帝从太和龙椅真实12m/s跑到储秀宫西北既有罩床，与后妃独立槽位共眠，06:00原路返回；乾清原低台/承乾木槛有限同源接触。原人数108/其他角色/40m显示/全区预建策略保持。
- R119：交泰既有屏框上场、藻井口沿/悬笼连接和有图证中央/西侧内檐，未知面不镜像补造。原黄罩/钟漏/四门通路保持。
- R120：乾清**已有**五屏/三paint不重报新建。牌与五龙带作为整体在旧背框/冠顶内重拟合；四条既有侧栏平面内增下曲连杆和通透金线，四个真实成品面owner不填大box；原23×12连续格顶增加.12m旧厚度内浅口沿，无藻井/新柱窗/新家具/新图集。

照片提供可见形制与投影比例，不是米制测绘；曲线/纹样为示意，未知铭文/暖阁/仙楼/背面/器物身份不造。保留官方源链接和独立实看记录，官方参考图片不作为产品纹理分发。

## 性能专项：负结论也保留
五类当前源/实际world诊断均有ledger。只对完整R120_PRE_PERF尝试一个新源校验热点机制，原NR1及一次有因果的编译少分配细化NR1b皆被原counter门拒绝；没有删异常样本、松门或第三轮挑绿。最终性能输入精确恢复到艺术基线，不宣称整体、首屏或人物帧率提升。详见 `reports/r120-performance/ACCEPTANCE.md`。

美术确定增量：+4192 resident triangles、+402432B成品geometry ArrayBuffer，0新mesh/material/texture；4个额外源owner共2656faces，单顶点数值payload191232B，不含JS对象/索引/复制。三对局部fresh成本 high中位305.393→325.200ms、low301.832→357.572ms，非性能收益。全功能累计成本另列，不跨协议相减。R115-fix→R120 all-ready CPU中位low6249.919→6642.700ms/high6157.816→6701.786ms；普通return/rebuild最高1481ms，独立TTL expiry最高2106ms。首次Teleport.go CPU setup54–109ms，非连续walkFPS。全部可达资源估计的列举根范围/59项UNKNOWN见VALIDATION，非fullheap或VRAM。

## 保留限制 / 使用前注意
- 原标准current-state历史失败必须按名分诊；旧assert锁定较早整体源/几何的冲突不被改expected伪绿。
- R118旧太和prefix仍有已证成品/皮肤交叠，R120不声称全路线/全园零穿。新栏路线是完整body每帧endpoint对实际tri检查，不扩大为全世界连续sweep证明。
- CPU actual-ready纹理投影不是GPU/PBR/shadow/mipmap实机；本机缺CJK字体的CPU空牌不代表产品改字。真实手机、GPU游玩、候选真实Node20仍NOT_RUN。
- 保留回滚版本。未经目标设备体验确认，不以本记录自动宣称部署推荐。后续R126再做下个累计大版节点；未闭项不会因R120号消失。

## 构建与交付
三种base `/`、`/gugong/`、`/forbidden-city-3d/` 的干净构建与readback，root生产包及HTTP/launcher验证见 `VALIDATION.md` 和交付manifest。准确最终commit/tree由冻结后外部manifest提供；本页不使用自引用伪commit。
