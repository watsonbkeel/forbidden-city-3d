# R160 钟粹宫后殿西配殿独立最低外壳
基线 `6948ead9ce1ba1edc193158ed3590114c5b5b7c0` 已含永和后东/西与钟粹后东正常体。原E61 `FC-A50FDDE804`，只新 `src/scene/palace/special/ZhongcuiRearWestWing.js`；旧src/data与共享hook/main/branches未改。

## 自身来源与边界
官网 https://www.dpm.org.cn/explore/building/236484.html 独立后院段明确后院正殿5间、东西配殿各3间/明间门/黄琉璃硬山，不借前院文字替代。正常公开vpDetail vp3457、vpGroupDetail group132确名“钟粹宫后殿西配殿”，sph1943336451192963072。
自身cover https://file-pano.dpm.org.cn/panorama/2025/07/10/88861a04-3668-4b81-90b7-c4549a24ce7e.jpg 已亲看：绿色中央双闭扇、两侧上暗格/下浅色窗、红侧柱、灰低台/短石阶。树叶遮挡右端，右端/隐藏背侧/比例/色彩/粗格细分全fit，不做树叶/细彩画/陈设；URL年月不是拍摄日期证明。旧item19位于z422为前西配，item17是钟粹后殿（不是同顺斋），不重复计数。

三间7.2×3.6，中心(-76.6,447.6)、rot+π/2朝院-X，全坐标尺寸工程拟合。仅闭壳外观与可达低前台，0室内/新map/rooms，不宣称现今开放或整院验收。照片闭门；沿用QA标题“adapted closed”只指闭壳游戏限制，不声称照片开门或需要开闭变化。

## 完整盒和实体
roof width7.2/depth3.6/baseY3.5/height1.5/overhang.5/hardGableEnd:true。静算使用实际该函数屋盖外延±2.577674，不只朴素W/D。唯一先验完整盒 X[-80,-73.8] Z[443.4,451.8] Y[0,7]，最终实际bbox X[-79.850000012,-74.022326565] Z[443.6,451.6] Y≈0..5.3324。旧前主殿较深后檐/后殿/院墙全真实三角核零，未反复缩盒/移动旧体。
42逐mesh三角owner+2真实平台/阶Box，.2/.1顶各rescue:false；平台8×4.7、前阶2.6×.6；0虚坡/contact例外。背檐距墙帽静算约.772m，不声称背夹缝可通。所有旧geometry/material/physical/support/UI流保全，包含永和后两体与钟粹后东。

## 实际测试与原件
全部原件 `/tmp/r160-zhongcui-rear-west-1212`，source/API/图/逐帧仅本地，SHA在manifest。
1. 正常基线唯一scan1/1：221半米盒内身体点，94813候选可见三角，旧owner/support/visible/body/water全0。驻留east-six/ningshou/garden/axis-courts+global，loadAll:false，不称全宫。
2. 原街4/3315；新选但先于候选验证的钟粹院心横/东侧4/532均到峰0：(-104.5,446.5)↔(-81,446.5)，(-104.5,443.5)↔(-104.5,449.5)，30Hz走跑。旧路线未换点；永和两体不重复走，只全流硬保。
3. 7 missing-builder真RED→7组件GREEN：独立身份/实际完整bbox/逐面owner/真实Box顶/UV/前置注册守卫/资源各一次。无late注册回滚承诺。
4. local1/1：10/60走跑(-82,447.6)→(-79.2,447.6)→原返，新4/147帧峰.104096497，前闭门/后闭墙2拒绝。后墙负控是单体CM封闭性，非背缝全局路线。
5. 作者注入World1/1：原8/3847完整数组同scan，新4完整数组同local；旧3750mesh/2281collider/114top+rooms/maps/regions全流同。先验零旧占用不等于建成后零新体。
6. 2CPU作者亲看真实几何/平色：1348导出三角含12QA地面，非GPU/HD纹理。未运行全项目套件或作者build。

命令：node --test tests/r160-zhongcui-rear-west/component.test.mjs tests/r160-zhongcui-rear-west/routes.test.mjs（8/8）；node --test tests/r160-zhongcui-rear-west/world.test.mjs（1/1）；export-cpu.mjs+render-cpu.py两图。

## 唯一集成
末端finish前正常 `buildZhongcuiRearWestWing(this.kit,this.kit.root.name)`，模块只east-six。作者World用loader注入+before/after流捕获，累计须复制脚本改base/new输出去注入并锁正常record/44owner/2false顶；不能在正常hook后把包含新体的flow当旧baseline。原8+新4完整数组可硬比，原件输出固定/tmp勿重跑覆盖。normalhook/build归唯一集成人。

原院横路先验最大X=-80.82893595，扣半径.5到新前阶toe-79.85仍约.47894净余；候选World同原数组实证未改变。前景邻屋檐柱不造，不把右端遮挡处猜成完整现代细立面。
