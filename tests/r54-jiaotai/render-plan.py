"""Technical plan of actual bounds and tested route, not a measured survey."""
import json,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
base=Path(sys.argv[1]);data=json.loads((base/'geometry-and-navigation.json').read_text())
im=Image.new('RGB',(1500,1500),'#f6f3eb');d=ImageDraw.Draw(im)
font='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
def txt(p,s,n=21,c='#26343c'):d.text(p,s,font=ImageFont.truetype(font,n),fill=c)
scale=32;cx=650;cz=650
# World +X is west, +Z is north. Plan is north-up and west-left.
def pt(x,z):return(cx-x*scale,cz-(z-354.1)*scale)
def rect(x0,z0,x1,z1,fill,outline='#687378',width=1):
 a=pt(x1,z1);b=pt(x0,z0);d.rectangle([a,b],fill=fill,outline=outline,width=width)
txt((35,22),'交泰殿 R54：三面罩架与低地平 · 可逆拟合平面',34)
txt((35,78),'19 × 19 m 为项目保留轮廓；全部新尺寸是照片比例拟合，不是实测或历史复原。',23)
rect(-9.5,344.6,9.5,363.6,'#e6e3da','#786957',6)
# Draw actual new colliders, not a decorative substitute layout.
for row in data['boxes']:
 if row['min'][1]>4.3:continue
 c='#c6b99b' if 'row' in row['id'] or 'cover' in row['id'] else '#62666a' if 'chair' in row['id'] else '#c9c7bf'
 rect(row['min'][0],row['min'][2],row['max'][0],row['max'][2],c)
# R27 fixed near-object footprints, retained without scaling.
rect(5.288793103448276,353.0293103448276,7.011206896551725,355.1706896551724,'#b9b8b5')
rect(-7.206,352.84,-4.566,355.36,'#b9b8b5')
rect(-1.596,359.934,1.596,360.234,'#8e7869')
# Architectural door opening bands are the retained dimensions.
for x,z,axis in [(0,344.6,'x'),(0,363.6,'x'),(-9.5,354.1,'z'),(9.5,354.1,'z')]:
 if axis=='x':a,b=pt(x-2.826667,z),pt(x+2.826667,z)
 else:a,b=pt(x,z-2.826667),pt(x,z+2.826667)
 d.line([a,b],fill='#f6f3eb',width=9)
route=[pt(x,z) for x,z in data['route']];d.line(route,fill='#26839a',width=4)
for i in [0,3,6,9,15,21,27,30]:
 x,y=route[i];d.ellipse((x-5,y-5,x+5,y+5),fill='#19768c');txt((x+8,y-14),str(i+1),16)
for c in data['proof']['cameras']:
 x,y=pt(c['position'][0],c['position'][2]);d.ellipse((x-7,y-7,x+7,y+7),fill='#ac573e')
txt((1120,160),'北 ↑',26);txt((1120,202),'西 ←  +X',23)
for label,x,z in [('保留自鸣钟',6.15,354.1),('保留铜壶滴漏',-6.15,354.1),('低地平 / 深色椅',0,357.3),('保留屏 / 匾',0,360.65),('后列罩架',0,359.0),('西侧罩架',3.3,356.7),('东侧罩架',-3.3,356.7)]:
 px,py=pt(x,z);txt((px-58,py-18),label,18)
txt((1120,275),'新几何：',22);txt((1120,315),'浅色低台',21);txt((1120,353),'深色开腿椅',21);txt((1120,391),'三面黄罩分组',21);txt((1120,429),'可辨小几 / 器物',21)
txt((1120,500),'蓝线：控制器回放',20);txt((1120,535),'红点：合法相机',20);txt((1120,570),'非历史参观路线',20)
txt((1120,620),'图省略外侧阶梯段',20)
lines=[
'保留：19 m 壳、四门 / 折叠门扇、R27 钟漏双 LOD、R28 匾 / 藻井；红屏与两侧竖框仅向下延展。',
'移除：旧 20 个通用网格及 3 个家具碰撞盒；不按颜色或材质批量删除。',
'可辨数量：后列 4 个独立肩线 + 1 个椅后局部轮廓；钟近照至少 3 个独立肩线。',
'遮挡 / 裁边：侧列总数、隐藏箱体、内衬及所藏玺件未知；不凑成“25 方原玺”。',
'本模型：每侧 3 个可辨罩形样本 + 前部可见红箱；后列 5 个轮廓样本，其中中央注明局部遮挡。',
'导航：新支承只来自低台实际顶面，rescue=false；家具 / 屏碰撞由可见几何包络注册。',
'检查：10/60 Hz，前进 / 后退，普通 / 冲刺，共 8 条完整四门环行；无碰撞缩小、无支承救回。',
'来源：故宫博物院官方交泰殿正面陈列图及钟近照；URL 路径 2026/03/20 不是拍摄日期。',
'阶段：'+data['stage']+'。本图不是浏览器 / GPU 截图，也不是整体还原验收。',
]
for i,s in enumerate(lines):txt((35,1110+i*38),s,20)
im.save(base/'annotated-plan.png')
