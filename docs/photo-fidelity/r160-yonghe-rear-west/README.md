# R160 永和宫后殿西配殿独立最低外壳
基线 `f4a21f2dd3f5757fe0e25aa4ca0fce1f52ace5c4` 已含正常后东配。原E61 `FC-171FEF95E4`，只新 `src/scene/palace/special/YongheRearWestWing.js`，不修改旧src/data、共享hook、main/branches。

## 自身图证与拟合边界
官网 https://www.dpm.org.cn/explore/building/236518.html 后院段明确同顺斋院东西配殿各3间、明间开门、黄琉璃硬山；不是借前院文字。正常公开API vpDetail vp3670、vpGroupDetail group159明确“永和宫后殿西配殿”，sph1943462250404761600。
自身图 https://file-pano.dpm.org.cn/panorama/2025/07/10/9a8a4298-d420-4c4e-b2b3-4d2875eb3a7a.jpg 已亲看：中央门现开、两侧绿边浅色槛窗、红柱、低灰台。前景井亭/临时展板/盆栽不属于候选。**本轮闭门外壳是明确限制，0室内，不称照片闭门或现实开放。** URL日期非拍摄日期证明。
主体7.2×3.6三间，中心(-132.2,392.5)、朝院东(-X,rot+π/2)、等分/尺寸/色彩/粗窗格/扇数/背侧为工程拟合；独立自身窗粗形，不拿东配照片冒认西配。现前西配item33在z367.9，不重复计数；同顺斋item31及后东配全部保留。无整院验收。

## 完整包络与安全范围
先按同一已验hardGable roof参数实际檐端外延2.577674静算，再唯一完整盒 X[-135.6,-129.4] Z[387.5,397.2] Y[0,7] 先验。roof width7.2/depth3.6/baseY3.5/height1.5/overhang.5/hardGableEnd:true，未反复缩盒或移旧体。最终实际bbox见summary，X[-135.450000012,-129.622326565]，背檐距原墙帽内缘约.772m（静算、不声称背缝可通）。院心原横路x=-137端距前阶1.55m，保原点。
44逐mesh真实triangle owners，平台/前阶2真实Box+2精确顶rescue:false，.2/.1低阶；0虚坡/contact例外/rooms/maps。灰台8×4.7、前阶2.6×.6。全部原流保全包括已建东配52owner/2top。

## 必要实测终态
原件 `/tmp/r160-yonghe-west-rear-1138`，最终命令与证据SHA见manifest。
- 正常基线World唯一先验1/1：260盒内半米身体采样，96345候选可见三角，旧owner/support/visible/body/water0。原街4/3315、后院4/548及东配4/178全到；loadAll:false，驻留east-six/ningshou/garden/axis-courts+global，非全分区。
- 7 missing-builder真RED→组件7/7 GREEN：自身身份、实际全盒、逐面owner、真Box/top、实际tileUV、前置注册守卫和资源各一次。无late发布回滚承诺。
- local1/1：10/60走跑，(-137,392.5)→(-134.8,392.5)→原返，新4/127帧峰.103942972；前闭门与后闭墙两负控拒绝。后墙是单体CM封闭性，不是背夹缝全球通路宣称。
- 作者注入World1/1：原8/3863与东配4/178完整数组同先验，新4完整数组同local；旧3660mesh/2191collider/110top及rooms/maps/regions前后全流同。先验零旧占用不混成后验新体零占用。
- 2CPU作者亲看实际几何+library平色，1372导出三角含12QA地面，非GPU/HD材质。无作者全项目套件/build。

## 唯一集成
末端finish前正常 `buildYongheRearWestWing(this.kit,this.kit.root.name)`，模块只east-six。作者World为loader注入加旧before/after捕获，不是正常hook验收。累计复制脚本、去生产注入/换新输出路径，并硬验正常record/46owner/2false顶；不得正常hook后把含新体flow冒旧baseline。原12+新4完整数组可硬比。所有作者脚本固定/tmp输出，不直接重跑覆盖原件。正式normalhook/build由唯一集成人完成。

命令：node --test tests/r160-yonghe-rear-west/component.test.mjs tests/r160-yonghe-rear-west/routes.test.mjs（8/8）；node --test tests/r160-yonghe-rear-west/world.test.mjs（1/1）；export-cpu.mjs+render-cpu.py。照片/API与逐帧只/tmp，不进远端资料。
