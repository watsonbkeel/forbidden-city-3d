"""Actual production triangles, flat CPU palette only, NEVER browser/text proof.
Usage: python3 render-nameboard.py capture.json.gz output.png
"""
import gzip,json,sys
import numpy as np
from PIL import Image,ImageDraw
r=json.load(gzip.open(sys.argv[1],'rt')); c=r['camera']; W,H=c['width'],c['height']
view=np.array(c['matrixWorldInverse']).reshape(4,4).T; eye=np.array(c['eye'])
f=H/(2*np.tan(np.deg2rad(c['fov'])/2)); zbuf=np.full((H,W),np.inf)
pixels=np.zeros((H,W,3),dtype=np.uint8);pixels[:]=[145,165,182]
for row in r['triangles']:
 v=np.array(row['v']); n=np.cross(v[1]-v[0],v[2]-v[0]);facing=np.dot(n,eye-v.mean(axis=0))
 if (row['side']==0 and facing<=0) or (row['side']==1 and facing>=0):continue
 q=(np.column_stack([v,np.ones(3)])@view.T)[:,:3]; poly=[]
 for a,b in zip(q,np.roll(q,-1,axis=0)):
  da=-a[2]-.030001;db=-b[2]-.030001
  if da>=0:poly.append(a)
  if (da>=0)!=(db>=0):poly.append(a+(b-a)*da/(da-db))
 for j in range(1,len(poly)-1):
  t=np.array([poly[0],poly[j],poly[j+1]]);z=-t[:,2];x=W/2+f*t[:,0]/z;y=H/2-f*t[:,1]/z
  x0=max(0,int(np.floor(x.min())));x1=min(W-1,int(np.ceil(x.max())));y0=max(0,int(np.floor(y.min())));y1=min(H-1,int(np.ceil(y.max())))
  if x1<x0 or y1<y0:continue
  den=(y[1]-y[2])*(x[0]-x[2])+(x[2]-x[1])*(y[0]-y[2])
  if abs(den)<1e-10:continue
  xx,yy=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5)
  a=((y[1]-y[2])*(xx-x[2])+(x[2]-x[1])*(yy-y[2]))/den;b=((y[2]-y[0])*(xx-x[2])+(x[0]-x[2])*(yy-y[2]))/den;cc=1-a-b
  depth=1/np.maximum(a/z[0]+b/z[1]+cc/z[2],1e-30);old=zbuf[y0:y1+1,x0:x1+1]
  mask=(a>=-1e-9)&(b>=-1e-9)&(cc>=-1e-9)&(depth<old);old[mask]=depth[mask]
  color=row['color'].lstrip('#');pixels[y0:y1+1,x0:x1+1][mask]=[int(color[k:k+2],16) for k in (0,2,4)]
im=Image.fromarray(pixels);out=Image.new('RGB',(W,H+52),(24,30,36));out.paste(im,(0,0));d=ImageDraw.Draw(out)
d.text((10,H+6),r['view']+' '+r['state']+' | CPU flat-palette geometry ONLY; no text/texture, lighting or GPU.',fill='white')
d.text((10,H+28),'Retained mount: upper frame area occluded by rafters. NOT source-camera matched or visual acceptance.',fill='white')
out.save(sys.argv[2])
