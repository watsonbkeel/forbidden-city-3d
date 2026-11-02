# R160 景仁宫后殿东配殿：官文最低素壳，立面未验

原项 `FC-808DBF510F`，基线 `32b99ae40ece9324bff4fd14bbee148285a48be3`。只新增 `src/scene/palace/special/JingrenRearEastWing.js`。正常 hook 尚未安装；唯一集成人在 `ZoneBase.build` 的 `this.kit.finish()` 前调用 `buildJingrenRearEastWing(this.kit,this.kit.root.name)`，仅east-six有效。

## 证据与严格限制
官网 https://www.dpm.org.cn/explore/building/236509.html 的后院正文明确五间后殿，殿前东西配殿各三间、明间开门、黄琉璃硬山、旋子彩画。因此这是独立后东，**不是前东item4、后正殿item3或已建后西**。
本轮没有可辨后东门窗的自身照片：图集前院照片不可借用，后院照片右侧只有局部屋檐，不能复制后西立面。因此依父13:20授权，仅三间黄硬山体量+粗闭中门；左右两间为**未验素闭面，0窗格**。门叶数、柱/墙色、背侧、所有尺寸坐标、低台阶均工程拟合；`ownPhoto:null / ownViewpoint:null / facadeVerified:false / photoDoorState:UNVERIFIED_NO_OWN_FACADE_PHOTO` 在真实metadata中。无匾字、无内陈、无新增map/room，前端没有开发注释。不能称实景外观验收、现实闭门/开放、整对象完成或测绘。

## 实体与原院关系
中心(-111,343)，面向院心+X；主体7.2×3.6，硬山roof width7.2/depth3.6/base3.5/height1.5/overhang.5。完整实际盒 X[-113.577673435,-107.749999988] Z[339,347] Y[≈0,5.332399845]，锁唯一预留 X[-113.8,-107.6] Z[338.9,347.1] Y[0,5.5]。
18逐mesh真实三角owner+2真实灰台/短阶Box，共20owners；.2/.1两真实顶均rescue:false。0新虚坡/运动白名单/contact；原院墙、前后主殿、前配及已建后西不动。
原图未证窗不可由素墙解读为现实无窗；这是暂定最低体量。内部记录所有未知，不复制后西照片身份或窗型。

## 唯一先验/必要测试
- 正常32b99 World `scan.mjs/log/json.gz`：完整盒旧owner/support/visibleTriangle/water交叠全0。221半米身体点19个背/南缘诊断红保留，依父已授权不以**非通行缝**全body否决；不称全盒body净空，不把背南缝作路。
- 真实旧街4/3315 + 固定合理折线(-104,340.5)→(-107.3,340.5)→(-107.3,343)原返走跑2/126全到、峰0；起点global body clear。raw内部route名称沿模板`fixed-west-approach`，只是旧标签，实际坐标是本后东；保原件不美化。
- 7个missing-builder真RED→7组件绿：官文/未验身份、0窗格、完整bbox、真实owner、两真实顶、真实tile UV、注册前置守卫、资源一次释放。无late-publish故障注入声明。
- local1：10/60Hz走跑(-107.3,343)→(-108.4,343)原返4/78帧全到，峰.0972777785；2闭中门/背墙负控拒绝。背墙负控仅单殿真实体，不宣称global背缝可走。
- 作者注入World1：loadAll:false，明确east-six/ningshou/garden/axis-courts+global驻留，非全分区/streaming。旧6/3441完整对象与正常先验逐字同；新4的recorded frames/driver/arrived与local硬同，原件离线确认**本次连额外end整个对象也同**。实际2秒settle末态native checkCollision=false/feet0。额外距离<.6只为有界coast，不把原crossing规则的.6横偏容差冒充纵向到达阈值。
- 原3950mesh/2481collider/122top、rooms/maps/regions全流同。上方同XZ有限Y5.5..30有132原三角，其全部顶点最低6.700000003，保守高于新最高至少1.367600158；非无限空间净空声明。
- 两CPU为实际几何+资源fallback粗色，亲看素闭壳/真实低台；不是GPU/HD。1060导出三角含12QA地面，生产1048。无全站suite/build、无shared hook/main/branches改动。

## 累计边界
原件 `/tmp/r160-jingren-rear-east-1321` 和官网cache仅/tmp，SHA见manifest。默认作者脚本固定raw输出不可直接重跑覆盖；累计复制至独立/tmp，改base/output、去作者loader注入，正常hook后核一个真实record/20owners/2false顶、原6及新4与作者World完整对象同。唯一集成人做normal/build，作者不重复全宫。
