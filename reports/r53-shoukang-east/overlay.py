"""Technical plan from actual exported triangle/plane intersections, not invented geometry."""
import gzip,json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).parent
font=lambda s:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',s)
rows=json.load(gzip.open(R/'after-front.json.gz','rt'))['triangles']
summary=json.loads((R/'geometry-and-collision.json').read_text())
W,H=1200,850;im=Image.new('RGB',(W,H),'#f5f3ee');d=ImageDraw.Draw(im)
scale=30;project=lambda p:(600+p[0]*scale,400-p[2]*scale)
sectionY=2.0
for added,color,width in [(False,'#615548',2),(True,'#cc4b30',3)]:
 for row in rows:
  if row['role'].startswith('shoukang-east-')!=added:continue
  pts=[]
  for a,b in zip(row['v'],row['v'][1:]+row['v'][:1]):
   if (a[1]<sectionY)!=(b[1]<sectionY):
    t=(sectionY-a[1])/(b[1]-a[1]);pts.append([a[k]+t*(b[k]-a[k]) for k in range(3)])
  if len(pts)==2:d.line([project(p) for p in pts],fill=color,width=width)
# Footprint is exported geometry bounds, kept distinct from the triangle section.
b=summary['addition']['bounds'];x0,z0=b['min']['x'],b['min']['z'];x1,z1=b['max']['x'],b['max']['z']
a=project([x0,0,z1]);c=project([x1,0,z0]);d.rectangle([a,c],outline='#cc4b30',width=1)
x=-8.224820143884892;z=-1.2
for zz in [z-1.3,z+1.3]:
 p=project([x+.7,0,zz]);q=project([x-1.1,0,zz]);d.line([p,q],fill='#168270',width=2)
p=project([x-.7,0,z-1.3]);q=project([x-.7,0,z+1.3]);d.line([p,q],fill='#168270',width=3)
for pt in [p,q]:d.ellipse((pt[0]-4,pt[1]-4,pt[0]+4,pt[1]+4),fill='#168270')
route=[[-5.61,0,-4],[-5.61,0,-1.2],[-10.84,0,-1.2],[-10.84,0,5.8]]
d.line([project(p) for p in route],fill='#228ab0',width=4)
d.text((28,24),'R53 Shoukang: actual old geometry + north-wall addition',font=font(25),fill='#23313a')
d.text((28,60),'Horizontal section at y = 2.0 m, from production triangle intersections. North is +Z.',font=font(17),fill='#23313a')
d.text((200,205),'EAST / scene -X',font=font(16),fill='#23313a');d.text((800,205),'WEST / scene +X',font=font(16),fill='#23313a')
d.text((200,108),'New framework',font=font(16),fill='#cc4b30');d.text((680,390),'Old central seat / screen unchanged',font=font(16),fill='#615548')
d.text((235,500),'2.6 m nominal opening retained',font=font(16),fill='#168270');d.text((235,525),'Existing jamb clear width ~2.48 m',font=font(15),fill='#168270')
d.text((28,725),'Brown: retained actual geometry section. Red: actual new section + thin full-footprint outline.',font=font(17),fill='#23313a')
d.text((28,755),'Blue: tested approach. 12 new collider boxes occupy only local z 7.18 to 8.56, away from the entry.',font=font(17),fill='#23313a')
d.text((28,785),'Not a surveyed palace plan. Fitted dimensions are reversible. CPU diagnostic, not GPU / mobile acceptance.',font=font(16),fill='#23313a')
im.save(R/'actual-geometry-plan-overlay.png')
# Same-camera comparison; the images themselves are unchanged raster outputs.
sheet=Image.new('RGB',(1920,1232))
for i,name in enumerate(['before-front','after-front','before-oblique','after-oblique']):sheet.paste(Image.open(R/f'{name}.png'),((i%2)*960,(i//2)*616))
sheet.save(R/'same-camera-before-after.png')
