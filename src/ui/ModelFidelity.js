import {buildingFidelityFor,buildingFidelityText} from './BuildingFidelity.js';
// Rendering status is separate from the historical catalogue. These statements
// describe this build, not museum authentication, artifact dates or public access.
const genericFive=['景仁宫','承乾宫','钟粹宫','永和宫','永寿宫','翊坤宫','储秀宫','太极殿','长春宫'];
const genericThree=['景阳宫','咸福宫'];
const palaces=Object.fromEntries([...genericFive.map(n=>[n,5]),...genericThree.map(n=>[n,3])].map(([name,bays])=>[name,{
 short:`已核${bays}间 · 内景示意`,
 detail:`本版按故宫博物院资料采用${bays}间面阔；轴距暂按原外包等分。殿内家具与装饰仍含通用示意，不能据此判断此宫现存陈设、用途或曾居住的人物。`,
}]));
const states={...palaces,
 '长春宫':{short:'5间 · 家居分间局部拟合',detail:'中央帘罩、梢间北部炕罩及深木低座、五扇素屏关系参考官方图文。柱距、门洞、家具尺寸和开口状态为拟合，不是历史开门状态或完整现状清点；屏风画面、羽扇、鹤与悬灯尚未精确复刻。'},
 '翊坤宫':{short:'5间 · 木罩隔扇局部拟合',detail:'明间东喜鹊登梅、西藤萝松缠枝落地罩与两侧次梢隔扇按官方文字区分。当前仅表示木框和开敞关系，未复制原雕刻；具体开口供模型观览，不代表历史或现场开合。中央宝座仍为通用示意形制占位，完整座屏、香几和宫扇待核。'},
 '延禧宫':{short:'灵沼轩遗存 · 尺度拟合',detail:'庭院中央表现现存未完工灵沼轩遗存，不是已毁的旧延禧宫正殿。石构与铁构轮廓参考官方图；具体尺度、附房长度和连接关系仍待测绘核准。'},
 '皇极门':{short:'三门七楼 · 细部拟合',detail:'三座门洞、七座顶楼及琉璃/白石主要分区有官方依据；门洞净宽、台座线脚、纹样和各构件尺度仍是模型拟合。'},
 '太和殿':{short:'匾联层次试配 · 部分待核',detail:'六根贴金柱及四对陈设类别有官方文字依据；本版将横匾移挂现有前排梁，保留匾联尺寸、柱网与天花。具体挂位为照片层次拟合，非测绘；近看须抬头，整体透视比例仍有差异。'},
 '储秀宫':{short:'住宅隔断拓扑 · 尺度拟合',detail:'五间面阔、明间五扇寿字屏风与大圆宝镜匾、东竹纹与葡萄罩、西玉兰与玻璃隔扇及西梢暖阁参考官方图文。隔断门洞宽度、家具尺度和暖阁位置为可逆拟合；装饰仅表现种类，不是实物雕刻精确摹本。'},
 '乾清宫':{short:'五进深与前后廊 · 尺度拟合',detail:'中央屏风、宝座前案及蓝色陈设参考故宫官网照片；照片拍摄日期和单件器物身份尚未核定。天花、屏面及匾下纹样为 AI 辅助原创近似，非现存雕饰精确摹本。五进深采用六站位，56柱及前后3米廊深为本版合理拟合，不是官方实测柱数/尺寸；前明间减柱、两端贯通关系有官方依据。陈设尺寸仍待配准；模型未开放中央陈设台为步行路线。'},
 '内金水桥':{short:'五桥与弯曲河段 · 局部样段',detail:'本版保留五桥并连通局部弯曲河道，桥腹和栏杆为实体几何。桥宽、桥长与岸线为模型拟合；两端以外水系及全部历史细部尚未还原。'},
};
// Four original R157 facility groups, not additional buildings or teleport targets.
// Exact ID + name admission keeps unknown-place fallback independent of display names.
const bridgeSources=Object.freeze({
 article:Object.freeze({id:'bridge-article',publisher:'故宫博物院',title:'故宫里的桥',url:'https://www.dpm.org.cn/architectural_art/246281.html'}),
 map:Object.freeze({id:'bridge-map',publisher:'故宫博物院',title:'官方导览示意图（非测绘）',url:'https://img.dpm.org.cn/static/themes/image/xf/map3.jpg'}),
 half:Object.freeze({id:'bridge-1982',publisher:'故宫博物院',title:'许以林《紫禁城内的河与桥》（1982）',url:'https://img.dpm.org.cn/Uploads/pdf/2192/T00005_00.pdf'}),
});
const bridgeFacilities=Object.freeze(Object.fromEntries([
 ['FC-D156902D78','内金水桥',5,'午门与太和门之间的五座石拱桥，将内金水河南北两侧相连。中央御路桥在本版表现为更宽、更长、更高。','五桥、桥腹与栏杆均为实体。本版尺寸、绝对位置和岸线为工程拟合，非测绘；精细雕饰及未见底面尚未精确复原。室外设施，无室内展厅。',['article','map']],
 ['FC-B9097C61D8','武英门前三座石桥',3,'武英门前的三座石桥，连接门前金水河南北两岸；它们不是内金水五桥或东华门内的单桥。','保留三桥各自的桥面、栏板与柱帽体系。尺寸、细部与相对位置为工程拟合，非测绘或完整雕刻复原。室外设施，无室内展厅。',['article','map']],
 ['FC-74F8C30390','半壁桥',1,'协和门东北的半壁桥南北跨水，只有东侧石栏；本版西侧保留可见覆涵草带，邻接较高的庑房台基。','桥位与覆涵关系按来源拓扑作工程拟合，非测绘。可从门外台基东侧绕到桥头；高廊台基内部不是草带通路。室外设施，无室内展厅。',['article','half','map']],
 ['FC-17AFD38428','三座门外三座石桥',3,'文华殿东侧金水河上的三座并列石桥，对应三座门区域以南的位置，与东华门内的单桥不同。','三桥位置与尺寸为工程拟合，非测绘。本轮未生成三座门门体，不把南三所宫门当成三座门。室外设施，无室内展厅。',['article','map']],
].map(([id,name,count,intro,detail,keys])=>[id,Object.freeze({id,name,count,intro,detail,reviewedAt:'2026-11-01',sources:Object.freeze(keys.map(k=>bridgeSources[k]))})])));
export function bridgeFacilityInfoFor(id,name){const info=typeof id==='string'&&Object.hasOwn(bridgeFacilities,id)?bridgeFacilities[id]:null;return info&&(name===undefined||name===info.name)?info:null;}

export function modelFidelityFor(name,catalogId){
 const record=buildingFidelityFor(name,catalogId),summary=buildingFidelityText(record),specific=states[name];
 if(!summary)return specific??null;
 return {...summary,short:specific?.short??summary.short,detail:summary.detail+(specific?` ${specific.detail}`:'')};
}
