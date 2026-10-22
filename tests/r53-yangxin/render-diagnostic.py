"""CPU perspective rasterizer and annotated technical plan from actual geometry.
Not a WebGL screenshot, calibrated photography, texture/material acceptance,
or historical reconstruction. Retained B/S geometry is neutral gray.
"""
import sys,json,math,numpy as np
from PIL import Image,ImageDraw,ImageFont
src,out=sys.argv[1:3]; data=json.load(open(src)); W,H=1400,1000
partial='BASIC_FORMS_PARTIAL' in data['plan']['stage']
suffix='basic-forms' if partial else 'white-model'
font='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
def F(n):return ImageFont.truetype(font,n)
def text(d,p,t,n=22,c='#24303a'):d.text(p,t,font=F(n),fill=c)
def render(name,cam,target,title,sub,fov=72):
 cam=np.array(cam,float);forward=np.array(target,float)-cam;forward/=np.linalg.norm(forward);right=np.cross(forward,[0,1,0]);right/=np.linalg.norm(right);up=np.cross(right,forward)
 pixels=np.full((H,W,3),241,dtype=np.uint8);buf=np.full((H,W),np.inf);f=(W/2)/math.tan(math.radians(fov)/2);light=np.array([-.35,.8,-.45]);light/=np.linalg.norm(light)
 for row in data['triangles']:
  v=np.array(row['v']);normal=np.cross(v[1]-v[0],v[2]-v[0]);ln=np.linalg.norm(normal)
  if ln<1e-9:continue
  normal/=ln;facing=np.dot(normal,cam-v.mean(0))
  if row['side']==0 and facing<=0:continue
  if facing<0:normal=-normal
  color=np.array([int(row['color'][i:i+2],16) for i in (1,3,5)]);color=np.clip(color*(.66+.34*max(0,np.dot(normal,light))),0,255).astype(np.uint8)
  q=np.stack([(v-cam)@right,(v-cam)@up,(v-cam)@forward],axis=-1);poly=[]
  # Near-plane clipping is necessary for the actual large retained shell.
  for i in range(3):
   a,b=q[i-1],q[i];aa=a[2]>=.04;bb=b[2]>=.04
   if aa!=bb:poly.append(a+(.04-a[2])/(b[2]-a[2])*(b-a))
   if bb:poly.append(b)
  for i in range(1,len(poly)-1):
   xyz=np.array([poly[0],poly[i],poly[i+1]]);q=np.stack([W/2+f*xyz[:,0]/xyz[:,2],H/2-f*xyz[:,1]/xyz[:,2],xyz[:,2]],axis=-1)
   x0=max(0,int(np.floor(q[:,0].min())));x1=min(W-1,int(np.ceil(q[:,0].max())));y0=max(0,int(np.floor(q[:,1].min())));y1=min(H-1,int(np.ceil(q[:,1].max())))
   if x1<x0 or y1<y0:continue
   a,b,c=q;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
   if abs(den)<1e-10:continue
   xx,yy=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5);u=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den;w=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den;t=1-u-w
   with np.errstate(divide='ignore',invalid='ignore'):depth=1/(u/a[2]+w/b[2]+t/c[2])
   old=buf[y0:y1+1,x0:x1+1];mask=(u>=-1e-8)&(w>=-1e-8)&(t>=-1e-8)&(depth<old)&(depth>0);old[mask]=depth[mask];pixels[y0:y1+1,x0:x1+1][mask]=color
 im=Image.fromarray(pixels);d=ImageDraw.Draw(im);d.rectangle([0,0,W,92],fill='#f7f5f0');text(d,(24,10),title,30);text(d,(24,54),sub,19);d.rectangle([0,H-70,W,H],fill='#f7f5f0');text(d,(24,H-60),'CPU 实际网格诊断；同视向近似，镜位 / 视场为拟合。非照片匹配、非 WebGL 验收。',20);text(d,(24,H-31),f'camera={cam.tolist()}  target={target}  FOV={fov}°  +X=西，+Z=北；灰色为保留 B/S 几何。',17);im.save(out+'/'+name+'.png')
