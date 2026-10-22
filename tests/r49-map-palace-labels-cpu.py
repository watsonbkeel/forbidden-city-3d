"""Rasterize recorded production map draw commands using installed Noto CJK."""
import json, math, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
out=Path(sys.argv[1]); data=json.loads((out/'draw-commands.json').read_text())
scale=data['scale']; x0,y0,w,h=data['crop']; aa=2
image=Image.new('RGBA',(round(w*scale*aa),round(h*scale*aa)),'#f0ebdc')
def color(value):
 if value.startswith('rgba'):
  r,g,b,a=map(float,re.findall(r'[\d.]+',value));return (int(r),int(g),int(b),round(a*255))
 if value.startswith('#'):return value
 raise ValueError(value)
def p(x,y):return ((x-x0)*scale*aa,(y-y0)*scale*aa)
for command in data['commands']:
 op,args,style=command['op'],command['args'],command['style']
 layer=Image.new('RGBA',image.size); draw=ImageDraw.Draw(layer)
 if op.endswith('Rect'):
  x,y,rw,rh=args; box=(*p(x,y),*p(x+rw,y+rh))
  if op=='fillRect':draw.rectangle(box,fill=color(style))
  else:draw.rectangle(box,outline=color(style['color']),width=max(1,round(style['width']*scale*aa)))
 elif op=='text':
  text,x,y=args; fontsize=float(re.search(r'([\d.]+)px',style['font'])[1])*scale*aa
  font=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-'+('Bold' if style['font'].startswith('bold ') else 'Regular')+'.ttc',round(fontsize))
  draw.text(p(x,y),text,font=font,anchor='mm',fill=color(style['color']))
 else:
  points=[]
  for part in args:
   if part[0] in ('M','L'):points.append(p(*part[1:]))
   elif part[0]=='A':
    x,y,r,a,b=part[1:];points += [p(x+r*math.cos(a+(b-a)*i/48),y+r*math.sin(a+(b-a)*i/48)) for i in range(49)]
   elif part[0]=='Z' and points:points.append(points[0])
  if len(points)>1:
   if op=='fillPath':draw.polygon(points,fill=color(style))
   else:draw.line(points,fill=color(style['color']),width=max(1,round(style['width']*scale*aa)))
 image=Image.alpha_composite(image,layer)
image.resize((round(w*scale),round(h*scale)),Image.Resampling.LANCZOS).convert('RGB').save(out/'six-palaces-cpu.png')
