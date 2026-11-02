# R158 中所井亭与南库照片窗列累计

运行 `316113804a3f085c0e302fd83c9ec1b16825d59d`，父本地e0340ee5/已回读远端ac17aa1a。仅新增2专属模块及ZoneBase各一次import/call，精确采用独审d0f32620与cd5b2949。井亭接西所中殿之后；南窗接南翼双层之后，不覆盖已验门、楼板和真实23面接触证书。全部data树、20保护文件和前批导航/节能/地图更新保持。

## 原计划可见景点

**中所井亭：** 官网236452的7997题注及中殿前井亭文字支持本体。只做EXPAND-04中所一亭：四红柱、简化绿色曲盖、低红栏和井石。41真实mesh/41三角owner共1460面，0新walkable/room/map；位置(-300,46.5)、尺寸、闭顶、观井缺口/浅安全底为工程拟合，非测绘/井深证明，不复制东西两亭，不把此附属记成原41新增完成。真实预留旧体0交叠/380身体水样本清；原院内路径保留。缺builder/顶法线/石材UV真红均保；最终UV按现库6m，形体不变。初观井目标45.4过近真红，仅移新观井止点至45.1，旧6路线与两负控不改。

**銮驾南库南外墙：** 自身8037可见砖砌山墙与两排小暗窗。墙在右、视线通向东南角楼的拓扑较支持南库南面，但这是未镜像前提下的推断，非官网直接标明单翼。依用户许可只拟合此一面20小窗/两排；窗数、大小/位置非测量，不复制东翼、不改无窗山墙。原南墙1mesh/owner换2merged mesh/完整实际owner；真实120mm闭合背衬+暗凹面，不冒充透明玻璃或可穿孔。北门、屋顶、两翼楼板阶与各23授权面不动，0新support/room/map。作者重复dispose真红→仅删重复调用，50几何各释放一次，前后几何UV/材质/owner流相同，旧两CPU据同流继承非另跑。

两组共4张自制CPU图已亲看，能辨大轮廓，非GPU或真实贴图/手机验收。无细瓦件、精雕或未证专名扩工。

## 本次正常累计

13轻项（井8+窗组件3/资源1/单殿原路1）及2正常World，共15/15无skip。井亭NORMAL_INSTALLED=1无注入，唯一架构record；8路线2255帧峰0、2实体拒绝，routes/negative/summary/metadata逐对象等作者最终。南窗独立累计脚本删除作者注入整个分支，保全部24双翼内外/楼梯路径与断言，另硬锁新2window owners及旧南墙owner缺席、两翼各23面；24/8465峰0，完整四组摘要/全帧SHA数组精确等0130先前正常累计。总32接受路线10720帧峰0，两井负例单列。

正常World是outer-east+global有限场景，不是全宫/GPU测量。单殿北门before/after121帧对照也真实重跑，但不当作整World。原文渊.391和文华.444短时冲刺诊断、其余历史红不被这些新路线覆盖或洗绿。

## 构建、原件与操作边界

664模块clean R158 `/gugong/`及verifyBuildSource通过；`R158-275b52c0ad59`，source`32094f8eca2746eb0522f10dc6f247e317a4d95fd407d5d68139bdcb0cc89cf4`；outDir `/tmp/r158-well-windows-build-0452`。没有新ZIP/部署、实机FPS/温度/功耗或整仓通过声称。

初接线Python期待有空格的旧调用，触AssertionError且未写井hook；shell继续提交了窗hook。随即以精确无空格行补井hook，正常两World/build均在最终运行提交后执行。中间本地历史不作为远端祖先，note原件保留。

本次轻验漏预检作者routes/resource固定/tmp输出，确定性重写其routes.json.gz/resource-green.json；逐manifest核全部作者localRaw SHA仍完全相同、原红未动，未丢任何原件内容。累计另存同字节副本并登记author-raw-integrity.json，不声称从未触碰原路径。后续复验须先将这两个QA输出重定向新的目录，不能直接覆盖作者原件。

EVIDENCE仅登11本地原件和4前驱原件SHA/长度，不上传raw/官方图；/tmp非持久。VERIFICATION绑定3源/7QA/20保护和data树。新normal windows脚本无需NORMAL_INSTALLED变量且绝无prototype注入；井亭须显式NORMAL_INSTALLED=1。用户24B release保持，main/branches不写，保全部开发版本回滚。
