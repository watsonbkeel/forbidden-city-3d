"""Perspective CPU z-buffer of actual Duixiu mountain / pavilion before/after fragment.
No browser/GPU, texture, shadow, postprocessing, or historical acceptance claim.
"""
import gzip, json, math, sys, hashlib
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
source=Path(sys.argv[1]);out=Path(sys.argv[2]);data=json.load(gzip.open(source,'rt'))
if 'geometryRef' in data:
 raw=(source.parent/data['geometryRef']).read_bytes()
 if data.get('geometrySha256') and hashlib.sha256(raw).hexdigest()!=data['geometrySha256']:raise SystemExit('Geometry archive hash mismatch')
 data['triangles']=json.loads(gzip.decompress(raw))
W,H=data.get('diagnosticSize',[960,540])
cam=np.array(data['camera']['position'],dtype=float)
view=np.array(data['camera']['matrixWorldInverse']).reshape(4,4).T
focal=H/(2*np.tan(np.deg2rad(data['camera']['fov'])/2))
pixels=np.empty((H,W,3),dtype=np.float32);pixels[:]=[.57,.65,.72]
depthbuf=np.full((H,W),np.inf);character_mask=np.zeros((H,W),dtype=bool)
light=np.array([-.6,.8,.5] if '--rear-light' in sys.argv else [-.6,.8,-.2]);light/=np.linalg.norm(light)
texture=np.asarray(Image.open(Path(__file__).resolve().parents[2]/'public/textures/hd/rock.webp').convert('RGB'),dtype=float)/255
texture=np.where(texture<=.04045,texture/12.92,((texture+.055)/1.055)**2.4)
textured='--textured' in sys.argv
count=0
for row in data['triangles']:
 v=np.array(row['v'],dtype=float);c=np.array(row.get('materialC',row['c']) if textured else row['c'],dtype=float);n=np.array(row['n'],dtype=float)
 fn=np.cross(v[1]-v[0],v[2]-v[0]);length=np.linalg.norm(fn)
 if length<1e-12:continue
 facing=np.dot(fn,cam-v.mean(axis=0))
 if row['side']==0 and facing<=0:continue
 if row['side']==1 and facing>=0:continue
 # Clip positions, colors, and normals together before perspective projection.
 q=(np.column_stack([v,np.ones(3)])@view.T)[:,:3];polygon=[np.r_[p,cc,nn,uu] for p,cc,nn,uu in zip(q,c,n,row.get('uv',[[0,0]]*3))];clipped=[]
 for a,b in zip(polygon,polygon[1:]+polygon[:1]):
  da=-a[2]-.030001;db=-b[2]-.030001
  if da>=0:clipped.append(a)
  if (da>=0)!=(db>=0):clipped.append(a+(b-a)*da/(da-db))
 for i in range(1,len(clipped)-1):
  tri=np.array([clipped[0],clipped[i],clipped[i+1]]);q=tri[:,:3];c=tri[:,3:6];n=tri[:,6:9];uv=tri[:,9:11];z=-q[:,2]
  x=W/2+focal*q[:,0]/z;y=H/2-focal*q[:,1]/z
  x0=max(0,int(np.floor(x.min())));x1=min(W-1,int(np.ceil(x.max())));y0=max(0,int(np.floor(y.min())));y1=min(H-1,int(np.ceil(y.max())))
  if x1<x0 or y1<y0:continue
  den=(y[1]-y[2])*(x[0]-x[2])+(x[2]-x[1])*(y[0]-y[2])
  if abs(den)<1e-10:continue
  xx,yy=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5)
  a=((y[1]-y[2])*(xx-x[2])+(x[2]-x[1])*(yy-y[2]))/den;b=((y[2]-y[0])*(xx-x[2])+(x[0]-x[2])*(yy-y[2]))/den;cc=1-a-b
  inv=a/z[0]+b/z[1]+cc/z[2];depth=1/np.maximum(inv,1e-20);old=depthbuf[y0:y1+1,x0:x1+1]
  mask=(a>=-1e-8)&(b>=-1e-8)&(cc>=-1e-8)&(depth<old)
  if not np.any(mask):continue
  weights=np.stack([a/z[0],b/z[1],cc/z[2]],axis=-1)/inv[...,None]
  colors=weights@c
  if textured and row.get('rock'):
   texuv=weights@uv;tx=np.floor((texuv[...,0]%1)*texture.shape[1]).astype(int)%texture.shape[1];ty=np.floor((1-texuv[...,1]%1)*texture.shape[0]).astype(int)%texture.shape[0];colors*=texture[ty,tx]
  normal=weights@n;normal/=np.maximum(np.linalg.norm(normal,axis=-1)[...,None],1e-9)
  if facing<0:normal=-normal
  shade=.25+.75*np.maximum(0,normal@light)
  pixels[y0:y1+1,x0:x1+1][mask]=np.clip(colors*shade[...,None],0,1)[mask]
  old[mask]=depth[mask];character_mask[y0:y1+1,x0:x1+1][mask]=row.get('character',False);count+=1
pixels=np.where(pixels<=.0031308,pixels*12.92,1.055*np.maximum(pixels,0)**(1/2.4)-.055)
im=Image.fromarray(np.uint8(np.clip(pixels,0,1)*255));canvas=Image.new('RGB',(W,H+76),(25,31,37));canvas.paste(im,(0,0));draw=ImageDraw.Draw(canvas)
try:font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
except:font=ImageFont.load_default()
label=data['label']
lines=[f'{label} | actual bounded fragment; no actors', ('CPU geometry + shipped rock albedo; no normal map/PBR. NOT game/GPU screenshot.' if textured else 'CPU geometry + vertex colors; no textures. NOT game/GPU screenshot.'), 'Photo-informed surface fit; original cave and routes retained. NOT surveyed stones.']
for i,line in enumerate(lines):draw.text((12,H+7+i*22),line,font=font,fill=(231,236,240))
canvas.save(out)
summary={'source':str(source),'image':str(out),'kind':'CPU actual-scene geometry diagnostic; no browser/GPU acceptance','lightDirection':light.tolist(),'sourceTriangles':len(data['triangles']),'rasterizedTriangles':count,'sourceCharacterInstances':data.get('sourceCharacterInstances',0),'visibleCharacterPixels':int(character_mask.sum()),'camera':data['camera'],'width':W,'height':H}
out.with_suffix('.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary),flush=True)
if count==0:raise SystemExit('No visible architecture triangles in actual scene capture')
