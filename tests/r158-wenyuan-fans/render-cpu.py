"""CPU perspective-correct UV proof using actual decoded project WebP assets; not GPU."""
import gzip,json,sys
import numpy as np
from PIL import Image,ImageDraw
D=json.load(gzip.open(sys.argv[1],'rt'));C=D['camera'];W,H=C['width'],C['height'];M=np.array(C['matrixWorldInverse']).reshape(4,4).T;eye=np.array(C['eye']);f=H/(2*np.tan(np.deg2rad(C['fov'])/2));pix=np.full((H,W,3),[180,184,189],dtype=np.uint8);depth=np.full((H,W),np.inf);textures={}
for row in D['triangles']:
 V=np.array(row['v']);normal=np.cross(V[1]-V[0],V[2]-V[0]);length=np.linalg.norm(normal)
 if length<1e-12:continue
 normal/=length;front=np.dot(normal,eye-V.mean(axis=0))
 if row['side']==0 and front<=0:continue
 if row['side']==1 and front>=0:continue
 P=(np.column_stack((V,np.ones(3)))@M.T)[:,:3];UV=np.array(row['uv']);poly=[np.r_[P[i],UV[i]] for i in range(3)];clip=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  da=-a[2]-.030001;db=-b[2]-.030001
  if da>=0:clip.append(a)
  if (da>=0)!=(db>=0):clip.append(a+(b-a)*da/(da-db))
 tex=None
 if row['texture']:
  name=row['texture']
  if name not in textures:textures[name]=np.array(Image.open(name).convert('RGB'))
  tex=textures[name]
 for j in range(1,len(clip)-1):
  tri=np.array([clip[0],clip[j],clip[j+1]]);z=-tri[:,2];x=W/2+f*tri[:,0]/z;y=H/2-f*tri[:,1]/z;x0=max(0,int(np.floor(x.min())));x1=min(W-1,int(np.ceil(x.max())));y0=max(0,int(np.floor(y.min())));y1=min(H-1,int(np.ceil(y.max())))
  if x0>x1 or y0>y1:continue
  den=(y[1]-y[2])*(x[0]-x[2])+(x[2]-x[1])*(y[0]-y[2])
  if abs(den)<1e-10:continue
  xx,yy=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5);a=((y[1]-y[2])*(xx-x[2])+(x[2]-x[1])*(yy-y[2]))/den;b=((y[2]-y[0])*(xx-x[2])+(x[0]-x[2])*(yy-y[2]))/den;c=1-a-b;inv=a/z[0]+b/z[1]+c/z[2];dz=1/np.maximum(inv,1e-20);old=depth[y0:y1+1,x0:x1+1];mask=(a>=-1e-8)&(b>=-1e-8)&(c>=-1e-8)&(dz<old)
  if not mask.any():continue
  old[mask]=dz[mask]
  if tex is not None:
   u=(a*tri[0,3]/z[0]+b*tri[1,3]/z[1]+c*tri[2,3]/z[2])*dz;v=(a*tri[0,4]/z[0]+b*tri[1,4]/z[1]+c*tri[2,4]/z[2])*dz;th,tw=tex.shape[:2];color=tex[((1-v%1)*th).astype(int)%th,((u%1)*tw).astype(int)%tw]
  else:color=np.broadcast_to((np.array(row['color'])*255).astype(np.uint8),(y1-y0+1,x1-x0+1,3))
  shade=.72+.28*abs(np.dot(normal,np.array([-.3,.9,-.3])));pix[y0:y1+1,x0:x1+1][mask]=(color[mask]*shade).clip(0,255).astype(np.uint8)
im=Image.new('RGB',(W,H+48),(25,28,32));im.paste(Image.fromarray(pix));draw=ImageDraw.Draw(im);draw.text((12,H+6),f"WENYUAN GROUND PAIRED SILHOUETTES {D['state'].upper()} | actual mesh / coarse photo-fit colour | CPU, NOT GPU",fill='white');draw.text((12,H+26),'Two fitted silhouettes inside original seat footprint; no material/pattern/survey claim.',fill='white');im.save(sys.argv[2]);print(sys.argv[2])
