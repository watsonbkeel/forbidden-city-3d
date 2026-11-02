# R160 继德堂：工字后殿官文/平面最低闭壳

原项 `FC-7AACE4D51F`，基线 `e41cfa976576ade40a227c4f18f679b8bae3d65f`。唯一新生产文件 `src/scene/palace/special/JideRearHall.js`；无共享hook修改。唯一集成人在正常 `ZoneBase.build` 的 `this.kit.finish()` 前接 `buildJideRearHall(this.kit,this.kit.root.name)`。仅east-six有效。

## 身份/证据/未验
- 官网 https://www.dpm.org.cn/explore/building/236570.html ：工字后殿面阔5间、进深3间、黄琉璃歇山；前明间接穿堂，廊檐小板门，次梢槛窗；后檐均槛窗；室内明间匾曰继德堂。这是后殿子项，不把已建工字前殿或惇本殿重复算它。
- 2021官刊 https://www.dpm.org.cn/Uploads/File/2021/09/15/u6141698d36e1d.pdf ，PDFp2/印110图一：蓝色后殿位于橙色工字前殿北侧，黄色穿堂另体。只借独立相对位置，不用平面证明外立面颜色/纹样。
- **没有自身外观逐面照片**，不借2020前殿或惇本图冒充后殿。`ownPhoto:null/facadeVerified:false/identityEvidence:OFFICIAL_TEXT_REAR_HALL_AND_REGION_PLAN`实际在源。前四槛窗/后五槛窗按官文做粗暗面，门叶数/窗分格/色彩/全部尺寸位置与背侧处理fit；不是现代实景验收。
- 只闭壳及可达低台；不做独立穿堂、味余书室、宛委家具、内部小迷宫或新增院墙/地图名称。中央闭门不宣现实开放，不计工字整体完成。

## 完整空间与真实实体
中心(-134.5,282.5)、20×11五间；roof xieshan width20/depth11/base5.2/H2.8/overhang.9。22×12×.3基台及两级.15、深1.4的真实短阶；**没有复制前殿大月台**。门窗前面localZ=-4.7、柱线-5.4为工程拟合，保证外台目标与闭门有净距，不造内通口。
实际完整bbox X[-145.949279785,-123.050720215] Z[273.700000012,289.473054886] Y[≈0,9.002203941]；硬锁唯一盒X[-147,-122] Z[273,292] Y[0,12]。新roof与原东街轴x=-120.8距离2.25072，扣玩家半径仍1.75072；不移动原街或奉先墙。
92逐mesh真实triangleowner+3基台/阶Box=95，3真实顶rescue:false；0新contact/虚坡/room/map。

## 有限验证与原红
1. 正常基线唯一先验：1989半米身体点、全旧可见三角/owner/top/水均0交叠。原街4/3315+院外接近(-120.8,271)→(-134.5,271)→(-134.5,272.7)原返2/293，全部到、峰0。实际驻留east-six/ningshou/garden/axis-courts+global，loadAll:false，非全分区/GPU。
2. 7个missing-builder真RED；首实现轻测2红来自source/QA的内部ID字符串不一致（`jide-front-photo-fit` vs `jide-photo-fit`），统一为准确`jide-rear-text-fit`并澄清注释，没有改几何/物理。首日志及local原件保留；最终7组件+local1绿。组件核身份/前4后5粗窗/全包络/所有真实owner/3真顶/真实tile UV/前置守卫/资源一次释放，不宣late-publish回滚。
3. 新前台10/60Hz走跑(-134.5,272.7)→(-134.5,276.7)原返4/194帧，全到，峰.147277780758；闭中门/背面2负控拒绝。
4. 作者loader注入World（不是正常hook）：旧6/3608完整对象与正常先验全同，原3970mesh/2501collider/124top和room/map/region全流同，含毓庆前殿、惇本、诚肃及全部已建后配，不重复走它们全部路线。
5. 首World真exit1只因继承短路线QA的额外`coast距返点<.6`，10Hz跑到达后原生2秒settle为.6819803；所有四路真实crossings横偏0、全帧/driver/完整对象连end=local，实际末态native clear/feet0，非物理红。父准只去这条**不属于原driver**的纵向门槛，保原始红文件和.68198记录。最终World1绿，World/local完整对象硬同、末态native clear/feet0锁，未改driver到达契约、source、路线或物理。
6. 两CPU亲看最低五间歇山粗形；实际几何+fallback色，非GPU/HD。2280导出三角含12QA地面，生产2268。无精雕要求、无全站suite/build。

## 累计
所有raw仅 `/tmp/r160-jide-1338/`，官页/原PDF/必要页也只/tmp，SHA在manifest。默认作者脚本固定输出，禁止直接重跑覆盖。唯一集成人复制QA到新/tmp、更换base/output、移除作者注入，用正常hook硬核1record/95owners/3false顶，旧6与新4完整对象同作者最终World，再正常build。作者无main/branches改动，不承诺GPU或整院完成。
