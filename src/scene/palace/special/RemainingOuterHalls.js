import {buildJiyunRailFit} from './JiyunRailFit.js';
import {buildCiningFrontFit} from './CiningFrontFit.js';
import {buildJiyunFrontFit} from './JiyunFrontFit.js';
import {buildDafotangFrontFit} from './DafotangFrontFit.js';
import {addYanchunSouthVessels} from './YanchunSouthVessels.js';
import {buildWenyuanUpperFrame} from './WenyuanUpperFrame.js';
import { buildNanxunCaissonRings } from './NanxunCaissonRings.js';
import {withholdHUnknownInventory} from './HUnknownInventory.js';
import { fitYanchunFrontPlaque } from './YanchunSouthPhotoFit.js';
import { applyYudeDomeBrickCourses } from './YudeDomeBrickCourses.js';
import { withholdNanxunPlaceholderFurniture, applyNanxunCeilingBaseColors } from './NanxunReviewedInterior.js';
import * as THREE from 'three';
import { buildWuyingMoonTerrace } from './WuyingMoonTerrace.js';
import { buildJiyunNamePlaque } from './JiyunNamePlaque.js';
import { FACE } from '../kit.js';
import { PLAYER } from '../../../config/constants.js';
import { buildBaoyunNameInscription } from './SourcedNameInscriptions.js';

const FIT = 'REVERSIBLE_MODEL_FIT_NOT_SURVEYED';
// Explicit frozen R47 identities. Labels are not sufficient to consume a hall.
const RECORDS = [
  {
    "id": "place-outer-east-b7c67c602b",
    "key": "zhujing",
    "zone": "outer-east",
    "name": "主敬殿",
    "auxiliaryIdentity": null,
    "x": -186.4,
    "z": -167,
    "w": 26,
    "d": 12,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236531.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "后殿略似前殿不等于门窗扇数全部相同；不得复制前殿单项到后殿。"
    ]
  },
  {
    "id": "place-outer-east-4d5aafeda4",
    "key": "benren",
    "zone": "outer-east",
    "name": "本仁殿",
    "auxiliaryIdentity": null,
    "x": -212.2,
    "z": -224.2,
    "w": 26.7,
    "d": 10.3,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236531.html",
    "evidenceStatus": "IDENTITY_ONLY_CONDITIONAL",
    "unknown": [
      "2022官方庭院全景绑定本仁，但树遮部分立面；五间延用包络拟合，现代内饰无定位照片。"
    ]
  },
  {
    "id": "place-outer-east-bee00ae333",
    "key": "jiyi",
    "zone": "outer-east",
    "name": "集义殿",
    "auxiliaryIdentity": null,
    "x": -159.6,
    "z": -223.5,
    "w": 26.6,
    "d": 11.6,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236531.html",
    "evidenceStatus": "IDENTITY_ONLY_CONDITIONAL",
    "unknown": [
      "2022官方庭院全景绑定集义并见五组立面，室内1916旧图不得当现代实景。"
    ]
  },
  {
    "id": "place-outer-east-fd3d76e74d",
    "key": "wenyuan",
    "zone": "outer-east",
    "name": "文渊阁",
    "auxiliaryIdentity": null,
    "x": -186.5,
    "z": -132.8,
    "w": 40.5,
    "d": 17.9,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236513.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "一层/暗层/三层拓扑和西尽间楼梯尺寸仍拟合；需拒绝照片串层。"
    ]
  },
  {
    "id": "place-outer-east-172c8cbf68",
    "key": "sansuo-west-front",
    "zone": "outer-east",
    "name": "南三所西所前殿",
    "auxiliaryIdentity": null,
    "x": -251.8,
    "z": 39,
    "w": 15.4,
    "d": 10.6,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236452.html",
    "evidenceStatus": "GROUP_TOPOLOGY_WITH_UNRESOLVED_BINDING",
    "unknown": [
      "官方每所三进，现模型仅两排；不以模型前/后名自行确认官方对应，不移入中殿已拆炉，不称该单体完整复原。"
    ]
  },
  {
    "id": "place-outer-east-3f2ebd1b02",
    "key": "sansuo-west-rear",
    "zone": "outer-east",
    "name": "南三所西所后殿",
    "auxiliaryIdentity": null,
    "x": -251.8,
    "z": 68.9,
    "w": 19,
    "d": 10.3,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236452.html",
    "evidenceStatus": "GROUP_TOPOLOGY_WITH_UNRESOLVED_BINDING",
    "unknown": [
      "官方每所三进，现模型仅两排；不以模型前/后名自行确认官方对应，不移入中殿已拆炉，不称该单体完整复原。"
    ]
  },
  {
    "id": "place-outer-east-c1914091ec",
    "key": "sansuo-center-front",
    "zone": "outer-east",
    "name": "南三所中所前殿",
    "auxiliaryIdentity": null,
    "x": -285.4,
    "z": 39,
    "w": 15.4,
    "d": 10.6,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236452.html",
    "evidenceStatus": "GROUP_TOPOLOGY_WITH_UNRESOLVED_BINDING",
    "unknown": [
      "官方每所三进，现模型仅两排；不以模型前/后名自行确认官方对应，不移入中殿已拆炉，不称该单体完整复原。"
    ]
  },
  {
    "id": "place-outer-east-1db501eb23",
    "key": "sansuo-center-rear",
    "zone": "outer-east",
    "name": "南三所中所后殿撷芳殿",
    "auxiliaryIdentity": null,
    "x": -285.1,
    "z": 68.9,
    "w": 19,
    "d": 10.3,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236452.html",
    "evidenceStatus": "GROUP_TOPOLOGY_WITH_UNRESOLVED_BINDING",
    "unknown": [
      "官方每所三进，现模型仅两排；不以模型前/后名自行确认官方对应，不移入中殿已拆炉，不称该单体完整复原。"
    ]
  },
  {
    "id": "place-outer-east-2e6207278c",
    "key": "sansuo-east-front",
    "zone": "outer-east",
    "name": "南三所东所前殿",
    "auxiliaryIdentity": null,
    "x": -317.4,
    "z": 39,
    "w": 15.4,
    "d": 10.6,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236452.html",
    "evidenceStatus": "GROUP_TOPOLOGY_WITH_UNRESOLVED_BINDING",
    "unknown": [
      "官方每所三进，现模型仅两排；不以模型前/后名自行确认官方对应，不移入中殿已拆炉，不称该单体完整复原。"
    ]
  },
  {
    "id": "place-outer-east-4642f5088e",
    "key": "sansuo-east-rear",
    "zone": "outer-east",
    "name": "南三所东所后殿",
    "auxiliaryIdentity": null,
    "x": -317,
    "z": 68.9,
    "w": 19,
    "d": 10.3,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236452.html",
    "evidenceStatus": "GROUP_TOPOLOGY_WITH_UNRESOLVED_BINDING",
    "unknown": [
      "官方每所三进，现模型仅两排；不以模型前/后名自行确认官方对应，不移入中殿已拆炉，不称该单体完整复原。"
    ]
  },
  {
    "id": "wuying",
    "key": "wuying",
    "zone": "outer-west",
    "name": "武英殿",
    "auxiliaryIdentity": null,
    "x": 219.5,
    "z": -199.2,
    "w": 31.8,
    "d": 16.8,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236500.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "不把2020设计当2021实物，不重复既有展柜/器物计新改模。"
    ]
  },
  {
    "id": "place-outer-west-d0dac3c02c",
    "key": "jingsi",
    "zone": "outer-west",
    "name": "敬思殿",
    "auxiliaryIdentity": null,
    "x": 219.5,
    "z": -165.4,
    "w": 28,
    "d": 12,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236500.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "保留正中大瓶与5独立柜；不开被关闭的侧门。"
    ]
  },
  {
    "id": "place-outer-west-5c577ab026",
    "key": "ningdao",
    "zone": "outer-west",
    "name": "凝道殿",
    "auxiliaryIdentity": null,
    "x": 192.2,
    "z": -228.7,
    "w": 27.4,
    "d": 12.3,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/show/255509.html",
    "evidenceStatus": "OWN_2021_PANORAMA_LAYOUT_WITH_FITTED_METRICS",
    "unknown": [
      "2021自身全景支持裸梁及各自现代端部展陈；几何尺度和绝对端位是拟合，不代表2026完整器物库存。"
    ]
  },
  {
    "id": "place-outer-west-db932a3514",
    "key": "huanzhang",
    "zone": "outer-west",
    "name": "焕章殿",
    "auxiliaryIdentity": null,
    "x": 250.6,
    "z": -228.9,
    "w": 26.7,
    "d": 10.2,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/show/255509.html",
    "evidenceStatus": "OWN_2021_PANORAMA_LAYOUT_WITH_FITTED_METRICS",
    "unknown": [
      "2021自身全景支持裸梁及各自现代端部展陈；几何尺度和绝对端位是拟合，不代表2026完整器物库存。"
    ]
  },
  {
    "id": "place-outer-west-a92c708d28",
    "key": "yude",
    "zone": "outer-west",
    "name": "浴德堂",
    "auxiliaryIdentity": null,
    "x": 246.0,
    "z": -177.2,
    "w": 12.7,
    "d": 8.2,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236482.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "不加浴缸、家具、全套铜管或地下火道；内饰可见性与房间可进入是两回事。"
    ]
  },
  {
    "id": "place-outer-west-fa7f5d119e",
    "key": "nanxun",
    "zone": "outer-west",
    "name": "南薰殿",
    "auxiliaryIdentity": null,
    "x": 289.6,
    "z": -315.7,
    "w": 23.3,
    "d": 13.4,
    "mode": "replace",
    "source": "https://www.dpm.org.cn/explore/building/236503.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "清代五层朱漆木阁属历史储藏描述；需核现状/历史目标，暂不混入现展示。"
    ]
  },
  {
    "id": "place-outer-west-ddb3563548",
    "key": "hanqing",
    "zone": "outer-west",
    "name": "含清斋",
    "auxiliaryIdentity": null,
    "x": 238.6,
    "z": 82.4,
    "w": 11.4,
    "d": 5.9,
    "mode": "replace",
    "source": "https://www.dpm.org.cn/explore/building/236580.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "原模型11.4×5.9非复合院实测；整院拓扑不可硬压进单厅外包。室内细分位置未知。"
    ]
  },
  {
    "id": "place-outer-west-f6d065a79b",
    "key": "yanshou",
    "zone": "outer-west",
    "name": "延寿堂",
    "auxiliaryIdentity": null,
    "x": 280.3,
    "z": 83.1,
    "w": 11.0,
    "d": 6.0,
    "mode": "replace",
    "source": "https://www.dpm.org.cn/explore/building/236545.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "落地罩、炕罩、圆光罩有类型证据无完整定位；不得随意套统一屏风家具。"
    ]
  },
  {
    "id": "place-outer-west-4b8e037269",
    "key": "baoxiang",
    "zone": "outer-west",
    "name": "宝相楼",
    "auxiliaryIdentity": null,
    "x": 237.3,
    "z": 116.6,
    "w": 9.4,
    "d": 29.7,
    "mode": "replace",
    "source": "https://www.dpm.org.cn/explore/building/236569.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "开洞/楼梯/门宽和层高均拟合；佛像、唐卡和完整库存不仿造。"
    ]
  },
  {
    "id": "place-outer-west-e1a6e9852b",
    "key": "jiyun",
    "zone": "outer-west",
    "name": "吉云楼",
    "auxiliaryIdentity": null,
    "x": 280.1,
    "z": 116.7,
    "w": 12.0,
    "d": 29.7,
    "mode": "replace",
    "source": "https://www.dpm.org.cn/explore/building/236483.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "不可混用建福宫同名三间吉云楼；擦擦佛不批量复制为现存库存。楼梯位置需另证。"
    ]
  },
  {
    "id": "place-outer-west-930b046fd0",
    "key": "ciyin",
    "zone": "outer-west",
    "name": "慈荫楼",
    "auxiliaryIdentity": null,
    "x": 258.5,
    "z": 128.1,
    "w": 24.2,
    "d": 11.8,
    "mode": "replace",
    "source": "https://www.dpm.org.cn/explore/building/236574.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "上层经柜轮廓有据但108部经书与供器当前存留未核；通路服务模型不声明实际开放。"
    ]
  },
  {
    "id": "place-outer-west-b9b85b682e",
    "key": "cining",
    "zone": "outer-west",
    "name": "慈宁宫",
    "auxiliaryIdentity": null,
    "x": 222,
    "z": 204.7,
    "w": 42.1,
    "d": 26.8,
    "mode": "replace",
    "source": "https://www.dpm.org.cn/explore/building/236504.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "2015雕塑馆陈列与清代典礼用途分期；本轮不编造完整现代展柜。"
    ]
  },
  {
    "id": "place-outer-west-6cae88b6a2",
    "key": "dafotang",
    "zone": "outer-west",
    "name": "大佛堂",
    "auxiliaryIdentity": null,
    "x": 221.9,
    "z": 241.1,
    "w": 45.7,
    "d": 16.2,
    "mode": "replace",
    "source": "https://www.dpm.org.cn/show/226228.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "官方旧页记佛像龛案借往白马寺，与现代雕塑馆需分期；不把历史佛堂陈设当今日库存。"
    ]
  },
  {
    "id": "place-outer-west-d635e27f1f",
    "key": "baoyun",
    "zone": "outer-west",
    "name": "宝蕴楼",
    "auxiliaryIdentity": null,
    "x": 300.9,
    "z": -217.7,
    "w": 46.6,
    "d": 32.0,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/classify_detail/180962.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "2026展厅照片没有整楼位置映射，不填中式家具；不称现仍为库房或当前封闭。"
    ]
  },
  {
    "id": "place-outer-west-12beb1bb0e",
    "key": "yanchun",
    "zone": "outer-west",
    "name": "延春阁",
    "auxiliaryIdentity": null,
    "x": 216,
    "z": 485.5,
    "w": 23.5,
    "d": 24.3,
    "mode": "replace",
    "source": "https://www.dpm.org.cn/explore/building/236492.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "2006复建外观和1922历史照片明确分期；历史内部复杂隔间不可用符望阁直接代替。"
    ]
  },
  {
    "id": "place-outer-west-aad07de044",
    "key": "shouan",
    "zone": "outer-west",
    "name": "寿安宫",
    "auxiliaryIdentity": null,
    "x": 276.9,
    "z": 385.6,
    "w": 27.3,
    "d": 18.1,
    "mode": "replace",
    "source": "https://www.dpm.org.cn/explore/building/236505.html",
    "evidenceStatus": "SOURCE_TOPOLOGY_WITH_FITTED_METRICS",
    "unknown": [
      "现图书馆用途不能证明书桌与架位；两侧转角延楼不在本次单体替换范围。"
    ]
  },
  {
    "id": "identity-hengshou",
    "key": "hengshou",
    "zone": "outer-west",
    "name": "恒寿斋",
    "auxiliaryIdentity": "恒寿斋",
    "x": 193,
    "z": -158.1,
    "w": 14.6,
    "d": 7.3,
    "mode": "augment",
    "source": "https://www.dpm.org.cn/explore/building/236500.html",
    "evidenceStatus": "IDENTITY_ONLY_CONDITIONAL",
    "unknown": [
      "只有东北方位与身份。不能把旧三间硬山拟合升格官方事实。"
    ]
  }
];

const BASELINE_NAVIGATION = {"place-outer-east-b7c67c602b":{"floorY":1.2,"pad":0.8,"rotation":0},"place-outer-east-4d5aafeda4":{"floorY":0.5,"pad":1,"rotation":"west"},"place-outer-east-bee00ae333":{"floorY":0.5,"pad":1,"rotation":"east"},"place-outer-east-fd3d76e74d":{"floorY":0.5,"pad":0.5,"rotation":0},"place-outer-east-172c8cbf68":{"floorY":0.9,"pad":1,"rotation":0},"place-outer-east-3f2ebd1b02":{"floorY":0.9,"pad":1,"rotation":0},"place-outer-east-c1914091ec":{"floorY":0.9,"pad":1,"rotation":0},"place-outer-east-1db501eb23":{"floorY":0.9,"pad":1,"rotation":0},"place-outer-east-2e6207278c":{"floorY":0.9,"pad":1,"rotation":0},"place-outer-east-4642f5088e":{"floorY":0.9,"pad":1,"rotation":0},"wuying":{"floorY":1.2,"pad":1,"rotation":0},"place-outer-west-d0dac3c02c":{"floorY":1.2,"pad":0.8,"rotation":0},"place-outer-west-5c577ab026":{"floorY":0.45,"pad":0.5,"rotation":"west"},"place-outer-west-db932a3514":{"floorY":0.45,"pad":0.5,"rotation":"east"},"place-outer-west-a92c708d28":{"floorY":0.5,"pad":0.5,"rotation":0},"place-outer-west-fa7f5d119e":{"floorY":0.6,"pad":0.8,"rotation":0},"place-outer-west-ddb3563548":{"floorY":0.4,"pad":0.3,"rotation":0},"place-outer-west-f6d065a79b":{"floorY":0.4,"pad":0.3,"rotation":0},"place-outer-west-4b8e037269":{"floorY":0.6,"pad":0.5,"rotation":0},"place-outer-west-e1a6e9852b":{"floorY":0.6,"pad":0.5,"rotation":0},"place-outer-west-930b046fd0":{"floorY":0.6,"pad":0.5,"rotation":0},"place-outer-west-b9b85b682e":{"floorY":1.2,"pad":1.5,"rotation":0},"place-outer-west-6cae88b6a2":{"floorY":0.9,"pad":0.8,"rotation":0},"place-outer-west-d635e27f1f":{"floorY":0.8,"pad":0.5,"rotation":0},"place-outer-west-12beb1bb0e":{"floorY":0.75,"pad":0.8,"rotation":0},"place-outer-west-aad07de044":{"floorY":0.75,"pad":1,"rotation":0},"identity-hengshou":{"floorY":0.3,"pad":0.4,"rotation":0}};
/** Pure model entry contract. Historical doorway form is not visitor access. */
function primaryNavigation(p) {
  if(!['baoxiang','jiyun','ciyin','cining','dafotang','shouan'].includes(p.key))return null;
  const old=BASELINE_NAVIGATION[p.id],turned=p.key==='baoxiang'||p.key==='jiyun',D=turned?p.w:['hanqing','yanshou'].includes(p.key)?10.4:p.d;
  const rotation=p.key==='baoxiang'?FACE.west:p.key==='jiyun'?FACE.east:rot(old.rotation),centerZ=['hanqing','yanshou'].includes(p.key)?p.z+(D-p.d)/2:p.z;
  const inset=turned||p.key==='ciyin'?1.35:p.key==='cining'?2:p.key==='shouan'?D/3:0,front=-D/2+inset,y=old.floorY;
  const world=(x,z,yy=y)=>({x:p.x+Math.cos(rotation)*x+Math.sin(rotation)*z,y:yy,z:centerZ-Math.sin(rotation)*x+Math.cos(rotation)*z});
  const normal={x:-Math.sin(rotation),z:-Math.cos(rotation)},primaryEntry=world(0,front),outside=world(0,-D/2-old.pad-y*1.6-(p.key==='baoxiang'?.3:.6),0);
  let approachPoints=[outside,world(0,-D/2-old.pad-y*1.6,0),world(0,-D/2-old.pad),primaryEntry,world(0,front+1.3)];
  if(p.key==='jiyun'){
    // The source-facing east doorway is opposite Xianruo's west side. Approach
    // through the retained northern gap, not through the neighboring hall.
    const edgeX=p.x-D/2-old.pad,x=edgeX-.3,rampY=y*(.78-.3)/.78;
    approachPoints=[{x:edgeX-.95,y:0,z:p.z+2.9},{x:edgeX-.78,y:0,z:p.z+2.9},{x,y:rampY,z:p.z+2.9},{x,y:rampY,z:p.z},world(0,-D/2-old.pad),primaryEntry,world(0,front+1.3)];
  }
  return Object.freeze({id:p.key+'-actual-primary-entry',runtimeReady:true,status:'FITTED_MODEL_ACCESS_NOT_CURRENT_VISITOR_PERMISSION',primaryEntry,outwardNormal:normal,center:{x:p.x,z:centerZ},localWidth:turned?p.d:p.w,localDepth:D,bays:turned?7:p.key==='ciyin'||p.key==='shouan'?5:7,pad:old.pad,floorY:y,rotation,approachPoints});
}

function gardenFrontGeometry(p) {
  const d=10.4;
  return {w:p.key==='yanshou'?9.8:p.w,d,centerZ:p.z+(d-p.d)/2,pad:p.key==='yanshou'?.16:.25};
}
function fittedMapFootprint(p) {
  if(!['hanqing','yanshou'].includes(p.key))return null;
  const g=gardenFrontGeometry(p);
  return Object.freeze({x:p.x,z:g.centerZ,w:g.w+2*g.pad,d:g.d+2*g.pad,kind:'hall'});
}

export const REMAINING_OUTER_PROFILES = Object.freeze(RECORDS.map(p => Object.freeze({
  ...p, navigation:primaryNavigation(p), mapFootprint:fittedMapFootprint(p), dimensionStatus: FIT, photographyDate: null, currentInventoryVerified: false,
  visitorAccessVerified: false, doorPoseStatus: 'MODEL_VIEWING_POSE_NOT_CURRENT_OPEN_STATE',
  unknown: Object.freeze(p.unknown),
})));

export const READY_OUTER_KEYS = Object.freeze(['baoxiang','jiyun','ciyin','cining','dafotang','shouan','nanxun','hanqing','yanshou','yude','wenyuan','yanchun','wuying','jingsi','baoyun','zhujing','benren','jiyi','hengshou','ningdao','huanzhang',...RECORDS.filter(p=>p.key.startsWith('sansuo-')).map(p=>p.key)]);

export function resolveRemainingProfile(zoneId, item) {
  if (!item || item.kind !== 'hall') return null;
  return REMAINING_OUTER_PROFILES.find(p => READY_OUTER_KEYS.includes(p.key) && p.zone === zoneId &&
    (p.auxiliaryIdentity ? item.auxiliaryIdentity === p.auxiliaryIdentity && !item.name : item.name === p.name) &&
    ['x', 'z', 'w', 'd'].every(k => item[k] === p[k])) ?? null;
}

const sharedMaterialKeys = new WeakMap();
const SHARED_OUTER_KEYS=new Set(['stone_slab','wood_column','wall_red','wall_brick','lattice_doors','caihua_beam','roof_tile']);
/** Resolve shared keys by actual library ownership, not fixture-only names.
 * Real TextureLibrary names append _material; custom owned materials keep
 * their deliberately assigned names. No arbitrary plane is selected by this. */
