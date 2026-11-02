"""Same-camera CPU z-buffer of the exported actual central Taihemen geometry.
Actual yulu albedo and diagnostic depth bias; not GPU lighting or screenshot.
"""
import gzip,json,sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
source,out=map(Path,sys.argv[1:3]);data=json.load(gzip.open(source,'rt'));tex=np.array(Image.open('public/textures/hd/yulu.webp').convert('RGB'))
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
  inv=a/z[0]+b/z[1]+c/z[2];depth=1/np.maximum(inv,1e-20);depth=depth-(1e-4 if row.get("depthBias") else 0);old=depthbuf[y0:y1+1,x0:x1+1]
  mask=(a>=-1e-8)&(b>=-1e-8)&(c>=-1e-8)&(depth<old)
  old[mask]=depth[mask]
  if row.get('texture')=='yulu':
   uv=np.array(row['uv']);uu=(a*uv[0,0]/z[0]+b*uv[1,0]/z[1]+c*uv[2,0]/z[2])/np.maximum(inv,1e-20);vv=(a*uv[0,1]/z[0]+b*uv[1,1]/z[1]+c*uv[2,1]/z[2])/np.maximum(inv,1e-20)
   tx=np.rint(np.clip(uu,0,1)*(tex.shape[1]-1)).astype(int);ty=np.rint((1-np.clip(vv,0,1))*(tex.shape[0]-1)).astype(int)
   pixels[y0:y1+1,x0:x1+1][mask]=tex[ty[mask],tx[mask]]
  else:pixels[y0:y1+1,x0:x1+1][mask]=color
  if mask.any():painted+=1
im=Image.fromarray(pixels.astype(np.uint8));canvas=Image.new('RGB',(W,H+85),(26,31,36));canvas.paste(im,(0,0));draw=ImageDraw.Draw(canvas)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
lines=[f"TAIHEMEN CENTRAL | {data['state']} | actual geometry + production dragon texture",
 'CPU clamp/UV diagnostic; unchanged HD yulu pixels. NOT browser or GPU screenshot.',
 'Only two black barriers removed for gameplay. White side rails and stone support retained.']
for i,line in enumerate(lines):draw.text((12,H+8+23*i),line,fill=(230,235,239),font=font)
canvas.save(out);print(json.dumps({'image':str(out),'sourceTriangles':len(data['triangles']),'paintedTriangles':painted,'visiblePixels':int(np.isfinite(depthbuf).sum())}))
if not np.isfinite(depthbuf).any():raise SystemExit('No actual Taihemen geometry visible')
