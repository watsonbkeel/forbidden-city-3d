"""Local Cuishang CPU diagnostic: constant per-triangle vertex tints resolved on export; tiny coplanar bias for negative polygonOffset, not exact GPU depth slope."""
import sys,json,numpy as np
from pathlib import Path
from PIL import Image,ImageDraw
folder=Path(sys.argv[1]);out=sys.argv[2];data=json.loads((folder/'geometry.json').read_text())
cam=np.array(json.loads(sys.argv[3]) if len(sys.argv)>3 else [-3.5,2.3,-9.9],dtype=float);target=np.array(json.loads(sys.argv[4]) if len(sys.argv)>4 else [0,5.8,-6.3],dtype=float)
W,H=1200,900;fov=float(sys.argv[5]) if len(sys.argv)>5 else 66
forward=target-cam;forward/=np.linalg.norm(forward);right=np.cross(forward,[0,1,0]);right/=np.linalg.norm(right);up=np.cross(right,forward);focal=H/(2*np.tan(np.deg2rad(fov)/2))
pixels=np.full((H,W,3),(211,220,224),dtype=np.uint8);depthbuf=np.full((H,W),np.inf);light=np.array([-.4,.8,-.6]);light/=np.linalg.norm(light)
textures={i:np.asarray(Image.open(folder/m['texture']).convert('RGB')) for i,m in enumerate(data['materials']) if m['texture']}
# Independent near-plane clipping: do not drop huge real faces merely because one corner lies behind camera.
clipped=[]
for row in data['triangles']:
 polygon=[np.r_[np.array(v,float),np.array(uv,float)] for v,uv in zip(row['v'],row['uv'] or [[0,0]]*3)]
 output=[]
 for a,b in zip(polygon,polygon[1:]+polygon[:1]):
  da=float((a[:3]-cam)@forward-.030001);db=float((b[:3]-cam)@forward-.030001)
  if da>=0:output.append(a)
  if (da>=0)!=(db>=0):output.append(a+(b-a)*da/(da-db))
 for i in range(1,len(output)-1):
  pts=[output[0],output[i],output[i+1]]
  clipped.append({**row,'v':[p[:3].tolist() for p in pts],'uv':[p[3:].tolist() for p in pts] if row['uv'] else None})
data['triangles']=clipped
for row in data['triangles']:
 v=np.array(row['v']);m=data['materials'][row['material']];normal=np.cross(v[1]-v[0],v[2]-v[0]);nl=np.linalg.norm(normal)
 if nl<1e-10:continue
 normal/=nl;facing=np.dot(normal,cam-v.mean(axis=0))
 if m['side']==0 and facing<=0:continue
 if facing<0:normal=-normal
 p=v-cam;q=np.stack([p@right,p@up,p@forward],axis=-1)
 if np.any(q[:,2]<.03):continue
 z=q[:,2].copy();q[:,0]=W/2+focal*q[:,0]/z;q[:,1]=H/2-focal*q[:,1]/z
 x0=max(0,int(np.floor(q[:,0].min())));x1=min(W-1,int(np.ceil(q[:,0].max())));y0=max(0,int(np.floor(q[:,1].min())));y1=min(H-1,int(np.ceil(q[:,1].max())))
 if x1<x0 or y1<y0:continue
 a,b,c=q;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
 if abs(den)<1e-10:continue
 xx,yy=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5);u=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den;vv=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den;w=1-u-vv;inv=u/z[0]+vv/z[1]+w/z[2];d=1/np.maximum(inv,1e-20)-(0.0001 if m.get('polygonOffset') else 0);old=depthbuf[y0:y1+1,x0:x1+1];mask=(u>=-1e-8)&(vv>=-1e-8)&(w>=-1e-8)&(d<old)
 if not np.any(mask):continue
 tint=np.array([int(m['color'][i:i+2],16) for i in (0,2,4)],float)/255
 if row['material'] in textures and row['uv']:
  uv=np.array(row['uv']);uu=(u*uv[0,0]/z[0]+vv*uv[1,0]/z[1]+w*uv[2,0]/z[2])/inv;tv=(u*uv[0,1]/z[0]+vv*uv[1,1]/z[1]+w*uv[2,1]/z[2])/inv
  uu=uu%1 if m['wrapS']==1000 else np.clip(uu,0,1);tv=tv%1 if m['wrapT']==1000 else np.clip(tv,0,1);tex=textures[row['material']];tx=np.clip((uu*(tex.shape[1]-1)).astype(int),0,tex.shape[1]-1);ty=np.clip(((1-tv)*(tex.shape[0]-1)).astype(int),0,tex.shape[0]-1);col=tex[ty,tx]*tint
 else:col=np.broadcast_to(tint*255,(*u.shape,3))
 shade=.72+.28*max(0,np.dot(normal,light));col=np.clip(col*shade,0,255).astype(np.uint8);old[mask]=d[mask];pixels[y0:y1+1,x0:x1+1][mask]=col[mask]
im=Image.fromarray(pixels);draw=ImageDraw.Draw(im);draw.rectangle((0,0,W,43),fill=(245,245,245));draw.text((18,12),'CPU production geometry + actual albedo/atlas | NOT GPU/browser acceptance',fill=(20,20,20));im.save(out);print(out)