function materialKey(kit,material) {
  if(!material)return '';
  if(material===kit.ridge)return 'kit_ridge';
  if(kit.owned.includes(material))return material.name??'';
  if(sharedMaterialKeys.has(material))return sharedMaterialKeys.get(material);
  if(kit.lib.materials instanceof Map)for(const [cacheKey,value]of kit.lib.materials)if(value===material){const key=cacheKey.split('|')[0];sharedMaterialKeys.set(material,key);return key;}
  const name=material.name??'',key=name.endsWith('_material')?name.slice(0,-9):name;
  if(SHARED_OUTER_KEYS.has(key)){if(material===kit.lib.material(key)){sharedMaterialKeys.set(material,key);return key;}return '';}
  return name;
}
const palettes = new WeakMap();
function palette(kit) {
  if (palettes.has(kit)) return palettes.get(kit);
  const out = {};
  for (const [key, color] of Object.entries({timber:0x4f3027,red:0x993d2d,wall:0x9f5240,paper:0xbcb59c,stone:0x99978c,ceiling:0xbfbba9,green_glaze:0x3d684b,yellow_glaze:0xc6a14c,grey_tile:0x676d6a,dark:0x362b25,white_glaze:0xd2ccb4,gold:0xb29659})) {
    out[key] = new THREE.MeshStandardMaterial({name:`r48_outer_${key}`,color,roughness:key.includes('glaze')?.48:.86});
    kit.owned.push(out[key]);
  }
  palettes.set(kit,out);
  return out;
}
function mark(object, p, role, extra={}) {
  object.name=role;
  Object.assign(object.userData,{role,remainingOuterId:p.id,source:p.source,dimensionStatus:FIT,photographyDate:null,...extra});
  return object;
}
function validate(item,p,mode) {
  if (!p || resolveRemainingProfile(p.zone,item)!==p || p.mode!==mode) throw new Error('R48 outer exact identity and mode required');
}
function rot(value){return typeof value==='number'?value:FACE[value]??0;}

/** Borrow only the established floor/platform/front stair envelope. Above-floor
 * geometry and navigation are replaced, never stacked on the generic facade.
 * The discarded generic furniture is never instantiated. */
function base(kit,item,p,opts={}) {
  const w=opts.w??item.w,d=opts.d??item.d,y=item.ph??.9,H=opts.h??item.colH??4.6;
  const g={id:p.id,key:p.key,name:p.name,w,d,y,h:H,bays:opts.bays??5,front:-d/2,rear:d/2,
    storeys:1,eaveCount:1,source:p.source,dimensionStatus:FIT,photographyDate:null,currentInventoryVerified:false,
    furnitureStatus:'UNRECONSTRUCTED_NO_INVENTED_OBJECT_INVENTORY',...opts};
  const cs=kit.colliders.length,rs=kit.rooms.length,gs=kit.regions.length;
  const {structure,auxiliaryIdentity,roomBays,...plain}=item;
  const built=kit.hall({...plain,z:opts.centerZ??item.z,w,d,pad:opts.pad??item.pad,colH:H,rot:opts.rot??rot(item.rot),bays:g.bays,layers:1,roof:'xieshan',
    enter:true,open:false,backDoor:!!opts.backDoor,frontSteps:opts.frontSteps??true,throne:false,interior:'empty',plaque:false});
  const f=built.f,discard=new Set();
  // Match the visible platform top to the existing walkable datum exactly.
  for(const n of f.children)if(n.isMesh&&materialKey(kit,n.material)==='stone_slab'&&Math.abs(n.position.y-(y-.03))<1e-8)n.position.y-=.01;
  for (const node of [...f.children]) {
    if (node.name.startsWith('roof_') || (node.isMesh && ['wood_column','wall_red','lattice_doors','caihua_beam'].includes(materialKey(kit,node.material)))) {
      node.traverse(n=>{if(n.geometry)discard.add(n.geometry);});node.removeFromParent();
    }
  }
  for(const geometry of discard)geometry.dispose();
  kit.colliders.splice(cs,kit.colliders.length-cs,...kit.colliders.slice(cs).filter(c=>c.max.y<=y+1e-6));
  kit.rooms.splice(rs);kit.regions.splice(gs);
  return context(kit,item,p,built,g);
}
function context(kit,item,p,built,g) {
  const f=built.f;
  const m=palette(kit);
  const box=(role,material,w,h,d,x,yy,z,solid=false,extra={})=>{
    if (![w,h,d,x,yy,z].every(Number.isFinite)||Math.min(w,h,d)<=1e-7)throw Error(`R48 outer invalid solid ${role}`);
    const mesh=mark(kit.mesh(f,new THREE.BoxGeometry(w,h,d),typeof material==='string'?m[material]:material,x,yy,z),p,role,extra);
    if(solid)kit.col(f,x-w/2,yy-h/2,z-d/2,x+w/2,yy+h/2,z+d/2);
    return mesh;
  };
  const column=(x,z,yy,height,role=p.key+'-column',r=.24)=>{
    const mesh=mark(kit.mesh(f,new THREE.CylinderGeometry(r,r*1.05,height,12),m.red,x,yy+height/2,z),p,role);
    kit.col(f,x-r*1.05,yy,z-r*1.05,x+r*1.05,yy+height,z+r*1.05);return mesh;
  };
  const floor=(x0,x1,z0,z1,yy,role=p.key+'-upper-floor',extra={})=>{
    if(x1-x0<1e-6||z1-z0<1e-6)return;
    box(role,'timber',x1-x0,.16,z1-z0,(x0+x1)/2,yy-.08,(z0+z1)/2,false,extra);
    // The support plane is the visible top; the thin underside collision keeps
    // heads out without catching the final stair step at player-radius reach.
    kit.col(f,x0,yy-.16,z0,x1,yy-.15,z1);
    kit.walkBox(f,x0,z0,x1,z1,yy);kit.walkables.at(-1).rescue=false;
  };
  const wallX=(x,z0,z1,yy,height,role=p.key+'-side-wall')=>box(role,'wall',.25,height,z1-z0,x,yy+height/2,(z0+z1)/2,true);
  const wallZ=(z,x0,x1,yy,height,role=p.key+'-rear-wall')=>box(role,'wall',x1-x0,height,.25,(x0+x1)/2,yy+height/2,z,true);
  const partition=(x,z0,z1,yy,height,doorZ,doorW=1.5,role=p.key+'-interbay-partition')=>{
    const group=mark(new THREE.Group(),p,role,{doorZ,doorW});f.add(group);
    const doorH=Math.min(2.65,height-.3);
    for(const[lo,hi]of[[z0,doorZ-doorW/2],[doorZ+doorW/2,z1]])if(hi>lo)box(role+'-side','paper',.14,height,hi-lo,x,yy+height/2,(lo+hi)/2,true);
    box(role+'-head','timber',.16,height-doorH,doorW,x,yy+doorH+(height-doorH)/2,doorZ,true);
    for(const s of[-1,1])box(role+'-jamb','timber',.18,doorH,.12,x,yy+doorH/2,doorZ+s*doorW/2,true);
    return group;
  };
  const face=(x0,x1,z,yy,height,{door=false,opened=false,role=p.key+'-front',sill=.8,leafCount=4}={})=>{
    const width=x1-x0,head=.42,clear=height-head,leafW=(width-.32)/leafCount;
    box(role+'-head','red',width,head,.25,(x0+x1)/2,yy+height-head/2,z,false);
    for(const x of[x0+.055,x1-.055])box(role+'-jamb','red',.11,clear,.25,x,yy+clear/2,z,true);
    if(!door)box(role+'-sill','stone',width,sill,.29,(x0+x1)/2,yy+sill/2,z,true);
    const bottom=door?0:sill,lh=clear-bottom;
    for(let k=0;k<leafCount;k++){
      const isOpen=door&&opened;
      const x=isOpen?(k<leafCount/2?x0+.16+k*.13:x1-.16-(leafCount-1-k)*.13):x0+.16+(k+.5)*leafW;
      const zz=isOpen?z+leafW/2+.04:z;
      const leaf=box(role+(door?'-door-leaf':'-window-leaf'),'timber',isOpen?.10:leafW-.025,lh,isOpen?leafW:.14,x,yy+bottom+lh/2,zz,true,{leaf:k+1,openingPose:isOpen?'MODEL_OPEN':'CLOSED'});
      if(isOpen)continue;
      const panelLo=door?.78:.26;
      box(role+'-paper-pane','paper',leafW-.14,lh-panelLo-.15,.025,x,yy+bottom+panelLo+(lh-panelLo-.15)/2,z-.086,false);
      for(let n=1;n<4;n++)box(role+'-lattice-stile','timber',.035,lh-panelLo-.1,.055,x-leafW/2+n*leafW/4,yy+bottom+panelLo+(lh-panelLo-.1)/2,z-.105,false);
      for(let n=1;n<5;n++)box(role+'-lattice-rail','timber',leafW-.06,.035,.055,x,yy+bottom+panelLo+n*(lh-panelLo)/5,z-.105,false);
    }
  };
  const register=(name,x0,x1,z0,z1,yy,height,doors,spawn)=>{
    kit._lastFurnish={cover:[],spawns:spawn?[spawn]:[]};
    kit.registerRoom(f,{name,kind:p.key+'-source-viewing-region',x0,x1,z0,z1,y:yy,h:height,doors});
    const room=kit.rooms.at(-1);room.navigation={status:'MODEL_SAFE_SPAWN_NOT_VISITOR_ACCESS',floorY:yy,safeSpawns:room.spawns.map(pt=>({...pt,y:yy})),routeProfile:p.key+'-stairs'};
  };
  return {kit,item,p,g,m,f,built,box,column,floor,wallX,wallZ,partition,face,register};
}
function columns(c,{yy=c.g.y,height=c.g.h,front=-c.g.d/2,rear=c.g.d/2,upper=false}={}) {
  const {g,column,p}=c;
  for(let k=0;k<=g.bays;k++)for(const z of[front,rear])column(-g.w/2+k*g.w/g.bays,z,yy,height,p.key+(upper?'-upper-column':'-column'));
  for(const z of[front,rear])c.box(p.key+'-eave-beam','red',g.w+.25,.38,.32,0,yy+height-.19,z,false);
}
function plainCeiling(c,yy,x0=-c.g.w/2,x1=c.g.w/2,z0=c.g.front,z1=c.g.rear){c.box(c.p.key+'-plain-ceiling','ceiling',x1-x0,.08,z1-z0,(x0+x1)/2,yy,(z0+z1)/2,false);}
function subtractFloor(c,yy,holes) {
  const{x0,x1,z0,z1}={x0:-c.g.w/2+.15,x1:c.g.w/2-.15,z0:-c.g.d/2+.1,z1:c.g.d/2-.1};
  const xs=[...new Set([x0,x1,...holes.flatMap(h=>[h.x0,h.x1])])].filter(x=>x>=x0&&x<=x1).sort((a,b)=>a-b);
  const zs=[...new Set([z0,z1,...holes.flatMap(h=>[h.z0,h.z1])])].filter(z=>z>=z0&&z<=z1).sort((a,b)=>a-b);
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
    const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2;
    if(!holes.some(h=>x>h.x0&&x<h.x1&&z>h.z0&&z<h.z1))c.floor(xs[i],xs[i+1],zs[j],zs[j+1],yy);
  }
}
function rail(c,role,x0,x1,z0,z1,yy,extra={}) {
  const length=Math.hypot(x1-x0,z1-z0),alongX=Math.abs(x1-x0)>Math.abs(z1-z0),n=Math.max(1,Math.ceil(length/.65));
  c.box(role,'timber',alongX?length:.10,.12,alongX?.10:length,(x0+x1)/2,yy+.92,(z0+z1)/2,true,extra);
  c.box(role+'-lower','timber',alongX?length:.08,.09,alongX?.08:length,(x0+x1)/2,yy+.35,(z0+z1)/2,true,extra);
  for(let i=0;i<=n;i++)c.box(role+'-baluster','timber',.07,.92,.07,x0+(x1-x0)*i/n,yy+.46,z0+(z1-z0)*i/n,true,extra);
}
/** A reversible modern access guard, explicitly not a historic object.
 * It fences only reachable low-headroom mouths under a fitted stair. Each
 * visible thin bar/post gets its own matching proxy; the air under a whole
 * flight is never replaced by an invisible solid box. Stair treads stay clear. */
function stairUndercroftSafety(c,s,y0,y1,stepRise) {
  const run=s.z1-s.z0,sign=Math.sign(run),H=y1-y0;
  const z0=s.z0+sign*.06,z1=s.z0+run*Math.min(.96,(PLAYER.HEIGHT+.14+stepRise+.08)/H),x0=s.x-s.width/2-.075,x1=s.x+s.width/2+.075;
  const info={source:null,status:'MODEL_ACCESS_SAFETY_FIT_NOT_HISTORIC_OBJECT',floorY:y0,reason:'VISIBLE_LOW_HEADROOM_STAIR_ACCESS_GUARD',stair:s.id??s.index};
  const bar=(x,z,w,d,yy,h,role)=>c.box(c.p.key+'-access-safety-stair-under-'+role,'dark',w,h,d,x,yy,z,true,info);
  for(const x of[x0,x1]){
    const n=Math.max(1,Math.ceil(Math.abs(z1-z0)/.75));
    for(const h of[.45,.97])bar(x,(z0+z1)/2,.055,Math.abs(z1-z0),y0+h,.06,'side-bar');
    for(let k=0;k<=n;k++)bar(x,z0+(z1-z0)*k/n,.06,.06,y0+.52,1.04,'post');
  }
  for(const h of[.45,.97])bar(s.x,z1,x1-x0,.055,y0+h,.06,'rear-bar');
  const result={x0,x1,z0,z1,floorY:y0,stair:s.id??s.index,status:info.status};
  (c.g.accessSafetyGuards??=[]).push(result);return result;
}
function stair(c,s) {
  const {g,p}=c,H=g.upperY-g.y,run=s.z1-s.z0,n=Math.max(12,Math.ceil(H/(p.key==='baoxiang'?.09:.2))),step=run/n;
  for(let i=0;i<n;i++){
    const top=g.y+H*(i+1)/n;
    c.box(p.key+'-stair-tread','timber',s.width,.14,step+.025,s.x,top-.07,s.z0+(i+.5)*step,false,{stair:s.index,step:i+1});
    if(i<n-1)c.box(p.key+'-stair-riser','timber',s.width,H/n,.06,s.x,top+H/(2*n),s.z0+(i+1)*step,false,{stair:s.index});
  }
  c.kit.walkRamp(c.f,s.x-s.width/2,s.x+s.width/2,s.z0,s.z1,g.y,g.upperY);
  stairUndercroftSafety(c,s,g.y,g.upperY,H/n);
  for(const side of[-1,1])for(let i=0;i<=n;i+=3){const z=s.z0+run*i/n,y=g.y+H*i/n;c.box(p.key+'-stair-guard-post','timber',.075,.95,.075,s.x+side*(s.width/2+.075),y+.475,z,true,{stair:s.index});}
  // Segment guards follow the slope, so their AABBs do not close the stairwell.
  for(const side of[-1,1])for(let i=0;i<n;i++){
    const z=s.z0+(i+.5)*step,yy=g.y+H*(i+.5)/n+.96;
    c.box(p.key+'-stair-guard','timber',.095,.12,step+.04,s.x+side*(s.width/2+.075),yy,z,true,{stair:s.index});
  }
}
function sheet(c,role,material,rows,cols,sample) {
  const ps=[],uv=[],idx=[];
  for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){const p=sample(i/rows,j/cols);ps.push(...p);uv.push(j/cols,i/rows);}
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+1,d=a+cols+1,e=d+1;idx.push(a,d,b,b,d,e);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();let ny=0;for(let i=0;i<geo.attributes.normal.count;i++)ny+=geo.attributes.normal.getY(i);
  if(ny<0){for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];geo.setIndex(idx);geo.computeVertexNormals();}
  return mark(c.kit.mesh(c.f,geo,c.m[material],0,0,0),c.p,role);
}
function rolledRoof(c,{w=c.g.w+.9,d=c.g.d+1.2,yy=c.g.y+c.g.h,rise=2,material='green_glaze',trim='yellow_glaze',key=c.p.key,hard=false,z=0,edgeSides=[-1,1]}={}) {
  const startChildren=c.f.children.length;
  const hx=w/2-(hard?0:.65),hz=d/2,breakZ=hz*.64,low=rise*.32;
  const height=q=>low+(rise-low)*Math.cos(q*Math.PI/2);
  sheet(c,key+'-rolled-crown',material,28,12,(u,v)=>[(v*2-1)*hx,yy+height(Math.abs(u*2-1)),z+(u*2-1)*breakZ]);
  for(const side of[-1,1]){
    sheet(c,key+'-rolled-lower-slope',material,6,16,(u,v)=>[(v*2-1)*(hx+(hard?0:u*.65)),yy+low*(1-u),z+side*(breakZ+u*(hz-breakZ))]);
    if(!hard)sheet(c,key+'-rolled-hip-end',material,6,16,(u,v)=>[side*(hx+u*.65),yy+low*(1-u),z+(v*2-1)*(breakZ+u*(hz-breakZ))]);
    const edgeRole=key+(trim==='yellow_glaze'?'-yellow-roof-edge':'-grey-roof-edge');
    if(edgeSides.includes(side))c.box(edgeRole,trim,w,.14,.19,0,yy+.02,z+side*(hz-.095),false);
    c.box(edgeRole,trim,.19,.14,d,side*(w/2-(hard?.095:0)),yy+.02,z,false);
    const points=hard?[new THREE.Vector2(-hz,0)]:[];for(let i=0;i<=28;i++){const zz=(i/28*2-1)*breakZ;points.push(new THREE.Vector2(zz,height(Math.abs(zz/breakZ))));}if(hard)points.push(new THREE.Vector2(hz,0));
    const geo=new THREE.ShapeGeometry(new THREE.Shape(points));geo.rotateY(side<0?-Math.PI/2:Math.PI/2);
    mark(c.kit.mesh(c.f,geo,c.m.wall,side*hx,yy,z),c.p,key+'-rolled-gable');
  }
  const skins=c.f.children.slice(startChildren).filter(n=>n.isMesh&&/-rolled-(crown|lower-slope|hip-end)$/.test(n.name));
  installRoofUnderboardsAndBearings(c,skins,yy,key);
  return {kind:hard?'rolled-hard-gable':'rolled-xieshan',rise,dimensionStatus:FIT};
}
function installRoofUnderboardsAndBearings(c,skins,baseY,key) {
  const thickness=.12;
  for(const skin of skins){
    const geo=skin.geometry.clone(),ix=geo.index.array;
    for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];
    geo.translate(0,-thickness,0);geo.computeVertexNormals();
    mark(c.kit.mesh(c.f,geo,c.m.timber,skin.position.x,skin.position.y,skin.position.z),c.p,key+'-rolled-underboard',{constructionStatus:'THICKNESS_AND_TIMBER_UNDERSIDE_FITTED_NOT_MEASURED'});
    const counts=new Map(),top=skin.geometry.attributes.position,indices=skin.geometry.index.array;
    for(let i=0;i<indices.length;i+=3)for(const[a,b]of[[indices[i],indices[i+1]],[indices[i+1],indices[i+2]],[indices[i+2],indices[i]]]){const k=Math.min(a,b)+','+Math.max(a,b);const old=counts.get(k);if(old)old.count++;else counts.set(k,{a,b,count:1});}
    const positions=[],ids=[];
    for(const{a,b,count}of counts.values())if(count===1){const n=positions.length/3,ax=top.getX(a),ay=top.getY(a),az=top.getZ(a),bx=top.getX(b),by=top.getY(b),bz=top.getZ(b);positions.push(ax,ay,az,bx,by,bz,bx,by-thickness,bz,ax,ay-thickness,az);ids.push(n,n+2,n+1,n,n+3,n+2);}
    const fascia=new THREE.BufferGeometry();fascia.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));fascia.setIndex(ids);fascia.computeVertexNormals();mark(c.kit.mesh(c.f,fascia,c.m.timber,skin.position.x,skin.position.y,skin.position.z),c.p,key+'-roof-board-edge');
  }
  // Explicit fitted timber bearings close the previously floating column/roof
  // gap. Triangle intersections choose the actual lower roof at each post.
  const ray=new THREE.Ray(),a=new THREE.Vector3(),b=new THREE.Vector3(),d=new THREE.Vector3(),hit=new THREE.Vector3();
  const posts=c.f.children.filter(n=>n.isMesh&&n.geometry.type==='CylinderGeometry'&&Math.abs(n.position.y+n.geometry.parameters.height/2-baseY)<.02);
  for(const post of posts){let roofY=Infinity;ray.set(new THREE.Vector3(post.position.x,baseY-.02,post.position.z),new THREE.Vector3(0,1,0));
    for(const skin of skins){const pos=skin.geometry.attributes.position,ix=skin.geometry.index.array;for(let i=0;i<ix.length;i+=3){a.fromBufferAttribute(pos,ix[i]).add(skin.position);b.fromBufferAttribute(pos,ix[i+1]).add(skin.position);d.fromBufferAttribute(pos,ix[i+2]).add(skin.position);if(ray.intersectTriangle(a,b,d,false,hit))roofY=Math.min(roofY,hit.y);}}
    const top=roofY-thickness+.025;
    if(Number.isFinite(top)&&top>baseY)c.box(key+'-fitted-roof-bearing','timber',.48,top-baseY+.04,.48,post.position.x,(baseY-.04+top)/2,post.position.z,false,{constructionStatus:'TIMBER_LOAD_PATH_FIT_NOT_SURVEYED_BRACKET_DESIGN'});
  }
}

function finish(c,extra={}) {
  Object.assign(c.g,extra);
  if(c.g.inventory?.status==='UNKNOWN')for(const r of c.kit.rooms)if(r.name===c.item.name||r.name?.startsWith(c.item.name+'·'))r.inventory={...c.g.inventory};
  if(c.p.navigation)c.g.navigation={...c.p.navigation,...(c.g.navigation??{})};
  c.f.name=c.p.name+' · R48 局部来源拟合';
  c.f.userData.structure={...c.g,remainingProfile:c.p.key,evidenceStatus:c.p.evidenceStatus,
    unknown:c.p.unknown,visitorAccessVerified:false,doorPoseStatus:c.p.doorPoseStatus};
  c.f.userData.remainingOuter={id:c.p.id,mode:'replace',source:c.p.source,actualGeometry:true};
  return {...c.built,f:c.f,g:c.g,p:c.p};
}

/** Retention is not evidence. These are the old model's explicitly unverified
 * furniture placeholders, carried forward unless an observed layout conflicts.
 * Their nodes never acquire the architectural source claim. */
