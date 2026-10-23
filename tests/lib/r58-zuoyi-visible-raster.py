"""Actual full-gate CPU textured perspective z-buffer, never browser/GPU evidence."""
import gzip,json,sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
source,out=map(Path,sys.argv[1:]);data=json.load(gzip.open(source,'rt'));W,H=900,650
cam=np.array(data['camera']['position']);view=np.array(data['camera']['matrixWorldInverse']).reshape(4,4).T
focal=H/(2*np.tan(np.deg2rad(data['camera']['fov'])/2));pixels=np.empty((H,W,3));pixels[:]=[.38,.43,.47];depthbuf=np.full((H,W),np.inf)
textures={i:np.array(Image.open(m['file']).convert('RGB'))/255 for i,m in enumerate(data['maps']) if m}
light=np.array([-.5,.85,-.3]);light/=np.linalg.norm(light);count=0;idsbuf=np.full((H,W),-1,dtype=int)
for row in data['triangles']:
 v=np.array(row['v']);n=np.array(row['n']);uv=np.array(row['uv']);fn=np.cross(v[1]-v[0],v[2]-v[0]);facing=np.dot(fn,cam-v.mean(axis=0))
 if np.linalg.norm(fn)<1e-12 or (row['side']==0 and facing<=0) or (row['side']==1 and facing>=0):continue
 q=(np.column_stack([v,np.ones(3)])@view.T)[:,:3];polygon=[np.r_[p,nn,uu] for p,nn,uu in zip(q,n,uv)];clipped=[]
 for a,b in zip(polygon,polygon[1:]+polygon[:1]):
  da=-a[2]-.030001;db=-b[2]-.030001
  if da>=0:clipped.append(a)
  if (da>=0)!=(db>=0):clipped.append(a+(b-a)*da/(da-db))
 for i in range(1,len(clipped)-1):
  tri=np.array([clipped[0],clipped[i],clipped[i+1]]);q=tri[:,:3];n=tri[:,3:6];uv=tri[:,6:8];z=-q[:,2];x=W/2+focal*q[:,0]/z;y=H/2-focal*q[:,1]/z
  x0=max(0,int(np.floor(x.min())));x1=min(W-1,int(np.ceil(x.max())));y0=max(0,int(np.floor(y.min())));y1=min(H-1,int(np.ceil(y.max())))
  if x1<x0 or y1<y0:continue
  den=(y[1]-y[2])*(x[0]-x[2])+(x[2]-x[1])*(y[0]-y[2])
  if abs(den)<1e-10:continue
  xx,yy=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5);a=((y[1]-y[2])*(xx-x[2])+(x[2]-x[1])*(yy-y[2]))/den;b=((y[2]-y[0])*(xx-x[2])+(x[0]-x[2])*(yy-y[2]))/den;c=1-a-b
  inv=a/z[0]+b/z[1]+c/z[2];depth=1/np.maximum(inv,1e-20);old=depthbuf[y0:y1+1,x0:x1+1];mask=(a>=-1e-8)&(b>=-1e-8)&(c>=-1e-8)&(depth<old)
  if not np.any(mask):continue
  weights=np.stack([a/z[0],b/z[1],c/z[2]],axis=-1)/inv[...,None];normal=weights@n;normal/=np.maximum(np.linalg.norm(normal,axis=-1)[...,None],1e-9)
  if facing<0:normal=-normal
  color=np.ones((*mask.shape,3))*data['materials'][row['mi']]['color']
  if row['mi'] in textures:
   m=data['maps'][row['mi']];texture=textures[row['mi']];tuv=weights@uv;tuv=np.concatenate([tuv,np.ones((*mask.shape,1))],axis=-1)@np.array(m['matrix']).reshape(3,3)
   u=tuv[...,0];v=tuv[...,1];u=u%1 if m['wrapS']==1000 else np.clip(u,0,1);v=v%1 if m['wrapT']==1000 else np.clip(v,0,1)
   if m['flipY']:v=1-v
   tx=np.clip(np.floor(u*texture.shape[1]).astype(int),0,texture.shape[1]-1);ty=np.clip(np.floor(v*texture.shape[0]).astype(int),0,texture.shape[0]-1);rgb=texture[ty,tx]
   color*=np.where(rgb<=.04045,rgb/12.92,((rgb+.055)/1.055)**2.4)
  shade=.72+.28*np.maximum(0,normal@light);pixels[y0:y1+1,x0:x1+1][mask]=np.clip(color*shade[...,None],0,1)[mask];old[mask]=depth[mask];idsbuf[y0:y1+1,x0:x1+1][mask]=row['mi'];count+=1
pixels=np.where(pixels<=.0031308,pixels*12.92,1.055*np.maximum(pixels,0)**(1/2.4)-.055)
im=Image.fromarray(np.uint8(np.clip(pixels,0,1)*255));canvas=Image.new('RGB',(W,H+84),(22,28,34));canvas.paste(im,(0,0));draw=ImageDraw.Draw(canvas)
try:font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
except:font=ImageFont.load_default()
lines=[f"{data['stage'].upper()} / {data['view']} | actual merged full gate, unchanged walls and platform",'CPU perspective z-buffer + actual project albedo/UV. NOT browser/GPU/photo acceptance.', 'No normal-map lighting, real-time shadows or browser antialiasing. Ground-supported eye: '+str(data['camera']['position'])]
for i,line in enumerate(lines):draw.text((10,H+7+i*23),line,font=font,fill=(230,235,240))
canvas.save(out);summary={'scope':data['scope'],'stage':data['stage'],'view':data['view'],'sourceTriangles':len(data['triangles']),'rasterizedTriangles':count,'camera':data['camera'],'materialPixels':{m['name']:int((idsbuf==i).sum()) for i,m in enumerate(data['materials']) if (idsbuf==i).sum()}}
out.with_suffix('.json').write_text(json.dumps(summary,indent=2)+'\n');print(out,count,flush=True)
