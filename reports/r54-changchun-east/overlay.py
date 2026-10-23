"""Source annotations and plan derived from the actual white triangle export."""
import gzip,json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).parent
font=lambda s:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',s)
# The separate original is unchanged; colored rectangles identify evidence,
# never invent new source detail or replace the original photograph.
source=Image.open(R/'source-original.jpg').convert('RGB');canvas=Image.new('RGB',(1400,1080),'#f4f1e9');canvas.paste(source,(20,42));d=ImageDraw.Draw(canvas)
regions=[((22,142,750,394),'#b78020','A: High horizontal timber registers'),((23,391,748,979),'#247eb0','B: Drawn curtains and edging'),((175,449,641,783),'#a45470','C: Recessed rear vertical fields')]
for (x0,y0,x1,y1),color,label in regions:d.rectangle((x0+20,y0+42,x1+20,y1+42),outline=color,width=4)
d.text((20,12),'Official Palace Museum source photograph / image 1459',font=font(20),fill='#263039')
notes=[('CHANGCHUN EAST END ALCOVE',24,'#263039'),('Caption: east end alcove',19,'#263039'),('Photography date: UNKNOWN',19,'#263039'),('Restoration/display campaign: UNKNOWN',17,'#263039'),('',17,'#263039')]
for _,color,label in regions:notes.extend([(label,19,color),('',10,color)])
notes += [('Visible relationship, not a survey:',19,'#263039'),('frame > drawn cloth > rear display.',19,'#263039'),('',14,'#263039'),('Six central fields can be distinguished,',17,'#263039'),('but partly hidden edge strips prevent',17,'#263039'),('a reliable TOTAL leaf count.',17,'#263039'),('Model retains the six central plain fields.',17,'#263039'),('',14,'#263039'),('WITHHELD:',19,'#263039'),('paintings, calligraphy, lanterns,',17,'#263039'),('carving, textile motifs and hidden joinery.',17,'#263039'),('',14,'#263039'),('All model depths, heights and folds are',17,'#263039'),('reversible FITS, not measured originals.',17,'#263039'),('No Cixi-year or full-restoration claim.',17,'#263039')]
y=65
for line,size,color in notes:d.text((840,y),line,font=font(size),fill=color);y+=size+13
canvas.save(R/'source-annotated.png')
rows=json.load(gzip.open(R/'white-front.json.gz','rt'))['triangles'];summary=json.loads((R/'white-geometry-and-collision.json').read_text())
im=Image.new('RGB',(1200,820),'#f4f1e9');d=ImageDraw.Draw(im);scale=31;project=lambda p:(600+p[0]*scale,400-p[2]*scale);sectionY=2.3
for added,color,width in [(False,'#71665a',2),(True,'#c34d33',3)]:
 for row in rows:
  if row['addition']!=added:continue
  pts=[]
  for a,b in zip(row['v'],row['v'][1:]+row['v'][:1]):
   if (a[1]<sectionY)!=(b[1]<sectionY):
    t=(sectionY-a[1])/(b[1]-a[1]);pts.append([a[k]+t*(b[k]-a[k]) for k in range(3)])
  if len(pts)==2:d.line([project(p) for p in pts],fill=color,width=width)
b=summary['addition']['bounds'];d.rectangle([project([b['min']['x'],0,b['max']['z']]),project([b['max']['x'],0,b['min']['z']])],outline='#c34d33',width=1)
route=[[0,0,-10],[0,0,-1.2],[-10.84,0,-1.2],[-10.84,0,2.55]];d.line([project(p) for p in route],fill='#2186b2',width=4)
for x,z in [(-10.84,-1.2),(-9.65,1.1)]:
 a=project([x,0,z]);d.ellipse((a[0]-6,a[1]-6,a[0]+6,a[1]+6),fill='#166b49')
d.text((24,20),'R54 Changchun: actual geometry section and bounded east replacement',font=font(23),fill='#263039')
d.text((24,57),'Section y = 2.30 m from production triangles. North = +Z, east = -X. NOT a measured palace plan.',font=font(16),fill='#263039')
d.text((120,130),'East: layered frame / cloth / rear field',font=font(16),fill='#c34d33');d.text((710,135),'West kang / central five screens retained',font=font(16),fill='#71665a')
d.text((24,720),'Red: new real section + full footprint. Brown: retained section. Blue: actual tested approach.',font=font(16),fill='#263039')
d.text((24,750),'Green: legal eye-height CPU cameras. No rooms, walkables, spawn points or map entries added.',font=font(16),fill='#263039')
d.text((24,780),'Curtains and backing are deliberately partial fitted forms. No GPU / runtime visual acceptance claimed.',font=font(16),fill='#263039')
im.save(R/'actual-geometry-plan-overlay.png')
for label in ['white','material']:
 if not (R/f'{label}-front.png').exists():continue
 sheet=Image.new('RGB',(1920,1232))
 for i,name in enumerate(['before-front',f'{label}-front','before-oblique',f'{label}-oblique']):sheet.paste(Image.open(R/f'{name}.png'),((i%2)*960,(i//2)*616))
 sheet.save(R/f'same-camera-before-{label}.png')
