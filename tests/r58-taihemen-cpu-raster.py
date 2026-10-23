"""Same-camera CPU z-buffer of the exported real Taihemen-only geometry.
Flat diagnostic colors, not textures, GPU lighting, screenshots or acceptance.
"""
import gzip,json,sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
source,out=map(Path,sys.argv[1:3]);data=json.load(gzip.open(source,'rt'))
W,H=data['camera']['width'],data['camera']['height'];view=np.array(data['camera']['matrixWorldInverse']).reshape(4,4).T
cam=np.array(data['camera']['eye']);focal=H/(2*np.tan(np.deg2rad(data['camera']['fov'])/2))
pixels=np.full((H,W,3),[203,214,219],dtype=np.float32);depthbuf=np.full((H,W),np.inf)
light=np.array([-.4,.8,-.6]);light/=np.linalg.norm(light);painted=0
for row in data['triangles']:
 v=np.array(row['v'],dtype=float);normal=np.cross(v[1]-v[0],v[2]-v[0]);length=np.linalg.norm(normal)
 if length<1e-12:continue
 normal/=length;facing=np.dot(normal,cam-v.mean(axis=0))
 if row['side']==0 and facing<=0:continue
 if row['side']==1 and facing>=0:continue
 if facing<0:normal=-normal
 q=(np.column_stack([v,np.ones(3)])@view.T)[:,:3];poly=list(q);clipped=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  da=-a[2]-.030001;db=-b[2]-.030001
  if da>=0:clipped.append(a)
  if (da>=0)!=(db>=0):clipped.append(a+(b-a)*da/(da-db))
 base=np.array([int(row['color'][i:i+2],16) for i in (1,3,5)])
 color=np.clip(base*(.52+.48*max(0,np.dot(normal,light))),0,255)
 for i in range(1,len(clipped)-1):
  q=np.array([clipped[0],clipped[i],clipped[i+1]]);z=-q[:,2]
  x=W/2+focal*q[:,0]/z;y=H/2-focal*q[:,1]/z
  x0=max(0,int(np.floor(x.min())));x1=min(W-1,int(np.ceil(x.max())));y0=max(0,int(np.floor(y.min())));y1=min(H-1,int(np.ceil(y.max())))
  if x1<x0 or y1<y0:continue
  den=(y[1]-y[2])*(x[0]-x[2])+(x[2]-x[1])*(y[0]-y[2])
  if abs(den)<1e-10:continue
  xx,yy=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5)
  a=((y[1]-y[2])*(xx-x[2])+(x[2]-x[1])*(yy-y[2]))/den;b=((y[2]-y[0])*(xx-x[2])+(x[0]-x[2])*(yy-y[2]))/den;c=1-a-b
  inv=a/z[0]+b/z[1]+c/z[2];depth=1/np.maximum(inv,1e-20);old=depthbuf[y0:y1+1,x0:x1+1]
  mask=(a>=-1e-8)&(b>=-1e-8)&(c>=-1e-8)&(depth<old)
  old[mask]=depth[mask];pixels[y0:y1+1,x0:x1+1][mask]=color
  if mask.any():painted+=1
im=Image.fromarray(pixels.astype(np.uint8));canvas=Image.new('RGB',(W,H+85),(26,31,36));canvas.paste(im,(0,0));draw=ImageDraw.Draw(canvas)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
lines=[f"TAIHEMEN | {data['view']} | {data['state'].upper()} | actual gate-only triangles",
 'CPU geometry diagnostic, flat material-category colors. NOT browser / GPU screenshot.',
 'Same camera before / after. Four-depth grid unresolved; north / ceiling / door inventory not accepted.']
for i,line in enumerate(lines):draw.text((12,H+8+23*i),line,fill=(230,235,239),font=font)
canvas.save(out);print(json.dumps({'image':str(out),'sourceTriangles':len(data['triangles']),'paintedTriangles':painted,'visiblePixels':int(np.isfinite(depthbuf).sum())}))
if not np.isfinite(depthbuf).any():raise SystemExit('No actual gate geometry visible')