function retainLegacyFurniture(c) {
  const {kit,item,p,f,g}=c,start=f.children.length,cs=kit.colliders.length;
  // R69 explicit K-only inventory decision: these generated movable presets
  // have no room-level placement evidence. Keep sourced cabinets/displays and
  // architecture elsewhere; absence of a model is not proof of an empty room.
  const withheldKeys=new Set(['hanqing','yanshou','ciyin','dafotang','shouan']);
  if(withheldKeys.has(p.key)) {
    const expected=RECORDS.find(r=>r.key===p.key);
    if(!expected||p.id!==expected.id||item.kind!=='hall'||item.name!==expected.name||['x','z','w','d'].some(k=>item[k]!==expected[k]))throw Error('R69 exact K inventory host mismatch');
    // Counts are frozen against the preceding runtime by regression tests;
    // no placeholder mesh is instantiated or moved into another room.
    const counts={hanqing:[6,6],yanshou:[6,6],ciyin:[8,8],dafotang:[8,8],shouan:[8,8]}[p.key];
    g.inventory={status:'UNKNOWN',knownEmpty:false,accepted:false,entityId:p.id,withheldMeshCount:counts[0],withheldColliderCount:counts[1],reason:'UNSOURCED_GENERATED_MOVABLE_PRESET_WITHHELD_NOT_EMPTY_ROOM',source:null};
    g.furnitureStatus='UNKNOWN_INVENTORY_WITHHELD_NOT_KNOWN_EMPTY';
    return;
  }

  const n=item.bays??(Math.max(3,Math.round(item.w/3.6)|1)),bay=item.w/n;
  if(item.throne){
    const tz=item.d/2-Math.min(2.6,item.d*.3),tw=Math.min(bay*1.4,5),y=item.ph??.9;
    for(const [w,h,d,x,yy,z,mat]of[[tw,.5,2.4,0,y+.25,tz,kit.lacquer],[1.4,.6,1,0,y+.8,tz,kit.gold],[1.5,1.2,.2,0,y+1.6,tz+.5,kit.gold],[tw*.8,2.6,.25,0,y+1.8,tz+1.15,kit.gold]])kit.mesh(f,new THREE.BoxGeometry(w,h,d),mat,x,yy,z);
    kit.col(f,-tw/2,y,tz-1.2,tw/2,y+3,tz+1.3);
    g.legacyThroneBinding={x:0,z:tz,width:tw,overlay:'data/interiors/cining.json',positionStatus:'UNCHANGED_LEGACY_UNVERIFIED'};
  }else{
    const kind=(typeof item.interior==='string'?item.interior.replace(/^[A-Za-z]:/,''):null)??(item.w>=14?'hall':'room');
    kit.furnish(f,kind,{x0:-item.w/2+.35,x1:item.w/2-.35,z0:-item.d/2+.3,z1:item.d/2-.3,y:item.ph??.9,h:item.colH-.8,doorX:0,backDoor:false});
    kit._lastFurnish=null;
  }
  const nodes=f.children.slice(start),moves=[];
  const worldShiftZ=item.z-f.position.z;
  if(worldShiftZ){for(const node of nodes)node.position.z+=worldShiftZ;for(const col of kit.colliders.slice(cs)){col.min.z+=worldShiftZ;col.max.z+=worldShiftZ;}}
  if(p.key==='shouan'){
    // The newly evidenced rear central door conflicts with the old central
    // table/chairs. Retain them in the east secondary bay as a declared access
    // fit rather than treating their old or new location as historical fact.
    const dx=-g.w/5;
    for(const node of nodes)if(Math.abs(node.position.x)<1.21){node.position.x+=dx;moves.push(node.uuid);}
    for(const col of kit.colliders.slice(cs)){const local=col.clone().applyMatrix4(f.matrixWorld.clone().invert());if(Math.abs((local.min.x+local.max.x)/2)<1.21){col.min.x+=dx;col.max.x+=dx;}}
  }
  if(p.key==='yanshou'){
    // Retain every placeholder object; only move side-wall conflicts inward.
    // The width correction is an access/boundary fit, not a furniture survey.
    const maxX=g.w/2-.38;
    for(const node of nodes){node.geometry?.computeBoundingBox();const b=node.geometry?.boundingBox;if(!b)continue;const lo=b.min.x+node.position.x,hi=b.max.x+node.position.x,dx=hi>maxX?maxX-hi:lo< -maxX?-maxX-lo:0;if(dx){node.position.x+=dx;moves.push(node.uuid);}}
    for(const col of kit.colliders.slice(cs)){const local=col.clone().applyMatrix4(f.matrixWorld.clone().invert()),dx=local.max.x>maxX?maxX-local.max.x:local.min.x< -maxX?-maxX-local.min.x:0;if(dx){col.min.x+=dx;col.max.x+=dx;}}
  }
  for(const node of nodes){mark(node,p,'r48-retained-unverified-furniture',{source:null,fidelity:'LEGACY_UNVERIFIED_NOT_SOURCE_RECONSTRUCTION',positionStatus:moves.includes(node.uuid)?'ACCESS_FIT_RELOCATED_FROM_SOURCE_DOOR_OR_FITTED_WALL':'RETAINED_LEGACY_POSITION'});}
  g.retainedFurniture={worldPositionPolicy:moves.length?'LIMITED_ACCESS_CLEARANCE_RELOCATION_EXPLICITLY_UNVERIFIED':'UNCHANGED_BASELINE_FURNITURE_WORLD_POSITIONS',fidelity:'LEGACY_UNVERIFIED_NOT_SOURCE_RECONSTRUCTION',meshCount:nodes.length,relocatedMeshCount:moves.length,reason:moves.length?'Source rear doorway or boundary-fitted side wall requires clearance; original generic objects retained with limited explicitly unverified relocation':'No positive source evidence for deleting these particular prior objects'};
  g.furnitureStatus='LEGACY_PLACEHOLDER_RETAINED_UNVERIFIED__SOURCED_ARCHITECTURAL_UPDATE_ONLY';
}

function buildTempleTower(kit,item,p) {
  const turned=p.key==='baoxiang'||p.key==='jiyun';
  const w=turned?item.d:item.w,d=turned?item.w:item.d,bays=turned?7:5;
  const c=base(kit,item,p,{w,d,bays,rot:p.key==='baoxiang'?FACE.west:p.key==='jiyun'?FACE.east:0,h:4.1,frontSteps:p.key!=='jiyun'});
  const{g,box,column,wallX,wallZ,face,partition}=c;
  Object.assign(g,{storeys:2,eaveCount:1,upperY:g.y+4.2,upperH:3.6,front:-d/2+1.35,rear:d/2+(p.key==='jiyun'?-.2:.1),stairs:[],lightwells:[],interiorPeriod:'OFFICIAL_UNDATED_DESCRIPTION_AND_PHOTO__CURRENT_FULL_INVENTORY_UNKNOWN'});
  const bay=w/bays,A=w/2;
  if(p.key==='jiyun'){
    // Reversible approach fit: the source-facing hall leaves a narrow gap to
    // Xianruo. Shorter/wider steps permit a north approach without overlapping
    // the neighboring platform. These are not surveyed historical dimensions.
    const edge=-d/2-.5,run=.78,width=6,n=4;
    for(let k=0;k<n;k++){const h=g.y*(n-k)/(n+1);box('jiyun-fitted-entry-step','stone',width,h,run/n,0,h/2,edge-(k+.5)*run/n,false);}
    kit.walkRamp(c.f,-width/2,width/2,edge,edge-run,g.y,0);
    g.entryStair={width,run,frontColumnRowInset:.22,status:'NEIGHBOR_CLEARANCE_ACCESS_FIT_NOT_HISTORICAL_MEASUREMENT'};
  }
  columns(c,{front:-d/2+(p.key==='jiyun'?.22:0)});columns(c,{yy:g.upperY,height:g.upperH,upper:true,front:-d/2+(p.key==='jiyun'?.22:0)});
  for(const yy of[g.y,g.upperY]){
    const H=yy===g.y?4.05:g.upperH-.1;
    for(let i=0;i<bays;i++){
      const isPassage=p.key==='ciyin'&&yy===g.y&&i===0;
      face(-A+i*bay,-A+(i+1)*bay,g.front,yy,H,{door:i===Math.floor(bays/2)||isPassage,opened:i===Math.floor(bays/2)||isPassage,role:p.key+(yy===g.y?'-front':'-upper-front')});
    }
    if(p.key==='ciyin'&&yy===g.y){
      wallZ(g.rear,-A+bay,A,g.y,H);face(-A,-A+bay,g.rear,g.y,H,{door:true,opened:true,role:'ciyin-passage-rear'});
    }else wallZ(g.rear,-A,A,yy,H);
    for(const side of[-1,1]){
      if(p.key==='baoxiang'&&yy===g.y)partition(side*A,g.front,g.rear,yy,H,g.front+1.7,1.65,'baoxiang-small-end-door');
      else wallX(side*A,g.front,g.rear,yy,H);
    }
  }
  if(p.key==='baoxiang') {
    const doorZ=g.front+1.7,wellZ=1.05;
    g.endDoors=[-1,1].map(side=>({x:side*A,z:doorZ}));
    for(let i=1;i<bays;i++)for(const yy of[g.y,g.upperY])partition(-A+i*bay,g.front,g.rear,yy,yy===g.y?4.05:g.upperH-.1,doorZ,1.65);
    for(let i=0;i<bays;i++)if(i!==3){
      let cx=-A+(i+.5)*bay;if(i===0)cx+=1.3;if(i===6)cx-=1.3;const hw=i===0||i===6?.5:.8;
      const hole={index:i,x0:cx-hw,x1:cx+hw,z0:wellZ-1.25,z1:wellZ+1.25};g.lightwells.push(hole);
    }
    for(const side of[-1,1])g.stairs.push({index:side,x:side*(A-.94),width:1.35,z0:g.front+2.25,z1:g.rear-1.55,accessFit:'BOTTOM_RUN_EXTENDED_0_05M_AND_FINER_TREADS_FOR_PRODUCTION_BODY_CLEARANCE'});
    const stairHoles=g.stairs.map(s=>({x0:s.x-s.width/2-.03,x1:s.x+s.width/2+.03,z0:s.z0-.02,z1:s.z1}));
    subtractFloor(c,g.upperY,[...g.lightwells,...stairHoles]);
    for(const h of g.lightwells){
      rail(c,p.key+'-lightwell-rail',h.x0,h.x1,h.z0,h.z0,g.upperY,{hole:h.index});
      rail(c,p.key+'-lightwell-rail',h.x0,h.x1,h.z1,h.z1,g.upperY,{hole:h.index});
      rail(c,p.key+'-lightwell-rail',h.x0,h.x0,h.z0,h.z1,g.upperY,{hole:h.index});
      rail(c,p.key+'-lightwell-rail',h.x1,h.x1,h.z0,h.z1,g.upperY,{hole:h.index});
    }
    for(const s of g.stairs)stair(c,s);
    // Observed upper photograph: recessed rectangular cabinet/niche framework,
    // not 732 invented figures or copied decorative reliefs.
    for(let i=0;i<bays;i++)if(i!==0&&i!==3&&i!==6){const x=-A+(i+.5)*bay+(i===0?.72:i===6?-.72:0),cabW=i===0||i===6?bay-1.95:bay-.5;
      box('baoxiang-upper-scripture-cabinet','timber',cabW,.85,.3,x,g.upperY+.425,g.rear-.20,true);
      for(let k=0;k<=4;k++)box('baoxiang-upper-niche-grid','timber',cabW,.055,.12,x,g.upperY+1.05+k*.33,g.rear-.57,true);
      for(let k=0;k<=5;k++)box('baoxiang-upper-niche-grid','timber',.055,1.38,.12,x-cabW/2+k*cabW/5,g.upperY+1.72,g.rear-.57,true);
    }
    g.circulationStatus='SEVEN_CONNECTED_BAYS_SIX_LIGHTWELLS_AND_TWO_SOURCE_END_STAIRS__ALL_METRICS_FITTED';
  } else if(p.key==='ciyin') {
    const x=-A+bay/2,wallXPos=-A+bay;
    partition(wallXPos,g.front,g.rear,g.y,4.05,0,1.65,'ciyin-east-passage-partition');
    g.passage={x,wallX:wallXPos,doorZ:0};
    const s={index:1,x:A-.98,width:1.4,z0:g.front+2.3,z1:g.rear-1.55};g.stairs.push(s);
    subtractFloor(c,g.upperY,[{x0:s.x-s.width/2-.04,x1:s.x+s.width/2+.04,z0:s.z0-.03,z1:s.z1}]);stair(c,s);
    const cabinetLeft=-A+.45,cabinetRight=A-3.1;
    box('ciyin-upper-scripture-wall','timber',cabinetRight-cabinetLeft,2.2,.58,(cabinetRight+cabinetLeft)/2,g.upperY+1.1,g.rear-.42,true);
    for(let i=0;i<16;i++)box('ciyin-scripture-niche-divider','gold',.04,1.65,.08,cabinetLeft+(i+.5)*(cabinetRight-cabinetLeft)/16,g.upperY+1.28,g.rear-.74,false);
    for(let i=0;i<3;i++)box('ciyin-scripture-niche-shelf','timber',cabinetRight-cabinetLeft,.05,.08,(cabinetRight+cabinetLeft)/2,g.upperY+.45+i*.7,g.rear-.74,false);
    g.circulationStatus='SOURCE_EAST_THROUGH_BAY_WEST_SIDE_DOOR_AND_WEST_STAIR__METRICS_FITTED';
  } else {
    subtractFloor(c,g.upperY,[]);
    // The official text locates a stepped offering structure on each side of
    // the central figure on both floors. Tier count and proportions are fits.
    for(const yy of[g.y,g.upperY])for(const side of[-1,1])for(let k=0;k<3;k++){
      const ww=bay*2.05-k*.58,dd=2.7-k*.66,hh=.48;
      box('jiyun-stepped-offering-tier','timber',ww,hh,dd,side*bay*1.7,yy+.24+k*.48,g.rear-dd/2-.22,true,{floor:yy===g.y?1:2,tier:k+1});
    }
    for(const yy of[g.y,g.upperY])for(const side of[-1,1]){
      const cx=side*bay*1.7;
      box('jiyun-rear-niche-framework','timber',bay*2.05,1.2,.16,cx,yy+2.15,g.rear-.3,true);
      for(let k=0;k<9;k++)box('jiyun-niche-divider','gold',.045,1.1,.08,cx-bay+k*bay/4,yy+2.15,g.rear-.4,false);
    }
    g.circulationStatus='TWO_REAL_LEVELS__STAIR_POSITION_UNVERIFIED_NO_INVENTED_GROUND_CONNECTION';
  }
  if(p.key==='jiyun'&&kit.jiyunFrontFit!==false)buildJiyunFrontFit(c);
  if(p.key==='ciyin')retainLegacyFurniture(c);
  rail(c,p.key+'-upper-front-rail',-A+.15,A-.15,-d/2+.12,-d/2+.12,g.upperY);
  for(const side of[-1,1])rail(c,p.key+'-upper-balcony-end',side*(A-.15),side*(A-.15),-d/2+.12,g.front,g.upperY);
  if(p.key==='jiyun'&&kit.jiyunRailFit!==false)buildJiyunRailFit(c);
  plainCeiling(c,g.upperY+g.upperH-.12);
  g.roof=rolledRoof(c,{yy:g.upperY+g.upperH,rise:2.1});
  if(p.key==='jiyun')buildJiyunNamePlaque(kit,c.f,g);
  c.register(item.name,-A+.35,A-.35,g.front,g.rear,g.y,3.65,[{x:0,z:g.front}],{x:0,z:g.front+1.2});
  // Upper navigation is deliberately not a historical room-count claim.
  if(p.key!=='jiyun')c.register(item.name+'·二层观览区',-A+.35,A-.35,g.front,g.rear,g.upperY,3.2,[{x:0,z:g.front}],{x:0,z:g.front+.55});
  const toWorld=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).applyMatrix4(c.f.matrixWorld);return{x:v.x,y:v.y,z:v.z};};
  g.navigation={status:'FITTED_MODEL_ROUTE_NOT_CURRENT_VISITOR_PERMISSION',stairRoutes:g.stairs.map(s=>{
    const escapeX=p.key==='baoxiang'?Math.sign(s.x)*(A-2.30):A-2.4,landingZ=s.z1+.65,aisleZ=p.key==='baoxiang'?g.front+1.7:0;
    return{id:p.key+'-stair-'+s.index,fromFloor:g.y,toFloor:g.upperY,points:[...(p.key==='baoxiang'?[toWorld(escapeX,g.y,aisleZ),toWorld(escapeX,g.y,s.z0-.65),toWorld(s.x,g.y,s.z0-.65)]:[toWorld(s.x,g.y,s.z0-.45)]),toWorld(s.x,g.y,s.z0),toWorld(s.x,g.upperY,s.z1),toWorld(s.x,g.upperY,landingZ),toWorld(escapeX,g.upperY,landingZ),toWorld(escapeX,g.upperY,aisleZ),toWorld(0,g.upperY,aisleZ)]};
  })};
  return finish(c);
}
function addHallBearingRing(c) {
  const {g,p,box}=c,top=g.y+g.h;
  for(const side of[-1,1]){
    box(p.key+'-roof-bearing-eave-plate','timber',g.w+.8,.28,.8,0,top+.02,side*g.d/2,false,{constructionStatus:'FITTED_CONTINUOUS_PLATE_CONNECTS_COLUMNS_TO_RETAINED_ROOF_BRACKET_BAND'});
    box(p.key+'-roof-bearing-side-plate','timber',.8,.28,g.d-.8,side*g.w/2,top+.02,0,false,{constructionStatus:'FITTED_CONTINUOUS_PLATE_CONNECTS_COLUMNS_TO_RETAINED_ROOF_BRACKET_BAND'});
  }
}
function buildCeremonialHall(kit,item,p) {
  const shouan=p.key==='shouan',cining=p.key==='cining';
  const c=base(kit,item,p,{bays:shouan?5:7,backDoor:shouan});
  const{g,box,wallX,wallZ,face}=c,A=g.w/2,bay=g.w/g.bays;
  Object.assign(g,{front:-g.d/2+(cining?2:0),rear:g.d/2-(cining?.8:0),eaveCount:cining?2:1});
  columns(c);
  for(const side of[-1,1])wallX(side*(A-.15),g.front,g.rear,g.y,g.h-.5);
  for(let i=0;i<g.bays;i++){
    const middle=i===(g.bays-1)/2;
    const door=cining?i>0&&i<6:p.key==='dafotang'?true:middle;
    const z=shouan&&middle?g.front+g.d/3:g.front;
    if(shouan&&middle){g.centralFront=z;for(const side of[-1,1])wallX(side*bay/2,g.front,z,g.y,g.h-.5,'shouan-recess-return');}
    face(-A+i*bay,-A+(i+1)*bay,z,g.y,g.h-.5,{door,opened:middle,role:p.key+'-front',sill:1.05});
    if(shouan)face(-A+i*bay,-A+(i+1)*bay,g.rear,g.y,g.h-.5,{door:middle,opened:middle,role:p.key+'-rear',sill:1.05});
  }
  if(p.key==='cining'&&kit.ciningFrontFit!==false)buildCiningFrontFit(c);
  if(p.key==='dafotang'&&kit.dafotangFrontFit!==false)buildDafotangFrontFit(c);
  if(!shouan)wallZ(g.rear,-A,A,g.y,g.h-.5);
  if(cining)buildCiningModernDisplay(c);else retainLegacyFurniture(c);
  if(p.key==='dafotang'){g.warmRoomPartitions=[-1,1].map(side=>({x:side*bay*1.5,doorZ:g.front+2.2,doorW:1.8,doorH:2.65}));for(const part of g.warmRoomPartitions)c.partition(part.x,g.front,g.rear,g.y,g.h-.5,part.doorZ,part.doorW,'dafotang-fitted-warm-room-partition');g.partitionEvidence='THREE_SECTIONS_OFFICIAL__3_2_2_BAY_SPLIT_AND_DOOR_LOCATIONS_FITTED';}
  // Ceiling beams are structural fits. No generic throne, desks or chairs are
  // substituted for the modern sculpture-library uses or historical shrines.
  plainCeiling(c,g.y+g.h-.5);
  for(let k=1;k<g.bays;k++)box(p.key+'-transverse-ceiling-frame','timber',.20,.26,g.rear-g.front,-A+k*bay,g.y+g.h-.7,(g.front+g.rear)/2,false);
  for(const z of[g.front+(g.rear-g.front)/3,g.front+(g.rear-g.front)*2/3])box(p.key+'-longitudinal-ceiling-frame','timber',g.w,.24,.18,0,g.y+g.h-.72,z,false);
  addHallBearingRing(c);
  kit.roof(c.f,{type:'xieshan',width:g.w+.5,depth:g.d+.5,baseY:g.y+g.h,layers:g.eaveCount,brackets:true});
  kit.plaque(c.f,item.name,0,g.y+g.h-.95,-g.d/2-.32,1.2,1.9);
  const doorZ=g.centralFront??g.front;
  c.register(item.name,-A+.4,A-.4,doorZ,g.rear,g.y,g.h-.8,[{x:0,z:doorZ},...(shouan?[{x:0,z:g.rear}]:[])],{x:0,z:doorZ+1.5});
  return finish(c,{interiorStatus:p.key==='shouan'?'SOURCE_RECESSED_ENTRY_LIBRARY_FURNITURE_UNRECONSTRUCTED':'SOURCE_ARCHITECTURAL_BAYS_CURRENT_MUSEUM_INVENTORY_UNRECONSTRUCTED'});
}

function buildCiningModernDisplay(c) {
  const {g,p,kit,box,column}=c,bay=g.w/7;
  const source='https://ggzlquanjing.dpm.org.cn/scene/TEojA7YSoIeQLUt89lpeUy1OWSaJOKwV/cininggongdiaosuzhan//tour.html';
  const displayInfo={source,photographyDate:null,photoScene:'展区009 / 展区008',fidelity:'PARTIAL_OBSERVED_DISPLAY_SUPPORTS__DIMENSIONS_AND_PLACEMENT_FITTED',sculptures:'UNMODELED'};
  box('cining-modern-central-platform','stone',8,.28,3.6,0,g.y+.14,7.7,true,displayInfo);
  box('cining-modern-empty-central-pedestal','stone',1.6,1.52,1.6,0,g.y+.28+.76,8.65,true,{...displayInfo,emptyReason:'Sculptures not reconstructed; no invented substitute figures'});
  const glass=new THREE.MeshStandardMaterial({name:'r48_outer_cining_display_glass',color:0xb9c4c0,roughness:.24,transparent:true,opacity:.18,depthWrite:false});kit.owned.push(glass);
  for(const side of[-1,1]){
    box('cining-modern-side-case-base','stone',2.1,.5,9,side*12,g.y+.25,3.5,true,displayInfo);
    box('cining-modern-side-case-glass',glass,2.1,1.85,9,side*12,g.y+1.425,3.5,true,displayInfo);
    for(const x of[side*12-1.04,side*12+1.04])box('cining-modern-case-frame','dark',.055,1.85,.055,x,g.y+1.425,-.97,false,displayInfo);
    box('cining-modern-partial-wall-stand','stone',4.3,.4,1.2,side*17.4,g.y+.2,9.4,true,displayInfo);
  }
  const columns=[[-bay/2,10.7],[bay/2,10.7],[-bay*1.5,5.3],[bay*1.5,5.3]];
  for(const[x,z]of columns){const mesh=column(x,z,g.y,g.h-.5,'cining-photo-partial-column',.32);Object.assign(mesh.userData,displayInfo,{gridStatus:'FOUR_VISIBLE_COLUMN_FITS_ON_SEVEN_BAY_AXES_NOT_COMPLETE_SURVEY'});box('cining-photo-column-roof-connection','timber',.48,.28,g.rear-g.front,x,g.y+g.h-.64,(g.rear+g.front)/2,false,displayInfo);}
  const toWorld=(x,z)=>({x:c.item.x+x,y:g.y,z:c.item.z+z});
  g.navigation={displayRoutes:[-1,1].map(side=>({id:'cining-display-bypass-'+side,points:[[0,3.5],[side*5.2,3.5],[side*5.2,11.6],[0,11.6]].map(([x,z])=>toWorld(x,z))}))};
  g.display={...displayInfo,platform:{x0:-4,x1:4,z0:5.9,z1:9.5,top:g.y+.28},centralPedestal:{x0:-.8,x1:.8,z0:7.85,z1:9.45,top:g.y+1.8},caseStatus:'TWO_PARTIAL_SIDE_CASE_ENVELOPES_NOT_FULL_INVENTORY',visibleColumns:4,warning:'Empty supports and partial equipment contours only; sculpture artwork and complete arrangement are not reconstructed'};
  g.overlayPolicy={overlayId:'cining',action:'DISABLE_LEGACY_INFERRED_OVERLAY',integrationOwner:'Shared asset registry; original GLB file retained for rollback'};
  g.furnitureStatus='MODERN_PHOTO_PARTIAL_EMPTY_SUPPORTS__SCULPTURES_AND_FULL_INVENTORY_UNMODELED';
}

