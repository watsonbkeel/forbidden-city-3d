"""Read-only actual collider/mesh-bound plan diagnostic; not a GPU view."""
import json,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
before=json.load(open(sys.argv[1]));after=json.load(open(sys.argv[2]));out=Path(sys.argv[3])
W,H=650,730;im=Image.new('RGB',(W*2,H),(25,31,37));d=ImageDraw.Draw(im)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
route=[[0,-10.8],[0,-3],[0,.4],[3.8,.4],[3.8,7.25],[0,7.25],[0,10.8],[0,7.25],[-3.8,7.25],[-3.8,0],[-10.8,0],[-3.8,0],[-3.8,-3],[3.8,-3],[10.8,0],[3.8,0],[0,-3],[0,-10.8]]
for panel,(data,label) in enumerate([(before,'R54 BEFORE'),(after,'R55 AFTER')]):
 def point(x,z):return(panel*W+325+x*20,340-z*20)
 def box(b,fill=None,outline=None,width=1):
  a=point(b['min'][0],b['max'][2]-65);c=point(b['max'][0],b['min'][2]-65);d.rectangle([a,c],fill=fill,outline=outline,width=width)
 d.rectangle([point(-14,14),point(14,-14)],fill=(56,59,60))
 for b in data['colliders']:
  if b['max'][1]>8.95 and b['min'][1]<10.3:box(b,fill=(91,86,81),outline=(147,138,128))
 for m in data['meshes']:
  if m['name'] in ['内殿柱','外廊檐柱']:
   x=(m['min'][0]+m['max'][0])/2;z=(m['min'][2]+m['max'][2])/2-65;px,py=point(x,z);d.ellipse([px-8,py-8,px+8,py+8],fill=(196,177,139))
 if data.get('display'):
  for b in data['display']['colliders']:box(b,outline=(89,219,220),width=2)
 else:
  box({'min':[-2.28,8.6,64.9],'max':[2.28,11.6,71.4]},outline=(247,163,74),width=3)
 d.line([point(x,z)for x,z in route],fill=(115,223,142),width=2)
 for p in data['structure']['portals']:
  if p['state']=='open-for-playable-route':
   px,py=point(p['center'][0],p['center'][1]-65);d.ellipse([px-6,py-6,px+6,py+6],fill=(237,230,143));d.text((px+8,py-8),p['side'],font=font,fill='white')
 d.text((panel*W+22,12),label+' | true world X/Z, north up',font=font,fill='white')
 d.text((panel*W+22,645),'Brown: original walls / doors; tan: retained columns',font=font,fill='white')
 d.text((panel*W+22,668),'Green: R55 controller-tested path (R54 line is comparison only)',font=font,fill=(115,223,142))
 d.text((panel*W+22,691),'Orange: deleted 3 m ghost envelope; cyan: actual new owners',font=font,fill=(89,219,220))
im.save(out)
