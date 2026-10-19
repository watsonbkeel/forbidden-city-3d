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
 '乾清宫':{short:'官方照片参考 · 陈设拟合',detail:'中央屏风、宝座前案及蓝色陈设参考故宫官网照片；照片拍摄日期和单件器物身份尚未核定。柱网纵深与陈设尺寸仍待配准；模型未开放中央陈设台为步行路线。'},
 '内金水桥':{short:'五桥与弯曲河段 · 局部样段',detail:'本版保留五桥并连通局部弯曲河道，桥腹和栏杆为实体几何。桥宽、桥长与岸线为模型拟合；两端以外水系及全部历史细部尚未还原。'},
};
export function modelFidelityFor(name){return states[name]??null;}