function buildGardenFrontHouse(kit,item,p) {
  const c=base(kit,item,p,{bays:3,...gardenFrontGeometry(p)}),{g,box,wallX,wallZ,face}=c,A=g.w/2,bay=g.w/3;
  for(let k=0;k<=3;k++)for(const z of[g.front+.25,g.rear-.25])c.column(-A+.26+k*(g.w-.52)/3,z,g.y,g.h,p.key+'-inset-front-house-column');
  for(const z of[g.front+.25,g.rear-.25])box(p.key+'-front-house-eave-beam','red',g.w-.1,.38,.32,0,g.y+g.h-.19,z,false);
  // The near-square front house is the only enlargement. No rear courtyard,
  // back house or side connector is slipped across the existing Lansheng gate.
  for(const side of[-1,1])wallX(side*(A-.125),g.front,g.rear,g.y,g.h);
  wallZ(g.rear,-A,A,g.y,g.h-.35);
  for(let i=0;i<3;i++)face(-A+i*bay,-A+(i+1)*bay,g.front,g.y,g.h-.35,{door:i===1,opened:i===1,role:p.key+'-front',leafCount:2,sill:1.0});
  for(const side of[-1,1])box(p.key+'-grey-brick-plinth','stone',.28,.75,g.d,side*(A-.14),g.y+.375,0,false);
  box(p.key+'-rear-grey-brick-plinth','stone',g.w,.75,.28,0,g.y+.375,g.rear-.14,false);
  // Roof pitch, each roll's depth and structural spacing are reversible fits.
  // Gray tile is evidenced; it is not a green/yellow imperial-roof recolor.
  for(let i=0;i<3;i++){
    const dd=g.d/3+(i===1?0:.35),z=-g.d/2+(i+.5)*g.d/3+(i===0?-.175:i===2?.175:0);
    rolledRoof(c,{w:g.w,d:dd,yy:g.y+g.h,rise:1.35,material:'grey_tile',trim:'grey_tile',hard:true,key:p.key+'-roll-'+i,z,edgeSides:i===0?[-1]:i===2?[1]:[]});
  }
  retainLegacyFurniture(c);
  if(p.key==='yanshou'){
    box('yanshou-paper-lined-ceiling','ceiling',g.w-.3,.07,g.d-.3,0,g.y+g.h-.25,0,false);
    for(const side of[-1,1])box('yanshou-paper-lined-wainscot','paper',.08,1.25,g.d-.45,side*(A-.19),g.y+.625,0,false);
    box('yanshou-paper-lined-wainscot','paper',g.w-.38,1.25,.08,0,g.y+.625,g.rear-.19,false);
    // Exact silver-flower pattern is not invented from its textual name.
  }else{
    plainCeiling(c,g.y+g.h-.25);
  }
  for(let k=1;k<=2;k++)box(p.key+'-front-house-valley-bearing','timber',g.w-.25,.24,.28,0,g.y+g.h-.08,g.front+k*g.d/3,false,{constructionStatus:'FITTED_VALLEY_BEAM_BEARING_ON_FULL_HEIGHT_SIDE_WALLS'});
  kit.plaque(c.f,item.name,0,g.y+g.h-.75,g.front-.25,.75,1.2);
  c.register(item.name+'·前房',-A+.35,A-.35,g.front,g.rear,g.y,g.h-.55,[{x:0,z:g.front}],{x:0,z:g.front+1.3});
  return finish(c,{compoundStatus:'FRONT_HOUSE_ONLY_REAR_COURT_AND_CONNECTOR_WITHHELD',sourceFrontHouse:'THREE_BAY_NEAR_SQUARE_TRIPLE_ROLLED_HARD_GABLE',frontDoorWorld:{x:item.x,z:item.z-item.d/2},originalIdentityAnchor:{x:item.x,z:item.z},fittedFrontHouseCenter:{x:item.x,z:g.centerZ},frontHouseWorldWallBounds:{minX:item.x-A,maxX:item.x+A,minZ:item.z-item.d/2,maxZ:item.z-item.d/2+g.d},unknown:['Rear courtyard, rear house and side connector omitted pending full neighbor/route fit','Flexible interior screens, flower-window placement and complete furnishing positions unresolved','Official building page and architecture paper differ in front depth-bay description; numeric depth is a model fit'],facadeDetailStatus:'CENTRAL_DOOR_SIDE_SILL_LIFT_WINDOWS_SOURCED__LEAF_COUNT_PATTERN_FITTED'});
}

function buildNanxunHall(kit,item,p) {
  const c=base(kit,item,p,{bays:5}),{g,box,face,wallX,wallZ}=c,A=g.w/2,bay=g.w/5;
  columns(c);
  for(const side of[-1,1])wallX(side*A,g.front,g.rear,g.y,g.h-.5);
  wallZ(g.rear,-A,A,g.y,g.h-.5);
  for(let i=0;i<5;i++)face(-A+i*bay,-A+(i+1)*bay,g.front,g.y,g.h-.5,{door:i===2,opened:i===2,role:'nanxun-fitted-front'});
  withholdNanxunPlaceholderFurniture(c);
  const yy=g.y+g.h-.6,half=2.15,outer=2.45;
  // The official ceiling photograph establishes square -> octagonal -> round
  // topology. The central dragon carving is NOT replaced by a generic sphere
  // or a fictitious "xuanyuan mirror". Relief artwork remains unmodeled.
  for(const [x0,x1,z0,z1]of[[-A,-half,g.front,g.rear],[half,A,g.front,g.rear],[-half,half,g.front,-half],[-half,half,half,g.rear]])box('nanxun-ceiling-outside-caisson','ceiling',x1-x0,.08,z1-z0,(x0+x1)/2,yy,(z0+z1)/2,false);
  for(const side of[-1,1]){
    box('nanxun-square-caisson-frame','timber',outer*2,.20,.30,0,yy+.02,side*(outer-.15),false);
    box('nanxun-square-caisson-frame','timber',.30,.20,outer*2-.60,side*(outer-.15),yy+.02,0,false);
    for(let k=0;k<8;k++){
      const v=-1.9+k*3.8/7;
      box('nanxun-caisson-perimeter-bracket-fit','timber',.16,.22,.32,v,yy+.15,side*2.18,false);
      box('nanxun-caisson-perimeter-bracket-fit','timber',.32,.22,.16,side*2.18,yy+.15,v,false);
    }
  }
  const shape=new THREE.Shape();shape.moveTo(-half,-half);shape.lineTo(half,-half);shape.lineTo(half,half);shape.lineTo(-half,half);shape.closePath();
  const hole=new THREE.Path();for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8,x=Math.cos(a)*2.05,z=Math.sin(a)*2.05;if(!k)hole.moveTo(x,z);else hole.lineTo(x,z);}hole.closePath();shape.holes.push(hole);
  const transition=new THREE.ShapeGeometry(shape);transition.rotateX(Math.PI/2);mark(kit.mesh(c.f,transition,c.m.timber,0,yy+.12,0),p,'nanxun-square-to-octagon-spandrel');
  const inner=c.m.timber.clone();inner.name='r48_outer_nanxun_caisson_inner';inner.side=THREE.BackSide;kit.owned.push(inner);
  const band=(role,r0,r1,y0,y1,n)=>{const geo=new THREE.CylinderGeometry(r1,r0,y1-y0,n,1,true);geo.rotateY(Math.PI/8);return mark(kit.mesh(c.f,geo,inner,0,(y0+y1)/2,0),p,role);};
  band('nanxun-octagonal-caisson-transition',2.05,1.72,yy+.12,yy+.56,8);
  band('nanxun-circular-caisson-transition',1.72,1.40,yy+.56,yy+1.02,48);
  const disk=new THREE.CircleGeometry(1.40,48);disk.rotateX(Math.PI/2);mark(kit.mesh(c.f,disk,c.m.timber,0,yy+1.03,0),p,'nanxun-caisson-relief-unmodeled-core',{artworkStatus:'DRAGON_RELIEF_NOT_RECONSTRUCTED'});
  for(const z of[g.front+(g.rear-g.front)/3,g.front+(g.rear-g.front)*2/3])box('nanxun-fitted-main-ceiling-beam','timber',g.w,.2,.18,0,yy-.15,z,false);
  addHallBearingRing(c);
  kit.roof(c.f,{type:'xieshan',width:g.w+.5,depth:g.d+.5,baseY:g.y+g.h,layers:1,brackets:true});
  kit.plaque(c.f,item.name,0,g.y+g.h-.95,g.front-.32,1.2,1.9);
  c.register(item.name,-A+.35,A-.35,g.front,g.rear,g.y,g.h-.8,[{x:0,z:g.front}],{x:0,z:g.front+1.3});
  applyNanxunCeilingBaseColors(c);
  buildNanxunCaissonRings(c);
  return finish(c,{caisson:{source:'https://img.dpm.org.cn/Uploads/Picture/dc/3938[1024].jpg',photographyDate:null,baseY:yy,recess:1.03,positionStatus:'CENTRAL_BAY_FIT_NOT_SURVEYED',topology:'SQUARE_OCTAGONAL_CIRCULAR',dragonRelief:'UNMODELED'},facadeDetailStatus:'FIVE_BAYS_OFFICIAL__LEAF_PATTERN_AND_DIMENSIONS_UNVERIFIED_FIT',interiorPeriod:'UNDATED_OFFICIAL_CEILING_PHOTO__NOT_A_QIANLONG_INVENTORY_RECONSTRUCTION'});
}

function buildYanchunPavilion(kit,item,p) {
  const lowerH=5,midY=3.65,upperY=7,upperH=3.4,upperW=12.8,upperD=13.6,balconyW=15.6,balconyD=16.4;
  const c=base(kit,item,p,{bays:5,h:lowerH}),{g,box,face}=c,A=g.w/2,B=g.d/2,wallX=A-1.8,wallZ=B-1.8;
  g.storeys=3;g.exteriorStoreys=2;g.eaveCount=2;g.upperY=upperY;g.upperH=upperH;
  const image='https://img.dpm.org.cn/Uploads/Picture/dc/14571[1024].jpg';
  const source='https://www.dpm.org.cn/classify_detail/156251.html';
  const info={source,photo:image,photographyDate:null,photoPeriod:'REBUILD_CONSTRUCTION_PHOTO_NOT_FINISHED_CURRENT_INTERIOR',dimensionStatus:FIT};
  // Five bays on each lower side. Intermediate side posts are real geometry,
  // not merely a five-bay label on the old generic double-eaved single room.
  columns(c,{height:lowerH});
  for(const x of[-A,A])for(let k=1;k<5;k++)c.column(x,-B+k*g.d/5,g.y,lowerH,'yanchun-lower-side-column');
  for(const x of[-A,A])box('yanchun-lower-side-eave-beam','red',.34,.36,g.d,x,g.y+lowerH-.18,0,false,info);
  const groundH=midY-g.y-.18,topH=g.y+lowerH-midY-.18;
  c.wallX(-wallX,-wallZ,wallZ,g.y,lowerH-.18);c.wallX(wallX,-wallZ,wallZ,g.y,lowerH-.18);c.wallZ(wallZ,-wallX,wallX,g.y,lowerH-.18);
  for(let k=0;k<5;k++){
    const x0=-wallX+k*wallX*2/5,x1=-wallX+(k+1)*wallX*2/5;
    face(x0,x1,-wallZ,g.y,groundH,{door:k===2,opened:k===2,role:'yanchun-lower-five-bay',leafCount:4,sill:.65});
    face(x0,x1,-wallZ,midY,topH,{role:'yanchun-dark-mezzanine-front',leafCount:4,sill:.28});
  }
  // Historical text establishes a hidden internal middle level, not its
  // complicated plan. The two solid levels are explicit, but unverified
  // partitions, stairs, upper rooms and teleport destinations are withheld.
  c.floor(-wallX+.15,wallX-.15,-wallZ+.15,wallZ-.15,midY,'yanchun-dark-mezzanine-floor',info);
  c.floor(-balconyW/2,balconyW/2,-balconyD/2,balconyD/2,upperY,'yanchun-third-floor-and-balcony',info);
  for(let k=0;k<=3;k++)for(const z of[-upperD/2,upperD/2]){
    const x=-upperW/2+k*upperW/3;
    const post=c.column(x,z,g.y,upperY-g.y-.16,'yanchun-fitted-floor-support-post');post.material=c.m.timber;
    c.column(x,z,upperY,upperH,'yanchun-upper-three-bay-column');
  }
  for(const z of[-upperD/2,upperD/2]){
    box('yanchun-midfloor-bearing','timber',upperW+.35,.26,.3,0,midY-.19,z,false,info);
    box('yanchun-topfloor-bearing','timber',balconyW,.28,.34,0,upperY-.2,z,false,info);
  }
  for(const x of[-upperW/2,upperW/2])box('yanchun-topfloor-cross-bearing','timber',.34,.28,balconyD,x,upperY-.2,0,false,info);
  const upperContext={...c,g:{...g,w:upperW,d:upperD,y:upperY,h:upperH,front:-upperD/2,rear:upperD/2}};
  // The official count is three bays on all four upper sides, not just the
  // front and rear. Side posts bear on the existing slab / cross-bearing and
  // meet the same roof side plate. Infill remains conservative solid wall:
  // the construction photograph does not establish finished side fenestration.
  for(const x of[-upperW/2,upperW/2]){
    for(let k=1;k<3;k++)c.column(x,-upperD/2+k*upperD/3,upperY,upperH,'yanchun-upper-three-bay-column');
    for(let k=0;k<3;k++)c.wallX(x,-upperD/2+k*upperD/3+.24,-upperD/2+(k+1)*upperD/3-.24,upperY,upperH-.35,'yanchun-upper-side-wall');
  }
  for(const z of[-upperD/2,upperD/2])for(let k=0;k<3;k++)face(-upperW/2+k*upperW/3,-upperW/2+(k+1)*upperW/3,z,upperY,upperH-.35,{role:'yanchun-upper-three-bay-window',leafCount:4,sill:.7});
  for(const z of[-balconyD/2+.08,balconyD/2-.08])rail(c,'yanchun-upper-balcony-rail',-balconyW/2+.08,balconyW/2-.08,z,z,upperY,info);
  for(const x of[-balconyW/2+.08,balconyW/2-.08])rail(c,'yanchun-upper-balcony-rail',x,x,-balconyD/2+.08,balconyD/2-.08,upperY,info);
  const start=c.f.children.length,ow=A+.8,od=B+.8,iw=balconyW/2,id=balconyD/2,low=g.y+lowerH+.08,high=upperY-.10;
  for(const side of[-1,1]){
    sheet(c,'yanchun-open-center-lower-roof','yellow_glaze',10,24,(u,v)=>[(v*2-1)*(iw+(ow-iw)*u),high-(high-low)*Math.pow(u,.8)+.14*Math.pow(Math.abs(v*2-1),8)*u*u,side*(id+(od-id)*u)]);
    sheet(c,'yanchun-open-center-lower-roof','yellow_glaze',10,24,(u,v)=>[side*(iw+(ow-iw)*u),high-(high-low)*Math.pow(u,.8)+.14*Math.pow(Math.abs(v*2-1),8)*u*u,(v*2-1)*(id+(od-id)*u)]);
  }
  const skins=c.f.children.slice(start).filter(n=>n.name==='yanchun-open-center-lower-roof');
  installRoofUnderboardsAndBearings(c,skins,g.y+lowerH,'yanchun-lower');
  // The inner skirt terminates below the balcony edge, not inside a second
  // complete pyramid. A timber ring closes and supports that real junction.
  for(const z of[-id,id])box('yanchun-lower-roof-balcony-junction','timber',balconyW,.24,.28,0,upperY-.18,z,false,info);
  for(const x of[-iw,iw])box('yanchun-lower-roof-balcony-junction','timber',.28,.24,balconyD,x,upperY-.18,0,false,info);
  const blue=new THREE.MeshStandardMaterial({name:'yanchun_blue_glazed_border_photo_fit',color:0x3c607e,roughness:.48});kit.owned.push(blue);
  for(const side of[-1,1]){
    box('yanchun-lower-blue-eave-border',blue,ow*2,.13,.18,0,low,side*od,false,info);
    box('yanchun-lower-blue-eave-border',blue,.18,.13,od*2,side*ow,low,0,false,info);
  }
  addHallBearingRing(upperContext);
  const top=kit.roof(c.f,{type:'pavilion',width:upperW+.4,depth:upperD+.4,baseY:upperY+upperH,layers:1,height:4.2,brackets:true});top.userData.remainingRoof='yanchun-upper-pyramid';
  top.traverse(n=>{if(n.isMesh&&['kit_ridge','roof_ridge_glaze'].includes(materialKey(kit,n.material)))n.material=blue;});
  retainLegacyFurniture(c);
  kit.plaque(c.f,item.name,0,g.y+groundH-.5,-wallZ-.25,.9,1.5);
  fitYanchunFrontPlaque(c);
  addYanchunSouthVessels(c);
  c.register(item.name+'·底层',-wallX+.2,wallX-.2,-wallZ,wallZ,g.y,groundH,[{x:0,z:-wallZ}],{x:0,z:-wallZ+1.25});
  c.g.inventory=withholdHUnknownInventory(kit,item,c.f);
  c.g.furnitureStatus='UNKNOWN_INVENTORY_GENERIC_PLACEHOLDERS_WITHHELD_NOT_EMPTY';
  delete c.g.retainedFurniture;
  return finish(c,{lowerBays:5,upperBays:3,internalLevels:[{level:1,floorY:g.y},{level:2,floorY:midY,hidden:true},{level:3,floorY:upperY}],upperWidth:upperW,upperDepth:upperD,balcony:{width:balconyW,depth:balconyD,floorY:upperY},interiorPeriod:'HISTORICAL_THREE_LEVEL_TOPOLOGY__COMPLEX_PARTITIONS_NOT_RECONSTRUCTED',rebuildPeriod:'1923_FIRE__GARDEN_REBUILT_2006__PHOTO_SHOWS_REBUILD_CONSTRUCTION',constructionPhoto:image,upperAccess:'NO_VERIFIED_STAIR_NO_UPPER_ROOM_OR_AUTOMATIC_DESTINATION',partialGridStatus:'FOUR_SIDED_LOWER_FIVE_UPPER_THREE_EXTERIOR_BAY_COUNTS__INTERNAL_SUPPORT_POSITIONS_FITTED',lowerRoof:{kind:'OPEN_CENTER_FOUR_SIDED_SKIRT',innerHalfWidth:iw,innerHalfDepth:id,innerY:high,outerY:low},unknown:['Complicated lower-floor partitions and stair position remain unverified; no Fuwang layout is borrowed','Rebuild construction photo does not establish completed current furniture or paint inventory','Generic ground furniture is withheld; current inventory is UNKNOWN, not known empty','Upper side infill is conservative solid wall; finished side fenestration is not verified']});
}

export function buildRemainingHall(kit,item,profile) {
  validate(item,profile,'replace');
  if(profile.key==='yanchun')return buildYanchunPavilion(kit,item,profile);
  if(['hanqing','yanshou'].includes(profile.key))return buildGardenFrontHouse(kit,item,profile);
  if(profile.key==='nanxun')return buildNanxunHall(kit,item,profile);
  if(['baoxiang','jiyun','ciyin'].includes(profile.key))return buildTempleTower(kit,item,profile);
  if(['cining','dafotang','shouan'].includes(profile.key))return buildCeremonialHall(kit,item,profile);
  throw new Error(`R48 outer builder pending for ${profile.key}`);
}

function removeOldRoofs(f) {
  const discarded=new Set();
  for(const node of [...f.children])if(node.name.startsWith('roof_')){node.traverse(n=>{if(n.geometry)discarded.add(n.geometry)});node.removeFromParent();}
  for(const geometry of discarded)geometry.dispose();
}
/** Exact individual rendered component envelope, not a whole-room box.
 * The 5 cm lower safety skin compensates the production eye/body top trim;
 * no proxy is inferred from an aggregated roof or a complete furniture group. */
function visibleComponentProxy(kit,f,mesh,{headMargin=0,skipAtOrBelow=-Infinity}={}) {
  f.updateMatrixWorld(true);mesh.geometry.computeBoundingBox();
  const local=new THREE.Matrix4().copy(f.matrixWorld).invert().multiply(mesh.matrixWorld);
  const b=mesh.geometry.boundingBox.clone().applyMatrix4(local);
  if(b.max.y<=skipAtOrBelow+1e-7)return false;
  kit.col(f,b.min.x,b.min.y-headMargin,b.min.z,b.max.x,b.max.y,b.max.z);
  mesh.userData.actualComponentProxy={bounds:{min:b.min.toArray(),max:b.max.toArray()},lowerHeadMargin:headMargin,status:'VISIBLE_COMPONENT_BOUNDING_BOX_NOT_INVISIBLE_ROOM_FILL'};
  return true;
}
function retainOpenedLeafAndPostProxies(kit,f) {
  let leaves=0,posts=0;
  for(const n of f.children)if(n.isMesh){
    if(materialKey(kit,n.material)==='lattice_doors'&&Math.abs(Math.sin(n.rotation.y))>.99){visibleComponentProxy(kit,f,n);leaves++;}
    if(n.geometry.type==='CylinderGeometry'&&materialKey(kit,n.material)==='wood_column'){visibleComponentProxy(kit,f,n);posts++;}
  }
  return {openedLeaves:leaves,retainedPosts:posts};
}
function finishAugment(kit,item,built,p,changes) {
  const g={...(built.g??built.f.userData.structure??{}),remainingProfile:p.key,remainingId:p.id,dimensionStatus:FIT,...changes};
  if(!g.id)g.id=p.id;
  built.f.userData.structure=g;
  built.f.userData.remainingOuter={id:p.id,mode:'augment',source:p.source,actualGeometry:true,interiorChanged:!!changes.interiorChanged,exteriorChanged:!!changes.exteriorChanged};
  return {...built,g,p};
}

