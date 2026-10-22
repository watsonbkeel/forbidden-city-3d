#!/usr/bin/env python3
"""CPU-only raster evidence of exported CharacterKit BufferGeometry.
No browser/GPU evidence, image synthesis or geometry substitution.
"""
import json, math, os, sys, gzip
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT='reports/r50/c1-samples'
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def font(n):
 try:return ImageFont.truetype(FONT,n)
 except:return ImageFont.load_default()
def raster(meshes,yaw=0,pitch=.10,night=False,w=480,h=650,scale=295,center=(0,.86,.05)):
 bg=np.array([.075,.09,.125] if night else [.78,.79,.775],np.float32)
 im=np.empty((h,w,3),np.float32);im[:]=bg
 yy=np.arange(h)[:,None,None]/h;im*=.90+.10*yy
 zbuf=np.full((h,w),-1e9,np.float32)
 yaw=math.radians(yaw);right=np.array([math.cos(yaw),0,-math.sin(yaw)])
 up=np.array([-math.sin(pitch)*math.sin(yaw),math.cos(pitch),-math.sin(pitch)*math.cos(yaw)])
 view=np.array([math.cos(pitch)*math.sin(yaw),math.sin(pitch),math.cos(pitch)*math.cos(yaw)])
 R=np.stack([right,up,view]);ctr=np.array(center)
 light=np.array([-.55,.82,.48]);light/=np.linalg.norm(light)
 fill=np.array([.80,.30,-.40]);fill/=np.linalg.norm(fill)
 def project(p):
  q=(p-ctr)@R.T;return np.column_stack([w/2+q[:,0]*scale,h/2-q[:,1]*scale,q[:,2]])
 def triangles(p,n,c,idx,shadow=False):
  pp=project(p)
  for ti in idx:
   v=pp[ti];minx=max(0,int(math.floor(v[:,0].min())));maxx=min(w-1,int(math.ceil(v[:,0].max())));miny=max(0,int(math.floor(v[:,1].min())));maxy=min(h-1,int(math.ceil(v[:,1].max())))
   if minx>maxx or miny>maxy:continue
   if not shadow:
    fn=np.cross(p[ti[1]]-p[ti[0]],p[ti[2]]-p[ti[0]])
    if fn@view<=0:continue
   x1,y1=v[0,:2];x2,y2=v[1,:2];x3,y3=v[2,:2]
   denom=(y2-y3)*(x1-x3)+(x3-x2)*(y1-y3)
   if abs(denom)<1e-9:continue
   Y,X=np.mgrid[miny:maxy+1,minx:maxx+1];X=X+.5;Y=Y+.5
   a=((y2-y3)*(X-x3)+(x3-x2)*(Y-y3))/denom;b=((y3-y1)*(X-x3)+(x1-x3)*(Y-y3))/denom;cc=1-a-b
   inside=(a>=-.001)&(b>=-.001)&(cc>=-.001)
   zz=a*v[0,2]+b*v[1,2]+cc*v[2,2];depth=zbuf[miny:maxy+1,minx:maxx+1]
   mask=inside&(zz>depth)
   if not np.any(mask):continue
   if shadow:
    color=np.broadcast_to(bg*.68,(maxy-miny+1,maxx-minx+1,3))
   else:
    ns=a[...,None]*n[ti[0]]+b[...,None]*n[ti[1]]+cc[...,None]*n[ti[2]];ns/=np.maximum(np.linalg.norm(ns,axis=-1)[...,None],1e-7)
    cs=a[...,None]*c[ti[0]]+b[...,None]*c[ti[1]]+cc[...,None]*c[ti[2]]
    lam=np.maximum(0,ns@light);rim=np.maximum(0,ns@fill)
    if night:
     lum=np.array([.17,.22,.31])+.72*lam[...,None]*np.array([1.,.76,.48])+.13*rim[...,None]*np.array([.40,.57,.9])
    else:lum=.44+.49*lam[...,None]+.12*rim[...,None]
    color=np.clip(cs*lum,0,1)
   sub=im[miny:maxy+1,minx:maxx+1];sub[mask]=color[mask];depth[mask]=zz[mask]
 # True projected mesh shadow on y=0; floor is a neutral comparison fixture.
 for m in meshes:
  p=np.array(m['positions']).reshape(-1,3);idx=np.array(m['indices']).reshape(-1,3);ps=p.copy();ps[:,0]-=p[:,1]*light[0]/light[1];ps[:,2]-=p[:,1]*light[2]/light[1];ps[:,1]=.001
  triangles(ps,None,None,idx,True)
 for m in meshes:
  p=np.array(m['positions']).reshape(-1,3);n=np.array(m['normals']).reshape(-1,3);c=np.array(m['colors']).reshape(-1,3);idx=np.array(m['indices']).reshape(-1,3)
  triangles(p,n,c,idx)
 # Display conversion from linear source vertex colours to sRGB.
 im=np.where(im<=.0031308,im*12.92,1.055*np.maximum(im,0)**(1/2.4)-.055)
 return Image.fromarray(np.uint8(np.clip(im,0,1)*255))