render('qinzheng-'+suffix,[11.6,2.55,-4.9],[11.6,2.15,-.1],'勤政亲贤：从南向北看北墙炕位 · '+('有限基础形制/材质' if partial else '白模'),'对应宫博现陈列照片 236442-5.jpg；来源关系与拟合尺寸分开记录；木、漆、布色为基础近似，雕饰、织纹、字画未复刻。')
render('sanxitang-'+suffix,[17.15,2.65,-3.35],[15.5,2,-5.1],'三希堂：从西北向东南看南窗炕位 · '+('有限基础形制/材质' if partial else '白模'),'对应宫博照片 236442-6.jpg 及 2023 论文 p129 数字复原视向；座朝西，匾在东墙；前窗为保留纹理平面，本诊断不显示纹理。',84)
# North-up source-to-model fit plan. West is left on the image, +X in the model.
im=Image.new('RGB',(1600,1320),'#f8f6f0');d=ImageDraw.Draw(im);text(d,(35,20),'养心殿西暖阁：来源分层与可逆分间平面',38);text(d,(35,78),'北向上，西向左。实线为本轮模型，不等同实测或清代复原。所有门宽 / 家具 / 墙厚均属兼容拟合。',23)
scale=90;left=110;top=230;west=17.8;north=1.2
def pt(x,z):return(left+(west-x)*scale,top+(north-z)*scale)
def rect(a,b,fill,outline=None,width=1):d.rectangle([pt(b[0],b[1]),pt(a[0],a[1])],fill=fill,outline=outline,width=width)
# Empty rear deliberately not populated.
d.rectangle([left,140,left+1100,top+30],fill='#e7e4de');text(d,(left+25,148),'后佛堂 / 梅坞：本轮未建、未摆家具，不代表空房',24)
for b in data['boxes']:
 # Slice below lintels so the actual apertures are legible.
 if b['min'][1]>2.5:continue
 rect([b['min'][0],b['min'][2]],[b['max'][0],b['max'][2]],'#aaa99f' if 'kang' not in b['name'] and 'desk' not in b['name'] else '#cdbfa5')
for name,x,z in [('东夹道',7.45,-2.2),('勤政亲贤',11.6,-3.1),('三希堂北部',16.3,-1.2),('南小室',16.3,-3.65)]:
 x,y=pt(x,z);text(d,(x-45,y-18),name,20)
route=[pt(x,z) for x,z in data['plan']['route']];d.line(route,fill='#237e9a',width=6)
for i,(x,y) in enumerate(route):d.ellipse([x-5,y-5,x+5,y+5],fill='#237e9a');text(d,(x+6,y-28),str(i+1),16,'#125b77')
for a,b in [(-5.9,-1.5),(1.5,1.2)]:
 if a<=b:d.line([pt(6,a),pt(6,b)],fill='#735c49',width=8)
x,y=pt(6,-.84);text(d,(x+10,y-26),'旧 x=6 门洞',20);text(d,(x+10,y+5),'实净宽 2.88 m',17)
x,y=pt(17.5,-5.55);d.line([pt(17.5,-5.55),pt(6.32,-5.55)],fill='#ad8e54',width=3);text(d,(1235,310),'原前窗 z=-6.3',20);text(d,(1235,342),'前界兼容带 0.75 m',20)
text(d,(1235,200),'N 北 ↑',27);text(d,(1235,250),'W 西 ←',24)
lines=[
'史料尺寸：总宽 10.15 m，总深 11.56 m（2023 p123）。',
'东夹道 2.14 × 5.15 m；勤政亲贤 5.04 × 5.15 m；三希堂 2.12 × 6 m。',
'变换：x = 6.32 + u × 1.101478；z = -5.55 + v × 1.048544。',
'南部深度残差 +0.25 m；总宽残差 +1.03 m。两条厚隔带各 0.468 m，仅为模型分配。',
'三室净宽合计 9.30 m，比总宽少 0.85 m；来源未明确差额归属，不称实测墙厚。',
'三希堂 6−5.15=0.85 m，与 p123 北伸 0.77 m 差 0.08 m，保留差异，不静默对齐。',
'照片 URL 日期为 2026-04-30，拍摄时间未知。勤政亲贤现匾属 1960 年代集字复原。',
'通行线：旧门 → 东夹道南转 → 勤政亲贤北转 → 三希堂 → 南小室。蓝线不是历史路线测绘。',
'来源：故宫博物院《紫禁城》2023/07，张杰，p123 / 125 / 127 / 129；宫博建筑页 236442。']
for i,line in enumerate(lines):text(d,(40,905+i*38),line,20)
im.save(out+('/annotated-plan-basic-forms.png' if partial else '/annotated-plan.png'))