function fittedLevelFlight(c,s,y0,y1) {
  const H=y1-y0,run=s.z1-s.z0,n=Math.ceil(H/.18),dz=run/n;
  for(let i=0;i<n;i++){
    c.box(c.p.key+'-level-stair-tread','timber',s.width,.14,Math.abs(dz)+.025,s.x,y0+H*(i+1)/n-.07,s.z0+(i+.5)*dz,false,{flight:s.id,step:i+1});
    if(i<n-1)c.box(c.p.key+'-level-stair-riser','timber',s.width,H/n,.045,s.x,y0+H*(i+1.5)/n,s.z0+(i+1)*dz,false,{flight:s.id});
    for(const sign of[-1,1])c.box(c.p.key+'-level-stair-guard','timber',.075,.12,Math.abs(dz)+.035,s.x+sign*(s.width/2+.07),y0+H*(i+.5)/n+.93,s.z0+(i+.5)*dz,true,{flight:s.id});
  }
  for(let i=0;i<=n;i+=2)for(const sign of[-1,1])c.box(c.p.key+'-level-stair-post','timber',.065,.95,.065,s.x+sign*(s.width/2+.07),y0+H*i/n+.475,s.z0+run*i/n,true,{flight:s.id});
  c.kit.walkRamp(c.f,s.x-s.width/2,s.x+s.width/2,s.z0,s.z1,y0,y1);
  stairUndercroftSafety(c,s,y0,y1,H/n);
}

function floorWithVoids(c,bounds,yy,holes,role) {
  const {x0,x1,z0,z1}=bounds,xs=[...new Set([x0,x1,...holes.flatMap(h=>[h.x0,h.x1])])].filter(v=>v>=x0&&v<=x1).sort((a,b)=>a-b),zs=[...new Set([z0,z1,...holes.flatMap(h=>[h.z0,h.z1])])].filter(v=>v>=z0&&v<=z1).sort((a,b)=>a-b);
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
    const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2;
    if(!holes.some(h=>x>h.x0&&x<h.x1&&z>h.z0&&z<h.z1))c.floor(xs[i],xs[i+1],zs[j],zs[j+1],yy,role,{floorY:yy,voids:'REAL_GEOMETRIC_OPENINGS_NOT_TEXTURES'});
  }
}

function emptyCabinetRun(c,{x,z,width,height,depth=.55,y,source,level,sections=4}) {
  const info={source,level,photographyDate:null,inventory:'EMPTY_STRUCTURAL_COMPARTMENTS_NO_INVENTED_BOOKS',positionStatus:FIT};
  c.box('wenyuan-empty-cabinet-back','timber',width,height,.06,x,y+height/2,z+depth/2-.03,false,info);
  for(let k=0;k<=sections;k++)c.box('wenyuan-empty-cabinet-upright','timber',.075,height,depth,x-width/2+k*width/sections,y+height/2,z,true,info);
  for(let k=0;k<=4;k++)c.box('wenyuan-empty-cabinet-shelf','timber',width,.07,depth,x,y+k*height/4,z,false,info);
  c.kit.col(c.f,x-width/2,y,z-depth/2,x+width/2,y+height,z+depth/2);
}

function augmentWenyuanLevels(kit,item,built,p) {
  const old=built.g??built.f.userData.structure,midY=3.15,upperY=old.upperFloor;
  const g={key:p.key,w:item.w,d:item.d,y:item.ph,h:old.lowerHeight,front:-item.d/2,rear:item.d/2};
  const c=context(kit,item,p,built,g),{f,box}=c,source1='https://img.dpm.org.cn/Uploads/Picture/dc/1537[1024].jpg',source3='https://img.dpm.org.cn/Uploads/Picture/dc/1538[1024].jpg';
  // The old generic single-storey ceiling crosses the source-supported dark
  // mezzanine and both stair volumes. New real floors supply their undersides;
  // keep the true upper roof, not this obsolete full-width decorative plane.
  let removedLegacyCeilings=0;
  for(const n of [...f.children])if(n.isMesh&&n.geometry.type==='PlaneGeometry'&&materialKey(kit,n.material)==='caihua_beam'&&n.geometry.parameters.width===item.w&&n.geometry.parameters.height===item.d&&n.position.y>midY&&n.position.y<upperY){n.removeFromParent();n.geometry.dispose();removedLegacyCeilings++;}
  const green=new THREE.MeshStandardMaterial({name:'wenyuan_sourced_green_wood_columns',color:0x426a51,roughness:.86});kit.owned.push(green);
  let recoloredColumns=0,recoloredGables=0;
  f.traverse(n=>{if(!n.isMesh||!n.material)return;if(materialKey(kit,n.material)==='wood_column'){n.material=green;n.userData.r48Source=p.source;recoloredColumns++;}else if(materialKey(kit,n.material)==='wall_red'&&(Math.abs(n.position.x)>item.w/2-1.3||n.parent?.name?.startsWith('roof_'))){n.material=kit.lib.material('wall_brick');n.userData.r48Source=p.source;recoloredGables++;}});
  // R48 visible entry fit: the retained 0.22 m sill reaches the player's body
  // before the original platform reaches their feet. Extend only this door's
  // stone tread and retreat only the unsurveyed sill front by .08 m; keep its
  // width, height and rear edge, the platform and pond/bridge route untouched.
  // The last .06 m of support is the existing projecting stone cap, not air.
  const entryWidth=item.w/item.bays-.68,entryAxis=-item.w/12;
  const oldSills=f.children.filter(n=>n.isMesh&&materialKey(kit,n.material)==='wenyuan_sourced_green_wood_columns'&&Math.abs(n.position.x-entryAxis)<1e-8&&Math.abs(n.position.y-(item.ph+.11))<1e-8&&Math.abs(n.position.z-g.front)<1e-8);
  if(oldSills.length!==1)throw Error('R48 Wenyuan requires its single retained front sill');
  const entrySill=oldSills[0];entrySill.geometry.scale(1,1,.22/.30);entrySill.position.z+=.04;
  Object.assign(entrySill.userData,{r48EntrySafetyFit:'MODEL_ACCESS_SAFETY_FIT_NOT_HISTORIC_OBJECT',originalDepth:.30,fittedDepth:.22,frontRetreat:.08});
  const capFront=-item.d/2-item.pad-.06,entryToe=capFront-.09,entryTop=item.ph+.01;
  box('wenyuan-access-safety-entry-tread',kit.lib.material('stone_slab'),entryWidth,entryTop,.09,entryAxis,entryTop/2,capFront-.045,false,{source:null,status:'MODEL_ACCESS_SAFETY_FIT_NOT_HISTORIC_OBJECT',originalSillWidthHeightRearRetained:true});
  kit.walkBox(f,entryAxis-entryWidth/2,entryToe,entryAxis+entryWidth/2,capFront+.06,entryTop);
  kit.walkables.at(-1).rescue=false;
  const accessSafetyEntryStep={status:'MODEL_ACCESS_SAFETY_FIT_NOT_HISTORIC_OBJECT',source:null,extension:.09,top:entryTop,x0:entryAxis-entryWidth/2,x1:entryAxis+entryWidth/2,z0:entryToe,z1:capFront,retainedCapSupportEnd:capFront+.06,originalPlatform:'RETAINED_UNMODIFIED',sillFit:{oldDepth:.30,newDepth:.22,frontRetreat:.08,widthHeightRear:'RETAINED_UNMODIFIED'},bodyRadiusClearance:.08};
  const middleBounds={x0:-19.82,x1:19.82,z0:-8.55,z1:8.55},upperBounds={x0:-19.08,x1:19.08,z0:-7.64,z1:7.64};
  // Six bays have a shifted main-bay axis. The three-bay void is centered on
  // that axis (-w/12), not on an invented seventh bay or the exterior origin.
  const void0={x0:-13.5,x1:6.75,z0:-5.7,z1:5.7},first={id:'ground-to-dark-mezzanine',x:16.05,width:2,z0:-5.8,z1:0},second={id:'dark-mezzanine-to-third-floor',x:18.12,width:1.7,z0:0,z1:-5.7};
  const middleStairHole={x0:first.x-first.width/2-.08,x1:first.x+first.width/2+.08,z0:first.z0-.05,z1:first.z1};
  const upperStairHole={x0:second.x-second.width/2-.08,x1:upperBounds.x1,z0:second.z1,z1:second.z0+.05};
  floorWithVoids(c,middleBounds,midY,[void0,middleStairHole],'wenyuan-dark-mezzanine-floor');
  floorWithVoids(c,upperBounds,upperY,[upperStairHole],'wenyuan-third-floor');
  fittedLevelFlight(c,first,g.y,midY);fittedLevelFlight(c,second,midY,upperY);
  for(const z of[void0.z0,void0.z1])rail(c,'wenyuan-mezzanine-void-rail',void0.x0,void0.x1,z,z,midY,{source:p.source});
  for(const x of[void0.x0,void0.x1])rail(c,'wenyuan-mezzanine-void-rail',x,x,void0.z0,void0.z1,midY,{source:p.source});
  // Guard the open long edges, but leave both actual stair landings open.
  for(const x of[middleStairHole.x0,middleStairHole.x1])rail(c,'wenyuan-first-floor-hole-rail',x,x,middleStairHole.z0,middleStairHole.z1,midY);
  rail(c,'wenyuan-first-floor-hole-rail',middleStairHole.x0,middleStairHole.x1,middleStairHole.z0,middleStairHole.z0,midY);
  rail(c,'wenyuan-third-floor-hole-rail',upperStairHole.x0,upperStairHole.x0,upperStairHole.z0,upperStairHole.z1,upperY);
  rail(c,'wenyuan-third-floor-hole-rail',upperStairHole.x0,upperStairHole.x1,upperStairHole.z1,upperStairHole.z1,upperY);
  // Existing exterior columns support perimeter plates. These interior posts
  // and cross beams support the new real floor edges; positions are fits.
  for(const x of[-13.5,-6.75,0,6.75,13.5])for(const z of[-5.7,5.7]){
    const post=c.column(x,z,g.y,upperY-g.y-.16,'wenyuan-fitted-inner-floor-post',.2);post.material=c.m.timber;
  }
  for(const z of[-5.7,5.7])box('wenyuan-third-floor-bearing-beam','timber',38.16,.24,.32,0,upperY-.18,z,false);
  for(const x of[-13.5,6.75])box('wenyuan-mezzanine-edge-bearing-beam','timber',.28,.24,17.1,x,midY-.18,0,false);
  for(const z of[-5.7,5.7])box('wenyuan-mezzanine-edge-bearing-beam','timber',39.64,.24,.28,0,midY-.18,z,false);
  // Ground-floor photo: lower geometric wooden screens, a partial seat/screen
  // and front desk. No upper-floor bed is transplanted to this floor.
  const axis=-item.w/12,screenZ=4.7;
  for(let k=0;k<=6;k++)box('wenyuan-ground-photo-screen-post','timber',.085,2.38,.10,axis-3.45+k*1.15,g.y+1.19,screenZ,true,{source:source1,level:1});
  for(let k=0;k<=4;k++)box('wenyuan-ground-photo-screen-rail','timber',6.9,.07,.10,axis,g.y+.18+k*.52,screenZ,true,{source:source1,level:1});
  box('wenyuan-ground-photo-seat-base','timber',2.15,.44,1.25,axis,g.y+.22,3.65,true,{source:source1,level:1,artwork:'CARVING_AND_FAN_ART_UNMODELED'});
  box('wenyuan-ground-photo-seat-back','timber',2.15,1.2,.12,axis,g.y+1.0,4.2,true,{source:source1,level:1});
  box('wenyuan-ground-photo-desk-top','timber',3.5,.12,.85,axis,g.y+.94,1.85,true,{source:source1,level:1});
  for(const dx of[-1.55,1.55])for(const dz of[-.29,.29])box('wenyuan-ground-photo-desk-leg','timber',.12,.88,.12,axis+dx,g.y+.44,1.85+dz,true,{source:source1,level:1});
  for(const x of[-15.8,-8.0,-.2,7.6])emptyCabinetRun(c,{x,z:7.95,width:6.7,height:2.2,y:g.y,source:source1,level:1,sections:5});
  // The dark mezzanine's shelves are textual historical topology, NOT a
  // claimed surviving inventory of 33 individually located cases.
  for(const x of[-15.5,-8,-.5,7])emptyCabinetRun(c,{x,z:7.96,width:6.2,height:1.85,y:midY,source:p.source,level:2,sections:4});
  // Third-floor picture is bound exclusively to level 3. The other five bays
  // remain connected around the fitted case runs; western stair bay is clear.
  for(const x of[-15.6,-9.2,-2.8,3.6,10])for(const z of[-5.7,5.7])emptyCabinetRun(c,{x,z,width:4.9,height:2.45,y:upperY,source:source3,level:3,sections:4});
  const bedInfo={source:source3,level:3,photographyDate:null,artwork:'CARVED_RELIEFS_AND_TEXTILES_UNMODELED',positionStatus:FIT};
  box('wenyuan-third-floor-photo-bed-base','timber',2.3,.5,1.6,axis,upperY+.25,2.5,true,bedInfo);
  box('wenyuan-third-floor-photo-bed-back','timber',2.3,1.2,.12,axis,upperY+1.1,3.24,true,bedInfo);
  for(const x of[axis-1.1,axis+1.1])box('wenyuan-third-floor-photo-bed-side','timber',.1,.5,1.5,x,upperY+.75,2.5,true,bedInfo);
  buildWenyuanUpperFrame(c,{axis,upperY,source:source3});
  // Only source-identified visual regions are added now. Automatic upper
  // destinations remain withheld until the real controller replay is accepted.
  const world=(x,z,yy)=>{const v=f.localToWorld(new THREE.Vector3(x,yy,z));return{x:v.x,y:v.y,z:v.z};};
  const inheritedFacadeProxies=[];
  for(const n of f.children)if(n.isMesh&&!n.userData.remainingOuterId&&['wall_red','wall_brick','caihua_beam','lattice_doors','wenyuan_sourced_green_wood_columns'].includes(materialKey(kit,n.material))){
    if(visibleComponentProxy(kit,f,n,{headMargin:materialKey(kit,n.material)==='caihua_beam'?.05:0,skipAtOrBelow:g.y+PLAYER.STEP_UP}))inheritedFacadeProxies.push({material:materialKey(kit,n.material),position:n.position.toArray()});
  }
  const stairs=[{...first,y0:g.y,y1:midY},{...second,y0:midY,y1:upperY}];
  const route=[world(first.x,-6.6,g.y),world(first.x,first.z0,g.y),world(first.x,first.z1,midY),world(first.x,.85,midY),world(second.x,.85,midY),world(second.x,second.z0,midY),world(second.x,second.z1,upperY),world(second.x,-6.55,upperY),world(13.1,-6.55,upperY),world(13.1,-3.4,upperY)];
  return finishAugment(kit,item,built,p,{exteriorChanged:true,interiorChanged:true,interiorPolicy:'THREE_REAL_LEVELS_SOURCE_TOPOLOGY_AND_LEVEL_BOUND_PHOTO_FITS__NO_CURRENT_BOOK_INVENTORY',internalLevels:[{level:1,floorY:g.y,photo:source1},{level:2,floorY:midY,photo:null,source:p.source,void:void0},{level:3,floorY:upperY,photo:source3}],stairs,navigation:{...old.navigation,interiorStairRoutes:[{id:'wenyuan-west-end-three-level-flight',runtimeReady:false,points:route}],upperDestinations:'WITHHELD_PENDING_REAL_CONTROLLER_ACCEPTANCE'},floorBounds:{middle:middleBounds,upper:upperBounds},floorVoids:{middle:[void0,middleStairHole],upper:[upperStairHole]},photoBindings:{ground:source1,third:source3,photographyDates:null},exteriorDetail:{greenColumns:recoloredColumns,grayBrickGables:recoloredGables},removedLegacyCeilings,inheritedFacadeProxies,accessSafetyEntryStep,accessSafetyGuards:g.accessSafetyGuards,historicalInventory:{groundJing:22,middleShi:33,thirdZi:22,thirdJi:28,status:'HISTORICAL_TEXT_COUNTS_NOT_MODELED_CURRENT_CASE_OR_BOOK_INVENTORY'},limitations:[...old.limitations.filter(s=>!s.includes('not fabricated')), 'Interior floor/stair metrics and case positions are reversible fits, not a survey','No third-floor image is used as ground-floor evidence','Upper automatic destinations remain withheld until controller replay acceptance']});
}