def cell(model,yaw=0,night=False,w=480,h=650):
 fixtures=model.get('fixtures',[])
 inspect_back=(yaw==180 and model['pose'].startswith('seated'))
 if inspect_back:fixtures=fixtures[:5]+fixtures[8:]
 im=raster(fixtures+[model['mesh']],yaw=yaw,night=night,w=w,h=h)
 d=ImageDraw.Draw(im);col=(230,234,241) if night else (35,41,47)
 d.text((22,18),model['pose'].upper(),font=font(21),fill=col)
 d.text((22,48),model['id'],font=font(15),fill=col)
 if inspect_back:d.text((22,74),'Fixture backrest hidden for garment inspection',font=font(12),fill=col)
 d.text((22,h-36),f"{yaw:+d} deg | {'NIGHT' if night else 'DAY'} | LOD 0",font=font(14),fill=col)
 return im

def sheet(models,views,name):
 w=480;h=650;out=Image.new('RGB',(w*len(views),h*len(models)+68),(28,34,41));d=ImageDraw.Draw(out)
 for row,m in enumerate(models):
  for col,(yaw,night)in enumerate(views):out.paste(cell(m,yaw,night),(col*w,row*h))
 d.text((22,h*len(models)+12),'ACTUAL PROCEDURAL GEOMETRY | CPU software raster | not a browser / GPU screenshot',font=font(17),fill=(230,234,240))
 d.text((22,h*len(models)+38),'CPU lighting / projected shadows are review aids; runtime character shadows are OFF. Costume simplification, visual approval pending.',font=font(14),fill=(190,201,210))
 out.save(os.path.join(ROOT,name))

models=json.load(open(os.path.join(ROOT,'models.json')))['models']
mode=sys.argv[1] if len(sys.argv)>1 else 'first'
if mode=='first':
 out=Image.new('RGB',(1440,720),(28,34,41))
 for i,m in enumerate(models):out.paste(cell(m,20 if i!=2 else -20),(480*i,0))
 d=ImageDraw.Draw(out);d.text((22,666),'C1 FIRST GEOMETRY REVIEW | 1.70 m body calibration | merged vertex-colour mesh',font=font(20),fill=(233,237,241));d.text((22,696),'CPU software raster of actual CharacterKit buffers. Not browser / GPU evidence. Chair is an isolated 0.49 m support fixture.',font=font(14),fill=(190,201,211))
 out.save(os.path.join(ROOT,'c1-first-three-poses.png'));print('Saved first three poses',flush=True)
elif mode=='world-seats':
 models=json.load(open(os.path.join(ROOT,'world-seat-models.json')))['models']
 w,h=640,760;out=Image.new('RGB',(w*3,h*len(models)+95),(28,34,41))
 for row,m in enumerate(models):
  for col,yaw in enumerate([0,90,-35]):
   im=raster(m['fixtures']+[m['mesh']],yaw=yaw,pitch=.10,w=w,h=h,scale=270,center=(0,1.06,.13))
   d=ImageDraw.Draw(im);d.text((18,18),m['pose'],font=font(21),fill=(25,30,35));d.text((18,49),m['id']+f' | {yaw:+d} deg',font=font(15),fill=(25,30,35));out.paste(im,(col*w,row*h))
 d=ImageDraw.Draw(out);d.text((20,h*len(models)+10),'ACTUAL PALACE GEOMETRY + ADAPTER-RESOLVED CHARACTER | CPU inspection, not browser/GPU evidence',font=font(19),fill=(233,238,243));d.text((20,h*len(models)+40),'Local ROI / viewport crop; crossing triangles retained. Original palace triangles with material base colors; no replacement chairs.',font=font(16),fill=(200,210,221));d.text((20,h*len(models)+66),'Textures omitted; CPU review lighting/projected shadows only. Runtime character shadows OFF. Physical support does not imply visual approval.',font=font(16),fill=(200,210,221));out.save(os.path.join(ROOT,'c1-actual-palace-seat-front-side-oblique.png'));print('Saved actual palace seats',flush=True)
