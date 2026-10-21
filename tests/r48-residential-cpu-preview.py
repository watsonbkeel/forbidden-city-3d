"""Orthographic z-buffer CPU geometry diagnostic, no texture/WebGL claims."""
import sys,json,numpy as np
from PIL import Image,ImageDraw
source,out=sys.argv[1:3];data=json.load(open(source));rows=data['triangles']
vertices=np.array([r['v'] for r in rows]);target=np.array([0.,6.,-2.]);camera=np.array([-50.,34.,-60.]);forward=target-camera;forward/=np.linalg.norm(forward);right=np.cross(forward,[0,1,0]);right/=np.linalg.norm(right);up=np.cross(right,forward)
projected=np.stack([(vertices-target)@right,-(vertices-target)@up,(vertices-camera)@forward],axis=-1);lo=projected[:,:,:2].reshape(-1,2).min(0);hi=projected[:,:,:2].reshape(-1,2).max(0)
W,H=1600,1050;scale=min((W-100)/(hi[0]-lo[0]),(H-140)/(hi[1]-lo[1]));projected[:,:,:2]=(projected[:,:,:2]-lo)*scale;projected[:,:,0]+=(W-(hi[0]-lo[0])*scale)/2;projected[:,:,1]+=100
buffer=np.full((H,W),np.inf);pixels=np.full((H,W,3),245,dtype=np.uint8);light=np.array([-.4,.8,-.6]);light/=np.linalg.norm(light)
for row,v,q in zip(rows,vertices,projected):
 normal=np.cross(v[1]-v[0],v[2]-v[0]);length=np.linalg.norm(normal)
 if length<1e-10:continue
 normal/=length;facing=np.dot(normal,-forward)
 if row.get('side',0)==0 and facing<=0:continue
 if facing<0:normal=-normal
 col=np.array([int(row['color'][i:i+2],16) for i in (1,3,5)]);col=np.clip(col*(.55+.45*max(0,np.dot(normal,light))),0,255).astype(np.uint8)
 x0=max(0,int(np.floor(q[:,0].min())));x1=min(W-1,int(np.ceil(q[:,0].max())));y0=max(0,int(np.floor(q[:,1].min())));y1=min(H-1,int(np.ceil(q[:,1].max())))
 if x1<x0 or y1<y0:continue
 a,b,c=q;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
 if abs(den)<1e-10:continue
 xx,yy=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5);u=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den;w=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den;t=1-u-w;depth=u*a[2]+w*b[2]+t*c[2];old=buffer[y0:y1+1,x0:x1+1];mask=(u>=-1e-8)&(w>=-1e-8)&(t>=-1e-8)&(depth<old);old[mask]=depth[mask];pixels[y0:y1+1,x0:x1+1][mask]=col
im=Image.fromarray(pixels);draw=ImageDraw.Draw(im);draw.text((30,25),'CPU GEOMETRY DIAGNOSTIC | Fitted flat colors | No textures or WebGL visual acceptance',fill=(20,20,20));im.save(out);print(out)