function augmentYudeInterior(kit,item,built,p) {
  const original=built.g??built.f.userData.structure,b=original.bath,y=original.front.ph;
  const g={key:p.key,w:b.w,d:b.d,y,h:b.h,front:-b.d/2,rear:b.d/2};
  const c=context(kit,item,p,built,g),{f,box,m}=c,discard=new Set();
  // Only the square bath's two solid masses are replaced. The existing full
  // bath collider, bent passage and public front-room navigation stay closed.
  for(const n of [...f.children])if(n.name==='yude-square-bath'||n.name==='yude-grey-masonry-plinth'&&Math.abs(n.position.x-b.x)<1e-8&&Math.abs(n.position.z-b.z)<1e-8){n.traverse(q=>q.geometry&&discard.add(q.geometry));n.removeFromParent();}
  for(const geo of discard)geo.dispose();
  const outer=b.w/2,t=.3,inner=outer-t,top=y+b.h,doorHalf=.78,spring=1.58,apex=2.34;
  const source='https://img.dpm.org.cn/Uploads/Picture/dc/7415.jpg';
  const info={source,photographyDate:null,period:'UNDATED_OFFICIAL_BATH_INTERIOR_PHOTO',access:'REAR_ACCESS_REMAINS_CLOSED',dimensionStatus:FIT};
  for(const side of[-1,1]){
    box('yude-replaced-bath-side-shell',kit.lib.material('wall_red'),t,b.h,b.d,b.x+side*(outer-t/2),y+b.h/2,b.z,false,info);
    box('yude-white-glazed-inner-wall','white_glaze',.025,b.h,b.d-2*t,b.x+side*(inner-.0125),y+b.h/2,b.z,false,info);
    box('yude-replaced-bath-side-plinth',kit.lib.material('wall_brick'),t,y+.45,b.d,b.x+side*(outer-t/2),(y+.45)/2,b.z,false,info);
  }
  box('yude-replaced-bath-rear-shell',kit.lib.material('wall_red'),b.w-2*t,b.h,t,b.x,y+b.h/2,b.z+outer-t/2,false,info);
  box('yude-white-glazed-inner-wall','white_glaze',b.w-2*t,b.h,.025,b.x,y+b.h/2,b.z+inner-.0125,false,info);
  box('yude-replaced-bath-rear-plinth',kit.lib.material('wall_brick'),b.w-2*t,y+.45,t,b.x,(y+.45)/2,b.z+outer-t/2,false,info);
  const arch=new THREE.Shape();arch.moveTo(-inner,0);arch.lineTo(-doorHalf,0);arch.lineTo(-doorHalf,spring);arch.quadraticCurveTo(-doorHalf*.7,apex*.94,0,apex);arch.quadraticCurveTo(doorHalf*.7,apex*.94,doorHalf,spring);arch.lineTo(doorHalf,0);arch.lineTo(inner,0);arch.lineTo(inner,b.h);arch.lineTo(-inner,b.h);arch.closePath();
  mark(kit.mesh(f,new THREE.ExtrudeGeometry(arch,{depth:t,bevelEnabled:false,curveSegments:18}),kit.lib.material('wall_red'),b.x,y,b.z-outer),p,'yude-pointed-door-shell',info);
  mark(kit.mesh(f,new THREE.ShapeGeometry(arch,18),m.white_glaze,b.x,y,b.z-inner+.002),p,'yude-white-glazed-pointed-door',info);
  // The old solid plinth also filled the room. A true dark floor now lies
  // beneath the shell, without opening this unverified visitor destination.
  box('yude-dark-bath-floor','dark',b.w-2*t,.12,b.d-2*t,b.x,y-.06,b.z,false,info);
  // Brick courses are real recessed-color joints, not invented decorative art.
  // Their size is a photo-constrained fit; exact brick counts are not claimed.
  for(let h=.16;h<b.h-.12;h+=.16){
    for(const side of[-1,1])box('yude-inner-brick-course','stone',.006,.009,inner*2-.05,b.x+side*(inner-.027),y+h,b.z,false,info);
    box('yude-inner-brick-course','stone',inner*2-.05,.009,.006,b.x,y+h,b.z+inner-.027,false,info);
    for(let x=-inner+.12;x<inner-.08;x+=.32){const xx=x+(Math.round(h/.16)%2)*.16;if(xx>inner-.04)continue;box('yude-inner-brick-joint','stone',.009,.151,.006,b.x+xx,y+h-.08,b.z+inner-.028,false,info);}
  }
  // Build a separate, correctly wound interior cap. Its center remains open:
  // no solid disk or inverted/Doubleside skin masks the lantern aperture.
  const R=b.domeRadius,H=b.domeRise,sphereR=(R*R+H*H)/(2*H),center=H-sphereR;
  const opening=b.lanternWidth*.42,wallRing=inner+.025,innerSphere=sphereR-.12;
  const skin=sheet(c,'yude-white-glazed-inner-dome','white_glaze',18,64,(u,v)=>{const r=opening+(wallRing-opening)*u,a=v*Math.PI*2;return[b.x+r*Math.cos(a),top+center+Math.sqrt(innerSphere*innerSphere-r*r),b.z+r*Math.sin(a)];});
  const ix=skin.geometry.index.array;for(let k=0;k<ix.length;k+=3)[ix[k+1],ix[k+2]]=[ix[k+2],ix[k+1]];skin.geometry.index.needsUpdate=true;skin.geometry.computeVertexNormals();Object.assign(skin.userData,info);
  const ringY=top+center+Math.sqrt(innerSphere*innerSphere-wallRing*wallRing);
  // Removing the old solid bath body must not remove its four roof corners.
  // This solid annular square cap retains the old outer datum, bears on the
  // replacement walls and reaches the inner dome edge. Its circular opening
  // is real, and the outer cap meets the retained exterior dome at r=R.
  const capPositions=[],capIndices=[],Ncap=128;
  const capQuad=(a,b,c0,d0,desired)=>{const start=capPositions.length/3;for(const v of[a,b,c0,d0])capPositions.push(...v);for(const tri of[[0,1,2],[0,2,3]]){const u=new THREE.Vector3(...[a,b,c0,d0][tri[0]]),v=new THREE.Vector3(...[a,b,c0,d0][tri[1]]),w=new THREE.Vector3(...[a,b,c0,d0][tri[2]]);if(v.sub(u).cross(w.sub(u)).dot(desired)<0)tri.reverse();capIndices.push(...tri.map(k=>start+k));}};
  for(let k=0;k<Ncap;k++){
    const a=k*Math.PI*2/Ncap,aa=(k+1)*Math.PI*2/Ncap,point=(angle,r,yy)=>[r*Math.cos(angle),yy,r*Math.sin(angle)],rr=outer/Math.max(Math.abs(Math.cos(a)),Math.abs(Math.sin(a))),r1=outer/Math.max(Math.abs(Math.cos(aa)),Math.abs(Math.sin(aa)));
    const it=point(a,wallRing,0),jt=point(aa,wallRing,0),ot=point(a,rr,0),pt=point(aa,r1,0),ib=point(a,wallRing,-.16),jb=point(aa,wallRing,-.16),ob=point(a,rr,-.16),pb=point(aa,r1,-.16),radial=new THREE.Vector3(Math.cos((a+aa)/2),0,Math.sin((a+aa)/2));
    capQuad(it,ot,pt,jt,new THREE.Vector3(0,1,0));capQuad(ib,ob,pb,jb,new THREE.Vector3(0,-1,0));capQuad(ot,ob,pb,pt,radial);capQuad(it,ib,jb,jt,radial.clone().negate());
  }
  const capGeo=new THREE.BufferGeometry();capGeo.setAttribute('position',new THREE.Float32BufferAttribute(capPositions,3));capGeo.setIndex(capIndices);capGeo.computeVertexNormals();
  const outerDome=f.children.find(n=>n.name==='yude-bath-dome');
  mark(kit.mesh(f,capGeo,outerDome?.material??m.grey_tile,b.x,top,b.z),p,'yude-solid-square-to-round-roof-cap',{...info,exteriorRepair:'RETAINED_SQUARE_ROOF_CORNERS_RESTORED_AFTER_SOLID_BODY_REMOVAL',thickness:.16,innerRadius:wallRing,outerHalf:outer});
  // Curved corner squinches connect square wall corners to the circular dome
  // bearing. Their tessellation and lower spring are fitted to the photo.
  for(const sx of[-1,1])for(const sz of[-1,1]){
    const positions=[],indices=[],N=20;
    positions.push(b.x+sx*inner,y+b.h-.95,b.z+sz*inner);
    for(let k=0;k<=N;k++){const a=k/N*Math.PI/2;positions.push(b.x+sx*wallRing*Math.cos(a),ringY,b.z+sz*wallRing*Math.sin(a));}
    for(let k=0;k<N;k++){let ids=[0,k+1,k+2];const va=new THREE.Vector3().fromArray(positions,ids[0]*3),vb=new THREE.Vector3().fromArray(positions,ids[1]*3),vc=new THREE.Vector3().fromArray(positions,ids[2]*3),normal=vb.clone().sub(va).cross(vc.clone().sub(va)),mid=va.clone().add(vb).add(vc).multiplyScalar(1/3),toInside=new THREE.Vector3(b.x,top-1,b.z).sub(mid);if(normal.dot(toInside)<0)ids.reverse();indices.push(...ids);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();mark(kit.mesh(f,geo,m.white_glaze,0,0,0),p,'yude-square-to-round-squinch',info);
  }
  const sleeve=new THREE.CylinderGeometry(opening,opening,.26,48,1,true);const ids=sleeve.index.array;for(let k=0;k<ids.length;k+=3)[ids[k+1],ids[k+2]]=[ids[k+2],ids[k+1]];sleeve.computeVertexNormals();mark(kit.mesh(f,sleeve,m.white_glaze,b.x,top+H-.11,b.z),p,'yude-open-oculus-inner-rim',info);
  const lantern=f.children.find(n=>n.name==='yude-bath-lantern'),oldSill=lantern?.children.find(n=>n.name==='yude-lantern-sill');
  if(oldSill){const rr=b.lanternWidth/2+.1,ring=new THREE.Shape();ring.absarc(0,0,rr,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,opening,0,Math.PI*2,true);ring.holes.push(hole);const geo=new THREE.ExtrudeGeometry(ring,{depth:.12,bevelEnabled:false,curveSegments:48});geo.rotateX(-Math.PI/2);geo.translate(0,-.06,0);oldSill.geometry.dispose();oldSill.geometry=geo;Object.assign(oldSill.userData,{...info,role:'yude-open-lantern-sill-ring'});}
  applyYudeDomeBrickCourses(kit,built.f);
  return finishAugment(kit,item,built,p,{exteriorChanged:false,interiorChanged:true,bathInterior:{source,photographyDate:null,actualGeometry:['white-glazed brick inner wall shell','dark floor','pointed arch opening','four square-to-round squinches','solid square-to-round outer roof cap','inward FrontSide dome with open oculus'],door:{width:2*doorHalf,spring,apex},floorY:y,upperShellThickness:.12,access:'CLOSED_REAR_NO_NEW_SPAWN_OR_WALKABLE',furnishings:'UNMODELED_NO_INVENTED_BATH_EQUIPMENT'},actualChanges:['Replaced only the bath solid red mass and room-filling plinth with a layered hollow shell; retained exterior datum and original closed collision/navigation']});
}
const CERAMICS_2021='https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/';
function augmentCeramicsGallery(kit,item,built,p) {
  const old=built.g,display=built.display??built.f.userData.structure.display;
  const accessProxies=retainOpenedLeafAndPostProxies(kit,built.f);
  const c=context(kit,item,p,built,{key:p.key,w:item.w,d:item.d,y:item.ph,h:item.colH}),{f,box}=c;
  const scene=p.key==='wuying'?'d111':'60',photo=CERAMICS_2021+`panos/${scene}.tiles/u/l1/01/l1_u_01_01.jpg`,design='https://www.dpm.org.cn/Uploads/File/2020/12/29/u5feade223dddd.pdf';
  const info={source:photo,photographyDate:null,period:'2021_OPENING_PANORAMA_NOT_CURRENT_OBJECT_INVENTORY',dimensionStatus:FIT};
  const material=(name,color)=>{const m=new THREE.MeshStandardMaterial({name:p.key+'_'+name,color,roughness:.85});kit.owned.push(m);return m;};
  const green=material('photo_green_coffer_field',0x476147),blue=material('photo_blue_beam',0x293e63),gold=material('photo_gold_outline_not_dragon_art',0xac945b),dark=material('modern_equipment_dark',0x302a29),stone=material('photo_white_terrace_stone',0xd1cec0);
  const ceilings=f.children.filter(n=>n.isMesh&&n.geometry.type==='PlaneGeometry'&&materialKey(kit,n.material)==='caihua_beam'&&n.geometry.parameters.width===item.w&&n.geometry.parameters.height===item.d&&n.position.x===0&&n.position.z===0&&n.position.y>item.ph+item.colH-1&&n.position.y<item.ph+item.colH);
  if(ceilings.length!==1)throw Error('R48 ceramics requires the single retained unframed ceiling plane with exact original dimensions and datum');
  const ceiling=ceilings[0];
  ceiling.material=green;Object.assign(ceiling.userData,{...info,role:p.key+'-retained-ceiling-green-field',artwork:'EXACT_DRAGON_PAINTING_UNMODELED'});
  const yy=ceiling.position.y,nx=20,nz=p.key==='wuying'?12:8,dx=item.w/nx,dz=item.d/nz;
  // Both halls have their own independently located upward photograph.
  // Grid metrics are fits; the photo's dragon paintings are not fabricated.
  for(let k=0;k<=nx;k++)box(p.key+'-coffer-frame','timber',.07,.10,item.d,-item.w/2+k*dx,yy-.05,0,false,info);
  for(let k=0;k<=nz;k++)box(p.key+'-coffer-frame','timber',item.w,.10,.07,0,yy-.05,-item.d/2+k*dz,false,info);
  for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){
    const x=-item.w/2+(ix+.5)*dx,z=-item.d/2+(iz+.5)*dz,r=Math.min(dx,dz)*.22;
    const disc=mark(kit.mesh(f,new THREE.CircleGeometry(r,16),blue,x,yy-.006,z),p,p.key+'-coffer-round-motif-outline',{...info,artwork:'PLAIN_ROUND_FIELD_ONLY_EXACT_PAINTING_UNMODELED'});disc.rotation.x=Math.PI/2;
    const rim=mark(kit.mesh(f,new THREE.TorusGeometry(r,.015,6,20),gold,x,yy-.018,z),p,p.key+'-coffer-round-outline',info);rim.rotation.x=Math.PI/2;
  }
  for(let k=1;k<item.bays;k++)box(p.key+'-photo-ceiling-cross-beam',blue,.28,.4,item.d,-item.w/2+k*item.w/item.bays,yy+.1,0,false,info);
  let vents=0,lamps=0;
  for(const cs of display.cases){
    const alongZ=cs.axis==='z',cx=(cs.x0+cs.x1)/2,cz=(cs.z0+cs.z1)/2,run=alongZ?cs.z1-cs.z0:cs.x1-cs.x0,n=Math.max(1,Math.floor(run/3)),face=alongZ?cx-Math.sign(cx)*(cs.x1-cs.x0)/2:cz-Math.sign(cz)*(cs.z1-cs.z0)/2;
    const eq={...info,source:design,photo,caseIdentity:cs.identity,representation:'DOCUMENTED_2020_EQUIPMENT_TOPOLOGY__POSITIONS_COUNTS_FITTED'};
    for(let k=0;k<n;k++){
      const a=(alongZ?cs.z0:cs.x0)+(k+.5)*run/n,x=alongZ?face:a,z=alongZ?a:face,L=Math.min(1.4,run/n-.25);
      for(const h of[.27,cs.caseH-.12]){
        const grate=box(p.key+'-case-equipment-grille',dark,alongZ?.026:L,.16,alongZ?L:.026,x,item.ph+h,z,false,{...eq,airflow:h<1?'LOW_SUPPLY':'HIGH_RETURN'});
        for(let j=0;j<4;j++)box(p.key+'-case-grille-slat','timber',alongZ?.032:L,.012,alongZ?L:.032,x,item.ph+h-.06+j*.04,z,false,eq);vents++;
      }
      const lx=alongZ?cx:a,lz=alongZ?a:cz,baseY=item.ph+cs.caseH;
      box(p.key+'-case-uplight-base',dark,.17,.035,.17,lx,baseY+.0175,lz,false,eq);
      box(p.key+'-case-uplight-stem',dark,.045,.12,.045,lx,baseY+.09,lz,false,eq);
      const lamp=box(p.key+'-case-uplight-head',dark,.14,.11,.2,lx,baseY+.18,lz,false,{...eq,lighting:'STATIC_EQUIPMENT_NO_NEW_LIGHT_OR_SHADER'});lamp.rotation.y=alongZ?(cx<0?-Math.PI/2:Math.PI/2):(cz<0?Math.PI:0);lamp.rotation.x=.55;lamps++;
    }
  }
  const terrace=[];
  if(p.key==='wuying'){
    const source='https://www.dpm.org.cn/Uploads/File/2020/12/29/u5feadc156cca2.pdf',edge=item.w/2+item.pad-.14,front=-item.d/2-item.pad+.14;
    const stoneRail=(x0,x1,z0,z1)=>{const L=Math.hypot(x1-x0,z1-z0),alongX=x0!==x1,n=Math.ceil(L/1.4),data={source,page:28,photographyDate:null,dimensionStatus:FIT,extent:'PARTIAL_RETAINED_PLATFORM_EDGE_NOT_COMPLETE_MOON_TERRACE'};
      box('wuying-photo-white-stone-rail-base',stone,alongX?L:.18,.14,alongX?.18:L,(x0+x1)/2,item.ph+.07,(z0+z1)/2,true,data);
      box('wuying-photo-white-stone-rail-panel',stone,alongX?L:.12,.47,alongX?.12:L,(x0+x1)/2,item.ph+.48,(z0+z1)/2,true,data);
      box('wuying-photo-white-stone-rail-top',stone,alongX?L:.19,.13,alongX?.19:L,(x0+x1)/2,item.ph+.78,(z0+z1)/2,true,data);
      for(let k=0;k<=n;k++)box('wuying-photo-white-stone-rail-post',stone,.20,1.03,.20,x0+(x1-x0)*k/n,item.ph+.515,z0+(z1-z0)*k/n,true,data);terrace.push({x0,x1,z0,z1});};
    // Preserve the R48 west-gable middle exactly. Its photographed south
    // return and moon terrace are added by the Wuying-specific module below,
    // not by extending this straight rail across the stairs or hall front.
    stoneRail(edge,edge,-item.d/2+.4,item.d/2-.4);
  }
  const moonTerrace=p.key==='wuying'?buildWuyingMoonTerrace(kit,item,f,stone):null;
  return finishAugment(kit,item,built,p,{display,accessProxies,...(moonTerrace?{moonTerrace,navigation:moonTerrace.navigation}:{}),exteriorChanged:terrace.length>0,interiorChanged:true,sourceCeiling:{photo,scene,photographyDate:null,grid:{nx,nz,status:'FITTED_REPEAT_COUNTS_NOT_PHOTO_MEASUREMENT'},artwork:'DRAGON_PAINTINGS_UNMODELED_ONLY_FRAME_AND_ROUND_FIELD_CONTOURS'},modernEquipment:{design,vents,lamps,period:'2020_DESIGN_AND_2021_PANORAMA_NOT_CURRENT_INVENTORY',newRuntimeLights:0},terraceRailSegments:terrace,retainedDedicatedLayout:moonTerrace?'ALL_EXISTING_CASES_OBJECTS_ROOF_FLOOR_ROOMS_AND_DOORS_RETAINED':'ALL_EXISTING_CASES_OBJECTS_ROOF_FLOOR_ROOMS_AND_ENTRIES_RETAINED',wholeBuildingComplete:false});
}

function augmentBaoyunFacade(kit,item,built,p) {
  const g=built.g,c=context(kit,item,p,built,{key:p.key,w:item.w,d:item.d,y:0,h:g.eaves}),{f,box}=c;
  const source='https://img.dpm.org.cn/Uploads/image/2024/12/30/1-yrWtXOlSB260.jpg',info={source,photographyDate:null,eventDate:'2024-12-27',publicationDate:'2024-12-30',dimensionStatus:FIT,scope:'MAIN_FRONT_FACADE_ONLY_NOT_CURRENT_INTERIOR'};
  const materials={};f.traverse(n=>{if(n.isMesh&&n.material?.name)materials[n.material.name]=n.material});
  const pale=materials.baoyun_pale_stone,joint=materials.baoyun_plaster_courses,green=materials.baoyun_green_gutter;
  // Only the visible north-main front receives the observed rectangular
  // plaster joints. Hidden backs and wing interiors are not copied from it.
  const main=g.blocks.find(b=>b.id==='north-main');let joints=0;
  for(let row=0,yy=g.bodyBase+.325;yy<g.eaves-.15;row++,yy+=.65)for(let x=-main.w/2+.45+(row%2)*.825;x<main.w/2-.2;x+=1.65){box('baoyun-main-front-vertical-plaster-joint',joint,.027,.615,.012,x,yy,main.z-main.d/2-.027,false,info);joints++;}
  const roof=f.children.find(n=>n.name==='baoyun-flat-porch-roof');roof.geometry.computeBoundingBox();const roofTop=roof.position.y+roof.geometry.boundingBox.max.y,front=roof.position.z+roof.geometry.boundingBox.min.z;
  box('baoyun-photo-porch-frieze',pale,6.85,.65,.20,0,roofTop+.325,front+.04,false,info);
  for(const x of[-3.325,3.325])box('baoyun-photo-porch-frieze-return',pale,.20,.65,3.95,x,roofTop+.325,roof.position.z+.04,false,info);
  box('baoyun-photo-porch-stepped-cornice',pale,7.1,.14,4.2,0,roofTop+.72,roof.position.z,false,info);
  for(let k=-3;k<=3;k++){
    const disk=mark(kit.mesh(f,new THREE.CylinderGeometry(.135,.135,.028,20),pale,k*.77,roofTop+.325,front-.073),p,'baoyun-photo-seven-frieze-roundels',{...info,carving:'ROUND_CONTOUR_ONLY_ORNAMENT_UNMODELED'});disk.rotation.x=Math.PI/2;
    const rim=mark(kit.mesh(f,new THREE.TorusGeometry(.145,.018,6,24),pale,k*.77,roofTop+.325,front-.09),p,'baoyun-photo-roundel-rim',info);
  }
  const panel=f.children.find(n=>n.name==='baoyun-central-inscription-panel-untextured');
  // Own 2024 photograph: pale stone inscription field inside a green border.
  // Keep the existing stone and green frame; add only the attested Han text.
  // System lettering is not a reproduction of the photographed stone carving.
  Object.assign(panel.userData,{...info,representation:'RETAINED_PALE_STONE_FIELD_WITH_GREEN_FRAME__SYSTEM_FONT_CHARACTERS_CARVING_UNMODELED'});
  for(const x of[-.37,.37])box('baoyun-photo-green-inscription-frame',green,.06,1.54,.025,x,11.08,7.7125,false,info);
  for(const y of[10.34,11.82])box('baoyun-photo-green-inscription-frame',green,.68,.06,.025,0,y,7.7125,false,info);
  const nameInscription=buildBaoyunNameInscription(kit,f,panel,source);
  return finishAugment(kit,item,built,p,{exteriorChanged:true,interiorChanged:false,facadeDetail:{source,photographyDate:null,eventDate:'2024-12-27',verticalJoints:joints,roundels:7,nameInscription,scope:'VISIBLE_MAIN_FRONT_AND_PORCH_ONLY'},currentInteriorStatus:'EVIDENCE_BLOCKED__MODEL_ACCESS_CLOSED_NOT_CLAIM_ABOUT_CURRENT_USE',wholeBuildingComplete:false});
}