elif mode=='world-compare':
 old=json.load(open(os.path.join(ROOT,'world-seat-models-rejected-raised-footstool.json')))['models'][0]
 new=json.load(open(os.path.join(ROOT,'world-seat-models.json')))['models'][0]
 w,h=640,760;out=Image.new('RGB',(w*3,h+98),(28,34,41))
 for col,(m,yaw,label) in enumerate([(old,90,'REJECTED / legs stretched to high stool'),(new,90,'CANDIDATE / bent knee, seat 0.21 m forward'),(new,-35,'CANDIDATE / actual unchanged throne')]):
  im=raster(m['fixtures']+[m['mesh']],yaw=yaw,pitch=.10,w=w,h=h,scale=270,center=(0,1.06,.13));d=ImageDraw.Draw(im);d.text((16,18),label,font=font(18),fill=(30,35,41));d.text((16,47),m['metadata']['kit']['seatVariant'],font=font(16),fill=(30,35,41));out.paste(im,(col*w,0))
 d=ImageDraw.Draw(out);d.text((20,h+12),'ACTUAL TAIHE B THRONE GEOMETRY | same adult body scale | physical support is not visual approval',font=font(19),fill=(235,240,245));d.text((20,h+42),'Seat and footstool dimensions are unchanged. New contact moves within the existing seat; feet remain fully on the actual footstool.',font=font(16),fill=(200,210,220));d.text((20,h+68),'CPU geometry inspection, not browser/GPU evidence. Local ROI/camera crop, textures omitted. CPU auxiliary shadows; runtime shadows OFF.',font=font(16),fill=(200,210,220));out.save(os.path.join(ROOT,'c1-actual-throne-rejected-vs-bent-knee.png'));print('Saved actual throne comparison',flush=True)
elif mode=='world-contact':
 models=json.load(open(os.path.join(ROOT,'world-seat-models.json')))['models']
 w,h=700,600;out=Image.new('RGB',(w*2,h*len(models)+70),(28,34,41))
 for row,m in enumerate(models):
  for col,(yaw,pitch) in enumerate([(-35,.65),(90,.45)]):
   im=raster(m['fixtures']+[m['mesh']],yaw=yaw,pitch=pitch,w=w,h=h,scale=490,center=(0,.60,.25));d=ImageDraw.Draw(im);d.text((16,16),m['pose']+' / CONTACT DETAIL',font=font(18),fill=(28,33,40));out.paste(im,(col*w,row*h))
 d=ImageDraw.Draw(out);d.text((20,h*len(models)+10),'ACTUAL FURNITURE, ALL VISIBLE PARTS RETAINED | contact detail crop | CPU geometry, not GPU',font=font(18),fill=(235,240,245));d.text((20,h*len(models)+40),'Higher inspection angle; original triangle/base-color geometry. CPU auxiliary shadows only; runtime shadows OFF. Visual approval pending.',font=font(15),fill=(200,210,220));out.save(os.path.join(ROOT,'c1-actual-palace-seat-contact-details.png'));print('Saved actual seat contacts',flush=True)
elif mode=='seats':
 models=json.load(open(os.path.join(ROOT,'seat-variants.json')))['models']
 sheet(models,[(0,False),(90,False),(-30,False)],'c1-seat-variants-geometry.png');print('Saved seat variants',flush=True)
elif mode=='sheets':
 sheet(models,[(0,False),(90,False),(180,False)],'c1-front-side-back-day.png');print('Saved day views',flush=True)
 sheet(models,[(0,True),(90,True),(180,True)],'c1-front-side-back-night.png');print('Saved night views',flush=True)
elif mode=='animation':
 data=json.load(gzip.open(os.path.join(ROOT,'animation-frames.json.gz'),'rt'));frames=[]
 for k,ms in enumerate(data['frames']):
  canvas=Image.new('RGB',(1080,560),(28,34,41))
  for i,m in enumerate(ms):
   im=raster(m.get('fixtures',[])+[m['mesh']],yaw=30,w=360,h=510,scale=230,center=(0,.86,.05));canvas.paste(im,(360*i,0))
  d=ImageDraw.Draw(canvas);d.text((12,514),f'CPU actual geometry deformation | walking / seated arm / kneeling lean | frame {k+1:02}/24',font=font(16),fill=(232,237,243));d.text((12,539),'CPU review lighting/shadows only; runtime shadows OFF. Same deformation equations; no GPU or full kneeling-transition claim.',font=font(13),fill=(190,201,211));frames.append(canvas)
  print('Rendered animation',k+1,flush=True)
 frames[0].save(os.path.join(ROOT,'c1-actual-geometry-motions.gif'),save_all=True,append_images=frames[1:],duration=333,loop=0)
 frames[0].save(os.path.join(ROOT,'c1-animation-frame-01.png'));frames[8].save(os.path.join(ROOT,'c1-animation-frame-09.png'));frames[16].save(os.path.join(ROOT,'c1-animation-frame-17.png'))
 print('Saved animation',flush=True)
