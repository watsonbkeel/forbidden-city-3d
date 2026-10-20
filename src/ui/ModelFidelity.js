// Rendering status is separate from the historical catalogue. These statements
// describe this build, not museum authentication, artifact dates or public access.
const genericFive=['景仁宫','承乾宫','钟粹宫','永和宫','永寿宫','翊坤宫','储秀宫','太极殿','长春宫'];
const genericThree=['景阳宫','咸福宫'];
const palaces=Object.fromEntries([...genericFive.map(n=>[n,5]),...genericThree.map(n=>[n,3])].map(([name,bays])=>[name,{
 short:`已核${bays}间 · 内景示意`,
 detail:`本版按故宫博物院资料采用${bays}间面阔；轴距暂按原外包等分。殿内家具与装饰仍含通用示意，不能据此判断此宫现存陈设、用途或曾居住的人物。`,
}]));
const states={...palaces,
 '延禧宫':{short:'灵沼轩遗存 · 尺度拟合',detail:'庭院中央表现现存未完工灵沼轩遗存，不是已毁的旧延禧宫正殿。石构与铁构轮廓参考官方图；具体尺度、附房长度和连接关系仍待测绘核准。'},
 '皇极门':{short:'三门七楼 · 细部拟合',detail:'三座门洞、七座顶楼及琉璃/白石主要分区有官方依据；门洞净宽、台座线脚、纹样和各构件尺度仍是模型拟合。'},
 '太和殿':{short:'匾联层次试配 · 部分待核',detail:'六根贴金柱及四对陈设类别有官方文字依据；本版将横匾移挂现有前排梁，保留匾联尺寸、柱网与天花。具体挂位为照片层次拟合，非测绘；近看须抬头，整体透视比例仍有差异。'},
 '储秀宫':{short:'住宅隔断拓扑 · 尺度拟合',detail:'五间面阔、明间五扇寿字屏风与大圆宝镜匾、东竹纹与葡萄罩、西玉兰与玻璃隔扇及西梢暖阁参考官方图文。隔断门洞宽度、家具尺度和暖阁位置为可逆拟合；装饰仅表现种类，不是实物雕刻精确摹本。'},
 '乾清宫':{short:'五进深与前后廊 · 尺度拟合',detail:'中央屏风、宝座前案及蓝色陈设参考故宫官网照片；照片拍摄日期和单件器物身份尚未核定。天花、屏面及匾下纹样为 AI 辅助原创近似，非现存雕饰精确摹本。五进深采用六站位，56柱及前后3米廊深为本版合理拟合，不是官方实测柱数/尺寸；前明间减柱、两端贯通关系有官方依据。陈设尺寸仍待配准；模型未开放中央陈设台为步行路线。'},
 '内金水桥':{short:'五桥与弯曲河段 · 局部样段',detail:'本版保留五桥并连通局部弯曲河道，桥腹和栏杆为实体几何。桥宽、桥长与岸线为模型拟合；两端以外水系及全部历史细部尚未还原。'},
};
export function modelFidelityFor(name){return states[name]??null;}