const HEYI_2022='https://ggzlquanjing.dpm.org.cn/scene/wPIRwsKstn5bVoDoqCG426Sfykpnc2hK/20220207_hyzg/';
function augmentWenhuaCompanionFacade(kit,item,built,p) {
  const c=context(kit,item,p,built,{w:item.w,d:item.d,y:item.ph,h:item.colH,key:p.key}),{f,box}=c;
  const front=-item.d/2,bay=item.w/item.bays,r=THREE.MathUtils.clamp(bay*.07,.2,.34),H=item.colH-THREE.MathUtils.clamp(item.colH*.12,.45,.85);
  const photo=HEYI_2022+`panos/1.tiles/${p.key==='jiyi'?'l':'r'}/l2/01/l2_${p.key==='jiyi'?'l':'r'}_01_01.jpg`;
  const info={source:photo,photographyDate:null,period:'2022_HEYI_CHINA_COURTYARD_PANORAMA_NOT_CURRENT_INVENTORY',facadeScope:'OWN_COURTYARD_FRONT_ONLY',bayCountStatus:p.key==='jiyi'?'FIVE_GROUPS_VISIBLE_IN_OWN_PANORAMA':'FIVE_RETAINED_BAYS_ARE_ENVELOPE_FIT_OBSCURED_IN_OWN_PHOTO',ornament:'SIMPLIFIED_DIAMOND_LATTICE_NOT_EXACT_FLORAL_CARVING'};
  let removed=0;
  for(const n of [...f.children])if(n.isMesh&&((materialKey(kit,n.material)==='lattice_doors'&&n.position.z<0)||(materialKey(kit,n.material)==='wall_red'&&n.position.x===0&&n.position.z===front&&Math.abs(n.position.y-(item.ph+H*.9))<1e-8))){n.removeFromParent();n.geometry.dispose();removed++;}
  const begin=f.children.length,windowGroups=[];
  const diagonal=(x0,y0,x1,y1)=>{const line=box(p.key+'-photo-diamond-lattice','red',Math.hypot(x1-x0,y1-y0),.035,.045,(x0+x1)/2,(y0+y1)/2,front-.07,false,info);line.rotation.z=Math.atan2(y1-y0,x1-x0);};
  for(let i=0;i<item.bays;i++){
    const cx=-item.w/2+(i+.5)*bay,x0=cx-bay/2+r,x1=cx+bay/2-r;
    if(i===Math.floor(item.bays/2)){c.face(x0,x1,front,item.ph,H,{door:true,opened:true,leafCount:4,role:p.key+'-photo-central-door'});continue;}
    const sill=1.02,top=item.ph+H-.3,leafW=(x1-x0)/4,lo=item.ph+sill;
    box(p.key+'-photo-stone-window-sill','stone',x1-x0,sill,.28,cx,item.ph+sill/2,front,true,info);
    box(p.key+'-photo-window-head','red',x1-x0,.3,.24,cx,top+.15,front,true,info);
    for(let k=0;k<4;k++){
      const left=x0+k*leafW,right=left+leafW,xx=(left+right)/2,height=top-lo;
      // The dark recess is a viewing fill, not a claim of paper/glass identity.
      box(p.key+'-photo-window-recess','dark',leafW-.07,height-.07,.018,xx,(lo+top)/2,front+.07,false,{...info,infill:'UNVERIFIED_DARK_VIEWING_FILL_NOT_MATERIAL_IDENTIFICATION'});
      for(const x of[left+.035,right-.035])box(p.key+'-photo-window-leaf-stile','red',.07,height,.12,x,(lo+top)/2,front,false,info);
      for(const y of[lo+.045,top-.045])box(p.key+'-photo-window-leaf-rail','red',leafW,.09,.12,xx,y,front,false,info);
      box(p.key+'-photo-window-lower-panel','red',leafW-.08,.25,.10,xx,lo+.165,front,false,info);
      const lx=left+.06,rx=right-.06,by=lo+.28,ty=top-.08,spacing=.38,slope=1.45;
      for(const sign of[-1,1])for(let intercept=by-slope*(rx-lx);intercept<=ty+slope*(rx-lx);intercept+=spacing){
        const pts=[];for(const x of[lx,rx]){const y=intercept+sign*slope*(x-lx);if(y>=by&&y<=ty)pts.push([x,y]);}for(const y of[by,ty]){const x=lx+(y-intercept)/(sign*slope);if(x>lx&&x<rx)pts.push([x,y]);}if(pts.length===2)diagonal(...pts[0],...pts[1]);
      }
    }
    windowGroups.push({bay:i,x0,x1,sillHeight:sill,leafCount:4,counts:'FITTED_LEAF_REPEAT_NOT_FULL_BENREN_VISIBILITY'});
  }
  for(const n of f.children.slice(begin))if(n.userData.remainingOuterId===p.id)Object.assign(n.userData,info);
  const accessProxies=retainOpenedLeafAndPostProxies(kit,f);
  return finishAugment(kit,item,built,p,{exteriorChanged:true,interiorChanged:false,photoFacade:{photo,period:info.period,photographyDate:null,windowGroups,removedGenericFrontMeshes:removed,centralDoorPose:'FOUR_FITTED_FOLDED_LEAVES_FOR_MODEL_ACCESS_NOT_PHOTOGRAPHED_OPEN_STATE',bayCountStatus:info.bayCountStatus},accessProxies,interiorStatus:'EVIDENCE_BLOCKED_NO_CURRENT_ROOM_LAYOUT_OR_FURNISHING_INVENTORY',wholeBuildingComplete:false});
}
function augmentZhujingPhotoDetails(kit,item,built,p) {
  const c=context(kit,item,p,built,{w:item.w,d:item.d,y:item.ph,h:item.colH,key:p.key}),{f,box}=c;
  const base='https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/',up=base+'panos/a075.tiles/u/l1/01/l1_u_01_01.jpg',front=base+'panos/a075.tiles/f/l1/01/l1_f_01_01.jpg';
  const info={source:up,photographyDate:null,period:'2026_FIRST_PERIOD_A075_NOT_UNVERIFIED_OCTOBER_SECOND_PERIOD',dimensionStatus:FIT,colourStatus:'DARK_EXPOSURE_DOES_NOT_ESTABLISH_EXACT_PAINT_PALETTE'};
  const ceilings=f.children.filter(n=>n.isMesh&&n.geometry.type==='PlaneGeometry'&&materialKey(kit,n.material)==='caihua_beam'&&n.geometry.parameters.width===item.w&&n.geometry.parameters.height===item.d&&n.position.x===0&&n.position.z===0&&n.position.y>item.ph+item.colH-1);
  if(ceilings.length!==1)throw Error('R48 Zhujing requires its single original-size ceiling');
  const yy=ceilings[0].position.y,nx=18,nz=9,dx=item.w/nx,dz=item.d/nz;
  for(let i=0;i<=nx;i++)box('zhujing-own-photo-coffer-frame','timber',.065,.09,item.d,-item.w/2+i*dx,yy-.045,0,false,info);
  for(let j=0;j<=nz;j++)box('zhujing-own-photo-coffer-frame','timber',item.w,.09,.065,0,yy-.045,-item.d/2+j*dz,false,info);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const ring=mark(kit.mesh(f,new THREE.TorusGeometry(Math.min(dx,dz)*.22,.012,6,16),c.m.timber,-item.w/2+(i+.5)*dx,yy-.014,-item.d/2+(j+.5)*dz),p,'zhujing-own-photo-round-field-outline',{...info,artwork:'ROUND_CONTOUR_ONLY_FIGURAL_AND_FLORAL_PAINTINGS_UNMODELED'});ring.rotation.x=Math.PI/2;}
  for(let i=1;i<item.bays;i++)box('zhujing-own-photo-ceiling-cross-beam','timber',.28,.4,item.d,-item.w/2+i*item.w/item.bays,yy+.1,0,false,info);
  const trackY=yy-.72;
  for(const z of[-item.d*.26,item.d*.26]){
    box('zhujing-modern-suspended-track','dark',item.w*.78,.045,.055,0,trackY,z,false,{...info,device:'MODERN_STATIC_TRACK_NOT_ANCIENT_TIMBER_NO_NEW_RUNTIME_LIGHT'});
    for(const x of[-item.w*.3,0,item.w*.3]){box('zhujing-modern-track-hanger','dark',.018,yy-trackY,.018,x,(yy+trackY)/2,z,false,info);box('zhujing-modern-short-light-bar','paper',.18,.035,.045,x,trackY-.035,z,false,{...info,device:'STATIC_EQUIPMENT_NO_EMISSIVE_SHADER_OR_LIGHT'});}
  }
  const labelX=-item.w*.31,labelZ=item.d/2-1.05,labelY=item.ph+3.65;
  box('zhujing-modern-blank-hanging-label','paper',.28,.85,.04,labelX,labelY,labelZ,false,{...info,source:front,text:'UNMODELED_NO_TRANSCRIBED_CAPTION',count:'ONE_VISIBLE_TYPE_SAMPLE_NOT_ALL_LABEL_INVENTORY'});
  box('zhujing-modern-label-hanger','dark',.012,trackY-labelY-.425,.012,labelX,(trackY+labelY+.425)/2,labelZ,false,{...info,source:front});
  // A small cross-track joins the label wire to the independently suspended rail.
  box('zhujing-modern-label-track-return','dark',.035,.04,labelZ-item.d*.26,labelX,trackY,(labelZ+item.d*.26)/2,false,info);
  // The retained circular display is not a door. Its front is only .223 m
  // beyond the inward generic leaf tips, so that old uncollided pose cannot
  // accommodate a real player. Keep the frame and both leaves, but reflect
  // only their unverified open pose outwards into the existing broad I-passage.
  const frontLeaves=f.children.filter(n=>n.isMesh&&materialKey(kit,n.material)==='lattice_doors'&&Math.abs(Math.sin(n.rotation.y))>.99&&n.position.z<0);
  if(frontLeaves.length!==2)throw Error('R48 Zhujing requires its two original front folded leaves');
  for(const leaf of frontLeaves){
    const oldPosition=leaf.position.toArray(),oldRotation=leaf.rotation.y;
    leaf.position.z=-item.d-leaf.position.z;leaf.rotation.y=-leaf.rotation.y;
    Object.assign(leaf.userData,{r48OpenPoseFit:'MODEL_ACCESS_SAFETY_FIT_NOT_HISTORIC_OBJECT',source:null,oldPosition,oldRotation,doorFrameAndGeometry:'RETAINED_UNMODIFIED'});
  }
  // The original rectangular display proxy ends .08/.085 m behind the
  // visible round rim / light tip. Preserve the display geometry and add only
  // each protruding component's actual thin bounds, never a room-sized block.
  const displayGroup=f.children.find(n=>n.userData.role==='wenhua-rear-circular-display');
  const rim=displayGroup?.children.find(n=>n.isMesh&&n.geometry.type==='TorusGeometry');
  const displayLight=f.children.find(n=>n.userData.role==='wenhua-rear-display-light');
  if(!rim||!displayLight)throw Error('R48 Zhujing requires the retained round-display rim and light');
  visibleComponentProxy(kit,f,rim);visibleComponentProxy(kit,f,displayLight);
  const circularDisplayProxies={count:2,geometry:'RETAINED_UNMODIFIED',status:'ACTUAL_VISIBLE_COMPONENT_THIN_BOUNDS',inheritedFrontProjection:{rim:.08,light:.085}};
  const accessProxies=retainOpenedLeafAndPostProxies(kit,f);
  return finishAugment(kit,item,built,p,{display:built.display??built.f.userData.structure.display,accessProxies,circularDisplayProxies,openDoorPose:{status:'MODEL_ACCESS_SAFETY_FIT_NOT_HISTORIC_OBJECT',source:null,changedFrontLeaves:2,retainedRearLeaves:2,circularDisplay:'RETAINED_UNMODIFIED'},exteriorChanged:false,interiorChanged:true,photoDetail:{up,front,photographyDate:null,period:info.period,cofferGrid:{nx,nz,status:'FITTED_REPEAT_COUNTS_NOT_MEASURED'},artwork:'UNMODELED_ROUND_FIELD_CONTOURS_ONLY',modernEquipment:'SUSPENDED_TRACK_AND_ONE_BLANK_LABEL_SAMPLE_NOT_COMPLETE_CURRENT_INVENTORY',runtimeLightsAdded:0},retainedDedicatedLayout:'ALL_EXISTING_CASES_OBJECTS_ROOF_FLOOR_AND_CEILING_FIELD_RETAINED',wholeBuildingComplete:false});
}
function augmentHengshouPlainGable(kit,item,built,p) {
  removeOldRoofs(built.f);
  const width=item.w+.7,depth=item.d+.5,roof=kit.roof(built.f,{type:'gable',width,depth,baseY:item.ph+item.colH,layers:1,brackets:false,hardGableEnd:true});
  // This new instance inherits four zero-area fan end triangles from the
  // generic gable constructor. Remove only those invalid index triples;
  // every nondegenerate vertex/normal/UV and all other halls are unchanged.
  let removedDegenerateTriangles=0;
  roof.traverse(n=>{if(!n.isMesh)return;const a=n.geometry.attributes.position,ix=n.geometry.index,indices=[],u=new THREE.Vector3(),v=new THREE.Vector3(),o=new THREE.Vector3();
    for(let i=0;i<(ix?.count??a.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k);o.fromBufferAttribute(a,ids[0]);u.fromBufferAttribute(a,ids[1]).sub(o);v.fromBufferAttribute(a,ids[2]).sub(o);if(u.cross(v).lengthSq()<1e-18){removedDegenerateTriangles++;continue;}indices.push(...ids);}
    if(indices.length!==(ix?.count??a.count))n.geometry.setIndex(indices);
  });
  roof.userData.remainingRoof='hengshou-plain-flush-gable';roof.userData.source='https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf';
  const photo='https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf';
  return finishAugment(kit,item,built,p,{exteriorChanged:true,interiorChanged:false,sourceRoof:{source:photo,pages:[133,136,137],type:'PLAIN_HARD_GABLE_WITHOUT_PROJECTING_CHITOU',width,depth,hardGableEnd:true,removedDegenerateTriangles,bearingDatum:item.ph+item.colH,gableWallEnd:'ORIGINAL_WALL_STOPS_AT_EAVE_POST_CENTRE_IN_DEPTH',tileColour:'LEGACY_UNVERIFIED_RETAINED_NOT_INFERRED_FROM_2020_DETAIL',bracketDetail:'SEPARATE_YANWEIFANG_NOT_YET_MODELED'},sourcePlan:{source:'https://img.dpm.org.cn/Uploads/pdf/5077/T00008_00.pdf',publicationYear:2007,photographyDate:null,facts:'NAMED_THREE_BAY_HENGSHOU_RECTANGLE_AND_SOUTH_CENTRAL_STEPS',surveyDate:null},interiorStatus:'EVIDENCE_BLOCKED_NO_REASSIGNMENT_OF_EAST_NORTH_VALUE_ROOM',wholeBuildingComplete:false});
}


// Standalone merge candidate. It imports no private RemainingOuterHalls helper
// and never changes RoofBuilder, shared materials, dimensions or navigation.
const PAIRED_FIT = 'REVERSIBLE_MODEL_FIT_NOT_SURVEYED';
const PAIRED_IDENTITIES = Object.freeze({
  ningdao: {id:'place-outer-west-5c577ab026',name:'凝道殿',x:192.2,z:-228.7,w:27.4,d:12.3,rot:-Math.PI/2,scene:'w22'},
  huanzhang: {id:'place-outer-west-db932a3514',name:'焕章殿',x:250.6,z:-228.9,w:26.7,d:10.2,rot:Math.PI/2,scene:'w07'},
});
const PAIRED_PANORAMA = 'https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/';
const pairedMeshes = (root,accept) => {const out=[];root.traverse(n=>{if(n.isMesh&&accept(n))out.push(n)});return out;};
const pairedMaterial = (kit,mesh,key) => mesh.material===kit.lib.material(key);
const pairedPositionKey = p => p.map(v=>Math.round(v/1e-5)).join(',');

function pairedTriangleIds(geometry) {
  const ix=geometry.index,n=ix?.count??geometry.attributes.position.count;
  return Array.from({length:n/3},(_,i)=>[0,1,2].map(j=>ix?ix.getX(i*3+j):i*3+j));
}
function pairedSelectTriangles(geometry,triangles) {
  const next=new THREE.BufferGeometry();
  for(const[name,a]of Object.entries(geometry.attributes)){
    const values=new a.array.constructor(triangles.length*3*a.itemSize);let offset=0;
    for(const ids of triangles)for(const id of ids)for(let k=0;k<a.itemSize;k++)values[offset++]=a.array[id*a.itemSize+k];
    next.setAttribute(name,new THREE.BufferAttribute(values,a.itemSize,a.normalized));
  }
  return next;
}
function pairedReverseUnderboard(tileGeometry,thickness) {
  const reversed=pairedSelectTriangles(tileGeometry,pairedTriangleIds(tileGeometry).map(([a,b,c])=>[a,c,b]));
  const p=reversed.attributes.position;
  for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)-thickness);
  reversed.computeVertexNormals();return reversed;
}
function pairedBoundary(tileGeometry) {
  const p=tileGeometry.attributes.position,edges=new Map();
  for(const ids of pairedTriangleIds(tileGeometry))for(let j=0;j<3;j++){
    const a=new THREE.Vector3().fromBufferAttribute(p,ids[j]).toArray(),b=new THREE.Vector3().fromBufferAttribute(p,ids[(j+1)%3]).toArray();
    const ka=pairedPositionKey(a),kb=pairedPositionKey(b),key=[ka,kb].sort().join('|'),row=edges.get(key)??{a,b,count:0,direction:0};
    row.count++;row.direction+=ka<kb?1:-1;edges.set(key,row);
  }
  for(const e of edges.values())if(e.count>2||e.count===2&&e.direction!==0)throw Error('Paired roof baseline tile topology is not an oriented manifold');
  return [...edges.values()].filter(e=>e.count===1);
}
function pairedGeometryBuilder() {
  const positions=[],uvs=[],indices=[];
  const quad=(a,b,c,d,expected)=>{
    const n=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a)).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...c),new THREE.Vector3(...a)));
    const vertices=n.dot(new THREE.Vector3(...expected))>=0?[a,b,c,d]:[a,d,c,b],base=positions.length/3;
    for(const p of vertices){positions.push(...p);uvs.push(p[2]/4,p[1]/2)}
    indices.push(base,base+1,base+2,base,base+2,base+3);
  };
  const finish=()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;};
  return{quad,finish};
}
function pairedEdgeGeometry(boundary,thickness) {
  const positions=[],uvs=[];
  for(const{a,b}of boundary){const ad=[a[0],a[1]-thickness,a[2]],bd=[b[0],b[1]-thickness,b[2]],len=new THREE.Vector3(...a).distanceTo(new THREE.Vector3(...b));
    // Reverse the top boundary edge. This is an outward oriented solid edge,
    // not DoubleSide and not a closure on every disconnected input triangle.
    for(const p of[a,ad,bd,a,bd,b])positions.push(...p);
    uvs.push(0,0,0,thickness,len,thickness,0,0,len,thickness,len,0);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.computeVertexNormals();return g;
}
function pairedProfileSolid(x0,x1,zs,upper,lower) {
  const b=pairedGeometryBuilder();
  for(let i=0;i<zs.length-1;i++){
    const z0=zs[i],z1=zs[i+1],u0=upper(z0),u1=upper(z1),l0=lower(z0),l1=lower(z1);
    b.quad([x0,u0,z0],[x1,u0,z0],[x1,u1,z1],[x0,u1,z1],[0,1,0]);
    b.quad([x0,l0,z0],[x1,l0,z0],[x1,l1,z1],[x0,l1,z1],[0,-1,0]);
    b.quad([x0,l0,z0],[x0,u0,z0],[x0,u1,z1],[x0,l1,z1],[-1,0,0]);
    b.quad([x1,l0,z0],[x1,u0,z0],[x1,u1,z1],[x1,l1,z1],[1,0,0]);
  }
  for(const[z,n]of[[zs[0],-1],[zs.at(-1),1]])b.quad([x0,lower(z),z],[x1,lower(z),z],[x1,upper(z),z],[x0,upper(z),z],[0,0,n]);
  return b.finish();
}
function pairedPaintedBoxGeometry(w,h,d,tile) {
  const g=new THREE.BoxGeometry(w,h,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){
    if(Math.abs(n.getX(i))>.5)uv.setXY(i,(p.getZ(i)+d/2)/tile,(p.getY(i)+h/2)/h);
    else if(Math.abs(n.getZ(i))>.5)uv.setXY(i,(p.getX(i)+w/2)/tile,(p.getY(i)+h/2)/h);
    else uv.setXY(i,(p.getZ(i)+d/2)/tile,(p.getX(i)+w/2)/w);
  }
  return g;
}

/**
 * Augment only Ningdao/Huanzhang's retained generic hall roof.
 * Prerequisite: kit.hall({...baselineItem, rot: FACE[baselineItem.rot]}) has run.
 * Returns metadata, not a replacement built object. The caller can put it in
 * finishAugment(..., {pairedExposedRoof: result}). No resolver change is made.
 * Seven purlin courses and every count/size/position below are model fits, not
 * a survey or a use of Huanzhang's different 1902 five-purlin specification.
 */
function augmentPairedExposedRoof(kit,item,built,profile) {
  const identity=PAIRED_IDENTITIES[profile?.key],f=built?.f;
  const rotation=typeof item?.rot==='number'?item.rot:({west:-Math.PI/2,east:Math.PI/2})[item?.rot];
  if(!identity||profile.id!==identity.id||item.name!==identity.name||!['x','z','w','d'].every(k=>item[k]===identity[k])||rotation!==identity.rot||item.ph!==.45||item.colH!==5.76||item.bays!==5||item.roof!=='gable'||item.brackets!==false||!f?.isGroup)throw Error('Paired exposed roof exact identity/baseline/profile required');
  if(f.userData.pairedExposedRoof)throw Error('Paired exposed roof already installed on this baseline');
  f.updateWorldMatrix(true,true);
  if(!f.matrixWorld.elements.every(Number.isFinite)||Math.abs(f.rotation.y-identity.rot)>1e-9)throw Error('Paired roof requires a finite, orientation-normalized baseline frame');
  const baseY=item.ph+item.colH,legacyBeamH=THREE.MathUtils.clamp(item.colH*.12,.45,.85),ceilingY=baseY-legacyBeamH-.02;
  const ceilings=f.children.filter(n=>n.isMesh&&n.geometry.type==='PlaneGeometry'&&pairedMaterial(kit,n,'caihua_beam')&&n.geometry.parameters.width===item.w&&n.geometry.parameters.height===item.d&&Math.abs(n.position.y-ceilingY)<1e-6&&n.position.x===0&&n.position.z===0);
  const roofs=f.children.filter(n=>n.name==='roof_gable');
  if(ceilings.length!==1||roofs.length!==1)throw Error('Paired roof requires exactly one original hall ceiling and gable roof');
  const roof=roofs[0],tiles=pairedMeshes(roof,n=>pairedMaterial(kit,n,'roof_tile')),rafterFields=pairedMeshes(roof,n=>pairedMaterial(kit,n,'rafters'));
  if(tiles.length!==1||rafterFields.length!==1)throw Error('Paired roof baseline material identity is not recognized');
  const tile=tiles[0],legacyRafters=rafterFields[0],rp=legacyRafters.geometry.attributes.position,kept=[],removed=[];
  for(const ids of pairedTriangleIds(legacyRafters.geometry)){
    const horizontal=ids.every(i=>Math.abs(rp.getY(i)-baseY)<1e-5&&Math.abs(rp.getX(i))<=item.w/2+.251&&Math.abs(rp.getZ(i))<=item.d/2+.251);
    (horizontal?removed:kept).push(ids);
  }
  if(removed.length!==4)throw Error('Paired roof baseline horizontal fan must contain exactly four triangles');
  const columns=pairedMeshes(f,n=>n.geometry.type==='CylinderGeometry'&&pairedMaterial(kit,n,'wood_column')&&Math.abs(n.geometry.parameters.height-item.colH)<1e-6&&Math.abs(n.position.y+item.colH/2-baseY)<1e-6);
  if(columns.length!==12)throw Error('Paired roof baseline requires the retained twelve eave columns');
  const boundary=pairedBoundary(tile.geometry),thickness=.12,rafterDepth=.14,rafterWidth=.10,join=.025;
  const tileToFrame=new THREE.Matrix4().copy(f.matrixWorld).invert().multiply(tile.matrixWorld),p=tile.geometry.attributes.position;
  const tileTriangles=pairedTriangleIds(tile.geometry).map(ids=>ids.map(i=>new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(tileToFrame)));
  const ray=new THREE.Ray(),hit=new THREE.Vector3();
  const roofY=(x,z)=>{
    ray.set(new THREE.Vector3(x,50,z),new THREE.Vector3(0,-1,0));let y=-Infinity;
    for(const[a,b,c]of tileTriangles)if(ray.intersectTriangle(a,b,c,false,hit))y=Math.max(y,hit.y);
    if(!Number.isFinite(y))throw Error(`Paired roof sample missed retained tile at ${x}, ${z}`);return y;
  };
  const rafterHalfRun=item.d/2+.20;
  const zs=[...new Set([-rafterHalfRun,rafterHalfRun,...tileTriangles.flatMap(v=>v.map(p=>p.z)).filter(z=>Math.abs(z)<rafterHalfRun)])].sort((a,b)=>a-b);
  // Complete all required sampling before replacing the old ceiling geometry.
  for(const z of zs)roofY(0,z);
  const purlinData=Array.from({length:7},(_,i)=>{
    const z=-item.d/2+i*item.d/6,radius=i===3?.17:.15,sampleZ=Math.abs(z)<1e-9?.002:z;
    const slope=(roofY(0,sampleZ+.0005)-roofY(0,sampleZ-.0005))/.001;
    const centerY=roofY(0,z)-thickness-rafterDepth-radius*Math.sqrt(1+slope*slope)+join;
    return{z,radius,slope,centerY,bottomY:centerY-radius,contactZ:z-radius*slope/Math.sqrt(1+slope*slope)};
  });
  const source=PAIRED_PANORAMA+identity.scene+'.tiles/u/l1/01/l1_u_01_01.jpg';
  const metadata={id:profile.id,key:profile.key,source,secondaryNodeSource:profile.key==='ningdao'?PAIRED_PANORAMA+'w18.tiles/u/l1/01/l1_u_01_01.jpg':null,photographyDate:null,targetPeriod:'2021_CERAMICS_OPENING_PANORAMA',dimensionStatus:PAIRED_FIT,wholeBuildingComplete:false,removedLegacyCeilingPlanes:1,removedHorizontalSoffitTriangles:removed.length,underboardThickness:thickness,thicknessAxis:'VERTICAL_OFFSET_WITH_PHYSICAL_SLOPED_THICKNESS',boundaryEdges:boundary.length,fitCounts:{transverseStations:6,purlinCourses:7,rafters:0},loadPath:{frames:[],purlins:[],rafters:[]},limitations:['All timber counts, cross-sections and coordinates are reversible model fits, not measured modern whole-building framing.','No 1902 five-purlin count or wood ceiling is imposed on the 2021 exposed roof.','Generic caihua texture is a visual palette fit, not exact painted motif reproduction.','Inner gable backing is a technical closure inside the retained exterior, not a measured historic lining.','Modern low red display ceilings are not ancient ceiling evidence and are not built by this function.']};
  const owned=(key,name,color,keepMap)=>{
    const m=kit.lib.material(key).clone();m.name=`r48_${profile.key}_${name}`;m.side=THREE.FrontSide;m.roughness=.82;m.color.setHex(color);if(!keepMap)m.map=null;m.userData={...m.userData,pairedRoof:true,dimensionStatus:PAIRED_FIT};kit.owned.push(m);return m;
  };
  const blue=owned('caihua_beam','painted_frame',0xb5c6ca,true),green=owned('rafters','green_rafters',0x315e48,false),orange=owned('wood_column','red_orange_underboards',0xad522b,false);
  let bearingSequence=0;columns.forEach((n,i)=>{n.userData.pairedBearingId=profile.key+'-retained-eave-column-'+i;});
  const mark=(mesh,part,extra={})=>{mesh.name=`${profile.key}-exposed-${part}`;Object.assign(mesh.userData,{role:mesh.name,pairedRoofPart:part,pairedBearingId:profile.key+'-bearing-'+(bearingSequence++),remainingOuterId:profile.id,source,photographyDate:null,dimensionStatus:PAIRED_FIT,...extra});mesh.castShadow=mesh.receiveShadow=true;return mesh;};
  const add=(geometry,material,part,x=0,y=0,z=0,extra={})=>{const m=mark(new THREE.Mesh(geometry,material),part,extra);m.position.set(x,y,z);f.add(m);return m;};
  const box=(part,w,h,d,x,y,z,extra={})=>add(pairedPaintedBoxGeometry(w,h,d,kit.lib.tileSize('caihua_beam')),blue,part,x,y,z,extra);
  // Only the exact obsolete surfaces are removed. Shared materials stay alive.
  ceilings[0].removeFromParent();ceilings[0].geometry.dispose();
  const oldRafterGeometry=legacyRafters.geometry;legacyRafters.geometry=pairedSelectTriangles(oldRafterGeometry,kept);oldRafterGeometry.dispose();
  for(const[geometry,part]of[[pairedReverseUnderboard(tile.geometry,thickness),'underboard'],[pairedEdgeGeometry(boundary,thickness),'board-edge']]){
    const mesh=mark(new THREE.Mesh(geometry,orange),part);mesh.position.copy(tile.position);mesh.quaternion.copy(tile.quaternion);mesh.scale.copy(tile.scale);tile.parent.add(mesh);
  }
  // Closed solids directly under each piecewise-planar retained tile span.
  // Upper faces penetrate only 0.012m into the board, avoiding numerical seams.
  const rafterCount=Math.max(2,Math.round((item.w-.5)/.34));
  for(let i=0;i<=rafterCount;i++){
    const x=-item.w/2+.25+i*(item.w-.5)/rafterCount;
    const upper=z=>roofY(x,z)-thickness+.012,lower=z=>roofY(x,z)-thickness-rafterDepth;
    const mesh=add(pairedProfileSolid(x-rafterWidth/2,x+rafterWidth/2,zs,upper,lower),green,'rafter',0,0,0,{rafterIndex:i,x});
    metadata.loadPath.rafters.push({mesh:mesh.userData.pairedBearingId,x});
  }
  metadata.fitCounts.rafters=metadata.loadPath.rafters.length;
  for(const data of purlinData){
    const geometry=new THREE.CylinderGeometry(data.radius,data.radius,item.w+.22,16,1,false),uv=geometry.attributes.uv;
    for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);uv.setXY(i,v*(item.w+.22)/kit.lib.tileSize('caihua_beam'),u)}
    const mesh=add(geometry,blue,'purlin',0,data.centerY,data.z,{course:metadata.loadPath.purlins.length,z:data.z});mesh.rotation.z=Math.PI/2;data.mesh=mesh;
    metadata.loadPath.purlins.push({mesh:mesh.userData.pairedBearingId,z:data.z,contactZ:data.contactZ,radius:data.radius});
  }
  for(let station=0;station<=item.bays;station++){
    const x=-item.w/2+station*item.w/item.bays,frame={x,columns:[],beams:[],supports:[],purlinBearings:[]},beamTops=[];
    for(const c of columns)if(Math.abs(c.position.x-x)<1e-5)frame.columns.push(c.userData.pairedBearingId);
    for(let tier=0;tier<3;tier++){
      const row=purlinData[tier],top=tier===0?Math.max(baseY-.02,row.bottomY+.035):row.bottomY+.035,h=[.58,.44,.36][tier],span=2*Math.abs(row.z)+.32;
      const beam=box('transverse-beam',.42-tier*.05,h,span,x,top-h/2,0,{station,tier});frame.beams.push(beam.userData.pairedBearingId);beamTops.push(top);
      for(const j of[tier,6-tier])frame.purlinBearings.push({beam:beam.userData.pairedBearingId,purlin:purlinData[j].mesh.userData.pairedBearingId});
      if(tier>0)for(const z of[-Math.abs(row.z),Math.abs(row.z)]){
        const bottom=beamTops[tier-1]-.025,upper=top-h+.025,post=box('short-support',.26,upper-bottom,.26,x,(bottom+upper)/2,z,{station,tier});
        frame.supports.push({mesh:post.userData.pairedBearingId,below:frame.beams[tier-1],above:beam.userData.pairedBearingId});
      }
    }
    const ridge=purlinData[3],lo=beamTops[2]-.025,hi=ridge.bottomY+.035;
    const post=box('ridge-support',.26,hi-lo,.26,x,(lo+hi)/2,0,{station});frame.supports.push({mesh:post.userData.pairedBearingId,below:frame.beams[2],above:ridge.mesh.userData.pairedBearingId});
    metadata.loadPath.frames.push(frame);
  }
  // The old outward-only gable is retained unchanged. An independent thin
  // closed lining is wholly INSIDE the old shell and meets the timber board.
  for(const side of[-1,1]){
    const x=side*(item.w/2-.12),upper=z=>roofY(x,z)-thickness+.015,lower=()=>baseY-legacyBeamH;
    add(pairedProfileSolid(x-.06,x+.06,zs,upper,lower),orange,'inner-gable',0,0,0,{closureStatus:'INTERNAL_TECHNICAL_CLOSURE_NOT_SURVEYED_FINISH'});
  }
  f.userData.pairedExposedRoof=metadata;return metadata;
}

function augmentPairedModernDisplay(kit,item,built,p) {
  const roof=augmentPairedExposedRoof(kit,item,built,p);
  const c=context(kit,item,p,built,{w:item.w,d:item.d,y:item.ph,h:item.colH,key:p.key}),{f,box}=c;
  const base='https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/';
  const scene=p.key==='ningdao'?'w22':'w07',photo=(node,face='f')=>base+node+'.tiles/'+face+'/l1/01/l1_'+face+'_01_01.jpg';
  const info={source:photo(scene),period:'2021_CERAMICS_OPENING_PANORAMA_NOT_2026_INVENTORY',photographyDate:null,dimensionStatus:FIT,objects:'CERAMICS_ARTWORK_AND_WRITTEN_LABELS_UNMODELED'};
  const modernGlass=new THREE.MeshStandardMaterial({name:p.key+'-modern-display-glass',color:0xa9c5c9,transparent:true,opacity:.16,roughness:.22,depthWrite:false});
  const lining=new THREE.MeshStandardMaterial({name:p.key+'-modern-red-display-lining',color:0x642b29,roughness:.86});
  const linen=new THREE.MeshStandardMaterial({name:p.key+'-modern-light-display-linen',color:0xa9a49b,roughness:.95});
  const cloth=new THREE.MeshStandardMaterial({name:p.key+'-modern-plain-yellow-cloth',color:0xb9a44b,roughness:.96});
  const grey=new THREE.MeshStandardMaterial({name:p.key+'-modern-roller-grey',color:0x646466,roughness:.92});
  kit.owned.push(modernGlass,lining,linen,cloth,grey);
  const front=-item.d/2,rear=item.d/2,y=item.ph,bay=item.w/item.bays;
  // These own entrance photographs positively show low modern threshold strips,
  // not a claim from an omitted historical furniture list.
  const entranceSource=photo(scene,'b'),entranceInfo={...info,source:entranceSource,interpretation:'OWN_2021_ENTRANCE_PHOTO_LOW_STRIP_AND_GLAZED_RED_DOOR__METRICS_FITTED'};
  const oldSill=f.children.find(n=>n.isMesh&&materialKey(kit,n.material)==='wood_column'&&Math.abs(n.position.x)<1e-8&&Math.abs(n.position.y-y-.11)<1e-8&&Math.abs(n.position.z-front)<1e-8);
  if(!oldSill)throw Error('Paired modern entrance requires the single old center sill');
  oldSill.geometry.scale(1,.025/.22,.14/.30);oldSill.position.y=y+.0125;oldSill.material=c.m.dark;mark(oldSill,p,p.key+'-photo-low-threshold-strip',entranceInfo);
  const leaves=f.children.filter(n=>n.isMesh&&materialKey(kit,n.material)==='lattice_doors'&&Math.abs(Math.sin(n.rotation.y))>.99&&n.position.z<0);
  if(leaves.length!==2)throw Error('Paired modern entrance requires the two original open leaves');
  for(const old of leaves){
    old.geometry.computeBoundingBox();const size=old.geometry.boundingBox.getSize(new THREE.Vector3()),w=size.x,h=size.y,pose=new THREE.Group();pose.position.copy(old.position);pose.rotation.copy(old.rotation);f.add(pose);
    const part=(role,mat,ww,hh,dd,xx,yy)=>{const m=mark(kit.mesh(pose,new THREE.BoxGeometry(ww,hh,dd),mat,xx,yy,0),p,p.key+'-photo-glazed-door-'+role,entranceInfo);return m;};
    const low=-h/2,high=h/2,lowerPanel=.92;
    for(const x of[-w/2+.045,w/2-.045])part('stile',c.m.red,.09,h,.10,x,0);
    for(const yy of[low+.045,low+lowerPanel,high-.045])part('rail',c.m.red,w,.09,.10,0,yy);
    part('lower-panel',c.m.red,w-.14,lowerPanel-.09,.08,0,low+lowerPanel/2);
    const glassLo=low+lowerPanel+.045,glassHi=high-.09,glassH=glassHi-glassLo;
    part('clear-pane',modernGlass,w-.18,glassH,.024,0,(glassLo+glassHi)/2);
    for(const x of[-w*.29,w*.29])part('upper-mullion',c.m.red,.045,glassH,.06,x,(glassLo+glassHi)/2);
    for(const yy of[glassLo+glassH/3,glassLo+glassH*2/3])for(const sign of[-1,1])part('side-pane-rail',c.m.red,w*.165,.045,.06,sign*w*.3725,yy);
    pose.updateWorldMatrix(true,true);const originalBox=new THREE.Box3().setFromObject(old);kit.colliders.push(originalBox.clone());
    old.removeFromParent();old.geometry.dispose();
  }
  // Source-visible equipment below each retained front window. Counts follow
  // the fitted five-bay shell; the panorama is not a measured full inventory.
  const equipment=[];
  for(let i=0;i<item.bays;i++)if(i!==2){
    const x=-item.w/2+(i+.5)*bay,width=bay-.82,blindH=2.2,blindBottom=y+1.28;
    box(p.key+'-modern-window-lower-lining','red',width,.94,.06,x,y+.47,front+.08,false,{...entranceInfo,scope:'LOWER_FRONT_WINDOW_REGION_ONLY'});
    box(p.key+'-modern-roller-blind',grey,width,blindH,.025,x,blindBottom+blindH/2,front+.19,false,{...entranceInfo,countStatus:'MODEL_BAY_REPEAT_NOT_COMPLETE_PHOTO_INVENTORY'});
    box(p.key+'-modern-blind-head-rail','paper',width+.05,.06,.07,x,blindBottom+blindH+.03,front+.20,false,entranceInfo);
    for(const side of[-1,1]){box(p.key+'-modern-blind-mount','dark',.05,.10,.20,x+side*(width/2-.08),blindBottom+blindH+.03,front+.115,false,{...entranceInfo,engineering:'FITTED_VISIBLE_MOUNT'});box(p.key+'-modern-radiator-mount','dark',.06,.08,.08,x+side*width*.3,y+.42,front+.13,false,{...entranceInfo,engineering:'FITTED_VISIBLE_MOUNT'});}
    box(p.key+'-modern-radiator-back','paper',width*.88,.64,.06,x,y+.56,front+.18,true,entranceInfo);
    const fins=Math.max(8,Math.floor(width/.13));for(let k=0;k<fins;k++)box(p.key+'-modern-radiator-fin','paper',.06,.64,.18,x-width*.44+(k+.5)*width*.88/fins,y+.56,front+.24,true,entranceInfo);
    equipment.push({bay:i,type:'gray roller blind and white radiator',source:entranceSource,countStatus:'FITTED_REPEAT'});
  }
  box(p.key+'-photo-entrance-mat','dark',bay-.9,.004,1.35,0,y+.022,front+.72,false,{...entranceInfo,status:'PARTIAL_MAT_OUTLINE_NOT_FABRIC_PATTERN'});
  const endDepth=item.d-2.95,endFront=front+2.4,endBack=rear-.55,endWidth=5.55,left0=-item.w/2+.55,right1=item.w/2-.55,ceilingY=y+3.35;
  const rooms=[];
  const end=(side,theme,sceneId)=>{
    const x0=side<0?left0:right1-endWidth,x1=x0+endWidth,x=(x0+x1)/2,z=(endFront+endBack)/2,source=photo(sceneId),details={...info,source,theme,positionStatus:'END_RELATION_FROM_PANORAMA_MAP__ABSOLUTE_END_ASSIGNMENT_MODEL_FIT_NO_NORTH_ARROW'};
    box(p.key+'-'+theme+'-back-lining',lining,endWidth,3.35,.08,x,y+3.35/2,endBack,true,details);
    box(p.key+'-'+theme+'-outer-end-lining',lining,.08,3.35,endDepth,side<0?x0:x1,y+3.35/2,z,true,details);
    box(p.key+'-'+theme+'-low-modern-ceiling',lining,endWidth,.10,endDepth,x,ceilingY+.05,z,false,{...details,notHistoricCeiling:true});
    box(p.key+'-'+theme+'-front-glass',modernGlass,endWidth-.04,3.3,.035,x,y+1.65,endFront,true,details);
    box(p.key+'-'+theme+'-inner-return-glass',modernGlass,.035,3.3,endDepth,side<0?x1:x0,y+1.65,z,true,details);
    for(const px of[x0,x1])for(const pz of[endFront,endBack])box(p.key+'-'+theme+'-case-post','dark',.055,3.35,.055,px,y+1.675,pz,true,{...details,engineering:'VISIBLE_FITTED_CASE_FRAME_NOT_SURVEYED_SECTION'});
    for(const pz of[endFront,endBack])box(p.key+'-'+theme+'-case-top-rail','dark',endWidth,.06,.055,x,ceilingY-.03,pz,false,details);
    for(const px of[x0,x1])box(p.key+'-'+theme+'-case-top-return','dark',.055,.06,endDepth,px,ceilingY-.03,z,false,details);
    const fieldX=side<0?x0+.05:x1-.05;
    box(p.key+'-'+theme+'-blank-backdrop','paper',.015,2.05,endDepth*.60,fieldX,y+1.72,z,false,{...details,artwork:'FLAT_PICTURE_FIELD_ONLY__NO_REPRODUCED_ART_OR_INVENTED_3D_BED'});
    const tabletop=(xx,zz,ww,dd,mat,top)=>{box(p.key+'-'+theme+'-table-top',mat,ww,.075,dd,xx,top-.0375,zz,true,details);for(const dx of[-ww/2+.11,ww/2-.11])for(const dz of[-dd/2+.11,dd/2-.11])box(p.key+'-'+theme+'-table-leg','timber',.11,top-y-.075,.11,xx+dx,(y+top-.075)/2,zz+dz,true,details);};
    if(theme==='banquet-yellow'){
      tabletop(x,z,3.1,2.1,cloth,y+1.05);tabletop(x-side*2.10,z-.9,1.0,1.8,cloth,y+.92);
      for(const dz of[-1.025,1.025])box(p.key+'-'+theme+'-plain-cloth-skirt',cloth,3.1,.73,.035,x,y+.66,z+dz,true,{...details,pattern:'DRAGON_EMBROIDERY_UNMODELED'});
    }else if(theme==='wedding-red'){
      tabletop(x-side*.65,z-.6,3.15,1.55,lining,y+.98);tabletop(x+side*1.15,z+.88,1.7,1.15,lining,y+.98);
      for(const dz of[-.76,.76])box(p.key+'-'+theme+'-plain-cloth-skirt',lining,3.15,.88,.035,x-side*.65,y+.51,z-.6+dz,true,details);
    }else if(theme==='three-tier-grey'){
      for(let k=0;k<3;k++)box(p.key+'-'+theme+'-display-tier',linen,endWidth-1.0-k*.85,.30,endDepth-1.15-k*.72,x,y+.15+k*.30,z,true,{...details,tier:k+1,inventory:'ALL_PORCELAINS_UNMODELED'});
    }else if(theme==='green-screen-seat'){
      const sx=x+side*1.15,screenWidth=endDepth-1.4,screenZ=z;
      box(p.key+'-'+theme+'-screen-frame','dark',.10,1.92,screenWidth,sx,y+1.03,screenZ,true,details);
      for(const dz of[-screenWidth/2+.12,screenWidth/2-.12])box(p.key+'-'+theme+'-screen-foot','dark',.25,.18,.20,sx,y+.09,screenZ+dz,true,details);
      const parts=12;for(let k=0;k<parts;k++)box(p.key+'-'+theme+'-plain-screen-field','green_glaze',.035,1.63,screenWidth/parts-.045,sx-side*.055,y+1.04,screenZ-screenWidth/2+(k+.5)*screenWidth/parts,true,{...details,artwork:'FLORAL_PAINTING_UNMODELED',countStatus:'FITTED_REPEAT_NOT_MEASUREMENT'});
      for(const dz of[-.85,.85]){tabletop(sx-side*.8,z+dz,1.15,1.45,c.m.dark,y+.55);box(p.key+'-'+theme+'-plain-seat-cushion','paper',1.04,.13,1.31,sx-side*.8,y+.615,z+dz,true,{...details,textile:'PATTERN_UNMODELED'});}
      tabletop(x-side*1.25,z,1.2,2.9,c.m.dark,y+.82);
    }
    rooms.push({theme,source,bounds:{x0,x1,z0:endFront,z1:endBack},ceilingY,objectInventory:'UNMODELED',absoluteEndAssignment:FIT});
  };
  if(p.key==='huanzhang'){end(-1,'banquet-yellow','w13');end(1,'wedding-red','w04');}
  else {end(-1,'three-tier-grey','w18');end(1,'green-screen-seat','w25');}
  const cabinetX0=left0+endWidth+.30,cabinetX1=right1-endWidth-.30,cabinetW=cabinetX1-cabinetX0,cabinetX=(cabinetX0+cabinetX1)/2,caseZ=rear-1.18,caseDepth=1.28;
  const central={...info,display:'OWN_CENTRAL_LONG_CASE_WITH_TWO_GREY_TIER_LEVELS',inventory:'EMPTY_CASE_OUTLINE_AND_PLINTHS_ONLY__PORCELAINS_AND_LABELS_UNMODELED'};
  box(p.key+'-central-long-case-back',linen,cabinetW,3.15,.08,cabinetX,y+1.575,rear-.50,true,central);
  box(p.key+'-central-long-case-red-cap',lining,cabinetW,.1,caseDepth,cabinetX,y+3.20,caseZ,false,central);
  for(let k=0;k<2;k++)box(p.key+'-central-long-case-grey-tier',linen,cabinetW-.20,.28,caseDepth-.16-k*.52,cabinetX,y+.16+k*.28,caseZ+k*.26,true,{...central,tier:k+1});
  box(p.key+'-central-long-case-front-glass',modernGlass,cabinetW,3.15,.035,cabinetX,y+1.575,caseZ-caseDepth/2,true,central);
  for(const x of[cabinetX0,cabinetX1]){box(p.key+'-central-long-case-return',modernGlass,.035,3.15,caseDepth,x,y+1.575,caseZ,true,central);box(p.key+'-central-long-case-frame','dark',.055,3.25,.055,x,y+1.625,caseZ-caseDepth/2,true,central);}
  box(p.key+'-central-long-case-top-frame','dark',cabinetW,.06,.06,cabinetX,y+3.22,caseZ-caseDepth/2,false,central);
  const inheritedAccess=retainOpenedLeafAndPostProxies(kit,f);
  return finishAugment(kit,item,built,p,{exteriorChanged:true,interiorChanged:true,pairedExposedRoof:roof,modernDisplay:{period:info.period,photographyDate:null,centralSource:info.source,entranceSource,endDisplays:rooms,windowEquipment:equipment,objectInventory:'UNMODELED',absoluteEndDirection:'MODEL_FIT_NO_NORTH_ARROW_IN_NAVIGATION_MAP',newRuntimeLights:0},inheritedAccess,threshold:{source:entranceSource,oldHeight:.22,newHeight:.025,dimensionStatus:FIT},interiorPolicy:'OWN_2021_MODERN_EXHIBITION_LAYOUT_PARTIAL_NOT_HISTORICAL_HOUSEHOLD_RECONSTRUCTION',wholeBuildingComplete:false});
}


export function augmentRemainingHall(kit,item,built,profile) {
  validate(item,profile,'augment');
  if(!built?.f?.isObject3D)throw Error('R48 outer augmentation requires the previously built exact hall');
  if(profile.key==='wenyuan')return augmentWenyuanLevels(kit,item,built,profile);
  if(profile.key==='yude')return augmentYudeInterior(kit,item,built,profile);
  if(['wuying','jingsi'].includes(profile.key))return augmentCeramicsGallery(kit,item,built,profile);
  if(profile.key==='baoyun')return augmentBaoyunFacade(kit,item,built,profile);
  if(['ningdao','huanzhang'].includes(profile.key))return augmentPairedModernDisplay(kit,item,built,profile);
  if(profile.key==='zhujing')return augmentZhujingPhotoDetails(kit,item,built,profile);
  if(['benren','jiyi'].includes(profile.key))return augmentWenhuaCompanionFacade(kit,item,built,profile);
  if(profile.key==='hengshou')return augmentHengshouPlainGable(kit,item,built,profile);
  if(profile.key.startsWith('sansuo-')){
    removeOldRoofs(built.f);
    const roof=kit.roof(built.f,{type:'gable',width:item.w,depth:item.d+.5,baseY:(item.ph??.9)+item.colH,layers:1,brackets:false,hardGableEnd:true});
    const green=palette(kit).green_glaze;
    roof.traverse(n=>{if(n.isMesh&&(['roof_tile','kit_ridge','roof_ridge_glaze'].includes(materialKey(kit,n.material))))n.material=green;});
    roof.userData.remainingRoof='sansuo-green-hard-gable';roof.userData.source=profile.source;
    return finishAugment(kit,item,built,profile,{exteriorChanged:true,interiorChanged:item.furnishingPolicy!==undefined,identityStatus:'THREE_COURTYARDS_TWO_MODEL_ROWS_UNRESOLVED',interiorStatus:item.furnishingPolicy===undefined?'LEGACY_FURNITURE_PRESERVED_UNVERIFIED__NO_OMISSION_AS_ABSENCE_INFERENCE':'UNKNOWN_INVENTORY_WITHHELD_NOT_KNOWN_EMPTY',actualChanges:['Group-common green glazed flush hard-gable roof only; no invented bay mapping or relocated middle-hall stove',...(item.furnishingPolicy===undefined?[]:['Withhold unsupported generic props only for this explicit runtime declaration; preserve unresolved boundaries and original spawn points'])]});
  }
  throw new Error(`R48 outer augmentation not enabled for ${profile.key}`);
}
